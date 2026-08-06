const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createActor } = require('xstate');
const fc = require('fast-check');
const machineApi = require('../js/pack-workflow-machine');
const { MemoryStore } = require('../js/pack-workflow-store');
const gateApi = require('../js/pack-workflow-gate');
const { createPackWorkflow } = require('../js/pack-workflow');
const recoveryApi = require('../js/pack-workflow-recovery');

function completePack(id = 'pack-1') {
  const navigation = [{ items: [] }];
  const chapters = {};
  const plan = [];
  const dayExercises = {};
  const dayResources = {};
  for (let day = 1; day <= 7; day++) {
    const slug = `module-1/day-${String(day).padStart(2, '0')}`;
    navigation[0].items.push({ slug });
    chapters[slug] = `# Day ${day}\n${'完整内容 '.repeat(500)}`;
    plan.push({ day, topic: `主题 ${day}` });
    dayExercises[day] = [{ q: 'A' }, { q: 'B' }, { q: 'C' }];
    dayResources[day] = { resources: [], hub: [slug] };
  }
  return {
    id,
    meta: {
      title: '测试课包',
      days: 7,
      quality: {
        needsReview: false,
        glossaryEnough: true,
        glossaryKindCount: 2,
        phaseMonotonic: true,
      },
    },
    plan,
    glossary: [],
    hub: { navigation, chapters },
    dayExercises,
    dayResources,
    status: 'partial',
  };
}

function dependencies({ generator, harness } = {}) {
  const projectsMap = new Map([
    [
      'project-1',
      {
        id: 'project-1',
        title: '测试路径',
        industry: '测试',
        role: '测试员',
        days: 7,
        packId: null,
        packStatus: 'generating',
      },
    ],
  ]);
  const packs = new Map();
  const projects = {
    list: () => [...projectsMap.values()],
    get: (id) => projectsMap.get(id) || null,
    update: (id, patch) => {
      const next = { ...projectsMap.get(id), ...patch };
      projectsMap.set(id, next);
      return next;
    },
  };
  const contentPack = {
    load: (id) => packs.get(id) || null,
    save: (pack) => packs.set(pack.id, structuredClone(pack)),
    remove: (id) => packs.delete(id),
  };
  return {
    store: new MemoryStore(),
    generator,
    projects,
    contentPack,
    harness: harness || { shouldRepair: () => false },
    projectsMap,
    packs,
  };
}

test('完整生成只由最终门禁进入 ready', async () => {
  const pack = completePack();
  const deps = dependencies({
    generator: {
      async generate(_meta, _progress, options) {
        options.onSkeletonReady({ ...pack, status: 'partial' });
        return pack;
      },
    },
  });
  const workflow = createPackWorkflow(deps);
  const result = await workflow.start(deps.projects.get('project-1'));

  assert.equal(result.meta.quality.finalGatePassed, true);
  assert.equal(deps.projects.get('project-1').packStatus, 'ready');
  assert.equal(deps.packs.get(pack.id).status, 'ready');
});

test('Harness 仍要求修复时不得进入 ready', async () => {
  const pack = completePack();
  const deps = dependencies({
    generator: {
      async generate(_meta, _progress, options) {
        options.onSkeletonReady(pack);
        return pack;
      },
    },
    harness: { shouldRepair: () => true },
  });
  const workflow = createPackWorkflow(deps);
  const result = await workflow.start(deps.projects.get('project-1'));

  assert.equal(result.meta.quality.finalGatePassed, false);
  assert.equal(deps.projects.get('project-1').packStatus, 'needs_review');
});

test('骨架完成后的取消落入 partial，不会误报 ready', async () => {
  const pack = completePack();
  const deps = dependencies({
    generator: {
      generate(_meta, _progress, options) {
        options.onSkeletonReady(pack);
        return new Promise((resolve, reject) => {
          options.signal.addEventListener('abort', () => {
            const error = new Error('已停止');
            error.name = 'AbortError';
            error.code = 'ABORTED';
            reject(error);
          });
        });
      },
    },
  });
  deps.contentPack.save(pack);
  const workflow = createPackWorkflow(deps);
  const running = workflow.start(deps.projects.get('project-1'));
  await new Promise((resolve) => setImmediate(resolve));
  await workflow.cancel('project-1');
  await assert.rejects(running, { name: 'AbortError' });

  assert.equal(deps.projects.get('project-1').packStatus, 'partial');
});

test('骨架前取消进入 cancelled', async () => {
  const deps = dependencies({
    generator: {
      generate(_meta, _progress, options) {
        return new Promise((resolve, reject) => {
          options.signal.addEventListener('abort', () => {
            const error = new Error('已停止');
            error.name = 'AbortError';
            reject(error);
          });
        });
      },
    },
  });
  const workflow = createPackWorkflow(deps);
  const running = workflow.start(deps.projects.get('project-1'));
  await new Promise((resolve) => setImmediate(resolve));
  await workflow.cancel('project-1');
  await assert.rejects(running, { name: 'AbortError' });
  assert.equal(deps.projects.get('project-1').packStatus, 'cancelled');
});

