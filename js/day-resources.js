/**
 * 90天学习计划 - 每日推荐资料与知识库章节映射
 * 外链为公开可访问资料；知识库章节需先构建 hub（npm run build）
 */
const DAY_RESOURCES = {
  1: {
    resources: [
      { title: '维基百科：具身认知', url: 'https://en.wikipedia.org/wiki/Embodied_cognition', type: 'article' },
      { title: '甲子光年：2025具身智能报告', url: 'http://www.jazzyear.com/study_info.html?id=146', type: 'report' },
      { title: 'B站搜索：具身智能科普', url: 'https://search.bilibili.com/all?keyword=具身智能', type: 'video' },
    ],
    hub: ['module-1/01-definition'],
  },
  2: {
    resources: [
      { title: '维基百科：机器人发展史', url: 'https://en.wikipedia.org/wiki/Robotics', type: 'article' },
      { title: '宇树科技官网', url: 'https://www.unitree.com/', type: 'tool' },
      { title: '澎湃新闻：具身智能行业解读', url: 'https://www.thepaper.cn/newsDetail_forward_29954689', type: 'report' },
    ],
    hub: ['module-1/02-history'],
  },
  3: {
    resources: [
      { title: '甲子光年具身智能报告', url: 'http://www.jazzyear.com/study_info.html?id=146', type: 'report' },
      { title: '艾瑞：商用具身智能白皮书 PDF', url: 'https://pdf.dfcfw.com/pdf/H3_AP202512031793353788_1.pdf', type: 'report' },
      { title: '发现报告：产业链分析', url: 'https://www.fxbaogao.com/detail/4672405', type: 'report' },
    ],
    hub: ['module-1/03-industry-chain'],
  },
  4: {
    resources: [
      { title: '宇树 Unitree', url: 'https://www.unitree.com/', type: 'tool' },
      { title: '优必选 UBTECH', url: 'https://www.ubtrobot.com/', type: 'tool' },
      { title: '智元机器人', url: 'https://www.zhiyuan-robot.com/', type: 'tool' },
      { title: 'Tesla Optimus', url: 'https://www.tesla.com/optimus', type: 'tool' },
    ],
    hub: ['module-1/04-company-matrix'],
  },
  5: {
    resources: [
      { title: '宇树 vs 优必选产品页对比', url: 'https://www.unitree.com/', type: 'tool' },
      { title: '智元远征系列介绍', url: 'https://www.zhiyuan-robot.com/', type: 'tool' },
    ],
    hub: ['module-1/05-competitive'],
  },
  6: {
    resources: [
      { title: '宇树官网产品矩阵', url: 'https://www.unitree.com/', type: 'tool' },
      { title: '宇树 GitHub 开源', url: 'https://github.com/unitreerobotics', type: 'tool' },
      { title: 'IT桔子：宇树融资信息', url: 'https://www.itjuzi.com/company/5162', type: 'article' },
    ],
    hub: ['module-1/06-unitree'],
  },
  7: {
    resources: [
      { title: '知识库：周复盘方法', url: 'hub/index.html#/doc/module-1/07-week-review', type: 'article' },
    ],
    hub: ['module-1/07-week-review', 'module-1/00-overview'],
  },
  8: {
    resources: [
      { title: 'NVIDIA Isaac 具身智能平台', url: 'https://developer.nvidia.com/isaac', type: 'article' },
      { title: 'Google DeepMind 机器人研究', url: 'https://deepmind.google/research/', type: 'article' },
    ],
    hub: ['module-2/01-brain-cerebellum'],
  },
  9: {
    resources: [
      { title: '宇树 H1 硬件参数页', url: 'https://www.unitree.com/h1', type: 'tool' },
      { title: '波士顿动力 Atlas 技术博客', url: 'https://bostondynamics.com/blog/', type: 'article' },
    ],
    hub: ['module-2/02-hardware'],
  },
  10: {
    resources: [
      { title: 'Intel RealSense 深度相机', url: 'https://www.intelrealsense.com/', type: 'tool' },
      { title: 'OpenCV 计算机视觉库', url: 'https://opencv.org/', type: 'tool' },
    ],
    hub: ['module-2/03-sensors'],
  },
  11: {
    resources: [
      { title: 'RT-2 项目页', url: 'https://robotics-transformer2.github.io/', type: 'paper' },
      { title: 'OpenVLA 开源项目', url: 'https://openvla.github.io/', type: 'paper' },
      { title: 'VLA 论文集 GitHub', url: 'https://github.com/Psi-Robot/Awesome-VLA-Papers', type: 'paper' },
    ],
    hub: ['module-2/04-vla-intro'],
  },
  12: {
    resources: [
      { title: 'Spinning Up 强化学习教程', url: 'https://spinningup.openai.com/', type: 'article' },
      { title: 'PPO 原始论文', url: 'https://arxiv.org/abs/1707.06347', type: 'paper' },
    ],
    hub: ['module-2/05-rl-intro'],
  },
  13: {
    resources: [
      { title: 'Diffusion Policy 项目页', url: 'https://diffusion-policy.cs.columbia.edu/', type: 'paper' },
      { title: 'ACT 模仿学习论文', url: 'https://arxiv.org/abs/2304.13705', type: 'paper' },
    ],
    hub: ['module-2/06-imitation-learning'],
  },
  14: {
    resources: [
      { title: 'Open X-Embodiment 数据集', url: 'https://robotics-transformer-x.github.io/', type: 'paper' },
      { title: 'NVIDIA Isaac Sim 仿真', url: 'https://developer.nvidia.com/isaac-sim', type: 'tool' },
    ],
    hub: ['module-2/07-data-loop'],
  },
  15: {
    resources: [
      { title: '艾瑞白皮书：成本与商业化', url: 'https://pdf.dfcfw.com/pdf/H3_AP202512031793353788_1.pdf', type: 'report' },
    ],
    hub: ['module-3/01-product-thinking'],
  },
  16: {
    resources: [
      { title: 'Google 语音交互设计指南', url: 'https://designguidelines.withgoogle.com/', type: 'article' },
      { title: 'Apple HIG 人机界面指南', url: 'https://developer.apple.com/design/human-interface-guidelines/', type: 'article' },
    ],
    hub: ['module-3/02-hci-design'],
  },
  17: {
    resources: [
      { title: 'OpenAI 数据飞轮案例研究', url: 'https://openai.com/research/', type: 'article' },
    ],
    hub: ['module-3/03-data-flywheel'],
  },
  18: {
    resources: [
      { title: '知识库：竞品分析框架', url: 'hub/index.html#/doc/module-1/05-competitive', type: 'article' },
    ],
    hub: ['module-3/04-competitive-report', 'module-1/05-competitive'],
  },
  19: {
    resources: [
      { title: '智元技术博客', url: 'https://www.zhiyuan-robot.com/', type: 'article' },
      { title: 'Figure AI 官网', url: 'https://www.figure.ai/', type: 'tool' },
    ],
    hub: ['module-3/04-competitive-report'],
  },
  20: {
    resources: [
      { title: 'Notion 竞品报告模板（参考）', url: 'https://www.notion.so/templates', type: 'tool' },
    ],
    hub: ['module-3/04-competitive-report'],
  },
  21: {
    resources: [
      { title: 'Unitree RL Lab GitHub', url: 'https://github.com/unitreerobotics/unitree_rl_lab', type: 'tool' },
      { title: 'Unitree RL Gym', url: 'https://github.com/unitreerobotics/unitree_rl_gym', type: 'tool' },
    ],
    hub: ['module-4/01-rl-algorithm'],
  },
  22: {
    resources: [
      { title: 'CoRL 2025 官网', url: 'https://www.corl.org/', type: 'paper' },
      { title: 'ICRA 2026', url: 'https://www.ieee-ras.org/conferences-workshops/fully-sponsored/icra', type: 'paper' },
      { title: 'arXiv 机器人学', url: 'https://arxiv.org/list/cs.RO/recent', type: 'paper' },
    ],
    hub: ['module-4/02-conference'],
  },
  23: {
    resources: [
      { title: 'RT-2 项目页（端到端 VLA）', url: 'https://robotics-transformer2.github.io/', type: 'paper' },
      { title: 'OpenVLA 演示', url: 'https://openvla.github.io/', type: 'paper' },
    ],
    hub: ['module-4/03-vla-case'],
  },
  24: {
    resources: [
      { title: 'World Models 综述论文', url: 'https://arxiv.org/abs/2301.04104', type: 'paper' },
      { title: 'JEPA 世界模型', url: 'https://ai.meta.com/research/', type: 'paper' },
    ],
    hub: ['module-4/04-world-model'],
  },
  25: {
    resources: [
      { title: 'Diffusion Policy 项目', url: 'https://diffusion-policy.cs.columbia.edu/', type: 'paper' },
      { title: 'Diffusion Policy 论文', url: 'https://arxiv.org/abs/2303.04137', type: 'paper' },
    ],
    hub: ['module-4/05-diffusion-policy'],
  },
  26: {
    resources: [
      { title: 'arXiv 具身智能论文', url: 'https://arxiv.org/search/?query=embodied+AI&searchtype=all', type: 'paper' },
      { title: 'Papers With Code 机器人', url: 'https://paperswithcode.com/area/robotics', type: 'paper' },
    ],
    hub: ['module-4/06-paper-reading'],
  },
  27: {
    resources: [
      { title: '知识库：第一阶段复盘', url: 'hub/index.html#/doc/module-4/07-phase-review', type: 'article' },
    ],
    hub: ['module-4/07-phase-review'],
  },
  28: {
    resources: [
      { title: '知识库：第一阶段复盘', url: 'hub/index.html#/doc/module-4/07-phase-review', type: 'article' },
    ],
    hub: ['module-4/07-phase-review'],
  },
  29: {
    resources: [
      { title: '回顾本周未读资料', url: 'hub/index.html', type: 'article' },
    ],
    hub: ['module-4/07-phase-review'],
  },
  30: {
    resources: [
      { title: '知识库：项目一总览', url: 'hub/index.html#/doc/module-5/00-overview', type: 'article' },
      { title: '知识库：项目二总览', url: 'hub/index.html#/doc/module-6/00-overview', type: 'article' },
    ],
    hub: ['module-5/00-overview', 'module-6/00-overview'],
  },
};

