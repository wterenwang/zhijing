import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Children, isValidElement, cloneElement } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { glossaryMap, glossaryHref } from '../data/glossary'

interface MarkdownContentProps {
  content: string
}

const TERM_PATTERN =
  /\b(具身智能|Embodied AI|VLA|RT-2|OpenVLA|强化学习|PPO|模仿学习|Diffusion Policy|世界模型|数据飞轮|数据闭环|IMU|伺服驱动器|关节模组|CoRL|ICRA|PRD|宇树|优必选|智元|Optimus)\b/gi

function linkTerms(text: string, keyPrefix = ''): ReactNode[] {
  const parts: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  const re = new RegExp(TERM_PATTERN.source, 'gi')

  while ((match = re.exec(text)) !== null) {
    const before = text.slice(lastIndex, match.index)
    if (before) parts.push(before)

    const term = match[0]
    const entry = glossaryMap.get(term.toLowerCase())
    if (entry) {
      parts.push(
        <Link
          key={`${keyPrefix}${match.index}-${term}`}
          to={glossaryHref(entry.term)}
          className="term-link"
          title={entry.definition}
        >
          {term}
        </Link>,
      )
    } else {
      parts.push(term)
    }
    lastIndex = match.index + term.length
  }

  const rest = text.slice(lastIndex)
  if (rest) parts.push(rest)
  return parts.length ? parts : [text]
}

function withTerms(children: ReactNode, keyPrefix = ''): ReactNode {
  return Children.map(children, (child, i) => {
    if (typeof child === 'string') {
      return <span key={i}>{linkTerms(child, `${keyPrefix}${i}-`)}</span>
    }
    if (isValidElement<{ children?: ReactNode }>(child) && child.props.children) {
      return cloneElement(child, {
        key: i,
        children: withTerms(child.props.children, `${keyPrefix}${i}-`),
      })
    }
    return child
  })
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="prose-doc max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1>{withTerms(children)}</h1>,
          h2: ({ children }) => <h2>{withTerms(children)}</h2>,
          h3: ({ children }) => <h3>{withTerms(children)}</h3>,
          h4: ({ children }) => <h4>{withTerms(children)}</h4>,
          p: ({ children }) => <p>{withTerms(children)}</p>,
          li: ({ children }) => <li>{withTerms(children)}</li>,
          td: ({ children }) => <td>{withTerms(children)}</td>,
          th: ({ children }) => <th>{withTerms(children)}</th>,
          blockquote: ({ children }) => (
            <blockquote>{withTerms(children)}</blockquote>
          ),
          strong: ({ children }) => <strong>{withTerms(children)}</strong>,
          em: ({ children }) => <em>{withTerms(children)}</em>,
          a: ({ href, children }) => {
            if (href?.startsWith('/')) {
              return (
                <Link to={href} className="text-blue-600 underline">
                  {withTerms(children)}
                </Link>
              )
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {withTerms(children)}
              </a>
            )
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table>{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead>{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr>{children}</tr>,
          code: ({ className, children }) => {
            const isBlock = className?.includes('language-')
            if (isBlock) {
              return (
                <pre>
                  <code className={className}>{children}</code>
                </pre>
              )
            }
            return <code>{children}</code>
          },
          hr: () => <hr className="my-6 border-slate-200" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
