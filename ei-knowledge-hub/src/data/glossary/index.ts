export type { GlossaryEntry } from './types'
export { glossarySearchText } from './types'
export { glossary } from './entries'

import { glossary } from './entries'

/** 术语锚点 id（空格 → 连字符，供 hash 跳转） */
export function glossaryAnchorId(term: string): string {
  return term.trim().replace(/\s+/g, '-')
}

export function glossaryHref(term: string): string {
  return `/glossary/${encodeURIComponent(term)}`
}

export function scrollToGlossaryHash(hash: string): boolean {
  const raw = hash.replace(/^#/, '')
  if (!raw) return false

  const id = decodeURIComponent(raw)
  const el =
    document.getElementById(id) ??
    document.getElementById(glossaryAnchorId(id))
  if (!el) return false

  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  return true
}

export function findGlossary(term: string) {
  const lower = term.toLowerCase()
  return glossary.find(
    (g) =>
      g.term.toLowerCase() === lower ||
      g.aliases?.some((a) => a.toLowerCase() === lower),
  )
}

export const glossaryMap = new Map(
  glossary.flatMap((g) => [
    [g.term.toLowerCase(), g],
    ...(g.aliases?.map((a) => [a.toLowerCase(), g] as const) ?? []),
  ]),
)
