/**
 * AI 每日复习：按已打卡学习内容出题 → 复习后归档 → 遗忘曲线
 */
const SrsAi = (() => {
  function todayISO() {
    return typeof SpacedRepetition !== 'undefined'
      ? SpacedRepetition.todayISO()
      : new Date().toISOString().slice(0, 10);
  }

  function uid(prefix = 'ai') {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  }

  function getPlanDay(dayNum) {
    if (typeof ContentPack !== 'undefined' && ContentPack.getDay) return ContentPack.getDay(dayNum);
    if (typeof Pm30Pack !== 'undefined') return Pm30Pack.getPlan()?.[dayNum - 1] || null;
    return null;
  }

  function parseJsonLoose(text) {
    if (typeof PackGenerator !== 'undefined' && PackGenerator.parseJsonLoose) {
      return PackGenerator.parseJsonLoose(text);
    }
    let s = String(text || '').trim();
    const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence) s = fence[1].trim();
    const a0 = s.indexOf('{');
    const a1 = s.lastIndexOf('}');
    if (a0 >= 0 && a1 > a0) return JSON.parse(s.slice(a0, a1 + 1));
    throw new Error('无法解析 AI JSON');
  }

  /** 取最近已打卡天数作为出题上下文 */
  function buildLearnedContext(data, { maxDays = 6 } = {}) {
    const learned =
      typeof SpacedRepetition !== 'undefined'
        ? SpacedRepetition.getLearnedDays(data)
        : [];
    const recent = learned.slice(-maxDays);
    const days = recent.map((dayNum) => {
      const plan = getPlanDay(dayNum) || {};
      const note = (data.notes && data.notes[String(dayNum)]) || '';
      const feynman = (data.feynman && data.feynman[String(dayNum)]) || '';
      return {
        day: dayNum,
        topic: plan.topic || `第 ${dayNum} 天`,
        week: plan.week || '',
        tasks: plan.tasks || [],
        note: String(note).slice(0, 280),
        feynman: String(feynman).slice(0, 280),
      };
    });
    return { learnedCount: learned.length, recentDays: recent, days };
  }

  /**
   * 预测保留率 R(t)=exp(-t/S)，S 与 interval、ease、reps 相关
   */
  function memoryStrength(card) {
    const ease = typeof card.ease === 'number' ? card.ease : 2.5;
    const interval = Math.max(1, Number(card.interval) || 1);
    const reps = Math.max(0, Number(card.reps) || 0);
    return Math.max(1.2, ease * interval * (1 + reps * 0.08));
  }

  function predictRetention(card, daysAhead = 0) {
    const S = memoryStrength(card);
    const t = Math.max(0, Number(daysAhead) || 0);
    return Math.exp(-t / S);
  }

  /** 上次真正评分复习的日期 YYYY-MM-DD（不含内容 upsert） */
  function lastReviewedDate(card) {
    if (card?.lastReviewedAt) return String(card.lastReviewedAt).slice(0, 10);
    // 兼容旧数据：有 reps 时用 updatedAt 日期兜底
    if ((card?.reps || 0) > 0 && card.updatedAt) return String(card.updatedAt).slice(0, 10);
    return null;
  }

  /** 距上次复习已过天数（无记录则用 due 推算） */
  function daysSinceReview(card, today = todayISO()) {
    const rev = lastReviewedDate(card);
    if (rev) {
      const then = new Date(rev + 'T12:00:00');
      const now = new Date(today + 'T12:00:00');
      if (!Number.isNaN(then.getTime())) {
        return Math.max(0, Math.floor((now - then) / 86400000));
      }
    }
    if (card.due && card.due < today) {
      const [y, m, d] = card.due.split('-').map(Number);
      const due = new Date(y, m - 1, d);
      const now = new Date(today + 'T12:00:00');
      return Math.max(0, Math.floor((now - due) / 86400000) + (card.interval || 0));
    }
    return 0;
  }

  /**
   * 跨日顺延：上一打开日到期却未复习的题，挪到「今天」队列。
   * （今天打开时跑一次；同日内不重复挪。）
   */
  function rolloverMissedReviews(data) {
    const today = todayISO();
    const meta = data.srsGenMeta && typeof data.srsGenMeta === 'object' ? data.srsGenMeta : {};
    data.srsGenMeta = meta;
    const prev = meta.lastOpenDate;
    const deck = SpacedRepetition.ensureDeck(data);
    let rolled = 0;

    if (prev && prev < today) {
      Object.values(deck).forEach((c) => {
        if (!c || c.suspended || c.unlocked === false) return;
        if (!c.due || c.due > prev) return;
        if (lastReviewedDate(c) === prev) return;
        c.due = today;
        rolled += 1;
      });
    } else if (!prev) {
      Object.values(deck).forEach((c) => {
        if (!c || c.suspended || c.unlocked === false) return;
        if (c.due && c.due < today) {
          c.due = today;
          rolled += 1;
        }
      });
    }

    meta.lastOpenDate = today;
    return rolled;
  }

  function shortDateLabel(iso) {
    if (!iso || iso.length < 10) return iso || '';
    const [, m, d] = iso.split('-');
    return `${Number(m)}/${Number(d)}`;
  }

  function ensureArchive(data) {
    if (!Array.isArray(data.srsArchive)) data.srsArchive = [];
    if (!Array.isArray(data.srsSessions)) data.srsSessions = [];
    return data;
  }

  /**
   * 调 AI 生成今日复习卷（选择题 / 简答 / 翻转）
   */
  async function generateDailyReview(data, { count = 12, onProgress } = {}) {
    const ctx = buildLearnedContext(data);
    if (!ctx.days.length) {
      const err = new Error('请先完成至少 1 天学习打卡，再生成复习题');
      err.code = 'NO_LEARNED';
      throw err;
    }
    if (typeof AiReview === 'undefined' || !AiReview.chat) {
      throw new Error('AiReview 未就绪');
    }
    if (!AiReview.hasApiKey()) {
      const err = new Error('请先开启智能功能');
      err.code = 'NO_KEY';
      throw err;
    }

    onProgress?.('正在根据已学内容出题…', 20);

    const industry =
      (typeof ContentPack !== 'undefined' && ContentPack.getActive?.()?.meta?.industry) ||
      '当前学习领域';
    const role =
      (typeof ContentPack !== 'undefined' && ContentPack.getActive?.()?.meta?.role) ||
      '学习者';

    const system = `你是间隔复习出题老师。硬性规则：只输出一个 JSON 对象，不要 Markdown，不要代码块，不要解释。`;
    const user = `行业/岗位：${industry} / ${role}
学员已打卡学习内容（请严格基于这些出题，不要超纲到未学主题）：
${JSON.stringify(ctx.days, null, 0).slice(0, 6500)}

生成约 ${count} 道复习题，题型混合：选择题(mcq)、简答题(short)、翻转记忆(flip)。
输出：
{
  "items": [
    {
      "format": "mcq"|"short"|"flip",
      "front": "题干",
      "back": "参考答案或解析",
      "choices": ["A","B","C","D"],
      "correctIndex": 0,
      "sourceDay": 1,
      "knowledgePoint": "知识点短名"
    }
  ]
}
要求：
- sourceDay 必须来自上方已学天数
- mcq 必须有 4 个 choices 且 correctIndex 合法；short/flip 可无 choices
- 题目考查理解与回忆，不要空洞；结合 note/feynman 更好
- 语言中文；items 长度 ${Math.max(8, count - 2)}~${count + 2}`;

    const text = await AiReview.chat({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.45,
      max_tokens: 4500,
    });

    onProgress?.('解析题目…', 75);
    const raw = parseJsonLoose(text);
    const items = Array.isArray(raw?.items) ? raw.items : Array.isArray(raw) ? raw : [];
    if (!items.length) throw new Error('AI 未返回有效题目');

    const allowed = new Set(ctx.recentDays);
    const normalized = items
      .map((it, i) => {
        const format = ['mcq', 'short', 'flip'].includes(it.format) ? it.format : 'short';
        let sourceDay = Number(it.sourceDay);
        if (!allowed.has(sourceDay)) sourceDay = ctx.recentDays[i % ctx.recentDays.length];
        const choices = Array.isArray(it.choices) ? it.choices.map(String).slice(0, 4) : null;
        let correctIndex = typeof it.correctIndex === 'number' ? it.correctIndex : 0;
        if (format === 'mcq') {
          if (!choices || choices.length < 2) return null;
          if (correctIndex < 0 || correctIndex >= choices.length) correctIndex = 0;
        }
        return {
          format,
          type: format === 'flip' ? 'topic' : format,
          front: String(it.front || '').trim(),
          back: String(it.back || '').trim(),
          choices: format === 'mcq' ? choices : null,
          correctIndex: format === 'mcq' ? correctIndex : null,
          sourceDay,
          knowledgePoint: String(it.knowledgePoint || it.front || '知识点').slice(0, 40),
        };
      })
      .filter((x) => x && x.front);

    if (!normalized.length) throw new Error('题目规范化后为空');
    onProgress?.('写入复习库…', 90);
    return { items: normalized, context: ctx, batchId: uid('batch') };
  }

  /** 将 AI 题注入 srsCards（今日到期）；挂起无 batch / 过期本地硬编码卡可选 */
  function injectGenerated(data, items, batchId) {
    ensureArchive(data);
    const today = todayISO();
    const ids = [];
    items.forEach((it, i) => {
      const id = `ai:${batchId}:${i}`;
      SpacedRepetition.upsertCard(data, id, {
        type: it.type || it.format,
        format: it.format,
        front: it.front,
        back: it.back,
        choices: it.choices,
        correctIndex: it.correctIndex,
        meta: {
          ai: true,
          batchId,
          knowledgePoint: it.knowledgePoint,
          fromDay: it.sourceDay,
        },
        sourceDay: it.sourceDay,
        forceDueToday: true,
        unlockNow: true,
      });
      const card = SpacedRepetition.getCard(data, id);
      if (card) {
        card.due = today;
        card.unlocked = true;
        card.suspended = false;
      }
      ids.push(id);
    });

    data.srsGenMeta = {
      ...(data.srsGenMeta || {}),
      lastBatchId: batchId,
      generatedAt: new Date().toISOString(),
      count: ids.length,
      days: [...new Set(items.map((x) => x.sourceDay))],
      lastOpenDate: (data.srsGenMeta && data.srsGenMeta.lastOpenDate) || today,
    };

    // 挂起非本批次、非手动、且已到期的旧「本地模板」卡，避免污染今日队列
    const deck = SpacedRepetition.ensureDeck(data);
    Object.entries(deck).forEach(([id, card]) => {
      if (card?.meta?.manual) return;
      if (card?.meta?.batchId === batchId) return;
      if (id.startsWith('ai:') && card?.meta?.batchId && card.meta.batchId !== batchId) {
        // 旧 AI 批次：若仍未复习完且到期，保留；若 interval>0 说明进入间隔，保留
        return;
      }
      if (
        /^(term|mcq|short|topic|topic-mcq|topic-short|practice-short):/.test(id) &&
        !card.meta?.ai
      ) {
        card.suspended = true;
        card.unlocked = false;
      }
    });

    return ids;
  }

  /** 单题复习完后归档一份快照 */
  function archiveItem(data, cardId, grade) {
    ensureArchive(data);
    const card = SpacedRepetition.getCard(data, cardId);
    if (!card) return null;
    const elapsed = daysSinceReview(card);
    const retention = predictRetention(card, 0);
    const entry = {
      id: uid('arch'),
      cardId,
      archivedAt: new Date().toISOString(),
      grade: Number(grade),
      front: card.front,
      back: card.back,
      format: card.format || 'flip',
      type: card.type,
      sourceDay: card.sourceDay,
      knowledgePoint: card.meta?.knowledgePoint || card.front?.slice(0, 24),
      batchId: card.meta?.batchId || null,
      interval: card.interval,
      ease: card.ease,
      reps: card.reps,
      retention: Math.round(retention * 1000) / 1000,
      daysSince: elapsed,
      ai: !!card.meta?.ai,
    };
    data.srsArchive.unshift(entry);
    // 控制体积
    if (data.srsArchive.length > 400) data.srsArchive.length = 400;
    return entry;
  }

  /** 整轮会话归档 */
  function archiveSession(data, { batchId, reviewed, sessionDone }) {
    ensureArchive(data);
    data.srsSessions.unshift({
      id: uid('sess'),
      completedAt: new Date().toISOString(),
      batchId: batchId || data.srsGenMeta?.lastBatchId || null,
      reviewed: reviewed || sessionDone || 0,
    });
    if (data.srsSessions.length > 80) data.srsSessions.length = 80;
  }

  /** 距到期还有几天；已到期 / 过期 = 0（表示会再次进入今日复习） */
  function daysUntilDue(card, today = todayISO()) {
    if (!card?.due) return 0;
    if (card.due <= today) return 0;
    const [y1, m1, d1] = today.split('-').map(Number);
    const [y2, m2, d2] = card.due.split('-').map(Number);
    const a = new Date(y1, m1 - 1, d1);
    const b = new Date(y2, m2 - 1, d2);
    return Math.max(0, Math.round((b - a) / 86400000));
  }

  function dueLabel(card, today = todayISO()) {
    const n = daysUntilDue(card, today);
    if (n === 0) {
      if (card.due && card.due < today) return `已过期，应立即复习（到期日 ${card.due}）`;
      return '今天会再次加入复习';
    }
    if (n === 1) return `明天再次加入复习（${card.due}）`;
    return `${n} 天后再次加入复习（${card.due}）`;
  }

  /**
   * 遗忘曲线：
   * - 已复习：按「复习日历日」聚合（当天做过的题合成一个点）
   * - 未复习但仍到期：进入 pending 提醒列表，不混进已复习点
   */
  function buildCurveModel(data) {
    const deck = SpacedRepetition.ensureDeck(data);
    const today = todayISO();
    const active = Object.entries(deck)
      .filter(([, c]) => c && c.unlocked !== false && !c.suspended)
      .map(([id, c]) => ({ id, ...c }));

    const reviewed = active.filter((c) => lastReviewedDate(c));
    const pending = active.filter((c) => SpacedRepetition.isDue(c, today) && lastReviewedDate(c) !== today);

    const horizon = 30;
    const classic = [];
    const yours = [];
    const strengthSource = reviewed.length ? reviewed : active;
    for (let t = 0; t <= horizon; t++) {
      classic.push({ t, r: Math.exp(-t / 2) });
      if (!strengthSource.length) {
        yours.push({ t, r: Math.exp(-t / 2.5) });
      } else {
        const avg =
          strengthSource.reduce((s, c) => s + predictRetention(c, t), 0) / strengthSource.length;
        yours.push({ t, r: avg });
      }
    }

    const byReviewDay = new Map();
    reviewed.forEach((c) => {
      const key = lastReviewedDate(c);
      if (!byReviewDay.has(key)) byReviewDay.set(key, []);
      byReviewDay.get(key).push(c);
    });

    const points = [...byReviewDay.entries()]
      .map(([dayISO, cards]) => {
        const avgR =
          cards.reduce((s, c) => s + predictRetention(c, daysSinceReview(c, today)), 0) /
          cards.length;
        const elapsedAvg =
          cards.reduce((s, c) => s + daysSinceReview(c, today), 0) / cards.length;

        let soonest = cards[0];
        let minUntil = daysUntilDue(soonest, today);
        cards.forEach((c) => {
          const u = daysUntilDue(c, today);
          if (u < minUntil) {
            minUntil = u;
            soonest = c;
          }
        });

        const isToday = dayISO === today;
        return {
          id: `rev:${dayISO}`,
          dayISO,
          label: isToday ? '今日已复习' : shortDateLabel(dayISO),
          topicHint: '',
          count: cards.length,
          t: elapsedAvg,
          r: avgR,
          retentionPct: Math.round(avgR * 100),
          due: soonest.due || today,
          daysUntil: minUntil,
          dueText: dueLabel(soonest, today),
          isDue: false,
          isToday,
        };
      })
      .sort((a, b) => b.dayISO.localeCompare(a.dayISO));

    const pendingItems = pending.slice(0, 40).map((c) => ({
      id: c.id,
      label: c.meta?.knowledgePoint || (c.front || '').slice(0, 28) || '待复习',
      sourceDay: c.sourceDay || null,
      due: c.due || today,
      overdue: !!(c.due && c.due < today),
      neverReviewed: !lastReviewedDate(c),
    }));

    const avgRetention = points.length
      ? Math.round(points.reduce((s, p) => s + p.retentionPct, 0) / points.length)
      : 0;

    const archiveRecent = (data.srsArchive || []).slice(0, 30).map((a) => ({
      label: a.knowledgePoint || '归档',
      t: typeof a.daysSince === 'number' ? a.daysSince : 0,
      r: typeof a.retention === 'number' ? a.retention : 0.5,
      grade: a.grade,
    }));

    return {
      classic,
      yours,
      points,
      pending,
      pendingItems,
      pendingCount: pending.length,
      reviewedTodayCount: points.find((p) => p.isToday)?.count || 0,
      archiveRecent,
      horizon,
      avgRetention,
      dueSoon: pending.length,
      today,
    };
  }

  function renderCurveSvg(el, model) {
    if (!el) return;
    const W = 560;
    const H = 240;
    const pad = { l: 44, r: 18, t: 28, b: 36 };
    const iw = W - pad.l - pad.r;
    const ih = H - pad.t - pad.b;
    const x = (t) => pad.l + (Math.min(model.horizon, Math.max(0, t)) / model.horizon) * iw;
    const y = (r) => pad.t + (1 - Math.min(1, Math.max(0, r))) * ih;

    const pathOf = (series) =>
      series
        .map((p, i) => `${i ? 'L' : 'M'}${x(p.t).toFixed(1)},${y(p.r).toFixed(1)}`)
        .join(' ');

    const dots = model.points
      .map((p) => {
        const cx = x(p.t);
        const cy = y(p.r);
        const fill = p.isToday ? '#0891b2' : '#0e7490';
        const tip = `${p.label}｜共 ${p.count} 题｜平均保存率 ${p.retentionPct}%｜下次：${p.dueText}`;
        return `
          <g>
            <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${p.isToday ? 6 : 5}" fill="${fill}" opacity="0.95">
              <title>${escapeAttr(tip)}</title>
            </circle>
            <text x="${cx.toFixed(1)}" y="${(cy - 10).toFixed(1)}" font-size="9" fill="${fill}" font-weight="700" text-anchor="middle">${escapeAttr(
              p.isToday ? '今' : p.label
            )}</text>
            <text x="${cx.toFixed(1)}" y="${(cy + 16).toFixed(1)}" font-size="9" fill="${fill}" font-weight="600" text-anchor="middle">${p.retentionPct}%</text>
          </g>`;
      })
      .join('');

    const summary =
      model.points.length === 0 && !model.pendingCount
        ? '暂无复习记录：完成今日题后，已复习会聚成一个点；未做的会继续提醒'
        : `已复习按日聚合 · 平均保存率 ${model.avgRetention}% · 待提醒 ${model.pendingCount} 题`;

    el.innerHTML = `
      <svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" role="img" aria-label="知识遗忘曲线">
        <text x="${pad.l}" y="16" font-size="11" fill="#475569">${escapeAttr(summary)}</text>
        <line x1="${pad.l}" y1="${pad.t}" x2="${pad.l}" y2="${H - pad.b}" stroke="rgba(15,23,42,0.12)" />
        <line x1="${pad.l}" y1="${H - pad.b}" x2="${W - pad.r}" y2="${H - pad.b}" stroke="rgba(15,23,42,0.12)" />
        <text x="6" y="${pad.t + 8}" font-size="10" fill="#5a6b82">保存率</text>
        <text x="${pad.l}" y="${H - 10}" font-size="10" fill="#5a6b82">0天</text>
        <text x="${W / 2}" y="${H - 10}" font-size="10" fill="#5a6b82" text-anchor="middle">距上次复习（天）</text>
        <text x="${W - pad.r}" y="${H - 10}" font-size="10" fill="#5a6b82" text-anchor="end">${model.horizon}天</text>
        <path d="${pathOf(model.classic)}" fill="none" stroke="rgba(148,163,184,0.7)" stroke-width="1.5" stroke-dasharray="4 3" />
        <path d="${pathOf(model.yours)}" fill="none" stroke="#0891b2" stroke-width="2.5" />
        ${dots}
        <text x="${W - pad.r}" y="${pad.t + 14}" font-size="10" fill="#94a3b8" text-anchor="end">一点=当天已复习全部</text>
        <text x="${W - pad.r}" y="${pad.t + 28}" font-size="10" fill="#ea580c" text-anchor="end">未复习另见下方提醒</text>
      </svg>`;
  }

  /** 曲线下方：已复习按日一行 + 未复习提醒 */
  function renderCurveLegend(el, model) {
    if (!el) return;
    if (!model.points.length && !model.pendingCount) {
      el.innerHTML =
        '<p class="srs-curve-legend-empty">还没有可追踪的复习。做完几题后，「当天已复习」会合成一行；没做的会留在「待复习提醒」，跨日未完成会自动顺延到下一天。</p>';
      return;
    }

    const reviewedRows = model.points
      .map((p) => {
        const pctClass = p.retentionPct >= 70 ? 'ok' : p.retentionPct >= 40 ? 'mid' : 'low';
        const again =
          p.daysUntil === 0
            ? '今天还可再练'
            : p.daysUntil === 1
              ? '明天再练'
              : `${p.daysUntil} 天后`;
        return `<div class="srs-curve-legend-row ${p.isToday ? 'reviewed-today' : ''}">
          <span class="srs-leg-label" title="${escapeAttr(p.label + ' · ' + p.count + ' 题')}">
            <strong>${escapeAttr(p.label)}</strong>
            <small>${p.count} 题已复习</small>
          </span>
          <span class="srs-leg-pct ${pctClass}">${p.retentionPct}%</span>
          <span class="srs-leg-due">${escapeAttr(again)}<small>下次最早 ${escapeAttr(p.due || '')}</small></span>
        </div>`;
      })
      .join('');

    const pendingRows = model.pendingItems
      .map((item) => {
        const day = item.sourceDay ? `Day ${item.sourceDay}` : '';
        return `<div class="srs-curve-legend-row due-now">
          <span class="srs-leg-label" title="${escapeAttr(item.label)}">
            <strong>${escapeAttr(item.label)}</strong>
            ${day ? `<small>${escapeAttr(day)}</small>` : ''}
          </span>
          <span class="srs-leg-pct mid">—</span>
          <span class="srs-leg-due">需复习<small>到期 ${escapeAttr(item.due || '')}</small></span>
        </div>`;
      })
      .join('');

    const more =
      model.pendingCount > model.pendingItems.length
        ? `<p class="srs-curve-legend-more">另有 ${model.pendingCount - model.pendingItems.length} 题待复习…</p>`
        : '';

    el.innerHTML = `
      ${
        model.points.length
          ? `<div class="srs-curve-legend-section"><div class="srs-curve-legend-title">已复习（按日聚合）</div>
            <div class="srs-curve-legend-head"><span>日期</span><span>保存率</span><span>下次复习</span></div>
            ${reviewedRows}</div>`
          : ''
      }
      ${
        model.pendingCount
          ? `<div class="srs-curve-legend-section"><div class="srs-curve-legend-title">待复习提醒（${model.pendingCount}）</div>
            <div class="srs-curve-legend-head"><span>题目</span><span></span><span>状态</span></div>
            ${pendingRows}${more}</div>`
          : `<p class="srs-curve-legend-empty">今日到期题已全部复习完。</p>`
      }`;
  }

  function escapeAttr(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;');
  }

  function renderArchiveList(el, data, limit = 12) {
    if (!el) return;
    ensureArchive(data);
    const list = data.srsArchive.slice(0, limit);
    if (!list.length) {
      el.innerHTML = '<p class="srs-archive-empty">复习完题目后会自动归档到这里。</p>';
      return;
    }
    el.innerHTML = list
      .map((a) => {
        const gradeMap = { 1: '忘了', 2: '勉强', 3: '记住', 4: '很熟' };
        const when = (a.archivedAt || '').slice(0, 16).replace('T', ' ');
        return `<div class="srs-archive-item">
          <div class="srs-archive-top">
            <span class="srs-archive-kp">${escapeAttr(a.knowledgePoint || '知识点')}</span>
            <span class="srs-archive-meta">${a.sourceDay ? 'Day ' + a.sourceDay + ' · ' : ''}${gradeMap[a.grade] || ''} · ${when}</span>
          </div>
          <p class="srs-archive-q">${escapeAttr(a.front)}</p>
        </div>`;
      })
      .join('');
  }

  return {
    buildLearnedContext,
    generateDailyReview,
    injectGenerated,
    archiveItem,
    archiveSession,
    predictRetention,
    memoryStrength,
    daysSinceReview,
    daysUntilDue,
    dueLabel,
    lastReviewedDate,
    rolloverMissedReviews,
    buildCurveModel,
    renderCurveSvg,
    renderCurveLegend,
    renderArchiveList,
    ensureArchive,
    todayISO,
  };
})();
