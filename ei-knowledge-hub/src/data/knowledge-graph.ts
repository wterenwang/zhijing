import type { NavModule } from './navigation'
import { navigation } from './navigation'
import { glossary as builtinGlossary, glossaryHref } from './glossary'
import type { GlossaryEntry } from './glossary/types'

export type GraphNodeType = 'module' | 'chapter' | 'concept'

export interface GraphNodeDef {
  id: string
  label: string
  type: GraphNodeType
  moduleId?: string
  href: string
  size: number
  color: string
}

export interface GraphLinkDef {
  source: string
  target: string
  relation: '归属' | '顺序' | '引用' | '支撑' | '工作流' | '跨模块'
}

export interface BuildGraphOptions {
  glossary?: GlossaryEntry[]
  /** 章节正文，用于把术语挂到真正提到它的章节 */
  chapters?: Record<string, string>
  /** 图谱上最多展示多少个术语节点 */
  maxConcepts?: number
  /** 旧版硬编码引用边（仅内置包兼容） */
  extraRefs?: Array<{ chapter: string; concept: string }>
}

const MODULE_COLORS: Record<string, string> = {
  'module-1': '#0891b2',
  'module-2': '#7c3aed',
  'module-3': '#0d9488',
  'module-4': '#ea580c',
  'module-5': '#2563eb',
  'module-6': '#db2777',
  'module-7': '#16a34a',
}

const CONCEPT_COLOR = '#d97706'
const FALLBACK_COLORS = Object.values(MODULE_COLORS)

