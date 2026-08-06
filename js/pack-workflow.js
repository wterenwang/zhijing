/** 课包生成控制层：统一状态、检查点、取消、恢复和最终验收。 */
(function initPackWorkflow(root, factory) {
  const dependencies =
    typeof module !== 'undefined' && module.exports
      ? {
          XState: require('xstate'),
          machineApi: require('./pack-workflow-machine'),
          storeApi: require('./pack-workflow-store'),
          gateApi: require('./pack-workflow-gate'),
          sessionApi: require('./pack-workflow-session'),
        }
      : {
          XState: root.XState,
          machineApi: root.PackWorkflowMachine,
          storeApi: root.PackWorkflowStore,
          gateApi: root.PackWorkflowGate,
          sessionApi: root.PackWorkflowSession,
        };
  const api = factory(dependencies);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PackWorkflowRuntime = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildWorkflowApi(deps) {
  if (!deps.XState || !deps.machineApi || !deps.storeApi || !deps.gateApi || !deps.sessionApi) {
    throw new Error('生成功能未正确加载，请重启应用后再试');
  }
  function now() { return new Date().toISOString(); }
  function abortError() {
    return Object.assign(new Error('已停止生成'), { name: 'AbortError', code: 'ABORTED' });
  }
  class WorkflowController {
    constructor(options) {
      this.store = options.store;
      this.generator = options.generator;
      this.projects = options.projects;
      this.contentPack = options.contentPack;
      this.harness = options.harness;
      this.sessions = new deps.sessionApi.SessionManager({
        store: this.store,
        machine: deps.machineApi.machine,
      });
      this.runtimes = new Map();
      this.listeners = new Set();
      this.launching = false;
    }
    subscribe(listener) {
      this.listeners.add(listener);
      return () => this.listeners.delete(listener);
    }
    isBusy() {
      return (
        this.launching ||
        [...this.runtimes.values()].some((runtime) =>
          deps.machineApi.isActive(runtime.actor.getSnapshot())
        )
      );
    }
    activeProjectId() {
      return (
        [...this.runtimes.values()].find((runtime) =>
          deps.machineApi.isActive(runtime.actor.getSnapshot())
        )?.projectId || null
      );
    }
    async start(project, hooks = {}) {
      this.assertCanStart();
      const runtime = await this.beginRuntime(
        { projectId: project.id, operation: 'full', previousPackId: project.packId || null, previousStatus: project.packStatus || null },
        hooks,
        { type: 'START', operation: 'full' }
      );
      return this.execute(runtime, async (signal) =>
        this.generator.generate(
          {
            title: project.title,
            industry: project.industry,
            role: project.role,
            goal: project.goal || '入门',
            days: project.days || 30,
            notes: project.notes || '',
          },
          (message, percent) => this.progress(runtime, message, percent),
          {
            signal,
            skeletonDays: 3,
            onSkeletonReady: (pack) => this.skeletonReady(runtime, pack),
          }
        )
      );
    }
    async resume(project, hooks = {}) {
      this.assertCanStart();
      if (!project?.packId) throw new Error('没有可继续补全的路径内容');
      const pack = this.contentPack.load(project.packId);
      const runtime = await this.beginRuntime(
        {
          projectId: project.id,
          operation: 'resume',
          packId: project.packId,
          readyThroughDay: pack?.meta?.generation?.readyThroughDay || 3,
        },
        hooks,
        { type: 'RESUME', operation: 'resume' }
      );
      hooks.onSkeletonReady?.(pack);
      return this.execute(runtime, (signal) =>
        this.generator.continueFillForPack(
          project.packId,
          (message, percent) => this.progress(runtime, message, percent),
          { signal }
        )
      );
    }
    async repairHub(project, hooks = {}) {
      return this.runPackOperation(project, 'repair', 'REPAIR', hooks, (signal, runtime) =>
        this.generator.generateHubForPack(
          project.packId,
          (message, percent) => this.progress(runtime, message, percent),
          { signal }
        )
      );
    }
    async generateMaterials(project, hooks = {}) {
      return this.runPackOperation(
        project,
        'materials',
        'MATERIALS',
        hooks,
        (signal, runtime) =>
          this.generator.generateDayMaterialsForPack(
            project.packId,
            (message, percent) => this.progress(runtime, message, percent),
            { signal }
          )
      );
    }
    async generateDayGlossary(project, day, hooks = {}) {
      return this.runPackOperation(
        project,
        'dayGlossary',
        'GLOSSARY',
        hooks,
        (signal, runtime) =>
          this.generator.generateGlossaryForDayPack(
            project.packId,
            day,
            (message, percent) => this.progress(runtime, message, percent),
            { signal }
          )
      );
    }
    async generateCustomGlossary(project, term, hooks = {}) {
      return this.runPackOperation(
        project,
        'customGlossary',
        'GLOSSARY',
        hooks,
        (signal, runtime) =>
          this.generator.generateCustomGlossaryForPack(
            project.packId,
            term,
            (message, percent) => this.progress(runtime, message, percent),
            { signal }
          )
      );
    }
    async runPackOperation(project, operation, eventType, hooks, activity) {
      this.assertCanStart();
      if (!project?.packId) throw new Error('找不到需要处理的路径内容');
      const runtime = await this.beginRuntime(
        { projectId: project.id, operation, packId: project.packId },
        hooks,
        { type: eventType, operation }
      );
      return this.execute(runtime, (signal) => activity(signal, runtime));
    }
    async cancel(projectId) {
      const runtime = this.runtimes.get(projectId);
      if (!runtime || !deps.machineApi.isActive(runtime.actor.getSnapshot())) return false;
      const checkpoint = this.transition(runtime, { type: 'CANCEL' });
      runtime.abortController.abort();
      await checkpoint;
      return true;
    }
    async recover() {
      const records = await this.store.list();
      const latestByProject = new Map();
      for (const record of records) {
        const current = latestByProject.get(record.projectId);
        if (!current || String(record.updatedAt).localeCompare(String(current.updatedAt)) > 0) {
          latestByProject.set(record.projectId, record);
        }
      }
      const active = [...latestByProject.values()].filter((record) =>
        deps.machineApi.ACTIVE_STATES.has(String(record.state || ''))
      );
      for (const record of active) {
        const packId = record.context?.hasSkeleton ? record.context?.packId || null : null;
        const runtime = await this.restoreRuntime(record);
        await this.transition(runtime, {
          type: 'FAIL',
          error: '应用重启，任务已安全暂停',
          packId,
          hasSkeleton: !!packId,
        });
        this.runtimes.delete(record.projectId);
      }
      return active.length;
    }
    assertCanStart() {
      if (this.isBusy()) throw new Error('已有生成任务正在运行');
    }
    async createRuntime(input, hooks) {
      this.launching = true;
      try {
        const runtime = await this.sessions.create(input, hooks);
        this.runtimes.set(input.projectId, runtime);
        return runtime;
      } finally {
        this.launching = false;
      }
    }
    async beginRuntime(input, hooks, event) {
      const runtime = await this.createRuntime(input, hooks);
      try {
        await this.transition(runtime, event);
        return runtime;
      } catch (error) {
        this.runtimes.delete(input.projectId);
        this.projects.update(input.projectId, {
          packStatus: input.previousPackId ? input.previousStatus || 'ready' : input.packId ? 'partial' : 'failed',
        });
        throw error;
      }
    }
    async restoreRuntime(record) {
      const runtime = this.sessions.restore(record);
      this.runtimes.set(record.projectId, runtime);
      return runtime;
    }
    async transition(runtime, event) {
      await this.sessions.transition(runtime, { ...event, at: now() });
      this.syncProject(runtime);
      this.emit(runtime);
      return runtime.actor.getSnapshot();
    }
    skeletonReady(runtime, pack) {
      runtime.actor.send({
        type: 'SKELETON_READY',
        packId: pack.id,
        hasSkeleton: true,
        readyThroughDay: pack.meta?.generation?.readyThroughDay || 3,
        at: now(),
      });
      this.syncProject(runtime, pack);
      this.emit(runtime);
      runtime.pendingCheckpoint = runtime.pendingCheckpoint.then(() =>
        this.sessions.checkpoint(runtime)
      );
      runtime.hooks.onSkeletonReady?.(pack);
    }
    progress(runtime, message, percent) {
      runtime.hooks.onProgress?.(message, percent);
      const time = Date.now();
      if (time - runtime.lastHeartbeat < 1500) return;
      runtime.lastHeartbeat = time;
      runtime.pendingCheckpoint = runtime.pendingCheckpoint.then(() =>
        this.sessions.checkpoint(runtime)
      );
    }
    async execute(runtime, activity) {
      try {
        const pack = await activity(runtime.abortController.signal);
        if (runtime.abortController.signal.aborted) throw abortError();
        await runtime.pendingCheckpoint;
        const gate = deps.gateApi.apply(pack, this.harness);
        this.contentPack.save(pack);
        await this.transition(runtime, {
          type: 'COMPLETE',
          packId: pack.id,
          hasSkeleton: true,
          readyThroughDay: pack.meta?.days || pack.plan?.length || 0,
          needsReview: !gate.passed,
        });
        const previous = runtime.actor.getSnapshot().context.previousPackId;
        if (previous && previous !== pack.id) this.contentPack.remove(previous);
        runtime.hooks.onComplete?.(pack, gate);
        return pack;
      } catch (error) {
        await runtime.pendingCheckpoint.catch(() => {});
        const cancelled = error?.name === 'AbortError' || error?.code === 'ABORTED' || runtime.abortController.signal.aborted;
        const context = runtime.actor.getSnapshot().context;
        if (error?.code === 'WORKFLOW_CHECKPOINT' && ['ready', 'needsReview'].includes(String(runtime.actor.getSnapshot().value))) {
          this.projects.update(runtime.projectId, { packStatus: 'needs_review' });
          runtime.hooks.onError?.(error, { cancelled: false });
          throw error;
        }
        try {
          await this.transition(runtime, {
            type: cancelled ? 'CANCELLED' : 'FAIL',
            error: error?.message || String(error),
            packId: context.packId,
            hasSkeleton: context.hasSkeleton, operation: context.operation,
          });
        } catch (checkpointError) {
          console.error('[PackWorkflow] failure checkpoint failed', checkpointError);
          const partialStatus = [
            'repair',
            'materials',
            'dayGlossary',
            'customGlossary',
          ].includes(context.operation)
            ? 'needs_review'
            : 'partial';
          const packStatus = context.hasSkeleton ? partialStatus : cancelled ? 'cancelled' : 'failed';
          this.projects.update(runtime.projectId, { packStatus });
        }
        runtime.hooks.onError?.(error, { cancelled });
        throw error;
      } finally {
        this.runtimes.delete(runtime.projectId);
      }
    }
    syncProject(runtime, suppliedPack) {
      const snapshot = runtime.actor.getSnapshot();
      const context = snapshot.context;
      const pack = suppliedPack || (context.packId ? this.contentPack.load(context.packId) : null);
      const patch = { packStatus: deps.machineApi.projectStatus(snapshot) };
      if (['failed', 'cancelled'].includes(snapshot.value) && context.previousPackId) {
        patch.packStatus = context.previousStatus || 'ready';
      }
      if (context.packId) patch.packId = context.packId;
      if (pack?.meta?.title) patch.title = pack.meta.title;
      if (pack?.meta?.days) patch.days = pack.meta.days;
      this.projects.update(runtime.projectId, patch);
    }
    emit(runtime) {
      const snapshot = runtime.actor.getSnapshot();
      runtime.hooks.onState?.(snapshot);
      this.listeners.forEach((listener) => listener(snapshot));
    }
  }
  function createPackWorkflow(options) { return new WorkflowController(options); }
  return { WorkflowController, createPackWorkflow };
});
