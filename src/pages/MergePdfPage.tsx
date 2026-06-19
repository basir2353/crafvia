import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Coffee,
  Download,
  Eye,
  GripVertical,
  Loader2,
  Trash2,
  Upload,
} from 'lucide-react'
import { type DragEvent, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatFileSize } from '../api/compress'
import { openDonatePage } from '../api/config'
import { mergePdfs, type MergePdfResult } from '../api/mergePdf'
import { mergePdfConfig, whyCrafvia } from '../config/tools'
import { getPdfPageCount, isPdfFile } from '../utils/pdfMerge'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import './CompressImage.css'

const config = mergePdfConfig
const MAX_FILE_BYTES = 20 * 1024 * 1024
const MAX_FILES = 50

type PdfUploadItem = {
  id: string
  file: File
  pageCount: number | null
  previewUrl: string
  isLoading: boolean
  error: string | null
}

export function MergePdfPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [items, setItems] = useState<PdfUploadItem[]>([])
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAddingFiles, setIsAddingFiles] = useState(false)
  const [addProgress, setAddProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<MergePdfResult | null>(null)
  const [mergedPreviewUrl, setMergedPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const revokeItemPreview = (item: PdfUploadItem) => {
    URL.revokeObjectURL(item.previewUrl)
  }

  const resetMergedPreview = (url: string | null) => {
    if (mergedPreviewUrl) URL.revokeObjectURL(mergedPreviewUrl)
    setMergedPreviewUrl(url)
  }

  const createItemFromFile = async (file: File): Promise<PdfUploadItem> => {
    const previewUrl = URL.createObjectURL(file)
    const item: PdfUploadItem = {
      id: crypto.randomUUID(),
      file,
      pageCount: null,
      previewUrl,
      isLoading: true,
      error: null,
    }

    try {
      const pageCount = await getPdfPageCount(file)
      return { ...item, pageCount, isLoading: false }
    } catch (err) {
      URL.revokeObjectURL(previewUrl)
      throw err
    }
  }

  const addFiles = async (files: FileList | File[]) => {
    const incoming = Array.from(files)
    if (incoming.length === 0) return

    if (items.length + incoming.length > MAX_FILES) {
      setError(`You can merge up to ${MAX_FILES} PDF files at once.`)
      return
    }

    setError(null)
    setResult(null)
    resetMergedPreview(null)
    setIsAddingFiles(true)

    const validItems: PdfUploadItem[] = []

    try {
      for (let i = 0; i < incoming.length; i++) {
        const file = incoming[i]!
        setAddProgress(`Validating ${i + 1} of ${incoming.length}…`)

        if (!isPdfFile(file)) {
          throw new Error(`"${file.name}" is not a PDF file.`)
        }

        if (file.size > MAX_FILE_BYTES) {
          throw new Error(`"${file.name}" exceeds the 20MB file size limit.`)
        }

        validItems.push(await createItemFromFile(file))
      }

      setItems((current) => [...current, ...validItems])
      if (validItems.length === 1) {
        setPreviewId(validItems[0]!.id)
      }
    } catch (err) {
      validItems.forEach(revokeItemPreview)
      setError(err instanceof Error ? err.message : 'Could not add PDF file.')
    } finally {
      setIsAddingFiles(false)
      setAddProgress(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleFileChange = (files: FileList | null) => {
    if (!files) return
    void addFiles(files)
  }

  const handleDragOver = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (isProcessing || isAddingFiles) return
    void addFiles(event.dataTransfer.files)
  }

  const handleRemove = (id: string) => {
    setItems((current) => {
      const next = current.filter((item) => {
        if (item.id === id) {
          revokeItemPreview(item)
          return false
        }
        return true
      })
      return next
    })
    if (previewId === id) setPreviewId(null)
    setResult(null)
    resetMergedPreview(null)
  }

  const handleItemDragStart = (index: number) => {
    setDragIndex(index)
  }

  const handleItemDragOver = (event: DragEvent<HTMLLIElement>, index: number) => {
    event.preventDefault()
    if (dragIndex === null || dragIndex === index) return

    setItems((current) => {
      const next = [...current]
      const [moved] = next.splice(dragIndex, 1)
      if (!moved) return current
      next.splice(index, 0, moved)
      return next
    })
    setDragIndex(index)
  }

  const handleItemDragEnd = () => {
    setDragIndex(null)
  }

  const handleMerge = async () => {
    const readyItems = items.filter((item) => !item.isLoading && !item.error)

    if (readyItems.length < 2) {
      setError('Add at least two PDF files to merge.')
      return
    }

    setIsProcessing(true)
    setError(null)
    setResult(null)
    resetMergedPreview(null)
    setPreviewId(null)

    try {
      const mergeResult = await mergePdfs(readyItems.map((item) => item.file))
      setResult(mergeResult)
      resetMergedPreview(URL.createObjectURL(mergeResult.blob))
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

  const activePreviewItem = items.find((item) => item.id === previewId)
  const previewUrl = result ? mergedPreviewUrl : activePreviewItem?.previewUrl ?? null
  const totalPages = items.reduce(
    (sum, item) => sum + (item.pageCount ?? 0),
    0,
  )

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
    'upload-zone-pdf',
    items.length > 0 ? 'upload-zone-has-file' : '',
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

          <div className="upload-outer upload-outer-pdf upload-outer-with-donate">
            <button
              type="button"
              className={uploadZoneClass}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              disabled={isProcessing || isAddingFiles}
            >
              <span className="upload-icon-wrap">
                <Upload size={28} strokeWidth={2} aria-hidden />
              </span>
              <span className="upload-title">
                {items.length > 0
                  ? `${items.length} PDF${items.length === 1 ? '' : 's'} selected — add more`
                  : config.uploadTitle}
              </span>
              {config.uploadHint && items.length === 0 && (
                <span className="upload-hint">{config.uploadHint}</span>
              )}
              {items.length > 0 && (
                <span className="upload-hint">
                  {totalPages > 0 && <>{totalPages} total pages — </>}
                  drag files to reorder below
                </span>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={config.accept}
                multiple
                className="upload-input"
                aria-hidden
                onChange={(e) => handleFileChange(e.target.files)}
              />
            </button>

            {items.length > 0 && (
              <ul className="pdf-file-list">
                {items.map((item, index) => (
                  <li
                    key={item.id}
                    className={`pdf-file-item ${dragIndex === index ? 'pdf-file-item-dragging' : ''}`}
                    draggable={!isProcessing && !isAddingFiles}
                    onDragStart={() => handleItemDragStart(index)}
                    onDragOver={(event) => handleItemDragOver(event, index)}
                    onDragEnd={handleItemDragEnd}
                  >
                    <span className="pdf-file-order" aria-hidden>
                      {index + 1}
                    </span>
                    <GripVertical size={18} aria-hidden className="related-tool-arrow" />
                    <div className="pdf-file-info">
                      <span className="pdf-file-name">{item.file.name}</span>
                      <span className="pdf-file-meta">
                        {item.isLoading
                          ? 'Loading…'
                          : item.error
                            ? item.error
                            : `${item.pageCount ?? 0} pages — ${formatFileSize(item.file.size)}`}
                      </span>
                    </div>
                    <div className="pdf-file-actions">
                      <button
                        type="button"
                        className="pdf-file-action-btn"
                        aria-label={`Preview ${item.file.name}`}
                        onClick={() => {
                          setPreviewId(item.id)
                          setResult(null)
                          resetMergedPreview(null)
                        }}
                        disabled={item.isLoading || isProcessing}
                      >
                        <Eye size={18} aria-hidden />
                      </button>
                      <button
                        type="button"
                        className="pdf-file-action-btn"
                        aria-label={`Remove ${item.file.name}`}
                        onClick={() => handleRemove(item.id)}
                        disabled={isProcessing || isAddingFiles}
                      >
                        <Trash2 size={18} aria-hidden />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              className="tool-compress-btn"
              onClick={handleMerge}
              disabled={
                items.length < 2 || isProcessing || isAddingFiles || items.some((i) => i.isLoading)
              }
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="spin" aria-hidden />
                  {config.processingLabel}
                </>
              ) : isAddingFiles ? (
                <>
                  <Loader2 size={18} className="spin" aria-hidden />
                  {addProgress ?? 'Adding files…'}
                </>
              ) : (
                config.actionLabel
              )}
            </button>

            {error && <p className="tool-error">{error}</p>}

            {result && (
              <div className="tool-result">
                <p className="tool-result-stats">
                  PDFs merged successfully! {result.totalPages} pages —{' '}
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
                <iframe
                  src={previewUrl}
                  title={result ? 'Merged PDF preview' : 'PDF preview'}
                  className="pdf-preview-frame"
                />
              </div>
            )}

            {donateBar}
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
