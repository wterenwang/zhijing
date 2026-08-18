/**
 * Workflow 最终门禁：结构完整性 + 现有内容质量指标。
 * 唯一职责是回答“这个包是否允许进入 ready”。
 */
(function initPackWorkflowGate(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PackWorkflowGate = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildGateApi() {
  function daySet(rows) {
    return new Set(
      (rows || [])
        .map((row) => Number(row?.day))
        .filter((day) => Number.isInteger(day) && day > 0)
    );
  }

  function expectedDays(pack) {
    return Math.min(90, Math.max(7, Number(pack?.meta?.days) || pack?.plan?.length || 30));
  }

  function missingDaysFromSet(set, days) {
    const missing = [];
    for (let day = 1; day <= days; day++) {
      if (!set.has(day)) missing.push(day);
    }
    return missing;
  }

  function navigationEntries(pack) {
    return (pack?.hub?.navigation || []).flatMap((module) => module.items || []);
  }

  function navigationDay(item) {
    const slugDay = Number(
      String(item?.slug || '').match(/(?:^|\/)day-(\d+)(?:\/|$)/i)?.[1]
    );
    const explicitDay = Number(item?.day || String(item?.days || '').split(/[-–]/)[0]);
    if (!slugDay || (explicitDay && explicitDay !== slugDay)) return 0;
    return slugDay;
  }

  function phaseBackjumps(plan) {
    const order = new Map();
    let highest = -1;
    const backjumps = [];
    for (const row of plan || []) {
      const phase = String(row?.phase || '').trim();
      if (!phase) continue;
      if (!order.has(phase)) order.set(phase, order.size);
      const index = order.get(phase);
      if (index < highest) backjumps.push(Number(row.day) || 0);
      highest = Math.max(highest, index);
    }
    return backjumps;
  }

  function isStrictV2(pack) {
    return Number(pack?.schemaVersion) >= 2;
  }

  function isValidHttpUrl(value) {
    try {
      const url = new URL(String(value || ''));
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  function resourcesForDay(pack, day) {
    const row = pack?.dayResources?.[String(day)] || pack?.dayResources?.[day];
    return Array.isArray(row?.resources) ? row.resources : [];
  }

  function sourceIdOf(source) {
    return String(
      source?.sourceId || source?.evidenceId || source?.evidence?.id || source?.id || ''
    ).trim();
  }

  function sourceTierOf(source) {
    const tier = String(source?.sourceTier || source?.trustTier || '').trim().toLowerCase();
    if (tier === 'primary' || tier === 'high') return 'high';
    if (tier === 'secondary' || tier === 'medium') return 'medium';
    if (tier === 'contextual') return 'contextual';
    return 'unknown';
  }

  function chapterForDay(pack, day) {
    const item = navigationEntries(pack).find((entry) => navigationDay(entry) === day);
    const slug = String(item?.slug || '').trim();
    return { slug, markdown: slug ? String(pack?.hub?.chapters?.[slug] || '') : '' };
  }

  function citationIds(markdown) {
    const sourceAt = String(markdown || '').search(/##\s*(?:来源|证据来源|Sources?)/i);
    const body = sourceAt >= 0 ? String(markdown).slice(0, sourceAt) : String(markdown || '');
    return [...new Set([...body.matchAll(/\[(S\d+)\]/gi)].map((match) => match[1].toUpperCase()))];
  }

  function citationsBacklinkInSourceSection(markdown, ids, sourceById = new Map()) {
    const text = String(markdown || '');
    const sourceAt = text.search(/##\s*(?:来源|证据来源|Sources?)/i);
    if (sourceAt < 0) return false;
    const sources = text.slice(sourceAt);
    const lines = sources.split('\n');
    return ids.every((id) => {
      const expectedUrl = String(sourceById.get(id) || '').trim();
      if (!expectedUrl) return false;
      return lines.some(
        (line) =>
          line.toUpperCase().includes(`[${id.toUpperCase()}]`) &&
          line.includes(expectedUrl)
      );
    });
  }

  function bodyRequiresInlineCitation(markdown) {
    const sourceAt = String(markdown || '').search(/##\s*(?:来源|证据来源|Sources?)/i);
    const body = sourceAt >= 0 ? String(markdown).slice(0, sourceAt) : String(markdown || '');
    return (
      /20\d{2}\s*年/.test(body) ||
      /(?:同比|环比|增长|下降|市场规模|渗透率|转化率|营收|成本)[^\n]{0,40}(?:\d+(?:\.\d+)?%|\d+(?:\.\d+)?\s*(?:万|亿|元|美元))/.test(body)
    );
  }

  function exerciseAlignsWithDay(exercise, planDay) {
    const topic = String(planDay?.topic || '').trim();
    const objective = String(exercise?.objective || '').trim();
    const question = String(exercise?.q || exercise?.question || '').trim();
    if (!topic) return !!objective;
    return objective.includes(topic) || question.includes(topic);
  }

  function lessonDepthFloor(day) {
    if (Number(day) >= 22) return 2800;
    if (Number(day) >= 8) return 2200;
    return 1600;
  }

  function dayFinding(day, severity, code, message, target = 'lesson') {
    return { day: Number(day), severity, code, message, target };
  }

  /** 唯一的逐日发布判定：只读取当前内容，不参考修复历史或优化代理指标。 */
  function evaluateDay(pack, dayInput) {
    const day = Number(dayInput);
    const findings = [];
    const strictV2 = isStrictV2(pack);
    const planDay = (pack?.plan || []).find((row) => Number(row?.day) === day);
    const { slug, markdown } = chapterForDay(pack, day);
    const sourceRows = resourcesForDay(pack, day);
    const exercises = pack?.dayExercises?.[String(day)] || pack?.dayExercises?.[day];

    if (!planDay) {
      findings.push(dayFinding(day, 'hard', 'lesson.plan.missing', `Day ${day} 缺少课表`, 'plan'));
    }
    if (
      planDay &&
      typeof TaskResourceBinder !== 'undefined' &&
      typeof TaskResourceBinder.validateDay === 'function'
    ) {
      const taskResult = TaskResourceBinder.validateDay(pack, day);
      (taskResult?.findings || []).forEach((finding) => {
        findings.push(
          dayFinding(
            day,
            finding.severity || 'hard',
            finding.code || 'task.reference.invalid',
            finding.message || `Day ${day} 的任务资料绑定无效`,
            'tasks'
          )
        );
      });
    }
    if (!slug || !String(markdown || '').trim()) {
      findings.push(dayFinding(day, 'hard', 'lesson.chapter.missing', `Day ${day} 缺少正文`));
    } else if (
      /本章正在后台准备中|<!--\s*zhijing:shallow\s*-->/.test(markdown) ||
      String(markdown).trim().length < lessonDepthFloor(day) ||
      (strictV2 &&
        (String(markdown).match(/^##\s+(?!来源|证据来源|Sources?)/gim) || []).length < 4)
    ) {
      findings.push(
        dayFinding(
          day,
          'floor',
          'lesson.depth.floor',
          `Day ${day} 未达到可学习深度底线（内容长度或教学结构不完整）`
        )
      );
    }

    const validExercises = Array.isArray(exercises)
      ? exercises.filter((item) => String(item?.q || item?.question || '').trim()).length
      : 0;
    if (validExercises < 3) {
      findings.push(
        dayFinding(day, 'hard', 'exercise.coverage.missing', `Day ${day} 缺少三类完整练习`, 'exercises')
      );
    }

    if (strictV2) {
      if (!sourceRows.length) {
        findings.push(
          dayFinding(day, 'hard', 'source.coverage.missing', `Day ${day} 没有有效学习来源`, 'sources')
        );
      } else if (
        sourceRows.some(
          (source) =>
            !sourceIdOf(source) ||
            !String(source?.title || '').trim() ||
            !isValidHttpUrl(source?.url) ||
            !String(source?.publisher || '').trim() ||
            !String(source?.retrievedAt || '').trim() ||
            !String(source?.sourceTier || source?.trustTier || '').trim() ||
            String(source?.sourceTier || source?.trustTier || '').toLowerCase() === 'unknown'
        )
      ) {
        findings.push(
          dayFinding(day, 'hard', 'source.metadata.invalid', `Day ${day} 的来源元数据无效`, 'sources')
        );
      } else if (!sourceRows.some((source) => sourceTierOf(source) === 'high' || sourceTierOf(source) === 'medium')) {
        findings.push(
          dayFinding(
            day,
            'floor',
            'source.quality.floor',
            `Day ${day} 只有低可信上下文来源，缺少可支撑学习的主要资料`,
            'sources'
          )
        );
      }

      const requiredTypes = ['recall', 'application', 'transfer'];
      const exerciseRows = Array.isArray(exercises) ? exercises : [];
      if (
        exerciseRows.length !== requiredTypes.length ||
        exerciseRows.some(
          (exercise, index) =>
            String(exercise?.type || '') !== requiredTypes[index] ||
            !String(exercise?.q || exercise?.question || '').trim() ||
            !String(exercise?.ref || '').trim() ||
            !Array.isArray(exercise?.rubric) ||
            exercise.rubric.filter((item) => String(item).trim()).length < 2 ||
            !Array.isArray(exercise?.commonMistakes) ||
            exercise.commonMistakes.filter((item) => String(item).trim()).length < 1 ||
            !String(exercise?.feedbackMode || '').trim() ||
            !exerciseAlignsWithDay(exercise, planDay)
        )
      ) {
        findings.push(
          dayFinding(day, 'hard', 'exercise.contract.invalid', `Day ${day} 的练习反馈契约不完整`, 'exercises')
        );
      }

      if (
        !String(planDay?.objective || '').trim() ||
        !Array.isArray(planDay?.prerequisites) ||
        !Number.isFinite(Number(planDay?.estimatedMinutes)) ||
        Number(planDay?.estimatedMinutes) <= 0
      ) {
        findings.push(
          dayFinding(day, 'hard', 'lesson.metadata.invalid', `Day ${day} 的日课元数据不完整`, 'plan')
        );
      }

      const allowedSourceIds = new Set(
        sourceRows.map(sourceIdOf).filter(Boolean).map((id) => id.toUpperCase())
      );
      const sourceUrlById = new Map(
        sourceRows
          .map((source) => [sourceIdOf(source).toUpperCase(), String(source?.url || '').trim()])
          .filter(([id, url]) => id && url)
      );
      const cited = citationIds(markdown);
      const lessonCitations = Array.isArray(planDay?.citations)
        ? planDay.citations.map((id) => String(id).toUpperCase())
        : [];
      const requiredBindings = [...new Set([...cited, ...lessonCitations])];
      if (bodyRequiresInlineCitation(markdown) && cited.length === 0) {
        findings.push(
          dayFinding(day, 'hard', 'citation.inline.missing', `Day ${day} 的精确事实缺少正文引用`, 'citations')
        );
      }
      if (cited.some((id) => !allowedSourceIds.has(id))) {
        findings.push(
          dayFinding(day, 'hard', 'citation.id.invalid', `Day ${day} 使用了不存在的来源编号`, 'citations')
        );
      }
      if (
        lessonCitations.length === 0 ||
        lessonCitations.some((id) => !allowedSourceIds.has(id))
      ) {
        findings.push(
          dayFinding(day, 'hard', 'citation.plan.invalid', `Day ${day} 的课表引用元数据不完整`, 'plan')
        );
      }
      if (!citationsBacklinkInSourceSection(markdown, requiredBindings, sourceUrlById)) {
        findings.push(
          dayFinding(day, 'hard', 'citation.backlink.invalid', `Day ${day} 的来源编号与链接不一致`, 'citations')
        );
      }
    }

    const blockingFindings = findings.filter(
      (finding) => finding.severity === 'hard' || finding.severity === 'floor'
    );
    return { day, passed: blockingFindings.length === 0, findings, blockingFindings };
  }

  function optimizationFindingsFromQuality(quality = {}) {
    const findings = [];
    const add = (code, message, metric, value) =>
      findings.push({ severity: 'optimization', code, message, metric, value });
    if (quality.chapterMedianOk === false) {
      add('course.chapter-median', '章节中位深度低于优化目标', 'chapterMedianLen', quality.chapterMedianLen);
    }
    if ((quality.bloomRegressionWeeks || []).length) {
      add(
        'course.bloom-progression',
        '部分周的认知层级递进可继续优化',
        'bloomRegressionWeeks',
        quality.bloomRegressionWeeks.length
      );
    }
    if (quality.stemUniqueOk === false || quality.homogeneousExercises) {
      add('course.exercise-variety', '练习题型多样性可继续优化', 'stemUniqueRatio', quality.stemUniqueRatio);
    }
    if (quality.glossaryFromHub && Number(quality.glossaryHubHitRate) < 0.7) {
      add('course.glossary-hit-rate', '核心术语与正文覆盖关系可继续优化', 'glossaryHubHitRate', quality.glossaryHubHitRate);
    }
    return findings;
  }

  function summarizeIssues(result, limit = 2) {
    const issues = Array.isArray(result?.issues) ? result.issues.filter(Boolean) : [];
    const generic = /内容质量门禁仍要求修复|自动修复未收敛/;
    const actionable = issues.filter((issue) => !generic.test(String(issue)));
    const selected = actionable.length ? actionable : issues;
    return selected.slice(0, Math.max(1, Number(limit) || 2)).join('；');
  }

  function evaluate(pack, harness) {
    const days = expectedDays(pack);
    const planDays = daySet(pack?.plan);
    const missingPlanDays = missingDaysFromSet(planDays, days);
    const entries = navigationEntries(pack);
    const slugs = entries.map((item) => String(item?.slug || '').trim()).filter(Boolean);
    const uniqueSlugs = new Set(slugs);
    const hubDays = new Set(entries.map(navigationDay).filter((day) => day >= 1 && day <= days));
    const missingHubDays = missingDaysFromSet(hubDays, days);
    const chapters = pack?.hub?.chapters || {};
    const missingChapterSlugs = slugs.filter(
      (slug) => typeof chapters[slug] !== 'string' || !chapters[slug].trim()
    );
    const missingExerciseDays = [];
    const missingResourceDays = [];
    const emptyResourceDays = [];
    const invalidSourceDays = [];
    const lowTrustSourceDays = [];
    const missingCitationDays = [];
    const missingInlineCitationDays = [];
    const invalidCitationIdDays = [];
    const missingCitationBacklinkDays = [];
    const missingLessonCitationDays = [];
    const invalidExerciseDays = [];
    const invalidLessonDays = [];
    const missingCheckpointWeeks = [];
    const backjumpDays = phaseBackjumps(pack?.plan);
    const strictV2 = isStrictV2(pack);
    const dayResults = Array.from({ length: days }, (_, index) => evaluateDay(pack, index + 1));
    const qualityFloorDays = dayResults
      .filter((result) => result.findings.some((finding) => finding.code === 'lesson.depth.floor'))
      .map((result) => result.day);
    const invalidTaskDays = dayResults
      .filter((result) => result.findings.some((finding) => String(finding.code).startsWith('task.')))
      .map((result) => result.day);

    for (let day = 1; day <= days; day++) {
      const exercises = pack?.dayExercises?.[String(day)] || pack?.dayExercises?.[day];
      const resources = pack?.dayResources?.[String(day)] || pack?.dayResources?.[day];
      const validExercises = Array.isArray(exercises)
        ? exercises.filter((item) => String(item?.q || item?.question || '').trim()).length
        : 0;
      if (validExercises < 3) {
        missingExerciseDays.push(day);
      }
      if (!resources || typeof resources !== 'object') missingResourceDays.push(day);
      if (!strictV2) continue;

      const sourceRows = resourcesForDay(pack, day);
      if (sourceRows.length === 0) {
        emptyResourceDays.push(day);
      } else if (
        sourceRows.some(
          (source) =>
            !sourceIdOf(source) ||
            !String(source?.title || '').trim() ||
            !isValidHttpUrl(source?.url) ||
            !String(source?.publisher || '').trim() ||
            !String(source?.retrievedAt || '').trim() ||
            !String(source?.sourceTier || source?.trustTier || '').trim() ||
            String(source?.sourceTier || source?.trustTier || '').toLowerCase() === 'unknown'
        )
      ) {
        invalidSourceDays.push(day);
      } else if (!sourceRows.some((source) => sourceTierOf(source) === 'high' || sourceTierOf(source) === 'medium')) {
        lowTrustSourceDays.push(day);
      }

      const planDay = (pack?.plan || []).find((row) => Number(row?.day) === day);
      const allowedSourceIds = new Set(sourceRows.map(sourceIdOf).filter(Boolean).map((id) => id.toUpperCase()));
      const sourceUrlById = new Map(
        sourceRows
          .map((source) => [sourceIdOf(source).toUpperCase(), String(source?.url || '').trim()])
          .filter(([id, url]) => id && url)
      );
      const { markdown } = chapterForDay(pack, day);
      const cited = citationIds(markdown);
      const lessonCitations = Array.isArray(planDay?.citations)
        ? planDay.citations.map((id) => String(id).toUpperCase())
        : [];
      const requiredBindings = [...new Set([...cited, ...lessonCitations])];
      const missingInline = bodyRequiresInlineCitation(markdown) && cited.length === 0;
      const invalidInlineId = cited.some((id) => !allowedSourceIds.has(id));
      const invalidLessonCitation =
        lessonCitations.length === 0 ||
        lessonCitations.some((id) => !allowedSourceIds.has(id));
      const missingBacklink = !citationsBacklinkInSourceSection(
        markdown,
        requiredBindings,
        sourceUrlById
      );
      if (missingInline) missingInlineCitationDays.push(day);
      if (invalidInlineId) invalidCitationIdDays.push(day);
      if (invalidLessonCitation) missingLessonCitationDays.push(day);
      if (missingBacklink) missingCitationBacklinkDays.push(day);
      if (missingInline || invalidInlineId || invalidLessonCitation || missingBacklink) {
        missingCitationDays.push(day);
      }
      if (
        !String(planDay?.objective || '').trim() ||
        !Array.isArray(planDay?.prerequisites) ||
        !Number.isFinite(Number(planDay?.estimatedMinutes)) ||
        Number(planDay?.estimatedMinutes) <= 0
      ) {
        invalidLessonDays.push(day);
      }

      const requiredTypes = ['recall', 'application', 'transfer'];
      const exerciseRows = Array.isArray(exercises) ? exercises : [];
      if (
        exerciseRows.length !== requiredTypes.length ||
        exerciseRows.some(
          (exercise, index) =>
            String(exercise?.type || '') !== requiredTypes[index] ||
            !String(exercise?.q || exercise?.question || '').trim() ||
            !String(exercise?.ref || '').trim() ||
            !Array.isArray(exercise?.rubric) ||
            exercise.rubric.filter((item) => String(item).trim()).length < 2 ||
            !Array.isArray(exercise?.commonMistakes) ||
            exercise.commonMistakes.filter((item) => String(item).trim()).length < 1 ||
            !String(exercise?.feedbackMode || '').trim() ||
            !exerciseAlignsWithDay(exercise, planDay)
        )
      ) {
        invalidExerciseDays.push(day);
      }
    }

    if (strictV2) {
      const checkpointByWeek = new Map(
        (Array.isArray(pack?.weeklyCheckpoints) ? pack.weeklyCheckpoints : []).map((checkpoint) => [
          Number(checkpoint?.week),
          checkpoint,
        ])
      );
      const totalWeeks = Math.ceil(days / 7);
      for (let week = 1; week <= totalWeeks; week++) {
        const checkpoint = checkpointByWeek.get(week);
        if (
          !checkpoint?.cumulative ||
          !String(checkpoint?.deliverable || '').trim() ||
          !Array.isArray(checkpoint?.rubric) ||
          checkpoint.rubric.filter((item) => String(item).trim()).length < 2 ||
          (week > 1 && !String(checkpoint?.buildsOn || '').trim())
        ) {
          missingCheckpointWeeks.push(week);
        }
      }
    }

    const quality = pack?.meta?.quality || null;
    const optimizationFindings = optimizationFindingsFromQuality(quality || {});
    const optimizationSuggested = optimizationFindings.length > 0;
    // 当前内容决定能否发布；修复历史和优化代理指标仅用于诊断与后续改进。
    const harnessNeedsRepair = false;
    const issues = [];

    if (missingPlanDays.length) issues.push(`缺少课表 Day ${missingPlanDays.join(', ')}`);
    if (missingHubDays.length) {
      issues.push(`日课未覆盖 Day ${missingHubDays.join(', ')}`);
    }
    if (missingChapterSlugs.length) {
      issues.push(`缺少 ${missingChapterSlugs.length} 篇日课正文`);
    }
    if (missingExerciseDays.length) {
      issues.push(`缺少 ${missingExerciseDays.length} 天的完整练习`);
    }
    if (missingResourceDays.length) {
      issues.push(`缺少 ${missingResourceDays.length} 天的资料记录`);
    }
    if (emptyResourceDays.length) issues.push(`${emptyResourceDays.length} 天没有有效学习来源`);
    if (invalidSourceDays.length) issues.push(`${invalidSourceDays.length} 天的来源元数据无效`);
    if (lowTrustSourceDays.length) issues.push(`${lowTrustSourceDays.length} 天只有低可信上下文来源`);
    if (missingInlineCitationDays.length) {
      issues.push(`${missingInlineCitationDays.length} 天的精确事实缺少正文引用`);
    }
    if (invalidCitationIdDays.length) {
      issues.push(`${invalidCitationIdDays.length} 天使用了不存在的来源编号`);
    }
    if (missingCitationBacklinkDays.length) {
      issues.push(`${missingCitationBacklinkDays.length} 天的来源编号与链接不一致`);
    }
    if (missingLessonCitationDays.length) {
      issues.push(`${missingLessonCitationDays.length} 天的课表引用元数据不完整`);
    }
    if (invalidLessonDays.length) issues.push(`${invalidLessonDays.length} 天的日课元数据不完整`);
    if (invalidExerciseDays.length) issues.push(`${invalidExerciseDays.length} 天的练习反馈契约不完整`);
    if (invalidTaskDays.length) issues.push(`${invalidTaskDays.length} 天的任务资料绑定无效`);
    if (missingCheckpointWeeks.length) issues.push(`${missingCheckpointWeeks.length} 周缺少累计作品`);
    if (backjumpDays.length) issues.push(`学习阶段在 ${backjumpDays.length} 天发生回跳`);
    if (qualityFloorDays.length) {
      issues.push(`${qualityFloorDays.length} 天未达到可学习深度底线（Day ${qualityFloorDays.join(', ')}）`);
    }
    if (!quality) issues.push('尚未执行内容质量门禁');
    else {
      if (quality.glossaryEnough !== true) issues.push('合格术语不足 8 条');
      if (Number(quality.glossaryKindCount) < 2) issues.push('术语可视化类型不足 2 种');
      if (quality.phaseMonotonic === false) issues.push('学习阶段存在回跳');
    }

    return {
      passed: issues.length === 0,
      checkedAt: new Date().toISOString(),
      expectedDays: days,
      planDayCount: planDays.size,
      navigationChapterCount: uniqueSlugs.size,
      missingPlanDays,
      missingHubDays,
      missingChapterSlugs,
      missingExerciseDays,
      missingResourceDays,
      emptyResourceDays,
      invalidSourceDays,
      lowTrustSourceDays,
      missingCitationDays,
      missingInlineCitationDays,
      invalidCitationIdDays,
      missingCitationBacklinkDays,
      missingLessonCitationDays,
      invalidLessonDays,
      invalidExerciseDays,
      invalidTaskDays,
      missingCheckpointWeeks,
      phaseBackjumpDays: backjumpDays,
      qualityFloorDays,
      dayResults,
      optimizationFindings,
      optimizationSuggested,
      harnessNeedsRepair,
      issues,
    };
  }

  function apply(pack, harness) {
    if (!pack) throw new Error('无法验收空课包');
    pack.meta = pack.meta || {};
    pack.meta.quality = pack.meta.quality || {};
    const result = evaluate(pack, harness);
    pack.meta.quality.workflowGate = result;
    pack.meta.quality.finalGatePassed = result.passed;
    pack.meta.quality.needsReview = !result.passed;
    pack.evaluation = {
      ...(pack.evaluation || {}),
      status: result.passed ? 'passed' : 'needs-review',
      evaluatedAt: result.checkedAt,
      workflowFindings: [...result.issues],
    };
    pack.status = result.passed ? 'ready' : 'needs_review';
    pack.updatedAt = new Date().toISOString();
    return result;
  }

  return { evaluate, evaluateDay, apply, phaseBackjumps, summarizeIssues };
});
