import type { NavModule } from '../data/navigation'
import type { GlossaryEntry } from '../data/glossary/types'
import {
  buildGraphFromNavigation,
  type GraphLinkDef,
  type GraphNodeDef,
} from '../data/knowledge-graph'

const PACK_PREFIX = 'learning-content-pack:'

export interface RuntimePackData {
  packId: string
  title: string
  industry?: string
  role?: string
  learningPath: string[]
  navigation: NavModule[]
  chapters: Record<string, string>
  glossary: GlossaryEntry[]
  graphNodes: GraphNodeDef[]
  graphLinks: GraphLinkDef[]
  missingHub: boolean
}

export function getPackIdFromUrl(): string | null {
  try {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('packId') || params.get('pack')
    return id && id !== 'embodied-ai-pm' ? id : null
  } catch {
    return null
  }
}

function toGlossaryEntries(
  raw: Array<{
    term?: string
    definition?: string
    def?: string
    module?: string
    aliases?: string[]
    sections?: Array<{ label?: string; content?: string }>
  }> | undefined,
): GlossaryEntry[] {
  if (!Array.isArray(raw)) return []
  const out: GlossaryEntry[] = []
  for (const g of raw) {
    const term = String(g.term || '').trim()
    const definition = String(g.definition || g.def || '').trim()
    if (!term || !definition) continue
    const sections = Array.isArray(g.sections)
      ? g.sections
          .map((s) => ({
            label: String(s.label || '').trim(),
            content: String(s.content || '').trim(),
          }))
          .filter((s) => s.label && s.content)
      : []
    out.push({
      term,
      aliases: Array.isArray(g.aliases) ? g.aliases.map(String).filter(Boolean) : undefined,
      definition,
      module: g.module || '核心',
      sections: sections.length
        ? sections
        : [{ label: '是什么', content: definition }],
    })
  }
  return out
}

export function loadRuntimePack(packId: string | null): RuntimePackData | null {
  if (!packId) return null
  try {
    const raw = localStorage.getItem(PACK_PREFIX + packId)
    if (!raw) {
      return {
        packId,
        title: '专属知识库',
        learningPath: [],
        navigation: [],
        chapters: {},
        glossary: [],
        graphNodes: [],
        graphLinks: [],
        missingHub: true,
      }
    }
    const pack = JSON.parse(raw)
    const hub = pack?.hub
    const glossary = toGlossaryEntries(pack?.glossary)
    const navigation: NavModule[] = Array.isArray(hub?.navigation) ? hub.navigation : []
    const chapters: Record<string, string> =
      hub?.chapters && typeof hub.chapters === 'object' ? hub.chapters : {}
    const missingHub = !navigation.length || !Object.keys(chapters).length
    const { nodes, links } = buildGraphFromNavigation(
      navigation,
      glossary.map((g) => g.term).slice(0, 12),
    )

    return {
      packId,
      title: String(hub?.title || pack?.meta?.title || '专属知识库'),
      industry: pack?.meta?.industry,
      role: pack?.meta?.role,
      learningPath: Array.isArray(hub?.learningPath)
        ? hub.learningPath.map(String)
        : navigation.map((m) => m.title),
      navigation,
      chapters,
      glossary,
      graphNodes: nodes,
      graphLinks: links,
      missingHub,
    }
  } catch (e) {
    console.warn('[runtime-pack] load failed', e)
    return {
      packId,
      title: '专属知识库',
      learningPath: [],
      navigation: [],
      chapters: {},
      glossary: [],
      graphNodes: [],
      graphLinks: [],
      missingHub: true,
    }
  }
}
