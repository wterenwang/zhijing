import { Link, useParams } from 'react-router-dom'
import { MarkdownContent } from '../components/MarkdownContent'
import { useContent } from '../context/ContentContext'

export function DocPage() {
  const { '*': slugPath } = useParams()
  const slug = slugPath ?? ''
  const { getContent, getNavItem, getModuleForSlug, missingHub, navigation } = useContent()
  const content = getContent(slug)
  const navItem = getNavItem(slug)
  const mod = getModuleForSlug(slug)
  const chapters = navigation.flatMap((module) =>
    module.items.map((item) => ({ ...item, moduleTitle: module.title })),
  )
  const chapterIndex = chapters.findIndex((item) => item.slug === slug)
  const previous = chapterIndex > 0 ? chapters[chapterIndex - 1] : undefined
  const next =
    chapterIndex >= 0 && chapterIndex < chapters.length - 1
      ? chapters[chapterIndex + 1]
      : undefined

  if (missingHub) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">日课未生成</h1>
        <p className="text-slate-600 mb-4">
          请返回路径列表，点「生成日课与核心术语」或「重新生成问题部分」后再阅读章节。
        </p>
        <Link to="/" className="text-cyan-700 hover:underline">
          返回首页
        </Link>
      </div>
    )
  }

  if (!content) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">页面未找到</h1>
        <p className="text-slate-600 mb-4">章节「{slug}」暂无内容。</p>
        <Link to="/" className="text-cyan-700 hover:underline">
          返回首页
        </Link>
      </div>
    )
  }

  return (
    <article className="mx-auto w-full max-w-3xl pb-12">
      <nav className="mb-7 flex min-w-0 items-center gap-2 text-sm text-slate-500" aria-label="面包屑">
        <Link
          to="/"
          className="shrink-0 font-medium transition hover:text-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/30"
        >
          ← 日课
        </Link>
        {mod ? (
          <>
            <span aria-hidden="true">/</span>
            <span className="min-w-0 truncate" title={mod.title}>
              {mod.title}
            </span>
          </>
        ) : null}
      </nav>
      {navItem ? (
        <p className="mb-3 text-xs font-semibold text-cyan-700">当前章节</p>
      ) : null}
      <MarkdownContent content={content} />
      <nav className="mt-12 grid gap-3 border-t border-slate-200 pt-6 sm:grid-cols-2" aria-label="章节导航">
        {previous ? (
          <Link
            to={`/doc/${previous.slug}`}
            className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 text-sm transition hover:border-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/30"
          >
            <span className="text-xs text-slate-400">上一篇 / {previous.moduleTitle}</span>
            <span className="mt-1 block truncate font-semibold text-slate-900" title={previous.title}>
              ← {previous.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to={`/doc/${next.slug}`}
            className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 text-right text-sm transition hover:border-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/30"
          >
            <span className="text-xs text-slate-400">下一篇 / {next.moduleTitle}</span>
            <span className="mt-1 block truncate font-semibold text-slate-900" title={next.title}>
              {next.title} →
            </span>
          </Link>
        ) : null}
      </nav>
    </article>
  )
}
