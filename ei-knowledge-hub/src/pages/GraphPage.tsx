import { useMemo, useState } from 'react'
import { KnowledgeGraph } from '../components/KnowledgeGraph'
import { useContent } from '../context/ContentContext'

function useEmbedMode() {
  const params = new URLSearchParams(window.location.search)
  return params.has('embed') || window.self !== window.top
}

function chipLabel(title: string, index: number) {
  const clean = title.replace(/（.*?）|\(.*?\)/g, '').trim()
  if (clean.length <= 10) return clean
  return `${index + 1}. ${clean.slice(0, 8)}…`
}

export function GraphPage() {
  const [filter, setFilter] = useState<string | null>(null)
  const isEmbed = useEmbedMode()
  const { navigation, graphNodes, graphLinks, missingHub, hubTitle } = useContent()

  const modules = useMemo(() => {
    const seen = new Set<string>()
    return navigation.filter((mod) => {
      if (!mod.id || seen.has(mod.id)) return false
      seen.add(mod.id)
      return true
    })
  }, [navigation])

  if (missingHub) {
    return (
      <div className="py-6">
        <h1 className="mb-2 text-2xl font-semibold text-slate-950">知识网络</h1>
        <p className="text-slate-600">
          「{hubTitle}」尚未生成专属日课，请先返回路径列表点「生成日课与核心术语」。
        </p>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <header className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">知识网络</h1>
        <p className="mt-1 text-sm text-slate-500">
          大球模块 · 中球章节 · 小球术语。术语按正文命中挂到章节；粉线为跨模块。
        </p>
      </header>

      <div className="flex items-center gap-3">
        <span className="shrink-0 text-xs font-medium text-slate-400">筛选</span>
        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-0.5">
          <button
            type="button"
            onClick={() => setFilter(null)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === null
                ? 'border-cyan-700 bg-cyan-700 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            全部
          </button>
          {modules.map((mod, index) => (
            <button
              key={mod.id}
              type="button"
              title={mod.title}
              onClick={() => setFilter(mod.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === mod.id
                  ? 'border-transparent text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
              style={
                filter === mod.id
                  ? { backgroundColor: mod.color, borderColor: mod.color }
                  : undefined
              }
            >
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: mod.color }}
                aria-hidden="true"
              />
              {chipLabel(mod.title, index)}
            </button>
          ))}
        </div>
      </div>

      <KnowledgeGraph
        filterModule={filter}
        height={isEmbed ? 520 : 600}
        nodes={graphNodes}
        links={graphLinks}
      />
    </div>
  )
}
