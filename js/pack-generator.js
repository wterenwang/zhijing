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
 * 联网：复用 HotFeed 的搜索 Key / `/api/search`（博查·Tavily），在资料/术语/章节等处注入 search_results。
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

  /** 纠正模型仍输出「PM 视角」等通用模板的情况 */
  function rewriteRoleLensInText(text, meta) {
    const { role, sectionHeading, judgmentLabel, decisionSubhead } = roleLens(meta);
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
    return withLlmSlot(() =>
      AiReview.chat({
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature,
        max_tokens,
      })
    );
  }

  function metaBrief(meta) {
    return `行业：${meta.industry}
岗位：${meta.role}
目标：${meta.goal || '校招'}
总天数：${meta.days}
备注：${meta.notes || '无'}
标题意向：${meta.title || '（由模型拟定）'}`;
  }

  async function chatJson({ system, user, temperature = 0.28, max_tokens = 4096 }) {
    const text = await chat({ system, user, temperature, max_tokens });
    return parseJsonLoose(text);
  }

  // ─── 联网搜索（复用「开启智能功能」里的搜索 Key） ───

  function hasSearchKey() {
    if (typeof HotFeed !== 'undefined' && typeof HotFeed.hasSearchKey === 'function') {
      return HotFeed.hasSearchKey();
    }
    if (typeof HotFeed !== 'undefined' && typeof HotFeed.getSearchKey === 'function') {
      return !!HotFeed.getSearchKey();
    }
    return false;
  }

  function slimSearchHit(r) {
    return {
      title: String(r?.title || '').slice(0, 160),
      url: String(r?.url || '').trim(),
      snippet: String(r?.snippet || r?.content || r?.summary || '').slice(0, 280),
    };
  }

  /**
   * @returns {Promise<Array<{title,url,snippet}>>}
   */
  async function searchWeb(query, { count = SEARCH_COUNT, minResults = 1 } = {}) {
    const q = String(query || '').trim();
    if (!q) return [];
    const cacheKey = `${q}::${count}`;
    if (_searchCache.has(cacheKey)) return _searchCache.get(cacheKey);

    const apiKey =
      typeof HotFeed !== 'undefined' && HotFeed.getSearchKey ? HotFeed.getSearchKey() : '';
    if (!apiKey) return [];

    const provider =
      typeof HotFeed !== 'undefined' && HotFeed.getSearchProvider
        ? HotFeed.getSearchProvider()
        : 'bocha';

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey, query: q, count }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.warn('[PackGenerator] search fail', q, data?.error?.message || res.status);
        _searchCache.set(cacheKey, []);
        return [];
      }
      const results = (Array.isArray(data.results) ? data.results : [])
        .map(slimSearchHit)
        .filter((r) => r.url && /^https?:\/\//i.test(r.url));
      const out = results.length >= minResults ? results : results;
      _searchCache.set(cacheKey, out);
      return out;
    } catch (e) {
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

  function filterResourcesToSearch(resources, searchResults, typeHint = 'article') {
    const allowed = new Set(['article', 'video', 'report', 'tool']);
    const urlSet = new Set((searchResults || []).map((r) => r.url));
    const byUrl = new Map((searchResults || []).map((r) => [r.url, r]));
    let picked = (resources || [])
      .map((r) => ({
        title: String(r.title || '').trim().slice(0, 80),
        url: String(r.url || '').trim(),
        type: allowed.has(String(r.type)) ? String(r.type) : typeHint,
      }))
      .filter((r) => r.title && r.url && urlSet.has(r.url));

    if (picked.length < 2 && searchResults?.length) {
      const extra = searchResults
        .filter((r) => !picked.some((p) => p.url === r.url))
        .slice(0, 3 - picked.length)
        .map((r) => ({
          title: (r.title || r.snippet || '参考资料').slice(0, 80),
          url: r.url,
          type: typeHint,
        }));
      picked = picked.concat(extra);
    }
    // 标题可用来自搜索结果补全
    picked = picked.map((r) => {
      const hit = byUrl.get(r.url);
      if (hit && (!r.title || r.title.length < 4)) {
        return { ...r, title: hit.title.slice(0, 80) };
      }
      return r;
    });
    return picked.slice(0, 4);
  }

  // ─── ① 大纲：UbD 成果分析 → 阶段周主题 → 定稿 JSON ───

  async function analyzeLearningOutcomes(meta) {
    const searchHits = hasSearchKey()
      ? await searchMany(
          [
            `${meta.industry} ${meta.role} 职责 能力 要求`,
            `${meta.industry} ${meta.role} ${meta.goal || '校招'} 面试 核心知识点`,
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
  "weekThemes": [{"week":1,"theme":"本周主题（具体，含领域对象）","dayStart":1,"dayEnd":7,"focusQuestion":"本周要回答的决策问题","bloom":"理解|应用|分析"}],
  "hotKeywords": ["可用于产业资讯搜索的中文关键词1","…3-6条"]
}
要求：
- phases 4 段左右：认知边界→方法工具→实战作品→面试冲刺
- weekThemes 必须覆盖满 ${meta.days} 天，每周 theme 点名行业对象，禁止「综合提升」
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
  "weekThemes": [{"week":1,"theme":"","dayStart":1,"dayEnd":7}],
  "hotKeywords": [],
  "outcomes": {
    "exitPortrait": "",
    "competencies": [{"id":"","name":"","observable":"","evidence":""}],
    "domainAnchors": [],
    "misconceptions": []
  }
}
要求：weekThemes 覆盖满 ${meta.days} 天；保留领域锚点与误区；title 具体。`;
    const final = await chatJson({ system, user, temperature: 0.2, max_tokens: 4000 });
    if (!final.outcomes) final.outcomes = outcomes;
    if (!final.title) final.title = scaffold.title || meta.title;
    return final;
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
要求：dailySeeds 恰好覆盖 ${dayStart} 到 ${dayEnd} 每一天；bloom 周内由低到高略递进；seedTopic 禁止「复习/总结」占超过 1 天。`;
    return chatJson({ system, user, max_tokens: 2800 });
  }

  async function expandWeekToDays(meta, outline, weekGoals, dayStart, dayEnd) {
    const system = `你是逐日课表作家。把周目标展开为可执行的每日任务。
${DEPTH_CONTRACT}
硬性规则：只输出一个 JSON 数组，不要对象外壳。`;
    const phaseHint = (outline?.phases || []).map((p) => p.name).join(' → ');
    const user = `## 学习者
${metaBrief(meta)}

## 周目标（上一步）
${JSON.stringify(weekGoals).slice(0, 3500)}

## 阶段线索
${phaseHint}

## Task
输出 JSON 数组，恰好 ${dayEnd - dayStart + 1} 项：
[
  {
    "day": ${dayStart},
    "phase": "所属阶段名",
    "week": "第n周：主题",
    "topic": "当日主题（≤18字，含领域对象）",
    "tasks": [
      "输入型任务：读/看什么（点名对象）",
      "加工型任务：对比/画图/列表等",
      "提取型任务：不看资料复述或场景判断"
    ],
    "why": "为何排在这一天（1句）"
  }
]
要求：tasks 正好 3 条且三类齐全；禁止三条都是「阅读/笔记/复述」万能句；topic 与 weekGoals.dailySeeds 对齐。`;
    const raw = await chatJson({ system, user, max_tokens: 4000 });
    const arr = Array.isArray(raw) ? raw : raw.days || raw.plan || [];
    return arr
      .map((d, i) => ({
        day: Number(d.day) || dayStart + i,
        phase: String(d.phase || outline?.phases?.[0]?.name || '学习阶段'),
        week: String(d.week || `第${Math.ceil((dayStart + i) / 7)}周`),
        topic: String(d.topic || weekGoals?.dailySeeds?.[i]?.seedTopic || `主题 ${dayStart + i}`),
        tasks: Array.isArray(d.tasks) && d.tasks.length
          ? d.tasks.map(String).slice(0, 5)
          : ['阅读核心资料并标注边界', '整理对比表或清单', '合上资料复述今日判断题'],
        why: d.why ? String(d.why) : undefined,
      }))
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
        label: 'PM 要会的判断',
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
        s.label === 'PM 要会的判断' ? { ...s, label: judgmentLabel } : s
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
岗位：${role}｜行业：${meta.industry}｜目标：${meta.goal || '校招'}

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
    const goal = meta.goal || '校招';
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
    const out = [];
    for (let d = 1; d <= totalDays; d++) {
      if (byDay.has(d)) {
        out.push(byDay.get(d));
        continue;
      }
      const week = outline?.weekThemes?.find((w) => d >= w.dayStart && d <= w.dayEnd);
      out.push({
        day: d,
        phase: outline?.phases?.[0]?.name || '学习阶段',
        week: week ? `第${week.week}周：${week.theme}` : `第${Math.ceil(d / 7)}周`,
        topic: week ? `${week.theme}（第 ${d} 天）` : `自主学习 Day ${d}`,
        tasks: ['完成本日主题阅读', '记录 3 个关键要点', '费曼复述今日收获'],
      });
    }
    return out;
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
    return false;
  }

  async function designDailyLesson(meta, dayPlan) {
    const { role } = roleLens(meta);
    const system = `你是「${meta.industry}」日课教学设计师（Microlearning：一课一目标 + Worked Example）。
${DEPTH_CONTRACT}
硬性规则：只输出一个 JSON 对象。禁止写「类比：先有生活例子」这类元指令，必须写出真实类比内容。`;
    const user = `## Audience
行业：${meta.industry}｜岗位：${role}｜目标：${meta.goal || '校招'}

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

${L.analogy || `把「${dayPlan.topic}」想成 ${meta.industry} 现场要先分清边界再动手的一套规则。`}

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
    try {
      const lesson = await designDailyLesson(meta, dayPlan);
      const searchHits = hasSearchKey()
        ? await searchMany([`${meta.industry} ${dayPlan.topic || ch.title}`], {
            count: 6,
            maxQueries: 1,
          })
        : [];
      let written = await writeDailyLessonMarkdown(meta, ch, dayPlan, lesson, searchHits);
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
            objective: `讲清并应用「${dayPlan.topic}」`,
            concepts: [{ name: dayPlan.topic, definition: String(dayPlan.topic), whyForRole: '', boundary: '' }],
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

  function fallbackDayResources(meta, dayPlan) {
    const topic = String(dayPlan.topic || meta.industry || '学习');
    const q = encodeURIComponent(`${meta.industry || ''} ${topic}`.trim());
    const t = encodeURIComponent(topic);
    return [
      {
        title: `维基百科搜索：${topic}`,
        url: `https://zh.wikipedia.org/wiki/Special:Search?search=${t}`,
        type: 'article',
      },
      {
        title: `B站搜索：${topic}`,
        url: `https://search.bilibili.com/all?keyword=${t}`,
        type: 'video',
      },
      {
        title: `网页搜索：${meta.industry} ${topic}`,
        url: `https://www.google.com/search?q=${q}`,
        type: 'article',
      },
    ];
  }

  function fallbackDayExercises(dayPlan) {
    if (typeof buildGeneratedExercises === 'function') {
      return buildGeneratedExercises(dayPlan);
    }
    const topic = dayPlan.topic || '今日主题';
    return [
      {
        q: `合上资料后，用一句话写出「${topic}」的工作定义`,
        rubric: ['能一句话说清（是什么）', '不含空泛形容词堆砌', '可贴合岗位语境'],
      },
      {
        q: `举 1 个真实场景：何时该用「${topic}」、何时不该用`,
        rubric: ['场景具体', '有产品取舍（why）', '不是纯技术名词罗列'],
      },
      {
        q: `关于「${topic}」，写下 1 个仍不确定、值得继续学的问题`,
        rubric: ['问题具体', '说明为什么重要', '可在一周内验证'],
      },
    ];
  }

  function normalizeDayMaterialRow(row, dayPlan, meta) {
    const day = Number(row?.day) || dayPlan.day;
    let resources = Array.isArray(row?.resources) ? row.resources : [];
    resources = resources
      .map((r) => ({
        title: String(r.title || '').trim().slice(0, 80),
        url: String(r.url || '').trim(),
        type: ALLOWED_RESOURCE_TYPES.has(String(r.type)) ? String(r.type) : 'article',
      }))
      .filter((r) => r.title && isSafeHttpUrl(r.url))
      .slice(0, 4);
    if (resources.length < 2) {
      resources = fallbackDayResources(meta, dayPlan);
    }

    let exercises = Array.isArray(row?.exercises) ? row.exercises : [];
    exercises = exercises
      .map((ex) => ({
        q: String(ex.q || ex.question || '').trim().slice(0, 120),
        rubric: (Array.isArray(ex.rubric) ? ex.rubric : [])
          .map(String)
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 4),
        ref: ex.ref ? String(ex.ref).trim().slice(0, 120) : '',
      }))
      .filter((ex) => ex.q)
      .slice(0, 4);
    exercises.forEach((ex) => {
      if (!ex.rubric.length) {
        ex.rubric = ['能讲清核心概念', '有具体例子或案例', '能对应到今日任务'];
      }
    });
    if (exercises.length < 2) {
      exercises = fallbackDayExercises(dayPlan);
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
[{"day":1,"intents":[{"learnWhat":"具体学什么","query":"中文搜索词","prefer":"wiki|official|video|paper|news","type":"article|video|report|tool"}]}]
要求：learnWhat 对应今日 topic 的领域对象；query 可直接用于搜索；禁止「入门教程」空意图。`;
    return chatJson({ system, user, max_tokens: 3200 });
  }

  /**
   * 按意图联网搜索，再让模型只从 search_results 里挑链接
   * @returns {{ rows: Array, searchByDay: Map<number, Array> }}
   */
  async function curateDayResourceLinks(meta, planSlice, intents, onProgress) {
    const searchByDay = new Map();
    const dayJobs = (planSlice || []).map((dayPlan) => {
      const day = dayPlan.day;
      const intentRow = (intents || []).find((x) => Number(x.day) === day);
      const intentQueries = (intentRow?.intents || [])
        .map((it) => String(it.query || '').trim())
        .filter(Boolean)
        .slice(0, 2);
      const queries = intentQueries.length
        ? intentQueries
        : [`${meta.industry} ${dayPlan.topic || ''}`.trim()];
      return { dayPlan, day, queries };
    });

    const dayHits = await mapPool(
      dayJobs,
      SEARCH_CONCURRENCY,
      async ({ dayPlan, day, queries }) => {
        const hits = await searchMany(queries, { count: SEARCH_COUNT, maxQueries: 2 });
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
      // 无搜索结果时退回模型策展（仍禁止瞎编直链）
      const system = `你是高信任资料策展人。硬性规则：只输出 JSON 数组。禁止编造不存在的 PDF/报告直链；没把握用搜索页 URL。`;
      const user = `## Audience
${meta.industry} / ${meta.role}
## 意图
${JSON.stringify(intents).slice(0, 3500)}
## Days
${JSON.stringify(planSlice.map((d) => ({ day: d.day, topic: d.topic })))}
## Task
[{"day":1,"resources":[{"title":"","url":"https://...","type":"article|video|report|tool"}]}]
每天 2-3 条。`;
      const curated = await chatJson({ system, user, temperature: 0.25, max_tokens: 4000 });
      const rows = Array.isArray(curated) ? curated : curated.days || curated.items || [];
      return { rows, searchByDay };
    }

    const system = `你是高信任资料策展人（FACTS_ONLY）。
硬性规则：只输出一个 JSON 数组。
每条 resources[].url 必须精确复制自对应 day 的 search_results，禁止编造或改写 URL。`;
    const user = `## Audience
${meta.industry} / ${meta.role}

## 意图（学什么）
${JSON.stringify(intents).slice(0, 2500)}

## 按日 search_results（唯一合法链接来源）
${JSON.stringify(allForPrompt).slice(0, 12000)}

## Task
[{"day":1,"resources":[{"title":"学什么：…","url":"必须来自该日 search_results","type":"article|video|report|tool"}]}]
要求：每天 2-3 条；title 说明学什么；优先官方/百科/高质量来源；覆盖每一天。`;
    const curated = await chatJson({ system, user, temperature: 0.2, max_tokens: 4000 });
    let rows = Array.isArray(curated) ? curated : curated.days || curated.items || [];

    // 服务端校验：URL 必须落在搜索结果中，不足则用搜索 hit 补齐
    rows = planSlice.map((d) => {
      const row = rows.find((r) => Number(r.day) === d.day) || { day: d.day, resources: [] };
      const hits = searchByDay.get(d.day) || [];
      return {
        day: d.day,
        resources: filterResourcesToSearch(row.resources || [], hits, 'article'),
      };
    });

    return { rows, searchByDay };
  }

  async function generateDayRetrievalExercises(meta, planSlice, resourcesRows) {
    const system = `你是提取练习出题人（Karpicke retrieval practice：闭卷回忆 > 重读）。
${DEPTH_CONTRACT}
硬性规则：只输出一个 JSON 数组。`;
    const user = `## Audience
行业：${meta.industry}｜岗位：${meta.role}｜目标：${meta.goal || '校招'}

## Days
${JSON.stringify(planSlice.map((d) => ({ day: d.day, topic: d.topic, tasks: d.tasks }))).slice(0, 3000)}

## 已有资料（出题可引用，勿重复问「去看链接」）
${JSON.stringify(resourcesRows).slice(0, 2500)}

## Task
[{"day":1,"exercises":[{"q":"","rubric":["",""],"ref":"可选提示"}]}]
要求：每天 3 题——①低难度理解 ②合上资料回忆工作定义/要点 ③场景取舍（贴岗位）；rubric 2-3 条可打分；禁止「请总结今日内容」而无提取难度。`;
    return chatJson({ system, user, temperature: 0.28, max_tokens: 4000 });
  }

  async function generateDayMaterialsChunk(meta, planSlice, onProgress) {
    try {
      const intentsRaw = await planDayResourceIntents(meta, planSlice);
      const intents = Array.isArray(intentsRaw)
        ? intentsRaw
        : intentsRaw?.days || intentsRaw?.items || intentsRaw?.intents || [];
      let resourceRows = [];
      try {
        const curated = await curateDayResourceLinks(meta, planSlice, intents, onProgress);
        resourceRows = curated.rows || [];
      } catch (e) {
        console.warn('[PackGenerator] resource curate failed', e);
      }
      let exerciseRows = [];
      try {
        const ex = await generateDayRetrievalExercises(meta, planSlice, resourceRows);
        exerciseRows = Array.isArray(ex) ? ex : ex.days || [];
      } catch (e) {
        console.warn('[PackGenerator] exercises failed', e);
      }
      const byDay = new Map();
      planSlice.forEach((d) => byDay.set(d.day, { day: d.day, resources: [], exercises: [] }));
      resourceRows.forEach((r) => {
        const day = Number(r.day);
        if (!byDay.has(day)) byDay.set(day, { day, resources: [], exercises: [] });
        byDay.get(day).resources = r.resources || [];
      });
      exerciseRows.forEach((r) => {
        const day = Number(r.day);
        if (!byDay.has(day)) byDay.set(day, { day, resources: [], exercises: [] });
        byDay.get(day).exercises = r.exercises || [];
      });
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
        const normalized = normalizeDayMaterialRow(byDay.get(dayPlan.day) || {}, dayPlan, meta);
        dayResources[String(normalized.day)] = { resources: normalized.resources };
        dayExercises[String(normalized.day)] = normalized.exercises;
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
    return pack;
  }

  /**
   * @param {object} meta { title, industry, role, goal, days, notes }
   * @param {(msg:string, pct:number)=>void} onProgress
   */
  async function generate(meta, onProgress = () => {}) {
    const days = Math.min(90, Math.max(7, Number(meta.days) || 30));
    const m = { ...meta, days };
    _searchCache.clear();

    const searchOn = hasSearchKey();
    onProgress(
      searchOn
        ? '① 联网摸底行业 → 分析学习成果…'
        : '① 分析学习成果（未配置搜索 Key，将主要依赖模型）…',
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
    const plan = fillMissingDays(planChunks.flat(), days, outline);

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

    pack.status = 'ready';
    pack.updatedAt = new Date().toISOString();
    onProgress('内容包已就绪（串行依赖 + 并行加速）', 100);
    ContentPack.save(pack);
    return pack;
  }

  /** 为已有内容包补全 / 重写知识库（P2） */
  async function generateHubForPack(packId, onProgress = () => {}) {
    const pack = ContentPack.load(packId);
    if (!pack) throw new Error('找不到内容包');
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

    pack.status = 'ready';
    pack.updatedAt = new Date().toISOString();
    ContentPack.save(pack);
    onProgress('知识库与术语库已就绪', 100);
    return pack;
  }

  /** P3：为已有内容包补全每日外链与练习 */
  async function generateDayMaterialsForPack(packId, onProgress = () => {}) {
    const pack = ContentPack.load(packId);
    if (!pack) throw new Error('找不到内容包');
    if (!pack.plan?.length) throw new Error('内容包没有课表，无法生成每日资料');
    _searchCache.clear();
    if (!hasSearchKey()) {
      onProgress('未配置搜索密钥，将尽量用模型策展（建议配置博查/Tavily）…', 3);
    }
    await attachDayMaterials(pack, onProgress, 5, 90);
    pack.status = 'ready';
    ContentPack.save(pack);
    onProgress('每日资料与练习已就绪', 100);
    return pack;
  }

  return { generate, generateHubForPack, generateDayMaterialsForPack, parseJsonLoose };
})();
