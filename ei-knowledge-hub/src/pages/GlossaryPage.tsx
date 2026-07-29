import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { glossarySearchText } from '../data/glossary'
import { useContent } from '../context/ContentContext'
import { confusionItems, userPhrase, VISUAL_KIND_LABEL } from '../lib/glossary-view'

const MODULE_ORDER = ['行业', '技术', '硬件', '产品', '公司', '学术', '面试', '核心'] as const

export function GlossaryPage() {
  const location = useLocation()
  const navigate = useNavigate()
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
      return glossarySearchText(entry).toLowerCase().includes(q)
    })
  }, [filter, query, glossary])

  useEffect(() => {
    if (!location.hash) return
    const term = decodeURIComponent(location.hash.replace(/^#/, ''))
    const entry = glossary.find(
      (item) =>
        item.term.toLowerCase() === term.toLowerCase() ||
        item.aliases?.some((alias) => alias.toLowerCase() === term.toLowerCase()),
    )
    if (entry) navigate(`/glossary/${encodeURIComponent(entry.term)}`, { replace: true })
  }, [glossary, location.hash, navigate])

  if (isRuntime && glossary.length === 0) {
    const audience = [industry, role].filter(Boolean).join(' · ')
    return (
      <div className="mx-auto max-w-5xl py-8">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950">术语库</h1>
        <div className="mt-8 max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-slate-700 space-y-2">
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
    <div className="mx-auto max-w-6xl py-3">
      <header className="border-b border-slate-200 pb-8">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-cyan-700">知识图鉴</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-5xl">
            把岗位黑话讲清楚
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            {isRuntime
              ? `「${hubTitle}」收录 ${glossary.length} 个核心词条。先用大白话定位困惑，再进入独立详情页看示意图、完整例子和易混边界。`
              : `共 ${glossary.length} 个词条。适合预习、复习和面试前速查。`}
          </p>
        </div>
      </header>

      <div className="sticky top-[57px] z-[5] -mx-3 border-b border-slate-200 bg-[#f8fafc]/95 px-3 py-4 backdrop-blur">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative block min-w-0 flex-1">
            <span className="sr-only">搜索术语</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索术语、口语问题或易混词"
              className="w-full rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15"
            />
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1 lg:max-w-[62%]">
            <button
              type="button"
              onClick={() => setFilter(null)}
              className={`shrink-0 rounded-full border px-3 py-2 text-xs font-medium transition ${
                filter === null
                  ? 'border-slate-950 bg-slate-950 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              全部 {glossary.length}
            </button>
            {modules.map((mod) => {
              const count = glossary.filter((entry) => entry.module === mod).length
              return (
                <button
                  key={mod}
                  type="button"
                  onClick={() => setFilter(mod)}
                  className={`shrink-0 rounded-full border px-3 py-2 text-xs font-medium transition ${
                    filter === mod
                      ? 'border-cyan-700 bg-cyan-700 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {mod} {count}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="pt-7">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <p className="text-sm font-medium text-slate-700">没有匹配的术语</p>
            <p className="mt-1 text-sm text-slate-500">试试任务描述、用户会说的话或相近概念。</p>
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((entry) => {
            const comparisons = confusionItems(entry)
            const kind = entry.visual?.kind || 'flow'
            return (
              <Link
                key={entry.term}
                to={`/glossary/${encodeURIComponent(entry.term)}`}
                className="group flex min-h-64 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition duration-200 hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-[0_12px_32px_rgba(8,145,178,0.08)] sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-slate-950 group-hover:text-cyan-800">
                      {entry.term}
                    </h2>
                    {entry.aliases?.length ? (
                      <p className="mt-1 line-clamp-1 text-sm text-slate-400">
                        {entry.aliases.join(' / ')}
                      </p>
                    ) : null}
                  </div>
                  <span className="shrink-0 rounded-full border border-cyan-100 bg-cyan-50 px-2.5 py-1 text-[11px] font-medium text-cyan-800">
                    {VISUAL_KIND_LABEL[kind]}
                  </span>
                </div>

                <blockquote className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/65 px-4 py-3 text-sm leading-relaxed text-slate-700">
                  “{userPhrase(entry)}”
                </blockquote>

                <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-600">
                  {entry.definition}
                </p>

                <div className="mt-auto flex items-end justify-between gap-4 pt-5">
                  <div className="flex flex-wrap gap-1.5">
                    {entry.module ? (
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-600">
                        {entry.module}
                      </span>
                    ) : null}
                    {comparisons[0] ? (
                      <span className="rounded-md bg-rose-50 px-2 py-1 text-[11px] text-rose-700">
                        对比 {comparisons[0].term}
                      </span>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-sm font-medium text-cyan-700 transition group-hover:translate-x-0.5">
                    打开图鉴 →
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
