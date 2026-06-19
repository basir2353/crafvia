import { ChevronDown } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchAllTools,
  fetchCategories,
  type CategoryItem,
  type ToolItem,
} from '../api/tools'
import { NAV_MENU_ITEMS, NAV_TOOLS_PER_SECTION } from '../config/navMenu'

type CategoryTools = {
  category: CategoryItem
  tools: ToolItem[]
}

export function HeaderNav() {
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [toolsByCategory, setToolsByCategory] = useState<Record<string, ToolItem[]>>({})
  const [openLabel, setOpenLabel] = useState<string | null>(null)
  const navRef = useRef<HTMLElement>(null)
  const closeTimerRef = useRef<number | null>(null)

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((category) => [category.slug, category])),
    [categories],
  )

  useEffect(() => {
    let cancelled = false

    Promise.all([fetchCategories(), fetchAllTools()])
      .then(([categoryData, toolData]) => {
        if (cancelled) return
        setCategories(categoryData)
        const map: Record<string, ToolItem[]> = {}
        for (const tool of toolData) {
          const slug = tool.category.slug
          if (!map[slug]) map[slug] = []
          map[slug].push(tool)
        }
        setToolsByCategory(map)
      })
      .catch(() => {
        // dropdowns stay empty on failure
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!navRef.current?.contains(event.target as Node)) {
        setOpenLabel(null)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenLabel(null)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const clearCloseTimer = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const scheduleClose = () => {
    clearCloseTimer()
    closeTimerRef.current = window.setTimeout(() => setOpenLabel(null), 120)
  }

  const openMenu = (label: string) => {
    clearCloseTimer()
    setOpenLabel(label)
  }

  const getSectionData = (slugs: string[]): CategoryTools[] =>
    slugs
      .map((slug) => {
        const category = categoryMap[slug]
        const tools = toolsByCategory[slug] ?? []
        if (!category) return null
        return { category, tools }
      })
      .filter((section): section is CategoryTools => section !== null)

  return (
    <nav className="nav" aria-label="Main" ref={navRef}>
      <ul className="nav-list">
        {NAV_MENU_ITEMS.map((item) => {
          const isOpen = openLabel === item.label
          const sections = getSectionData(item.categories)
          const isWide = !item.categoriesOnly && item.categories.length > 1

          return (
            <li
              key={item.label}
              className="nav-item"
              onMouseEnter={() => openMenu(item.label)}
              onMouseLeave={scheduleClose}
            >
              <button
                type="button"
                className={`nav-link${isOpen ? ' nav-link--open' : ''}`}
                aria-expanded={isOpen}
                aria-haspopup="true"
                onClick={() => setOpenLabel(isOpen ? null : item.label)}
              >
                {item.label}
                <ChevronDown size={14} strokeWidth={2} aria-hidden />
              </button>

              {isOpen && sections.length > 0 && (
                <div
                  className={`nav-dropdown${isWide ? ' nav-dropdown--wide' : ''}`}
                  onMouseEnter={clearCloseTimer}
                  onMouseLeave={scheduleClose}
                >
                  <div className="nav-dropdown-panel">
                    {item.categoriesOnly
                      ? sections.map(({ category }) => (
                          <Link
                            key={category.slug}
                            to={`/categories/${category.slug}`}
                            className="nav-dropdown-link"
                            onClick={() => setOpenLabel(null)}
                          >
                            <span className="nav-dropdown-link-name">{category.name}</span>
                            <span className="nav-dropdown-link-meta">{category.toolCount} tools</span>
                          </Link>
                        ))
                      : sections.map(({ category, tools }) => {
                          const visibleTools = tools
                            .filter((tool) => tool.href)
                            .slice(0, NAV_TOOLS_PER_SECTION)

                          return (
                            <div key={category.slug} className="nav-dropdown-section">
                              <Link
                                to={`/categories/${category.slug}`}
                                className="nav-dropdown-heading"
                                onClick={() => setOpenLabel(null)}
                              >
                                {category.name}
                              </Link>
                              {visibleTools.map((tool) => (
                                <Link
                                  key={tool.slug}
                                  to={tool.href!}
                                  className="nav-dropdown-link"
                                  onClick={() => setOpenLabel(null)}
                                >
                                  {tool.name}
                                </Link>
                              ))}
                              {category.toolCount > visibleTools.length && (
                                <Link
                                  to={`/categories/${category.slug}`}
                                  className="nav-dropdown-all"
                                  onClick={() => setOpenLabel(null)}
                                >
                                  View all {category.toolCount} tools
                                </Link>
                              )}
                            </div>
                          )
                        })}
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
