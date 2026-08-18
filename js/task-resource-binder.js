/**
 * TaskResourceBinder — deterministic bindings between visible lesson tasks,
 * internal hub chapters, and curated external resources.
 */
(function initTaskResourceBinder(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TaskResourceBinder = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createTaskResourceBinder() {
  'use strict';

  function text(value) {
    return String(value || '').trim();
  }

  function resourceId(resource) {
    return text(resource?.sourceId || resource?.evidenceId || resource?.evidence?.id || resource?.id);
  }

  function normalizeTitle(value) {
    return text(value)
      .toLowerCase()
      .replace(/[《》「」『』“”"'：:，,。.!！?？\s_-]+/g, '');
  }

  function extractResourceClaims(taskText) {
    const value = text(taskText);
    const titles = [...value.matchAll(/[《「『"]([^》」』"]{2,80})[》」』"]/g)]
      .map((match) => text(match[1]))
      .filter(Boolean);
    const urls = [...value.matchAll(/https?:\/\/[^\s)）]+/gi)].map((match) => match[0]);
    const namedMaterials = [...value.matchAll(
      /(?:阅读|精读|研读|观看|查看|参考|浏览|学习)\s*([^，。；\n]{2,60}?(?:报告|白皮书|课程|视频|文章|指南|文档|仓库))/gi
    )].map((match) => text(match[1]));
    return {
      titles: [...new Set([...titles, ...namedMaterials])],
      urls: [...new Set(urls)],
    };
  }

  function looksLikeExternalResourceTask(taskText) {
    const value = text(taskText);
    if (!/(?:阅读|精读|研读|观看|查看|参考|浏览|学习)/.test(value)) return false;
    const claims = extractResourceClaims(value);
    return (
      claims.titles.length > 0 ||
      claims.urls.length > 0 ||
      /(?:B站|bilibili|GitHub|维基百科|wiki|行业报告|白皮书)/i.test(value)
    );
  }

  function matchingResource(taskText, resources) {
    const value = normalizeTitle(taskText);
    const claims = extractResourceClaims(taskText);
    return (resources || []).find((resource) => {
      const titles = [resource?.displayTitle, resource?.originalTitle, resource?.title]
        .map(normalizeTitle)
        .filter(Boolean);
      if (!titles.length) return false;
      if (titles.some((title) => value.includes(title) || title.includes(value))) return true;
      return claims.titles.some((claim) => {
        const normalized = normalizeTitle(claim);
        return (
          normalized &&
          titles.some((title) => title.includes(normalized) || normalized.includes(title))
        );
      });
    });
  }

  function hubTask(dayPlan) {
    const day = Number(dayPlan?.day) || 1;
    const topic = text(dayPlan?.topic) || `Day ${day}`;
    return `打开日课「Day ${day} · ${topic}」精读本日章节，勾选完成清单`;
  }

  function defaultTask(index, topic) {
    if (index === 1) return `围绕「${topic}」整理一份可检查的对比表或步骤清单`;
    return `合上资料，用自己的话复述「${topic}」的判断方法并完成场景判断`;
  }

  function bindDay({ dayPlan, resources = [], hubSlug = '' } = {}) {
    const source = dayPlan && typeof dayPlan === 'object' ? dayPlan : {};
    const day = Number(source.day) || 1;
    const topic = text(source.topic) || `Day ${day}`;
    const actualResources = (Array.isArray(resources) ? resources : []).filter((row) => resourceId(row));
    const tasks = [];
    const bindings = [];
    const add = (taskText, binding) => {
      const value = text(taskText);
      if (!value || tasks.includes(value)) return;
      tasks.push(value);
      bindings.push({ taskIndex: tasks.length - 1, ...binding });
    };

    add(hubTask(source), {
      kind: 'hub',
      hubSlug: text(hubSlug) || `day-${day}`,
      sourceId: '',
    });

    for (const rawTask of Array.isArray(source.tasks) ? source.tasks : []) {
      if (tasks.length >= 3) break;
      const taskText = text(rawTask);
      if (!taskText || /(?:打开|阅读|精读).*(?:日课|知识库)/.test(taskText)) continue;
      if (looksLikeExternalResourceTask(taskText)) {
        const resource = matchingResource(taskText, actualResources);
        if (!resource) continue;
        const sourceId = resourceId(resource);
        const verb = /观看/.test(taskText) || resource?.type === 'video' ? '观看' : '阅读';
        add(
          `${verb}资料「${text(resource.displayTitle || resource.originalTitle || resource.title)}」（${sourceId}）`,
          {
          kind: 'resource',
          sourceId,
          url: text(resource.url),
          hubSlug: '',
          }
        );
        continue;
      }
      add(taskText, {
        kind: tasks.length === 1 ? 'process' : 'recall',
        sourceId: '',
        hubSlug: '',
      });
    }

    while (tasks.length < 3) {
      const index = tasks.length;
      add(defaultTask(index, topic), {
        kind: index === 1 ? 'process' : 'recall',
        sourceId: '',
        hubSlug: '',
      });
    }

    return { ...source, tasks, taskBindings: bindings };
  }

  function navigationItemForDay(pack, day) {
    return (pack?.hub?.navigation || [])
      .flatMap((module) => module?.items || [])
      .find((item) => Number(String(item?.slug || '').match(/(?:^|\/)day-(\d+)(?:\/|$)/i)?.[1]) === day);
  }

  function bindPack(pack) {
    if (!pack || !Array.isArray(pack.plan)) return pack;
    pack.plan = pack.plan.map((dayPlan) => {
      const day = Number(dayPlan?.day);
      const resources = pack.dayResources?.[String(day)]?.resources || [];
      const hubSlug = text(navigationItemForDay(pack, day)?.slug);
      return bindDay({ dayPlan, resources, hubSlug });
    });
    return pack;
  }

  function validateDay(pack, dayInput) {
    const day = Number(dayInput);
    const planDay = (pack?.plan || []).find((row) => Number(row?.day) === day);
    if (!planDay) return { passed: true, findings: [] };
    const resources = pack?.dayResources?.[String(day)]?.resources || [];
    const sourceIds = new Set(resources.map(resourceId).filter(Boolean));
    const bindings = Array.isArray(planDay.taskBindings) ? planDay.taskBindings : [];
    const findings = [];
    const add = (code, message) => findings.push({ day, code, message, target: 'tasks', severity: 'hard' });

    (Array.isArray(planDay.tasks) ? planDay.tasks : []).forEach((taskText, taskIndex) => {
      if (!looksLikeExternalResourceTask(taskText)) return;
      const binding = bindings.find((row) => Number(row?.taskIndex) === taskIndex);
      if (!binding || binding.kind !== 'resource' || !sourceIds.has(text(binding.sourceId))) {
        add('task.reference.invalid', `Day ${day} 的外部阅读任务没有绑定当天真实资料`);
      }
    });
    bindings.forEach((binding) => {
      if (binding?.kind === 'resource' && !sourceIds.has(text(binding.sourceId))) {
        add('task.reference.orphan', `Day ${day} 的任务引用了不存在的来源编号`);
      }
      if (binding?.kind === 'hub') {
        const actualSlug = text(navigationItemForDay(pack, day)?.slug);
        if (!actualSlug || text(binding.hubSlug) !== actualSlug) {
          add('task.hub.invalid', `Day ${day} 的日课任务没有绑定当天章节`);
        }
      }
    });
    return { passed: findings.length === 0, findings };
  }

  function toDisplayTasks(dayPlan) {
    return Array.isArray(dayPlan?.tasks) ? dayPlan.tasks.map(text).filter(Boolean) : [];
  }

  return {
    bindDay,
    bindPack,
    validateDay,
    extractResourceClaims,
    looksLikeExternalResourceTask,
    toDisplayTasks,
  };
});
