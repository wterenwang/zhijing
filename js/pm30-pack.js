/**
 * PM30 金标准课包：以虚构产品「拾光自习室」贯穿 30 天。
 * 注意：案例中的用户、访谈与指标均为教学假设，不代表任何真实公司数据。
 */
const PM30_PACK_ID = 'pm-30-intro';
const PM30_CASE = {
  name: '拾光自习室',
  disclosure: '虚构教学案例：帮助备考者把模糊学习目标拆成可执行计划，并在专注后留下证据。',
  constraints: '2 名工程师 + 1 名设计师，6 周交付 MVP；案例数字仅供练习，必须由真实研究验证。',
};

const p = (day, phase, week, topic, objective, tasks, deliverable) => ({
  day, phase, week, topic, objective, tasks, deliverable,
  prerequisites: day === 1 ? [] : [`完成 Day ${day - 1} 的交付物`],
  estimatedMinutes: day % 7 === 0 || day === 30 ? 90 : 60,
  citations: ['S1'],
  caseStudy: PM30_CASE.name,
  caseDisclosure: PM30_CASE.disclosure,
});

const PM30_LEARNING_PLAN = [
  p(1,'发现正确的问题','第1周：问题发现','PM 的责任与决策闭环','区分产品管理与项目推进，建立结果责任意识',['用“问题—选择—交付—学习”复述 PM 工作','为拾光写一条用户结果与一条业务结果','列出 PM/设计/研发各自决策权'],'角色边界卡'),
  p(2,'发现正确的问题','第1周：问题发现','产品愿景与价值主张','把功能描述改写为目标用户的可验证价值',['定义备考者及关键场景','写现状替代方案与不满意之处','完成一句话价值主张并标注假设'],'价值主张 v1'),
  p(3,'发现正确的问题','第1周：问题发现','目标用户与细分','用行为、需求和约束细分，而非人口标签',['提出 3 个行为型细分','按痛点强度与可触达性选首要细分','写明暂不服务的人群'],'首要用户定义'),
  p(4,'发现正确的问题','第1周：问题发现','JTBD 与场景','用进展、触发、阻力描述用户任务',['写一个功能性任务和情绪性任务','补触发时刻、现有替代与阻力','把“需要番茄钟”改写成任务陈述'],'JTBD 画布'),
  p(5,'发现正确的问题','第1周：问题发现','假设地图与风险','把意见拆成可证伪的价值、可用性、可行性、商业假设',['列出拾光的 8 条假设','按重要性×证据强度排序','选出本周先验证的最危险假设'],'假设地图'),
  p(6,'发现正确的问题','第1周：问题发现','需求证据与伪需求','建立事实、解释、机会、方案四层证据链',['把 5 条反馈分成事实与解释','为“加排行榜”追问三层为什么','写出反证条件和停止标准'],'证据链记录'),
  p(7,'发现正确的问题','第1周：问题发现','周复盘①：问题机会简报','完成第一次作品检查点，证明问题值得继续',['合并角色、用户、JTBD、假设与证据','做 5 分钟问题评审','按证据删除或降级至少一个假设'],'检查点①：问题机会简报'),

  p(8,'用研究降低不确定性','第2周：研究与定义','研究计划与招募','让研究问题、对象、方法和决策一一对应',['写 3 个研究问题而非访谈问题','制定筛选条件与排除条件','说明样本局限及不会得出的结论'],'研究计划'),
  p(9,'用研究降低不确定性','第2周：研究与定义','问题访谈','用最近一次真实行为替代意愿投票',['设计 8 个开放问题','完成一次真人访谈；不可行则做标注局限的演练','逐字记录行为、原话与追问'],'访谈记录'),
  p(10,'用研究降低不确定性','第2周：研究与定义','观察、信号与偏差','从行为证据识别痛点强度并控制确认偏差',['标注事实/引语/解释','主动找一条反例','记录频率、代价和替代方案'],'证据编码表'),
  p(11,'用研究降低不确定性','第2周：研究与定义','洞察聚类与机会树','从业务结果连接机会，而不是直接挂方案',['把证据聚成 3–5 个机会','区分机会与解决方案','选一个机会并写选择依据'],'机会解决方案树 v1'),
  p(12,'用研究降低不确定性','第2周：研究与定义','问题陈述与成功标准','定义谁在何时遇到何种障碍及可观测影响',['写无方案词的问题陈述','定义基线、目标方向和时间窗','列非目标与证伪条件'],'问题陈述 v1'),
  p(13,'用研究降低不确定性','第2周：研究与定义','替代方案与竞品研究','研究用户如何完成任务，避免功能抄表',['选择直接、间接、无产品三类替代','按触发—行动—反馈比较主流程','提炼可借鉴机制与不可照搬条件'],'替代方案对比'),
  p(14,'用研究降低不确定性','第2周：研究与定义','周复盘②：研究证据评审','完成第二次作品检查点，让结论可追溯',['从问题陈述反查每条证据','标出样本偏差与未知项','依据反例修订机会优先级'],'检查点②：研究与问题定义包'),

  p(15,'设计可验证方案','第3周：方案与 PRD','方案发散与选择','同一机会至少比较三种机制后再收敛',['独立生成 3 个方案方向','比较用户价值、成本、风险、学习速度','记录选中与放弃理由'],'方案决策记录'),
  p(16,'设计可验证方案','第3周：方案与 PRD','用户故事与验收标准','把价值切成可测试的行为增量',['写 5 条用户故事','为关键故事写 Given/When/Then','补权限、空态、错态和边界'],'故事与验收清单'),
  p(17,'设计可验证方案','第3周：方案与 PRD','优先级与 MVP 边界','用 RICE 作讨论输入，用风险与依赖校正',['给候选项估算 RICE 并写置信来源','定义 MVP 必须验证的唯一核心假设','明确本期不做及触发重评条件'],'MVP 范围表'),
  p(18,'设计可验证方案','第3周：方案与 PRD','用户流程与状态','同时设计主路径、系统状态和恢复路径',['绘制建计划到完成专注的主流程','列 loading/empty/error/success 状态','为中断、失败、退出设计恢复'],'端到端流程图'),
  p(19,'设计可验证方案','第3周：方案与 PRD','信息架构与低保真原型','用最低保真度验证结构和交互，而非视觉喜好',['定义对象、层级与导航','画 5 个关键界面线框','为每屏写用户问题与交互反馈'],'可点击低保真原型'),
  p(20,'设计可验证方案','第3周：方案与 PRD','可用性测试','用观察任务发现问题，不教用户操作',['写 3 个基于目标的任务','招募 3 名目标特征参与者或做标注局限的演练','记录成功、卡点、言语与严重度'],'可用性测试报告'),
  p(21,'设计可验证方案','第3周：方案与 PRD','周复盘③：PRD 与原型评审','完成第三次作品检查点，把方案变成团队可执行共识',['写完整 PRD v1','以用户故事逐条走查原型','关闭 P0 歧义并登记待决问题'],'检查点③：PRD v1 + 原型'),

  p(22,'验证价值并讲清决策','第4周：验证与表达','指标树与护栏','从用户价值结果拆领先指标并防止局部优化',['选择一个价值指标并解释因果','拆激活、使用、结果指标','设置体验、作弊或成本护栏'],'指标树'),
  p(23,'验证价值并讲清决策','第4周：验证与表达','事件模型与埋点','让事件、属性、口径和决策问题对应',['画关键漏斗','写事件名、触发时机、属性与去重规则','给每个事件绑定要回答的决策'],'埋点字典'),
  p(24,'验证价值并讲清决策','第4周：验证与表达','验证方案与实验选择','按风险选择访谈、原型、假门、试点或实验',['为三类假设匹配验证方法','写主要指标、护栏、时间窗和分群','说明何时不能声称因果'],'验证方案 v1'),
  p(25,'验证价值并讲清决策','第4周：验证与表达','上线、灰度与回滚','把发布当作受控学习过程',['列上线前功能/数据/支持检查','定义灰度人群、观察窗和负责人','写暂停、回滚和告警阈值'],'发布与回滚清单'),
  p(26,'验证价值并讲清决策','第4周：验证与表达','跨职能评审与决策日志','用共同目标、证据和约束处理分歧',['分别预演设计/研发/运营质疑','写决策、选项、依据、负责人、复议时间','把一个争论改成可验证问题'],'评审包与决策日志'),
  p(27,'验证价值并讲清决策','第4周：验证与表达','结果分析与迭代','区分信号、噪声和分群差异，选择继续、修改或停止',['用教学数据练习漏斗诊断','检查埋点质量与选择偏差','写继续/修改/停止建议及下一证据'],'迭代决策备忘录'),
  p(28,'验证价值并讲清决策','第4周：验证与表达','周复盘④：作品验收','完成第四次作品检查点，交付可复核的完整案例',['串联证据—决策—原型—验证','检查引用、假设标注和版本记录','用验收清单补齐缺口'],'检查点④：完整作品包'),
  p(29,'验证价值并讲清决策','第5周：讲述与迁移','面试案例讲述与追问','以决策质量和学习证明能力，不虚构结果',['写 3 分钟问题—证据—取舍—验证讲述','准备失败、冲突、指标、反事实追问','录音后删除空话并标注教学案例'],'面试讲述稿'),
  p(30,'验证价值并讲清决策','第5周：讲述与迁移','终局评审与 30/60/90 计划','交付 PRD、原型、验证方案与可信讲述，并迁移方法',['做 10 分钟终局评审','归档完整 PRD、原型、验证方案和讲述稿','基于能力缺口制定 30/60/90 天计划'],'终局交付包'),
];

