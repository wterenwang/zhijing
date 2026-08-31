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
const taskResourceBinder = require('../js/task-resource-binder');
global.TaskResourceBinder = taskResourceBinder;

let dailyLearningState = null;
try {
  dailyLearningState = require('../js/daily-learning-state');
} catch {
  // TDD seam: the first red run proves this behavior does not exist yet.
}

function loadPackHarness() {
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'pack-harness.js'), 'utf8');
  const context = vm.createContext({ console, URL });
  vm.runInContext(`${source}\n;globalThis.__PackHarness = PackHarness;`, context);
  return context.__PackHarness;
}

function loadPackGenerator(extra = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'pack-generator.js'), 'utf8');
  const context = vm.createContext({ console, URL, ...extra });
  vm.runInContext(`${source}\n;globalThis.__PackGenerator = PackGenerator;`, context);
  return context.__PackGenerator;
}

function retrievalFetchMock({ collapseSearchUrls = false } = {}) {
  const calls = { search: 0, metadata: 0, wikipedia: 0 };
  const fetch = async (url, options = {}) => {
    const target = String(url);
    if (target === '/api/search') {
      calls.search += 1;
      const suffix = collapseSearchUrls ? 'shared' : String(calls.search);
      return {
        ok: true,
        json: async () => ({
          results: [
            {
              title: `主题教程 ${suffix}`,
              url: `https://zh.wikipedia.org/wiki/topic-${suffix}`,
              snippet: '定义 方法 教程 实践',
            },
          ],
        }),
      };
    }
    if (target === '/api/meta/resolve') {
      calls.metadata += 1;
      const body = JSON.parse(options.body || '{}');
      return {
        ok: true,
        json: async () => ({
          results: (body.urls || []).map((resourceUrl) => ({
            url: resourceUrl,
            displayTitle: `可读标题 ${resourceUrl.split('/').pop()}`,
            provider: 'test',
          })),
          githubResults: [],
        }),
      };
    }
    if (target.startsWith('https://zh.wikipedia.org/w/api.php')) {
      calls.wikipedia += 1;
      return { ok: true, json: async () => [0, [], [], []] };
    }
    throw new Error(`unexpected fetch ${target}`);
  };
  return { calls, fetch };
}

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

function completeV2Pack(id = 'pack-v2') {
  const pack = completePack(id);
  const now = '2026-08-14T00:00:00.000Z';
  pack.schemaVersion = 2;
  pack.contentUpdatedAt = now;
  pack.generation = {
    provenance: {
      generator: 'PackGenerator',
      model: 'test-model',
      promptVersion: 'v2',
      generatedAt: now,
    },
  };
  pack.evaluation = { status: 'passed', evaluatedAt: now, findings: [] };
  pack.weeklyCheckpoints = [
    {
      id: 'weekly-checkpoint-1',
      week: 1,
      cumulative: true,
      deliverable: '完成一份可复核的周作品',
      rubric: ['承接每日产出', '结论回链证据'],
    },
  ];
  for (let day = 1; day <= 7; day++) {
    const sourceId = 'S1';
    const url = `https://example.edu/lesson-${day}`;
    const slug = `module-1/day-${String(day).padStart(2, '0')}`;
    pack.plan[day - 1] = {
      ...pack.plan[day - 1],
      objective: `能解释并应用主题 ${day}`,
      prerequisites: day === 1 ? [] : [`Day ${day - 1}`],
      estimatedMinutes: 45,
      citations: [sourceId],
    };
    pack.hub.chapters[slug] =
      `# Day ${day}\n\n## 今日目标\n能解释并应用主题 ${day}。\n\n` +
      `## 核心讲解\n主题 ${day} 的关键判断由课程来源支持 [S1]。\n${'识别对象、比较证据并记录取舍。'.repeat(35)}\n\n` +
      `## 操作步骤\n${'具体操作步骤包括识别对象、比较证据、记录取舍并验证结果。'.repeat(35)}\n\n` +
      `## 完整例题\n${'根据证据完成判断，记录过程并复核结果。'.repeat(35)}\n\n` +
      `## 今日任务\n完成一份可检查的主题 ${day} 分析记录。\n\n` +
      `## 完成清单\n- [ ] 复述目标\n- [ ] 完成任务\n\n` +
      `## 来源\n- [S1] [课程来源 ${day}](${url})`;
    pack.dayResources[day] = {
      resources: [
        {
          sourceId,
          title: `课程来源 ${day}`,
          url,
          publisher: 'Example University',
          retrievedAt: now,
          sourceTier: 'primary',
        },
      ],
      hub: [slug],
    };
    pack.dayExercises[day] = ['recall', 'application', 'transfer'].map((type) => ({
      type,
      objective: `主题 ${day}`,
      q: `${type}：围绕主题 ${day} 完成可检查回答`,
      rubric: ['回答包含本日对象', '结论可检查'],
      ref: `主题 ${day} 的参考答案`,
      commonMistakes: ['只复述标题'],
      feedbackMode: type === 'recall' ? 'immediate' : 'rubric',
    }));
  }
  return pack;
}

test('资料查询固定覆盖通用、权威与平台通道且不超过单日预算', () => {
  const generator = loadPackGenerator();
  const concept = generator._test.buildLearningQueryLanes('用户画像定义', {
    topic: '用户画像',
  });
  assert.deepEqual(
    JSON.parse(JSON.stringify(concept.map((row) => row.platform))),
    ['web', 'official', 'wikipedia', 'bilibili']
  );
  const practical = generator._test.buildLearningQueryLanes('需求分析工具实操', {
    topic: '需求分析工具',
    type: 'tool',
  });
  assert.deepEqual(
    JSON.parse(JSON.stringify(practical.map((row) => row.platform))),
    ['web', 'official', 'github', 'bilibili']
  );
  assert.ok(concept.length <= 4);
  assert.ok(practical.length <= 4);
});

test('30 天基础资料检索按周两路召回且持久池跨微批次复用', async () => {
  const mock = retrievalFetchMock();
  const generator = loadPackGenerator({
    fetch: mock.fetch,
    AiReview: { getApiKey: () => 'test-key', chat: async () => '{"days":[]}' },
  });
  const plan = Array.from({ length: 30 }, (_, index) => ({
    day: index + 1,
    week: `第${Math.ceil((index + 1) / 7)}周`,
    topic: `概念主题 ${index + 1}`,
  }));
  const pack = { id: 'weekly-pack', meta: { generation: {} }, plan };
  const meta = { industry: '教育', role: '产品经理', days: 30 };
  for (let week = 1; week <= 5; week++) {
    const weekPlan = plan.filter((row) => Math.ceil(row.day / 7) === week);
    await generator._test.ensureWeeklyResourcePool(pack, meta, weekPlan);
    await generator._test.ensureWeeklyResourcePool(pack, meta, weekPlan);
  }
  assert.equal(mock.calls.search, 10);
  assert.equal(Object.keys(pack.meta.generation.retrievalPools).length, 5);
  assert.ok(pack.meta.generation.retrievalPools['1'].cacheHits >= 1);
  assert.deepEqual(
    {
      deepseekSearchCalls: pack.meta.generation.retrievalStats.deepseekSearchCalls,
      weeklyPoolBuilds: pack.meta.generation.retrievalStats.weeklyPoolBuilds,
      weeklyPoolHits: pack.meta.generation.retrievalStats.weeklyPoolHits,
      targetedSearchCalls: pack.meta.generation.retrievalStats.targetedSearchCalls,
    },
    {
      deepseekSearchCalls: 10,
      weeklyPoolBuilds: 5,
      weeklyPoolHits: 5,
      targetedSearchCalls: 0,
    }
  );
});

test('周候选池仅在过期或课表主题变化时失效', async () => {
  const mock = retrievalFetchMock();
  const generator = loadPackGenerator({
    fetch: mock.fetch,
    AiReview: { getApiKey: () => 'test-key', chat: async () => '{"days":[]}' },
  });
  const plan = Array.from({ length: 7 }, (_, index) => ({
    day: index + 1,
    week: '第1周',
    topic: `基础概念 ${index + 1}`,
  }));
  const pack = { id: 'expiry-pack', meta: { generation: {} }, plan };
  const meta = { industry: '教育', role: '产品经理', days: 7 };
  await generator._test.ensureWeeklyResourcePool(pack, meta, plan);
  await generator._test.ensureWeeklyResourcePool(pack, meta, plan);
  assert.equal(mock.calls.search, 2);
  pack.meta.generation.retrievalPools['1'].fetchedAt = '2020-01-01T00:00:00.000Z';
  await generator._test.ensureWeeklyResourcePool(pack, meta, plan);
  assert.equal(mock.calls.search, 4);
  const changed = plan.map((row, index) =>
    index === 0 ? { ...row, topic: '变化后的主题' } : row
  );
  pack.plan = changed;
  await generator._test.ensureWeeklyResourcePool(pack, meta, changed);
  assert.equal(mock.calls.search, 6);
});

test('缺口日最多定向补搜一次并把候选合并回周池', async () => {
  const mock = retrievalFetchMock({ collapseSearchUrls: true });
  const generator = loadPackGenerator({
    fetch: mock.fetch,
    AiReview: { getApiKey: () => 'test-key', chat: async () => '{"days":[]}' },
  });
  const plan = [{ day: 1, week: '第1周', topic: '基础概念' }];
  const pack = { id: 'gap-pack', meta: { generation: {} }, plan };
  const meta = { industry: '教育', role: '产品经理', days: 1 };
  await generator._test.curateDayResourceLinks(pack, meta, plan);
  await generator._test.curateDayResourceLinks(pack, meta, plan);
  assert.equal(mock.calls.search, 3);
  assert.equal(pack.meta.generation.retrievalPools['1'].targetedDays['1'], true);
});

