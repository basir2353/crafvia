import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Coffee,
  Download,
  Loader2,
  Upload,
} from 'lucide-react'
import type { DragEvent, ReactNode } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatFileSize } from '../api/compress'
import { openDonatePage } from '../api/config'
import type { ImageToolConfig } from '../config/imageTools'
import { whyCrafvia } from '../config/tools'
import { Footer } from './Footer'
import { Header } from './Header'
import '../pages/CompressImage.css'

type Props = {
  config: ImageToolConfig
  accept: string
  multiple?: boolean
  selectedFile: File | null
  selectedFiles?: File[]
  onFileChange: (files: FileList | null) => void
  isProcessing: boolean
  isPreparingPreview?: boolean
  error: string | null
  resultStats?: string | null
  onDownload?: () => void
  previewUrl?: string | null
  previewAlt?: string
  actionLabel?: string
  processingLabel?: string
  downloadLabel?: string
  onAction: () => void
  actionDisabled?: boolean
  children?: ReactNode
  showUpload?: boolean
}

export function ImageToolShell({
  config,
  accept,
  multiple = false,
  selectedFile,
  selectedFiles,
  onFileChange,
  isProcessing,
  isPreparingPreview = false,
  error,
  resultStats,
  onDownload,
  previewUrl,
  previewAlt = 'Image preview',
  actionLabel,
  processingLabel,
  downloadLabel,
  onAction,
  actionDisabled = false,
  children,
  showUpload = true,
}: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleDragOver = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (isProcessing || isPreparingPreview) return
    onFileChange(event.dataTransfer.files)
  }

  const uploadLabel = multiple
    ? selectedFiles && selectedFiles.length > 0
      ? `${selectedFiles.length} file(s) selected`
      : config.uploadTitle
    : selectedFile
      ? selectedFile.name
      : config.uploadTitle

  const uploadHint = multiple
    ? selectedFiles && selectedFiles.length > 0
      ? selectedFiles.map((f) => f.name).join(', ')
      : config.uploadHint
    : selectedFile
      ? `${formatFileSize(selectedFile.size)} — click to change file`
      : config.uploadHint

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
            <Link to="/categories/image-tools">{config.category}</Link>
            <ChevronRight size={14} aria-hidden />
            <span className="breadcrumb-current">{config.breadcrumb}</span>
          </nav>

          <header className="tool-header">
            <h1 className="tool-title">{config.title}</h1>
            <p className="tool-lead">{config.lead}</p>
          </header>

          <div className="upload-outer">
            {showUpload && (
              <button
                type="button"
                className={`upload-zone ${selectedFile || (selectedFiles && selectedFiles.length > 0) ? 'upload-zone-has-file' : ''}`}
                onClick={() => {
                  const input = document.getElementById('image-tool-upload') as HTMLInputElement | null
                  input?.click()
                }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                disabled={isProcessing || isPreparingPreview}
              >
                <span className="upload-icon-wrap">
                  <Upload size={28} strokeWidth={2} aria-hidden />
                </span>
                <span className="upload-title">{uploadLabel}</span>
                {uploadHint && <span className="upload-hint">{uploadHint}</span>}
                <input
                  id="image-tool-upload"
                  type="file"
                  accept={accept}
                  multiple={multiple}
                  className="upload-input"
                  aria-hidden
                  onChange={(e) => onFileChange(e.target.files)}
                />
              </button>
            )}

            {children}

            <button
              type="button"
              className="tool-compress-btn"
              onClick={onAction}
              disabled={actionDisabled || isProcessing || isPreparingPreview}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="spin" aria-hidden />
                  {processingLabel ?? config.processingLabel}
                </>
              ) : isPreparingPreview ? (
                <>
                  <Loader2 size={18} className="spin" aria-hidden />
                  Loading preview…
                </>
              ) : (
                actionLabel ?? config.actionLabel
              )}
            </button>

            {error && <p className="tool-error">{error}</p>}

            {resultStats && onDownload && (
              <div className="tool-result">
                <p className="tool-result-stats">{resultStats}</p>
                <button type="button" className="tool-download-btn" onClick={onDownload}>
                  <Download size={18} aria-hidden />
                  {downloadLabel ?? config.downloadLabel}
                </button>
              </div>
            )}

            {previewUrl && (
              <div className="tool-preview">
                <img src={previewUrl} alt={previewAlt} />
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
                          <span className="related-tool-desc">{tool.description}</span>
                        </span>
                        <ArrowRight className="related-tool-arrow" size={18} aria-hidden />
                      </Link>
                    ) : (
                      <a href={tool.href} className="related-tool-card">
                        <span className="related-tool-icon">
                          <Icon size={20} strokeWidth={2} aria-hidden />
                        </span>
                        <span className="related-tool-text">
                          <span className="related-tool-name">{tool.name}</span>
                          <span className="related-tool-desc">{tool.description}</span>
                        </span>
                        <ArrowRight className="related-tool-arrow" size={18} aria-hidden />
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