const PM30_EXERCISE_INPUT = [
  ['PM 的四步决策闭环是什么？','为“提升学习体验”补用户结果和业务结果。','若研发坚持按时上线但问题证据不足，你如何决策？','角色边界卡'],
  ['价值主张必须回答哪三件事？','把“智能生成计划”改写成用户价值主张。','把同一能力迁移到健身计划产品，哪些假设会变化？','价值主张'],
  ['为什么人口属性不足以形成可行动细分？','用行为、需求、约束细分备考者。','预算减半时，你会优先服务哪个细分，为什么？','首要用户定义'],
  ['JTBD 中“任务”与“功能”有何区别？','为临考一月却频繁拖延者写任务陈述。','把该任务迁移到线下自习空间，阻力会怎样变化？','JTBD'],
  ['四类产品风险分别是什么？','给拾光列 4 条可证伪假设并排序。','若技术可行但价值证据最弱，应先做什么测试？','假设地图'],
  ['事实、解释、机会、方案如何区分？','拆解“用户要排行榜”背后的证据链。','当强烈诉求只来自一人时，如何处理而不忽略信号？','证据链'],
  ['问题机会简报应包含哪些证据？','用五句话讲清拾光的问题机会。','指出本周最弱证据并设计下周补证动作。','问题机会简报'],
  ['研究问题与访谈问题有何不同？','写一条研究问题及对应招募条件。','若只能访谈现有重度用户，会带来什么偏差？','研究计划'],
  ['为什么要问最近一次行为而非未来意愿？','把“你会用计划功能吗”改成行为问题。','受访者只给抽象评价时，你如何追问？','访谈记录'],
  ['确认偏差如何污染访谈结论？','从一段记录中分别写事实、引语和解释。','发现反例与原假设冲突时，如何更新判断？','证据编码表'],
  ['机会解决方案树的三层是什么？','把“AI 自动排课”从机会节点移到方案节点。','业务目标变化为降低流失时，树应如何重构？','机会树'],
  ['合格问题陈述包含哪些要素？','写一条不含功能词的问题陈述。','若无法获得可靠基线，如何定义可观测成功？','问题陈述'],
  ['为何替代方案不只包含同类 App？','按主流程比较纸质计划表与拾光。','竞争者复制功能后，什么机制仍可形成差异？','替代方案对比'],
  ['研究结论可追溯是什么意思？','为一条洞察建立“原话—解释—机会”链。','样本与目标人群不完全匹配时，如何降级结论？','研究定义包'],
  ['方案发散后应按哪些条件收敛？','比较提醒、陪伴、自动排程三种机制。','若期限从 6 周缩到 2 周，你会改变哪个取舍？','方案决策记录'],
  ['用户故事与验收标准各解决什么问题？','为“调整今日计划”写故事与 Given/When/Then。','离线场景下验收标准需增加哪些边界？','故事验收清单'],
  ['RICE 四项是什么，为什么置信度重要？','给三个候选功能排序并说明估算依据。','高风险低分项可能何时仍应优先？','MVP 范围表'],
  ['流程图为什么必须包含异常与恢复？','补出专注中断后的三种系统状态。','把流程迁移到多人学习小组，会新增哪些状态？','流程图'],
  ['信息架构与界面布局有何区别？','为“计划—专注—复盘”定义对象和导航。','测试发现用户按课程而非日期找任务，应改哪一层？','低保真原型'],
  ['可用性测试为何不能边测边教？','把“看看首页”改写成目标型任务。','3 人中 1 人失败，如何判断是否立即改版？','可用性报告'],
  ['PRD 的范围与非目标分别有什么作用？','为核心故事补边界、依赖和验收。','研发指出方案成本翻倍时，PRD 哪些段落必须更新？','PRD 与原型'],
  ['结果指标、过程指标、护栏指标有何关系？','为完成有效专注设计一棵指标树。','时长提升但主动退出率也升高，如何判断？','指标树'],
  ['事件名、触发时机、属性、口径为何缺一不可？','定义 plan_created 与 focus_completed 事件。','跨设备重复上报会如何影响决策，怎样防范？','埋点字典'],
  ['验证价值、可用性、可行性分别适合什么方法？','为“用户愿意按计划开始”设计最低成本验证。','没有随机分流条件时，如何表述结果而不误称因果？','验证方案'],
  ['灰度、暂停、回滚三者有何区别？','为拾光写 5 项上线前检查与回滚阈值。','核心指标上升但投诉激增时谁决定暂停，依据什么？','发布清单'],
  ['决策日志至少记录哪些字段？','把“研发觉得太难”改写成选项与约束。','两方证据都不足时，怎样设计可逆决策？','决策日志'],
  ['为什么总体漏斗可能掩盖分群差异？','根据假设性漏斗写继续/修改/停止建议。','指标未变但访谈体验改善，应如何安排下一步？','迭代备忘录'],
  ['完整作品包如何证明决策可追溯？','从问题到验证做一次双向验收。','删除一个产物时，哪个最不应删除，为什么？','完整作品包'],
  ['案例讲述为何应强调取舍而非功能数量？','用 STAR+L 写 3 分钟拾光讲述。','被追问真实上线结果时，如何诚实说明教学案例仍展示能力？','面试讲述稿'],
  ['PM30 的完整交付链是什么？','用验收清单检查 PRD、原型、验证方案、讲述。','把方法迁移到陌生 B2B 场景，前 30 天首先改变什么？','终局交付包'],
];

