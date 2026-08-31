/** 可序列化的每日任务完成状态；不依赖 DOM，便于迁移与回归测试。 */
(function initDailyLearningState(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DailyLearningState = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildDailyLearningState() {
  function clean(value) {
    return String(value == null ? '' : value).trim();
  }

  function hash(value) {
    let result = 2166136261;
    for (const char of clean(value)) {
      result ^= char.charCodeAt(0);
      result = Math.imul(result, 16777619);
    }
    return (result >>> 0).toString(36);
  }

  function scopeKey(projectId, date, day) {
    return `${clean(projectId) || 'unknown'}::${clean(date) || 'unknown'}::day-${Number(day) || 0}`;
  }

  function taskItemId(task, index = 0, source = 'plan') {
    return `${clean(source) || 'plan'}:${Number(index) || 0}:${hash(task)}`;
  }

  function scope(state, key, create = false) {
    if (!state || typeof state !== 'object') return {};
    if (!state[key] && create) state[key] = {};
    return state[key] && typeof state[key] === 'object' ? state[key] : {};
  }

  function setTaskDone(state, key, item, done) {
    const bucket = scope(state, key, true);
    const itemKey = String(item);
    const next = !!done;
    if (bucket[itemKey] === next) return false;
    bucket[itemKey] = next;
    return true;
  }

  function isTaskDone(state, key, item) {
    return scope(state, key)[String(item)] === true;
  }

  function taskProgress(state, key, totalOrIds) {
    const ids = Array.isArray(totalOrIds)
      ? totalOrIds.map(String)
      : Array.from({ length: Math.max(0, Number(totalOrIds) || 0) }, (_, index) => String(index));
    const done = ids.filter((id) => isTaskDone(state, key, id)).length;
    return { done, total: ids.length, complete: ids.length === 0 || done === ids.length };
  }

  return { scopeKey, taskItemId, setTaskDone, isTaskDone, taskProgress };
});
