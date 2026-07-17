/**
 * 产品经理 30 天入门 · 内置知识库 / 术语（供 iframe runtime pack 使用）
 */
const PM30_HUB_CONTENT_VERSION = 1;

const PM30_HUB_CHAPTERS = {
  'pm30/w1-pm-role': `# 产品经理是做什么的

产品经理（PM）不是「管项目的人」，也不是「画界面的人」。核心工作是：**发现问题 → 定义方案 → 推动交付 → 验证价值**。

## 一句话定位

连接用户价值与商业目标，在约束下做出可解释的取舍，并推动团队把方案变成可上线的产品。

## 常见误区

- 只提需求、不跟结果：上线了却不知道有没有解决问题
- 只比功能多少：堆功能不等于创造价值
- 把方案当成需求：用户说「我要一个按钮」往往是解决方案，真正需求在场景与目标里

## 今日练习提示

用自己的话写一句「PM 是做什么的」，再对照：有没有提到用户、目标、取舍、验证？
`,

  'pm30/w1-product-thinking': `# 产品思维入门

产品思维的最小单元是：**谁，在什么场景下，要完成什么事，当前障碍是什么，做成后价值是什么**。

## 三个层次

1. **功能**：能做什么
2. **体验**：好不好用、会不会用错
3. **商业**：是否支撑留存、转化、成本或战略目标

入门期先练「说清问题」，再谈方案。

## 小练习

选一个你常用的 App 功能，写三行：

1. 目标用户是谁
2. 核心场景是什么
3. 它创造的用户价值（一句话）
`,

  'pm30/w1-requirements': `# 需求从哪来，什么是伪需求

## 需求常见来源

用户反馈、业务目标、数据异常、竞品动作、战略方向、技术机会。入门期优先练：**用户与场景**，避免一上来就跟风功能清单。

## 伪需求的典型样子

- 听起来像方案：「加一个分享按钮」
- 缺少场景与频率：「有人想要」但说不清谁、何时、多痛
- 没有替代方案验证：现有路径是否已经够用

## 三层「为什么」

对任何需求连问三次为什么，逼近真实目标。若问不下去，先补调研，不要急着写 PRD。
`,

  'pm30/w1-week-review': `# 第 1 周复盘：岗位与产品基础

本周目标不是背术语，而是建立稳定表达：

1. 能用自己的话解释 PM 职责边界
2. 能把「功能」翻译成「用户价值」
3. 能识别「方案伪装成需求」

## 复盘清单

- 整理本周笔记，标出仍模糊的 1 个概念
- 用 200 字写「我对产品经理的新理解」
- 写下周最想攻克的 1 个能力（建议：访谈或问题陈述）
`,

  'pm30/w2-user-research': `# 用户访谈与观察

访谈的目的不是「收集功能愿望清单」，而是拿到**可验证的证据**：场景、频率、现有替代方案、失败时的代价。

## 准备

- 写清访谈目标与假设（你想验证什么）
- 6–8 个开放式问题，少问「你喜不喜欢」
- 预留追问：「当时发生了什么？你怎么处理的？」

## 现场原则

- 记原话，少记你的解读
- 先听完，再归类
- 一次访谈至少挖出 3 条高信息密度发现

## 没有真人可访时

做「自我场景复盘」：选一个你真实经历过的痛点，按访谈提纲自问自答，并标注哪些结论仍需外部验证。
`,

  'pm30/w2-problem-statement': `# 问题陈述：把发现写成可决策的句子

好的问题陈述让团队知道：**为谁解决什么，为何现在做，做成什么样算成功**。

## 推荐句式

**谁** 在 **场景** 中，因为 **障碍**，导致 **影响**；我们希望在 **约束** 下，达成 **可观测结果**。

## 检查清单

- 有没有混入具体方案（按钮、页面、算法）？
- 成功标准是否可观测？
- 「暂不解决什么」写清楚了吗？

问题写不清楚，后面的优先级与 PRD 都会漂。
`,

  'pm30/w2-competitive': `# 竞品分析：维度比功能清单更重要

竞品分析不是「列出对方有什么功能」，而是回答：

1. 对方服务谁、主打什么场景
2. 主流程哪里顺、哪里卡
3. 差异化机制是什么（供给、价格、网络效应、体验细节……）
4. 哪些可借鉴，哪些不可照搬（因为用户与约束不同）

## 最小产出

选 2–3 个对照产品，做一张对比表 + 半页结论：我们要赢在哪一点，放弃拼哪一点。
`,

  'pm30/w3-solutions': `# 从问题到方案：先发散，再收敛

## 流程

1. 针对核心问题列出至少 3 个方案方向
2. 每个方案写利弊、成本、风险、依赖
3. 选主方案，并**明确写下放弃了什么**

## 用户故事与验收

用「作为…我想…以便…」写故事，并为关键故事补验收标准。故事不可测试，就还不是可交付需求。
`,

  'pm30/w3-priority': `# 优先级：在约束下做取舍

常用方法（任选其一练熟）：

- **RICE**：Reach × Impact × Confidence / Effort
- **价值 / 成本象限**：先做高价值低成本，谨慎对待高成本高价值

## P0 边界

优先级的本质是说「不做什么」。写清本周 P0，并解释为什么其他项后置。
`,

  'pm30/w3-prd': `# PRD 初稿：让共识可执行

一份能用的 PRD，至少包含：

1. 背景与目标
2. 范围 / 非目标
3. 用户与场景
4. 需求与验收标准
5. 流程 / 关键状态
6. 依赖、风险、待决问题

## 压缩练习

把 PRD 压成 5 分钟可讲述版本。讲不清，通常是问题或范围还没定住。
`,

  'pm30/w4-metrics': `# 指标体系入门

先定义成功，再谈埋点。

## 三类指标

- **北星指标**：长期价值方向
- **过程指标**：能不能走到北星
- **护栏指标**：优化主指标时不能踩坏的底线（体验、安全、成本等）

为你的方案设 3 个可观测指标，并写清「怎样算失败」。
`,

  'pm30/w4-collab-portfolio': `# 协作、表达与入门作品集

## 跨角色协作

评审前预演研发/设计会问的问题。用业务语言转述技术约束，用用户证据支撑取舍。

## 作品集最小集

把本月产出串成一条线：问题定义 → 证据 → 竞品 → 方案取舍 → 流程/PRD → 指标。选 1 个最完整案例做主讲述，准备 8 分钟路演稿。

结营时更新：300 字总结 + 下阶段学习计划 + 简历要点。
`,
};

