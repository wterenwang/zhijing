import type { GlossarySection } from './types'

/** AI / 工程类概念 */
export function aiSections(c: {
  principle: string
  solves: string
  practice: string
  pitfalls: string
  fixes: string
}): GlossarySection[] {
  return [
    { label: '什么原理', content: c.principle },
    { label: '解决什么问题', content: c.solves },
    { label: '如何落地', content: c.practice },
    { label: '常见问题', content: c.pitfalls },
    { label: '应对方法', content: c.fixes },
  ]
}

/** 传统 PM 方法论 */
export function pmSections(c: {
  meaning: string
  scenarios: string
  steps: string
  mistakes: string
  tips: string
}): GlossarySection[] {
  return [
    { label: '核心含义', content: c.meaning },
    { label: '适用场景', content: c.scenarios },
    { label: '实操步骤', content: c.steps },
    { label: '常见误区', content: c.mistakes },
    { label: '实践建议', content: c.tips },
  ]
}

/** 评估指标 */
export function metricSections(c: {
  meaning: string
  why: string
  measure: string
  traps: string
  improve: string
}): GlossarySection[] {
  return [
    { label: '指标含义', content: c.meaning },
    { label: '为什么重要', content: c.why },
    { label: '如何测量', content: c.measure },
    { label: '解读陷阱', content: c.traps },
    { label: '优化方向', content: c.improve },
  ]
}

/** 工具 / 框架 / 平台 */
export function toolSections(c: {
  what: string
  when: string
  how: string
  limits: string
  alternatives: string
}): GlossarySection[] {
  return [
    { label: '是什么', content: c.what },
    { label: '适合什么场景', content: c.when },
    { label: '怎么用', content: c.how },
    { label: '局限', content: c.limits },
    { label: '替代与组合', content: c.alternatives },
  ]
}

/** 角色 / 定位类 */
export function roleSections(c: {
  definition: string
  responsibility: string
  skills: string
  pitfalls: string
  growth: string
}): GlossarySection[] {
  return [
    { label: '角色定义', content: c.definition },
    { label: '职责边界', content: c.responsibility },
    { label: '核心能力', content: c.skills },
    { label: '常见误区', content: c.pitfalls },
    { label: '成长路径', content: c.growth },
  ]
}

/** 文档 / 规范类（PRD、EARS、ITTO 等） */
export function docSections(c: {
  purpose: string
  scenarios: string
  structure: string
  mistakes: string
  tips: string
}): GlossarySection[] {
  return [
    { label: '用途', content: c.purpose },
    { label: '什么时候写', content: c.scenarios },
    { label: '怎么写 / 结构', content: c.structure },
    { label: '常见写法问题', content: c.mistakes },
    { label: '写好它的小技巧', content: c.tips },
  ]
}

/** 风险 / 安全类 */
export function riskSections(c: {
  nature: string
  impact: string
  prevent: string
  signals: string
  response: string
}): GlossarySection[] {
  return [
    { label: '本质', content: c.nature },
    { label: '业务影响', content: c.impact },
    { label: '如何预防', content: c.prevent },
    { label: '如何发现', content: c.signals },
    { label: '出事怎么办', content: c.response },
  ]
}
