/**
 * PackQualityContract — content pack V2 schema, normalization and validation.
 *
 * Classic-script/UMD module: window.PackQualityContract in browsers and
 * require('./pack-quality-contract.js') in Node.
 */
(function initPackQualityContract(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PackQualityContract = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createPackQualityContract() {
  'use strict';

  const SCHEMA_VERSION = 2;

  function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.keys(value).forEach((key) => deepFreeze(value[key]));
    return Object.freeze(value);
  }

  /**
   * Shared quality thresholds. Keep all evaluator/generator consumers on this
   * object instead of copying numeric gates into new modules.
   */
  const QUALITY_THRESHOLDS = deepFreeze({
    exercises: {
      stemUniqueMin: 0.65,
      maxStemRepeats: 2,
      bloomDropMax: 0.15,
    },
    chapters: {
      medianMinChars: 2800,
      earlyDayMinChars: 1600,
      midDayMinChars: 2200,
      lateDayMinChars: 2800,
      maxThinLateChapters: 3,
      maxShallowRatio: 0.2,
    },
    glossary: {
      minCoreEntries: 8,
      minPassRate: 0.85,
      minVisualKinds: 2,
      minHubHitRate: 0.7,
    },
    sources: {
      minPerLesson: 1,
      minTrustedPerLesson: 1,
      tiers: ['high', 'medium', 'contextual'],
    },
  });

  /**
   * Machine-readable schema summary. This intentionally avoids a JSON Schema
   * dependency while documenting the canonical V2 wire shape.
   */
  const V2_SCHEMA = deepFreeze({
    schemaVersion: SCHEMA_VERSION,
    package: {
      required: ['schemaVersion', 'id', 'meta', 'plan', 'contentUpdatedAt', 'generation', 'evaluation'],
      properties: {
        schemaVersion: 'number',
        contentUpdatedAt: 'ISO-8601 string',
        generation: 'Generation',
        evaluation: 'Evaluation',
      },
    },
    lessonMetadata: {
      objective: 'string',
      prerequisites: 'string[]',
      estimatedMinutes: 'number',
      citations: 'sourceId[]',
      taskBindings: 'TaskBinding[]',
    },
    source: {
      sourceId: 'string',
      title: 'string',
      url: 'string',
      publisher: 'string',
      publishedAt: 'ISO-8601 string',
      retrievedAt: 'ISO-8601 string',
      sourceTier: 'string',
    },
    exercise: {
      rubric: 'string[]',
      ref: 'string',
      commonMistakes: 'string[]',
      feedbackMode: 'string',
      type: 'string',
    },
    generation: {
      provenance: 'object',
    },
    evaluation: {
      status: 'string',
      evaluatedAt: 'ISO-8601 string',
      findings: 'array',
    },
  });

  function isObject(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
  }

  function clone(value) {
    if (Array.isArray(value)) return value.map(clone);
    if (!isObject(value)) return value;
    const copy = {};
    Object.keys(value).forEach((key) => {
      copy[key] = clone(value[key]);
    });
    return copy;
  }

  function text(value, fallback = '') {
    if (value == null) return fallback;
    return String(value).trim();
  }

  function stringList(value) {
    const rows = Array.isArray(value)
      ? value
      : value == null || value === ''
        ? []
        : [value];
    return [...new Set(rows.map((item) => text(item)).filter(Boolean))];
  }

  function finiteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : fallback;
  }

  function stableHash(value) {
    let hash = 2166136261;
    const input = String(value || '');
    for (let i = 0; i < input.length; i += 1) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function normalizeCitation(citation) {
    if (typeof citation === 'string' || typeof citation === 'number') return text(citation);
    if (!isObject(citation)) return '';
    return text(citation.sourceId || citation.ref || citation.id || citation.url);
  }

  function normalizeSourceTier(value) {
    const tier = text(value).toLowerCase();
    if (tier === 'primary' || tier === 'high') return 'high';
    if (tier === 'secondary' || tier === 'medium') return 'medium';
    if (tier === 'contextual') return 'contextual';
    return 'unknown';
  }

  function normalizeLessonMetadata(input) {
    const source = isObject(input) ? input : {};
    const prerequisites = source.prerequisites ?? source.prerequisite ?? source.requires;
    const citations = Array.isArray(source.citations)
      ? source.citations
      : source.citations == null
        ? []
        : [source.citations];
    return {
      objective: text(source.objective || source.learningObjective || source.goal),
      prerequisites: stringList(prerequisites),
      estimatedMinutes: finiteNumber(
        source.estimatedMinutes ?? source.durationMinutes ?? source.minutes,
        0
      ),
      citations: [...new Set(citations.map(normalizeCitation).filter(Boolean))],
    };
  }

  function normalizeSource(input, context = {}) {
    const source = isObject(input) ? clone(input) : {};
    const url = text(source.url || source.href);
    const title = text(source.title || source.name);
    const originalTitle = text(source.originalTitle, title);
    const displayTitle = text(source.displayTitle, originalTitle);
    const fallbackId = `source-${stableHash(`${context.day || ''}|${url}|${title}|${context.index || 0}`)}`;
    return {
      ...source,
      sourceId: text(source.sourceId || source.evidenceId || source.id, fallbackId),
      title,
      originalTitle,
      displayTitle,
      url,
      publisher: text(source.publisher || source.siteName || source.author),
      publishedAt: text(source.publishedAt || source.published || source.date),
      retrievedAt: text(source.retrievedAt || source.accessedAt),
      sourceTier: normalizeSourceTier(source.sourceTier || source.trustTier || source.tier),
    };
  }

  function normalizeExercise(input) {
    const exercise = isObject(input) ? clone(input) : {};
    const rubric = exercise.rubric ?? exercise.criteria ?? exercise.scoringPoints;
    const commonMistakes = exercise.commonMistakes ?? exercise.mistakes;
    return {
      ...exercise,
      q: text(exercise.q || exercise.question || exercise.prompt),
      rubric: stringList(rubric),
      ref: text(exercise.ref || exercise.referenceAnswer || exercise.answer),
      commonMistakes: stringList(commonMistakes),
      feedbackMode: text(exercise.feedbackMode, 'rubric'),
      type: text(exercise.type || exercise.exerciseType, 'short-answer'),
    };
  }

  function normalizeTaskBinding(input, index) {
    const binding = isObject(input) ? clone(input) : {};
    return {
      ...binding,
      taskIndex: finiteNumber(binding.taskIndex, index),
      kind: text(binding.kind),
      sourceId: text(binding.sourceId),
      hubSlug: text(binding.hubSlug),
      url: text(binding.url),
    };
  }

  function normalizeLesson(input) {
    const lesson = isObject(input) ? clone(input) : {};
    const metadata = normalizeLessonMetadata({
      ...lesson,
      ...(isObject(lesson.metadata) ? lesson.metadata : {}),
    });
    return {
      ...lesson,
      ...metadata,
      taskBindings: Array.isArray(lesson.taskBindings)
        ? lesson.taskBindings.map(normalizeTaskBinding)
        : lesson.taskBindings,
      metadata: {
        ...(isObject(lesson.metadata) ? lesson.metadata : {}),
        ...metadata,
      },
    };
  }

  function normalizeGeneration(input) {
    const generation = isObject(input) ? clone(input) : {};
    const provenanceInput = isObject(generation.provenance) ? generation.provenance : {};
    const provenance = {
      ...provenanceInput,
      generator: text(provenanceInput.generator || generation.generator),
      model: text(provenanceInput.model || generation.model),
      promptVersion: text(provenanceInput.promptVersion || generation.promptVersion),
      traceId: text(provenanceInput.traceId || generation.traceId),
      generatedAt: text(
        provenanceInput.generatedAt || generation.generatedAt || generation.completedAt
      ),
    };
    return { ...generation, provenance };
  }

  function normalizeEvaluation(input) {
    const evaluation = isObject(input) ? clone(input) : {};
    const findings = Array.isArray(evaluation.findings) ? evaluation.findings.map(clone) : [];
    const inferredStatus =
      evaluation.passed === true || evaluation.finalGatePassed === true
        ? 'passed'
        : evaluation.needsReview === true || evaluation.passed === false
          ? 'needs-review'
          : 'not-evaluated';
    return {
      ...evaluation,
      status: text(evaluation.status, inferredStatus),
      evaluatedAt: text(evaluation.evaluatedAt || evaluation.checkedAt),
      findings,
    };
  }

  function normalizeDayMap(dayMap, normalizeItem, wrapperKey) {
    if (!isObject(dayMap)) return {};
    const normalized = {};
    Object.keys(dayMap).forEach((dayKey) => {
      const row = dayMap[dayKey];
      if (wrapperKey) {
        const wrapper = isObject(row) ? clone(row) : {};
        const items = Array.isArray(wrapper[wrapperKey]) ? wrapper[wrapperKey] : [];
        normalized[dayKey] = {
          ...wrapper,
          [wrapperKey]: items.map((item, index) =>
            normalizeItem(item, { day: dayKey, index })
          ),
        };
      } else {
        const items = Array.isArray(row) ? row : [];
        normalized[dayKey] = items.map((item, index) =>
          normalizeItem(item, { day: dayKey, index })
        );
      }
    });
    return normalized;
  }

  function normalizePack(input, options = {}) {
    const source = isObject(input) ? clone(input) : {};
    const suppliedNow =
      typeof options.now === 'function' ? options.now() : options.now;
    const now = text(suppliedNow) || new Date().toISOString();
    const legacyVersion = finiteNumber(source.schemaVersion ?? source.version, 1) || 1;
    const meta = isObject(source.meta) ? source.meta : {};
    const topGeneration = isObject(source.generation) ? source.generation : {};
    const legacyGeneration = isObject(meta.generation) ? meta.generation : {};
    const generationSource = {
      ...legacyGeneration,
      ...topGeneration,
      provenance: {
        ...(isObject(legacyGeneration.provenance) ? legacyGeneration.provenance : {}),
        ...(isObject(topGeneration.provenance) ? topGeneration.provenance : {}),
      },
    };
    const topEvaluation = isObject(source.evaluation) ? source.evaluation : {};
    const legacyEvaluation = isObject(meta.quality) ? meta.quality : {};
    const hasCurrentLegacyEvaluation = Object.keys(legacyEvaluation).length > 0;
    const topIsUnevaluated =
      !topEvaluation.evaluatedAt &&
      (!topEvaluation.status || topEvaluation.status === 'not-evaluated');
    const evaluationSource =
      hasCurrentLegacyEvaluation && topIsUnevaluated
        ? legacyEvaluation
        : topEvaluation;
    const updatedAt = text(source.updatedAt || source.createdAt, now);
    const contentUpdatedAt = options.touchContent === true
      ? now
      : text(source.contentUpdatedAt, updatedAt);

    return {
      ...source,
      schemaVersion: SCHEMA_VERSION,
      version: source.version == null ? legacyVersion : source.version,
      contentUpdatedAt,
      meta: clone(meta),
      plan: (Array.isArray(source.plan) ? source.plan : []).map(normalizeLesson),
      dayResources: normalizeDayMap(source.dayResources, normalizeSource, 'resources'),
      dayExercises: normalizeDayMap(source.dayExercises, normalizeExercise),
      generation: normalizeGeneration(generationSource),
      evaluation: normalizeEvaluation(evaluationSource),
    };
  }

  function isIsoDate(value) {
    return typeof value === 'string' && value !== '' && Number.isFinite(Date.parse(value));
  }

  function validatePack(input, options = {}) {
    const allowLegacy = options.allowLegacy !== false;
    const originalVersion = Number(input?.schemaVersion || input?.version || 1);
    const value = options.normalize === false ? input : normalizePack(input, options);
    const issues = [];

    function issue(severity, path, code, message) {
      issues.push({ severity, path, code, message });
    }

    if (!isObject(input)) issue('error', '', 'pack.type', '课包必须是对象');
    if (originalVersion < SCHEMA_VERSION) {
      issue(
        allowLegacy ? 'warning' : 'error',
        'schemaVersion',
        'schema.legacy',
        `旧版课包 v${originalVersion} 将按 V2 兼容读取`
      );
    } else if (originalVersion !== SCHEMA_VERSION) {
      issue('error', 'schemaVersion', 'schema.unsupported', `不支持 schemaVersion ${originalVersion}`);
    }
    if (!text(value?.id)) issue('error', 'id', 'pack.id.required', '课包 id 不能为空');
    if (!isObject(value?.meta)) issue('error', 'meta', 'pack.meta.type', 'meta 必须是对象');
    if (!Array.isArray(value?.plan)) issue('error', 'plan', 'pack.plan.type', 'plan 必须是数组');
    if (!isIsoDate(value?.contentUpdatedAt)) {
      issue(
        'error',
        'contentUpdatedAt',
        'pack.contentUpdatedAt.invalid',
        'contentUpdatedAt 必须是有效 ISO-8601 时间'
      );
    }

    const lessons = Array.isArray(value?.plan) ? value.plan : [];
    lessons.forEach((lesson, index) => {
      const base = `plan[${index}]`;
      if (!lesson.objective) {
        issue('error', `${base}.objective`, 'lesson.objective.required', 'objective 不能为空');
      }
      if (!Array.isArray(lesson.prerequisites)) {
        issue('error', `${base}.prerequisites`, 'lesson.prerequisites.type', 'prerequisites 必须是数组');
      }
      if (!Array.isArray(lesson.citations)) {
        issue('error', `${base}.citations`, 'lesson.citations.type', 'citations 必须是数组');
      }
      if (!Number.isFinite(lesson.estimatedMinutes) || lesson.estimatedMinutes <= 0) {
        issue('error', `${base}.estimatedMinutes`, 'lesson.estimatedMinutes.invalid', 'estimatedMinutes 必须是正数');
      }
      if (originalVersion >= SCHEMA_VERSION && lesson.citations.length === 0) {
        issue('error', `${base}.citations`, 'lesson.citations.required', 'V2 日课至少需要一个来源引用');
      }
      if (lesson.taskBindings != null && !Array.isArray(lesson.taskBindings)) {
        issue('error', `${base}.taskBindings`, 'task.bindings.type', 'taskBindings 必须是数组');
      }
    });

    if (originalVersion >= SCHEMA_VERSION) {
      const provenance = value?.generation?.provenance;
      ['generator', 'model', 'promptVersion', 'generatedAt'].forEach((field) => {
        if (!text(provenance?.[field])) {
          issue(
            'error',
            `generation.provenance.${field}`,
            `generation.provenance.${field}.required`,
            `generation.provenance.${field} 不能为空`
          );
        }
      });
      if (!text(value?.evaluation?.status) || !isIsoDate(value?.evaluation?.evaluatedAt)) {
        issue(
          'error',
          'evaluation',
          'evaluation.required',
          'evaluation 必须包含状态和有效评估时间'
        );
      }
    }

    Object.keys(value?.dayResources || {}).forEach((day) => {
      const resources = Array.isArray(value.dayResources[day]?.resources)
        ? value.dayResources[day].resources
        : [];
      resources.forEach((source, index) => {
        const base = `dayResources.${day}.resources[${index}]`;
        if (!source.sourceId) issue('error', `${base}.sourceId`, 'source.id.required', 'sourceId 不能为空');
        if (!source.title) issue('warning', `${base}.title`, 'source.title.missing', '来源缺少标题');
        if (!source.url) issue('warning', `${base}.url`, 'source.url.missing', '来源缺少 URL');
        if (originalVersion >= SCHEMA_VERSION && !source.publisher) {
          issue('error', `${base}.publisher`, 'source.publisher.required', 'V2 来源缺少 publisher');
        }
        if (originalVersion >= SCHEMA_VERSION && !source.retrievedAt) {
          issue('error', `${base}.retrievedAt`, 'source.retrievedAt.required', 'V2 来源缺少 retrievedAt');
        }
        if (originalVersion >= SCHEMA_VERSION && source.sourceTier === 'unknown') {
          issue('error', `${base}.sourceTier`, 'source.tier.required', 'V2 来源缺少可信等级');
        }
        ['publishedAt', 'retrievedAt'].forEach((field) => {
          if (source[field] && !isIsoDate(source[field])) {
            issue('warning', `${base}.${field}`, `source.${field}.invalid`, `${field} 不是有效时间`);
          }
        });
      });
    });

    lessons.forEach((lesson, index) => {
      if (!Array.isArray(lesson.taskBindings)) return;
      const day = Number(lesson.day) || index + 1;
      const resources = value?.dayResources?.[String(day)]?.resources || [];
      const sourceIds = new Set(resources.map((source) => text(source.sourceId)).filter(Boolean));
      lesson.taskBindings.forEach((binding, bindingIndex) => {
        const base = `plan[${index}].taskBindings[${bindingIndex}]`;
        if (!Number.isInteger(binding.taskIndex) || binding.taskIndex < 0) {
          issue('error', `${base}.taskIndex`, 'task.binding.index.invalid', '任务绑定索引无效');
        }
        if (binding.kind === 'resource' && !sourceIds.has(text(binding.sourceId))) {
          issue('error', `${base}.sourceId`, 'task.binding.source.invalid', '任务绑定的来源不存在');
        }
        if (binding.kind === 'hub' && !text(binding.hubSlug)) {
          issue('error', `${base}.hubSlug`, 'task.binding.hub.required', '日课任务缺少章节绑定');
        }
      });
    });

    Object.keys(value?.dayExercises || {}).forEach((day) => {
      const exercises = Array.isArray(value.dayExercises[day])
        ? value.dayExercises[day]
        : [];
      exercises.forEach((exercise, index) => {
        const base = `dayExercises.${day}[${index}]`;
        if (!exercise.q) issue('error', `${base}.q`, 'exercise.q.required', '练习题题干不能为空');
        if (!Array.isArray(exercise.rubric)) {
          issue('error', `${base}.rubric`, 'exercise.rubric.type', 'rubric 必须是数组');
        }
        if (!Array.isArray(exercise.commonMistakes)) {
          issue('error', `${base}.commonMistakes`, 'exercise.commonMistakes.type', 'commonMistakes 必须是数组');
        }
        if (!exercise.type) issue('error', `${base}.type`, 'exercise.type.required', 'type 不能为空');
        if (originalVersion >= SCHEMA_VERSION && !exercise.ref) {
          issue('error', `${base}.ref`, 'exercise.ref.required', 'V2 练习必须包含参考答案');
        }
        if (originalVersion >= SCHEMA_VERSION && exercise.rubric.length < 2) {
          issue('error', `${base}.rubric`, 'exercise.rubric.min', 'V2 练习 rubric 至少两条');
        }
        if (originalVersion >= SCHEMA_VERSION && exercise.commonMistakes.length < 1) {
          issue(
            'error',
            `${base}.commonMistakes`,
            'exercise.commonMistakes.min',
            'V2 练习至少包含一个常见错误'
          );
        }
        if (!exercise.feedbackMode) {
          issue('error', `${base}.feedbackMode`, 'exercise.feedbackMode.required', 'feedbackMode 不能为空');
        }
      });
    });

    const errors = issues.filter((item) => item.severity === 'error');
    const warnings = issues.filter((item) => item.severity === 'warning');
    return { valid: errors.length === 0, errors, warnings, issues, value };
  }

  function isV2(pack) {
    return Number(pack?.schemaVersion) === SCHEMA_VERSION;
  }

  return deepFreeze({
    SCHEMA_VERSION,
    V2_SCHEMA,
    QUALITY_THRESHOLDS,
    THRESHOLDS: QUALITY_THRESHOLDS,
    normalizeLessonMetadata,
    normalizeSourceTier,
    normalizeSource,
    normalizeExercise,
    normalizeTaskBinding,
    normalizeGeneration,
    normalizeEvaluation,
    normalizePack,
    validatePack,
    isV2,
  });
});
