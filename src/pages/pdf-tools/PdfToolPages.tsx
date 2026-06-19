import { GripVertical } from 'lucide-react'
import { type DragEvent, useEffect, useState } from 'react'
import { formatPdfStats, protectPdf } from '../../api/protectPdf'
import { PdfToolShell } from '../../components/PdfToolShell'
import {
  deletePdfPagesConfig,
  extractPdfTextConfig,
  htmlToPdfConfig,
  pdfMetadataConfig,
  pdfToImageConfig,
  pdfToWordConfig,
  protectPdfConfig,
  reorderPdfConfig,
  rotatePdfConfig,
  splitPdfConfig,
  unlockPdfConfig,
  wordToPdfConfig,
} from '../../config/pdfTools'
import { htmlStringToPdf } from '../../utils/htmlToPdf'
import {
  deletePdfPages,
  downloadPdfBlob,
  parsePageRanges,
  readPdfMetadata,
  reorderPdfFile,
  rotatePdfFile,
  splitPdfFile,
  unlockPdfFile,
  updatePdfMetadata,
  type PdfMetadata,
  type PdfProcessResult,
} from '../../utils/pdfProcess'
import { extractedPdfToDocxBlob } from '../../utils/pdfBlocksToDocx'
import { pdfFileToVisualDocx } from '../../utils/pdfPagesToDocx'
import { extractPdfTextContent, pdfToImagesZip, type PdfImageFormat } from '../../utils/pdfRender'
import { pdfFileToWord } from '../../utils/pdfToWord'
import { isExtractedTextUnreliable } from '../../utils/pdfTextQuality'
import { getPdfPageCount, isPdfFile } from '../../utils/pdfMerge'
import { isWordFile, wordFileToPdf } from '../../utils/wordToPdf'

const MAX_FILE_BYTES = 20 * 1024 * 1024
const ACCEPT_PDF = 'application/pdf,.pdf'

type ResultState = PdfProcessResult & { stats: string }

function useSinglePdfUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [pageCount, setPageCount] = useState<number | null>(null)
  const [isPreparingPreview, setIsPreparingPreview] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetPreview = (url: string | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(url)
  }

  const handleFileChange = (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return

    if (!isPdfFile(file)) {
      setError('Please upload a PDF file.')
      setSelectedFile(null)
      resetPreview(null)
      setPageCount(null)
      return
    }

    if (file.size > MAX_FILE_BYTES) {
      setError('File exceeds 20MB limit.')
      setSelectedFile(null)
      resetPreview(null)
      setPageCount(null)
      return
    }

    setSelectedFile(file)
    setError(null)
    setIsPreparingPreview(true)

    void getPdfPageCount(file)
      .then((count) => {
        setPageCount(count)
        resetPreview(URL.createObjectURL(file))
      })
      .catch((err) => {
        setSelectedFile(null)
        resetPreview(null)
        setPageCount(null)
        setError(err instanceof Error ? err.message : 'Could not load PDF.')
      })
      .finally(() => setIsPreparingPreview(false))
  }

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    },
    [previewUrl],
  )

  return {
    selectedFile,
    previewUrl,
    pageCount,
    isPreparingPreview,
    error,
    setError,
    handleFileChange,
    resetPreview,
  }
}

function resultStats(result: { originalSize: number; outputSize: number }, extra?: string): string {
  return formatPdfStats(result.originalSize, result.outputSize, extra)
}