function chapterId(slug: string) {
  return slug.replace(/\//g, '--')
}

function conceptId(term: string) {
  return `concept-${term.replace(/\s+/g, '-').slice(0, 32)}`
}

function shortLabel(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

function normalize(text: string) {
  return text.toLowerCase()
}

function moduleMatches(entryModule: string | undefined, mod: NavModule) {
  if (!entryModule) return false
  const a = normalize(entryModule)
  const b = normalize(mod.title)
  const c = normalize(mod.id)
  return a === b || a === c || b.includes(a) || a.includes(b.slice(0, 6))
}

function contentMentions(content: string, entry: GlossaryEntry) {
  const hay = content.toLowerCase()
  const keys = [entry.term, ...(entry.aliases || [])]
    .map((k) => k.trim())
    .filter((k) => k.length >= 2)
  return keys.some((key) => hay.includes(key.toLowerCase()))
}

function pickConcepts(
  glossary: GlossaryEntry[],
  nav: NavModule[],
  chapters: Record<string, string>,
  maxConcepts: number,
): Array<{ entry: GlossaryEntry; hits: string[]; score: number }> {
  const scored = glossary.map((entry) => {
    const hits: string[] = []
    for (const mod of nav) {
      for (const item of mod.items) {
        const body = chapters[item.slug]
        if (body && contentMentions(body, entry)) hits.push(item.slug)
      }
    }
    const moduleBonus = nav.some((mod) => moduleMatches(entry.module, mod)) ? 2 : 0
    return {
      entry,
      hits,
      score: hits.length * 3 + moduleBonus + (entry.confusions?.length || 0),
    }
  })

  scored.sort((a, b) => b.score - a.score || a.entry.term.localeCompare(b.entry.term, 'zh'))

  const withHits = scored.filter((item) => item.hits.length > 0 || item.score > 0)
  const pool = withHits.length ? withHits : scored
  return pool.slice(0, maxConcepts)
}

/** 从导航 + 术语库 + 章节正文构建图谱 */
export function buildGraphFromNavigation(
  nav: NavModule[],
  conceptTermsOrOptions: string[] | BuildGraphOptions = [],
  legacyExtraRefs: Array<{ chapter: string; concept: string }> = [],
): { nodes: GraphNodeDef[]; links: GraphLinkDef[] } {
  const options: BuildGraphOptions = Array.isArray(conceptTermsOrOptions)
    ? {
        glossary: conceptTermsOrOptions.map((term) => ({
          term,
          definition: term,
          sections: [{ label: '是什么', content: term }],
        })),
        extraRefs: legacyExtraRefs,
        maxConcepts: 10,
      }
    : {
        maxConcepts: 10,
        ...conceptTermsOrOptions,
        extraRefs: conceptTermsOrOptions.extraRefs || legacyExtraRefs,
      }

  const glossary = options.glossary || []
  const chapters = options.chapters || {}
  const maxConcepts = options.maxConcepts ?? 10
  const nodes: GraphNodeDef[] = []
  const links: GraphLinkDef[] = []
  const nodeIds = new Set<string>()

  const addNode = (node: GraphNodeDef) => {
    if (nodeIds.has(node.id)) return
    nodeIds.add(node.id)
    nodes.push(node)
  }

  const addLink = (source: string, target: string, relation: GraphLinkDef['relation']) => {
    if (!nodeIds.has(source) || !nodeIds.has(target)) return
    if (source === target) return
    if (links.some((l) => l.source === source && l.target === target && l.relation === relation)) {
      return
    }
    links.push({ source, target, relation })
  }

  for (let mi = 0; mi < nav.length; mi++) {
    const mod = nav[mi]
    const color = mod.color || MODULE_COLORS[mod.id] || FALLBACK_COLORS[mi % FALLBACK_COLORS.length]
    const first = mod.items[0]
    addNode({
      id: mod.id,
      label: shortLabel(mod.title, 12),
      type: 'module',
      moduleId: mod.id,
      href: first ? `/doc/${first.slug}` : '/',
      size: 26,
      color,
    })

    for (const item of mod.items) {
      addNode({
        id: chapterId(item.slug),
        label: shortLabel(item.title, 14),
        type: 'chapter',
        moduleId: mod.id,
        href: `/doc/${item.slug}`,
        size: 13,
        color,
      })
      addLink(mod.id, chapterId(item.slug), '归属')
    }

    for (let i = 0; i < mod.items.length - 1; i++) {
      addLink(
        chapterId(mod.items[i].slug),
        chapterId(mod.items[i + 1].slug),
        '顺序',
      )
    }

    // 相邻模块串起来，避免「各论各的孤岛」
    if (mi < nav.length - 1) {
      addLink(mod.id, nav[mi + 1].id, '跨模块')
      const last = mod.items[mod.items.length - 1]
      const nextFirst = nav[mi + 1].items[0]
      if (last && nextFirst) {
        addLink(chapterId(last.slug), chapterId(nextFirst.slug), '工作流')
      }
    }
  }

  const picked = pickConcepts(glossary, nav, chapters, maxConcepts)

  for (const { entry, hits } of picked) {
    const id = conceptId(entry.term)
    addNode({
      id,
      label: shortLabel(entry.term, 12),
      type: 'concept',
      moduleId: nav.find((mod) => moduleMatches(entry.module, mod))?.id,
      href: glossaryHref(entry.term),
      size: 9,
      color: CONCEPT_COLOR,
    })

    // 挂到真正提到该术语的章节（最多 2 条，避免蜘蛛网）
    for (const slug of hits.slice(0, 2)) {
      addLink(chapterId(slug), id, '引用')
    }

    // 术语所属模块
    const home = nav.find((mod) => moduleMatches(entry.module, mod))
    if (home) {
      addLink(home.id, id, '支撑')
      if (!hits.length && home.items[0]) {
        addLink(chapterId(home.items[0].slug), id, '引用')
      }
    } else if (!hits.length && nav[0]?.items[0]) {
      // 兜底：至少挂到第一个模块的首章，避免飘在空中
      addLink(chapterId(nav[0].items[0].slug), id, '引用')
    }
  }

  // 易混术语互连
  for (const { entry } of picked) {
    const from = conceptId(entry.term)
    for (const confusion of entry.confusions || []) {
      const to = conceptId(confusion.term)
      if (!nodeIds.has(to)) continue
      addLink(from, to, '跨模块')
    }
  }

  // 兼容旧内置硬编码边
  for (const r of options.extraRefs || []) {
    addLink(chapterId(r.chapter), r.concept, '引用')
  }

  return { nodes, links }
}

const builtin = buildGraphFromNavigation(navigation, {
  glossary: builtinGlossary,
  maxConcepts: 10,
  extraRefs: [
    { chapter: 'module-2/04-vla-intro', concept: 'concept-VLA' },
    { chapter: 'module-2/04-vla-intro', concept: 'concept-RT-2' },
    { chapter: 'module-2/04-vla-intro', concept: 'concept-OpenVLA' },
    { chapter: 'module-2/05-rl-intro', concept: 'concept-强化学习' },
    { chapter: 'module-4/03-vla-case', concept: 'concept-VLA' },
    { chapter: 'module-4/04-world-model', concept: 'concept-世界模型' },
    { chapter: 'module-4/05-diffusion-policy', concept: 'concept-Diffusion-Policy' },
    { chapter: 'module-3/03-data-flywheel', concept: 'concept-数据飞轮' },
    { chapter: 'module-1/01-definition', concept: 'concept-具身智能' },
    { chapter: 'module-5/03-prd-writing', concept: 'concept-PRD' },
  ],
})

export const graphNodes = builtin.nodes
export const graphLinks = builtin.links

export const relationColors: Record<GraphLinkDef['relation'], string> = {
  归属: '#94a3b8',
  顺序: '#cbd5e1',
  引用: '#d97706',
  支撑: '#8b5cf6',
  工作流: '#0d9488',
  跨模块: '#db2777',
}

export function getNodeById(
  id: string,
  nodes: GraphNodeDef[] = graphNodes,
): GraphNodeDef | undefined {
  return nodes.find((n) => n.id === id)
}
