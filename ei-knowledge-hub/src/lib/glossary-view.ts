import type { GlossaryEntry, GlossaryVisualKind } from '../data/glossary/types'

const CONFUSION_LABEL = /区别|易混|别这样叫|避用/i
const JUDGMENT_LABEL = /判断|取舍|边界|场景|什么时候/i

export const VISUAL_KIND_LABEL: Record<GlossaryVisualKind, string> = {
  flow: '流程',
  loop: '闭环',
  anatomy: '组成',
  roles: '协作',
  scenario: '场景',
  compare: '对比',
  states: '状态',
  layers: '分层',
  tree: '层级',
  timeline: '演进',
  matrix: '矩阵',
}

export function confusionItems(entry: GlossaryEntry) {
  if (entry.confusions?.length) return entry.confusions.slice(0, 3)

  const items: Array<{ term: string; distinction: string }> = []
  const relevantSections = entry.sections
    .filter((item) => CONFUSION_LABEL.test(item.label))
    .sort((a, b) => Number(/别这样叫|避用/i.test(a.label)) - Number(/别这样叫|避用/i.test(b.label)))
  for (const section of relevantSections) {
    const lines = section.content
      .split('\n')
      .map((line) => line.replace(/^[·•\-]\s*/, '').trim())
      .filter(Boolean)
    for (const line of lines) {
      const match = line.match(/^([^：:]{1,20})[：:]\s*(.+)$/)
      const inlineContrast = line.match(/^([^≠：:]{1,24}?)\s*(?:≠|不是|只(?:做|负责|表示))/)
      items.push(
        match
          ? { term: match[1].trim(), distinction: match[2].trim() }
          : inlineContrast
            ? { term: inlineContrast[1].trim(), distinction: line }
            : {
                term: /别这样叫|避用/i.test(section.label) ? '常见误叫' : '相近概念',
                distinction: line,
              },
      )
      if (items.length >= 3) return items
    }
  }
  return items
}

export function userPhrase(entry: GlossaryEntry) {
  if (entry.userPhrases?.[0]) return entry.userPhrases[0]
  const comparison = confusionItems(entry)[0]
  if (comparison?.term && comparison.term !== '相近概念' && comparison.term !== '常见误叫') {
    return `大家都在说「${entry.term}」，它和「${comparison.term}」到底有什么区别？`
  }
  if (entry.sections.some((section) => JUDGMENT_LABEL.test(section.label))) {
    return `这个场景该不该用「${entry.term}」，我应该看哪些判断条件？`
  }
  return `「${entry.term}」到底解决什么问题，做到什么算用对了？`
}

export function exampleText(entry: GlossaryEntry) {
  if (entry.example?.trim()) return entry.example.trim()
  const labeled = entry.sections.find((section) => /例子|案例|场景|完整/.test(section.label))
  return labeled?.content?.trim() || ''
}

export function detailSections(entry: GlossaryEntry) {
  const comparisons = confusionItems(entry)
  return comparisons.length
    ? entry.sections.filter((section) => !CONFUSION_LABEL.test(section.label))
    : entry.sections
}

