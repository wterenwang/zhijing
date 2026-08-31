/**
 * P1–P3：AI 生成学习内容包（多步 Prompt Chaining + PackHarness）
 * 课表 + 术语 + 面试 + 能力维 + 知识库章节 + 每日外链/练习
 * 依赖 AiReview 代理与 DeepSeek Key；编排依赖 js/pack-harness.js
 *
 * 方法依据（生成链设计）：
 * - Harness Engineering：Brain(LLM) / Hands(工具) / Session(trace+预算+护栏)
 * - Loop Engineering：生成 → Evaluator 门禁 → 定点修复 → Fallback
 * - Context Engineering：七槽组装、失败 findings 回灌、few-shot 锚点
 * - PGE：Planner(大纲) / Generator(正文练习) / Evaluator(质量门禁) 角色切换
 * - ReAct（局部）：资料策展与失败天修复可观察再行动；主路径仍为确定性管线
 * - UbD / ADDIE / Bloom / Retrieval practice（教学设计）
 *
 * 七板块均拆为「分析/清单 → 结构设计 → 内容展开」小流程。
 * 教学主链：课表 → 知识库（指导性日课）→ 术语库（补充解释知识库概念）。
 * 联网：HotFeed / `/api/search`；资料质量门禁见域名黑名单与软降权。
 */
