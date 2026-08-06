import type {
  GlossaryEntry,
  GlossaryVisual,
  GlossaryVisualKind,
  GlossaryVisualNode,
} from '../data/glossary/types'

const KIND_LABEL: Record<GlossaryVisualKind, string> = {
  flow: '流程链路',
  loop: '闭环回转',
  anatomy: '组成结构',
  roles: '多方协作',
  scenario: '场景示意',
  compare: '并排对比',
  states: '状态变化',
  layers: '分层结构',
  tree: '层级关系',
  timeline: '时间演进',
  matrix: '判断矩阵',
}

function resolveKind(visual?: GlossaryVisual): GlossaryVisualKind {
  if (visual?.kind) return visual.kind
  if (visual?.facts?.length || visual?.quote) return 'scenario'
  return 'flow'
}

function nodesOf(entry: GlossaryEntry): GlossaryVisualNode[] {
  if (entry.visual?.nodes?.length) {
    return entry.visual.nodes
      .map((node) => ({
        label: String(node.label || '').trim(),
        detail: String(node.detail || '').trim() || undefined,
        actor: String(node.actor || '').trim() || undefined,
        badge: String(node.badge || '').trim() || undefined,
        group: String(node.group || '').trim() || undefined,
        parent: String(node.parent || '').trim() || undefined,
      }))
      .filter((node) => node.label)
  }
  return (entry.visual?.steps || [])
    .map(String)
    .map((label) => label.trim())
    .filter(Boolean)
    .map((label) => ({ label }))
}

function VisualShell({
  kind,
  title,
  caption,
  children,
}: {
  kind: GlossaryVisualKind
  title: string
  caption?: string
  children: React.ReactNode
}) {
  return (
    <section className="glossary-grid mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 bg-white/90 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-xs font-semibold text-cyan-700">{KIND_LABEL[kind]}</span>
        </div>
        <h2 className="mt-1 break-words text-lg font-semibold tracking-tight text-slate-950">{title}</h2>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
      {caption ? (
        <p className="border-t border-slate-100 bg-white/90 px-5 py-3 text-sm leading-relaxed text-slate-600 sm:px-6">
          {caption}
        </p>
      ) : null}
    </section>
  )
}

function NodeCard({ node, index }: { node: GlossaryVisualNode; index?: number }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="flex items-center gap-2">
        {index !== undefined ? (
          <span className="font-mono text-[11px] font-semibold text-cyan-700">
            {String(index + 1).padStart(2, '0')}
          </span>
        ) : null}
        {node.badge ? (
          <span className="rounded-md bg-cyan-50 px-2 py-0.5 text-[11px] font-medium text-cyan-800">
            {node.badge}
          </span>
        ) : null}
        <h3 className="min-w-0 break-words text-sm font-semibold text-slate-950">{node.label}</h3>
      </div>
      {node.detail ? (
        <p className="mt-1.5 break-words text-sm leading-relaxed text-slate-600">{node.detail}</p>
      ) : null}
    </div>
  )
}

function splitComparison(nodes: GlossaryVisualNode[], columns: string[]) {
  if (columns.length >= 2) {
    return columns.slice(0, 2).map((column) => ({
      column,
      nodes: nodes.filter((node) => (node.group || node.badge) === column),
    }))
  }
  const groups = [...new Set(nodes.map((node) => node.group || node.badge).filter(Boolean))]
  if (groups.length >= 2) {
    return groups.slice(0, 2).map((column) => ({
      column: column as string,
      nodes: nodes.filter((node) => (node.group || node.badge) === column),
    }))
  }
  const cut = Math.ceil(nodes.length / 2)
  return [
    { column: '方案 A', nodes: nodes.slice(0, cut) },
    { column: '方案 B', nodes: nodes.slice(cut) },
  ]
}

