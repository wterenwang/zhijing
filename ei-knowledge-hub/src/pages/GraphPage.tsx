import { useState } from 'react'
import { KnowledgeGraph } from '../components/KnowledgeGraph'
import { useContent } from '../context/ContentContext'

function useEmbedMode() {
  const params = new URLSearchParams(window.location.search)
  return params.has('embed') || window.self !== window.top
}

export function GraphPage() {
  const [filter, setFilter] = useState<string | null>(null)
  const isEmbed = useEmbedMode()
  const { navigation, graphNodes, graphLinks, missingHub, hubTitle } = useContent()

  if (missingHub) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">知识网络</h1>
        <p className="text-slate-600">「{hubTitle}」尚未生成专属知识库，请先在项目列表补全知识库。</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-none -mx-6 md:-mx-10 px-4 md:px-6">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">知识网络</h1>
          <p className="text-sm text-slate-500 mt-1">
            章节、概念、模块之间的关联。大球=模块，中球=章节，小球=核心概念。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter(null)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filter === null
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            全部
          </button>
          {navigation.map((mod) => (
            <button
              key={mod.id}
              type="button"
              onClick={() => setFilter(mod.id)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filter === mod.id
                  ? 'text-white border-transparent'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
              style={
                filter === mod.id
                  ? { backgroundColor: mod.color, borderColor: mod.color }
                  : undefined
              }
            >
              {mod.title}
            </button>
          ))}
        </div>
      </div>

      <KnowledgeGraph
        filterModule={filter}
        height={isEmbed ? 520 : 560}
        nodes={graphNodes}
        links={graphLinks}
      />
    </div>
  )
}