test('资料排序拒绝平台搜索页并只接受具体仓库与视频页', () => {
  const generator = loadPackGenerator();
  const hits = generator._test.rankAndFilterSearchHits(
    [
      { title: '需求分析教程仓库', url: 'https://github.com/acme/requirements-guide', snippet: '教程 方法 文档' },
      { title: 'GitHub 搜索', url: 'https://github.com/search?q=requirements', snippet: '教程' },
      { title: '需求分析系统讲解', url: 'https://www.bilibili.com/video/BV1234567890', snippet: '教程 方法' },
      { title: 'B站搜索', url: 'https://search.bilibili.com/all?keyword=x', snippet: '教程' },
    ],
    { learnWhat: '需求分析教程', topic: '需求分析' }
  );
  assert.deepEqual(
    Array.from(hits, (row) => row.platform).sort(),
    ['bilibili', 'github']
  );
});

test('资料组合优先可信来源并保持发布者与用途互补', () => {
  const generator = loadPackGenerator();
  const selected = generator._test.selectSourcePortfolio(
    [
      { title: '百科定义', url: 'https://zh.wikipedia.org/wiki/用户画像', snippet: '定义 方法' },
      { title: '用户画像实践仓库', url: 'https://github.com/acme/persona-guide', snippet: '用户画像教程 模板 方法' },
      { title: '用户画像普通教程', url: 'https://example.com/persona-tutorial', snippet: '用户画像教程 方法' },
      { title: '用户画像同站重复', url: 'https://example.com/persona-2', snippet: '用户画像教程 方法' },
    ],
    { learnWhat: '用户画像定义与方法', topic: '用户画像', limit: 3 }
  );
  assert.equal(selected[0].sourceTier, 'high');
  assert.equal(new Set(selected.map((row) => new URL(row.url).hostname)).size, 3);
});

test('虚构阅读任务会被删除，真实资料任务只能绑定搜索原标题', () => {
  const hallucinated = taskResourceBinder.bindDay({
    dayPlan: {
      day: 1,
      topic: 'AI 产品需求',
      tasks: ['阅读《AI产品经理的生存指南》第一章', '整理需求清单', '闭卷复述判断'],
    },
    resources: [],
    hubSlug: 'module-1/day-01',
  });
  assert.doesNotMatch(hallucinated.tasks.join(' '), /生存指南/);

  const bound = taskResourceBinder.bindDay({
    dayPlan: {
      day: 1,
      topic: 'AI 产品需求',
      tasks: ['阅读《真实需求分析指南》', '整理需求清单', '闭卷复述判断'],
    },
    resources: [
      {
        sourceId: 'S1',
        title: '真实需求分析指南',
        url: 'https://example.edu/guide',
        type: 'article',
      },
    ],
    hubSlug: 'module-1/day-01',
  });
  assert.match(bound.tasks.join(' '), /真实需求分析指南」（S1）/);
  assert.equal(bound.taskBindings.find((row) => row.kind === 'resource').sourceId, 'S1');
});

test('最终门禁拒绝没有真实来源绑定的具名阅读任务', () => {
  const pack = completeV2Pack('pack-unbound-task');
  pack.plan[0].tasks = ['阅读《虚构书名》第一章', '整理清单', '闭卷复述'];
  const result = gateApi.evaluateDay(pack, 1);
  assert.equal(result.passed, false);
  assert.ok(result.findings.some((finding) => finding.code === 'task.reference.invalid'));
});

test('只有 contextual 来源时允许学习并给出可解释的改进建议', () => {
  const pack = completeV2Pack('pack-contextual-only');
  pack.dayResources[1].resources[0].sourceTier = 'contextual';
  const result = gateApi.evaluateDay(pack, 1);
  assert.equal(result.passed, true);
  assert.ok(result.findings.some((finding) => finding.code === 'source.quality.floor'));
  assert.ok(result.advisoryFindings.some((finding) => finding.code === 'source.quality.floor'));
});

test('微批次在逐日验收前会把任务重绑到实际日课章节', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'pack-generator.js'), 'utf8');
  const section = source.slice(
    source.indexOf('async function processLessonMicroBatches'),
    source.indexOf('function hasCompleteExtras')
  );
  const bindAt = section.indexOf('TaskResourceBinder.bindPack(pack)');
  const evaluateAt = section.indexOf('decisions = batchDays.map((day) => evaluateLessonDay(pack, day))', bindAt);
  assert.ok(bindAt >= 0);
  assert.ok(evaluateAt > bindAt);
});

test('任务 UI 只从绑定后的来源生成链接', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(source, /binding\?\.kind === 'resource'[\s\S]{0,500}resource\?\.url/);
  assert.match(source, /binding\?\.kind === 'hub'[\s\S]{0,250}data-hub-slug/);
});

test('两套搜索代理都要求严格遵循站点限制并禁止改写链接', () => {
  const electronSource = fs.readFileSync(path.join(__dirname, '..', 'electron', 'server.js'), 'utf8');
  const pythonSource = fs.readFileSync(path.join(__dirname, '..', 'ai-proxy.py'), 'utf8');
  for (const source of [electronSource, pythonSource]) {
    assert.match(source, /Honor every site: restriction exactly/);
    assert.match(source, /Do not invent or rewrite URLs or titles/);
  }
});

test('双代理暴露免密元数据契约并限制 URL 数、响应体与公网访问', async () => {
  const electronSource = fs.readFileSync(path.join(__dirname, '..', 'electron', 'server.js'), 'utf8');
  const pythonSource = fs.readFileSync(path.join(__dirname, '..', 'ai-proxy.py'), 'utf8');
  for (const source of [electronSource, pythonSource]) {
    assert.match(source, /\/api\/meta\/resolve/);
    assert.match(source, /最多解析 10 个 URL/);
    assert.match(source, /512 \* 1024/);
    assert.match(source, /重定向次数过多/);
    assert.match(source, /拒绝访问非公网地址/);
    assert.match(source, /displayTitle/);
  }
  assert.match(pythonSource, /ThreadingHTTPServer\(\("127\.0\.0\.1", PORT\)/);
  const server = require('../electron/server');
  assert.equal(server._test.isPrivateIp('127.0.0.1'), true);
  assert.equal(server._test.isPrivateIp('192.168.1.1'), true);
  assert.equal(server._test.isPrivateIp('8.8.8.8'), false);
  await assert.rejects(server._test.assertPublicUrl('http://127.0.0.1/private'), /非公网/);
});

test('GitHub 资源优先使用内容语义标题并保留确定性回退', () => {
  const server = require('../electron/server');
  const repo = server._test.githubParts('https://github.com/acme/course-kit');
  const file = server._test.githubParts(
    'https://github.com/acme/course-kit/blob/main/docs/guide.md'
  );
  assert.equal(server._test.githubDisplayTitle(repo, 'course-kit'), 'course-kit · GitHub 项目');
  assert.equal(server._test.githubDisplayTitle(file, 'course-kit'), 'course-kit · guide.md');
  assert.equal(
    server._test.githubDisplayTitle(file, 'course-kit', '# 如何撰写 AI 产品需求文档\n\n正文'),
    '如何撰写 AI 产品需求文档（GitHub）'
  );
  assert.equal(
    server._test.githubDisplayTitle(repo, 'course-kit', '# AI 产品经理实战教程\n\n正文'),
    'AI 产品经理实战教程（GitHub）'
  );
  assert.equal(
    server._test.githubDisplayTitle(repo, 'course-kit', '# course-kit\n\n正文', '面向初学者的 AI 产品需求文档教程'),
    '面向初学者的 AI 产品需求文档教程（GitHub）'
  );
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const binder = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'task-resource-binder.js'),
    'utf8'
  );
  assert.match(html, /r\.displayTitle \|\| r\.originalTitle \|\| r\.title/);
  assert.match(binder, /resource\.displayTitle \|\| resource\.originalTitle \|\| resource\.title/);
});

test('继续补全会免搜索刷新旧课包中的 GitHub 机械标题', async () => {
  const calls = { metadata: 0 };
  const generator = loadPackGenerator({
    fetch: async (url, options = {}) => {
      assert.equal(url, '/api/meta/resolve');
      calls.metadata += 1;
      const body = JSON.parse(options.body);
      return {
        ok: true,
        json: async () => ({
          results: body.urls.map((resourceUrl) => ({
            url: resourceUrl,
            displayTitle: '如何撰写 AI 产品需求文档（GitHub）',
            provider: 'test',
          })),
          githubResults: [],
        }),
      };
    },
  });
  const resource = {
    url: 'https://github.com/acme/course-kit/blob/main/docs/guide.md',
    title: 'acme/course-kit',
    originalTitle: 'acme/course-kit',
    displayTitle: 'course-kit · guide.md',
    evidence: { displayTitle: 'course-kit · guide.md' },
  };
  const pack = {
    meta: {
      generation: {
        retrievalStats: {},
        retrievalPools: {
          1: { hits: [{ ...resource }] },
        },
      },
    },
    dayResources: {
      1: { resources: [resource] },
    },
  };

  await generator._test.refreshCachedGithubTitles(pack);

  assert.equal(calls.metadata, 1);
  assert.equal(
    pack.dayResources[1].resources[0].displayTitle,
    '如何撰写 AI 产品需求文档（GitHub）'
  );
  assert.equal(
    pack.dayResources[1].resources[0].evidence.displayTitle,
    '如何撰写 AI 产品需求文档（GitHub）'
  );
  assert.equal(
    pack.meta.generation.retrievalPools[1].hits[0].displayTitle,
    '如何撰写 AI 产品需求文档（GitHub）'
  );
  assert.equal(pack.meta.generation.retrievalStats.deepseekSearchCalls, 0);
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(html, /PackGenerator\.refreshGithubTitlesForPack\(project\.packId\)/);
});

test('元数据抓取使用独立预算且不会挤占 DeepSeek 工具调用', () => {
  const harness = loadPackHarness();
  harness.beginSession({ days: 7 });
  for (let index = 0; index < 30; index++) {
    assert.equal(harness.guardTool('api.meta.resolve', { urls: 1 }).ok, true);
  }
  assert.equal(harness.guardTool('api.meta.resolve', { urls: 1 }).code, 'META_BUDGET');
  assert.equal(harness.guardTool('deepseek.chat', {}).ok, true);
  assert.equal(harness.snapshot().toolCalls, 1);
  harness.endSession('test');
});

