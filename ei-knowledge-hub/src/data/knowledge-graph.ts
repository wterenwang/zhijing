import type { NavModule } from './navigation'
import { navigation } from './navigation'
import { glossaryHref } from './glossary'

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

const MODULE_COLORS: Record<string, string> = {
  'module-1': '#0891b2',
  'module-2': '#7c3aed',
  'module-3': '#0d9488',
  'module-4': '#ea580c',
  'module-5': '#2563eb',
  'module-6': '#db2777',
  'module-7': '#16a34a',
}

const CONCEPT_COLOR = '#f59e0b'
const FALLBACK_COLORS = Object.values(MODULE_COLORS)

function chapterId(slug: string) {
  return slug.replace(/\//g, '--')
}

function conceptId(term: string) {
  return `concept-${term.replace(/\s+/g, '-').slice(0, 24)}`
}

/** 从任意导航构建图谱（默认包与 runtime 包共用） */
export function buildGraphFromNavigation(
  nav: NavModule[],
  conceptTerms: string[] = [],
  extraRefs: Array<{ chapter: string; concept: string }> = [],
): { nodes: GraphNodeDef[]; links: GraphLinkDef[] } {
  const nodes: GraphNodeDef[] = []
  const links: GraphLinkDef[] = []

  for (let mi = 0; mi < nav.length; mi++) {
    const mod = nav[mi]
    const color = mod.color || MODULE_COLORS[mod.id] || FALLBACK_COLORS[mi % FALLBACK_COLORS.length]
    const first = mod.items[0]
    nodes.push({
      id: mod.id,
      label: mod.title.length > 10 ? mod.title.slice(0, 8) + '…' : mod.title,
      type: 'module',
      moduleId: mod.id,
      href: first ? `/doc/${first.slug}` : '/',
      size: 22,
      color,
    })

    for (const item of mod.items) {
      nodes.push({
        id: chapterId(item.slug),
        label: item.title.length > 12 ? item.title.slice(0, 10) + '…' : item.title,
        type: 'chapter',
        moduleId: mod.id,
        href: `/doc/${item.slug}`,
        size: 12,
        color,
      })
      links.push({ source: mod.id, target: chapterId(item.slug), relation: '归属' })
    }
    for (let i = 0; i < mod.items.length - 1; i++) {
      links.push({
        source: chapterId(mod.items[i].slug),
        target: chapterId(mod.items[i + 1].slug),
        relation: '顺序',
      })
    }
  }

  const terms = conceptTerms.length
    ? conceptTerms
    : ['VLA', 'RT-2', 'OpenVLA', '强化学习', 'Diffusion Policy', '世界模型', '数据飞轮', 'PRD', '具身智能']

  for (const term of terms.slice(0, 12)) {
    const id = conceptId(term)
    if (nodes.some((n) => n.id === id)) continue
    nodes.push({
      id,
      label: term.length > 10 ? term.slice(0, 8) + '…' : term,
      type: 'concept',
      href: glossaryHref(term),
      size: 10,
      color: CONCEPT_COLOR,
    })
  }

  // 默认具身包专属引用边；runtime 则用首章挂第一个概念
  if (extraRefs.length) {
    for (const r of extraRefs) {
      if (!nodes.some((n) => n.id === chapterId(r.chapter))) continue
      if (!nodes.some((n) => n.id === r.concept)) continue
      links.push({ source: chapterId(r.chapter), target: r.concept, relation: '引用' })
    }
  } else if (nav !== navigation && nav[0]?.items?.[0] && terms[0]) {
    links.push({
      source: chapterId(nav[0].items[0].slug),
      target: conceptId(terms[0]),
      relation: '引用',
    })
  }

  return { nodes, links }
}

const BUILTIN_REFS: Array<{ chapter: string; concept: string }> = [
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
]

const builtin = buildGraphFromNavigation(navigation, [], BUILTIN_REFS)

export const graphNodes = builtin.nodes
export const graphLinks = builtin.links

export const relationColors: Record<GraphLinkDef['relation'], string> = {
  归属: '#94a3b8',
  顺序: '#cbd5e1',
  引用: '#f59e0b',
  支撑: '#8b5cf6',
  工作流: '#10b981',
  跨模块: '#ec4899',
}

export function getNodeById(
  id: string,
  nodes: GraphNodeDef[] = graphNodes,
): GraphNodeDef | undefined {
  return nodes.find((n) => n.id === id)
}
