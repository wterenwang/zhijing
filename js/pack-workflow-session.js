/**
 * Workflow 运行会话：Actor 创建、恢复和持久化检查点。
 */
(function initPackWorkflowSession(root, factory) {
  const api = factory(
    typeof module !== 'undefined' && module.exports ? require('xstate') : root.XState
  );
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PackWorkflowSession = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildSessionApi(XStateApi) {
  if (!XStateApi?.createActor) throw new Error('XState 未加载');

  function now() {
    return new Date().toISOString();
  }

  function uid() {
    return `wf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  class SessionManager {
    constructor({ store, machine }) {
      this.store = store;
      this.machine = machine;
    }

    async create(input, hooks = {}) {
      const jobId = uid();
      const actor = XStateApi.createActor(this.machine, {
        input: { ...input, jobId, createdAt: now() },
      }).start();
      const runtime = this.runtime(jobId, input.projectId, actor, hooks);
      await this.checkpoint(runtime);
      return runtime;
    }

    restore(record) {
      const actor = XStateApi.createActor(this.machine, {
        snapshot: record.snapshot,
      }).start();
      return this.runtime(record.jobId, record.projectId, actor, {});
    }

    runtime(jobId, projectId, actor, hooks) {
      return {
        jobId,
        projectId,
        actor,
        hooks,
        abortController: new AbortController(),
        pendingCheckpoint: Promise.resolve(),
        lastHeartbeat: 0,
      };
    }

    async checkpoint(runtime) {
      const snapshot = runtime.actor.getSnapshot();
      const timestamp = now();
      const record = {
        schemaVersion: 1,
        jobId: runtime.jobId,
        projectId: runtime.projectId,
        operation: snapshot.context.operation,
        state: String(snapshot.value),
        context: structuredClone(snapshot.context),
        snapshot: structuredClone(runtime.actor.getPersistedSnapshot()),
        heartbeatAt: timestamp,
        createdAt: snapshot.context.createdAt,
        updatedAt: timestamp,
      };
      await this.store.save(record);
      return record;
    }

    async transition(runtime, event) {
      runtime.actor.send(event);
      try {
        return await this.checkpoint(runtime);
      } catch (error) {
        error.code = error.code || 'WORKFLOW_CHECKPOINT';
        throw error;
      }
    }
  }

  return { SessionManager };
});