// Day 31-55: 项目一
for (let d = 31; d <= 55; d++) {
  const hubMap = {
    31: ['module-5/01-user-research'], 32: ['module-5/01-user-research'], 33: ['module-5/01-user-research'],
    34: ['module-5/02-sdk-competitive'], 35: ['module-5/02-sdk-competitive'], 36: ['module-5/02-sdk-competitive'],
    37: ['module-5/00-overview'], 38: ['module-5/00-overview'], 39: ['module-5/00-overview'],
    40: ['module-5/00-overview'], 41: ['module-5/00-overview'], 42: ['module-5/00-overview'],
    43: ['module-5/00-overview'], 44: ['module-5/00-overview'], 45: ['module-5/00-overview'],
    46: ['module-5/03-prd-writing'], 47: ['module-5/03-prd-writing'], 48: ['module-5/03-prd-writing'],
    49: ['module-5/04-business-model'], 50: ['module-5/04-business-model'], 51: ['module-5/04-business-model'],
    52: ['module-5/05-portfolio-pack'], 53: ['module-5/05-portfolio-pack'],
    54: ['module-5/05-portfolio-pack'], 55: ['module-5/05-portfolio-pack'],
  };
  const resMap = {
    31: [{ title: 'ROS 2 文档', url: 'https://docs.ros.org/', type: 'tool' }],
    34: [{ title: 'Boston Dynamics Spot SDK', url: 'https://dev.bostondynamics.com/', type: 'tool' }, { title: 'ROS 2', url: 'https://docs.ros.org/', type: 'tool' }],
    46: [{ title: '知识库：PRD 撰写', url: 'hub/index.html#/doc/module-5/03-prd-writing', type: 'article' }],
    49: [{ title: '知识库：商业模式', url: 'hub/index.html#/doc/module-5/04-business-model', type: 'article' }],
  };
  DAY_RESOURCES[d] = {
    resources: resMap[d] || [{ title: '知识库：开发者生态项目', url: 'hub/index.html#/doc/module-5/00-overview', type: 'article' }],
    hub: hubMap[d] || ['module-5/00-overview'],
  };
}

