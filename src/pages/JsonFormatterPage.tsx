import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Coffee,
  Copy,
  Download,
  Eraser,
  Loader2,
  Shrink,
  XCircle,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { openDonatePage } from '../api/config'
import { jsonFormatterConfig, whyCrafvia } from '../config/tools'
import {
  formatBytes,
  formatJsonText,
  getLineNumbers,
  highlightJson,
  minifyJsonText,
  parseJsonWithError,
  type JsonParseError,
  type JsonStats,
} from '../utils/jsonFormat'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import './CompressImage.css'

const config = jsonFormatterConfig

export function JsonFormatterPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [stats, setStats] = useState<JsonStats | null>(null)
  const [parseError, setParseError] = useState<JsonParseError | null>(null)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [copyMessage, setCopyMessage] = useState<string | null>(null)

  const inputLineNumbers = useMemo(() => getLineNumbers(input || ' '), [input])
  const outputLineNumbers = useMemo(() => getLineNumbers(output || ' '), [output])
  const highlightedOutput = useMemo(
    () => (output ? highlightJson(output) : ''),
    [output],
  )

  const inputCharCount = input.length

  const resetMessages = () => {
    setError(null)
    setSuccess(null)
    setCopyMessage(null)
  }

  const handleFormat = () => {
    resetMessages()
    setIsProcessing(true)

    try {
      const result = formatJsonText(input)
      if ('message' in result) {
        setParseError(result)
        setIsValid(false)
        setOutput('')
        setStats(null)
        setError(`Invalid JSON at line ${result.line}, column ${result.column}: ${result.message}`)
        return
      }

      setOutput(result.formatted)
      setStats(result.stats)
      setParseError(null)
      setIsValid(true)
      setSuccess('JSON formatted successfully.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleValidate = () => {
    resetMessages()
    const parsed = parseJsonWithError(input)

    if (parsed.error) {
      setParseError(parsed.error)
      setIsValid(false)
      setError(
        `Invalid JSON at line ${parsed.error.line}, column ${parsed.error.column}: ${parsed.error.message}`,
      )
      return
    }

    setParseError(null)
    setIsValid(true)
    setSuccess('JSON is valid.')
  }

  const handleMinify = () => {
    resetMessages()
    setIsProcessing(true)

    try {
      const result = minifyJsonText(input)
      if ('message' in result) {
        setParseError(result)
        setIsValid(false)
        setOutput('')
        setStats(null)
        setError(`Invalid JSON at line ${result.line}, column ${result.column}: ${result.message}`)
        return
      }

      setOutput(result.formatted)
      setStats(result.stats)
      setParseError(null)
      setIsValid(true)
      setSuccess('JSON minified successfully.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCopy = async () => {
    resetMessages()

    if (!output.trim()) {
      setError('There is no formatted JSON to copy.')
      return
    }

    try {
      await navigator.clipboard.writeText(output)
      setCopyMessage('Copied to clipboard.')
    } catch {
      setError('Unable to copy JSON. Your browser may have blocked clipboard access.')
    }
  }

  const handleDownload = () => {
    resetMessages()

    if (!output.trim()) {
      setError('There is no formatted JSON to download.')
      return
    }

    const blob = new Blob([output], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'formatted.json'
    anchor.click()
    URL.revokeObjectURL(url)
    setSuccess('Downloaded formatted.json')
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setStats(null)
    setParseError(null)
    setIsValid(null)
    resetMessages()
  }

  const donateBar = (
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
  )

  return (
    <div className="app tool-page">
      <Header />
      <main className="tool-main">
        <div className="tool-container">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={14} aria-hidden />
            <span>{config.category}</span>
            <ChevronRight size={14} aria-hidden />
            <span className="breadcrumb-current">{config.breadcrumb}</span>
          </nav>

          <header className="tool-header">
            <h1 className="tool-title">{config.title}</h1>
            <p className="tool-lead">{config.lead}</p>
          </header>

          <div className="upload-outer">
            <div className="tool-controls">
              <label className="tool-control-label" htmlFor="json-input">
                JSON input
              </label>
              <textarea
                id="json-input"
                className={`tool-textarea tool-json-input ${parseError ? 'tool-json-input-error' : ''}`}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  setParseError(null)
                  setIsValid(null)
                  resetMessages()
                }}
                placeholder='{"name":"Crafvia","features":["format","validate","minify"]}'
                spellCheck={false}
                disabled={isProcessing}
              />
              <div className="tool-text-counts">
                <span>{inputCharCount.toLocaleString()} characters</span>
                <span>Runs entirely in your browser</span>
              </div>
            </div>

            {isValid !== null && (
              <div className="tool-controls">
                <span
                  className={`tool-json-status ${isValid ? 'tool-json-status-valid' : 'tool-json-status-invalid'}`}
                >
                  {isValid ? (
                    <>
                      <CheckCircle2 size={16} aria-hidden />
                      Valid JSON
                    </>
                  ) : (
                    <>
                      <XCircle size={16} aria-hidden />
                      Invalid JSON
                    </>
                  )}
                </span>
              </div>
            )}

            {parseError && (
              <div className="tool-controls">
                <p className="tool-json-error-detail">
                  Line {parseError.line}, column {parseError.column}: {parseError.message}
                </p>
              </div>
            )}

            <button
              type="button"
              className="tool-compress-btn"
              onClick={handleFormat}
              disabled={isProcessing || !input.trim()}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="spin" aria-hidden />
                  {config.processingLabel}
                </>
              ) : (
                config.actionLabel
              )}
            </button>

            <div className="tool-editor-actions">
              <button
                type="button"
                className="tool-secondary-btn"
                onClick={handleValidate}
                disabled={isProcessing || !input.trim()}
              >
                <CheckCircle2 size={16} aria-hidden />
                Validate
              </button>
              <button
                type="button"
                className="tool-secondary-btn"
                onClick={handleMinify}
                disabled={isProcessing || !input.trim()}
              >
                <Shrink size={16} aria-hidden />
                Minify
              </button>
              <button
                type="button"
                className="tool-secondary-btn"
                onClick={() => void handleCopy()}
                disabled={!output.trim()}
              >
                <Copy size={16} aria-hidden />
                Copy
              </button>
              <button
                type="button"
                className="tool-secondary-btn"
                onClick={handleDownload}
                disabled={!output.trim()}
              >
                <Download size={16} aria-hidden />
                Download JSON
              </button>
              <button
                type="button"
                className="tool-secondary-btn"
                onClick={handleClear}
              >
                <Eraser size={16} aria-hidden />
                Clear
              </button>
            </div>

            {error && <p className="tool-error">{error}</p>}
            {success && (
              <div className="tool-result">
                <p className="tool-result-stats">{success}</p>
              </div>
            )}
            {copyMessage && (
              <div className="tool-result">
                <p className="tool-result-stats">{copyMessage}</p>
              </div>
            )}

            {stats && (
              <div className="tool-controls">
                <label className="tool-control-label">JSON statistics</label>
                <div className="tool-json-stats">
                  <span>{stats.keys.toLocaleString()} keys</span>
                  <span>{stats.objects.toLocaleString()} objects</span>
                  <span>{stats.arrays.toLocaleString()} arrays</span>
                  <span>{stats.characters.toLocaleString()} characters</span>
                  <span>{formatBytes(stats.sizeBytes)} estimated size</span>
                </div>
              </div>
            )}

            <div className="tool-controls">
              <label className="tool-control-label">Formatted output</label>
              <div className="tool-json-panel">
                <div className="tool-json-line-numbers" aria-hidden>
                  {outputLineNumbers.map((lineNumber) => {
                    const isErrorLine =
                      parseError !== null && Number(lineNumber) === parseError.line
                    return (
                      <div
                        key={lineNumber}
                        className={`tool-json-line-number ${isErrorLine ? 'tool-json-line-number-error' : ''}`}
                      >
                        {lineNumber}
                      </div>
                    )
                  })}
                </div>
                {output ? (
                  <pre
                    className="tool-json-output"
                    dangerouslySetInnerHTML={{ __html: highlightedOutput }}
                  />
                ) : (
                  <pre className="tool-json-output">
                    {parseError
                      ? 'Fix the JSON syntax error above, then format again.'
                      : 'Formatted JSON will appear here.'}
                  </pre>
                )}
              </div>
            </div>

            {input.trim() && !output && parseError && (
              <div className="tool-controls">
                <label className="tool-control-label">Input preview (error line)</label>
                <div className="tool-json-panel">
                  <div className="tool-json-line-numbers" aria-hidden>
                    {inputLineNumbers.map((lineNumber) => {
                      const isErrorLine = Number(lineNumber) === parseError.line
                      return (
                        <div
                          key={lineNumber}
                          className={`tool-json-line-number ${isErrorLine ? 'tool-json-line-number-error' : ''}`}
                        >
                          {lineNumber}
                        </div>
                      )
                    })}
                  </div>
                  <pre className="tool-json-output">{input}</pre>
                </div>
              </div>
            )}
          </div>

          {donateBar}

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
                    {isOpen && (
                      <div className="tool-faq-answer">{faq.answer}</div>
                    )}
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
                const isInternal = tool.href.startsWith('/')
                return (
                  <li key={tool.name}>
                    {isInternal ? (
                      <Link to={tool.href} className="related-tool-card">
                        <span className="related-tool-icon">
                          <Icon size={20} strokeWidth={2} aria-hidden />
                        </span>
                        <span className="related-tool-text">
                          <span className="related-tool-name">{tool.name}</span>
                          <span className="related-tool-desc">
                            {tool.description}
                          </span>
                        </span>
                        <ArrowRight
                          className="related-tool-arrow"
                          size={18}
                          aria-hidden
                        />
                      </Link>
                    ) : (
                      <a href={tool.href} className="related-tool-card">
                        <span className="related-tool-icon">
                          <Icon size={20} strokeWidth={2} aria-hidden />
                        </span>
                        <span className="related-tool-text">
                          <span className="related-tool-name">{tool.name}</span>
                          <span className="related-tool-desc">
                            {tool.description}
                          </span>
                        </span>
                        <ArrowRight
                          className="related-tool-arrow"
                          size={18}
                          aria-hidden
                        />
                      </a>
                    )}
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