const PM30_HUB_NAV = [
  {
    id: 'pm30-w1',
    title: '第1周：认识产品经理',
    description: 'Day 1–7 · 岗位、产品思维与需求',
    color: '#0891b2',
    items: [
      { slug: 'pm30/w1-pm-role', title: '产品经理是做什么的', days: '1-2' },
      { slug: 'pm30/w1-product-thinking', title: '产品思维入门', days: '3-4' },
      { slug: 'pm30/w1-requirements', title: '需求与伪需求', days: '5-6' },
      { slug: 'pm30/w1-week-review', title: '第1周复盘', days: '7' },
    ],
  },
  {
    id: 'pm30-w2',
    title: '第2周：发现与定义问题',
    description: 'Day 8–14 · 调研、问题陈述、竞品',
    color: '#0d9488',
    items: [
      { slug: 'pm30/w2-user-research', title: '用户访谈与观察', days: '8-10' },
      { slug: 'pm30/w2-problem-statement', title: '问题陈述', days: '11' },
      { slug: 'pm30/w2-competitive', title: '竞品分析', days: '12-14' },
    ],
  },
  {
    id: 'pm30-w3',
    title: '第3周：方案与文档',
    description: 'Day 15–21 · 方案、优先级、PRD',
    color: '#2563eb',
    items: [
      { slug: 'pm30/w3-solutions', title: '从问题到方案', days: '15-16' },
      { slug: 'pm30/w3-priority', title: '优先级方法', days: '17' },
      { slug: 'pm30/w3-prd', title: 'PRD 初稿', days: '18-21' },
    ],
  },
  {
    id: 'pm30-w4',
    title: '第4周：指标协作与表达',
    description: 'Day 22–30 · 指标、协作、作品集',
    color: '#7c3aed',
    items: [
      { slug: 'pm30/w4-metrics', title: '指标体系入门', days: '22-23' },
      { slug: 'pm30/w4-collab-portfolio', title: '协作与作品集', days: '24-30' },
    ],
  },
];

