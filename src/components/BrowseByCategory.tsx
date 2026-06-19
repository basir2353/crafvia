import type { LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCategories, type CategoryItem } from '../api/tools'
import { getIcon } from '../utils/icons'

type Category = {
  slug: string
  name: string
  toolCount: number
  examples: string
  icon: LucideIcon
  iconBg: string
  iconColor: string
}

function mapCategory(item: CategoryItem): Category {
  return {
    slug: item.slug,
    name: item.name,
    toolCount: item.toolCount,
    examples: item.examples,
    icon: getIcon(item.iconName),
    iconBg: item.iconBg,
    iconColor: item.iconColor,
  }
}

export function BrowseByCategory() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetchCategories()
      .then((data) => setCategories(data.map(mapCategory)))
      .catch(() => {
        // section stays empty on failure
      })
  }, [])

  return (
    <section className="browse-category">
      <h2 className="section-title">Browse by category</h2>
      <p className="section-subtitle">Find the right tool for any task.</p>
      <ul className="category-grid">
        {categories.map((cat) => {
          const Icon = cat.icon
          return (
            <li key={cat.slug}>
              <Link to={`/categories/${cat.slug}`} className="category-card">
                <div className="category-card-top">
                  <span
                    className="category-icon-wrap"
                    style={{ background: cat.iconBg, color: cat.iconColor }}
                  >
                    <Icon size={20} strokeWidth={2} aria-hidden />
                  </span>
                  <span className="category-count">{cat.toolCount} tools</span>
                </div>
                <h3 className="category-name">{cat.name}</h3>
                <p className="category-examples">{cat.examples}</p>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
