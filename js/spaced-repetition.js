/**
 * 间隔复习引擎（简化 SM-2）
 * 规则：只复习「已打卡」解锁的内容；逐步积累，不预塞全部术语。
 * 题型：term（翻转）/ mcq（选择）/ short（简答）/ interview（翻转）
 *
 * appData.srsCards[id] = {
 *   type, format, front, back, meta, choices?, correctIndex?,
 *   due, interval, ease, reps, lapses, suspended, unlocked, sourceDay?
 * }
 */
const SpacedRepetition = {
  GRADES: {
    again: 1,
    hard: 2,
    good: 3,
    easy: 4,
  },

  TERMS_PER_CHECKIN: 2,
  MCQ_DISTRACTORS: 3,

  /**
   * 默认具身包：天数 → 应复习的术语（与课表主题对齐，不是「术语表前缀切片」）
   * AI 包会再用主题文本匹配 glossary 作补充。
   */
  DAY_TERM_HINTS: {
    1: ['具身智能'],
    2: ['具身智能'],
    3: ['具身智能'],
    4: ['宇树', 'Optimus'],
    5: ['宇树', 'Optimus'],
    6: ['宇树'],
    7: ['具身智能'],
    8: ['具身智能'],
    9: ['伺服驱动器', 'IMU'],
    10: ['IMU'],
    11: ['VLA', 'RT-2', 'OpenVLA'],
    12: ['强化学习'],
    13: ['模仿学习'],
    14: ['数据闭环', '数据飞轮'],
    15: ['PRD'],
    16: ['PRD'],
    17: ['数据飞轮', '数据闭环'],
    18: ['宇树', 'Optimus'],
    19: ['宇树'],
    20: ['PRD'],
    23: ['VLA', 'RT-2', 'OpenVLA'],
    24: ['世界模型', 'Diffusion Policy'],
    25: ['CoRL', 'VLA'],
    26: ['强化学习', '模仿学习'],
    56: ['VLA'],
    65: ['VLA'],
    71: ['PRD'],
  },

  todayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  },

  addDays(iso, days) {
    const [y, m, d] = iso.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + days);
    const yy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  },

  getLearnedDays(data) {
    return Object.keys(data?.checkins || {})
      .filter((k) => data.checkins[k])
      .map(Number)
      .filter((n) => Number.isFinite(n) && n >= 1)
      .sort((a, b) => a - b);
  },

  parseDayRange(daysStr) {
    if (!daysStr) return null;
    const s = String(daysStr);
    if (s.includes('-')) {
      const [a, b] = s.split('-').map(Number);
      if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
      return [Math.min(a, b), Math.max(a, b)];
    }
    const n = Number(s);
    return Number.isFinite(n) ? [n, n] : null;
  },

  newCard(partial = {}) {
    return {
      type: partial.type || 'term',
      format: partial.format || 'flip',
      front: partial.front || '',
      back: partial.back || '',
      meta: partial.meta || {},
      choices: partial.choices || null,
      correctIndex: typeof partial.correctIndex === 'number' ? partial.correctIndex : null,
      due: partial.due || SpacedRepetition.todayISO(),
      interval: 0,
      ease: 2.5,
      reps: 0,
      lapses: 0,
      suspended: !!partial.suspended,
      unlocked: partial.unlocked !== false,
      sourceDay: partial.sourceDay ?? null,
      updatedAt: new Date().toISOString(),
    };
  },

  ensureDeck(data) {
    if (!data.srsCards || typeof data.srsCards !== 'object') data.srsCards = {};
    return data.srsCards;
  },

  getCard(data, id) {
    return SpacedRepetition.ensureDeck(data)[id] || null;
  },

  /**
   * 新建或更新内容；不会重置已有 SM-2 进度。
   * options.forceDueToday / unlockNow
   */
  upsertCard(data, id, content = {}) {
    const deck = SpacedRepetition.ensureDeck(data);
    const unlockNow = content.unlockNow !== false;
    if (!deck[id]) {
      deck[id] = SpacedRepetition.newCard({
        ...content,
        unlocked: unlockNow,
        suspended: content.suspended || !unlockNow,
      });
    } else {
      deck[id].front = content.front ?? deck[id].front;
      deck[id].back = content.back ?? deck[id].back;
      deck[id].type = content.type ?? deck[id].type;
      deck[id].format = content.format ?? deck[id].format;
      deck[id].meta = { ...deck[id].meta, ...(content.meta || {}) };
      if (content.choices) deck[id].choices = content.choices;
      if (typeof content.correctIndex === 'number') deck[id].correctIndex = content.correctIndex;
      if (content.sourceDay != null) deck[id].sourceDay = content.sourceDay;
      if (unlockNow) {
        const wasLocked = deck[id].unlocked === false || deck[id].suspended;
        deck[id].unlocked = true;
        deck[id].suspended = false;
        // 首次从「未学」解锁：当天到期
        if (wasLocked && (deck[id].reps || 0) === 0) {
          deck[id].due = SpacedRepetition.todayISO();
        }
      }
      if (content.forceDueToday) {
        deck[id].due = SpacedRepetition.todayISO();
        deck[id].suspended = false;
        deck[id].unlocked = true;
      }
    }
    deck[id].updatedAt = new Date().toISOString();
    return deck[id];
  },

  review(card, grade, today = SpacedRepetition.todayISO()) {
    const q = Math.max(1, Math.min(4, Number(grade) || 1));
    let { interval, ease, reps, lapses } = card;
    ease = typeof ease === 'number' ? ease : 2.5;

    if (q === 1) {
      lapses = (lapses || 0) + 1;
      reps = 0;
      interval = 1;
      ease = Math.max(1.3, ease - 0.2);
    } else {
      if (reps === 0) {
        interval = q === 2 ? 1 : q === 3 ? 1 : 2;
      } else if (reps === 1) {
        interval = q === 2 ? 3 : q === 3 ? 6 : 8;
      } else {
        const mult = q === 2 ? 1.2 : q === 3 ? ease : ease * 1.3;
        interval = Math.max(1, Math.round((interval || 1) * mult));
      }
      reps = (reps || 0) + 1;
      if (q === 2) ease = Math.max(1.3, ease - 0.15);
      if (q === 4) ease = ease + 0.15;
    }

    return {
      ...card,
      interval,
      ease: Math.round(ease * 100) / 100,
      reps,
      lapses: lapses || 0,
      due: SpacedRepetition.addDays(today, interval),
      lastReviewedAt: today,
      updatedAt: new Date().toISOString(),
    };
  },

  applyReview(data, id, grade) {
    const deck = SpacedRepetition.ensureDeck(data);
    const card = deck[id];
    if (!card) return null;
    deck[id] = SpacedRepetition.review(card, grade);
    return deck[id];
  },

  isDue(card, today = SpacedRepetition.todayISO()) {
    if (!card || card.suspended || card.unlocked === false) return false;
    return (card.due || today) <= today;
  },

  listDue(data, { types, formats, limit = 50 } = {}) {
    const deck = SpacedRepetition.ensureDeck(data);
    const today = SpacedRepetition.todayISO();
    const items = Object.entries(deck)
      .filter(([, c]) => SpacedRepetition.isDue(c, today))
      .filter(([, c]) => !types || types.includes(c.type))
      .filter(([, c]) => !formats || formats.includes(c.format || 'flip'))
      .map(([id, c]) => ({ id, ...c }))
      .sort((a, b) => {
        if (a.due !== b.due) return a.due < b.due ? -1 : 1;
        return (a.interval || 0) - (b.interval || 0);
      });
    return limit ? items.slice(0, limit) : items;
  },

  stats(data) {
    const deck = SpacedRepetition.ensureDeck(data);
    const today = SpacedRepetition.todayISO();
    const cards = Object.values(deck).filter((c) => c.unlocked !== false && !c.suspended);
    const due = cards.filter((c) => SpacedRepetition.isDue(c, today)).length;
    const learning = cards.filter((c) => (c.reps || 0) > 0 && (c.interval || 0) < 21).length;
    const mature = cards.filter((c) => (c.interval || 0) >= 21).length;
    const learnedDays = SpacedRepetition.getLearnedDays(data).length;
    return {
      total: cards.length,
      due,
      learning,
      mature,
      new: cards.filter((c) => (c.reps || 0) === 0).length,
      learnedDays,
    };
  },

  shuffleCopy(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  buildMcqForTerm(term, def, pool) {
    const distractors = SpacedRepetition.shuffleCopy(
      pool.filter((p) => p.term !== term && p.def && p.def !== def)
    )
      .slice(0, SpacedRepetition.MCQ_DISTRACTORS)
      .map((p) => p.def);
    while (distractors.length < SpacedRepetition.MCQ_DISTRACTORS) {
      distractors.push('以上都不准确');
    }
    const choices = SpacedRepetition.shuffleCopy([def, ...distractors.slice(0, 3)]);
    const correctIndex = choices.indexOf(def);
    return { choices, correctIndex };
  },

  getPlanDay(dayNum) {
    if (typeof ContentPack !== 'undefined' && ContentPack.getDay) {
      return ContentPack.getDay(dayNum);
    }
    if (typeof Pm30Pack !== 'undefined') return Pm30Pack.getPlan()?.[dayNum - 1] || null;
    return null;
  },

  getGlossaryList() {
    if (typeof ContentPack !== 'undefined' && ContentPack.getGlossaryCards) {
      return ContentPack.getGlossaryCards() || [];
    }
    if (typeof Pm30Pack !== 'undefined') return Pm30Pack.getGlossary?.() || [];
    return [];
  },

  dayTextBlob(plan) {
    if (!plan) return '';
    return `${plan.topic || ''} ${(plan.tasks || []).join(' ')} ${plan.week || ''} ${plan.phase || ''}`;
  },

  /** 根据某一学习日，找出真正相关的术语（主题匹配 + 日提示表） */
  termsForDay(dayNum, plan, glossary) {
    // 具身专属日-术语表仅在内置包启用，避免污染自定义项目
    const useBuiltinHints =
      typeof ContentPack !== 'undefined' &&
      ContentPack.getBuiltinId?.() === ContentPack.BUILTIN_EMBODY;
    const hints = useBuiltinHints ? SpacedRepetition.DAY_TERM_HINTS[dayNum] || [] : [];
    const blob = SpacedRepetition.dayTextBlob(plan);
    const blobLower = blob.toLowerCase();
    const out = [];
    const seen = new Set();

    const push = (g, reason) => {
      if (!g?.term || seen.has(g.term)) return;
      seen.add(g.term);
      out.push({ ...g, _reason: reason });
    };

    // 1) 显式日-术语映射（仅具身默认包）
    hints.forEach((h) => {
      const hit = glossary.find(
        (g) => g.term === h || g.term.includes(h) || h.includes(g.term)
      );
      if (hit) push(hit, 'day-hint');
    });

    // 2) 新包优先使用生成时持久化的日课映射
    glossary.forEach((g) => {
      if (Array.isArray(g.sourceDays) && g.sourceDays.map(Number).includes(Number(dayNum))) {
        push(g, 'source-day');
      }
    });

    // 3) 兼容旧包：术语名出现在当日主题/任务里
    glossary.forEach((g) => {
      const t = String(g.term || '');
      if (t.length >= 2 && blob.includes(t)) push(g, 'topic-text');
      else if (t.length >= 2 && blobLower.includes(t.toLowerCase())) push(g, 'topic-text');
    });

    return out;
  },

  unlockTermTrio(data, g, sourceDay, poolForMcq) {
    const mcq = SpacedRepetition.buildMcqForTerm(g.term, g.def, poolForMcq);
    SpacedRepetition.upsertCard(data, `term:${g.term}`, {
      type: 'term',
      format: 'flip',
      front: g.term,
      back: g.def,
      meta: { term: g.term, fromDay: sourceDay },
      sourceDay,
      unlockNow: true,
    });
    SpacedRepetition.upsertCard(data, `mcq:${g.term}`, {
      type: 'mcq',
      format: 'mcq',
      front: `（Day ${sourceDay}）关于「${g.term}」，下列哪一项描述正确？`,
      back: g.def,
      choices: mcq.choices,
      correctIndex: mcq.correctIndex,
      meta: { term: g.term, fromDay: sourceDay },
      sourceDay,
      unlockNow: true,
    });
    SpacedRepetition.upsertCard(data, `short:${g.term}`, {
      type: 'short',
      format: 'short',
      front: `（Day ${sourceDay}）简答：结合当日学习，用自己的话解释「${g.term}」`,
      back: g.def,
      meta: { term: g.term, fromDay: sourceDay },
      sourceDay,
      unlockNow: true,
    });
  },

  unlockDayTopicCards(data, dayNum, plan, allLearnedPlans) {
    if (!plan?.topic) return;
    const tasksText = (plan.tasks || []).join('；') || '（无任务列表）';
    const otherTopics = SpacedRepetition.shuffleCopy(
      allLearnedPlans
        .filter((p) => p.day !== dayNum && p.topic)
        .map((p) => p.topic)
    ).slice(0, 3);
    while (otherTopics.length < 3) {
      otherTopics.push(`与「${plan.topic}」无关的干扰项 ${otherTopics.length + 1}`);
    }
    const choices = SpacedRepetition.shuffleCopy([plan.topic, ...otherTopics.slice(0, 3)]);
    const correctIndex = choices.indexOf(plan.topic);

    SpacedRepetition.upsertCard(data, `topic:${dayNum}`, {
      type: 'topic',
      format: 'flip',
      front: `Day ${dayNum} 你学的主题是什么？列出 1～2 个当日任务要点。`,
      back: `主题：${plan.topic}\n任务：${tasksText}`,
      meta: { fromDay: dayNum, topic: plan.topic },
      sourceDay: dayNum,
      unlockNow: true,
    });

    SpacedRepetition.upsertCard(data, `topic-mcq:${dayNum}`, {
      type: 'mcq',
      format: 'mcq',
      front: `Day ${dayNum} 的学习主题是？`,
      back: plan.topic,
      choices,
      correctIndex,
      meta: { fromDay: dayNum, topic: plan.topic },
      sourceDay: dayNum,
      unlockNow: true,
    });

    SpacedRepetition.upsertCard(data, `topic-short:${dayNum}`, {
      type: 'short',
      format: 'short',
      front: `简答：用自己的话复述 Day ${dayNum}「${plan.topic}」（可对照任务自检）`,
      back: `参考要点：${tasksText}`,
      meta: { fromDay: dayNum, topic: plan.topic },
      sourceDay: dayNum,
      unlockNow: true,
    });

    // 取当日练习第 1 题作简答复习（若有）
    let exercises = [];
    try {
      if (typeof ContentPack !== 'undefined' && ContentPack.getExercises) {
        exercises = ContentPack.getExercises(dayNum, plan) || [];
      } else if (typeof getDailyExercises === 'function') {
        exercises = getDailyExercises(dayNum, plan) || [];
      }
    } catch {
      exercises = [];
    }
    const ex0 = exercises[0];
    const q0 = typeof ex0 === 'string' ? ex0 : ex0?.q;
    if (q0) {
      const rubric = typeof ex0 === 'object' && Array.isArray(ex0.rubric) ? ex0.rubric.join('；') : '';
      SpacedRepetition.upsertCard(data, `practice-short:${dayNum}:0`, {
        type: 'short',
        format: 'short',
        front: `（Day ${dayNum} 练习回看）${q0}`,
        back: rubric ? `自检要点：${rubric}` : '对照你当日作答与费曼复述自评',
        meta: { fromDay: dayNum, practice: true },
        sourceDay: dayNum,
        unlockNow: true,
      });
    }
  },

  /**
   * 按「已打卡的具体天数」解锁与当天主题相关的复习卡
   * （主题回看 + 相关术语三题型 + 落在该日区间的面试题）
   */
  syncLearnedDeck(data) {
    const learned = SpacedRepetition.getLearnedDays(data);
    const glossary = SpacedRepetition.getGlossaryList();
    const interview =
      typeof ContentPack !== 'undefined' && ContentPack.getInterview
        ? ContentPack.getInterview() || []
        : typeof Pm30Pack !== 'undefined'
          ? Pm30Pack.getInterview() || []
          : [];

    const learnedPlans = learned
      .map((d) => {
        const plan = SpacedRepetition.getPlanDay(d);
        return plan ? { day: d, ...plan } : { day: d, topic: `第 ${d} 天`, tasks: [] };
      });

    /** @type {Map<string, { g: any, sourceDay: number }>} */
    const unlockedTermMap = new Map();
    const keepIds = new Set();

    learned.forEach((dayNum) => {
      const plan = SpacedRepetition.getPlanDay(dayNum);
      SpacedRepetition.unlockDayTopicCards(data, dayNum, plan || { topic: `第 ${dayNum} 天`, tasks: [] }, learnedPlans);
      keepIds.add(`topic:${dayNum}`);
      keepIds.add(`topic-mcq:${dayNum}`);
      keepIds.add(`topic-short:${dayNum}`);
      keepIds.add(`practice-short:${dayNum}:0`);

      const related = SpacedRepetition.termsForDay(dayNum, plan, glossary);
      related.forEach((g) => {
        if (!unlockedTermMap.has(g.term)) {
          unlockedTermMap.set(g.term, { g, sourceDay: dayNum });
        }
      });
    });

    const unlockedTerms = [...unlockedTermMap.values()].map((x) => x.g);

    unlockedTermMap.forEach(({ g, sourceDay }) => {
      SpacedRepetition.unlockTermTrio(data, g, sourceDay, unlockedTerms.length ? unlockedTerms : glossary);
      keepIds.add(`term:${g.term}`);
      keepIds.add(`mcq:${g.term}`);
      keepIds.add(`short:${g.term}`);
    });

    // 面试：仅「题目标注天数」与某个已打卡天重叠
    interview.forEach((q) => {
      const range = SpacedRepetition.parseDayRange(q.days);
      const hitDay =
        range && learned.find((d) => d >= range[0] && d <= range[1]);
      const id = `interview:${q.id}`;
      if (hitDay) {
        SpacedRepetition.upsertCard(data, id, {
          type: 'interview',
          format: 'flip',
          front: q.q,
          back: q.hint ? `提示：${q.hint}` : '（请用 STAR / 结构法作答后自评）',
          meta: { qid: q.id, cat: q.cat, days: q.days, fromDay: hitDay },
          sourceDay: hitDay,
          unlockNow: true,
        });
        keepIds.add(id);
      }
    });

    // 挂起：自动生成但不在本次「已学日相关」集合里的卡（手动加入的面试保留）
    const deck = SpacedRepetition.ensureDeck(data);
    Object.entries(deck).forEach(([id, card]) => {
      if (card?.meta?.manual) return;
      if (keepIds.has(id)) return;
      // 仅处理本引擎自动卡前缀
      if (
        /^(term|mcq|short|topic|topic-mcq|topic-short|practice-short|interview):/.test(id)
      ) {
        card.unlocked = false;
        card.suspended = true;
      }
    });

    return {
      learnedDays: learned.length,
      unlockedTerms: unlockedTerms.length,
      topicCards: learned.length * 3,
    };
  },

  /** @deprecated 使用 syncLearnedDeck */
  seedGlossary(data) {
    return SpacedRepetition.syncLearnedDeck(data);
  },

  /** 面试题手动进入复习（视为已接触，强制解锁） */
  enqueueInterview(data, q, { forceDueToday = true } = {}) {
    if (!q) return;
    SpacedRepetition.upsertCard(data, `interview:${q.id}`, {
      type: 'interview',
      format: 'flip',
      front: q.q,
      back: q.hint ? `提示：${q.hint}` : '',
      meta: { qid: q.id, cat: q.cat, days: q.days, manual: true },
      forceDueToday,
      unlockNow: true,
    });
  },

  removeCard(data, id) {
    const deck = SpacedRepetition.ensureDeck(data);
    delete deck[id];
  },
};