const PM30_GLOSSARY_RICH = [
  { term: '产品经理', def: '负责发现问题、定义方案、推动交付并验证价值的产品角色。', module: '岗位' },
  { term: '用户画像', def: '对目标用户群体关键特征、动机与约束的结构化描述。', module: '调研' },
  { term: '用户故事', def: '以「作为…我想…以便…」表达需求，强调角色、目标与价值。', module: '需求' },
  { term: '验收标准', def: '需求可被验证的完成定义，用于研发交付与测试对齐。', module: '需求' },
  { term: 'MVP', def: '最小可行产品，用最少成本验证核心假设。', module: '方案' },
  { term: 'PRD', def: '产品需求文档，固化背景、范围、需求与验收等共识。', module: '文档' },
  { term: '优先级', def: '在约束下决定先做什么、后做什么、不做什么。', module: '决策' },
  { term: 'RICE', def: '用 Reach、Impact、Confidence、Effort 量化排序需求的方法。', module: '决策' },
  { term: '北星指标', def: '最能代表产品长期价值创造的核心指标。', module: '数据' },
  { term: '护栏指标', def: '防止优化主指标时破坏体验或安全的约束指标。', module: '数据' },
  { term: '用户旅程', def: '用户完成目标过程中的阶段、触点与情绪变化。', module: '体验' },
  { term: '信息架构', def: '内容与功能的组织方式，决定用户如何找到并完成任务。', module: '体验' },
  { term: 'A/B 测试', def: '通过对照实验比较方案效果的因果验证方法。', module: '数据' },
  { term: 'trade-off', def: '在冲突目标间做可解释取舍，并明确放弃项。', module: '决策' },
  { term: 'JTBD', def: 'Jobs to be Done，用户雇佣产品完成某项「任务」的视角。', module: '调研' },
  { term: '埋点', def: '为观测行为与结果而预先设计的数据采集点。', module: '数据' },
  { term: '问题陈述', def: '用结构化句子定义谁、场景、障碍、影响与成功标准。', module: '调研' },
  { term: '伪需求', def: '看似需求、实为方案偏好或未经场景验证的诉求。', module: '需求' },
  { term: '竞品分析', def: '对照同类产品的定位、流程与差异化机制，形成可行动结论。', module: '调研' },
  { term: '灰度发布', def: '先对部分用户开放，以降低上线风险并收集反馈。', module: '交付' },
  { term: '用户访谈', def: '通过开放式对话收集场景证据，而非功能投票。', module: '调研' },
  { term: 'P0', def: '当前周期必须完成的最高优先级范围边界。', module: '决策' },
  { term: '非目标', def: '明确本期不做的事项，防止范围膨胀。', module: '文档' },
  { term: '费曼复述', def: '用自己的话讲清概念，以暴露理解缺口的学习方法。', module: '学习' },
];

const PM30_CHAPTER_LINKS = [
  { keywords: ['产品经理', 'pm', '岗位'], label: '产品经理是做什么的', hub: '/doc/pm30/w1-pm-role', glossary: '产品经理' },
  { keywords: ['产品思维', '用户价值'], label: '产品思维入门', hub: '/doc/pm30/w1-product-thinking' },
  { keywords: ['需求', '伪需求'], label: '需求与伪需求', hub: '/doc/pm30/w1-requirements', glossary: '伪需求' },
  { keywords: ['访谈', '用户研究', '调研'], label: '用户访谈与观察', hub: '/doc/pm30/w2-user-research', glossary: '用户访谈' },
  { keywords: ['问题陈述', '痛点'], label: '问题陈述', hub: '/doc/pm30/w2-problem-statement', glossary: '问题陈述' },
  { keywords: ['竞品'], label: '竞品分析', hub: '/doc/pm30/w2-competitive', glossary: '竞品分析' },
  { keywords: ['方案', '用户故事'], label: '从问题到方案', hub: '/doc/pm30/w3-solutions', glossary: '用户故事' },
  { keywords: ['优先级', 'rice', 'p0'], label: '优先级方法', hub: '/doc/pm30/w3-priority', glossary: 'RICE' },
  { keywords: ['prd', '需求文档'], label: 'PRD 初稿', hub: '/doc/pm30/w3-prd', glossary: 'PRD' },
  { keywords: ['指标', '北星', '埋点', 'a/b'], label: '指标体系入门', hub: '/doc/pm30/w4-metrics', glossary: '北星指标' },
  { keywords: ['作品集', '面试', '协作'], label: '协作与作品集', hub: '/doc/pm30/w4-collab-portfolio' },
];

