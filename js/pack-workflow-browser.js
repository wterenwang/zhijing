/**
 * 浏览器端 Workflow 单例适配。
 */
(function initPackWorkflowBrowser(root) {
  let controller = null;
  let configured = null;
  let recoveryPromise = Promise.resolve();

  function requireController() {
    if (!controller) throw new Error('生成 Workflow 尚未初始化');
    return controller;
  }

  root.PackWorkflow = {
    configure(options = {}) {
      configured = {
        store: options.store || new root.PackWorkflowStore.IndexedDbStore(),
        generator: options.generator || root.PackGenerator,
        projects: options.projects || root.ProjectPlatform,
        contentPack: options.contentPack || root.ContentPack,
        harness: options.harness || root.PackHarness,
      };
      const missing = ['generator', 'projects', 'contentPack', 'harness'].filter(
        (name) => !configured[name]
      );
      if (missing.length) {
        throw new Error(`生成 Workflow 初始化缺少依赖：${missing.join(', ')}`);
      }
      controller = root.PackWorkflowRuntime.createPackWorkflow(configured);
      return this;
    },
    subscribe(listener) {
      return requireController().subscribe(listener);
    },
    isBusy() {
      return controller?.isBusy() || false;
    },
    activeProjectId() {
      return controller?.activeProjectId() || null;
    },
    async start(...args) {
      await recoveryPromise;
      return requireController().start(...args);
    },
    async resume(...args) {
      await recoveryPromise;
      return requireController().resume(...args);
    },
    async repairHub(...args) {
      await recoveryPromise;
      return requireController().repairHub(...args);
    },
    async generateMaterials(...args) {
      await recoveryPromise;
      return requireController().generateMaterials(...args);
    },
    async generateCourseGlossary(...args) {
      await recoveryPromise;
      return requireController().generateCourseGlossary(...args);
    },
    async generateDayGlossary(...args) {
      await recoveryPromise;
      return requireController().generateDayGlossary(...args);
    },
    async generateCustomGlossary(...args) {
      await recoveryPromise;
      return requireController().generateCustomGlossary(...args);
    },
    cancel(...args) {
      return requireController().cancel(...args);
    },
    recover(...args) {
      const recovery = (async () => {
        const recovered = await requireController().recover(...args);
        const reconciled = root.PackWorkflowRecovery.reconcile({
          projects: configured.projects,
          contentPack: configured.contentPack,
          harness: configured.harness,
          gate: root.PackWorkflowGate,
        });
        return { recovered, reconciled };
      })();
      recoveryPromise = recovery.catch(() => undefined);
      return recovery;
    },
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