const PM30_RECALL_ANSWERS = [
  '闭环是发现问题、选择方案、推动交付、验证价值；PM 对结果与取舍负责，项目推进主要保证范围、时间和协作。',
  '价值主张需回答为谁、在什么场景解决什么进展，以及相比现有替代为何更合适。',
  '人口属性不能直接指导产品决策；可行动细分应包含触发、行为、需求、现有替代和约束。',
  '任务描述用户要取得的进展，功能只是可能被采用的实现机制；同一任务可由不同功能完成。',
  '四类风险是价值、可用性、可行性和商业可行性；排序优先看重要性高且证据弱的假设。',
  '事实是可观察材料，解释是对原因的判断，机会是值得改善的困难，方案是可能的实现。',
  '机会简报应包含目标用户、JTBD、问题证据、最危险假设、反例、业务关联和下一步补证。',
  '研究问题描述团队需要理解什么以支持决策；访谈问题是向参与者获取相关行为证据的具体问法。',
  '未来意愿容易受礼貌与想象影响；最近一次行为能提供场景、动作、代价和替代方案等可核对证据。',
  '确认偏差会让研究者只记录支持原假设的材料；应统一提纲、保留反例并分开事实、引语和解释。',
  '机会树从期望结果连接用户机会、多个解决方案和验证实验；“AI 自动排课”属于解决方案。',
  '问题陈述应包含用户、场景、障碍、影响、约束和成功方向，并避免预设界面或技术方案。',
  '替代方案还包括间接工具和不使用产品的做法，因为用户竞争的是完成同一任务的不同方式。',
  '可追溯表示每条结论都能回到原始记录、引语或观察，并标明解释过程、样本局限与信心。',
  '收敛应比较用户价值、风险、成本、依赖、可逆性和学习速度，并记录放弃项和重评条件。',
  '用户故事保留角色、目标和价值语境；验收标准把完成定义为可观察、可测试的行为。',
  'RICE 是触达人数×影响×置信度÷工作量；置信度让估算依据和不确定性显性化。',
  '异常与恢复决定用户失败后能否继续，也暴露开发、数据和支持成本；只有主路径会遗漏这些风险。',
  '信息架构定义对象、层级、标签与导航；界面布局安排这些对象在具体页面中的呈现和交互。',
  '边测边教会改变参与者行为并掩盖可用性问题；主持人应给目标、观察路径并只做中性追问。',
  '范围说明本期承诺交付什么，非目标明确暂不解决什么，两者共同防止需求和验收边界漂移。',
  '结果指标衡量最终价值，过程指标是可能领先于结果的行为信号，护栏指标防止局部优化造成伤害。',
  '事件名、触发时机、属性和口径共同确定记录了什么、何时记录、如何分群以及如何一致计算。',
  '价值可用访谈、假门或试点验证；可用性适合原型任务；可行性适合技术 spike 或小范围实现。',
  '灰度控制暴露范围，暂停停止继续扩大，回滚恢复旧版本；三者都需预设阈值、负责人和路径。',
  '决策日志至少记录背景、选项、决定、依据、负责人、日期和复议条件。',
  '总体漏斗会平均掉渠道、用户阶段或设备差异；分群可能揭示一组改善、另一组恶化。',
  '可追溯作品包应让需求回到机会与证据，也让关键假设连接验证方法、指标和决策门槛。',
  '取舍能展示如何使用证据、约束和风险做决策；功能数量只能说明产出，不能证明决策质量。',
  '完整链路是问题证据→用户/JTBD→机会与假设→方案取舍→PRD/原型→指标与验证→发布学习→可信讲述。',
];

