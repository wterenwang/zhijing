/**
 * 知径看板娘「径径」—— 二次元立绘 + 学习提醒
 * 能力：打卡增强提醒、每日练习提醒、今日任务清单
 * 仅在 mode-home 显示；右下角 gen-dock 互不遮挡
 */
const MascotCompanion = (() => {
  const LAST_OPEN_KEY = 'zhijing-last-project-id';
  const HIDDEN_KEY = 'zhijing-mascot-hidden';
  const MINI_KEY = 'zhijing-mascot-mini';
  const ASSET = 'assets/mascot';
  const MILESTONE_DAYS = [7, 14, 21, 30, 60, 90];
  const MILESTONE_PCT = [25, 50, 75, 100];

  const HOUR_GREETINGS = [
    { before: 6, text: '夜深了也别忘了歇一歇～明天再战！' },
    { before: 11, text: '早呀！今天的路径准备好了吗？' },
    { before: 14, text: '中午好～先吃一会儿再学，别饿着肚子硬撑。' },
    { before: 18, text: '下午好！来完成今天的一小步吧。' },
    { before: 22, text: '晚上好！收工前打个卡？' },
    { before: 24, text: '这么晚还在？径径陪你收尾～' },
  ];

  const MOOD_POSE = {
    idle: 'idle',
    wave: 'idle',
    nod: 'idle',
    peek: 'idle',
    cheer: 'cheer',
    think: 'think',
    practice: 'practice',
    point: 'point',
    sleepy: 'sleepy',
    shy: 'shy',
    giggle: 'giggle',
    stretch: 'stretch',
    read: 'read',
  };

  let root = null;
  let bubbleEl = null;
  let textEl = null;
  let kickerEl = null;
  let actionsEl = null;
  let checklistEl = null;
  let moodTimer = null;
  let tipTimer = null;
  let talkEndTimer = null;
  let openProjectHandler = null;
  let openCreateHandler = null;
  let tipIndex = 0;
  let idleTipIndex = 0;
  let lastCtx = null;
  /** false：待机闲聊；true：点开后的今日任务清单 */
  let tasksPanelOpen = false;

  /** 碎碎念：文案 + 对应姿态（AI 立绘） */
  const IDLE_CHATTER = [
    { text: '今天也一起学一点点吧～', mood: 'wave' },
    { text: '径径在这儿陪着你，不急慢慢来。', mood: 'giggle' },
    { text: '戳我一下，我帮你看看今天的任务哦。', mood: 'point' },
    { text: '嗯…你有没有空看看路径呀？', mood: 'think' },
    { text: '学累了就歇一歇，我会等你的。', mood: 'sleepy' },
    { text: '对了，今天的练习做了吗？嘿嘿。', mood: 'practice' },
    { text: '打个招呼也算互动啦～嗨！', mood: 'wave' },
    { text: '悄悄说：点我可以打开今日任务清单。', mood: 'shy' },
    { text: '伸个懒腰～再学一小会儿就好。', mood: 'stretch' },
    { text: '我在翻翻今天的笔记…好像还差一步。', mood: 'read' },
    { text: '完成一件小事，也值得开心一下！', mood: 'cheer' },
    { text: '径径偷偷给你加油——你一定行的。', mood: 'shy' },
    { text: '哈欠…困了也没关系，眯一会儿再来。', mood: 'sleepy' },
    { text: '嘻嘻，看见你打开知径我就开心。', mood: 'giggle' },
    { text: '这条路径读起来不错诶，一起走？', mood: 'read' },
    { text: '早起拉伸一下，脑子会更清楚哦。', mood: 'stretch' },
  ];

  const IDLE_MOODS = ['wave', 'sleepy', 'shy', 'giggle', 'stretch', 'read', 'think', 'cheer', 'practice', 'point'];

  function parseDate(iso) {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function formatDateISO(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function loadProjectData(projectId) {
    try {
      const raw = localStorage.getItem(ProjectPlatform.dataKey(projectId));
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function getTodayDayNum(data, totalDays) {
    const start = parseDate(data?.startDate || formatDateISO(new Date()));
    if (!start) return 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.floor((today - start) / 86400000) + 1;
    if (diff < 1) return 1;
    if (diff > totalDays) return totalDays;
    return diff;
  }

  function hourGreeting() {
    const h = new Date().getHours();
    for (const g of HOUR_GREETINGS) {
      if (h < g.before) return g.text;
    }
    return HOUR_GREETINGS[0].text;
  }

  function isBuiltinSample(project) {
    if (!project || typeof ProjectPlatform === 'undefined') return false;
    return (
      project.isDefault === true ||
      project.id === ProjectPlatform.DEFAULT_ID ||
      project.packId === 'pm-30-intro'
    );
  }

  /** 用户自己创建的路径（不含「产品经理入门 30 天」实例包） */
  function listUserProjects() {
    const projects = typeof ProjectPlatform !== 'undefined' ? ProjectPlatform.list() : [];
    return projects.filter((p) => !isBuiltinSample(p));
  }

  function hasUserPaths() {
    return listUserProjects().length > 0;
  }

  /** 尚无自建路径：默认课表仅展示，要催新建 */
  function needsCreateNudge() {
    return !hasUserPaths();
  }

  function listUserProjectsSorted() {
    return listUserProjects().slice().sort((a, b) => {
      const ta = Date.parse(a.updatedAt || a.createdAt || 0) || 0;
      const tb = Date.parse(b.updatedAt || b.createdAt || 0) || 0;
      return tb - ta;
    });
  }

  function resolveFocusProject() {
    const projects = typeof ProjectPlatform !== 'undefined' ? ProjectPlatform.list() : [];
    if (!projects.length) return null;

    const user = listUserProjectsSorted();
    const lastId = localStorage.getItem(LAST_OPEN_KEY);

    // 已有自建路径：永远优先盯用户路径（忽略上次打开的展示样例）
    if (user.length) {
      if (lastId) {
        const hit = user.find((p) => p.id === lastId);
        if (hit) return hit;
      }
      return user[0];
    }

    // 尚无自建：可盯展示样例 / 上次打开
    if (lastId) {
      const hit = projects.find((p) => p.id === lastId);
      if (hit) return hit;
    }
    return projects.find((p) => isBuiltinSample(p)) || projects[0];
  }

  /** 单条路径的今日进度快照（供聚合 / 单路径复用） */
  function summarizePathDay(project) {
    const name = project.shortName || project.title || '未命名路径';
    const status = project.packStatus || 'ready';
    if (status === 'generating' || status === 'failed' || status === 'cancelled') {
      return {
        project,
        name,
        status,
        ready: false,
        allDone: false,
        dayNum: 1,
        practice: { done: 0, answered: 0, total: 0, complete: false },
        feynmanDone: false,
        checkinDone: false,
        checklist: null,
        primaryFocus: 'sprint',
        streak: 0,
        checked: 0,
        total: project.days || 30,
        topic: '',
      };
    }
    // partial 与 ready 一样可学（仅前几天内容完整）

    const { checked, total } = ProjectPlatform.progressStats(project.id);
    const data = loadProjectData(project.id) || {};
    const dayNum = getTodayDayNum(data, total);
    const checkinDone = !!(data.checkins && data.checkins[String(dayNum)]);
    const exTotal = getExerciseTotal(project, dayNum, data);
    const practice = getPracticeProgress(data, dayNum, exTotal);
    const feynmanDone = hasFeynman(data, dayNum);
    const checklist = buildChecklist({ practice, feynmanDone, checkinDone });
    const planDay = getPlanDayForProject(project, dayNum);
    return {
      project,
      name,
      status: 'ready',
      ready: true,
      allDone: checklist.every((t) => t.done),
      dayNum,
      practice,
      feynmanDone,
      checkinDone,
      notesDone: hasNotes(data, dayNum),
      checklist,
      primaryFocus: firstIncompleteFocus(checklist),
      streak: calcStreak(data, dayNum),
      yesterdayOk: hadYesterday(data, dayNum),
      checked,
      total,
      pct: total ? Math.round((checked / total) * 100) : 0,
      topic: planDay?.topic ? String(planDay.topic) : '',
      milestone: findMilestone(checked, total),
    };
  }

  const AGGREGATE_LIST_MAX = 3;

  /** 多路径：每条一行摘要；未完成优先，最多 3 条 +「还有 N 条」 */
  function buildAggregateChecklist(snaps, focusId) {
    const sorted = snaps.slice().sort((a, b) => {
      const aInc = a.ready && !a.allDone ? 0 : a.ready ? 1 : 2;
      const bInc = b.ready && !b.allDone ? 0 : b.ready ? 1 : 2;
      if (aInc !== bInc) return aInc - bInc;
      if (focusId) {
        if (a.project.id === focusId) return -1;
        if (b.project.id === focusId) return 1;
      }
      return 0;
    });

    const visible = sorted.slice(0, AGGREGATE_LIST_MAX);
    const rest = sorted.length - visible.length;
    const items = visible.map((s) => {
      if (!s.ready) {
        return {
          id: `path-${s.project.id}`,
          label: s.name,
          detail: s.status === 'generating' ? '课表生成中' : s.status === 'cancelled' ? '已停止' : '生成失败',
          done: false,
          focus: 'sprint',
          projectId: s.project.id,
          soft: true,
        };
      }
      if (s.allDone) {
        return {
          id: `path-${s.project.id}`,
          label: s.name,
          detail: `第${s.dayNum}天 · 今日齐了`,
          done: true,
          focus: 'sprint',
          projectId: s.project.id,
        };
      }
      const parts = [];
      if (!s.practice.complete) {
        parts.push(`练习 ${s.practice.done}/${s.practice.total || '?'}`);
      }
      if (!s.feynmanDone) parts.push('复述待写');
      if (!s.checkinDone) parts.push('未打卡');
      return {
        id: `path-${s.project.id}`,
        label: s.name,
        detail: parts.join(' · ') || '有任务未完成',
        done: false,
        focus: s.primaryFocus,
        projectId: s.project.id,
      };
    });

    if (rest > 0) {
      items.push({
        id: 'more-paths',
        label: `还有 ${rest} 条路径`,
        detail: '请在上方卡片查看',
        done: false,
        focus: null,
        projectId: null,
        soft: true,
        isMore: true,
      });
    }
    return items;
  }

  function pickCtaSnap(snaps, focusId) {
    const incomplete = snaps.filter((s) => s.ready && !s.allDone);
    if (focusId) {
      const hit = incomplete.find((s) => s.project.id === focusId);
      if (hit) return hit;
    }
    if (incomplete.length) return incomplete[0];
    if (focusId) {
      const hit = snaps.find((s) => s.project.id === focusId);
      if (hit) return hit;
    }
    return snaps.find((s) => s.ready) || snaps[0] || null;
  }

  function firstIncompleteFocus(checklist) {
    const hit = (checklist || []).find((t) => !t.done && t.focus);
    return hit ? hit.focus : 'sprint';
  }

  function primaryCta(checklist, projectId) {
    const hit = (checklist || []).find((t) => !t.done);
    if (!hit) {
      return { label: '再看一眼', projectId, focus: 'sprint' };
    }
    if (hit.id === 'practice') return { label: '去做练习', projectId, focus: 'practice' };
    if (hit.id === 'feynman') return { label: '写复述', projectId, focus: 'feynman' };
    if (hit.focus === 'practice') return { label: '去做练习', projectId, focus: 'practice' };
    if (hit.focus === 'feynman') return { label: '写复述', projectId, focus: 'feynman' };
    if (hit.focus === 'checkin') return { label: '去打卡', projectId, focus: 'checkin' };
    return { label: '去打卡', projectId, focus: 'checkin' };
  }

  function ctaFromSnap(snap) {
    if (!snap?.ready) {
      return snap?.status === 'failed'
        ? null
        : { label: '查看进度', projectId: snap?.project?.id, focus: 'sprint' };
    }
    if (snap.allDone) {
      return { label: '再看一眼', projectId: snap.project.id, focus: 'sprint' };
    }
    return primaryCta(snap.checklist, snap.project.id);
  }

  function buildMultiPathContext(snaps, focusProject) {
    const focusId = focusProject?.id || null;
    const ready = snaps.filter((s) => s.ready);
    const incomplete = ready.filter((s) => !s.allDone);
    const generating = snaps.filter((s) => s.status === 'generating');
    const partial = snaps.filter((s) => s.status === 'partial');
    const ctaSnap = pickCtaSnap(snaps, focusId);
    const checklist = buildAggregateChecklist(snaps, focusId);
    const project = ctaSnap?.project || focusProject || snaps[0]?.project || null;
    const hour = new Date().getHours();
    const pathNames = incomplete.map((s) => s.name).slice(0, 3);

    if (!ready.length && generating.length && !partial.length) {
      return {
        kind: 'generating',
        project: generating[0].project,
        multi: true,
        pathSnaps: snaps,
        messages: [
          generating.length > 1
            ? `有 ${generating.length} 条路径还在准备前几天内容，径径先帮你看着～`
            : `「${generating[0].name}」还在准备前几天，马上就能先学～`,
          '先等骨架就绪，其余课表后台补就好～',
        ],
        cta: null,
        checklist,
        streak: 0,
      };
    }

    if (!incomplete.length && ready.length) {
      const msgs = [
        ready.length > 1
          ? `今天 ${ready.length} 条路径任务都齐了！练习、复述、打卡全满～径径给你比心！`
          : `「${ready[0].name}」今日任务全满！径径给你比心！`,
        hourGreeting(),
      ];
      return {
        kind: 'all_done',
        project,
        multi: true,
        pathSnaps: snaps,
        dayNum: ctaSnap?.dayNum,
        messages: msgs,
        cta: ctaFromSnap(ctaSnap),
        checklist,
        streak: ctaSnap?.streak || 0,
      };
    }

    const msgs = [];
    if (incomplete.length > 1) {
      msgs.push(
        `今天还有 ${incomplete.length} 条路径没收工：${pathNames.join('、')}${
          incomplete.length > pathNames.length ? '…' : ''
        }`,
      );
    } else if (incomplete.length === 1) {
      msgs.push(`「${incomplete[0].name}」今天还有任务没勾完～`);
    }

    if (ctaSnap?.ready && !ctaSnap.allDone) {
      if (!ctaSnap.practice.complete) {
        const left = (ctaSnap.practice.total || 0) - ctaSnap.practice.done;
        msgs.push(
          `先顾「${ctaSnap.name}」：练习还差 ${left} 项（${ctaSnap.practice.done}/${ctaSnap.practice.total}）。`,
        );
        if (ctaSnap.topic) msgs.push(`围绕「${ctaSnap.topic}」练一练，勾掉一项也算赢！`);
      } else if (!ctaSnap.feynmanDone) {
        msgs.push(`「${ctaSnap.name}」练习好了，补一句费曼复述更牢～`);
      } else if (!ctaSnap.checkinDone) {
        if (hour >= 18) {
          msgs.push(`傍晚啦，「${ctaSnap.name}」还没打卡～收工前点一下？`);
        } else {
          msgs.push(`「${ctaSnap.name}」练习和复述都齐了，就差打卡啦！`);
        }
      }
    }

    if (ready.length > incomplete.length && incomplete.length) {
      msgs.push(
        `已有 ${ready.length - incomplete.length} 条今日齐了；剩下的点清单就能跳过去。`,
      );
    }
    msgs.push(hourGreeting());

    let kind = 'nudge';
    if (ctaSnap?.ready && !ctaSnap.allDone) {
      if (!ctaSnap.practice.complete) kind = 'practice';
      else if (!ctaSnap.feynmanDone) kind = 'recite';
      else if (!ctaSnap.checkinDone) kind = 'checkin';
    }

    return {
      kind,
      project,
      multi: true,
      pathSnaps: snaps,
      dayNum: ctaSnap?.dayNum,
      messages: msgs.filter(Boolean),
      cta: ctaFromSnap(ctaSnap),
      checklist,
      streak: ctaSnap?.streak || 0,
      incompleteCount: incomplete.length,
      pathCount: snaps.length,
    };
  }

  function buildContext() {
    const user = listUserProjectsSorted();

    // —— 多条个人路径：今日聚合 ——
    if (user.length >= 2) {
      const snaps = user.map(summarizePathDay);
      return buildMultiPathContext(snaps, resolveFocusProject());
    }

    // —— 单条个人路径 / 仅展示样例：沿用明细清单 ——
    const project = resolveFocusProject();
    if (!project) {
      return {
        kind: 'empty',
        project: null,
        messages: [
          '还没有自己的路径哦～默认课表只是展示，点「新建路径」才是主线！',
          '填行业和岗位，创建属于你的知径～径径陪你。',
        ],
        cta: { label: '新建路径', action: 'create' },
        checklist: null,
      };
    }

    if (project.packStatus === 'generating') {
      return {
        kind: 'generating',
        project,
        messages: [
          `「${project.shortName || project.title}」还在准备前几天内容，径径先帮你看着进度～`,
          '马上就能先学 Day1–3，其余课表后台慢慢补～',
        ],
        cta: null,
        checklist: null,
      };
    }

    if (project.packStatus === 'partial') {
      const readyN =
        (project.packId && typeof ContentPack !== 'undefined'
          ? ContentPack.load(project.packId)?.meta?.generation?.readyThroughDay
          : null) || 3;
      return {
        kind: 'partial',
        project,
        messages: [
          `「${project.shortName || project.title}」前 ${readyN} 天已可学，点进去开干！`,
          '其余天数还在后台补全，不影响你先打卡～',
        ],
        cta: { label: '先开始学', action: 'open', projectId: project.id },
        checklist: null,
      };
    }

    if (project.packStatus === 'failed' || project.packStatus === 'cancelled') {
      return {
        kind: 'failed',
        project,
        messages: [
          project.packStatus === 'cancelled'
            ? '上次生成已停止…要不要重新生成？径径等你～'
            : '上次生成没成功…要不要再试一次？径径给你加油！',
          '点卡片上的「重新生成」就好～',
        ],
        cta: null,
        checklist: null,
      };
    }

    // 单条个人路径也带上 pathSnaps，方便以后扩展
    if (user.length === 1 && !isBuiltinSample(project)) {
      const snap = summarizePathDay(project);
      const singleCtx = buildSinglePathContextFromSnap(snap);
      singleCtx.pathSnaps = [snap];
      singleCtx.multi = false;
      return singleCtx;
    }

    const snap = summarizePathDay(project);
    return buildSinglePathContextFromSnap(snap);
  }

  function buildSinglePathContextFromSnap(snap) {
    const project = snap.project;
    const name = snap.name;
    const {
      dayNum,
      practice,
      feynmanDone,
      checkinDone,
      notesDone,
      checklist,
      streak,
      yesterdayOk,
      checked,
      total,
      pct,
      topic,
      milestone,
      allDone,
    } = snap;
    const hour = new Date().getHours();
    const cta = primaryCta(checklist, project.id);

    if (checked === 0 && !checkinDone && practice.done === 0 && !feynmanDone) {
      if (isBuiltinSample(project)) {
        return {
          kind: 'start',
          project,
          dayNum,
          messages: [
            `「${name}」还是展示课表哦～想认真学，先新建自己的路径？`,
            hourGreeting(),
            topic
              ? `展示主题是「${topic}」，点开可试用；主线请走自建路径。`
              : '默认课表可试用界面；主线请点「新建路径」。',
            '提醒：默认课表只是展示样例，真正学习请「新建路径」。',
          ],
          cta: { label: '新建我的路径', action: 'create' },
          checklist,
          streak: 0,
        };
      }
      return {
        kind: 'start',
        project,
        dayNum,
        messages: [
          `「${name}」第 ${dayNum} 天，径径盯着你的专属路径～`,
          hourGreeting(),
          topic
            ? `今天主题是「${topic}」，先练一练再复述、打卡？`
            : '先做今日练习，再写复述、打卡～',
        ],
        cta: { label: '开始学习', projectId: project.id, focus: 'practice' },
        checklist,
        streak: 0,
      };
    }

    if (allDone) {
      const msgs = [
        `第 ${dayNum} 天任务全满！练习、复述、打卡都齐了～径径给你比心！`,
        streak > 1
          ? `连续 ${streak} 天啦，稳稳的。明天见～`
          : `进度 ${checked}/${total}（${pct}%）。明天见，记得来哦！`,
        hourGreeting(),
      ];
      if (milestone) {
        msgs.unshift(
          milestone.type === 'days'
            ? `哇，累计打卡 ${milestone.value} 天！径径记下了～`
            : `进度冲到 ${milestone.value}% 了！太棒了！`
        );
      }
      if (needsCreateNudge() && isBuiltinSample(project)) {
        msgs.unshift(
          '展示课表可以玩，但别停在这儿——点「新建路径」才是你的主线！'
        );
      }
      return {
        kind: 'all_done',
        project,
        dayNum,
        messages: msgs,
        cta:
          needsCreateNudge() && isBuiltinSample(project)
            ? { label: '新建我的路径', action: 'create' }
            : { label: '再看一眼', projectId: project.id, focus: 'sprint' },
        checklist,
        streak,
      };
    }

    if (!practice.complete) {
      const left = practice.total - practice.done;
      const msgs = [
        `今日练习还差 ${left} 项（${practice.done}/${practice.total}）～做完再打卡更踏实。`,
        topic
          ? `围绕「${topic}」练一练，勾掉一项也算赢！`
          : '勾掉一项练习也算赢，径径陪你～',
        practice.answered > practice.done
          ? '有作答还没勾完成哦，记得勾一下～'
          : '点「去做练习」，径径带你跳到练习区。',
        hourGreeting(),
      ];
      if (checkinDone) {
        msgs.unshift('打卡已经点过啦，但练习还没做完——补上更圆满哦！');
      }
      if (needsCreateNudge() && isBuiltinSample(project)) {
        msgs.push('别忘了：默认课表只是展示，点「新建路径」才是主线～');
      }
      return {
        kind: 'practice',
        project,
        dayNum,
        messages: msgs,
        cta: { label: '去做练习', projectId: project.id, focus: 'practice' },
        checklist,
        streak,
      };
    }

    if (!feynmanDone) {
      const msgs = [
        '练习完成了！再用自己的话写一段复述，记得更牢～',
        '费曼复述：用一句话向非专业人士讲清楚今天学了什么？',
        notesDone
          ? '笔记有了，补一句复述就更完整啦。'
          : '写满两三句就好，不用长篇大论。',
        hourGreeting(),
      ];
      if (checkinDone) {
        msgs.unshift('打卡好了，复述还空着——花一分钟补上？');
      }
      return {
        kind: 'recite',
        project,
        dayNum,
        messages: msgs,
        cta: { label: '写复述', projectId: project.id, focus: 'feynman' },
        checklist,
        streak,
      };
    }

    if (!checkinDone) {
      const msgs = [];
      if (hour >= 18) {
        msgs.push(`傍晚啦，「${name}」第 ${dayNum} 天还没打卡～收工前点一下？`);
      } else if (hour >= 12) {
        msgs.push(`「${name}」第 ${dayNum} 天练习和复述都齐了，就差打卡啦！`);
      } else {
        msgs.push(`早起的鸟儿～第 ${dayNum} 天任务快齐了，打个卡吧！`);
      }

      if (yesterdayOk && streak >= 1) {
        msgs.push(`昨天打过卡了，今天别断～已经连续 ${streak} 天，接上吧！`);
      } else if (yesterdayOk) {
        msgs.push('昨天打过卡了，今天别断签哦～');
      } else if (streak === 0 && checked > 0) {
        msgs.push('有几天没来？没关系，今天重新接上就好。');
      }

      msgs.push(`进度 ${checked}/${total}（${pct}%）。点「去打卡」径径帮你开门！`);
      msgs.push(hourGreeting());

      return {
        kind: 'checkin',
        project,
        dayNum,
        messages: msgs,
        cta: { label: '去打卡', projectId: project.id, focus: 'checkin' },
        checklist,
        streak,
      };
    }

    return {
      kind: 'nudge',
      project,
      dayNum,
      messages: [
        `「${name}」今天还有任务没勾完～看看清单？`,
        hourGreeting(),
      ],
      cta,
      checklist,
      streak,
    };
  }

  function getPlanDayForProject(project, dayNum) {
    if (!project) return null;
    const builtinDefault =
      project.packId === 'pm-30-intro' ||
      project.id === ProjectPlatform.DEFAULT_ID ||
      project.isDefault;
    const builtinEmbody =
      project.packId === 'embodied-ai-pm' || project.id === ProjectPlatform.EMBODY_ID;

    if (builtinDefault && typeof Pm30Pack !== 'undefined') {
      return Pm30Pack.getPlan()?.[dayNum - 1] || null;
    }
    if (builtinEmbody && typeof LEARNING_PLAN !== 'undefined') {
      return LEARNING_PLAN[dayNum - 1] || null;
    }
    if (project.packId && typeof ContentPack !== 'undefined' && !ContentPack.isBuiltinPackId?.(project.packId)) {
      const pack = ContentPack.load(project.packId);
      return pack?.plan?.[dayNum - 1] || null;
    }
    return null;
  }

  /** 估算今日练习总数（首页未激活 ContentPack 时也能读） */
  function getExerciseTotal(project, dayNum, data) {
    const key = String(dayNum);
    const saved = data?.dailyPractice?.[key] || {};
    const savedCount = Object.keys(saved).length;

    if (project.packId && typeof ContentPack !== 'undefined' && !ContentPack.isBuiltinPackId?.(project.packId)) {
      const pack = ContentPack.load(project.packId);
      const curated = pack?.dayExercises?.[key] || pack?.dayExercises?.[dayNum];
      if (Array.isArray(curated) && curated.length) return curated.length;
      const planDay = pack?.plan?.[dayNum - 1];
      if (planDay && typeof buildGeneratedExercises === 'function') {
        return buildGeneratedExercises(planDay).length;
      }
    }

    const builtinDefault =
      project.packId === 'pm-30-intro' ||
      project.id === ProjectPlatform.DEFAULT_ID ||
      project.isDefault;
    if (builtinDefault) {
      const planDay = typeof Pm30Pack !== 'undefined' ? Pm30Pack.getPlan()?.[dayNum - 1] : null;
      if (planDay && typeof buildGeneratedExercises === 'function') {
        return buildGeneratedExercises(planDay).length;
      }
    }

    const builtinEmbody =
      project.packId === 'embodied-ai-pm' || project.id === ProjectPlatform.EMBODY_ID;
    if (builtinEmbody && typeof getDailyExercises === 'function') {
      const plan = typeof LEARNING_PLAN !== 'undefined' ? LEARNING_PLAN[dayNum - 1] : null;
      return getDailyExercises(dayNum, plan).length;
    }

    if (savedCount) {
      const maxIdx = Math.max(...Object.keys(saved).map(Number).filter(Number.isFinite));
      return Math.max(savedCount, maxIdx + 1);
    }
    return 3;
  }

  function getPracticeProgress(data, dayNum, total) {
    const saved = data?.dailyPractice?.[String(dayNum)] || {};
    let done = 0;
    let answered = 0;
    for (let i = 0; i < total; i++) {
      const item = saved[String(i)];
      if (item?.done) done++;
      if (item?.answer && String(item.answer).trim()) answered++;
    }
    return { done, answered, total, complete: total > 0 && done >= total };
  }

  function calcStreak(data, dayNum) {
    // 今日未打卡时，从昨天往前数，用于「别断签」文案
    let start = dayNum;
    if (!data?.checkins?.[String(dayNum)]) start = dayNum - 1;
    let streak = 0;
    for (let d = start; d >= 1; d--) {
      if (data?.checkins?.[String(d)]) streak++;
      else break;
    }
    return streak;
  }

  function hadYesterday(data, dayNum) {
    if (dayNum <= 1) return false;
    return !!(data?.checkins?.[String(dayNum - 1)]);
  }

  function findMilestone(checked, total) {
    if (MILESTONE_DAYS.includes(checked)) {
      return { type: 'days', value: checked };
    }
    const pct = total ? Math.round((checked / total) * 100) : 0;
    if (MILESTONE_PCT.includes(pct) && checked > 0) {
      return { type: 'pct', value: pct };
    }
    return null;
  }

  function hasFeynman(data, dayNum) {
    const text = data?.feynman?.[String(dayNum)];
    return !!(text && String(text).trim().length >= 8);
  }

  function hasNotes(data, dayNum) {
    const text = data?.notes?.[String(dayNum)];
    return !!(text && String(text).trim().length >= 8);
  }

  function buildChecklist({ practice, feynmanDone, checkinDone }) {
    return [
      {
        id: 'practice',
        label: '每日练习',
        detail: practice.total ? `${practice.done}/${practice.total}` : '',
        done: practice.complete,
        focus: 'practice',
      },
      {
        id: 'feynman',
        label: '费曼复述',
        detail: feynmanDone ? '已写' : '待写',
        done: feynmanDone,
        focus: 'feynman',
      },
      {
        id: 'checkin',
        label: '今日打卡',
        detail: checkinDone ? '完成' : '未打',
        done: checkinDone,
        focus: 'checkin',
      },
    ];
  }


  function figureMarkup() {
    const poses = ['idle', 'cheer', 'think', 'practice', 'point', 'sleepy', 'shy', 'giggle', 'stretch', 'read'];
    const imgs = poses
      .map(
        (pose) =>
          `<img class="mascot-sprite" data-pose="${pose}" src="${ASSET}/jingjing-${pose}.png?v=20260717b" alt="" draggable="false">`
      )
      .join('\n          ');
    return `
      <div class="mascot-figure" aria-hidden="true">
        <div class="mascot-aura"></div>
        <div class="mascot-sprites">
          ${imgs}
        </div>
        <div class="mascot-fx">
          <span class="mascot-spark"></span>
          <span class="mascot-spark"></span>
          <span class="mascot-spark"></span>
          <span class="mascot-spark"></span>
          <span class="mascot-spark"></span>
          <span class="mascot-heart-fx"></span>
        </div>
      </div>`;
  }

  /** 说话感：轻点头 + 气泡节奏，不换脸、不加眼皮 */
  function startTalking(ms = 2400) {
    if (!root) return;
    clearTimeout(talkEndTimer);
    root.classList.add('is-speaking');
    talkEndTimer = setTimeout(() => {
      root?.classList.remove('is-speaking');
    }, ms);
  }

  function stopFaceFx() {
    clearTimeout(talkEndTimer);
    talkEndTimer = null;
    if (!root) return;
    root.classList.remove('is-speaking');
  }

  function openWithFocus(projectId, focus) {
    if (typeof openProjectHandler !== 'function') return;
    playMood('wave', 1400);
    startTalking(1800);
    openProjectHandler(projectId, { focus: focus || firstIncompleteFocus(lastCtx?.checklist || []) });
  }

  function openCreatePath() {
    playMood('shy', 1600);
    startTalking(1600);
    if (typeof openCreateHandler === 'function') {
      openCreateHandler();
      return;
    }
    document.getElementById('btn-create-project')?.click();
  }

  function ensureDom() {
    if (root) return;
    root = document.createElement('aside');
    root.id = 'mascot-companion';
    root.className = 'mascot-root';
    root.setAttribute('aria-label', '学习提醒看板娘径径');
    root.dataset.mood = 'idle';
    root.dataset.pose = 'idle';
    root.innerHTML = `
      <div class="mascot-bubble" id="mascot-bubble" role="status" aria-live="polite">
        <span class="mascot-bubble-kicker" id="mascot-kicker">径径提醒</span>
        <p class="mascot-bubble-text" id="mascot-text">今天也一起学一点点吧～</p>
        <ul class="mascot-checklist" id="mascot-checklist" hidden></ul>
        <div class="mascot-bubble-actions" id="mascot-actions"></div>
        <span class="mascot-bubble-tail" aria-hidden="true"></span>
      </div>
      <div class="mascot-stage" id="mascot-stage" role="button" tabindex="0" title="点我打开今日任务">
        <button type="button" class="mascot-close" id="mascot-minimize" title="收起看板娘" aria-label="收起看板娘">×</button>
        <div class="mascot-shadow-oval" aria-hidden="true"></div>
        ${figureMarkup()}
      </div>
      <button type="button" class="mascot-mini" id="mascot-mini" title="展开径径" aria-label="展开看板娘径径">
        <img src="${ASSET}/jingjing-mini.png" alt="">
      </button>
    `;
    document.body.appendChild(root);

    bubbleEl = root.querySelector('#mascot-bubble');
    textEl = root.querySelector('#mascot-text');
    kickerEl = root.querySelector('#mascot-kicker');
    actionsEl = root.querySelector('#mascot-actions');
    checklistEl = root.querySelector('#mascot-checklist');

    const stage = root.querySelector('#mascot-stage');
    stage.addEventListener('click', (e) => {
      if (e.target.closest('#mascot-minimize')) return;
      onInteract();
    });
    stage.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onInteract();
      }
    });

    root.querySelector('#mascot-minimize').addEventListener('click', (e) => {
      e.stopPropagation();
      setMinimized(true);
    });
    root.querySelector('#mascot-mini').addEventListener('click', () => {
      setMinimized(false);
      tasksPanelOpen = false;
      root.classList.remove('is-tasks-open');
      playMood('wave');
      refresh(true);
    });

    checklistEl.addEventListener('click', (e) => {
      const item = e.target.closest('.mascot-check-item');
      if (!item) return;
      if (item.classList.contains('is-soft') && !item.getAttribute('data-project-id')) return;
      const projectId = item.getAttribute('data-project-id') || lastCtx?.project?.id;
      const focus = item.getAttribute('data-focus');
      if (!projectId) return;
      e.stopPropagation();
      openWithFocus(projectId, focus || 'sprint');
    });
  }

  function setMinimized(mini) {
    if (!root) return;
    root.classList.toggle('is-minimized', mini);
    try {
      localStorage.setItem(MINI_KEY, mini ? '1' : '0');
    } catch { /* ignore */ }
  }

  function setHidden(hidden) {
    if (!root) return;
    root.classList.toggle('is-hidden', hidden);
    try {
      localStorage.setItem(HIDDEN_KEY, hidden ? '1' : '0');
    } catch { /* ignore */ }
  }

  /**
   * 切换姿态。ms 传 null 表示一直保持，直到下一次 playMood（碎碎念直接切动作，不先闪回 idle）。
   */
  function playMood(mood, ms = 1600) {
    if (!root) return;
    const pose = MOOD_POSE[mood] || 'idle';
    root.dataset.mood = mood;
    root.dataset.pose = pose;
    clearTimeout(moodTimer);
    moodTimer = null;
    if (ms == null || !Number.isFinite(ms)) return;
    moodTimer = setTimeout(() => {
      if (!root) return;
      root.dataset.mood = 'idle';
      root.dataset.pose = 'idle';
    }, Math.max(0, ms));
  }

  function moodForKind(kind) {
    switch (kind) {
      case 'all_done':
      case 'done':
        return 'cheer';
      case 'start':
        return 'nod';
      case 'practice':
        return 'practice';
      case 'recite':
        return 'think';
      case 'checkin':
        return 'point';
      case 'nudge':
        return 'wave';
      case 'empty':
        return 'peek';
      case 'generating':
      case 'partial':
      case 'failed':
        return 'think';
      default:
        return 'wave';
    }
  }

  function greetingMood() {
    const h = new Date().getHours();
    if (h < 6 || h >= 22) return 'sleepy';
    if (h < 11) return 'stretch';
    if (h < 14) return 'read';
    if (h < 18) return 'wave';
    return 'giggle';
  }

  function buildIdleMessages(ctx) {
    if (!ctx?.project || ctx?.kind === 'empty') {
      return [
        { text: hourGreeting(), mood: greetingMood() },
        { text: '默认课表只是展示～快点「新建路径」！', mood: 'point' },
        { text: '填行业和岗位，走出属于你的知径～', mood: 'wave' },
      ];
    }
    const lines = [{ text: hourGreeting(), mood: greetingMood() }, ...IDLE_CHATTER];
    if (ctx?.kind === 'practice') {
      lines.push({ text: '总感觉今天练习还可以再推一把…想看看的话戳我～', mood: 'practice' });
    } else if (ctx?.kind === 'recite') {
      lines.push({ text: '复述写两句就好，想列清单的话点我一下。', mood: 'think' });
    } else if (ctx?.kind === 'checkin') {
      lines.push({ text: '好像就差打卡啦～点我打开任务清单？', mood: 'point' });
    } else if (ctx?.kind === 'all_done' || ctx?.kind === 'done') {
      lines.push({ text: '今天好像都齐了？给你比个心～', mood: 'cheer' });
    } else if (ctx?.kind === 'start') {
      lines.push({ text: '新的一天，要从哪一步开始呢？戳我我帮你列出来。', mood: 'stretch' });
    }
    if (needsCreateNudge()) {
      lines.push({ text: '默认「产品经理入门」只是样例展示，别当终点哦。', mood: 'read' });
      lines.push({ text: '正经学习：点「新建路径」，创建你自己的课表！', mood: 'point' });
      lines.push({ text: '戳我 → 去新建路径，径径催你啦～', mood: 'wave' });
    }
    if (ctx?.project && hasUserPaths()) {
      if (ctx.multi && ctx.incompleteCount > 1) {
        lines.push({
          text: `今天还有 ${ctx.incompleteCount} 条路径没收工，戳我看汇总～`,
          mood: 'point',
        });
      } else {
        const name = ctx.project.shortName || ctx.project.title;
        lines.push({ text: `「${name}」还在等你哦。`, mood: 'read' });
      }
    }
    return lines;
  }

  function renderChecklist(ctx) {
    if (!checklistEl) return;
    const list = ctx.checklist;
    if (!tasksPanelOpen || !list || !list.length) {
      checklistEl.hidden = true;
      checklistEl.innerHTML = '';
      return;
    }
    checklistEl.hidden = false;
    const pathRows = list.filter((t) => !t.isMore);
    const doneCount = pathRows.filter((t) => t.done).length;
    const head = ctx.multi
      ? typeof ctx.incompleteCount === 'number'
        ? `今日路径 · ${ctx.incompleteCount} 条待完成 / 共 ${ctx.pathCount || pathRows.length} 条`
        : `今日路径 ${doneCount}/${pathRows.length}`
      : `今日任务 ${list.filter((t) => t.done).length}/${list.length}`;
    checklistEl.innerHTML = `
      <li class="mascot-checklist-head">${head}</li>
      ${list
        .map((t) => {
          const pid = t.projectId ? ` data-project-id="${escapeAttr(t.projectId)}"` : '';
          const focus = t.focus ? ` data-focus="${escapeAttr(t.focus)}"` : '';
          const soft = t.soft || t.isMore ? ' is-soft' : '';
          const title = t.isMore
            ? '请在路径卡片中查看'
            : t.done
              ? '已完成'
              : t.projectId
                ? '去完成'
                : '';
          return `<li class="mascot-check-item ${t.done ? 'is-done' : 'is-todo'}${soft}"${pid}${focus} role="button" tabindex="0" title="${title}">
          <span class="mascot-check-mark" aria-hidden="true">${t.done ? '✓' : '○'}</span>
          <span class="mascot-check-label">${escapeHtml(t.label)}</span>
          ${t.detail ? `<span class="mascot-check-detail">${escapeHtml(t.detail)}</span>` : ''}
        </li>`;
        })
        .join('')}
    `;
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, '&#39;');
  }

  function renderActions(ctx) {
    if (!actionsEl) return;
    actionsEl.innerHTML = '';

    if (!tasksPanelOpen) {
      const openBtn = document.createElement('button');
      openBtn.type = 'button';
      openBtn.className = 'mascot-cta-primary';
      if (!ctx?.project || needsCreateNudge()) {
        openBtn.textContent = '新建我的路径';
        openBtn.title = '默认课表仅展示，创建属于你的岗位路径';
        openBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openCreatePath();
        });
      } else {
        openBtn.textContent = ctx.multi ? '今日路径' : '今日任务';
        openBtn.title = ctx.multi ? '展开多路径今日汇总' : '展开今日任务清单';
        openBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openTasksPanel(true);
        });
      }
      actionsEl.appendChild(openBtn);
      return;
    }

    if (ctx.cta?.action === 'create') {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mascot-cta-primary';
      btn.textContent = ctx.cta.label || '新建路径';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openCreatePath();
      });
      actionsEl.appendChild(btn);
    } else if (ctx.cta && typeof openProjectHandler === 'function') {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mascot-cta-primary';
      btn.textContent = ctx.cta.label;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openWithFocus(ctx.cta.projectId, ctx.cta.focus);
      });
      actionsEl.appendChild(btn);
    }

    if (ctx.checklist && typeof openProjectHandler === 'function') {
      if (ctx.multi && Array.isArray(ctx.pathSnaps)) {
        const extras = ctx.pathSnaps
          .filter((s) => s.ready && !s.allDone && s.project.id !== ctx.cta?.projectId)
          .slice(0, 2);
        extras.forEach((s) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.textContent = (s.name || '路径').slice(0, 6);
          b.title = `打开「${s.name}」`;
          b.addEventListener('click', (e) => {
            e.stopPropagation();
            openWithFocus(s.project.id, s.primaryFocus);
          });
          actionsEl.appendChild(b);
        });
      } else {
        const extras = ctx.checklist.filter((t) => !t.done && t.focus !== ctx.cta?.focus);
        extras.slice(0, 2).forEach((t) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.textContent = t.id === 'practice' ? '练习' : t.id === 'feynman' ? '复述' : '打卡';
          b.title = `跳到${t.label}`;
          b.addEventListener('click', (e) => {
            e.stopPropagation();
            openWithFocus(ctx.project.id, t.focus);
          });
          actionsEl.appendChild(b);
        });
      }
    }

    const next = document.createElement('button');
    next.type = 'button';
    next.textContent = '换一句';
    next.addEventListener('click', (e) => {
      e.stopPropagation();
      tipIndex += 1;
      applyTip(ctx, true);
      playMood(ctx.kind === 'empty' ? 'shy' : 'peek', 1400);
    });
    actionsEl.appendChild(next);

    if (ctx.kind !== 'empty') {
      const close = document.createElement('button');
      close.type = 'button';
      close.textContent = '收起';
      close.title = '收起任务清单，继续闲聊';
      close.addEventListener('click', (e) => {
        e.stopPropagation();
        closeTasksPanel(true);
      });
      actionsEl.appendChild(close);
    }
  }

  function applyTip(ctx, animate) {
    if (!textEl || !kickerEl || !bubbleEl) return;
    lastCtx = ctx;

    let text;
    let idleMood = null;
    if (tasksPanelOpen) {
      const msgs = ctx.messages || ['今天也一起学一点点吧～'];
      text = msgs[tipIndex % msgs.length];
      const kickers = {
        empty: '径径邀请',
        generating: '径径等待',
        failed: '径径安慰',
        all_done: '径径夸夸',
        done: '径径夸夸',
        start: '径径催学',
        practice: '练习提醒',
        recite: '复述提醒',
        checkin: '打卡提醒',
        nudge: '径径提醒',
      };
      if (ctx.multi) {
        kickerEl.textContent = ctx.kind === 'all_done' ? '多路径完成' : '多路径今日';
      } else {
        kickerEl.textContent = kickers[ctx.kind] || '今日任务';
      }
    } else {
      const msgs = buildIdleMessages(ctx);
      const item = msgs[idleTipIndex % msgs.length];
      text = item.text;
      idleMood = item.mood || 'wave';
      kickerEl.textContent = '径径';
    }

    textEl.textContent = text;
    renderChecklist(ctx);
    const talkMs = Math.min(2800, 800 + text.length * 48);
    startTalking(talkMs);
    if (!tasksPanelOpen && idleMood && !root?.classList.contains('is-minimized')) {
      // 保持碎碎念动作直到下一句，不中途闪回 idle
      playMood(idleMood, null);
    }
    if (animate) {
      bubbleEl.classList.remove('is-swap');
      void bubbleEl.offsetWidth;
      bubbleEl.classList.add('is-swap');
    }
  }

  function openTasksPanel(animate) {
    tasksPanelOpen = true;
    if (root) root.classList.add('is-tasks-open');
    const ctx = buildContext();
    tipIndex = 0;
    applyTip(ctx, !!animate);
    renderActions(ctx);
    playMood(moodForKind(ctx.kind), null);
  }

  function closeTasksPanel(animate) {
    tasksPanelOpen = false;
    if (root) root.classList.remove('is-tasks-open');
    const ctx = buildContext();
    idleTipIndex += 1;
    applyTip(ctx, !!animate);
    renderActions(ctx);
  }

  function refresh(animateBubble) {
    ensureDom();
    if (!document.body.classList.contains('mode-home')) {
      return;
    }
    try {
      if (localStorage.getItem(HIDDEN_KEY) === '1') {
        setHidden(true);
        return;
      }
    } catch { /* ignore */ }

    setHidden(false);
    try {
      setMinimized(localStorage.getItem(MINI_KEY) === '1');
    } catch {
      setMinimized(false);
    }

    const ctx = buildContext();
    applyTip(ctx, !!animateBubble);
    renderActions(ctx);
    if (!root.classList.contains('is-minimized') && tasksPanelOpen) {
      playMood(moodForKind(ctx.kind), null);
    }
  }

  function onInteract() {
    // 无自建路径：点击径径直接催新建（默认课表仅展示）
    if (needsCreateNudge()) {
      openCreatePath();
      return;
    }
    if (!tasksPanelOpen) {
      openTasksPanel(true);
      return;
    }
    const ctx = buildContext();
    tipIndex += 1;
    applyTip(ctx, true);
    renderActions(ctx);
    const moods = ['wave', 'cheer', 'think', 'practice', 'point', 'giggle', 'read'];
    playMood(moods[tipIndex % moods.length], null);
  }

  function startTipLoop() {
    clearTimeout(tipTimer);
    const tick = () => {
      tipTimer = setTimeout(() => {
        if (!document.body.classList.contains('mode-home')) {
          tick();
          return;
        }
        if (!root || root.classList.contains('is-minimized') || root.classList.contains('is-hidden')) {
          tick();
          return;
        }

        const ctx = buildContext();
        if (tasksPanelOpen) {
          tipIndex += 1;
          applyTip(ctx, true);
          playMood(moodForKind(ctx.kind), null);
        } else {
          idleTipIndex += 1;
          applyTip(ctx, true);
          renderActions(ctx);
          // 姿态由 applyTip 直接切到下一动作并保持
        }
        tick();
      }, 10000 + Math.floor(Math.random() * 8000));
    };
    tick();
  }

  function show() {
    ensureDom();
    tipIndex = 0;
    idleTipIndex = 0;
    tasksPanelOpen = false;
    root.classList.remove('is-tasks-open');
    root.classList.add('is-entering');
    setTimeout(() => root?.classList.remove('is-entering'), 750);
    refresh(true);
    startTipLoop();
  }

  function hide() {
    clearTimeout(tipTimer);
    tipTimer = null;
    clearTimeout(moodTimer);
    stopFaceFx();
    tasksPanelOpen = false;
    if (root) {
      root.classList.remove('is-tasks-open');
      root.dataset.mood = 'idle';
      root.dataset.pose = 'idle';
    }
  }

  function init(opts = {}) {
    openProjectHandler = typeof opts.openProject === 'function' ? opts.openProject : null;
    openCreateHandler = typeof opts.openCreate === 'function' ? opts.openCreate : null;
    ensureDom();
    if (document.body.classList.contains('mode-home')) show();
  }

  return { init, show, hide, refresh, playMood };
})();
