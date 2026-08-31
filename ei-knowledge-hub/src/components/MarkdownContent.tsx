import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Children, isValidElement, cloneElement, useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { glossaryMap, glossaryHref } from '../data/glossary'

interface MarkdownContentProps {
  content: string
}

interface ChecklistContext {
  projectId: string
  date: string
  day: number
  scope: string
}

function hashText(value: string) {
  let result = 2166136261
  for (const char of value.trim()) {
    result ^= char.charCodeAt(0)
    result = Math.imul(result, 16777619)
  }
  return (result >>> 0).toString(36)
}

function checklistContext(): ChecklistContext {
  const params = new URLSearchParams(window.location.search)
  const projectId = params.get('projectId') || params.get('packId') || 'builtin'
  const date = params.get('date') || 'undated'
  const day = Number(params.get('day')) || 0
  return { projectId, date, day, scope: `${projectId}::${date}::day-${day}` }
}

function ChecklistInput({ context, itemId, initial }: {
  context: ChecklistContext
  itemId: string
  initial: boolean
}) {
  const storageKey = `learning-project-data:${context.projectId}`
  const readStored = () => {
    try {
      const appData = JSON.parse(localStorage.getItem(storageKey) || '{}')
      const bucket = appData?.dailyTaskState?.[context.scope]
      return Object.prototype.hasOwnProperty.call(bucket || {}, itemId)
        ? bucket[itemId] === true
        : undefined
    } catch {
      return undefined
    }
  }
  const [done, setDone] = useState(() => readStored() ?? initial)

  useEffect(() => {
    setDone(readStored() ?? initial)
  }, [context.scope, initial, itemId])

  const update = (next: boolean) => {
    setDone(next)
    if (window.parent === window) {
      try {
        const appData = JSON.parse(localStorage.getItem(storageKey) || '{}')
        appData.dailyTaskState = appData.dailyTaskState || {}
        appData.dailyTaskState[context.scope] = appData.dailyTaskState[context.scope] || {}
        appData.dailyTaskState[context.scope][itemId] = next
        localStorage.setItem(storageKey, JSON.stringify(appData))
      } catch {
        // 独立打开 Hub 时，本地存储不可用不应阻断当前交互。
      }
    }
    window.parent.postMessage({
      type: 'zhijing:checklist:set',
      projectId: context.projectId,
      date: context.date,
      day: context.day,
      itemId,
      done: next,
    }, window.location.origin === 'null' ? '*' : window.location.origin)
  }

  return (
    <input
      type="checkbox"
      checked={done}
      onChange={(event) => update(event.target.checked)}
      aria-label="完成清单项"
    />
  )
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
  const taskLines = useMemo(() => {
    const rows = new Map<number, { itemId: string; initial: boolean }>()
    let index = 0
    content.split('\n').forEach((line, lineIndex) => {
      const match = line.match(/^\s*[-*]\s+\[([ xX])\]\s+(.+)$/)
      if (!match) return
      const text = match[2].trim()
      rows.set(lineIndex + 1, {
        itemId: `lesson:${index}:${hashText(text)}`,
        initial: match[1].toLowerCase() === 'x',
      })
      index += 1
    })
    return rows
  }, [content])
  const context = useMemo(checklistContext, [])

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
          input: ({ node, type, checked }) => {
            if (type !== 'checkbox') return <input type={type} />
            const info = taskLines.get(node?.position?.start.line || 0)
            if (!info) return <input type="checkbox" checked={!!checked} readOnly />
            return (
              <ChecklistInput
                key={`${context.scope}:${info.itemId}`}
                context={context}
                itemId={info.itemId}
                initial={info.initial || !!checked}
              />
            )
          },
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
                <Link to={href} className="text-cyan-700 underline">
                  {withTerms(children)}
                </Link>
              )
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-700 underline"
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