export function SplitPdfPage() {
  const upload = useSinglePdfUpload()
  const [pageRange, setPageRange] = useState('1')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ResultState | null>(null)

  const handleAction = async () => {
    if (!upload.selectedFile) return
    setIsProcessing(true)
    upload.setError(null)
    setResult(null)
    try {
      const output = await splitPdfFile(upload.selectedFile, pageRange)
      upload.resetPreview(URL.createObjectURL(output.blob))
      setResult({ ...output, stats: resultStats(output, 'Split complete!') })
    } catch (err) {
      upload.setError(err instanceof Error ? err.message : 'Split failed.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <PdfToolShell
      config={splitPdfConfig}
      accept={ACCEPT_PDF}
      selectedFile={upload.selectedFile}
      onFileChange={upload.handleFileChange}
      isProcessing={isProcessing}
      isPreparingPreview={upload.isPreparingPreview}
      error={upload.error}
      previewUrl={upload.previewUrl}
      resultStats={result?.stats ?? null}
      onDownload={result ? () => downloadPdfBlob(result.blob, result.filename) : undefined}
      onAction={handleAction}
      actionDisabled={!upload.selectedFile || !pageRange.trim()}
    >
      {upload.pageCount !== null && (
        <p className="tool-text-counts">{upload.pageCount} pages detected</p>
      )}
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="split-range">Pages to extract</label>
        <input
          id="split-range"
          type="text"
          className="tool-input"
          value={pageRange}
          onChange={(e) => setPageRange(e.target.value)}
          placeholder="e.g. 1-3,5,7"
          disabled={isProcessing}
        />
      </div>
    </PdfToolShell>
  )
}

export function PdfToImagePage() {
  const upload = useSinglePdfUpload()
  const [format, setFormat] = useState<PdfImageFormat>('png')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<(PdfProcessResult & { stats: string }) | null>(null)

  const handleAction = async () => {
    if (!upload.selectedFile) return
    setIsProcessing(true)
    upload.setError(null)
    setResult(null)
    try {
      const output = await pdfToImagesZip(upload.selectedFile, format)
      setResult({
        blob: output.blob,
        filename: output.filename,
        originalSize: upload.selectedFile.size,
        outputSize: output.blob.size,
        pageCount: output.pageCount,
        stats: `Converted ${output.pageCount} pages to ${format.toUpperCase()} images.`,
      })
    } catch (err) {
      upload.setError(err instanceof Error ? err.message : 'Conversion failed.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <PdfToolShell
      config={pdfToImageConfig}
      accept={ACCEPT_PDF}
      selectedFile={upload.selectedFile}
      onFileChange={upload.handleFileChange}
      isProcessing={isProcessing}
      isPreparingPreview={upload.isPreparingPreview}
      error={upload.error}
      previewUrl={upload.previewUrl}
      resultStats={result?.stats ?? null}
      onDownload={result ? () => downloadPdfBlob(result.blob, result.filename) : undefined}
      onAction={handleAction}
      actionDisabled={!upload.selectedFile}
    >
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="img-format">Image format</label>
        <select
          id="img-format"
          className="tool-select"
          value={format}
          onChange={(e) => setFormat(e.target.value as PdfImageFormat)}
          disabled={isProcessing}
        >
          <option value="png">PNG</option>
          <option value="jpeg">JPG</option>
        </select>
      </div>
    </PdfToolShell>
  )
}

export function RotatePdfPage() {
  const upload = useSinglePdfUpload()
  const [rotation, setRotation] = useState<90 | 180 | 270>(90)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ResultState | null>(null)

  const handleAction = async () => {
    if (!upload.selectedFile) return
    setIsProcessing(true)
    upload.setError(null)
    setResult(null)
    try {
      const output = await rotatePdfFile(upload.selectedFile, rotation)
      upload.resetPreview(URL.createObjectURL(output.blob))
      setResult({ ...output, stats: resultStats(output, 'Rotated successfully!') })
    } catch (err) {
      upload.setError(err instanceof Error ? err.message : 'Rotation failed.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <PdfToolShell
      config={rotatePdfConfig}
      accept={ACCEPT_PDF}
      selectedFile={upload.selectedFile}
      onFileChange={upload.handleFileChange}
      isProcessing={isProcessing}
      isPreparingPreview={upload.isPreparingPreview}
      error={upload.error}
      previewUrl={upload.previewUrl}
      resultStats={result?.stats ?? null}
      onDownload={result ? () => downloadPdfBlob(result.blob, result.filename) : undefined}
      onAction={handleAction}
      actionDisabled={!upload.selectedFile}
    >
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="rotate-angle">Rotation</label>
        <select
          id="rotate-angle"
          className="tool-select"
          value={rotation}
          onChange={(e) => setRotation(Number(e.target.value) as 90 | 180 | 270)}
          disabled={isProcessing}
        >
          <option value={90}>90° clockwise</option>
          <option value={180}>180°</option>
          <option value={270}>270° clockwise</option>
        </select>
      </div>
    </PdfToolShell>
  )
}

export function ProtectPdfPage() {
  const upload = useSinglePdfUpload()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ResultState | null>(null)

  const handleAction = async () => {
    if (!upload.selectedFile) return
    if (!password.trim()) {
      upload.setError('Enter a password.')
      return
    }
    if (password !== confirmPassword) {
      upload.setError('Passwords do not match.')
      return
    }

    setIsProcessing(true)
    upload.setError(null)
    setResult(null)
    try {
      const output = await protectPdf({ file: upload.selectedFile, password })
      upload.resetPreview(URL.createObjectURL(output.blob))
      setResult({
        blob: output.blob,
        filename: output.filename,
        originalSize: output.originalSize,
        outputSize: output.compressedSize,
        stats: resultStats(
          { originalSize: output.originalSize, outputSize: output.compressedSize },
          'PDF protected successfully!',
        ),
      })
    } catch (err) {
      upload.setError(err instanceof Error ? err.message : 'Protection failed.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <PdfToolShell
      config={protectPdfConfig}
      accept={ACCEPT_PDF}
      selectedFile={upload.selectedFile}
      onFileChange={upload.handleFileChange}
      isProcessing={isProcessing}
      isPreparingPreview={upload.isPreparingPreview}
      error={upload.error}
      previewUrl={upload.previewUrl}
      resultStats={result?.stats ?? null}
      onDownload={result ? () => downloadPdfBlob(result.blob, result.filename) : undefined}
      onAction={handleAction}
      actionDisabled={!upload.selectedFile || !password}
    >
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="protect-pass">Password</label>
        <input id="protect-pass" type="password" className="tool-input" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isProcessing} />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="protect-confirm">Confirm password</label>
        <input id="protect-confirm" type="password" className="tool-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isProcessing} />
      </div>
    </PdfToolShell>
  )
}

export function UnlockPdfPage() {
  const upload = useSinglePdfUpload()
  const [password, setPassword] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ResultState | null>(null)

  const handleAction = async () => {
    if (!upload.selectedFile) return
    if (!password.trim()) {
      upload.setError('Enter the PDF password.')
      return
    }

    setIsProcessing(true)
    upload.setError(null)
    setResult(null)
    try {
      const output = await unlockPdfFile(upload.selectedFile, password)
      upload.resetPreview(URL.createObjectURL(output.blob))
      setResult({ ...output, stats: resultStats(output, 'PDF unlocked successfully!') })
    } catch (err) {
      upload.setError(err instanceof Error ? err.message : 'Unlock failed.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <PdfToolShell
      config={unlockPdfConfig}
      accept={ACCEPT_PDF}
      selectedFile={upload.selectedFile}
      onFileChange={upload.handleFileChange}
      isProcessing={isProcessing}
      isPreparingPreview={upload.isPreparingPreview}
      error={upload.error}
      previewUrl={upload.previewUrl}
      resultStats={result?.stats ?? null}
      onDownload={result ? () => downloadPdfBlob(result.blob, result.filename) : undefined}
      onAction={handleAction}
      actionDisabled={!upload.selectedFile || !password}
    >
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="unlock-pass">Current password</label>
        <input id="unlock-pass" type="password" className="tool-input" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isProcessing} />
      </div>
    </PdfToolShell>
  )
}

export function HtmlToPdfPage() {
  const [html, setHtml] = useState('<h1>Hello World</h1><p>Your HTML content here.</p>')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ResultState | null>(null)

  useEffect(() => {
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [html])

  const handleAction = async () => {
    setIsProcessing(true)
    setError(null)
    setResult(null)
    try {
      const output = await htmlStringToPdf(html)
      setResult({ ...output, stats: resultStats(output, 'PDF created successfully!') })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <PdfToolShell
      config={htmlToPdfConfig}
      accept={ACCEPT_PDF}
      selectedFile={null}
      onFileChange={() => {}}
      isProcessing={isProcessing}
      error={error}
      previewUrl={previewUrl}
      previewMode="pdf"
      resultStats={result?.stats ?? null}
      onDownload={result ? () => downloadPdfBlob(result.blob, result.filename) : undefined}
      onAction={handleAction}
      actionDisabled={!html.trim()}
      showUpload={false}
    >
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="html-input">HTML content</label>
        <textarea
          id="html-input"
          className="tool-textarea"
          rows={10}
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          disabled={isProcessing}
        />
      </div>
    </PdfToolShell>
  )
}

export function PdfToWordPage() {
  const upload = useSinglePdfUpload()
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ResultState | null>(null)

  const handleAction = async () => {
    if (!upload.selectedFile) return
    setIsProcessing(true)
    upload.setError(null)
    setResult(null)
    try {
      const output = await pdfFileToWord(upload.selectedFile)
      const modeMessage =
        output.mode === 'visual'
          ? `Converted ${output.pageCount} page${output.pageCount === 1 ? '' : 's'} with visual layout preserved.`
          : `Converted ${output.pageCount} page${output.pageCount === 1 ? '' : 's'} with editable text.`
      setResult({ ...output, stats: resultStats(output, modeMessage) })
    } catch (err) {
      upload.setError(err instanceof Error ? err.message : 'Conversion failed.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <PdfToolShell
      config={pdfToWordConfig}
      accept={ACCEPT_PDF}
      selectedFile={upload.selectedFile}
      onFileChange={upload.handleFileChange}
      isProcessing={isProcessing}
      isPreparingPreview={upload.isPreparingPreview}
      error={upload.error}
      previewUrl={upload.previewUrl}
      resultStats={result?.stats ?? null}
      onDownload={result ? () => downloadPdfBlob(result.blob, result.filename) : undefined}
      onAction={handleAction}
      actionDisabled={!upload.selectedFile}
    />
  )
}

export function WordToPdfPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ResultState | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const resetPreview = (url: string | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(url)
  }

  const handleFileChange = (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    if (!isWordFile(file)) {
      setError('Please upload a .doc or .docx Word document.')
      setSelectedFile(null)
      resetPreview(null)
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      setError('File exceeds 20MB limit.')
      setSelectedFile(null)
      resetPreview(null)
      return
    }
    setSelectedFile(file)
    setError(null)
    setResult(null)
    resetPreview(null)
  }

  const handleAction = async () => {
    if (!selectedFile) return
    setIsProcessing(true)
    setError(null)
    setResult(null)
    resetPreview(null)
    try {
      const output = await wordFileToPdf(selectedFile)
      resetPreview(URL.createObjectURL(output.blob))
      setResult({
        ...output,
        stats: resultStats(
          output,
          `Converted to PDF successfully! ${output.pageCount} page${output.pageCount === 1 ? '' : 's'}.`,
        ),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed.')
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    },
    [previewUrl],
  )

  return (
    <PdfToolShell
      config={wordToPdfConfig}
      accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      selectedFile={selectedFile}
      onFileChange={handleFileChange}
      isProcessing={isProcessing}
      error={error}
      previewUrl={previewUrl}
      resultStats={result?.stats ?? null}
      onDownload={result ? () => downloadPdfBlob(result.blob, result.filename) : undefined}
      onAction={handleAction}
      actionDisabled={!selectedFile}
    />
  )
}

export function ExtractPdfTextPage() {
  const upload = useSinglePdfUpload()
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedText, setExtractedText] = useState<string | null>(null)
  const [result, setResult] = useState<{
    stats: string
    txtFilename: string
    txtBlob: Blob
    docxFilename: string
    docxBlob: Blob
  } | null>(null)

  const handleAction = async () => {
    if (!upload.selectedFile) return
    setIsProcessing(true)
    upload.setError(null)
    setExtractedText(null)
    setResult(null)
    try {
      const { text, pageCount, document } = await extractPdfTextContent(upload.selectedFile)
      const base = upload.selectedFile.name.replace(/\.pdf$/i, '') || 'document'
      const unreliable = isExtractedTextUnreliable(document)
      const txtBlob = new Blob([text], { type: 'text/plain;charset=utf-8' })
      const docx = unreliable
        ? await pdfFileToVisualDocx(upload.selectedFile, base)
        : await extractedPdfToDocxBlob(document, base)

      setExtractedText(
        unreliable
          ? 'This PDF uses fonts that cannot be converted to editable text. Download the DOCX to get a readable visual copy of each page.'
          : text,
      )
      setResult({
        txtBlob,
        txtFilename: `${base}.txt`,
        docxBlob: docx.blob,
        docxFilename: docx.filename,
        stats: unreliable
          ? `Visual copy prepared for ${pageCount} page${pageCount === 1 ? '' : 's'}.`
          : `Extracted text from ${pageCount} page${pageCount === 1 ? '' : 's'}.`,
      })
    } catch (err) {
      upload.setError(err instanceof Error ? err.message : 'Extraction failed.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <PdfToolShell
      config={extractPdfTextConfig}
      accept={ACCEPT_PDF}
      selectedFile={upload.selectedFile}
      onFileChange={upload.handleFileChange}
      isProcessing={isProcessing}
      isPreparingPreview={upload.isPreparingPreview}
      error={upload.error}
      previewUrl={upload.previewUrl}
      previewMode={extractedText ? 'text' : 'pdf'}
      previewText={extractedText}
      onPreviewTextChange={(value) => setExtractedText(value)}
      resultStats={result?.stats ?? null}
      onDownload={result ? () => downloadPdfBlob(result.txtBlob, result.txtFilename) : undefined}
      extraDownloads={
        result
          ? [
              {
                label: 'Download DOCX',
                onClick: () => downloadPdfBlob(result.docxBlob, result.docxFilename),
              },
            ]
          : undefined
      }
      onAction={handleAction}
      actionDisabled={!upload.selectedFile}
    />
  )
}

export function ReorderPdfPage() {
  const upload = useSinglePdfUpload()
  const [pageOrder, setPageOrder] = useState<number[]>([])
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ResultState | null>(null)

  useEffect(() => {
    if (upload.pageCount !== null) {
      setPageOrder([...Array(upload.pageCount).keys()])
      setResult(null)
    } else {
      setPageOrder([])
    }
  }, [upload.pageCount, upload.selectedFile])

  const handleItemDragStart = (index: number) => setDragIndex(index)

  const handleItemDragOver = (event: DragEvent<HTMLLIElement>, index: number) => {
    event.preventDefault()
    if (dragIndex === null || dragIndex === index) return
    setPageOrder((current) => {
      const next = [...current]
      const [moved] = next.splice(dragIndex, 1)
      if (moved === undefined) return current
      next.splice(index, 0, moved)
      return next
    })
    setDragIndex(index)
  }

  const handleAction = async () => {
    if (!upload.selectedFile || pageOrder.length === 0) return
    setIsProcessing(true)
    upload.setError(null)
    setResult(null)
    try {
      const output = await reorderPdfFile(upload.selectedFile, pageOrder)
      upload.resetPreview(URL.createObjectURL(output.blob))
      setResult({ ...output, stats: resultStats(output, 'Pages reordered successfully!') })
    } catch (err) {
      upload.setError(err instanceof Error ? err.message : 'Reorder failed.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <PdfToolShell
      config={reorderPdfConfig}
      accept={ACCEPT_PDF}
      selectedFile={upload.selectedFile}
      onFileChange={upload.handleFileChange}
      isProcessing={isProcessing}
      isPreparingPreview={upload.isPreparingPreview}
      error={upload.error}
      previewUrl={upload.previewUrl}
      resultStats={result?.stats ?? null}
      onDownload={result ? () => downloadPdfBlob(result.blob, result.filename) : undefined}
      onAction={handleAction}
      actionDisabled={!upload.selectedFile || pageOrder.length === 0}
    >
      {pageOrder.length > 0 && (
        <ul className="pdf-file-list">
          {pageOrder.map((pageIndex, index) => (
            <li
              key={pageIndex}
              className={`pdf-file-item ${dragIndex === index ? 'pdf-file-item-dragging' : ''}`}
              draggable={!isProcessing}
              onDragStart={() => handleItemDragStart(index)}
              onDragOver={(event) => handleItemDragOver(event, index)}
              onDragEnd={() => setDragIndex(null)}
            >
              <span className="pdf-file-order" aria-hidden>{index + 1}</span>
              <GripVertical size={18} aria-hidden className="related-tool-arrow" />
              <div className="pdf-file-info">
                <span className="pdf-file-name">Page {pageIndex + 1}</span>
                <span className="pdf-file-meta">Drag to reorder</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </PdfToolShell>
  )
}

export function DeletePdfPagesPage() {
  const upload = useSinglePdfUpload()
  const [pagesToDelete, setPagesToDelete] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ResultState | null>(null)

  const handleAction = async () => {
    if (!upload.selectedFile || upload.pageCount === null) return
    setIsProcessing(true)
    upload.setError(null)
    setResult(null)
    try {
      const indices = parsePageRanges(pagesToDelete, upload.pageCount)
      const output = await deletePdfPages(upload.selectedFile, indices)
      upload.resetPreview(URL.createObjectURL(output.blob))
      setResult({ ...output, stats: resultStats(output, 'Pages deleted successfully!') })
    } catch (err) {
      upload.setError(err instanceof Error ? err.message : 'Delete failed.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <PdfToolShell
      config={deletePdfPagesConfig}
      accept={ACCEPT_PDF}
      selectedFile={upload.selectedFile}
      onFileChange={upload.handleFileChange}
      isProcessing={isProcessing}
      isPreparingPreview={upload.isPreparingPreview}
      error={upload.error}
      previewUrl={upload.previewUrl}
      resultStats={result?.stats ?? null}
      onDownload={result ? () => downloadPdfBlob(result.blob, result.filename) : undefined}
      onAction={handleAction}
      actionDisabled={!upload.selectedFile || !pagesToDelete.trim()}
    >
      {upload.pageCount !== null && (
        <p className="tool-text-counts">{upload.pageCount} pages detected</p>
      )}
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="delete-pages">Pages to delete</label>
        <input
          id="delete-pages"
          type="text"
          className="tool-input"
          value={pagesToDelete}
          onChange={(e) => setPagesToDelete(e.target.value)}
          placeholder="e.g. 2,4,6-8"
          disabled={isProcessing}
        />
      </div>
    </PdfToolShell>
  )
}

const emptyMetadata: PdfMetadata = {
  title: '',
  author: '',
  subject: '',
  keywords: '',
  creator: '',
  producer: '',
}

export function PdfMetadataPage() {
  const upload = useSinglePdfUpload()
  const [metadata, setMetadata] = useState<PdfMetadata>(emptyMetadata)
  const [isLoadingMeta, setIsLoadingMeta] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ResultState | null>(null)

  useEffect(() => {
    if (!upload.selectedFile) {
      setMetadata(emptyMetadata)
      return
    }
    setIsLoadingMeta(true)
    void readPdfMetadata(upload.selectedFile)
      .then(setMetadata)
      .catch(() => upload.setError('Could not read PDF metadata.'))
      .finally(() => setIsLoadingMeta(false))
  }, [upload.selectedFile])

  const handleAction = async () => {
    if (!upload.selectedFile) return
    setIsProcessing(true)
    upload.setError(null)
    setResult(null)
    try {
      const output = await updatePdfMetadata(upload.selectedFile, metadata)
      upload.resetPreview(URL.createObjectURL(output.blob))
      setResult({ ...output, stats: resultStats(output, 'Metadata saved successfully!') })
    } catch (err) {
      upload.setError(err instanceof Error ? err.message : 'Save failed.')
    } finally {
      setIsProcessing(false)
    }
  }

  const field = (key: keyof PdfMetadata, label: string) => (
    <div className="tool-controls" key={key}>
      <label className="tool-control-label" htmlFor={`meta-${key}`}>{label}</label>
      <input
        id={`meta-${key}`}
        type="text"
        className="tool-input"
        value={metadata[key]}
        onChange={(e) => setMetadata((current) => ({ ...current, [key]: e.target.value }))}
        disabled={isProcessing || isLoadingMeta}
      />
    </div>
  )

  return (
    <PdfToolShell
      config={pdfMetadataConfig}
      accept={ACCEPT_PDF}
      selectedFile={upload.selectedFile}
      onFileChange={upload.handleFileChange}
      isProcessing={isProcessing}
      isPreparingPreview={upload.isPreparingPreview || isLoadingMeta}
      error={upload.error}
      previewUrl={upload.previewUrl}
      resultStats={result?.stats ?? null}
      onDownload={result ? () => downloadPdfBlob(result.blob, result.filename) : undefined}
      onAction={handleAction}
      actionDisabled={!upload.selectedFile || isLoadingMeta}
    >
      {upload.selectedFile && (
        <>
          {field('title', 'Title')}
          {field('author', 'Author')}
          {field('subject', 'Subject')}
          {field('keywords', 'Keywords (comma-separated)')}
          {field('creator', 'Creator')}
          {field('producer', 'Producer')}
        </>
      )}
    </PdfToolShell>
  )
}