test('并发启动窗口也只允许一个活动 Workflow', async () => {
  class DelayedStore extends MemoryStore {
    async save(record) {
      await new Promise((resolve) => setImmediate(resolve));
      return super.save(record);
    }
  }
  const pack = completePack();
  const deps = dependencies({
    generator: {
      async generate(_meta, _progress, options) {
        options.onSkeletonReady(pack);
        return pack;
      },
    },
  });
  deps.store = new DelayedStore();
  const workflow = createPackWorkflow(deps);
  const first = workflow.start(deps.projects.get('project-1'));
  await assert.rejects(
    workflow.start(deps.projects.get('project-1')),
    /已有生成任务正在运行/
  );
  await first;
});

test('初始状态检查点失败后不会留下永久 busy', async () => {
  class FailSecondStore extends MemoryStore {
    constructor() {
      super();
      this.writes = 0;
    }
    async save(record) {
      this.writes += 1;
      if (this.writes === 2) throw new Error('disk full');
      return super.save(record);
    }
  }
  const deps = dependencies({ generator: {} });
  deps.store = new FailSecondStore();
  const workflow = createPackWorkflow(deps);
  await assert.rejects(workflow.start(deps.projects.get('project-1')), /disk full/);
  assert.equal(workflow.isBusy(), false);
  assert.equal(deps.projects.get('project-1').packStatus, 'failed');
});

test('最终检查点失败时不向 UI 发布 ready', async () => {
  class FailFourthStore extends MemoryStore {
    constructor() {
      super();
      this.writes = 0;
    }
    async save(record) {
      this.writes += 1;
      if (this.writes === 4) throw new Error('checkpoint unavailable');
      return super.save(record);
    }
  }
  const pack = completePack();
  const deps = dependencies({
    generator: {
      async generate(_meta, _progress, options) {
        options.onSkeletonReady(pack);
        return pack;
      },
    },
  });
  deps.store = new FailFourthStore();
  const workflow = createPackWorkflow(deps);
  await assert.rejects(
    workflow.start(deps.projects.get('project-1')),
    /checkpoint unavailable/
  );
  assert.equal(deps.projects.get('project-1').packStatus, 'needs_review');
  assert.equal(workflow.isBusy(), false);
});

test('每日材料任务失败后保持 needs_review，不伪装成 partial', async () => {
  const pack = completePack();
  const deps = dependencies({
    generator: {
      async generateDayMaterialsForPack() {
        throw new Error('material generation failed');
      },
    },
  });
  deps.contentPack.save(pack);
  deps.projects.update('project-1', {
    packId: pack.id,
    packStatus: 'needs_review',
  });
  const workflow = createPackWorkflow(deps);
  await assert.rejects(
    workflow.generateMaterials(deps.projects.get('project-1')),
    /material generation failed/
  );
  assert.equal(deps.projects.get('project-1').packStatus, 'needs_review');
});

test('重新生成在新骨架前失败时保留旧课包可用状态', async () => {
  const oldPack = completePack('pack-old');
  const deps = dependencies({
    generator: {
      async generate() {
        throw new Error('outline failed');
      },
    },
  });
  deps.contentPack.save(oldPack);
  deps.projects.update('project-1', {
    packId: oldPack.id,
    packStatus: 'ready',
  });
  const workflow = createPackWorkflow(deps);
  await assert.rejects(workflow.start(deps.projects.get('project-1')), /outline failed/);
  assert.equal(deps.projects.get('project-1').packStatus, 'ready');
  assert.equal(deps.projects.get('project-1').packId, oldPack.id);
});

