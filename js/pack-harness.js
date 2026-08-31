/**
 * PackHarness — 课包生成运行时脚手架（Harness Engineering）
 *
 * 层级：Harness ⊃ Context ⊃ Prompt
 * 能力：Session/Trace、Sprint Contract、Context 七槽组装、
 *       Loop 驱动（上限/无进展退出）、工具前 Guardrails、
 *       PGE 角色隔离、ReAct 式定点修复契约。
 *
 * 说明：Brain=LLM（PackGenerator），Hands=search/wiki/写 pack，
 * Session=本模块 + ContentPack localStorage。
 */
const PackHarness = (() => {
  const CAPABILITY = {
    /** L0 纯规则/本地，无 LLM */
    L0: 0,
    /** L1 单次生成，无工具副作用 */
    L1: 1,
    /** L2 可调用搜索/写本地 pack（当前默认） */
    L2: 2,
    /** L3+ 预留：对外发送/改远端 — 本产品禁止自动执行 */
    L3: 3,
  };

  /**
   * 软质量门槛（与离线 Eval L1 对齐：抬天花板，不只抬地板）
   * stemUniqueMin / chapterMedianMin / bloomDropMax 供 shouldRepair 与 findings 共用
   */
  const SOFT_QUALITY = Object.freeze({
    stemUniqueMin: 0.65,
    chapterMedianMin: 2800,
    bloomDropMax: 0.15,
    maxStemRepeats: 2,
    lateDayMinChars: 2800,
    midDayMinChars: 2200,
    earlyDayMinChars: 1600,
  });

  /** Sprint Contract：Done / 预算 / 反指标（v2：软质量进合同） */
  const DEFAULT_CONTRACT = Object.freeze({
    name: 'pack-generate-v2',
    done: [
      'plan_days_complete',
      'phase_monotonic',
      'hub_chapters_aligned',
      'exercises_non_template',
      'exercises_non_homogeneous',
      'exercises_stem_unique_ge_065',
      'shallow_chapters_under_threshold',
      'chapter_median_ge_2800',
      'bloom_no_regression',
      'late_chapters_thick_enough',
      'glossary_core_quality_entries_ge_8',
      'glossary_visual_kinds_ge_2',
      'resources_non_empty_or_explicitly_unavailable',
      'hub_citations_backlink_to_sources',
      'exercise_reference_answers_complete',
      'exercise_objectives_aligned',
      'weekly_cumulative_checkpoints_complete',
    ],
    budgets: {
      maxRepairRounds: 3,
      maxShallowRepairsPerRound: 5,
      maxExerciseRegenChunks: 2,
      maxToolCallsPerJob: 200,
      maxMetadataCallsPerJob: 30,
      wallClockMs: 45 * 60 * 1000,
    },
    antiMetrics: {
      inventUrlsWithoutSearch: '禁止无搜索编造外链',
      phaseBackjump: '禁止阶段回跳',
      templateExercises: '禁止模板/同质练习骨架',
      stemOveruse: '同一题干骨架全包出现不得超过 2 次',
      shallowStubAsReady: '浅文章节不得静默标 ready 且无标记',
      thinLateChapters: 'Day≥15 章节不得低于相对厚度门槛',
      bloomRegression: '周均 Bloom 不得相对上周倒退超过容差',
      unboundEvidence: '正文事实必须通过 [Sx] 回链到可核验来源',
      incompleteExerciseFeedback: '每日练习必须含参考答案、误区与反馈方式',
      missingCumulativeWork: '每周必须形成承接前周的累计作品检查点',
    },
    softQuality: SOFT_QUALITY,
    toolAllowlist: [
      'deepseek.chat',
      'api.search',
      'api.meta.resolve',
      'wikipedia.opensearch',
      'contentPack.save',
    ],
    capabilityMax: CAPABILITY.L2,
  });

  /** 好题 / 坏题 few-shot（Context Engineering：金标准锚点） */
  const EXERCISE_FEWSHOT = {
    good: [
      {
        q: '闭卷：PRD 评审会上产品经理必须讲清的 3 个字段是什么？各回答开发的哪类问题？',
        why: '对象具体、可打分、贴岗位场景',
      },
      {
        q: '场景：开发说「现有架构要 2 周、上线只剩 1 周」。你先问哪 2 个约束再决定砍/改/延期？',
        why: '有冲突双方、有决策动作',
      },
    ],
    bad: [
      {
        q: '用一句话总结今天的核心认知',
        why: '空模板、无提取难度',
      },
      {
        q: '合上资料，用工作语言定义「今日主题」（一句话，含适用对象）',
        why: '只换书名号的同质骨架',
      },
    ],
  };

  let _session = null;

  function uid(prefix = 'tr') {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function budgetsForDays(daysInput, overrides = {}) {
    const days = Math.min(90, Math.max(7, Number(daysInput) || 30));
    return {
      ...DEFAULT_CONTRACT.budgets,
      maxToolCallsPerJob:
        overrides.maxToolCallsPerJob ?? Math.max(240, 140 + days * 12),
      wallClockMs:
        overrides.wallClockMs ?? Math.max(45 * 60 * 1000, (30 + days * 2) * 60 * 1000),
      ...overrides,
    };
  }

  function beginSession(meta = {}, contract = {}) {
    const budgets = budgetsForDays(meta.days, contract.budgets || {});
    const c = {
      ...DEFAULT_CONTRACT,
      ...contract,
      budgets,
      antiMetrics: { ...DEFAULT_CONTRACT.antiMetrics, ...(contract.antiMetrics || {}) },
      softQuality: { ...SOFT_QUALITY, ...(contract.softQuality || {}) },
    };
    _session = {
      traceId: uid('pack'),
      startedAt: Date.now(),
      meta: {
        industry: meta.industry || '',
        role: meta.role || '',
        days: meta.days || 30,
        title: meta.title || '',
      },
      contract: c,
      spans: [],
      toolCalls: 0,
      metadataCalls: 0,
      aiMetrics: {
        calls: 0,
        failures: 0,
        durationMs: 0,
        queueMs: 0,
        retries: 0,
        promptTokens: 0,
        completionTokens: 0,
        cacheHitTokens: 0,
        cacheMissTokens: 0,
        stages: {},
      },
      repairRound: 0,
      findings: [],
      role: 'planner', // planner | generator | evaluator
      aborted: false,
    };
    span('session.start', { contract: c.name, capabilityMax: c.capabilityMax });
    return _session;
  }

  function endSession(status = 'ok') {
    if (!_session) return null;
    span('session.end', { status, ms: Date.now() - _session.startedAt, toolCalls: _session.toolCalls });
    const snap = snapshot();
    _session = null;
    return snap;
  }

  function getSession() {
    return _session;
  }

  function span(name, data = {}) {
    if (!_session) return;
    _session.spans.push({
      id: uid('sp'),
      name,
      ts: new Date().toISOString(),
      role: _session.role,
      data: summarizeForLog(data),
    });
  }

  /** 日志脱敏：截断大字段，避免把整章 markdown 写入 trace */
  function summarizeForLog(data) {
    try {
      const redact = (value) => String(value)
        .replace(/\b(?:sk|ds|api)[-_][A-Za-z0-9._-]{8,}\b/gi, '[REDACTED]')
        .replace(/(bearer\s+)[^\s;,]+/gi, '$1[REDACTED]')
        .replace(/((?:api[_-]?key|token|secret)\s*[:=]\s*["']?)[^\s,;"']+/gi, '$1[REDACTED]');
      const s = redact(JSON.stringify(data));
      if (s.length <= 800) return JSON.parse(s);
      return { _truncated: true, preview: s.slice(0, 600), len: s.length };
    } catch {
      return { _unserializable: true };
    }
  }

  function snapshot() {
    if (!_session) return null;
    return {
      traceId: _session.traceId,
      startedAt: _session.startedAt,
      endedAt: Date.now(),
      durationMs: Date.now() - _session.startedAt,
      meta: _session.meta,
      contract: _session.contract.name,
      toolCalls: _session.toolCalls,
      aiMetrics: JSON.parse(JSON.stringify(_session.aiMetrics)),
      repairRound: _session.repairRound,
      findings: _session.findings.slice(-20),
      spans: _session.spans.slice(-80),
      budgets: _session.contract.budgets,
    };
  }

  function setRole(role) {
    if (!_session) return;
    if (!['planner', 'generator', 'evaluator'].includes(role)) return;
    _session.role = role;
    span('role.switch', { role });
  }

  function recordAiCall(metrics = {}) {
    if (!_session) return;
    const usage = metrics.usage && typeof metrics.usage === 'object' ? metrics.usage : {};
    const stage = String(metrics.stage || 'other').slice(0, 80);
    const values = {
      calls: 1,
      failures: metrics.status && metrics.status !== 'ok' ? 1 : 0,
      durationMs: Math.max(0, Number(metrics.durationMs) || 0),
      queueMs: Math.max(0, Number(metrics.queueMs) || 0),
      retries: Math.max(0, (Number(metrics.attempts) || 1) - 1),
      promptTokens: Math.max(0, Number(usage.prompt_tokens) || 0),
      completionTokens: Math.max(0, Number(usage.completion_tokens) || 0),
      cacheHitTokens: Math.max(0, Number(usage.prompt_cache_hit_tokens) || 0),
      cacheMissTokens: Math.max(0, Number(usage.prompt_cache_miss_tokens) || 0),
    };
    const stageMetrics = _session.aiMetrics.stages[stage] || {
      calls: 0,
      failures: 0,
      durationMs: 0,
      queueMs: 0,
      retries: 0,
      promptTokens: 0,
      completionTokens: 0,
      cacheHitTokens: 0,
      cacheMissTokens: 0,
    };
    for (const [key, value] of Object.entries(values)) {
      _session.aiMetrics[key] += value;
      stageMetrics[key] += value;
    }
    _session.aiMetrics.stages[stage] = stageMetrics;
    span('ai.complete', {
      stage,
      durationMs: values.durationMs,
      queueMs: values.queueMs,
      attempts: values.retries + 1,
      promptTokens: values.promptTokens,
      completionTokens: values.completionTokens,
      cacheHitTokens: values.cacheHitTokens,
    });
  }

  /**
   * Guardrails：工具执行前鉴权（before action）
   * @returns {{ ok: boolean, code?: string, message?: string }}
   */
  function guardTool(toolName, payload = {}) {
    if (!_session) return { ok: true };
    const allow = _session.contract.toolAllowlist || [];
    if (allow.length && !allow.includes(toolName)) {
      span('guard.deny', { toolName, reason: 'not_allowlisted' });
      return { ok: false, code: 'TOOL_NOT_ALLOWED', message: '当前无法完成这项生成，请稍后重试' };
    }
    if (_session.contract.capabilityMax < CAPABILITY.L2 && toolName === 'api.search') {
      return { ok: false, code: 'CAPABILITY', message: '当前无法使用联网搜索，请稍后重试' };
    }
    if (
      toolName !== 'api.meta.resolve' &&
      _session.toolCalls >= (_session.contract.budgets.maxToolCallsPerJob || 200)
    ) {
      span('guard.deny', { toolName, reason: 'tool_budget' });
      return { ok: false, code: 'TOOL_BUDGET', message: '本次生成次数已用完，请稍后重试或点「继续补全」' };
    }
    if (
      toolName === 'api.meta.resolve' &&
      _session.metadataCalls >= (_session.contract.budgets.maxMetadataCallsPerJob || 30)
    ) {
      return { ok: false, code: 'META_BUDGET', message: '本次资料标题增强次数已用完' };
    }
    if (Date.now() - _session.startedAt > (_session.contract.budgets.wallClockMs || 2.7e6)) {
      return { ok: false, code: 'WALL_CLOCK', message: '本次生成时间已用完，请稍后重试或点「继续补全」' };
    }
    // 反指标：禁止无搜索结果时空 URL 写入（由调用方配合）
    if (toolName === 'contentPack.save' && payload?.inventUrls) {
      return { ok: false, code: 'ANTI_INVENT_URL', message: _session.contract.antiMetrics.inventUrlsWithoutSearch };
    }
    if (toolName === 'api.meta.resolve') _session.metadataCalls += 1;
    else _session.toolCalls += 1;
    span('tool.allow', {
      toolName,
      n: toolName === 'api.meta.resolve' ? _session.metadataCalls : _session.toolCalls,
    });
    return { ok: true };
  }

  /**
   * Context Engineering：七槽组装
   * system / task / retrieval / tool / memory / history / user
   * Evaluator 不得看到 Generator 思维链（PGE）
   */
  function assembleContext(slots = {}, opts = {}) {
    const role = opts.role || _session?.role || 'generator';
    const budget = opts.tokenBudgetChars || 12000;
    const parts = [];

    const push = (label, text, max) => {
      const t = String(text || '').trim();
      if (!t) return;
      const cut = t.slice(0, max);
      parts.push(`## [${label}]\n${cut}`);
    };

    // 不可变约束槽：不压缩
    push('system/immutable', slots.system || '', 3500);
    push('task', slots.task || '', 2500);

    if (role !== 'evaluator') {
      push('retrieval', slots.retrieval || '', 2000);
      push('tool_results', slots.tool || '', 2000);
      push('memory', slots.memory || '', 1200);
    } else {
      // Evaluator：只看 artefact + rubric，隔离 generator 轨迹
      push('artefact', slots.artefact || slots.retrieval || '', 4000);
      push('rubric', slots.rubric || '', 2000);
    }

    // 失败回灌（Loop / CE）：上一圈 findings
    if (slots.findings) {
      push('findings/repair', slots.findings, 1500);
    }

    // few-shot 锚点
    if (slots.fewshot) {
      push('fewshot', slots.fewshot, 1500);
    }

    if (role !== 'evaluator') {
      push('history_summary', slots.history || '', 800);
    }
    push('user', slots.user || '', 2000);

    let assembled = parts.join('\n\n');
    if (assembled.length > budget) {
      assembled = assembled.slice(0, budget) + '\n\n<!-- context compacted by budget -->';
      span('context.compact', { budget, role });
    } else {
      span('context.assemble', { role, chars: assembled.length, slots: Object.keys(slots) });
    }
    return assembled;
  }

  function exerciseFewshotBlock() {
    return [
      '好题示例：',
      ...EXERCISE_FEWSHOT.good.map((g, i) => `${i + 1}. ${g.q}（${g.why}）`),
      '坏题（禁止）：',
      ...EXERCISE_FEWSHOT.bad.map((b, i) => `${i + 1}. ${b.q}（${b.why}）`),
    ].join('\n');
  }

  function softThresholds() {
    return _session?.contract?.softQuality || SOFT_QUALITY;
  }

  /**
   * 从 quality 门禁结果提取 findings（Evaluator 输出，供 Generator 修复）
   */
  function findingsFromQuality(quality = {}) {
    const soft = softThresholds();
    const findings = [];
    (quality.shallowChapterSlugs || []).forEach((slug) => {
      findings.push({
        type: 'shallow_chapter',
        target: slug,
        message: '章节过浅或模板化，需 strict 重写并含例题步骤',
      });
    });
    (quality.thinLateChapterSlugs || []).forEach((slug) => {
      findings.push({
        type: 'thin_late_chapter',
        target: slug,
        message: `后段章节厚度不足（Day≥15 目标 ≥${soft.lateDayMinChars} 字）`,
      });
    });
    if (quality.homogeneousExercises) {
      findings.push({
        type: 'homogeneous_exercises',
        target: 'dayExercises',
        message: '练习题干同质（只换主题），需按日换考点/冲突角色',
      });
    }
    if ((quality.templateExerciseCount || 0) > 0) {
      findings.push({
        type: 'template_exercises',
        target: 'dayExercises',
        message: `仍有 ${quality.templateExerciseCount} 道模板题`,
      });
    }
    if (
      quality.stemUniqueRatio != null &&
      quality.stemUniqueRatio < (soft.stemUniqueMin || 0.65)
    ) {
      findings.push({
        type: 'stem_unique_low',
        target: 'dayExercises',
        message: `题干去重率 ${quality.stemUniqueRatio} < ${soft.stemUniqueMin}，需按 phase 换骨架且同 stem≤${soft.maxStemRepeats} 次`,
      });
    }
    if (
      quality.chapterMedianLen != null &&
      quality.chapterMedianLen < (soft.chapterMedianMin || 2800)
    ) {
      findings.push({
        type: 'chapter_median_thin',
        target: 'hub.chapters',
        message: `章节中位字数 ${quality.chapterMedianLen} < ${soft.chapterMedianMin}，优先加厚最短章`,
      });
    }
    (quality.bloomRegressionWeeks || []).forEach((w) => {
      findings.push({
        type: 'bloom_regression',
        target: `week-${w.week}`,
        message: `第${w.week}周 Bloom 相对上周倒退（${w.prev}→${w.curr}），后半周须抬到分析/评估/创造`,
      });
    });
    if (quality.phaseMonotonic === false) {
      findings.push({
        type: 'phase_backjump',
        target: 'plan',
        message: `学习阶段在 Day ${(quality.phaseBackjumpDays || []).join(', ')} 发生回跳`,
      });
    }
    if (quality.glossaryEnough === false) {
      findings.push({
        type: 'glossary_too_few',
        target: 'glossary',
        message: `合格核心术语仅 ${quality.glossaryPassCount || 0} 条，低于 8 条硬门槛；须从日课重抽并逐条精写`,
      });
    }
    if ((quality.glossaryKindCount || 0) < 2) {
      findings.push({
        type: 'glossary_visual_monotony',
        target: 'glossary.visual.kind',
        message: `术语图鉴仅 ${quality.glossaryKindCount || 0} 种可视化，至少需 2 种且按概念结构选型`,
      });
    }
    (quality.emptyResourceDays || []).forEach((day) => {
      findings.push({
        type: 'empty_resources',
        target: `dayResources.${day}`,
        message: `Day ${day} 没有可核验学习资源；保留空数组并禁止生成精确数据，后续应补充高信任来源`,
      });
    });
    (quality.missingCitationChapterSlugs || []).forEach((slug) => {
      findings.push({
        type: 'citation_backlink_missing',
        target: slug,
        message: '正文缺少 [S1] 引用或「来源」段的 URL 回链',
      });
    });
    (quality.missingExerciseRefDays || []).forEach((day) => {
      findings.push({
        type: 'exercise_reference_missing',
        target: `dayExercises.${day}`,
        message: '每日三题必须各自包含可用于反馈的 ref 参考答案',
      });
    });
    (quality.exerciseObjectiveMismatchDays || []).forEach((day) => {
      findings.push({
        type: 'exercise_objective_mismatch',
        target: `dayExercises.${day}`,
        message: 'recall/application/transfer 三题未全部对齐当日 topic 或 task',
      });
    });
    (quality.missingCumulativeWeeks || []).forEach((week) => {
      findings.push({
        type: 'weekly_cumulative_missing',
        target: `weeklyCheckpoints.${week}`,
        message: `第 ${week} 周缺少承接前周产出的累计作品/checkpoint`,
      });
    });
    const contractFindings = Array.isArray(quality.contractFindings)
      ? quality.contractFindings
      : [];
    contractFindings.forEach((finding, index) => {
      const source = finding && typeof finding === 'object' ? finding : { message: finding };
      findings.push({
        type: String(source.type || source.code || 'quality_contract'),
        target: String(source.target || source.path || `contract.${index + 1}`),
        message: String(source.message || source.detail || 'PackQualityContract 未通过'),
      });
    });
    if (_session) {
      _session.findings = findings;
      span('evaluator.findings', { count: findings.length });
    }
    return findings;
  }

  function formatFindingsForPrompt(findings = []) {
    if (!findings.length) return '';
    return findings
      .map((f, i) => `${i + 1}. [${f.type}] ${f.target}: ${f.message}`)
      .join('\n');
  }

  /**
   * Loop Engineering：驱动一圈「行动→观察→决策」
   * Go/No-Go：有终止信号、可验证进展、成本可承受、失败可降级
   */
  async function runLoop({ name, maxRounds, act, observe, isDone, onNoProgress }) {
    const limit = Math.max(1, maxRounds || _session?.contract?.budgets?.maxRepairRounds || 3);
    let lastSig = '';
    let noProgress = 0;
    const history = [];

    for (let round = 1; round <= limit; round++) {
      if (_session) _session.repairRound = round;
      span('loop.round.start', { name, round });
      const actionResult = await act(round, history);
      const observation = await observe(round, actionResult);
      const sig = typeof observation?.progressKey === 'string' ? observation.progressKey : JSON.stringify(observation || {}).slice(0, 200);
      if (sig === lastSig) noProgress += 1;
      else {
        noProgress = 0;
        lastSig = sig;
      }
      history.push({ round, observation });
      span('loop.round.end', { name, round, noProgress, done: !!observation?.done });

      if (observation?.done || (isDone && isDone(observation, round))) {
        return { ok: true, round, history, observation };
      }
      if (noProgress >= 2) {
        span('loop.no_progress', { name, round });
        if (onNoProgress) await onNoProgress(round, history);
        return { ok: false, reason: 'no_progress', round, history, observation };
      }
    }
    return { ok: false, reason: 'max_rounds', round: limit, history };
  }

  /** 是否还应进入修复环（含软质量：Bloom / stem / 章长） */
  function shouldRepair(quality = {}) {
    const soft = softThresholds();
    const shallow = quality.shallowChapterCount || 0;
    const thinLate = quality.thinLateChapterCount || 0;
    const stemLow =
      quality.stemUniqueRatio != null &&
      quality.stemUniqueRatio < (soft.stemUniqueMin || 0.65);
    const medianThin =
      quality.chapterMedianLen != null &&
      quality.chapterMedianLen < (soft.chapterMedianMin || 2800);
    const bloomBad = (quality.bloomRegressionWeeks || []).length > 0;
    const glossaryBad =
      quality.glossaryEnough === false ||
      (quality.glossaryPassRate ?? 0) < 0.85 ||
      (quality.glossaryKindCount || 0) < 2;
    const evidenceBad =
      (quality.emptyResourceDays || []).length > 0 ||
      (quality.missingCitationChapterSlugs || []).length > 0;
    const exerciseContractBad =
      (quality.missingExerciseRefDays || []).length > 0 ||
      (quality.exerciseObjectiveMismatchDays || []).length > 0;
    const cumulativeBad = (quality.missingCumulativeWeeks || []).length > 0;
    const externalContractBad =
      quality.contractPassed === false ||
      (quality.contractFindings || []).length > 0;
    return !!(
      shallow > 0 ||
      thinLate > 0 ||
      quality.homogeneousExercises ||
      (quality.templateExerciseCount || 0) > 0 ||
      quality.needsReview ||
      stemLow ||
      medianThin ||
      bloomBad ||
      glossaryBad ||
      evidenceBad ||
      exerciseContractBad ||
      cumulativeBad ||
      externalContractBad ||
      quality.phaseMonotonic === false
    );
  }

  return {
    CAPABILITY,
    DEFAULT_CONTRACT,
    SOFT_QUALITY,
    EXERCISE_FEWSHOT,
    beginSession,
    endSession,
    getSession,
    snapshot,
    span,
    setRole,
    recordAiCall,
    guardTool,
    assembleContext,
    exerciseFewshotBlock,
    findingsFromQuality,
    formatFindingsForPrompt,
    runLoop,
    shouldRepair,
    softThresholds,
    budgetsForDays,
  };
})();
