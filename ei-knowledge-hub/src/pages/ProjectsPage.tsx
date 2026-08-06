import { Link } from 'react-router-dom'
import { profile, projects } from '../data/projects'

export function ProjectsPage() {
  return (
    <div>
      <section className="mb-10 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-900 text-white">
        <p className="text-blue-300 text-sm font-medium mb-2">我的项目实践</p>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{profile.name}</h1>
        <p className="text-slate-300 mb-4">{profile.subtitle}</p>
        <p className="text-slate-200 leading-relaxed max-w-2xl mb-6">{profile.intro}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {profile.skills.map((s) => (
            <span
              key={s}
              className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-slate-200"
            >
              {s}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          {profile.awards.map((a) => (
            <span key={a} className="text-amber-300">
              🏆 {a}
            </span>
          ))}
        </div>
        <Link
          to="/doc/module-4/00-profile"
          className="inline-block mt-6 text-sm text-blue-300 hover:text-blue-200 underline"
        >
          查看完整个人概览 →
        </Link>
      </section>

      <h2 className="text-xl font-semibold text-slate-900 mb-4">项目列表</h2>
      <p className="text-sm text-slate-500 mb-6">
        每个项目卡片可进入详情；「关联知识」直达日课对应章节，把实践和理论连起来。
      </p>

      <div className="grid gap-5 md:grid-cols-2">
        {projects.map((p) => (
          <article
            key={p.slug}
            className="flex flex-col p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-slate-900">{p.title}</h3>
              {p.highlight && (
                <span className="text-[10px] shrink-0 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {p.highlight}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mb-2">
              {p.period} · {p.role}
            </p>
            <p className="text-sm text-slate-600 leading-relaxed flex-1 mb-3">
              {p.summary}
            </p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {p.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="border-t border-slate-100 pt-3 mt-auto">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-2">
                关联知识
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {p.knowledgeLinks.map((k) => (
                  <Link
                    key={k.slug}
                    to={`/doc/${k.slug}`}
                    className="text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded"
                  >
                    {k.label}
                  </Link>
                ))}
              </div>
              <Link
                to={`/doc/${p.slug}`}
                className="text-sm font-medium text-slate-900 hover:text-blue-600"
              >
                项目详情 →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
