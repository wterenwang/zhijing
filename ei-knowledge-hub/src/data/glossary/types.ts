export interface GlossarySection {
  label: string
  content: string
}

export interface GlossaryEntry {
  term: string
  aliases?: string[]
  /** 一句话定义，用于搜索摘要与列表预览 */
  definition: string
  module?: string
  /** 按词条类型选用不同维度展开说明 */
  sections: GlossarySection[]
}

export function glossarySearchText(entry: GlossaryEntry): string {
  return [
    entry.term,
    ...(entry.aliases ?? []),
    entry.definition,
    ...entry.sections.flatMap((s) => [s.label, s.content]),
  ].join(' ')
}

export function defineEntry(
  term: string,
  fields: Omit<GlossaryEntry, 'term'>,
): GlossaryEntry {
  return { term, ...fields }
}
