import { execFile } from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { findGhostscript } from './pdfCompress.js'

const execFileAsync = promisify(execFile)

export type PdfProtectResult = {
  buffer: Buffer
  originalSize: number
  outputSize: number
}

export async function protectPdf(
  input: Buffer,
  userPassword: string,
  ownerPassword?: string,
): Promise<PdfProtectResult> {
  const gs = await findGhostscript()
  if (!gs) {
    throw new Error(
      'Ghostscript is not installed. Install it from https://ghostscript.com/releases/gsdnld.html to enable PDF encryption.',
    )
  }

  if (!userPassword.trim()) {
    throw new Error('Password is required.')
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'crafvia-pdf-protect-'))
  const inputPath = path.join(tempDir, 'input.pdf')
  const outputPath = path.join(tempDir, 'output.pdf')

  try {
    await fs.writeFile(inputPath, input)

    await execFileAsync(gs, [
      '-sDEVICE=pdfwrite',
      '-dCompatibilityLevel=1.4',
      '-dNOPAUSE',
      '-dQUIET',
      '-dBATCH',
      '-dEncryptionR=3',
      '-dPermissions=-4',
      `-sOwnerPassword=${ownerPassword?.trim() || userPassword}`,
      `-sUserPassword=${userPassword}`,
      `-sOutputFile=${outputPath}`,
      inputPath,
    ])

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

export async function unlockPdf(
  input: Buffer,
  password: string,
): Promise<PdfProtectResult> {
  const gs = await findGhostscript()
  if (!gs) {
    throw new Error(
      'Ghostscript is not installed. Install it from https://ghostscript.com/releases/gsdnld.html to enable PDF unlocking.',
    )
  }

  if (!password.trim()) {
    throw new Error('Password is required.')
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'crafvia-pdf-unlock-'))
  const inputPath = path.join(tempDir, 'input.pdf')
  const outputPath = path.join(tempDir, 'output.pdf')

  try {
    await fs.writeFile(inputPath, input)

    await execFileAsync(gs, [
      '-sDEVICE=pdfwrite',
      '-dCompatibilityLevel=1.4',
      '-dNOPAUSE',
      '-dQUIET',
      '-dBATCH',
      `-sPDFPassword=${password}`,
      `-sOutputFile=${outputPath}`,
      inputPath,
    ])

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
