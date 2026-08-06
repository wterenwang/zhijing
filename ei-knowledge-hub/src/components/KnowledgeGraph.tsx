import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from 'd3-force'
import {
  graphNodes,
  graphLinks,
  relationColors,
  getNodeById,
  type GraphNodeDef,
  type GraphLinkDef,
} from '../data/knowledge-graph'

interface SimNode extends GraphNodeDef, SimulationNodeDatum {
  x: number
  y: number
}

interface SimLink extends SimulationLinkDatum<SimNode> {
  relation: GraphLinkDef['relation']
}

interface ViewTransform {
  x: number
  y: number
  k: number
}

interface KnowledgeGraphProps {
  filterModule?: string | null
  height?: number
  nodes?: GraphNodeDef[]
  links?: GraphLinkDef[]
}

const MIN_ZOOM = 0.35
const MAX_ZOOM = 3.5
const LAYOUT_TICKS = 280
const IDENTITY: ViewTransform = { x: 0, y: 0, k: 1 }

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

/** 把力导向结果铺进画布，默认缩放约 100%，不再缩成右下角/中间小团 */
function packIntoViewport(
  nodes: SimNode[],
  width: number,
  height: number,
  fill = 0.9,
) {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  for (const n of nodes) {
    if (n.x == null || n.y == null) continue
    const pad = n.size + 18
    minX = Math.min(minX, n.x - pad)
    maxX = Math.max(maxX, n.x + pad)
    minY = Math.min(minY, n.y - pad)
    maxY = Math.max(maxY, n.y + pad)
  }

  if (!Number.isFinite(minX)) return

  const gw = Math.max(maxX - minX, 1)
  const gh = Math.max(maxY - minY, 1)
  const margin = 36
  const scale = Math.min(
    ((width - margin * 2) * fill) / gw,
    ((height - margin * 2) * fill) / gh,
  )
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2

  for (const n of nodes) {
    if (n.x == null || n.y == null) continue
    n.x = width / 2 + (n.x - cx) * scale
    n.y = height / 2 + (n.y - cy) * scale
  }
}

function labelVisible(type: GraphNodeDef['type'], zoom: number, active: boolean) {
  if (active) return true
  if (type === 'module') return true
  if (type === 'chapter') return zoom >= 0.75
  return zoom >= 1.15
}

function compactLabel(label: string, type: GraphNodeDef['type']) {
  const max = type === 'module' ? 12 : type === 'chapter' ? 16 : 10
  return label.length > max ? `${label.slice(0, max - 1)}…` : label
}

function displaySize(node: GraphNodeDef) {
  if (node.type === 'module') return Math.max(node.size, 26)
  if (node.type === 'chapter') return Math.max(node.size, 14)
  return Math.max(node.size, 9)
}

