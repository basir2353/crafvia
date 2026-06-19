export type ExifEntry = {
  tag: string
  value: string
}

const TAG_NAMES: Record<number, string> = {
  0x010f: 'Make',
  0x0110: 'Model',
  0x0112: 'Orientation',
  0x0131: 'Software',
  0x0132: 'DateTime',
  0x8298: 'Copyright',
  0x8769: 'Exif IFD',
  0x8825: 'GPS IFD',
  0x9003: 'DateTimeOriginal',
  0x9004: 'DateTimeDigitized',
  0x920a: 'FocalLength',
  0x829a: 'ExposureTime',
  0x829d: 'FNumber',
  0x8827: 'ISO',
  0x9201: 'ShutterSpeed',
  0xa002: 'PixelXDimension',
  0xa003: 'PixelYDimension',
}

function readUint16(data: DataView, offset: number, little: boolean): number {
  return data.getUint16(offset, little)
}

function readUint32(data: DataView, offset: number, little: boolean): number {
  return data.getUint32(offset, little)
}

function parseIfd(
  data: DataView,
  ifdOffset: number,
  little: boolean,
  entries: ExifEntry[],
): void {
  if (ifdOffset < 0 || ifdOffset + 2 > data.byteLength) return
  const count = readUint16(data, ifdOffset, little)
  for (let i = 0; i < count; i++) {
    const entryOffset = ifdOffset + 2 + i * 12
    if (entryOffset + 12 > data.byteLength) break
    const tag = readUint16(data, entryOffset, little)
    const type = readUint16(data, entryOffset + 2, little)
    const count = readUint32(data, entryOffset + 4, little)
    const valueOffset = entryOffset + 8
    const name = TAG_NAMES[tag] ?? `Tag 0x${tag.toString(16)}`

    let value = ''
    if (type === 2) {
      const strOffset = count > 4 ? readUint32(data, valueOffset, little) : valueOffset
      if (strOffset >= 0 && strOffset < data.byteLength) {
        const chars: string[] = []
        for (let j = 0; j < count - 1 && strOffset + j < data.byteLength; j++) {
          const ch = data.getUint8(strOffset + j)
          if (ch === 0) break
          chars.push(String.fromCharCode(ch))
        }
        value = chars.join('')
      }
    } else if (type === 3) {
      value = String(count > 1 ? readUint16(data, valueOffset, little) : readUint16(data, valueOffset, little))
    } else if (type === 4 || type === 9) {
      value = String(count > 1 ? readUint32(data, valueOffset, little) : readUint32(data, valueOffset, little))
    } else if (type === 5 && count === 1) {
      const numOffset = readUint32(data, valueOffset, little)
      const denOffset = numOffset + 4
      if (denOffset + 4 <= data.byteLength) {
        const numerator = readUint32(data, numOffset, little)
        const denominator = readUint32(data, denOffset, little)
        value = denominator ? (numerator / denominator).toFixed(4) : String(numerator)
      }
    }

    if (value) entries.push({ tag: name, value })
  }
}

export async function readExifFromFile(file: File): Promise<ExifEntry[]> {
  const buffer = await file.arrayBuffer()
  const data = new DataView(buffer)
  const entries: ExifEntry[] = []

  entries.push({ tag: 'File name', value: file.name })
  entries.push({ tag: 'File size', value: `${file.size.toLocaleString()} bytes` })
  entries.push({ tag: 'MIME type', value: file.type || 'unknown' })

  if (data.byteLength < 4 || data.getUint16(0) !== 0xffd8) {
    if (file.type.startsWith('image/')) {
      const dims = await getImageDimensions(file)
      if (dims) {
        entries.push({ tag: 'Width', value: String(dims.width) })
        entries.push({ tag: 'Height', value: String(dims.height) })
      }
    }
    entries.push({ tag: 'Note', value: 'No JPEG EXIF block found. Showing available file metadata only.' })
    return entries
  }

  let offset = 2
  while (offset + 4 < data.byteLength) {
    if (data.getUint8(offset) !== 0xff) break
    const marker = data.getUint8(offset + 1)
    if (marker === 0xd9 || marker === 0xda) break
    const length = data.getUint16(offset + 2)
    if (marker === 0xe1 && length > 8) {
      const exifHeader = String.fromCharCode(
        data.getUint8(offset + 4),
        data.getUint8(offset + 5),
        data.getUint8(offset + 6),
        data.getUint8(offset + 7),
        data.getUint8(offset + 8),
        data.getUint8(offset + 9),
      )
      if (exifHeader === 'Exif\0\0') {
        const tiffStart = offset + 10
        const endian = data.getUint16(tiffStart)
        const little = endian === 0x4949
        const ifd0 = readUint32(data, tiffStart + 4, little)
        parseIfd(data, tiffStart + ifd0, little, entries)
      }
      break
    }
    offset += 2 + length
  }

  const dims = await getImageDimensions(file)
  if (dims) {
    entries.push({ tag: 'Width', value: String(dims.width) })
    entries.push({ tag: 'Height', value: String(dims.height) })
  }

  return entries
}

async function getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error('Failed to load image'))
      el.src = url
    })
    return { width: img.naturalWidth, height: img.naturalHeight }
  } catch {
    return null
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function exifToText(entries: ExifEntry[]): string {
  return entries.map((e) => `${e.tag}: ${e.value}`).join('\n')
}
