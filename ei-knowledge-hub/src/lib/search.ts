import { getContent, getAllContentSlugs } from './content'
import { navigation, getModuleForSlug } from '../data/navigation'
import { glossary, glossarySearchText } from '../data/glossary'
import type { GlossaryEntry } from '../data/glossary/types'
import type { NavModule } from '../data/navigation'

export interface SearchResult {
  id: string
  slug: string
  title: string
  moduleTitle: string
  snippet: string
  score: number
  type: 'doc' | 'glossary'
}

export interface SearchSources {
  navigation: NavModule[]
  getContent: (slug: string) => string | null
  getAllSlugs: () => string[]
  getModuleForSlug: (slug: string) => NavModule | undefined
  glossary: GlossaryEntry[]
}

function stripMarkdown(text: string): string {
  return text
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractSnippet(text: string, query: string, radius = 48): string {
  const lower = text.toLowerCase()
  const q = query.toLowerCase()
  const idx = lower.indexOf(q)
  if (idx === -1) return text.slice(0, radius * 2) + (text.length > radius * 2 ? '…' : '')

  const start = Math.max(0, idx - radius)
  const end = Math.min(text.length, idx + query.length + radius)
  const prefix = start > 0 ? '…' : ''
  const suffix = end < text.length ? '…' : ''
  return prefix + text.slice(start, end) + suffix
}

function countOccurrences(text: string, query: string): number {
  const lower = text.toLowerCase()
  const q = query.toLowerCase()
  let count = 0
  let pos = 0
  while ((pos = lower.indexOf(q, pos)) !== -1) {
    count++
    pos += q.length
  }
  return count
}

function scoreText(text: string, query: string, titleWeight: number): number {
  const lower = text.toLowerCase()
  const q = query.toLowerCase()
  if (!lower.includes(q)) return 0

  let score = titleWeight
  if (lower === q) score += titleWeight * 2
  else if (lower.startsWith(q)) score += titleWeight * 0.5

  score += Math.min(countOccurrences(text, query) * 4, 20)
  return score
}

function buildIndex(sources: SearchSources): Array<SearchResult & { _plain?: string }> {
  const items: Array<SearchResult & { _plain?: string }> = []
  const { navigation: nav, getContent: gc, getAllSlugs, getModuleForSlug: gms, glossary: gloss } =
    sources

  for (const slug of getAllSlugs()) {
    const raw = gc(slug)
    if (!raw) continue

    const navItem = nav
      .flatMap((m) => m.items.map((i) => ({ ...i, moduleTitle: m.title })))
      .find((i) => i.slug === slug)

    const title =
      raw.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? navItem?.title ?? slug
    const plain = stripMarkdown(raw)
    const mod = gms(slug)

    items.push({
      id: `doc:${slug}`,
      slug,
      title,
      moduleTitle: mod?.title ?? navItem?.moduleTitle ?? '',
      snippet: plain.slice(0, 120),
      score: 0,
      type: 'doc',
      _plain: plain,
    })
  }

  for (const entry of gloss) {
    const text = glossarySearchText(entry)
    items.push({
      id: `glossary:${entry.term}`,
      slug: `glossary#${entry.term}`,
      title: entry.term,
      moduleTitle: entry.module ?? '术语表',
      snippet: entry.definition,
      score: 0,
      type: 'glossary',
      _plain: text,
    })
  }

  return items
}

const defaultSources: SearchSources = {
  navigation,
  getContent,
  getAllSlugs: getAllContentSlugs,
  getModuleForSlug,
  glossary,
}

export function search(
  query: string,
  limit = 12,
  sources: SearchSources = defaultSources,
): SearchResult[] {
  const q = query.trim()
  if (!q) return []

  const index = buildIndex(sources)

  return index
    .map((item) => {
      const plain = item._plain ?? item.snippet
      const titleScore = scoreText(item.title, q, 50)
      const bodyScore = scoreText(plain, q, 10)
      const total = titleScore + bodyScore
      if (total === 0) return null

      return {
        id: item.id,
        slug: item.slug,
        title: item.title,
        moduleTitle: item.moduleTitle,
        type: item.type,
        score: total,
        snippet:
          bodyScore > 0 && plain.toLowerCase().includes(q.toLowerCase())
            ? extractSnippet(plain, q)
            : item.snippet,
      }
    })
    .filter((r): r is SearchResult => r !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

export function highlightSnippet(snippet: string, query: string): string {
  if (!query.trim()) return snippet
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return snippet.replace(new RegExp(`(${escaped})`, 'gi'), '<<mark>>$1<</mark>>')
}
