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
  /** 当前生成任务的 AbortSignal（由 beginJob / endJob 管理） */
  let _jobSignal = null;

  function beginJob(signal) {
    _jobSignal = signal || null;
  }

  function endJob() {
    _jobSignal = null;
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
  let _llmInFlight = 0;
  const _llmWaiters = [];

  /** 全局 LLM 槽位：跨课表/术语/知识库并行时合计不超过 LLM_CONCURRENCY */
  async function withLlmSlot(fn) {
    if (_llmInFlight >= LLM_CONCURRENCY) {
      await new Promise((resolve) => {
        _llmWaiters.push(resolve);
      });
    }
    _llmInFlight += 1;
    try {
      return await fn();
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
  const HUB_TEACHING_CONTRACT = `知识库日课公约（指导性质，必须遵守）：
1. 每一章是「今天怎么做」的操作指南：场景 → 步骤/判断规则 → 反例 → 自检；不是百科罗列。
2. 读者学完必须能独立完成当日课表 tasks 中的加工任务；每节对准可交付产出。
3. 关键概念首次出现时给 ≤25 字工作定义即可；深入辨析、易混对比留给术语库，正文以「会用」为准。
4. 至少写出 1 条可执行决策规则（若…则… / 该做 / 不该做）与 1 个完整例题步骤。
5. 禁止只复述标题、禁止元指令式类比、禁止空洞「提升认知」。`;

  const GLOSSARY_FROM_HUB_CONTRACT = `术语库定位（必须遵守）：
1. 术语库是知识库的补充层：解释日课里已经出现或当日必须会用的概念。
2. 禁止发明知识库正文中完全未出现、且与课表 topic 无关的新体系名词。
3. 每条词必须讲清楚：非循环工作定义、真实口语、完整例子、易混边界、专属可视化（visual.kind）。
4. term 字符串应尽量与知识库正文用词一致（便于互链检索）。
5. 宁少勿滥：不合格词条宁可不写，禁止用通用模板充数。`;

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

  async function chat({ system, user, temperature = 0.3, max_tokens = 4096 }) {
    if (typeof AiReview === 'undefined' || !AiReview.chat) {
      throw new Error('AiReview.chat 未就绪');
    }
    throwIfAborted();
    return withLlmSlot(() => {
      throwIfAborted();
      return AiReview.chat({
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature,
        max_tokens,
        signal: _jobSignal || undefined,
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

  async function chatJson({ system, user, temperature = 0.28, max_tokens = 4096 }) {
    const text = await chat({ system, user, temperature, max_tokens });
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
      /google\.[^/]+\/search/i.test(full)
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
    return score;
  }

  /** 过滤资讯站 + 按学习相关度排序（不新增 API） */
  function rankAndFilterSearchHits(hits, { learnWhat = '', topic = '' } = {}) {
    return (hits || [])
      .map((h) => ({ ...h, _score: scoreSearchHit(h, learnWhat, topic) }))
      .filter((h) => h._score > -50)
      .sort((a, b) => b._score - a._score)
      .map(({ _score, ...rest }) => rest);
  }

  /**
   * 同一搜索 Key 下改写 query：加教学意图词 + 可选 site 限定
   */
  function expandLearningQueries(rawQuery, { prefer = '', learnWhat = '', topic = '' } = {}) {
    const base = String(rawQuery || learnWhat || topic || '').trim();
    if (!base) return [];
    const pref = String(prefer || '').toLowerCase();
    const teaching = `${base} 教程 方法 讲解`.replace(/\s+/g, ' ').trim();
    const out = [];
    const push = (q) => {
      const s = String(q || '').trim();
      if (s && !out.includes(s)) out.push(s);
    };
    push(teaching);
    push(`${base} 入门 指南`);
    if (pref.includes('wiki') || pref.includes('百科')) {
      push(`${base} site:zh.wikipedia.org`);
      push(`${base} site:wikipedia.org`);
    }
    if (pref.includes('video') || pref.includes('视频')) {
      push(`${base} 教程 site:bilibili.com`);
    }
    if (pref.includes('official') || pref.includes('文档')) {
      push(`${base} 官方 文档`);
    }
    if (pref.includes('paper')) {
      push(`${base} PDF 讲义 OR 教材`);
    }
    // 默认再补一路百科/B站限定，提高高质量召回（仍走原搜索 API）
    if (!pref.includes('wiki')) push(`${base} 定义 site:zh.wikipedia.org`);
    if (!pref.includes('video')) push(`${base} 讲解 site:bilibili.com`);
    return out.slice(0, 4);
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
        console.warn('[PackGenerator] search fail', q, data?.error?.message || res.status);
        _searchCache.set(cacheKey, []);
        return [];
      }
      const results = (Array.isArray(data.results) ? data.results : [])
        .map(slimSearchHit)
        .filter((r) => r.url && /^https?:\/\//i.test(r.url) && !isBlockedResourceUrl(r.url));
      const out = results.length >= minResults ? results : results;
      _searchCache.set(cacheKey, out);
      return out;
    } catch (e) {
      if (isAbortError(e)) throw e;
      console.warn('[PackGenerator] search error', q, e);
      _searchCache.set(cacheKey, []);
      return [];
    }
  }

  /** 多 query 并行搜索，合并去重；maxQueries 控成本 */
  async function searchMany(queries, { count = SEARCH_COUNT, maxQueries = 6 } = {}) {
    const uniq = [];
    const seenQ = new Set();
    for (const raw of queries || []) {
      const q = String(raw || '').trim();
      if (!q || seenQ.has(q)) continue;
      seenQ.add(q);
      uniq.push(q);
      if (uniq.length >= maxQueries) break;
    }
    const perQuery = await mapPool(uniq, SEARCH_CONCURRENCY, (q) => searchWeb(q, { count }));
    const merged = [];
    const seenUrl = new Set();
    perQuery.forEach((hits, i) => {
      const q = uniq[i];
      (hits || []).forEach((h) => {
        if (seenUrl.has(h.url)) return;
        seenUrl.add(h.url);
        merged.push({ ...h, query: q });
      });
    });
    return merged;
  }

  function formatSearchBlock(results, limit = 24) {
    const rows = (results || []).slice(0, limit);
    if (!rows.length) return '（无搜索结果；请仅用定性表述，禁止编造精确 URL/数据）';
    return JSON.stringify(rows, null, 0);
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

    return picked.slice(0, 4);
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
      .filter((h) => h._score > -60)
      .sort((a, b) => b._score - a._score);

    return scored.slice(0, need).map((r) => ({
      title: String(r.title || topic || '参考资料').trim().slice(0, 80),
      url: r.url,
      type: /bilibili\.com/i.test(r.url) ? 'video' : 'article',
    }));
  }

  /**
   * 维基百科公开 opensearch（无需用户配置 Key）→ 直接词条 URL
   */
  async function fetchWikipediaResources(topic, limit = 2) {
    const q = String(topic || '').trim();
    if (!q) return [];
    try {
      const url =
        'https://zh.wikipedia.org/w/api.php?action=opensearch&search=' +
        encodeURIComponent(q) +
        `&limit=${limit}&namespace=0&origin=*`;
      const res = await fetch(url);
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
      return out;
    } catch (e) {
      console.warn('[PackGenerator] wikipedia opensearch failed', e);
      return [];
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
    return chatJson({ system, user, max_tokens: 3200 });
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
    return chatJson({ system, user, max_tokens: 3500 });
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
    const final = await chatJson({ system, user, temperature: 0.2, max_tokens: 4000 });
    if (!final.outcomes) final.outcomes = outcomes;
    if (!final.title) final.title = scaffold.title || meta.title;
    return normalizeOutlineCalendar(final, meta.days);
  }

  // ─── 路径质量：阶段日历 / Bloom / 浅文与模板练习门禁 ───

  const BLOOM_VERBS = [
    { level: 6, verbs: ['创建', '设计', '撰写', '拟定', '构建', '产出', '规划', '主持'] },
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
      const topic = String(d.topic || `Day ${d.day}`);
      const hubTask = `打开知识库「Day ${d.day} · ${topic}」精读本日章节，勾选完成清单`;
      let tasks = Array.isArray(d.tasks) ? d.tasks.map(String) : [];
      if (!tasks.some((t) => /知识库/.test(t))) {
        if (!tasks.length) tasks = [hubTask, '整理对比表或清单', '合上资料做场景判断'];
        else tasks = [hubTask, ...tasks.filter((t) => !/^阅读|^读/.test(t))].slice(0, 3);
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
      ? String(tasks[0]).replace(/^打开知识库[^，,；;]{0,40}[，,；;]?/, '').slice(0, 42)
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
      ordered = [...ordered].sort((a, b) => b.bloom - a.bloom);
    }
    // 日序旋转，避免相邻天总拿同一批头部
    const rot = (day - 1) % ordered.length;
    ordered = ordered.slice(rot).concat(ordered.slice(0, rot));

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
    return picked.slice(0, 3);
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
      const lvl = bloomLevelFromText(blob) || 2;
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
    return chatJson({ system, user, max_tokens: 2800 });
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
      "输入型任务：读知识库本章 / 看资料（点名对象）",
      "加工型任务：对比/画图/列表等",
      "提取型任务：不看资料复述或场景判断"
    ],
    "why": "为何排在这一天（1句）"
  }
]
要求：tasks 正好 3 条且三类齐全；phase 必须整段都是「${lockedPhase}」；禁止三条都是「阅读/笔记/复述」万能句；topic 与 weekGoals.dailySeeds 对齐。`;
    const raw = await chatJson({ system, user, max_tokens: 4000 });
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
            : ['打开知识库精读本日章节', '整理对比表或清单', '合上资料复述今日判断题'],
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

  function glossaryHubHitRate(glossary, pack) {
    const hub = hubBlobText(pack);
    const terms = (glossary || [])
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

## 知识库摘要（日课正文已写完；术语必须服务这些内容）
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
- 每个 term 必须能在知识库正文中找到原词或明显同义写法；禁止知识库未覆盖的空降黑话
- 覆盖不同阶段的日课；少用万能词（沟通/学习能力）
- why 写清「补充日课哪一点」（定义边界 / 易混 / 面试口述）`;
    return chatJson({ system, user, temperature: 0.2, max_tokens: 3200 });
  }

  async function inventGlossaryTermList(meta, outline, pack) {
    if (pack?.hub?.chapters && Object.keys(pack.hub.chapters).length >= 3) {
      return inventGlossaryTermListFromHub(meta, outline, pack);
    }
    // 无知识库时的退化路径（补生成/旧调用）：仍可从大纲列词，但提示弱于 hub-first
    const { role } = roleLens(meta);
    const system = `你是「${meta.industry}」领域术语策展人（面向 ${role}）。
参考：闪卡应「一词一义、短定义」（检索练习研究）。先列清单，不写长文。
注意：正式流程应先有知识库再抽术语；此处为无 hub 时的降级。
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
    return chatJson({ system, user, temperature: 0.25, max_tokens: 2800 });
  }

  async function expandGlossaryBatch(meta, outline, termBatch, pack) {
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
    const searchHits = hasSearchKey()
      ? await searchMany(termQueries, { count: 5, maxQueries: 2 })
      : [];
    const hubSources = pack?.hub?.chapters ? hubExcerptsForTerms(pack, termBatch) : [];

    const system = `你是术语教学设计师与「${meta.industry}」资深「${role}」教练。
Mission：每条词必须把概念讲清楚——读者看完能：说准定义、举完整例子、区分易混、看懂专属示意图。
${GLOSSARY_FROM_HUB_CONTRACT}
${DEPTH_CONTRACT}
${GLOSSARY_VISUAL_KINDS}
若有 search_results：定义须与资料方向一致，禁止编造搜索未支持的精确数据/年份。
输出契约：仅输出一个合法 JSON 对象。`;
    const user = `## Audience
岗位：${role}｜行业：${meta.industry}｜目标：${meta.goal || '入门'}

## 本批要写的词（不得增删词头；term 尽量与知识库一致；本批最多 2 个）
${JSON.stringify(termBatch)}

## 知识库出处（优先据此补充，而不是另起定义）
${JSON.stringify(hubSources).slice(0, 6000)}

## search_results
${formatSearchBlock(searchHits, 12)}

## 完整词条示例（模仿其深度，勿抄行业）
${JSON.stringify({ glossary: [glossaryFewshot, GLOSSARY_FEWSHOT_SCENARIO] })}

## 额外可视化选型示例（只学习布局与字段）
${JSON.stringify(GLOSSARY_VISUAL_FEWSHOTS)}

## Output schema
{"glossary":[{"term":"","aliases":[],"module":"","definition":"","userPhrases":["真实口语"],"example":"含对象+动作+结果的完整例子","visual":{"kind":"flow|loop|anatomy|roles|scenario|compare|states|layers|tree|timeline|matrix","title":"","columns":["compare/matrix可选"],"nodes":[{"label":"","detail":"","actor":"roles可选","badge":"状态/阶段可选","group":"compare/matrix可选","parent":"tree可选"}],"facts":[{"label":"","value":""}],"quote":"scenario用","caption":""},"confusions":[{"term":"易混词","distinction":"本词是…；对方是…"}],"sections":[{"label":"是什么","content":""},{"label":"别这样叫","content":""},{"label":"${judgmentLabel}","content":""},{"label":"面试怎么答","content":""}]}]}

## Constraints（违反任一条=不合格）
- definition 20–70 字：说清是什么/解决什么；禁止「××的工作定义」「××是××相关概念」循环空话
- userPhrases：1–2 句真实困惑/任务/误表述；禁止「我在日课里遇到××」
- example：必须有具体对象、动作、可观察结果；禁止只复述 definition
- confusions：至少 1 条真正相近的词，distinction 写双边边界
- visual：先按概念结构选 kind，再写本词专属节点；同批尽量不同 kind；nodes 2–6 个，每项 label≤16 字、detail≤36 字；compare/matrix 必须用 group 归列，roles 必须有 actor
- sections 至少含：是什么、${judgmentLabel}、面试怎么答
- 禁止写「PM 视角」标签（除非岗位是产品经理）
- 若有知识库出处：补充边界/易混/例子，不要整章粘贴`;
    const data = await chatJson({ system, user, temperature: 0.18, max_tokens: 4500 });
    return normalizeGlossary(data.glossary || data, meta);
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

  /** 语义质量门禁：不过关不得入库 */
  function passesGlossaryQuality(entry) {
    if (!entry?.term || !entry?.definition) return false;
    if (isCircularGlossaryDefinition(entry.term, entry.definition)) return false;
    const phrase = (entry.userPhrases || [])[0] || '';
    if (!phrase || isTemplateUserPhrase(phrase)) return false;
    const example = String(entry.example || '').trim();
    if (example.length < 24) return false;
    if (example === entry.definition || example.includes(entry.definition.slice(0, 20))) {
      // 允许部分重叠，但例子不能几乎等于定义
      if (example.length < entry.definition.length + 12) return false;
    }
    if (!Array.isArray(entry.confusions) || entry.confusions.length < 1) return false;
    const visual = entry.visual;
    if (!visual) return false;
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
    if (visual.kind && !allowedKinds.includes(visual.kind)) return false;
    const nodeCount = (visual.nodes || []).length || (visual.steps || []).length;
    if (nodeCount < 2 && !(visual.facts || []).length) return false;
    if (visual.kind === 'roles' && (visual.nodes || []).some((node) => !node.actor)) return false;
    if (visual.kind === 'states' && (visual.nodes || []).some((node) => !node.badge)) return false;
    if (visual.kind === 'compare' || visual.kind === 'matrix') {
      const groups = new Set((visual.nodes || []).map((node) => node.group).filter(Boolean));
      if (groups.size < 2) return false;
    }
    if (isGenericGlossaryVisual(visual, entry.term)) return false;
    return true;
  }

  function glossaryQualityStats(glossary) {
    const list = Array.isArray(glossary) ? glossary : [];
    const pass = list.filter(passesGlossaryQuality);
    const kinds = new Set(
      pass.map((g) => g.visual?.kind || 'flow').filter(Boolean)
    );
    return {
      total: list.length,
      passCount: pass.length,
      failCount: list.length - pass.length,
      kindCount: kinds.size,
      kinds: [...kinds],
      passRate: list.length ? pass.length / list.length : 0,
    };
  }

  async function generateGlossary(meta, outline, onProgress, pack) {
    try {
      const listObj = await inventGlossaryTermList(meta, outline, pack);
      let terms = Array.isArray(listObj?.terms) ? listObj.terms : [];
      if (pack?.hub?.chapters) {
        const hub = hubBlobText(pack);
        const planBlob = JSON.stringify(pack.plan || []);
        terms = terms.filter((t) => {
          const term = String(t.term || '').trim();
          if (!term) return false;
          if (hub.includes(term)) return true;
          const stem = term.replace(/(模型|指标|评分|方法|框架|体系)$/u, '');
          if (stem.length >= 2 && hub.includes(stem)) return true;
          return planBlob.includes(term) || planBlob.includes(stem);
        });
      }
      // 宁少勿滥：最多精写 14 个
      terms = terms.slice(0, 14);
      if (!terms.length) {
        return ensureGlossary(meta, outline, [], pack);
      }
      const batchSize = 2;
      const batches = [];
      for (let i = 0; i < terms.length; i += batchSize) {
        batches.push(terms.slice(i, i + batchSize));
      }
      const accepted = [];
      const seen = new Set();
      for (let bi = 0; bi < batches.length; bi++) {
        throwIfAborted();
        const batch = batches[bi];
        if (onProgress) onProgress(`③ 术语精写 ${Math.min((bi + 1) * batchSize, terms.length)}/${terms.length}…`);
        let part = [];
        try {
          part = await expandGlossaryBatch(meta, outline, batch, pack);
        } catch (e) {
          console.warn('[PackGenerator] glossary batch failed', bi, e);
          part = [];
        }
        // 不合格词单独重试一次
        const needRetry = batch.filter((t) => {
          const term = String(t.term || t || '').trim();
          return term && !part.some((g) => g.term === term && passesGlossaryQuality(g));
        });
        if (needRetry.length) {
          try {
            const retry = await expandGlossaryBatch(meta, outline, needRetry, pack);
            part = [...part, ...retry];
          } catch (e) {
            console.warn('[PackGenerator] glossary retry failed', bi, e);
          }
        }
        for (const g of part) {
          const key = String(g.term || '').toLowerCase();
          if (!key || seen.has(key)) continue;
          if (!passesGlossaryQuality(g)) continue;
          seen.add(key);
          accepted.push(g);
        }
      }
      return ensureGlossary(meta, outline, accepted, pack);
    } catch (e) {
      console.warn('[PackGenerator] glossary generation failed', e);
      return ensureGlossary(meta, outline, [], pack);
    }
  }

  /** 仅在几乎没有合格词时使用的最小种子——仍须过质量门；写具体定义而非循环 stub */
  function buildRoleStubGlossary(meta, outline, pack) {
    const { role, judgmentLabel } = roleLens(meta);
    const industry = String(meta.industry || '本行业').trim();
    const hubTerms = [];
    if (pack?.hub?.chapters) {
      summarizeHubForGlossary(pack).forEach((row) => {
        (row.candidates || []).slice(0, 4).forEach((c) => {
          if (c && !hubTerms.includes(c)) hubTerms.push(c);
        });
      });
    }
    const seeds = hubTerms.slice(0, 6).map((term) => ({
      term: String(term).slice(0, 24),
      aliases: [],
      module: '方法',
      definition: `在「${industry}」日常工作中，「${term}」指需要单独建立判断标准与使用边界的关键概念，用来对齐协作与验收。`,
      userPhrases: [`别人张口就提「${term}」，我该怎么判断他们说的是不是一回事？`],
      example: `面对一个涉及「${term}」的任务：先用一句话说清它解决什么问题，再写 1 条「该用/不该用」规则，最后用一个可观察结果验收。`,
      visual: {
        kind: 'flow',
        title: `怎样正确使用「${term}」`,
        nodes: [
          { label: '遇到具体任务', detail: `任务里出现或依赖「${term}」` },
          { label: '给出工作定义', detail: '一句话说清解决什么问题' },
          { label: '划清边界', detail: '写清该用与不该用' },
          { label: '可观察验收', detail: '别人不追问也能判断完成' },
        ],
        caption: `示意图绑定「${term}」的使用判断，不是通用学习流程。`,
      },
      confusions: [
        {
          term: '口头黑话',
          distinction: `「${term}」应有可共享的工作定义与边界；口头黑话则因人而异、无法验收。`,
        },
      ],
      sections: [
        { label: '是什么', content: `「${term}」是「${industry}」场景下需要统一口径的概念，用于协作对齐。` },
        { label: judgmentLabel, content: `能否一句话说清「${term}」解决什么问题，并举出不适用的情况。` },
        {
          label: '面试怎么答',
          content: `先给工作定义，再举「${industry} · ${role}」里一个用对与用错的对比。`,
        },
      ],
    }));
    return seeds.filter(passesGlossaryQuality);
  }

  function ensureGlossary(meta, outline, glossary, pack) {
    let list = Array.isArray(glossary) ? glossary.slice() : [];
    if (pack?.hub?.chapters) {
      const hub = hubBlobText(pack);
      const planBlob = JSON.stringify(pack.plan || []);
      list = list.filter((g) => {
        const term = String(g.term || '').trim();
        if (!term) return false;
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
    if (list.length >= 8) return list.slice(0, 14);
    // 不足时尝试从 hub 候选补最小可用集（仍须过门禁）；禁止注入循环 stub
    const stubs = buildRoleStubGlossary(meta, outline, pack);
    const seen = new Set(list.map((g) => String(g.term || '').toLowerCase()));
    for (const s of stubs) {
      const key = String(s.term || '').toLowerCase();
      if (!key || seen.has(key)) continue;
      if (!passesGlossaryQuality(s)) continue;
      list.push(s);
      seen.add(key);
      if (list.length >= 8) break;
    }
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
        };
      })
      .filter(Boolean);
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
    return chatJson({ system, user, max_tokens: 2000 });
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
    return chatJson({ system, user, max_tokens: 4500 });
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
    return chatJson({ system, user, max_tokens: 2800 });
  }

  async function generateExtras(meta, outline) {
    let skillsRaw = [];
    let interviewRaw = [];
    let portfolioRaw = [];
    try {
      const s = await generateSkillsDim(meta, outline);
      skillsRaw = s.skills || [];
    } catch (e) {
      console.warn('[PackGenerator] skills failed', e);
    }
    // 面试题库 ∥ 作品里程碑（都只依赖 skills）
    const [ivSettled, pfSettled] = await Promise.allSettled([
      generateInterviewBank(meta, outline, skillsRaw),
      generatePortfolioMilestones(meta, outline, skillsRaw),
    ]);
    if (ivSettled.status === 'fulfilled') {
      interviewRaw = ivSettled.value.interview || [];
    } else {
      console.warn('[PackGenerator] interview failed', ivSettled.reason);
    }
    if (pfSettled.status === 'fulfilled') {
      portfolioRaw = pfSettled.value.portfolio || [];
    } else {
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
          `打开知识库「Day ${d}」精读本日章节`,
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
          slug: `${id}/day-${String(d.day).padStart(2, '0')}-${slugify(d.topic).slice(0, 20)}`,
          title: String(d.topic || `Day ${d.day}`).slice(0, 28),
          days: String(d.day),
          focus: `Day ${d.day}：${d.topic || ''}`,
          dayPlan: d,
        })),
      });
    }

    return {
      title: outline?.title || meta.title || `${meta.industry || ''}知识库`.trim() || '专属知识库',
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
      const polish = await chatJson({ system, user, temperature: 0.2, max_tokens: 1200 });
      if (Array.isArray(polish?.moduleTitles)) {
        polish.moduleTitles.forEach((t, i) => {
          if (base.modules[i] && t) base.modules[i].title = String(t).slice(0, 28);
        });
      }
      if (polish?.title) base.title = String(polish.title);
      base.learningPath = base.modules.map((m) => m.title);
    } catch (e) {
      console.warn('[PackGenerator] hub title polish skipped', e);
    }
    return base;
  }

  function dayPlanFromChapter(chapter, plan) {
    if (chapter?.dayPlan) return chapter.dayPlan;
    const dayNum = Number(String(chapter?.days || '').split(/[-–]/)[0]);
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
    const fromPlan = dayPlanFromChapter(chapter, plan);
    if (fromPlan?.day) return Number(fromPlan.day);
    const m = String(chapter?.slug || chapter?.days || '').match(/day-?(\d+)/i);
    return m ? Number(m[1]) : 0;
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
    const system = `你是「${meta.industry}」日课教学设计师（Microlearning：一课一目标 + Worked Example）。
知识库是每日主教材，必须具有指导性质（读者学完能动手）。
${HUB_TEACHING_CONTRACT}
${DEPTH_CONTRACT}
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
    return chatJson({ system, user, temperature: 0.3, max_tokens: 4000 });
  }

  async function writeDailyLessonMarkdown(meta, chapter, dayPlan, lesson, searchHits, { strict = false } = {}) {
    const { role, sectionHeading, decisionSubhead } = roleLens(meta);
    const system = `你是「${meta.industry}」领域日课作者与「${role}」教练。
本日是 Day ${dayPlan.day} 的独立微课，只写这一天，禁止写成 Day x-y 合集。
本文是知识库主教材：以「怎么做」指导读者完成今日任务；术语深挖留给术语库。
借鉴：worked example（先看完整解题步骤再练习）+ 提取练习收尾。
${HUB_TEACHING_CONTRACT}
${DEPTH_CONTRACT}
${strict ? '【加严】上一稿太空洞：禁止模板句、禁止把标题当定义、禁止元指令式类比。' : ''}
若有 search_results：事实须能被 snippet 支撑；可附 1 条来自结果的延伸阅读链接。
输出契约：只输出一个 JSON 对象 {"slug":"","markdown":""}。`;

    const user = `## 章节
slug: ${chapter.slug}
title: ${chapter.title}
关联天数：必须写 **Day ${dayPlan.day}**（单个数字，禁止区间）

## 日课设计稿（必须全部落实进正文，不得省略例题步骤）
${JSON.stringify(lesson).slice(0, 5500)}

## search_results
${formatSearchBlock(searchHits, 10)}

## 正文结构（Markdown，${Number(dayPlan.day) >= 15 ? '2200-3200' : Number(dayPlan.day) >= 8 ? '1600-2400' : '1200-2000'} 字；Day≥15 必须写满例题步骤与至少 1 个取舍判断）
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

## 禁止
- 不要「先有生活/业务例子，再回到正式定义」这类制作说明
- 不要表格「定义」列只重复章节标题
- 不要把多天内容塞进一篇`;

    const data = await chatJson({ system, user, temperature: strict ? 0.35 : 0.28, max_tokens: 7000 });
    const md = data?.markdown || data?.content || '';
    const slug = data?.slug || chapter.slug;
    return { slug, markdown: rewriteRoleLensInText(String(md), meta) };
  }

  /** 用设计稿拼出可用日课（优于空壳 stub） */
  function richFallbackFromLesson(meta, chapter, dayPlan, lesson) {
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
`;
  }

  async function generateHubBodies(meta, chapterBatch, plan) {
    const map = new Map();
    const ch = chapterBatch[0];
    if (!ch) return map;
    const dayPlan = dayPlanFromChapter(ch, plan);
    const preferStrict = Number(dayPlan.day) >= 15;
    try {
      const lesson = await designDailyLesson(meta, dayPlan);
      const searchHits = hasSearchKey()
        ? await searchMany([`${meta.industry} ${dayPlan.topic || ch.title}`], {
            count: 6,
            maxQueries: 1,
          })
        : [];
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
          markdown: richFallbackFromLesson(meta, ch, dayPlan, lesson),
        };
      }
      // 兜底仍浅则打标，供质量门禁定点重试
      if (isShallowHubMarkdown(written.markdown, ch, shallowOpts)) {
        written.markdown = `${written.markdown}\n\n<!-- zhijing:shallow -->\n`;
      }
      map.set(ch.slug, written.markdown);
    } catch (e) {
      console.warn('[PackGenerator] daily hub failed Day', dayPlan.day, e);
      try {
        const lesson = await designDailyLesson(meta, dayPlan);
        map.set(ch.slug, richFallbackFromLesson(meta, ch, dayPlan, lesson));
      } catch {
        map.set(
          ch.slug,
          richFallbackFromLesson(meta, ch, dayPlan, {
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
          })
        );
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
    let resources = Array.isArray(row?.resources) ? row.resources : [];
    resources = resources
      .map((r) => ({
        title: String(r.title || '').trim().slice(0, 80),
        url: String(r.url || '').trim(),
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
        q: String(ex.q || ex.question || '').trim().slice(0, 180),
        rubric: (Array.isArray(ex.rubric) ? ex.rubric : [])
          .map(String)
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 4),
        ref: ex.ref ? String(ex.ref).trim().slice(0, 120) : '',
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

    // 资料充足时优先保留非软降权域名
    if (resources.length >= 3) {
      const preferred = resources.filter((r) => !isLowQualityLearningHost(r.url));
      if (preferred.length >= 2) resources = preferred.slice(0, 4);
    }

    return { day, resources, exercises };
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
    return chatJson({ system, user, max_tokens: 3200 });
  }

  /**
   * 按意图联网搜索，再让模型只从 search_results 里挑链接
   * @returns {{ rows: Array, searchByDay: Map<number, Array> }}
   */
  async function curateDayResourceLinks(meta, planSlice, intents, onProgress) {
    const searchByDay = new Map();
    const dayMeta = new Map();
    const dayJobs = (planSlice || []).map((dayPlan) => {
      const day = dayPlan.day;
      const intentRow = (intents || []).find((x) => Number(x.day) === day);
      const intentList = intentRow?.intents || [];
      const learnWhat = intentList.map((it) => it.learnWhat || '').filter(Boolean).join('；');
      const queries = [];
      intentList.slice(0, 3).forEach((it) => {
        expandLearningQueries(it.query || it.learnWhat || dayPlan.topic, {
          prefer: it.prefer || '',
          learnWhat: it.learnWhat || '',
          topic: dayPlan.topic || '',
        }).forEach((q) => queries.push(q));
      });
      if (!queries.length) {
        expandLearningQueries(`${meta.industry} ${dayPlan.topic || ''}`, {
          topic: dayPlan.topic || '',
        }).forEach((q) => queries.push(q));
      }
      dayMeta.set(day, { learnWhat, topic: dayPlan.topic || '', intents: intentList });
      return { dayPlan, day, queries: queries.slice(0, 6), learnWhat };
    });

    const dayHits = await mapPool(
      dayJobs,
      SEARCH_CONCURRENCY,
      async ({ dayPlan, day, queries, learnWhat }) => {
        const raw = await searchMany(queries, { count: SEARCH_COUNT, maxQueries: 4 });
        const hits = rankAndFilterSearchHits(raw, {
          learnWhat,
          topic: dayPlan.topic || '',
        }).slice(0, 12);
        return { day, topic: dayPlan.topic, hits };
      },
      (done, total) => {
        if (onProgress) onProgress(`⑤ 联网搜索 ${done}/${total} 天…`);
      }
    );

    const allForPrompt = [];
    dayHits.forEach(({ day, topic, hits }) => {
      searchByDay.set(day, hits || []);
      allForPrompt.push({ day, topic, search_results: (hits || []).slice(0, 10) });
    });

    const hasAny = allForPrompt.some((d) => d.search_results?.length);
    if (!hasAny) {
      const rows = planSlice.map((d) => ({ day: d.day, resources: [], _hits: [] }));
      return { rows, searchByDay };
    }

    const system = `你是高信任学习资料策展人（FACTS_ONLY）。
硬性规则：只输出一个 JSON 数组。
1) resources[].url 必须精确复制自对应 day 的 search_results，禁止编造或改写 URL。
2) resources[].title 必须精确复制该 url 在 search_results 中的原 title，禁止改写成「教程/步骤」美化标题。
3) 只选能支撑「学方法/概念」的结果；不要选新闻、行情、汽车导购、社会热点。
4) 若某天 search_results 都不合适，该天 resources 输出 []。`;
    const user = `## Audience
${meta.industry} / ${meta.role}

## 意图（学什么）
${JSON.stringify(intents).slice(0, 2500)}

## 按日 search_results（唯一合法链接与标题来源）
${JSON.stringify(allForPrompt).slice(0, 12000)}

## Task
[{"day":1,"resources":[{"title":"必须=search_results原标题","url":"必须来自该日 search_results","type":"article|video|report|tool"}]}]
要求：每天尽量 2-3 条可直接打开的具体页面；宁缺毋滥；优先百科/官方/视频教程/高质量文档。`;
    const curated = await chatJson({ system, user, temperature: 0.15, max_tokens: 4000 });
    let rows = Array.isArray(curated) ? curated : curated.days || curated.items || [];

    rows = planSlice.map((d) => {
      const row = rows.find((r) => Number(r.day) === d.day) || { day: d.day, resources: [] };
      const hits = searchByDay.get(d.day) || [];
      const metaDay = dayMeta.get(d.day) || {};
      let resources = filterResourcesToSearch(row.resources || [], hits, 'article', {
        learnWhat: metaDay.learnWhat || '',
        topic: metaDay.topic || d.topic || '',
      });
      if (resources.length < 2) {
        const filler = pickConcreteFromHits(hits, {
          learnWhat: metaDay.learnWhat || '',
          topic: metaDay.topic || d.topic || '',
          need: 3 - resources.length,
          excludeUrls: resources.map((r) => r.url),
        });
        resources = resources.concat(filler).slice(0, 4);
      }
      return { day: d.day, resources, _hits: hits };
    });

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
[{"day":1,"exercises":[{"q":"","rubric":["",""],"ref":"可选提示"}]}]
每天恰好 3 题，建议结构（内容必须换新，不可套下面例句）：
1) 闭卷提取：定义/差异/步骤中的一种，须含本日特有对象
2) 产出对齐：对照当日某条 task，问可检查结果（清单/字段/开场白/提纲等，每天换一种）
3) 场景取舍：冲突双方每天换人（开发/设计/运营/数据/老板…），问${meta.role}怎么做
严禁题干出现或等价于：
- 「用一句话总结今天/核心认知」
- 「合上资料，用工作语言定义「主题」」
- 「同事主张立刻扩大「主题」范围」
- 「一个该做、一个不该做的边界例子」
- 「举1个真实案例说明…在产品实践中的体现」「反思今日任务」
rubric 2-3 条可打分。`;
    return chatJson({ system, user, temperature: strict ? 0.35 : 0.4, max_tokens: 4200 });
  }

  function exerciseRowsLookHomogeneous(exerciseRows) {
    const byDay = {};
    (exerciseRows || []).forEach((r) => {
      const day = Number(r.day);
      byDay[day] = (r.exercises || []).map((e) => e?.q || e?.question || '');
    });
    return isHomogeneousExerciseSet(byDay);
  }

  async function generateDayMaterialsChunk(meta, planSlice, onProgress) {
    try {
      const intentsRaw = await planDayResourceIntents(meta, planSlice);
      const intents = Array.isArray(intentsRaw)
        ? intentsRaw
        : intentsRaw?.days || intentsRaw?.items || intentsRaw?.intents || [];
      let resourceRows = [];
      let searchByDay = new Map();
      try {
        const curated = await curateDayResourceLinks(meta, planSlice, intents, onProgress);
        resourceRows = curated.rows || [];
        searchByDay = curated.searchByDay || new Map();
      } catch (e) {
        console.warn('[PackGenerator] resource curate failed', e);
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
        console.warn('[PackGenerator] exercises failed', e);
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
      console.warn('[PackGenerator] day materials chunk failed', e);
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
    const plan = (pack.plan || []).filter((d) => d.day >= dayStart && d.day <= dayEnd);
    const dayResources = merge ? { ...(pack.dayResources || {}) } : {};
    const dayExercises = merge ? { ...(pack.dayExercises || {}) } : {};
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
        const rows = await generateDayMaterialsChunk(meta, slice, null);
        return { slice, rows };
      },
      (done, total) => {
        onProgress(
          `⑤ 资料周块完成 ${done}/${total}…`,
          progressBase + Math.round((done / total) * progressSpan)
        );
      }
    );

    chunkRows.forEach(({ slice, rows }) => {
      const byDay = new Map((rows || []).map((r) => [Number(r.day), r]));
      slice.forEach((dayPlan) => {
        const normalized = byDay.get(dayPlan.day) || {
          day: dayPlan.day,
          resources: [],
          exercises: fallbackDayExercises(dayPlan, meta),
        };
        dayResources[String(normalized.day)] = { resources: normalized.resources || [] };
        dayExercises[String(normalized.day)] =
          normalized.exercises || fallbackDayExercises(dayPlan, meta);
      });
    });

    pack.dayResources = dayResources;
    pack.dayExercises = dayExercises;
    pack.updatedAt = new Date().toISOString();
    return pack;
  }

  function pendingChapterMarkdown(ch) {
    const title = String(ch?.title || '本章').trim() || '本章';
    return `# ${title}\n\n> 本章正在后台准备中，先学已就绪的前几天即可；完成后打开知识库会自动更新。\n`;
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

    onProgress('⑥ 按课表生成「一天一章」知识库导航…', progressBase);
    const structure = await generateHubStructure(meta, outline || {}, plan);
    const flat = [];
    structure.modules.forEach((m) => (m.chapters || []).forEach((c) => flat.push(c)));

    const chapters = mergeBodies && pack.hub?.chapters
      ? { ...pack.hub.chapters }
      : {};

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

    /** 日章并行：每章内部仍是设计→深写串行；章与章之间限流并行 */
    onProgress(
      `⑦ 日课并行生成（Day ${dayStart}–${dayEnd === Infinity ? '末' : dayEnd}，并发 ${LLM_CONCURRENCY}）…`,
      progressBase + 2
    );
    const bodiesList = await mapPool(
      toWrite,
      LLM_CONCURRENCY,
      async (ch) => {
        const bodies = await generateHubBodies(meta, [ch], plan);
        const md = rewriteRoleLensInText(
          bodies.get(ch.slug) || stubMarkdown(meta, ch),
          meta
        );
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

    pack.hub = {
      title: structure.title,
      learningPath: structure.learningPath,
      navigation: structureToNavigation(structure),
      chapters,
      generatedAt: new Date().toISOString(),
      dailyAligned: true,
    };
    pack.updatedAt = new Date().toISOString();

    // 定点重写仍带 shallow 标记的章节（最多 5 天，控成本）
    const shallowSlugs = toWrite
      .map((ch) => ch.slug)
      .filter((slug) => /<!--\s*zhijing:shallow\s*-->/.test(chapters[slug] || ''));
    if (shallowSlugs.length) {
      const retryList = shallowSlugs.slice(0, 5);
      onProgress(`⑦b 浅文章节定点重写 ${retryList.length} 篇…`, progressBase + progressSpan - 2);
      await mapPool(retryList, Math.min(2, LLM_CONCURRENCY), async (slug) => {
        const ch = flat.find((c) => c.slug === slug);
        if (!ch) return;
        const bodies = await generateHubBodies(meta, [ch], plan);
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
  function runPackQualityGate(pack, outline, opts = {}) {
    if (!pack) return pack;
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

    const dayExercises = { ...(pack.dayExercises || {}) };
    const gateMeta = {
      industry: pack.meta?.industry,
      role: pack.meta?.role,
      goal: pack.meta?.goal,
    };
    let wasHomogeneous = isHomogeneousExerciseSet(dayExercises);
    const usedStems = {};
    Object.keys(dayExercises)
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
        dayExercises[k] = exs;
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
      dayResources[k] = { resources: resources.slice(0, 4) };
    });
    pack.dayResources = dayResources;

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
    const glossHit = glossaryHubHitRate(pack.glossary, pack);
    const glossStats = glossaryQualityStats(pack.glossary);

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
      glossaryPassCount: glossStats.passCount,
      glossaryPassRate: Number(glossStats.passRate.toFixed(3)),
      glossaryKindCount: glossStats.kindCount,
      glossaryKinds: glossStats.kinds,
      phaseMonotonic: true,
      needsReview:
        shallowChapters.length > Math.ceil((pack.plan?.length || 30) * 0.2) ||
        thinLate.length > 3 ||
        stemUniq < softMin * 0.9 ||
        (bloomIssues.length >= 2 && lenStats.median < medianMin) ||
        (pack.meta.glossaryFromHub && glossHit < 0.7) ||
        (pack.glossary?.length > 0 && glossStats.passRate < 0.85) ||
        (pack.glossary?.length >= 4 && glossStats.kindCount < 2),
    };
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

    await PackHarness.runLoop({
      name: 'pack-repair',
      maxRounds,
      act: async (round) => {
        PackHarness.setRole('generator');
        onProgress(`⑨ Harness 修复第 ${round} 轮…`, 99);
        const q = pack.meta?.quality || {};
        const findings = PackHarness.findingsFromQuality(q);
        const findingsText = PackHarness.formatFindingsForPrompt(findings);
        const gateMeta = {
          industry: meta.industry,
          role: meta.role,
          goal: meta.goal,
        };

        // 修浅文 + 后段偏薄章节（合并去重，控每轮上限）
        const slugSet = new Set([
          ...(q.shallowChapterSlugs || []),
          ...(q.thinLateChapterSlugs || []),
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
          if (!flat.length) {
            slugs.forEach((slug) => {
              flat.push({
                slug,
                title: slug.split('/').pop() || slug,
                days: String(slug.match(/day-(\d+)/i)?.[1] || ''),
                focus: slug,
              });
            });
          }
          await mapPool(flat, Math.min(2, LLM_CONCURRENCY), async (ch) => {
            const bodies = await generateHubBodies(meta, [ch], plan);
            let md = rewriteRoleLensInText(
              bodies.get(ch.slug) || pack.hub.chapters[ch.slug],
              meta
            );
            md = String(md || '').replace(/<!--\s*zhijing:shallow\s*-->/g, '').trim();
            if (md) pack.hub.chapters[ch.slug] = md;
          });
        }

        const needExerciseRepair =
          q.homogeneousExercises ||
          (q.templateExerciseCount || 0) > 0 ||
          q.stemUniqueOk === false ||
          (q.bloomRegressionWeeks || []).length > 0;

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
        const progressKey = `s${shallow}|n${thin}|t${templates}|h${homo ? 1 : 0}|b${bloom}|u${stem}|m${med}`;
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

    return pack;
  }

  /**
   * @param {object} meta { title, industry, role, goal, days, notes }
   * @param {(msg:string, pct:number)=>void} onProgress
   * @param {{ signal?: AbortSignal, skeletonDays?: number, onSkeletonReady?: (pack:object)=>void }} [opts]
   */
  async function generate(meta, onProgress = () => {}, opts = {}) {
    beginJob(opts.signal);
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

      onProgress(`⑤∥⑦ 先备 Day 1–${skeletonDays} 资料与知识库…`, 14);
      await Promise.all([
        attachDayMaterials(
          pack,
          (msg, pct) => onProgress(msg || '⑤ 骨架资料…', typeof pct === 'number' ? Math.min(28, 14 + (pct - 50) * 0.2) : 18),
          14,
          12,
          { dayStart: 1, dayEnd: skeletonDays, merge: false }
        ),
        attachHub(
          pack,
          outline,
          (msg, pct) => onProgress(msg || '⑦ 骨架知识库…', typeof pct === 'number' ? Math.min(32, 14 + (pct - 70) * 0.25) : 22),
          14,
          16,
          { dayStart: 1, dayEnd: skeletonDays, stubOutside: true }
        ),
      ]);

      onProgress('③ 先从已就绪章节抽术语…', 33);
      try {
        pack.glossary = await generateGlossary(
          m,
          outline,
          (msg) => onProgress(msg || '③ 术语…', 34),
          pack
        );
      } catch (e) {
        if (isAbortError(e)) throw e;
        console.warn('[PackGenerator] skeleton glossary failed', e);
        pack.glossary = ensureGlossary(m, outline, [], pack);
      }
      pack.meta.glossaryFromHub = true;
      pack.meta.glossaryHubHitRate = Number(glossaryHubHitRate(pack.glossary, pack).toFixed(3));
      pack.meta.generation = {
        ...pack.meta.generation,
        phase: 'filling',
        readyThroughDay: skeletonDays,
      };
      pack.status = 'partial';
      pack.updatedAt = new Date().toISOString();
      ContentPack.save(pack);
      onProgress(
        `前 ${skeletonDays} 天已可学习，其余课表后台补全中…`,
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
      });
    } finally {
      if (typeof PackHarness !== 'undefined') PackHarness.endSession('ok');
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

  /**
   * 骨架已就绪后的补全：其余课表 + 资料 + 知识库 + 术语 + 质量门禁
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

    const weekRanges = [];
    const weekCount = Math.ceil(days / CHUNK);
    for (let i = 0; i < weekCount; i++) {
      const start = i * CHUNK + 1;
      const end = Math.min(days, (i + 1) * CHUNK);
      if (end <= firstChunkEnd) continue;
      const rangeStart = Math.max(start, firstChunkEnd + 1);
      if (rangeStart <= end) weekRanges.push({ start: rangeStart, end });
    }

    onProgress(
      weekRanges.length
        ? `②∥④ 补全其余课表(${weekRanges.length}块) ∥ 面试作品…`
        : '④ 能力/面试/作品…',
      40
    );

    let planProgress = 40;
    const bump = (msg, pct) => {
      planProgress = Math.max(planProgress, pct);
      onProgress(msg, planProgress);
    };

    const planPromise = weekRanges.length
      ? mapPool(
          weekRanges,
          LLM_CONCURRENCY,
          ({ start, end }) => generatePlanChunk(m, o, start, end),
          (done, total) => {
            bump(
              `② 课表补全 ${done}/${total}…`,
              40 + Math.round((done / Math.max(1, total)) * 12)
            );
          }
        )
      : Promise.resolve([]);

    const [planChunks, extras] = await Promise.all([
      planPromise,
      generateExtras(m, o).then((ex) => {
        bump('④ 能力/面试/作品完成', 48);
        return ex;
      }),
    ]);

    pack.plan = mergePlanByDay(pack.plan, planChunks, days, o);
    pack.interview = extras.interview;
    pack.skills = extras.skills.length ? extras.skills : pack.skills;
    pack.portfolio = extras.portfolio;
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
    ContentPack.save(pack);

    const bloomIssues = diagnoseBloomRegression(pack.plan);
    if (bloomIssues.length) {
      console.warn('[PackGenerator] bloom regression weeks', bloomIssues);
    }

    onProgress('⑤∥⑦ 补全其余资料 ∥ 知识库…', 52);
    let matPct = 52;
    let hubPct = 52;
    const restStart = skeletonDays + 1;
    await Promise.all([
      restStart <= days
        ? attachDayMaterials(
            pack,
            (msg, pct) => {
              if (typeof pct === 'number') {
                matPct = 52 + ((pct - 52) / 16) * 20;
                matPct = Math.max(52, Math.min(72, matPct));
              }
              onProgress(msg || '⑤ 资料补全…', Math.max(matPct, hubPct));
            },
            52,
            18,
            { dayStart: restStart, dayEnd: days, merge: true }
          ).then(() => {
            matPct = 72;
          })
        : Promise.resolve().then(() => {
            matPct = 72;
          }),
      restStart <= days
        ? attachHub(
            pack,
            o,
            (msg, pct) => {
              if (typeof pct === 'number') {
                hubPct = 52 + ((pct - 70) / 28) * 28;
                hubPct = Math.max(52, Math.min(88, hubPct));
              }
              onProgress(msg || '⑦ 知识库补全…', Math.max(matPct, hubPct));
            },
            55,
            28,
            { dayStart: restStart, dayEnd: days, stubOutside: false, mergeBodies: true }
          ).then(() => {
            hubPct = 88;
          })
        : Promise.resolve().then(() => {
            hubPct = 88;
          }),
    ]);

    onProgress('③ 加厚术语库…', 90);
    try {
      pack.glossary = await generateGlossary(
        m,
        o,
        (msg) => onProgress(msg || '③ 术语…', 92),
        pack
      );
    } catch (e) {
      if (isAbortError(e)) throw e;
      console.warn('[PackGenerator] glossary after fill failed', e);
      pack.glossary = ensureGlossary(m, o, pack.glossary || [], pack);
    }
    pack.meta.glossaryFromHub = true;
    pack.meta.glossaryHubHitRate = Number(glossaryHubHitRate(pack.glossary, pack).toFixed(3));

    onProgress('⑧ Evaluator 质量门禁…', 96);
    if (typeof PackHarness !== 'undefined') PackHarness.setRole('evaluator');
    runPackQualityGate(pack, o);
    await repairPackWithHarness(pack, o, onProgress);

    pack.status = 'ready';
    pack.meta.generation = {
      ...(pack.meta.generation || {}),
      phase: 'done',
      readyThroughDay: days,
      completedAt: new Date().toISOString(),
    };
    pack.updatedAt = new Date().toISOString();
    if (typeof PackHarness !== 'undefined') {
      const snap = PackHarness.snapshot();
      if (snap) pack.meta.harness = snap;
    }
    const q = pack.meta?.quality;
    onProgress(
      q?.needsReview
        ? '课表已全部就绪（建议复查加厚质量）'
        : '课表已全部就绪',
      100
    );
    if (typeof PackHarness !== 'undefined') {
      const g = PackHarness.guardTool('contentPack.save', {});
      if (!g.ok) console.warn('[PackGenerator] save guard', g);
    }
    ContentPack.save(pack);
    return pack;
  }

  /** 对已有 partial 包继续补全 */
  async function continueFillForPack(packId, onProgress = () => {}, opts = {}) {
    beginJob(opts.signal);
    if (typeof PackHarness !== 'undefined') {
      PackHarness.beginSession({ packId });
      PackHarness.setRole('generator');
    }
    try {
      const pack = ContentPack.load(packId);
      if (!pack) throw new Error('找不到课表');
      throwIfAborted();
      _searchCache.clear();
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
        readyThroughDay: pack.meta.generation?.readyThroughDay || skeletonDays,
        skeletonDays,
      };
      pack.status = 'partial';
      ContentPack.save(pack);
      onProgress('继续补全其余课表…', 38);
      return await fillPackRemainder(pack, outline, m, onProgress, {
        firstChunkEnd,
        skeletonDays,
      });
    } finally {
      if (typeof PackHarness !== 'undefined') PackHarness.endSession('ok');
      endJob();
    }
  }

  /** 为已有内容包补全 / 重写知识库（P2） */
  async function generateHubForPack(packId, onProgress = () => {}, opts = {}) {
    beginJob(opts.signal);
    try {
    const pack = ContentPack.load(packId);
    if (!pack) throw new Error('找不到内容包');
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

    await attachHub(pack, outline, onProgress, 40, 55);

    onProgress('③ 从知识库抽取并精写术语库…', 92);
    const metaForGloss = {
      title: pack.meta?.title,
      industry: pack.meta?.industry,
      role: pack.meta?.role,
      goal: pack.meta?.goal,
      days: pack.meta?.days || plan.length,
      notes: pack.meta?.notes,
    };
    try {
      pack.glossary = await generateGlossary(metaForGloss, outline, undefined, pack);
    } catch (e) {
      if (isAbortError(e)) throw e;
      console.warn('[PackGenerator] glossary regenerate failed', e);
      pack.glossary = ensureGlossary(metaForGloss, outline, pack.glossary || [], pack);
    }
    pack.meta = pack.meta || {};
    pack.meta.glossaryFromHub = true;
    pack.meta.glossaryHubHitRate = Number(glossaryHubHitRate(pack.glossary, pack).toFixed(3));

    runPackQualityGate(pack, outline, { rewritePhases: false });
    pack.status = 'ready';
    pack.updatedAt = new Date().toISOString();
    ContentPack.save(pack);
    onProgress('知识库与术语库已就绪', 100);
    return pack;
    } finally {
      endJob();
    }
  }

  /** P3：为已有内容包补全每日外链与练习 */
  async function generateDayMaterialsForPack(packId, onProgress = () => {}, opts = {}) {
    beginJob(opts.signal);
    try {
    const pack = ContentPack.load(packId);
    if (!pack) throw new Error('找不到内容包');
    if (!pack.plan?.length) throw new Error('内容包没有课表，无法生成每日资料');
    throwIfAborted();
    _searchCache.clear();
    if (!hasSearchKey()) {
      onProgress('未检测到联网搜索（请先配置 DeepSeek 密钥）…', 3);
    }
    await attachDayMaterials(pack, onProgress, 5, 90);
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
    pack.status = 'ready';
    ContentPack.save(pack);
    onProgress('每日资料与练习已就绪', 100);
    return pack;
    } finally {
      endJob();
    }
  }

  return {
    generate,
    continueFillForPack,
    generateHubForPack,
    generateDayMaterialsForPack,
    parseJsonLoose,
    isAbortError,
    runPackQualityGate,
    repairPackWithHarness,
  };
})();
