import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPopularTools, type ToolItem } from '../api/tools'
import { getIcon } from '../utils/icons'

type Tool = {
  name: string
  description: string
  icon: LucideIcon
  href?: string
}

const fallbackTools: Tool[] = [
  { name: 'Compress Image', description: 'Reduce image file size without losing quality', icon: getIcon('Image'), href: '/tools/compress-image' },
  { name: 'Compress PDF', description: 'Shrink PDF files while keeping readability', icon: getIcon('FileType'), href: '/tools/compress-pdf' },
]

function mapTool(tool: ToolItem): Tool {
  return {
    name: tool.name,
    description: tool.description,
    icon: getIcon(tool.category.iconName ?? 'Sparkles'),
    href: tool.href ?? undefined,
  }
}

export function PopularTools() {
  const [tools, setTools] = useState<Tool[]>(fallbackTools)

  useEffect(() => {
    fetchPopularTools(12)
      .then((data) => {
        if (data.length > 0) setTools(data.map(mapTool))
      })
      .catch(() => {
        // keep fallback
      })
  }, [])

  return (
    <section className="popular-tools">
      <h2 className="section-title">Most popular tools</h2>
      <p className="popular-tools-subtitle">
        The tools millions of people use every day
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
            <li key={tool.name}>
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
      <div className="popular-tools-footer">
        <a href="#" className="browse-all-btn">
          Browse all 180+ tools
          <ArrowRight size={18} strokeWidth={2} aria-hidden />
        </a>
      </div>
    </section>
  )
}
