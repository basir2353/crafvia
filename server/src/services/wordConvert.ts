import { execFile } from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const LIBREOFFICE_COMMANDS = [
  'soffice',
  'libreoffice',
  'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
  'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
]

export type WordConvertResult = {
  buffer: Buffer
  originalSize: number
  outputSize: number
}

async function findLibreOffice(): Promise<string | null> {
  for (const command of LIBREOFFICE_COMMANDS) {
    try {
      await execFileAsync(command, ['--version'])
      return command
    } catch {
      // try next candidate
    }
  }
  return null
}

export async function convertWordToPdf(
  input: Buffer,
  extension: '.doc' | '.docx',
): Promise<WordConvertResult> {
  const libreOffice = await findLibreOffice()
  if (!libreOffice) {
    throw new Error(
      extension === '.doc'
        ? 'Legacy .doc files require LibreOffice on the server. Install LibreOffice or upload a .docx file.'
        : 'Server conversion is unavailable. Install LibreOffice for higher-fidelity Word to PDF conversion.',
    )
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'crafvia-word-'))
  const inputPath = path.join(tempDir, `input${extension}`)
  const outputPath = path.join(tempDir, 'input.pdf')

  try {
    await fs.writeFile(inputPath, input)

    await execFileAsync(
      libreOffice,
      [
        '--headless',
        '--nologo',
        '--nofirststartwizard',
        '--convert-to',
        'pdf',
        '--outdir',
        tempDir,
        inputPath,
      ],
      { timeout: 120_000 },
    )

    const buffer = await fs.readFile(outputPath)

    return {
      buffer,
      originalSize: input.length,
      outputSize: buffer.length,
    }
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true })
  }
}