const exerciseReference = (day, type, artifact) => {
  const lesson = PM30_LEARNING_PLAN[day - 1];
  if (type === 'recall') return `参考答案：${PM30_RECALL_ANSWERS[day - 1]}`;
  if (type === 'application') {
    return `示例答案应形成“${artifact}”：${lesson.tasks.join('；')}。其中事实与假设分开，至少写明一项约束和一条可验收条件。`;
  }
  return `迁移答案：先保持“${lesson.objective}”这一决策目标，再识别题目中新用户、成本、期限或风险的变化；据此调整方案并写出一个放弃项、一条待验证假设和下一步证据。`;
};

const exercise = (day, type, q, artifact) => {
  const modes = { recall: 'key-points', application: 'rubric', transfer: 'coach' };
  const rubrics = {
    recall: ['准确覆盖今日核心概念', '能说明概念边界而非只背名词', '答案可在当日章节中追溯'],
    application: [`产出可直接写入“${artifact}”`, '明确使用拾光自习室教学案例', '包含证据、约束或可验收标准'],
    transfer: ['明确新情境改变了什么约束', '给出可执行决策及放弃项', '指出仍需验证的假设'],
  };
  const mistakes = {
    recall: ['把相关术语混为一谈', '只给口号，没有边界或因果'],
    application: ['偷渡未经验证的真实数据', '直接写方案，缺少证据与验收'],
    transfer: ['照搬原案例结论', '忽略新场景的用户、成本或风险变化'],
  };
  return {
    type,
    objective: PM30_LEARNING_PLAN[day - 1].topic,
    q,
    rubric: rubrics[type],
    ref: exerciseReference(day, type, artifact),
    commonMistakes: mistakes[type],
    feedbackMode: modes[type],
  };
};

