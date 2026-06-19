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
import {
  convertVideoToMp3Api,
  type VideoToMp3Result,
} from '../api/videoToMp3'
import { videoToMp3Config, whyCrafvia } from '../config/tools'
import type { AudioBitrate } from '../utils/videoToMp3'
import {
  formatDuration,
  formatResolution,
  getVideoMetadata,
  isSupportedVideoFile,
  type VideoMetadata,
} from '../utils/videoInfo'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import './CompressImage.css'

const config = videoToMp3Config
const MAX_FILE_BYTES = 100 * 1024 * 1024

const BITRATE_OPTIONS: AudioBitrate[] = [64, 128, 192, 256, 320]

export function VideoToMp3Page() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null)
  const [bitrate, setBitrate] = useState<AudioBitrate>(192)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPreparingPreview, setIsPreparingPreview] = useState(false)
  const [progressMessage, setProgressMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<VideoToMp3Result | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetPreview = (url: string | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(url)
  }

  const handleFileChange = (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return

    if (!isSupportedVideoFile(file)) {
      setError(
        'Unsupported file format. Please upload MP4, MOV, AVI, MKV, WebM, M4V, FLV, MPEG, MPG, 3GP, or WMV.',
      )
      setSelectedFile(null)
      setMetadata(null)
      setResult(null)
      resetPreview(null)
      return
    }

    if (file.size > MAX_FILE_BYTES) {
      setError('File exceeds 100MB limit. Try a smaller video.')
      setSelectedFile(null)
      setMetadata(null)
      setResult(null)
      resetPreview(null)
      return
    }

    setSelectedFile(file)
    setResult(null)
    setError(null)
    resetPreview(URL.createObjectURL(file))
    setIsPreparingPreview(true)

    void getVideoMetadata(file)
      .then((info) => setMetadata(info))
      .catch(() => {
        setMetadata({
          duration: Number.NaN,
          width: 0,
          height: 0,
          canPreview: false,
        })
      })
      .finally(() => {
        setIsPreparingPreview(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
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

  const handleConvert = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setError(null)
    setResult(null)
    setProgressMessage(null)

    try {
      const convertResult = await convertVideoToMp3Api(selectedFile, bitrate, {
        onStatus: setProgressMessage,
        onProgress: setProgressMessage,
        metadata: metadata ?? undefined,
      })
      setResult(convertResult)
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

  const uploadZoneClass = [
    'upload-zone',
    selectedFile ? 'upload-zone-has-file' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const showVideoPreview = previewUrl && metadata?.canPreview && !result

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
                  {formatFileSize(selectedFile.size)} — click to change file
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

            <div className="tool-controls">
              <label className="tool-control-label" htmlFor="audio-bitrate">
                Audio quality
              </label>
              <select
                id="audio-bitrate"
                className="tool-select"
                value={bitrate}
                onChange={(e) => setBitrate(Number(e.target.value) as AudioBitrate)}
                disabled={!selectedFile || isProcessing}
              >
                {BITRATE_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value} kbps
                  </option>
                ))}
              </select>
            </div>

            <div className="tool-controls">
              <label className="tool-control-label" htmlFor="output-format">
                Output format
              </label>
              <select
                id="output-format"
                className="tool-select"
                value="mp3"
                disabled
              >
                <option value="mp3">MP3</option>
              </select>
            </div>

            <button
              type="button"
              className="tool-compress-btn"
              onClick={handleConvert}
              disabled={!selectedFile || isProcessing || isPreparingPreview}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="spin" aria-hidden />
                  {progressMessage ?? config.processingLabel}
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
                  Audio extracted successfully! {formatFileSize(result.originalSize)} →{' '}
                  {formatFileSize(result.outputSize)} MP3 at {bitrate} kbps
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

            {showVideoPreview && (
              <div className="tool-preview">
                <video src={previewUrl} controls preload="metadata" />
              </div>
            )}

            {previewUrl && metadata && !metadata.canPreview && !result && (
              <div className="tool-controls">
                <label className="tool-control-label">Preview</label>
                <span className="pdf-file-meta">
                  Inline preview is unavailable for this format, but conversion is still supported.
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
