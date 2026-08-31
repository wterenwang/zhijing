import { Link } from 'react-router-dom'
import { useContent } from '../context/ContentContext'

export function HomePage() {
  const {
    hubTitle,
    learningPath,
    navigation,
    isRuntime,
    missingHub,
    industry,
    role,
  } = useContent()

  if (missingHub) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{hubTitle}</h1>
        <p className="text-slate-600 mb-6 leading-relaxed">
          本路径课表已就绪，阅读章节还没生成。
        </p>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-slate-700 space-y-2">
          <p>
            请返回路径列表，点卡片上的 <strong>生成日课与核心术语</strong>
            或 <strong>重新生成问题部分</strong>（需先开启智能功能）。
          </p>
          <p className="text-slate-500">通常需要几分钟，请稍候。</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <a
        href="../index.html"
        target="_parent"
        className="mb-6 inline-flex items-center text-sm font-medium text-slate-500 transition hover:text-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/30"
      >
        ← 返回今天
      </a>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">{hubTitle}</h1>
      <p className="text-slate-600 mb-8 leading-relaxed">
        {isRuntime
          ? `与专属课表配套${industry || role ? `（${[industry, role].filter(Boolean).join(' · ')}）` : ''}：按模块阅读章节，配合打卡页每日任务与费曼复述。`
          : '与打卡课表配套：按模块阅读章节，配合每日任务与费曼复述系统学习。'}
      </p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-slate-950">推荐学习路径</h2>
        <ol className="grid gap-2 text-slate-700 sm:grid-cols-2">
          {learningPath.map((step, i) => (
            <li key={i} className="flex min-w-0 gap-3 rounded-xl bg-white px-4 py-3">
              <span className="font-mono text-xs font-semibold text-cyan-700">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="min-w-0 break-words text-sm">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-10">
        <Link
          to="/graph"
          className="block rounded-2xl border border-cyan-200 bg-cyan-50/60 p-5 transition hover:border-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/30"
        >
          <h3 className="font-semibold text-slate-900 mb-1">知识网络导航</h3>
          <p className="text-sm text-slate-500">
            可视化查看章节与概念关联，点击节点直达页面
          </p>
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-2 mb-10">
        {navigation.map((mod) => (
          <section
            key={mod.id}
            className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5"
          >
            <h3 className="font-semibold text-slate-900 mb-1">{mod.title}</h3>
            <p className="mb-4 text-sm leading-relaxed text-slate-500">{mod.description}</p>
            <div className="space-y-1 border-t border-slate-100 pt-3">
              {mod.items.map((item) => (
                <Link
                  key={item.slug}
                  to={`/doc/${item.slug}`}
                  className="flex min-w-0 items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm text-slate-600 transition hover:bg-cyan-50 hover:text-cyan-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/30"
                >
                  <span className="min-w-0 break-words">{item.title}</span>
                  <span className="shrink-0 text-cyan-700">打开 →</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </section>
    </div>
  )
}
