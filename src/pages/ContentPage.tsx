import { ChevronRight, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { apiFetch } from '../api/client'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import './CompressImage.css'

type PageContent = {
  slug: string
  title: string
  body: string
}

const slugAliases: Record<string, string> = {
  pricing: 'pricing',
  privacy: 'privacy',
  'privacy-policy': 'privacy',
  terms: 'terms',
  'terms-of-service': 'terms',
  about: 'about',
  faq: 'faq',
  blog: 'blog',
  changelog: 'changelog',
}

export function ContentPage() {
  const { pathname } = useLocation()
  const slug = pathname.replace(/^\//, '')
  const [page, setPage] = useState<PageContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const resolved = slugAliases[slug] ?? slug
    if (!resolved) {
      setError('Page not found.')
      setIsLoading(false)
      return undefined
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    apiFetch<{ page: PageContent }>(`/api/content/pages/${resolved}`)
      .then((data) => {
        if (!cancelled) setPage(data.page)
      })
      .catch(() => {
        if (!cancelled) {
          setPage(null)
          setError('Unable to load this page. Please try again.')
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  return (
    <div className="app tool-page">
      <Header />
      <main className="tool-main">
        <div className="tool-container">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={14} aria-hidden />
            <span className="breadcrumb-current">{page?.title ?? 'Page'}</span>
          </nav>

          {isLoading ? (
            <div className="tool-result" style={{ justifyContent: 'center' }}>
              <Loader2 size={28} className="spin" aria-hidden />
            </div>
          ) : error || !page ? (
            <p className="tool-error" style={{ textAlign: 'center' }}>
              {error ?? 'Page not found.'}
            </p>
          ) : (
            <header className="tool-header">
              <h1 className="tool-title">{page.title}</h1>
              <p className="tool-lead" style={{ whiteSpace: 'pre-line' }}>
                {page.body}
              </p>
            </header>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
