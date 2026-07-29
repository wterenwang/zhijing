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

function toGlossaryVisual(
  visual: {
    kind?: string
    title?: string
    steps?: string[]
    nodes?: Array<{
      label?: string
      detail?: string
      actor?: string
      badge?: string
      group?: string
      parent?: string
    }>
    caption?: string
    quote?: string
    facts?: Array<{ label?: string; value?: string }>
    columns?: string[]
  } | undefined,
): GlossaryEntry['visual'] {
  if (!visual || typeof visual !== 'object') return undefined
  const kindRaw = String(visual.kind || '').trim().toLowerCase()
  const kind = (
    [
      'flow',
      'loop',
      'anatomy',
      'roles',
      'scenario',
      'compare',
      'states',
      'layers',
      'tree',
      'timeline',
      'matrix',
    ] as const
  ).includes(kindRaw as 'flow')
    ? (kindRaw as NonNullable<GlossaryEntry['visual']>['kind'])
    : undefined
  const nodes = Array.isArray(visual.nodes)
    ? visual.nodes
        .map((n) => ({
          label: String(n.label || '').trim(),
          detail: String(n.detail || '').trim() || undefined,
          actor: String(n.actor || '').trim() || undefined,
          badge: String(n.badge || '').trim() || undefined,
          group: String(n.group || '').trim() || undefined,
          parent: String(n.parent || '').trim() || undefined,
        }))
        .filter((n) => n.label)
        .slice(0, 8)
    : []
  const steps = Array.isArray(visual.steps)
    ? visual.steps.map(String).map((s) => s.trim()).filter(Boolean).slice(0, 8)
    : []
  const facts = Array.isArray(visual.facts)
    ? visual.facts
        .map((f) => ({
          label: String(f.label || '').trim(),
          value: String(f.value || '').trim(),
        }))
        .filter((f) => f.label && f.value)
        .slice(0, 4)
    : []
  const columns = Array.isArray(visual.columns)
    ? visual.columns.map(String).map((item) => item.trim()).filter(Boolean).slice(0, 4)
    : []
  if (!nodes.length && steps.length < 2 && !facts.length && !visual.quote && !visual.caption) {
    return undefined
  }
  return {
    kind: kind || (facts.length || visual.quote ? 'scenario' : 'flow'),
    title: String(visual.title || '一眼看懂').trim(),
    nodes: nodes.length ? nodes : undefined,
    steps: steps.length >= 2 ? steps : undefined,
    caption: String(visual.caption || '').trim() || undefined,
    quote: String(visual.quote || '').trim() || undefined,
    facts: facts.length ? facts : undefined,
    columns: columns.length ? columns : undefined,
  }
}

function toGlossaryEntries(
  raw: Array<{
    term?: string
    definition?: string
    def?: string
    module?: string
    aliases?: string[]
    userPhrases?: string[]
    example?: string
    visual?: {
      kind?: string
      title?: string
      steps?: string[]
      nodes?: Array<{
        label?: string
        detail?: string
        actor?: string
        badge?: string
        group?: string
        parent?: string
      }>
      caption?: string
      quote?: string
      facts?: Array<{ label?: string; value?: string }>
      columns?: string[]
    }
    confusions?: Array<{ term?: string; distinction?: string }>
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
      userPhrases: Array.isArray(g.userPhrases)
        ? g.userPhrases.map(String).map((item) => item.trim()).filter(Boolean).slice(0, 3)
        : undefined,
      definition,
      module: g.module || '核心',
      example: String(g.example || '').trim() || undefined,
      visual: toGlossaryVisual(g.visual),
      confusions: Array.isArray(g.confusions)
        ? g.confusions
            .map((item) => ({
              term: String(item.term || '').trim(),
              distinction: String(item.distinction || '').trim(),
            }))
            .filter((item) => item.term && item.distinction)
            .slice(0, 3)
        : undefined,
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