test('30 天完整生成不会在第 201 次工具调用被固定预算截断', () => {
  const harness = loadPackHarness();
  harness.beginSession({ days: 30 });
  for (let index = 0; index < 200; index++) {
    assert.equal(harness.guardTool('api.search', { query: `q-${index}` }).ok, true);
  }
  const nextLlmCall = harness.guardTool('deepseek.chat', { max_tokens: 1000 });
  assert.equal(nextLlmCall.ok, true);
  assert.ok(harness.snapshot().budgets.maxToolCallsPerJob >= 500);
  assert.ok(harness.snapshot().budgets.wallClockMs >= 90 * 60 * 1000);
  harness.endSession('test');
});

test('Harness 按阶段聚合 AI 耗时、重试、token 与缓存命中', () => {
  const harness = loadPackHarness();
  harness.beginSession({ days: 30 });
  harness.recordAiCall({
    stage: 'hub.write',
    durationMs: 1200,
    queueMs: 75,
    attempts: 2,
    usage: {
      prompt_tokens: 800,
      completion_tokens: 400,
      prompt_cache_hit_tokens: 600,
      prompt_cache_miss_tokens: 200,
    },
  });
  harness.recordAiCall({
    stage: 'hub.write',
    durationMs: 800,
    attempts: 1,
    usage: { prompt_tokens: 500, completion_tokens: 300 },
  });
  const metrics = harness.snapshot().aiMetrics;
  assert.equal(metrics.calls, 2);
  assert.equal(metrics.durationMs, 2000);
  assert.equal(metrics.queueMs, 75);
  assert.equal(metrics.retries, 1);
  assert.equal(metrics.promptTokens, 1300);
  assert.equal(metrics.completionTokens, 700);
  assert.equal(metrics.cacheHitTokens, 600);
  assert.equal(metrics.cacheMissTokens, 200);
  assert.equal(metrics.stages['hub.write'].calls, 2);
  harness.endSession('test');
});

test('AiReview 保持文本返回并通过回调暴露非敏感 usage 指标', async () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'ai-review.js'), 'utf8');
  let received;
  const context = vm.createContext({
    console,
    AbortController,
    setTimeout,
    clearTimeout,
    localStorage: {
      getItem: () => 'sk-test-only',
      setItem: () => {},
      removeItem: () => {},
    },
    document: { documentElement: { dataset: {} } },
    fetch: async () => ({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          choices: [{ message: { content: '{"ok":true}' } }],
          usage: {
            prompt_tokens: 90,
            completion_tokens: 10,
            prompt_cache_hit_tokens: 70,
            prompt_cache_miss_tokens: 20,
          },
        }),
    }),
  });
  vm.runInContext(`${source}\n;globalThis.__AiReview = AiReview;`, context);
  context.__AiReview.checkProxy = async () => ({ ok: true });
  const text = await context.__AiReview.chat({
    messages: [{ role: 'user', content: 'test' }],
    onMetrics: (metrics) => {
      received = metrics;
    },
  });
  assert.equal(text, '{"ok":true}');
  assert.equal(received.attempts, 1);
  assert.equal(received.usage.prompt_cache_hit_tokens, 70);
  assert.ok(received.durationMs >= 0);
});

test('AiReview 区分认证、余额、网络和超时并统一脱敏', async () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'ai-review.js'), 'utf8');
  const secret = 'sk-very-secret-value-1234567890';
  const context = vm.createContext({
    console,
    AbortController,
    setTimeout,
    clearTimeout,
    localStorage: {
      getItem: () => secret,
      setItem: () => {},
      removeItem: () => {},
    },
    document: { documentElement: { dataset: {} } },
    fetch: async () => {
      throw new TypeError(`fetch failed for Bearer ${secret}`);
    },
  });
  vm.runInContext(`${source}\n;globalThis.__AiReview = AiReview;`, context);
  const ai = context.__AiReview;
  assert.equal(ai.normalizeUpstreamError(401, 'invalid api key').code, 'AUTH');
  assert.equal(ai.normalizeUpstreamError(402, 'insufficient balance').code, 'BALANCE');
  assert.equal(ai.normalizeUpstreamError(504, 'request timeout').code, 'UPSTREAM_TIMEOUT');
  assert.equal(ai.normalizeUpstreamError(500, 'fetch failed').code, 'NETWORK');
  const sanitized = ai.redactSensitive(`Authorization: Bearer ${secret}; apiKey=${secret}`);
  assert.doesNotMatch(sanitized, new RegExp(secret));
  assert.match(sanitized, /\[REDACTED\]/);

  ai.checkProxy = async () => ({ ok: true });
  await assert.rejects(
    ai.chat({ messages: [{ role: 'user', content: 'network' }], timeoutMs: 50 }),
    (error) => error.code === 'NETWORK' && !String(error.message).includes(secret)
  );
});

test('桌面代理返回上游错误前会移除完整 API Key', () => {
  const server = require('../electron/server');
  const secret = 'sk-server-secret-1234567890';
  const payload = server._test.safeErrorPayload(
    new Error(`Authorization: Bearer ${secret}; apiKey=${secret}`)
  );
  assert.doesNotMatch(JSON.stringify(payload), new RegExp(secret));
  assert.match(payload.error.message, /\[REDACTED\]/);
});

test('JSON Output 只显式透传 json_object 且两种本地代理保持一致', async () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'ai-review.js'), 'utf8');
  let requestBody;
  const context = vm.createContext({
    console,
    AbortController,
    setTimeout,
    clearTimeout,
    localStorage: {
      getItem: () => 'sk-test-only',
      setItem: () => {},
      removeItem: () => {},
    },
    document: { documentElement: { dataset: {} } },
    fetch: async (_url, options) => {
      requestBody = JSON.parse(options.body);
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ choices: [{ message: { content: '{"ok":true}' } }] }),
      };
    },
  });
  vm.runInContext(`${source}\n;globalThis.__AiReview = AiReview;`, context);
  context.__AiReview.checkProxy = async () => ({ ok: true });
  await context.__AiReview.chat({
    messages: [{ role: 'user', content: 'json test' }],
    responseFormat: { type: 'json_object' },
  });
  assert.deepEqual(requestBody.responseFormat, { type: 'json_object' });

  const electronProxy = fs.readFileSync(
    path.join(__dirname, '..', 'electron', 'server.js'),
    'utf8'
  );
  const pythonProxy = fs.readFileSync(path.join(__dirname, '..', 'ai-proxy.py'), 'utf8');
  assert.match(electronProxy, /response_format\s*=\s*\{\s*type:\s*'json_object'/);
  assert.match(pythonProxy, /upstream\["response_format"\]\s*=\s*\{"type":\s*"json_object"\}/);
});

test('PackGenerator 仅为对象契约开启 JSON Output，顶层数组调用保持宽松解析', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'pack-generator.js'),
    'utf8'
  );
  assert.match(source, /stage:\s*'outline\.outcomes',\s*jsonMode:\s*true/);
  assert.match(source, /stage:\s*'glossary\.core',[\s\S]{0,80}jsonMode:\s*true/);
  assert.match(source, /stage:\s*'plan\.days'\s*\}/);
  assert.doesNotMatch(source, /stage:\s*'plan\.days',\s*jsonMode:\s*true/);
});

test('日课设计与写作共享不含动态行业的稳定质量前缀', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'pack-generator.js'),
    'utf8'
  );
  const context = vm.createContext({ console, URL });
  vm.runInContext(`${source}\n;globalThis.__PackGenerator = PackGenerator;`, context);
  const prefix = context.__PackGenerator._test.HUB_STABLE_SYSTEM_PREFIX;
  assert.match(prefix, /日课公约/);
  assert.match(prefix, /领域深度公约/);
  assert.doesNotMatch(prefix, /\$\{meta\./);
  assert.match(source, /const system = `\$\{HUB_STABLE_SYSTEM_PREFIX\}[\s\S]*当前职责：日课教学设计师/);
  assert.match(source, /const system = `\$\{HUB_STABLE_SYSTEM_PREFIX\}[\s\S]*当前职责：领域日课作者/);
});

test('续跑时复用完整日课导航而不重新请求标题润色', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'pack-generator.js'),
    'utf8'
  );
  const context = vm.createContext({ console });
  vm.runInContext(`${source}\n;globalThis.__PackGenerator = PackGenerator;`, context);
  const plan = [1, 2].map((day) => ({
    day,
    topic: `新主题 ${day}`,
    phase: '阶段一',
    week: '第一周',
    tasks: [],
  }));
  const pack = {
    hub: {
      title: '保留标题',
      navigation: [
        {
          id: 'module-1',
          title: '已润色模块',
          items: [
            { slug: 'module-1/day-01', title: '旧标题一', days: '1' },
            { slug: 'module-1/day-02', title: '旧标题二', days: '2' },
          ],
        },
      ],
    },
  };
  const reused = context.__PackGenerator._test.reusableHubStructure(
    pack,
    { title: '新标题', industry: '测试', days: 2 },
    { weekThemes: [] },
    plan
  );
  assert.equal(reused.title, '保留标题');
  assert.equal(reused.modules[0].title, '已润色模块');
  assert.equal(reused.modules[0].chapters[0].title, '旧标题一');
});

test('渐进可学天数只计算正文、资料和三类练习均完整的连续 Day', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'pack-generator.js'),
    'utf8'
  );
  const context = vm.createContext({ console, URL });
  vm.runInContext(`${source}\n;globalThis.__PackGenerator = PackGenerator;`, context);
  const pack = completeV2Pack('pack-progressive-ready');
  assert.equal(context.__PackGenerator._test.contiguousReadyThroughDay(pack, 7), 7);
  const dayOneResources = pack.dayResources[1];
  pack.dayResources[1] = { resources: [] };
  assert.equal(context.__PackGenerator._test.contiguousReadyThroughDay(pack, 7), 0);
  pack.dayResources[1] = dayOneResources;
  pack.hub.chapters['module-1/day-04'] = '# Day 4\n\n> 本章正在后台准备中';
  assert.equal(context.__PackGenerator._test.contiguousReadyThroughDay(pack, 7), 3);
  pack.hub.chapters['module-1/day-04'] =
    '# Day 4\n完整正文包含工作场景、判断规则、例题步骤与来源回链 [S1]。\n\n' +
    `${'步骤 1 识别对象与约束，步骤 2 比较证据，步骤 3 记录取舍并验证结果。'.repeat(80)}\n\n` +
    '## 来源\n- [S1] [课程来源 4](https://example.edu/lesson-4)';
  pack.dayExercises[5] = [{ q: '只有一道' }];
  assert.equal(context.__PackGenerator._test.contiguousReadyThroughDay(pack, 7), 4);
});