test('启动恢复会把失去执行器的任务安全降级', async () => {
  const store = new MemoryStore();
  const pack = completePack();
  const actor = createActor(machineApi.machine, {
    input: {
      jobId: 'wf-stale',
      projectId: 'project-1',
      operation: 'full',
      packId: pack.id,
    },
  }).start();
  actor.send({ type: 'RESUME' });
  await store.save({
    jobId: 'wf-stale',
    projectId: 'project-1',
    state: String(actor.getSnapshot().value),
    context: actor.getSnapshot().context,
    snapshot: actor.getPersistedSnapshot(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const deps = dependencies({ generator: {} });
  deps.store = store;
  deps.projects.update('project-1', { packId: pack.id, packStatus: 'generating' });
  deps.contentPack.save(pack);
  const workflow = createPackWorkflow(deps);

  const recovered = await workflow.recover();
  assert.equal(recovered, 1);
  assert.equal(deps.projects.get('project-1').packStatus, 'partial');
  assert.equal((await store.get('wf-stale')).state, 'partial');
});

test('重新生成在新骨架前重启不会把旧包误认成 partial', async () => {
  const store = new MemoryStore();
  const oldPack = completePack('pack-old-recovery');
  oldPack.status = 'ready';
  oldPack.meta.generation = { phase: 'done' };
  const actor = createActor(machineApi.machine, {
    input: {
      jobId: 'wf-regenerate-stale',
      projectId: 'project-1',
      operation: 'full',
      previousPackId: oldPack.id,
      previousStatus: 'ready',
    },
  }).start();
  actor.send({ type: 'START' });
  await store.save({
    jobId: 'wf-regenerate-stale',
    projectId: 'project-1',
    state: String(actor.getSnapshot().value),
    context: actor.getSnapshot().context,
    snapshot: actor.getPersistedSnapshot(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const deps = dependencies({ generator: {} });
  deps.store = store;
  deps.contentPack.save(oldPack);
  deps.projects.update('project-1', {
    packId: oldPack.id,
    packStatus: 'generating',
  });
  const workflow = createPackWorkflow(deps);

  assert.equal(await workflow.recover(), 1);
  assert.equal(deps.projects.get('project-1').packStatus, 'ready');
  assert.equal(deps.projects.get('project-1').packId, oldPack.id);
  const record = await store.get('wf-regenerate-stale');
  assert.equal(record.state, 'failed');
  assert.equal(record.context.packId, null);
});

test('恢复只处理同一项目最新的活动检查点', async () => {
  const store = new MemoryStore();
  const oldPack = completePack('pack-old-stale');
  const newPack = completePack('pack-new-terminal');
  const activeActor = createActor(machineApi.machine, {
    input: { jobId: 'wf-old-active', projectId: 'project-1', operation: 'resume', packId: oldPack.id },
  }).start();
  activeActor.send({ type: 'RESUME' });
  const terminalActor = createActor(machineApi.machine, {
    input: { jobId: 'wf-new-ready', projectId: 'project-1', operation: 'resume', packId: newPack.id },
  }).start();
  terminalActor.send({ type: 'RESUME' });
  terminalActor.send({ type: 'COMPLETE', packId: newPack.id, needsReview: false });
  const older = new Date(Date.now() - 1_000).toISOString();
  const newer = new Date().toISOString();
  await store.save({
    jobId: 'wf-old-active', projectId: 'project-1', state: String(activeActor.getSnapshot().value),
    context: activeActor.getSnapshot().context, snapshot: activeActor.getPersistedSnapshot(),
    createdAt: older, updatedAt: older,
  });
  await store.save({
    jobId: 'wf-new-ready', projectId: 'project-1', state: String(terminalActor.getSnapshot().value),
    context: terminalActor.getSnapshot().context, snapshot: terminalActor.getPersistedSnapshot(),
    createdAt: newer, updatedAt: newer,
  });
  const deps = dependencies({ generator: {} });
  deps.store = store;
  deps.contentPack.save(oldPack);
  deps.contentPack.save(newPack);
  deps.projects.update('project-1', { packId: newPack.id, packStatus: 'ready' });
  const workflow = createPackWorkflow(deps);

  assert.equal(await workflow.recover(), 0);
  assert.equal(deps.projects.get('project-1').packId, newPack.id);
  assert.equal(deps.projects.get('project-1').packStatus, 'ready');
});

test('旧课包在新骨架检查点完成前保持可恢复', async () => {
  const oldPack = completePack('pack-retain-old');
  const newPack = completePack('pack-retain-new');
  let resolveGeneration;
  const deps = dependencies({
    generator: {
      generate(_meta, _progress, options) {
        options.onSkeletonReady(newPack);
        return new Promise((resolve) => { resolveGeneration = () => resolve(newPack); });
      },
    },
  });
  deps.contentPack.save(oldPack);
  deps.projects.update('project-1', { packId: oldPack.id, packStatus: 'ready' });
  const workflow = createPackWorkflow(deps);
  const running = workflow.start(deps.projects.get('project-1'));
  await new Promise((resolve) => setImmediate(resolve));
  assert.ok(deps.contentPack.load(oldPack.id));
  resolveGeneration();
  await running;
  assert.equal(deps.contentPack.load(oldPack.id), null);
});

test('结构不完整的课包被最终门禁拒绝', () => {
  const pack = completePack();
  delete pack.hub.chapters['module-1/day-07'];
  const result = gateApi.evaluate(pack, { shouldRepair: () => false });
  assert.equal(result.passed, false);
  assert.equal(result.missingChapterSlugs.length, 1);
});

test('无 Day 映射的无关知识库导航不能冒充每日覆盖', () => {
  const pack = completePack();
  const nextChapters = {};
  pack.hub.navigation[0].items = pack.hub.navigation[0].items.map((item, index) => {
    const slug = `module-1/unrelated-topic-${index + 1}`;
    nextChapters[slug] = pack.hub.chapters[item.slug];
    return { slug };
  });
  pack.hub.chapters = nextChapters;
  const result = gateApi.evaluate(pack, { shouldRepair: () => false });
  assert.equal(result.passed, false);
  assert.equal(result.missingHubDays.length, 7);
});

test('holiday-01 之类的字符串不能冒充 day-01 路径段', () => {
  const pack = completePack();
  const nextChapters = {};
  pack.hub.navigation[0].items = pack.hub.navigation[0].items.map((item, index) => {
    const slug = `module-1/holiday-${String(index + 1).padStart(2, '0')}`;
    nextChapters[slug] = pack.hub.chapters[item.slug];
    return { slug };
  });
  pack.hub.chapters = nextChapters;
  const result = gateApi.evaluate(pack, { shouldRepair: () => false });
  assert.equal(result.passed, false);
  assert.equal(result.missingHubDays.length, 7);
});

test('空白练习题不能通过每日练习结构门禁', () => {
  const pack = completePack();
  for (let day = 1; day <= 7; day++) {
    pack.dayExercises[day] = [{ q: ' ' }, { question: '\n' }, { q: '\t' }];
  }
  const result = gateApi.evaluate(pack, { shouldRepair: () => false });
  assert.equal(result.passed, false);
  assert.deepEqual(result.missingExerciseDays, [1, 2, 3, 4, 5, 6, 7]);
});

test('术语数量或可视化类型不达标时最终门禁拒绝', () => {
  const pack = completePack();
  pack.meta.quality.glossaryEnough = false;
  pack.meta.quality.glossaryKindCount = 1;
  const result = gateApi.evaluate(pack, { shouldRepair: () => false });
  assert.equal(result.passed, false);
  assert.ok(result.issues.includes('合格术语不足 8 条'));
});

test('最终门禁会实际识别阶段 A-B-A 回跳', () => {
  const pack = completePack();
  pack.plan[0].phase = 'A';
  pack.plan[1].phase = 'B';
  pack.plan[2].phase = 'A';
  const result = gateApi.evaluate(pack, { shouldRepair: () => false });
  assert.equal(result.passed, false);
  assert.deepEqual(result.phaseBackjumpDays, [3]);
});

test('随机状态组合不会把取消或待修复流程误标 ready', () => {
  fc.assert(
    fc.property(
      fc.record({
        skeletonReady: fc.boolean(),
        cancel: fc.boolean(),
        needsReview: fc.boolean(),
        readyThroughDay: fc.integer({ min: 1, max: 90 }),
      }),
      (scenario) => {
        const actor = createActor(machineApi.machine, {
          input: { jobId: 'property', projectId: 'project-1', operation: 'full' },
        }).start();
        actor.send({ type: 'START' });
        if (scenario.skeletonReady) {
          actor.send({
            type: 'SKELETON_READY',
            packId: 'pack-property',
            readyThroughDay: scenario.readyThroughDay,
          });
        }
        if (scenario.cancel) {
          actor.send({ type: 'CANCEL' });
          actor.send({
            type: 'CANCELLED',
            packId: scenario.skeletonReady ? 'pack-property' : null,
            hasSkeleton: scenario.skeletonReady,
          });
        } else {
          actor.send({
            type: 'COMPLETE',
            packId: 'pack-property',
            needsReview: scenario.needsReview,
          });
        }
        const snapshot = actor.getSnapshot();
        if (scenario.cancel) {
          assert.notEqual(snapshot.value, 'ready');
        } else if (scenario.needsReview) {
          assert.notEqual(snapshot.value, 'ready');
        }
        assert.equal(
          machineApi.projectStatus(snapshot) === 'ready',
          snapshot.value === 'ready'
        );
      }
    ),
    { numRuns: 200 }
  );
});

test('启动迁移会修正无执行器 generating 和旧包假绿', () => {
  const deps = dependencies({ generator: {} });
  const stuck = deps.projects.get('project-1');
  recoveryApi.reconcile({
    projects: deps.projects,
    contentPack: deps.contentPack,
    harness: deps.harness,
    gate: gateApi,
  });
  assert.equal(deps.projects.get(stuck.id).packStatus, 'failed');

  const incomplete = completePack('pack-incomplete');
  delete incomplete.hub.chapters['module-1/day-07'];
  incomplete.status = 'ready';
  incomplete.meta.generation = { phase: 'done' };
  deps.contentPack.save(incomplete);
  deps.projects.update(stuck.id, {
    packId: incomplete.id,
    packStatus: 'ready',
  });
  recoveryApi.reconcile({
    projects: deps.projects,
    contentPack: deps.contentPack,
    harness: deps.harness,
    gate: gateApi,
  });
  assert.equal(deps.projects.get(stuck.id).packStatus, 'needs_review');
});

test('Wikipedia 在途请求会响应 AbortSignal', async () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'pack-generator.js'),
    'utf8'
  );
  const context = vm.createContext({
    console,
    fetch: (_url, { signal }) =>
      new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => {
          reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
        });
      }),
  });
  vm.runInContext(`${source}\n;globalThis.__PackGenerator = PackGenerator;`, context);
  const controller = new AbortController();
  const pending = context.__PackGenerator._test.fetchWikipediaResources(
    '产品经理',
    2,
    controller.signal
  );
  controller.abort();
  await assert.rejects(pending, { name: 'AbortError' });
});

