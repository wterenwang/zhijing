/**
 * PM30 金标准知识库：30 天一日一章。
 * 案例声明：「拾光自习室」及其中数字均为虚构教学案例，不是任何真实公司的数据。
 */
const PM30_HUB_CONTENT_VERSION = 2;

const PM30_HUB_ROWS = [
  [1,'PM 的责任与决策闭环','PMI 将项目管理描述为运用知识、技能、工具与技术满足项目要求；产品工作则还要持续判断做什么及为何做。入门者可用“发现问题—选择方案—推动交付—验证价值”理解结果责任。不要把排期完成当作用户问题已经解决。','给拾光写用户结果、业务结果各一条，再标出 PM、设计、研发的最终决策权。','pmi'],
  [2,'产品愿景与价值主张','价值主张不是功能列表，而是特定用户在特定情境中获得的进展，以及产品相对现有替代方案为何更合适。Strategyzer 的价值主张画布把用户任务、痛点、收益与产品的缓解/创造机制配对。任何尚无证据的配对都应标成假设。','完成“为[用户]，当[场景]，拾光帮助[进展]，不同于[替代]，因为[机制]”。','strategyzer'],
  [3,'目标用户与行为细分','可行动细分应让产品决策发生变化。年龄、城市等属性通常不足以说明行为；优先使用触发、频率、目标、现有替代、付出代价和约束。选择首要细分时同时看痛点强度、可触达性和团队能力，且明确暂不服务谁。','用行为/需求/约束提出三个备考者细分，选一个并写排除理由。','strategyzer'],
  [4,'JTBD：理解用户要取得的进展','Jobs to Be Done 关注用户在具体情境中“雇佣”产品取得何种进展，而非询问想要什么功能。任务可包含功能、情绪和社会层面；触发、阻力、旧习惯与替代方案共同决定是否切换。任务陈述中若出现按钮或 AI，通常已偷渡方案。','写“当……时，我想……，以便……”并补触发、阻力、旧替代。','jtbd'],
  [5,'假设地图与四类风险','SVPG 将产品风险概括为价值、可用性、可行性和商业可行性。列假设的目的不是证明自己正确，而是找到一旦错误就会推翻方案的前提。用重要性×现有证据强度排序，优先测试高重要、低证据项。','为拾光四类风险各写一条可证伪假设，并定义反证。','svpg'],
  [6,'从反馈到证据链','用户反馈是信号，不自动等于需求。把材料分为事实（发生了什么）、解释（为何发生）、机会（值得改善的困难）和方案（可能怎么做），能减少过早收敛。高质量证据同时说明场景、频率、代价和现有替代。','把“我要排行榜”拆为四层，并写继续投入前需要的证据。','govResearch'],
  [7,'周复盘①：问题机会简报','第一次检查点应证明“问题值得继续研究”，而不是展示精美方案。简报至少包括首要用户、关键 JTBD、问题证据、最危险假设、反例、业务关联和下一步。结论必须能回到原始材料；无证据处标注教学假设。','做 5 分钟评审并删除或降级一个证据最弱的假设。','svpg'],

  [8,'研究计划与招募','研究先从决策开始：团队要做什么决定、缺什么信息、哪种方法能补信息。研究问题不是逐字问用户的问题。招募条件应与目标行为相关，并记录排除条件、样本来源及局限；少量质性样本可发现模式，不能估计总体比例。','写三条研究问题、筛选条件、方法、输出与不会声称的结论。','govResearch'],
  [9,'问题访谈：问行为，不问投票','NN/g 建议访谈围绕用户经历、动机和行为展开。优先追问最近一次：“当时在哪里？先做了什么？哪里停住？如何绕过？”避免“你会不会用”“你喜欢 A 还是 B”等预测或引导问题。原话与研究者解释要分栏记录。','把三个意愿题改成最近一次行为题，并准备两层追问。','nngInterview'],
  [10,'观察、信号与确认偏差','研究者容易只记录支持原假设的信息。控制方法包括统一提纲、保留反例、把事实/引语/解释分开、访谈后先独立编码再聚类。痛点强度可由发生频率、失败后果、付出成本和替代方案不足共同判断。','编码一份记录，主动写出一个与原假设冲突的解释。','govResearch'],
  [11,'从洞察到机会解决方案树','机会树把期望结果置顶，下面连接用户机会，再连接多个方案与实验。机会必须用用户困难或愿望表达；“自动排课”是方案，不是机会。树的价值是暴露选择：为何探索这个机会、还有哪些分支、什么证据会改选。','画一棵“提高有效专注完成率”的树，每个机会至少两个方案。','productTalk'],
  [12,'无方案的问题陈述','问题陈述应包含用户、场景、障碍、影响、约束和成功方向，同时避免界面或技术词。成功标准先定义口径、基线、方向和时间窗；缺可靠基线时可先定义要采集的证据，不应捏造目标值。非目标能阻止范围悄然扩张。','写一句问题陈述、三个非目标及一条证伪条件。','govResearch'],
  [13,'竞品研究应研究替代行为','真正的竞争集合包括直接产品、间接工具和“不使用产品”的办法。比较应围绕用户任务：触发、关键步骤、反馈、失败恢复、成本与切换阻力，而非功能数量。借鉴机制前要确认用户、供给和约束是否相同。','比较纸质计划表、日历和同类 App，形成一条不照搬结论。','nngIA'],
  [14,'周复盘②：研究证据评审','第二次检查点交付研究计划、原始记录、编码、机会树、问题陈述、替代方案分析和未知项。每条结论都要能追溯到证据，并标置信心；样本不匹配、只做演练或使用教学数据时必须显式降级。','从问题陈述反向检查证据链，按反例修订一次优先级。','govResearch'],

  [15,'方案发散与有依据的收敛','先发散能避免把第一个点子误当唯一答案。至少提出改变行为触发、降低操作成本、增强反馈等不同机制，再按用户价值、风险、成本、依赖、可逆性和学习速度比较。决策记录必须写放弃项及重评条件。','比较提醒、陪伴、自动排程三个方向，选择其一并写反事实。','svpg'],
  [16,'用户故事与可测试验收','用户故事用“作为—我想—以便”保留价值语境，但不能替代细节。验收标准把完成定义为可观察行为；Given/When/Then 适合表达前置、动作和结果。关键故事还需覆盖权限、边界、空态、错态和恢复。','为调整今日计划写故事，并补正常、无数据、失败三组验收。','cucumber'],
  [17,'RICE、置信度与 MVP 边界','RICE 用 Reach×Impact×Confidence÷Effort 形成比较输入。数字不是客观真理：估算口径、证据来源和不确定性必须可见。MVP 不是把所有功能做薄，而是用最小范围验证最关键假设；合规、数据完整性等约束不能因分低而忽略。','计算三个候选项，随后用风险和依赖校正排序并写不做清单。','intercomRice'],
  [18,'端到端流程与系统状态','流程图应同时表达用户目标、系统响应和决策分支。只画 happy path 会把真实成本推迟到开发和客服。为每个关键节点检查 loading、empty、error、success、无权限、中断和退出，并设计用户如何理解、重试或恢复。','画“建计划—开始—中断—恢复—完成—复盘”流程。','nngHeuristics'],
  [19,'信息架构与低保真原型','信息架构定义对象、层级、标签、关系与导航；线框图表达用户如何操作这些结构。GOV.UK 建议根据要回答的问题选择原型保真度：验证结构时无需先做视觉细节。每屏应标注用户问题、主要动作、反馈和异常状态。','制作五屏可点击线框，并为每屏写要验证的一个问题。','govPrototype'],
  [20,'可用性测试：观察而非教学','可用性测试让有目标特征的人在原型上完成真实目标。任务应给情境和目标，不泄露操作路径；主持人少教、少辩解，记录成功、时间、卡点、错误和言语。少量测试用于发现问题，不能证明总体成功率。','写三个目标型任务，按影响×频率×阻断程度标发现严重度。','nngUsability'],
  [21,'周复盘③：PRD 与原型评审','可执行 PRD 应连接背景证据、目标/非目标、用户与场景、范围、故事与验收、流程状态、指标、依赖、风险和待决问题。PRD 是决策共识而非篇幅比赛；所有 P0 需求应能在原型中走通并被验收标准检查。','用故事逐条走查原型，关闭歧义或登记负责人和截止时间。','atlassianPRD'],

  [22,'指标树：从价值到行为','指标不是“能取到什么就看什么”。先定义用户获得的价值结果，再拆成能影响它的行为与过程信号。HEART 从 Happiness、Engagement、Adoption、Retention、Task success 组织体验衡量；实际只选与目标有因果假设的部分，并设置体验、成本、安全护栏。','为拾光画结果—领先指标—输入指标，并解释每条箭头。','googleMetrics'],
  [23,'事件模型与数据口径','事件模型要先回答决策问题，再定义事件。每项至少包含名称、业务含义、触发时机、主体、属性、去重、版本和责任人。漏斗各步必须具有一致人群与时间窗；客户端重试、跨端登录和版本变化都会制造假信号。','定义 plan_created、focus_started、focus_completed 及漏斗口径。','amplitude'],
  [24,'验证方法与因果边界','不同风险对应不同证据：访谈适合理解动机，原型任务适合可用性，技术 spike 适合可行性，假门或试点适合行为意向；随机对照实验更适合估计因果效果。没有随机化、足够样本或稳定口径时，应报告观察性信号而非“提升了 X%”。','为价值、可用性、可行性各选最低成本方法并写停止规则。','experiment'],
  [25,'灰度发布、告警与回滚','金丝雀发布先让小部分流量使用新版本，比较关键指标和错误，再逐步扩大。发布计划要定义人群、观察窗、负责人、数据看板、支持预案、暂停/回滚阈值与回滚路径。若无法可靠撤回，高风险变化应先缩小暴露面。','写 10%→30%→100% 灰度阶梯及每级进入、暂停、回滚条件。','launch'],
  [26,'跨职能评审与决策日志','分歧常来自目标、约束或证据不同。先重述共同结果，再把争论拆成选项、成本、风险和可验证问题。决策日志记录背景、选项、决定、理由、负责人、日期和复议条件；它不是追责工具，而是防止团队反复争论或遗忘上下文。','把“做不了”改写成三种可选范围，并记录决策与复议时间。','adr'],
  [27,'结果分析与下一次迭代','分析先查数据质量，再看总体与关键分群，最后对照主要指标、护栏和预设停止规则。相关变化可能来自季节、渠道、人群或埋点变化。建议应明确继续、修改或停止，说明证据强度、替代解释和下一次最便宜的辨别性测试。','用一组明确标注的教学漏斗数据写一页迭代备忘录。','amplitude'],
  [28,'周复盘④：完整作品验收','第四次检查点要求双向可追溯：每个 P0 需求能回到机会与证据，每个关键假设有验证方案与决策门槛。作品包应包含研究与问题定义、方案取舍、完整 PRD、可点击原型、可用性发现、指标与埋点、验证、发布和决策日志。','从最终指标反查到原始证据，再从证据正向走到验收。','atlassianPRD'],
  [29,'面试讲述：诚实展示决策质量','面试案例可用 Situation—Task—Action—Result，加上 Learning。教学案例不能伪装为上线项目：明确说明背景虚构、哪些环节做了真人研究、哪些是演练或假设。没有真实结果时，讲清验证方案、判定标准和你会如何依据结果行动。','准备 3 分钟主线及失败、冲突、指标、反事实四类追问。','star'],
  [30,'终局交付与能力迁移','终局不是“学完术语”，而是能把模糊问题转成可追溯决策和可验证交付。完整链路为：问题证据→用户与 JTBD→机会/假设→方案取舍→PRD/原型→指标/验证→发布/学习→面试讲述。迁移到新领域时保留方法，重新研究用户、约束和风险。','验收 PRD、原型、验证方案、讲述稿，并制定 30/60/90 天补强计划。','scrum'],
];

