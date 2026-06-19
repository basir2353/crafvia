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
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatFileSize } from '../api/compress'
import { openDonatePage } from '../api/config'
import type { VideoToolConfig } from '../config/videoTools'
import { whyCrafvia } from '../config/tools'
import type { VideoMetadata } from '../utils/videoInfo'
import { formatDuration, formatResolution } from '../utils/videoInfo'
import { Footer } from './Footer'
import { Header } from './Header'
import '../pages/CompressImage.css'

type Props = {
  config: VideoToolConfig
  accept?: string
  multiple?: boolean
  selectedFile: File | null
  selectedFiles?: File[]
  onFileChange: (files: FileList | null) => void
  metadata?: VideoMetadata | null
  isProcessing: boolean
  isPreparingPreview?: boolean
  progressMessage?: string | null
  error: string | null
  resultStats?: string | null
  onDownload?: () => void
  previewUrl?: string | null
  resultPreviewUrl?: string | null
  actionLabel?: string
  processingLabel?: string
  downloadLabel?: string
  onAction: () => void
  actionDisabled?: boolean
  children?: ReactNode
  showUpload?: boolean
  showAction?: boolean
  /** When true, the action button stays clickable and shows actionLabel during isProcessing (e.g. Stop Recording). */
  actionEnabledWhileProcessing?: boolean
}

export function VideoToolShell({
  config,
  accept = 'video/*',
  multiple = false,
  selectedFile,
  selectedFiles,
  onFileChange,
  metadata,
  isProcessing,
  isPreparingPreview = false,
  progressMessage,
  error,
  resultStats,
  onDownload,
  previewUrl,
  resultPreviewUrl,
  actionLabel,
  processingLabel,
  downloadLabel,
  onAction,
  actionDisabled = false,
  children,
  showUpload = true,
  showAction = true,
  actionEnabledWhileProcessing = false,
}: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      ? `${selectedFiles.length} video(s) selected`
      : config.uploadTitle
    : selectedFile
      ? selectedFile.name
      : config.uploadTitle

  const uploadHint = multiple
    ? selectedFiles && selectedFiles.length > 0
      ? selectedFiles.map((file) => file.name).join(', ')
      : config.uploadHint
    : selectedFile
      ? `${formatFileSize(selectedFile.size)} — click to change file`
      : config.uploadHint

  const uploadZoneClass = [
    'upload-zone',
    selectedFile || (selectedFiles && selectedFiles.length > 0) ? 'upload-zone-has-file' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const showSourcePreview = previewUrl && metadata?.canPreview && !resultPreviewUrl
  const showResultPreview = resultPreviewUrl

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
            <Link to="/categories/video-tools">{config.category}</Link>
            <ChevronRight size={14} aria-hidden />
            <span className="breadcrumb-current">{config.breadcrumb}</span>
          </nav>

          <header className="tool-header">
            <h1 className="tool-title">{config.title}</h1>
            <p className="tool-lead">{config.lead}</p>
          </header>

          <div className="upload-outer">
            {showUpload && config.uploadTitle && (
              <button
                type="button"
                className={uploadZoneClass}
                onClick={() => fileInputRef.current?.click()}
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
                  ref={fileInputRef}
                  type="file"
                  accept={accept}
                  multiple={multiple}
                  className="upload-input"
                  aria-hidden
                  onChange={(e) => onFileChange(e.target.files)}
                />
              </button>
            )}

            {selectedFile && metadata && (
              <div className="tool-controls">
                <label className="tool-control-label">Video information</label>
                <div className="pdf-file-info">
                  <span className="pdf-file-name">{selectedFile.name}</span>
                  <span className="pdf-file-meta">
                    Size: {formatFileSize(selectedFile.size)} · Duration:{' '}
                    {formatDuration(metadata.duration)} · Resolution:{' '}
                    {formatResolution(metadata.width, metadata.height)}
                  </span>
                </div>
              </div>
            )}

            {children}

            {showAction && (
              <button
                type="button"
                className="tool-compress-btn"
                onClick={onAction}
                disabled={
                  actionDisabled ||
                  isPreparingPreview ||
                  (isProcessing && !actionEnabledWhileProcessing)
                }
              >
                {isProcessing && !actionEnabledWhileProcessing ? (
                  <>
                    <Loader2 size={18} className="spin" aria-hidden />
                    {progressMessage ?? processingLabel ?? config.processingLabel}
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
            )}

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

            {showSourcePreview && (
              <div className="tool-preview">
                <video src={previewUrl} controls preload="metadata" />
              </div>
            )}

            {showResultPreview && (
              <div className="tool-preview">
                <video src={resultPreviewUrl} controls preload="metadata" />
              </div>
            )}

            {previewUrl && metadata && !metadata.canPreview && !resultPreviewUrl && (
              <div className="tool-controls">
                <label className="tool-control-label">Preview</label>
                <span className="pdf-file-meta">
                  Inline preview is unavailable for this format, but processing is still supported.
                </span>
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
