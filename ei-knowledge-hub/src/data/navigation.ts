export interface NavItem {
  slug: string
  title: string
  days?: string // 对应学习天数范围
}

export interface NavModule {
  id: string
  title: string
  description: string
  color: string
  items: NavItem[]
}

export const navigation: NavModule[] = [
  {
    id: 'module-1',
    title: '行业与市场',
    description: '第1周 Day 1-7：定义、产业链、头部公司、竞品分析',
    color: '#0891b2',
    items: [
      { slug: 'module-1/00-overview', title: '模块总览', days: '1-7' },
      { slug: 'module-1/01-definition', title: '具身智能定义', days: '1' },
      { slug: 'module-1/02-history', title: '发展历程', days: '2' },
      { slug: 'module-1/03-industry-chain', title: '产业链图谱', days: '3' },
      { slug: 'module-1/04-company-matrix', title: '头部产品矩阵', days: '4' },
      { slug: 'module-1/05-competitive', title: '竞品差异化', days: '5' },
      { slug: 'module-1/06-unitree', title: '宇树深度研究', days: '6' },
      { slug: 'module-1/07-week-review', title: '周复盘方法', days: '7' },
    ],
  },
  {
    id: 'module-2',
    title: '产品与技术基础（上）',
    description: '第2周 Day 8-14：大脑小脑、硬件、VLA、RL、模仿学习',
    color: '#7c3aed',
    items: [
      { slug: 'module-2/00-overview', title: '模块总览', days: '8-14' },
      { slug: 'module-2/01-brain-cerebellum', title: '大脑与小脑协同', days: '8' },
      { slug: 'module-2/02-hardware', title: '核心硬件认知', days: '9' },
      { slug: 'module-2/03-sensors', title: '传感器与感知', days: '10' },
      { slug: 'module-2/04-vla-intro', title: 'VLA 模型入门', days: '11' },
      { slug: 'module-2/05-rl-intro', title: '强化学习入门', days: '12' },
      { slug: 'module-2/06-imitation-learning', title: '模仿学习入门', days: '13' },
      { slug: 'module-2/07-data-loop', title: '数据闭环', days: '14' },
    ],
  },
  {
    id: 'module-3',
    title: '产品与技术基础（下）',
    description: '第3周 Day 15-20：产品思维、交互、数据飞轮、竞品报告',
    color: '#0d9488',
    items: [
      { slug: 'module-3/00-overview', title: '模块总览', days: '15-20' },
      { slug: 'module-3/01-product-thinking', title: '产品思维与取舍', days: '15' },
      { slug: 'module-3/02-hci-design', title: '人机交互设计', days: '16' },
      { slug: 'module-3/03-data-flywheel', title: '数据飞轮设计', days: '17' },
      { slug: 'module-3/04-competitive-report', title: '竞品分析报告', days: '18-20' },
    ],
  },
  {
    id: 'module-4',
    title: '专项突破',
    description: '第4周 Day 21-30：VLA 案例、世界模型、论文、复盘',
    color: '#ea580c',
    items: [
      { slug: 'module-4/00-overview', title: '模块总览', days: '21-30' },
      { slug: 'module-4/01-rl-algorithm', title: '宇树 RL 算法', days: '21' },
      { slug: 'module-4/02-conference', title: '顶会论文追踪', days: '22' },
      { slug: 'module-4/03-vla-case', title: 'VLA 深度案例', days: '23' },
      { slug: 'module-4/04-world-model', title: '世界模型', days: '24' },
      { slug: 'module-4/05-diffusion-policy', title: 'Diffusion Policy', days: '25' },
      { slug: 'module-4/06-paper-reading', title: '论文阅读方法', days: '26' },
      { slug: 'module-4/07-phase-review', title: '第一阶段复盘', days: '27-30' },
    ],
  },
  {
    id: 'module-5',
    title: '项目一：开发者生态',
    description: '第5-6周 Day 31-55：用户调研、SDK 竞品、PRD、商业模式',
    color: '#2563eb',
    items: [
      { slug: 'module-5/00-overview', title: '项目总览', days: '31-55' },
      { slug: 'module-5/01-user-research', title: '用户调研 playbook', days: '31-33' },
      { slug: 'module-5/02-sdk-competitive', title: '机器人 SDK 竞品', days: '34-36' },
      { slug: 'module-5/03-prd-writing', title: 'PRD 撰写要点', days: '46-48' },
      { slug: 'module-5/04-business-model', title: '商业模式设计', days: '49-51' },
      { slug: 'module-5/05-portfolio-pack', title: '方案包装与评审', days: '52-55' },
    ],
  },
  {
    id: 'module-6',
    title: '项目二：家庭场景',
    description: '第7-9周 Day 56-82：场景聚焦、VLA 家庭应用、指标设计',
    color: '#db2777',
    items: [
      { slug: 'module-6/00-overview', title: '项目总览', days: '56-82' },
      { slug: 'module-6/01-scenario', title: '家庭场景聚焦', days: '56-58' },
      { slug: 'module-6/02-user-pain', title: '用户痛点分析', days: '59-61' },
      { slug: 'module-6/03-vla-home', title: 'VLA 家庭抓取', days: '62-64' },
      { slug: 'module-6/04-interaction', title: '语音与行为反馈', days: '68-70' },
      { slug: 'module-6/05-metrics', title: '体验评估指标', days: '78-80' },
    ],
  },
  {
    id: 'module-7',
    title: '面试冲刺',
    description: '第10-12周 Day 83-90：作品集、模拟面试、投递',
    color: '#16a34a',
    items: [
      { slug: 'module-7/00-overview', title: '冲刺总览', days: '83-90' },
      { slug: 'module-7/01-portfolio', title: '作品集整合', days: '83-85' },
      { slug: 'module-7/02-interview', title: '模拟面试准备', days: '86-88' },
      { slug: 'module-7/03-apply', title: '投递与复盘', days: '89-90' },
    ],
  },
]

export function getNavItem(slug: string): NavItem | undefined {
  for (const mod of navigation) {
    const item = mod.items.find((i) => i.slug === slug)
    if (item) return item
  }
  return undefined
}

export function getModuleForSlug(slug: string): NavModule | undefined {
  return navigation.find((m) => m.items.some((i) => i.slug === slug))
}

/** 按学习天数查找关联章节 */
export function getChaptersForDay(day: number): { slug: string; title: string; moduleTitle: string }[] {
  const result: { slug: string; title: string; moduleTitle: string }[] = []
  for (const mod of navigation) {
    for (const item of mod.items) {
      if (!item.days) continue
      const [start, end] = item.days.includes('-')
        ? item.days.split('-').map(Number)
        : [Number(item.days), Number(item.days)]
      if (day >= start && day <= end) {
        result.push({ slug: item.slug, title: item.title, moduleTitle: mod.title })
      }
    }
  }
  return result
}
