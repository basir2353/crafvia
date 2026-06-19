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
import { type DragEvent, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatFileSize } from '../api/compress'
import { openDonatePage } from '../api/config'
import { resizeImage, type OutputFormat, type ResizeResult } from '../api/resize'
import { imageResizerConfig, whyCrafvia } from '../config/tools'
import {
  createImagePreviewUrl,
  getImageDimensionsFromUrl,
  getUploadableImageFile,
  isSupportedImageFile,
} from '../utils/imagePrepare'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import './CompressImage.css'

const config = imageResizerConfig
const MAX_FILE_BYTES = 20 * 1024 * 1024

const PRESETS = {
  custom: null,
  '100x100': { width: 100, height: 100 },
  '250x250': { width: 250, height: 250 },
  '500x500': { width: 500, height: 500 },
  '800x600': { width: 800, height: 600 },
  '1024x768': { width: 1024, height: 768 },
  '1280x720': { width: 1280, height: 720 },
  '1920x1080': { width: 1920, height: 1080 },
} as const

type PresetKey = keyof typeof PRESETS
type ResizeMode = 'dimensions' | 'percent'

export function ImageResizerPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [originalWidth, setOriginalWidth] = useState(0)
  const [originalHeight, setOriginalHeight] = useState(0)
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [lockAspectRatio, setLockAspectRatio] = useState(true)
  const [resizeMode, setResizeMode] = useState<ResizeMode>('dimensions')
  const [percent, setPercent] = useState(100)
  const [preset, setPreset] = useState<PresetKey>('custom')
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpeg')
  const [quality, setQuality] = useState(90)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPreparingPreview, setIsPreparingPreview] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ResizeResult | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const aspectRatio =
    originalWidth > 0 && originalHeight > 0 ? originalWidth / originalHeight : 1

  const resetPreview = (url: string | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(url)
  }

  const applyDimensions = (nextWidth: number, nextHeight: number) => {
    setWidth(String(nextWidth))
    setHeight(String(nextHeight))
    setPreset('custom')
  }

  const handleWidthChange = (value: string) => {
    setWidth(value)
    setPreset('custom')
    if (resizeMode === 'dimensions' && lockAspectRatio) {
      const nextWidth = Number(value)
      if (Number.isFinite(nextWidth) && nextWidth > 0) {
        setHeight(String(Math.max(1, Math.round(nextWidth / aspectRatio))))
      }
    }
  }

  const handleHeightChange = (value: string) => {
    setHeight(value)
    setPreset('custom')
    if (resizeMode === 'dimensions' && lockAspectRatio) {
      const nextHeight = Number(value)
      if (Number.isFinite(nextHeight) && nextHeight > 0) {
        setWidth(String(Math.max(1, Math.round(nextHeight * aspectRatio))))
      }
    }
  }

  const handlePercentChange = (value: number) => {
    setPercent(value)
    setPreset('custom')
    if (originalWidth > 0 && originalHeight > 0) {
      applyDimensions(
        Math.max(1, Math.round((originalWidth * value) / 100)),
        Math.max(1, Math.round((originalHeight * value) / 100)),
      )
    }
  }

  const handlePresetChange = (value: PresetKey) => {
    setPreset(value)
    setResizeMode('dimensions')
    const next = PRESETS[value]
    if (next) {
      applyDimensions(next.width, next.height)
    }
  }

  const handleFileChange = (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return

    if (!isSupportedImageFile(file)) {
      setError(
        'Unsupported file format. Please upload JPG, PNG, WebP, HEIC, HEIF, AVIF, BMP, TIFF, or GIF.',
      )
      setSelectedFile(null)
      setResult(null)
      resetPreview(null)
      return
    }

    if (file.size > MAX_FILE_BYTES) {
      setError('File exceeds 20MB limit. Try a smaller image.')
      setSelectedFile(null)
      setResult(null)
      resetPreview(null)
      return
    }

    setSelectedFile(file)
    setResult(null)
    setError(null)
    resetPreview(null)
    setIsPreparingPreview(true)

    void createImagePreviewUrl(file)
      .then(async (url) => {
        if (!url) {
          throw new Error('Could not load image preview.')
        }
        resetPreview(url)
        const dims = await getImageDimensionsFromUrl(url)
        setOriginalWidth(dims.width)
        setOriginalHeight(dims.height)
        setWidth(String(dims.width))
        setHeight(String(dims.height))
        setPercent(100)
        setPreset('custom')
        setResizeMode('dimensions')
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Could not load image preview.')
      })
      .finally(() => {
        setIsPreparingPreview(false)
      })
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

  const handleResize = async () => {
    if (!selectedFile) return

    const targetWidth = Number(width)
    const targetHeight = Number(height)

    if (!Number.isFinite(targetWidth) || !Number.isFinite(targetHeight)) {
      setError('Enter valid width and height values.')
      return
    }

    if (targetWidth < 1 || targetHeight < 1) {
      setError('Width and height must be at least 1 pixel.')
      return
    }

    if (targetWidth > 10000 || targetHeight > 10000) {
      setError('Maximum dimension is 10000 pixels.')
      return
    }

    setIsProcessing(true)
    setError(null)
    setResult(null)

    try {
      const uploadFile = await getUploadableImageFile(selectedFile)
      const resizeResult = await resizeImage({
        file: uploadFile,
        width: targetWidth,
        height: targetHeight,
        lockAspectRatio: resizeMode === 'percent' ? true : lockAspectRatio,
        format: outputFormat,
        quality,
      })

      setResult(resizeResult)
      resetPreview(URL.createObjectURL(resizeResult.blob))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsProcessing(false)
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

  const showQuality = outputFormat === 'jpeg' || outputFormat === 'webp'
  const uploadZoneClass = [
    'upload-zone',
    selectedFile ? 'upload-zone-has-file' : '',
  ]
    .filter(Boolean)
    .join(' ')

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
                  {formatFileSize(selectedFile.size)}
                  {originalWidth > 0 && originalHeight > 0 && (
                    <> — {originalWidth} × {originalHeight}px</>
                  )}
                  {' '}
                  — click to change file
                </span>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={config.accept}
                className="upload-input"
                aria-hidden
                onChange={(e) => handleFileChange(e.target.files)}
              />
            </button>

            {selectedFile && originalWidth > 0 && (
              <div className="tool-controls">
                <label className="tool-control-label">
                  Original dimensions: {originalWidth} × {originalHeight} pixels
                </label>
              </div>
            )}

            <div className="tool-controls">
              <label className="tool-control-label" htmlFor="resize-mode">
                Resize mode
              </label>
              <select
                id="resize-mode"
                className="tool-select"
                value={resizeMode}
                onChange={(e) => {
                  const mode = e.target.value as ResizeMode
                  setResizeMode(mode)
                  if (mode === 'percent') {
                    handlePercentChange(percent)
                  }
                }}
                disabled={!selectedFile || isProcessing}
              >
                <option value="dimensions">Custom dimensions</option>
                <option value="percent">By percentage</option>
              </select>
            </div>

            {resizeMode === 'percent' ? (
              <div className="tool-controls">
                <label className="tool-control-label" htmlFor="resize-percent">
                  Scale: {percent}%
                </label>
                <input
                  id="resize-percent"
                  type="range"
                  min={1}
                  max={200}
                  value={percent}
                  onChange={(e) => handlePercentChange(Number(e.target.value))}
                  className="tool-slider"
                  disabled={!selectedFile || isProcessing}
                />
              </div>
            ) : (
              <>
                <div className="tool-controls">
                  <label className="tool-control-label" htmlFor="resize-preset">
                    Preset size
                  </label>
                  <select
                    id="resize-preset"
                    className="tool-select"
                    value={preset}
                    onChange={(e) => handlePresetChange(e.target.value as PresetKey)}
                    disabled={!selectedFile || isProcessing}
                  >
                    <option value="custom">Custom dimensions</option>
                    <option value="100x100">100 × 100</option>
                    <option value="250x250">250 × 250</option>
                    <option value="500x500">500 × 500</option>
                    <option value="800x600">800 × 600</option>
                    <option value="1024x768">1024 × 768</option>
                    <option value="1280x720">1280 × 720 (HD)</option>
                    <option value="1920x1080">1920 × 1080 (Full HD)</option>
                  </select>
                </div>

                <div className="tool-controls">
                  <label className="tool-control-label" htmlFor="resize-width">
                    Width (px)
                  </label>
                  <input
                    id="resize-width"
                    type="number"
                    min={1}
                    max={10000}
                    className="tool-select"
                    value={width}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    disabled={!selectedFile || isProcessing}
                  />
                </div>

                <div className="tool-controls">
                  <label className="tool-control-label" htmlFor="resize-height">
                    Height (px)
                  </label>
                  <input
                    id="resize-height"
                    type="number"
                    min={1}
                    max={10000}
                    className="tool-select"
                    value={height}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    disabled={!selectedFile || isProcessing}
                  />
                </div>

                <div className="tool-controls">
                  <label className="tool-control-label" htmlFor="aspect-lock">
                    Aspect ratio
                  </label>
                  <select
                    id="aspect-lock"
                    className="tool-select"
                    value={lockAspectRatio ? 'locked' : 'unlocked'}
                    onChange={(e) =>
                      setLockAspectRatio(e.target.value === 'locked')
                    }
                    disabled={!selectedFile || isProcessing}
                  >
                    <option value="locked">Locked — prevent distortion</option>
                    <option value="unlocked">Unlocked — exact dimensions</option>
                  </select>
                </div>
              </>
            )}

            <div className="tool-controls">
              <label className="tool-control-label" htmlFor="output-format">
                Output format
              </label>
              <select
                id="output-format"
                className="tool-select"
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                disabled={!selectedFile || isProcessing}
              >
                <option value="jpeg">JPG</option>
                <option value="png">PNG (preserves transparency)</option>
                <option value="webp">WebP</option>
              </select>
            </div>

            {showQuality && (
              <div className="tool-controls">
                <label className="tool-control-label" htmlFor="resize-quality">
                  Quality: {quality}
                </label>
                <input
                  id="resize-quality"
                  type="range"
                  min={10}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="tool-slider"
                  disabled={!selectedFile || isProcessing}
                />
              </div>
            )}

            <button
              type="button"
              className="tool-compress-btn"
              onClick={handleResize}
              disabled={!selectedFile || isProcessing || isPreparingPreview}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="spin" aria-hidden />
                  {config.processingLabel}
                </>
              ) : isPreparingPreview ? (
                <>
                  <Loader2 size={18} className="spin" aria-hidden />
                  Loading preview…
                </>
              ) : (
                config.actionLabel
              )}
            </button>

            {error && <p className="tool-error">{error}</p>}

            {result && (
              <div className="tool-result">
                <p className="tool-result-stats">
                  Image resized successfully! {result.width} × {result.height}px —{' '}
                  {formatFileSize(result.originalSize)} →{' '}
                  {formatFileSize(result.outputSize)}
                </p>
                <button
                  type="button"
                  className="tool-download-btn"
                  onClick={handleDownload}
                >
                  <Download size={18} aria-hidden />
                  {config.downloadLabel}
                </button>
              </div>
            )}

            {previewUrl && (
              <div className="tool-preview">
                <img
                  src={previewUrl}
                  alt={result ? 'Resized image preview' : 'Image preview'}
                />
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