test('filling 状态接受 DAY_READY 并只推进 readyThroughDay', () => {
  const actor = createActor(machineApi.machine, {
    input: {
      jobId: 'job-progressive',
      projectId: 'project-progressive',
      operation: 'resume',
      packId: 'pack-progressive',
      readyThroughDay: 3,
    },
  }).start();
  actor.send({ type: 'RESUME', operation: 'resume' });
  actor.send({
    type: 'DAY_READY',
    packId: 'pack-progressive',
    readyThroughDay: 6,
    at: '2026-08-17T00:00:00.000Z',
  });
  const snapshot = actor.getSnapshot();
  assert.equal(snapshot.value, 'filling');
  assert.equal(snapshot.context.readyThroughDay, 6);
});

test('正文来源编号必须回链到同编号的实际 URL', () => {
  const pack = completeV2Pack('pack-citation-url-mismatch');
  pack.hub.chapters['module-1/day-01'] =
    '# Day 1\n主题 1 的关键判断由课程来源支持 [S1]。\n\n' +
    '## 来源\n- [S1] [错误来源](https://wrong.example/lesson-1)';
  const result = gateApi.evaluate(pack, { shouldRepair: () => false });
  assert.deepEqual(result.missingCitationDays, [1]);
  assert.equal(result.passed, false);
});

test('最终门接受语义等价的来源链接格式', () => {
  const pack = completeV2Pack('pack-citation-equivalent-format');
  pack.hub.chapters['module-1/day-01'] = pack.hub.chapters['module-1/day-01'].replace(
    '- [S1] [课程来源 1](https://example.edu/lesson-1)',
    '- [S1](https://example.edu/lesson-1) 课程来源 1'
  );
  const result = gateApi.evaluate(pack, { shouldRepair: () => false });
  assert.deepEqual(result.missingCitationDays, []);
  assert.equal(result.passed, true);
});

test('概念教学可由课表引用和标准来源段回链，不强制伪造正文引用', () => {
  const pack = completeV2Pack('pack-conceptual-citation');
  pack.hub.chapters['module-1/day-01'] = pack.hub.chapters['module-1/day-01'].replace(
    '支持 [S1]',
    '支持'
  );
  const result = gateApi.evaluate(pack, { shouldRepair: () => false });
  assert.deepEqual(result.missingCitationDays, []);
});

test('包含精确事实的正文仍必须提供内联引用', () => {
  const pack = completeV2Pack('pack-precise-claim-citation');
  pack.hub.chapters['module-1/day-01'] = pack.hub.chapters['module-1/day-01']
    .replace('支持 [S1]', '支持')
    .replace('具体操作步骤', '2026 年市场规模增长 20%。具体操作步骤');
  const result = gateApi.evaluate(pack, { shouldRepair: () => false });
  assert.deepEqual(result.missingCitationDays, [1]);
  assert.equal(result.passed, false);
});

test('生成后本地重建唯一且标准化的来源段', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'pack-generator.js'),
    'utf8'
  );
  const context = vm.createContext({ console, URL });
  vm.runInContext(`${source}\n;globalThis.__PackGenerator = PackGenerator;`, context);
  const normalize = context.__PackGenerator._test.canonicalizeLessonSourceSection;
  const markdown =
    '# Day 1\n\n正文使用证据 [S1]。\n\n## 来源\n\n- [S1](https://old.example) 旧格式';
  const normalized = normalize(markdown, [
    {
      id: 'S1',
      title: '正式来源',
      url: 'https://example.edu/source',
      trustTier: 'primary',
    },
  ]);
  assert.match(
    normalized,
    /## 来源\n\n- \[S1\] \[正式来源\]\(https:\/\/example\.edu\/source\)/
  );
  assert.doesNotMatch(normalized, /old\.example/);
  assert.equal((normalized.match(/## 来源/g) || []).length, 1);
});

test('本地引用整理会删除虚构编号并为可验证精确事实绑定真实来源', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'pack-generator.js'),
    'utf8'
  );
  const context = vm.createContext({ console, URL });
  vm.runInContext(`${source}\n;globalThis.__PackGenerator = PackGenerator;`, context);
  const normalize = context.__PackGenerator._test.normalizeLessonEvidenceCitations;
  const normalized = normalize(
    '# Day 1\n\n市场渗透率增长 20% [S9]。\n\n## 来源\n- [S9](https://wrong.example)',
    [
      {
        id: 'S1',
        title: '正式报告',
        url: 'https://example.edu/report',
        snippet: '市场渗透率增长 20%',
        trustTier: 'primary',
      },
    ]
  );
  assert.doesNotMatch(normalized, /\[S9\]/);
  assert.match(normalized, /市场渗透率增长 20%.*\[S1\]/);
  assert.match(normalized, /- \[S1\] \[正式报告\]\(https:\/\/example\.edu\/report\)/);
});

test('无法由来源核验的精确数字会被降级而不是保留虚构引用', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'pack-generator.js'),
    'utf8'
  );
  const context = vm.createContext({ console, URL });
  vm.runInContext(`${source}\n;globalThis.__PackGenerator = PackGenerator;`, context);
  const normalize = context.__PackGenerator._test.normalizeLessonEvidenceCitations;
  const normalized = normalize(
    '# Day 1\n\n市场渗透率增长 99% [S9]。',
    [
      {
        id: 'S1',
        title: '正式报告',
        url: 'https://example.edu/report',
        snippet: '市场渗透率增长 20%',
        trustTier: 'primary',
      },
    ]
  );
  assert.doesNotMatch(normalized, /\[S9\]|99%/);
  assert.match(normalized, /具体数值需查官方或原始资料核实/);
});

test('本地规范后内部质量门不会把等价格式误判为需要重写', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'pack-generator.js'),
    'utf8'
  );
  const context = vm.createContext({ console, URL });
  vm.runInContext(`${source}\n;globalThis.__PackGenerator = PackGenerator;`, context);
  const generator = context.__PackGenerator;
  const pack = completeV2Pack('pack-local-citation-normalization');
  pack.hub.chapters['module-1/day-01'] = pack.hub.chapters['module-1/day-01']
    .replace('支持 [S1]', '支持')
    .replace(
      '- [S1] [课程来源 1](https://example.edu/lesson-1)',
      '- [S1](https://example.edu/lesson-1) 课程来源 1'
    );
  generator.runPackQualityGate(pack, { phases: [], weekThemes: [] }, {
    rewritePhases: false,
  });
  assert.deepEqual(
    Array.from(generator._test.citationBacklinkMissingSlugs(pack)),
    []
  );
  assert.match(
    pack.hub.chapters['module-1/day-01'],
    /- \[S1\] \[课程来源 1\]\(https:\/\/example\.edu\/lesson-1\)/
  );
});

test('最终门会单独报告正文虚构的来源编号', () => {
  const pack = completeV2Pack('pack-invalid-inline-source-id');
  pack.hub.chapters['module-1/day-01'] = pack.hub.chapters['module-1/day-01'].replace(
    '支持 [S1]',
    '支持 [S9]'
  );
  const result = gateApi.evaluate(pack, { shouldRepair: () => false });
  assert.deepEqual(result.invalidCitationIdDays, [1]);
  assert.deepEqual(result.missingInlineCitationDays, []);
  assert.equal(result.passed, false);
});

test('一次生成结束时本地整理足以消除引用类修复', () => {
  const pack = completeV2Pack('pack-one-pass-citation-normalization');
  pack.hub.chapters['module-1/day-01'] = pack.hub.chapters['module-1/day-01']
    .replace('支持 [S1]', '支持 [S9]')
    .replace('具体操作步骤', '2026 年市场规模增长 99%。具体操作步骤');
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'pack-generator.js'),
    'utf8'
  );
  const context = vm.createContext({ console, URL });
  vm.runInContext(`${source}\n;globalThis.__PackGenerator = PackGenerator;`, context);
  context.__PackGenerator._test.normalizePackLessonSourceSections(pack);
  const result = gateApi.evaluate(pack, { shouldRepair: () => false });
  assert.deepEqual(result.missingCitationDays, []);
  assert.equal(result.passed, true);
  assert.doesNotMatch(pack.hub.chapters['module-1/day-01'], /\[S9\]|99%/);
});

test('正文生成不再用泛化 S1 提示伪装逐句证据引用', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'pack-generator.js'),
    'utf8'
  );
  assert.doesNotMatch(source, /证据提示：本课的事实性说明以来源 \[S1\]/);
});

test('首批与后续日课都必须在来源保存后再生成正文', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'pack-generator.js'),
    'utf8'
  );
  const generateSection = source.slice(
    source.indexOf('async function generate(meta'),
    source.indexOf('function outlineFromPack')
  );
  const skeletonMaterialsAt = generateSection.indexOf('await attachDayMaterials(');
  const skeletonSaveAt = generateSection.indexOf('ContentPack.save(pack)', skeletonMaterialsAt);
  const skeletonHubAt = generateSection.indexOf('await attachHub(', skeletonMaterialsAt);
  assert.ok(skeletonMaterialsAt >= 0);
  assert.ok(skeletonSaveAt > skeletonMaterialsAt);
  assert.ok(skeletonHubAt > skeletonSaveAt);
  assert.doesNotMatch(generateSection, /Promise\.all\(\[\s*attachDayMaterials/);

  const batchSection = source.slice(
    source.indexOf('async function processLessonMicroBatches'),
    source.indexOf('function hasCompleteExtras')
  );
  const materialsAt = batchSection.indexOf('await attachDayMaterials(');
  const sourceCheckpointAt = batchSection.indexOf('ContentPack.save(pack)', materialsAt);
  const hubAt = batchSection.indexOf('await attachHub(', materialsAt);
  assert.ok(materialsAt >= 0);
  assert.ok(sourceCheckpointAt > materialsAt);
  assert.ok(hubAt > sourceCheckpointAt);
  assert.doesNotMatch(batchSection, /Promise\.all\(\[materialsPromise,\s*hubPromise\]\)/);
});

