import { createImagePreviewUrl, getUploadableImageFile, isSupportedImageFile } from './imagePrepare'

export type ImageOutputFormat = 'jpeg' | 'png' | 'webp'

export type ProcessedImageResult = {
  blob: Blob
  filename: string
  originalSize: number
  outputSize: number
}

export type CropRect = {
  x: number
  y: number
  width: number
  height: number
}

const MIME: Record<ImageOutputFormat, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

const EXT: Record<ImageOutputFormat, string> = {
  jpeg: 'jpg',
  png: 'png',
  webp: 'webp',
}

export function formatSavings(original: number, output: number): number {
  if (original <= 0) return 0
  return Math.round((1 - output / original) * 100)
}

export function buildFilename(name: string, ext: string): string {
  const base = name.replace(/\.[^.]+$/, '') || 'image'
  return `${base}.${ext}`
}

function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not load image.'))
    img.src = url
  })
}

export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const uploadable = await getUploadableImageFile(file)
  const url = URL.createObjectURL(uploadable)
  try {
    return await loadImageElement(url)
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function createCanvas(width: number, height: number): {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
} {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not create canvas context.')
  return { canvas, ctx }
}

export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: ImageOutputFormat,
  quality = 0.92,
): Promise<Blob> {
  const mime = MIME[format]
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), mime, quality)
  })
  if (!blob) throw new Error('Could not export image.')
  return blob
}

export async function drawFileToCanvas(file: File): Promise<{
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  img: HTMLImageElement
}> {
  const img = await loadImageFromFile(file)
  const { canvas, ctx } = createCanvas(img.naturalWidth, img.naturalHeight)
  ctx.drawImage(img, 0, 0)
  return { canvas, ctx, img }
}

export async function convertImageFormat(
  file: File,
  format: ImageOutputFormat,
  quality = 0.92,
  backgroundColor = '#ffffff',
): Promise<ProcessedImageResult> {
  if (!isSupportedImageFile(file)) {
    throw new Error('Unsupported image format.')
  }

  const img = await loadImageFromFile(file)
  const { canvas, ctx } = createCanvas(img.naturalWidth, img.naturalHeight)

  const needsBackground = format === 'jpeg' || format === 'webp'
  if (needsBackground) {
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  ctx.drawImage(img, 0, 0)

  const blob = await canvasToBlob(canvas, format, quality)
  return {
    blob,
    filename: buildFilename(file.name, EXT[format]),
    originalSize: file.size,
    outputSize: blob.size,
  }
}

export async function rotateImageFile(
  file: File,
  options: {
    rotateLeft?: boolean
    rotateRight?: boolean
    flipHorizontal?: boolean
    flipVertical?: boolean
  },
): Promise<ProcessedImageResult> {
  const img = await loadImageFromFile(file)
  let angle = 0
  if (options.rotateLeft) angle -= 90
  if (options.rotateRight) angle += 90

  const radians = (angle * Math.PI) / 180
  const swap = Math.abs(angle) % 180 !== 0
  const width = swap ? img.naturalHeight : img.naturalWidth
  const height = swap ? img.naturalWidth : img.naturalHeight
  const { canvas, ctx } = createCanvas(width, height)

  ctx.translate(width / 2, height / 2)
  ctx.rotate(radians)
  ctx.scale(options.flipHorizontal ? -1 : 1, options.flipVertical ? -1 : 1)
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)

  const ext = getFileExtension(file.name) || 'png'
  const format = ext === 'jpg' || ext === 'jpeg' ? 'jpeg' : ext === 'webp' ? 'webp' : 'png'
  const blob = await canvasToBlob(canvas, format as ImageOutputFormat, 0.92)

  return {
    blob,
    filename: buildFilename(file.name, ext === 'jpeg' ? 'jpg' : ext),
    originalSize: file.size,
    outputSize: blob.size,
  }
}

