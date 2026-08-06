import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import { navigation as builtinNav, type NavModule } from '../data/navigation'
import { glossary as builtinGlossary } from '../data/glossary'
import type { GlossaryEntry } from '../data/glossary/types'
import { getContent as getBuiltinContent, getAllContentSlugs as getBuiltinSlugs } from '../lib/content'
import {
  graphLinks as builtinLinks,
  graphNodes as builtinNodes,
  type GraphLinkDef,
  type GraphNodeDef,
} from '../data/knowledge-graph'
import {
  getPackIdFromUrl,
  loadRuntimePack,
  type RuntimePackData,
} from '../lib/runtime-pack'

interface ContentApi {
  isRuntime: boolean
  missingHub: boolean
  packId: string | null
  hubTitle: string
  industry?: string
  role?: string
  learningPath: string[]
  navigation: NavModule[]
  glossary: GlossaryEntry[]
  graphNodes: GraphNodeDef[]
  graphLinks: GraphLinkDef[]
  getContent: (slug: string) => string | null
  getAllSlugs: () => string[]
  getNavItem: (slug: string) => { slug: string; title: string; days?: string } | undefined
  getModuleForSlug: (slug: string) => NavModule | undefined
}

const ContentContext = createContext<ContentApi | null>(null)

function buildApi(runtime: RuntimePackData | null): ContentApi {
  if (!runtime) {
    return {
      isRuntime: false,
      missingHub: false,
      packId: null,
      hubTitle: '知径 · 日课',
      learningPath: [
        '模块一：行业与市场全景',
        '模块二：产品与技术基础',
        '模块三：产品思维与竞品',
        '模块四：专项深化',
        '模块五：作品集项目',
        '模块六：场景落地',
        '模块七：面试与投递',
      ],
      navigation: builtinNav,
      glossary: builtinGlossary,
      graphNodes: builtinNodes,
      graphLinks: builtinLinks,
      getContent: getBuiltinContent,
      getAllSlugs: getBuiltinSlugs,
      getNavItem: (slug) => {
        for (const mod of builtinNav) {
          const item = mod.items.find((i) => i.slug === slug)
          if (item) return item
        }
        return undefined
      },
      getModuleForSlug: (slug) =>
        builtinNav.find((m) => m.items.some((i) => i.slug === slug)),
    }
  }

  if (runtime.missingHub) {
    return {
      isRuntime: true,
      missingHub: true,
      packId: runtime.packId,
      hubTitle: runtime.title || '专属日课',
      industry: runtime.industry,
      role: runtime.role,
      learningPath: [],
      navigation: [],
      glossary: runtime.glossary,
      graphNodes: [],
      graphLinks: [],
      getContent: () => null,
      getAllSlugs: () => [],
      getNavItem: () => undefined,
      getModuleForSlug: () => undefined,
    }
  }

  return {
    isRuntime: true,
    missingHub: false,
    packId: runtime.packId,
    hubTitle: runtime.title,
    industry: runtime.industry,
    role: runtime.role,
    learningPath: runtime.learningPath,
    navigation: runtime.navigation,
    // 禁止回退到具身智能内置词表——空则显示空状态，引导按岗位重新生成
    glossary: runtime.glossary,
    graphNodes: runtime.graphNodes,
    graphLinks: runtime.graphLinks,
    getContent: (slug) => runtime.chapters[slug] ?? null,
    getAllSlugs: () => Object.keys(runtime.chapters),
    getNavItem: (slug) => {
      for (const mod of runtime.navigation) {
        const item = mod.items.find((i) => i.slug === slug)
        if (item) return item
      }
      return undefined
    },
    getModuleForSlug: (slug) =>
      runtime.navigation.find((m) => m.items.some((i) => i.slug === slug)),
  }
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => {
    const packId = getPackIdFromUrl()
    const runtime = loadRuntimePack(packId)
    return buildApi(runtime)
  }, [])

  return (
    <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
  )
}

export function useContent(): ContentApi {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used within ContentProvider')
  return ctx
}