const PM30_DAY_EXERCISES = Object.fromEntries(PM30_EXERCISE_INPUT.map((row, index) => {
  const day = index + 1;
  return [String(day), [
    exercise(day, 'recall', row[0], row[3]),
    exercise(day, 'application', row[1], row[3]),
    exercise(day, 'transfer', row[2], row[3]),
  ]];
}));

const SOURCE_CATALOG = {
  pmi: { title: 'PMI: What is Project Management?', url: 'https://www.pmi.org/about/what-is-project-management', type: 'primary' },
  svpg: { title: 'SVPG: Product Risk Management', url: 'https://www.svpg.com/four-big-risks/', type: 'expert' },
  strategyzer: { title: 'Strategyzer: Value Proposition Canvas', url: 'https://www.strategyzer.com/library/the-value-proposition-canvas', type: 'primary' },
  jtbd: { title: 'Harvard Business Review: Know Your Customers’ Jobs to Be Done', url: 'https://hbr.org/2016/09/know-your-customers-jobs-to-be-done', type: 'research' },
  nngInterview: { title: 'Nielsen Norman Group: User Interviews', url: 'https://www.nngroup.com/articles/user-interviews/', type: 'research' },
  nngUsability: { title: 'Nielsen Norman Group: Usability Testing 101', url: 'https://www.nngroup.com/articles/usability-testing-101/', type: 'research' },
  nngIA: { title: 'Nielsen Norman Group: Information Architecture', url: 'https://www.nngroup.com/articles/information-architecture-sitemaps/', type: 'research' },
  nngHeuristics: { title: 'Nielsen Norman Group: 10 Usability Heuristics', url: 'https://www.nngroup.com/articles/ten-usability-heuristics/', type: 'research' },
  govResearch: { title: 'GOV.UK Service Manual: User research', url: 'https://www.gov.uk/service-manual/user-research', type: 'government' },
  govPrototype: { title: 'GOV.UK Service Manual: Making prototypes', url: 'https://www.gov.uk/service-manual/design/making-prototypes', type: 'government' },
  productTalk: { title: 'Product Talk: Opportunity Solution Trees', url: 'https://www.producttalk.org/opportunity-solution-tree/', type: 'expert' },
  cucumber: { title: 'Cucumber: Gherkin reference', url: 'https://cucumber.io/docs/gherkin/reference/', type: 'standard' },
  atlassianPRD: { title: 'Atlassian: Product requirements document', url: 'https://www.atlassian.com/agile/product-management/requirements', type: 'primary' },
  intercomRice: { title: 'Intercom: RICE prioritization', url: 'https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/', type: 'primary' },
  scrum: { title: 'The Scrum Guide 2020', url: 'https://scrumguides.org/scrum-guide.html', type: 'standard' },
  googleMetrics: { title: 'Google HEART Framework', url: 'https://research.google/pubs/measuring-the-user-experience-on-a-large-scale-user-centered-metrics-for-web-applications/', type: 'research' },
  amplitude: { title: 'Amplitude: Guide to product metrics', url: 'https://amplitude.com/blog/product-metrics', type: 'primary' },
  experiment: { title: 'Microsoft Research: Controlled Experiments', url: 'https://www.microsoft.com/en-us/research/group/experimentation-platform-exp/', type: 'research' },
  launch: { title: 'Google SRE Workbook: Canarying Releases', url: 'https://sre.google/workbook/canarying-releases/', type: 'primary' },
  adr: { title: 'AWS Prescriptive Guidance: ADR process', url: 'https://docs.aws.amazon.com/prescriptive-guidance/latest/architectural-decision-records/adr-process.html', type: 'primary' },
  star: { title: 'U.S. Department of Labor: STAR Method', url: 'https://www.dol.gov/agencies/vets/programs/tap/efct', type: 'government' },
};

