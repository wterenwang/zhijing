import { Link, Outlet, useLocation } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import { SearchBar } from './SearchBar'

/** 嵌入打卡主页 iframe 时隐藏顶栏，避免双层导航 */
function useEmbedMode() {
  const params = new URLSearchParams(window.location.search)
  return params.has('embed') || window.self !== window.top
}

export function Layout() {
  const location = useLocation()
  const isGraph = location.pathname === '/graph'
  const isGlossary = location.pathname.startsWith('/glossary')
  const isEmbed = useEmbedMode()
  const { navigation, hubTitle, missingHub, isRuntime } = useContent()

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {!isEmbed && (
        <header className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:flex-nowrap md:gap-4">
          <Link to="/" className="font-bold text-lg text-slate-900 hover:text-cyan-700 shrink-0 max-w-[200px] truncate">
            {isRuntime ? hubTitle : '知径 · 日课'}
          </Link>
          <div className="order-3 flex w-full flex-1 justify-center md:order-none md:mx-auto md:max-w-md">
            {!missingHub && <SearchBar />}
          </div>
          <nav className="ml-auto flex shrink-0 gap-3 text-sm">
            <a
              href="../index.html"
              target="_parent"
              className="text-slate-600 hover:text-cyan-700 font-medium"
            >
              今天
            </a>
            <Link
              to="/graph"
              className={
                location.pathname === '/graph'
                  ? 'text-cyan-700 font-medium'
                  : 'text-slate-600 hover:text-cyan-700'
              }
            >
              知识网络
            </Link>
            <Link
              to="/glossary"
              className={
                isGlossary
                  ? 'text-cyan-700 font-medium'
                  : 'text-slate-600 hover:text-cyan-700'
              }
            >
              术语库
            </Link>
          </nav>
        </header>
      )}

      <div className="flex flex-1">
        {!isGraph && !isGlossary && !missingHub && (
        <aside
          className={`w-64 shrink-0 border-r border-slate-200 bg-white overflow-y-auto hidden md:block ${
            isEmbed
              ? 'max-h-[100vh] sticky top-0'
              : 'max-h-[calc(100vh-57px)] sticky top-[57px]'
          }`}
        >
          {isEmbed && (
            <div className="p-3 border-b border-slate-100">
              <SearchBar />
            </div>
          )}
          <div className="p-4 space-y-6">
            {navigation.map((mod) => (
              <div key={mod.id}>
                <p
                  className="text-xs font-semibold uppercase tracking-wide mb-2"
                  style={{ color: mod.color }}
                >
                  {mod.title}
                </p>
                <ul className="space-y-1">
                  {mod.items.map((item) => {
                    const path = `/doc/${item.slug}`
                    const active = location.pathname === path
                    return (
                      <li key={item.slug}>
                        <Link
                          to={path}
                          className={`block text-sm py-1.5 px-2 rounded-md transition-colors ${
                            active
                              ? 'bg-cyan-50 text-cyan-800 font-medium'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          {item.title}
                          {item.days && (
                            <span className="text-xs text-slate-400 ml-1">D{item.days}</span>
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </aside>
        )}

        <main
          className={
            isGraph
              ? 'w-full flex-1 px-4 py-5 md:px-6 md:py-6'
              : isGlossary
                ? `flex-1 w-full px-5 py-8 sm:px-8 md:py-10 ${isEmbed ? 'max-w-none' : 'max-w-7xl mx-auto'}`
                : `flex-1 p-6 ${isEmbed ? 'md:p-8' : 'md:p-10'} max-w-4xl`
          }
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