const PM30_HUB_FALLBACK_SOURCE = {
  title: 'GOV.UK Service Manual: User research',
  url: 'https://www.gov.uk/service-manual/user-research',
};

function pm30HubSource(key) {
  if (typeof SOURCE_CATALOG !== 'undefined' && SOURCE_CATALOG[key]) return SOURCE_CATALOG[key];
  return PM30_HUB_FALLBACK_SOURCE;
}

function pm30HubChapter([day, title, lesson, practice, sourceKey]) {
  const source = pm30HubSource(sourceKey);
  const plan = typeof PM30_LEARNING_PLAN !== 'undefined' ? PM30_LEARNING_PLAN[day - 1] : null;
  const steps = (plan?.tasks || []).map((task, index) => `${index + 1}. ${task}`).join('\n');
  return `# Day ${day} · ${title}

> **案例声明**：本课贯穿的「拾光自习室」是虚构教学案例；案例数字与结论不是任何真实公司数据，未知处必须标为假设。

## 今日目标

${plan?.objective || `理解并应用${title}`}。

## 核心方法

${lesson} [S1]

今天不以“记住术语”为完成标准，而以是否能形成可复核决策为准。先写观察到的事实，再写你的解释；凡是没有真实材料支持的用户比例、效果数字或公司结论，都标为教学假设。最后记录选择、放弃项和什么新证据会改变决定。

## 操作步骤

${steps}

## 在拾光自习室中应用

${practice}

案例团队只有 2 名工程师、1 名设计师和 6 周 MVP 时间。作答时必须在这个约束下取舍，不能假设无限资源；涉及案例用户与指标时应明确写“虚构教学数据”，并补充现实项目中需要如何验证。

## 常见误区

- 从功能点出发倒推问题，导致证据只能证明既定答案。
- 把参与者表达的意愿、单个案例或教学数字当成总体事实。
- 只写“要做什么”，没有写验收条件、放弃项与复议触发器。

## 交付与自检

交付“${plan?.deliverable || title}”。确认：结论能回到证据；假设被明确标注；至少写出一个放弃项、边界或反证条件。建议用 5 分钟口头复述“问题—证据—选择—验证”，若其中任何箭头讲不清，就回到材料补链。

## Sources / 来源

- [S1] [${source.title}](${source.url})
`;
}

