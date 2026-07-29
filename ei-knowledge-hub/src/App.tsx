import { HashRouter, Route, Routes } from 'react-router-dom'
import { ContentProvider } from './context/ContentContext'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { DocPage } from './pages/DocPage'
import { GlossaryPage } from './pages/GlossaryPage'
import { SearchPage } from './pages/SearchPage'
import { GraphPage } from './pages/GraphPage'
import { GlossaryDetailPage } from './pages/GlossaryDetailPage'

function App() {
  return (
    <ContentProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/glossary" element={<GlossaryPage />} />
            <Route path="/glossary/:term" element={<GlossaryDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/graph" element={<GraphPage />} />
            <Route path="/doc/*" element={<DocPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </ContentProvider>
  )
}

export default App