export function GlossaryVisualBlock({ entry }: { entry: GlossaryEntry }) {
  const visual = entry.visual
  const kind = resolveKind(visual)
  const title = visual?.title || '一眼看懂'
  const nodes = nodesOf(entry)
  const caption = visual?.caption?.trim()

  if (!nodes.length && !visual?.facts?.length && !visual?.quote) {
    return caption ? (
      <VisualShell kind={kind} title={title}>
        <p className="text-sm leading-relaxed text-slate-700">{caption}</p>
      </VisualShell>
    ) : null
  }

  if (kind === 'scenario') {
    return (
      <VisualShell kind={kind} title={title} caption={caption}>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)]">
          <div className="space-y-3">
            {nodes.map((node, index) => (
              <NodeCard key={`${entry.term}-scenario-${index}`} node={node} index={index} />
            ))}
          </div>
          <div className="space-y-3">
            {visual?.quote ? (
              <blockquote className="rounded-xl border border-indigo-100 bg-indigo-50/80 px-4 py-4 text-sm leading-relaxed text-slate-800">
                “{visual.quote}”
              </blockquote>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              {(visual?.facts || []).map((fact, index) => (
                <div
                  key={`${entry.term}-fact-${index}`}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-3"
                >
                  <div className="text-xs text-slate-500">{fact.label}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-950">{fact.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </VisualShell>
    )
  }

  if (kind === 'compare') {
    const groups = splitComparison(nodes, visual?.columns || [])
    return (
      <VisualShell kind={kind} title={title} caption={caption}>
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((group, groupIndex) => (
            <div
              key={`${entry.term}-compare-${group.column}`}
              className={`rounded-2xl border p-4 ${
                groupIndex === 0
                  ? 'border-cyan-200 bg-cyan-50/55'
                  : 'border-indigo-200 bg-indigo-50/45'
              }`}
            >
              <h3 className="mb-3 text-sm font-semibold text-slate-950">{group.column}</h3>
              <div className="space-y-2">
                {group.nodes.map((node, index) => (
                  <NodeCard key={`${group.column}-${index}`} node={{ ...node, badge: undefined }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </VisualShell>
    )
  }

  if (kind === 'states') {
    return (
      <VisualShell kind={kind} title={title} caption={caption}>
        <ol className="mb-5 flex flex-wrap items-center gap-2" aria-label="状态变化顺序">
          {nodes.map((node, index) => (
            <li
              key={`${entry.term}-state-tab-${index}`}
              className="flex min-w-0 items-center gap-2 text-xs text-slate-600"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-cyan-50 font-mono font-semibold text-cyan-800">
                {index + 1}
              </span>
              <span className="max-w-40 truncate" title={node.badge || node.label}>
                {node.badge || node.label}
              </span>
              {index < nodes.length - 1 ? (
                <span className="text-cyan-500" aria-hidden="true">→</span>
              ) : null}
            </li>
          ))}
        </ol>
        <div className="grid gap-3 md:grid-cols-2">
          {nodes.map((node, index) => (
            <div key={`${entry.term}-state-${index}`} className="relative">
              <NodeCard node={node} index={index} />
              {index < nodes.length - 1 ? (
                <span className="absolute -bottom-3 left-8 text-sm text-cyan-600 md:-right-3 md:bottom-auto md:left-auto md:top-1/2">
                  →
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </VisualShell>
    )
  }

  if (kind === 'layers') {
    return (
      <VisualShell kind={kind} title={title} caption={caption}>
        <div className="mx-auto max-w-2xl space-y-2">
          {nodes.map((node, index) => {
            const inset = Math.min(index * 2.5, 10)
            return (
              <div
                key={`${entry.term}-layer-${index}`}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)]"
                style={{ marginInline: `${inset}%` }}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 font-mono text-xs font-semibold text-cyan-700">
                    L{index + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950">{node.label}</h3>
                    {node.detail ? (
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">{node.detail}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </VisualShell>
    )
  }

  if (kind === 'tree') {
    const root = nodes.find((node) => !node.parent) || nodes[0]
    const children = nodes.filter((node) => node !== root)
    return (
      <VisualShell kind={kind} title={title} caption={caption}>
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto w-fit rounded-xl border-2 border-cyan-300 bg-cyan-50 px-5 py-3 text-center">
            <div className="text-sm font-semibold text-slate-950">{root.label}</div>
            {root.detail ? <p className="mt-1 text-xs text-slate-600">{root.detail}</p> : null}
          </div>
          <div className="mx-auto h-6 w-px bg-cyan-300" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {children.map((node, index) => (
              <div key={`${entry.term}-tree-${index}`} className="relative pt-3">
                <span className="absolute left-1/2 top-0 h-3 w-px bg-slate-300" />
                <NodeCard node={node} />
              </div>
            ))}
          </div>
        </div>
      </VisualShell>
    )
  }

  if (kind === 'timeline') {
    return (
      <VisualShell kind={kind} title={title} caption={caption}>
        <ol className="relative space-y-0 border-l border-cyan-200 pl-6 sm:grid sm:grid-cols-2 sm:gap-x-8 sm:border-l-0 sm:pl-0 lg:grid-cols-4">
          {nodes.map((node, index) => (
            <li
              key={`${entry.term}-timeline-${index}`}
              className="relative border-b border-slate-100 py-4 sm:border-t sm:border-b-0"
            >
              <span className="absolute -left-[29px] top-5 h-2.5 w-2.5 rounded-full border-2 border-white bg-cyan-600 sm:-top-[5px] sm:left-0" />
              <div className="font-mono text-[11px] font-semibold text-cyan-700">
                {node.badge || String(index + 1).padStart(2, '0')}
              </div>
              <h3 className="mt-1 text-sm font-semibold text-slate-950">{node.label}</h3>
              {node.detail ? (
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{node.detail}</p>
              ) : null}
            </li>
          ))}
        </ol>
      </VisualShell>
    )
  }

  if (kind === 'matrix') {
    const columns = visual?.columns?.length ? visual.columns.slice(0, 4) : ['低投入', '高投入']
    return (
      <VisualShell kind={kind} title={title} caption={caption}>
        <div className="grid gap-3 sm:grid-cols-2">
          {columns.map((column, columnIndex) => {
            const grouped = nodes.filter((node) => node.group === column)
            const fallback = nodes.filter((_, index) => index % columns.length === columnIndex)
            return (
              <div
                key={`${entry.term}-matrix-${column}`}
                className="min-h-36 rounded-xl border border-slate-200 bg-white p-4"
              >
                <h3 className="mb-3 text-xs font-semibold text-cyan-800">{column}</h3>
                <div className="space-y-2">
                  {(grouped.length ? grouped : fallback).map((node, index) => (
                    <NodeCard key={`${column}-${index}`} node={node} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </VisualShell>
    )
  }

  if (kind === 'anatomy') {
    return (
      <VisualShell kind={kind} title={title} caption={caption}>
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto mb-4 w-fit rounded-full border border-cyan-200 bg-cyan-50 px-5 py-2 text-sm font-semibold text-cyan-900">
            {entry.term}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {nodes.map((node, index) => (
              <NodeCard key={`${entry.term}-anatomy-${index}`} node={node} index={index} />
            ))}
          </div>
        </div>
      </VisualShell>
    )
  }

  if (kind === 'roles') {
    return (
      <VisualShell kind={kind} title={title} caption={caption}>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {nodes.map((node, index) => (
            <div
              key={`${entry.term}-role-${index}`}
              className="grid gap-2 border-b border-slate-100 px-4 py-3 last:border-b-0 sm:grid-cols-[130px_minmax(0,1fr)]"
            >
              <span className="w-fit rounded-md bg-cyan-50 px-2 py-1 text-xs font-semibold text-cyan-800">
                {node.actor || `参与方 ${index + 1}`}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-950">{node.label}</h3>
                {node.detail ? (
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{node.detail}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </VisualShell>
    )
  }

  if (kind === 'loop') {
    return (
      <VisualShell kind={kind} title={title} caption={caption}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {nodes.map((node, index) => (
            <div key={`${entry.term}-loop-${index}`} className="relative">
              <NodeCard node={node} index={index} />
              <span className="absolute -bottom-3 left-1/2 text-cyan-600 lg:-right-3 lg:bottom-auto lg:left-auto lg:top-1/2">
                {index === nodes.length - 1 ? '↻' : '→'}
              </span>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-6 w-fit rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1.5 text-xs font-medium text-cyan-800">
          最后一步必须回到第一步，下一轮才会更快或更好
        </div>
      </VisualShell>
    )
  }

  return (
    <VisualShell kind="flow" title={title} caption={caption}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
        {nodes.map((node, index) => (
          <div key={`${entry.term}-flow-${index}`} className="contents">
            <div className="flex-1">
              <NodeCard node={node} index={index} />
            </div>
            {index < nodes.length - 1 ? (
              <div className="self-center text-center text-cyan-600" aria-hidden="true">
                <span className="lg:hidden">↓</span>
                <span className="hidden lg:inline">→</span>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </VisualShell>
  )
}
