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
          <p>请返回路径列表，点卡片上的 <strong>生成阅读内容</strong>（需先开启智能功能）。</p>
          <p className="text-slate-500">大约 1–2 分钟即可。</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">{hubTitle}</h1>
      <p className="text-slate-600 mb-8 leading-relaxed">
        {isRuntime
          ? `与专属课表配套${industry || role ? `（${[industry, role].filter(Boolean).join(' · ')}）` : ''}：按模块阅读章节，配合打卡页每日任务与费曼复述。`
          : '与打卡课表配套：按模块阅读章节，配合每日任务与费曼复述系统学习。'}
      </p>

      <section className="mb-10">
        <a
          href="../index.html"
          className="block p-5 rounded-xl border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-white hover:border-cyan-400 hover:shadow-md transition-all"
        >
          <h3 className="font-semibold text-slate-900 mb-1">返回今天</h3>
          <p className="text-sm text-slate-500">
            每日任务、打卡、复述与今日资料
          </p>
        </a>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">推荐学习路径</h2>
        <ol className="list-decimal list-inside space-y-2 text-slate-700">
          {learningPath.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="mb-10">
        <Link
          to="/graph"
          className="block p-5 rounded-xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-cyan-50 hover:border-cyan-400 hover:shadow-md transition-all text-center"
        >
          <h3 className="font-semibold text-slate-900 mb-1">知识网络导航</h3>
          <p className="text-sm text-slate-500">
            可视化查看章节与概念关联，点击节点直达页面
          </p>
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-10">
        {navigation.map((mod) => (
          <Link
            key={mod.id}
            to={mod.items[0] ? `/doc/${mod.items[0].slug}` : '/'}
            className="block p-5 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-all"
            style={{ borderTopColor: mod.color, borderTopWidth: 3 }}
          >
            <h3 className="font-semibold text-slate-900 mb-1">{mod.title}</h3>
            <p className="text-sm text-slate-500 mb-3">{mod.description}</p>
            <span className="text-sm" style={{ color: mod.color }}>
              {mod.items.length} 个章节 →
            </span>
          </Link>
        ))}
      </section>
    </div>
  )
}
