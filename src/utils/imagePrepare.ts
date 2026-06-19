import heic2any from 'heic2any'
import { isHeicFile } from './heicConvert'

export { isHeicFile }

const SUPPORTED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.heic',
  '.heif',
  '.avif',
  '.bmp',
  '.tif',
  '.tiff',
  '.gif',
])

export function getFileExtension(filename: string): string {
  const dot = filename.lastIndexOf('.')
  if (dot === -1) return ''
  return filename.slice(dot).toLowerCase()
}

export function isSupportedImageFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true
  return SUPPORTED_EXTENSIONS.has(getFileExtension(file.name))
}

function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not load image preview.'))
    img.src = url
  })
}

async function canvasToPngBlob(img: HTMLImageElement): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Could not prepare image for processing.')
  }
  ctx.drawImage(img, 0, 0)
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), 'image/png')
  })
  if (!blob) {
    throw new Error('Could not prepare image for processing.')
  }
  return blob
}

async function convertHeicToPng(file: File): Promise<Blob> {
  const converted = await heic2any({ blob: file, toType: 'image/png' })
  const blob = Array.isArray(converted) ? converted[0] : converted
  if (!blob) {
    throw new Error('Could not convert HEIC image. The file may be corrupted.')
  }
  return blob
}

async function normalizeToPngBlob(file: File): Promise<Blob> {
  if (isHeicFile(file)) {
    return convertHeicToPng(file)
  }

  if (
    file.type === 'image/png' ||
    file.type === 'image/jpeg' ||
    file.type === 'image/webp' ||
    file.type === 'image/gif' ||
    file.type === 'image/bmp' ||
    file.type === 'image/avif' ||
    file.type === 'image/tiff'
  ) {
    return file
  }

  const url = URL.createObjectURL(file)
  try {
    const img = await loadImageElement(url)
    return await canvasToPngBlob(img)
  } finally {
    URL.revokeObjectURL(url)
  }
}

function buildPreparedFilename(file: File): string {
  const base = file.name.replace(/\.[^.]+$/, '') || 'image'
  return `${base}.png`
}

export type PreparedImage = {
  file: File
  previewUrl: string
}

export async function prepareImageForProcessing(file: File): Promise<PreparedImage> {
  if (!isSupportedImageFile(file)) {
    throw new Error(
      'Unsupported file format. Please upload JPG, PNG, WebP, HEIC, HEIF, AVIF, BMP, TIFF, or GIF.',
    )
  }

  const pngBlob = await normalizeToPngBlob(file)
  const preparedFile = new File([pngBlob], buildPreparedFilename(file), {
    type: 'image/png',
  })
  const previewUrl = URL.createObjectURL(pngBlob)

  return { file: preparedFile, previewUrl }
}

export async function getImageDimensionsFromUrl(
  url: string,
): Promise<{ width: number; height: number }> {
  const img = await loadImageElement(url)
  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
  }
}

export async function getUploadableImageFile(file: File): Promise<File> {
  if (isHeicFile(file)) {
    const prepared = await prepareImageForProcessing(file)
    URL.revokeObjectURL(prepared.previewUrl)
    return prepared.file
  }
  return file
}

export async function createImagePreviewUrl(file: File): Promise<string | null> {
  if (isHeicFile(file)) {
    const pngBlob = await convertHeicToPng(file)
    return URL.createObjectURL(pngBlob)
  }

  if (file.type.startsWith('image/')) {
    return URL.createObjectURL(file)
  }

  try {
    const prepared = await prepareImageForProcessing(file)
    return prepared.previewUrl
  } catch {
    return null
  }
}
