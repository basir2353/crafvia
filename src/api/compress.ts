export type CompressImageOptions = {
  file: File
  quality: number
}

export type CompressPdfOptions = {
  file: File
  level: 'low' | 'medium' | 'high'
}

export type CompressResult = {
  blob: Blob
  originalSize: number
  compressedSize: number
  filename: string
}

function parseSizeHeader(value: string | null): number {
  if (!value) return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

async function postCompress(
  endpoint: string,
  formData: FormData,
  defaultFilename: string,
): Promise<CompressResult> {
  const headers: HeadersInit = {}
  const token = localStorage.getItem('crafvia_access_token')
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
    headers,
  })

  if (!response.ok) {
    let message = 'Compression failed'
    try {
      const data = (await response.json()) as { error?: string }
      if (data.error) message = data.error
    } catch {
      // response may not be JSON
    }
    throw new Error(message)
  }

  const blob = await response.blob()
  const disposition = response.headers.get('Content-Disposition') ?? ''
  const filenameMatch = disposition.match(/filename="([^"]+)"/)
  const filename = filenameMatch?.[1] ?? defaultFilename

  return {
    blob,
    originalSize: parseSizeHeader(response.headers.get('X-Original-Size')),
    compressedSize: parseSizeHeader(response.headers.get('X-Compressed-Size')),
    filename,
  }
}

export function compressImage({ file, quality }: CompressImageOptions) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('quality', String(quality))
  return postCompress('/api/compress/image', formData, 'compressed-image')
}

export function compressJpg({ file, quality }: CompressImageOptions) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('quality', String(quality))
  return postCompress('/api/compress/jpg', formData, 'compressed.jpg')
}

export function compressPng({ file, quality }: CompressImageOptions) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('quality', String(quality))
  return postCompress('/api/compress/png', formData, 'compressed.png')
}

export function compressPdf({ file, level }: CompressPdfOptions) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('level', level)
  return postCompress('/api/compress/pdf', formData, 'compressed.pdf')
}

export function compressWebp({ file, quality }: CompressImageOptions) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('quality', String(quality))
  return postCompress('/api/compress/webp', formData, 'compressed.webp')
}

export function compressGif({ file, quality }: CompressImageOptions) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('quality', String(quality))
  return postCompress('/api/compress/gif', formData, 'compressed.gif')
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
