export type OutputFormat = 'jpeg' | 'png' | 'webp'

export type ResizeImageOptions = {
  file: File
  width: number
  height: number
  lockAspectRatio: boolean
  format: OutputFormat
  quality: number
}

export type ResizeResult = {
  blob: Blob
  originalSize: number
  outputSize: number
  filename: string
  width: number
  height: number
}

function parseSizeHeader(value: string | null): number {
  if (!value) return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function parseDimensionHeader(value: string | null): number {
  if (!value) return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export async function resizeImage({
  file,
  width,
  height,
  lockAspectRatio,
  format,
  quality,
}: ResizeImageOptions): Promise<ResizeResult> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('width', String(width))
  formData.append('height', String(height))
  formData.append('lockAspectRatio', String(lockAspectRatio))
  formData.append('format', format)
  formData.append('quality', String(quality))

  const headers: HeadersInit = {}
  const token = localStorage.getItem('crafvia_access_token')
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch('/api/resize/image', {
    method: 'POST',
    body: formData,
    headers,
  })

  if (!response.ok) {
    let message = 'Image resize failed'
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
  const ext = format === 'jpeg' ? 'jpg' : format
  const filename = filenameMatch?.[1] ?? `resized-${width}x${height}.${ext}`

  return {
    blob,
    originalSize: parseSizeHeader(response.headers.get('X-Original-Size')),
    outputSize: parseSizeHeader(response.headers.get('X-Compressed-Size')),
    width: parseDimensionHeader(response.headers.get('X-Image-Width')),
    height: parseDimensionHeader(response.headers.get('X-Image-Height')),
    filename,
  }
}
