import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { glossaryAnchorId, scrollToGlossaryHash } from '../data/glossary'
import { useContent } from '../context/ContentContext'

const MODULE_ORDER = ['行业', '技术', '硬件', '产品', '公司', '学术', '面试', '核心'] as const

export function GlossaryPage() {
  const location = useLocation()
  const { glossary, isRuntime, hubTitle, industry, role } = useContent()
  const [filter, setFilter] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const modules = useMemo(() => {
    const set = new Set(
      glossary.map((g) => g.module).filter((m): m is string => !!m),
    )
    const ordered = MODULE_ORDER.filter((m) => set.has(m))
    const rest = [...set].filter(
      (m) => !(MODULE_ORDER as readonly string[]).includes(m as (typeof MODULE_ORDER)[number]),
    )
    return [...ordered, ...rest]
  }, [glossary])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return glossary.filter((entry) => {
      if (filter && entry.module !== filter) return false
      if (!q) return true
      const blob = [
        entry.term,
        ...(entry.aliases ?? []),
        entry.definition,
        ...entry.sections.flatMap((s) => [s.label, s.content]),
      ]
        .join(' ')
        .toLowerCase()
      return blob.includes(q)
    })
  }, [filter, query, glossary])

  useEffect(() => {
    if (!location.hash) return

    const scroll = () => scrollToGlossaryHash(location.hash)
    if (scroll()) return

    const raf = requestAnimationFrame(() => {
      if (scroll()) return
      window.setTimeout(scroll, 100)
    })
    return () => cancelAnimationFrame(raf)
  }, [location.pathname, location.hash, filtered])

  if (isRuntime && glossary.length === 0) {
    const audience = [industry, role].filter(Boolean).join(' · ')
    return (
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">术语库</h1>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-slate-700 space-y-2 max-w-xl">
          <p className="font-medium text-slate-900">还没有本路径的专属术语</p>
          <p>
            {audience
              ? `当前路径是「${audience}」，不会再套用具身智能词表。`
              : '本路径尚未生成专属术语。'}
          </p>
          <p>
            请返回路径列表，点卡片上的 <strong>生成阅读内容</strong>
            （会按你的行业/岗位重新生成术语库）。需先开启智能功能。
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">术语库</h1>
      <p className="text-slate-600 mb-6 leading-relaxed">
        {isRuntime
          ? `「${hubTitle}」共 ${glossary.length} 个词条${industry || role ? `（${[industry, role].filter(Boolean).join(' · ')}）` : ''}，按本路径生成。`
          : `共 ${glossary.length} 个词条。适合预习、复习和面试前速查。`}
      </p>

      <div className="mb-6 flex flex-col gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索术语、别名或释义…"
          className="w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/30 focus:border-cyan-600"
        />
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
            全部 ({glossary.length})
          </button>
          {modules.map((mod) => {
            const count = glossary.filter((g) => g.module === mod).length
            return (
              <button
                key={mod}
                type="button"
                onClick={() => setFilter(mod)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  filter === mod
                    ? 'bg-cyan-700 text-white border-cyan-700'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {mod} ({count})
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-8">
        {filtered.length === 0 && (
          <p className="text-sm text-slate-500 py-8 text-center">没有匹配的术语，试试其他关键词。</p>
        )}
        {filtered.map((entry) => (
          <section
            key={entry.term}
            id={glossaryAnchorId(entry.term)}
            className="scroll-mt-24 p-5 rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex flex-wrap items-baseline gap-2 mb-3">
              <h2 className="text-xl font-semibold text-slate-900">{entry.term}</h2>
              {entry.module && (
                <span className="text-xs font-medium text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded ml-auto">
                  {entry.module}
                </span>
              )}
            </div>
            <p className="text-slate-800 leading-relaxed mb-5 pb-4 border-b border-slate-100 font-medium">
              {entry.definition}
            </p>
            <dl className="space-y-4">
              {entry.sections.map(({ label, content }) => (
                <div key={label}>
                  <dt className="text-sm font-semibold text-slate-900 mb-1">{label}</dt>
                  <dd className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {content}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  )
}