test('课包正文按三天微批次逐批闭环而不是整包生成后修复', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'pack-generator.js'),
    'utf8'
  );
  const context = vm.createContext({ console, URL });
  vm.runInContext(`${source}\n;globalThis.__PackGenerator = PackGenerator;`, context);
  const ranges = context.__PackGenerator._test.lessonMicroBatchRanges(1, 8);
  assert.deepEqual(
    JSON.parse(JSON.stringify(ranges.map((range) => ({ start: range.start, end: range.end })))),
    [
      { start: 1, end: 3 },
      { start: 4, end: 6 },
      { start: 7, end: 8 },
    ]
  );
  const fillSection = source.slice(
    source.indexOf('async function fillPackRemainder'),
    source.indexOf('/** 对已有 partial 包继续补全 */')
  );
  assert.match(fillSection, /await processLessonMicroBatches\(/);
  assert.doesNotMatch(fillSection, /先锁定全部每日来源与练习/);
});

test('续跑仅复用与当前资料 URL 完全一致的日课正文', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'pack-generator.js'),
    'utf8'
  );
  const context = vm.createContext({ console, URL });
  vm.runInContext(`${source}\n;globalThis.__PackGenerator = PackGenerator;`, context);
  const pack = completeV2Pack('pack-source-bound-resume');
  const helper = context.__PackGenerator._test.hasSourceBoundHub;
  assert.equal(helper(pack, 1, 7), true);
  pack.dayResources[4].resources[0].url = 'https://example.edu/replaced-source-4';
  assert.equal(helper(pack, 1, 7), false);
});

test('最终门修复计划按来源、练习、正文和术语问题定点分流', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'pack-generator.js'),
    'utf8'
  );
  const context = vm.createContext({ console });
  vm.runInContext(`${source}\n;globalThis.__PackGenerator = PackGenerator;`, context);
  const planRepair = context.__PackGenerator._test.repairPlanFromGate;

  const sourceOnly = planRepair(
    { invalidSourceDays: [4], issues: ['来源元数据无效'] },
    { glossaryEnough: true, glossaryKindCount: 2 }
  );
  assert.deepEqual([...sourceOnly.materialsDays], [4]);
  assert.deepEqual([...sourceOnly.hubDays], [4]);
  assert.equal(sourceOnly.comprehensive, false);

  const exerciseOnly = planRepair(
    { invalidExerciseDays: [2], issues: ['练习反馈契约不完整'] },
    { glossaryEnough: true, glossaryKindCount: 2 }
  );
  assert.deepEqual([...exerciseOnly.materialsDays], [2]);
  assert.deepEqual([...exerciseOnly.hubDays], []);

  const citationAndGlossary = planRepair(
    { missingCitationDays: [5], issues: ['正文引用无法回链'] },
    { glossaryEnough: false, glossaryKindCount: 1 }
  );
  assert.deepEqual([...citationAndGlossary.hubDays], [5]);
  assert.equal(citationAndGlossary.needsGlossary, true);
  assert.equal(citationAndGlossary.comprehensive, false);
});

test('来源修复仅在最终 URL 集变化时把对应正文加入重写范围', () => {
  const generator = loadPackGenerator();
  const signature = generator._test.sourceUrlSignatureFromPack;
  const before = {
    dayResources: {
      1: {
        resources: [
          { url: 'https://example.edu/b' },
          { url: 'https://example.edu/a' },
        ],
      },
    },
  };
  const reordered = {
    dayResources: {
      1: {
        resources: [
          { url: 'https://example.edu/a' },
          { url: 'https://example.edu/b' },
        ],
      },
    },
  };
  const changed = {
    dayResources: { 1: { resources: [{ url: 'https://example.edu/c' }] } },
  };
  assert.equal(signature(before, 1), signature(reordered, 1));
  assert.notEqual(signature(before, 1), signature(changed, 1));
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'pack-generator.js'),
    'utf8'
  );
  const repairSection = source.slice(
    source.indexOf('async function repairFinalGateForPack'),
    source.indexOf('return {', source.indexOf('async function repairFinalGateForPack'))
  );
  assert.match(repairSection, /changedSourceDays/);
  assert.match(repairSection, /repairPlan\.hubDays = uniqueDays\(repairPlan\.nonSourceHubDays, changedSourceDays\)/);
});

test('未知质量问题或课表结构问题继续使用综合修复兜底', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'pack-generator.js'),
    'utf8'
  );
  const context = vm.createContext({ console });
  vm.runInContext(`${source}\n;globalThis.__PackGenerator = PackGenerator;`, context);
  const planRepair = context.__PackGenerator._test.repairPlanFromGate;
  assert.equal(
    planRepair(
      { harnessNeedsRepair: true, issues: ['章节中位长度过低'] },
      { glossaryEnough: true, glossaryKindCount: 2 }
    ).comprehensive,
    true
  );
  assert.equal(
    planRepair(
      { missingPlanDays: [8], issues: ['缺少课表'] },
      { glossaryEnough: true, glossaryKindCount: 2 }
    ).comprehensive,
    true
  );
});

test('全局质量问题不再触发整包资料和正文重新生成', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'pack-generator.js'),
    'utf8'
  );
  const repairStart = source.indexOf('async function repairFinalGateForPack');
  const repairSection = source.slice(
    repairStart,
    source.indexOf('\n  return {', repairStart)
  );
  assert.match(repairSection, /全局结构问题不再触发整包重生成/);
  assert.doesNotMatch(repairSection, /执行综合修复/);
  assert.match(repairSection, /days: repairPlan\.materialsDays/);
  assert.match(repairSection, /days: repairPlan\.hubDays/);
});

test('多次生成与修复会累计非敏感性能指标而不覆盖前序会话', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'pack-generator.js'),
    'utf8'
  );
  const context = vm.createContext({ console });
  vm.runInContext(`${source}\n;globalThis.__PackGenerator = PackGenerator;`, context);
  const pack = {
    meta: {
      performance: {
        workflowRuns: [{ operation: 'resume', success: true }],
      },
    },
  };
  context.__PackGenerator._test.storeHarnessSnapshot(pack, {
    traceId: 'trace-1',
    startedAt: 1,
    endedAt: 2,
    durationMs: 100,
    toolCalls: 3,
    aiMetrics: {
      calls: 2,
      durationMs: 80,
      promptTokens: 100,
      stages: { 'hub.write': { calls: 2, durationMs: 80 } },
    },
  });
  context.__PackGenerator._test.storeHarnessSnapshot(pack, {
    traceId: 'trace-2',
    startedAt: 3,
    endedAt: 4,
    durationMs: 50,
    toolCalls: 1,
    aiMetrics: {
      calls: 1,
      durationMs: 40,
      promptTokens: 20,
      stages: { 'glossary.core': { calls: 1, durationMs: 40 } },
    },
  });
  assert.equal(pack.meta.performance.aiMetrics.calls, 3);
  assert.equal(pack.meta.performance.aiMetrics.durationMs, 120);
  assert.equal(pack.meta.performance.aiMetrics.promptTokens, 120);
  assert.equal(pack.meta.performance.sessions.length, 2);
  assert.equal(pack.meta.performance.workflowRuns.length, 1);
  assert.equal(pack.meta.performance.workflowRuns[0].operation, 'resume');
  assert.equal(pack.meta.performance.aiMetrics.stages['hub.write'].calls, 2);
  assert.equal(pack.meta.performance.aiMetrics.stages['glossary.core'].calls, 1);
});

test('知识库生成失败时保存诊断快照后再向上抛错', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'pack-generator.js'),
    'utf8'
  );
  const start = source.indexOf('async function generateHubForPack');
  const end = source.indexOf('/** P3：为已有内容包补全每日外链与练习 */', start);
  const section = source.slice(start, end);

  assert.match(section, /catch \(error\)[\s\S]*PackHarness\.snapshot\(\)/);
  assert.match(section, /catch \(error\)[\s\S]*storeHarnessSnapshot\(pack, snap\)/);
  assert.match(section, /catch \(error\)[\s\S]*ContentPack\.save\(pack\)[\s\S]*throw error/);
});

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
  const workflowRun = result.meta.performance.workflowRuns.at(-1);
  assert.equal(workflowRun.operation, 'full');
  assert.equal(workflowRun.success, true);
  assert.equal(typeof workflowRun.generationMs, 'number');
  assert.equal(typeof workflowRun.repairMs, 'number');
  assert.equal(workflowRun.recoveryAttempted, false);
});

test('完整生成首次未过最终门时自动修复并重新验收', async () => {
  const incomplete = completePack('pack-auto-repair');
  delete incomplete.hub.chapters['module-1/day-07'];
  const repaired = completePack('pack-auto-repair');
  let repairCalls = 0;
  const progress = [];
  const deps = dependencies({
    generator: {
      async generate(_meta, _progress, options) {
        options.onSkeletonReady(incomplete);
        return incomplete;
      },
      async repairFinalGateForPack(packId, gate, onProgress) {
        repairCalls += 1;
        assert.equal(packId, incomplete.id);
        assert.equal(gate.passed, false);
        onProgress('正在自动修复最终质量问题…', 98);
        return repaired;
      },
    },
  });
  const workflow = createPackWorkflow(deps);
  const result = await workflow.start(deps.projects.get('project-1'), {
    onProgress: (message) => progress.push(message),
  });

  assert.equal(repairCalls, 1);
  assert.equal(result.meta.quality.finalGatePassed, true);
  assert.equal(deps.projects.get('project-1').packStatus, 'ready');
  assert.ok(progress.includes('正在自动修复最终质量问题…'));
});