test('术语分阶段重试仍不合格时明确失败，不以空术语库完成', async () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'pack-generator.js'),
    'utf8'
  );
  const context = vm.createContext({
    console,
    AiReview: { chat: async () => '{}' },
  });
  vm.runInContext(`${source}\n;globalThis.__PackGenerator = PackGenerator;`, context);
  const terms = ['需求验证', '用户画像', '价值主张', '竞品分析', '机会评估', '方案取舍', '风险矩阵', '验收标准'];
  const pack = {
    plan: terms.map((topic, index) => ({ day: index + 1, topic })),
    hub: {
      chapters: Object.fromEntries(
        terms.map((term, index) => [
          `module-1/day-${String(index + 1).padStart(2, '0')}`,
          `# ${term}\n**${term}** 用于具体工作判断，并需要记录证据、方案与验证结果。`,
        ])
      ),
    },
  };

  await assert.rejects(
    context.__PackGenerator._test.generateGlossary(
      { industry: '软件', role: '产品经理', goal: '入门', days: 8 },
      { phases: [], weekThemes: [] },
      undefined,
      pack
    ),
    (error) => {
      assert.equal(error.code, 'GLOSSARY_QUALITY');
      assert.equal(error.quality.passCount, 0);
      return true;
    }
  );
});

