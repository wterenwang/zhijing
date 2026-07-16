import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { highlightSnippet, search, type SearchResult } from '../lib/search'

function Snippet({ text, query }: { text: string; query: string }) {
  const parts = highlightSnippet(text, query).split(/<<mark>>|<\/mark>>/)
  return (
    <span className="text-slate-500 text-xs line-clamp-2">
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="bg-yellow-200 text-slate-800 rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  )
}

import { glossaryHref } from '../data/glossary'

function resultHref(result: SearchResult): string {
  if (result.type === 'glossary') return glossaryHref(result.title)
  return '/doc/' + result.slug
}

export function SearchBar() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus())
    } else {
      setQuery('')
      setResults([])
      setActiveIndex(0)
    }
  }, [open])

  useEffect(() => {
    setResults(search(query))
    setActiveIndex(0)
  }, [query])

  const goTo = useCallback(
    (result: SearchResult) => {
      setOpen(false)
      navigate(resultHref(result))
    },
    [navigate],
  )

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[activeIndex]) {
      e.preventDefault()
      goTo(results[activeIndex])
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-slate-500 border border-slate-200 rounded-lg px-3 py-1.5 hover:border-slate-300 hover:text-slate-700 bg-slate-50 min-w-[140px] md:min-w-[200px]"
      >
        <span className="flex-1 text-left truncate">搜索…</span>
        <kbd className="hidden sm:inline text-[10px] text-slate-400 bg-white border border-slate-200 rounded px-1.5 py-0.5">
          Ctrl K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4"
          role="dialog"
          aria-modal="true"
          aria-label="全文搜索"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="关闭搜索"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center border-b border-slate-100 px-4">
              <svg
                className="w-5 h-5 text-slate-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="搜索标题、正文、术语…"
                className="flex-1 px-3 py-3.5 text-sm outline-none"
                autoComplete="off"
              />
              <kbd className="text-[10px] text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">
                Esc
              </kbd>
            </div>

            <div className="max-h-[50vh] overflow-y-auto">
              {query.trim() && results.length === 0 && (
                <p className="px-4 py-8 text-sm text-slate-500 text-center">
                  未找到「{query}」相关内容
                </p>
              )}

              {results.length > 0 && (
                <ul className="py-2">
                  {results.map((result, i) => (
                    <li key={result.id}>
                      <button
                        type="button"
                        onClick={() => goTo(result)}
                        onMouseEnter={() => setActiveIndex(i)}
                        className={`w-full text-left px-4 py-2.5 transition-colors ${
                          i === activeIndex ? 'bg-blue-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className="text-sm font-medium text-slate-900">
                            {result.title}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {result.type === 'glossary' ? '术语' : result.moduleTitle}
                          </span>
                        </div>
                        <Snippet text={result.snippet} query={query} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {!query.trim() && (
                <p className="px-4 py-6 text-sm text-slate-400 text-center">
                  输入关键词，搜索全部章节与术语表
                </p>
              )}
            </div>

            {query.trim() && results.length > 0 && (
              <div className="border-t border-slate-100 px-4 py-2 text-[11px] text-slate-400 flex gap-3">
                <span>↑↓ 选择</span>
                <span>Enter 打开</span>
                <Link
                  to={`/search?q=${encodeURIComponent(query)}`}
                  onClick={() => setOpen(false)}
                  className="ml-auto text-blue-600 hover:underline"
                >
                  查看全部结果
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
