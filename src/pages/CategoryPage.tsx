import type { LucideIcon } from 'lucide-react'
import { ArrowRight, ChevronRight, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  fetchCategoryBySlug,
  fetchToolsByCategory,
  type CategoryItem,
  type ToolItem,
} from '../api/tools'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { getIcon } from '../utils/icons'
import './CompressImage.css'

type CategoryTool = {
  slug: string
  name: string
  description: string
  icon: LucideIcon
  href?: string
}

function mapTool(tool: ToolItem, categoryIconName: string): CategoryTool {
  return {
    slug: tool.slug,
    name: tool.name,
    description: tool.description,
    icon: getIcon(categoryIconName),
    href: tool.href ?? undefined,
  }
}

export function CategoryPage() {
  const { slug = '' } = useParams()
  const [category, setCategory] = useState<CategoryItem | null>(null)
  const [tools, setTools] = useState<CategoryTool[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!slug) {
      setError('Category not found.')
      setIsLoading(false)
      return undefined
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    Promise.all([fetchCategoryBySlug(slug), fetchToolsByCategory(slug)])
      .then(([categoryData, toolsData]) => {
        if (cancelled) return
        setCategory(categoryData)
        setTools(toolsData.map((tool) => mapTool(tool, categoryData.iconName)))
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setCategory(null)
          setTools([])
          const message = err instanceof Error ? err.message : ''
          if (message.toLowerCase().includes('not found')) {
            setError('Category not found.')
          } else if (message.toLowerCase().includes('too many requests')) {
            setError('Too many requests. Please wait a moment and try again.')
          } else {
            setError('Unable to load this category. Please try again.')
          }
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug, retryCount])

  const CategoryIcon = category ? getIcon(category.iconName) : null

  return (
    <div className="app">
      <Header />
      <main>
        <section className="popular-tools">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={14} aria-hidden />
            <span className="breadcrumb-current">{category?.name ?? 'Category'}</span>
          </nav>

          {isLoading ? (
            <div className="tool-result" style={{ justifyContent: 'center' }}>
              <Loader2 size={28} className="spin" aria-hidden />
            </div>
          ) : error || !category ? (
            <div style={{ textAlign: 'center' }}>
              <p className="tool-error">{error ?? 'Category not found.'}</p>
              {error && error !== 'Category not found.' && (
                <button
                  type="button"
                  className="btn-pro"
                  style={{ marginTop: 16 }}
                  onClick={() => setRetryCount((count) => count + 1)}
                >
                  Try again
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="category-card-top" style={{ justifyContent: 'center', marginBottom: 8 }}>
                {CategoryIcon && (
                  <span
                    className="category-icon-wrap"
                    style={{ background: category.iconBg, color: category.iconColor }}
                  >
                    <CategoryIcon size={20} strokeWidth={2} aria-hidden />
                  </span>
                )}
              </div>
              <h1 className="section-title">{category.name}</h1>
              <p className="popular-tools-subtitle">
                {category.toolCount} tools available in this category
              </p>
              <ul className="tools-grid">
                {tools.map((tool) => {
                  const Icon = tool.icon
                  const cardContent = (
                    <>
                      <span className="tool-card-icon">
                        <Icon strokeWidth={2} aria-hidden />
                      </span>
                      <span className="tool-card-content">
                        <span className="tool-card-name">{tool.name}</span>
                        <span className="tool-card-desc">{tool.description}</span>
                      </span>
                      <ArrowRight
                        className="tool-card-arrow"
                        strokeWidth={2}
                        aria-hidden
                      />
                    </>
                  )

                  return (
                    <li key={tool.slug}>
                      {tool.href ? (
                        <Link to={tool.href} className="tool-card">
                          {cardContent}
                        </Link>
                      ) : (
                        <a href="#" className="tool-card">
                          {cardContent}
                        </a>
                      )}
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