// Day 56-82: 项目二
for (let d = 56; d <= 82; d++) {
  const hubMap = {
    56: ['module-6/01-scenario'], 57: ['module-6/01-scenario'], 58: ['module-6/01-scenario'],
    59: ['module-6/02-user-pain'], 60: ['module-6/02-user-pain'], 61: ['module-6/02-user-pain'],
    62: ['module-6/03-vla-home'], 63: ['module-6/03-vla-home'], 64: ['module-6/03-vla-home'],
    65: ['module-6/00-overview'], 66: ['module-6/00-overview'], 67: ['module-6/00-overview'],
    68: ['module-6/04-interaction'], 69: ['module-6/04-interaction'], 70: ['module-6/04-interaction'],
    71: ['module-6/00-overview'], 72: ['module-6/00-overview'], 73: ['module-6/00-overview'],
    74: ['module-6/03-vla-home'], 75: ['module-6/03-vla-home'], 76: ['module-6/03-vla-home'], 77: ['module-6/03-vla-home'],
    78: ['module-6/05-metrics'], 79: ['module-6/05-metrics'], 80: ['module-6/05-metrics'],
    81: ['module-6/00-overview'], 82: ['module-6/00-overview'],
  };
  const resMap = {
    59: [{ title: '京东/淘宝扫地机差评分析', url: 'https://search.jd.com/Search?keyword=扫地机器人', type: 'article' }],
    62: [{ title: 'OpenVLA 家庭场景', url: 'https://openvla.github.io/', type: 'paper' }],
    68: [{ title: 'Google 语音设计指南', url: 'https://designguidelines.withgoogle.com/', type: 'article' }],
    78: [{ title: '知识库：体验指标', url: 'hub/index.html#/doc/module-6/05-metrics', type: 'article' }],
  };
  DAY_RESOURCES[d] = {
    resources: resMap[d] || [{ title: '知识库：家庭场景项目', url: 'hub/index.html#/doc/module-6/00-overview', type: 'article' }],
    hub: hubMap[d] || ['module-6/00-overview'],
  };
}

