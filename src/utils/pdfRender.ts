import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import JSZip from 'jszip'
import type { PdfLoadOptions } from './pdfProcess'
import {
  documentToPlainText,
  extractStructuredPdf,
} from './pdfTextExtract'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

export type PdfImageFormat = 'png' | 'jpeg'

async function loadPdfDocument(file: File, password?: string) {
  const data = new Uint8Array(await file.arrayBuffer())
  const loadingTask = pdfjsLib.getDocument({
    data,
    password,
    useSystemFonts: true,
  })
  return loadingTask.promise
}

async function renderPageToCanvas(
  page: pdfjsLib.PDFPageProxy,
  scale: number,
): Promise<HTMLCanvasElement> {
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Could not create canvas context.')

  canvas.width = viewport.width
  canvas.height = viewport.height

  await page.render({ canvasContext: context, viewport, canvas }).promise
  return canvas
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: PdfImageFormat,
  quality = 0.92,
): Promise<Blob> {
  const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png'
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not export image.'))),
      mime,
      quality,
    )
  })
}

export async function pdfToImagesZip(
  file: File,
  format: PdfImageFormat = 'png',
  options?: PdfLoadOptions,
): Promise<{ blob: Blob; filename: string; pageCount: number }> {
  const pdf = await loadPdfDocument(file, options?.password)
  const zip = new JSZip()
  const ext = format === 'jpeg' ? 'jpg' : 'png'
  const base = file.name.replace(/\.pdf$/i, '') || 'document'

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum)
    const canvas = await renderPageToCanvas(page, 2)
    const imageBlob = await canvasToBlob(canvas, format)
    zip.file(`page-${pageNum}.${ext}`, imageBlob)
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  return { blob, filename: `${base}-images.zip`, pageCount: pdf.numPages }
}

export async function extractPdfTextContent(
  file: File,
  options?: PdfLoadOptions,
): Promise<{ text: string; pageCount: number; document: Awaited<ReturnType<typeof extractStructuredPdf>> }> {
  const document = await extractStructuredPdf(file, options)
  return {
    text: documentToPlainText(document),
    pageCount: document.pageCount,
    document,
  }
}
