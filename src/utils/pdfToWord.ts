import { extractedPdfToDocxBlob } from './pdfBlocksToDocx'
import { pdfFileToVisualDocx } from './pdfPagesToDocx'
import { extractStructuredPdf } from './pdfTextExtract'
import { isExtractedTextUnreliable } from './pdfTextQuality'

export type PdfToWordResult = {
  blob: Blob
  filename: string
  originalSize: number
  outputSize: number
  pageCount: number
  mode: 'text' | 'visual'
}

export async function pdfFileToWord(
  file: File,
  password?: string,
): Promise<PdfToWordResult> {
  const base = file.name.replace(/\.pdf$/i, '') || 'document'
  const document = await extractStructuredPdf(file, { password })

  if (isExtractedTextUnreliable(document)) {
    const visual = await pdfFileToVisualDocx(file, base, { password })
    return {
      blob: visual.blob,
      filename: visual.filename,
      originalSize: file.size,
      outputSize: visual.blob.size,
      pageCount: visual.pageCount,
      mode: 'visual',
    }
  }

  const { blob, filename } = await extractedPdfToDocxBlob(document, base)

  return {
    blob,
    filename,
    originalSize: file.size,
    outputSize: blob.size,
    pageCount: document.pageCount,
    mode: 'text',
  }
}