const PackGenerator = (() => {
  /** 课表按周生成，注意力更集中 */
  const CHUNK = 7;
  /** 单次搜索条数（控成本） */
  const SEARCH_COUNT = 8;
  /** LLM 全局并发上限（所有并行分支共享，防打爆 DeepSeek） */
  const LLM_CONCURRENCY = 3;
  /** 搜索并发上限 */
  const SEARCH_CONCURRENCY = 4;
  /** 同一生成任务内 query 去重缓存 */
  const _searchCache = new Map();
  /** 同一任务内周候选池构建去重，持久结果写入 pack.meta.generation.retrievalPools */
  const _weeklyPoolPromises = new Map();
  const RETRIEVAL_POOL_VERSION = 'weekly-v1';
  const RETRIEVAL_POOL_TTL_MS = 7 * 24 * 60 * 60 * 1000;
  /** 当前生成任务的 AbortSignal（由 beginJob / endJob 管理） */
  let _jobSignal = null;

  function beginJob(signal) {
    _jobSignal = signal || null;
  }

  function endJob() {
    _jobSignal = null;
  }

  function mergeAiMetrics(previous = {}, incoming = {}) {
    const keys = [
      'calls',
      'failures',
      'durationMs',
      'queueMs',
      'retries',
      'promptTokens',
      'completionTokens',
      'cacheHitTokens',
      'cacheMissTokens',
    ];
    const merged = { stages: {} };
    keys.forEach((key) => {
      merged[key] = (Number(previous?.[key]) || 0) + (Number(incoming?.[key]) || 0);
    });
    const stageNames = new Set([
      ...Object.keys(previous?.stages || {}),
      ...Object.keys(incoming?.stages || {}),
    ]);
    stageNames.forEach((stage) => {
      merged.stages[stage] = mergeAiMetrics(
        { ...(previous?.stages?.[stage] || {}), stages: {} },
        { ...(incoming?.stages?.[stage] || {}), stages: {} }
      );
      delete merged.stages[stage].stages;
    });
    return merged;
  }

  function storeHarnessSnapshot(pack, snapshot) {
    if (!pack || !snapshot) return;
    pack.meta = pack.meta || {};
    const performance = pack.meta.performance || {};
    const sessions = Array.isArray(performance.sessions) ? performance.sessions.slice(-7) : [];
    sessions.push({
      traceId: snapshot.traceId,
      startedAt: snapshot.startedAt,
      endedAt: snapshot.endedAt,
      durationMs: snapshot.durationMs,
      toolCalls: snapshot.toolCalls,
      aiCalls: Number(snapshot.aiMetrics?.calls) || 0,
    });
    pack.meta.performance = {
      ...performance,
      aiMetrics: mergeAiMetrics(performance.aiMetrics, snapshot.aiMetrics),
      sessions,
      updatedAt: new Date().toISOString(),
    };
    pack.meta.harness = snapshot;
  }

  function throwIfAborted() {
    if (!_jobSignal?.aborted) return;
    const err = new Error('已停止生成');
    err.code = 'ABORTED';
    err.name = 'AbortError';
    throw err;
  }

  function isAbortError(e) {
    return !!(e && (e.name === 'AbortError' || e.code === 'ABORTED'));
  }

  function rethrowAbort(e) {
    if (isAbortError(e)) throw e;
    throwIfAborted();
  }
  const OPERATIONAL_ERROR_CODES = new Set([
    'NO_KEY',
    'NO_PROXY',
    'AUTH',
    'BALANCE',
    'BILLING',
    'NETWORK',
    'UPSTREAM_TIMEOUT',
    'SERVICE_BUSY',
    'UPSTREAM',
    'TOOL_BUDGET',
    'WALL_CLOCK',
    'WORKFLOW_BUDGET',
  ]);

  function rethrowOperationalError(error) {
    if (OPERATIONAL_ERROR_CODES.has(error?.code) || Number(error?.status) >= 400) throw error;
  }

  function safeDiagnostic(error) {
    const value = error?.message || String(error || '');
    if (typeof AiReview !== 'undefined' && AiReview.redactSensitive) {
      return AiReview.redactSensitive(value);
    }
    return String(value)
      .replace(/\b(?:sk|ds|api)[-_][A-Za-z0-9._-]{8,}\b/gi, '[REDACTED]')
      .replace(/(bearer\s+)[^\s;,]+/gi, '$1[REDACTED]');
  }
  let _llmInFlight = 0;
  const _llmWaiters = [];

  /** 全局 LLM 槽位：跨课表/术语/知识库并行时合计不超过 LLM_CONCURRENCY */
  async function withLlmSlot(fn) {
    const queuedAt = Date.now();
    if (_llmInFlight >= LLM_CONCURRENCY) {
      await new Promise((resolve) => {
        _llmWaiters.push(resolve);
      });
    }
    _llmInFlight += 1;
    const queueMs = Date.now() - queuedAt;
    try {
      return await fn(queueMs);
    } finally {
      _llmInFlight -= 1;
      const next = _llmWaiters.shift();
      if (next) next();
    }
  }

  /**
   * 有限并发执行：保留结果顺序
   * @template T, R
   * @param {T[]} items
   * @param {number} concurrency
   * @param {(item: T, index: number) => Promise<R>} fn
   * @param {(done: number, total: number) => void} [onItemDone]
   */
  async function mapPool(items, concurrency, fn, onItemDone) {
    const list = Array.isArray(items) ? items : [];
    const results = new Array(list.length);
    let next = 0;
    let done = 0;
    const limit = Math.max(1, Math.min(concurrency || 1, list.length || 1));

    async function worker() {
      while (true) {
        throwIfAborted();
        const i = next++;
        if (i >= list.length) return;
        results[i] = await fn(list[i], i);
        done += 1;
        if (onItemDone) onItemDone(done, list.length);
      }
    }

    if (!list.length) return results;
    await Promise.all(Array.from({ length: limit }, () => worker()));
    return results;
  }

  /**
   * 领域深度公约：注入各步 system，抑制空泛套话
   */
  const DEPTH_CONTRACT = `领域深度公约（必须遵守）：
1. 先写该行业/岗位真实工作对象、决策场景、典型交付物，再写抽象框架。
2. 禁止空话：不要「了解行业」「提升能力」「掌握核心知识」；用可观察行为（能对比/能判断/能产出）。
3. 每个主题至少点明：边界（做什么/不做什么）、常见误区、岗位判断题。
4. 不确定的精确数据不要编造；写清「定性判断 + 去哪核实」。
5. 全程用给定岗位口吻，禁止默认套用产品经理/PM（除非岗位本身是）。`;

  /**
   * 知识库 = 每日主教材（指导性质）；术语库 = 对知识库概念的补充解释。
   * 生成顺序必须：课表 → 知识库 → 术语库（术语不得另起炉灶）。
   */
  const HUB_TEACHING_CONTRACT = `日课公约（指导性质，必须遵守）：
1. 每一章是「今天怎么做」的操作指南：场景 → 步骤/判断规则 → 反例 → 自检；不是百科罗列。
2. 读者学完必须能独立完成当日课表 tasks 中的加工任务；每节对准可交付产出。
3. 关键概念首次出现时给 ≤25 字工作定义即可；深入辨析、易混对比留给术语库，正文以「会用」为准。
4. 至少写出 1 条可执行决策规则（若…则… / 该做 / 不该做）与 1 个完整例题步骤。
5. 禁止只复述标题、禁止元指令式类比、禁止空洞「提升认知」。`;

  const GLOSSARY_FROM_HUB_CONTRACT = `术语库定位（必须遵守）：
1. 术语库是日课的补充层：解释日课里已经出现或当日必须会用的概念。
2. 禁止发明日课正文中完全未出现、且与课表 topic 无关的新体系名词。
3. 每条词必须讲清楚：非循环工作定义、真实口语、完整例子、易混边界、专属可视化（visual.kind）。
4. term 字符串应尽量与日课正文用词一致（便于互链检索）。
5. 宁少勿滥：不合格词条宁可不写，禁止用通用模板充数。`;

  const HUB_STABLE_SYSTEM_PREFIX = `你是知径的日课教学设计与写作引擎。
${HUB_TEACHING_CONTRACT}
${DEPTH_CONTRACT}`;

  /** 按岗位生成视角文案，避免写死「PM」 */
  function roleLens(meta) {
    const role = String(meta?.role || '本岗位').trim() || '本岗位';
    return {
      role,
      sectionHeading: `## ${role}视角要点`,
      judgmentLabel: `${role}要会的判断`,
      decisionSubhead: `### ${role}工作中的判断问题`,
    };
  }

  /** 纠正模型仍输出「PM 视角」等通用模板的情况（仅当岗位不是产品经理时替换） */
  function rewriteRoleLensInText(text, meta) {
    const { role, sectionHeading, judgmentLabel, decisionSubhead } = roleLens(meta);
    const isPm = /产品经理|^PM$/i.test(String(meta?.role || '').trim());
    if (isPm) return String(text || '');
    return String(text || '')
      .replace(/##\s*PM\s*视角要点/gi, sectionHeading)
      .replace(/##\s*PM视角要点/gi, sectionHeading)
      .replace(/##\s*产品经理视角要点/g, sectionHeading)
      .replace(/###\s*产品决策中的判断问题/g, decisionSubhead)
      .replace(/PM\s*要会的判断/g, judgmentLabel)
      .replace(/产品经理要会的判断/g, judgmentLabel)
      .replace(/含 PM 判断问题/g, `含 ${role} 判断问题`)
      .replace(/PM 视角/g, `${role}视角`)
      .replace(/PM视角/g, `${role}视角`);
  }

  /** 从任意位置提取第一个完整 JSON 值（对象或数组），避免多段 JSON 粘连 */
  function extractFirstJsonValue(text) {
    const s = String(text);
    let i = 0;
    while (i < s.length) {
      const ch = s[i];
      if (ch !== '{' && ch !== '[') {
        i++;
        continue;
      }
      const open = ch;
      const close = ch === '{' ? '}' : ']';
      let depth = 0;
      let inString = false;
      let escape = false;
      for (let j = i; j < s.length; j++) {
        const c = s[j];
        if (inString) {
          if (escape) escape = false;
          else if (c === '\\') escape = true;
          else if (c === '"') inString = false;
          continue;
        }
        if (c === '"') {
          inString = true;
          continue;
        }
        if (c === open) depth++;
        else if (c === close) {
          depth--;
          if (depth === 0) return s.slice(i, j + 1);
        }
      }
      // 未闭合则换下一个起点
      i++;
    }
    return null;
  }

  function parseJsonLoose(text) {
    if (!text) throw new Error('AI 返回为空');
    let s = String(text).trim();

    // 优先取第一个 ```json 代码块
    const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence) s = fence[1].trim();

    // 直接 parse
    try {
      return JSON.parse(s);
    } catch {
      /* continue */
    }

    // 取第一个完整 JSON 值（修复 `{...}{...}` / JSON 后跟说明文字）
    const chunk = extractFirstJsonValue(s);
    if (chunk) {
      try {
        return JSON.parse(chunk);
      } catch (e) {
        // 尝试修复常见尾逗号
        const fixed = chunk.replace(/,\s*([}\]])/g, '$1');
        try {
          return JSON.parse(fixed);
        } catch {
          throw new Error(`无法解析 AI 返回的 JSON：${e.message || '格式错误'}`);
        }
      }
    }
    throw new Error('AI 未返回可识别的 JSON，请重试');
  }

  async function chat({
    system,
    user,
    temperature = 0.3,
    max_tokens = 4096,
    stage = 'other',
    jsonMode = false,
  }) {
    if (typeof AiReview === 'undefined' || !AiReview.chat) {
      throw new Error('智能功能未就绪，请先开启并填写 DeepSeek 密钥');
    }
    throwIfAborted();
    if (typeof PackHarness !== 'undefined') {
      const guard = PackHarness.guardTool('deepseek.chat', { max_tokens });
      if (!guard.ok) {
        const error = new Error(guard.message || '本次生成时间或次数已用完，请稍后重试');
        error.code = guard.code || 'WORKFLOW_BUDGET';
        throw error;
      }
    }
    return withLlmSlot((queueMs) => {
      throwIfAborted();
      return AiReview.chat({
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature,
        max_tokens,
        signal: _jobSignal || undefined,
        responseFormat: jsonMode ? { type: 'json_object' } : undefined,
        onMetrics: (metrics) => {
          if (typeof PackHarness !== 'undefined') {
            PackHarness.recordAiCall?.({ ...metrics, queueMs, stage });
          }
        },
      });
    });
  }

  function metaBrief(meta) {
    return `行业：${meta.industry}
岗位：${meta.role}
目标：${meta.goal || '入门'}
总天数：${meta.days}
备注：${meta.notes || '无'}
标题意向：${meta.title || '（由模型拟定）'}`;
  }

  async function chatJson({
    system,
    user,
    temperature = 0.28,
    max_tokens = 4096,
    stage = 'other',
    jsonMode = false,
  }) {
    const text = await chat({ system, user, temperature, max_tokens, stage, jsonMode });
    return parseJsonLoose(text);
  }

  // ─── 联网搜索（DeepSeek Anthropic Web Search） ───

  /** 域名加权：同一搜索 API 内优先高质量学习源 */
  const RESOURCE_HOST_BOOST = [
    { host: 'wikipedia.org', score: 40 },
    { host: 'zh.wikipedia.org', score: 40 },
    { host: 'bilibili.com', score: 28 },
    { host: 'github.com', score: 26 },
    { host: 'investopedia.com', score: 30 },
    { host: 'khanacademy.org', score: 28 },
    { host: 'coursera.org', score: 22 },
    { host: 'edx.org', score: 22 },
    { host: 'notion.site', score: 12 },
    { host: 'notion.so', score: 12 },
    { host: 'ssrn.com', score: 20 },
    { host: 'arxiv.org', score: 24 },
    { host: 'gov.cn', score: 18 },
    { host: 'oecd.org', score: 18 },
    { host: 'imf.org', score: 18 },
    { host: 'sec.gov', score: 22 },
    { host: 'microsoft.com', score: 14 },
    { host: 'google.com/search', score: 8 },
  ];

  const NEWSY_TITLE_RE =
    /跳第|排名|营收首超|今日热点|刚刚发布|突发|股价|涨停|跌停|汽车报价|试驾|导购|热搜|吃瓜/;
  const LEARNING_HINT_RE =
    /教程|讲解|方法|入门|指南|how\s*to|guide|textbook|文档|手册|模板|模型|定义|原理|课程|笔记|pdf|白皮书|实践|实操|步骤|搭建|公式|框架/i;

  function hasSearchKey() {
    if (typeof HotFeed !== 'undefined' && typeof HotFeed.hasSearchKey === 'function') {
      return HotFeed.hasSearchKey();
    }
    return !!(typeof AiReview !== 'undefined' && AiReview.getApiKey?.());
  }

  function slimSearchHit(r) {
    return {
      title: String(r?.title || '').slice(0, 160),
      url: String(r?.url || '').trim(),
      snippet: String(r?.snippet || r?.content || r?.summary || '').slice(0, 280),
    };
  }

  function hostnameOf(url) {
    try {
      return new URL(String(url)).hostname.replace(/^www\./i, '').toLowerCase();
    } catch {
      return '';
    }
  }

  function isBlockedResourceUrl(url) {
    const host = hostnameOf(url);
    if (!host) return true;
    const full = String(url || '').toLowerCase();
    const blockedHosts = [
      'yoojia.com',
      'youjia.com',
      'autohome.com.cn',
      'pcauto.com.cn',
      'dongchedi.com',
      'ixigua.com',
      'toutiao.com',
      '36kr.com',
      'huxiu.com',
      'jiemian.com',
      'thepaper.cn',
      'cls.cn',
      'xueqiu.com',
      'eastmoney.com',
      'yiche.com',
      'cheshi.com',
      'ifeng.com',
      'sohu.com',
    ];
    if (blockedHosts.some((b) => host === b || host.endsWith(`.${b}`))) return true;
    // 门户资讯频道
    if (
      /(^|\.)(sina|163|qq)\.com$/i.test(host) &&
      /\/(news|finance|auto|stock|mil|ent)\b/i.test(full)
    ) {
      return true;
    }
    // 搜索结果页 / 「请自行百度」类不可学链接
    if (
      /baidu\.com\/s\b/i.test(full) ||
      /www\.baidu\.com\/baidu/i.test(full) ||
      /so\.com\/s\b/i.test(full) ||
      /sogou\.com\/web/i.test(full) ||
      /bing\.com\/search/i.test(full) ||
      /google\.[^/]+\/search/i.test(full) ||
      /github\.com\/(?:search|topics?|marketplace)(?:\/|$|\?)/i.test(full) ||
      /bilibili\.com\/(?:v\/popular|ranking|read\/ranking)(?:\/|$|\?)/i.test(full) ||
      /space\.bilibili\.com\/?$/i.test(full)
    ) {
      return true;
    }
    return false;
  }

  function domainBoostScore(url) {
    const host = hostnameOf(url);
    const full = String(url || '').toLowerCase();
    let score = 0;
    for (const row of RESOURCE_HOST_BOOST) {
      if (host === row.host || host.endsWith(`.${row.host}`) || full.includes(row.host)) {
        score = Math.max(score, row.score);
      }
    }
    if (/\.(edu|ac)\.[a-z]{2,}$/i.test(host) || host.endsWith('.edu')) score = Math.max(score, 24);
    if (host.endsWith('.gov.cn') || host.endsWith('.gov')) score = Math.max(score, 20);
    return score;
  }

  function evidenceTrustTier(url) {
    const score = domainBoostScore(url);
    if (score >= 20) return 'high';
    if (score >= 8) return 'medium';
    return 'contextual';
  }

  function normalizeSourceTier(value, fallback = 'contextual') {
    const tier = String(value || '').trim().toLowerCase();
    if (tier === 'primary' || tier === 'high') return 'high';
    if (tier === 'secondary' || tier === 'medium') return 'medium';
    if (tier === 'contextual') return 'contextual';
    return fallback;
  }

  function sourcePlatform(url) {
    const host = hostnameOf(url);
    if (host.endsWith('wikipedia.org')) return 'wikipedia';
    if (host === 'github.com' || host.endsWith('.github.com')) return 'github';
    if (host === 'bilibili.com' || host.endsWith('.bilibili.com')) return 'bilibili';
    if (host.endsWith('.gov') || host.endsWith('.gov.cn') || host.endsWith('.edu')) return 'official';
    if (/^(docs?|developer|learn|support)\./i.test(host)) return 'official';
    return 'web';
  }

  function sourceRoleForHit(hit) {
    const platform = sourcePlatform(hit?.url);
    if (platform === 'wikipedia') return 'reference';
    if (platform === 'github') return 'example';
    if (platform === 'bilibili') return 'tutorial';
    if (platform === 'official') return 'primary';
    return LEARNING_HINT_RE.test(`${hit?.title || ''} ${hit?.snippet || ''}`)
      ? 'tutorial'
      : 'context';
  }

  /** 将展示资源绑定到不可变 URL，并给后续正文/质检提供稳定证据编号。 */
  function bindResourceEvidence(resources) {
    return (resources || []).map((resource, index) => {
      const evidenceId = `S${index + 1}`;
      const originalTitle = String(resource.originalTitle || resource.title || '').trim();
      const displayTitle = String(resource.displayTitle || originalTitle).trim();
      const inferredTier = normalizeSourceTier(
        resource.sourceTier || resource.trustTier,
        evidenceTrustTier(resource.url)
      );
      return {
        ...resource,
        title: originalTitle,
        originalTitle,
        displayTitle,
        sourceId: evidenceId,
        evidenceId,
        publisher: resource.publisher || hostnameOf(resource.url),
        platform: resource.platform || sourcePlatform(resource.url),
        sourceRole: resource.sourceRole || sourceRoleForHit(resource),
        sourceTier: inferredTier,
        trustTier: inferredTier,
        retrievedAt: resource.retrievedAt || new Date().toISOString(),
        evidence: {
          id: evidenceId,
          url: resource.url,
          title: originalTitle,
          originalTitle,
          displayTitle,
          trustTier: inferredTier,
          boundAt: new Date().toISOString(),
        },
      };
    });
  }

  function tokenizeIntent(text) {
    const raw = String(text || '')
      .toLowerCase()
      .replace(/[^\u4e00-\u9fff a-z0-9]+/gi, ' ');
    const parts = raw.split(/\s+/).filter(Boolean);
    const out = [];
    for (const p of parts) {
      if (/^[a-z]{2,}$/i.test(p) || /^\d{2,}$/.test(p)) out.push(p);
      else if (p.length >= 2) {
        out.push(p);
        // 中文 2-gram
        if (/[\u4e00-\u9fff]/.test(p)) {
          for (let i = 0; i < p.length - 1; i++) out.push(p.slice(i, i + 2));
        }
      }
    }
    return [...new Set(out)].filter((t) => t.length >= 2).slice(0, 24);
  }

  function hitLooksLikeNews(hit) {
    const blob = `${hit?.title || ''} ${hit?.snippet || ''}`;
    if (NEWSY_TITLE_RE.test(blob)) return true;
    if (LEARNING_HINT_RE.test(blob)) return false;
    // 无学习信号且像资讯标题
    return /第\d+|同比|环比|百分点|上市|融资/.test(blob) && !/模型|教程|方法|公式|框架/.test(blob);
  }

  /**
   * 搜索原标题/摘要是否覆盖学习意图（防止「教程标题 + 资讯 URL」）
   */
  function hitMatchesLearningIntent(hit, learnWhat, topic) {
    const blob = `${hit?.title || ''} ${hit?.snippet || ''}`.toLowerCase();
    if (!blob.trim()) return false;
    const intentText = `${learnWhat || ''} ${topic || ''}`;
    const methodTokens = tokenizeIntent(intentText).filter((t) => {
      // 去掉过泛的单字公司碎片；保留方法/概念词与英文缩写
      if (/^(公司|企业|行业|今天|学习|内容)$/.test(t)) return false;
      return true;
    });
    const teachingIntent = LEARNING_HINT_RE.test(intentText) || /模型|框架|公式|三表|估值|现金流|dcf|wacc|excel/i.test(intentText);

    if (hitLooksLikeNews(hit)) {
      // 资讯站风格：必须本身像教程，或命中明确方法词（不能只靠公司名）
      if (!LEARNING_HINT_RE.test(blob)) {
        const methodHit = methodTokens.filter((t) =>
          /模型|框架|公式|三表|估值|教程|方法|现金流|dcf|wacc|联动|建模|excel|模板/i.test(t)
        );
        if (!methodHit.some((t) => blob.includes(String(t).toLowerCase()))) return false;
      }
    }

    if (!methodTokens.length) return LEARNING_HINT_RE.test(blob);
    let hits = 0;
    for (const t of methodTokens) {
      if (blob.includes(String(t).toLowerCase())) hits += 1;
    }
    const need = methodTokens.length <= 3 ? 1 : Math.min(3, Math.ceil(methodTokens.length * 0.25));
    if (hits < need) return false;
    // 有教学意图时，正文也要有一点「可学」信号，避免纯热点新闻
    if (teachingIntent && !LEARNING_HINT_RE.test(blob) && !/模型|框架|公式|定义|步骤|方法|教程|模板/i.test(blob)) {
      return false;
    }
    return true;
  }

  function scoreSearchHit(hit, learnWhat, topic) {
    if (!hit?.url || isBlockedResourceUrl(hit.url)) return -999;
    let score = domainBoostScore(hit.url);
    const blob = `${hit.title || ''} ${hit.snippet || ''}`;
    if (LEARNING_HINT_RE.test(blob)) score += 18;
    if (hitLooksLikeNews(hit)) score -= 35;
    if (hitMatchesLearningIntent(hit, learnWhat, topic)) score += 22;
    else score -= 20;
    // 软降权：小红书/CSDN 等可学性不稳
    const host = hostnameOf(hit.url);
    if (
      /xiaohongshu\.com|xhslink\.com|blog\.csdn\.net|csdn\.net|jianshu\.com$/i.test(host) ||
      host.endsWith('.csdn.net')
    ) {
      score -= 12;
    }
    const platform = sourcePlatform(hit.url);
    const full = String(hit.url || '');
    if (platform === 'github') {
      if (/github\.com\/[^/?#]+\/[^/?#]+(?:\/|$)/i.test(full)) score += 10;
      else score -= 35;
    }
    if (platform === 'bilibili') {
      if (/bilibili\.com\/video\/[A-Za-z0-9]+/i.test(full)) score += 10;
      else score -= 35;
    }
    return score;
  }

  /** 过滤资讯站 + 按学习相关度排序（不新增 API） */
  function rankAndFilterSearchHits(hits, { learnWhat = '', topic = '' } = {}) {
    return (hits || [])
      .map((h) => {
        const _score = scoreSearchHit(h, learnWhat, topic);
        return {
          ...h,
          _score,
          platform: h.platform || sourcePlatform(h.url),
          sourceRole: h.sourceRole || sourceRoleForHit(h),
          sourceTier: normalizeSourceTier(h.sourceTier, evidenceTrustTier(h.url)),
        };
      })
      .filter((h) => h._score >= 10)
      .sort((a, b) => b._score - a._score)
      .map(({ _score, ...rest }) => ({ ...rest, qualityScore: _score }));
  }

  /**
   * 将一天的学习意图压缩成有限、互补的检索通道；固定最多四路，避免平台通道被截断。
   */
  function buildLearningQueryLanes(rawQuery, { prefer = '', learnWhat = '', topic = '', type = '' } = {}) {
    const base = String(rawQuery || learnWhat || topic || '').trim();
    if (!base) return [];
    const pref = String(prefer || '').toLowerCase();
    const intent = `${base} ${learnWhat || ''} ${topic || ''} ${type || ''} ${pref}`.toLowerCase();
    const practical = /代码|编程|开发|工具|模板|项目|实操|案例|仓库|开源|api|sdk|github|tool/.test(intent);
    const out = [];
    const push = (lane, platform, q) => {
      const s = String(q || '').trim();
      if (s && !out.some((row) => row.query === s)) out.push({ lane, platform, query: s });
    };
    push('teaching', 'web', `${base} 教程 方法 讲解`);
    push('official', 'official', `${base} 官方 文档 指南`);
    if (practical) push('example', 'github', `${base} 教程 示例 site:github.com`);
    else push('reference', 'wikipedia', `${base} 定义 site:zh.wikipedia.org`);
    push('lecture', 'bilibili', `${base} 系统讲解 教程 site:bilibili.com/video`);
    return out.slice(0, 4);
  }

  function expandLearningQueries(rawQuery, options = {}) {
    return buildLearningQueryLanes(rawQuery, options).map((row) => row.query);
  }

  /**
   * @returns {Promise<Array<{title,url,snippet}>>}
   */
  async function searchWeb(query, { count = SEARCH_COUNT, minResults = 1 } = {}) {
    const q = String(query || '').trim();
    if (!q) return [];
    if (typeof PackHarness !== 'undefined') {
      const g = PackHarness.guardTool('api.search', { query: q });
      if (!g.ok) {
        console.warn('[PackGenerator] search blocked by harness', g.code, g.message);
        return [];
      }
    }
    const cacheKey = `${q}::${count}`;
    if (_searchCache.has(cacheKey)) return _searchCache.get(cacheKey);

    const auth =
      typeof HotFeed !== 'undefined' && HotFeed.resolveSearchAuth
        ? HotFeed.resolveSearchAuth()
        : {
            provider: 'deepseek',
            apiKey:
              typeof AiReview !== 'undefined' && AiReview.getApiKey
                ? AiReview.getApiKey()
                : '',
          };
    const { provider, apiKey } = auth;
    if (!apiKey) return [];

    throwIfAborted();
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey, query: q, count }),
        signal: _jobSignal || undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const error = typeof AiReview !== 'undefined' && AiReview.normalizeUpstreamError
          ? AiReview.normalizeUpstreamError(res.status, data?.error?.message || data?.error || '')
          : Object.assign(new Error('搜索服务暂时不可用'), { code: 'UPSTREAM', status: res.status });
        rethrowOperationalError(error);
        return [];
      }
      const results = (Array.isArray(data.results) ? data.results : [])
        .map(slimSearchHit)
        .filter((r) => r.url && /^https?:\/\//i.test(r.url) && !isBlockedResourceUrl(r.url));
      const out = results.length >= minResults ? results : results;
      if (out.length) _searchCache.set(cacheKey, out);
      return out;
    } catch (e) {
      rethrowAbort(e);
      rethrowOperationalError(e);
      console.warn('[PackGenerator] search error', safeDiagnostic(e));
      return [];
    }
  }

  /** 多 query 并行搜索，合并去重；maxQueries 控成本 */
  async function searchMany(queries, { count = SEARCH_COUNT, maxQueries = 6 } = {}) {
    const uniq = [];
    const seenQ = new Set();
    for (const raw of queries || []) {
      const descriptor =
        raw && typeof raw === 'object'
          ? { ...raw, query: String(raw.query || '').trim() }
          : { query: String(raw || '').trim(), lane: 'general', platform: 'web' };
      const q = descriptor.query;
      if (!q || seenQ.has(q)) continue;
      seenQ.add(q);
      uniq.push(descriptor);
      if (uniq.length >= maxQueries) break;
    }
    const perQuery = await mapPool(uniq, SEARCH_CONCURRENCY, (row) =>
      searchWeb(row.query, { count })
    );
    const merged = [];
    const byUrl = new Map();
    perQuery.forEach((hits, i) => {
      const descriptor = uniq[i];
      (hits || []).forEach((h) => {
        const previous = byUrl.get(h.url);
        if (previous) {
          previous.retrievalLanes = [
            ...new Set([...(previous.retrievalLanes || []), descriptor.lane]),
          ];
          return;
        }
        const row = {
          ...h,
          query: descriptor.query,
          lane: descriptor.lane,
          platform: descriptor.platform || sourcePlatform(h.url),
          retrievalLanes: [descriptor.lane],
        };
        byUrl.set(h.url, row);
        merged.push(row);
      });
    });
    return merged;
  }

  function formatSearchBlock(results, limit = 24) {
    const rows = (results || []).slice(0, limit);
    if (!rows.length) return '（无搜索结果；请仅用定性表述，禁止编造精确 URL/数据）';
    return JSON.stringify(rows, null, 0);
  }

  function selectSourcePortfolio(candidates, { learnWhat = '', topic = '', limit = 3 } = {}) {
    const scored = (candidates || [])
      .filter((row) => row?.url && !isBlockedResourceUrl(row.url))
      .map((row) => ({
        ...row,
        _score: Number.isFinite(Number(row.qualityScore))
          ? Number(row.qualityScore)
          : scoreSearchHit(row, learnWhat, topic),
        platform: row.platform || sourcePlatform(row.url),
        sourceRole: row.sourceRole || sourceRoleForHit(row),
        sourceTier: normalizeSourceTier(row.sourceTier, evidenceTrustTier(row.url)),
      }))
      .filter((row) => row._score >= 10)
      .sort((a, b) => b._score - a._score);
    const selected = [];
    const usedHosts = new Set();
    const usedRoles = new Set();
    const take = (row) => {
      if (!row || selected.some((item) => item.url === row.url)) return;
      selected.push(row);
      usedHosts.add(hostnameOf(row.url));
      usedRoles.add(row.sourceRole);
    };
    take(scored.find((row) => row.sourceTier === 'high' || row.sourceRole === 'primary'));
    for (const row of scored) {
      if (selected.length >= limit) break;
      const host = hostnameOf(row.url);
      if (usedHosts.has(host) && scored.some((item) => !usedHosts.has(hostnameOf(item.url)))) continue;
      if (usedRoles.has(row.sourceRole) && scored.some((item) => !usedRoles.has(item.sourceRole))) continue;
      take(row);
    }
    for (const row of scored) {
      if (selected.length >= limit) break;
      take(row);
    }
    return selected.map(({ _score, qualityScore, ...row }) => ({
      ...row,
      qualityScore: _score,
    }));
  }

  /**
   * 只保留：URL∈搜索结果、非黑名单；展示标题强制用搜索原标题。
   * 不足时用排序后的具体结果补齐（仍是可点开的页面，不是搜索页）。
   */
  function filterResourcesToSearch(resources, searchResults, typeHint = 'article', ctx = {}) {
    const allowed = new Set(['article', 'video', 'report', 'tool']);
    const learnWhat = ctx.learnWhat || '';
    const topic = ctx.topic || '';
    const ranked = rankAndFilterSearchHits(searchResults, { learnWhat, topic });
    const byUrl = new Map((searchResults || []).map((r) => [r.url, r]));

    let picked = (resources || [])
      .map((r) => {
        const url = String(r.url || '').trim();
        const hit = byUrl.get(url);
        if (!hit || isBlockedResourceUrl(url)) return null;
        // 资讯黑名单已在 isBlocked；其余用原标题，允许中等匹配度通过
        if (scoreSearchHit(hit, learnWhat, topic) < -40) return null;
        return {
          title: String(hit.title || r.title || '').trim().slice(0, 80),
          url,
          snippet: hit.snippet || '',
          platform: hit.platform || sourcePlatform(url),
          sourceRole: hit.sourceRole || sourceRoleForHit(hit),
          sourceTier: normalizeSourceTier(hit.sourceTier, evidenceTrustTier(url)),
          qualityScore: Number(hit.qualityScore) || scoreSearchHit(hit, learnWhat, topic),
          type: allowed.has(String(r.type))
            ? String(r.type)
            : /bilibili\.com/i.test(url)
              ? 'video'
              : typeHint,
        };
      })
      .filter((r) => r && r.title && r.url);

    if (picked.length < 3) {
      const extra = pickConcreteFromHits(ranked.length ? ranked : searchResults, {
        learnWhat,
        topic,
        need: 3 - picked.length,
        excludeUrls: picked.map((p) => p.url),
      });
      picked = picked.concat(extra);
    }

    return bindResourceEvidence(
      selectSourcePortfolio(picked, { learnWhat, topic, limit: 3 })
    );
  }

  /** 从已排序/原始 hits 里挑可直接打开的具体页 */
  function pickConcreteFromHits(hits, { learnWhat = '', topic = '', need = 3, excludeUrls = [] } = {}) {
    const banned = new Set(excludeUrls || []);
    const scored = (hits || [])
      .filter((h) => h?.url && !banned.has(h.url) && !isBlockedResourceUrl(h.url))
      .map((h) => ({
        ...h,
        _score: typeof h._score === 'number' ? h._score : scoreSearchHit(h, learnWhat, topic),
      }))
      .filter((h) => h._score >= 10)
      .sort((a, b) => b._score - a._score);

    return bindResourceEvidence(selectSourcePortfolio(scored, {
      learnWhat,
      topic,
      limit: need,
    }).map((r) => ({
      title: String(r.title || topic || '参考资料').trim().slice(0, 80),
      url: r.url,
      snippet: r.snippet || '',
      platform: r.platform,
      sourceRole: r.sourceRole,
      sourceTier: r.sourceTier,
      qualityScore: r.qualityScore,
      type: /bilibili\.com/i.test(r.url) ? 'video' : 'article',
    })));
  }

  /**
   * 维基百科公开 opensearch（无需用户配置 Key）→ 直接词条 URL
   */
  async function fetchWikipediaResources(topic, limit = 2, signal = _jobSignal) {
    const q = String(topic || '').trim();
    if (!q) return [];
    try {
      const url =
        'https://zh.wikipedia.org/w/api.php?action=opensearch&search=' +
        encodeURIComponent(q) +
        `&limit=${limit}&namespace=0&origin=*`;
      if (signal?.aborted) throw Object.assign(new Error('已停止生成'), { name: 'AbortError', code: 'ABORTED' });
      const res = await fetch(url, { signal: signal || undefined });
      if (!res.ok) return [];
      const data = await res.json();
      const titles = Array.isArray(data?.[1]) ? data[1] : [];
      const links = Array.isArray(data?.[3]) ? data[3] : [];
      const out = [];
      for (let i = 0; i < titles.length; i++) {
        if (!links[i]) continue;
        out.push({
          title: `维基百科：${titles[i]}`,
          url: links[i],
          type: 'article',
        });
      }
      return bindResourceEvidence(out);
    } catch (e) {
      rethrowAbort(e);
      console.warn('[PackGenerator] wikipedia opensearch failed', e);
      return [];
    }
  }

  function retrievalFingerprint(value) {
    let hash = 2166136261;
    const input = String(value || '');
    for (let index = 0; index < input.length; index++) {
      hash ^= input.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function weekNumberForDay(day) {
    return Math.max(1, Math.ceil((Number(day) || 1) / 7));
  }

  function buildWeeklyQueryLanes(meta, weekPlan) {
    const rows = Array.isArray(weekPlan) ? weekPlan : [];
    const weekLabel = String(rows[0]?.week || `第${weekNumberForDay(rows[0]?.day)}周`)
      .replace(/^第\d+周[：:\s]*/, '')
      .trim();
    const topics = [...new Set(rows.map((row) => String(row?.topic || '').trim()).filter(Boolean))]
      .slice(0, 5)
      .join(' ');
    const base = `${meta?.industry || ''} ${meta?.role || ''} ${weekLabel} ${topics}`
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 180);
    return [
      {
        lane: 'weekly-authority',
        platform: 'web',
        query: `${base} 官方 文档 教程 方法`,
      },
      {
        lane: 'weekly-lecture',
        platform: 'bilibili',
        query: `${base} 系统讲解 教程 site:bilibili.com/video`,
      },
    ];
  }

  function weekNeedsGithub(weekPlan) {
    const blob = (weekPlan || [])
      .flatMap((row) => [row?.topic, ...(row?.tasks || [])])
      .join(' ');
    return /代码|编程|开发|工具|模板|项目|实操|仓库|开源|API|SDK|GitHub/i.test(blob);
  }

  function poolFingerprint(meta, weekPlan) {
    return retrievalFingerprint(
      JSON.stringify({
        version: RETRIEVAL_POOL_VERSION,
        industry: meta?.industry || '',
        role: meta?.role || '',
        week: (weekPlan || []).map((row) => ({
          day: Number(row?.day),
          week: row?.week || '',
          topic: row?.topic || '',
        })),
      })
    );
  }

  function retrievalStatsForPack(pack) {
    pack.meta = pack.meta || {};
    pack.meta.generation = pack.meta.generation || {};
    pack.meta.generation.retrievalStats = {
      deepseekSearchCalls: 0,
      weeklyPoolBuilds: 0,
      weeklyPoolHits: 0,
      targetedSearchCalls: 0,
      metadataCalls: 0,
      durationMs: 0,
      ...(pack.meta.generation.retrievalStats || {}),
    };
    return pack.meta.generation.retrievalStats;
  }

  async function resolveResourceMetadata(urls, { githubQuery = '', githubLimit = 4 } = {}) {
    const uniqueUrls = [...new Set((urls || []).map(String).map((url) => url.trim()).filter(Boolean))]
      .slice(0, 10);
    if (!uniqueUrls.length && !githubQuery) return { results: [], githubResults: [] };
    if (typeof PackHarness !== 'undefined') {
      const guard = PackHarness.guardTool('api.meta.resolve', {
        urls: uniqueUrls.length,
        github: !!githubQuery,
      });
      if (!guard.ok) return { results: [], githubResults: [] };
    }
    try {
      const response = await fetch('/api/meta/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urls: uniqueUrls,
          githubQuery: String(githubQuery || '').slice(0, 180),
          githubLimit: Math.min(5, Math.max(1, Number(githubLimit) || 4)),
        }),
        signal: _jobSignal || undefined,
      });
      if (!response.ok) return { results: [], githubResults: [] };
      const data = await response.json();
      return {
        results: Array.isArray(data?.results) ? data.results : [],
        githubResults: Array.isArray(data?.githubResults) ? data.githubResults : [],
      };
    } catch (error) {
      rethrowAbort(error);
      console.warn('[PackGenerator] resource metadata degraded', error);
      return { results: [], githubResults: [] };
    }
  }

  function mergeResolvedMetadata(hits, metadataRows) {
    const byUrl = new Map((metadataRows || []).map((row) => [String(row?.url || ''), row]));
    return (hits || []).map((hit) => {
      const meta = byUrl.get(String(hit?.url || '')) || {};
      const originalTitle = String(hit?.originalTitle || hit?.title || '').trim();
      return {
        ...hit,
        originalTitle,
        displayTitle: String(meta.displayTitle || hit?.displayTitle || originalTitle).trim().slice(0, 120),
        description: String(meta.description || hit?.description || '').trim().slice(0, 500),
        contentExcerpt: String(meta.contentExcerpt || hit?.contentExcerpt || '').trim().slice(0, 1200),
        publisher: String(meta.publisher || hit?.publisher || '').trim(),
        canonicalUrl: String(meta.canonicalUrl || hit?.canonicalUrl || hit?.url || '').trim(),
        metadataProvider: String(meta.provider || hit?.metadataProvider || '').trim(),
      };
    });
  }

  function needsGithubTitleRefresh(resource) {
    return (
      sourcePlatform(resource?.url) === 'github' &&
      !String(resource?.displayTitle || '').trim().endsWith('（GitHub）')
    );
  }

  async function refreshCachedGithubTitles(pack) {
    const dayRows = Object.values(pack?.dayResources || {}).flatMap(
      (row) => row?.resources || []
    );
    const poolRows = Object.values(pack?.meta?.generation?.retrievalPools || {}).flatMap(
      (pool) => pool?.hits || []
    );
    const staleRows = [...dayRows, ...poolRows].filter(needsGithubTitleRefresh);
    const urls = [
      ...new Set(staleRows.map((row) => String(row?.url || '').trim()).filter(Boolean)),
    ];
    if (!urls.length) return 0;

    const metadataRows = [];
    const stats = retrievalStatsForPack(pack);
    for (let index = 0; index < urls.length; index += 10) {
      const metadata = await resolveResourceMetadata(urls.slice(index, index + 10));
      stats.metadataCalls += 1;
      metadataRows.push(...metadata.results);
    }
    const byUrl = new Map(
      metadataRows
        .filter((row) => String(row?.displayTitle || '').trim())
        .map((row) => [String(row.url || ''), row])
    );
    let refreshed = 0;
    for (const row of staleRows) {
      const metadata = byUrl.get(String(row?.url || ''));
      if (!metadata) continue;
      const displayTitle = String(metadata.displayTitle || '').trim().slice(0, 120);
      if (!displayTitle || displayTitle === row.displayTitle) continue;
      row.displayTitle = displayTitle;
      row.description = String(metadata.description || row.description || '').trim().slice(0, 500);
      row.contentExcerpt = String(metadata.contentExcerpt || row.contentExcerpt || '')
        .trim()
        .slice(0, 1200);
      row.publisher = String(metadata.publisher || row.publisher || '').trim();
      row.canonicalUrl = String(metadata.canonicalUrl || row.canonicalUrl || row.url || '').trim();
      row.metadataProvider = String(metadata.provider || row.metadataProvider || '').trim();
      if (row.evidence) row.evidence.displayTitle = displayTitle;
      refreshed += 1;
    }
    return refreshed;
  }

  async function refreshGithubTitlesForPack(packId) {
    const pack = ContentPack.load(packId);
    if (!pack) return 0;
    const refreshed = await refreshCachedGithubTitles(pack);
    if (refreshed > 0) {
      pack.updatedAt = new Date().toISOString();
      ContentPack.save(pack);
    }
    return refreshed;
  }

  async function assignWeeklyPool(meta, weekPlan, hits) {
    if (!hits.length) return {};
    const candidates = hits.slice(0, 18).map((hit, index) => ({
      id: `C${index + 1}`,
      title: hit.displayTitle || hit.title,
      description: hit.description || hit.snippet || '',
      platform: hit.platform || sourcePlatform(hit.url),
      sourceTier: hit.sourceTier || evidenceTrustTier(hit.url),
    }));
    const system = `你是课程资料分配器。只输出 JSON 对象；只能选择给定候选 id，禁止输出 URL 或新标题。`;
    const user = `## 学习者\n${metaBrief(meta)}\n\n## 本周日课\n${JSON.stringify(
      (weekPlan || []).map((row) => ({ day: row.day, topic: row.topic, tasks: row.tasks }))
    ).slice(0, 4000)}\n\n## 候选\n${JSON.stringify(candidates).slice(0, 8000)}\n\n## Task\n{"days":[{"day":1,"candidateIds":["C1","C2"]}]}\n每日至多3条，可跨相邻日复用高质量基础资料；不相关则留空。`;
    try {
      const raw = await chatJson({
        system,
        user,
        temperature: 0.1,
        max_tokens: 2400,
        stage: 'materials.assignment',
        jsonMode: true,
      });
      const rows = Array.isArray(raw?.days) ? raw.days : [];
      const allowed = new Set(candidates.map((row) => row.id));
      return Object.fromEntries(
        rows.map((row) => [
          String(Number(row?.day)),
          [...new Set((row?.candidateIds || []).map(String).filter((id) => allowed.has(id)))].slice(0, 3),
        ])
      );
    } catch (error) {
      rethrowAbort(error);
      console.warn('[PackGenerator] weekly assignment degraded to local ranking', error);
      return {};
    }
  }

  async function ensureWeeklyResourcePool(pack, meta, weekPlan) {
    const stats = retrievalStatsForPack(pack);
    const week = weekNumberForDay(weekPlan?.[0]?.day);
    pack.meta = pack.meta || {};
    pack.meta.generation = pack.meta.generation || {};
    pack.meta.generation.retrievalPools = {
      ...(pack.meta.generation.retrievalPools || {}),
    };
    const pools = pack.meta.generation.retrievalPools;
    const fingerprint = poolFingerprint(meta, weekPlan);
    const existing = pools[String(week)];
    const age = Date.now() - Date.parse(existing?.fetchedAt || 0);
    if (
      existing?.version === RETRIEVAL_POOL_VERSION &&
      existing?.fingerprint === fingerprint &&
      Array.isArray(existing.hits) &&
      existing.hits.length &&
      Number.isFinite(age) &&
      age >= 0 &&
      age < RETRIEVAL_POOL_TTL_MS
    ) {
      existing.cacheHits = (Number(existing.cacheHits) || 0) + 1;
      stats.weeklyPoolHits += 1;
      return existing;
    }
    if (existing) {
      for (const descriptor of existing.queries || []) {
        _searchCache.delete(`${String(descriptor?.query || '').trim()}::${SEARCH_COUNT}`);
      }
    }
    const promiseKey = `${pack.id || 'pack'}:${week}:${fingerprint}`;
    if (_weeklyPoolPromises.has(promiseKey)) return _weeklyPoolPromises.get(promiseKey);
    const pending = (async () => {
      const startedAt = Date.now();
      const queries = buildWeeklyQueryLanes(meta, weekPlan);
      stats.deepseekSearchCalls += queries.length;
      let hits = await searchMany(queries, { count: SEARCH_COUNT, maxQueries: 2 });
      const githubQuery = weekNeedsGithub(weekPlan)
        ? `${meta?.industry || ''} ${(weekPlan || []).map((row) => row.topic).join(' ')} in:name,description,readme`
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 180)
        : '';
      let githubResults = [];
      if (githubQuery) {
        const githubMetadata = await resolveResourceMetadata([], {
          githubQuery,
          githubLimit: 4,
        });
        stats.metadataCalls += 1;
        githubResults = githubMetadata.githubResults || [];
      }
      hits = [...hits, ...githubResults];
      const ranked = rankAndFilterSearchHits(hits, {
        learnWhat: (weekPlan || []).map((row) => row.topic).join('；'),
        topic: String(weekPlan?.[0]?.week || ''),
      }).slice(0, 20);
      const metadataRows = [];
      for (let index = 0; index < ranked.length; index += 10) {
        const metadata = await resolveResourceMetadata(
          ranked.slice(index, index + 10).map((row) => row.url)
        );
        stats.metadataCalls += 1;
        metadataRows.push(...metadata.results);
      }
      const enriched = mergeResolvedMetadata(ranked, metadataRows);
      enriched.forEach((hit, index) => {
        hit.candidateId = `C${index + 1}`;
      });
      const assignments = await assignWeeklyPool(meta, weekPlan, enriched);
      const pool = {
        version: RETRIEVAL_POOL_VERSION,
        fingerprint,
        week,
        fetchedAt: new Date().toISOString(),
        queries,
        hits: enriched,
        assignments,
        targetedDays: {},
        cacheHits: 0,
      };
      pools[String(week)] = pool;
      stats.weeklyPoolBuilds += 1;
      stats.durationMs += Date.now() - startedAt;
      return pool;
    })();
    _weeklyPoolPromises.set(promiseKey, pending);
    try {
      return await pending;
    } finally {
      _weeklyPoolPromises.delete(promiseKey);
    }
  }

  // ─── ① 大纲：UbD 成果分析 → 阶段周主题 → 定稿 JSON ───

  async function analyzeLearningOutcomes(meta) {
    const searchHits = hasSearchKey()
      ? await searchMany(
          [
            `${meta.industry} ${meta.role} 职责 能力 要求`,
            `${meta.industry} ${meta.role} ${meta.goal || '入门'} 面试 核心知识点`,
          ],
          { count: 6, maxQueries: 2 }
        )
      : [];

    const system = `你是职业学习路径的需求分析师（UbD Stage 1：Desired Results）。
${DEPTH_CONTRACT}
硬性规则：只输出一个 JSON 对象。
若提供了 search_results：domainAnchors 须对齐真实出现的对象/公司/主题；禁止编造搜索里没有的精确数据。`;
    const user = `## 方法
Backward Design：先定义「学完能做什么」，不要先列章节目录。

## 学习者
${metaBrief(meta)}

## search_results（领域锚点参考，可为空）
${formatSearchBlock(searchHits, 12)}

## Task
输出唯一 JSON：
{
  "exitPortrait": "学完后能在真实场景中完成的 2-3 句画像",
  "competencies": [{"id":"c1","name":"能力名","bloom":"理解|应用|分析|评价|创造","observable":"可观察行为（动词开头）","evidence":"用什么产出证明学会了"}],
  "domainAnchors": ["该行业/岗位必须碰到的真实对象或场景1","…至少6条"],
  "misconceptions": ["新手常见误区1","…至少4条"],
  "nonGoals": ["本路径明确不教什么1","…"]
}
要求：competencies 6-10 条，覆盖认知→方法→实战→表达；bloom 随阶段抬升；observable 禁止「了解/掌握」。`;
    return chatJson({ system, user, max_tokens: 3200, stage: 'outline.outcomes', jsonMode: true });
  }

  async function designPhaseWeekScaffold(meta, outcomes) {
    const system = `你是课程架构师（UbD Stage 3 + ADDIE Design）：把成果倒推成阶段与周主题。
${DEPTH_CONTRACT}
硬性规则：只输出一个 JSON 对象。`;
    const user = `## 学习者
${metaBrief(meta)}

## 已确认成果（上一步）
${JSON.stringify(outcomes).slice(0, 4500)}

## Task
输出唯一 JSON：
{
  "title": "路径标题（含行业+岗位+周期感）",
  "phases": [{"name":"阶段名","weeks":"第x-y周","focus":"本阶段要建立的判断/产出","competencyIds":["c1"]}],
  "weekThemes": [{"week":1,"theme":"本周主题（具体，含领域对象）","dayStart":1,"dayEnd":7,"phaseName":"必须等于某 phases[].name","focusQuestion":"本周要回答的决策问题","bloom":"理解|应用|分析"}],
  "hotKeywords": ["可用于产业资讯搜索的中文关键词1","…3-6条"]
}
要求：
- phases 4 段左右：认知边界→方法工具→实战作品→面试冲刺；phases 按时间顺序排列，后面阶段不得插回前面
- weekThemes 必须覆盖满 ${meta.days} 天，每周 theme 点名行业对象，禁止「综合提升」
- 每个 weekTheme.phaseName 必须来自 phases[].name，且随 week 递增只前进不回跳（同一 phase 可跨多周，但不可 A→B→A）
- 每周 focusQuestion 要像岗位会问的真问题`;
    return chatJson({ system, user, max_tokens: 3500, stage: 'outline.scaffold', jsonMode: true });
  }

  async function generateOutline(meta) {
    const outcomes = await analyzeLearningOutcomes(meta);
    const scaffold = await designPhaseWeekScaffold(meta, outcomes);
    const system = `你是学习路径编辑。把草稿规范成下游可用的大纲 JSON。硬性规则：只输出一个 JSON 对象。`;
    const user = `## 草稿
${JSON.stringify(scaffold).slice(0, 5000)}

## 成果摘要（用于对齐，勿删关键领域锚点）
${JSON.stringify({
      exitPortrait: outcomes?.exitPortrait,
      competencies: (outcomes?.competencies || []).slice(0, 10),
      domainAnchors: (outcomes?.domainAnchors || []).slice(0, 8),
    }).slice(0, 2500)}

## Output schema（唯一输出）
{
  "title": "",
  "phases": [{"name":"","weeks":"","focus":""}],
  "weekThemes": [{"week":1,"theme":"","dayStart":1,"dayEnd":7,"phaseName":"","bloom":"理解|应用|分析"}],
  "hotKeywords": [],
  "outcomes": {
    "exitPortrait": "",
    "competencies": [{"id":"","name":"","observable":"","evidence":""}],
    "domainAnchors": [],
    "misconceptions": []
  }
}
要求：weekThemes 覆盖满 ${meta.days} 天；每周带 phaseName（来自 phases，只前进不回跳）；保留领域锚点与误区；title 具体。`;
    const final = await chatJson({
      system,
      user,
      temperature: 0.2,
      max_tokens: 4000,
      stage: 'outline.finalize',
      jsonMode: true,
    });
    if (!final.outcomes) final.outcomes = outcomes;
    if (!final.title) final.title = scaffold.title || meta.title;
    return normalizeOutlineCalendar(final, meta.days);
  }

  // ─── 路径质量：阶段日历 / Bloom / 浅文与模板练习门禁 ───

  const BLOOM_VERBS = [
    {
      level: 6,
      verbs: [
        '创建',
        '设计',
        '撰写',
        '拟定',
        '构建',
        '产出',
        '规划',
        '主持',
        '起草',
        '编写',
        '制定',
        '改写',
        '创作',
        '模拟',
        '写',
      ],
    },
    { level: 5, verbs: ['评估', '评价', '判断', '权衡', '取舍', '评审', '打分'] },
    { level: 4, verbs: ['分析', '对比', '拆解', '归因', '比较', '诊断', '梳理'] },
    { level: 3, verbs: ['应用', '使用', '演示', '执行', '填写', '绘制', '操作'] },
    { level: 2, verbs: ['解释', '概括', '描述', '理解', '说明', '区分', '举例'] },
    { level: 1, verbs: ['记住', '列出', '说出', '识别', '回忆', '复述'] },
  ];

  function bloomLevelFromText(text) {
    const t = String(text || '');
    let best = 0;
    for (const row of BLOOM_VERBS) {
      if (row.verbs.some((v) => t.includes(v))) best = Math.max(best, row.level);
    }
    return best;
  }

  function parsePhaseWeekRange(weeksStr) {
    const s = String(weeksStr || '');
    const range = s.match(/第\s*(\d+)\s*[-–—~至到]\s*(\d+)\s*周/);
    if (range) return { start: Number(range[1]), end: Number(range[2]) };
    const single = s.match(/第\s*(\d+)\s*周/);
    if (single) {
      const n = Number(single[1]);
      return { start: n, end: n };
    }
    return null;
  }

  function resolvePhaseNameForWeek(week, phases, allWeeks) {
    const named = String(week?.phaseName || week?.phase || '').trim();
    if (named) {
      const hit = (phases || []).find((p) => p.name === named);
      if (hit) return hit.name;
      return named;
    }
    const weekNum = Number(week?.week) || 1;
    for (const p of phases || []) {
      const r = parsePhaseWeekRange(p.weeks);
      if (r && weekNum >= r.start && weekNum <= r.end) return p.name;
    }
    const phaseList = phases?.length ? phases : [{ name: '学习阶段' }];
    const totalWeeks = Math.max(
      1,
      ...(allWeeks || []).map((w) => Number(w.week) || 0),
      weekNum
    );
    const idx = Math.min(
      phaseList.length - 1,
      Math.floor(((weekNum - 1) * phaseList.length) / totalWeeks)
    );
    return phaseList[idx].name;
  }

  /** 规范化大纲日历：补齐 day 区间、phaseName，并强制阶段只前进 */
  function normalizeOutlineCalendar(outline, totalDays) {
    const days = Math.min(90, Math.max(7, Number(totalDays) || 30));
    const o = outline && typeof outline === 'object' ? outline : {};
    let phases = Array.isArray(o.phases) && o.phases.length
      ? o.phases.map((p) => ({
          name: String(p.name || '学习阶段').trim() || '学习阶段',
          weeks: String(p.weeks || ''),
          focus: String(p.focus || ''),
          competencyIds: Array.isArray(p.competencyIds) ? p.competencyIds : [],
        }))
      : [
          { name: '认知边界', weeks: '', focus: '角色与对象边界' },
          { name: '方法工具', weeks: '', focus: '可迁移方法' },
          { name: '实战作品', weeks: '', focus: '可交付产出' },
          { name: '面试冲刺', weeks: '', focus: '表达与答辩' },
        ];

    let weekThemes = Array.isArray(o.weekThemes) ? o.weekThemes.slice() : [];
    if (!weekThemes.length) {
      const weekCount = Math.ceil(days / 7);
      weekThemes = Array.from({ length: weekCount }, (_, i) => ({
        week: i + 1,
        theme: `第${i + 1}周主题`,
        dayStart: i * 7 + 1,
        dayEnd: Math.min(days, (i + 1) * 7),
      }));
    }

    weekThemes = weekThemes
      .map((w, i) => {
        const week = Number(w.week) || i + 1;
        let dayStart = Number(w.dayStart) || (week - 1) * 7 + 1;
        let dayEnd = Number(w.dayEnd) || Math.min(days, week * 7);
        dayStart = Math.max(1, Math.min(days, dayStart));
        dayEnd = Math.max(dayStart, Math.min(days, dayEnd));
        return {
          week,
          theme: String(w.theme || w.title || `第${week}周`).trim(),
          dayStart,
          dayEnd,
          focusQuestion: w.focusQuestion ? String(w.focusQuestion) : undefined,
          bloom: w.bloom ? String(w.bloom) : undefined,
          phaseName: resolvePhaseNameForWeek(w, phases, weekThemes),
        };
      })
      .sort((a, b) => a.week - b.week || a.dayStart - b.dayStart);

    // 强制 phase 只前进：按周扫描，phase 索引不得下降
    const phaseIndex = new Map(phases.map((p, i) => [p.name, i]));
    let maxIdx = 0;
    weekThemes = weekThemes.map((w) => {
      let idx = phaseIndex.has(w.phaseName) ? phaseIndex.get(w.phaseName) : maxIdx;
      if (idx < maxIdx) idx = maxIdx;
      maxIdx = idx;
      return { ...w, phaseName: phases[idx].name };
    });

    // 回写 phases.weeks
    phases = phases.map((p, i) => {
      const weeksInPhase = weekThemes.filter((w) => w.phaseName === p.name).map((w) => w.week);
      if (!weeksInPhase.length) return p;
      const a = Math.min(...weeksInPhase);
      const b = Math.max(...weeksInPhase);
      return { ...p, weeks: a === b ? `第${a}周` : `第${a}-${b}周` };
    });

    o.phases = phases;
    o.weekThemes = weekThemes;
    return o;
  }

  function buildDayPhaseMap(outline, totalDays) {
    const days = Number(totalDays) || 30;
    const map = new Map();
    const o = normalizeOutlineCalendar(outline || {}, days);
    for (const w of o.weekThemes || []) {
      for (let d = w.dayStart; d <= w.dayEnd; d++) {
        map.set(d, w.phaseName);
      }
    }
    let last = o.phases?.[0]?.name || '学习阶段';
    for (let d = 1; d <= days; d++) {
      if (map.has(d)) last = map.get(d);
      else map.set(d, last);
    }
    return map;
  }

  function applyPhaseFromOutline(plan, outline) {
    const days = plan?.length || 30;
    const map = buildDayPhaseMap(outline, days);
    return (plan || []).map((d) => ({
      ...d,
      phase: map.get(Number(d.day)) || d.phase || '学习阶段',
    }));
  }

  /** 注入知识库回链，保证每天任务能打开对应章节 */
  function injectHubBacklinkTasks(plan) {
    return (plan || []).map((d) => {
      if (typeof TaskResourceBinder !== 'undefined' && TaskResourceBinder.bindDay) {
        return TaskResourceBinder.bindDay({ dayPlan: d, resources: [] });
      }
      const topic = String(d.topic || `Day ${d.day}`);
      const hubTask = `打开日课「Day ${d.day} · ${topic}」精读本日章节，勾选完成清单`;
      let tasks = Array.isArray(d.tasks) ? d.tasks.map(String) : [];
      if (!tasks.some((t) => /日课|知识库/.test(t))) {
        if (!tasks.length) tasks = [hubTask, '整理对比表或清单', '合上资料做场景判断'];
        else {
          tasks = [
            hubTask,
            ...tasks.filter(
              (t) =>
                !/^(?:阅读|读|精读|研读|观看|查看|参考|浏览|学习).*(?:《|报告|白皮书|课程|视频|文章|指南|文档|B站|GitHub|维基)/i.test(t)
            ),
          ].slice(0, 3);
        }
        while (tasks.length < 3) {
          tasks.push(['整理对比表或清单', '合上资料复述今日判断', '写下仍不确定的问题'][tasks.length - 1]);
        }
      }
      return { ...d, tasks: tasks.slice(0, 4) };
    });
  }

  function isTemplateExerciseQuestion(q) {
    const s = String(q || '').trim();
    if (!s) return true;
    if (/用一句话总结\s*今天/.test(s)) return true;
    if (/用一句话总结.*核心认知/.test(s)) return true;
    if (/举\s*1\s*个真实案例说明/.test(s) && /在产品实践中的体现/.test(s)) return true;
    if (/反思今日任务[：:]/.test(s)) return true;
    if (/讲清并应用[「『"]/.test(s)) return true;
    if (/请总结今日内容/.test(s)) return true;
    // 同质骨架：仅替换「topic」的三件套（上轮复评命中）
    if (/合上资料，用工作语言定义[「『"]/.test(s)) return true;
    if (/同事主张立刻扩大[「『"].*范围/.test(s)) return true;
    if (/一个该做、一个不该做的边界例子/.test(s)) return true;
    if (/合上资料后，用一句话写出[「『"]/.test(s) && /工作定义/.test(s)) return true;
    return false;
  }

  /** 去掉书名号内 topic 后的题干指纹，用于检测「只换主题」同质化 */
  function exerciseStemFingerprint(q) {
    return String(q || '')
      .replace(/[「『"][^」』"]{1,40}[」』"]/g, '「§」')
      .replace(/Day\s*\d+/gi, 'DayN')
      .replace(/\s+/g, '')
      .slice(0, 80);
  }

  function stemUniqueRatio(dayExercises) {
    const stems = [];
    Object.values(dayExercises || {}).forEach((exs) => {
      if (!Array.isArray(exs)) return;
      exs.forEach((ex) => {
        const fp = exerciseStemFingerprint(ex?.q || ex?.question);
        if (fp.length >= 8) stems.push(fp);
      });
    });
    if (!stems.length) return 1;
    return [...new Set(stems)].length / stems.length;
  }

  function isHomogeneousExerciseSet(dayExercises) {
    const stems = [];
    Object.values(dayExercises || {}).forEach((exs) => {
      if (!Array.isArray(exs)) return;
      exs.forEach((ex) => {
        const fp = exerciseStemFingerprint(ex?.q || ex?.question);
        if (fp.length >= 8) stems.push(fp);
      });
    });
    if (stems.length < 6) return false;
    const counts = {};
    stems.forEach((s) => {
      counts[s] = (counts[s] || 0) + 1;
    });
    const top = Math.max(...Object.values(counts));
    // 峰值占比过高，或去重率过低（软质量）
    if (top / stems.length >= 0.35) return true;
    const soft =
      (typeof PackHarness !== 'undefined' && PackHarness.SOFT_QUALITY) || {};
    const minUniq = soft.stemUniqueMin || 0.65;
    return [...new Set(stems)].length / stems.length < minUniq * 0.85;
  }

  function countTemplateExercises(dayExercises) {
    let n = 0;
    Object.values(dayExercises || {}).forEach((exs) => {
      if (!Array.isArray(exs)) return;
      exs.forEach((ex) => {
        if (isTemplateExerciseQuestion(ex?.q || ex?.question)) n += 1;
      });
    });
    return n;
  }

  function phaseFamily(phase) {
    const p = String(phase || '');
    if (/实战|验证|作品|面试|提案|答辩|作品集/.test(p)) return 'practice';
    if (/方法|工具|技能|流程|分析/.test(p)) return 'method';
    return 'cognition';
  }

  /**
   * 按 phase + 日序选骨架；opts.usedStemCounts 全包共享，同 stem ≤ maxPerStem（默认 2）
   */
  function buildVariedFallbackExercises(dayPlan, meta = {}, opts = {}) {
    const day = Number(dayPlan?.day) || 1;
    const topic = String(dayPlan?.topic || '今日主题').trim();
    const role = String(meta?.role || '本岗位').trim() || '本岗位';
    const industry = String(meta?.industry || '').trim() || '业务';
    const tasks = Array.isArray(dayPlan?.tasks) ? dayPlan.tasks.map(String) : [];
    const t0 = tasks[0]
      ? String(tasks[0]).replace(/^打开(?:日课|知识库)[^，,；;]{0,40}[，,；;]?/, '').slice(0, 42)
      : '';
    const t1 = tasks[1] ? String(tasks[1]).slice(0, 42) : '';
    const t2 = tasks[2] ? String(tasks[2]).slice(0, 42) : '';
    const family = phaseFamily(dayPlan?.phase);
    const preferHighBloom = !!opts.preferHighBloom || day >= 15 || family === 'practice';
    const used = opts.usedStemCounts || {};
    const soft =
      (typeof PackHarness !== 'undefined' && PackHarness.softThresholds?.()) ||
      (typeof PackHarness !== 'undefined' && PackHarness.SOFT_QUALITY) ||
      {};
    const maxPerStem = opts.maxPerStem ?? soft.maxStemRepeats ?? 2;

    /** 30+ 互异骨架：指纹去 topic 后仍可区分；按 family 优先 */
    const bank = [
      {
        id: 'def-boundary',
        families: ['cognition'],
        bloom: 2,
        make: () => ({
          q: `闭卷：用工作语言定义「${topic}」必须包含的 2 个要素（对象+边界）`,
          rubric: ['含对象', '含边界/适用条件', '不用空话形容词'],
        }),
      },
      {
        id: 'checkpoints',
        families: ['cognition', 'method'],
        bloom: 3,
        make: () => ({
          q: t1
            ? `对照今日加工任务「${t1}」，列出你实际产出的 3 个检查点`
            : `为「${topic}」写 3 条可打分的完成检查点`,
          rubric: ['检查点可观察', '与今日主题相关', '不是「认真学习」类空话'],
        }),
      },
      {
        id: 'ask-dev',
        families: ['cognition', 'method'],
        bloom: 4,
        make: () => ({
          q: `${industry}场景：${role} 与开发对「${topic}」范围争执，你先问哪 2 个问题再拍板？`,
          rubric: ['问题具体', '能暴露约束', '体现岗位权责'],
        }),
      },
      {
        id: 'oral-diff',
        families: ['cognition'],
        bloom: 2,
        make: () => ({
          q: `合上资料，口述「${topic}」与相邻概念的 1 个关键差异（30 秒）`,
          rubric: ['对比双方明确', '差异可检验', '贴合行业对象'],
        }),
      },
      {
        id: 'misconception',
        families: ['cognition', 'method'],
        bloom: 4,
        make: () => ({
          q: t0
            ? `基于输入「${t0.slice(0, 36)}…」，写出你抓到的 1 个误区并纠正`
            : `写出「${topic}」的 1 个常见误区与纠正说法`,
          rubric: ['误区具体', '纠正可执行', '非口号'],
        }),
      },
      {
        id: 'roi-cut',
        families: ['method', 'practice'],
        bloom: 5,
        make: () => ({
          q: `取舍题：时间只够做「${topic}」的一半，你砍掉哪一块？用一句 ROI/风险理由说明`,
          rubric: ['有明确砍项', '有理由', '像岗位决策而非逃避'],
        }),
      },
      {
        id: 'apply-conds',
        families: ['cognition', 'method'],
        bloom: 2,
        make: () => ({
          q: `默写「${topic}」的适用条件 2 条 + 不适用条件 1 条`,
          rubric: ['正反条件都有', '可操作', `贴合${role}`],
        }),
      },
      {
        id: 'outline-3',
        families: ['cognition', 'method'],
        bloom: 3,
        make: () => ({
          q: t2
            ? `不看资料完成提取任务意图：「${t2}」——给出你的结论提纲（3 点）`
            : `用 3 点提纲向同事讲清「${topic}」今天要达成什么`,
          rubric: ['提纲完整', '可口头交付', '对应今日主题'],
        }),
      },
      {
        id: 'negotiate',
        families: ['method', 'practice'],
        bloom: 5,
        make: () => ({
          q: `冲突：运营要扩大范围、你要守边界——围绕「${topic}」写你的协商开场白（≤40字）`,
          rubric: ['有立场', '有协商姿态', '提到具体对象'],
        }),
      },
      {
        id: 'if-then',
        families: ['method'],
        bloom: 4,
        make: () => ({
          q: `用「假如…就会…」各写一条：正确使用「${topic}」与误用「${topic}」的后果`,
          rubric: ['正反后果都有', '后果可感知', '非空泛'],
        }),
      },
      {
        id: 'newcomer-q',
        families: ['method', 'practice'],
        bloom: 6,
        make: () => ({
          q: `设计 1 道给新人的判断题（含标准答案要点），考点必须是「${topic}」`,
          rubric: ['题目可作答', '有标准要点', '考点清晰'],
        }),
      },
      {
        id: 'principle',
        families: ['cognition', 'practice'],
        bloom: 5,
        make: () => ({
          q: `${role}视角：今天若只带走一个可迁移原则，关于「${topic}」你会带走哪句？为何？`,
          rubric: ['原则可迁移', '有为何', '不是复述标题'],
        }),
      },
      {
        id: 'deliverable-fields',
        families: ['method', 'practice'],
        bloom: 3,
        make: () => ({
          q: `列出「${topic}」交付物里必须有的字段/段落 3 个（或等价检查项）`,
          rubric: ['至少 3 项', '像真实交付', '可对照检查'],
        }),
      },
      {
        id: 'review-pullback',
        families: ['practice'],
        bloom: 5,
        make: () => ({
          q: `场景：评审会上有人说「这个太细了先跳过」——你如何用「${topic}」相关理由拉回来？`,
          rubric: ['理由具体', '服务共识', '不人身攻击'],
        }),
      },
      {
        id: 'uncertainty',
        families: ['cognition', 'practice'],
        bloom: 4,
        make: () => ({
          q: `写下你对「${topic}」仍不确定的一点，并写清下周用什么产出验证`,
          rubric: ['不确定点具体', '验证方式可做', '一周内可完成'],
        }),
      },
      {
        id: 'stakeholder-map',
        families: ['cognition', 'method'],
        bloom: 4,
        make: () => ({
          q: `画出「${topic}」相关的 3 类干系人，并各写 1 句他们最在意的成功标准`,
          rubric: ['三类角色', '成功标准可检验', '贴合行业'],
        }),
      },
      {
        id: 'metric-pick',
        families: ['method', 'practice'],
        bloom: 5,
        make: () => ({
          q: `为「${topic}」选 1 个北极星指标 + 2 个护栏指标，并说明为何不是「虚荣指标」`,
          rubric: ['有北极星', '有护栏', '能反驳虚荣指标'],
        }),
      },
      {
        id: 'prd-section',
        families: ['method'],
        bloom: 6,
        make: () => ({
          q: `起草 PRD 里「${topic}」对应小节的 3 个必写小节标题，并各用 1 句说明读者是谁`,
          rubric: ['三节标题', '读者明确', '像真实文档'],
        }),
      },
      {
        id: 'ab-hypothesis',
        families: ['method', 'practice'],
        bloom: 6,
        make: () => ({
          q: `围绕「${topic}」写一条可证伪假设（若…则…因为…），并点名要看的 1 个主指标`,
          rubric: ['假设可证伪', '有因果', '指标可测'],
        }),
      },
      {
        id: 'competitor-diff',
        families: ['method', 'practice'],
        bloom: 4,
        make: () => ({
          q: `对比竞品 A/B 在「${topic}」上的 2 个差异，并写你会抄/不抄的各 1 条理由`,
          rubric: ['差异具体', '有取舍', '非功能罗列'],
        }),
      },
      {
        id: 'scope-cut-table',
        families: ['practice'],
        bloom: 5,
        make: () => ({
          q: `用表格列「${topic}」的 MVP / 可延后 / 明确不做 各 1 项，并写 1 句边界声明`,
          rubric: ['三档都有', '边界可执行', '能对外对齐'],
        }),
      },
      {
        id: 'interview-story',
        families: ['practice'],
        bloom: 6,
        make: () => ({
          q: `用 STAR 写 120 字内案例：你如何用「${topic}」推动一次决策（含结果）`,
          rubric: ['有情境行动结果', '点名方法', '像面试口述'],
        }),
      },
      {
        id: 'risk-register',
        families: ['method', 'practice'],
        bloom: 5,
        make: () => ({
          q: `列出「${topic}」落地的 2 个风险 + 对应缓解动作（谁在何时做）`,
          rubric: ['风险具体', '缓解可执行', '有责任人/时机'],
        }),
      },
      {
        id: 'user-quote',
        families: ['cognition', 'method'],
        bloom: 4,
        make: () => ({
          q: `虚构 1 条用户原话（≤30字）暴露「${topic}」痛点，并改写成 1 条可验收需求`,
          rubric: ['原话像真人', '需求可验收', '无解决方案偷渡'],
        }),
      },
      {
        id: 'tradeoff-matrix',
        families: ['practice'],
        bloom: 5,
        make: () => ({
          q: `在「速度 / 质量 / 范围」里为「${topic}」排优先级，并用 1 句解释牺牲了什么`,
          rubric: ['有排序', '有牺牲说明', '像评审发言'],
        }),
      },
      {
        id: 'demo-script',
        families: ['practice'],
        bloom: 6,
        make: () => ({
          q: `写 45 秒 Demo 开场：先讲「${topic}」解决谁的什么问题，再点 1 个关键交互`,
          rubric: ['有对象问题', '有关键交互', '可口头演示'],
        }),
      },
      {
        id: 'reject-reason',
        families: ['practice'],
        bloom: 5,
        make: () => ({
          q: `同事主张立刻扩大「${topic}」范围——写出你拒绝或附条件同意的 2 条理由`,
          rubric: ['立场清楚', '理由可辩护', '非情绪化'],
        }),
      },
      {
        id: 'data-ask',
        families: ['method'],
        bloom: 4,
        make: () => ({
          q: `要验证「${topic}」，你向数据同学提 2 个具体取数问题（含时间窗/分群）`,
          rubric: ['问题可取数', '有时间窗或分群', '服务决策'],
        }),
      },
      {
        id: 'handoff-note',
        families: ['method', 'practice'],
        bloom: 3,
        make: () => ({
          q: `给研发的交接便条：关于「${topic}」必须同步的 3 个决策点（各≤15字）`,
          rubric: ['三点决策', '可执行', '避免口头含糊'],
        }),
      },
      {
        id: 'self-rubric',
        families: ['practice'],
        bloom: 5,
        make: () => ({
          q: `为今日「${topic}」产出设计 3 档评分（及格/良好/优秀），每档 1 条观察标准`,
          rubric: ['三档可区分', '标准可观察', '非态度词'],
        }),
      },
    ];

    const prefer = bank.filter((b) => b.families.includes(family));
    const rest = bank.filter((b) => !b.families.includes(family));
    let ordered = [...prefer, ...rest];
    if (preferHighBloom) {
      // 旧实现先按 Bloom 排序、再对整个数组旋转，旋转后低阶题会重新回到队首。
      // 只在高阶池内部轮换，确保修复周选出的前三题均为评估/创造层。
      const high = ordered.filter((item) => item.bloom >= 6);
      const low = ordered.filter((item) => item.bloom < 6);
      const highRot = high.length ? (day - 1) % high.length : 0;
      ordered = high.slice(highRot).concat(high.slice(0, highRot), low);
    } else {
      // 日序旋转，避免相邻天总拿同一批头部
      const rot = (day - 1) % ordered.length;
      ordered = ordered.slice(rot).concat(ordered.slice(0, rot));
    }

    const picked = [];
    const tryPick = (allowOver) => {
      for (const item of ordered) {
        if (picked.length >= 3) break;
        let ex = item.make();
        // 任务锚点写在书名号外，避免指纹只剩骨架
        const anchor = (t1 || t0 || t2 || `${topic.slice(0, 8)}-D${day}`).slice(0, 20);
        if (anchor && !String(ex.q).includes(anchor)) {
          ex = { ...ex, q: `${ex.q}（结合：${anchor}）` };
        }
        const fp = exerciseStemFingerprint(ex.q);
        const n = used[fp] || 0;
        if (!allowOver && n >= maxPerStem) continue;
        if (picked.some((p) => exerciseStemFingerprint(p.q) === fp)) continue;
        picked.push(ex);
        used[fp] = n + 1;
      }
    };
    tryPick(false);
    tryPick(true); // 骨架耗尽时允许突破，仍尽量不重复同一天内

    while (picked.length < 3) {
      const fallback = {
        q: `结合 Day ${day}「${topic}」，写 1 个可打分产出标准 + 1 个反例`,
        rubric: ['有产出标准', '有反例', '贴合本日'],
      };
      const fp = exerciseStemFingerprint(fallback.q) + `#${picked.length}`;
      used[fp] = (used[fp] || 0) + 1;
      picked.push(fallback);
    }
    const kinds = ['recall', 'application', 'transfer'];
    return picked.slice(0, 3).map((exercise, index) => ({
      ...exercise,
      type: kinds[index],
      objective: topic,
      ref:
        index === 0
          ? `参考答案应准确复述「${topic}」的对象、关键步骤或边界。`
          : index === 1
            ? `参考答案应把「${topic}」用于当日任务，并逐条满足 rubric。`
            : `参考答案应说明「${topic}」迁移到新场景时保留的原则、调整的约束与取舍理由。`,
      commonMistakes:
        index === 0
          ? ['只复述标题，没有对象或边界', '依赖资料照抄，未完成闭卷提取']
          : index === 1
            ? ['给出泛泛建议，没有落到当日 task', '结论没有可检查的产出']
            : ['机械套用原场景答案', '没有说明新约束导致的调整'],
      feedbackMode: index === 0 ? 'immediate' : index === 1 ? 'rubric' : 'delayed-self-explain',
    }));
  }

  function normalizeDailyExerciseContract(exercises, dayPlan, meta = {}) {
    const topic = String(dayPlan?.topic || '今日主题').trim();
    const fallback = buildVariedFallbackExercises(dayPlan, meta);
    const source = (Array.isArray(exercises) ? exercises : [])
      .filter((exercise) => exercise && String(exercise.q || exercise.question || '').trim())
      .slice(0, 3);
    const kinds = ['recall', 'application', 'transfer'];
    while (source.length < 3) source.push(fallback[source.length]);
    return source.map((exercise, index) => {
      const base = fallback[index];
      const rubric = (Array.isArray(exercise.rubric) ? exercise.rubric : base.rubric)
        .map(String)
        .map((item) => item.trim())
        .filter(Boolean);
      const commonMistakes = (
        Array.isArray(exercise.commonMistakes) ? exercise.commonMistakes : base.commonMistakes
      )
        .map(String)
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 4);
      return {
        q: String(exercise.q || exercise.question || base.q).trim(),
        type: kinds[index],
        objective: String(exercise.objective || topic).trim().slice(0, 100),
        rubric: rubric.length ? rubric : base.rubric,
        ref: String(exercise.ref || base.ref).trim(),
        commonMistakes: commonMistakes.length ? commonMistakes : base.commonMistakes,
        feedbackMode: String(exercise.feedbackMode || base.feedbackMode),
      };
    });
  }

  /** 整包按 stem 预算重建练习（质量门 / 修复环共用） */
  function rebuildExercisesWithStemBudget(plan, meta, opts = {}) {
    const used = {};
    const out = {};
    (plan || []).forEach((d) => {
      out[String(d.day)] = buildVariedFallbackExercises(d, meta, {
        usedStemCounts: used,
        preferHighBloom: opts.preferHighBloom || Number(d.day) >= 15,
        maxPerStem: opts.maxPerStem,
      });
    });
    return out;
  }

  function weekBloomAverages(plan, dayExercises) {
    const buckets = new Map();
    for (const d of plan || []) {
      const day = Number(d.day) || 0;
      const week = Math.ceil(day / 7) || 1;
      const blob = [d.topic, ...(d.tasks || [])].join(' ');
      const declaredBloom = bloomLevelFromText(d.bloom || d.objective || '');
      const lvl = Math.max(declaredBloom, bloomLevelFromText(blob)) || 2;
      if (!buckets.has(week)) buckets.set(week, []);
      buckets.get(week).push(lvl);
      const exs = (dayExercises && (dayExercises[String(day)] || dayExercises[day])) || [];
      exs.forEach((ex) => {
        if (ex && typeof ex === 'object') {
          buckets.get(week).push(bloomLevelFromText(ex.q || ex.question || '') || 0);
        }
      });
    }
    const avgs = [];
    [...buckets.keys()]
      .sort((a, b) => a - b)
      .forEach((w) => {
        const arr = buckets.get(w);
        avgs.push({ week: w, avg: arr.reduce((a, b) => a + b, 0) / arr.length });
      });
    return avgs;
  }

  /** 周均 Bloom 倒退诊断（容差对齐 Eval DA ≈0.15） */
  function diagnoseBloomRegression(plan, dayExercises) {
    const soft =
      (typeof PackHarness !== 'undefined' && PackHarness.SOFT_QUALITY) || {};
    const dropMax = soft.bloomDropMax ?? 0.15;
    const avgs = weekBloomAverages(plan, dayExercises);
    const issues = [];
    for (let i = 1; i < avgs.length; i++) {
      if (avgs[i].avg < avgs[i - 1].avg - dropMax) {
        issues.push({
          week: avgs[i].week,
          prev: Number(avgs[i - 1].avg.toFixed(2)),
          curr: Number(avgs[i].avg.toFixed(2)),
        });
      }
    }
    return issues;
  }

  // ─── ② 课表：周目标 → 逐日展开（每 7 天） ───

  async function designWeekGoals(meta, outline, dayStart, dayEnd) {
    const weeks = (outline?.weekThemes || []).filter(
      (w) => !(w.dayEnd < dayStart || w.dayStart > dayEnd)
    );
    const system = `你是周课设计师（Bloom + constructive alignment）。
${DEPTH_CONTRACT}
硬性规则：只输出一个 JSON 对象。`;
    const user = `## 学习者
${metaBrief(meta)}

## 相关周主题
${JSON.stringify(weeks).slice(0, 2000)}

## 成果/误区
${JSON.stringify({
      competencies: (outline?.outcomes?.competencies || []).slice(0, 8),
      misconceptions: (outline?.outcomes?.misconceptions || []).slice(0, 6),
      domainAnchors: (outline?.outcomes?.domainAnchors || []).slice(0, 6),
    }).slice(0, 2200)}

## Task
为 Day ${dayStart}-${dayEnd} 设计周目标 JSON：
{
  "span": "${dayStart}-${dayEnd}",
  "weekOutcome": "本周末可检验的产出（动词开头）",
  "transferGoal": "学完能迁移到的真实场景",
  "dailySeeds": [{"day":${dayStart},"bloom":"记忆|理解|应用|分析|评价|创造","seedTopic":"当日种子主题（含领域对象）","mustHit":"必须碰到的概念/对象","avoid":"本日不要空讲的套话"}]
}
要求：dailySeeds 恰好覆盖 ${dayStart} 到 ${dayEnd} 每一天；bloom 周内由低到高略递进；若本段已是后半程（dayStart≥15）则 bloom 以应用/分析/评价/创造为主；seedTopic 禁止「复习/总结」占超过 1 天；本周阶段应与大纲一致，勿引入其它阶段主题。`;
    return chatJson({ system, user, max_tokens: 2800, stage: 'plan.week-goals', jsonMode: true });
  }

  async function expandWeekToDays(meta, outline, weekGoals, dayStart, dayEnd) {
    const system = `你是逐日课表作家。把周目标展开为可执行的每日任务。
${DEPTH_CONTRACT}
硬性规则：只输出一个 JSON 数组，不要对象外壳。`;
    const phaseMap = buildDayPhaseMap(outline, meta.days || dayEnd);
    const lockedPhase = phaseMap.get(dayStart) || outline?.phases?.[0]?.name || '学习阶段';
    const user = `## 学习者
${metaBrief(meta)}

## 周目标（上一步）
${JSON.stringify(weekGoals).slice(0, 3500)}

## 本周锁定阶段（禁止改写、禁止换成其它阶段名）
${lockedPhase}

## Task
输出 JSON 数组，恰好 ${dayEnd - dayStart + 1} 项：
[
  {
    "day": ${dayStart},
    "phase": "${lockedPhase}",
    "week": "第n周：主题",
    "topic": "当日主题（≤18字，含领域对象）",
    "tasks": [
      "输入型任务：打开系统内本日日课并完成清单",
      "加工型任务：对比/画图/列表等",
      "提取型任务：不看资料复述或场景判断"
    ],
    "why": "为何排在这一天（1句）"
  }
]
要求：tasks 正好 3 条且三类齐全；phase 必须整段都是「${lockedPhase}」；禁止三条都是「阅读/笔记/复述」万能句；课表阶段尚无外部资料，禁止编写书名、报告名、课程名、视频名、URL 或任何假定存在的外部材料；topic 与 weekGoals.dailySeeds 对齐。`;
    const raw = await chatJson({ system, user, max_tokens: 4000, stage: 'plan.days' });
    const arr = Array.isArray(raw) ? raw : raw.days || raw.plan || [];
    return arr
      .map((d, i) => {
        const day = Number(d.day) || dayStart + i;
        return {
          day,
          phase: phaseMap.get(day) || lockedPhase,
          week: String(d.week || `第${Math.ceil(day / 7)}周`),
          topic: String(d.topic || weekGoals?.dailySeeds?.[i]?.seedTopic || `主题 ${day}`),
          tasks: Array.isArray(d.tasks) && d.tasks.length
            ? d.tasks.map(String).slice(0, 5)
            : ['打开日课精读本日章节', '整理对比表或清单', '合上资料复述今日判断题'],
          why: d.why ? String(d.why) : undefined,
          bloom: weekGoals?.dailySeeds?.[i]?.bloom || undefined,
        };
      })
      .filter((d) => d.day >= dayStart && d.day <= dayEnd)
      .sort((a, b) => a.day - b.day);
  }

  async function generatePlanChunk(meta, outline, dayStart, dayEnd) {
    const weekGoals = await designWeekGoals(meta, outline, dayStart, dayEnd);
    return expandWeekToDays(meta, outline, weekGoals, dayStart, dayEnd);
  }

  /**
   * Prompt 设计参考（PROMPT_VER=2026-07-28b）：
   * - 对标可视化术语图鉴：口语切入、专属示意图、易混边界、完整例子
   * - visual.kind 由模型按概念选型，禁止全词共用通用四格
   */
  const GLOSSARY_VISUAL_KINDS = `visual.kind 必须从下列择一（同批术语尽量用不同 kind）：
- flow：方法/流程/链路（nodes=有序步骤，label+detail）
- loop：飞轮/闭环/正反馈（nodes=回环节点，caption 说明如何回流）
- anatomy：文档结构/组件组成（nodes=部件名+职责）
- roles：多方协作如用户/应用/模型（nodes 必填 actor）
- scenario：需要「看见长什么样」（quote+facts 事实卡+nodes 大纲+caption）
- compare：两个方案/概念并排对比（columns=两列标题，nodes 用 group 归列）
- states：状态机/生命周期（nodes 按变化顺序，badge 写状态名或触发条件）
- layers：系统分层/技术栈（nodes 从表层到基础层排列）
- tree：层级/分类/组成树（首个 node 为根；其余可用 parent 指向父节点）
- timeline：阶段演进/发布过程（nodes 按时间顺序，badge 写时间点或阶段）
- matrix：二维判断/情境选择（columns=2–4 个象限标题，nodes 用 group 归类）
禁止 visual.nodes/steps 写成「日课场景→识别术语→判断边界→形成行动」这类通用于任何词的模板。`;

  const GLOSSARY_FEWSHOT = {
    term: '数据飞轮',
    aliases: ['Data Flywheel'],
    module: '产品',
    definition: '用户使用产生的数据持续回流、驱动下一轮产品/模型改进，并使体验与用量互相加速的正反馈循环。',
    userPhrases: ['我们已经埋了很多点、数据也很多，为什么产品还是没有越用越好？'],
    example:
      '智能客服上线后：用户提问→会话与满意度回流→意图模型每周重训→回答更准→提问量上升。若只有埋点看板、没有重训与上线节奏，则不算飞轮。',
    visual: {
      kind: 'loop',
      title: '数据飞轮如何转起来',
      nodes: [
        { label: '用户使用', detail: '产生可回流的行为/结果数据' },
        { label: '数据回流', detail: '清洗、标注、入库，进入训练队列' },
        { label: '模型/产品改进', detail: '按周发布可感知的提升' },
        { label: '体验更好', detail: '带来更多使用，下一圈加速' },
      ],
      caption: '每一圈必须有可运营的回流与发布；只采不训≠飞轮。',
    },
    confusions: [
      {
        term: '数据闭环',
        distinction: '闭环强调采集→训练→部署链路完整；飞轮还要求每圈正反馈并加速用量/质量。',
      },
      {
        term: '埋点',
        distinction: '埋点只是采集动作；没有回流改进与发布节奏，就没有飞轮。',
      },
    ],
    sections: [
      {
        label: '是什么',
        content:
          '不是「有很多数据」本身，而是采集→清洗→训练→部署→再采集能转、且回流可运营。',
      },
      {
        label: '别这样叫',
        content: '避免用「埋点」「大数据」「数据驱动」偷换：有采集无回流迭代≠飞轮。',
      },
      {
        label: '岗位要会的判断',
        content:
          '1）新功能是否贡献可回流数据？\\n2）权限/激励是否挡回流？\\n3）迭代节奏是否跟上反馈？\\n4）冷启动靠什么撬第一圈？',
      },
      {
        label: '面试怎么答',
        content:
          '一句话：飞轮是「越好用→越好数据→更好产品」的可运营闭环。再补：冷启动靠种子场景/补贴数据，不是等自然增长。',
      },
    ],
  };

  const GLOSSARY_FEWSHOT_SCENARIO = {
    term: 'PRD',
    aliases: ['产品需求文档', 'Product Requirements Document'],
    module: '方法',
    definition: '写清用户问题、目标、范围与成功标准，帮助产品/设计/研发对齐「做什么、做到什么算完」的需求文档。',
    userPhrases: ['我想把要做的东西写清楚：解决什么问题、做到什么程度算完。'],
    example:
      '「会议纪要导出」：背景写清每周 6+ 场会、整理纪要约 40 分钟；目标是一键导出；范围含导出 PDF，不含自动纪要生成；验收为导出耗时 <10 秒且字段齐全。',
    visual: {
      kind: 'scenario',
      title: '一份可协作的 PRD 长什么样',
      quote: '每周开完 6 场会，光整理纪要发出去就要 40 分钟。',
      facts: [
        { label: '会议频率', value: '6+ 场/周' },
        { label: '整理耗时', value: '约 40 分钟' },
        { label: '相关人数', value: '3 人核对' },
      ],
      nodes: [
        { label: '背景与问题', detail: '事实与假设分开写' },
        { label: '目标与指标', detail: '怎样算有效' },
        { label: '范围与非目标', detail: '这次不做的也写清' },
        { label: '验收标准', detail: '可测试的完成条件' },
      ],
      caption: 'PRD 对齐判断，不必先写死技术实现。',
    },
    confusions: [
      {
        term: 'Roadmap',
        distinction: 'Roadmap 讲时间与优先级排序；PRD 讲某一需求的问题、范围与验收。',
      },
      {
        term: '技术方案',
        distinction: '技术方案讲怎么实现；PRD 讲做什么、为何做、做到什么算完。',
      },
    ],
    sections: [
      {
        label: '是什么',
        content: '对齐「问题—目标—范围—验收」的合同式文档，服务跨角色协作。',
      },
      {
        label: '岗位要会的判断',
        content: '别人不追问能否开工？非目标是否写清？成功标准是否可观测？',
      },
      {
        label: '面试怎么答',
        content: '先给工作定义，再举一个含非目标与验收的短例子。',
      },
    ],
  };

  const GLOSSARY_VISUAL_FEWSHOTS = [
    {
      term: 'MVP',
      visual: {
        kind: 'compare',
        title: '完整产品与最小验证版本的差别',
        columns: ['完整产品', 'MVP'],
        nodes: [
          { group: '完整产品', label: '覆盖主要场景', detail: '功能完整，面向规模化使用' },
          { group: '完整产品', label: '持续运营', detail: '兼顾体验、成本与稳定性' },
          { group: 'MVP', label: '只验证最大风险', detail: '保留能检验核心假设的最小功能' },
          { group: 'MVP', label: '快速拿证据', detail: '用真实行为决定继续、调整或停止' },
        ],
        caption: 'MVP 最小的是验证范围，不是质量底线。',
      },
    },
    {
      term: '状态',
      visual: {
        kind: 'states',
        title: '一次保存怎样经过四种状态',
        nodes: [
          { badge: '默认', label: '等待输入', detail: '页面尚未发生变化' },
          { badge: '保存中', label: '请求已发出', detail: '按钮禁用，避免重复提交' },
          { badge: '成功', label: '数据已持久化', detail: '展示明确成功反馈' },
          { badge: '失败', label: '保留用户输入', detail: '说明原因并允许重试' },
        ],
      },
    },
    {
      term: 'Web 技术栈',
      visual: {
        kind: 'layers',
        title: '一次页面请求经过哪些层',
        nodes: [
          { label: '界面层', detail: '用户看到并操作的页面' },
          { label: '应用层', detail: '校验输入并组织业务逻辑' },
          { label: '服务层', detail: '处理 API 与权限' },
          { label: '数据层', detail: '持久化与读取数据' },
        ],
      },
    },
  ];

  // ─── ③ 术语：从知识库抽词 → 分批精写（补充日课，禁止另起炉灶） ───

  /** 压缩知识库供术语策展：标题 / 加粗 / 摘录 */
  function summarizeHubForGlossary(pack) {
    const plan = pack?.plan || [];
    const chapters = pack?.hub?.chapters || {};
    const rows = [];
    Object.entries(chapters).forEach(([slug, md]) => {
      const text = String(md || '');
      if (text.length < 80) return;
      const day = dayNumberFromChapter({ slug }, plan);
      const topic =
        (plan.find((d) => Number(d.day) === day) || {}).topic ||
        slug.split('/').pop() ||
        '';
      const headings = [...text.matchAll(/^#{2,3}\s+(.+)$/gm)]
        .map((m) => String(m[1] || '').replace(/[*`]/g, '').trim())
        .filter((h) => h && h.length <= 40)
        .slice(0, 8);
      const bolds = [...text.matchAll(/\*\*([^*【\n]{2,28})\*\*/g)]
        .map((m) => String(m[1] || '').trim())
        .filter((t) => t && !/^(Day|步骤|注意|禁止)/i.test(t))
        .slice(0, 14);
      const tableCells = [...text.matchAll(/\|\s*([^|\n]{2,24})\s*\|/g)]
        .map((m) => String(m[1] || '').trim())
        .filter((t) => t && !/^[-:]+$/.test(t) && !/定义|概念|名称/.test(t))
        .slice(0, 10);
      rows.push({
        day,
        topic: String(topic).slice(0, 48),
        slug,
        headings,
        candidates: [...new Set([...bolds, ...tableCells])].slice(0, 16),
        excerpt: text
          .replace(/```[\s\S]*?```/g, ' ')
          .replace(/[#>*`|_]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 420),
      });
    });
    return rows.sort((a, b) => (a.day || 0) - (b.day || 0));
  }

  function hubBlobText(pack) {
    return Object.values(pack?.hub?.chapters || {})
      .map((md) => String(md || ''))
      .join('\n');
  }

  /** 术语词头必须是可复用的名词/方法名，不能是标题、任务句或正文碎片。 */
  function isGlossaryTermCandidate(value) {
    const term = String(value || '')
      .replace(/^[#>*\s\d.)、-]+/, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (term.length < 2 || term.length > 20) return false;
    if (/[。！？!?；;：:]/.test(term)) return false;
    if (
      /^(一句话摘要|今天学什么|关联学习天数|核心概念|常见误区|提取练习|今日完成清单|速查条|例题精讲)$/.test(
        term
      )
    ) {
      return false;
    }
    if (/^(为什么|怎么|如何|能否|是否)/.test(term)) {
      return false;
    }
    if (/^(写出|列出|完成|品鉴|记录)(一个|一份|你的|本次|当前|今日|至少|三条|两个)?/.test(term)) {
      return false;
    }
    if (/(视角|的意义|为什么不能|怎么做|该怎么|不能套用|并记录|三连)/.test(term)) {
      return false;
    }
    return true;
  }

  function glossaryHubHitRate(glossary, pack) {
    const hub = hubBlobText(pack);
    const terms = (glossary || [])
      .filter((g) => g?.sourceType !== 'custom')
      .map((g) => String(g?.term || '').trim())
      .filter(Boolean);
    if (!terms.length || !hub) return 0;
    const hit = terms.filter((t) => hub.includes(t)).length;
    return hit / terms.length;
  }

  /** 为术语批找到知识库中的出处摘录 */
  function hubExcerptsForTerms(pack, termBatch) {
    const rows = summarizeHubForGlossary(pack);
    return (termBatch || []).map((t) => {
      const term = String(t.term || t || '').trim();
      const hits = [];
      for (const row of rows) {
        if (!term) break;
        if (
          (row.excerpt && row.excerpt.includes(term)) ||
          (row.candidates || []).some((c) => c.includes(term) || term.includes(c)) ||
          String(row.topic || '').includes(term)
        ) {
          hits.push({
            day: row.day,
            topic: row.topic,
            excerpt: row.excerpt.slice(0, 280),
          });
        }
        if (hits.length >= 2) break;
      }
      return { term, sources: hits };
    });
  }

  async function inventGlossaryTermListFromHub(meta, outline, pack) {
    const { role } = roleLens(meta);
    const corpus = summarizeHubForGlossary(pack).slice(0, 32);
    const system = `你是「${meta.industry}」术语策展人（面向 ${role}）。
${GLOSSARY_FROM_HUB_CONTRACT}
${DEPTH_CONTRACT}
硬性规则：只输出一个 JSON 对象。`;
    const user = `## 学习者
${metaBrief(meta)}

## 日课摘要（日课正文已写完；术语必须服务这些内容）
${JSON.stringify(corpus).slice(0, 14000)}

## 大纲阶段（仅作覆盖检查）
${JSON.stringify({
      phases: outline?.phases,
      weekThemes: (outline?.weekThemes || []).slice(0, 8),
    }).slice(0, 1800)}

## Task
{
  "terms": [
    {"term":"术语（尽量与正文用词一致）","module":"行业|技术|方法|商业|面试","why":"日课哪一天/为何需要补充解释","sourceDay":1,"confusableWith":"易混词或空"}
  ]
}
要求：
- 16-22 个词；优先从 candidates / headings / excerpt 已出现的概念中选
- 每个 term 必须能在日课正文中找到原词或明显同义写法；禁止日课未覆盖的空降黑话
- 覆盖不同阶段的日课；少用万能词（沟通/学习能力）
- why 写清「补充日课哪一点」（定义边界 / 易混 / 面试口述）`;
    return chatJson({
      system,
      user,
      temperature: 0.2,
      max_tokens: 3200,
      stage: 'glossary.candidates-hub',
      jsonMode: true,
    });
  }

  async function inventGlossaryTermList(meta, outline, pack) {
    if (pack?.hub?.chapters && Object.keys(pack.hub.chapters).length >= 3) {
      return inventGlossaryTermListFromHub(meta, outline, pack);
    }
    // 无知识库时的退化路径（补生成/旧调用）：仍可从大纲列词，但提示弱于 hub-first
    const { role } = roleLens(meta);
    const system = `你是「${meta.industry}」领域术语策展人（面向 ${role}）。
参考：闪卡应「一词一义、短定义」（检索练习研究）。先列清单，不写长文。
注意：正式流程应先有日课再抽术语；此处为无 hub 时的降级。
${DEPTH_CONTRACT}
硬性规则：只输出一个 JSON 对象。`;
    const user = `## 学习者
${metaBrief(meta)}

## 大纲与锚点
${JSON.stringify({
      phases: outline?.phases,
      weekThemes: (outline?.weekThemes || []).slice(0, 12),
      domainAnchors: outline?.outcomes?.domainAnchors || [],
      misconceptions: outline?.outcomes?.misconceptions || [],
      planTopics: (pack?.plan || []).slice(0, 30).map((d) => ({ day: d.day, topic: d.topic })),
    }).slice(0, 5000)}

## Task
{
  "terms": [
    {"term":"术语","module":"行业|技术|方法|商业|面试","why":"为何必须会","confusableWith":"易混词或空"}
  ]
}
要求：16-22 个词；优先课表 topic 中的概念；少用万能词。`;
    return chatJson({
      system,
      user,
      temperature: 0.25,
      max_tokens: 2800,
      stage: 'glossary.candidates-outline',
      jsonMode: true,
    });
  }

  /**
   * 阶段 A：只生成释义核心，不要求可视化。
   * retryContext 只回灌本批失败字段，让模型集中修复而非重写无关内容。
   */
  async function expandGlossaryCoreBatch(
    meta,
    outline,
    termBatch,
    pack,
    retryContext = [],
    generationOptions = {}
  ) {
    const { role, judgmentLabel } = roleLens(meta);
    const glossaryFewshot = {
      ...GLOSSARY_FEWSHOT,
      sections: GLOSSARY_FEWSHOT.sections.map((s) =>
        s.label === 'PM 要会的判断' || s.label === '岗位要会的判断'
          ? { ...s, label: judgmentLabel }
          : s
      ),
    };
    const termQueries = (termBatch || [])
      .slice(0, 2)
      .map((t) => `${meta.industry} ${t.term || t} 定义 含义 区别`);
    const searchHits = !retryContext.length && hasSearchKey()
      ? await searchMany(termQueries, { count: 5, maxQueries: 2 })
      : [];
    const hubSources = pack?.hub?.chapters ? hubExcerptsForTerms(pack, termBatch) : [];

    const customMode = generationOptions.sourceType === 'custom';
    const system = `你是术语教学设计师与「${meta.industry}」资深「${role}」教练。
本阶段只负责释义核心：定义、真实问法、完整例子、易混边界、学习说明。
不要生成 visual；减轻任务负担，确保每个核心字段准确。
${customMode ? '这是用户主动查询的自定义术语；允许正文尚未出现，但解释必须结合当前行业与岗位。' : GLOSSARY_FROM_HUB_CONTRACT}
${DEPTH_CONTRACT}
若有 search_results：定义须与资料方向一致，禁止编造搜索未支持的精确数据/年份。
输出契约：仅输出一个合法 JSON 对象。`;
    const user = `## Audience
岗位：${role}｜行业：${meta.industry}｜目标：${meta.goal || '入门'}

## 本批要写的词（不得增删词头；term 尽量与日课一致；本批最多 2 个）
${JSON.stringify(termBatch)}

## 日课出处（优先据此补充，而不是另起定义）
${JSON.stringify(hubSources).slice(0, 6000)}

## search_results
${formatSearchBlock(searchHits, 12)}

## 释义质量示例（只模仿文本深度，忽略其中 visual）
${JSON.stringify({
  glossary: [glossaryFewshot, GLOSSARY_FEWSHOT_SCENARIO].map(
    ({ visual, ...entry }) => entry
  ),
})}

${retryContext.length ? `## 上轮未通过项（只修这些字段）\n${JSON.stringify(retryContext)}` : ''}

## Output schema
{"glossary":[{"term":"","aliases":[],"module":"","definition":"","userPhrases":["真实口语"],"example":"含对象+动作+结果的完整例子","confusions":[{"term":"易混词","distinction":"本词是…；对方是…"}],"sections":[{"label":"是什么","content":""},{"label":"别这样叫","content":""},{"label":"${judgmentLabel}","content":""},{"label":"面试怎么答","content":""}]}]}

## Constraints（违反任一条=不合格）
- definition 20–70 字：说清是什么/解决什么；禁止「××的工作定义」「××是××相关概念」循环空话
- userPhrases：1–2 句真实困惑/任务/误表述；禁止「我在日课里遇到××」
- example：必须有具体对象、动作、可观察结果；禁止只复述 definition
- confusions：至少 1 条真正相近的词，distinction 写双边边界
- sections 至少含：是什么、${judgmentLabel}、面试怎么答
- 禁止写「PM 视角」标签（除非岗位是产品经理）
- 若有日课出处：补充边界/易混/例子，不要整章粘贴`;
    const data = await chatJson({
      system,
      user,
      temperature: 0.16,
      max_tokens: 3000,
      stage: 'glossary.core',
      jsonMode: true,
    });
    return normalizeGlossary(data.glossary || data, meta);
  }

  /**
   * 阶段 B：核心释义验收后，单独为它生成可视化。
   */
  async function expandGlossaryVisualBatch(meta, coreBatch, pack, retryContext = []) {
    const hubSources = pack?.hub?.chapters ? hubExcerptsForTerms(pack, coreBatch) : [];
    const visualInputs = coreBatch.map((entry) => ({
      term: entry.term,
      definition: entry.definition,
      example: entry.example,
      confusions: entry.confusions,
      visualKindHint: entry.visualKindHint,
    }));
    const system = `你是信息可视化教学设计师。
本阶段只负责 visual，不改术语、定义、例子和易混边界。
${GLOSSARY_VISUAL_KINDS}
输出契约：仅输出一个合法 JSON 对象。`;
    const user = `## 本批要配图的词条（最多 2 个）
${JSON.stringify(visualInputs)}

## 日课出处
${JSON.stringify(hubSources).slice(0, 5000)}

## 布局示例（只学字段结构）
${JSON.stringify(GLOSSARY_VISUAL_FEWSHOTS)}

${retryContext.length ? `## 上轮配图未通过项（只修这些问题）\n${JSON.stringify(retryContext)}` : ''}

## Output schema
{"visuals":[{"term":"","visual":{"kind":"flow|loop|anatomy|roles|scenario|compare|states|layers|tree|timeline|matrix","title":"","columns":[],"nodes":[{"label":"","detail":"","actor":"","badge":"","group":"","parent":""}],"facts":[{"label":"","value":""}],"quote":"","caption":""}}]}

要求：
- term 必须原样返回；每词只返回 visual
- 优先采用 visualKindHint；同批尽量不同 kind
- 图必须专属于本词，节点中明确出现本词的对象/步骤/边界
- nodes 2–6 个；flow/anatomy/layers/loop 最稳妥
- roles 每个节点必须有 actor；states 每个节点必须有 badge
- compare/matrix 至少两个 group，且每个节点都要有 group
- 禁止通用「识别术语→判断边界→形成行动」四格`;
    const data = await chatJson({
      system,
      user,
      temperature: 0.14,
      max_tokens: 2600,
      stage: 'glossary.visual',
      jsonMode: true,
    });
    const rows = Array.isArray(data?.visuals) ? data.visuals : [];
    return rows
      .map((row) => {
        const core = coreBatch.find(
          (entry) => String(entry.term).toLowerCase() === String(row?.term || '').toLowerCase()
        );
        if (!core) return null;
        return normalizeGlossary([{ ...core, visual: row.visual }], meta)[0] || null;
      })
      .filter(Boolean);
  }

  function isGenericGlossaryVisual(visual, term) {
    const blob = [
      visual?.title,
      ...(visual?.steps || []),
      ...(visual?.nodes || []).flatMap((n) => [n.label, n.detail]),
    ]
      .join(' ')
      .toLowerCase();
    const generic =
      /日课场景|识别「|识别术语|判断适用边界|形成可验证行动|从概念到行动|从问题到判断/.test(
        blob
      );
    const mentionsTerm = String(term || '').length >= 2 && blob.includes(String(term).toLowerCase());
    // 通用四格且几乎不提本词 → 不合格
    return generic && !mentionsTerm;
  }

  function isCircularGlossaryDefinition(term, definition) {
    const d = String(definition || '').trim();
    const t = String(term || '').trim();
    if (d.length < 18) return true;
    if (/的工作定义|的基本定义|相关概念总称|需建立可口述/.test(d)) return true;
    if (/日常工作中.+指需要单独建立判断标准与使用边界的关键概念/.test(d)) return true;
    if (t && new RegExp(`^${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(是|指的是)?$`).test(d)) {
      return true;
    }
    // 「在「行业」语境下，岗位的职责边界与核心产出的工作定义」类 stub
    if (/语境下.{0,12}(职责边界|核心产出).{0,8}工作定义/.test(d)) return true;
    if (/日课中出现的「/.test(d) && /使用边界/.test(d)) return true;
    return false;
  }

  function isTemplateUserPhrase(phrase) {
    const p = String(phrase || '');
    return /我在日课里(遇到|看到)/.test(p) || /实际工作中该怎么(判断和使用|理解和使用)/.test(p);
  }

  function glossaryCoreIssues(entry) {
    const issues = [];
    if (!entry?.term || !isGlossaryTermCandidate(entry.term)) issues.push('term 不是合法术语词头');
    if (!entry?.definition || isCircularGlossaryDefinition(entry.term, entry.definition)) {
      issues.push('definition 过短、循环或模板化');
    }
    const phrase = (entry.userPhrases || [])[0] || '';
    if (!phrase || isTemplateUserPhrase(phrase)) issues.push('userPhrases 缺失或过于模板化');
    const example = String(entry.example || '').trim();
    const definition = String(entry.definition || '');
    if (example.length < 24) issues.push('example 少于 24 字或不完整');
    if (example === definition || (definition && example.includes(definition.slice(0, 20)))) {
      // 允许部分重叠，但例子不能几乎等于定义
      if (example.length < definition.length + 12) {
        issues.push('example 主要在复述 definition');
      }
    }
    if (!Array.isArray(entry.confusions) || entry.confusions.length < 1) {
      issues.push('confusions 缺失');
    }
    if (
      (entry.confusions || []).some(
        (item) =>
          !String(item?.term || '').trim() ||
          String(item?.distinction || '').trim().length < 8
      )
    ) {
      issues.push('confusions 的词头或双边区别不完整');
    }
    return issues;
  }

  function glossaryVisualIssues(entry) {
    const issues = [];
    const visual = entry.visual;
    if (!visual) return ['visual 缺失'];
    const allowedKinds = [
      'flow',
      'loop',
      'anatomy',
      'roles',
      'scenario',
      'compare',
      'states',
      'layers',
      'tree',
      'timeline',
      'matrix',
    ];
    if (!allowedKinds.includes(visual.kind)) issues.push('visual.kind 不受支持');
    const nodeCount = (visual.nodes || []).length || (visual.steps || []).length;
    if (nodeCount < 2 && !(visual.facts || []).length) issues.push('visual 至少需要 2 个节点');
    if (visual.kind === 'roles' && (visual.nodes || []).some((node) => !node.actor)) {
      issues.push('roles 的每个节点都需要 actor');
    }
    if (visual.kind === 'states' && (visual.nodes || []).some((node) => !node.badge)) {
      issues.push('states 的每个节点都需要 badge');
    }
    if (visual.kind === 'compare' || visual.kind === 'matrix') {
      const groups = new Set((visual.nodes || []).map((node) => node.group).filter(Boolean));
      if (groups.size < 2) issues.push('compare/matrix 至少需要两个 group');
    }
    if (isGenericGlossaryVisual(visual, entry.term)) issues.push('visual 是可套用到任意词的通用模板');
    return issues;
  }

  function passesGlossaryCoreQuality(entry) {
    return glossaryCoreIssues(entry).length === 0;
  }

  /** 最终语义质量门禁：核心释义与可视化均通过才可入库 */
  function passesGlossaryQuality(entry) {
    return passesGlossaryCoreQuality(entry) && glossaryVisualIssues(entry).length === 0;
  }

  function glossaryQualityStats(glossary, options = {}) {
    const all = Array.isArray(glossary) ? glossary : [];
    const list = options.coreOnly
      ? all.filter((entry) => !entry?.sourceType || entry.sourceType === 'core')
      : all;
    const pass = list.filter(passesGlossaryQuality);
    const kinds = new Set(
      pass.map((g) => g.visual?.kind).filter(Boolean)
    );
    return {
      total: list.length,
      passCount: pass.length,
      failCount: list.length - pass.length,
      enoughCount: pass.length >= 8,
      kindCount: kinds.size,
      kinds: [...kinds],
      passRate: list.length ? pass.length / list.length : 0,
    };
  }

  function glossaryQualityError(stats = {}, cause) {
    const error = new Error('术语库尚未达到可用标准，请查看失败原因后重新生成问题部分');
    error.code = 'GLOSSARY_QUALITY';
    error.quality = {
      passCount: Number(stats.passCount) || 0,
      kindCount: Number(stats.kindCount) || 0,
    };
    if (cause) error.cause = cause;
    return error;
  }

  function isGlossaryQualityError(error) {
    return error?.code === 'GLOSSARY_QUALITY';
  }

  function rethrowGlossaryOperationalError(error) {
    rethrowOperationalError(error);
    if (error?.code === 'TOOL_NOT_ALLOWED' || error?.code === 'CAPABILITY') throw error;
  }

  /** 合并模型选词与正文候选，确保模型选词失败时仍有可靠词头可精写。 */
  function glossaryCandidates(rawTerms, pack, limit = 22) {
    const hub = hubBlobText(pack);
    const planBlob = JSON.stringify(pack?.plan || []);
    const list = [];
    const seen = new Set();
    const add = (value, fallback = {}) => {
      const source = value && typeof value === 'object' ? value : { term: value };
      const term = String(source.term || '').trim();
      const key = term.toLowerCase();
      if (!isGlossaryTermCandidate(term) || seen.has(key)) return;
      const stem = term.replace(/(模型|指标|评分|方法|框架|体系)$/u, '');
      const anchored =
        !hub ||
        hub.includes(term) ||
        (stem.length >= 2 && hub.includes(stem)) ||
        planBlob.includes(term) ||
        planBlob.includes(stem);
      if (!anchored) return;
      seen.add(key);
      list.push({ ...fallback, ...source, term });
    };

    (Array.isArray(rawTerms) ? rawTerms : []).forEach((term) => add(term));
    for (const row of summarizeHubForGlossary(pack)) {
      for (const term of [...(row.candidates || []), ...(row.headings || []), row.topic]) {
        add(term, {
          module: '方法',
          why: `Day ${row.day || '?'} 正文中的关键概念，需要补充定义、边界与易混对比`,
          sourceDay: row.day || 1,
        });
        if (list.length >= limit) return list;
      }
    }
    (pack?.plan || []).forEach((day) =>
      add(day?.topic, {
        module: '方法',
        why: `Day ${day?.day || '?'} 的学习主题，需要补充定义、边界与易混对比`,
        sourceDay: day?.day || 1,
      })
    );
    return list.slice(0, limit);
  }

  async function generateGlossary(meta, outline, onProgress, pack, options = {}) {
    let listObj = null;
    let listFailure = null;
    if (!Array.isArray(options.terms)) {
      try {
        listObj = await inventGlossaryTermList(meta, outline, pack);
      } catch (error) {
        rethrowAbort(error);
        listFailure = error;
        console.warn('[PackGenerator] glossary term curation failed; using hub candidates', error);
      }
    }

    const targetCount = Math.max(1, Number(options.targetCount) || 8);
    const requiredKinds = Math.max(
      1,
      Number(options.requiredKinds) || (targetCount > 1 ? 2 : 1)
    );
    const sourceType = ['core', 'day', 'custom'].includes(options.sourceType)
      ? options.sourceType
      : 'core';
    const sourceDays = Array.isArray(options.sourceDays)
      ? [...new Set(options.sourceDays.map(Number).filter((day) => Number.isInteger(day) && day > 0))]
      : [];
    const createdAt = new Date().toISOString();
    const kindCycle = ['flow', 'anatomy', 'compare', 'loop', 'roles', 'states', 'layers', 'tree'];
    const rawTerms = Array.isArray(options.terms)
      ? options.terms
          .map((value) => (value && typeof value === 'object' ? value : { term: value }))
          .filter((item) => isGlossaryTermCandidate(item.term))
      : glossaryCandidates(listObj?.terms, pack);
    const terms = rawTerms.map((term, index) => ({
      ...term,
      sourceType,
      sourceDays: sourceDays.length
        ? sourceDays
        : Array.isArray(term.sourceDays) && term.sourceDays.length
          ? [...new Set(term.sourceDays.map(Number).filter((day) => Number.isInteger(day) && day > 0))]
        : Number(term.sourceDay) > 0
          ? [Number(term.sourceDay)]
          : [],
      createdAt,
      visualKindHint: kindCycle[index % kindCycle.length],
    }));
    if (!terms.length) throw glossaryQualityError({}, listFailure);
    const decorateEntry = (entry, candidates) => {
      const source = candidates.find(
        (term) => String(term.term).toLowerCase() === String(entry.term).toLowerCase()
      );
      return source
        ? {
            ...entry,
            visualKindHint: source.visualKindHint,
            sourceType: source.sourceType,
            sourceDays: source.sourceDays,
            createdAt: source.createdAt,
          }
        : entry;
    };
    const finalize = (entries) => {
      const passed = entries.filter(passesGlossaryQuality);
      return options.incremental
        ? passed.slice(0, targetCount)
        : ensureGlossary(meta, outline, passed, pack);
    };

    // 阶段 A：先把定义、例子、易混边界做扎实；多准备少量候选，给配图阶段留余量。
    const acceptedCore = new Map();
    (Array.isArray(options.seedCoreEntries) ? options.seedCoreEntries : []).forEach((entry) => {
      const key = String(entry?.term || '').toLowerCase();
      if (key && passesGlossaryCoreQuality(entry)) acceptedCore.set(key, entry);
    });
    const coreTarget = Math.min(Math.max(targetCount, targetCount + 2), terms.length);
    const maxCoreRounds = 2;
    for (let round = 1; round <= maxCoreRounds; round++) {
      const pending = terms
        .filter((term) => !acceptedCore.has(String(term.term || '').toLowerCase()));
      const batchSize = 2;
      for (let i = 0; i < pending.length; i += batchSize) {
        throwIfAborted();
        if (acceptedCore.size >= coreTarget) break;
        const batch = pending.slice(i, i + batchSize);
        if (onProgress) {
          onProgress(
            `③ 完善术语释义（第 ${round} 轮，已完成 ${acceptedCore.size} 条）…`
          );
        }
        let part = [];
        try {
          part = await expandGlossaryCoreBatch(meta, outline, batch, pack, [], {
            sourceType,
          });
        } catch (e) {
          rethrowAbort(e);
          rethrowGlossaryOperationalError(e);
          console.warn('[PackGenerator] glossary core batch failed', round, i / batchSize, e);
          part = [];
        }

        part = part.map((entry) => decorateEntry(entry, batch));
        const needRetry = batch.filter((t) => {
          const term = String(t.term || t || '').trim();
          return term && !part.some((g) => g.term === term && passesGlossaryCoreQuality(g));
        });
        if (needRetry.length) {
          const retryContext = needRetry.map((term) => {
            const previous = part.find((entry) => entry.term === term.term);
            return {
              term: term.term,
              issues: previous ? glossaryCoreIssues(previous) : ['该词条未返回'],
              previous: previous || undefined,
            };
          });
          try {
            const retry = await expandGlossaryCoreBatch(
              meta,
              outline,
              needRetry,
              pack,
              retryContext,
              { sourceType }
            );
            const retryTerms = new Set(retry.map((entry) => String(entry.term).toLowerCase()));
            part = [
              ...part.filter((entry) => !retryTerms.has(String(entry.term).toLowerCase())),
              ...retry.map((entry) => decorateEntry(entry, needRetry)),
            ];
          } catch (e) {
            rethrowAbort(e);
            rethrowGlossaryOperationalError(e);
            console.warn('[PackGenerator] glossary core retry failed', round, i / batchSize, e);
          }
        }
        for (const g of part) {
          const key = String(g.term || '').toLowerCase();
          if (!key || acceptedCore.has(key)) continue;
          if (!passesGlossaryCoreQuality(g)) continue;
          acceptedCore.set(key, g);
        }
        if (typeof options.onCoreCheckpoint === 'function') {
          await options.onCoreCheckpoint([...acceptedCore.values()]);
        }
      }
      if (acceptedCore.size >= coreTarget) break;
    }
    if (acceptedCore.size < targetCount) {
      throw glossaryQualityError({ passCount: acceptedCore.size, kindCount: 0 }, listFailure);
    }

    // 阶段 B：只为已验收的核心词条配图，失败时按具体视觉字段定点修复。
    const corePool = [...acceptedCore.values()];
    const accepted = new Map();
    (Array.isArray(options.seedAcceptedEntries) ? options.seedAcceptedEntries : []).forEach(
      (entry) => {
        const key = String(entry?.term || '').toLowerCase();
        if (key && passesGlossaryQuality(entry)) accepted.set(key, entry);
      }
    );
    const maxVisualRounds = 2;
    for (let round = 1; round <= maxVisualRounds; round++) {
      const pending = corePool.filter(
        (entry) => !accepted.has(String(entry.term || '').toLowerCase())
      );
      for (let i = 0; i < pending.length; i += 2) {
        throwIfAborted();
        const currentStats = glossaryQualityStats([...accepted.values()]);
        if (currentStats.passCount >= targetCount && currentStats.kindCount >= requiredKinds) {
          return finalize([...accepted.values()]);
        }
        const batch = pending.slice(i, i + 2);
        if (onProgress) {
          onProgress(
            `③ 绘制术语示意图（第 ${round} 轮，已完成 ${currentStats.passCount} 条）…`
          );
        }
        let part = [];
        try {
          part = await expandGlossaryVisualBatch(meta, batch, pack);
        } catch (e) {
          rethrowAbort(e);
          rethrowGlossaryOperationalError(e);
          console.warn('[PackGenerator] glossary visual batch failed', round, i / 2, e);
        }
        const needRetry = batch.filter((core) => {
          const entry = part.find((item) => item.term === core.term);
          return !entry || glossaryVisualIssues(entry).length > 0;
        });
        if (needRetry.length) {
          const retryContext = needRetry.map((core) => {
            const previous = part.find((entry) => entry.term === core.term);
            return {
              term: core.term,
              issues: previous ? glossaryVisualIssues(previous) : ['visual 未返回'],
              previousVisual: previous?.visual || undefined,
            };
          });
          try {
            const retry = await expandGlossaryVisualBatch(
              meta,
              needRetry,
              pack,
              retryContext
            );
            const retryTerms = new Set(retry.map((entry) => String(entry.term).toLowerCase()));
            part = [
              ...part.filter((entry) => !retryTerms.has(String(entry.term).toLowerCase())),
              ...retry,
            ];
          } catch (e) {
            rethrowAbort(e);
            rethrowGlossaryOperationalError(e);
            console.warn('[PackGenerator] glossary visual retry failed', round, i / 2, e);
          }
        }
        for (const entry of part) {
          const key = String(entry.term || '').toLowerCase();
          if (!key || accepted.has(key) || !passesGlossaryQuality(entry)) continue;
          accepted.set(key, entry);
        }
        if (typeof options.onCheckpoint === 'function') {
          await options.onCheckpoint([...accepted.values()]);
        }
      }

      const stats = glossaryQualityStats([...accepted.values()]);
      if (stats.passCount >= targetCount && stats.kindCount >= requiredKinds) {
        return finalize([...accepted.values()]);
      }
      // 数量够但种类单一时，下一轮只重画一条，并明确切换到另一种稳妥布局。
      if (
        round < maxVisualRounds &&
        stats.passCount >= targetCount &&
        stats.kindCount < requiredKinds
      ) {
        const [key, entry] = accepted.entries().next().value || [];
        const core = corePool.find((item) => String(item.term).toLowerCase() === key);
        if (key && core) {
          core.visualKindHint = entry.visual?.kind === 'flow' ? 'anatomy' : 'flow';
          accepted.delete(key);
        }
      }
    }
    throw glossaryQualityError(glossaryQualityStats([...accepted.values()]), listFailure);
  }

  function ensureGlossary(meta, outline, glossary, pack) {
    let list = Array.isArray(glossary) ? glossary.slice() : [];
    if (pack?.hub?.chapters) {
      const hub = hubBlobText(pack);
      const planBlob = JSON.stringify(pack.plan || []);
      list = list.filter((g) => {
        const term = String(g.term || '').trim();
        if (!isGlossaryTermCandidate(term)) return false;
        if (hub.includes(term)) return true;
        const stem = term.replace(/(模型|指标|评分|方法|框架|体系)$/u, '');
        return (
          (stem.length >= 2 && hub.includes(stem)) ||
          planBlob.includes(term) ||
          planBlob.includes(stem)
        );
      });
    }
    // 只保留过质量门的词条
    list = list.filter(passesGlossaryQuality);
    // Spec：不足 8 条时也不得用通用 stub 伪装成正式词条；交给质量门触发重生。
    return list.slice(0, 14);
  }

  function normalizeGlossary(raw, meta = {}) {
    const { role, judgmentLabel } = roleLens(meta);
    const arr = Array.isArray(raw) ? raw : [];
    return arr
      .map((g) => {
        const term = String(g.term || '').trim();
        const definition = String(g.definition || g.def || '').trim();
        if (!term || !definition) return null;
        let sections = Array.isArray(g.sections)
          ? g.sections
              .map((s) => ({
                label: rewriteRoleLensInText(String(s.label || '').trim(), meta),
                content: rewriteRoleLensInText(String(s.content || '').trim(), meta),
              }))
              .filter((s) => s.label && s.content)
          : [];
        const avoidList = Array.isArray(g.avoid)
          ? g.avoid.map(String).map((s) => s.trim()).filter(Boolean)
          : Array.isArray(g.avoidAliases)
            ? g.avoidAliases.map(String).map((s) => s.trim()).filter(Boolean)
            : [];
        if (avoidList.length && !sections.some((s) => /别这样叫|避用|Avoid/i.test(s.label))) {
          sections.push({
            label: '别这样叫',
            content: `避免用：${avoidList.slice(0, 6).join('、')}（与本词条工作定义不等价）。`,
          });
        }
        if (!sections.length) {
          sections = [{ label: '是什么', content: definition }];
        }
        if (!sections.some((s) => /要会的判断|视角|取舍|边界/.test(s.label))) {
          sections.push({
            label: judgmentLabel,
            content: `从「${role}」视角：能用一句话说清它解决什么问题；能判断何时该用、何时不用。`,
          });
        }
        if (!sections.some((s) => s.label.includes('面试'))) {
          sections.push({
            label: '面试怎么答',
            content: `先给工作定义：${definition}。再补 1 个具体例子说明你理解过。`,
          });
        }
        const userPhrases = Array.isArray(g.userPhrases)
          ? g.userPhrases
              .map((item) => rewriteRoleLensInText(String(item || '').trim(), meta))
              .filter(Boolean)
              .slice(0, 3)
          : [];
        const example = rewriteRoleLensInText(String(g.example || '').trim(), meta);
        const confusions = Array.isArray(g.confusions)
          ? g.confusions
              .map((item) => ({
                term: String(item?.term || '').trim(),
                distinction: rewriteRoleLensInText(String(item?.distinction || '').trim(), meta),
              }))
              .filter((item) => item.term && item.distinction && item.term !== term)
              .slice(0, 3)
          : [];

        const kindRaw = String(g.visual?.kind || '').trim().toLowerCase();
        const kind = [
          'flow',
          'loop',
          'anatomy',
          'roles',
          'scenario',
          'compare',
          'states',
          'layers',
          'tree',
          'timeline',
          'matrix',
        ].includes(kindRaw)
          ? kindRaw
          : '';
        let nodes = Array.isArray(g.visual?.nodes)
          ? g.visual.nodes
              .map((n) => ({
                label: rewriteRoleLensInText(String(n?.label || '').trim(), meta),
                detail: rewriteRoleLensInText(String(n?.detail || '').trim(), meta) || undefined,
                actor: String(n?.actor || '').trim() || undefined,
                badge: String(n?.badge || '').trim() || undefined,
                group: String(n?.group || '').trim() || undefined,
                parent: String(n?.parent || '').trim() || undefined,
              }))
              .filter((n) => n.label)
              .slice(0, 8)
          : [];
        const legacySteps = Array.isArray(g.visual?.steps)
          ? g.visual.steps
              .map((item) => rewriteRoleLensInText(String(item || '').trim(), meta))
              .filter(Boolean)
              .slice(0, 8)
          : [];
        if (!nodes.length && legacySteps.length >= 2) {
          nodes = legacySteps.map((label) => ({ label }));
        }
        const facts = Array.isArray(g.visual?.facts)
          ? g.visual.facts
              .map((f) => ({
                label: String(f?.label || '').trim(),
                value: String(f?.value || '').trim(),
              }))
              .filter((f) => f.label && f.value)
              .slice(0, 4)
          : [];
        const columns = Array.isArray(g.visual?.columns)
          ? g.visual.columns.map(String).map((item) => item.trim()).filter(Boolean).slice(0, 4)
          : [];
        const visual =
          nodes.length >= 2 || facts.length || g.visual?.quote
            ? {
                kind: kind || (facts.length || g.visual?.quote ? 'scenario' : 'flow'),
                title: String(g.visual?.title || '一眼看懂').trim().slice(0, 40),
                nodes: nodes.length ? nodes : undefined,
                steps: legacySteps.length >= 2 ? legacySteps : undefined,
                caption: rewriteRoleLensInText(String(g.visual?.caption || '').trim(), meta) || undefined,
                quote: rewriteRoleLensInText(String(g.visual?.quote || '').trim(), meta) || undefined,
                facts: facts.length ? facts : undefined,
                columns: columns.length ? columns : undefined,
              }
            : null;

        return {
          term,
          aliases: Array.isArray(g.aliases) ? g.aliases.map(String).filter(Boolean).slice(0, 4) : [],
          userPhrases,
          module: String(g.module || '核心').slice(0, 12),
          definition: definition.slice(0, 160),
          example: example.slice(0, 320),
          visual,
          confusions,
          sections: sections.slice(0, 7),
          sourceType: ['core', 'day', 'custom'].includes(g.sourceType)
            ? g.sourceType
            : undefined,
          sourceDays: Array.isArray(g.sourceDays)
            ? [...new Set(g.sourceDays.map(Number).filter((day) => Number.isInteger(day) && day > 0))]
            : Number(g.sourceDay) > 0
              ? [Number(g.sourceDay)]
              : undefined,
          createdAt: String(g.createdAt || '').trim() || undefined,
        };
      })
      .filter(Boolean);
  }

  function glossaryTermKey(value) {
    return String(value || '').trim().toLowerCase();
  }

  function mergeGlossaryEntries(existing, incoming) {
    const byTerm = new Map();
    (Array.isArray(existing) ? existing : []).forEach((entry) => {
      const key = glossaryTermKey(entry?.term);
      if (key) byTerm.set(key, entry);
    });
    (Array.isArray(incoming) ? incoming : []).forEach((entry) => {
      const key = glossaryTermKey(entry?.term);
      if (!key || !passesGlossaryQuality(entry)) return;
      const previous = byTerm.get(key);
      const sourceDays = [
        ...new Set([...(previous?.sourceDays || []), ...(entry.sourceDays || [])]),
      ].sort((a, b) => a - b);
      if (previous) {
        byTerm.set(key, {
          ...previous,
          sourceDays: sourceDays.length ? sourceDays : previous.sourceDays,
        });
      } else {
        byTerm.set(key, {
          ...entry,
          sourceType: entry.sourceType || 'core',
          sourceDays: sourceDays.length ? sourceDays : undefined,
        });
      }
    });
    return [...byTerm.values()];
  }

  function replaceCoreGlossary(existing, coreEntries) {
    const preserved = (Array.isArray(existing) ? existing : []).filter(
      (entry) => entry?.sourceType === 'day' || entry?.sourceType === 'custom'
    );
    return mergeGlossaryEntries(preserved, coreEntries);
  }

  async function inventGlossaryTermsForDay(meta, pack, day) {
    const rows = summarizeHubForGlossary(pack).filter((row) => Number(row.day) === Number(day));
    if (!rows.length) return [];
    const system = `你是「${meta.industry}」日课术语策展人。
只从指定日课里挑选值得单独解释、可复用的名词或方法名。
输出契约：仅输出一个合法 JSON 对象。`;
    const user = `## Day ${day} 日课
${JSON.stringify(rows).slice(0, 7000)}

## Task
{"terms":[{"term":"","module":"行业|技术|方法|商业|面试","why":"为何本课必须会","sourceDay":${Number(day)}}]}
要求：返回 6–8 个候选；禁止任务句、章节标题套话和正文中不存在的空降黑话。`;
    const data = await chatJson({
      system,
      user,
      temperature: 0.18,
      max_tokens: 1800,
      stage: 'glossary.day-candidates',
      jsonMode: true,
    });
    return Array.isArray(data?.terms) ? data.terms : [];
  }

  function glossaryCandidatesForDay(rawTerms, pack, day, limit = 8) {
    const rows = summarizeHubForGlossary(pack).filter((row) => Number(row.day) === Number(day));
    const list = [];
    const seen = new Set();
    const add = (value, fallback = {}) => {
      const source = value && typeof value === 'object' ? value : { term: value };
      const term = String(source.term || '').trim();
      const key = glossaryTermKey(term);
      if (!isGlossaryTermCandidate(term) || seen.has(key)) return;
      seen.add(key);
      list.push({
        ...fallback,
        ...source,
        term,
        sourceDay: Number(day),
      });
    };
    (Array.isArray(rawTerms) ? rawTerms : []).forEach((term) => add(term));
    rows.forEach((row) => {
      [...(row.candidates || []), ...(row.headings || []), row.topic].forEach((term) =>
        add(term, {
          module: '方法',
          why: `Day ${day} 日课中的关键概念，需要补充定义、边界与例子`,
        })
      );
    });
    return list.slice(0, limit);
  }

  function glossaryCandidatesForCourse(rawTerms, pack, limit = 14) {
    const existingKeys = new Set(
      (Array.isArray(pack?.glossary) ? pack.glossary : []).flatMap((entry) => [
        glossaryTermKey(entry?.term),
        ...(Array.isArray(entry?.aliases) ? entry.aliases.map(glossaryTermKey) : []),
      ])
    );
    const rows = summarizeHubForGlossary(pack);
    const base = glossaryCandidates(rawTerms, pack, limit + existingKeys.size + 8);
    return base
      .filter((candidate) => !existingKeys.has(glossaryTermKey(candidate?.term)))
      .map((candidate) => {
        const term = String(candidate.term || '').trim();
        const stem = term.replace(/(模型|指标|评分|方法|框架|体系)$/u, '');
        const sourceDays = new Set(
          [
            ...(Array.isArray(candidate.sourceDays) ? candidate.sourceDays : []),
            candidate.sourceDay,
          ]
            .map(Number)
            .filter((day) => Number.isInteger(day) && day > 0)
        );
        rows.forEach((row) => {
          if (
            String(row.excerpt || '').includes(term) ||
            (stem.length >= 2 && String(row.excerpt || '').includes(stem)) ||
            (row.candidates || []).some(
              (value) => String(value).includes(term) || term.includes(String(value))
            ) ||
            String(row.topic || '').includes(term)
          ) {
            if (Number(row.day) > 0) sourceDays.add(Number(row.day));
          }
        });
        return {
          ...candidate,
          sourceDay: [...sourceDays][0],
          sourceDays: [...sourceDays].sort((a, b) => a - b),
        };
      })
      .slice(0, limit);
  }

  async function inventGlossaryTermsForCourse(meta, pack) {
    const rows = summarizeHubForGlossary(pack);
    const existing = (pack.glossary || []).map((entry) => entry?.term).filter(Boolean);
    const system = `你是「${meta.industry}」整课术语策展人。
只从全部日课中挑选值得长期复用、但尚未进入术语库的名词、指标或方法名。
输出契约：仅输出一个合法 JSON 对象。`;
    const user = `## 全部日课摘要
${JSON.stringify(rows).slice(0, 22000)}

## 已有术语（禁止重复或改写后重复）
${JSON.stringify(existing).slice(0, 4000)}

## Task
{"terms":[{"term":"","module":"行业|技术|方法|商业|面试","why":"为何值得收录","sourceDay":1}]}
要求：筛选 10–16 个候选；必须能在日课中找到依据；排除已有术语、章节标题套话、任务句和只在单句中偶然出现的普通词。`;
    const data = await chatJson({
      system,
      user,
      temperature: 0.16,
      max_tokens: 2600,
      stage: 'glossary.course-candidates',
      jsonMode: true,
    });
    return Array.isArray(data?.terms) ? data.terms : [];
  }

  async function generateCourseGlossaryForPack(packId, onProgress = () => {}, opts = {}) {
    beginJob(opts.signal);
    let sessionOutcome = 'ok';
    let sessionStarted = false;
    try {
      const pack = ContentPack.load(packId);
      if (!pack) throw new Error('找不到当前路径');
      const rows = summarizeHubForGlossary(pack);
      if (!rows.length || rows.every((row) => !String(row.excerpt || '').trim())) {
        const error = new Error('日课正文尚未就绪，请先完成日课生成');
        error.code = 'DAY_LESSON_MISSING';
        throw error;
      }
      if (typeof PackHarness !== 'undefined') {
        PackHarness.beginSession({
          packId,
          industry: pack.meta?.industry,
          role: pack.meta?.role,
          days: pack.meta?.days,
        });
        sessionStarted = true;
        PackHarness.setRole('generator');
      }
      const meta = {
        title: pack.meta?.title,
        industry: pack.meta?.industry,
        role: pack.meta?.role,
        goal: pack.meta?.goal,
        days: pack.meta?.days || pack.plan?.length || 30,
        notes: pack.meta?.notes || '',
      };
      const outline = outlineFromPack(pack);
      const existingKeys = new Set((pack.glossary || []).map((entry) => glossaryTermKey(entry?.term)));
      onProgress(`扫描 ${rows.length} 篇日课…`, 10);
      let curated = [];
      try {
        curated = await inventGlossaryTermsForCourse(meta, pack);
      } catch (error) {
        rethrowAbort(error);
        rethrowGlossaryOperationalError(error);
        console.warn('[PackGenerator] course glossary curation failed; use local candidates', error);
      }
      onProgress('筛选尚未收录的关键术语…', 30);
      const terms = glossaryCandidatesForCourse(curated, pack, 14);
      const existingExcluded = curated.filter((item) =>
        existingKeys.has(glossaryTermKey(item?.term))
      ).length;
      pack.meta = pack.meta || {};
      pack.meta.generation = pack.meta.generation || {};
      if (!terms.length) {
        pack.meta.generation.lastCourseGlossaryRun = {
          status: 'completed',
          added: 0,
          skipped: existingExcluded,
          candidateCount: 0,
          at: new Date().toISOString(),
        };
        ContentPack.save(pack);
        onProgress('没有发现值得新增的术语', 100);
        return pack;
      }
      onProgress(`生成并校验 ${terms.length} 个候选术语…`, 45);
      const generated = await generateGlossary(
        meta,
        outline,
        (message) => onProgress(message, 70),
        pack,
        {
          terms,
          targetCount: Math.min(8, terms.length),
          requiredKinds: Math.min(2, terms.length),
          sourceType: 'day',
          incremental: true,
        }
      );
      const beforeKeys = new Set((pack.glossary || []).map((entry) => glossaryTermKey(entry?.term)));
      pack.glossary = mergeGlossaryEntries(pack.glossary, generated);
      const added = pack.glossary.filter(
        (entry) => !beforeKeys.has(glossaryTermKey(entry?.term))
      ).length;
      const skipped = existingExcluded + Math.max(0, terms.length - added);
      pack.meta.generation.lastCourseGlossaryRun = {
        status: 'completed',
        added,
        skipped,
        candidateCount: terms.length,
        at: new Date().toISOString(),
      };
      pack.meta.glossaryHubHitRate = Number(glossaryHubHitRate(pack.glossary, pack).toFixed(3));
      runPackQualityGate(pack, outline, { rewritePhases: false });
      pack.updatedAt = new Date().toISOString();
      ContentPack.save(pack);
      onProgress(`已新增 ${added} 条术语，跳过 ${skipped} 条`, 100);
      return pack;
    } catch (error) {
      sessionOutcome = isAbortError(error) ? 'cancelled' : 'failed';
      throw error;
    } finally {
      if (sessionStarted && typeof PackHarness !== 'undefined') {
        PackHarness.endSession(sessionOutcome);
      }
      endJob();
    }
  }

  async function generateGlossaryForDayPack(packId, day, onProgress = () => {}, opts = {}) {
    beginJob(opts.signal);
    let sessionOutcome = 'ok';
    let sessionStarted = false;
    try {
      const pack = ContentPack.load(packId);
      if (!pack) throw new Error('找不到当前路径');
      const targetDay = Number(day);
      const rows = summarizeHubForGlossary(pack).filter(
        (row) => Number(row.day) === targetDay
      );
      if (!rows.length || rows.every((row) => !String(row.excerpt || '').trim())) {
        const error = new Error('本课正文尚未就绪，请先完成日课生成');
        error.code = 'DAY_LESSON_MISSING';
        throw error;
      }
      if (typeof PackHarness !== 'undefined') {
        PackHarness.beginSession({
          packId,
          industry: pack.meta?.industry,
          role: pack.meta?.role,
          days: pack.meta?.days,
        });
        sessionStarted = true;
        PackHarness.setRole('generator');
      }
      const meta = {
        title: pack.meta?.title,
        industry: pack.meta?.industry,
        role: pack.meta?.role,
        goal: pack.meta?.goal,
        days: pack.meta?.days || pack.plan?.length || 30,
        notes: pack.meta?.notes || '',
      };
      const outline = outlineFromPack(pack);
      onProgress(`从 Day ${targetDay} 日课挑选术语…`, 15);
      let curated = [];
      try {
        curated = await inventGlossaryTermsForDay(meta, pack, targetDay);
      } catch (error) {
        rethrowAbort(error);
        rethrowGlossaryOperationalError(error);
        console.warn('[PackGenerator] day glossary curation failed; use local candidates', error);
      }
      const terms = glossaryCandidatesForDay(curated, pack, targetDay, 8);
      const targetCount = Math.min(4, terms.length);
      if (targetCount < 1) throw glossaryQualityError({});
      const generated = await generateGlossary(
        meta,
        outline,
        (message) => onProgress(message, 55),
        pack,
        {
          terms,
          targetCount,
          requiredKinds: Math.min(2, targetCount),
          sourceType: 'day',
          sourceDays: [targetDay],
          incremental: true,
        }
      );
      pack.glossary = mergeGlossaryEntries(pack.glossary, generated);
      pack.meta = pack.meta || {};
      pack.meta.generation = pack.meta.generation || {};
      pack.meta.generation.glossaryDays = [
        ...new Set([...(pack.meta.generation.glossaryDays || []), targetDay]),
      ].sort((a, b) => a - b);
      pack.meta.glossaryHubHitRate = Number(glossaryHubHitRate(pack.glossary, pack).toFixed(3));
      runPackQualityGate(pack, outline, { rewritePhases: false });
      pack.updatedAt = new Date().toISOString();
      ContentPack.save(pack);
      onProgress(`Day ${targetDay} 术语已加入术语库`, 100);
      return pack;
    } catch (error) {
      sessionOutcome = isAbortError(error) ? 'cancelled' : 'failed';
      throw error;
    } finally {
      if (sessionStarted && typeof PackHarness !== 'undefined') {
        PackHarness.endSession(sessionOutcome);
      }
      endJob();
    }
  }

  async function generateCustomGlossaryForPack(
    packId,
    requestedTerm,
    onProgress = () => {},
    opts = {}
  ) {
    beginJob(opts.signal);
    let sessionOutcome = 'ok';
    let sessionStarted = false;
    try {
      const pack = ContentPack.load(packId);
      if (!pack) throw new Error('找不到当前路径');
      const term = String(requestedTerm || '').trim();
      if (!isGlossaryTermCandidate(term)) {
        const error = new Error('请输入 2–20 个字的术语名称，不要输入完整问题或句子');
        error.code = 'GLOSSARY_TERM_INVALID';
        throw error;
      }
      const existing = (pack.glossary || []).find(
        (entry) => glossaryTermKey(entry?.term) === glossaryTermKey(term)
      );
      if (existing) return pack;
      if (typeof PackHarness !== 'undefined') {
        PackHarness.beginSession({
          packId,
          industry: pack.meta?.industry,
          role: pack.meta?.role,
          days: pack.meta?.days,
        });
        sessionStarted = true;
        PackHarness.setRole('generator');
      }
      const meta = {
        title: pack.meta?.title,
        industry: pack.meta?.industry,
        role: pack.meta?.role,
        goal: pack.meta?.goal,
        days: pack.meta?.days || pack.plan?.length || 30,
        notes: pack.meta?.notes || '',
      };
      onProgress(`正在解释「${term}」…`, 20);
      const generated = await generateGlossary(
        meta,
        outlineFromPack(pack),
        (message) => onProgress(message, 60),
        pack,
        {
          terms: [{ term, module: '自定义', why: '用户主动查询' }],
          targetCount: 1,
          requiredKinds: 1,
          sourceType: 'custom',
          sourceDays: [],
          incremental: true,
        }
      );
      pack.glossary = mergeGlossaryEntries(pack.glossary, generated);
      pack.meta = pack.meta || {};
      pack.meta.glossaryHubHitRate = Number(glossaryHubHitRate(pack.glossary, pack).toFixed(3));
      pack.updatedAt = new Date().toISOString();
      ContentPack.save(pack);
      onProgress(`「${term}」已加入术语库`, 100);
      return pack;
    } catch (error) {
      sessionOutcome = isAbortError(error) ? 'cancelled' : 'failed';
      throw error;
    } finally {
      if (sessionStarted && typeof PackHarness !== 'undefined') {
        PackHarness.endSession(sessionOutcome);
      }
      endJob();
    }
  }

  // ─── ④ 面试/能力/作品：能力维 → 面试题库 → 作品里程碑 ───

  async function generateSkillsDim(meta, outline) {
    const system = `你是岗位能力模型设计师。${DEPTH_CONTRACT}
硬性规则：只输出一个 JSON 对象。`;
    const user = `## 学习者
${metaBrief(meta)}

## 成果能力
${JSON.stringify(outline?.outcomes?.competencies || []).slice(0, 2500)}

## Task
{"skills":[{"id":"s1","label":"能力名","desc":"一句话：在什么场景做出什么判断/交付"}]}
要求：6-8 维；贴合「${meta.industry}/${meta.role}」真实考核；desc 含场景动词，禁止「综合素质强」。`;
    return chatJson({ system, user, max_tokens: 2000, stage: 'extras.skills', jsonMode: true });
  }

  async function generateInterviewBank(meta, outline, skills) {
    const system = `你是「${meta.industry}」方向「${meta.role}」面试官。
${DEPTH_CONTRACT}
硬性规则：只输出一个 JSON 对象。`;
    const user = `## 能力维
${JSON.stringify(skills).slice(0, 2000)}

## 阶段
${JSON.stringify(outline?.phases || []).slice(0, 1200)}

## Task
{"interview":[{"id":"i1","cat":"分类","days":"1-7","q":"题干","hint":"得分要点","followUp":"追问一句"}]}
要求：16-20 题；题干能追问细节与权衡；覆盖行业认知/方法/项目/行为；hint 写得分点不是标准答案全文；days 映射到学习阶段。`;
    return chatJson({ system, user, max_tokens: 4500, stage: 'extras.interview', jsonMode: true });
  }

  async function generatePortfolioMilestones(meta, outline, skills) {
    const system = `你是作品集教练（UbD：evidence of learning）。
${DEPTH_CONTRACT}
硬性规则：只输出一个 JSON 对象。`;
    const user = `## 学习者
${metaBrief(meta)}

## 阶段与能力
${JSON.stringify({ phases: outline?.phases, skills }).slice(0, 2500)}

## Task
{"portfolio":[{"id":"p1","title":"里程碑","phase":"阶段","days":"区间","items":["可检查交付物1","2"]}]}
要求：4-8 项；每项 items 2-4 个可拍照/可链接的交付物；从分析备忘→对比表→小项目→面试故事线递进。`;
    return chatJson({ system, user, max_tokens: 2800, stage: 'extras.portfolio', jsonMode: true });
  }

  async function generateExtras(meta, outline, existingPack = {}) {
    let skillsRaw = Array.isArray(existingPack.skills) ? existingPack.skills : [];
    let interviewRaw = Array.isArray(existingPack.interview) ? existingPack.interview : [];
    let portfolioRaw = Array.isArray(existingPack.portfolio) ? existingPack.portfolio : [];
    // 能力维先出骨架，随后面试与作品并行；调用方保证日课与核心术语已经完成。
    if (skillsRaw.length < 6) {
      try {
        const s = await generateSkillsDim(meta, outline);
        skillsRaw = s.skills || [];
      } catch (e) {
        rethrowAbort(e);
        console.warn('[PackGenerator] skills failed', e);
      }
    }
    const [ivSettled, pfSettled] = await Promise.allSettled([
      interviewRaw.length >= 12
        ? Promise.resolve({ interview: interviewRaw })
        : generateInterviewBank(meta, outline, skillsRaw),
      portfolioRaw.length >= 3
        ? Promise.resolve({ portfolio: portfolioRaw })
        : generatePortfolioMilestones(meta, outline, skillsRaw),
    ]);
    if (ivSettled.status === 'fulfilled') {
      interviewRaw = ivSettled.value.interview || [];
    } else {
      rethrowAbort(ivSettled.reason);
      console.warn('[PackGenerator] interview failed', ivSettled.reason);
    }
    if (pfSettled.status === 'fulfilled') {
      portfolioRaw = pfSettled.value.portfolio || [];
    } else {
      rethrowAbort(pfSettled.reason);
      console.warn('[PackGenerator] portfolio failed', pfSettled.reason);
    }
    return {
      interview: (interviewRaw || []).map((q, i) => ({
        id: String(q.id || `i${i + 1}`),
        cat: String(q.cat || '通用'),
        days: String(q.days || '1-' + meta.days),
        q: String(q.q || ''),
        hint: String(q.hint || (q.followUp ? `追问：${q.followUp}` : '')),
      })).filter((q) => q.q),
      skills: (skillsRaw || []).map((s, i) => ({
        id: String(s.id || `skill-${i + 1}`),
        label: String(s.label || `能力${i + 1}`),
        desc: String(s.desc || ''),
      })),
      portfolio: (portfolioRaw || []).map((p, i) => ({
        id: String(p.id || `pf-${i + 1}`),
        title: String(p.title || `里程碑 ${i + 1}`),
        phase: String(p.phase || ''),
        days: String(p.days || ''),
        items: Array.isArray(p.items) ? p.items.map(String) : [],
      })),
    };
  }

  function fillMissingDays(plan, totalDays, outline) {
    const byDay = new Map(plan.map((d) => [d.day, d]));
    const phaseMap = buildDayPhaseMap(outline, totalDays);
    const out = [];
    for (let d = 1; d <= totalDays; d++) {
      if (byDay.has(d)) {
        const row = byDay.get(d);
        out.push({ ...row, phase: phaseMap.get(d) || row.phase || '学习阶段' });
        continue;
      }
      const week = outline?.weekThemes?.find((w) => d >= w.dayStart && d <= w.dayEnd);
      out.push({
        day: d,
        phase: phaseMap.get(d) || outline?.phases?.[0]?.name || '学习阶段',
        week: week ? `第${week.week}周：${week.theme}` : `第${Math.ceil(d / 7)}周`,
        topic: week ? `${week.theme}（第 ${d} 天）` : `自主学习 Day ${d}`,
        tasks: [
          `打开日课「Day ${d}」精读本日章节`,
          '记录 3 个关键判断点',
          '费曼复述今日收获',
        ],
      });
    }
    return applyPhaseFromOutline(out, outline);
  }

  const HUB_COLORS = ['#0891b2', '#7c3aed', '#0d9488', '#ea580c', '#2563eb', '#db2777', '#16a34a', '#ca8a04'];

  function slugify(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 32) || 'chapter';
  }

  /**
   * 知识库导航硬对齐课表：一周一个模块，一天一章（微学习：一单元一目标）
   * 不再由模型决定「Day 4-7」合并章节——那会导致无法每日学习。
   */
  function buildDailyHubStructure(meta, outline, plan) {
    const days = plan?.length
      ? plan.slice().sort((a, b) => a.day - b.day)
      : Array.from({ length: Number(meta.days) || 30 }, (_, i) => ({
          day: i + 1,
          topic: `Day ${i + 1}`,
          phase: '学习阶段',
          week: `第${Math.ceil((i + 1) / 7)}周`,
          tasks: [],
        }));

    const weekThemes = Array.isArray(outline?.weekThemes) ? outline.weekThemes : [];
    const modules = [];
    for (let i = 0; i < days.length; i += 7) {
      const slice = days.slice(i, i + 7);
      const weekNum = Math.floor(i / 7) + 1;
      const id = `module-${weekNum}`;
      const theme =
        weekThemes.find((w) => Number(w.week) === weekNum)?.theme ||
        slice[0]?.week ||
        `第${weekNum}周`;
      const d0 = slice[0].day;
      const d1 = slice[slice.length - 1].day;
      modules.push({
        id,
        title: String(theme).replace(/^第\d+周[:：]?\s*/, '').slice(0, 28) || `第${weekNum}周`,
        description: `完成 Day ${d0}–${d1} 每日微课，能独立复述本周主题并做岗位判断`,
        color: HUB_COLORS[(weekNum - 1) % HUB_COLORS.length],
        chapters: slice.map((d) => ({
          // slug 只绑定 day，避免骨架 topic 与补全 topic 不同导致同一天产生两个章节 key。
          slug: `${id}/day-${String(d.day).padStart(2, '0')}`,
          title: String(d.topic || `Day ${d.day}`).slice(0, 28),
          days: String(d.day),
          focus: `Day ${d.day}：${d.topic || ''}`,
          dayPlan: d,
        })),
      });
    }

    return {
      title: outline?.title || meta.title || `${meta.industry || ''}日课`.trim() || '专属日课',
      learningPath: modules.map((m) => m.title),
      modules,
    };
  }

  /** @deprecated 兼容旧调用名 */
  function fallbackHubStructure(meta, outline, plan) {
    return buildDailyHubStructure(meta, outline, plan);
  }

  function normalizeHubStructure(raw, meta, outline, plan) {
    // 始终按课表一天一章重建，忽略模型输出的多日合并章节
    const daily = buildDailyHubStructure(meta, outline, plan);
    if (raw?.modules?.length) {
      // 仅借用模型起的模块标题（若数量匹配）
      raw.modules.forEach((mod, i) => {
        if (daily.modules[i] && mod.title) {
          daily.modules[i].title = String(mod.title).slice(0, 28);
        }
      });
      if (raw.title) daily.title = String(raw.title);
      if (Array.isArray(raw.learningPath) && raw.learningPath.length) {
        daily.learningPath = raw.learningPath.map(String);
      }
    }
    return daily;
  }

  function reusableHubStructure(pack, meta, outline, plan) {
    const navigation = Array.isArray(pack?.hub?.navigation) ? pack.hub.navigation : [];
    const itemCount = navigation.reduce((sum, module) => sum + (module.items || []).length, 0);
    if (!navigation.length || itemCount !== (plan || []).length) return null;
    const base = buildDailyHubStructure(meta, outline, plan);
    const existingItemsByDay = new Map();
    navigation.forEach((module) => {
      (module.items || []).forEach((item) => {
        const day = dayNumberFromChapter({ slug: item.slug, days: item.days }, plan);
        if (day) existingItemsByDay.set(day, item);
      });
    });
    if (existingItemsByDay.size !== (plan || []).length) return null;
    base.title = pack.hub?.title || base.title;
    base.modules.forEach((module, index) => {
      const existingModule = navigation[index];
      if (existingModule?.title) module.title = existingModule.title;
      if (existingModule?.description) module.description = existingModule.description;
      if (existingModule?.color) module.color = existingModule.color;
      module.chapters.forEach((chapter) => {
        const day = chapterDayNum(chapter, plan);
        const existingItem = existingItemsByDay.get(day);
        if (existingItem?.title) chapter.title = existingItem.title;
      });
    });
    base.learningPath = base.modules.map((module) => module.title);
    return base;
  }

  // ─── ⑥⑦ 知识库：按天导航 + 日课设计 → 例题 → 深写（微学习 / worked example chaining） ───

  async function generateHubStructure(meta, outline, plan) {
    // 导航不交给模型「自由切片」，避免 Day4-7 合并；可选轻抛光模块名
    const base = buildDailyHubStructure(meta, outline, plan);
    try {
      const system = `你是课程导航编辑。只润色模块标题，不得增删模块/章节，不得把多天合并成一章。
硬性规则：只输出一个 JSON 对象。`;
      const user = `## 已按天对齐的导航（章节 days 必须保持单日数字）
${JSON.stringify({
        title: base.title,
        modules: base.modules.map((m) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          chapterDays: m.chapters.map((c) => c.days),
        })),
      }).slice(0, 5000)}

## Task
{"title":"","moduleTitles":["与 modules 等长的短标题"]}
要求：moduleTitles 数量=模块数；标题含行业对象，禁止「综合提升」。`;
      const polish = await chatJson({
        system,
        user,
        temperature: 0.2,
        max_tokens: 1200,
        stage: 'hub.navigation-polish',
        jsonMode: true,
      });
      if (Array.isArray(polish?.moduleTitles)) {
        polish.moduleTitles.forEach((t, i) => {
          if (base.modules[i] && t) base.modules[i].title = String(t).slice(0, 28);
        });
      }
      if (polish?.title) base.title = String(polish.title);
      base.learningPath = base.modules.map((m) => m.title);
    } catch (e) {
      rethrowAbort(e);
      console.warn('[PackGenerator] hub title polish skipped', e);
    }
    return base;
  }

  function dayPlanFromChapter(chapter, plan) {
    if (chapter?.dayPlan) return chapter.dayPlan;
    const explicitDay = Number(String(chapter?.days || '').split(/[-–]/)[0]);
    const slugDay = Number(String(chapter?.slug || '').match(/day-?(\d+)/i)?.[1]);
    const dayNum = explicitDay || slugDay || 0;
    return (plan || []).find((d) => d.day === dayNum) || {
      day: dayNum || 1,
      topic: chapter?.title,
      tasks: [],
      phase: '',
      week: '',
    };
  }

  function softQualityThresholds() {
    if (typeof PackHarness !== 'undefined') {
      return PackHarness.softThresholds?.() || PackHarness.SOFT_QUALITY || {};
    }
    return {
      earlyDayMinChars: 1600,
      midDayMinChars: 2200,
      lateDayMinChars: 2800,
      chapterMedianMin: 2800,
      stemUniqueMin: 0.65,
    };
  }

  function minCharsForDay(day) {
    const soft = softQualityThresholds();
    const d = Number(day) || 0;
    if (d >= 15) return soft.lateDayMinChars || 2800;
    if (d >= 8) return soft.midDayMinChars || 2200;
    return soft.earlyDayMinChars || 1600;
  }

  function dayNumberFromChapter(chapter, plan) {
    if (chapter && Number(chapter.day)) return Number(chapter.day);
    const slugDay = Number(String(chapter?.slug || '').match(/day-?(\d+)/i)?.[1]);
    if (slugDay) return slugDay;
    const fromPlan = dayPlanFromChapter(chapter, plan);
    if (fromPlan?.day) return Number(fromPlan.day);
    return 0;
  }

  /** 检测空壳/模板正文；相对厚度：Day≥15 默认 ≥2800 字 */
  function isShallowHubMarkdown(md, chapter, opts = {}) {
    const s = String(md || '');
    const day = Number(opts.day) || dayNumberFromChapter(chapter, opts.plan) || 0;
    const minLen = opts.minChars || minCharsForDay(day);
    if (s.length < minLen) return true;
    if (/先有生活\/业务例子，再回到正式定义/.test(s)) return true;
    if (/口号\s*≠\s*定义/.test(s) && s.length < Math.max(1400, minLen * 0.55)) return true;
    const title = String(chapter?.title || '').trim();
    if (title && s.includes(`| 定义 | ${title} |`)) return true;
    // 缺少具体行业词或例题步骤
    if (
      !/###\s*例题|##\s*例题|步骤\s*1|Worked|演算|对照/.test(s) &&
      s.length < Math.max(1600, minLen * 0.65)
    ) {
      return true;
    }
    // 后段常见塌陷：把标题当内容 / 元指令类比 / Mission 只复读标题
    if (/讲清并应用[「『"]/.test(s)) return true;
    if (/想成\s*.{0,24}现场要先分清边界再动手/.test(s)) return true;
    if (/学完你应能：讲清并应用/.test(s)) return true;
    if (
      title &&
      s.length < Math.max(1400, minLen * 0.55) &&
      (s.match(new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length >= 6
    ) {
      return true;
    }
    // 必须有可执行例题步骤或判断题列表
    const hasSteps = /步骤\s*[123]|Worked Example|例题精讲/.test(s);
    const hasJudgment = /判断题|取舍|该不该|能不能做/.test(s);
    if (!hasSteps && !hasJudgment && s.length < Math.max(2200, minLen * 0.85)) return true;
    return false;
  }

  function chapterLengthStats(pack) {
    const chapters = pack?.hub?.chapters || {};
    const lens = Object.values(chapters)
      .map((md) => String(md || '').replace(/<!--\s*zhijing:shallow\s*-->/g, '').trim().length)
      .filter((n) => n > 0)
      .sort((a, b) => a - b);
    if (!lens.length) return { n: 0, min: 0, median: 0, max: 0 };
    const mid = lens[Math.floor(lens.length / 2)];
    return { n: lens.length, min: lens[0], median: mid, max: lens[lens.length - 1] };
  }

  function diagnoseThinLateChapters(pack) {
    const soft = softQualityThresholds();
    const plan = pack?.plan || [];
    const chapters = pack?.hub?.chapters || {};
    const thin = [];
    Object.entries(chapters).forEach(([slug, md]) => {
      const ch = { slug, title: slug };
      const day = dayNumberFromChapter(ch, plan);
      if (day < 15) return;
      const len = String(md || '').length;
      const minLen = soft.lateDayMinChars || 2800;
      if (len < minLen || isShallowHubMarkdown(md, ch, { day, plan })) {
        thin.push(slug);
      }
    });
    return thin;
  }

  async function designDailyLesson(meta, dayPlan) {
    const { role } = roleLens(meta);
    const system = `${HUB_STABLE_SYSTEM_PREFIX}
当前职责：日课教学设计师（Microlearning：一课一目标 + Worked Example）。
日课是每日主教材，必须具有指导性质（读者学完能动手）。
硬性规则：只输出一个 JSON 对象。禁止写「类比：先有生活例子」这类元指令，必须写出真实类比内容。`;
    const user = `## Audience
行业：${meta.industry}｜岗位：${role}｜目标：${meta.goal || '入门'}

## 本日课表（仅这一天，不要合并其它天）
${JSON.stringify({
      day: dayPlan.day,
      topic: dayPlan.topic,
      phase: dayPlan.phase,
      week: dayPlan.week,
      tasks: dayPlan.tasks || [],
    })}

## Task（本日微课设计稿）
{
  "objective": "学完能做到…（Bloom 动词开头，可检验）",
  "hook": "开场痛点/决策困惑 1-2 句（行业具体）",
  "analogy": "一个完整类比句子（不要写制作说明）",
  "concepts": [
    {"name":"概念名","definition":"工作定义≤40字","whyForRole":"对${role}意味着什么","boundary":"何时用/何时不用"}
  ],
  "compareTable": [{"left":"A","right":"B","diff":"关键差异"}],
  "workedExample": {
    "title":"例题标题",
    "scenario":"真实岗位场景（含对象/约束）",
    "steps":["步骤1 做什么+为什么","步骤2","步骤3"],
    "answerSketch":"参考结论/判断",
    "takeaway":"可迁移的一条原则"
  },
  "roleJudgments": ["${role}判断题1（具体）","2","3"],
  "misconceptions": ["行业常见误区1（具体，不是『把术语当口号』套话）","2"],
  "retrieval": ["闭卷回忆题1","场景应用题2","45秒口述题3"],
  "checklist": ["今天完成后自检1","2"]
}
要求：concepts 3-5 个，全部贴合本日 topic；workedExample.steps ≥3；禁止通用 PM 三问（痛点/代价/成功标准）原样复用。`;
    return chatJson({
      system,
      user,
      temperature: 0.3,
      max_tokens: 4000,
      stage: 'hub.lesson-design',
      jsonMode: true,
    });
  }

  function buildLessonEvidenceBindings(searchHits) {
    const seen = new Set();
    const seenIds = new Set();
    const bindings = [];
    for (const hit of searchHits || []) {
      const url = String(hit?.url || '').trim();
      if (!url || seen.has(url) || !isSafeHttpUrl(url) || isBlockedResourceUrl(url)) continue;
      seen.add(url);
      const requestedId = String(hit?.sourceId || hit?.evidenceId || '').toUpperCase();
      let id = /^S\d+$/.test(requestedId) && !seenIds.has(requestedId)
        ? requestedId
        : `S${bindings.length + 1}`;
      while (seenIds.has(id)) id = `S${Number(id.slice(1)) + 1}`;
      seenIds.add(id);
      bindings.push({
        id,
        title: String(hit.title || '参考来源').trim().slice(0, 120),
        url,
        snippet: String(hit.snippet || '').trim().slice(0, 320),
        trustTier: evidenceTrustTier(url),
      });
      if (bindings.length >= 4) break;
    }
    return bindings;
  }

  function lineHasPreciseClaim(line) {
    return (
      /20\d{2}\s*年/.test(String(line || '')) ||
      /(?:同比|环比|增长|下降|市场规模|渗透率|转化率|营收|成本).{0,40}(?:\d+(?:\.\d+)?%|\d+(?:\.\d+)?\s*(?:万|亿|元|美元))/.test(String(line || ''))
    );
  }

  function sourceSupportsPreciseLine(source, line) {
    const snippet = String(source?.snippet || '').trim();
    const numbers = String(line || '').match(/\d+(?:\.\d+)?/g) || [];
    return !!snippet && numbers.length > 0 && numbers.every((number) => snippet.includes(number));
  }

  function sanitizeUnsupportedPreciseClaims(markdown, evidenceBindings) {
    const bindings = Array.isArray(evidenceBindings) ? evidenceBindings : [];
    return String(markdown || '')
      .split('\n')
      .map((line) => {
        if (!lineHasPreciseClaim(line)) {
          return line;
        }
        const citedIds = [...line.matchAll(/\[(S\d+)\]/g)].map((match) => match[1]);
        const supported = citedIds.some((id) => {
          const source = bindings.find((item) => item.id === id);
          return sourceSupportsPreciseLine(source, line);
        });
        if (supported) return line;
        return line.replace(
          /20\d{2}\s*年|\d+(?:\.\d+)?%|\d+(?:\.\d+)?\s*(?:万|亿|元|美元|家企业|名用户)/g,
          '具体数值需查官方或原始资料核实'
        );
      })
      .join('\n');
  }

  function canonicalizeLessonSourceSection(markdown, evidenceBindings) {
    const bindings = Array.isArray(evidenceBindings) ? evidenceBindings : [];
    const md = String(markdown || '').trim();
    const sourceAt = md.search(/(?:^|\n)##\s*(?:来源|证据来源|Sources?)\s*(?:\n|$)/i);
    const body = (sourceAt >= 0 ? md.slice(0, sourceAt) : md).trimEnd();
    if (!bindings.length) {
      return `${body}\n\n## 来源\n\n本日未取得可核验证据；正文仅保留定性教学说明，精确数据请查官方或原始资料核实。`.trim();
    }
    const sourceLines = bindings.map(
        (source) =>
          `- [${source.id}] [${source.title}](${source.url})（信任级别：${source.trustTier}）`
      );
    return `${body}\n\n## 来源\n\n${sourceLines.join('\n')}`.trim();
  }

  function normalizeLessonEvidenceCitations(markdown, evidenceBindings) {
    const bindings = Array.isArray(evidenceBindings) ? evidenceBindings : [];
    const allowed = new Map(
      bindings.map((source) => [String(source?.id || '').toUpperCase(), source])
    );
    const text = String(markdown || '');
    const sourceAt = text.search(/(?:^|\n)##\s*(?:来源|证据来源|Sources?)\s*(?:\n|$)/i);
    const body = sourceAt >= 0 ? text.slice(0, sourceAt) : text;
    const normalizedBody = body
      .split('\n')
      .map((line) => {
        let next = line.replace(/\s*\[(S\d+)\]/gi, (match, id) => {
          const normalizedId = String(id).toUpperCase();
          return allowed.has(normalizedId) ? ` [${normalizedId}]` : '';
        });
        if (!lineHasPreciseClaim(next)) return next;
        const citedIds = [...next.matchAll(/\[(S\d+)\]/gi)].map((match) =>
          String(match[1]).toUpperCase()
        );
        const citedSupport = citedIds.some((id) =>
          sourceSupportsPreciseLine(allowed.get(id), next)
        );
        if (citedSupport) return next;
        const supportingSource = bindings.find((source) =>
          sourceSupportsPreciseLine(source, next)
        );
        if (supportingSource?.id) {
          return `${next.trimEnd()} [${String(supportingSource.id).toUpperCase()}]`;
        }
        return sanitizeUnsupportedPreciseClaims(next, []);
      })
      .join('\n')
      .trim();
    return canonicalizeLessonSourceSection(normalizedBody, bindings);
  }

  function ensureLessonEvidenceBacklinks(markdown, evidenceBindings) {
    const bindings = Array.isArray(evidenceBindings) ? evidenceBindings : [];
    return normalizeLessonEvidenceCitations(markdown, bindings);
  }

  function normalizePackLessonSourceSections(pack) {
    if (!pack?.hub?.chapters) return pack;
    const plan = pack.plan || [];
    Object.entries(pack.hub.chapters).forEach(([slug, markdown]) => {
      const day = dayNumberFromChapter({ slug }, plan);
      if (!day) return;
      const resources =
        pack.dayResources?.[String(day)]?.resources ||
        pack.dayResources?.[day]?.resources ||
        [];
      const bindings = resources
        .map((source, index) => ({
          id: String(source?.sourceId || source?.evidenceId || source?.id || `S${index + 1}`),
          title: String(source?.title || '参考来源').trim(),
          url: String(source?.url || '').trim(),
          trustTier: String(source?.sourceTier || source?.trustTier || evidenceTrustTier(source?.url)),
        }))
        .filter((source) => source.id && source.title && isSafeHttpUrl(source.url));
      pack.hub.chapters[slug] = normalizeLessonEvidenceCitations(markdown, bindings);
    });
    return pack;
  }

  async function writeDailyLessonMarkdown(meta, chapter, dayPlan, lesson, searchHits, { strict = false } = {}) {
    const { role, sectionHeading, decisionSubhead } = roleLens(meta);
    const evidenceBindings = buildLessonEvidenceBindings(searchHits);
    const system = `${HUB_STABLE_SYSTEM_PREFIX}
当前职责：领域日课作者与岗位教练。
本日是 Day ${dayPlan.day} 的独立微课，只写这一天，禁止写成 Day x-y 合集。
本文是日课主教材：以「怎么做」指导读者完成今日任务；术语深挖留给术语库。
借鉴：worked example（先看完整解题步骤再练习）+ 提取练习收尾。
${strict ? '【加严】上一稿太空洞：禁止模板句、禁止把标题当定义、禁止元指令式类比。' : ''}
证据规则：evidence_bindings 是事实的唯一依据。正文事实句使用 [S1] 形式引用；末尾必须有「## 来源」并逐条回链。
精确数字只有在对应来源 snippet 明确出现同一数字时才可写；无证据或 snippet 不支持时只写定性判断与核验路径。
输出契约：只输出一个 JSON 对象 {"slug":"","markdown":""}。`;

    const user = `## Audience
行业：${meta.industry}｜岗位：${role}｜目标：${meta.goal || '入门'}

## 章节
slug: ${chapter.slug}
title: ${chapter.title}
关联天数：必须写 **Day ${dayPlan.day}**（单个数字，禁止区间）

## 日课设计稿（必须全部落实进正文，不得省略例题步骤）
${JSON.stringify(lesson).slice(0, 5500)}

## search_results
${formatSearchBlock(searchHits, 10)}

## evidence_bindings
${JSON.stringify(evidenceBindings)}

## 正文结构（Markdown，${Number(dayPlan.day) >= 15 ? '3000-3800' : Number(dayPlan.day) >= 8 ? '2400-3200' : '1800-2600'} 字；这是最低质量预算，不得用重复句凑字；Day≥15 必须写满例题步骤与至少 1 个取舍判断）
# {标题}
> **一句话摘要**
> Day ${dayPlan.day} | {objective}
## 关联学习天数 → **Day ${dayPlan.day}**
## 今天学什么（Mission）
## 直觉与类比（写真实类比，不要写作指引）
${sectionHeading}
## 核心概念（每概念：定义 + 为何重要 + 边界；可用表格）
${decisionSubhead}（用设计稿里的 roleJudgments，要具体）
## 例题精讲（Worked Example）
场景 → 步骤1/2/3（每步含动作与理由）→ 参考结论 → 可迁移原则
## 速查条
## 常见误区（用设计稿 misconceptions）
## 提取练习（合上资料再答，3题）
## 今日完成清单
## 来源（[S1] 标号、标题、URL 必须与 evidence_bindings 一致）

## 禁止
- 不要「先有生活/业务例子，再回到正式定义」这类制作说明
- 不要表格「定义」列只重复章节标题
- 不要把多天内容塞进一篇`;

    const data = await chatJson({
      system,
      user,
      temperature: strict ? 0.35 : 0.28,
      max_tokens: 7000,
      stage: strict ? 'hub.lesson-write-strict' : 'hub.lesson-write',
      jsonMode: true,
    });
    const md = data?.markdown || data?.content || '';
    const slug = data?.slug || chapter.slug;
    return {
      slug,
      markdown: ensureLessonEvidenceBacklinks(
        rewriteRoleLensInText(String(md), meta),
        evidenceBindings
      ),
    };
  }

  /** 用设计稿拼出可用日课（优于空壳 stub） */
  function richFallbackFromLesson(meta, chapter, dayPlan, lesson, evidenceBindings = []) {
    const { role, sectionHeading, decisionSubhead } = roleLens(meta);
    const L = lesson || {};
    const concepts = Array.isArray(L.concepts) ? L.concepts : [];
    const steps = L.workedExample?.steps || [];
    const conceptRows = concepts
      .map(
        (c) =>
          `| ${c.name || ''} | ${c.definition || ''} | ${c.whyForRole || ''} | ${c.boundary || ''} |`
      )
      .join('\n');
    const stepLines = steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
    const judgments = (L.roleJudgments || []).map((q, i) => `${i + 1}. ${q}`).join('\n');
    const pitfalls = (L.misconceptions || []).map((m) => `- ${m}`).join('\n');
    const retrieval = (L.retrieval || []).map((q, i) => `${i + 1}. ${q}`).join('\n');
    const checks = (L.checklist || []).map((c) => `- [ ] ${c}`).join('\n');
    return `# ${chapter.title}

> **一句话摘要**：${L.objective || dayPlan.topic || chapter.title}

> Day ${dayPlan.day} | ${L.hook || dayPlan.topic || ''}

## 关联学习天数

**Day ${dayPlan.day}**

## 今天学什么（Mission）

${L.hook || ''}

学完你应能：${L.objective || `讲清「${dayPlan.topic}」并完成岗位判断`}。

## 直觉与类比

${L.analogy || `在「${meta.industry}」里，「${dayPlan.topic}」像处理一件必须先分清责任边界再动手的协作任务：先对齐对象与约束，再谈方案。`}

${sectionHeading}

- 主题：${dayPlan.topic}
- 任务线索：${(dayPlan.tasks || []).slice(0, 3).join('；') || '完成本日阅读与复述'}

## 核心概念

| 概念 | 工作定义 | 对 ${role} 的意义 | 边界 |
|------|----------|------------------|------|
${conceptRows || `| ${dayPlan.topic} | （生成不完整，请重试「生成阅读与术语」） | 能做判断 | 先分清用/不用 |`}

${decisionSubhead}

${judgments || `1. 在「${dayPlan.topic}」上，${role} 先要澄清的约束是什么？`}

## 例题精讲（Worked Example）

**${L.workedExample?.title || '本日判断练习'}**

场景：${L.workedExample?.scenario || `${meta.industry} 语境下与「${dayPlan.topic}」相关的一次决策`}

${stepLines || '1. 列出已知约束\n2. 对比可选方案\n3. 给出可检验结论'}

参考结论：${L.workedExample?.answerSketch || '（待补全）'}

可迁移原则：${L.workedExample?.takeaway || '先边界后方案'}

## 速查条

- 目标：${L.objective || dayPlan.topic}
- 例题结论：${L.workedExample?.takeaway || ''}
- 自检：能否不看资料讲清定义与边界

## 常见误区

${pitfalls || `- 只记名词，不会在「${dayPlan.topic}」场景做取舍`}

## 提取练习（合上资料再答）

${retrieval || `1. 用一句话定义「${dayPlan.topic}」\n2. 举一个该用/不该用场景\n3. 45 秒口述给面试官`}

## 今日完成清单

${checks || `- [ ] 复述本日 objective\n- [ ] 走完例题步骤`}

## 来源

${evidenceBindings.length
    ? evidenceBindings.map((source) => `- [${source.id}] [${source.title}](${source.url})（信任级别：${source.trustTier}）`).join('\n')
    : '本日未取得可核验证据；正文仅保留定性教学说明，精确数据请查官方或原始资料核实。'}
`;
  }

  async function generateHubBodies(meta, chapterBatch, plan, evidenceSources = []) {
    const map = new Map();
    const ch = chapterBatch[0];
    if (!ch) return map;
    const dayPlan = dayPlanFromChapter(ch, plan);
    const preferStrict = Number(dayPlan.day) >= 15;
    try {
      const lesson = await designDailyLesson(meta, dayPlan);
      let searchHits = (Array.isArray(evidenceSources) ? evidenceSources : [])
        .filter((source) => source?.url && source?.title)
        .map((source) => ({
          sourceId: source.sourceId || source.evidenceId || source.id || '',
          title: source.title,
          url: source.url,
          snippet: source.snippet || source.summary || source.description || '',
        }));
      if (!searchHits.length) {
        searchHits = hasSearchKey()
          ? await searchMany([`${meta.industry} ${dayPlan.topic || ch.title}`], {
              count: 6,
              maxQueries: 1,
            })
          : [];
      }
      if (!searchHits.length) {
        searchHits = await fetchWikipediaResources(dayPlan.topic || ch.title, 2);
      }
      const evidenceBindings = buildLessonEvidenceBindings(searchHits);
      let written = await writeDailyLessonMarkdown(meta, ch, dayPlan, lesson, searchHits, {
        strict: preferStrict,
      });
      const shallowOpts = { day: dayPlan.day, plan };
      if (isShallowHubMarkdown(written.markdown, ch, shallowOpts)) {
        console.warn('[PackGenerator] shallow hub markdown, retry Day', dayPlan.day);
        written = await writeDailyLessonMarkdown(meta, ch, dayPlan, lesson, searchHits, {
          strict: true,
        });
      }
      if (isShallowHubMarkdown(written.markdown, ch, shallowOpts)) {
        written = {
          slug: ch.slug,
          markdown: ensureLessonEvidenceBacklinks(
            richFallbackFromLesson(meta, ch, dayPlan, lesson, evidenceBindings),
            evidenceBindings
          ),
        };
      }
      // 兜底仍浅则打标，供质量门禁定点重试
      if (isShallowHubMarkdown(written.markdown, ch, shallowOpts)) {
        written.markdown = `${written.markdown}\n\n<!-- zhijing:shallow -->\n`;
      }
      map.set(ch.slug, written.markdown);
    } catch (e) {
      rethrowAbort(e);
      rethrowOperationalError(e);
      console.warn('[PackGenerator] daily hub failed Day', dayPlan.day, safeDiagnostic(e));
      const fallbackEvidence = buildLessonEvidenceBindings(
        await fetchWikipediaResources(dayPlan.topic || ch.title, 2)
      );
      try {
        const lesson = await designDailyLesson(meta, dayPlan);
        map.set(
          ch.slug,
          ensureLessonEvidenceBacklinks(
            richFallbackFromLesson(meta, ch, dayPlan, lesson, fallbackEvidence),
            fallbackEvidence
          )
        );
      } catch (fallbackError) {
        rethrowAbort(fallbackError);
        rethrowOperationalError(fallbackError);
        map.set(
          ch.slug,
          ensureLessonEvidenceBacklinks(richFallbackFromLesson(meta, ch, dayPlan, {
            objective: `能说明「${dayPlan.topic}」的适用边界并完成 1 次岗位判断`,
            concepts: [
              {
                name: dayPlan.topic,
                definition: String(dayPlan.topic),
                whyForRole: `对${meta.role || '本岗位'}意味着能做对判断`,
                boundary: '先分清用/不用',
              },
            ],
            workedExample: {
              title: `应用「${dayPlan.topic}」`,
              scenario: `${meta.industry} 场景下的一次真实决策`,
              steps: ['澄清对象与约束', '列出可选方案', '给出取舍理由'],
              answerSketch: '先边界后方案',
              takeaway: '判断先于执行',
            },
            roleJudgments: [`在「${dayPlan.topic}」上，什么情况不该由${meta.role || '本岗位'}拍板？`],
            misconceptions: [`把「${dayPlan.topic}」当成口号而不是可检查动作`],
            retrieval: [`用一句话定义「${dayPlan.topic}」`, `举一个该用/不该用场景`],
            checklist: [`复述「${dayPlan.topic}」边界`, '完成例题步骤'],
          }, fallbackEvidence), fallbackEvidence)
        );
      }
      const fallbackMarkdown = String(map.get(ch.slug) || '');
      if (isShallowHubMarkdown(fallbackMarkdown, ch, { day: dayPlan.day, plan })) {
        map.set(ch.slug, `${fallbackMarkdown}\n\n<!-- zhijing:shallow -->\n`);
      }
    }
    return map;
  }

  function stubMarkdown(meta, chapter) {
    const dayPlan = dayPlanFromChapter(chapter, []);
    return richFallbackFromLesson(meta, chapter, dayPlan, {
      objective: `完成 Day ${dayPlan.day}「${chapter.title}」的学习目标`,
      hook: chapter.focus || chapter.title,
      analogy: '',
      concepts: [],
      workedExample: { title: '本日练习', scenario: '', steps: [], answerSketch: '', takeaway: '' },
      roleJudgments: [],
      misconceptions: [],
      retrieval: [],
      checklist: [],
    });
  }

  function structureToNavigation(structure) {
    return (structure.modules || []).map((mod) => ({
      id: mod.id,
      title: mod.title,
      description: mod.description,
      color: mod.color,
      items: (mod.chapters || []).map((ch) => ({
        slug: ch.slug,
        title: ch.title,
        days: ch.days,
      })),
    }));
  }

  const ALLOWED_RESOURCE_TYPES = new Set(['article', 'video', 'report', 'tool']);

  function isSafeHttpUrl(url) {
    try {
      const u = new URL(String(url));
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  }

  function fallbackDayResources() {
    // 已废弃：禁止再向用户甩「请自选」搜索页
    return [];
  }

  function fallbackDayExercises(dayPlan, meta = {}) {
    return buildVariedFallbackExercises(dayPlan, meta);
  }

  /** 学习资料软降权域名：不硬拦截，排序时减分；过稀时仍可保留 */
  function isLowQualityLearningHost(url) {
    const host = hostnameOf(url);
    if (!host) return true;
    const demote = [
      'xiaohongshu.com',
      'xhslink.com',
      'blog.csdn.net',
      'csdn.net',
      'jianshu.com',
      'juejin.cn',
    ];
    return demote.some((b) => host === b || host.endsWith(`.${b}`));
  }

  async function normalizeDayMaterialRow(row, dayPlan, meta, searchHits = []) {
    const day = Number(row?.day) || dayPlan.day;
    const snippetByUrl = new Map(
      (Array.isArray(searchHits) ? searchHits : []).map((hit) => [
        String(hit?.url || '').trim(),
        String(hit?.snippet || hit?.summary || hit?.description || '').trim().slice(0, 320),
      ])
    );
    let resources = Array.isArray(row?.resources) ? row.resources : [];
    resources = resources
      .map((r) => ({
        title: String(r.title || '').trim().slice(0, 80),
        url: String(r.url || '').trim(),
        snippet: String(
          r.snippet || r.summary || r.description || snippetByUrl.get(String(r.url || '').trim()) || ''
        ).trim().slice(0, 320),
        type: ALLOWED_RESOURCE_TYPES.has(String(r.type)) ? String(r.type) : 'article',
      }))
      .filter(
        (r) =>
          r.title &&
          isSafeHttpUrl(r.url) &&
          !isBlockedResourceUrl(r.url) &&
          !/wikipedia\.org\/wiki\/Special:Search/i.test(r.url) &&
          !/search\.bilibili\.com\//i.test(r.url) &&
          !/google\.[^/]+\/search/i.test(r.url)
      )
      .slice(0, 4);

    // 不足：先补搜索精选具体页
    if (resources.length < 2 && searchHits?.length) {
      const extra = pickConcreteFromHits(searchHits, {
        learnWhat: dayPlan.topic || '',
        topic: dayPlan.topic || '',
        need: 3 - resources.length,
        excludeUrls: resources.map((r) => r.url),
      });
      resources = resources.concat(extra).slice(0, 4);
    }

    // 仍不足：维基公开接口解析真实词条（可直接打开，不是搜索页）
    if (resources.length < 2) {
      const wiki = await fetchWikipediaResources(
        dayPlan.topic || `${meta.industry || ''} ${meta.role || ''}`.trim(),
        3
      );
      const extra = wiki.filter((w) => !resources.some((r) => r.url === w.url));
      resources = resources.concat(extra).slice(0, 4);
    }

    let exercises = Array.isArray(row?.exercises) ? row.exercises : [];
    exercises = exercises
      .map((ex) => ({
        q: String(ex.q || ex.question || '').trim(),
        rubric: (Array.isArray(ex.rubric) ? ex.rubric : [])
          .map(String)
          .map((s) => s.trim())
          .filter(Boolean),
        ref: ex.ref ? String(ex.ref).trim() : '',
      }))
      .filter((ex) => ex.q && !isTemplateExerciseQuestion(ex.q))
      .slice(0, 4);
    exercises.forEach((ex) => {
      if (!ex.rubric.length) {
        ex.rubric = ['能讲清核心概念', '有具体例子或案例', '能对应到今日任务'];
      }
    });
    if (exercises.length < 2) {
      exercises = buildVariedFallbackExercises(dayPlan, meta);
    }

    resources = selectSourcePortfolio(resources, {
      learnWhat: dayPlan.topic || '',
      topic: dayPlan.topic || '',
      limit: 3,
    });

    return {
      day,
      resources: bindResourceEvidence(resources),
      exercises: normalizeDailyExerciseContract(exercises, dayPlan, meta),
    };
  }

  // ─── ⑤ 每日资料/练习：资源意图 → 外链策展 → 提取练习 ───

  async function planDayResourceIntents(meta, planSlice) {
    const system = `你是学习资料策划（先想「学什么」，再找链接）。
${DEPTH_CONTRACT}
硬性规则：只输出一个 JSON 数组。`;
    const slim = planSlice.map((d) => ({
      day: d.day,
      topic: d.topic,
      tasks: (d.tasks || []).slice(0, 3),
    }));
    const user = `## Audience
行业：${meta.industry}｜岗位：${meta.role}

## Days
${JSON.stringify(slim)}

## Task
为每天输出 2-3 条资源意图（尚无 URL）：
[{"day":1,"intents":[{"learnWhat":"具体学什么（方法/概念/步骤）","query":"含教程或方法的中文搜索词","prefer":"wiki|official|video|paper","type":"article|video|report|tool"}]}]
要求：
- learnWhat 对应今日 topic 的可学对象（方法、框架、步骤），不要写成新闻事件
- query 必须带「教程/方法/讲解/定义/文档」之一；禁止只用公司名+热点词裸搜
- prefer 禁止 news；学习资料不要指向资讯站
- 禁止空泛「入门教程」意图`;
    return chatJson({ system, user, max_tokens: 3200, stage: 'materials.intents' });
  }

  /**
   * 复用持久化的周候选池按日分配；只有质量底线确有缺口时才为该日补搜一次。
   * @returns {{ rows: Array, searchByDay: Map<number, Array> }}
   */
  async function curateDayResourceLinks(pack, meta, planSlice, onProgress) {
    const searchByDay = new Map();
    const fullPlan = Array.isArray(pack?.plan) && pack.plan.length ? pack.plan : planSlice;
    const weeks = [...new Set((planSlice || []).map((row) => weekNumberForDay(row.day)))];
    const pools = new Map();
    for (const week of weeks) {
      const weekPlan = fullPlan.filter((row) => weekNumberForDay(row.day) === week);
      const pool = await ensureWeeklyResourcePool(pack, meta, weekPlan);
      pools.set(week, pool);
      if (onProgress) onProgress(`⑤ 已建立第 ${week} 周资料池…`);
    }

    const rows = [];
    for (const dayPlan of planSlice || []) {
      const day = Number(dayPlan.day);
      const pool = pools.get(weekNumberForDay(day));
      let poolHits = Array.isArray(pool?.hits) ? pool.hits : [];
      const assignedIds = new Set(pool?.assignments?.[String(day)] || []);
      let selected = assignedIds.size
        ? poolHits.filter((hit) => assignedIds.has(String(hit.candidateId)))
        : selectSourcePortfolio(poolHits, {
            learnWhat: dayPlan.topic || '',
            topic: dayPlan.topic || '',
            limit: 3,
          });
      selected = selectSourcePortfolio(selected, {
        learnWhat: dayPlan.topic || '',
        topic: dayPlan.topic || '',
        limit: 3,
      });
      const hasTrusted = selected.some((hit) =>
        ['high', 'medium'].includes(normalizeSourceTier(hit.sourceTier))
      );
      if (assignedIds.size && (selected.length < 2 || !hasTrusted)) {
        selected = selectSourcePortfolio(poolHits, {
          learnWhat: dayPlan.topic || '',
          topic: dayPlan.topic || '',
          limit: 3,
        });
      }
      const locallyTrusted = selected.some((hit) =>
        ['high', 'medium'].includes(normalizeSourceTier(hit.sourceTier))
      );
      if ((selected.length < 2 || !locallyTrusted) && !pool?.targetedDays?.[String(day)]) {
        pool.targetedDays = { ...(pool.targetedDays || {}), [String(day)]: true };
        const stats = retrievalStatsForPack(pack);
        stats.targetedSearchCalls += 1;
        stats.deepseekSearchCalls += 1;
        const descriptor = buildLearningQueryLanes(
          `${meta.industry || ''} ${meta.role || ''} ${dayPlan.topic || ''} 教程 方法`,
          { topic: dayPlan.topic || '', learnWhat: dayPlan.topic || '' }
        )[0];
        let supplemental = await searchMany([descriptor], { count: SEARCH_COUNT, maxQueries: 1 });
        if (
          supplemental.length < 2 ||
          !supplemental.some((hit) => normalizeSourceTier(hit.sourceTier) === 'high')
        ) {
          supplemental = [
            ...supplemental,
            ...(await fetchWikipediaResources(dayPlan.topic || '', 2)),
          ];
        }
        const metadata = await resolveResourceMetadata(
          supplemental.slice(0, 10).map((row) => row.url)
        );
        stats.metadataCalls += 1;
        supplemental = mergeResolvedMetadata(
          rankAndFilterSearchHits(supplemental, {
            learnWhat: dayPlan.topic || '',
            topic: dayPlan.topic || '',
          }),
          metadata.results
        );
        const merged = rankAndFilterSearchHits([...poolHits, ...supplemental], {
          learnWhat: dayPlan.topic || '',
          topic: dayPlan.topic || '',
        }).slice(0, 20);
        merged.forEach((hit, index) => {
          hit.candidateId = `C${index + 1}`;
        });
        pool.hits = merged;
        poolHits = merged;
        selected = selectSourcePortfolio([...selected, ...supplemental], {
          learnWhat: dayPlan.topic || '',
          topic: dayPlan.topic || '',
          limit: 3,
        });
      }
      const resources = bindResourceEvidence(selected);
      searchByDay.set(day, poolHits);
      rows.push({ day, resources, _hits: poolHits });
    }
    return { rows, searchByDay };
  }

  async function generateDayRetrievalExercises(meta, planSlice, resourcesRows, { strict = false, findingsText = '' } = {}) {
    const fewshot =
      typeof PackHarness !== 'undefined' ? PackHarness.exerciseFewshotBlock() : '';
    const system = `你是提取练习出题人（Karpicke retrieval practice：闭卷回忆 > 重读）。
${DEPTH_CONTRACT}
硬性规则：只输出一个 JSON 数组。
每天 3 题必须彼此不同、且跨天不得复用同一题干骨架（禁止只改书名号里的主题词）。
${strict ? '【加严】上一稿同质或模板：必须换冲突角色、换产出形式、换考点；禁止定义题+扩大范围题+边界例子题三件套。' : ''}
${findingsText ? `【修复回灌】\n${findingsText}` : ''}
${fewshot ? `【金标准锚点】\n${fewshot}` : ''}`;
    const user = `## Audience
行业：${meta.industry}｜岗位：${meta.role}｜目标：${meta.goal || '入门'}

## Days（出题必须点名当日 tasks 里的具体动作/对象）
${JSON.stringify(
      planSlice.map((d) => ({
        day: d.day,
        topic: d.topic,
        phase: d.phase,
        tasks: d.tasks,
      }))
    ).slice(0, 3400)}

## 已有资料（可引用标题，勿问「去看链接」）
${JSON.stringify(resourcesRows).slice(0, 2200)}

## Task
[{"day":1,"exercises":[{"type":"recall|application|transfer","objective":"当日 topic","q":"","rubric":["",""],"ref":"可核对的参考答案","commonMistakes":["常见错误1"],"feedbackMode":"immediate|rubric|delayed-self-explain"}]}]
每天恰好 3 题，顺序和 type 固定：
1) recall：闭卷提取定义/差异/步骤中的一种，须含本日特有对象；feedbackMode=immediate
2) application：对照当日某条 task，问可检查结果（清单/字段/开场白/提纲等，每天换一种）；feedbackMode=rubric
3) transfer：换角色、约束或行业情境，要求迁移原则并说明调整；feedbackMode=delayed-self-explain
每题都必须有 objective、ref、rubric、commonMistakes、feedbackMode；ref 是参考答案，不是「自行思考」式提示。
严禁题干出现或等价于：
- 「用一句话总结今天/核心认知」
- 「合上资料，用工作语言定义「主题」」
- 「同事主张立刻扩大「主题」范围」
- 「一个该做、一个不该做的边界例子」
- 「举1个真实案例说明…在产品实践中的体现」「反思今日任务」
rubric 2-3 条可打分；commonMistakes 1-3 条。`;
    return chatJson({
      system,
      user,
      temperature: strict ? 0.35 : 0.4,
      max_tokens: 4200,
      stage: strict ? 'materials.exercises-strict' : 'materials.exercises',
    });
  }

  function exerciseRowsLookHomogeneous(exerciseRows) {
    const byDay = {};
    (exerciseRows || []).forEach((r) => {
      const day = Number(r.day);
      byDay[day] = (r.exercises || []).map((e) => e?.q || e?.question || '');
    });
    return isHomogeneousExerciseSet(byDay);
  }

  async function generateDayMaterialsChunk(pack, meta, planSlice, onProgress) {
    try {
      let resourceRows = [];
      let searchByDay = new Map();
      try {
        const curated = await curateDayResourceLinks(pack, meta, planSlice, onProgress);
        resourceRows = curated.rows || [];
        searchByDay = curated.searchByDay || new Map();
      } catch (e) {
        rethrowAbort(e);
        rethrowOperationalError(e);
        console.warn('[PackGenerator] resource curate failed', safeDiagnostic(e));
      }
      if (typeof TaskResourceBinder !== 'undefined' && TaskResourceBinder.bindDay) {
        planSlice.forEach((dayPlan) => {
          const row = resourceRows.find((item) => Number(item.day) === Number(dayPlan.day));
          Object.assign(
            dayPlan,
            TaskResourceBinder.bindDay({
              dayPlan,
              resources: row?.resources || [],
            })
          );
        });
      }
      let exerciseRows = [];
      try {
        const ex = await generateDayRetrievalExercises(meta, planSlice, resourceRows);
        exerciseRows = Array.isArray(ex) ? ex : ex.days || [];
        const flatQs = exerciseRows.flatMap((r) =>
          (r.exercises || []).map((e) => e?.q || e?.question || '')
        );
        const needRetry =
          flatQs.some((q) => isTemplateExerciseQuestion(q)) ||
          exerciseRowsLookHomogeneous(exerciseRows);
        if (needRetry) {
          console.warn('[PackGenerator] template/homogeneous exercises, strict retry');
          const findingsText =
            typeof PackHarness !== 'undefined'
              ? PackHarness.formatFindingsForPrompt([
                  {
                    type: 'homogeneous_or_template',
                    target: `days-${planSlice[0]?.day}-${planSlice[planSlice.length - 1]?.day}`,
                    message: '本周块练习同质或模板，须换考点与冲突角色',
                  },
                ])
              : '';
          const ex2 = await generateDayRetrievalExercises(meta, planSlice, resourceRows, {
            strict: true,
            findingsText,
          });
          exerciseRows = Array.isArray(ex2) ? ex2 : ex2.days || exerciseRows;
        }
      } catch (e) {
        rethrowAbort(e);
        rethrowOperationalError(e);
        console.warn('[PackGenerator] exercises failed', safeDiagnostic(e));
      }
      const byDay = new Map();
      for (const d of planSlice) {
        const row = resourceRows.find((r) => Number(r.day) === d.day) || {
          day: d.day,
          resources: [],
        };
        const exRow = exerciseRows.find((r) => Number(r.day) === d.day);
        const hits = row._hits || searchByDay.get(d.day) || [];
        const normalized = await normalizeDayMaterialRow(
          { day: d.day, resources: row.resources || [], exercises: exRow?.exercises || [] },
          d,
          meta,
          hits
        );
        byDay.set(d.day, normalized);
      }

      // 块内仍同质：用按日变化的 fallback 覆盖被污染的天
      const probe = {};
      byDay.forEach((v, k) => {
        probe[k] = v.exercises;
      });
      if (isHomogeneousExerciseSet(probe)) {
        console.warn('[PackGenerator] chunk still homogeneous, apply varied fallbacks');
        byDay.forEach((v, k) => {
          const dayPlan = planSlice.find((d) => Number(d.day) === Number(k)) || {
            day: k,
            topic: `Day ${k}`,
          };
          byDay.set(k, {
            ...v,
            exercises: buildVariedFallbackExercises(dayPlan, meta),
          });
        });
      }
      return [...byDay.values()];
    } catch (e) {
      rethrowAbort(e);
      rethrowOperationalError(e);
      console.warn('[PackGenerator] day materials chunk failed', safeDiagnostic(e));
      return [];
    }
  }

  /**
   * P3：精编每日外链 + 练习题写入 pack
   * @param {{ dayStart?: number, dayEnd?: number, merge?: boolean }} [rangeOpts]
   */
  async function attachDayMaterials(
    pack,
    onProgress = () => {},
    progressBase = 50,
    progressSpan = 20,
    rangeOpts = {}
  ) {
    const meta = {
      title: pack.meta?.title,
      industry: pack.meta?.industry,
      role: pack.meta?.role,
      goal: pack.meta?.goal,
      days: pack.meta?.days || pack.plan?.length || 30,
      notes: pack.meta?.notes || '',
    };
    const dayStart = Math.max(1, Number(rangeOpts.dayStart) || 1);
    const dayEnd = Math.max(dayStart, Number(rangeOpts.dayEnd) || Infinity);
    const merge = rangeOpts.merge === true;
    const restrictKinds =
      Array.isArray(rangeOpts.resourceDays) || Array.isArray(rangeOpts.exerciseDays);
    const resourceDays = new Set((rangeOpts.resourceDays || []).map(Number));
    const exerciseDays = new Set((rangeOpts.exerciseDays || []).map(Number));
    const plan = (pack.plan || []).filter((d) => d.day >= dayStart && d.day <= dayEnd);
    const dayResources = merge ? { ...(pack.dayResources || {}) } : {};
    const dayExercises = merge ? { ...(pack.dayExercises || {}) } : {};
    const applyRows = (slice, rows) => {
      const byDay = new Map((rows || []).map((row) => [Number(row.day), row]));
      slice.forEach((dayPlan) => {
        const normalized = byDay.get(dayPlan.day) || {
          day: dayPlan.day,
          resources: [],
          exercises: fallbackDayExercises(dayPlan, meta),
        };
        if (!restrictKinds || resourceDays.has(Number(normalized.day))) {
          dayResources[String(normalized.day)] = { resources: normalized.resources || [] };
        }
        if (!restrictKinds || exerciseDays.has(Number(normalized.day))) {
          dayExercises[String(normalized.day)] =
            normalized.exercises || fallbackDayExercises(dayPlan, meta);
        }
      });
      pack.dayResources = dayResources;
      pack.dayExercises = dayExercises;
      pack.updatedAt = new Date().toISOString();
    };
    const chunkSize = 7;
    const slices = [];
    for (let i = 0; i < plan.length; i += chunkSize) {
      slices.push(plan.slice(i, i + chunkSize));
    }
    const totalChunks = slices.length || 1;

    if (!plan.length) {
      onProgress('⑤ 本日段无课表可生成资料', progressBase + progressSpan);
      return pack;
    }

    onProgress(`⑤ 每日资料并行生成（Day ${dayStart}–${Math.min(dayEnd, plan[plan.length - 1].day)}，${totalChunks} 块）…`, progressBase);
    const chunkRows = await mapPool(
      slices,
      Math.min(2, LLM_CONCURRENCY),
      async (slice) => {
        const rows = await generateDayMaterialsChunk(pack, meta, slice, null);
        applyRows(slice, rows);
        if (typeof rangeOpts.onCheckpoint === 'function') {
          await rangeOpts.onCheckpoint(pack, {
            kind: 'materials',
            days: slice.map((item) => Number(item.day)).filter(Boolean),
          });
        }
        return { slice, rows };
      },
      (done, total) => {
        onProgress(
          `⑤ 资料周块完成 ${done}/${total}…`,
          progressBase + Math.round((done / total) * progressSpan)
        );
      }
    );

    chunkRows.forEach(({ slice, rows }) => applyRows(slice, rows));

    pack.dayResources = dayResources;
    pack.dayExercises = dayExercises;
    pack.updatedAt = new Date().toISOString();
    return pack;
  }

  function pendingChapterMarkdown(ch) {
    const title = String(ch?.title || '本章').trim() || '本章';
    return `# ${title}\n\n> 本章正在后台准备中，先学已就绪的前几天即可；完成后打开日课会自动更新。\n`;
  }

  function chapterDayNum(ch, plan) {
    const fromPlan = dayPlanFromChapter(ch, plan);
    if (fromPlan?.day) return Number(fromPlan.day);
    const m = String(ch?.days || '').match(/(\d+)/);
    return m ? Number(m[1]) : 0;
  }

  /**
   * 生成 hub 章节并写入 pack.hub
   * @param {{ dayStart?: number, dayEnd?: number, stubOutside?: boolean }} [rangeOpts]
   *   stubOutside：范围外章节写入「准备中」占位（骨架阶段用）
   */
  async function attachHub(
    pack,
    outline,
    onProgress = () => {},
    progressBase = 70,
    progressSpan = 28,
    rangeOpts = {}
  ) {
    const meta = {
      title: pack.meta?.title,
      industry: pack.meta?.industry,
      role: pack.meta?.role,
      goal: pack.meta?.goal,
      days: pack.meta?.days || pack.plan?.length || 30,
      notes: pack.meta?.notes || '',
    };
    const plan = pack.plan || [];
    const dayStart = Math.max(1, Number(rangeOpts.dayStart) || 1);
    const dayEnd = Math.max(dayStart, Number(rangeOpts.dayEnd) || Infinity);
    const stubOutside = rangeOpts.stubOutside === true;
    const mergeBodies = rangeOpts.mergeBodies === true;

    onProgress('⑥ 按课表生成「一天一章」日课导航…', progressBase);
    const structure =
      (mergeBodies && reusableHubStructure(pack, meta, outline || {}, plan)) ||
      (await generateHubStructure(meta, outline || {}, plan));
    const flat = [];
    structure.modules.forEach((m) => (m.chapters || []).forEach((c) => flat.push(c)));

    // 后台补全前后 plan.topic 可能变化，旧实现把 topic 写进 slug 后直接合并对象，
    // 会留下同一天的旧占位章（30 天最终变成 50+ 章）。按 day 迁移到本轮规范 slug，
    // 同时只保留当前导航中的 30 个 key。
    const chapters = {};
    if (mergeBodies && pack.hub?.chapters) {
      const previous = pack.hub.chapters;
      const previousByDay = new Map();
      Object.entries(previous).forEach(([slug, md]) => {
        const day = dayNumberFromChapter({ slug }, plan);
        if (day && !previousByDay.has(day)) previousByDay.set(day, md);
      });
      flat.forEach((ch) => {
        const day = chapterDayNum(ch, plan);
        const existing = previous[ch.slug] || previousByDay.get(day);
        if (existing) chapters[ch.slug] = existing;
      });
    }

    const toWrite = flat.filter((ch) => {
      const d = chapterDayNum(ch, plan);
      return d >= dayStart && d <= dayEnd;
    });
    const outside = stubOutside
      ? flat.filter((ch) => {
          const d = chapterDayNum(ch, plan);
          return d < dayStart || d > dayEnd;
        })
      : [];

    outside.forEach((ch) => {
      if (!chapters[ch.slug] || /后台准备中/.test(chapters[ch.slug] || '')) {
        chapters[ch.slug] = pendingChapterMarkdown(ch);
      }
    });
    pack.hub = {
      title: structure.title,
      learningPath: structure.learningPath,
      navigation: structureToNavigation(structure),
      chapters,
      generatedAt: new Date().toISOString(),
      dailyAligned: true,
    };

    /** 日章并行：每章内部仍是设计→深写串行；章与章之间限流并行 */
    onProgress(
      `⑦ 日课并行生成（Day ${dayStart}–${dayEnd === Infinity ? '末' : dayEnd}，并发 ${LLM_CONCURRENCY}）…`,
      progressBase + 2
    );
    const bodiesList = await mapPool(
      toWrite,
      LLM_CONCURRENCY,
      async (ch) => {
        const day = chapterDayNum(ch, plan);
        const evidenceSources =
          pack.dayResources?.[String(day)]?.resources ||
          pack.dayResources?.[day]?.resources ||
          [];
        const bodies = await generateHubBodies(meta, [ch], plan, evidenceSources);
        const md = rewriteRoleLensInText(
          bodies.get(ch.slug) || stubMarkdown(meta, ch),
          meta
        );
        chapters[ch.slug] = md;
        pack.hub.chapters = chapters;
        pack.updatedAt = new Date().toISOString();
        if (typeof rangeOpts.onCheckpoint === 'function') {
          await rangeOpts.onCheckpoint(pack, {
            kind: 'hub',
            days: [chapterDayNum(ch, plan)].filter(Boolean),
          });
        }
        return { slug: ch.slug, md };
      },
      (done, total) => {
        onProgress(
          `⑦ 日课完成 ${done}/${total}…`,
          progressBase + Math.round((done / Math.max(1, total)) * progressSpan)
        );
      }
    );
    bodiesList.forEach(({ slug, md }) => {
      chapters[slug] = md;
    });

    pack.hub.chapters = chapters;
    pack.hub.generatedAt = new Date().toISOString();
    pack.updatedAt = new Date().toISOString();

    // 定点重写仍带 shallow 标记的章节（最多 5 天，控成本）
    const shallowSlugs = toWrite
      .map((ch) => ch.slug)
      .filter((slug) => /<!--\s*zhijing:shallow\s*-->/.test(chapters[slug] || ''));
    if (shallowSlugs.length) {
      const retryList = shallowSlugs.slice(0, 5);
      onProgress(`⑦ 加厚阅读章节 ${retryList.length} 篇…`, progressBase + progressSpan - 2);
      await mapPool(retryList, Math.min(2, LLM_CONCURRENCY), async (slug) => {
        const ch = flat.find((c) => c.slug === slug);
        if (!ch) return;
        const day = chapterDayNum(ch, plan);
        const evidenceSources =
          pack.dayResources?.[String(day)]?.resources ||
          pack.dayResources?.[day]?.resources ||
          [];
        const bodies = await generateHubBodies(meta, [ch], plan, evidenceSources);
        let md = rewriteRoleLensInText(bodies.get(slug) || chapters[slug], meta);
        md = String(md || '').replace(/<!--\s*zhijing:shallow\s*-->/g, '').trim();
        if (!isShallowHubMarkdown(md, ch, { day: dayPlanFromChapter(ch, plan).day, plan })) {
          chapters[slug] = md;
        }
      });
      pack.hub.chapters = chapters;
      pack.updatedAt = new Date().toISOString();
    }

    return pack;
  }

  /**
   * 生成完成后置质量门禁：阶段单调、回链、练习去模板、记录诊断
   * @param {{ rewritePhases?: boolean }} [opts] 补生成知识库时勿重写已有 phase
   */
  function pruneHubChaptersToNavigation(pack) {
    const chapters = pack?.hub?.chapters;
    const navigation = pack?.hub?.navigation;
    if (!chapters || !Array.isArray(navigation)) return;
    const active = new Set(
      navigation.flatMap((mod) => (mod.items || []).map((item) => String(item.slug || '')).filter(Boolean))
    );
    if (!active.size) return;
    const pruned = {};
    active.forEach((slug) => {
      if (Object.prototype.hasOwnProperty.call(chapters, slug)) pruned[slug] = chapters[slug];
    });
    pack.hub.chapters = pruned;
  }

  function ensureWeeklyCumulativeCheckpoints(pack, outline = {}) {
    const plan = Array.isArray(pack?.plan) ? pack.plan : [];
    const totalWeeks = Math.ceil(plan.length / 7);
    const existing = Array.isArray(pack.weeklyCheckpoints) ? pack.weeklyCheckpoints : [];
    const byWeek = new Map(existing.map((item) => [Number(item.week), item]));
    const checkpoints = [];
    for (let week = 1; week <= totalWeeks; week++) {
      const days = plan.filter((row) => Math.ceil(Number(row.day) / 7) === week);
      if (!days.length) continue;
      const previousId = week > 1 ? `weekly-checkpoint-${week - 1}` : '';
      const theme =
        outline?.weekThemes?.find((item) => Number(item.week) === week)?.theme ||
        days[0]?.week ||
        days[0]?.topic ||
        `第 ${week} 周`;
      const current = byWeek.get(week) || {};
      checkpoints.push({
        ...current,
        id: `weekly-checkpoint-${week}`,
        week,
        title: String(current.title || `第 ${week} 周累计作品：${theme}`).slice(0, 100),
        days: `${days[0].day}-${days[days.length - 1].day}`,
        cumulative: true,
        buildsOn: previousId,
        objective: String(
          current.objective ||
            `整合本周 Day ${days[0].day}-${days[days.length - 1].day} 的判断与产出，并${week > 1 ? '迭代前周作品' : '形成首版作品'}`
        ),
        deliverable: String(
          current.deliverable ||
            `${theme}累计作品（含结论、证据、取舍记录与下一步）`
        ),
        rubric:
          Array.isArray(current.rubric) && current.rubric.length
            ? current.rubric.map(String)
            : ['承接本周每日产出', '结论能回链证据', '记录至少一个取舍', '明确下一周迭代点'],
        checkpoint: {
          ...(current.checkpoint || {}),
          evidenceRequired: true,
          reviewMode: current.checkpoint?.reviewMode || 'self-and-rubric',
        },
      });
    }
    pack.weeklyCheckpoints = checkpoints;
    const otherPortfolio = (pack.portfolio || []).filter(
      (item) => !String(item?.id || '').startsWith('weekly-checkpoint-')
    );
    const weeklyPortfolio = checkpoints.map((item) => ({
      id: item.id,
      title: item.title,
      phase:
        plan.find((row) => Number(row.day) === Number(item.days.split('-')[0]))?.phase || '',
      days: item.days,
      kind: 'weekly-checkpoint',
      cumulative: true,
      buildsOn: item.buildsOn,
      items: [
        item.deliverable,
        `按 ${item.rubric.join('；')} 完成 checkpoint`,
        item.buildsOn ? `说明相对 ${item.buildsOn} 的具体改动` : '保存首版基线',
      ],
    }));
    pack.portfolio = [...otherPortfolio, ...weeklyPortfolio];
    return checkpoints;
  }

  function getPackQualityContract() {
    if (typeof PackQualityContract !== 'undefined' && PackQualityContract) {
      return PackQualityContract;
    }
    return globalThis?.PackQualityContract || null;
  }

  function evaluateOptionalQualityContract(pack, quality) {
    const contract = getPackQualityContract();
    if (!contract) return { available: false, passed: true, findings: [] };
    try {
      const packEvaluator =
        (typeof contract === 'function' && contract) ||
        (typeof contract.evaluatePack === 'function' && contract.evaluatePack) ||
        (typeof contract.evaluate === 'function' && contract.evaluate) ||
        (typeof contract.check === 'function' && contract.check) ||
        (typeof contract.inspect === 'function' && contract.inspect) ||
        (typeof contract.validatePack === 'function' && contract.validatePack);
      const qualityEvaluator =
        !packEvaluator &&
        typeof contract.findingsFromQuality === 'function' &&
        contract.findingsFromQuality;
      if (!packEvaluator && !qualityEvaluator) {
        return { available: true, passed: true, findings: [] };
      }
      const result = packEvaluator
        ? packEvaluator.call(contract, pack, quality) || {}
        : { findings: qualityEvaluator.call(contract, quality) || [] };
      const rawFindings = Array.isArray(result)
        ? result
        : result.findings || result.errors || result.issues || [];
      return {
        available: true,
        passed:
          result.passed !== false &&
          result.ok !== false &&
          result.valid !== false &&
          (!Array.isArray(result.errors) || result.errors.length === 0),
        findings: (Array.isArray(rawFindings) ? rawFindings : [rawFindings]).filter(Boolean),
      };
    } catch (error) {
      console.warn('[PackGenerator] PackQualityContract fallback', error);
      return { available: true, passed: true, findings: [] };
    }
  }

  function exerciseAlignsWithDay(exercise, dayPlan) {
    const objective = String(exercise?.objective || '').trim();
    if (objective && objective === String(dayPlan?.topic || '').trim()) return true;
    const text = `${exercise?.q || ''} ${objective}`;
    const anchors = [dayPlan?.topic, ...(dayPlan?.tasks || [])]
      .flatMap((item) => tokenizeIntent(item))
      .filter((item) => item.length >= 2);
    return anchors.some((anchor) => text.includes(anchor));
  }

  function citationBacklinkMissingSlugs(pack) {
    const chapters = pack?.hub?.chapters || {};
    const plan = pack?.plan || [];
    return Object.entries(chapters)
      .filter(([slug, markdown]) => {
        const md = String(markdown || '');
        if (/本章正在后台准备中/.test(md)) return false;
        const day = dayNumberFromChapter({ slug }, plan);
        return !day || !hasSourceBoundHub(pack, day, day);
      })
      .map(([slug]) => slug);
  }

  function enrichV2LessonMetadata(pack) {
    const plan = Array.isArray(pack?.plan) ? pack.plan : [];
    const now = new Date().toISOString();
    pack.schemaVersion = Math.max(2, Number(pack.schemaVersion) || 0);
    pack.contentUpdatedAt = pack.contentUpdatedAt || now;
    pack.generation = {
      ...(pack.generation || {}),
      provenance: {
        ...(pack.generation?.provenance || {}),
        generator: pack.generation?.provenance?.generator || 'PackGenerator',
        model: pack.generation?.provenance?.model || 'runtime-configured-model',
        promptVersion: pack.generation?.provenance?.promptVersion || 'pack-v2',
        traceId:
          pack.generation?.provenance?.traceId ||
          (typeof PackHarness !== 'undefined' ? PackHarness.getSession?.()?.id : '') ||
          '',
        generatedAt: pack.generation?.provenance?.generatedAt || now,
      },
    };
    pack.plan = plan.map((dayPlan, index) => {
      const day = Number(dayPlan.day) || index + 1;
      const resources = pack.dayResources?.[String(day)]?.resources || [];
      const citations = resources
        .map((source) => source?.sourceId || source?.evidenceId || source?.evidence?.id)
        .map(String)
        .filter(Boolean);
      const previous = plan[index - 1];
      return {
        ...dayPlan,
        objective: String(dayPlan.objective || dayPlan.topic || '').trim(),
        prerequisites: Array.isArray(dayPlan.prerequisites)
          ? dayPlan.prerequisites.map(String).filter(Boolean)
          : previous?.topic
            ? [String(previous.topic)]
            : [],
        estimatedMinutes: Math.max(15, Number(dayPlan.estimatedMinutes) || 45),
        citations,
      };
    });
  }

  function runPackQualityGate(pack, outline, opts = {}) {
    if (!pack) return pack;
    pruneHubChaptersToNavigation(pack);
    const rewritePhases = opts.rewritePhases !== false;
    const o = outline || {
      phases: [],
      weekThemes: [],
      outcomes: pack.meta?.outcomes || null,
    };
    let plan = pack.plan || [];
    if (rewritePhases && Array.isArray(o.weekThemes) && o.weekThemes.length) {
      plan = applyPhaseFromOutline(plan, o);
    }
    pack.plan = injectHubBacklinkTasks(plan);
    ensureWeeklyCumulativeCheckpoints(pack, o);

    const dayExercises = { ...(pack.dayExercises || {}) };
    const gateMeta = {
      industry: pack.meta?.industry,
      role: pack.meta?.role,
      goal: pack.meta?.goal,
    };
    let wasHomogeneous = isHomogeneousExerciseSet(dayExercises);
    const usedStems = {};
    const exerciseDays = new Set([
      ...Object.keys(dayExercises),
      ...(pack.plan || []).map((row) => String(row.day)),
    ]);
    [...exerciseDays]
      .sort((a, b) => Number(a) - Number(b))
      .forEach((k) => {
        const dayPlan = (pack.plan || []).find((d) => String(d.day) === String(k)) || {
          day: Number(k),
          topic: `Day ${k}`,
          tasks: [],
        };
        let exs = Array.isArray(dayExercises[k]) ? dayExercises[k] : [];
        exs = exs.filter((ex) => !isTemplateExerciseQuestion(ex?.q));
        if (exs.length < 2) {
          exs = buildVariedFallbackExercises(dayPlan, gateMeta, { usedStemCounts: usedStems });
        } else {
          // 统计已有 stem，供后续天避让
          exs.forEach((ex) => {
            const fp = exerciseStemFingerprint(ex?.q);
            if (fp.length >= 8) usedStems[fp] = (usedStems[fp] || 0) + 1;
          });
        }
        dayExercises[k] = normalizeDailyExerciseContract(exs, dayPlan, gateMeta);
      });
    const soft = softQualityThresholds();
    const uniqNow = stemUniqueRatio(dayExercises);
    if (
      wasHomogeneous ||
      isHomogeneousExerciseSet(dayExercises) ||
      uniqNow < (soft.stemUniqueMin || 0.65)
    ) {
      console.warn('[PackGenerator] quality gate: stem budget rebuild exercises');
      wasHomogeneous = true;
      Object.assign(
        dayExercises,
        rebuildExercisesWithStemBudget(pack.plan || [], gateMeta, { preferHighBloom: false })
      );
    }
    pack.dayExercises = dayExercises;

    // 过滤搜索页；资料过多时丢掉软降权域名
    const dayResources = { ...(pack.dayResources || {}) };
    Object.keys(dayResources).forEach((k) => {
      const row = dayResources[k] || {};
      let resources = (row.resources || []).filter(
        (r) => r?.url && !isBlockedResourceUrl(r.url) && isSafeHttpUrl(r.url)
      );
      if (resources.length >= 3) {
        const preferred = resources.filter((r) => !isLowQualityLearningHost(r.url));
        if (preferred.length >= 2) resources = preferred;
      }
      dayResources[k] = { resources: bindResourceEvidence(resources.slice(0, 4)) };
    });
    pack.dayResources = dayResources;
    if (typeof TaskResourceBinder !== 'undefined' && TaskResourceBinder.bindPack) {
      TaskResourceBinder.bindPack(pack);
    }
    normalizePackLessonSourceSections(pack);
    enrichV2LessonMetadata(pack);

    const bloomIssues = diagnoseBloomRegression(pack.plan || [], pack.dayExercises);
    const planRef = pack.plan || [];
    const shallowChapters = Object.entries(pack.hub?.chapters || {})
      .filter(([slug, md]) => {
        const day = dayNumberFromChapter({ slug }, planRef);
        return (
          isShallowHubMarkdown(md, { slug }, { day, plan: planRef }) ||
          /<!--\s*zhijing:shallow\s*-->/.test(md)
        );
      })
      .map(([slug]) => slug);
    const thinLate = diagnoseThinLateChapters(pack);
    const lenStats = chapterLengthStats(pack);
    const stemUniq = stemUniqueRatio(pack.dayExercises);
    const softMin = soft.stemUniqueMin || 0.65;
    const medianMin = soft.chapterMedianMin || 2800;
    // 硬门只清理核心术语；按日/自定义词由各自生成入口验收，核心修复不得误删。
    pack.glossary = (pack.glossary || []).filter(
      (entry) =>
        entry?.sourceType === 'day' ||
        entry?.sourceType === 'custom' ||
        passesGlossaryQuality(entry)
    );
    const glossHit = glossaryHubHitRate(pack.glossary, pack);
    const glossStats = glossaryQualityStats(pack.glossary, { coreOnly: true });
    const phaseBackjumpDays =
      typeof PackWorkflowGate !== 'undefined' && PackWorkflowGate.phaseBackjumps
        ? PackWorkflowGate.phaseBackjumps(planRef)
        : [];
    const emptyResourceDays = (pack.plan || [])
      .map((row) => Number(row.day))
      .filter((day) => {
        const resources = pack.dayResources?.[String(day)]?.resources;
        return !Array.isArray(resources) || resources.length === 0;
      });
    const missingCitationChapterSlugs = citationBacklinkMissingSlugs(pack);
    const missingExerciseRefDays = [];
    const exerciseObjectiveMismatchDays = [];
    for (const dayPlan of pack.plan || []) {
      const exercises = pack.dayExercises?.[String(dayPlan.day)] || [];
      if (
        exercises.length !== 3 ||
        exercises.some(
          (exercise, index) =>
            exercise.type !== ['recall', 'application', 'transfer'][index] ||
            !exercise.ref ||
            !exercise.rubric?.length ||
            !exercise.commonMistakes?.length ||
            !exercise.feedbackMode
        )
      ) {
        missingExerciseRefDays.push(Number(dayPlan.day));
      }
      if (exercises.some((exercise) => !exerciseAlignsWithDay(exercise, dayPlan))) {
        exerciseObjectiveMismatchDays.push(Number(dayPlan.day));
      }
    }
    const expectedWeeks = Math.ceil((pack.plan || []).length / 7);
    const checkpointWeeks = new Set(
      (pack.weeklyCheckpoints || [])
        .filter((item) => item?.cumulative && item?.deliverable && item?.rubric?.length)
        .map((item) => Number(item.week))
    );
    const missingCumulativeWeeks = Array.from(
      { length: expectedWeeks },
      (_, index) => index + 1
    ).filter((week) => !checkpointWeeks.has(week));

    pack.meta = pack.meta || {};
    pack.meta.quality = {
      checkedAt: new Date().toISOString(),
      templateExerciseCount: countTemplateExercises(pack.dayExercises),
      homogeneousExercisesFixed: wasHomogeneous,
      homogeneousExercises: isHomogeneousExerciseSet(pack.dayExercises),
      stemUniqueRatio: Number(stemUniq.toFixed(3)),
      stemUniqueOk: stemUniq >= softMin,
      bloomRegressionWeeks: bloomIssues,
      shallowChapterCount: shallowChapters.length,
      shallowChapterSlugs: shallowChapters.slice(0, 12),
      thinLateChapterCount: thinLate.length,
      thinLateChapterSlugs: thinLate.slice(0, 12),
      chapterMedianLen: lenStats.median,
      chapterMedianOk: lenStats.median >= medianMin,
      chapterLenStats: lenStats,
      glossaryHubHitRate: Number(glossHit.toFixed(3)),
      glossaryFromHub: !!pack.meta.glossaryFromHub,
      glossaryCount: glossStats.total,
      glossaryTotalCount: pack.glossary.length,
      glossaryPassCount: glossStats.passCount,
      glossaryPassRate: Number(glossStats.passRate.toFixed(3)),
      glossaryEnough: glossStats.enoughCount,
      glossaryKindCount: glossStats.kindCount,
      glossaryKinds: glossStats.kinds,
      phaseMonotonic: phaseBackjumpDays.length === 0,
      phaseBackjumpDays,
      emptyResourceDays,
      emptyResourceCount: emptyResourceDays.length,
      missingCitationChapterSlugs: missingCitationChapterSlugs.slice(0, 20),
      missingCitationChapterCount: missingCitationChapterSlugs.length,
      missingExerciseRefDays,
      exerciseObjectiveMismatchDays,
      missingCumulativeWeeks,
      needsReview:
        shallowChapters.length > Math.ceil((pack.plan?.length || 30) * 0.2) ||
        thinLate.length > 3 ||
        stemUniq < softMin * 0.9 ||
        (bloomIssues.length >= 2 && lenStats.median < medianMin) ||
        (pack.meta.glossaryFromHub && glossHit < 0.7) ||
        !glossStats.enoughCount ||
        (pack.glossary?.length > 0 && glossStats.passRate < 0.85) ||
        glossStats.kindCount < 2 ||
        phaseBackjumpDays.length > 0 ||
        emptyResourceDays.length > 0 ||
        missingCitationChapterSlugs.length > 0 ||
        missingExerciseRefDays.length > 0 ||
        exerciseObjectiveMismatchDays.length > 0 ||
        missingCumulativeWeeks.length > 0,
    };
    pack.evaluation = {
      ...(pack.evaluation || {}),
      status: pack.meta.quality.needsReview ? 'needs-review' : 'passed',
      evaluatedAt: pack.meta.quality.checkedAt,
      findings: [],
    };
    const contractResult = evaluateOptionalQualityContract(pack, pack.meta.quality);
    pack.meta.quality.contractAvailable = contractResult.available;
    pack.meta.quality.contractPassed = contractResult.passed;
    pack.meta.quality.contractFindings = contractResult.findings;
    if (!contractResult.passed || contractResult.findings.length) {
      pack.meta.quality.needsReview = true;
      pack.evaluation.status = 'needs-review';
    }
    pack.evaluation.findings = contractResult.findings;
    if (typeof PackHarness !== 'undefined') {
      PackHarness.setRole('evaluator');
      PackHarness.findingsFromQuality(pack.meta.quality);
    }

    pack.updatedAt = new Date().toISOString();
    return pack;
  }

  /**
   * Harness Loop：按 findings 定点修复浅文 / 薄后段 / Bloom / stem（ReAct）
   */
  async function repairPackWithHarness(pack, outline, onProgress = () => {}) {
    if (typeof PackHarness === 'undefined' || !PackHarness.shouldRepair(pack.meta?.quality)) {
      return pack;
    }
    const meta = {
      title: pack.meta?.title,
      industry: pack.meta?.industry,
      role: pack.meta?.role,
      goal: pack.meta?.goal,
      days: pack.meta?.days || pack.plan?.length || 30,
      notes: pack.meta?.notes || '',
    };
    const plan = pack.plan || [];
    const maxRounds = PackHarness.getSession()?.contract?.budgets?.maxRepairRounds || 3;
    const maxShallow =
      PackHarness.getSession()?.contract?.budgets?.maxShallowRepairsPerRound || 5;
    const soft = PackHarness.softThresholds?.() || PackHarness.SOFT_QUALITY || {};

    const repairResult = await PackHarness.runLoop({
      name: 'pack-repair',
      maxRounds,
      act: async (round) => {
        PackHarness.setRole('generator');
        onProgress(`⑨ 自动完善内容（第 ${round} 轮）…`, 99);
        const q = pack.meta?.quality || {};
        const findings = PackHarness.findingsFromQuality(q);
        const findingsText = PackHarness.formatFindingsForPrompt(findings);
        const gateMeta = {
          industry: meta.industry,
          role: meta.role,
          goal: meta.goal,
        };

        const needGlossaryRepair =
          q.glossaryEnough === false ||
          (q.glossaryPassRate ?? 0) < 0.85 ||
          (q.glossaryKindCount || 0) < 2;
        if (needGlossaryRepair) {
          try {
            onProgress(`⑨ 完善术语库（已完成 ${q.glossaryPassCount || 0} 条）…`, 99);
            const regenerated = await generateGlossary(meta, outline, undefined, pack);
            const nextStats = glossaryQualityStats(regenerated, { coreOnly: true });
            const currentStats = glossaryQualityStats(pack.glossary, { coreOnly: true });
            if (
              nextStats.passCount > currentStats.passCount ||
              (nextStats.passCount === currentStats.passCount &&
                nextStats.kindCount > currentStats.kindCount)
            ) {
              pack.glossary = replaceCoreGlossary(pack.glossary, regenerated);
              pack.meta.glossaryFromHub = true;
            }
          } catch (e) {
            rethrowAbort(e);
            console.warn('[PackGenerator] harness glossary repair failed', e);
          }
        }

        // 修浅文 + 后段偏薄章节（合并去重，控每轮上限）
        const slugSet = new Set([
          ...(q.shallowChapterSlugs || []),
          ...(q.thinLateChapterSlugs || []),
          ...(q.missingCitationChapterSlugs || []),
        ]);
        // 中位偏薄时再塞最短的几章
        if (q.chapterMedianOk === false && pack.hub?.chapters) {
          const ranked = Object.entries(pack.hub.chapters)
            .map(([slug, md]) => ({ slug, len: String(md || '').length }))
            .sort((a, b) => a.len - b.len)
            .slice(0, maxShallow);
          ranked.forEach((r) => slugSet.add(r.slug));
        }
        const slugs = [...slugSet].slice(0, maxShallow);
        if (slugs.length && pack.hub?.chapters) {
          const flat = [];
          (pack.hub.navigation || []).forEach((mod) =>
            (mod.items || []).forEach((it) => {
              if (slugs.includes(it.slug)) {
                flat.push({
                  slug: it.slug,
                  title: it.title,
                  days: it.days,
                  focus: it.title,
                });
              }
            })
          );
          const found = new Set(flat.map((ch) => ch.slug));
          slugs
            .filter((slug) => !found.has(slug))
            .forEach((slug) => {
              flat.push({
                slug,
                title: slug.split('/').pop() || slug,
                days: String(slug.match(/day-(\d+)/i)?.[1] || ''),
                focus: slug,
              });
            });
          await mapPool(flat, Math.min(2, LLM_CONCURRENCY), async (ch) => {
            const day = dayNumberFromChapter(ch, plan);
            const evidenceSources =
              pack.dayResources?.[String(day)]?.resources ||
              pack.dayResources?.[day]?.resources ||
              [];
            const bodies = await generateHubBodies(meta, [ch], plan, evidenceSources);
            let md = rewriteRoleLensInText(
              bodies.get(ch.slug) || pack.hub.chapters[ch.slug],
              meta
            );
            md = String(md || '').replace(/<!--\s*zhijing:shallow\s*-->/g, '').trim();
            const previous = String(pack.hub.chapters[ch.slug] || '');
            const passes = md && !isShallowHubMarkdown(md, ch, { day, plan });
            const materiallyBetter = md.length >= previous.length + 600;
            if (passes || materiallyBetter) pack.hub.chapters[ch.slug] = md;
          });
        }

        const needExerciseRepair =
          q.homogeneousExercises ||
          (q.templateExerciseCount || 0) > 0 ||
          q.stemUniqueOk === false ||
          (q.bloomRegressionWeeks || []).length > 0 ||
          (q.missingExerciseRefDays || []).length > 0 ||
          (q.exerciseObjectiveMismatchDays || []).length > 0;

        if (needExerciseRepair) {
          // Bloom 回退周：优先高 Bloom 骨架重建该周练习
          const bloomWeeks = new Set((q.bloomRegressionWeeks || []).map((w) => Number(w.week)));
          if (bloomWeeks.size) {
            const used = {};
            // 先登记其他周已有 stem，避免撞车
            Object.entries(pack.dayExercises || {}).forEach(([k, exs]) => {
              const day = Number(k);
              const week = Math.ceil(day / 7) || 1;
              if (bloomWeeks.has(week)) return;
              (exs || []).forEach((ex) => {
                const fp = exerciseStemFingerprint(ex?.q);
                if (fp.length >= 8) used[fp] = (used[fp] || 0) + 1;
              });
            });
            plan.forEach((d) => {
              const week = Math.ceil(Number(d.day) / 7) || 1;
              if (!bloomWeeks.has(week)) return;
              pack.dayExercises[String(d.day)] = buildVariedFallbackExercises(d, gateMeta, {
                usedStemCounts: used,
                preferHighBloom: true,
              });
            });
          }

          // stem / 同质 / 模板：strict 重出前两周，再 stem 预算兜底
          if (
            q.homogeneousExercises ||
            (q.templateExerciseCount || 0) > 0 ||
            q.stemUniqueOk === false
          ) {
            const slice = plan.slice(0, Math.min(14, plan.length));
            const resourceRows = slice.map((d) => ({
              day: d.day,
              resources: (pack.dayResources?.[String(d.day)] || {}).resources || [],
            }));
            try {
              const ex = await generateDayRetrievalExercises(meta, slice, resourceRows, {
                strict: true,
                findingsText,
              });
              const exerciseRows = Array.isArray(ex) ? ex : ex.days || [];
              for (const d of slice) {
                const exRow = exerciseRows.find((r) => Number(r.day) === d.day);
                const normalized = await normalizeDayMaterialRow(
                  {
                    day: d.day,
                    resources: resourceRows.find((r) => r.day === d.day)?.resources || [],
                    exercises: exRow?.exercises || [],
                  },
                  d,
                  meta,
                  []
                );
                pack.dayExercises[String(d.day)] = normalized.exercises;
                pack.dayResources[String(d.day)] = { resources: normalized.resources };
              }
            } catch (e) {
              rethrowAbort(e);
              console.warn('[PackGenerator] harness exercise repair failed', e);
            }
            const uniqAfter = stemUniqueRatio(pack.dayExercises);
            if (
              uniqAfter < (soft.stemUniqueMin || 0.65) ||
              q.homogeneousExercises ||
              (q.templateExerciseCount || 0) > 0
            ) {
              pack.dayExercises = rebuildExercisesWithStemBudget(plan, gateMeta, {
                preferHighBloom: bloomWeeks.size > 0,
                maxPerStem: soft.maxStemRepeats || 2,
              });
            }
          }
        }

        PackHarness.setRole('evaluator');
        runPackQualityGate(pack, outline, { rewritePhases: false });
        return { quality: pack.meta?.quality };
      },
      observe: async (_round, actionResult) => {
        const quality = actionResult?.quality || pack.meta?.quality || {};
        const shallow = quality.shallowChapterCount || 0;
        const thin = quality.thinLateChapterCount || 0;
        const templates = quality.templateExerciseCount || 0;
        const homo = !!quality.homogeneousExercises;
        const bloom = (quality.bloomRegressionWeeks || []).length;
        const stem = Math.round((quality.stemUniqueRatio || 0) * 100);
        const med = quality.chapterMedianLen || 0;
        const gloss = quality.glossaryPassCount || 0;
        const kinds = quality.glossaryKindCount || 0;
        const evidence =
          (quality.emptyResourceDays || []).length +
          (quality.missingCitationChapterSlugs || []).length;
        const exerciseContract =
          (quality.missingExerciseRefDays || []).length +
          (quality.exerciseObjectiveMismatchDays || []).length;
        const cumulative = (quality.missingCumulativeWeeks || []).length;
        const progressKey = `s${shallow}|n${thin}|t${templates}|h${homo ? 1 : 0}|b${bloom}|u${stem}|m${med}|g${gloss}|k${kinds}|e${evidence}|x${exerciseContract}|c${cumulative}`;
        const done = !PackHarness.shouldRepair(quality);
        return { done, progressKey, quality };
      },
      onNoProgress: async () => {
        const gateMeta = {
          industry: meta.industry,
          role: meta.role,
          goal: meta.goal,
        };
        pack.dayExercises = rebuildExercisesWithStemBudget(plan, gateMeta, {
          preferHighBloom: true,
          maxPerStem: soft.maxStemRepeats || 2,
        });
        runPackQualityGate(pack, outline, { rewritePhases: false });
      },
    });
    pack.meta.quality.repair = {
      passed: !!repairResult.ok,
      reason: repairResult.ok ? 'completed' : repairResult.reason || 'unknown',
      rounds: Number(repairResult.round) || 0,
      finishedAt: new Date().toISOString(),
    };

    return pack;
  }

  /**
   * @param {object} meta { title, industry, role, goal, days, notes }
   * @param {(msg:string, pct:number)=>void} onProgress
   * @param {{ signal?: AbortSignal, skeletonDays?: number, onSkeletonReady?: (pack:object)=>void }} [opts]
   */
  async function generate(meta, onProgress = () => {}, opts = {}) {
    beginJob(opts.signal);
    let sessionOutcome = 'ok';
    if (typeof PackHarness !== 'undefined') {
      PackHarness.beginSession(meta);
      PackHarness.setRole('planner');
    }
    try {
      throwIfAborted();
      const days = Math.min(90, Math.max(7, Number(meta.days) || 30));
      const skeletonDays = Math.min(
        days,
        Math.max(1, Number(opts.skeletonDays) || 3)
      );
      const m = { ...meta, days };
      _searchCache.clear();

      const searchOn = hasSearchKey();
      onProgress(
        searchOn
          ? '① 联网摸底行业 → 分析学习成果…'
          : '① 分析学习成果（未启用联网搜索，将主要依赖模型）…',
        3
      );
      if (typeof PackHarness !== 'undefined') PackHarness.span('pipeline.outline');
      const outline = await generateOutline(m);

      // ── 骨架：先出前几天可学内容 ──
      if (typeof PackHarness !== 'undefined') PackHarness.setRole('generator');
      const firstChunkEnd = Math.min(days, Math.max(skeletonDays, Math.min(CHUNK, days)));
      onProgress(`② 先排前 ${firstChunkEnd} 天课表（骨架）…`, 8);
      const firstChunk = await generatePlanChunk(m, outline, 1, firstChunkEnd);
      let plan = injectHubBacklinkTasks(
        applyPhaseFromOutline(fillMissingDays(firstChunk, days, outline), outline)
      );

      const pack = ContentPack.emptyPack({
        ...m,
        title: outline.title || m.title,
        id: ContentPack.uid(),
      });
      pack.plan = plan;
      pack.glossary = [];
      pack.interview = [];
      pack.skills = [
        { id: 'industry', label: '行业认知', desc: '' },
        { id: 'domain', label: '领域方法', desc: '' },
        { id: 'product', label: '产品/业务能力', desc: '' },
        { id: 'execution', label: '落地执行', desc: '' },
        { id: 'portfolio', label: '作品集', desc: '' },
        { id: 'interview', label: '面试表达', desc: '' },
      ];
      pack.portfolio = [];
      pack.meta = pack.meta || {};
      pack.meta.outcomes = outline.outcomes || null;
      pack.meta.generation = {
        phase: 'skeleton',
        readyThroughDay: 0,
        skeletonDays,
        outlineSnapshot: {
          title: outline.title,
          phases: outline.phases,
          weekThemes: outline.weekThemes,
          hotKeywords: outline.hotKeywords,
          outcomes: outline.outcomes,
        },
      };
      pack.hot = {
        keywords:
          outline.hotKeywords ||
          [`${m.industry} ${m.role} 新闻`, `${m.industry} 融资`, `${m.industry} 政策`],
        systemHint: `面向「${m.industry}」行业「${m.role}」读者策展产业日课。`,
      };
      pack.status = 'partial';

      onProgress(`⑤ 先锁定 Day 1–${skeletonDays} 学习来源…`, 14);
      await attachDayMaterials(
        pack,
        (msg, pct) =>
          onProgress(
            msg || '⑤ 骨架资料…',
            typeof pct === 'number' ? Math.min(24, 14 + (pct - 50) * 0.16) : 18
          ),
        14,
        10,
        { dayStart: 1, dayEnd: skeletonDays, merge: false }
      );
      throwIfAborted();
      ContentPack.save(pack);
      onProgress('⑥ 来源已锁定，按同一来源生成首批日课…', 24);
      await attachHub(
        pack,
        outline,
        (msg, pct) =>
          onProgress(
            msg || '⑦ 骨架日课…',
            typeof pct === 'number' ? Math.min(34, 24 + (pct - 70) * 0.3) : 28
          ),
        24,
        10,
        { dayStart: 1, dayEnd: skeletonDays, stubOutside: true }
      );

      // 骨架阶段不提前生成残缺术语；完整知识库完成后统一抽取并过硬门。
      pack.glossary = [];
      pack.meta.glossaryFromHub = false;
      pack.meta.glossaryHubHitRate = 0;
      const initialReadyThroughDay = contiguousReadyThroughDay(pack, days);
      pack.meta.generation = {
        ...pack.meta.generation,
        phase: 'filling',
        readyThroughDay: initialReadyThroughDay,
      };
      pack.status = 'partial';
      pack.updatedAt = new Date().toISOString();
      throwIfAborted();
      ContentPack.save(pack);
      onProgress(
        initialReadyThroughDay > 0
          ? `前 ${initialReadyThroughDay} 天已可学习，其余课表后台补全中…`
          : '首批日课正在通过来源与练习完整性检查…',
        36
      );
      try {
        opts.onSkeletonReady?.(pack);
      } catch (cbErr) {
        console.warn('[PackGenerator] onSkeletonReady', cbErr);
      }

      // ── 后台补全 ──
      return await fillPackRemainder(pack, outline, m, onProgress, {
        firstChunkEnd,
        skeletonDays,
        onDayReady: opts.onDayReady,
      });
    } catch (error) {
      sessionOutcome = isAbortError(error) ? 'cancelled' : 'failed';
      throw error;
    } finally {
      if (typeof PackHarness !== 'undefined') PackHarness.endSession(sessionOutcome);
      endJob();
    }
  }

  function outlineFromPack(pack) {
    const snap = pack?.meta?.generation?.outlineSnapshot;
    if (snap && typeof snap === 'object') {
      return {
        title: snap.title || pack.meta?.title,
        phases: snap.phases || [],
        weekThemes: snap.weekThemes || [],
        hotKeywords: snap.hotKeywords || pack.hot?.keywords || [],
        outcomes: snap.outcomes || pack.meta?.outcomes || null,
      };
    }
    const plan = pack.plan || [];
    const outline = {
      title: pack.meta?.title,
      phases: [],
      weekThemes: [],
      hotKeywords: pack.hot?.keywords || [],
      outcomes: pack.meta?.outcomes || null,
    };
    for (let d = 1; d <= (pack.meta?.days || plan.length); d += 7) {
      const end = Math.min(d + 6, pack.meta?.days || plan.length);
      const sample = plan.find((p) => p.day === d) || plan[d - 1];
      outline.weekThemes.push({
        week: Math.ceil(d / 7),
        theme: sample?.topic || `第 ${Math.ceil(d / 7)} 周`,
        dayStart: d,
        dayEnd: end,
      });
    }
    const phaseNames = [...new Set(plan.map((p) => p.phase).filter(Boolean))];
    outline.phases = (phaseNames.length ? phaseNames : ['认知', '方法', '实战', '面试']).map(
      (name) => ({
        name,
        weeks: '',
        focus: name,
      })
    );
    return outline;
  }

  function mergePlanByDay(basePlan, chunks, days, outline) {
    const byDay = new Map();
    (basePlan || []).forEach((d) => {
      if (d?.day) byDay.set(Number(d.day), d);
    });
    (chunks || []).flat().forEach((d) => {
      if (d?.day) byDay.set(Number(d.day), d);
    });
    const merged = [];
    for (let i = 1; i <= days; i++) {
      if (byDay.has(i)) merged.push(byDay.get(i));
    }
    return injectHubBacklinkTasks(
      applyPhaseFromOutline(fillMissingDays(merged, days, outline), outline)
    );
  }

  function hasCompletePlan(pack, days) {
    const present = new Set(
      (pack?.plan || [])
        .map((row) => Number(row?.day))
        .filter((day) => Number.isInteger(day) && day >= 1 && day <= days)
    );
    return present.size === days;
  }

  function hasCompleteDayMaterials(pack, dayStart, dayEnd) {
    for (let day = dayStart; day <= dayEnd; day++) {
      const resources = pack?.dayResources?.[String(day)] || pack?.dayResources?.[day];
      const exercises = pack?.dayExercises?.[String(day)] || pack?.dayExercises?.[day];
      const sourceRows = Array.isArray(resources?.resources) ? resources.resources : [];
      const validSources =
        sourceRows.length > 0 &&
        sourceRows.every(
          (source) =>
            String(source?.sourceId || source?.id || '').trim() &&
            String(source?.title || '').trim() &&
            isSafeHttpUrl(source?.url) &&
            String(source?.publisher || '').trim() &&
            String(source?.retrievedAt || '').trim() &&
            String(source?.sourceTier || source?.trustTier || '').trim() &&
            String(source?.sourceTier || source?.trustTier || '').toLowerCase() !== 'unknown'
        );
      const requiredTypes = ['recall', 'application', 'transfer'];
      const validExercises =
        Array.isArray(exercises) &&
        exercises.length === requiredTypes.length &&
        exercises.every(
          (item, index) =>
            String(item?.type || '') === requiredTypes[index] &&
            String(item?.q || item?.question || '').trim() &&
            String(item?.ref || '').trim() &&
            Array.isArray(item?.rubric) &&
            item.rubric.filter((value) => String(value).trim()).length >= 2 &&
            Array.isArray(item?.commonMistakes) &&
            item.commonMistakes.some((value) => String(value).trim()) &&
            String(item?.feedbackMode || '').trim()
        );
      if (!validSources || !validExercises) return false;
    }
    return true;
  }

  function hasCompleteHub(pack, dayStart, dayEnd) {
    const navigation = (pack?.hub?.navigation || []).flatMap((module) => module?.items || []);
    const chapters = pack?.hub?.chapters || {};
    const plan = pack?.plan || [];
    for (let day = dayStart; day <= dayEnd; day++) {
      const item = navigation.find((entry) => dayNumberFromChapter(entry, plan) === day);
      const markdown = item?.slug ? String(chapters[item.slug] || '').trim() : '';
      if (
        markdown.length < 80 ||
        /本章正在后台准备中|<!--\s*zhijing:shallow\s*-->/.test(markdown) ||
        isShallowHubMarkdown(markdown, item, { day, plan })
      ) {
        return false;
      }
    }
    return true;
  }

  function lessonBodyRequiresInlineCitation(markdown) {
    const sourceAt = String(markdown || '').search(/##\s*(?:来源|证据来源|Sources?)/i);
    const body = sourceAt >= 0 ? String(markdown).slice(0, sourceAt) : String(markdown || '');
    return (
      /20\d{2}\s*年/.test(body) ||
      /(?:同比|环比|增长|下降|市场规模|渗透率|转化率|营收|成本)[^\n]{0,40}(?:\d+(?:\.\d+)?%|\d+(?:\.\d+)?\s*(?:万|亿|元|美元))/.test(body)
    );
  }

  function hasSourceBoundHub(pack, dayStart, dayEnd) {
    const navigation = (pack?.hub?.navigation || []).flatMap((module) => module?.items || []);
    const chapters = pack?.hub?.chapters || {};
    const plan = pack?.plan || [];
    for (let day = dayStart; day <= dayEnd; day++) {
      const item = navigation.find((entry) => dayNumberFromChapter(entry, plan) === day);
      const markdown = item?.slug ? String(chapters[item.slug] || '') : '';
      const sourceAt = markdown.search(/##\s*(?:来源|证据来源|Sources?)/i);
      if (sourceAt < 0) return false;
      const body = markdown.slice(0, sourceAt);
      const sourceSection = markdown.slice(sourceAt);
      const citedIds = [
        ...new Set([...body.matchAll(/\[(S\d+)\]/gi)].map((match) => match[1].toUpperCase())),
      ];
      const resources =
        pack?.dayResources?.[String(day)]?.resources ||
        pack?.dayResources?.[day]?.resources ||
        [];
      const sourceById = new Map(
        resources
          .map((source) => [
            String(source?.sourceId || source?.id || '').trim().toUpperCase(),
            String(source?.url || '').trim(),
          ])
          .filter(([id, url]) => id && url)
      );
      const planDay = plan.find((row) => Number(row?.day) === day);
      const lessonCitations = Array.isArray(planDay?.citations)
        ? planDay.citations.map((id) => String(id).toUpperCase())
        : [];
      if (lessonBodyRequiresInlineCitation(markdown) && !citedIds.length) return false;
      const requiredIds = [...new Set([...citedIds, ...lessonCitations])];
      if (!requiredIds.length) return false;
      const allBound = requiredIds.every((id) => {
        const url = sourceById.get(id);
        if (!url) return false;
        return sourceSection
          .split('\n')
          .some(
            (line) =>
              line.toUpperCase().includes(`[${id.toUpperCase()}]`) &&
              line.includes(url)
          );
      });
      if (!allBound) return false;
    }
    return true;
  }

  function contiguousReadyThroughDay(pack, daysInput) {
    const days = Math.min(
      90,
      Math.max(0, Number(daysInput) || Number(pack?.meta?.days) || pack?.plan?.length || 0)
    );
    let ready = 0;
    for (let day = 1; day <= days; day++) {
      const decision =
        typeof PackWorkflowGate !== 'undefined' &&
        typeof PackWorkflowGate.evaluateDay === 'function'
          ? PackWorkflowGate.evaluateDay(pack, day)
          : null;
      if (decision ? !decision.passed : (
        !hasCompleteHub(pack, day, day) ||
        !hasSourceBoundHub(pack, day, day) ||
        !hasCompleteDayMaterials(pack, day, day)
      )) break;
      ready = day;
    }
    return ready;
  }

  function consecutiveDayRanges(daysInput, maxDay = 90) {
    const days = [...new Set((daysInput || []).map(Number))]
      .filter((day) => Number.isInteger(day) && day >= 1 && day <= maxDay)
      .sort((a, b) => a - b);
    const ranges = [];
    days.forEach((day) => {
      const current = ranges[ranges.length - 1];
      if (current && day === current.end + 1) current.end = day;
      else ranges.push({ start: day, end: day });
    });
    return ranges;
  }

  const LESSON_MICRO_BATCH_SIZE = 3;
  const DAY_TARGETED_REPAIR_ROUNDS = 2;

  function lessonMicroBatchRanges(dayStart, dayEnd, batchSize = LESSON_MICRO_BATCH_SIZE) {
    const start = Math.max(1, Number(dayStart) || 1);
    const end = Math.max(start, Number(dayEnd) || start);
    const size = Math.max(1, Number(batchSize) || LESSON_MICRO_BATCH_SIZE);
    const ranges = [];
    for (let day = start; day <= end; day += size) {
      ranges.push({ start: day, end: Math.min(end, day + size - 1) });
    }
    return ranges;
  }

  function evaluateLessonDay(pack, day) {
    if (
      typeof PackWorkflowGate !== 'undefined' &&
      typeof PackWorkflowGate.evaluateDay === 'function'
    ) {
      return PackWorkflowGate.evaluateDay(pack, day);
    }
    const passed =
      hasCompleteDayMaterials(pack, day, day) &&
      hasCompleteHub(pack, day, day) &&
      hasSourceBoundHub(pack, day, day);
    return {
      day,
      passed,
      findings: passed
        ? []
        : [{ day, severity: 'hard', code: 'lesson.incomplete', target: 'lesson' }],
    };
  }

  function dayRepairTargets(decisions = []) {
    const resources = new Set();
    const exercises = new Set();
    const hub = new Set();
    decisions
      .filter((decision) => decision && !decision.passed)
      .forEach((decision) => {
        const day = Number(decision.day);
        const findings = Array.isArray(decision.findings) ? decision.findings : [];
        if (!findings.length) {
          resources.add(day);
          exercises.add(day);
          hub.add(day);
          return;
        }
        findings.forEach((finding) => {
          const target = String(finding?.target || '');
          const code = String(finding?.code || '');
          if (target === 'sources' || code.startsWith('source.')) resources.add(day);
          if (target === 'exercises' || code.startsWith('exercise.')) exercises.add(day);
          if (
            target === 'lesson' ||
            target === 'citations' ||
            target === 'plan' ||
            code.startsWith('lesson.') ||
            code.startsWith('citation.')
          ) {
            hub.add(day);
          }
        });
      });
    resources.forEach((day) => hub.add(day));
    return {
      resources: [...resources].sort((a, b) => a - b),
      exercises: [...exercises].sort((a, b) => a - b),
      hub: [...hub].sort((a, b) => a - b),
    };
  }

  async function processLessonMicroBatches(
    pack,
    outline,
    dayStart,
    dayEnd,
    onProgress = () => {},
    onCheckpoint = async () => {}
  ) {
    const ranges = lessonMicroBatchRanges(dayStart, dayEnd);
    pack.meta = pack.meta || {};
    pack.meta.generation = pack.meta.generation || {};
    pack.meta.generation.dayStates = { ...(pack.meta.generation.dayStates || {}) };

    for (let batchIndex = 0; batchIndex < ranges.length; batchIndex++) {
      throwIfAborted();
      const range = ranges[batchIndex];
      const batchDays = Array.from(
        { length: range.end - range.start + 1 },
        (_, index) => range.start + index
      );
      const progressStart = 52 + Math.round((batchIndex / Math.max(1, ranges.length)) * 32);
      const progressEnd = 52 + Math.round(((batchIndex + 1) / Math.max(1, ranges.length)) * 32);
      onProgress(
        `生成 Day ${range.start}–${range.end}：来源 → 日课 → 当日验收…`,
        progressStart
      );

      let decisions = batchDays.map((day) => evaluateLessonDay(pack, day));
      for (let round = 0; round <= DAY_TARGETED_REPAIR_ROUNDS; round++) {
        const failed = decisions.filter((decision) => !decision.passed);
        if (!failed.length) break;
        const targets = dayRepairTargets(failed);
        if (!targets.resources.length && !targets.exercises.length && !targets.hub.length) break;

        if (targets.resources.length || targets.exercises.length) {
          const materialDays = [...new Set([...targets.resources, ...targets.exercises])];
          for (const targetRange of consecutiveDayRanges(materialDays, dayEnd)) {
            await attachDayMaterials(pack, onProgress, progressStart, 2, {
              dayStart: targetRange.start,
              dayEnd: targetRange.end,
              merge: true,
              resourceDays: targets.resources,
              exerciseDays: targets.exercises,
            });
          }
          ContentPack.save(pack);
        }

        if (targets.hub.length) {
          for (const targetRange of consecutiveDayRanges(targets.hub, dayEnd)) {
            await attachHub(pack, outline, onProgress, progressStart + 2, 3, {
              dayStart: targetRange.start,
              dayEnd: targetRange.end,
              mergeBodies: true,
            });
          }
        }

        if (typeof TaskResourceBinder !== 'undefined' && TaskResourceBinder.bindPack) {
          TaskResourceBinder.bindPack(pack);
        }
        normalizePackLessonSourceSections(pack);
        enrichV2LessonMetadata(pack);
        decisions = batchDays.map((day) => evaluateLessonDay(pack, day));
        if (decisions.every((decision) => decision.passed)) break;
        if (round < DAY_TARGETED_REPAIR_ROUNDS) {
          const retryDays = decisions
            .filter((decision) => !decision.passed)
            .map((decision) => decision.day);
          onProgress(
            `定点修复 Day ${retryDays.join(', ')}（第 ${round + 1} 次）…`,
            Math.min(progressEnd, progressStart + 4)
          );
        }
      }

      const checkedAt = new Date().toISOString();
      decisions.forEach((decision) => {
        pack.meta.generation.dayStates[String(decision.day)] = {
          status: decision.passed ? 'frozen' : 'pending_repair',
          checkedAt,
          frozenAt: decision.passed ? checkedAt : '',
          findingCodes: (decision.findings || []).map((finding) => finding.code),
        };
      });
      pack.meta.generation.pendingRepairDays = Object.entries(pack.meta.generation.dayStates)
        .filter(([, state]) => state?.status === 'pending_repair')
        .map(([day]) => Number(day))
        .sort((a, b) => a - b);
      await onCheckpoint(pack, {
        kind: 'lesson-batch',
        days: batchDays,
        decisions,
      });
      ContentPack.save(pack);
      onProgress(
        decisions.every((decision) => decision.passed)
          ? `Day ${range.start}–${range.end} 已验收并冻结`
          : `Day ${range.start}–${range.end} 已生成，问题日进入定点处理队列`,
        progressEnd
      );
    }
    return pack;
  }

  function hasCompleteExtras(pack) {
    return (
      Array.isArray(pack?.skills) &&
      pack.skills.length >= 6 &&
      Array.isArray(pack?.interview) &&
      pack.interview.length >= 12 &&
      Array.isArray(pack?.portfolio) &&
      pack.portfolio.length >= 3
    );
  }

  /**
   * 骨架已就绪后的补全。
   * 顺序（教学法）：先补全课表 → 全部日课与资料 → 核心术语 → 能力 → 面试与作品 → 质量门。
   * 面试题与作品集只在日课和核心术语完成后并行，避免与主学习内容抢占生成阶段。
   */
  async function fillPackRemainder(pack, outline, meta, onProgress = () => {}, ctx = {}) {
    throwIfAborted();
    const days = Math.min(90, Math.max(7, Number(meta.days) || pack.meta?.days || 30));
    const skeletonDays = Math.min(
      days,
      Math.max(1, Number(ctx.skeletonDays) || pack.meta?.generation?.skeletonDays || 3)
    );
    const firstChunkEnd = Math.min(
      days,
      Number(ctx.firstChunkEnd) || Math.max(skeletonDays, Math.min(CHUNK, days))
    );
    const m = { ...meta, days };
    const o = outline || outlineFromPack(pack);
    let lastReadyThroughDay = contiguousReadyThroughDay(pack, days);
    let lastProgressiveSaveAt = 0;
    const progressiveCheckpoint = async (currentPack) => {
      const nowMs = Date.now();
      const computedReady = contiguousReadyThroughDay(currentPack, days);
      const nextReady = computedReady;
      const advanced = nextReady > lastReadyThroughDay;
      const changed = nextReady !== lastReadyThroughDay;
      if (!changed && nowMs - lastProgressiveSaveAt < 1500) return;
      currentPack.meta = currentPack.meta || {};
      currentPack.meta.generation = {
        ...(currentPack.meta.generation || {}),
        phase: 'filling',
        readyThroughDay: nextReady,
        lastProgressiveSaveAt: new Date(nowMs).toISOString(),
      };
      currentPack.status = 'partial';
      currentPack.updatedAt = new Date(nowMs).toISOString();
      ContentPack.save(currentPack);
      lastProgressiveSaveAt = nowMs;
      if (advanced) {
        onProgress(`Day 1–${nextReady} 已可学习，其余内容继续生成…`, undefined);
      }
      if (changed) {
        lastReadyThroughDay = nextReady;
        try {
          ctx.onDayReady?.(currentPack, nextReady);
        } catch (error) {
          console.warn('[PackGenerator] onDayReady', error);
        }
      }
    };
    const planAlreadyComplete = hasCompletePlan(pack, days);

    const weekRanges = [];
    const weekCount = Math.ceil(days / CHUNK);
    if (!planAlreadyComplete) {
      for (let i = 0; i < weekCount; i++) {
        const start = i * CHUNK + 1;
        const end = Math.min(days, (i + 1) * CHUNK);
        if (end <= firstChunkEnd) continue;
        const rangeStart = Math.max(start, firstChunkEnd + 1);
        if (rangeStart <= end) weekRanges.push({ start: rangeStart, end });
      }
    }

    // 1) 先补全课表：日课导航与每日资料都依赖完整 plan
    onProgress(
      weekRanges.length ? `② 补全其余课表（${weekRanges.length} 段）…` : '② 课表已齐，准备每日学习内容…',
      40
    );
    const planChunks = weekRanges.length
      ? await mapPool(
          weekRanges,
          LLM_CONCURRENCY,
          ({ start, end }) => generatePlanChunk(m, o, start, end),
          (done, total) => {
            onProgress(
              `② 课表补全 ${done}/${total}…`,
              40 + Math.round((done / Math.max(1, total)) * 10)
            );
          }
        )
      : [];

    pack.plan = mergePlanByDay(pack.plan, planChunks, days, o);
    pack.meta = pack.meta || {};
    pack.meta.outcomes = o.outcomes || pack.meta.outcomes || null;
    pack.hot = {
      keywords:
        o.hotKeywords ||
        pack.hot?.keywords ||
        [`${m.industry} ${m.role} 新闻`, `${m.industry} 融资`, `${m.industry} 政策`],
      systemHint:
        pack.hot?.systemHint ||
        `面向「${m.industry}」行业「${m.role}」读者策展产业日课。`,
    };
    throwIfAborted();
    ContentPack.save(pack);

    const bloomIssues = diagnoseBloomRegression(pack.plan);
    if (bloomIssues.length) {
      console.warn('[PackGenerator] bloom regression weeks', bloomIssues);
    }

    // 2) 三天微批次：每批来源先行，逐日验收，问题只在当天定点修复，通过即冻结。
    onProgress('⑤ 按三天微批次生成并验收日课…', 52);
    await processLessonMicroBatches(pack, o, 1, days, onProgress, progressiveCheckpoint);
    throwIfAborted();
    await progressiveCheckpoint(pack);
    ContentPack.save(pack);

    // 3) 日课完整后生成 8 条核心术语，保证术语只解释已经学到的内容。
    const existingGlossaryStats = glossaryQualityStats(pack.glossary, { coreOnly: true });
    if (existingGlossaryStats.enoughCount && existingGlossaryStats.kindCount >= 2) {
      onProgress('③ 已复用通过验收的核心术语', 86);
    } else {
      onProgress('③ 从全部日课提炼 8 条核心术语…', 80);
      try {
        pack.meta = pack.meta || {};
        pack.meta.generation = pack.meta.generation || {};
        const existingAccepted = (pack.glossary || []).filter(
          (entry) => (!entry?.sourceType || entry.sourceType === 'core') && passesGlossaryQuality(entry)
        );
        const draftEntries = Array.isArray(pack.meta.generation.glossaryCoreDraft)
          ? pack.meta.generation.glossaryCoreDraft
          : [];
        const coreGlossary = await generateGlossary(
          m,
          o,
          (msg) => onProgress(msg || '③ 核心术语…', 84),
          pack,
          {
            seedCoreEntries: [...draftEntries, ...existingAccepted],
            seedAcceptedEntries: existingAccepted,
            onCoreCheckpoint: async (entries) => {
              pack.meta.generation.glossaryCoreDraft = entries;
              pack.meta.generation.glossaryCheckpointAt = new Date().toISOString();
              ContentPack.save(pack);
            },
            onCheckpoint: async (entries) => {
              pack.glossary = mergeGlossaryEntries(pack.glossary, entries);
              pack.meta.generation.glossaryCheckpointAt = new Date().toISOString();
              ContentPack.save(pack);
            },
          }
        );
        pack.glossary = replaceCoreGlossary(pack.glossary, coreGlossary);
        delete pack.meta.generation.glossaryCoreDraft;
      } catch (e) {
        rethrowAbort(e);
        rethrowGlossaryOperationalError(e);
        if (isGlossaryQualityError(e)) throw e;
        console.warn('[PackGenerator] glossary after fill failed', e);
        pack.glossary = ensureGlossary(m, o, pack.glossary || [], pack);
      }
    }
    pack.meta.glossaryFromHub = true;
    pack.meta.glossaryHubHitRate = Number(glossaryHubHitRate(pack.glossary, pack).toFixed(3));
    throwIfAborted();
    ContentPack.save(pack);

    // 4) 核心学习内容完成后才生成附加内容；面试与作品在能力维度之后并行。
    const extrasAlreadyComplete = hasCompleteExtras(pack);
    if (extrasAlreadyComplete) {
      onProgress('④ 已复用现有能力、面试与作品内容', 94);
    } else {
      onProgress('④ 生成能力维度，再并行生成面试与作品…', 90);
      const extras = await generateExtras(m, o, pack);
      pack.interview = extras.interview;
      pack.skills = extras.skills.length ? extras.skills : pack.skills;
      pack.portfolio = extras.portfolio;
      throwIfAborted();
      ContentPack.save(pack);
    }

    onProgress('⑧ 检查日课与核心术语质量…', 96);
    throwIfAborted();
    if (typeof PackHarness !== 'undefined') PackHarness.setRole('evaluator');
    runPackQualityGate(pack, o);

    // 生成算法只提交候选结果；只有 PackWorkflowGate 可以写入 ready。
    pack.status = 'awaiting_review';
    pack.meta.generation = {
      ...(pack.meta.generation || {}),
      phase: 'done',
      readyThroughDay: contiguousReadyThroughDay(pack, days),
      completedAt: new Date().toISOString(),
    };
    pack.updatedAt = new Date().toISOString();
    if (typeof PackHarness !== 'undefined') {
      const snap = PackHarness.snapshot();
      if (snap) storeHarnessSnapshot(pack, snap);
    }
    const q = pack.meta?.quality;
    onProgress(
      q?.needsReview
        ? '课表已全部就绪（部分日课或核心术语还可再完善）'
        : '课表已全部就绪',
      100
    );
    if (typeof PackHarness !== 'undefined') {
      const g = PackHarness.guardTool('contentPack.save', {});
      if (!g.ok) console.warn('[PackGenerator] save guard', g);
    }
    throwIfAborted();
    ContentPack.save(pack);
    return pack;
  }

  /** 对已有 partial 包继续补全 */
  async function continueFillForPack(packId, onProgress = () => {}, opts = {}) {
    beginJob(opts.signal);
    let sessionOutcome = 'ok';
    try {
      const pack = ContentPack.load(packId);
      if (!pack) throw new Error('找不到课表');
      if (typeof PackHarness !== 'undefined') {
        PackHarness.beginSession({
          packId,
          title: pack.meta?.title,
          industry: pack.meta?.industry,
          role: pack.meta?.role,
          days: pack.meta?.days || pack.plan?.length || 30,
        });
        PackHarness.setRole('generator');
      }
      throwIfAborted();
      _searchCache.clear();
      onProgress('更新 GitHub 资料标题…', 37);
      await refreshCachedGithubTitles(pack);
      const outline = outlineFromPack(pack);
      const m = {
        title: pack.meta?.title,
        industry: pack.meta?.industry,
        role: pack.meta?.role,
        goal: pack.meta?.goal,
        days: pack.meta?.days || pack.plan?.length || 30,
        notes: pack.meta?.notes || '',
      };
      const skeletonDays = pack.meta?.generation?.skeletonDays || 3;
      const firstChunkEnd = Math.max(skeletonDays, Math.min(CHUNK, m.days));
      pack.meta = pack.meta || {};
      pack.meta.generation = {
        ...(pack.meta.generation || {}),
        phase: 'filling',
        readyThroughDay: contiguousReadyThroughDay(pack, m.days),
        skeletonDays,
      };
      pack.status = 'partial';
      throwIfAborted();
      ContentPack.save(pack);
      onProgress('继续补全其余课表…', 38);
      return await fillPackRemainder(pack, outline, m, onProgress, {
        firstChunkEnd,
        skeletonDays,
        onDayReady: opts.onDayReady,
      });
    } catch (error) {
      sessionOutcome = isAbortError(error) ? 'cancelled' : 'failed';
      throw error;
    } finally {
      if (typeof PackHarness !== 'undefined') PackHarness.endSession(sessionOutcome);
      endJob();
    }
  }

  /** 为已有内容包补全 / 重写知识库（P2） */
  async function generateHubForPack(packId, onProgress = () => {}, opts = {}) {
    beginJob(opts.signal);
    let sessionOutcome = 'ok';
    let pack = null;
    let sessionStarted = false;
    try {
    pack = ContentPack.load(packId);
    if (!pack) throw new Error('找不到内容包');
    if (typeof PackHarness !== 'undefined') {
      PackHarness.beginSession({
        packId,
        title: pack.meta?.title,
        industry: pack.meta?.industry,
        role: pack.meta?.role,
        days: pack.meta?.days || pack.plan?.length || 30,
      });
      sessionStarted = true;
      PackHarness.setRole('generator');
    }
    throwIfAborted();
    _searchCache.clear();
    const outline = {
      title: pack.meta?.title,
      phases: [],
      weekThemes: [],
      hotKeywords: pack.hot?.keywords || [],
      outcomes: pack.meta?.outcomes || null,
    };
    // 从 plan 反推粗略 weekThemes
    const plan = pack.plan || [];
    for (let d = 1; d <= (pack.meta?.days || plan.length); d += 7) {
      const end = Math.min(d + 6, pack.meta?.days || plan.length);
      const sample = plan.find((p) => p.day === d) || plan[d - 1];
      outline.weekThemes.push({
        week: Math.ceil(d / 7),
        theme: sample?.topic || `第 ${Math.ceil(d / 7)} 周`,
        dayStart: d,
        dayEnd: end,
      });
    }
    const phaseNames = [...new Set(plan.map((p) => p.phase).filter(Boolean))];
    outline.phases = (phaseNames.length ? phaseNames : ['认知', '方法', '实战', '面试']).map((name) => ({
      name,
      weeks: '',
      focus: name,
    }));

    const targetRanges = consecutiveDayRanges(
      Array.isArray(opts.days) ? opts.days : [],
      pack.meta?.days || plan.length || 90
    );
    if (opts.skipHub !== true) {
      if (targetRanges.length) {
        for (const range of targetRanges) {
          await attachHub(pack, outline, onProgress, 40, 50, {
            dayStart: range.start,
            dayEnd: range.end,
            mergeBodies: true,
          });
        }
      } else {
        await attachHub(pack, outline, onProgress, 40, 55);
      }
    }

    if (opts.includeGlossary !== false) {
    onProgress('③ 从日课抽取并精写核心术语…', 92);
    const metaForGloss = {
      title: pack.meta?.title,
      industry: pack.meta?.industry,
      role: pack.meta?.role,
      goal: pack.meta?.goal,
      days: pack.meta?.days || plan.length,
      notes: pack.meta?.notes,
    };
    try {
      const coreGlossary = await generateGlossary(metaForGloss, outline, undefined, pack);
      pack.glossary = replaceCoreGlossary(pack.glossary, coreGlossary);
    } catch (e) {
      rethrowAbort(e);
      rethrowGlossaryOperationalError(e);
      if (isGlossaryQualityError(e)) throw e;
      console.warn('[PackGenerator] glossary regenerate failed', e);
      pack.glossary = ensureGlossary(metaForGloss, outline, pack.glossary || [], pack);
    }
    }
    pack.meta = pack.meta || {};
    if (opts.includeGlossary !== false) {
      pack.meta.glossaryFromHub = true;
      pack.meta.glossaryHubHitRate = Number(glossaryHubHitRate(pack.glossary, pack).toFixed(3));
    }

    runPackQualityGate(pack, outline, { rewritePhases: false });
    if (typeof PackHarness !== 'undefined') {
      const snap = PackHarness.snapshot();
      if (snap) storeHarnessSnapshot(pack, snap);
    }
    pack.status = 'awaiting_review';
    pack.updatedAt = new Date().toISOString();
    throwIfAborted();
    ContentPack.save(pack);
    onProgress(
      pack.meta?.quality?.needsReview
        ? '阅读与术语已更新，仍有部分内容需完善'
        : '日课与核心术语已就绪',
      100
    );
    return pack;
    } catch (error) {
      sessionOutcome = isAbortError(error) ? 'cancelled' : 'failed';
      if (sessionStarted && pack) {
        const snap = PackHarness.snapshot();
        if (snap) {
          storeHarnessSnapshot(pack, snap);
          ContentPack.save(pack);
        }
      }
      throw error;
    } finally {
      if (sessionStarted && typeof PackHarness !== 'undefined') {
        PackHarness.endSession(sessionOutcome);
      }
      endJob();
    }
  }

  /** P3：为已有内容包补全每日外链与练习 */
  async function generateDayMaterialsForPack(packId, onProgress = () => {}, opts = {}) {
    beginJob(opts.signal);
    let sessionOutcome = 'ok';
    let sessionStarted = false;
    let pack = null;
    try {
    pack = ContentPack.load(packId);
    if (!pack) throw new Error('找不到内容包');
    if (!pack.plan?.length) throw new Error('内容包没有课表，无法生成每日资料');
    if (typeof PackHarness !== 'undefined') {
      PackHarness.beginSession({
        packId,
        title: pack.meta?.title,
        industry: pack.meta?.industry,
        role: pack.meta?.role,
        days: pack.meta?.days || pack.plan.length || 30,
      });
      PackHarness.setRole('generator');
      sessionStarted = true;
    }
    throwIfAborted();
    _searchCache.clear();
    if (!hasSearchKey()) {
      onProgress('未检测到联网搜索（请先配置 DeepSeek 密钥）…', 3);
    }
    const targetRanges = consecutiveDayRanges(
      Array.isArray(opts.days) ? opts.days : [],
      pack.meta?.days || pack.plan.length || 90
    );
    if (targetRanges.length) {
      for (const range of targetRanges) {
        await attachDayMaterials(pack, onProgress, 5, 90, {
          dayStart: range.start,
          dayEnd: range.end,
          merge: true,
          resourceDays: opts.resourceDays,
          exerciseDays: opts.exerciseDays,
        });
      }
    } else {
      await attachDayMaterials(pack, onProgress, 5, 90);
    }
    const outline = {
      title: pack.meta?.title,
      phases: [...new Set((pack.plan || []).map((p) => p.phase).filter(Boolean))].map((name) => ({
        name,
        weeks: '',
        focus: name,
      })),
      weekThemes: [],
      outcomes: pack.meta?.outcomes || null,
    };
    runPackQualityGate(pack, outline, { rewritePhases: false });
    if (sessionStarted) {
      const snap = PackHarness.snapshot();
      if (snap) storeHarnessSnapshot(pack, snap);
    }
    pack.status = 'awaiting_review';
    throwIfAborted();
    ContentPack.save(pack);
    onProgress('每日资料与练习已就绪', 100);
    return pack;
    } catch (error) {
      sessionOutcome = isAbortError(error) ? 'cancelled' : 'failed';
      if (sessionStarted && pack) {
        const snap = PackHarness.snapshot();
        if (snap) {
          storeHarnessSnapshot(pack, snap);
          ContentPack.save(pack);
        }
      }
      throw error;
    } finally {
      if (sessionStarted && typeof PackHarness !== 'undefined') {
        PackHarness.endSession(sessionOutcome);
      }
      endJob();
    }
  }

  /**
   * 首次完整生成未过最终门时自动补救一次。
   * 先补来源/练习，再重建日课引用与核心术语，最后交回 Workflow 重新验收。
   */
  function repairPlanFromGate(gate = {}, quality = {}) {
    const uniqueDays = (...groups) =>
      [...new Set(groups.flat().map(Number))]
        .filter((day) => Number.isInteger(day) && day > 0)
        .sort((a, b) => a - b);
    const sourceDays = uniqueDays(
      gate.missingResourceDays || [],
      gate.emptyResourceDays || [],
      gate.invalidSourceDays || []
    );
    const exerciseDays = uniqueDays(
      gate.missingExerciseDays || [],
      gate.invalidExerciseDays || []
    );
    const chapterDays = (gate.missingChapterSlugs || [])
      .map((slug) => Number(String(slug).match(/day-?(\d+)/i)?.[1]))
      .filter(Boolean);
    const shallowDays = (quality.shallowChapterSlugs || [])
      .map((slug) => Number(String(slug).match(/day-?(\d+)/i)?.[1]))
      .filter(Boolean);
    const nonSourceHubDays = uniqueDays(
      gate.missingHubDays || [],
      chapterDays,
      gate.missingCitationDays || [],
      gate.invalidLessonDays || [],
      gate.qualityFloorDays || [],
      shallowDays
    );
    const hubDays = uniqueDays(sourceDays, nonSourceHubDays);
    const materialsDays = uniqueDays(sourceDays, exerciseDays);
    const needsGlossary =
      quality.glossaryEnough === false ||
      Number(quality.glossaryKindCount) < 2;
    const structuralUnknown =
      (gate.missingPlanDays || []).length > 0 ||
      (gate.phaseBackjumpDays || []).length > 0 ||
      (gate.missingCheckpointWeeks || []).length > 0;
    const hasTargetedWork = materialsDays.length > 0 || hubDays.length > 0 || needsGlossary;
    const comprehensive =
      structuralUnknown ||
      (!!gate.harnessNeedsRepair && shallowDays.length === 0) ||
      (!hasTargetedWork && Array.isArray(gate.issues) && gate.issues.length > 0);
    return {
      sourceDays,
      exerciseDays,
      materialsDays,
      hubDays,
      nonSourceHubDays,
      needsGlossary,
      comprehensive,
    };
  }

  function sourceUrlSignatureFromPack(pack, day) {
    return (pack?.dayResources?.[String(day)]?.resources || [])
      .map((row) => String(row?.url || '').trim())
      .filter(Boolean)
      .sort()
      .join('|');
  }

  async function repairFinalGateForPack(packId, gate, onProgress = () => {}, opts = {}) {
    let pack = ContentPack.load(packId);
    if (!pack) throw new Error('找不到需要自动修复的课包');
    const repairPlan = repairPlanFromGate(gate, pack.meta?.quality || {});
    const sourceIssueCount = repairPlan.sourceDays.length;
    const exerciseIssueCount = repairPlan.exerciseDays.length;
    const startedAt = new Date().toISOString();
    const previousSourceUrls = new Map(
      repairPlan.sourceDays.map((day) => [day, sourceUrlSignatureFromPack(pack, day)])
    );

    if (repairPlan.comprehensive) {
      // 全局结构问题不再触发整包重生成；这里只做无损、确定性的规范化。
      onProgress('发现全局结构问题，先执行确定性整理并保留具体诊断…', 97);
      const outline = outlineFromPack(pack);
      runPackQualityGate(pack, outline, { rewritePhases: false });
      ContentPack.save(pack);
    }

    if (repairPlan.materialsDays.length) {
      onProgress(
        repairPlan.hubDays.length > 0 ? '定点修复学习来源与每日练习…' : '定点修复每日练习…',
        97
      );
      pack = await generateDayMaterialsForPack(
        packId,
        (message) => onProgress(message, 98),
        {
          ...opts,
          days: repairPlan.materialsDays,
          resourceDays: repairPlan.sourceDays,
          exerciseDays: repairPlan.exerciseDays,
        }
      );
      const changedSourceDays = repairPlan.sourceDays.filter(
        (day) => previousSourceUrls.get(day) !== sourceUrlSignatureFromPack(pack, day)
      );
      repairPlan.hubDays = uniqueDays(repairPlan.nonSourceHubDays, changedSourceDays);
    }

    if (repairPlan.hubDays.length || repairPlan.needsGlossary) {
      throwIfAborted();
      onProgress(
        repairPlan.hubDays.length ? '定点重建问题日课与引用…' : '定点重建核心术语…',
        98
      );
      pack = await generateHubForPack(
        packId,
        (message) => onProgress(message, 99),
        {
          ...opts,
          days: repairPlan.hubDays,
          skipHub: repairPlan.hubDays.length === 0,
          includeGlossary: repairPlan.needsGlossary,
        }
      );
    }
    pack.meta = pack.meta || {};
    pack.meta.quality = pack.meta.quality || {};
    pack.meta.quality.autoRepair = {
      status: 'completed',
      startedAt,
      finishedAt: new Date().toISOString(),
      sourceIssueCount,
      exerciseIssueCount,
      mode: repairPlan.comprehensive ? 'deterministic-plus-targeted' : 'targeted',
      targetedMaterialDays: repairPlan.materialsDays,
      targetedHubDays: repairPlan.hubDays,
      glossaryRegenerated: repairPlan.needsGlossary,
      triggerIssues: Array.isArray(gate?.issues) ? gate.issues.slice(0, 12) : [],
    };
    pack.meta.generation = {
      ...(pack.meta.generation || {}),
      readyThroughDay: contiguousReadyThroughDay(
        pack,
        pack.meta?.days || pack.plan?.length || 0
      ),
    };
    ContentPack.save(pack);
    onProgress('自动修复完成，正在重新验收…', 99);
    return pack;
  }

  return {
    generate,
    continueFillForPack,
    generateHubForPack,
    generateDayMaterialsForPack,
    repairFinalGateForPack,
    generateCourseGlossaryForPack,
    generateGlossaryForDayPack,
    generateCustomGlossaryForPack,
    refreshGithubTitlesForPack,
    parseJsonLoose,
    isAbortError,
    runPackQualityGate,
    repairPackWithHarness,
    _test: {
      fetchWikipediaResources,
      buildLearningQueryLanes,
      buildWeeklyQueryLanes,
      weekNeedsGithub,
      poolFingerprint,
      ensureWeeklyResourcePool,
      refreshCachedGithubTitles,
      curateDayResourceLinks,
      mergeResolvedMetadata,
      expandLearningQueries,
      rankAndFilterSearchHits,
      selectSourcePortfolio,
      filterResourcesToSearch,
      pickConcreteFromHits,
      scoreSearchHit,
      sourcePlatform,
      normalizeSourceTier,
      generateGlossary,
      glossaryCandidates,
      glossaryCandidatesForDay,
      glossaryCandidatesForCourse,
      mergeGlossaryEntries,
      replaceCoreGlossary,
      generateExtras,
      glossaryQualityStats,
      isGlossaryQualityError,
      hasCompletePlan,
      hasCompleteDayMaterials,
      hasCompleteHub,
      hasSourceBoundHub,
      hasCompleteExtras,
      contiguousReadyThroughDay,
      consecutiveDayRanges,
      lessonMicroBatchRanges,
      dayRepairTargets,
      processLessonMicroBatches,
      repairPlanFromGate,
      normalizeDayMaterialRow,
      sourceUrlSignatureFromPack,
      mergeAiMetrics,
      storeHarnessSnapshot,
      canonicalizeLessonSourceSection,
      normalizeLessonEvidenceCitations,
      normalizePackLessonSourceSections,
      citationBacklinkMissingSlugs,
      fillPackRemainder,
      HUB_STABLE_SYSTEM_PREFIX,
      reusableHubStructure,
    },
  };
})();