const PM30_HUB_CHAPTERS = Object.fromEntries(
  PM30_HUB_ROWS.map((row) => [`pm30/day-${String(row[0]).padStart(2,'0')}`, pm30HubChapter(row)])
);

const PM30_HUB_NAV = [
  {id:'pm30-w1',title:'第1周：问题发现',description:'Day 1–7 · 角色、价值、用户、JTBD 与风险',color:'#0891b2',range:[1,7]},
  {id:'pm30-w2',title:'第2周：研究与定义',description:'Day 8–14 · 访谈、证据、机会与问题陈述',color:'#0d9488',range:[8,14]},
  {id:'pm30-w3',title:'第3周：方案与 PRD',description:'Day 15–21 · 取舍、验收、流程、原型与测试',color:'#2563eb',range:[15,21]},
  {id:'pm30-w4',title:'第4周：验证与表达',description:'Day 22–30 · 指标、实验、发布、作品与面试',color:'#7c3aed',range:[22,30]},
].map((mod) => ({
  id:mod.id,title:mod.title,description:mod.description,color:mod.color,
  items:PM30_HUB_ROWS.slice(mod.range[0]-1,mod.range[1]).map((row) => ({
    slug:`pm30/day-${String(row[0]).padStart(2,'0')}`,title:`Day ${row[0]} · ${row[1]}`,days:String(row[0]),
  })),
}));