// Day 83-90: 面试冲刺
for (let d = 83; d <= 90; d++) {
  const hubMap = {
    83: ['module-7/01-portfolio'], 84: ['module-7/01-portfolio'], 85: ['module-7/01-portfolio'],
    86: ['module-7/02-interview'], 87: ['module-7/02-interview'], 88: ['module-7/02-interview'],
    89: ['module-7/00-overview'], 90: ['module-7/03-apply'],
  };
  const resMap = {
    86: [{ title: '知识库：模拟面试', url: 'hub/index.html#/doc/module-7/02-interview', type: 'article' }],
    90: [{ title: 'BOSS直聘', url: 'https://www.zhipin.com/', type: 'tool' }, { title: '实习僧', url: 'https://www.shixiseng.com/', type: 'tool' }],
  };
  DAY_RESOURCES[d] = {
    resources: resMap[d] || [{ title: '知识库：面试冲刺', url: 'hub/index.html#/doc/module-7/00-overview', type: 'article' }],
    hub: hubMap[d] || ['module-7/00-overview'],
  };
}

// 知识库章节标题映射（用于显示）
const HUB_TITLES = {
  'module-1/01-definition': '具身智能定义',
  'module-1/02-history': '发展历程',
  'module-1/03-industry-chain': '产业链图谱',
  'module-1/04-company-matrix': '头部产品矩阵',
  'module-1/05-competitive': '竞品差异化',
  'module-1/06-unitree': '宇树深度研究',
  'module-1/07-week-review': '周复盘方法',
  'module-1/00-overview': '行业与市场总览',
  'module-2/01-brain-cerebellum': '大脑与小脑协同',
  'module-2/04-vla-intro': 'VLA 模型入门',
  'module-2/05-rl-intro': '强化学习入门',
  'module-3/04-competitive-report': '竞品分析报告',
  'module-4/03-vla-case': 'VLA 深度案例',
  'module-5/00-overview': '开发者生态项目',
  'module-6/00-overview': '家庭场景项目',
  'module-7/00-overview': '面试冲刺总览',
};
