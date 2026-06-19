import sharp from 'sharp'

export type OutputFormat = 'jpeg' | 'png' | 'webp'

export type ImageResizeOptions = {
  width: number
  height: number
  lockAspectRatio: boolean
  format: OutputFormat
  quality: number
  keepMetadata?: boolean
}

export type ImageResizeResult = {
  buffer: Buffer
  mimeType: string
  originalSize: number
  outputSize: number
  width: number
  height: number
}

const MIME_BY_FORMAT: Record<OutputFormat, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

const MAX_EDGE = 10000

export async function resizeImage(
  input: Buffer,
  options: ImageResizeOptions,
): Promise<ImageResizeResult> {
  const metadata = await sharp(input, { failOn: 'none' }).metadata()

  if (!metadata.width || !metadata.height) {
    throw new Error('Invalid or unsupported image file.')
  }

  const width = Math.min(MAX_EDGE, Math.max(1, Math.round(options.width)))
  const height = Math.min(MAX_EDGE, Math.max(1, Math.round(options.height)))
  const quality = Math.min(100, Math.max(1, options.quality))

  let pipeline = sharp(input, { failOn: 'none' }).resize(width, height, {
    fit: options.lockAspectRatio ? 'inside' : 'fill',
    withoutEnlargement: false,
    kernel: sharp.kernel.lanczos3,
  })

  if (options.keepMetadata) {
    pipeline = pipeline.withMetadata()
  } else {
    pipeline = pipeline.rotate()
  }

  if (options.format === 'jpeg') {
    pipeline = pipeline.jpeg({ quality, mozjpeg: true })
  } else if (options.format === 'png') {
    pipeline = pipeline.png({ compressionLevel: 6 })
  } else {
    pipeline = pipeline.webp({ quality })
  }

  const buffer = await pipeline.toBuffer()
  const outputMeta = await sharp(buffer).metadata()

  return {
    buffer,
    mimeType: MIME_BY_FORMAT[options.format],
    originalSize: input.length,
    outputSize: buffer.length,
    width: outputMeta.width ?? width,
    height: outputMeta.height ?? height,
  }
}
