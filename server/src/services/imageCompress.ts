import sharp from 'sharp'

export type ImageCompressOptions = {
  quality: number
  format?: 'jpeg' | 'png' | 'webp' | 'gif'
  keepExif?: boolean
}

export type ImageCompressResult = {
  buffer: Buffer
  mimeType: string
  originalSize: number
  compressedSize: number
}

const MIME_BY_FORMAT: Record<string, string> = {
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  bmp: 'image/bmp',
}

export async function compressImage(
  input: Buffer,
  options: ImageCompressOptions,
): Promise<ImageCompressResult> {
  const quality = Math.min(100, Math.max(1, options.quality))
  const metadata = await sharp(input).metadata()
  const inputFormat = metadata.format ?? 'jpeg'
  const outputFormat =
    options.format ?? (inputFormat === 'jpeg' || inputFormat === 'jpg' ? 'jpeg' : inputFormat)

  let pipeline = sharp(input, { failOn: 'none' })

  if (!options.keepExif) {
    pipeline = pipeline.rotate()
  }

  if (outputFormat === 'jpeg') {
    pipeline = pipeline.jpeg({ quality, mozjpeg: true })
  } else if (outputFormat === 'png') {
    pipeline = pipeline.png({
      compressionLevel: Math.round(((100 - quality) / 100) * 9),
      palette: quality < 80,
    })
  } else if (outputFormat === 'webp') {
    pipeline = pipeline.webp({ quality })
  } else if (outputFormat === 'gif') {
    pipeline = pipeline.gif()
  } else {
    pipeline = pipeline.jpeg({ quality, mozjpeg: true })
  }

  const buffer = await pipeline.toBuffer()
  const normalizedFormat = outputFormat

  return {
    buffer,
    mimeType: MIME_BY_FORMAT[normalizedFormat] ?? 'application/octet-stream',
    originalSize: input.length,
    compressedSize: buffer.length,
  }
}