export function KnowledgeGraph({
  filterModule = null,
  height = 560,
  nodes = graphNodes,
  links = graphLinks,
}: KnowledgeGraphProps) {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height })
  const [renderNodes, setRenderNodes] = useState<SimNode[]>([])
  const [renderLinks, setRenderLinks] = useState<SimLink[]>([])
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [transform, setTransform] = useState<ViewTransform>(IDENTITY)
  const [isPanning, setIsPanning] = useState(false)

  const transformRef = useRef(transform)
  transformRef.current = transform

  const panRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    originX: number
    originY: number
    moved: boolean
    nodeId: string | null
  } | null>(null)

  const visibleNodes = useMemo(
    () =>
      filterModule
        ? nodes.filter(
            (n) =>
              n.type === 'concept' ||
              n.moduleId === filterModule ||
              n.id === filterModule,
          )
        : nodes,
    [filterModule, nodes],
  )

  const visibleLinks = useMemo(() => {
    const ids = new Set(visibleNodes.map((n) => n.id))
    return links.filter((l) => {
      const s = typeof l.source === 'string' ? l.source : String(l.source)
      const t = typeof l.target === 'string' ? l.target : String(l.target)
      return ids.has(s) && ids.has(t)
    })
  }, [visibleNodes, links])

  const connectedIds = useMemo(() => {
    if (!hoverId) return null
    const ids = new Set<string>([hoverId])
    for (const l of visibleLinks) {
      if (l.source === hoverId) ids.add(l.target)
      if (l.target === hoverId) ids.add(l.source)
    }
    return ids
  }, [hoverId, visibleLinks])

  const fitAll = useCallback(() => {
    setTransform(IDENTITY)
  }, [])

  const zoomBy = useCallback(
    (factor: number, cx?: number, cy?: number) => {
      setTransform((prev) => {
        const { width } = dimensions
        const originX = cx ?? width / 2
        const originY = cy ?? height / 2
        const nextK = clamp(prev.k * factor, MIN_ZOOM, MAX_ZOOM)
        const scale = nextK / prev.k
        return {
          k: nextK,
          x: originX - (originX - prev.x) * scale,
          y: originY - (originY - prev.y) * scale,
        }
      })
    },
    [dimensions, height],
  )

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const measure = () => {
      const w = Math.floor(el.clientWidth)
      if (w > 0) setDimensions({ width: w, height })
    }

    measure()
    const ro = new ResizeObserver(() => measure())
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [height])

  useEffect(() => {
    const { width } = dimensions
    if (width <= 0 || !visibleNodes.length) {
      setRenderNodes([])
      setRenderLinks([])
      return
    }

    const modules = visibleNodes.filter((n) => n.type === 'module')
    const moduleIndex = new Map(modules.map((m, i) => [m.id, i]))

    const simNodes: SimNode[] = visibleNodes.map((n) => {
      const size = displaySize(n)
      if (n.type === 'module') {
        const i = moduleIndex.get(n.id) ?? 0
        const count = Math.max(modules.length, 1)
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2
        const radius = Math.min(width, height) * 0.28
        return {
          ...n,
          size,
          x: width / 2 + Math.cos(angle) * radius,
          y: height / 2 + Math.sin(angle) * radius,
        }
      }

      const parentIdx = moduleIndex.get(n.moduleId || '') ?? 0
      const count = Math.max(modules.length, 1)
      const angle = (parentIdx / count) * Math.PI * 2 - Math.PI / 2
      const radius = Math.min(width, height) * 0.28
      const jitter = (Math.random() - 0.5) * 36
      return {
        ...n,
        size,
        x: width / 2 + Math.cos(angle) * (radius * 0.55) + jitter,
        y: height / 2 + Math.sin(angle) * (radius * 0.55) + jitter,
      }
    })

    const nodeById = new Map(simNodes.map((n) => [n.id, n]))
    const simLinks: SimLink[] = []
    for (const l of visibleLinks) {
      const source = nodeById.get(l.source)
      const target = nodeById.get(l.target)
      if (source && target) {
        simLinks.push({ source, target, relation: l.relation })
      }
    }

    const sim = forceSimulation(simNodes)
      .force(
        'link',
        forceLink(simLinks)
          .id((d) => (d as SimNode).id)
          .distance((l) => {
            const link = l as SimLink
            if (link.relation === '归属') return 64
            if (link.relation === '顺序') return 56
            if (link.relation === '引用') return 72
            if (link.relation === '支撑') return 80
            if (link.relation === '工作流') return 90
            if (link.relation === '跨模块') return 130
            return 70
          })
          .strength((l) => {
            const link = l as SimLink
            if (link.relation === '归属') return 0.9
            if (link.relation === '跨模块') return 0.18
            if (link.relation === '引用' || link.relation === '支撑') return 0.35
            return 0.45
          }),
      )
      .force(
        'charge',
        forceManyBody().strength((d) => {
          const node = d as SimNode
          if (node.type === 'module') return -520
          if (node.type === 'chapter') return -180
          return -140
        }),
      )
      .force('center', forceCenter(width / 2, height / 2))
      .force('x', forceX(width / 2).strength(0.05))
      .force('y', forceY(height / 2).strength(0.06))
      .force(
        'collide',
        forceCollide<SimNode>()
          .radius((d) => {
            if (d.type === 'module') return d.size + 28
            if (d.type === 'chapter') return d.size + 20
            return d.size + 16
          })
          .iterations(3),
      )
      .stop()

    for (let i = 0; i < LAYOUT_TICKS; i += 1) sim.tick()

    packIntoViewport(simNodes, width, height, 0.86)

    setRenderNodes(simNodes.map((n) => ({ ...n })))
    setRenderLinks(simLinks.map((l) => ({ ...l })))
    setTransform(IDENTITY)

    return () => {
      sim.stop()
    }
  }, [visibleNodes, visibleLinks, dimensions.width, height])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = svg.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      zoomBy(e.deltaY > 0 ? 0.9 : 1.1, mx, my)
    }

    svg.addEventListener('wheel', onWheel, { passive: false })
    return () => svg.removeEventListener('wheel', onWheel)
  }, [zoomBy])

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return
    const target = e.target as Element
    const nodeEl = target.closest('[data-node]') as HTMLElement | null
    const t = transformRef.current

    panRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: t.x,
      originY: t.y,
      moved: false,
      nodeId: nodeEl?.getAttribute('data-node') ?? null,
    }
    setIsPanning(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const pan = panRef.current
    if (!pan || pan.pointerId !== e.pointerId) return

    const dx = e.clientX - pan.startX
    const dy = e.clientY - pan.startY
    if (Math.abs(dx) + Math.abs(dy) > 4) pan.moved = true

    setTransform({
      k: transformRef.current.k,
      x: pan.originX + dx,
      y: pan.originY + dy,
    })
  }

  const endPan = (e: React.PointerEvent<SVGSVGElement>) => {
    const pan = panRef.current
    if (!pan || pan.pointerId !== e.pointerId) return

    if (!pan.moved && pan.nodeId) {
      const node = renderNodes.find((n) => n.id === pan.nodeId)
      if (node) navigate(node.href)
    }

    panRef.current = null
    setIsPanning(false)
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
  }

  const isDimmed = (id: string) =>
    connectedIds !== null && !connectedIds.has(id)

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
    >
      <div className="pointer-events-none absolute right-3 top-3 z-10 flex items-center gap-1.5">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-slate-200 bg-white/95 p-1 shadow-sm backdrop-blur">
          <button
            type="button"
            onClick={() => zoomBy(1.2)}
            className="h-8 min-w-8 rounded-full px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-cyan-800"
            aria-label="放大"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => zoomBy(1 / 1.2)}
            className="h-8 min-w-8 rounded-full px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-cyan-800"
            aria-label="缩小"
          >
            −
          </button>
          <button
            type="button"
            onClick={fitAll}
            className="h-8 rounded-full bg-cyan-700 px-3 text-xs font-medium text-white hover:bg-cyan-800"
          >
            适应
          </button>
        </div>
        <span className="pointer-events-none rounded-full border border-slate-200 bg-white/95 px-2.5 py-1.5 text-[11px] text-slate-500 shadow-sm backdrop-blur">
          {Math.round(transform.k * 100)}%
        </span>
      </div>

      <svg
        ref={svgRef}
        width={dimensions.width || undefined}
        height={height}
        className="block w-full select-none"
        style={{
          touchAction: 'none',
          cursor: isPanning ? 'grabbing' : 'grab',
          minHeight: height,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endPan}
        onPointerCancel={endPan}
      >
        <rect width="100%" height="100%" fill="#f8fafc" />

          <g
            transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}
          >
            <g>
              {renderLinks.map((l, i) => {
                const s = l.source as SimNode
                const t = l.target as SimNode
                if (s.x == null || t.x == null) return null
                const dimmed =
                  connectedIds &&
                  !connectedIds.has(s.id) &&
                  !connectedIds.has(t.id)
                return (
                  <line
                    key={`${s.id}-${t.id}-${i}`}
                    x1={s.x}
                    y1={s.y}
                    x2={t.x}
                    y2={t.y}
                    stroke={relationColors[l.relation]}
                    strokeWidth={l.relation === '跨模块' ? 2 : 1.4}
                    strokeOpacity={
                      dimmed ? 0.08 : l.relation === '跨模块' ? 0.75 : 0.4
                    }
                    strokeDasharray={
                      l.relation === '跨模块' ? '6 4' : undefined
                    }
                  />
                )
              })}
            </g>

            <g>
              {renderNodes.map((node) => {
                if (node.x == null || node.y == null) return null
                const dimmed = isDimmed(node.id)
                const active = hoverId === node.id
                const def = getNodeById(node.id, nodes)
                const label = def?.label ?? node.label
                const showLabel = labelVisible(node.type, transform.k, active)
                const r = displaySize(node)

                return (
                  <g
                    key={node.id}
                    data-node={node.id}
                    transform={`translate(${node.x},${node.y})`}
                    style={{ cursor: 'pointer' }}
                    role="link"
                    tabIndex={0}
                    aria-label={`打开${label}`}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        navigate(node.href)
                      }
                    }}
                    onMouseEnter={() => setHoverId(node.id)}
                    onMouseLeave={() => setHoverId(null)}
                  >
                    <title>{label}</title>
                    {active && (
                      <circle
                        r={r + 8}
                        fill="none"
                        stroke={node.color}
                        strokeWidth={2}
                        opacity={0.5}
                      />
                    )}
                    <circle
                      r={r}
                      fill={node.color}
                      opacity={dimmed ? 0.22 : node.type === 'module' ? 1 : 0.92}
                      stroke="#ffffff"
                      strokeWidth={node.type === 'module' ? 3 : 1.5}
                      strokeOpacity={dimmed ? 0.2 : 0.9}
                    />
                    {showLabel ? (
                      <text
                        textAnchor="middle"
                        dy={r + 16}
                        fill={dimmed ? '#94a3b8' : '#0f172a'}
                        fontSize={node.type === 'module' ? 13 : 11}
                        fontWeight={node.type === 'module' ? 700 : 500}
                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                      >
                        {active ? label : compactLabel(label, node.type)}
                      </text>
                    ) : null}
                  </g>
                )
              })}
            </g>
          </g>
        </svg>

      {!renderNodes.length ? (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
          暂无网络节点
        </div>
      ) : null}

      <div className="pointer-events-none absolute bottom-3 left-3 flex max-w-[85%] flex-wrap gap-2 text-[10px]">
        {Object.entries(relationColors).map(([rel, color]) => (
          <span
            key={rel}
            className="flex items-center gap-1 rounded-full border border-slate-200 bg-white/95 px-2 py-1 text-slate-600 shadow-sm"
          >
            <span
              className="h-0.5 w-3 rounded"
              style={{ background: color as string }}
            />
            {rel}
          </span>
        ))}
      </div>
    </div>
  )
}