const DAY_SOURCE_KEYS = [
  'pmi','strategyzer','strategyzer','jtbd','svpg','govResearch','svpg',
  'govResearch','nngInterview','govResearch','productTalk','govResearch','nngIA','govResearch',
  'svpg','cucumber','intercomRice','nngHeuristics','govPrototype','nngUsability','atlassianPRD',
  'googleMetrics','amplitude','experiment','launch','adr','amplitude','atlassianPRD','star','scrum',
];
const PM30_DAY_RESOURCES = Object.fromEntries(DAY_SOURCE_KEYS.map((key, i) => {
  const source = SOURCE_CATALOG[key];
  const publisher = new URL(source.url).hostname.replace(/^www\./, '');
  return [i + 1, {
    resources: [{
      ...source,
      sourceId: 'S1',
      publisher,
      retrievedAt: '2026-08-14T00:00:00.000Z',
      sourceTier: source.type,
    }],
  }];
}));

const PM30_INTERVIEW = [
  { id:'pm30-i1',cat:'问题发现',days:'1-7',q:'你如何判断一个问题值得做？',hint:'用户证据、业务结果、风险、反证条件' },
  { id:'pm30-i2',cat:'研究',days:'8-14',q:'一次访谈如何改变了你的判断？',hint:'原假设—行为证据—反例—决策变化' },
  { id:'pm30-i3',cat:'方案',days:'15-21',q:'你如何定义 MVP 而不是最小功能集合？',hint:'核心假设、学习目标、不做清单' },
  { id:'pm30-i4',cat:'数据',days:'22-28',q:'指标上涨为什么不一定代表价值提升？',hint:'因果、护栏、分群、数据质量' },
  { id:'pm30-i5',cat:'协作',days:'22-28',q:'与研发发生范围分歧时如何推进？',hint:'共同目标、选项成本、可逆决策、日志' },
  { id:'pm30-i6',cat:'综合表达',days:'29-30',q:'用 3 分钟讲述拾光自习室案例。',hint:'明确教学案例；问题—证据—取舍—验证—学习' },
];

