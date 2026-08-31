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
  function redactSensitive(value) {
    return String(value == null ? '' : value)
      .replace(/\b(?:sk|ds|api)[-_][A-Za-z0-9._-]{8,}\b/gi, '[REDACTED]')
      .replace(/(bearer\s+)[^\s;,]+/gi, '$1[REDACTED]')
      .replace(/((?:api[_-]?key|token|secret)\s*[:=]\s*["']?)[^\s,;"']+/gi, '$1[REDACTED]');
  }
  function failureType(error) {
    const code = String(error?.code || '').toUpperCase();
    if (['AUTH', 'NO_KEY'].includes(code)) return 'authentication';
    if (['BALANCE', 'BILLING'].includes(code)) return 'balance';
    if (code === 'NETWORK') return 'network';
    if (code.includes('TIMEOUT')) return 'timeout';
    if (code === 'SERVICE_BUSY') return 'busy';
    if (code.startsWith('QUALITY') || code.startsWith('REPAIR')) return 'quality';
    if (code === 'ABORTED') return 'cancelled';
    return 'unknown';
  }
  function isOperationalFailure(error) {
    const type = failureType(error);
    if (['authentication', 'balance', 'network', 'timeout', 'busy'].includes(type)) return true;
    return [
      'NO_PROXY',
      'UPSTREAM',
      'TOOL_BUDGET',
      'WALL_CLOCK',
      'WORKFLOW_BUDGET',
    ].includes(String(error?.code || '').toUpperCase());
  }
  function stableFingerprint(value) {
    const normalize = (input) => {
      if (Array.isArray(input)) return input.map(normalize);
      if (!input || typeof input !== 'object') return input;
      return Object.keys(input).sort().reduce((out, key) => {
        out[key] = normalize(input[key]);
        return out;
      }, {});
    };
    const text = JSON.stringify(normalize(value));
    let hash = 2166136261;
    for (let index = 0; index < text.length; index++) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }
  function gateFingerprint(gate = {}) {
    const rows = (gate.blockingFindings || [])
      .map((finding) => `${finding.code}:${finding.day || 0}:${finding.target || ''}`)
      .concat((gate.issues || []).map((issue) => String(issue)))
      .sort();
    return stableFingerprint({ rows });
  }
  function contentFingerprint(pack = {}) {
    return stableFingerprint({
      plan: pack.plan || [],
      dayResources: pack.dayResources || {},
      dayExercises: pack.dayExercises || {},
      chapters: pack.hub?.chapters || {},
      glossary: pack.glossary || [],
    });
  }
  function aiMetricsOf(pack) {
    const metrics = pack?.meta?.performance?.aiMetrics || {};
    return {
      calls: Number(metrics.calls) || 0,
      attempts: Number(metrics.attempts) || 0,
      retries: Number(metrics.retries) || 0,
      durationMs: Number(metrics.durationMs) || 0,
      queueMs: Number(metrics.queueMs) || 0,
    };
  }
  function metricDelta(current, baseline, key) {
    return Math.max(0, Number(current?.[key]) - Number(baseline?.[key]));
  }
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
            onDayReady: (pack, day) => this.dayReady(runtime, pack, day),
          }
        )
      );
    }
    async resume(project, hooks = {}) {
      this.assertCanStart();
      const targetPackId = project?.pendingPackId || project?.packId;
      if (!targetPackId) throw new Error('没有可继续补全的路径内容');
      const pack = this.contentPack.load(targetPackId);
      const runtime = await this.beginRuntime(
        {
          projectId: project.id,
          operation: 'resume',
          packId: targetPackId,
          previousPackId: project.pendingPackId ? project.packId : null,
          previousStatus: project.pendingPackId ? project.packStatus : null,
          readyThroughDay: Number(pack?.meta?.generation?.readyThroughDay) || 0,
        },
        hooks,
        { type: 'RESUME', operation: 'resume' }
      );
      hooks.onSkeletonReady?.(pack);
      return this.execute(runtime, (signal) =>
        this.generator.continueFillForPack(
          targetPackId,
          (message, percent) => this.progress(runtime, message, percent),
          { signal, onDayReady: (pack, day) => this.dayReady(runtime, pack, day) }
        )
      );
    }
    async repairHub(project, hooks = {}) {
      const targetPackId = project?.pendingPackId || project?.packId;
      const pack = this.contentPack.load(targetPackId);
      const gate = deps.gateApi.evaluate(pack, this.harness);
      const beforeGate = gateFingerprint(gate);
      const beforeContent = contentFingerprint(pack);
      const previousControl = pack?.meta?.quality?.repairControl;
      if (
        previousControl?.status === 'no_change' &&
        previousControl?.attemptType === 'manual_targeted' &&
        previousControl.gateFingerprint === beforeGate &&
        previousControl.contentFingerprint === beforeContent
      ) {
        const error = new Error('同一种修复未产生变化，请查看原因或选择重新生成问题部分/整个课包');
        error.code = 'REPAIR_NO_PROGRESS';
        throw error;
      }
      const targetProject = {
        ...project,
        packId: targetPackId,
        previousPackId: project.pendingPackId ? project.packId : null,
        previousStatus: project.pendingPackId ? project.packStatus : null,
      };
      return this.runPackOperation(targetProject, 'repair', 'REPAIR', hooks, async (signal, runtime) => {
        if (typeof this.generator.repairFinalGateForPack === 'function') {
          const repaired = await this.generator.repairFinalGateForPack(
            targetPackId,
            gate,
            (message, percent) => this.progress(runtime, message, percent),
            { signal }
          );
          const nextGate = deps.gateApi.evaluate(repaired, this.harness);
          const nextGateFingerprint = gateFingerprint(nextGate);
          const nextContentFingerprint = contentFingerprint(repaired);
          repaired.meta = repaired.meta || {};
          repaired.meta.quality = repaired.meta.quality || {};
          repaired.meta.quality.repairControl = {
            status:
              nextContentFingerprint === beforeContent && nextGateFingerprint === beforeGate
                ? 'no_change'
                : nextGate.passed
                  ? 'resolved'
                  : 'changed_needs_review',
            attemptType: 'manual_targeted',
            gateFingerprint: nextGateFingerprint,
            contentFingerprint: nextContentFingerprint,
            previousGateFingerprint: beforeGate,
            attemptedAt: now(),
          };
          this.contentPack.save(repaired);
          return repaired;
        }
        return this.generator.generateHubForPack(
          targetPackId,
          (message, percent) => this.progress(runtime, message, percent),
          { signal }
        );
      });
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
    async generateCourseGlossary(project, hooks = {}) {
      return this.runPackOperation(
        project,
        'courseGlossary',
        'GLOSSARY',
        hooks,
        (signal, runtime) =>
          this.generator.generateCourseGlossaryForPack(
            project.packId,
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
        {
          projectId: project.id,
          operation,
          packId: project.packId,
          previousPackId: project.previousPackId || null,
          previousStatus: project.previousStatus || null,
        },
        hooks,
        { type: eventType, operation }
      );
      return this.execute(runtime, async (signal) => {
        if (operation !== 'repair') return activity(signal, runtime);
        const repairStartedMs = Date.now();
        const repairMetricsStart = aiMetricsOf(this.contentPack.load(project.packId));
        try {
          return await activity(signal, runtime);
        } finally {
          runtime.telemetry.repairMs += Date.now() - repairStartedMs;
          const currentPack = this.contentPack.load(project.packId);
          runtime.telemetry.repairAiMs += metricDelta(
            aiMetricsOf(currentPack),
            repairMetricsStart,
            'durationMs'
          );
        }
      });
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
        this.projects.update(record.projectId, {
          recoveryStatus: packId ? 'paused_resumable' : 'interrupted_before_content',
          recoveryCheckedAt: now(),
          lastFailureType: 'interrupted',
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
      const startingPack = input.packId ? this.contentPack.load(input.packId) : null;
      runtime.telemetry = {
        operation: input.operation,
        userActionAt: now(),
        startedAt: now(),
        startedMs: Date.now(),
        repairMs: 0,
        repairAiMs: 0,
        aiMetricsBaseline: aiMetricsOf(startingPack),
      };
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
      this.contentPack.save(pack);
      runtime.actor.send({
        type: 'SKELETON_READY',
        packId: pack.id,
        hasSkeleton: true,
        readyThroughDay: Number(pack.meta?.generation?.readyThroughDay) || 0,
        at: now(),
      });
      this.syncProject(runtime, pack);
      this.emit(runtime);
      runtime.pendingCheckpoint = runtime.pendingCheckpoint.then(() =>
        this.sessions.checkpoint(runtime)
      );
      runtime.hooks.onSkeletonReady?.(pack);
    }
    dayReady(runtime, pack, readyThroughDay) {
      this.contentPack.save(pack);
      runtime.actor.send({
        type: 'DAY_READY',
        packId: pack.id,
        hasSkeleton: true,
        readyThroughDay,
        at: now(),
      });
      this.syncProject(runtime, pack);
      this.emit(runtime);
      runtime.pendingCheckpoint = runtime.pendingCheckpoint.then(() =>
        this.sessions.checkpoint(runtime)
      );
      runtime.hooks.onDayReady?.(pack, readyThroughDay);
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
    recordWorkflowRun(pack, runtime, patch = {}) {
      if (!pack) return;
      pack.meta = pack.meta || {};
      pack.meta.performance = pack.meta.performance || {};
      const metrics = aiMetricsOf(pack);
      const baseline = runtime.telemetry?.aiMetricsBaseline || aiMetricsOf(null);
      const durationMs = metricDelta(metrics, baseline, 'durationMs');
      const repairAiMs = Number(runtime.telemetry?.repairAiMs) || 0;
      const entry = {
        operation: runtime.telemetry?.operation || runtime.actor.getSnapshot().context.operation,
        userActionAt: runtime.telemetry?.userActionAt || now(),
        startedAt: runtime.telemetry?.startedAt || now(),
        finishedAt: now(),
        queueMs: metricDelta(metrics, baseline, 'queueMs'),
        generationMs: Math.max(0, durationMs - repairAiMs),
        repairMs: Number(runtime.telemetry?.repairMs) || 0,
        retryCount: metricDelta(metrics, baseline, 'retries'),
        failureType: null,
        recoveryAttempted: runtime.telemetry?.operation === 'resume',
        recoverySucceeded: runtime.telemetry?.operation === 'resume' ? !!patch.success : null,
        ...patch,
      };
      const runs = Array.isArray(pack.meta.performance.workflowRuns)
        ? pack.meta.performance.workflowRuns
        : [];
      pack.meta.performance.workflowRuns = [...runs, entry].slice(-30);
    }
    async execute(runtime, activity) {
      try {
        let pack = await activity(runtime.abortController.signal);
        if (runtime.abortController.signal.aborted) throw abortError();
        await runtime.pendingCheckpoint;
        let gate = deps.gateApi.apply(pack, this.harness);
        this.contentPack.save(pack);
        const operation = runtime.actor.getSnapshot().context.operation;
        const initialGateFingerprint = gateFingerprint(gate);
        const initialContentFingerprint = contentFingerprint(pack);
        const previousRepair = pack.meta?.quality?.repairControl;
        const canAutoRepair =
          ['full', 'resume'].includes(operation) &&
          !gate.passed &&
          !(
            previousRepair?.attemptType === 'automatic' &&
            previousRepair?.gateFingerprint === initialGateFingerprint &&
            previousRepair?.contentFingerprint === initialContentFingerprint
          ) &&
          typeof this.generator.repairFinalGateForPack === 'function';
        if (canAutoRepair) {
          const repairStartedMs = Date.now();
          const repairMetricsStart = aiMetricsOf(pack);
          try {
            this.progress(runtime, '最终质量检查未通过，正在自动重新生成问题部分…', 97);
            pack = await this.generator.repairFinalGateForPack(
              pack.id,
              gate,
              (message, percent) => this.progress(runtime, message, percent),
              { signal: runtime.abortController.signal }
            );
            if (runtime.abortController.signal.aborted) throw abortError();
            gate = deps.gateApi.apply(pack, this.harness);
            const repairedGateFingerprint = gateFingerprint(gate);
            const repairedContentFingerprint = contentFingerprint(pack);
            pack.meta.quality.repairControl = {
              status:
                repairedContentFingerprint === initialContentFingerprint &&
                repairedGateFingerprint === initialGateFingerprint
                  ? 'no_change'
                  : gate.passed
                    ? 'resolved'
                    : 'changed_needs_review',
              attemptType: 'automatic',
              gateFingerprint: repairedGateFingerprint,
              contentFingerprint: repairedContentFingerprint,
              previousGateFingerprint: initialGateFingerprint,
              attemptedAt: now(),
            };
          } catch (repairError) {
            if (
              repairError?.name === 'AbortError' ||
              repairError?.code === 'ABORTED' ||
              runtime.abortController.signal.aborted
            ) {
              throw repairError;
            }
            if (isOperationalFailure(repairError)) throw repairError;
            console.warn('[PackWorkflow] automatic final repair failed', repairError);
            pack = this.contentPack.load(pack.id) || pack;
            gate = deps.gateApi.apply(pack, this.harness);
            pack.meta = pack.meta || {};
            pack.meta.quality = pack.meta.quality || {};
            pack.meta.quality.autoRepair = {
              status: 'failed',
              error: redactSensitive(repairError?.message || String(repairError)),
              failureType: failureType(repairError),
              finishedAt: now(),
            };
            this.progress(runtime, '自动修复未完成，课包将标记为需要修复', 99);
          } finally {
            runtime.telemetry.repairMs += Date.now() - repairStartedMs;
            runtime.telemetry.repairAiMs += metricDelta(
              aiMetricsOf(pack),
              repairMetricsStart,
              'durationMs'
            );
          }
          this.contentPack.save(pack);
        }
        await this.transition(runtime, {
          type: 'COMPLETE',
          packId: pack.id,
          hasSkeleton: true,
            readyThroughDay: Number(pack.meta?.generation?.readyThroughDay) || 0,
          needsReview: !gate.passed,
        });
        const previous = runtime.actor.getSnapshot().context.previousPackId;
        this.recordWorkflowRun(pack, runtime, { success: true });
        this.contentPack.save(pack);
        if (gate.passed && previous && previous !== pack.id) this.contentPack.remove(previous);
        runtime.hooks.onComplete?.(pack, gate);
        return pack;
      } catch (error) {
        await runtime.pendingCheckpoint.catch(() => {});
        const cancelled = error?.name === 'AbortError' || error?.code === 'ABORTED' || runtime.abortController.signal.aborted;
        const context = runtime.actor.getSnapshot().context;
        const failedPack = context.packId ? this.contentPack.load(context.packId) : null;
        if (failedPack) {
          const classifiedFailure = failureType(error);
          this.recordWorkflowRun(failedPack, runtime, {
            success: false,
            failureType: classifiedFailure,
            errorCode: String(error?.code || 'UNKNOWN'),
          });
          failedPack.meta = failedPack.meta || {};
          failedPack.meta.generation = {
            ...(failedPack.meta.generation || {}),
            lastFailure: {
              type: classifiedFailure,
              code: String(error?.code || 'UNKNOWN'),
              message: redactSensitive(error?.message || String(error)),
              at: now(),
              resumable: ['authentication', 'balance', 'network', 'timeout', 'busy'].includes(classifiedFailure),
            },
          };
          this.contentPack.save(failedPack);
        }
        if (error?.code === 'WORKFLOW_CHECKPOINT' && ['ready', 'needsReview'].includes(String(runtime.actor.getSnapshot().value))) {
          this.projects.update(runtime.projectId, { packStatus: 'needs_review' });
          runtime.hooks.onError?.(error, { cancelled: false });
          throw error;
        }
        try {
          await this.transition(runtime, {
            type: cancelled ? 'CANCELLED' : 'FAIL',
            error: redactSensitive(error?.message || String(error)),
            packId: context.packId,
            hasSkeleton: context.hasSkeleton, operation: context.operation,
          });
        } catch (checkpointError) {
          console.error('[PackWorkflow] failure checkpoint failed', checkpointError);
          const partialStatus = [
            'repair',
            'materials',
            'courseGlossary',
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
      const hasPrevious = context.previousPackId && context.previousPackId !== context.packId;
      const candidateReady = snapshot.value === 'ready';
      if (hasPrevious && !candidateReady) {
        patch.packId = context.previousPackId;
        patch.packStatus = context.previousStatus || 'ready';
        if (context.packId) {
          patch.pendingPackId = context.packId;
          patch.pendingPackStatus = ['failed', 'cancelled'].includes(snapshot.value)
            ? 'partial'
            : deps.machineApi.projectStatus(snapshot);
        }
      } else {
        if (context.packId) patch.packId = context.packId;
        if (candidateReady) {
          patch.pendingPackId = null;
          patch.pendingPackStatus = null;
        }
      }
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
