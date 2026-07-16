import { defineEntry } from './types'
import type { GlossaryEntry } from './types'

export const glossary: GlossaryEntry[] = [
  // ========== 行业 ==========
  defineEntry('具身智能', {
    aliases: ['Embodied Intelligence', 'Embodied AI'],
    module: '行业',
    definition:
      '以物理机器人为载体，融合多模态感知与认知决策，能在非结构化环境中自主完成任务，并通过真实交互数据持续进化的智能系统。',
    sections: [
      {
        label: '是什么',
        content:
          '核心不是「会说话的 AI」，而是「能改变物理世界的 AI」：依赖身体、感知环境、规划动作、执行并学习。常见载体包括人形、四足、轮式、机械臂等。',
      },
      {
        label: 'PM 要会的判断',
        content:
          '四个问题中至少答「是」三个，才适合纳入具身智能产品讨论：\n1）是否依赖物理身体与环境实时交互？\n2）感知-决策-执行是否在端侧/近端闭环？\n3）是否需在非结构化环境泛化？\n4）数据闭环是否包含真实世界交互数据？',
      },
      {
        label: '和相近概念的区别',
        content:
          '· 传统工业机器人：固定工位、预编程，通常缺乏泛化\n· 云端 Agent：无物理身体，操作数字工具\n· 自动驾驶：可视为具身智能在交通垂直场景的成熟形态',
      },
      {
        label: '面试怎么答',
        content:
          '一句话：具身智能是「感知-决策-执行」在真实世界闭环的产品形态。再补一句差异：和 ChatGPT 比多了本体与动作；和流水线机械臂比多了泛化与学习。',
      },
    ],
  }),

  defineEntry('Embodied AI', {
    aliases: ['具身人工智能'],
    module: '行业',
    definition:
      'Embodied Artificial Intelligence 的学术/产业通称，强调智能离不开物理载体与真实世界反馈回路。',
    sections: [
      {
        label: '是什么',
        content:
          '来自具身认知（Embodied Cognition）思想：智能不是纯符号运算，而是通过身体与环境交互涌现。产业语境下常与「具身智能」互换使用。',
      },
      {
        label: 'PM 视角',
        content:
          '做竞品/市场报告时，用 Embodied AI 便于对齐海外资料；对内沟通用「具身智能」更本地化。关键是定义边界一致，避免团队概念漂移。',
      },
    ],
  }),

  defineEntry('人形机器人', {
    aliases: ['Humanoid'],
    module: '行业',
    definition:
      '模仿人体形态（双足/双手）的机器人平台，目标是在为人设计的环境中复用工具与空间。',
    sections: [
      {
        label: '是什么',
        content:
          '人形是载体形态之一，不是具身智能的唯一形态。优势：适配人类环境与工具；劣势：自由度高、成本高、控制与安全更难。',
      },
      {
        label: 'PM 取舍',
        content:
          '选题时问：这个场景是否必须「像人」？很多任务四足/轮式/机械臂更优。选人形通常为了：通用性叙事、资本叙事、对标人类工位。',
      },
      {
        label: '代表产品',
        content: 'Tesla Optimus、宇树 G1/H1、优必选 Walker、智元远征等。对比时看自由度、价格带、商用场景与交付能力。',
      },
    ],
  }),

  defineEntry('大脑与小脑', {
    aliases: ['Brain-Cerebellum'],
    module: '技术',
    definition:
      '行业常用比喻：大脑负责任务理解与高层规划，小脑负责高频运动控制与平衡执行。',
    sections: [
      {
        label: '是什么',
        content:
          '大脑侧常对应 VLA/大模型/任务规划器；小脑侧对应运动控制、全身协调、低延迟伺服。两者通过中间表示（轨迹、关节指令等）协同。',
      },
      {
        label: '对产品边界的影响',
        content:
          'PM 要分清验收对象：说「会听话」可能卡在大脑；说「走得稳/抓得准」可能卡在小脑与硬件。功能拆分、指标与排期都要按层对齐。',
      },
      {
        label: '延迟案例',
        content:
          '若小脑回路延迟到约 200ms，用户会感到动作迟滞、过冲。产品侧可做：执行中状态反馈、语音确认、失败可重试，而不是只堆模型参数。',
      },
    ],
  }),

  // ========== 技术 ==========
  defineEntry('VLA', {
    aliases: ['Vision-Language-Action', '视觉-语言-动作模型'],
    module: '技术',
    definition:
      'Vision-Language-Action：同时理解视觉与语言指令，并输出可执行动作（轨迹/关节指令）的模型范式。',
    sections: [
      {
        label: '是什么',
        content:
          '把「看+听懂」接到「动手」。典型链路：摄像头图像 + 自然语言 → 模型推理 → 动作序列 → 底层控制器执行。代表：RT-2、OpenVLA 等。',
      },
      {
        label: 'PM 要懂的点',
        content:
          '· 能力边界：开放词汇 vs 封闭技能表\n· 数据依赖：演示/遥操作/真实场景数据\n· 评估指标：成功率、耗时、泛化（新物体/新环境）\n· 产品形态：端侧推理 vs 云边协同，影响成本与隐私',
      },
      {
        label: '面试怎么讲「拿杯子」',
        content:
          '按四段拆：感知（检出杯子与桌面）→ 理解（指令意图）→ 规划（接近/抓取路径）→ 执行（控制与反馈）。并指出最易失败环节与产品兜底（确认、重试、解释）。',
      },
      {
        label: '易混淆',
        content:
          'VLM（视觉语言模型）只做理解/描述，不一定输出动作；VLA 的关键交付是 Action。',
      },
    ],
  }),

  defineEntry('RT-2', {
    aliases: ['Robotics Transformer 2'],
    module: '技术',
    definition:
      'Google DeepMind 的 VLA 路线代表性工作，强调把互联网视觉-语言预训练知识迁移到机器人控制。',
    sections: [
      {
        label: '是什么',
        content:
          '核心叙事：机器人不必从零学世界知识，可借用网页/图片上的语义理解，再对齐到动作。相对早期只靠机器人专用数据的方案，泛化叙事更强。',
      },
      {
        label: '对 PM 的启示',
        content:
          '商业化时留意：闭源/不可得、复现成本高。做竞品对标时写清「能力叙事 vs 可交付 SDK/数据」。开发者产品更常对标 OpenVLA 一类开源栈。',
      },
    ],
  }),

  defineEntry('OpenVLA', {
    aliases: ['开源 VLA'],
    module: '技术',
    definition:
      '开源 7B 量级 VLA，基于 Open X-Embodiment 等多源机器人数据训练，便于研究与工程复现。',
    sections: [
      {
        label: '是什么',
        content:
          '面向可获得性：权重、训练设定相对公开，适合高校/创业团队验证「语言驱动操作」类能力，而非直接等于量产产品方案。',
      },
      {
        label: '和 RT-2 怎么比（PM 表）',
        content:
          '维度建议：开放度、参数量与算力成本、数据来源、可复现性、商用许可、落地案例成熟度。结论通常是：研究/原型偏好开源；大厂闭源在叙事与资源上更强。',
      },
    ],
  }),

  defineEntry('Open X-Embodiment', {
    aliases: ['OXE'],
    module: '技术',
    definition:
      '跨机构汇总的大规模机器人操作数据集与协作倡议，用于训练更具泛化的策略/VLA。',
    sections: [
      {
        label: '是什么',
        content:
          '核心价值：把分散实验室的轨迹/演示汇到统一格式，减轻「数据烟囱」。OpenVLA 等模型依赖这类异构数据规模。',
      },
      {
        label: 'PM 视角',
        content:
          '数据战略常比单模型版本更关键：谁贡献数据、标注标准、许可、评估协议。做数据飞轮设计时要对齐「采集格式是否可并入这类生态」。',
      },
    ],
  }),

  defineEntry('强化学习', {
    aliases: ['RL', 'Reinforcement Learning'],
    module: '技术',
    definition:
      '智能体通过与环境交互，根据奖励信号优化策略的学习范式；机器人中常用于运动与操作控制。',
    sections: [
      {
        label: '是什么',
        content:
          '要素：状态、动作、奖励、策略。算法如 PPO、SAC。挑战：奖励难设计、样本效率低、仿真到现实（sim-to-real）差距。',
      },
      {
        label: '和模仿学习怎么选',
        content:
          '· RL：适合有清晰奖励或可仿真、能大量试错的任务（运动、博弈）\n· 模仿学习/IL：适合易演示、难写奖励的家庭操作\n实务多为组合：演示初始化 + RL 精调，或 IL + VLA',
      },
      {
        label: 'PM 落地问题',
        content:
          '问研发：奖励定义是谁？失败成本？是否必须实机试错？安全约束如何写进训练？产品文档里要把「可演示成功率」和「奖励黑客风险」写明白。',
      },
    ],
  }),

  defineEntry('PPO', {
    aliases: ['Proximal Policy Optimization'],
    module: '技术',
    definition:
      'Proximal Policy Optimization，一种限制策略更新幅度的策略梯度算法，训练相对稳定，工业界常用。',
    sections: [
      {
        label: '是什么',
        content:
          '通过裁剪目标函数避免一次更新太大导致崩溃，是机器人/游戏 RL 的默认基线之一。PM 不需要推导公式，知道「稳定、常用」即可。',
      },
      {
        label: '沟通用语',
        content:
          '听工程师说「上 PPO」≈用成熟 RL 基线做运动或控制；继续追问：仿真还是实机、奖励是什么、迁移到真机怎么验。',
      },
    ],
  }),

  defineEntry('SAC', {
    aliases: ['Soft Actor-Critic'],
    module: '技术',
    definition:
      'Soft Actor-Critic，一类最大熵强化学习算法，鼓励探索，常用于连续动作控制。',
    sections: [
      {
        label: '是什么',
        content:
          '在优化回报的同时最大化策略熵，动作更「多样化探索」。机器人连续关节控制场景常见。',
      },
      {
        label: '和 PPO 的粗线条对比',
        content:
          'PPO：on-policy，实现与调参生态成熟；SAC：off-policy，样本效率叙事常更强。选型交给算法，PM 关心：样本量、稳定性、真机风险。',
      },
    ],
  }),

  defineEntry('模仿学习', {
    aliases: ['IL', 'Imitation Learning', '行为克隆'],
    module: '技术',
    definition:
      '从专家演示中学习策略，通常不需要显式设计奖励函数；家庭操作场景很常见。',
    sections: [
      {
        label: '是什么',
        content:
          '常见路径：行为克隆（BC）直接拟合专家动作；还有从演示推断奖励的方法。数据来自遥操作、人类示范、视频等。',
      },
      {
        label: '产品影响',
        content:
          '演示质量=产品质量。PM 要设计采集工具、标注规范、难例挖掘与隐私合规。评价指标除成功率外，看「分布外」（没演示过的物体）是否崩。',
      },
      {
        label: '局限',
        content:
          '专家覆盖不足会导致 compounding error；纯模仿难超越专家。常与 RL、扩散策略或 VLA 组合使用。',
      },
    ],
  }),

  defineEntry('Diffusion Policy', {
    aliases: ['扩散策略'],
    module: '技术',
    definition:
      '用扩散模型对动作序列建模与生成的策略方法，擅长多峰（多种合理解法）的动作分布。',
    sections: [
      {
        label: '是什么',
        content:
          '传统策略网络常输出单峰动作；扩散式策略通过逐步去噪生成整段动作，对「同一任务多种抓法」更友好，在机器人操作论文与 Demo 中常见。',
      },
      {
        label: 'PM 价值',
        content:
          'Demo 叙事强：可展示柔顺、多样轨迹。代价是推理算力与延迟。产品化要评估：边缘是否跑得动、实时控制是否够用、失败是否可中断。',
      },
    ],
  }),

  defineEntry('世界模型', {
    aliases: ['World Model'],
    module: '技术',
    definition:
      '对环境动态的内部预测模型：想象「若我这样做，世界会怎样」，用于规划、仿真与样本效率提升。',
    sections: [
      {
        label: '是什么',
        content:
          '不只是地图，而是可预测的状态转移。可支持：在想象中 rollout、减少真机试错、做模型预测控制（MPC）类规划。',
      },
      {
        label: 'PM 视角',
        content:
          '承诺「会规划」时，问清世界模型覆盖哪些变量（几何、接触、人）。评估看预测误差与下游任务成功率，而不是单独刷生成视频效果。',
      },
    ],
  }),

  defineEntry('Sim-to-Real', {
    aliases: ['仿真到现实', 'Sim2Real'],
    module: '技术',
    definition:
      '在仿真中训练策略，再迁移到真实机器人；差距（reality gap）是落地核心风险。',
    sections: [
      {
        label: '是什么',
        content:
          '仿真便宜且安全，但接触、摩擦、传感噪声与真机不一致。常用 domain randomization（领域随机化）缩小差距。',
      },
      {
        label: 'PM 风险清单',
        content:
          '· 仿真里 95% ≠ 真机可交付\n· 验收必须以真机场景为准\n· 里程碑拆：仿真达标 → 限定工况真机 → 开放场景',
      },
    ],
  }),

  defineEntry('遥操作', {
    aliases: ['Teleoperation', 'Teleop'],
    module: '技术',
    definition:
      '人通过手柄/VR/外骨骼远程控制机器人，常用于演示数据采集与高风险场景兜底。',
    sections: [
      {
        label: '是什么',
        content:
          '短期可解决自主不足；长期是数据引擎：遥操作轨迹可训练模仿学习/VLA。产品上也可作为「人在回路」安全模式。',
      },
      {
        label: '产品设计点',
        content:
          '延迟、力反馈、权限切换、谁在控、意外接管。ToB 场景要明确 SLA：自主失败后几秒内可由人接管。',
      },
    ],
  }),

  // ========== 感知与硬件 ==========
  defineEntry('多模态感知', {
    aliases: ['Multimodal Perception'],
    module: '硬件',
    definition:
      '融合视觉、力觉、触觉、听觉等多种传感器信息，形成对环境的统一理解。',
    sections: [
      {
        label: '是什么',
        content:
          '单一 RGB 不够稳：遮挡、反光、透明物体需要深度/力觉补充。融合提升鲁棒，也增加成本与标定复杂度。',
      },
      {
        label: '选型表（PM）',
        content:
          '场景决定传感器：导航看 LiDAR/深度；抓取看深度+力；家庭控成本可能砍激光雷达。写 PRD 时把「没有某传感器时的降级体验」写清楚。',
      },
    ],
  }),

  defineEntry('IMU', {
    aliases: ['惯性测量单元'],
    module: '硬件',
    definition:
      'Inertial Measurement Unit，测三轴加速度与角速度，用于姿态估计、平衡与运动控制。',
    sections: [
      {
        label: '是什么',
        content:
          '输出高频运动信号，常与腿足/机体控制闭环结合。单独 IMU 会漂，需与视觉里程计等融合。',
      },
      {
        label: '产品相关',
        content:
          '摔倒检测、站立稳定、运动模式切换都依赖 IMU 质量。成本占比不高但选型影响控制上限。',
      },
    ],
  }),

  defineEntry('深度相机', {
    aliases: ['RGB-D', 'Depth Camera'],
    module: '硬件',
    definition:
      '同时输出彩色与深度（距离）信息的相机，是室内导航与抓取的常见视觉方案。',
    sections: [
      {
        label: '是什么',
        content:
          '原理包括结构光、ToF、双目等。优点：稠密深度、成本相对激光雷达更低；缺点：户外强光、黑色吸光物、远距精度差。',
      },
      {
        label: '和激光雷达',
        content:
          '激光雷达：测距准、抗光更好、贵、点云稀疏；深度相机：近距离语义友好、便宜。家庭产品更多深度相机，工业巡检可能上激光雷达。',
      },
    ],
  }),

  defineEntry('激光雷达', {
    aliases: ['LiDAR'],
    module: '硬件',
    definition:
      '通过激光测距构建环境点云，用于定位导航与避障，精度与抗干扰通常强于消费级深度相机。',
    sections: [
      {
        label: 'PM 取舍',
        content:
          '加 LiDAR 直接抬 BOM 与结构复杂度。问：任务是否必须远程高精度建图？若主要是桌面操作，深度相机+好算法可能更划算。',
      },
    ],
  }),

  defineEntry('伺服驱动器', {
    aliases: ['Servo Driver'],
    module: '硬件',
    definition:
      '控制电机按指令精确运动的功率电子与控制单元，是关节力矩/位置环的执行核心。',
    sections: [
      {
        label: '是什么',
        content:
          '上接运动控制指令，下驱电机。性能影响：响应速度、力矩精度、发热与噪音。人形高自由度意味着驱动器数量与成本堆积。',
      },
      {
        label: '对定价的影响',
        content:
          '整机成本结构中，执行器（电机+减速器+驱动）往往是大头。PM 做价格带对标时，要落到「自由度 × 单关节成本」。',
      },
    ],
  }),

  defineEntry('关节模组', {
    aliases: ['关节单元', 'Actuator Module'],
    module: '硬件',
    definition:
      '集成电机、减速器、编码器（及驱动）的标准化关节单元，便于量产与维修。',
    sections: [
      {
        label: '是什么',
        content:
          '模块化降低装配难度，利于供应链与售后更换。参数关注：峰值/额定扭矩、减速比、编码器分辨率、通信总线。',
      },
      {
        label: '产品差异化',
        content:
          '同一形态机器人，关节供应链与自研深度决定成本与迭代速度。竞品分析应写清：自制 vs 外采、冗余与安全。',
      },
    ],
  }),

  defineEntry('编码器', {
    module: '硬件',
    definition: '测量电机/关节角度或位置的传感器，是闭环控制「知不知道自己在哪」的基础。',
    sections: [
      {
        label: '是什么',
        content:
          '增量式/绝对式等类型影响断电后是否丢位置。高精度编码器提升控制品质，也增加成本。',
      },
    ],
  }),

  // ========== 产品 ==========
  defineEntry('数据飞轮', {
    aliases: ['Data Flywheel'],
    module: '产品',
    definition:
      '产品使用产生数据 → 训练更好模型 → 体验更好 → 更多使用/数据，形成正向循环。',
    sections: [
      {
        label: '是什么',
        content:
          '具身场景中，飞轮往往卡在：采集贵、标注难、隐私敏感、真机数据少。需要主动设计激励与回流管道，而不是假设「上线自然有数据」。',
      },
      {
        label: '设计清单',
        content:
          '1）采什么：失败片段、遥操作、传感器包\n2）为何用户愿给：功能解锁、本地优先、脱敏\n3）如何进训练：格式、质检、评估集隔离\n4）如何度量飞轮：周新增有效小时、模型版本提升',
      },
      {
        label: '合规',
        content:
          '家庭/语音/摄像头数据默认高敏感。PRD 必须写：同意书、本地处理、可删除、用途边界。',
      },
    ],
  }),

  defineEntry('数据闭环', {
    aliases: ['Data Loop'],
    module: '产品',
    definition:
      '采集 → 标注/清洗 → 训练 → 仿真/实机评测 → 部署 → 线上反馈 → 再采集的完整链路。',
    sections: [
      {
        label: '和数据飞轮的关系',
        content:
          '闭环是工程链路；飞轮是增长/竞争叙事。没有可靠闭环，飞轮只是 PPT。',
      },
      {
        label: '瓶颈常在哪',
        content:
          '标注成本、仿真差距、评测集不代表真实场景、部署版本混乱。周会应用「瓶颈环节」而不是只报模型分数。',
      },
    ],
  }),

  defineEntry('PRD', {
    aliases: ['产品需求文档', 'Product Requirements Document'],
    module: '产品',
    definition:
      '定义背景、目标用户、需求、方案边界、验收标准与非目标，是研发对齐的合同式文档。',
    sections: [
      {
        label: '建议结构',
        content:
          '背景与目标 → 用户与场景 → 需求列表（P0/P1/P2）→ 流程/交互 → 数据与指标 → 非目标与依赖 → 里程碑与风险',
      },
      {
        label: '具身智能特有章节',
        content:
          '· 硬件约束与自由度假设\n· 自主等级与人机接管\n· 安全与失效模式\n· 仿真 vs 真机验收标准\n· 数据采集与隐私',
      },
      {
        label: '好 PRD 的验收句式',
        content:
          '避免「智能避障体验好」。改成：「在 X 家居平面、光照 Y 下，对高度>Z 的障碍物，碰撞率 < a%，平均绕行耗时 < b 秒」。',
      },
    ],
  }),

  defineEntry('MVP', {
    aliases: ['最小可行产品'],
    module: '产品',
    definition:
      '用最小功能集验证核心假设的产品版本，避免一上来做全能力通用机器人。',
    sections: [
      {
        label: '具身场景怎么砍',
        content:
          '优先验证「单场景单技能」是否值得做，例如只做餐桌上归位，而不是全家自主。砍的是场景广度与技能数，不是安全底线。',
      },
      {
        label: '面试点',
        content:
          '能说清：假设是什么、MVP 包含/不包含、成功指标、失败后如何 pivot。',
      },
    ],
  }),

  defineEntry('JTBD', {
    aliases: ['Jobs to Be Done', '待办任务'],
    module: '产品',
    definition:
      '用户「雇用」产品所要完成的事；强调情境与进度，而非只列功能点。',
    sections: [
      {
        label: '写法示例',
        content:
          '弱：用户需要语音控制。\n强：当双手被占用时，用户想让机器人把水杯拿过来，以便继续手上的事。',
      },
      {
        label: '和痛点的关系',
        content:
          '痛点是现状折磨；JTBD 是进步目标。用户调研输出应两者都有，再映射到 P0 功能。',
      },
    ],
  }),

  defineEntry('Trade-off', {
    aliases: ['取舍'],
    module: '产品',
    definition:
      '在成本、性能、可靠性、工期等冲突目标间做可解释的选择；面试高频考察。',
    sections: [
      {
        label: '表达模板',
        content:
          '背景 → 选项 A/B → 约束（预算/算力/安全）→ 选择与放弃 → 验证方式 → 复盘。具身常例：自由度 vs 价格、云端智能 vs 隐私延迟、通用人形 vs 专用形态。',
      },
    ],
  }),

  defineEntry('人在回路', {
    aliases: ['Human-in-the-loop', 'HITL'],
    module: '产品',
    definition:
      '关键决策或操作仍由人监督/接管，用于安全、标注与能力不足时的兜底。',
    sections: [
      {
        label: '产品形态',
        content:
          '遥操作接管、动作确认弹窗、远程客服介入、人工复核标注。商业化早期几乎必然需要 HITL，别在 PRD 里假装全自主。',
      },
    ],
  }),

  // ========== 学术与会议 ==========
  defineEntry('CoRL', {
    aliases: ['Conference on Robot Learning'],
    module: '学术',
    definition:
      'Conference on Robot Learning，聚焦机器人学习（学习方法+机器人）的重要会议。',
    sections: [
      {
        label: 'PM 怎么用',
        content:
          '每月/每季扫标题：看哪些能力从论文走向产品（VLA、扩散策略、世界模型）。整理 3 篇要点即可进面试素材库。',
      },
    ],
  }),

  defineEntry('ICRA', {
    aliases: ['IEEE ICRA'],
    module: '学术',
    definition:
      'IEEE International Conference on Robotics and Automation，机器人学旗舰会议之一，覆盖更广的机器人系统与应用。',
    sections: [
      {
        label: '和 CoRL',
        content:
          'ICRA/IROS 更大更全；CoRL 更偏学习。做技术雷达两者都看：系统栈看 ICRA，学习范式看 CoRL。',
      },
    ],
  }),

  defineEntry('IROS', {
    module: '学术',
    definition:
      'IEEE/RSJ International Conference on Intelligent Robots and Systems，与 ICRA 同级的重要机器人会议。',
    sections: [
      {
        label: '用途',
        content: '追踪操作、导航、人机交互、系统集成类进展；适合补充「工程可落地」视角。',
      },
    ],
  }),

  // ========== 公司与产品 ==========
  defineEntry('宇树', {
    aliases: ['Unitree'],
    module: '公司',
    definition:
      'Unitree，中国四足与人形机器人头部公司之一，以高性价比消费/科研向产品与开源生态著称。',
    sections: [
      {
        label: '产品与定位',
        content:
          '四足（如 Go 系列）到人形（G1/H1 等）路径清晰；强调性价比与开发者/科研可及性。竞品分析时常作为「性能-价格」锚点。',
      },
      {
        label: 'PM 研究切入',
        content:
          '看官网参数、GitHub SDK、融资与场景叙事。作业级输出：1 页公司档案 + SDK 能力分类 + Go2 vs G1 取舍。',
      },
    ],
  }),

  defineEntry('优必选', {
    aliases: ['UBTECH'],
    module: '公司',
    definition:
      'UBTECH，中国人形机器人上市公司，Walker 等产品线，偏政企/行业与品牌展示场景。',
    sections: [
      {
        label: '差异化阅读',
        content:
          '对比宇树时看：上市与融资结构、场景（政务/教育/工业演示）、价格带与交付模式。避免只比参数表。',
      },
    ],
  }),

  defineEntry('智元', {
    aliases: ['AgiBot', '智元机器人'],
    module: '公司',
    definition:
      'AgiBot（智元），主打具身智能与人形机器人的新兴玩家，远征等产品线受关注。',
    sections: [
      {
        label: '分析要点',
        content:
          '关注技术路线叙事（数据/模型）、生态合作、与华为等产业协同传闻与事实的区分、量产与订单进展。信息源交叉验证。',
      },
    ],
  }),

  defineEntry('Optimus', {
    aliases: ['Tesla Bot', '特斯拉人形'],
    module: '公司',
    definition:
      'Tesla 人形机器人项目，目标从工厂到家庭的通用劳动力平台叙事。',
    sections: [
      {
        label: '为何重要',
        content:
          '定义全球舆论与估值锚；技术上绑定 Tesla 视觉与 AI 栈。对标时写清：愿景 vs 当前可演示能力 vs 交付时间不确定性。',
      },
      {
        label: 'PM 借鉴',
        content:
          '端到端视觉、数据闭环、成本工程。写报告时避免神化，用公开里程碑与任务成功率说话。',
      },
    ],
  }),

  defineEntry('波士顿动力', {
    aliases: ['Boston Dynamics', 'Spot'],
    module: '公司',
    definition:
      '波士顿动力，以 Spot、Atlas 等高动态机器人闻名；Spot SDK 常作开发者生态竞品标杆。',
    sections: [
      {
        label: '对开发者产品的意义',
        content:
          '项目一竞品分析常对标 Spot SDK：文档、API 完整度、安全权限、价格门槛。差异化可落在易用性、中文生态、价格与场景包。',
      },
    ],
  }),

  defineEntry('ROS', {
    aliases: ['Robot Operating System', 'ROS2'],
    module: '技术',
    definition:
      '机器人领域广泛使用的开源中间件与工具生态，提供通信、驱动、仿真与包管理，并非传统意义上的操作系统。',
    sections: [
      {
        label: '是什么',
        content:
          'ROS/ROS2 让感知、规划、控制模块以节点形式拼装。工业与科研大量存量工具在此生态。',
      },
      {
        label: 'PM 注意',
        content:
          '做开发者平台要决定：兼容 ROS 生态还是自研 SDK？兼容则降低迁移成本，维护负担上升。',
      },
    ],
  }),

  // ========== 面试与方法 ==========
  defineEntry('STAR', {
    aliases: ['STAR 法则'],
    module: '面试',
    definition:
      'Situation-Task-Action-Result，结构化讲述经历的面试表达框架。',
    sections: [
      {
        label: '怎么用',
        content:
          '情境（何时何背景）→ 任务（你的目标）→ 行动（你做了什么，突出决策）→ 结果（量化或可验证）。「为什么做具身 PM」也可用精简 STAR。',
      },
    ],
  }),

  defineEntry('P0/P1/P2', {
    aliases: ['优先级'],
    module: '产品',
    definition:
      '需求优先级分级：P0 必须上线/阻塞发布，P1 重要可迭代，P2 有更好没有也能活。',
    sections: [
      {
        label: '划法原则',
        content:
          '对齐用户核心 JTBD 与风险（安全永远可上升为 P0）。写清每条 P0 的「一句话价值」与验收，避免假 P0。',
      },
    ],
  }),

  defineEntry('SDK', {
    aliases: ['Software Development Kit'],
    module: '产品',
    definition:
      '软件开发工具包：API、文档、示例、工具链，让外部开发者集成与扩展你的机器人能力。',
    sections: [
      {
        label: '开发者产品核心',
        content:
          '成功指标常是：首次跑通时间、文档完备度、示例覆盖、社区问题响应。竞品分析框架可借鉴 Spot SDK / ROS。',
      },
    ],
  }),

  defineEntry('BOM', {
    aliases: ['物料清单', 'Bill of Materials'],
    module: '硬件',
    definition:
      '产品物料清单与成本结构；硬件机器人定价与毛利分析的基础。',
    sections: [
      {
        label: 'PM 用法',
        content:
          '不需会做账，但要会问：执行器、传感、计算、结构件各占多少？降本杠杆在哪？降自由度或换供应商对体验的影响？',
      },
    ],
  }),
]
