import { Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchTools, type ToolItem } from '../api/tools'

type Props = {
  open: boolean
  onClose: () => void
}

export function SearchOverlay({ open, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ToolItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults([])
      return undefined
    }

    const timer = window.setTimeout(() => inputRef.current?.focus(), 0)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) return undefined

    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      setIsSearching(false)
      return undefined
    }

    let cancelled = false
    setIsSearching(true)
    const timer = window.setTimeout(() => {
      searchTools(trimmed, 8)
        .then((tools) => {
          if (!cancelled) setResults(tools)
        })
        .catch(() => {
          if (!cancelled) setResults([])
        })
        .finally(() => {
          if (!cancelled) setIsSearching(false)
        })
    }, 200)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [open, query])

  const goToTool = (href: string | null) => {
    if (!href) return
    onClose()
    navigate(href)
  }

  if (!open) return null

  return (
    <div
      className="search-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="search-overlay-panel" role="dialog" aria-label="Search tools">
        <div className="search-overlay-top">
          <div className="search-wrap search-wrap--overlay">
            <Search className="search-icon" size={20} strokeWidth={2} aria-hidden />
            <input
              ref={inputRef}
              type="search"
              className="search-input"
              placeholder='Search 180+ tools... e.g. "compress PDF", "HEIC to JPG"'
              aria-label="Search tools"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const match = results.find((tool) => tool.href)
                  if (match?.href) goToTool(match.href)
                }
              }}
            />
          </div>
          <button type="button" className="icon-btn" aria-label="Close search" onClick={onClose}>
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {query.trim() && (
          <ul className="search-results" aria-live="polite">
            {isSearching && results.length === 0 && (
              <li className="search-result-empty">Searching…</li>
            )}
            {!isSearching && results.length === 0 && (
              <li className="search-result-empty">No tools found.</li>
            )}
            {results.map((tool) => (
              <li key={tool.slug}>
                <button
                  type="button"
                  className="search-result-item"
                  onClick={() => goToTool(tool.href)}
                  disabled={!tool.href}
                >
                  <span className="search-result-name">{tool.name}</span>
                  <span className="search-result-meta">{tool.category.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
