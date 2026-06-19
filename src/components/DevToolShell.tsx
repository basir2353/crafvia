import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Coffee,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { openDonatePage } from '../api/config'
import type { DevToolConfig } from '../config/devTools'
import { whyCrafvia } from '../config/tools'
import { Footer } from './Footer'
import { Header } from './Header'
import '../pages/CompressImage.css'

type Props = {
  config: DevToolConfig
  children: ReactNode
}

export function DevToolShell({ config, children }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="app tool-page">
      <Header />
      <main className="tool-main">
        <div className="tool-container">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={14} aria-hidden />
            <Link to="/categories/developer-tools">{config.category}</Link>
            <ChevronRight size={14} aria-hidden />
            <span className="breadcrumb-current">{config.breadcrumb}</span>
          </nav>

          <header className="tool-header">
            <h1 className="tool-title">{config.title}</h1>
            <p className="tool-lead">{config.lead}</p>
          </header>

          <div className="upload-outer">{children}</div>

          <div className="tool-donate-bar">
            <Coffee size={16} aria-hidden />
            <span>
              Enjoying this tool?{' '}
              <a
                href="#donate"
                onClick={(e) => {
                  e.preventDefault()
                  void openDonatePage()
                }}
              >
                Buy us a coffee!
              </a>
            </span>
          </div>

          <article className="tool-content-block">
            <h2>{config.whatIsTitle}</h2>
            <p>{config.whatIsBody}</p>
          </article>

          <article className="tool-content-block">
            <h2>{config.howToTitle}</h2>
            <ol className="tool-steps">
              {config.howToSteps.map((step, i) => (
                <li key={step}>
                  <span className="step-num">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </article>

          <article className="tool-content-block">
            <h2>Why Crafvia?</h2>
            <ul className="tool-checklist">
              {whyCrafvia.map((item) => (
                <li key={item}>
                  <Check size={18} strokeWidth={2.5} aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <section className="tool-content-block tool-faq-block">
            <h2>FAQ</h2>
            <ul className="tool-faq-list">
              {config.faqs.map((faq, index) => {
                const isOpen = openFaq === index
                return (
                  <li key={faq.question}>
                    <button
                      type="button"
                      className={`tool-faq-item ${isOpen ? 'tool-faq-item-open' : ''}`}
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      aria-expanded={isOpen}
                    >
                      <span>{faq.question}</span>
                      <ChevronDown size={20} aria-hidden />
                    </button>
                    {isOpen && <div className="tool-faq-answer">{faq.answer}</div>}
                  </li>
                )
              })}
            </ul>
          </section>

          <section className="tool-content-block">
            <h2>{config.popularTitle}</h2>
            <ul className="option-pills">
              {config.popularOptions.map((option) => (
                <li key={option.label}>
                  {option.href ? (
                    <Link to={option.href} className="option-pill">
                      {option.label}
                      <ArrowRight size={16} aria-hidden />
                    </Link>
                  ) : (
                    <a href="#" className="option-pill">
                      {option.label}
                      <ArrowRight size={16} aria-hidden />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="tool-content-block related-tools-section">
            <h2>Related Tools</h2>
            <ul className="related-tools-grid related-tools-grid-3">
              {config.relatedTools.map((tool) => {
                const Icon = tool.icon
                return (
                  <li key={tool.name}>
                    <Link to={tool.href} className="related-tool-card">
                      <span className="related-tool-icon">
                        <Icon size={20} strokeWidth={2} aria-hidden />
                      </span>
                      <span className="related-tool-text">
                        <span className="related-tool-name">{tool.name}</span>
                        <span className="related-tool-desc">{tool.description}</span>
                      </span>
                      <ArrowRight className="related-tool-arrow" size={18} aria-hidden />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export function DevOutputActions({
  output,
  onClear,
  disabled,
  downloadFilename = 'output.txt',
  downloadMime = 'text/plain;charset=utf-8',
  downloadLabel = 'Download',
}: {
  output: string
  onClear?: () => void
  disabled?: boolean
  downloadFilename?: string
  downloadMime?: string
  downloadLabel?: string
}) {
  const handleCopy = async () => {
    if (!output.trim()) return
    await navigator.clipboard.writeText(output)
  }

  const handleDownload = () => {
    if (!output.trim()) return
    const blob = new Blob([output], { type: downloadMime })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = downloadFilename
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="tool-editor-actions">
      <button type="button" className="tool-secondary-btn" onClick={() => void handleCopy()} disabled={disabled || !output.trim()}>
        Copy
      </button>
      <button type="button" className="tool-secondary-btn" onClick={handleDownload} disabled={disabled || !output.trim()}>
        {downloadLabel}
      </button>
      {onClear && (
        <button type="button" className="tool-secondary-btn" onClick={onClear} disabled={disabled}>
          Clear
        </button>
      )}
    </div>
  )
}
