/**
 * 领域内容包：多内置课包 + localStorage 自定义包
 * 默认内置：pm-30-intro；具身智能 embodied-ai-pm 仅保留代码能力，不自动进入路径列表
 */
const ContentPack = (() => {
  const PACK_PREFIX = 'learning-content-pack:';
  const BUILTIN_DEFAULT = 'pm-30-intro';
  const BUILTIN_EMBODY = 'embodied-ai-pm';
  /** @deprecated 兼容旧引用：BUILTIN_ID 现在指向默认课包 */
  const BUILTIN_ID = BUILTIN_DEFAULT;

  function isBuiltinPackId(id) {
    return id === BUILTIN_DEFAULT || id === BUILTIN_EMBODY;
  }

  function packKey(id) {
    return `${PACK_PREFIX}${id}`;
  }

  function load(id) {
    if (!id || isBuiltinPackId(id)) return null;
    try {
      const raw = localStorage.getItem(packKey(id));
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function save(pack) {
    if (!pack?.id || isBuiltinPackId(pack.id)) return;
    localStorage.setItem(packKey(pack.id), JSON.stringify(pack));
  }

  function remove(id) {
    if (!id || isBuiltinPackId(id)) return;
    localStorage.removeItem(packKey(id));
  }

  function uid() {
    return `pack-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }

  function emptyPack(meta = {}) {
    return {
      version: 1,
      id: meta.id || uid(),
      meta: {
        title: meta.title || '',
        industry: meta.industry || '',
        role: meta.role || '',
        goal: meta.goal || '校招',
        days: Number(meta.days) || 90,
        notes: meta.notes || '',
      },
      plan: [],
      glossary: [],
      interview: [],
      skills: [],
      portfolio: [],
      hot: { keywords: [], systemHint: '' },
      hub: null,
      dayResources: {},
      dayExercises: {},
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  let activeCustom = null;
  /** @type {string|null} 当前内置课包 id；null 表示自定义或未激活 */
  let activeBuiltinId = BUILTIN_DEFAULT;

  function resolveBuiltinId(project) {
    if (!project) return BUILTIN_DEFAULT;
    if (isBuiltinPackId(project.packId)) return project.packId;
    if (isBuiltinPackId(project.id)) return project.id;
    if (project.isDefault === true) return BUILTIN_DEFAULT;
    return null;
  }

  function activate(project) {
    if (!project) {
      activeCustom = null;
      activeBuiltinId = BUILTIN_DEFAULT;
      return { mode: 'builtin', pack: null, builtinId: activeBuiltinId };
    }

    const builtinId = resolveBuiltinId(project);
    if (builtinId) {
      activeCustom = null;
      activeBuiltinId = builtinId;
      return { mode: 'builtin', pack: null, builtinId };
    }

    activeBuiltinId = null;
    if (!project.packId) {
      activeCustom = null;
      return { mode: 'missing', pack: null };
    }
    activeCustom = load(project.packId);
    return { mode: activeCustom ? 'custom' : 'missing', pack: activeCustom };
  }

  function clear() {
    activeCustom = null;
    activeBuiltinId = BUILTIN_DEFAULT;
  }

  function getActive() {
    return activeCustom;
  }

  function isBuiltin() {
    return !!activeBuiltinId;
  }

  function getBuiltinId() {
    return activeBuiltinId;
  }

  function getPlan() {
    if (activeBuiltinId === BUILTIN_EMBODY) {
      return typeof LEARNING_PLAN !== 'undefined' ? LEARNING_PLAN : [];
    }
    if (activeBuiltinId === BUILTIN_DEFAULT) {
      return typeof Pm30Pack !== 'undefined' ? Pm30Pack.getPlan() : [];
    }
    return activeCustom?.plan?.length ? activeCustom.plan : [];
  }

  function getTotalDays() {
    if (activeBuiltinId === BUILTIN_EMBODY) {
      return typeof LEARNING_PLAN !== 'undefined' ? LEARNING_PLAN.length : 90;
    }
    if (activeBuiltinId === BUILTIN_DEFAULT) {
      return typeof Pm30Pack !== 'undefined' ? Pm30Pack.getPlan().length : 30;
    }
    if (activeCustom?.meta?.days) return activeCustom.meta.days;
    if (activeCustom?.plan?.length) return activeCustom.plan.length;
    return 30;
  }

  function getDay(dayNum) {
    const plan = getPlan();
    return plan[dayNum - 1] || null;
  }

  function getInterview() {
    if (activeBuiltinId === BUILTIN_EMBODY) {
      return typeof INTERVIEW_QUESTIONS !== 'undefined' ? INTERVIEW_QUESTIONS : [];
    }
    if (activeBuiltinId === BUILTIN_DEFAULT) {
      return typeof Pm30Pack !== 'undefined' ? Pm30Pack.getInterview() : [];
    }
    return activeCustom?.interview?.length ? activeCustom.interview : [];
  }

  function getGlossaryCards() {
    if (activeBuiltinId === BUILTIN_EMBODY) {
      return typeof GLOSSARY_CARDS !== 'undefined' ? GLOSSARY_CARDS : [];
    }
    if (activeBuiltinId === BUILTIN_DEFAULT) {
      return typeof Pm30Pack !== 'undefined' ? Pm30Pack.getGlossary() : [];
    }
    if (!activeCustom?.glossary?.length) return [];
    return activeCustom.glossary.map((g) => ({
      term: g.term || g.front || '',
      def: g.definition || g.def || g.back || '',
      module: g.module || '',
      aliases: Array.isArray(g.aliases) ? g.aliases : [],
      sections: Array.isArray(g.sections) ? g.sections : [],
    }));
  }

  function getSkills() {
    if (activeBuiltinId === BUILTIN_EMBODY) {
      return typeof SKILL_DIMENSIONS !== 'undefined' ? SKILL_DIMENSIONS : [];
    }
    if (activeBuiltinId === BUILTIN_DEFAULT) {
      return typeof Pm30Pack !== 'undefined' ? Pm30Pack.getSkills() : [];
    }
    return activeCustom?.skills?.length ? activeCustom.skills : [];
  }

  function getPortfolio() {
    if (activeBuiltinId === BUILTIN_EMBODY) {
      return typeof PORTFOLIO_PROJECTS !== 'undefined' ? PORTFOLIO_PROJECTS : [];
    }
    if (activeBuiltinId === BUILTIN_DEFAULT) {
      return typeof Pm30Pack !== 'undefined' ? Pm30Pack.getPortfolio() : [];
    }
    if (!activeCustom?.portfolio?.length) return [];
    return activeCustom.portfolio.map((p) => ({
      id: p.id,
      name: p.title || p.name || p.id,
      days: p.days || '',
      milestones: (p.milestones || (p.items || []).map((label, i) => ({
        id: `${p.id}-m${i + 1}`,
        label: typeof label === 'string' ? label : (label.label || ''),
        desc: typeof label === 'object' ? (label.desc || '') : '',
      }))).filter((m) => m.label),
    }));
  }

  function getHotConfig() {
    if (activeBuiltinId === BUILTIN_DEFAULT && typeof Pm30Pack !== 'undefined') {
      return Pm30Pack.getHotConfig();
    }
    if (activeCustom?.hot) {
      return {
        keywords: activeCustom.hot.keywords || [],
        systemHint: activeCustom.hot.systemHint || '',
        industry: activeCustom.meta?.industry || '',
        role: activeCustom.meta?.role || '',
      };
    }
    return null;
  }

  function getExercises(day, planDay) {
    if (activeBuiltinId === BUILTIN_EMBODY && typeof getDailyExercises === 'function') {
      return getDailyExercises(day, planDay);
    }
    if (activeBuiltinId === BUILTIN_DEFAULT) {
      if (typeof buildGeneratedExercises === 'function' && planDay) {
        return buildGeneratedExercises(planDay);
      }
      return [];
    }
    const key = String(day);
    const curated = activeCustom?.dayExercises?.[key] || activeCustom?.dayExercises?.[day];
    if (Array.isArray(curated) && curated.length) {
      return curated.map((ex) => ({
        q: String(ex.q || ex.question || '').trim(),
        rubric: Array.isArray(ex.rubric) ? ex.rubric.map(String).filter(Boolean) : [],
        ref: ex.ref ? String(ex.ref) : '',
      })).filter((ex) => ex.q);
    }
    if (typeof buildGeneratedExercises === 'function' && planDay) {
      return buildGeneratedExercises(planDay);
    }
    return [];
  }

  function getDayResources(day) {
    const n = Number(day);
    if (activeBuiltinId === BUILTIN_EMBODY) {
      const data = typeof DAY_RESOURCES !== 'undefined' ? DAY_RESOURCES[n] : null;
      return {
        resources: data?.resources || [],
        hub: data?.hub || [],
      };
    }
    if (activeBuiltinId === BUILTIN_DEFAULT) {
      return typeof Pm30Pack !== 'undefined'
        ? Pm30Pack.getDayResources(n)
        : { resources: [], hub: [] };
    }
    const key = String(n);
    const raw = activeCustom?.dayResources?.[key] || activeCustom?.dayResources?.[n] || {};
    const resources = Array.isArray(raw.resources)
      ? raw.resources
          .map((r) => ({
            title: String(r.title || '').trim(),
            url: String(r.url || '').trim(),
            type: String(r.type || 'article'),
          }))
          .filter((r) => r.title && r.url)
      : [];
    const hubChapters = getHubChaptersForDay(n);
    return {
      resources,
      hub: hubChapters.map((c) => c.slug),
      hubItems: hubChapters,
    };
  }

  function hasDayMaterials(pack) {
    const p = pack || activeCustom;
    if (!p) return false;
    const dr = p.dayResources && Object.keys(p.dayResources).length;
    const de = p.dayExercises && Object.keys(p.dayExercises).length;
    return !!(dr && de);
  }

  function getHub() {
    if (activeCustom?.hub?.navigation?.length) return activeCustom.hub;
    return null;
  }

  function hasHub() {
    // 具身内置知识库走 hub/ 静态站，不算 ContentPack.hub
    if (activeBuiltinId === BUILTIN_EMBODY) return true;
    return !!getHub();
  }

  function getHubChaptersForDay(day) {
    const hub = getHub();
    if (!hub?.navigation) return [];
    const n = Number(day);
    const result = [];
    hub.navigation.forEach((mod) => {
      (mod.items || []).forEach((item) => {
        if (!item?.days || !item.slug) return;
        const parts = String(item.days).includes('-')
          ? String(item.days).split('-').map(Number)
          : [Number(item.days), Number(item.days)];
        const start = parts[0];
        const end = parts[1] ?? parts[0];
        if (!Number.isFinite(start) || !Number.isFinite(end)) return;
        if (n >= start && n <= end) {
          result.push({
            slug: item.slug,
            title: item.title || item.slug,
            moduleTitle: mod.title || '',
          });
        }
      });
    });
    return result;
  }

  return {
    BUILTIN_ID,
    BUILTIN_DEFAULT,
    BUILTIN_EMBODY,
    isBuiltinPackId,
    packKey,
    load,
    save,
    remove,
    uid,
    emptyPack,
    activate,
    clear,
    getActive,
    isBuiltin,
    getBuiltinId,
    getPlan,
    getTotalDays,
    getDay,
    getInterview,
    getGlossaryCards,
    getSkills,
    getPortfolio,
    getHotConfig,
    getExercises,
    getDayResources,
    hasDayMaterials,
    getHub,
    hasHub,
    getHubChaptersForDay,
  };
})();
