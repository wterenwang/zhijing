/**
 * 产业/岗位日课：联网搜索 → LLM 策展 → 章节跳转
 * 数据写入 appData.hotFeed / appData.hotArchive；搜索 Key 单独存 localStorage
 */
const HotFeed = (() => {
  const SEARCH_KEY_STORAGE = 'embodied-pm-search-key';
  const SEARCH_PROVIDER_STORAGE = 'embodied-pm-search-provider';
  const WINDOW_DAYS = 7;
  const MIN_RESULTS = 5;
  const SEARCH_COUNT = 18;

  const QUERY_POOL = [
    '产品经理 产品设计 用户体验 近一周 新闻',
    '互联网产品 需求分析 增长 本周',
    'A/B测试 产品指标 上线复盘 新闻',
    '产品方法论 PRD 优先级 讨论',
    '科技互联网 产品动态 近一周',
  ];

  /** 默认（具身隐藏路径）关键词 → 章节；PM30 使用 Pm30Hub.getChapterLinks() */
  const CHAPTER_LINKS_EMBODY = [
    { keywords: ['具身智能', 'embodied'], label: '具身智能定义', hub: '/doc/module-1/01-definition', glossary: '具身智能' },
    { keywords: ['产业链', '供应链', '零部件'], label: '产业链图谱', hub: '/doc/module-1/03-industry-chain' },
    { keywords: ['宇树', 'unitree', 'g1', 'h1', 'go2'], label: '宇树深度研究', hub: '/doc/module-1/06-unitree', glossary: '宇树' },
    { keywords: ['优必选', 'walker', 'ubtech'], label: '头部产品矩阵', hub: '/doc/module-1/04-company-matrix', glossary: '优必选' },
    { keywords: ['智元', 'agibot', '远征'], label: '头部产品矩阵', hub: '/doc/module-1/04-company-matrix', glossary: '智元' },
    { keywords: ['optimus', '特斯拉', 'tesla'], label: '头部产品矩阵', hub: '/doc/module-1/04-company-matrix', glossary: 'Optimus' },
    { keywords: ['竞品', '差异化'], label: '竞品差异化', hub: '/doc/module-1/05-competitive' },
    { keywords: ['vla', 'vision-language-action', 'rt-2', 'rt2', 'openvla'], label: 'VLA 模型入门', hub: '/doc/module-2/04-vla-intro', glossary: 'VLA' },
    { keywords: ['强化学习', 'rl', 'ppo', 'sac'], label: '强化学习入门', hub: '/doc/module-2/05-rl-intro', glossary: '强化学习' },
    { keywords: ['模仿学习', '遥操作', 'teleop', 'il'], label: '模仿学习入门', hub: '/doc/module-2/06-imitation-learning', glossary: '模仿学习' },
    { keywords: ['数据闭环', '数据飞轮', '采集'], label: '数据闭环', hub: '/doc/module-2/07-data-loop', glossary: '数据闭环' },
    { keywords: ['传感器', '激光雷达', 'lidar', '深度相机', 'imu'], label: '传感器与感知', hub: '/doc/module-2/03-sensors', glossary: '多模态感知' },
    { keywords: ['硬件', '关节', '电机', '自由度', 'bom'], label: '核心硬件认知', hub: '/doc/module-2/02-hardware', glossary: 'BOM' },
    { keywords: ['大脑', '小脑', '运动控制'], label: '大脑与小脑协同', hub: '/doc/module-2/01-brain-cerebellum', glossary: '大脑与小脑' },
    { keywords: ['世界模型', 'world model'], label: '世界模型', hub: '/doc/module-4/04-world-model', glossary: '世界模型' },
    { keywords: ['diffusion policy', '扩散策略'], label: 'Diffusion Policy', hub: '/doc/module-4/05-diffusion-policy', glossary: 'Diffusion Policy' },
    { keywords: ['家庭', '家务', '扫地', '厨房', '归位'], label: '家庭场景聚焦', hub: '/doc/module-6/01-scenario' },
    { keywords: ['sdk', '开发者', 'ros'], label: '机器人 SDK 竞品', hub: '/doc/module-5/02-sdk-competitive', glossary: 'SDK' },
    { keywords: ['prd', '需求'], label: 'PRD 撰写要点', hub: '/doc/module-5/03-prd-writing', glossary: 'PRD' },
    { keywords: ['面试', '校招', '作品集'], label: '模拟面试准备', hub: '/doc/module-7/02-interview' },
    { keywords: ['安全', 'iso', '合规'], label: '家庭场景聚焦（安全约束）', hub: '/doc/module-6/01-scenario' },
    { keywords: ['sim-to-real', '仿真'], label: '世界模型 / Sim-to-Real', hub: '/doc/module-4/04-world-model', glossary: 'Sim-to-Real' },
  ];

  const HOT_SYSTEM = `你是产品经理学习日课的策展编辑，面向「产品经理入门 / 岗位学习」读者，输出中文。

任务：从 search_results 中挑选 3～5 条不同事件的近期动态，每条写简短 PM 视角解读。时间范围：近 ${WINDOW_DAYS} 天。

硬性规则：
1. FACTS_ONLY：事实必须能在 search_results 的 title/snippet 中找到依据。
2. SOURCES：每条 sources[].url 必须精确匹配 search_results 中某条 url，禁止编造链接。
3. UNIQUE：每条热点使用不同的主来源 url。
4. EXCLUDE：尽量避开 exclude_urls 中已展示过的 url。
5. BODY：每条 80～200 字，含背景 + 对 PM 意味着什么（方法、职业成长或产品决策视角）。
6. tags：给 2～4 个短标签（如 需求、指标、增长、体验）。
7. OUTPUT：仅输出 JSON 对象 {"items":[...]}，不要用 markdown 代码块包裹。

输出 schema：
{"items":[{"title":string,"body":string,"sources":[{"title":string,"url":string}],"follow":string,"tags":[string],"level":"入门"|"在职"}]}`;

  function getChapterLinks() {
    const builtinId =
      typeof ContentPack !== 'undefined' ? ContentPack.getBuiltinId?.() : null;
    if (builtinId === 'pm-30-intro' && typeof Pm30Hub !== 'undefined') {
      return Pm30Hub.getChapterLinks();
    }
    if (builtinId === 'embodied-ai-pm') return CHAPTER_LINKS_EMBODY;
    if (typeof Pm30Hub !== 'undefined') return Pm30Hub.getChapterLinks();
    return CHAPTER_LINKS_EMBODY;
  }

  let deps = {
    getAppData: () => ({}),
    saveData: () => {},
    switchView: () => {},
    renderMarkdown: (s) => s,
    openSettings: () => {},
    getDeepseekKey: () => '',
    checkProxy: async () => ({ ok: false }),
  };

  function getSearchKey() {
    return (localStorage.getItem(SEARCH_KEY_STORAGE) || '').trim();
  }

  function setSearchKey(key) {
    const k = (key || '').trim();
    if (k) localStorage.setItem(SEARCH_KEY_STORAGE, k);
    else localStorage.removeItem(SEARCH_KEY_STORAGE);
  }

  function getSearchProvider() {
    return localStorage.getItem(SEARCH_PROVIDER_STORAGE) || 'bocha';
  }

  function setSearchProvider(id) {
    localStorage.setItem(SEARCH_PROVIDER_STORAGE, id === 'tavily' ? 'tavily' : 'bocha');
  }

  function todayKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function matchLinks(item) {
    const blob = `${item.title || ''} ${item.body || ''} ${(item.tags || []).join(' ')}`.toLowerCase();
    const hits = [];
    const seen = new Set();
    for (const row of getChapterLinks()) {
      const hit = row.keywords.some((k) => blob.includes(k.toLowerCase()));
      if (!hit) continue;
      const key = row.hub + '|' + (row.glossary || '');
      if (seen.has(key)) continue;
      seen.add(key);
      hits.push(row);
      if (hits.length >= 4) break;
    }
    return hits;
  }

  function parseLlmJson(text) {
    let raw = (text || '').trim();
    const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence) raw = fence[1].trim();
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start >= 0 && end > start) raw = raw.slice(start, end + 1);
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.items)) throw new Error('模型未返回 items 数组');
    return data.items;
  }

  function validateItems(items, searchResults) {
    const urlSet = new Set(searchResults.map((r) => r.url));
    const used = new Set();
    const out = [];
    for (const item of items) {
      if (!item || !item.title || !item.body) continue;
      const sources = (item.sources || []).filter((s) => s && s.url && urlSet.has(s.url));
      if (sources.length === 0) continue;
      const primary = sources[0].url;
      if (used.has(primary)) continue;
      used.add(primary);
      out.push({
        title: String(item.title).slice(0, 120),
        body: String(item.body).slice(0, 600),
        sources: sources.slice(0, 3).map((s) => ({
          title: String(s.title || s.url).slice(0, 120),
          url: s.url,
        })),
        follow: item.follow ? String(item.follow).slice(0, 200) : '',
        tags: Array.isArray(item.tags) ? item.tags.map((t) => String(t).slice(0, 24)).slice(0, 6) : [],
        level: item.level === '在职' ? '在职' : '入门',
      });
      if (out.length >= 5) break;
    }
    if (out.length < 1) throw new Error('策展结果无法通过来源校验（链接须来自搜索结果）');
    return out;
  }

  async function runSearch(query) {
    const apiKey = getSearchKey();
    if (!apiKey) {
      const err = new Error('请先配置搜索 API Key（博查或 Tavily）');
      err.code = 'NO_SEARCH_KEY';
      throw err;
    }
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: getSearchProvider(),
        apiKey,
        query,
        count: SEARCH_COUNT,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error?.message || `搜索失败 (HTTP ${res.status})`);
    }
    const results = Array.isArray(data.results) ? data.results : [];
    if (results.length < MIN_RESULTS) {
      throw new Error(`联网搜索结果不足：${results.length} 条，至少需要 ${MIN_RESULTS} 条。请检查搜索 Key 或稍后重试。`);
    }
    return results;
  }

  async function runLlm(searchResults, excludeUrls, refreshIndex) {
    const apiKey = deps.getDeepseekKey();
    if (!apiKey) {
      const err = new Error('请先开启智能功能');
      err.code = 'NO_KEY';
      throw err;
    }
    const proxy = await deps.checkProxy();
    if (!proxy.ok) {
      const desktop =
        typeof document !== 'undefined' && document.documentElement?.dataset?.zhijingDesktop === '1';
      const err = new Error(
        desktop ? '智能服务未就绪。请重启「知径」后再试。' : '智能服务未就绪。请重新运行「启动本地服务」'
      );
      err.code = 'NO_PROXY';
      throw err;
    }

    const user = [
      `date: ${todayKey()}`,
      `window_days: ${WINDOW_DAYS}`,
      `refresh_index: ${refreshIndex}`,
      `exclude_urls:\n${excludeUrls.length ? excludeUrls.join('\n') : '（无）'}`,
      `search_results:\n${JSON.stringify(searchResults, null, 2)}`,
      '请输出 3～5 条不同事件的 items JSON。',
    ].join('\n\n');

    const res = await fetch('/api/deepseek/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey,
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: (() => {
              const cfg = typeof ContentPack !== 'undefined' ? ContentPack.getHotConfig() : null;
              return cfg?.systemHint ? `${HOT_SYSTEM}\n\n补充：${cfg.systemHint}` : HOT_SYSTEM;
            })(),
          },
          { role: 'user', content: user },
        ],
        temperature: 0.4,
        max_tokens: 2800,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error?.message || `LLM 请求失败 (${res.status})`);
    }
    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('AI 未返回有效内容');
    const items = parseLlmJson(text);
    return validateItems(items, searchResults);
  }

  function ensureAppShape(app) {
    if (!app.hotFeed || typeof app.hotFeed !== 'object') app.hotFeed = null;
    if (!app.hotArchive || typeof app.hotArchive !== 'object') app.hotArchive = {};
  }

  async function generate({ refresh = false } = {}) {
    const app = deps.getAppData();
    ensureAppShape(app);
    const refreshIndex = refresh ? ((app.hotFeed?.refreshIndex || 0) + 1) : 0;
    const hotCfg = typeof ContentPack !== 'undefined' ? ContentPack.getHotConfig() : null;
    const queryPool = (hotCfg?.keywords?.length)
      ? hotCfg.keywords.map((k) => `${k} 近一周 新闻`)
      : QUERY_POOL;
    const query = queryPool[refreshIndex % queryPool.length];
    const excludeUrls = refresh && app.hotFeed?.items
      ? app.hotFeed.items.flatMap((it) => (it.sources || []).map((s) => s.url)).filter(Boolean)
      : [];

    setStatus('正在联网搜索产品相关资讯…', 'loading');
    const results = await runSearch(query);

    setStatus('搜索完成，正在撰写 PM 视角解读…', 'loading');
    const items = await runLlm(results, excludeUrls, refreshIndex);

    const session = {
      fetchedAt: new Date().toISOString(),
      date: todayKey(),
      windowDays: WINDOW_DAYS,
      searchQuery: query,
      refreshIndex,
      items,
      meta: {
        searchProvider: getSearchProvider(),
        resultCount: results.length,
      },
    };
    app.hotFeed = session;
    app.hotArchive[session.date] = session;
    deps.saveData();
    setStatus(`已生成 ${items.length} 条热点（来源经搜索校验）`, 'ok');
    render();
    return session;
  }

  function setStatus(msg, kind) {
    const el = document.getElementById('hot-status');
    if (!el) return;
    el.textContent = msg || '';
    el.dataset.kind = kind || '';
  }

  function renderItem(item, index) {
    const links = matchLinks(item);
    const tags = (item.tags || [])
      .map((t) => `<span class="hot-tag">${escapeHtml(t)}</span>`)
      .join('');
    const sources = (item.sources || [])
      .map(
        (s) =>
          `<a class="hot-source" href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.title || s.url)}</a>`,
      )
      .join('');
    const chapterHtml = links.length
      ? `<div class="hot-chapters"><span class="hot-chapters-label">关联学习</span>${links
          .map((l) => {
            const parts = [];
            if (l.hub) {
              parts.push(
                `<button type="button" class="hot-chapter-btn" data-hub-hash="${escapeHtml(l.hub)}">${escapeHtml(l.label)}</button>`,
              );
            }
            if (l.glossary) {
              parts.push(
                `<button type="button" class="hot-chapter-btn glossary" data-glossary="${escapeHtml(l.glossary)}">术语：${escapeHtml(l.glossary)}</button>`,
              );
            }
            return parts.join('');
          })
          .join('')}</div>`
      : `<div class="hot-chapters muted">暂无精确章节匹配，可去「知识体系」自行检索</div>`;

    return `<article class="hot-card glass">
      <div class="hot-card-head">
        <span class="hot-index">#${index + 1}</span>
        <span class="hot-level">${escapeHtml(item.level || '入门')}</span>
      </div>
      <h3 class="hot-title">${escapeHtml(item.title)}</h3>
      <div class="hot-body">${deps.renderMarkdown(item.body)}</div>
      ${item.follow ? `<p class="hot-follow"><strong>可跟进：</strong>${escapeHtml(item.follow)}</p>` : ''}
      <div class="hot-tags">${tags}</div>
      <div class="hot-sources"><span>来源</span>${sources}</div>
      ${chapterHtml}
    </article>`;
  }

  function render() {
    const app = deps.getAppData();
    ensureAppShape(app);
    const list = document.getElementById('hot-list');
    const meta = document.getElementById('hot-meta');
    if (!list) return;

    const session = app.hotFeed;
    if (!session || !session.items?.length) {
      list.innerHTML = `<div class="hot-empty glass">
        <p>还没有今日资讯。开启智能功能后可一键生成。</p>
        <p class="hot-empty-desc">将先联网搜索近 ${WINDOW_DAYS} 天产品相关资讯，再由 AI 撰写 PM 视角解读。无搜索结果时不会编造热点。</p>
      </div>`;
      if (meta) meta.textContent = '';
      return;
    }

    if (meta) {
      const t = session.fetchedAt ? new Date(session.fetchedAt).toLocaleString('zh-CN') : '';
      meta.textContent = `生成于 ${t} · 查询：${session.searchQuery || ''} · ${session.items.length} 条`;
    }
    list.innerHTML = session.items.map((it, i) => renderItem(it, i)).join('');
  }

  function renderArchiveHint() {
    const app = deps.getAppData();
    ensureAppShape(app);
    const el = document.getElementById('hot-archive-hint');
    if (!el) return;
    const dates = Object.keys(app.hotArchive || {}).sort().reverse();
    if (!dates.length) {
      el.textContent = '归档：暂无历史日课（生成后按日保存在本机备份中）';
      return;
    }
    el.innerHTML =
      '归档日期：' +
      dates
        .slice(0, 8)
        .map(
          (d) =>
            `<button type="button" class="hot-archive-btn" data-archive-date="${escapeHtml(d)}">${escapeHtml(d)}</button>`,
        )
        .join(' ');
  }

  function loadArchiveDate(date) {
    const app = deps.getAppData();
    ensureAppShape(app);
    const session = app.hotArchive?.[date];
    if (!session) return;
    app.hotFeed = session;
    deps.saveData();
    setStatus(`已加载归档：${date}`, 'ok');
    render();
    renderArchiveHint();
  }

  function bindUi() {
    document.getElementById('btn-hot-generate')?.addEventListener('click', async () => {
      const btn = document.getElementById('btn-hot-generate');
      const btnRefresh = document.getElementById('btn-hot-refresh');
      try {
        if (btn) btn.disabled = true;
        if (btnRefresh) btnRefresh.disabled = true;
        await generate({ refresh: false });
        renderArchiveHint();
      } catch (e) {
        setStatus(e.message || String(e), 'error');
        if (e.code === 'NO_KEY' || e.code === 'NO_SEARCH_KEY') deps.openSettings();
      } finally {
        if (btn) btn.disabled = false;
        if (btnRefresh) btnRefresh.disabled = false;
      }
    });

    document.getElementById('btn-hot-refresh')?.addEventListener('click', async () => {
      const btn = document.getElementById('btn-hot-generate');
      const btnRefresh = document.getElementById('btn-hot-refresh');
      try {
        if (btn) btn.disabled = true;
        if (btnRefresh) btnRefresh.disabled = true;
        await generate({ refresh: true });
        renderArchiveHint();
      } catch (e) {
        setStatus(e.message || String(e), 'error');
        if (e.code === 'NO_KEY' || e.code === 'NO_SEARCH_KEY') deps.openSettings();
      } finally {
        if (btn) btn.disabled = false;
        if (btnRefresh) btnRefresh.disabled = false;
      }
    });

    document.getElementById('hot-list')?.addEventListener('click', (e) => {
      const hubBtn = e.target.closest('[data-hub-hash]');
      if (hubBtn) {
        deps.switchView('hub', hubBtn.dataset.hubHash);
        return;
      }
      const gBtn = e.target.closest('[data-glossary]');
      if (gBtn) {
        // 术语表页；具体词条由用户在页内搜索（hash 到 glossary）
        deps.switchView('glossary', '/glossary');
      }
    });

    document.getElementById('hot-archive-hint')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-archive-date]');
      if (btn) loadArchiveDate(btn.dataset.archiveDate);
    });
  }

  function init(options) {
    deps = { ...deps, ...options };
    bindUi();
    render();
    renderArchiveHint();
    return {
      render,
      renderArchiveHint,
      generate,
      matchLinks,
      getSearchKey,
      setSearchKey,
      getSearchProvider,
      setSearchProvider,
      SEARCH_KEY_STORAGE,
    };
  }

  return {
    init,
    matchLinks,
    getSearchKey,
    setSearchKey,
    getSearchProvider,
    setSearchProvider,
    /** 供 PackGenerator 等复用；不强制最少条数 */
    runSearch,
    hasSearchKey: () => !!getSearchKey(),
  };
})();