test('术语生成遇到服务或预算故障时保留原始错误，不误报成质量不达标', async () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'pack-generator.js'),
    'utf8'
  );
  const context = vm.createContext({
    console,
    AiReview: {
      chat: async () => {
        throw Object.assign(new Error('智能服务未连接'), { code: 'NO_PROXY' });
      },
    },
  });
  vm.runInContext(`${source}\n;globalThis.__PackGenerator = PackGenerator;`, context);
  const terms = ['需求验证', '用户画像', '价值主张', '竞品分析', '机会评估', '方案取舍', '风险矩阵', '验收标准'];
  const pack = {
    plan: terms.map((topic, index) => ({ day: index + 1, topic })),
    hub: {
      chapters: Object.fromEntries(
        terms.map((term, index) => [
          `module-1/day-${String(index + 1).padStart(2, '0')}`,
          `# ${term}\n**${term}** 用于具体工作判断，并需要记录证据、方案与验证结果。`,
        ])
      ),
    },
  };

  await assert.rejects(
    context.__PackGenerator._test.generateGlossary(
      { industry: '软件', role: '产品经理', goal: '入门', days: 8 },
      { phases: [], weekThemes: [] },
      undefined,
      pack
    ),
    (error) => error.code === 'NO_PROXY' && /服务未连接/.test(error.message)
  );
});

test('模型选词为空时会从正文候选生成并验收合格术语库', async () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'pack-generator.js'),
    'utf8'
  );
  const requests = [];
  const context = vm.createContext({
    console,
    AiReview: {
      chat: async ({ messages }) => {
        const user = messages.find((message) => message.role === 'user')?.content || '';
        requests.push(user);
        const visualJson = user.match(/## 本批要配图的词条[^\n]*\n(\[[^\n]+\])/u)?.[1];
        if (visualJson) {
          const batch = JSON.parse(visualJson);
          return JSON.stringify({
            visuals: batch.map((item, index) => ({
              term: item.term,
              visual: {
                kind: index % 2 === 0 ? 'flow' : 'anatomy',
                title: `${item.term}判断结构`,
                nodes: [
                  { label: `${item.term}输入`, detail: '收集对象、约束与已有证据' },
                  { label: `${item.term}输出`, detail: '形成选择、理由与验证方式' },
                ],
                facts: [],
                caption: '从事实输入到可验证结论',
              },
            })),
          });
        }
        const batchJson = user.match(/## 本批要写的词[^\n]*\n(\[[^\n]+\])/u)?.[1];
        if (!batchJson) return '{}';
        const batch = JSON.parse(batchJson);
        return JSON.stringify({
          glossary: batch.map((item) => ({
            term: item.term,
            aliases: [],
            module: '方法',
            definition: `${item.term}是一套用于识别具体问题、比较备选方案并形成可验证结论的方法。`,
            userPhrases: [`我需要用${item.term}比较这两个真实方案，应该先检查哪些条件？`],
            example: `团队针对新用户流失问题使用${item.term}比较两个方案，记录证据后选择风险更低的一项并跟踪结果。`,
            visual: {
              kind: Number(item.sourceDay) % 2 === 0 ? 'anatomy' : 'flow',
              title: `${item.term}判断结构`,
              nodes: [
                { label: `${item.term}输入`, detail: '收集对象、约束与已有证据' },
                { label: `${item.term}输出`, detail: '形成选择、理由与验证方式' },
              ],
              facts: [],
              caption: '从事实输入到可验证结论',
            },
            confusions: [
              { term: '经验判断', distinction: '本词要求记录证据与验证；经验判断可能只依赖个人直觉。' },
            ],
            sections: [
              { label: '是什么', content: '用于真实任务中的结构化判断。' },
              { label: '岗位要会的判断', content: '先看约束，再比较证据。' },
              { label: '面试怎么答', content: '说明对象、方法、选择和验证结果。' },
            ],
          })),
        });
      },
    },
  });
  vm.runInContext(`${source}\n;globalThis.__PackGenerator = PackGenerator;`, context);
  const terms = ['需求验证', '用户画像', '价值主张', '竞品分析', '机会评估', '方案取舍', '风险矩阵', '验收标准'];
  const pack = {
    plan: terms.map((topic, index) => ({ day: index + 1, topic })),
    hub: {
      chapters: Object.fromEntries(
        terms.map((term, index) => [
          `module-1/day-${String(index + 1).padStart(2, '0')}`,
          `# ${term}\n**${term}** 用于具体工作判断，并需要记录证据、方案与验证结果。`,
        ])
      ),
    },
  };

  const glossary = await context.__PackGenerator._test.generateGlossary(
    { industry: '软件', role: '产品经理', goal: '入门', days: 8 },
    { phases: [], weekThemes: [] },
    undefined,
    pack
  );
  const stats = context.__PackGenerator._test.glossaryQualityStats(glossary);
  assert.equal(stats.enoughCount, true);
  assert.ok(stats.passCount >= 8);
  assert.ok(stats.kindCount >= 2);
  assert.ok(glossary.every((entry) => entry.sourceType === 'core'));
  assert.ok(glossary.some((entry) => entry.sourceDays?.length));
  assert.ok(requests.some((user) => user.includes('## 本批要写的词')));
  assert.ok(requests.some((user) => user.includes('## 本批要配图的词条')));
});

