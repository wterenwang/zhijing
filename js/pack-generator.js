/**
 * P1–P3：AI 生成学习内容包（多步 Prompt Chaining）
 * 课表 + 术语 + 面试 + 能力维 + 知识库章节 + 每日外链/练习
 * 依赖 AiReview 代理与 DeepSeek Key
 *
 * 方法依据（生成链设计）：
 * - UbD / Backward Design（Wiggins & McTighe）：先成果与证据，再学习活动
 * - ADDIE：Analysis → Design → Development 分步，避免一步写完全程
 * - Prompt Chaining（Prompting Guide / IBM）：大任务拆子任务，上一步输出喂下一步
 * - Bloom 修订版目标动词：课表/任务可检验，忌「了解/掌握」空话
 * - Retrieval practice + spacing（Karpicke 等）：术语闪卡短定义；练习闭卷提取
 *
 * 七板块均拆为「分析/清单 → 结构设计 → 内容展开」小流程，逼模型写深、写多。
 * 联网：复用 HotFeed / `/api/search`（DeepSeek Anthropic Web Search）。
 * 资料质量门禁（不新增用户可配置 API）：query 教学改写、资讯域名黑名单、原标题强制、
 * 意图匹配复查；不足时自动补「可直接打开」的搜索精选或维基词条，禁止甩搜索页让用户自选。
 *
 * 知识库（每日微课，对齐课表一天一章）：
 * - Microlearning：一单元一目标（Alpha Learning / Udemy L&D）
 * - LLM chaining + worked examples（arXiv 2306.01006；WorkedGen ITiCSE）
 * - 流程：课表→按天导航 → 日课设计（目标/概念/例题）→ 深写 Markdown → 质量门禁
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
    return top / stems.length >= 0.35;
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

  /**
   * 按日变化的底线练习：锚定 tasks，禁止三天同骨架
   */
  function buildVariedFallbackExercises(dayPlan, meta = {}) {
    const day = Number(dayPlan?.day) || 1;
    const topic = String(dayPlan?.topic || '今日主题').trim();
    const role = String(meta?.role || '本岗位').trim() || '本岗位';
    const industry = String(meta?.industry || '').trim();
    const tasks = Array.isArray(dayPlan?.tasks) ? dayPlan.tasks.map(String) : [];
    const t0 = tasks[0] ? String(tasks[0]).replace(/^打开知识库[^，,；;]{0,40}[，,；;]?/, '').slice(0, 42) : '';
    const t1 = tasks[1] ? String(tasks[1]).slice(0, 42) : '';
    const t2 = tasks[2] ? String(tasks[2]).slice(0, 42) : '';
    const variant = ((day - 1) % 5) + 1;

    const packs = {
      1: [
        {
          q: `闭卷：用工作语言定义「${topic}」必须包含的 2 个要素（对象+边界）`,
          rubric: ['含对象', '含边界/适用条件', '不用空话形容词'],
        },
        {
          q: t1
            ? `对照今日加工任务「${t1}」，列出你实际产出的 3 个检查点`
            : `为「${topic}」写 3 条可打分的完成检查点`,
          rubric: ['检查点可观察', '与今日主题相关', '不是「认真学习」类空话'],
        },
        {
          q: `${industry || '业务'}场景：${role} 与开发对「${topic}」范围争执，你先问哪 2 个问题再拍板？`,
          rubric: ['问题具体', '能暴露约束', '体现岗位权责'],
        },
      ],
      2: [
        {
          q: `合上资料，口述「${topic}」与相邻概念的 1 个关键差异（30 秒）`,
          rubric: ['对比双方明确', '差异可检验', '贴合行业对象'],
        },
        {
          q: t0
            ? `基于输入「${t0.slice(0, 36)}…」，写出你抓到的 1 个误区并纠正`
            : `写出「${topic}」的 1 个常见误区与纠正说法`,
          rubric: ['误区具体', '纠正可执行', '非口号'],
        },
        {
          q: `取舍题：时间只够做「${topic}」的一半，你砍掉哪一块？用一句 ROI/风险理由说明`,
          rubric: ['有明确砍项', '有理由', '像岗位决策而非逃避'],
        },
      ],
      3: [
        {
          q: `默写「${topic}」的适用条件 2 条 + 不适用条件 1 条`,
          rubric: ['正反条件都有', '可操作', `贴合${role}`],
        },
        {
          q: t2
            ? `不看资料完成提取任务意图：「${t2}」——给出你的结论提纲（3 点）`
            : `用 3 点提纲向同事讲清「${topic}」今天要达成什么`,
          rubric: ['提纲完整', '可口头交付', '对应今日主题'],
        },
        {
          q: `冲突：运营要扩大范围、你要守边界——围绕「${topic}」写你的协商开场白（≤40字）`,
          rubric: ['有立场', '有协商姿态', '提到具体对象'],
        },
      ],
      4: [
        {
          q: `用「假如…就会…」各写一条：正确使用「${topic}」与误用「${topic}」的后果`,
          rubric: ['正反后果都有', '后果可感知', '非空泛'],
        },
        {
          q: `设计 1 道给新人的判断题（含标准答案要点），考点必须是「${topic}」`,
          rubric: ['题目可作答', '有标准要点', '考点清晰'],
        },
        {
          q: `${role}视角：今天若只带走一个可迁移原则，关于「${topic}」你会带走哪句？为何？`,
          rubric: ['原则可迁移', '有为何', '不是复述标题'],
        },
      ],
      5: [
        {
          q: `列出「${topic}」交付物里必须有的字段/段落 3 个（或等价检查项）`,
          rubric: ['至少 3 项', '像真实交付', '可对照检查'],
        },
        {
          q: `场景：评审会上有人说「这个太细了先跳过」——你如何用「${topic}」相关理由拉回来？`,
          rubric: ['理由具体', '服务共识', '不人身攻击'],
        },
        {
          q: `写下你对「${topic}」仍不确定的一点，并写清下周用什么产出验证`,
          rubric: ['不确定点具体', '验证方式可做', '一周内可完成'],
        },
      ],
    };
    return packs[variant] || packs[1];
  }

  function weekBloomAverages(plan) {
    const buckets = new Map();
    for (const d of plan || []) {
      const day = Number(d.day) || 0;
      const week = Math.ceil(day / 7) || 1;
      const blob = [d.topic, ...(d.tasks || [])].join(' ');
      const lvl = bloomLevelFromText(blob) || 2;
      if (!buckets.has(week)) buckets.set(week, []);
      buckets.get(week).push(lvl);
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

  /** 若周均 Bloom 明显倒退，给后续周补强 seed（仅作诊断标记，供重生成参考） */
  function diagnoseBloomRegression(plan) {
    const avgs = weekBloomAverages(plan);
    const issues = [];
    for (let i = 1; i < avgs.length; i++) {
      if (avgs[i].avg < avgs[i - 1].avg - 0.8) {
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
   * Prompt 设计参考（PROMPT_VER=2026-07-15s，find-skills 强化）：
   * - OpenAI/Anthropic：指令在前、分隔符分区、任务最后；Few-shot；结构化 JSON
   * - davila7/prompt-engineer：Role→Instructions→Constraints(含 DON'T)→Output→Examples
   * - mattpocock/teach：Mission 锚定；Glossary=压缩参考（定义 IS 非 HOW）；aliases 通行名；
   *   「别这样叫」压歧义；lesson=短小可完成+一个可感知赢；知识先易、技能用提取练习建存储强度
   * - obsidian-notes / knowledge-site：动机→直觉→类比→定义；一句话摘要便于闪卡
   * - awesome-copilot/educational-comments：解释 why，不只罗列 what
   */
  const GLOSSARY_FEWSHOT = {
    term: '数据飞轮',
    aliases: ['Data Flywheel'],
    module: '产品',
    definition: '用户使用数据持续回流并驱动下一轮产品/模型改进的正反馈循环。',
    sections: [
      {
        label: '是什么',
        content:
          '不是「有很多数据」本身，而是采集→清洗→训练→部署→再采集的链路能转、且回流可运营。后文「数据闭环」指这条工程链路。',
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
        label: '和相近概念的区别',
        content:
          '· 数据闭环：链路完整；飞轮：正反馈加速\\n· 简单埋点：有采集无回流迭代≠飞轮',
      },
      {
        label: '面试怎么答',
        content:
          '一句话：飞轮是「越好用→越好数据→更好产品」的可运营闭环。再补：冷启动靠种子场景/补贴数据，不是等自然增长。',
      },
    ],
  };

  // ─── ③ 术语：词表清单 → 分批精写（检索练习友好） ───

  async function inventGlossaryTermList(meta, outline) {
    const { role } = roleLens(meta);
    const system = `你是「${meta.industry}」领域术语策展人（面向 ${role}）。
参考：闪卡应「一词一义、短定义」（检索练习研究）。先列清单，不写长文。
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
    }).slice(0, 4000)}

## Task
输出：
{
  "terms": [
    {"term":"术语","module":"行业|技术|方法|商业|面试","why":"为何必须会","confusableWith":"易混词或空"}
  ]
}
要求：16-22 个词；优先该行业/岗位高频黑话与决策概念；少用万能词（如「沟通」「学习能力」）；覆盖大纲各阶段。`;
    return chatJson({ system, user, temperature: 0.25, max_tokens: 2800 });
  }

  async function expandGlossaryBatch(meta, outline, termBatch) {
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
      .slice(0, 3)
      .map((t) => `${meta.industry} ${t.term || t} 定义 含义`);
    const searchHits = hasSearchKey()
      ? await searchMany(termQueries, { count: 5, maxQueries: 3 })
      : [];

    const system = `你是术语教学设计师与「${meta.industry}」资深「${role}」教练。
Mission：每条词做成可背诵、可判断、可面试的参照（retrieval-friendly）。
${DEPTH_CONTRACT}
若有 search_results：定义须与资料一致的方向，禁止编造搜索未支持的精确数据/年份。
输出契约：仅输出一个合法 JSON 对象。`;
    const user = `## Audience
岗位：${role}｜行业：${meta.industry}｜目标：${meta.goal || '入门'}

## 本批要写的词（不得增删词头，可微调别名）
${JSON.stringify(termBatch)}

## search_results
${formatSearchBlock(searchHits, 16)}

## Example
${JSON.stringify({ glossary: [glossaryFewshot] })}

## Output schema
{"glossary":[{"term":"","aliases":[],"module":"","definition":"","sections":[{"label":"是什么","content":""},{"label":"别这样叫","content":""},{"label":"${judgmentLabel}","content":""},{"label":"和相近概念的区别","content":""},{"label":"面试怎么答","content":""}]}]}

## Constraints
- definition ≤45 字，工作定义不是口号
- sections 至少含：是什么、${judgmentLabel}、面试怎么答；尽量含「别这样叫」「和相近概念的区别」
- 判断问题要贴 ${role} 日常取舍；面试答可 30-45 秒口述
- 禁止写「PM 视角」标签（除非岗位是产品经理）`;
    const data = await chatJson({ system, user, temperature: 0.22, max_tokens: 5500 });
    return normalizeGlossary(data.glossary || data, meta);
  }

  async function generateGlossary(meta, outline, onProgress) {
    try {
      const listObj = await inventGlossaryTermList(meta, outline);
      const terms = Array.isArray(listObj?.terms) ? listObj.terms : [];
      if (!terms.length) {
        return ensureGlossary(meta, outline, []);
      }
      const batchSize = 5;
      const batches = [];
      for (let i = 0; i < terms.length; i += batchSize) {
        batches.push(terms.slice(i, i + batchSize));
      }
      const parts = await mapPool(
        batches,
        LLM_CONCURRENCY,
        async (batch, i) => {
          try {
            return await expandGlossaryBatch(meta, outline, batch);
          } catch (e) {
            console.warn('[PackGenerator] glossary batch failed', i, e);
            return [];
          }
        },
        (done, total) => {
          if (onProgress) onProgress(`③ 术语分批精写 ${done}/${total}…`);
        }
      );
      return ensureGlossary(meta, outline, parts.flat());
    } catch (e) {
      console.warn('[PackGenerator] glossary generation failed, using role stub', e);
      return ensureGlossary(meta, outline, []);
    }
  }

  /** 按行业/岗位/周主题合成兜底词条，避免空词表或回退到别的行业 */
  function buildRoleStubGlossary(meta, outline) {
    const { role, judgmentLabel } = roleLens(meta);
    const industry = String(meta.industry || '本行业').trim();
    const goal = meta.goal || '入门';
    const themes = Array.isArray(outline?.weekThemes)
      ? outline.weekThemes.map((w) => String(w.theme || w.title || '').trim()).filter(Boolean)
      : [];
    const seeds = [
      {
        term: industry,
        module: '行业',
        definition: `${industry}领域的基本工作语境与常见业务对象总称。`,
        judgment: `从${role}视角判断：哪些问题属于本行业、哪些应转交相邻领域。`,
      },
      {
        term: role,
        module: '面试',
        definition: `在「${industry}」语境下，${role}的职责边界与核心产出的工作定义。`,
        judgment: `能一句话说清 ${role} 对谁负责、交付什么、如何衡量好。`,
      },
      {
        term: `${goal}准备`,
        module: '方法',
        definition: `围绕「${goal}」目标组织证据、案例与表达结构的系统准备动作。`,
        judgment: `证据是否对应该岗位真实考核点，而非空泛自我介绍。`,
      },
      {
        term: '边界判断',
        module: '方法',
        definition: '在资源与目标冲突时，决定做什么、不做什么、何时升级或降级的判断能力。',
        judgment: `结合 ${role} 日常：最近一个该拒绝/缩小范围的需求是什么。`,
      },
      {
        term: '验收标准',
        module: '方法',
        definition: '某项工作可被他人客观判定「完成」的可检验条件。',
        judgment: `你写的验收条款 ${role} 同事能否不追问也能执行。`,
      },
      {
        term: '竞品/对照分析',
        module: '行业',
        definition: `对照同类方案在 ${industry} 场景中的差异、优劣与可借鉴点。`,
        judgment: `维度是否贴合 ${role} 决策，而非堆砌参数。`,
      },
      {
        term: '风险清单',
        module: '方法',
        definition: '对失败模式、依赖与不可逆成本的结构化列举与应对预案。',
        judgment: `清单是否能指导下周行动，而不是吓一吓就结束。`,
      },
      {
        term: '关键指标',
        module: '商业',
        definition: `衡量「${role}」工作是否创造业务/用户价值的主次指标体系。`,
        judgment: `优化主指标时，护栏指标会不会被牺牲。`,
      },
    ];
    themes.slice(0, 10).forEach((theme, i) => {
      if (seeds.some((s) => s.term === theme)) return;
      seeds.push({
        term: theme.slice(0, 24),
        module: i % 2 === 0 ? '行业' : '技术',
        definition: `与「${theme}」相关的 ${industry} / ${role} 学习主题：需建立可口述的工作定义与使用边界。`,
        judgment: `何时该深入「${theme}」，何时只需知道边界即可。`,
      });
    });
    return seeds.map((s) => ({
      term: s.term,
      aliases: [],
      module: s.module,
      definition: s.definition.slice(0, 120),
      sections: [
        { label: '是什么', content: s.definition },
        { label: judgmentLabel, content: s.judgment },
        {
          label: '面试怎么答',
          content: `先给工作定义：${s.definition}。再补 1 个「${industry} · ${role}」场景例子。`,
        },
      ],
    }));
  }

  function ensureGlossary(meta, outline, glossary) {
    const list = Array.isArray(glossary) ? glossary.slice() : [];
    if (list.length >= 12) return list.slice(0, 28);
    const stubs = buildRoleStubGlossary(meta, outline);
    const seen = new Set(list.map((g) => String(g.term || '').toLowerCase()));
    for (const s of stubs) {
      const key = String(s.term || '').toLowerCase();
      if (!key || seen.has(key)) continue;
      list.push(s);
      seen.add(key);
      if (list.length >= 18) break;
    }
    return list.slice(0, 28);
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
        return {
          term,
          aliases: Array.isArray(g.aliases) ? g.aliases.map(String).filter(Boolean).slice(0, 4) : [],
          module: String(g.module || '核心').slice(0, 12),
          definition: definition.slice(0, 120),
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

  /** 检测空壳/模板正文（用户截图即此类） */
  function isShallowHubMarkdown(md, chapter) {
    const s = String(md || '');
    if (s.length < 900) return true;
    if (/先有生活\/业务例子，再回到正式定义/.test(s)) return true;
    if (/口号\s*≠\s*定义/.test(s) && s.length < 1400) return true;
    const title = String(chapter?.title || '').trim();
    if (title && s.includes(`| 定义 | ${title} |`)) return true;
    // 缺少具体行业词或例题步骤
    if (!/###\s*例题|##\s*例题|步骤\s*1|Worked|演算|对照/.test(s) && s.length < 1600) return true;
    // 后段常见塌陷：把标题当内容 / 元指令类比 / Mission 只复读标题
    if (/讲清并应用[「『"]/.test(s)) return true;
    if (/想成\s*.{0,24}现场要先分清边界再动手/.test(s)) return true;
    if (/学完你应能：讲清并应用/.test(s)) return true;
    if (title && s.length < 1400 && (s.match(new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length >= 6) {
      return true;
    }
    // 必须有可执行例题步骤或判断题列表
    const hasSteps = /步骤\s*[123]|Worked Example|例题精讲/.test(s);
    const hasJudgment = /判断题|取舍|该不该|能不能做/.test(s);
    if (!hasSteps && !hasJudgment && s.length < 2200) return true;
    return false;
  }

  async function designDailyLesson(meta, dayPlan) {
    const { role } = roleLens(meta);
    const system = `你是「${meta.industry}」日课教学设计师（Microlearning：一课一目标 + Worked Example）。
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
借鉴：worked example（先看完整解题步骤再练习）+ 提取练习收尾。
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

## 正文结构（Markdown，1200-2000 字）
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
      if (isShallowHubMarkdown(written.markdown, ch)) {
        console.warn('[PackGenerator] shallow hub markdown, retry Day', dayPlan.day);
        written = await writeDailyLessonMarkdown(meta, ch, dayPlan, lesson, searchHits, {
          strict: true,
        });
      }
      if (isShallowHubMarkdown(written.markdown, ch)) {
        written = {
          slug: ch.slug,
          markdown: richFallbackFromLesson(meta, ch, dayPlan, lesson),
        };
      }
      // 兜底仍浅则打标，供质量门禁定点重试
      if (isShallowHubMarkdown(written.markdown, ch)) {
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

  async function generateDayRetrievalExercises(meta, planSlice, resourcesRows, { strict = false } = {}) {
    const system = `你是提取练习出题人（Karpicke retrieval practice：闭卷回忆 > 重读）。
${DEPTH_CONTRACT}
硬性规则：只输出一个 JSON 数组。
每天 3 题必须彼此不同、且跨天不得复用同一题干骨架（禁止只改书名号里的主题词）。
${strict ? '【加严】上一稿同质或模板：必须换冲突角色、换产出形式、换考点；禁止定义题+扩大范围题+边界例子题三件套。' : ''}`;
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
          const ex2 = await generateDayRetrievalExercises(meta, planSlice, resourceRows, {
            strict: true,
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
   */
  async function attachDayMaterials(pack, onProgress = () => {}, progressBase = 50, progressSpan = 20) {
    const meta = {
      title: pack.meta?.title,
      industry: pack.meta?.industry,
      role: pack.meta?.role,
      goal: pack.meta?.goal,
      days: pack.meta?.days || pack.plan?.length || 30,
      notes: pack.meta?.notes || '',
    };
    const plan = pack.plan || [];
    const dayResources = {};
    const dayExercises = {};
    const chunkSize = 7;
    const slices = [];
    for (let i = 0; i < plan.length; i += chunkSize) {
      slices.push(plan.slice(i, i + chunkSize));
    }
    const totalChunks = slices.length || 1;

    onProgress(`⑤ 每日资料并行生成（${totalChunks} 周块）…`, progressBase);
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

  /**
   * 生成 hub 章节并写入 pack.hub
   */
  async function attachHub(pack, outline, onProgress = () => {}, progressBase = 70, progressSpan = 28) {
    const meta = {
      title: pack.meta?.title,
      industry: pack.meta?.industry,
      role: pack.meta?.role,
      goal: pack.meta?.goal,
      days: pack.meta?.days || pack.plan?.length || 30,
      notes: pack.meta?.notes || '',
    };
    const plan = pack.plan || [];

    onProgress('⑥ 按课表生成「一天一章」知识库导航…', progressBase);
    const structure = await generateHubStructure(meta, outline || {}, plan);
    const flat = [];
    structure.modules.forEach((m) => (m.chapters || []).forEach((c) => flat.push(c)));

    const chapters = {};
    /** 日章并行：每章内部仍是设计→深写串行；章与章之间限流并行 */
    onProgress(`⑦ 日课并行生成（并发 ${LLM_CONCURRENCY}）…`, progressBase + 2);
    const bodiesList = await mapPool(
      flat,
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
    const shallowSlugs = Object.keys(chapters).filter((slug) =>
      /<!--\s*zhijing:shallow\s*-->/.test(chapters[slug] || '')
    );
    if (shallowSlugs.length) {
      const retryList = shallowSlugs.slice(0, 5);
      onProgress(`⑦b 浅文章节定点重写 ${retryList.length} 篇…`, progressBase + progressSpan - 2);
      await mapPool(retryList, Math.min(2, LLM_CONCURRENCY), async (slug) => {
        const ch = flat.find((c) => c.slug === slug);
        if (!ch) return;
        const bodies = await generateHubBodies(meta, [ch], plan);
        let md = rewriteRoleLensInText(bodies.get(slug) || chapters[slug], meta);
        md = String(md || '').replace(/<!--\s*zhijing:shallow\s*-->/g, '').trim();
        if (!isShallowHubMarkdown(md, ch)) {
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
    Object.keys(dayExercises).forEach((k) => {
      const dayPlan = (pack.plan || []).find((d) => String(d.day) === String(k)) || {
        day: Number(k),
        topic: `Day ${k}`,
        tasks: [],
      };
      let exs = Array.isArray(dayExercises[k]) ? dayExercises[k] : [];
      exs = exs.filter((ex) => !isTemplateExerciseQuestion(ex?.q));
      if (exs.length < 2) {
        exs = buildVariedFallbackExercises(dayPlan, gateMeta);
      }
      dayExercises[k] = exs;
    });
    if (wasHomogeneous || isHomogeneousExerciseSet(dayExercises)) {
      console.warn('[PackGenerator] quality gate: homogeneous exercises → varied fallback');
      wasHomogeneous = true;
      Object.keys(dayExercises).forEach((k) => {
        const dayPlan = (pack.plan || []).find((d) => String(d.day) === String(k)) || {
          day: Number(k),
          topic: `Day ${k}`,
          tasks: [],
        };
        dayExercises[k] = buildVariedFallbackExercises(dayPlan, gateMeta);
      });
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

    const bloomIssues = diagnoseBloomRegression(pack.plan || []);
    const shallowChapters = Object.entries(pack.hub?.chapters || {})
      .filter(([, md]) => isShallowHubMarkdown(md, {}) || /<!--\s*zhijing:shallow\s*-->/.test(md))
      .map(([slug]) => slug);

    pack.meta = pack.meta || {};
    pack.meta.quality = {
      checkedAt: new Date().toISOString(),
      templateExerciseCount: countTemplateExercises(pack.dayExercises),
      homogeneousExercisesFixed: wasHomogeneous,
      homogeneousExercises: isHomogeneousExerciseSet(pack.dayExercises),
      bloomRegressionWeeks: bloomIssues,
      shallowChapterCount: shallowChapters.length,
      shallowChapterSlugs: shallowChapters.slice(0, 12),
      phaseMonotonic: true,
      needsReview: shallowChapters.length > Math.ceil((pack.plan?.length || 30) * 0.2),
    };

    pack.updatedAt = new Date().toISOString();
    return pack;
  }

  /**
   * @param {object} meta { title, industry, role, goal, days, notes }
   * @param {(msg:string, pct:number)=>void} onProgress
   * @param {{ signal?: AbortSignal }} [opts]
   */
  async function generate(meta, onProgress = () => {}, opts = {}) {
    beginJob(opts.signal);
    try {
      throwIfAborted();
      const days = Math.min(90, Math.max(7, Number(meta.days) || 30));
      const m = { ...meta, days };
      _searchCache.clear();

      const searchOn = hasSearchKey();
      onProgress(
        searchOn
          ? '① 联网摸底行业 → 分析学习成果…'
          : '① 分析学习成果（未启用联网搜索，将主要依赖模型）…',
        3
      );
      const outline = await generateOutline(m);

    // ②∥③∥④：课表周块 / 术语 / extras 都只依赖大纲 → 三线并行
    const weekRanges = [];
    const weekCount = Math.ceil(days / CHUNK);
    for (let i = 0; i < weekCount; i++) {
      weekRanges.push({
        start: i * CHUNK + 1,
        end: Math.min(days, (i + 1) * CHUNK),
      });
    }
    onProgress(
      `②∥③∥④ 课表(${weekRanges.length}周块) ∥ 术语 ∥ 面试作品（并发≤${LLM_CONCURRENCY}）…`,
      10
    );

    let planProgress = 10;
    const bump = (msg, pct) => {
      planProgress = Math.max(planProgress, pct);
      onProgress(msg, planProgress);
    };

    const [planChunks, glossary, extras] = await Promise.all([
      mapPool(
        weekRanges,
        LLM_CONCURRENCY,
        ({ start, end }) => generatePlanChunk(m, outline, start, end),
        (done, total) => {
          bump(
            `② 课表周块 ${done}/${total}…`,
            10 + Math.round((done / Math.max(1, total)) * 28)
          );
        }
      ),
      generateGlossary(m, outline, (msg) => bump(msg, 30)),
      generateExtras(m, outline).then((ex) => {
        bump('④ 能力/面试/作品完成', 32);
        return ex;
      }),
    ]);
    const plan = injectHubBacklinkTasks(
      applyPhaseFromOutline(fillMissingDays(planChunks.flat(), days, outline), outline)
    );
    const bloomIssues = diagnoseBloomRegression(plan);
    if (bloomIssues.length) {
      console.warn('[PackGenerator] bloom regression weeks', bloomIssues);
    }

    const pack = ContentPack.emptyPack({
      ...m,
      title: outline.title || m.title,
      id: ContentPack.uid(),
    });
    pack.plan = plan;
    pack.glossary = glossary;
    pack.interview = extras.interview;
    pack.skills = extras.skills.length ? extras.skills : [
      { id: 'industry', label: '行业认知', desc: '' },
      { id: 'domain', label: '领域方法', desc: '' },
      { id: 'product', label: '产品/业务能力', desc: '' },
      { id: 'execution', label: '落地执行', desc: '' },
      { id: 'portfolio', label: '作品集', desc: '' },
      { id: 'interview', label: '面试表达', desc: '' },
    ];
    pack.portfolio = extras.portfolio;
    pack.meta = pack.meta || {};
    pack.meta.outcomes = outline.outcomes || null;
    pack.hot = {
      keywords: outline.hotKeywords || [`${m.industry} ${m.role} 新闻`, `${m.industry} 融资`, `${m.industry} 政策`],
      systemHint: `面向「${m.industry}」行业「${m.role}」读者策展产业日课。`,
    };

    // ⑤∥⑦ 每日资料 ∥ 知识库（都依赖课表）— 最大提速点
    onProgress('⑤∥⑦ 每日资料 ∥ 知识库日课 并行…', 42);
    let matPct = 42;
    let hubPct = 42;
    await Promise.all([
      attachDayMaterials(
        pack,
        (msg, pct) => {
          if (typeof pct === 'number') {
            matPct = 42 + ((pct - 52) / 16) * 28;
            matPct = Math.max(42, Math.min(70, matPct));
          }
          onProgress(msg || '⑤ 资料…', Math.max(matPct, hubPct));
        },
        52,
        16
      ).then(() => {
        matPct = 70;
      }),
      attachHub(
        pack,
        outline,
        (msg, pct) => {
          if (typeof pct === 'number') {
            hubPct = 42 + ((pct - 70) / 28) * 56;
            hubPct = Math.max(42, Math.min(98, hubPct));
          }
          onProgress(msg || '⑦ 知识库…', Math.max(matPct, hubPct));
        },
        70,
        28
      ).then(() => {
        hubPct = 98;
      }),
    ]);

    onProgress('⑧ 质量门禁（阶段/练习/浅文）…', 99);
    runPackQualityGate(pack, outline);
    pack.status = 'ready';
    pack.updatedAt = new Date().toISOString();
    const q = pack.meta?.quality;
    onProgress(
      q?.needsReview
        ? '内容包已就绪（部分章节建议复查，见 meta.quality）'
        : '内容包已就绪（含质量门禁）',
      100
    );
    ContentPack.save(pack);
    return pack;
    } finally {
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

    onProgress('按岗位生成术语库…', 92);
    try {
      const glossary = await generateGlossary(
        {
          title: pack.meta?.title,
          industry: pack.meta?.industry,
          role: pack.meta?.role,
          goal: pack.meta?.goal,
          days: pack.meta?.days || plan.length,
          notes: pack.meta?.notes,
        },
        outline,
      );
      pack.glossary = glossary;
    } catch (e) {
      if (isAbortError(e)) throw e;
      console.warn('[PackGenerator] glossary regenerate failed', e);
      pack.glossary = ensureGlossary(
        {
          industry: pack.meta?.industry,
          role: pack.meta?.role,
          goal: pack.meta?.goal,
        },
        outline,
        pack.glossary || [],
      );
    }

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

  return { generate, generateHubForPack, generateDayMaterialsForPack, parseJsonLoose, isAbortError, runPackQualityGate };
})();