const Pm30Hub = {
  CONTENT_VERSION: PM30_HUB_CONTENT_VERSION,

  getHub() {
    return {
      title: '产品经理 30 天入门 · 知识库',
      learningPath: PM30_HUB_NAV.map((m) => m.title),
      navigation: PM30_HUB_NAV,
      chapters: PM30_HUB_CHAPTERS,
      generatedAt: '2026-07-17',
      contentVersion: PM30_HUB_CONTENT_VERSION,
      dailyAligned: true,
    };
  },

  getGlossaryRich() {
    return PM30_GLOSSARY_RICH.map((g) => ({
      term: g.term,
      definition: g.def,
      def: g.def,
      module: g.module || '核心',
      sections: [{ label: '是什么', content: g.def }],
    }));
  },

  getChapterLinks() {
    return PM30_CHAPTER_LINKS;
  },

  buildStoragePack() {
    const hub = this.getHub();
    return {
      version: 1,
      id: 'pm-30-intro',
      meta: {
        title: '产品经理 30 天入门',
        industry: '互联网 / 软件产品',
        role: '产品经理',
        goal: '入门',
        days: 30,
        notes: '内置默认课包',
      },
      plan: typeof PM30_LEARNING_PLAN !== 'undefined' ? PM30_LEARNING_PLAN : [],
      glossary: this.getGlossaryRich(),
      interview: typeof PM30_INTERVIEW !== 'undefined' ? PM30_INTERVIEW : [],
      skills: typeof PM30_SKILLS !== 'undefined' ? PM30_SKILLS : [],
      portfolio: typeof PM30_PORTFOLIO !== 'undefined' ? PM30_PORTFOLIO : [],
      hot: typeof PM30_HOT !== 'undefined' ? PM30_HOT : { keywords: [], systemHint: '' },
      hub,
      dayResources: typeof PM30_DAY_RESOURCES !== 'undefined' ? PM30_DAY_RESOURCES : {},
      dayExercises: {},
      status: 'ready',
      hubContentVersion: PM30_HUB_CONTENT_VERSION,
      createdAt: '2026-07-17T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
    };
  },

  ensureSeeded() {
    const key = 'learning-content-pack:pm-30-intro';
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const existing = JSON.parse(raw);
        if (
          existing?.hubContentVersion >= PM30_HUB_CONTENT_VERSION &&
          existing?.hub?.navigation?.length &&
          existing?.hub?.chapters &&
          Object.keys(existing.hub.chapters).length
        ) {
          return false;
        }
      }
    } catch {
      /* rewrite */
    }
    localStorage.setItem(key, JSON.stringify(this.buildStoragePack()));
    return true;
  },

  hubItemsForDay(day) {
    const n = Number(day);
    const result = [];
    PM30_HUB_NAV.forEach((mod) => {
      (mod.items || []).forEach((item) => {
        if (!item?.days || !item.slug) return;
        const parts = String(item.days).includes('-')
          ? String(item.days).split('-').map(Number)
          : [Number(item.days), Number(item.days)];
        const start = parts[0];
        const end = parts[1] ?? parts[0];
        if (Number.isFinite(start) && Number.isFinite(end) && n >= start && n <= end) {
          result.push({
            slug: item.slug,
            title: item.title || item.slug,
            moduleTitle: mod.title || '',
          });
        }
      });
    });
    return result;
  },
};
