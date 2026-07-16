import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
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

const MIN_ZOOM = 0.2
const MAX_ZOOM = 4

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
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
  const [dimensions, setDimensions] = useState({ width: 800, height })
  const [renderNodes, setRenderNodes] = useState<SimNode[]>([])
  const [renderLinks, setRenderLinks] = useState<SimLink[]>([])
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [transform, setTransform] = useState<ViewTransform>({ x: 0, y: 0, k: 1 })
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

  const resetView = useCallback(() => {
    setTransform({ x: 0, y: 0, k: 1 })
  }, [])

  const fitAll = useCallback(() => {
    const { width } = dimensions
    if (!renderNodes.length || width <= 0) {
      resetView()
      return
    }

    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    for (const n of renderNodes) {
      if (n.x == null || n.y == null) continue
      const pad = n.size + 28
      minX = Math.min(minX, n.x - pad)
      maxX = Math.max(maxX, n.x + pad)
      minY = Math.min(minY, n.y - pad)
      maxY = Math.max(maxY, n.y + pad)
    }
    if (!Number.isFinite(minX)) {
      resetView()
      return
    }

    const gw = Math.max(maxX - minX, 40)
    const gh = Math.max(maxY - minY, 40)
    const margin = 36
    const k = clamp(
      Math.min((width - margin * 2) / gw, (height - margin * 2) / gh),
      MIN_ZOOM,
      MAX_ZOOM,
    )
    setTransform({
      k,
      x: (width - gw * k) / 2 - minX * k,
      y: (height - gh * k) / 2 - minY * k,
    })
  }, [dimensions, height, renderNodes, resetView])

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
      const w = el.clientWidth
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
    resetView()
  }, [filterModule, resetView])

  useEffect(() => {
    const { width } = dimensions
    if (width <= 0) return

    const simNodes: SimNode[] = visibleNodes.map((n, i) => ({
      ...n,
      x: width / 2 + Math.cos(i * 0.8) * 120,
      y: height / 2 + Math.sin(i * 0.8) * 120,
    }))

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
            if (link.relation === '归属') return 55
            if (link.relation === '工作流') return 75
            if (link.relation === '跨模块') return 150
            return 95
          })
          .strength((l) => {
            const link = l as SimLink
            if (link.relation === '归属') return 0.8
            if (link.relation === '跨模块') return 0.25
            return 0.45
          }),
      )
      .force('charge', forceManyBody().strength(-320))
      .force('center', forceCenter(width / 2, height / 2))
      .force(
        'collide',
        forceCollide<SimNode>().radius((d) => d.size + 10),
      )
      .alpha(0.9)
      .on('tick', () => {
        setRenderNodes([...simNodes])
        setRenderLinks([...simLinks])
      })
      .on('end', () => {
        // 布局结束后自动缩放到能看见全部节点
        let minX = Infinity
        let maxX = -Infinity
        let minY = Infinity
        let maxY = -Infinity
        for (const n of simNodes) {
          if (n.x == null || n.y == null) continue
          const pad = n.size + 28
          minX = Math.min(minX, n.x - pad)
          maxX = Math.max(maxX, n.x + pad)
          minY = Math.min(minY, n.y - pad)
          maxY = Math.max(maxY, n.y + pad)
        }
        if (!Number.isFinite(minX)) return
        const gw = Math.max(maxX - minX, 40)
        const gh = Math.max(maxY - minY, 40)
        const margin = 36
        const k = clamp(
          Math.min((width - margin * 2) / gw, (height - margin * 2) / gh),
          MIN_ZOOM,
          MAX_ZOOM,
        )
        setTransform({
          k,
          x: (width - gw * k) / 2 - minX * k,
          y: (height - gh * k) / 2 - minY * k,
        })
      })

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
      zoomBy(e.deltaY > 0 ? 0.88 : 1.12, mx, my)
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
    <div className="space-y-2">
      {/* 操作栏放在图上方，避免被裁剪/不易发现 */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
        <button
          type="button"
          onClick={() => zoomBy(1.2)}
          className="h-8 px-3 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-700"
        >
          放大
        </button>
        <button
          type="button"
          onClick={() => zoomBy(1 / 1.2)}
          className="h-8 px-3 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-700"
        >
          缩小
        </button>
        <button
          type="button"
          onClick={fitAll}
          className="h-8 px-3 rounded-md bg-cyan-700 text-white text-xs font-medium hover:bg-cyan-600"
        >
          适应全部
        </button>
        <button
          type="button"
          onClick={resetView}
          className="h-8 px-3 rounded-md border border-slate-300 text-slate-700 text-xs hover:bg-slate-50"
        >
          重置
        </button>
        <span className="text-xs text-slate-500">
          缩放 {Math.round(transform.k * 100)}% · 在图上按住拖动可平移 · 滚轮缩放
        </span>
      </div>

      <div
        ref={containerRef}
        className="relative w-full rounded-xl border border-slate-200 bg-slate-900 overflow-hidden"
      >
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={height}
          className="block select-none"
          style={{
            touchAction: 'none',
            cursor: isPanning ? 'grabbing' : 'grab',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endPan}
          onPointerCancel={endPan}
        >
          <rect width={dimensions.width} height={height} fill="#0f172a" />

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
                    strokeWidth={l.relation === '跨模块' ? 2 : 1}
                    strokeOpacity={
                      dimmed ? 0.06 : l.relation === '跨模块' ? 0.65 : 0.3
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

                return (
                  <g
                    key={node.id}
                    data-node={node.id}
                    transform={`translate(${node.x},${node.y})`}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoverId(node.id)}
                    onMouseLeave={() => setHoverId(null)}
                  >
                    {active && (
                      <circle
                        r={node.size + 10}
                        fill="none"
                        stroke={node.color}
                        strokeWidth={2}
                        opacity={0.6}
                      />
                    )}
                    <circle
                      r={node.size}
                      fill={node.color}
                      opacity={
                        dimmed ? 0.2 : node.type === 'module' ? 1 : 0.88
                      }
                      stroke="#fff"
                      strokeWidth={node.type === 'module' ? 2.5 : 1.5}
                      strokeOpacity={dimmed ? 0.15 : 0.55}
                    />
                    {node.type === 'concept' && (
                      <circle
                        r={node.size * 0.3}
                        fill="#fff"
                        opacity={dimmed ? 0.1 : 0.4}
                      />
                    )}
                    <text
                      textAnchor="middle"
                      dy={node.size + 13}
                      fill={dimmed ? '#475569' : '#e2e8f0'}
                      fontSize={node.type === 'module' ? 11 : 9}
                      fontWeight={node.type === 'module' ? 600 : 400}
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {def?.label ?? node.label}
                    </text>
                  </g>
                )
              })}
            </g>
          </g>
        </svg>

        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 text-[10px] max-w-[75%]">
          {Object.entries(relationColors).map(([rel, color]) => (
            <span
              key={rel}
              className="flex items-center gap-1 bg-slate-800/90 text-slate-300 px-2 py-1 rounded-full"
            >
              <span
                className="w-3 h-0.5 rounded"
                style={{ background: color as string }}
              />
              {rel}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