const PM30_GLOSSARY = [
  ['产品发现','在承诺交付前降低价值、可用性、可行性与商业风险。'],['JTBD','从用户试图取得的进展理解需求。'],
  ['问题陈述','不预设方案地定义用户、场景、障碍、影响与成功方向。'],['机会解决方案树','把目标、机会、方案和实验连接起来的结构。'],
  ['MVP','为验证最关键假设而设计的最小可学习方案。'],['用户故事','以角色、目标和价值表达需求切片。'],
  ['验收标准','可观察、可测试的完成条件。'],['RICE','Reach×Impact×Confidence÷Effort 的排序输入。'],
  ['信息架构','产品对象、层级、标签与导航的组织方式。'],['可用性测试','观察目标用户完成任务以发现交互问题。'],
  ['PRD','记录问题、目标、范围、需求、验收、指标、风险和决策的协作文档。'],['护栏指标','避免优化主指标时损害体验、安全或成本的约束指标。'],
  ['决策日志','记录选项、依据、负责人和复议条件，使取舍可追溯。'],['灰度发布','先向受控人群发布并按阈值扩大、暂停或回滚。'],
].map(([term,def]) => ({term,def}));

const PM30_SKILLS = [
  {id:'discovery',label:'问题发现',desc:'用户、场景、JTBD、假设与证据'},
  {id:'research',label:'用户研究',desc:'计划、访谈、观察、综合与偏差'},
  {id:'solution',label:'方案设计',desc:'发散、流程、原型与可用性'},
  {id:'prd',label:'产品文档',desc:'故事、验收、范围、风险与决策'},
  {id:'metrics',label:'验证分析',desc:'指标、埋点、实验、发布与迭代'},
  {id:'comms',label:'协作表达',desc:'评审、作品集与面试讲述'},
];

