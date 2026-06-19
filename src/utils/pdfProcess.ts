import {
  PDFDocument,
  type PDFDocument as PDFDocumentType,
  degrees,
  type PDFPage,
} from 'pdf-lib'
import {
  getPdfPageCount,
  isPdfFile,
  validatePdfSignature,
} from './pdfMerge'

export type PdfProcessResult = {
  blob: Blob
  filename: string
  originalSize: number
  outputSize: number
  pageCount?: number
}

export type PdfLoadOptions = {
  password?: string
}

export { isPdfFile, getPdfPageCount, validatePdfSignature }

export function downloadPdfBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

async function loadPdfDocument(
  file: File,
  _options?: PdfLoadOptions,
): Promise<PDFDocumentType> {
  await validatePdfSignature(file)
  const bytes = await file.arrayBuffer()
  try {
    return await PDFDocument.load(bytes, { ignoreEncryption: false })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not read PDF.'
    if (message.toLowerCase().includes('password') || message.toLowerCase().includes('encrypt')) {
      throw new Error('Incorrect password or encrypted PDF.')
    }
    throw new Error('Invalid or corrupted PDF file.')
  }
}

async function saveDocument(
  doc: PDFDocumentType,
  filename: string,
  originalSize: number,
): Promise<PdfProcessResult> {
  const bytes = await doc.save()
  const copy = new Uint8Array(bytes.length)
  copy.set(bytes)
  const blob = new Blob([copy], { type: 'application/pdf' })
  return {
    blob,
    filename,
    originalSize,
    outputSize: blob.size,
    pageCount: doc.getPageCount(),
  }
}

export function parsePageRanges(input: string, totalPages: number): number[] {
  const trimmed = input.trim()
  if (!trimmed) throw new Error('Enter a page range.')

  const pages = new Set<number>()
  const parts = trimmed.split(',').map((part) => part.trim()).filter(Boolean)

  for (const part of parts) {
    if (part.includes('-')) {
      const [startRaw, endRaw] = part.split('-')
      const start = Number(startRaw)
      const end = Number(endRaw)
      if (!Number.isFinite(start) || !Number.isFinite(end)) {
        throw new Error(`Invalid range: ${part}`)
      }
      const from = Math.min(start, end)
      const to = Math.max(start, end)
      for (let page = from; page <= to; page += 1) {
        if (page >= 1 && page <= totalPages) pages.add(page - 1)
      }
    } else {
      const page = Number(part)
      if (!Number.isFinite(page) || page < 1 || page > totalPages) {
        throw new Error(`Invalid page number: ${part}`)
      }
      pages.add(page - 1)
    }
  }

  if (pages.size === 0) throw new Error('No valid pages in range.')
  return [...pages].sort((a, b) => a - b)
}

export async function splitPdfFile(
  file: File,
  pageRange: string,
  options?: PdfLoadOptions,
): Promise<PdfProcessResult> {
  const source = await loadPdfDocument(file, options)
  const indices = parsePageRanges(pageRange, source.getPageCount())
  const output = await PDFDocument.create()
  const pages = await output.copyPages(source, indices)
  pages.forEach((page) => output.addPage(page))
  const base = file.name.replace(/\.pdf$/i, '') || 'document'
  return saveDocument(output, `${base}-split.pdf`, file.size)
}

export async function rotatePdfFile(
  file: File,
  rotation: 90 | 180 | 270,
  options?: PdfLoadOptions,
): Promise<PdfProcessResult> {
  const doc = await loadPdfDocument(file, options)
  const pages = doc.getPages()
  pages.forEach((page: PDFPage) => {
    const current = page.getRotation().angle
    page.setRotation(degrees(current + rotation))
  })
  const base = file.name.replace(/\.pdf$/i, '') || 'document'
  return saveDocument(doc, `${base}-rotated.pdf`, file.size)
}

export async function reorderPdfFile(
  file: File,
  order: number[],
  options?: PdfLoadOptions,
): Promise<PdfProcessResult> {
  const source = await loadPdfDocument(file, options)
  const total = source.getPageCount()
  if (order.length !== total) {
    throw new Error(`Provide an order for all ${total} pages.`)
  }
  const seen = new Set(order)
  if (seen.size !== total || order.some((index) => index < 0 || index >= total)) {
    throw new Error('Invalid page order.')
  }

  const output = await PDFDocument.create()
  const pages = await output.copyPages(source, order)
  pages.forEach((page) => output.addPage(page))

  const base = file.name.replace(/\.pdf$/i, '') || 'document'
  return saveDocument(output, `${base}-reordered.pdf`, file.size)
}

export async function deletePdfPages(
  file: File,
  pagesToDelete: number[],
  options?: PdfLoadOptions,
): Promise<PdfProcessResult> {
  const source = await loadPdfDocument(file, options)
  const total = source.getPageCount()
  const deleteSet = new Set(pagesToDelete)
  const keep = [...Array(total).keys()].filter((index) => !deleteSet.has(index))
  if (keep.length === 0) throw new Error('Cannot delete all pages.')

  const output = await PDFDocument.create()
  const pages = await output.copyPages(source, keep)
  pages.forEach((page) => output.addPage(page))
  const base = file.name.replace(/\.pdf$/i, '') || 'document'
  return saveDocument(output, `${base}-edited.pdf`, file.size)
}

export type PdfMetadata = {
  title: string
  author: string
  subject: string
  keywords: string
  creator: string
  producer: string
}

export async function readPdfMetadata(
  file: File,
  options?: PdfLoadOptions,
): Promise<PdfMetadata> {
  const doc = await loadPdfDocument(file, options)
  return {
    title: doc.getTitle() ?? '',
    author: doc.getAuthor() ?? '',
    subject: doc.getSubject() ?? '',
    keywords: (doc.getKeywords() ?? '').toString(),
    creator: doc.getCreator() ?? '',
    producer: doc.getProducer() ?? '',
  }
}

export async function updatePdfMetadata(
  file: File,
  metadata: PdfMetadata,
  options?: PdfLoadOptions,
): Promise<PdfProcessResult> {
  const doc = await loadPdfDocument(file, options)
  doc.setTitle(metadata.title)
  doc.setAuthor(metadata.author)
  doc.setSubject(metadata.subject)
  doc.setKeywords(
    metadata.keywords
      ? metadata.keywords.split(',').map((keyword) => keyword.trim()).filter(Boolean)
      : [],
  )
  doc.setCreator(metadata.creator)
  doc.setProducer(metadata.producer)
  const base = file.name.replace(/\.pdf$/i, '') || 'document'
  return saveDocument(doc, `${base}-metadata.pdf`, file.size)
}

export async function unlockPdfFile(
  file: File,
  password: string,
): Promise<PdfProcessResult> {
  const { unlockPdf } = await import('../api/unlockPdf')
  const result = await unlockPdf({ file, password })
  return {
    blob: result.blob,
    filename: result.filename,
    originalSize: result.originalSize,
    outputSize: result.outputSize,
  }
}
