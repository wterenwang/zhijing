import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { glossarySearchText } from '../data/glossary'
import { useContent } from '../context/ContentContext'
import { confusionItems, userPhrase, VISUAL_KIND_LABEL } from '../lib/glossary-view'
import { getPackIdFromUrl } from '../lib/runtime-pack'

const MODULE_ORDER = ['行业', '技术', '硬件', '产品', '公司', '学术', '面试', '核心'] as const

export function GlossaryPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { glossary, isRuntime, hubTitle, industry, role } = useContent()
  const [filter, setFilter] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [newTerm, setNewTerm] = useState('')
  const [addStatus, setAddStatus] = useState('')
  const [adding, setAdding] = useState(false)
  const packId = useMemo(() => getPackIdFromUrl(), [])
  const canAdd =
    isRuntime &&
    !!packId &&
    !['pm-30-intro', 'embodied-ai-pm'].includes(packId) &&
    window.parent !== window

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

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.source !== window.parent) return
      if (
        window.location.origin !== 'null' &&
        event.origin &&
        event.origin !== window.location.origin
      ) {
        return
      }
      const data = event.data
      if (!data || data.type !== 'zhijing:glossary:result') return
      setAdding(false)
      setAddStatus(data.ok ? '术语已生成，正在打开详情…' : String(data.error || '生成失败'))
    }
    window.addEventListener('message', receive)
    return () => window.removeEventListener('message', receive)
  }, [])

  const submitCustomTerm = () => {
    const term = newTerm.trim()
    if (term.length < 2 || term.length > 20) {
      setAddStatus('请输入 2–20 个字的术语名称')
      return
    }
    setAdding(true)
    setAddStatus('AI 正在生成定义、例子、易混边界和示意图…')
    window.parent.postMessage(
      { type: 'zhijing:glossary:add', packId, term },
      window.location.origin === 'null' ? '*' : window.location.origin,
    )
  }

  const addTermControl = canAdd ? (
    <div className="mt-5">
      {!addOpen ? (
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="rounded-full bg-cyan-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-800"
        >
          添加术语
        </button>
      ) : (
        <div className="max-w-xl rounded-2xl border border-cyan-200 bg-cyan-50/60 p-4">
          <label className="block text-sm font-medium text-slate-800" htmlFor="custom-term">
            想查什么术语？
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              id="custom-term"
              value={newTerm}
              onChange={(event) => setNewTerm(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !adding) submitCustomTerm()
              }}
              placeholder="例如：机会成本"
              disabled={adding}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15"
            />
            <button
              type="button"
              onClick={submitCustomTerm}
              disabled={adding}
              className="rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-wait disabled:opacity-60"
            >
              {adding ? '生成中…' : 'AI 生成'}
            </button>
            <button
              type="button"
              onClick={() => {
                setAddOpen(false)
                setAddStatus('')
              }}
              disabled={adding}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600"
            >
              取消
            </button>
          </div>
          {addStatus ? <p className="mt-2 text-xs text-slate-600">{addStatus}</p> : null}
        </div>
      )}
    </div>
  ) : null

  if (isRuntime && glossary.length === 0) {
    const audience = [industry, role].filter(Boolean).join(' · ')
    return (
      <div className="mx-auto max-w-5xl py-8">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950">术语库</h1>
        {addTermControl}
        <div className="mt-8 max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-slate-700 space-y-2">
          <p className="font-medium text-slate-900">还没有本路径的专属术语</p>
          <p>
            {audience
              ? `当前路径是「${audience}」，专属术语还在准备中。`
              : '本路径尚未生成专属术语。'}
          </p>
          <p>
            {canAdd
              ? '可先点击「添加术语」查询想了解的概念，或返回路径列表生成核心术语。'
              : '请返回路径列表生成日课与核心术语。'}
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
              ? `「${hubTitle}」收录 ${glossary.length} 个词条。先用大白话定位困惑，再进入独立详情页看示意图、完整例子和易混边界。`
              : `共 ${glossary.length} 个词条。适合预习、复习和面试前速查。`}
          </p>
          {addTermControl}
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
                  ? 'border-cyan-700 bg-cyan-700 text-white'
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
                    {entry.sourceType === 'custom' ? (
                      <span className="rounded-md bg-violet-50 px-2 py-1 text-[11px] text-violet-700">
                        自定义
                      </span>
                    ) : entry.sourceType === 'day' && entry.sourceDays?.length ? (
                      <span className="rounded-md bg-emerald-50 px-2 py-1 text-[11px] text-emerald-700">
                        Day {entry.sourceDays.join(' / ')}
                      </span>
                    ) : (
                      <span className="rounded-md bg-cyan-50 px-2 py-1 text-[11px] text-cyan-700">
                        核心
                      </span>
                    )}
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