const PM30_GLOSSARY_RICH_FALLBACK = [
  ['产品发现','在承诺交付前降低价值、可用性、可行性与商业风险。','发现'],
  ['JTBD','从用户试图取得的进展理解需求。','发现'],
  ['问题陈述','不预设方案地定义用户、场景、障碍、影响和成功方向。','研究'],
  ['机会解决方案树','把目标、机会、方案与实验连接起来。','研究'],
  ['MVP','为验证关键假设而设计的最小可学习方案。','方案'],
  ['验收标准','可观察、可测试的完成条件。','交付'],
  ['护栏指标','防止优化主指标时损害体验、安全或成本。','数据'],
  ['决策日志','记录选项、依据、负责人和复议条件。','协作'],
].map(([term,def,module]) => ({term,def,module}));

const PM30_CHAPTER_LINKS = PM30_HUB_ROWS.map((row) => ({
  keywords:[row[1],String(row[0]),`day ${row[0]}`],
  label:`Day ${row[0]} · ${row[1]}`,
  hub:`/doc/pm30/day-${String(row[0]).padStart(2,'0')}`,
}));

const Pm30Hub = {
  CONTENT_VERSION: PM30_HUB_CONTENT_VERSION,

  getHub() {
    return {
      title:'产品经理 30 天金标准课包',
      subtitle:'以虚构教学案例「拾光自习室」完成问题发现、PRD、原型、验证与面试讲述',
      audience:'面向互联网 / 软件产品行业的产品经理入门者',
      competencies:['问题发现与证据判断','用户研究与机会定义','PRD 与原型交付','指标验证与发布决策','跨职能协作与案例表达'],
      domainAnchors:['JTBD','机会解决方案树','PRD','可用性测试','产品指标','灰度发布'],
      caseDisclosure:'拾光自习室为虚构教学案例；案例数字与结论不代表真实公司。',
      learningPath:PM30_HUB_NAV.map((m) => m.title),
      navigation:PM30_HUB_NAV,
      chapters:PM30_HUB_CHAPTERS,
      generatedAt:'2026-08-14',
      contentVersion:PM30_HUB_CONTENT_VERSION,
      dailyAligned:true,
      chapterCount:30,
    };
  },

  getGlossaryRich() {
    const source = typeof PM30_GLOSSARY !== 'undefined'
      ? PM30_GLOSSARY.map((g) => ({...g,module:g.module || '核心'}))
      : PM30_GLOSSARY_RICH_FALLBACK;
    return source.map((g) => ({
      term:g.term,definition:g.def,def:g.def,module:g.module || '核心',
      sections:[{label:'是什么',content:g.def}],
    }));
  },

  getChapterLinks() { return PM30_CHAPTER_LINKS; },

  buildStoragePack() {
    const hub = this.getHub();
    return {
      version:1,schemaVersion:2,id:'pm-30-intro',
      meta:{
        title:'产品经理 30 天金标准课包',industry:'互联网 / 软件产品',role:'产品经理',goal:'从零完成可信产品案例',days:30,
        notes:'拾光自习室为虚构教学案例；不含未经证实的真实公司数据。',
        outcomes:{
          competencies:[
            {name:'问题发现与证据判断'},{name:'用户研究与机会定义'},{name:'PRD 与原型交付'},
            {name:'指标验证与发布决策'},{name:'跨职能协作与案例表达'},
          ],
          domainAnchors:['JTBD','机会解决方案树','PRD','可用性测试','产品指标','灰度发布'],
        },
        quality:{
          needsReview:false,glossaryEnough:true,glossaryKindCount:2,phaseMonotonic:true,
          repair:{passed:true,reason:'human-reviewed'},
        },
      },
      plan:typeof PM30_LEARNING_PLAN !== 'undefined' ? PM30_LEARNING_PLAN : [],
      glossary:this.getGlossaryRich(),
      interview:typeof PM30_INTERVIEW !== 'undefined' ? PM30_INTERVIEW : [],
      skills:typeof PM30_SKILLS !== 'undefined' ? PM30_SKILLS : [],
      portfolio:typeof PM30_PORTFOLIO !== 'undefined' ? PM30_PORTFOLIO : [],
      hot:typeof PM30_HOT !== 'undefined' ? PM30_HOT : {keywords:[],systemHint:''},
      hub,
      dayResources:typeof PM30_DAY_RESOURCES !== 'undefined' ? PM30_DAY_RESOURCES : {},
      dayExercises:typeof PM30_DAY_EXERCISES !== 'undefined' ? PM30_DAY_EXERCISES : {},
      weeklyCheckpoints:typeof PM30_WEEKLY_CHECKPOINTS !== 'undefined' ? PM30_WEEKLY_CHECKPOINTS : [],
      status:'ready',hubContentVersion:PM30_HUB_CONTENT_VERSION,
      createdAt:'2026-08-14T00:00:00.000Z',updatedAt:new Date().toISOString(),
      contentUpdatedAt:'2026-08-14T00:00:00.000Z',
      generation:{provenance:{generator:'human-reviewed PM30',model:'none',promptVersion:'pm30-gold-v2',generatedAt:'2026-08-14T00:00:00.000Z'}},
      evaluation:{status:'passed',evaluatedAt:'2026-08-14T00:00:00.000Z',findings:[]},
    };
  },

  ensureSeeded() {
    const key='learning-content-pack:pm-30-intro';
    try {
      const raw=localStorage.getItem(key);
      if (raw) {
        const existing=JSON.parse(raw);
        if (existing?.hubContentVersion>=PM30_HUB_CONTENT_VERSION &&
            existing?.hub?.chapterCount===30 &&
            Object.keys(existing?.dayExercises || {}).length===30) return false;
      }
    } catch { /* rewrite invalid cache */ }
    localStorage.setItem(key,JSON.stringify(this.buildStoragePack()));
    return true;
  },

  hubItemsForDay(day) {
    const n=Number(day);
    const result=[];
    PM30_HUB_NAV.forEach((mod) => {
      (mod.items || []).forEach((item) => {
        if (Number(item.days)===n) result.push({slug:item.slug,title:item.title || item.slug,moduleTitle:mod.title || ''});
      });
    });
    return result;
  },
};
