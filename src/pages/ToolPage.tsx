import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Coffee,
  Download,
  Loader2,
  Shield,
  Upload,
} from 'lucide-react'
import { type DragEvent, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { removeBackground } from '../api/background'
import {
  compressImage,
  compressJpg,
  compressPdf,
  compressPng,
  formatFileSize,
  type CompressResult,
} from '../api/compress'
import { openDonatePage } from '../api/config'
import type { ToolConfig } from '../config/tools'
import { whyCrafvia } from '../config/tools'
import { convertHeicToJpg, isHeicFile } from '../utils/heicConvert'
import { createImagePreviewUrl, isSupportedImageFile } from '../utils/imagePrepare'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import './CompressImage.css'

type Props = {
  config: ToolConfig
}

type PdfLevel = 'low' | 'medium' | 'high'

const BACKGROUND_MAX_FILE_BYTES = 20 * 1024 * 1024

export function ToolPage({ config }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [quality, setQuality] = useState(80)
  const [pdfLevel, setPdfLevel] = useState<PdfLevel>('medium')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CompressResult | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isPreparingPreview, setIsPreparingPreview] = useState(false)
  const [progressMessage, setProgressMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadOuterClass = [
    'upload-outer',
    config.uploadVariant === 'pdf' ? 'upload-outer-pdf' : '',
    config.donateInsideCard ? 'upload-outer-with-donate' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const uploadZoneClass = [
    'upload-zone',
    config.uploadVariant === 'pdf' ? 'upload-zone-pdf' : '',
    selectedFile ? 'upload-zone-has-file' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const resetPreview = (url: string | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(url)
  }

  const handleFileChange = (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return

    if (config.compressionMode === 'heic' && !isHeicFile(file)) {
      setError('Please select a valid HEIC file (.heic or .HEIC).')
      setSelectedFile(null)
      setResult(null)
      resetPreview(null)
      return
    }

    if (config.compressionMode === 'background' && !isSupportedImageFile(file)) {
      setError(
        'Unsupported file format. Please upload JPG, PNG, WebP, HEIC, HEIF, AVIF, BMP, TIFF, or GIF.',
      )
      setSelectedFile(null)
      setResult(null)
      resetPreview(null)
      return
    }

    if (
      config.compressionMode === 'background' &&
      file.size > BACKGROUND_MAX_FILE_BYTES
    ) {
      setError('File exceeds 20MB limit. Try a smaller image.')
      setSelectedFile(null)
      setResult(null)
      resetPreview(null)
      return
    }

    setSelectedFile(file)
    setResult(null)
    setError(null)

    if (config.compressionMode === 'heic') {
      resetPreview(null)
    } else if (config.compressionMode === 'background') {
      resetPreview(null)
      setIsPreparingPreview(true)
      void createImagePreviewUrl(file)
        .then((url) => {
          if (url) resetPreview(url)
        })
        .catch((err: unknown) => {
          setError(
            err instanceof Error ? err.message : 'Could not load image preview.',
          )
        })
        .finally(() => {
          setIsPreparingPreview(false)
        })
    } else if (config.compressionMode !== 'pdf' && file.type.startsWith('image/')) {
      resetPreview(URL.createObjectURL(file))
    } else {
      resetPreview(null)
    }
  }

  const handleDragOver = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (isProcessing || isPreparingPreview) return
    handleFileChange(event.dataTransfer.files)
  }

  const handleCompress = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setError(null)
    setResult(null)
    setProgressMessage(null)

    try {
      let compressResult: CompressResult

      if (config.compressionMode === 'pdf') {
        compressResult = await compressPdf({ file: selectedFile, level: pdfLevel })
      } else if (config.compressionMode === 'heic') {
        compressResult = await convertHeicToJpg({ file: selectedFile, quality })
      } else if (config.compressionMode === 'background') {
        compressResult = await removeBackground({
          file: selectedFile,
          onProgress: setProgressMessage,
        })
      } else if (config.compressionMode === 'jpg') {
        compressResult = await compressJpg({ file: selectedFile, quality })
      } else if (config.compressionMode === 'png') {
        compressResult = await compressPng({ file: selectedFile, quality })
      } else {
        compressResult = await compressImage({ file: selectedFile, quality })
      }

      setResult(compressResult)

      if (config.compressionMode !== 'pdf') {
        resetPreview(URL.createObjectURL(compressResult.blob))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsProcessing(false)
      setProgressMessage(null)
    }
  }

  const handleDownload = () => {
    if (!result) return
    const url = URL.createObjectURL(result.blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = result.filename
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const savingsPercent =
    result && result.originalSize > 0
      ? Math.round((1 - result.compressedSize / result.originalSize) * 100)
      : 0

  const actionLabel = config.actionLabel ?? 'Compress now'
  const processingLabel = config.processingLabel ?? 'Compressing…'
  const downloadLabel = config.downloadLabel ?? 'Download compressed file'
  const showQualityControl =
    config.compressionMode !== 'pdf' &&
    config.compressionMode !== 'background'

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

          <div className={uploadOuterClass}>
            {config.serverNotice && (
              <div className="upload-server-notice">
                <Shield size={16} aria-hidden />
                <span>{config.serverNotice}</span>
              </div>
            )}
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
              <span className="upload-title">
                {selectedFile ? selectedFile.name : config.uploadTitle}
              </span>
              {config.uploadHint && !selectedFile && (
                <span className="upload-hint">{config.uploadHint}</span>
              )}
              {selectedFile && (
                <span className="upload-hint">
                  {formatFileSize(selectedFile.size)} — click to change file
                </span>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={config.accept}
                multiple={config.multiple}
                className="upload-input"
                aria-hidden
                onChange={(e) => handleFileChange(e.target.files)}
              />
            </button>

            {config.compressionMode === 'pdf' ? (
              <div className="tool-controls">
                <label className="tool-control-label" htmlFor="pdf-level">
                  Compression level
                </label>
                <select
                  id="pdf-level"
                  className="tool-select"
                  value={pdfLevel}
                  onChange={(e) => setPdfLevel(e.target.value as PdfLevel)}
                  disabled={isProcessing}
                >
                  <option value="low">Low — best quality</option>
                  <option value="medium">Medium — balanced</option>
                  <option value="high">High — smallest size</option>
                </select>
              </div>
            ) : showQualityControl ? (
              <div className="tool-controls">
                <label className="tool-control-label" htmlFor="quality">
                  Quality: {quality}
                </label>
                <input
                  id="quality"
                  type="range"
                  min={10}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="tool-slider"
                  disabled={isProcessing}
                />
              </div>
            ) : null}

            <button
              type="button"
              className="tool-compress-btn"
              onClick={handleCompress}
              disabled={!selectedFile || isProcessing || isPreparingPreview}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="spin" aria-hidden />
                  {progressMessage ?? processingLabel}
                </>
              ) : isPreparingPreview ? (
                <>
                  <Loader2 size={18} className="spin" aria-hidden />
                  Loading preview…
                </>
              ) : (
                actionLabel
              )}
            </button>

            {error && <p className="tool-error">{error}</p>}

            {result && (
              <div className="tool-result">
                <p className="tool-result-stats">
                  {config.compressionMode === 'background' ? (
                    <>
                      Background removed successfully!{' '}
                      {formatFileSize(result.originalSize)} →{' '}
                      {formatFileSize(result.compressedSize)}
                    </>
                  ) : (
                    <>
                      {formatFileSize(result.originalSize)} →{' '}
                      {formatFileSize(result.compressedSize)}
                      {savingsPercent > 0 && (
                        <span className="tool-result-savings">
                          {' '}
                          ({savingsPercent}% smaller)
                        </span>
                      )}
                    </>
                  )}
                </p>
                <button
                  type="button"
                  className="tool-download-btn"
                  onClick={handleDownload}
                >
                  <Download size={18} aria-hidden />
                  {downloadLabel}
                </button>
              </div>
            )}

            {previewUrl && config.compressionMode !== 'pdf' && (
              <div className="tool-preview">
                <img
                  src={previewUrl}
                  alt={
                    config.compressionMode === 'background' && result
                      ? 'Background removed preview'
                      : 'Image preview'
                  }
                />
              </div>
            )}

            {config.donateInsideCard && donateBar}
          </div>

          {!config.donateInsideCard && donateBar}

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
