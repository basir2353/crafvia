import JSZip from 'jszip'
import { createCanvas, loadImageFromFile } from './imageCanvas'

const FAVICON_SIZES = [16, 32, 48, 64, 128, 180, 192, 512]

export type FaviconResult = {
  blob: Blob
  filename: string
  originalSize: number
  outputSize: number
}

async function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), 'image/png')
  })
  if (!blob) throw new Error('Could not generate favicon PNG.')
  return new Uint8Array(await blob.arrayBuffer())
}

function createIcoFromPngs(pngBytesList: Uint8Array[], sizes: number[]): Uint8Array {
  const images = pngBytesList.map((bytes, index) => ({
    size: sizes[index],
    bytes,
  }))

  const headerSize = 6
  const dirEntrySize = 16
  const offset = headerSize + dirEntrySize * images.length
  let dataOffset = offset
  const parts: Uint8Array[] = []

  const header = new Uint8Array(headerSize)
  header[0] = 0
  header[1] = 0
  header[2] = 1
  header[3] = 0
  header[4] = images.length
  header[5] = 0
  parts.push(header)

  for (const image of images) {
    const entry = new Uint8Array(dirEntrySize)
    entry[0] = image.size >= 256 ? 0 : image.size
    entry[1] = image.size >= 256 ? 0 : image.size
    entry[2] = 0
    entry[3] = 0
    entry[4] = 1
    entry[5] = 0
    entry[6] = 32
    entry[7] = 0
    entry[8] = image.bytes.length & 0xff
    entry[9] = (image.bytes.length >> 8) & 0xff
    entry[10] = (image.bytes.length >> 16) & 0xff
    entry[11] = (image.bytes.length >> 24) & 0xff
    entry[12] = dataOffset & 0xff
    entry[13] = (dataOffset >> 8) & 0xff
    entry[14] = (dataOffset >> 16) & 0xff
    entry[15] = (dataOffset >> 24) & 0xff
    parts.push(entry)
    dataOffset += image.bytes.length
  }

  for (const image of images) {
    parts.push(image.bytes)
  }

  const total = parts.reduce((sum, part) => sum + part.length, 0)
  const merged = new Uint8Array(total)
  let position = 0
  for (const part of parts) {
    merged.set(part, position)
    position += part.length
  }
  return merged
}

export async function generateFaviconPackage(file: File): Promise<FaviconResult> {
  const img = await loadImageFromFile(file)
  const zip = new JSZip()
  const pngBytesForIco: Uint8Array[] = []
  const icoSizes: number[] = []

  for (const size of FAVICON_SIZES) {
    const { canvas } = createCanvas(size, size)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not generate favicon.')
    ctx.drawImage(img, 0, 0, size, size)
    const pngBytes = await canvasToPngBytes(canvas)
    zip.file(`favicon-${size}x${size}.png`, pngBytes)
    zip.file(`android-chrome-${size}x${size}.png`, pngBytes)

    if (size === 16 || size === 32 || size === 48) {
      pngBytesForIco.push(pngBytes)
      icoSizes.push(size)
    }
  }

  zip.file('apple-touch-icon.png', await canvasToPngBytes(await renderSize(img, 180)))
  zip.file(
    'favicon.ico',
    createIcoFromPngs(pngBytesForIco, icoSizes),
  )
  zip.file(
    'site.webmanifest',
    JSON.stringify(
      {
        name: 'Site',
        short_name: 'Site',
        icons: FAVICON_SIZES.filter((s) => s >= 192).map((size) => ({
          src: `/android-chrome-${size}x${size}.png`,
          sizes: `${size}x${size}`,
          type: 'image/png',
        })),
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
      },
      null,
      2,
    ),
  )

  const blob = await zip.generateAsync({ type: 'blob' })
  return {
    blob,
    filename: 'favicon-package.zip',
    originalSize: file.size,
    outputSize: blob.size,
  }
}

async function renderSize(img: HTMLImageElement, size: number): Promise<HTMLCanvasElement> {
  const { canvas } = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not generate favicon.')
  ctx.drawImage(img, 0, 0, size, size)
  return canvas
}
