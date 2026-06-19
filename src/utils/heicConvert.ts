import heic2any from 'heic2any'
import type { CompressResult } from '../api/compress'

export function isHeicFile(file: File): boolean {
  const name = file.name.toLowerCase()
  return (
    name.endsWith('.heic') ||
    file.type === 'image/heic' ||
    file.type === 'image/heif'
  )
}

export type HeicConvertOptions = {
  file: File
  quality: number
}

export async function convertHeicToJpg({
  file,
  quality,
}: HeicConvertOptions): Promise<CompressResult> {
  if (!isHeicFile(file)) {
    throw new Error('Please select a valid HEIC file (.heic or .HEIC).')
  }

  const jpegQuality = Math.min(1, Math.max(0.1, quality / 100))

  const converted = await heic2any({
    blob: file,
    toType: 'image/jpeg',
    quality: jpegQuality,
  })

  const blob = Array.isArray(converted) ? converted[0] : converted
  if (!blob) {
    throw new Error('Conversion failed. The file may be corrupted or unsupported.')
  }

  const baseName = file.name.replace(/\.heic$/i, '') || 'converted'
  const filename = `${baseName}.jpg`

  return {
    blob,
    originalSize: file.size,
    compressedSize: blob.size,
    filename,
  }
}
