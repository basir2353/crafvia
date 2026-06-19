import { PDFDocument } from 'pdf-lib'

const PDF_SIGNATURE = '%PDF'

export function isPdfFile(file: File): boolean {
  return (
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  )
}

export async function validatePdfSignature(file: File): Promise<void> {
  const header = await file.slice(0, 5).arrayBuffer()
  const signature = String.fromCharCode(...new Uint8Array(header))
  if (!signature.startsWith(PDF_SIGNATURE)) {
    throw new Error('Invalid or corrupted PDF file.')
  }
}

export async function getPdfPageCount(file: File): Promise<number> {
  await validatePdfSignature(file)
  const bytes = await file.arrayBuffer()
  try {
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: false })
    return pdf.getPageCount()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not read PDF.'
    if (message.toLowerCase().includes('encrypt')) {
      throw new Error('Password-protected PDFs cannot be merged. Unlock the file first.')
    }
    throw new Error('Invalid or corrupted PDF file.')
  }
}

export async function mergePdfFiles(files: File[]): Promise<Blob> {
  if (files.length < 2) {
    throw new Error('Add at least two PDF files to merge.')
  }

  const merged = await PDFDocument.create()

  for (const file of files) {
    await validatePdfSignature(file)
    const bytes = await file.arrayBuffer()
    let pdf: PDFDocument
    try {
      pdf = await PDFDocument.load(bytes, { ignoreEncryption: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not read PDF.'
      if (message.toLowerCase().includes('encrypt')) {
        throw new Error(`"${file.name}" is password-protected. Unlock it before merging.`)
      }
      throw new Error(`"${file.name}" is invalid or corrupted.`)
    }

    const pageIndices = pdf.getPageIndices()
    const pages = await merged.copyPages(pdf, pageIndices)
    pages.forEach((page) => merged.addPage(page))
  }

  const mergedBytes = await merged.save()
  const copy = new Uint8Array(mergedBytes.length)
  copy.set(mergedBytes)
  return new Blob([copy], { type: 'application/pdf' })
}
