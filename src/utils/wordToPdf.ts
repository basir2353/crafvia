import mammoth from 'mammoth'
import { htmlStringToPdf } from './htmlToPdf'

export type WordToPdfResult = {
  blob: Blob
  filename: string
  originalSize: number
  outputSize: number
  pageCount: number
}

const MAMMOTH_STYLE_MAP = [
  "p[style-name='Title'] => h1.doc-title:fresh",
  "p[style-name='Heading 1'] => h1:fresh",
  "p[style-name='Heading 2'] => h2:fresh",
  "p[style-name='Heading 3'] => h3:fresh",
  "p[style-name='heading 1'] => h1:fresh",
  "p[style-name='heading 2'] => h2:fresh",
  "p[style-name='heading 3'] => h3:fresh",
  "r[style-name='Strong'] => strong",
  "r[style-name='Emphasis'] => em",
]

export function isDocxFile(file: File): boolean {
  const name = file.name.toLowerCase()
  return (
    name.endsWith('.docx') ||
    file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )
}

export function isDocFile(file: File): boolean {
  const name = file.name.toLowerCase()
  return name.endsWith('.doc') || file.type === 'application/msword'
}

export function isWordFile(file: File): boolean {
  return isDocxFile(file) || isDocFile(file)
}

async function convertDocxClientSide(file: File): Promise<WordToPdfResult> {
  const arrayBuffer = await file.arrayBuffer()
  const { value: html, messages } = await mammoth.convertToHtml(
    { arrayBuffer },
    { styleMap: MAMMOTH_STYLE_MAP },
  )

  const warnings = messages.filter((message) => message.type === 'warning')
  if (!html.trim()) {
    throw new Error('Could not read any content from the Word document.')
  }

  const base = file.name.replace(/\.(docx|doc)$/i, '') || 'document'
  const result = await htmlStringToPdf(html, `${base}.pdf`)

  if (warnings.length > 0 && result.pageCount === 0) {
    throw new Error('Word conversion produced an empty PDF.')
  }

  return {
    blob: result.blob,
    filename: result.filename,
    originalSize: file.size,
    outputSize: result.outputSize,
    pageCount: result.pageCount,
  }
}

export async function wordFileToPdf(file: File): Promise<WordToPdfResult> {
  if (!isWordFile(file)) {
    throw new Error('Please upload a .doc or .docx Word document.')
  }

  if (isDocFile(file)) {
    const { convertWordToPdfServer } = await import('../api/wordToPdf')
    return convertWordToPdfServer(file)
  }

  try {
    return await convertDocxClientSide(file)
  } catch (clientError) {
    try {
      const { convertWordToPdfServer } = await import('../api/wordToPdf')
      return await convertWordToPdfServer(file)
    } catch {
      throw clientError instanceof Error
        ? clientError
        : new Error('Word conversion failed.')
    }
  }
}