test('自动修复遇到网络故障时进入可恢复失败而不是伪装成功', async () => {
  const incomplete = completePack('pack-auto-repair-network');
  delete incomplete.hub.chapters['module-1/day-07'];
  const deps = dependencies({
    generator: {
      async generate(_meta, _progress, options) {
        options.onSkeletonReady(incomplete);
        return incomplete;
      },
      async repairFinalGateForPack() {
        throw Object.assign(new Error('network unavailable'), { code: 'NETWORK' });
      },
    },
  });
  const workflow = createPackWorkflow(deps);
  await assert.rejects(
    workflow.start(deps.projects.get('project-1')),
    (error) => error?.code === 'NETWORK'
  );
  const failed = deps.packs.get(incomplete.id);
  assert.equal(failed.meta.performance.workflowRuns.at(-1).success, false);
  assert.equal(failed.meta.performance.workflowRuns.at(-1).failureType, 'network');
  assert.equal(failed.meta.generation.lastFailure.resumable, true);
});

test('手动修复课包会按当前最终门问题执行综合修复', async () => {
  const incomplete = completeV2Pack('pack-manual-repair');
  incomplete.dayResources[4] = { resources: [] };
  const repaired = completeV2Pack('pack-manual-repair');
  let receivedGate;
  const deps = dependencies({
    generator: {
      async repairFinalGateForPack(packId, gate) {
        assert.equal(packId, incomplete.id);
        receivedGate = gate;
        return repaired;
      },
    },
  });
  deps.contentPack.save(incomplete);
  deps.projects.update('project-1', {
    packId: incomplete.id,
    packStatus: 'needs_review',
  });
  const workflow = createPackWorkflow(deps);
  await workflow.repairHub(deps.projects.get('project-1'));

  assert.deepEqual(receivedGate.emptyResourceDays, [4]);
  assert.equal(receivedGate.missingResourceDays.length, 0);
  assert.equal(deps.projects.get('project-1').packStatus, 'ready');
});

test('手动修复没有改变内容或问题时禁止无限重复同一种修复', async () => {
  const incomplete = completeV2Pack('pack-no-progress');
  incomplete.dayResources[4] = { resources: [] };
  let repairCalls = 0;
  const deps = dependencies({
    generator: {
      async repairFinalGateForPack() {
        repairCalls += 1;
        return structuredClone(incomplete);
      },
    },
  });
  deps.contentPack.save(incomplete);
  deps.projects.update('project-1', { packId: incomplete.id, packStatus: 'needs_review' });
  const workflow = createPackWorkflow(deps);

  const first = await workflow.repairHub(deps.projects.get('project-1'));
  assert.equal(first.meta.quality.repairControl.status, 'no_change');
  await assert.rejects(
    workflow.repairHub(deps.projects.get('project-1')),
    (error) => error.code === 'REPAIR_NO_PROGRESS'
  );
  assert.equal(repairCalls, 1);
});

test('优化建议与历史修复结果不再阻止当前合格课包进入 ready', async () => {
  const pack = completePack();
  pack.meta.quality.repair = { passed: false, reason: 'max_rounds' };
  pack.meta.quality.chapterMedianLen = 1200;
  pack.meta.quality.bloomRegressionWeeks = [{ week: 1 }];
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

  assert.equal(result.meta.quality.finalGatePassed, true);
  assert.equal(result.meta.quality.workflowGate.optimizationSuggested, true);
  assert.equal(deps.projects.get('project-1').packStatus, 'ready');
});

test('最终门禁重新计算质量时不受旧 needsReview 标记污染', () => {
  const pack = completePack();
  pack.meta.quality.needsReview = true;
  pack.evaluation = { status: 'needs-review', findings: ['旧结果'] };
  const result = gateApi.apply(pack, {
    shouldRepair: (quality) => quality.needsReview === true,
  });
  assert.equal(result.passed, true);
  assert.equal(pack.evaluation.status, 'passed');
  assert.deepEqual(pack.evaluation.workflowFindings, []);
});

test('逐日启发式深度不足给出可定位建议但不阻断学习', () => {
  const pack = completeV2Pack('pack-day-floor');
  pack.hub.chapters['module-1/day-01'] =
    '# Day 1\n\n内容很短。\n\n## 来源\n- [S1] [课程来源 1](https://example.edu/lesson-1)';
  const day = gateApi.evaluateDay(pack, 1);
  assert.equal(day.passed, true);
  assert.ok(day.findings.some((finding) => finding.code === 'lesson.depth.floor'));
  assert.ok(day.advisoryFindings.some((finding) => finding.code === 'lesson.depth.floor'));
  assert.ok(day.findings.every((finding) => finding.day === 1));
});

test('明确的待生成占位章节属于结构缺失并阻断发布', () => {
  const pack = completeV2Pack('pack-placeholder');
  pack.hub.chapters['module-1/day-01'] =
    '# Day 1\n\n本章正在后台准备中，请稍后再试。\n\n<!-- zhijing:shallow -->';
  const day = gateApi.evaluateDay(pack, 1);
  assert.equal(day.passed, false);
  assert.ok(day.blockingFindings.some((finding) => finding.code === 'lesson.placeholder'));
});

test('最终门复用逐日质量判定并把优化指标留作非阻塞建议', () => {
  const pack = completeV2Pack('pack-unified-decision');
  pack.meta.quality.chapterMedianLen = 1200;
  pack.meta.quality.chapterMedianOk = false;
  pack.meta.quality.bloomRegressionWeeks = [{ week: 1 }];
  pack.meta.quality.repair = { passed: false, reason: 'max_rounds' };
  const result = gateApi.evaluate(pack, { shouldRepair: () => true });
  assert.equal(result.passed, true);
  assert.equal(result.optimizationSuggested, true);
  assert.ok(result.optimizationFindings.some((finding) => finding.code === 'course.chapter-median'));
  assert.ok(result.optimizationFindings.some((finding) => finding.code === 'course.bloom-progression'));
  assert.ok(result.dayResults.every((day) => day.passed));
});