/**
 * 「今日复习」UI：翻转 / 选择题 / 简答题
 */
const SrsReviewUI = {
  init(getAppData, saveAppData) {
    const escapeHtml = (s) =>
      String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    let queue = [];
    let idx = 0;
    let flipped = false;
    let sessionDone = 0;
    let mcqPicked = null;
    let shortRevealed = false;
    let sessionBatchId = null;
    let generating = false;

    const refreshExtras = () => {
      const data = getAppData();
      if (typeof SrsAi !== 'undefined') {
        SrsAi.ensureArchive(data);
        const rolled = SrsAi.rolloverMissedReviews(data);
        if (rolled > 0) saveAppData();
        const model = SrsAi.buildCurveModel(data);
        SrsAi.renderCurveSvg(document.getElementById('srs-curve'), model);
        SrsAi.renderCurveLegend(document.getElementById('srs-curve-legend'), model);
        SrsAi.renderArchiveList(document.getElementById('srs-archive-list'), data);
      }
    };

    const typeLabel = (item) => {
      if (item.meta?.ai) {
        if (item.format === 'mcq' || item.type === 'mcq') return 'AI 选择题';
        if (item.format === 'short' || item.type === 'short') return 'AI 简答题';
        return 'AI 记忆卡';
      }
      if (item.type === 'mcq' || item.format === 'mcq') return '选择题';
      if (item.type === 'short' || item.format === 'short') {
        return item.meta?.practice ? '练习回看' : '简答题';
      }
      if (item.type === 'interview') return '面试题';
      if (item.type === 'topic') return '当日主题';
      return '相关术语';
    };

    const setGenUi = (msg, pct) => {
      const status = document.getElementById('srs-gen-status');
      const bar = document.getElementById('srs-gen-bar');
      const wrap = document.getElementById('srs-gen-progress');
      if (wrap) wrap.hidden = false;
      if (status) status.textContent = msg || '';
      if (bar) bar.style.width = `${Math.max(0, Math.min(100, pct || 0))}%`;
    };

    const hideGenUi = () => {
      const wrap = document.getElementById('srs-gen-progress');
      if (wrap) wrap.hidden = true;
    };

    const generateAiReview = async () => {
      if (generating) return;
      if (typeof SrsAi === 'undefined') {
        alert('SrsAi 模块未加载');
        return;
      }
      const data = getAppData();
      const ctx = SrsAi.buildLearnedContext(data);
      if (!ctx.days.length) {
        alert('请先在「今天」完成至少 1 天打卡，再生成复习题。');
        return;
      }
      if (!AiReview.hasApiKey()) {
        alert('请先开启智能功能');
        AiReview.openSettingsModal?.();
        return;
      }
      generating = true;
      const btn = document.getElementById('srs-ai-generate');
      if (btn) btn.disabled = true;
      setGenUi('准备出题…', 5);
      try {
        const count = Number(document.getElementById('srs-limit')?.value || 12);
        const { items, batchId } = await SrsAi.generateDailyReview(data, {
          count: Math.min(20, Math.max(8, count)),
          onProgress: setGenUi,
        });
        SrsAi.injectGenerated(data, items, batchId);
        sessionBatchId = batchId;
        saveAppData();
        setGenUi(`已生成 ${items.length} 道题`, 100);
        renderHub();
        refreshExtras();
        setTimeout(hideGenUi, 800);
        alert(`已根据你已打卡内容生成 ${items.length} 道复习题，可点「开始今日复习」。`);
      } catch (err) {
        console.error(err);
        hideGenUi();
        if (err.code === 'NO_KEY' || err.code === 'NO_PROXY') AiReview.openSettingsModal?.();
        alert('AI 出题失败：' + (err.message || '未知错误'));
      } finally {
        generating = false;
        if (btn) btn.disabled = false;
      }
    };

    const bind = () => {
      document.getElementById('srs-start')?.addEventListener('click', startSession);
      document.getElementById('srs-ai-generate')?.addEventListener('click', () => generateAiReview());
      document.getElementById('srs-seed-terms')?.addEventListener('click', () => {
        // 无 Key 时的本地兜底：按主题同步（非优先路径）
        const data = getAppData();
        SpacedRepetition.syncLearnedDeck(data);
        saveAppData();
        renderHub();
        refreshExtras();
        alert('已使用本地兜底同步（主题/术语模板）。优先请用「AI 生成今日复习」。');
      });
      document.getElementById('srs-flip')?.addEventListener('click', () => {
        flipped = !flipped;
        renderCard();
      });
      document.getElementById('srs-card')?.addEventListener('click', (e) => {
        if (e.target.closest('[data-srs-grade], .srs-choice, #srs-short-input, #srs-short-reveal')) return;
        const item = queue[idx];
        if (!item) return;
        const fmt = item.format || 'flip';
        if (fmt === 'flip') {
          flipped = !flipped;
          renderCard();
        }
      });
      document.querySelectorAll('[data-srs-grade]').forEach((btn) => {
        btn.addEventListener('click', () => grade(Number(btn.dataset.srsGrade)));
      });
      document.getElementById('srs-short-reveal')?.addEventListener('click', () => {
        shortRevealed = true;
        flipped = true;
        renderCard();
      });
    };

    const filterTypes = (filter) => {
      if (filter === 'ai') return null; // special handled
      if (filter === 'term') return ['term'];
      if (filter === 'topic') return ['topic'];
      if (filter === 'mcq') return ['mcq'];
      if (filter === 'short') return ['short'];
      if (filter === 'interview') return ['interview'];
      return null;
    };

    const startSession = () => {
      const data = getAppData();
      const filter = document.getElementById('srs-filter')?.value || 'all';
      const types = filterTypes(filter);
      const limit = Number(document.getElementById('srs-limit')?.value || 30);
      let due = SpacedRepetition.listDue(data, { types: filter === 'ai' ? null : types, limit: 999 });
      if (filter === 'ai') due = due.filter((c) => c.meta?.ai);
      if (filter === 'all') {
        // 优先 AI 到期卡
        const aiDue = due.filter((c) => c.meta?.ai);
        if (aiDue.length) due = aiDue;
      }
      queue = due.slice(0, limit);
      idx = 0;
      flipped = false;
      sessionDone = 0;
      mcqPicked = null;
      shortRevealed = false;
      sessionBatchId = data.srsGenMeta?.lastBatchId || null;
      document.getElementById('srs-done-msg')?.classList.add('hidden');
      if (!queue.length) {
        document.getElementById('srs-session')?.classList.add('hidden');
        const empty = document.getElementById('srs-empty');
        empty?.classList.remove('hidden');
        const learned = SpacedRepetition.getLearnedDays(data).length;
        if (empty) {
          empty.textContent =
            learned === 0
              ? '还没有可复习内容。请先打卡学习，再点「AI 生成今日复习」。'
              : '今日暂无到期题。请点「AI 生成今日复习」基于已学内容出题（不要只靠本地模板）。';
        }
        renderHub();
        refreshExtras();
        return;
      }
      document.getElementById('srs-empty')?.classList.add('hidden');
      document.getElementById('srs-session')?.classList.remove('hidden');
      renderCard();
      renderHub();
    };

    const grade = (g) => {
      if (!queue[idx]) return;
      const data = getAppData();
      const cardId = queue[idx].id;
      SpacedRepetition.applyReview(data, cardId, g);
      if (typeof SrsAi !== 'undefined') {
        SrsAi.archiveItem(data, cardId, g);
      }
      saveAppData();
      sessionDone += 1;
      idx += 1;
      flipped = false;
      mcqPicked = null;
      shortRevealed = false;
      if (idx >= queue.length) {
        document.getElementById('srs-session')?.classList.add('hidden');
        if (typeof SrsAi !== 'undefined') {
          SrsAi.archiveSession(data, {
            batchId: sessionBatchId,
            sessionDone,
          });
          saveAppData();
        }
        const doneEl = document.getElementById('srs-done-msg');
        if (doneEl) {
          doneEl.classList.remove('hidden');
          doneEl.textContent = `本轮完成 ${sessionDone} 题，已归档。下次按遗忘曲线到期再练。`;
        }
        renderHub();
        refreshExtras();
        updateSprintHint();
        return;
      }
      renderCard();
      renderHub();
      refreshExtras();
      updateSprintHint();
    };

    const onMcqPick = (choiceIndex) => {
      if (mcqPicked != null) return;
      mcqPicked = choiceIndex;
      flipped = true;
      renderCard();
    };

    const renderCard = () => {
      const item = queue[idx];
      const front = document.getElementById('srs-front');
      const back = document.getElementById('srs-back');
      const meta = document.getElementById('srs-meta');
      const prog = document.getElementById('srs-progress');
      const grades = document.getElementById('srs-grades');
      const flipBtn = document.getElementById('srs-flip');
      const flipHint = document.getElementById('srs-flip-hint');
      const mcqBox = document.getElementById('srs-mcq-choices');
      const shortWrap = document.getElementById('srs-short-wrap');
      if (!item || !front) return;

      const fmt = item.format || (item.type === 'mcq' ? 'mcq' : item.type === 'short' ? 'short' : 'flip');
      front.textContent = item.front;
      back.textContent = item.back || '（无参考答案）';

      if (mcqBox) {
        if (fmt === 'mcq' && Array.isArray(item.choices)) {
          mcqBox.classList.remove('hidden');
          mcqBox.innerHTML = item.choices
            .map((c, i) => {
              let cls = 'srs-choice';
              if (mcqPicked != null) {
                if (i === item.correctIndex) cls += ' correct';
                else if (i === mcqPicked) cls += ' wrong';
              }
              return `<button type="button" class="${cls}" data-choice="${i}">${escapeHtml(String.fromCharCode(65 + i))}. ${escapeHtml(c)}</button>`;
            })
            .join('');
          mcqBox.querySelectorAll('[data-choice]').forEach((btn) => {
            btn.addEventListener('click', () => onMcqPick(Number(btn.dataset.choice)));
          });
        } else {
          mcqBox.classList.add('hidden');
          mcqBox.innerHTML = '';
        }
      }

      if (shortWrap) {
        shortWrap.classList.toggle('hidden', fmt !== 'short');
        if (fmt === 'short') {
          const input = document.getElementById('srs-short-input');
          if (input && !shortRevealed) {
            // 新题清空；已点对照则保留草稿
            if (!input.dataset.boundIdx || input.dataset.boundIdx !== String(idx)) {
              input.value = '';
              input.dataset.boundIdx = String(idx);
            }
          }
        }
      }

      const showAnswer = fmt === 'mcq' ? mcqPicked != null : fmt === 'short' ? shortRevealed : flipped;
      back.classList.toggle('hidden', !showAnswer);
      if (grades) grades.classList.toggle('hidden', !showAnswer);

      if (flipBtn) {
        flipBtn.classList.toggle('hidden', fmt !== 'flip');
        flipBtn.textContent = flipped ? '隐藏答案' : '翻转 / 看答案';
      }
      if (flipHint) {
        if (fmt === 'mcq') {
          flipHint.classList.toggle('hidden', mcqPicked != null);
          flipHint.textContent = '先选一个选项，再自评记忆强度';
        } else if (fmt === 'short') {
          flipHint.classList.toggle('hidden', shortRevealed);
          flipHint.textContent = '先写下简答，再点「对照参考答案」';
        } else {
          flipHint.classList.toggle('hidden', flipped);
          flipHint.textContent = '先自己想答案，再点卡片翻转';
        }
      }

      // MCQ 选错时默认偏「忘了」，但仍可自调
      if (fmt === 'mcq' && mcqPicked != null && grades) {
        const ok = mcqPicked === item.correctIndex;
        const hintEl = document.getElementById('srs-mcq-result');
        if (hintEl) {
          hintEl.hidden = false;
          hintEl.textContent = ok ? '选择正确 ✓ 请再评记忆强度' : '选择有误 ✗ 建议评「忘了」或「勉强」';
          hintEl.className = ok ? 'srs-mcq-result ok' : 'srs-mcq-result bad';
        }
      } else {
        const hintEl = document.getElementById('srs-mcq-result');
        if (hintEl) hintEl.hidden = true;
      }

      if (meta) {
        meta.textContent = `${typeLabel(item)}${item.meta?.cat ? ' · ' + item.meta.cat : ''}${
          item.sourceDay ? ' · 源于 Day ' + item.sourceDay : ''
        } · 间隔 ${item.interval || 0} 天`;
      }
      if (prog) prog.textContent = `${idx + 1} / ${queue.length}（本轮已评 ${sessionDone}）`;
    };

    const renderHub = () => {
      const data = getAppData();
      const st = SpacedRepetition.stats(data);
      const dueAll = SpacedRepetition.listDue(data, { limit: 999 });
      const dueAi = dueAll.filter((c) => c.meta?.ai).length;
      const archN = Array.isArray(data.srsArchive) ? data.srsArchive.length : 0;
      const box = document.getElementById('srs-stats');
      if (box) {
        box.innerHTML = `
          <div class="srs-stat"><div class="num">${st.due}</div><div class="desc">今日到期</div></div>
          <div class="srs-stat"><div class="num">${dueAi}</div><div class="desc">AI 题到期</div></div>
          <div class="srs-stat"><div class="num">${st.learnedDays}</div><div class="desc">已打卡天数</div></div>
          <div class="srs-stat"><div class="num">${archN}</div><div class="desc">已归档记录</div></div>
        `;
      }
      const badge = document.getElementById('srs-tab-badge');
      if (badge) {
        badge.textContent = st.due > 0 ? String(st.due) : '';
        badge.hidden = st.due <= 0;
      }
      const metaEl = document.getElementById('srs-gen-meta');
      if (metaEl) {
        const g = data.srsGenMeta;
        metaEl.textContent = g?.generatedAt
          ? `最近 AI 出题：${String(g.generatedAt).slice(0, 16).replace('T', ' ')} · ${g.count || 0} 题 · 覆盖 Day ${(g.days || []).join(',')}`
          : '尚未 AI 出题：先打卡，再点「AI 生成今日复习」';
      }
      refreshExtras();
    };

    const updateSprintHint = () => {
      const el = document.getElementById('srs-sprint-hint');
      if (!el) return;
      const due = SpacedRepetition.stats(getAppData()).due;
      if (due > 0) {
        el.hidden = false;
        el.innerHTML = `今日有 <strong>${due}</strong> 道复习到期 · <button type="button" class="linkish" id="srs-goto-tools">去复习</button>`;
        document.getElementById('srs-goto-tools')?.addEventListener('click', () => {
          if (typeof window.switchView === 'function') window.switchView('tools');
          document.querySelector('.tools-subtab[data-tools-panel="srs"]')?.click();
        });
      } else {
        el.hidden = true;
      }
    };

    bind();
    renderHub();
    updateSprintHint();

    window.__srsRenderAll = () => {
      renderHub();
      updateSprintHint();
    };
    window.__srsOnPanelShow = (panel) => {
      if (panel === 'srs') {
        renderHub();
        document.getElementById('srs-done-msg')?.classList.add('hidden');
      }
    };

    return {
      renderAll() {
        renderHub();
        updateSprintHint();
      },
      onPanelShow(panel) {
        if (panel === 'srs') {
          renderHub();
          document.getElementById('srs-done-msg')?.classList.add('hidden');
        }
      },
      updateSprintHint,
      syncLearned() {
        renderHub();
        updateSprintHint();
      },
      generateAiReview,
    };
  },
};
