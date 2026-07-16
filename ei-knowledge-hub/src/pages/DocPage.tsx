import { Link, useParams } from 'react-router-dom'
import { MarkdownContent } from '../components/MarkdownContent'
import { useContent } from '../context/ContentContext'

export function DocPage() {
  const { '*': slugPath } = useParams()
  const slug = slugPath ?? ''
  const { getContent, getNavItem, getModuleForSlug, missingHub } = useContent()
  const content = getContent(slug)
  const navItem = getNavItem(slug)
  const mod = getModuleForSlug(slug)

  if (missingHub) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">知识库未生成</h1>
        <p className="text-slate-600 mb-4">请返回项目列表补全专属知识库后再阅读章节。</p>
        <Link to="/" className="text-blue-600 hover:underline">
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
        <Link to="/" className="text-blue-600 hover:underline">
          返回首页
        </Link>
      </div>
    )
  }

  return (
    <article>
      {mod && (
        <p className="text-sm text-slate-500 mb-2">
          {mod.title}
          {navItem ? ` / ${navItem.title}` : ''}
        </p>
      )}
      <MarkdownContent content={content} />
    </article>
  )
}
