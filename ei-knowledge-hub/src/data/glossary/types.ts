export interface GlossarySection {
  label: string
  content: string
}

/** 模型择一；旧包无 kind 时按 flow 降级 */
export type GlossaryVisualKind =
  | 'flow'
  | 'loop'
  | 'anatomy'
  | 'roles'
  | 'scenario'
  | 'compare'
  | 'states'
  | 'layers'
  | 'tree'
  | 'timeline'
  | 'matrix'

export interface GlossaryVisualNode {
  label: string
  detail?: string
  /** roles：User / 应用 / 模型 等 */
  actor?: string
  /** 节点短标签：事实 / 假设 / 状态名等 */
  badge?: string
  /** compare / matrix：把节点归入同一列或象限 */
  group?: string
  /** tree：父节点 label；缺省时挂在首个根节点下 */
  parent?: string
}

export interface GlossaryVisualFact {
  label: string
  value: string
}

export interface GlossaryVisual {
  kind?: GlossaryVisualKind
  title?: string
  /** 结构化节点（优先） */
  nodes?: GlossaryVisualNode[]
  /** 旧字段：纯字符串步骤，按 flow 降级 */
  steps?: string[]
  caption?: string
  quote?: string
  facts?: GlossaryVisualFact[]
  /** compare / matrix 的列标题；缺省时从 node.group 推断 */
  columns?: string[]
}

export interface GlossaryConfusion {
  term: string
  distinction: string
}

export interface GlossaryEntry {
  term: string
  aliases?: string[]
  /** 学习者在真实场景中可能说出的口语表达 */
  userPhrases?: string[]
  /** 一句话定义，用于搜索摘要与列表预览 */
  definition: string
  module?: string
  /** 可跟做的具体例子 */
  example?: string
  /** 一眼看懂：多模板可视化 */
  visual?: GlossaryVisual
  /** 与相近概念的结构化边界对比 */
  confusions?: GlossaryConfusion[]
  /** 按词条类型选用不同维度展开说明 */
  sections: GlossarySection[]
  /** 核心词、按日生成或用户自定义；旧包缺失时按核心词处理 */
  sourceType?: 'core' | 'day' | 'custom'
  /** 词条对应的日课 Day */
  sourceDays?: number[]
  createdAt?: string
}

export function glossarySearchText(entry: GlossaryEntry): string {
  const visualBits = [
    entry.visual?.title,
    entry.visual?.caption,
    entry.visual?.quote,
    ...(entry.visual?.steps ?? []),
    ...(entry.visual?.nodes ?? []).flatMap((n) => [
      n.label,
      n.detail,
      n.actor,
      n.badge,
      n.group,
      n.parent,
    ]),
    ...(entry.visual?.facts ?? []).flatMap((f) => [f.label, f.value]),
    ...(entry.visual?.columns ?? []),
  ].filter(Boolean)

  return [
    entry.term,
    ...(entry.aliases ?? []),
    ...(entry.userPhrases ?? []),
    entry.definition,
    entry.example,
    ...visualBits,
    ...(entry.confusions ?? []).flatMap((item) => [item.term, item.distinction]),
    ...entry.sections.flatMap((s) => [s.label, s.content]),
  ].join(' ')
}

export function defineEntry(
  term: string,
  fields: Omit<GlossaryEntry, 'term'>,
): GlossaryEntry {
  return { term, ...fields }
}
