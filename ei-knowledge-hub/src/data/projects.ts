export interface ProjectCard {
  slug: string
  title: string
  period: string
  role: string
  summary: string
  tags: string[]
  highlight?: string
  knowledgeLinks: { label: string; slug: string }[]
}

export const profile = {
  name: '北邮 · 信息与计算科学',
  subtitle: '2027 届 · AI 产品经理方向',
  intro:
    '从 RAG 问答 0→1 到竞赛级 PRD 交付，把课程里的 RAG、EARS、Agent PRD 方法论用在真实项目里。本页是简历的项目向展开，每个项目都链回日课理论章节。',
  skills: [
    'RAG / 大模型应用',
    'PRD / 原型 (Figma·Axure·墨刀)',
    'KANO / PEST / SWOT',
    '0→1 协调与迭代',
    '用户故事 / 需求池',
  ],
  awards: [
    '全国 AI 创新应用大赛 二等奖',
    '华泰创新挑战赛 二等奖',
    'EOVS / 三创 校赛二等奖',
  ],
}

export const projects: ProjectCard[] = [
  {
    slug: 'module-4/02-ai-qa',
    title: 'AI 问答助手',
    period: '2023.12 — 2024.06',
    role: '产品负责人',
    summary:
      '教育园区咨询场景 RAG 知识问答，0→1 上线，服务 3+ 学校合作方。把「资料检索 + 大模型生成」封装给咨询部门日常使用。',
    tags: ['RAG', '0→1', 'ToB', '已落地'],
    highlight: '多合作方使用中',
    knowledgeLinks: [
      { label: 'RAG 原理', slug: 'module-1/07-rag' },
      { label: '何时用 AI', slug: 'module-1/02-when-ai' },
      { label: '评估体系', slug: 'module-3/04-evaluation' },
    ],
  },
  {
    slug: 'module-4/03-ai-challenge',
    title: 'AI 挑战平台',
    period: '2024.02 — 至今',
    role: '产品',
    summary:
      '闯关式 AI 能力训练平台，用于竞赛与教学。用户故事 + 用户卡片定义画像，持续迭代题型与评测逻辑。',
    tags: ['大模型', '游戏化', '用户故事', '迭代中'],
    highlight: '竞赛场景使用中',
    knowledgeLinks: [
      { label: '八种 AI 模式', slug: 'module-1/03-eight-modes' },
      { label: '训练与评测', slug: 'module-1/05-training-eval' },
      { label: 'EARS 需求', slug: 'module-1/10-ears' },
    ],
  },
  {
    slug: 'module-4/04-travel-app',
    title: '挑战杯 · AI 旅行社区 APP',
    period: '2024.10 — 2025.06',
    role: '负责人',
    summary:
      'AI 旅行社区 MVP。KANO 问卷排优先级，PRD + 商业计划书 + 原型，完整走通从调研到开发跟进。',
    tags: ['KANO', 'PRD', 'MVP', '社区'],
    highlight: 'MVP 已完成',
    knowledgeLinks: [
      { label: 'PRD 框架', slug: 'module-3/00-framework-guide' },
      { label: '功能与流程', slug: 'module-3/02-features' },
      { label: '框架语义学', slug: 'module-1/10-ears' },
    ],
  },
  {
    slug: 'module-4/05-huatai-fintech',
    title: '华泰创新挑战赛 · 金融 AI',
    period: '2024.07 — 2024.08',
    role: '队长',
    summary:
      '金融 App 内 AI 大模型产品方案。PEST/SWOT 市场分析，Axure/墨刀原型 + PRD，全国决赛二等奖。',
    tags: ['金融 AI', 'PEST/SWOT', '嵌入型 AI', '竞赛'],
    highlight: '全国决赛 二等奖',
    knowledgeLinks: [
      { label: '嵌入型 AI PRD', slug: 'module-3/00-framework-guide' },
      { label: '提示词工程', slug: 'module-1/09-prompt-engineering' },
      { label: '安全防御', slug: 'module-1/12-security' },
    ],
  },
  {
    slug: 'module-4/01-internship',
    title: '瑞斯康达 · 产品助理',
    period: '2024.07 — 2024.08',
    role: '产品助理',
    summary:
      'ToB 售后支持：10+ 企业用户反馈收集、用户手册与售后方案维护，问题处理效率可量化提升。',
    tags: ['ToB', '用户文档', '售后'],
    knowledgeLinks: [
      { label: 'EARS', slug: 'module-1/10-ears' },
      { label: 'Product-Spec', slug: 'module-2/01-product-spec' },
    ],
  },
  {
    slug: 'module-4/06-campus',
    title: '校园 leadership & 本日课',
    period: '2024 — 2026',
    role: '社长 / 负责人 / 搭建者',
    summary:
      '李想科创工作室社长（76 人团队）；空地三栖物流负责人；用 Wteren 链搭建本站 PM 日课。',
    tags: ['领导力', 'Wteren', '日课'],
    knowledgeLinks: [
      { label: 'Wteren 总览', slug: 'module-2/00-overview' },
      { label: 'dev-builder', slug: 'module-2/05-dev-builder' },
    ],
  },
]
