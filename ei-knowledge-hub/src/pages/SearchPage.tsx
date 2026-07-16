import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { glossaryHref } from '../data/glossary'
import { highlightSnippet, search } from '../lib/search'
import { useContent } from '../context/ContentContext'

function Snippet({ text, query }: { text: string; query: string }) {
  const parts = highlightSnippet(text, query).split(/<<mark>>|<\/mark>>/)
  return (
    <p className="text-sm text-slate-600 mt-1">
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="bg-yellow-200 text-slate-800 rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </p>
  )
}

export function SearchPage() {
  const [params] = useSearchParams()
  const query = params.get('q') ?? ''
  const {
    navigation,
    getContent,
    getAllSlugs,
    getModuleForSlug,
    glossary,
  } = useContent()

  const results = useMemo(
    () =>
      search(query, 50, {
        navigation,
        getContent,
        getAllSlugs,
        getModuleForSlug,
        glossary,
      }),
    [query, navigation, getContent, getAllSlugs, getModuleForSlug, glossary],
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">搜索结果</h1>
      {query ? (
        <p className="text-slate-500 mb-6">
          关键词「{query}」，共 {results.length} 条
        </p>
      ) : (
        <p className="text-slate-500 mb-6">请在顶栏搜索框输入关键词</p>
      )}

      {query && results.length === 0 && (
        <p className="text-slate-600">没有找到匹配内容，换个词试试。</p>
      )}

      <ul className="space-y-3">
        {results.map((result) => {
          const href =
            result.type === 'glossary'
              ? glossaryHref(result.title)
              : `/doc/${result.slug}`

          return (
            <li key={result.id}>
              <Link
                to={href}
                className="block p-4 rounded-lg border border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-slate-900">{result.title}</span>
                  <span className="text-xs text-slate-400">
                    {result.type === 'glossary' ? '术语表' : result.moduleTitle}
                  </span>
                </div>
                <Snippet text={result.snippet} query={query} />
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
