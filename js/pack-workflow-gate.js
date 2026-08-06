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
    const backjumpDays = phaseBackjumps(pack?.plan);

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
    }

    const quality = pack?.meta?.quality || null;
    const harnessNeedsRepair =
      !!quality && typeof harness?.shouldRepair === 'function'
        ? !!harness.shouldRepair(quality)
        : !!quality?.needsReview;
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
    if (backjumpDays.length) issues.push(`学习阶段在 ${backjumpDays.length} 天发生回跳`);
    if (!quality) issues.push('尚未执行内容质量门禁');
    else {
      if (quality.glossaryEnough !== true) issues.push('合格术语不足 8 条');
      if (Number(quality.glossaryKindCount) < 2) issues.push('术语可视化类型不足 2 种');
      if (quality.phaseMonotonic === false) issues.push('学习阶段存在回跳');
      if (quality.repair?.passed === false) issues.push('自动修复未收敛');
      if (harnessNeedsRepair) issues.push('内容质量门禁仍要求修复');
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
      phaseBackjumpDays: backjumpDays,
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
    pack.status = result.passed ? 'ready' : 'needs_review';
    pack.updatedAt = new Date().toISOString();
    return result;
  }

  return { evaluate, apply, phaseBackjumps };
});
