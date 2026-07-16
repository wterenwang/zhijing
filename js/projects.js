/**
 * 多项目壳层：项目列表 / 创建 / 删除 / 按项目隔离 localStorage
 * C 端默认只内置：产品经理 30 天入门（pm-30-intro）
 * 具身智能课包代码仍保留，但不自动进路径列表（避免安装包露出个人专项）
 */
const ProjectPlatform = (() => {
  const REGISTRY_KEY = 'learning-platform-projects';
  const ACTIVE_KEY = 'learning-platform-active-id';
  const LEGACY_DATA_KEY = 'embodied-pm-sprint-data';
  const LEGACY_VISITED = 'embodied-pm-sprint-data-visited';
  const DEFAULT_ID = 'pm-30-intro';
  const DEFAULT_PACK = 'pm-30-intro';
  const EMBODY_ID = 'embodied-ai-pm';
  const EMBODY_PACK = 'embodied-ai-pm';
  /** registry version：3 = 仅默认入门，不自动塞具身路径 */
  const REGISTRY_VERSION = 3;

  function nowISO() {
    return new Date().toISOString();
  }

  function uid(prefix = 'proj') {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }

  function defaultProjectMeta(overrides = {}) {
    return {
      id: DEFAULT_ID,
      title: '产品经理 30 天入门',
      shortName: 'PM 入门',
      industry: '互联网 / 软件产品',
      role: '产品经理',
      days: 30,
      packId: DEFAULT_PACK,
      isDefault: true,
      packStatus: 'builtin',
      goal: '入门',
      notes: '平台默认课包：从岗位认知到 PRD 与表达',
      createdAt: '2026-07-15T00:00:00.000Z',
      updatedAt: nowISO(),
      ...overrides,
    };
  }

  function embodyProjectMeta(overrides = {}) {
    return {
      id: EMBODY_ID,
      title: '具身智能产品经理校招冲刺',
      shortName: '具身智能 PM',
      industry: '具身智能 / 机器人',
      role: '产品经理（校招）',
      days: 90,
      packId: EMBODY_PACK,
      isDefault: false,
      packStatus: 'builtin',
      goal: '校招',
      notes: '个人专项课包（非平台默认）',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: nowISO(),
      ...overrides,
    };
  }

  function dataKey(projectId) {
    return `learning-project-data:${projectId}`;
  }

  function visitedKey(projectId) {
    return `${dataKey(projectId)}-visited`;
  }

  function readRegistry() {
    try {
      const raw = localStorage.getItem(REGISTRY_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.projects)) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  function writeRegistry(reg) {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(reg));
  }

  function migrateLegacyData() {
    const target = dataKey(EMBODY_ID);
    if (localStorage.getItem(target)) return;
    const legacy = localStorage.getItem(LEGACY_DATA_KEY);
    if (!legacy) return;
    localStorage.setItem(target, legacy);
    if (localStorage.getItem(LEGACY_VISITED) && !localStorage.getItem(visitedKey(EMBODY_ID))) {
      localStorage.setItem(visitedKey(EMBODY_ID), '1');
    }
  }

  function migrateRegistryToPm30Default(reg) {
    // 从列表移除具身内置路径（C 端只保留推荐入门；进度数据仍留在 localStorage，不删）
    reg.projects = (reg.projects || []).filter((p) => p.id !== EMBODY_ID);

    let pm = reg.projects.find((p) => p.id === DEFAULT_ID);
    if (!pm) {
      reg.projects.unshift(defaultProjectMeta());
      pm = reg.projects[0];
    } else {
      Object.assign(pm, {
        isDefault: true,
        packStatus: 'builtin',
        packId: DEFAULT_PACK,
        days: 30,
        title: pm.title || '产品经理 30 天入门',
        shortName: pm.shortName || 'PM 入门',
      });
      reg.projects = [pm, ...reg.projects.filter((p) => p.id !== DEFAULT_ID)];
    }

    reg.projects.forEach((p) => {
      if (p.id !== DEFAULT_ID) p.isDefault = false;
    });

    if (getActiveId() === EMBODY_ID) clearActive();

    reg.version = Math.max(REGISTRY_VERSION, Number(reg.version) || 1);
    return reg;
  }

  function ensureRegistry() {
    migrateLegacyData();
    let reg = readRegistry();
    if (!reg) {
      reg = {
        version: REGISTRY_VERSION,
        projects: [defaultProjectMeta()],
      };
      writeRegistry(reg);
      return reg;
    }

    const needsMigrate =
      !reg.projects.some((p) => p.id === DEFAULT_ID) ||
      reg.projects.some((p) => p.id === EMBODY_ID) ||
      Number(reg.version || 1) < REGISTRY_VERSION;

    if (needsMigrate) {
      reg = migrateRegistryToPm30Default(reg);
      writeRegistry(reg);
    } else if (!reg.projects.some((p) => p.id === DEFAULT_ID)) {
      reg.projects.unshift(defaultProjectMeta());
      writeRegistry(reg);
    }
    return reg;
  }

  function list() {
    return ensureRegistry().projects.slice();
  }

  function get(id) {
    return list().find((p) => p.id === id) || null;
  }

  function getActiveId() {
    return sessionStorage.getItem(ACTIVE_KEY) || null;
  }

  function setActive(id) {
    if (id) sessionStorage.setItem(ACTIVE_KEY, id);
    else sessionStorage.removeItem(ACTIVE_KEY);
  }

  function clearActive() {
    sessionStorage.removeItem(ACTIVE_KEY);
  }

  function create({ title, industry, role, days, goal, notes, packId, packStatus, useAi } = {}) {
    const t = (title || '').trim();
    if (!t) throw new Error('请填写项目名称');
    const reg = ensureRegistry();
    const project = {
      id: uid(),
      title: t,
      shortName: t.length > 12 ? `${t.slice(0, 10)}…` : t,
      industry: (industry || '').trim() || '未指定行业',
      role: (role || '').trim() || '未指定岗位',
      goal: (goal || '校招').trim(),
      notes: (notes || '').trim(),
      days: Math.max(7, Math.min(90, Number(days) || 90)),
      packId: packId || null,
      packStatus: packStatus || (useAi ? 'generating' : 'ready'),
      isDefault: false,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    reg.projects.push(project);
    writeRegistry(reg);
    return project;
  }

  function update(id, patch) {
    const reg = ensureRegistry();
    const p = reg.projects.find((x) => x.id === id);
    if (!p) return null;
    Object.assign(p, patch, { updatedAt: nowISO() });
    writeRegistry(reg);
    return p;
  }

  function remove(id) {
    const reg = ensureRegistry();
    const idx = reg.projects.findIndex((p) => p.id === id);
    if (idx < 0) return false;
    const proj = reg.projects[idx];
    reg.projects.splice(idx, 1);
    writeRegistry(reg);
    localStorage.removeItem(dataKey(id));
    localStorage.removeItem(visitedKey(id));
    const isBuiltin =
      typeof ContentPack !== 'undefined' && ContentPack.isBuiltinPackId?.(proj.packId);
    if (proj.packId && !isBuiltin && typeof ContentPack !== 'undefined') {
      ContentPack.remove(proj.packId);
    }
    if (getActiveId() === id) clearActive();
    if (reg.projects.length === 0) {
      const def = defaultProjectMeta({ createdAt: nowISO() });
      writeRegistry({ version: REGISTRY_VERSION, projects: [def] });
      return { removed: proj, reseeding: true };
    }
    return { removed: proj, reseeding: false };
  }

  function touch(id) {
    const reg = ensureRegistry();
    const p = reg.projects.find((x) => x.id === id);
    if (!p) return;
    p.updatedAt = nowISO();
    writeRegistry(reg);
  }

  function progressStats(projectId) {
    try {
      const raw = localStorage.getItem(dataKey(projectId));
      const proj = get(projectId);
      const total = (proj && proj.days) || 30;
      if (!raw) return { checked: 0, total };
      const data = JSON.parse(raw);
      const checked = Object.keys(data.checkins || {}).filter((k) => data.checkins[k]).length;
      return { checked, total };
    } catch {
      return { checked: 0, total: 30 };
    }
  }

  return {
    DEFAULT_ID,
    DEFAULT_PACK,
    EMBODY_ID,
    EMBODY_PACK,
    LEGACY_DATA_KEY,
    dataKey,
    visitedKey,
    ensureRegistry,
    list,
    get,
    getActiveId,
    setActive,
    clearActive,
    create,
    update,
    remove,
    touch,
    progressStats,
    defaultProjectMeta,
    embodyProjectMeta,
  };
})();
