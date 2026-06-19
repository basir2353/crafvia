import { PDFDocument } from 'pdf-lib'
import { mergePdfFiles } from '../utils/pdfMerge'

export type MergePdfResult = {
  blob: Blob
  filename: string
  originalSize: number
  outputSize: number
  totalPages: number
}

async function recordMergeJob(originalSize: number, outputSize: number) {
  const token = localStorage.getItem('crafvia_access_token')
  if (!token) return

  try {
    await fetch('/api/pdf/merge/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ originalSize, outputSize }),
    })
  } catch {
    // Job history is optional and should not block downloads.
  }
}

export async function mergePdfs(files: File[]): Promise<MergePdfResult> {
  const originalSize = files.reduce((sum, file) => sum + file.size, 0)
  const blob = await mergePdfFiles(files)
  const mergedPdf = await PDFDocument.load(await blob.arrayBuffer())
  void recordMergeJob(originalSize, blob.size)

  return {
    blob,
    filename: 'merged-document.pdf',
    originalSize,
    outputSize: blob.size,
    totalPages: mergedPdf.getPageCount(),
  }
}
