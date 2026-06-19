import type { LucideIcon } from 'lucide-react'
import {
  CheckCircle2,
  Lock,
  Search,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchAllTools, searchTools, type ToolItem } from '../api/tools'

const CLIENT_SIDE_CATEGORIES = new Set([
  'text-tools',
  'calculators',
  'utilities',
  'seo-tools',
  'developer-tools',
  'converters',
  'compressors',
  'ai-writing',
])

type FeaturePill = {
  id: string
  icon: LucideIcon
  label: string
  filter: (tool: ToolItem) => boolean
}

const featurePills: FeaturePill[] = [
  {
    id: 'no-uploads',
    icon: Lock,
    label: 'No file uploads',
    filter: (tool) => CLIENT_SIDE_CATEGORIES.has(tool.category.slug),
  },
  {
    id: 'no-account',
    icon: CheckCircle2,
    label: 'No account needed',
    filter: (tool) => !tool.requiresPro,
  },
  {
    id: 'instant-results',
    icon: Zap,
    label: 'Instant results',
    filter: (tool) => tool.isPopular,
  },
  {
    id: 'free-forever',
    icon: Sparkles,
    label: 'Free forever',
    filter: (tool) => !tool.requiresPro,
  },
]

const RESULT_LIMIT = 8

export function Hero() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ToolItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [activePill, setActivePill] = useState<string | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  useEffect(() => {
    if (activePill) return undefined

    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      setIsSearching(false)
      setSearchError(null)
      return undefined
    }

    let cancelled = false
    setIsSearching(true)
    setSearchError(null)

    const timer = window.setTimeout(() => {
      searchTools(trimmed, RESULT_LIMIT)
        .then((tools) => {
          if (!cancelled) setResults(tools)
        })
        .catch(() => {
          if (!cancelled) {
            setResults([])
            setSearchError('Search is temporarily unavailable. Please try again.')
          }
        })
        .finally(() => {
          if (!cancelled) setIsSearching(false)
        })
    }, 200)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [query, activePill])

  const goToTool = (href: string | null) => {
    if (!href) return
    setShowResults(false)
    setQuery('')
    setActivePill(null)
    navigate(href)
  }

  const handleSearchSubmit = () => {
    const trimmed = query.trim()
    if (!trimmed && !activePill) return

    const match = results.find((tool) => tool.href)
    if (match?.href) {
      goToTool(match.href)
      return
    }

    if (trimmed) {
      setShowResults(true)
    }
  }

  const handlePillClick = async (pill: FeaturePill) => {
    setQuery('')
    setSearchError(null)
    setActivePill(pill.id)
    setShowResults(true)
    setIsSearching(true)

    try {
      const tools = await fetchAllTools()
      const filtered = tools.filter((tool) => tool.href && pill.filter(tool))
      const sorted = pill.id === 'instant-results'
        ? filtered
        : [...filtered].sort((a, b) => Number(b.isPopular) - Number(a.isPopular))

      setResults(sorted.slice(0, RESULT_LIMIT))
    } catch {
      setResults([])
      setSearchError('Could not load tools. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleQueryChange = (value: string) => {
    setQuery(value)
    setActivePill(null)
    setShowResults(true)
    setSearchError(null)
  }

  const showDropdown = showResults && (Boolean(query.trim()) || Boolean(activePill))

  return (
    <section className="hero">
      <h1 className="hero-title">
        <span className="hero-title-dark">Every tool you need.</span>
        <br />
        <span className="hero-title-accent">Nothing leaves your browser.</span>
      </h1>
      <p className="hero-subtitle">
        180+ free tools for images, PDF, video, audio, AI writing and more.
        Instant results, zero uploads.
      </p>

      <div className="search-wrap" ref={searchRef}>
        <Search className="search-icon" size={20} strokeWidth={2} aria-hidden />
        <input
          type="search"
          className="search-input"
          placeholder='Search 180+ tools... e.g. "compress PDF", "HEIC to JPG"'
          aria-label="Search tools"
          aria-expanded={showDropdown}
          aria-controls="hero-search-results"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => {
            if (query.trim() || activePill) setShowResults(true)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSearchSubmit()
            }
            if (e.key === 'Escape') {
              setShowResults(false)
            }
          }}
        />

        {showDropdown && (
          <ul id="hero-search-results" className="hero-search-results" aria-live="polite">
            {isSearching && results.length === 0 && !searchError && (
              <li className="search-result-empty">Searching…</li>
            )}
            {searchError && <li className="search-result-empty">{searchError}</li>}
            {!isSearching && !searchError && results.length === 0 && (
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

      <ul className="feature-pills">
        {featurePills.map((pill) => {
          const Icon = pill.icon
          return (
            <li key={pill.id}>
              <button
                type="button"
                className={`feature-pill feature-pill-btn${activePill === pill.id ? ' feature-pill-btn--active' : ''}`}
                onClick={() => void handlePillClick(pill)}
                aria-pressed={activePill === pill.id}
              >
                <Icon size={14} strokeWidth={2} aria-hidden />
                {pill.label}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
