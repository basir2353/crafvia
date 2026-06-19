import { execFile } from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export type PdfCompressionLevel = 'low' | 'medium' | 'high'

const PDF_SETTINGS: Record<PdfCompressionLevel, string> = {
  low: '/printer',
  medium: '/ebook',
  high: '/screen',
}

const GHOSTSCRIPT_COMMANDS = [
  'gswin64c',
  'gswin32c',
  'gs',
]

export type PdfCompressResult = {
  buffer: Buffer
  originalSize: number
  compressedSize: number
}

export async function findGhostscript(): Promise<string | null> {
  for (const command of GHOSTSCRIPT_COMMANDS) {
    try {
      await execFileAsync(command, ['--version'])
      return command
    } catch {
      // try next candidate
    }
  }
  return null
}

export async function compressPdf(
  input: Buffer,
  level: PdfCompressionLevel,
): Promise<PdfCompressResult> {
  const gs = await findGhostscript()
  if (!gs) {
    throw new Error(
      'Ghostscript is not installed. Install it from https://ghostscript.com/releases/gsdnld.html to enable PDF compression.',
    )
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'crafvia-pdf-'))
  const inputPath = path.join(tempDir, 'input.pdf')
  const outputPath = path.join(tempDir, 'output.pdf')

  try {
    await fs.writeFile(inputPath, input)

    await execFileAsync(gs, [
      '-sDEVICE=pdfwrite',
      '-dCompatibilityLevel=1.4',
      `-dPDFSETTINGS=${PDF_SETTINGS[level]}`,
      '-dNOPAUSE',
      '-dQUIET',
      '-dBATCH',
      `-sOutputFile=${outputPath}`,
      inputPath,
    ])

    const buffer = await fs.readFile(outputPath)

    return {
      buffer,
      originalSize: input.length,
      compressedSize: buffer.length,
    }
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true })
  }
}