test('继续补全能识别并复用已完成的课表、资料、日课和附加内容', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'pack-generator.js'),
    'utf8'
  );
  const context = vm.createContext({ console });
  vm.runInContext(`${source}\n;globalThis.__PackGenerator = PackGenerator;`, context);
  const days = 7;
  const pack = {
    plan: Array.from({ length: days }, (_, index) => ({
      day: index + 1,
      topic: `主题 ${index + 1}`,
    })),
    dayResources: {},
    dayExercises: {},
    hub: {
      navigation: [{ items: [] }],
      chapters: {},
    },
    skills: Array.from({ length: 6 }, (_, index) => ({ id: `s${index + 1}` })),
    interview: Array.from({ length: 12 }, (_, index) => ({ id: `i${index + 1}` })),
    portfolio: Array.from({ length: 3 }, (_, index) => ({ id: `p${index + 1}` })),
  };
  for (let day = 1; day <= days; day++) {
    const slug = `module-1/day-${String(day).padStart(2, '0')}`;
    pack.dayResources[String(day)] = { resources: [] };
    pack.dayExercises[String(day)] = [
      { q: `问题 ${day}-1` },
      { q: `问题 ${day}-2` },
      { q: `问题 ${day}-3` },
    ];
    pack.hub.navigation[0].items.push({ day, days: String(day), slug });
    pack.hub.chapters[slug] = `# 主题 ${day}\n\n这是已经生成完成的日课正文。`;
  }

  const helpers = context.__PackGenerator._test;
  assert.equal(helpers.hasCompletePlan(pack, days), true);
  assert.equal(helpers.hasCompleteDayMaterials(pack, 4, days), true);
  assert.equal(helpers.hasCompleteHub(pack, 4, days), true);
  assert.equal(helpers.hasCompleteExtras(pack), true);

  pack.hub.chapters['module-1/day-07'] =
    '# 主题 7\n\n> 本章正在后台准备中，先学已就绪的前几天即可；完成后打开知识库会自动更新。';
  assert.equal(helpers.hasCompleteHub(pack, 4, days), false);
});

test('附加内容断点续跑会复用已有能力与面试，只补缺失作品', async () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'pack-generator.js'),
    'utf8'
  );
  const requests = [];
  const context = vm.createContext({
    console,
    AiReview: {
      chat: async ({ messages }) => {
        const user = messages.find((message) => message.role === 'user')?.content || '';
        requests.push(user);
        return JSON.stringify({
          portfolio: Array.from({ length: 4 }, (_, index) => ({
            id: `p${index + 1}`,
            title: `作品 ${index + 1}`,
            phase: '实战',
            days: '1-7',
            items: ['交付物 A', '交付物 B'],
          })),
        });
      },
    },
  });
  vm.runInContext(`${source}\n;globalThis.__PackGenerator = PackGenerator;`, context);
  const existing = {
    skills: Array.from({ length: 6 }, (_, index) => ({
      id: `s${index + 1}`,
      label: `能力 ${index + 1}`,
      desc: '已有能力',
    })),
    interview: Array.from({ length: 12 }, (_, index) => ({
      id: `i${index + 1}`,
      q: `已有问题 ${index + 1}`,
    })),
    portfolio: [],
  };
  const extras = await context.__PackGenerator._test.generateExtras(
    { industry: '软件', role: '产品经理', days: 7 },
    { phases: [] },
    existing
  );
  assert.equal(requests.length, 1);
  assert.ok(requests[0].includes('## 阶段与能力'));
  assert.equal(extras.skills.length, 6);
  assert.equal(extras.interview.length, 12);
  assert.equal(extras.portfolio.length, 4);
});

