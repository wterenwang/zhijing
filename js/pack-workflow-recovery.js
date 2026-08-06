/**
 * 启动恢复与历史状态迁移。
 * 负责修正没有活跃执行器的 generating，以及用最终门禁同步旧课包状态。
 */
(function initPackWorkflowRecovery(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PackWorkflowRecovery = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildRecoveryApi() {
  function isBuiltin(contentPack, project) {
    return !!contentPack.isBuiltinPackId?.(project?.packId);
  }

  function reconcile({ projects, contentPack, harness, gate }) {
    let changed = 0;
    for (const project of projects.list()) {
      if (!project || project.isDefault || isBuiltin(contentPack, project)) continue;
      const pack = project.packId ? contentPack.load(project.packId) : null;

      if (!pack) {
        if (project.packStatus === 'generating') {
          projects.update(project.id, { packStatus: 'failed' });
          changed += 1;
        }
        continue;
      }

      const phase = pack.meta?.generation?.phase;
      const unfinished = pack.status === 'partial' || (phase && phase !== 'done');
      if (unfinished) {
        if (project.packStatus !== 'partial') {
          projects.update(project.id, { packStatus: 'partial' });
          changed += 1;
        }
        continue;
      }

      const result = gate.apply(pack, harness);
      contentPack.save(pack);
      const nextStatus = result.passed ? 'ready' : 'needs_review';
      if (project.packStatus !== nextStatus) {
        projects.update(project.id, { packStatus: nextStatus });
        changed += 1;
      }
    }
    return changed;
  }

  return { reconcile };
});