test('待完善摘要优先展示可操作原因而不是泛化门禁文案', () => {
  const summary = gateApi.summarizeIssues({
    issues: ['2 天的正文引用无法回链', '合格术语不足 8 条', '内容质量门禁仍要求修复'],
  });
  assert.equal(summary, '2 天的正文引用无法回链；合格术语不足 8 条');
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

test('重新生成在新骨架后失败仍保留旧课包并记录待恢复候选包', async () => {
  const oldPack = completePack('pack-old-ready');
  oldPack.status = 'ready';
  const candidate = completePack('pack-new-partial');
  candidate.status = 'partial';
  const deps = dependencies({
    generator: {
      async generate(_meta, _progress, options) {
        options.onSkeletonReady(candidate);
        throw Object.assign(new Error('network offline'), { code: 'NETWORK' });
      },
    },
  });
  deps.contentPack.save(oldPack);
  deps.projects.update('project-1', { packId: oldPack.id, packStatus: 'ready' });
  const workflow = createPackWorkflow(deps);

  await assert.rejects(workflow.start(deps.projects.get('project-1')), /network offline/);
  const project = deps.projects.get('project-1');
  assert.equal(project.packId, oldPack.id);
  assert.equal(project.packStatus, 'ready');
  assert.equal(project.pendingPackId, candidate.id);
  assert.equal(project.pendingPackStatus, 'partial');
  assert.ok(deps.contentPack.load(candidate.id));
  const failedCandidate = deps.contentPack.load(candidate.id);
  assert.equal(failedCandidate.meta.generation.lastFailure.type, 'network');
  assert.equal(failedCandidate.meta.performance.workflowRuns.at(-1).failureType, 'network');
  assert.equal(failedCandidate.meta.performance.workflowRuns.at(-1).success, false);
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

test('术语数量或可视化类型不达启发式目标时只给建议', () => {
  const pack = completePack();
  pack.meta.quality.glossaryEnough = false;
  pack.meta.quality.glossaryKindCount = 1;
  const result = gateApi.evaluate(pack, { shouldRepair: () => false });
  assert.equal(result.passed, true);
  assert.ok(result.advisoryFindings.some((finding) => finding.code === 'course.glossary-count'));
});

test('最终门禁会识别阶段 A-B-A 回跳但不把启发式顺序当硬缺陷', () => {
  const pack = completePack();
  pack.plan[0].phase = 'A';
  pack.plan[1].phase = 'B';
  pack.plan[2].phase = 'A';
  const result = gateApi.evaluate(pack, { shouldRepair: () => false });
  assert.equal(result.passed, true);
  assert.deepEqual(result.phaseBackjumpDays, [3]);
  assert.ok(result.advisoryFindings.some((finding) => finding.code === 'course.phase-backjump'));
});

test('V2 完整课包通过证据、练习与累计作品门禁', () => {
  const result = gateApi.evaluate(completeV2Pack(), { shouldRepair: () => false });
  assert.equal(result.passed, true);
  assert.deepEqual(result.emptyResourceDays, []);
  assert.deepEqual(result.missingCitationDays, []);
  assert.deepEqual(result.invalidExerciseDays, []);
  assert.deepEqual(result.missingCheckpointWeeks, []);
});

test('V2 空资源记录不能冒充每日资料覆盖', () => {
  const pack = completeV2Pack();
  pack.dayResources[4].resources = [];
  const result = gateApi.evaluate(pack, { shouldRepair: () => false });
  assert.equal(result.passed, false);
  assert.deepEqual(result.emptyResourceDays, [4]);
});

test('V2 正文引用必须回链到同日来源', () => {
  const pack = completeV2Pack();
  pack.dayResources[3].resources[0].sourceId = 'S9';
  const result = gateApi.evaluate(pack, { shouldRepair: () => false });
  assert.equal(result.passed, false);
  assert.deepEqual(result.missingCitationDays, [3]);
});

test('V2 三类练习缺少答案或常见错误时不能 ready', () => {
  const pack = completeV2Pack();
  pack.dayExercises[5][1].ref = '';
  pack.dayExercises[5][2].commonMistakes = [];
  const result = gateApi.evaluate(pack, { shouldRepair: () => false });
  assert.equal(result.passed, false);
  assert.deepEqual(result.invalidExerciseDays, [5]);
});

test('V2 缺少逐周累计作品时不能 ready', () => {
  const pack = completeV2Pack();
  pack.weeklyCheckpoints = [];
  const result = gateApi.evaluate(pack, { shouldRepair: () => false });
  assert.equal(result.passed, false);
  assert.deepEqual(result.missingCheckpointWeeks, [1]);
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

test('单次 AI 请求超时会明确失败而不是无限占用总预算', async () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'ai-review.js'),
    'utf8'
  );
  const context = vm.createContext({
    console,
    AbortController,
    setTimeout,
    clearTimeout,
    localStorage: {
      getItem: () => 'sk-test-only',
      setItem: () => {},
      removeItem: () => {},
    },
    document: { documentElement: { dataset: {} } },
    fetch: (_url, { signal }) =>
      new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => {
          reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
        });
      }),
  });
  vm.runInContext(`${source}\n;globalThis.__AiReview = AiReview;`, context);
  context.__AiReview.checkProxy = async () => ({ ok: true });

  await assert.rejects(
    context.__AiReview.chat({
      messages: [{ role: 'user', content: 'test' }],
      timeoutMs: 10,
    }),
    (error) => error.code === 'UPSTREAM_TIMEOUT' && /超时/.test(error.message)
  );
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

test('核心术语每批保存草稿，恢复时从已完成词条继续', async () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'pack-generator.js'),
    'utf8'
  );
  const terms = ['需求验证', '用户画像', '价值主张', '竞品分析', '机会评估', '方案取舍', '风险矩阵', '验收标准'];
  let coreCalls = 0;
  const coreEntry = (term) => ({
    term,
    module: '方法',
    definition: `${term}是一套用于识别具体问题、比较备选方案并形成可验证结论的方法。`,
    userPhrases: [`我需要用${term}比较两个真实方案，应该先检查哪些条件？`],
    example: `团队针对真实问题使用${term}比较两个方案，记录证据后选择风险更低的一项并持续验证结果。`,
    confusions: [{ term: '经验判断', distinction: '前者要求记录证据与验证，后者可能只依赖直觉。' }],
    sections: [
      { label: '是什么', content: '用于真实任务中的结构化判断。' },
      { label: '岗位要会的判断', content: '先看约束，再比较证据。' },
      { label: '面试怎么答', content: '说明对象、方法、选择和验证结果。' },
    ],
  });
  const context = vm.createContext({
    console,
    AiReview: {
      chat: async ({ messages }) => {
        const user = messages.find((message) => message.role === 'user')?.content || '';
        const batchJson = user.match(/## 本批要写的词[^\n]*\n(\[[^\n]+\])/u)?.[1];
        if (!batchJson) return '{}';
        coreCalls += 1;
        if (coreCalls === 3) {
          throw Object.assign(new Error('本次生成时间已用完'), { code: 'WALL_CLOCK' });
        }
        return JSON.stringify({
          glossary: JSON.parse(batchJson).map((item) => coreEntry(item.term)),
        });
      },
    },
  });
  vm.runInContext(`${source}\n;globalThis.__PackGenerator = PackGenerator;`, context);
  const pack = {
    plan: terms.map((topic, index) => ({ day: index + 1, topic })),
    hub: {
      chapters: Object.fromEntries(
        terms.map((term, index) => [
          `module-1/day-${String(index + 1).padStart(2, '0')}`,
          `# ${term}\n\n**${term}** 用于具体工作判断。${'团队记录证据并验证结果。'.repeat(8)}`,
        ])
      ),
    },
  };
  let checkpoint = [];
  await assert.rejects(
    context.__PackGenerator._test.generateGlossary(
      { industry: '软件', role: '产品经理', goal: '入门', days: 8 },
      { phases: [], weekThemes: [] },
      undefined,
      pack,
      {
        terms: terms.map((term, index) => ({ term, sourceDay: index + 1 })),
        targetCount: 8,
        incremental: true,
        onCoreCheckpoint: (entries) => {
          checkpoint = entries;
        },
      }
    ),
    (error) => error.code === 'WALL_CLOCK'
  );
  assert.equal(checkpoint.length, 4);

  coreCalls = 2;
  const progress = [];
  await assert.rejects(
    context.__PackGenerator._test.generateGlossary(
      { industry: '软件', role: '产品经理', goal: '入门', days: 8 },
      { phases: [], weekThemes: [] },
      (message) => progress.push(message),
      pack,
      {
        terms: terms.map((term, index) => ({ term, sourceDay: index + 1 })),
        targetCount: 8,
        incremental: true,
        seedCoreEntries: checkpoint,
      }
    ),
    (error) => error.code === 'WALL_CLOCK'
  );
  assert.match(progress[0], /已完成 4 条/);
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
  const context = vm.createContext({ console, URL });
  vm.runInContext(`${source}\n;globalThis.__PackGenerator = PackGenerator;`, context);
  const days = 7;
  const pack = completeV2Pack('pack-resume-complete');
  pack.skills = Array.from({ length: 6 }, (_, index) => ({ id: `s${index + 1}` }));
  pack.interview = Array.from({ length: 12 }, (_, index) => ({ id: `i${index + 1}` }));
  pack.portfolio = Array.from({ length: 3 }, (_, index) => ({ id: `p${index + 1}` }));

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
    URL,
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
    URL,
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
    const sourceId = 'S1';
    const url = `https://example.edu/glossary-${day}`;
    pack.dayResources[String(day)] = {
      resources: [
        {
          sourceId,
          title: `${term}课程来源`,
          url,
          publisher: 'Example University',
          retrievedAt: '2026-08-17T00:00:00.000Z',
          sourceTier: 'primary',
        },
      ],
    };
    pack.dayExercises[String(day)] = ['recall', 'application', 'transfer'].map((type) => ({
      type,
      q: `${term}${type}问题`,
      ref: `${term}${type}参考答案`,
      rubric: ['覆盖本日对象', '结论可检查'],
      commonMistakes: ['只复述标题'],
      feedbackMode: type === 'recall' ? 'immediate' : 'rubric',
    }));
    pack.hub.navigation[0].items.push({ day, days: String(day), slug });
    pack.hub.chapters[slug] =
      `# ${term}\n\n**${term}** 用于具体工作判断 [S1]。团队需要收集证据、比较方案、记录取舍并验证结果。\n\n` +
      `${'步骤 1 识别对象与约束，步骤 2 比较证据，步骤 3 记录取舍并验证结果。'.repeat(80)}\n\n` +
      `## 来源\n- [S1] [${term}课程来源](${url})`;
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
  assert.equal(demand.visual.kind, 'flow');
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

test('整课术语候选排除已有词并保留正文来源天数', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'pack-generator.js'),
    'utf8'
  );
  const context = vm.createContext({ console });
  vm.runInContext(`${source}\n;globalThis.__PackGenerator = PackGenerator;`, context);
  const pack = {
    plan: [
      { day: 1, topic: '用户画像' },
      { day: 2, topic: '需求验证' },
    ],
    glossary: [{ term: '用户画像', sourceType: 'core' }],
    hub: {
      chapters: {
        'module-1/day-01': `# 用户画像\n\n**用户画像** 用于描述目标用户。${'团队收集证据。'.repeat(10)}`,
        'module-1/day-02': `# 需求验证\n\n**需求验证** 用于检验假设。${'团队记录判断。'.repeat(10)}`,
      },
    },
  };
  const candidates = context.__PackGenerator._test.glossaryCandidatesForCourse(
    [
      { term: '用户画像', sourceDay: 1 },
      { term: '需求验证', sourceDay: 2 },
    ],
    pack,
    8
  );
  assert.ok(!candidates.some((item) => item.term === '用户画像'));
  assert.deepEqual(
    Array.from(candidates.find((item) => item.term === '需求验证').sourceDays),
    [2]
  );
});

test('工作流支持整课、按日和自定义术语操作并保持路径可用', async () => {
  const pack = completePack('pack-glossary-actions');
  const calls = [];
  const deps = dependencies({
    generator: {
      async generateCourseGlossaryForPack(packId) {
        calls.push(['course', packId]);
        return pack;
      },
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
  await workflow.generateCourseGlossary(deps.projects.get('project-1'));
  await workflow.generateDayGlossary(deps.projects.get('project-1'), 3);
  await workflow.generateCustomGlossary(deps.projects.get('project-1'), '机会成本');
  assert.deepEqual(calls, [
    ['course', pack.id],
    ['day', pack.id, 3],
    ['custom', pack.id, '机会成本'],
  ]);
  assert.equal(deps.projects.get('project-1').packStatus, 'ready');
});

test('整课扫描没有新候选时安全结束并记录零新增', async () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'pack-generator.js'),
    'utf8'
  );
  let saveCount = 0;
  const pack = {
    id: 'no-course-glossary-candidates',
    meta: {
      title: '测试路径',
      industry: '软件',
      role: '产品经理',
      days: 7,
      generation: {},
    },
    plan: [{ day: 1, topic: '用户画像' }],
    glossary: [{ term: '用户画像', sourceType: 'core', aliases: [] }],
    hub: {
      chapters: {
        'module-1/day-01': `# 用户画像\n\n**用户画像** 用于描述目标用户。${'团队基于事实记录判断。'.repeat(12)}`,
      },
    },
  };
  const context = vm.createContext({
    console,
    ContentPack: {
      load: () => pack,
      save: () => {
        saveCount += 1;
      },
    },
    AiReview: {
      chat: async () => JSON.stringify({
        terms: [{ term: '用户画像', module: '方法', sourceDay: 1 }],
      }),
    },
  });
  vm.runInContext(`${source}\n;globalThis.__PackGenerator = PackGenerator;`, context);
  const result = await context.__PackGenerator.generateCourseGlossaryForPack(pack.id);
  assert.equal(result.meta.generation.lastCourseGlossaryRun.added, 0);
  assert.equal(result.meta.generation.lastCourseGlossaryRun.status, 'completed');
  assert.equal(saveCount, 1);
});

test('整课术语补全失败后保持可重试且第二次可完成', async () => {
  const pack = completePack('pack-course-glossary-retry');
  let attempts = 0;
  const deps = dependencies({
    generator: {
      async generateCourseGlossaryForPack() {
        attempts += 1;
        if (attempts === 1) throw new Error('temporary');
        return pack;
      },
    },
  });
  deps.contentPack.save(pack);
  deps.projects.update('project-1', { packId: pack.id, packStatus: 'ready' });
  const workflow = createPackWorkflow(deps);
  await assert.rejects(
    workflow.generateCourseGlossary(deps.projects.get('project-1')),
    /temporary/
  );
  assert.equal(deps.projects.get('project-1').packStatus, 'needs_review');
  await workflow.generateCourseGlossary(deps.projects.get('project-1'));
  assert.equal(attempts, 2);
  assert.equal(deps.projects.get('project-1').packStatus, 'ready');
});