const PM30_PORTFOLIO = [{
  id:'pm30-p1',name:'拾光自习室：从问题到验证（虚构教学案例）',days:'1-30',
  milestones:[
    {id:'pm30-m1',label:'检查点①：问题机会简报',desc:'Day 7 · 用户、JTBD、假设与证据链'},
    {id:'pm30-m2',label:'检查点②：研究与问题定义包',desc:'Day 14 · 研究记录、机会树、问题陈述'},
    {id:'pm30-m3',label:'检查点③：PRD v1 + 原型',desc:'Day 21 · 范围、故事、流程、验收、可用性发现'},
    {id:'pm30-m4',label:'检查点④：完整作品包',desc:'Day 28 · PRD、原型、指标、埋点、验证与发布'},
    {id:'pm30-m5',label:'终局：面试讲述与迁移计划',desc:'Day 30 · 诚实标注教学案例的 3/10 分钟版本'},
  ],
}];

const PM30_WEEKLY_CHECKPOINTS = [
  { week:1, days:'1-7', deliverable:'问题机会简报', buildsOn:'', rubric:['用户、JTBD 与问题证据可追溯','最危险假设含反证条件','明确删除或降级的判断'] },
  { week:2, days:'8-14', deliverable:'研究与问题定义包', buildsOn:'weekly-checkpoint-1', rubric:['研究问题对应真实决策','结论回链原始材料','样本局限与反例明确'] },
  { week:3, days:'15-21', deliverable:'PRD v1 + 可点击原型', buildsOn:'weekly-checkpoint-2', rubric:['范围与非目标清楚','P0 故事可走查且可验收','方案取舍记录证据与约束'] },
  { week:4, days:'22-28', deliverable:'完整验证作品包', buildsOn:'weekly-checkpoint-3', rubric:['指标、埋点和验证问题对应','发布含护栏与回滚','需求到证据双向可追溯'] },
  { week:5, days:'29-30', deliverable:'终局交付与可信讲述', buildsOn:'weekly-checkpoint-4', rubric:['明确声明虚构教学案例','讲清问题、证据、取舍和验证','形成可执行 30/60/90 计划'] },
].map((item) => ({
  id:`weekly-checkpoint-${item.week}`,
  cumulative:true,
  ...item,
}));

const PM30_HOT = {
  keywords:['产品经理','产品发现','用户研究','PRD','原型','产品指标','面试'],
  systemHint:'面向产品经理入门者；以证据与可验证决策为主，明确区分教学假设和真实数据。',
};

const Pm30Pack = {
  id: PM30_PACK_ID,
  getPlan: () => PM30_LEARNING_PLAN,
  getInterview: () => PM30_INTERVIEW,
  getGlossary: () => PM30_GLOSSARY,
  getSkills: () => PM30_SKILLS,
  getPortfolio: () => PM30_PORTFOLIO,
  getWeeklyCheckpoints: () => PM30_WEEKLY_CHECKPOINTS,
  getExercises: (day) => PM30_DAY_EXERCISES[String(Number(day))] || [],
  getDayExercises: (day) => PM30_DAY_EXERCISES[String(Number(day))] || [],
  getDayResources: (day) => {
    const data = PM30_DAY_RESOURCES[Number(day)];
    const hubItems = typeof Pm30Hub !== 'undefined' ? Pm30Hub.hubItemsForDay(day) : [];
    return { resources:data?.resources || [], hub:hubItems.map((h) => h.slug), hubItems };
  },
  getHub: () => (typeof Pm30Hub !== 'undefined' ? Pm30Hub.getHub() : null),
  ensureHubSeeded: () => { if (typeof Pm30Hub !== 'undefined') Pm30Hub.ensureSeeded(); },
  getHotConfig: () => ({keywords:PM30_HOT.keywords,systemHint:PM30_HOT.systemHint,industry:'互联网 / 软件产品',role:'产品经理'}),
};