export async function cropImageFile(
  file: File,
  crop: CropRect,
  format?: ImageOutputFormat,
): Promise<ProcessedImageResult> {
  const img = await loadImageFromFile(file)
  const { canvas, ctx } = createCanvas(crop.width, crop.height)
  ctx.drawImage(
    img,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height,
  )

  const ext = getFileExtension(file.name)
  const outputFormat =
    format ??
    (ext === 'jpg' || ext === 'jpeg' ? 'jpeg' : ext === 'webp' ? 'webp' : 'png')
  const blob = await canvasToBlob(canvas, outputFormat, 0.92)

  return {
    blob,
    filename: buildFilename(file.name, EXT[outputFormat]),
    originalSize: file.size,
    outputSize: blob.size,
  }
}

export async function blurImageFile(
  file: File,
  amount: number,
): Promise<ProcessedImageResult> {
  const { canvas, ctx, img } = await drawFileToCanvas(file)
  ctx.filter = `blur(${amount}px)`
  ctx.drawImage(img, 0, 0)
  ctx.filter = 'none'

  const ext = getFileExtension(file.name)
  const format = ext === 'jpg' || ext === 'jpeg' ? 'jpeg' : ext === 'webp' ? 'webp' : 'png'
  const blob = await canvasToBlob(canvas, format as ImageOutputFormat, 0.92)

  return {
    blob,
    filename: buildFilename(file.name, ext === 'jpeg' ? 'jpg' : ext),
    originalSize: file.size,
    outputSize: blob.size,
  }
}

export async function sharpenImageFile(
  file: File,
  amount: number,
): Promise<ProcessedImageResult> {
  const { canvas, ctx, img } = await drawFileToCanvas(file)
  const strength = Math.min(2, Math.max(0, amount / 50))
  ctx.filter = `contrast(${100 + strength * 40}%) saturate(${100 + strength * 20}%)`
  ctx.drawImage(img, 0, 0)
  ctx.filter = 'none'

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const kernel = [
    0, -strength, 0,
    -strength, 1 + 4 * strength, -strength,
    0, -strength, 0,
  ]
  applyConvolution(imageData, canvas.width, canvas.height, kernel)
  ctx.putImageData(imageData, 0, 0)

  const ext = getFileExtension(file.name)
  const format = ext === 'jpg' || ext === 'jpeg' ? 'jpeg' : ext === 'webp' ? 'webp' : 'png'
  const blob = await canvasToBlob(canvas, format as ImageOutputFormat, 0.92)

  return {
    blob,
    filename: buildFilename(file.name, ext === 'jpeg' ? 'jpg' : ext),
    originalSize: file.size,
    outputSize: blob.size,
  }
}

function applyConvolution(
  imageData: ImageData,
  width: number,
  height: number,
  kernel: number[],
): void {
  const src = new Uint8ClampedArray(imageData.data)
  const dst = imageData.data

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      for (let channel = 0; channel < 3; channel += 1) {
        let value = 0
        let ki = 0
        for (let ky = -1; ky <= 1; ky += 1) {
          for (let kx = -1; kx <= 1; kx += 1) {
            const px = ((y + ky) * width + (x + kx)) * 4 + channel
            value += src[px] * kernel[ki]
            ki += 1
          }
        }
        dst[(y * width + x) * 4 + channel] = Math.min(255, Math.max(0, value))
      }
    }
  }
}

export function detectImageFormat(file: File): ImageOutputFormat | 'gif' | 'bmp' | 'unknown' {
  const type = file.type.toLowerCase()
  if (type.includes('jpeg') || type.includes('jpg')) return 'jpeg'
  if (type.includes('png')) return 'png'
  if (type.includes('webp')) return 'webp'
  if (type.includes('gif')) return 'gif'
  if (type.includes('bmp')) return 'bmp'
  const ext = getFileExtension(file.name)
  if (ext === 'jpg' || ext === 'jpeg') return 'jpeg'
  if (ext === 'png') return 'png'
  if (ext === 'webp') return 'webp'
  return 'unknown'
}

function getFileExtension(name: string): string {
  const dot = name.lastIndexOf('.')
  if (dot === -1) return 'png'
  return name.slice(dot + 1).toLowerCase()
}

export async function createPreviewForFile(file: File): Promise<string | null> {
  return createImagePreviewUrl(file)
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
