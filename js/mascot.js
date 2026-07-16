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
    { before: 14, text: '中午好～学一会儿再吃，效率更高哦。' },
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

  function resolveFocusProject() {
    const projects = typeof ProjectPlatform !== 'undefined' ? ProjectPlatform.list() : [];
    if (!projects.length) return null;
    // 还没有自建路径：不盯实例包，交给「去新建」引导
    if (!hasUserPaths()) return null;

    const lastId = localStorage.getItem(LAST_OPEN_KEY);
    if (lastId) {
      const hit = projects.find((p) => p.id === lastId);
      if (hit) return hit;
    }
    const user = listUserProjects();
    return user[0] || projects[0];
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

  function firstIncompleteFocus(checklist) {
    const hit = checklist.find((t) => !t.done);
    return hit ? hit.focus : 'sprint';
  }

  function primaryCta(checklist, projectId) {
    const hit = checklist.find((t) => !t.done);
    if (!hit) {
      return { label: '再看一眼', projectId, focus: 'sprint' };
    }
    if (hit.id === 'practice') return { label: '去做练习', projectId, focus: 'practice' };
    if (hit.id === 'feynman') return { label: '写复述', projectId, focus: 'feynman' };
    return { label: '去打卡', projectId, focus: 'checkin' };
  }

  function buildContext() {
    const project = resolveFocusProject();
    if (!project) {
      return {
        kind: 'empty',
        project: null,
        messages: [
          '还没有自己的路径哦～点「新建路径」，径径陪你一起定目标！',
          '下面那份「产品经理入门」是示例课表，先创建一条属于你的路径吧～',
          '填好行业和岗位，就能走出专属知径啦。',
          '创建之后，径径才会开始盯你的练习和打卡哦～',
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
          `「${project.shortName || project.title}」还在准备中，径径先帮你看着进度～`,
          '课表生成中…可以先去别处逛逛，好了径径再叫你！',
        ],
        cta: null,
        checklist: null,
      };
    }

    if (project.packStatus === 'failed') {
      return {
        kind: 'failed',
        project,
        messages: [
          '上次生成没成功…要不要再试一次？径径给你加油！',
          '失败不可怕，点卡片上的「重新生成」就好～',
        ],
        cta: null,
        checklist: null,
      };
    }

    const { checked, total } = ProjectPlatform.progressStats(project.id);
    const data = loadProjectData(project.id) || {};
    const dayNum = getTodayDayNum(data, total);
    const checkinDone = !!(data.checkins && data.checkins[String(dayNum)]);
    const pct = total ? Math.round((checked / total) * 100) : 0;
    const name = project.shortName || project.title;
    const exTotal = getExerciseTotal(project, dayNum, data);
    const practice = getPracticeProgress(data, dayNum, exTotal);
    const feynmanDone = hasFeynman(data, dayNum);
    const notesDone = hasNotes(data, dayNum);
    const streak = calcStreak(data, dayNum);
    const yesterdayOk = hadYesterday(data, dayNum);
    const hour = new Date().getHours();
    const planDay = getPlanDayForProject(project, dayNum);
    const topic = planDay?.topic ? String(planDay.topic) : '';
    const checklist = buildChecklist({ practice, feynmanDone, checkinDone });
    const allDone = checklist.every((t) => t.done);
    const cta = primaryCta(checklist, project.id);
    const milestone = findMilestone(checked, total);

    if (checked === 0 && !checkinDone && practice.done === 0 && !feynmanDone) {
      return {
        kind: 'start',
        project,
        dayNum,
        messages: [
          `「${name}」还没起步呢～今天就从第 ${dayNum} 天开始？`,
          hourGreeting(),
          topic
            ? `今天主题是「${topic}」，一点点就好，径径陪你～`
            : '一点点就好，径径陪你打开今天的任务！',
          '先看练习 → 写复述 → 再打卡，节奏刚刚好。',
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
      return {
        kind: 'all_done',
        project,
        dayNum,
        messages: msgs,
        cta,
        checklist,
        streak,
      };
    }

    // —— 练习优先提醒 ——
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

    // —— 复述提醒 ——
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

    // —— 打卡增强提醒（练习+复述都好了，只差打卡） ——
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

    // 兜底：有未完成项
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

  function figureMarkup() {
    const poses = ['idle', 'cheer', 'think', 'practice', 'point', 'sleepy', 'shy', 'giggle', 'stretch', 'read'];
    const imgs = poses
      .map(
        (pose) =>
          `<img class="mascot-sprite" data-pose="${pose}" src="${ASSET}/jingjing-${pose}.png?v=20260716g" alt="" draggable="false">`
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
      const item = e.target.closest('[data-focus]');
      if (!item || !lastCtx?.project) return;
      e.stopPropagation();
      openWithFocus(lastCtx.project.id, item.getAttribute('data-focus'));
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
    if (!hasUserPaths() || ctx?.kind === 'empty') {
      return [
        { text: hourGreeting(), mood: greetingMood() },
        { text: '还没有自己的路径呀～点「新建路径」，径径陪你定目标！', mood: 'shy' },
        { text: '示例课表可以先逛逛，真正开练前先创建一条属于你的路径哦。', mood: 'read' },
        { text: '创建好路径之后，我才会开始提醒练习和打卡～', mood: 'point' },
        { text: '戳「今日任务」或「新建路径」，我们马上出发！', mood: 'wave' },
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
    } else if (ctx?.kind === 'empty') {
      lines.push({ text: '还没有路径的话，先去新建一条吧～', mood: 'shy' });
    }
    if (ctx?.project) {
      const name = ctx.project.shortName || ctx.project.title;
      lines.push({ text: `「${name}」还在等你哦。`, mood: 'read' });
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
    const doneCount = list.filter((t) => t.done).length;
    checklistEl.innerHTML = `
      <li class="mascot-checklist-head">今日任务 ${doneCount}/${list.length}</li>
      ${list.map((t) => `
        <li class="mascot-check-item ${t.done ? 'is-done' : 'is-todo'}" data-focus="${t.focus}" role="button" tabindex="0" title="${t.done ? '已完成' : '去完成'}">
          <span class="mascot-check-mark" aria-hidden="true">${t.done ? '✓' : '○'}</span>
          <span class="mascot-check-label">${t.label}</span>
          ${t.detail ? `<span class="mascot-check-detail">${t.detail}</span>` : ''}
        </li>
      `).join('')}
    `;
  }

  function renderActions(ctx) {
    if (!actionsEl) return;
    actionsEl.innerHTML = '';

    if (!tasksPanelOpen) {
      const openBtn = document.createElement('button');
      openBtn.type = 'button';
      openBtn.className = 'mascot-cta-primary';
      if (!hasUserPaths()) {
        openBtn.textContent = '新建路径';
        openBtn.title = '创建一条属于你的学习路径';
        openBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openCreatePath();
        });
      } else {
        openBtn.textContent = '今日任务';
        openBtn.title = '展开今日任务清单';
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
      kickerEl.textContent = kickers[ctx.kind] || '今日任务';
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
    if (!hasUserPaths()) {
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