test('术语失败后的继续补全只请求术语阶段，不重复生成其他内容', async () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'pack-generator.js'),
    'utf8'
  );
  const requests = [];
  const context = vm.createContext({
    console,
    ContentPack: { save: () => {} },
    AiReview: {
      chat: async ({ messages }) => {
        const user = messages.find((message) => message.role === 'user')?.content || '';
        requests.push(user);
        const visualJson = user.match(/## 本批要配图的词条[^\n]*\n(\[[^\n]+\])/u)?.[1];
        if (visualJson) {
          const batch = JSON.parse(visualJson);
          return JSON.stringify({
            visuals: batch.map((item, index) => ({
              term: item.term,
              visual: {
                kind: index % 2 === 0 ? 'flow' : 'anatomy',
                title: `${item.term}判断结构`,
                nodes: [
                  { label: `${item.term}输入`, detail: '收集对象、约束与已有证据' },
                  { label: `${item.term}输出`, detail: '形成选择、理由与验证方式' },
                ],
              },
            })),
          });
        }
        const coreJson = user.match(/## 本批要写的词[^\n]*\n(\[[^\n]+\])/u)?.[1];
        if (coreJson) {
          const batch = JSON.parse(coreJson);
          return JSON.stringify({
            glossary: batch.map((item) => ({
              term: item.term,
              module: '方法',
              definition: `${item.term}是一套用于识别具体问题、比较备选方案并形成可验证结论的方法。`,
              userPhrases: [`我需要用${item.term}比较两个真实方案，应该先检查哪些条件？`],
              example: `团队针对新用户流失问题使用${item.term}比较两个方案，记录证据后选择风险更低的一项并持续跟踪结果。`,
              confusions: [
                { term: '经验判断', distinction: '本词要求记录证据与验证；经验判断可能只依赖个人直觉。' },
              ],
              sections: [
                { label: '是什么', content: '用于真实任务中的结构化判断。' },
                { label: '岗位要会的判断', content: '先看约束，再比较证据。' },
                { label: '面试怎么答', content: '说明对象、方法、选择和验证结果。' },
              ],
            })),
          });
        }
        return '{}';
      },
    },
  });
  vm.runInContext(`${source}\n;globalThis.__PackGenerator = PackGenerator;`, context);
  const terms = ['需求验证', '用户画像', '价值主张', '竞品分析', '机会评估', '方案取舍', '风险矩阵', '验收标准'];
  const pack = {
    id: 'resume-glossary-only',
    meta: {
      title: '测试路径',
      industry: '软件',
      role: '产品经理',
      goal: '入门',
      days: terms.length,
      generation: { skeletonDays: 3, readyThroughDay: terms.length },
    },
    plan: terms.map((topic, index) => ({ day: index + 1, topic, phase: '方法' })),
    dayResources: {},
    dayExercises: {},
    hub: { navigation: [{ items: [] }], chapters: {} },
    skills: Array.from({ length: 6 }, (_, index) => ({ id: `s${index + 1}` })),
    interview: Array.from({ length: 12 }, (_, index) => ({ id: `i${index + 1}` })),
    portfolio: Array.from({ length: 3 }, (_, index) => ({ id: `p${index + 1}` })),
    glossary: [],
  };
  terms.forEach((term, index) => {
    const day = index + 1;
    const slug = `module-1/day-${String(day).padStart(2, '0')}`;
    pack.dayResources[String(day)] = { resources: [] };
    pack.dayExercises[String(day)] = [
      { q: `${term}问题一` },
      { q: `${term}问题二` },
      { q: `${term}问题三` },
    ];
    pack.hub.navigation[0].items.push({ day, days: String(day), slug });
    pack.hub.chapters[slug] =
      `# ${term}\n\n**${term}** 用于具体工作判断。团队需要收集证据、比较方案、记录取舍并验证结果。`;
  });

  await context.__PackGenerator._test.fillPackRemainder(
    pack,
    { phases: [], weekThemes: [], outcomes: null },
    { industry: '软件', role: '产品经理', goal: '入门', days: terms.length },
    () => {},
    { firstChunkEnd: 3, skeletonDays: 3 }
  );

  assert.ok(pack.glossary.length >= 8);
  assert.ok(
    requests.every(
      (user) =>
        user.includes('## 日课摘要') ||
        user.includes('## 本批要写的词') ||
        user.includes('## 本批要配图的词条')
    )
  );
});

test('增量术语按来源去重合并，核心硬门不计入按日和自定义词', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'pack-generator.js'),
    'utf8'
  );
  const context = vm.createContext({ console });
  vm.runInContext(`${source}\n;globalThis.__PackGenerator = PackGenerator;`, context);
  const entry = (term, sourceType, sourceDays = [], kind = 'flow') => ({
    term,
    definition: `${term}用于在明确业务目标和约束条件后，比较证据并做出可验证的工作判断。`,
    userPhrases: [`团队会怎样使用${term}来确定下一步行动？`],
    example: `在一次需求评审中，负责人用${term}比较三项证据，记录取舍理由，并在上线后验证结果。`,
    confusions: [{ term: `${term}近义词`, distinction: '前者强调判断依据，后者只描述一般做法。' }],
    sections: [{ label: '是什么', content: `${term}的具体使用边界与判断方法。` }],
    visual: {
      kind,
      title: `${term}工作流程`,
      nodes: [
        { id: 'a', label: `${term}输入证据`, description: '收集事实' },
        { id: 'b', label: `${term}输出判断`, description: '记录取舍' },
      ],
      edges: [{ from: 'a', to: 'b', label: '比较' }],
    },
    sourceType,
    sourceDays,
  });
  const core = entry('需求验证', 'core', [1]);
  const custom = entry('机会成本', 'custom');
  const dayUpdate = entry('需求验证', 'day', [3], 'anatomy');
  const dayNew = entry('价值主张', 'day', [3], 'flow');
  const merged = context.__PackGenerator._test.mergeGlossaryEntries(
    [core, custom],
    [dayUpdate, dayNew]
  );
  const demand = merged.find((item) => item.term === '需求验证');
  assert.equal(demand.sourceType, 'core');
  assert.deepEqual(Array.from(demand.sourceDays), [1, 3]);
  assert.ok(merged.some((item) => item.term === '机会成本'));
  assert.ok(merged.some((item) => item.term === '价值主张'));

  const stats = context.__PackGenerator._test.glossaryQualityStats(merged, {
    coreOnly: true,
  });
  assert.equal(stats.total, 1);
  assert.equal(stats.passCount, 1);

  const replaced = context.__PackGenerator._test.replaceCoreGlossary(
    merged,
    [entry('验收标准', 'core', [4])]
  );
  assert.ok(!replaced.some((item) => item.term === '需求验证'));
  assert.ok(replaced.some((item) => item.term === '机会成本'));
  assert.ok(replaced.some((item) => item.term === '价值主张'));
  assert.ok(replaced.some((item) => item.term === '验收标准'));
});