test('术语库视图包含整课补全入口与分阶段进度处理', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(html, /id="btn-course-glossary"/);
  assert.match(html, /PackWorkflow\.generateCourseGlossary/);
  assert.match(html, /扫描全部日课/);
  assert.match(html, /已新增 \$\{added\} 条术语/);
});

test('今日页使用聚焦学习动线且保留所有功能锚点', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  for (const id of [
    'day-card',
    'view-tasks',
    'resources-section',
    'practice-section',
    'checkin-area',
    'feynman-section',
    'notes-section',
    'stats-panel',
    'calendar-panel',
  ]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(html, /class="today-flow"/);
  assert.match(html, /class="reflection-tabs"/);
  assert.match(html, /data-reflection-tab="feynman"/);
  assert.match(html, /data-reflection-tab="notes"/);
  assert.match(html, /class="footer-settings"/);
  assert.match(html, /function setReflectionTab/);
  assert.match(html, /focus === 'feynman' \|\| focus === 'notes'/);
});

test('首次进入遮罩关闭或刷新后不会继续覆盖应用', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'splash.css'), 'utf8');
  assert.match(css, /\.splash-gate\[hidden\]\s*\{[^}]*display:\s*none\s*!important/s);
});

test('今日任务完成状态按项目、日期和日课隔离并参与进度', () => {
  assert.ok(dailyLearningState, '应提供独立、可测试的每日任务状态模块');
  const state = {};
  const scopeA = dailyLearningState.scopeKey('project-a', '2026-08-28', 1);
  const scopeB = dailyLearningState.scopeKey('project-a', '2026-08-29', 1);
  const scopeC = dailyLearningState.scopeKey('project-b', '2026-08-28', 1);
  assert.equal(dailyLearningState.setTaskDone(state, scopeA, 0, true), true);
  assert.equal(dailyLearningState.setTaskDone(state, scopeA, 0, true), false);
  assert.equal(dailyLearningState.setTaskDone(state, scopeA, 1, false), true);
  assert.equal(dailyLearningState.isTaskDone(state, scopeA, 0), true);
  assert.equal(dailyLearningState.isTaskDone(state, scopeB, 0), false);
  assert.equal(dailyLearningState.isTaskDone(state, scopeC, 0), false);
  assert.deepEqual(dailyLearningState.taskProgress(state, scopeA, 2), {
    done: 1,
    total: 2,
    complete: false,
  });
});

test('今日任务复用现有日课与练习反馈提供三段式学习引导', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(html, /data-action="toggle-task"/);
  assert.match(html, /怎么做/);
  assert.match(html, /做成什么样/);
  assert.match(html, /我做得怎么样/);
  assert.match(html, /dailyTaskState/);
});

test('日课 Markdown 完成清单使用可交互复选框并同步主应用状态', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'ei-knowledge-hub', 'src', 'components', 'MarkdownContent.tsx'),
    'utf8'
  );
  assert.match(source, /ChecklistInput/);
  assert.match(source, /zhijing:checklist:set/);
  assert.match(source, /dailyTaskState/);
  assert.doesNotMatch(source, /disabled=\{true\}/);
});

test('长自检要点与参考内容在解析和渲染链路中不被截断', async () => {
  const generator = loadPackGenerator({ fetch: async () => { throw new Error('unexpected fetch'); } });
  assert.equal(typeof generator._test.normalizeDayMaterialRow, 'function');
  const longQuestion = `长题目-${'问题内容'.repeat(120)}`;
  const longRubric = `完整自检-${'判断依据与检查步骤'.repeat(100)}`;
  const longRef = `完整参考-${'示例、边界和改进建议'.repeat(100)}`;
  const row = {
    day: 1,
    resources: [
      { title: '资料一', url: 'https://example.edu/a', type: 'article' },
      { title: '资料二', url: 'https://example.org/b', type: 'report' },
    ],
    exercises: [0, 1, 2].map(() => ({ q: longQuestion, rubric: [longRubric, '第二条'], ref: longRef })),
  };
  const normalized = await generator._test.normalizeDayMaterialRow(
    row,
    { day: 1, topic: '可靠性', tasks: ['完成验证'] },
    { industry: '软件', role: '测试员' }
  );
  assert.equal(normalized.exercises[0].q, longQuestion);
  assert.equal(normalized.exercises[0].rubric[0], longRubric);
  assert.equal(normalized.exercises[0].ref, longRef);
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.doesNotMatch(html, /\.practice-rubric[^}]*overflow\s*:\s*hidden/s);
  assert.doesNotMatch(html, /\.practice-ref[^}]*-webkit-line-clamp/s);
});

test('使用指南按新今日页的任务、练习、复盘与打卡动线定位', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'onboarding.js'), 'utf8');
  assert.match(source, /任务清单[\s\S]*推荐资料[\s\S]*练习/);
  assert.match(source, /复述与笔记/);
  assert.match(source, /#today-flow \.task-block, #day-card/);
  assert.match(source, /#practice-section, #reflection-workspace, #checkin-area/);
  assert.match(source, /data-onb-try="reflection"/);
  assert.match(source, /kind === 'reflection'/);
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(html, /id="onboarding-step">1 \/ 9</);
});

test('未过质量门的路径展示原因、影响与完整下一步而不是伪精确百分比', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(html, /已生成 · 需要修复/);
  assert.match(html, /查看失败原因/);
  assert.match(html, /继续使用当前内容/);
  assert.match(html, /重新生成问题部分/);
  assert.match(html, /重新生成整个课包/);
  assert.doesNotMatch(html, /98%|未达完美状态/);
  assert.doesNotMatch(html, /已生成 · 建议优化/);
});

test('课包未通过时至少有一项面向用户的质量检查明确失败', () => {
  const pack = completePack('pack-visible-check');
  delete pack.dayResources['3'];
  const result = gateApi.evaluate(pack, null);
  assert.equal(result.passed, false);
  assert.ok(result.checks.some((check) => check.passed === false));
  assert.equal(result.checks.find((check) => check.id === 'sources')?.passed, false);
});

test('生成失败时先清除 busy 再重绘路径卡片以显示继续补全', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const functionStart = html.indexOf('async function runAiPackGeneration');
  const catchStart = html.indexOf('} catch (err) {', functionStart);
  const functionEnd = html.indexOf('async function continueFillPack', catchStart);
  const catchBlock = html.slice(catchStart, functionEnd);
  const partialStart = catchBlock.indexOf("if (cur?.packStatus === 'partial'");
  const finishAt = catchBlock.indexOf('GenDock.finishError(', partialStart);
  const renderAt = catchBlock.indexOf('renderProjectsHome();', finishAt);
  assert.ok(finishAt >= 0 && renderAt > finishAt);
  assert.match(catchBlock.slice(finishAt, renderAt), /canResume:\s*true/);
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

test('macOS 正式发布配置强制 Universal、签名、公证和发布前验证', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  assert.equal(pkg.build.mac.hardenedRuntime, true);
  assert.equal(pkg.build.mac.notarize, true);
  assert.equal(pkg.build.mac.minimumSystemVersion, '12.0');
  assert.ok(pkg.build.mac.target.every((target) => target.arch.includes('universal')));
  assert.notEqual(pkg.build.mac.identity, null);
  assert.ok(fs.existsSync(path.join(__dirname, '..', pkg.build.mac.entitlements)));
  assert.ok(fs.existsSync(path.join(__dirname, '..', pkg.build.mac.entitlementsInherit)));

  const workflow = fs.readFileSync(path.join(__dirname, '..', '.github', 'workflows', 'build-mac.yml'), 'utf8');
  assert.doesNotMatch(workflow, /CSC_IDENTITY_AUTO_DISCOVERY:\s*["']?false/);
  assert.match(workflow, /codesign --verify/);
  assert.match(workflow, /stapler validate/);
  assert.match(workflow, /spctl --assess/);
  assert.match(workflow, /lipo -archs/);
  const readme = fs.readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8');
  assert.doesNotMatch(readme, /xattr\s+-cr/);
  assert.match(readme, /mac-universal/);
});

test('macOS 内部留存包与正式签名发布通道严格隔离', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  assert.match(pkg.scripts['dist:mac:internal'], /mac\.identity=null/);
  assert.match(pkg.scripts['dist:mac:internal'], /mac\.notarize=false/);
  assert.match(pkg.scripts['dist:mac:internal'], /mac\.hardenedRuntime=false/);

  const workflow = fs.readFileSync(
    path.join(__dirname, '..', '.github', 'workflows', 'build-mac.yml'),
    'utf8'
  );
  const internalStart = workflow.indexOf('internal-mac:');
  const signedStart = workflow.indexOf('\n  mac:');
  assert.ok(internalStart >= 0 && signedStart > internalStart);
  const internalJob = workflow.slice(internalStart, signedStart);
  const signedJob = workflow.slice(signedStart);

  assert.match(internalJob, /npm run dist:mac:internal/);
  assert.match(internalJob, /UNSIGNED-INTERNAL/);
  assert.match(internalJob, /actions\/upload-artifact@v4/);
  assert.doesNotMatch(internalJob, /action-gh-release/);
  assert.match(signedJob, /Require Apple signing and notarization credentials/);
  assert.match(signedJob, /softprops\/action-gh-release@v2/);
});

test('macOS 两种构建模式都可靠导出 package 版本号', () => {
  const workflow = fs.readFileSync(
    path.join(__dirname, '..', '.github', 'workflows', 'build-mac.yml'),
    'utf8'
  );
  const safeVersionExport =
    /VERSION=\$\(node -p "require\('\.\/package\.json'\)\.version"\)\s+echo "version=\$\{VERSION\}" >> "\$\{GITHUB_OUTPUT\}"/g;

  assert.equal([...workflow.matchAll(safeVersionExport)].length, 2);
});
