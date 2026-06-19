import {
  AlignmentType,
  Document,
  ImageRun,
  Packer,
  PageBreak,
  Paragraph,
} from 'docx'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import type { PdfLoadOptions } from './pdfProcess'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

const RENDER_SCALE = 2
const DOCX_IMAGE_WIDTH = 620

async function loadPdfDocument(file: File, password?: string) {
  const data = new Uint8Array(await file.arrayBuffer())
  return pdfjsLib.getDocument({ data, password, useSystemFonts: true }).promise
}

async function renderPageToPng(page: pdfjsLib.PDFPageProxy): Promise<{
  bytes: Uint8Array
  width: number
  height: number
}> {
  const viewport = page.getViewport({ scale: RENDER_SCALE })
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Could not create canvas context.')

  canvas.width = viewport.width
  canvas.height = viewport.height

  await page.render({ canvasContext: context, viewport, canvas }).promise

  const pngBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Could not render PDF page.'))
          return
        }
        void blob.arrayBuffer().then(resolve).catch(reject)
      },
      'image/png',
      0.92,
    )
  })

  return {
    bytes: new Uint8Array(pngBuffer),
    width: canvas.width,
    height: canvas.height,
  }
}

export async function pdfFileToVisualDocx(
  file: File,
  filenameBase: string,
  options?: PdfLoadOptions,
): Promise<{ blob: Blob; filename: string; pageCount: number }> {
  const pdf = await loadPdfDocument(file, options?.password)
  const children: Paragraph[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const { bytes, width, height } = await renderPageToPng(page)
    const displayHeight = Math.round((height / width) * DOCX_IMAGE_WIDTH)

    if (pageNumber > 1) {
      children.push(new Paragraph({ children: [new PageBreak()] }))
    }

    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            type: 'png',
            data: bytes,
            transformation: {
              width: DOCX_IMAGE_WIDTH,
              height: displayHeight,
            },
            altText: {
              title: `Page ${pageNumber}`,
              description: `PDF page ${pageNumber}`,
              name: `page-${pageNumber}`,
            },
          }),
        ],
      }),
    )
  }

  const doc = new Document({
    sections: [{ properties: {}, children }],
  })

  const blob = await Packer.toBlob(doc)
  return {
    blob,
    filename: `${filenameBase}.docx`,
    pageCount: pdf.numPages,
  }
}
