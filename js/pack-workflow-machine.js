/**
 * 课包生成 Workflow 状态机。
 * 只描述合法状态转换；AI、搜索和保存等副作用由 pack-workflow.js 执行。
 */
(function initPackWorkflowMachine(root, factory) {
  const api = factory(
    typeof module !== 'undefined' && module.exports ? require('xstate') : root.XState
  );
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PackWorkflowMachine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildApi(XStateApi) {
  if (!XStateApi?.setup || !XStateApi?.assign) {
    throw new Error('XState 未加载，无法初始化生成 Workflow');
  }

  const { setup, assign } = XStateApi;
  const ACTIVE_STATES = new Set([
    'starting',
    'generatingSkeleton',
    'filling',
    'repairing',
    'generatingMaterials',
    'generatingGlossary',
    'cancelling',
  ]);

  const applyEvent = assign(({ context, event }) => ({
    ...context,
    packId: event.packId || context.packId || null,
    hasSkeleton: event.hasSkeleton ?? context.hasSkeleton,
    readyThroughDay: Number(event.readyThroughDay ?? context.readyThroughDay) || 0,
    lastError: event.error || null,
    updatedAt: event.at || new Date().toISOString(),
  }));

  const machine = setup({
    guards: {
      eventNeedsReview: ({ event }) => !!event.needsReview,
      eventHasSkeleton: ({ context, event }) =>
        !!(event.hasSkeleton ?? context.hasSkeleton ?? event.packId ?? context.packId),
      eventKeepsReview: ({ event }) =>
        event.operation === 'repair' ||
        event.operation === 'materials' ||
        event.operation === 'courseGlossary' ||
        event.operation === 'dayGlossary' ||
        event.operation === 'customGlossary',
      hasPack: ({ context }) => !!context.packId,
    },
    actions: {
      applyEvent,
      markSkeleton: assign(({ context, event }) => ({
        ...context,
        packId: event.packId || context.packId,
        hasSkeleton: true,
        readyThroughDay: Number.isFinite(Number(event.readyThroughDay))
          ? Number(event.readyThroughDay)
          : Number(context.readyThroughDay) || 0,
        lastError: null,
        updatedAt: event.at || new Date().toISOString(),
      })),
      clearError: assign(({ context, event }) => ({
        ...context,
        lastError: null,
        operation: event.operation || context.operation,
        updatedAt: event.at || new Date().toISOString(),
      })),
    },
  }).createMachine({
    id: 'packWorkflow',
    initial: 'created',
    context: ({ input }) => ({
      jobId: input.jobId,
      projectId: input.projectId,
      operation: input.operation || 'full',
      packId: input.packId || null,
      previousPackId: input.previousPackId || null,
      previousStatus: input.previousStatus || null,
      hasSkeleton: !!input.packId,
      readyThroughDay: Number(input.readyThroughDay) || 0,
      lastError: null,
      createdAt: input.createdAt || new Date().toISOString(),
      updatedAt: input.createdAt || new Date().toISOString(),
    }),
    states: {
      created: {
        on: {
          START: { target: 'starting', actions: 'clearError' },
          RESUME: { target: 'filling', guard: 'hasPack', actions: 'clearError' },
          REPAIR: { target: 'repairing', guard: 'hasPack', actions: 'clearError' },
          MATERIALS: {
            target: 'generatingMaterials',
            guard: 'hasPack',
            actions: 'clearError',
          },
          GLOSSARY: {
            target: 'generatingGlossary',
            guard: 'hasPack',
            actions: 'clearError',
          },
        },
      },
      starting: {
        always: 'generatingSkeleton',
      },
      generatingSkeleton: {
        on: {
          SKELETON_READY: { target: 'filling', actions: 'markSkeleton' },
          CANCEL: 'cancelling',
          FAIL: [
            { target: 'partial', guard: 'eventHasSkeleton', actions: 'applyEvent' },
            { target: 'failed', actions: 'applyEvent' },
          ],
          COMPLETE: [
            { target: 'needsReview', guard: 'eventNeedsReview', actions: 'applyEvent' },
            { target: 'ready', actions: 'applyEvent' },
          ],
        },
      },
      filling: {
        on: {
          DAY_READY: { actions: 'markSkeleton' },
          CANCEL: 'cancelling',
          FAIL: [
            { target: 'partial', guard: 'eventHasSkeleton', actions: 'applyEvent' },
            { target: 'failed', actions: 'applyEvent' },
          ],
          COMPLETE: [
            { target: 'needsReview', guard: 'eventNeedsReview', actions: 'applyEvent' },
            { target: 'ready', actions: 'applyEvent' },
          ],
        },
      },
      repairing: {
        on: {
          CANCEL: 'cancelling',
          FAIL: [
            { target: 'needsReview', guard: 'eventHasSkeleton', actions: 'applyEvent' },
            { target: 'failed', actions: 'applyEvent' },
          ],
          COMPLETE: [
            { target: 'needsReview', guard: 'eventNeedsReview', actions: 'applyEvent' },
            { target: 'ready', actions: 'applyEvent' },
          ],
        },
      },
      generatingMaterials: {
        on: {
          CANCEL: 'cancelling',
          FAIL: [
            { target: 'needsReview', guard: 'eventHasSkeleton', actions: 'applyEvent' },
            { target: 'failed', actions: 'applyEvent' },
          ],
          COMPLETE: [
            { target: 'needsReview', guard: 'eventNeedsReview', actions: 'applyEvent' },
            { target: 'ready', actions: 'applyEvent' },
          ],
        },
      },
      generatingGlossary: {
        on: {
          CANCEL: 'cancelling',
          FAIL: [
            { target: 'needsReview', guard: 'eventHasSkeleton', actions: 'applyEvent' },
            { target: 'failed', actions: 'applyEvent' },
          ],
          COMPLETE: [
            { target: 'needsReview', guard: 'eventNeedsReview', actions: 'applyEvent' },
            { target: 'ready', actions: 'applyEvent' },
          ],
        },
      },
      cancelling: {
        on: {
          CANCELLED: [
            { target: 'needsReview', guard: 'eventKeepsReview', actions: 'applyEvent' },
            { target: 'partial', guard: 'eventHasSkeleton', actions: 'applyEvent' },
            { target: 'cancelled', actions: 'applyEvent' },
          ],
          FAIL: [
            { target: 'needsReview', guard: 'eventKeepsReview', actions: 'applyEvent' },
            { target: 'partial', guard: 'eventHasSkeleton', actions: 'applyEvent' },
            { target: 'cancelled', actions: 'applyEvent' },
          ],
        },
      },
      partial: {
        on: {
          RESUME: { target: 'filling', guard: 'hasPack', actions: 'clearError' },
          REPAIR: { target: 'repairing', guard: 'hasPack', actions: 'clearError' },
          MATERIALS: {
            target: 'generatingMaterials',
            guard: 'hasPack',
            actions: 'clearError',
          },
          GLOSSARY: {
            target: 'generatingGlossary',
            guard: 'hasPack',
            actions: 'clearError',
          },
          RESTART: { target: 'generatingSkeleton', actions: 'clearError' },
        },
      },
      needsReview: {
        on: {
          REPAIR: { target: 'repairing', guard: 'hasPack', actions: 'clearError' },
          MATERIALS: {
            target: 'generatingMaterials',
            guard: 'hasPack',
            actions: 'clearError',
          },
          GLOSSARY: {
            target: 'generatingGlossary',
            guard: 'hasPack',
            actions: 'clearError',
          },
          RESTART: { target: 'generatingSkeleton', actions: 'clearError' },
        },
      },
      ready: {
        on: {
          REPAIR: { target: 'repairing', guard: 'hasPack', actions: 'clearError' },
          MATERIALS: {
            target: 'generatingMaterials',
            guard: 'hasPack',
            actions: 'clearError',
          },
          GLOSSARY: {
            target: 'generatingGlossary',
            guard: 'hasPack',
            actions: 'clearError',
          },
          RESTART: { target: 'generatingSkeleton', actions: 'clearError' },
        },
      },
      failed: {
        on: {
          RETRY: [
            { target: 'filling', guard: 'hasPack', actions: 'clearError' },
            { target: 'generatingSkeleton', actions: 'clearError' },
          ],
        },
      },
      cancelled: {
        on: {
          RETRY: [
            { target: 'filling', guard: 'hasPack', actions: 'clearError' },
            { target: 'generatingSkeleton', actions: 'clearError' },
          ],
        },
      },
    },
  });

  function projectStatus(snapshot) {
    const state = String(snapshot?.value || 'failed');
    if (state === 'ready') return 'ready';
    if (state === 'needsReview' || state === 'repairing') return 'needs_review';
    if (state === 'partial' || (state === 'filling' && snapshot?.context?.hasSkeleton)) {
      return 'partial';
    }
    if (state === 'cancelled') return 'cancelled';
    if (state === 'failed') return 'failed';
    return 'generating';
  }

  return {
    machine,
    ACTIVE_STATES,
    isActive: (snapshot) => ACTIVE_STATES.has(String(snapshot?.value || '')),
    projectStatus,
  };
});