test('按日候选只取指定日课，不混入其他天主题', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'pack-generator.js'),
    'utf8'
  );
  const context = vm.createContext({ console });
  vm.runInContext(`${source}\n;globalThis.__PackGenerator = PackGenerator;`, context);
  const pack = {
    plan: [
      { day: 1, topic: '用户画像' },
      { day: 2, topic: '竞品分析' },
    ],
    hub: {
      navigation: [
        {
          items: [
            { day: 1, days: '1', slug: 'module-1/day-01', title: '用户画像' },
            { day: 2, days: '2', slug: 'module-1/day-02', title: '竞品分析' },
          ],
        },
      ],
      chapters: {
        'module-1/day-01': `# 用户画像\n\n**需求验证** 是本课方法。${'团队收集证据并记录判断。'.repeat(8)}`,
        'module-1/day-02': `# 竞品分析\n\n**机会评估** 是本课方法。${'团队比较方案并记录取舍。'.repeat(8)}`,
      },
    },
  };
  const candidates = context.__PackGenerator._test.glossaryCandidatesForDay(
    [],
    pack,
    1,
    8
  );
  const names = candidates.map((item) => item.term);
  assert.ok(names.includes('用户画像') || names.includes('需求验证'));
  assert.ok(!names.includes('竞品分析'));
  assert.ok(!names.includes('机会评估'));
  assert.ok(candidates.every((item) => item.sourceDay === 1));
});

test('工作流支持按日和自定义术语操作并保持路径可用', async () => {
  const pack = completePack('pack-glossary-actions');
  const calls = [];
  const deps = dependencies({
    generator: {
      async generateGlossaryForDayPack(packId, day) {
        calls.push(['day', packId, day]);
        return pack;
      },
      async generateCustomGlossaryForPack(packId, term) {
        calls.push(['custom', packId, term]);
        return pack;
      },
    },
  });
  deps.contentPack.save(pack);
  deps.projects.update('project-1', {
    packId: pack.id,
    packStatus: 'ready',
  });
  const workflow = createPackWorkflow(deps);
  await workflow.generateDayGlossary(deps.projects.get('project-1'), 3);
  await workflow.generateCustomGlossary(deps.projects.get('project-1'), '机会成本');
  assert.deepEqual(calls, [
    ['day', pack.id, 3],
    ['custom', pack.id, '机会成本'],
  ]);
  assert.equal(deps.projects.get('project-1').packStatus, 'ready');
});

test('启动恢复失败后浏览器工作流仍可开始新任务', async () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'pack-workflow-browser.js'),
    'utf8'
  );
  let started = false;
  const root = {
    PackWorkflowStore: { IndexedDbStore: class {} },
    PackWorkflowRuntime: {
      createPackWorkflow: () => ({
        recover: async () => { throw new Error('IndexedDB unavailable'); },
        start: async () => { started = true; return 'started'; },
        resume: async () => 'resumed',
        repairHub: async () => 'repaired',
        generateMaterials: async () => 'materials',
        cancel: async () => false,
        isBusy: () => false,
        activeProjectId: () => null,
        subscribe: () => () => {},
      }),
    },
    PackWorkflowRecovery: { reconcile: () => 0 },
    PackWorkflowGate: {},
    PackGenerator: {},
    ProjectPlatform: {},
    ContentPack: {},
    PackHarness: {},
  };
  root.globalThis = root;
  vm.runInNewContext(source, root);
  root.PackWorkflow.configure();
  await assert.rejects(root.PackWorkflow.recover(), /IndexedDB unavailable/);
  assert.equal(await root.PackWorkflow.start({ id: 'project-1' }), 'started');
  assert.equal(started, true);
});

test('浏览器入口使用显式词法依赖，不依赖 window 同名属性', async () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'pack-workflow-browser.js'),
    'utf8'
  );
  let received;
  const root = {
    PackWorkflowStore: { IndexedDbStore: class {} },
    PackWorkflowRuntime: {
      createPackWorkflow: (options) => {
        received = options;
        return {
          recover: async () => 0,
          start: async () => 'started',
          isBusy: () => false,
          activeProjectId: () => null,
          subscribe: () => () => {},
        };
      },
    },
    PackWorkflowRecovery: { reconcile: () => 0 },
    PackWorkflowGate: {},
  };
  root.globalThis = root;
  vm.runInNewContext(source, root);
  const explicit = {
    generator: { generate() {} },
    projects: { update() {} },
    contentPack: { save() {} },
    harness: { shouldRepair() {} },
  };

  root.PackWorkflow.configure(explicit);
  assert.equal(received.generator, explicit.generator);
  assert.equal(received.projects, explicit.projects);
  assert.equal(await root.PackWorkflow.start({ id: 'project-1' }), 'started');
});
