import { Link, useParams } from 'react-router-dom'
import { GlossaryVisualBlock } from '../components/GlossaryVisual'
import { useContent } from '../context/ContentContext'
import {
  confusionItems,
  detailSections,
  exampleText,
  userPhrase,
  VISUAL_KIND_LABEL,
} from '../lib/glossary-view'

function decodedParam(value?: string) {
  if (!value) return ''
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function GlossaryDetailPage() {
  const { term: termParam } = useParams()
  const { glossary } = useContent()
  const requestedTerm = decodedParam(termParam)
  const index = glossary.findIndex(
    (entry) =>
      entry.term.toLowerCase() === requestedTerm.toLowerCase() ||
      entry.aliases?.some((alias) => alias.toLowerCase() === requestedTerm.toLowerCase()),
  )
  const entry = glossary[index]

  if (!entry) {
    return (
      <div className="mx-auto max-w-3xl py-20 text-center">
        <p className="text-sm font-medium text-cyan-700">术语未找到</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          这个词条可能已改名
        </h1>
        <p className="mt-3 text-sm text-slate-600">回到术语目录，可以按别名或大白话重新搜索。</p>
        <Link
          to="/glossary"
          className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white"
        >
          返回术语目录
        </Link>
      </div>
    )
  }

  const comparisons = confusionItems(entry)
  const example = exampleText(entry)
  const sections = detailSections(entry)
  const kind = entry.visual?.kind || 'flow'
  const previous = index > 0 ? glossary[index - 1] : undefined
  const next = index < glossary.length - 1 ? glossary[index + 1] : undefined
  const related = glossary
    .filter(
      (candidate) =>
        candidate.term !== entry.term &&
        (candidate.module === entry.module ||
          comparisons.some(
            (item) =>
              candidate.term === item.term || candidate.aliases?.some((alias) => alias === item.term),
          )),
    )
    .slice(0, 4)

  return (
    <article className="mx-auto max-w-5xl pb-16">
      <nav className="mb-8 flex items-center justify-between gap-4 text-sm">
        <Link to="/glossary" className="font-medium text-slate-500 hover:text-cyan-700">
          ← 术语目录
        </Link>
        <span className="text-slate-400">
          {index + 1} / {glossary.length}
        </span>
      </nav>

      <header className="border-b border-slate-200 pb-9">
        <div className="flex flex-wrap items-center gap-2">
          {entry.module ? (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {entry.module}
            </span>
          ) : null}
          <span className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-800">
            {VISUAL_KIND_LABEL[kind]}图解
          </span>
        </div>
        <div className="mt-5 flex min-w-0 flex-wrap items-baseline gap-x-4 gap-y-2">
          <h1 className="max-w-full break-words text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
            {entry.term}
          </h1>
          {entry.aliases?.length ? (
            <p
              className="min-w-0 max-w-full truncate text-lg text-slate-400 sm:max-w-2xl"
              title={entry.aliases.join(' / ')}
            >
              {entry.aliases.join(' / ')}
            </p>
          ) : null}
        </div>

        <blockquote className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-5 py-4 sm:px-6">
          <p className="text-xs font-semibold text-indigo-700">你可能会这样问</p>
          <p className="mt-1 text-base leading-relaxed text-slate-800">“{userPhrase(entry)}”</p>
        </blockquote>

        <p className="mt-7 max-w-4xl text-lg font-medium leading-relaxed text-slate-800">
          {entry.definition}
        </p>
      </header>

      <GlossaryVisualBlock entry={entry} />

      {example ? (
        <section className="mt-10">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">放进真实场景里</h2>
          <div className="mt-4 rounded-2xl border border-cyan-100 bg-cyan-50/55 px-5 py-5 sm:px-6">
            <p className="whitespace-pre-line text-sm leading-7 text-slate-700">{example}</p>
          </div>
        </section>
      ) : null}

      {sections.length ? (
        <section className="mt-10">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">把边界讲透</h2>
          <dl className="mt-5 grid gap-x-8 gap-y-7 md:grid-cols-2">
            {sections.map(({ label, content }) => (
              <div key={label} className="border-t border-slate-200 pt-4">
                <dt className="text-sm font-semibold text-slate-950">{label}</dt>
                <dd className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">
                  {content}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {comparisons.length ? (
        <section className="mt-10">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">容易混淆？这样区分</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {comparisons.map((item, comparisonIndex) => (
              <div
                key={`${entry.term}-confusion-${item.term}-${comparisonIndex}`}
                className="rounded-2xl border border-rose-100 bg-rose-50/45 p-5"
              >
                <div className="text-sm font-semibold text-rose-800">
                  {entry.term} ≠ {item.term}
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-700">{item.distinction}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {related.length ? (
        <section className="mt-12 border-t border-slate-200 pt-8">
          <h2 className="text-lg font-semibold text-slate-950">接着看这些词</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {related.map((candidate) => (
              <Link
                key={candidate.term}
                to={`/glossary/${encodeURIComponent(candidate.term)}`}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition hover:border-cyan-300 hover:text-cyan-800"
              >
                {candidate.term} →
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <nav className="mt-12 grid gap-3 border-t border-slate-200 pt-6 sm:grid-cols-2">
        {previous ? (
          <Link
            to={`/glossary/${encodeURIComponent(previous.term)}`}
            className="rounded-2xl border border-slate-200 bg-white p-4 text-sm transition hover:border-cyan-300"
          >
            <span className="text-xs text-slate-400">上一个词</span>
            <span className="mt-1 block font-semibold text-slate-900">← {previous.term}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to={`/glossary/${encodeURIComponent(next.term)}`}
            className="rounded-2xl border border-slate-200 bg-white p-4 text-right text-sm transition hover:border-cyan-300"
          >
            <span className="text-xs text-slate-400">下一个词</span>
            <span className="mt-1 block font-semibold text-slate-900">{next.term} →</span>
          </Link>
        ) : null}
      </nav>
    </article>
  )
}

