import { formatFileSize } from './compress'

export type ProtectPdfOptions = {
  file: File
  password: string
  ownerPassword?: string
}

export type ProtectPdfResult = {
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

export async function protectPdf({
  file,
  password,
  ownerPassword,
}: ProtectPdfOptions): Promise<ProtectPdfResult> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('password', password)
  if (ownerPassword) formData.append('ownerPassword', ownerPassword)

  const headers: HeadersInit = {}
  const token = localStorage.getItem('crafvia_access_token')
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch('/api/pdf/protect', {
    method: 'POST',
    body: formData,
    headers,
  })

  if (!response.ok) {
    let message = 'Could not protect PDF.'
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
  const filename = filenameMatch?.[1] ?? 'protected.pdf'

  return {
    blob,
    originalSize: parseSizeHeader(response.headers.get('X-Original-Size')) || file.size,
    compressedSize: parseSizeHeader(response.headers.get('X-Compressed-Size')) || blob.size,
    filename,
  }
}

export function formatPdfStats(originalSize: number, outputSize: number, extra?: string): string {
  const prefix = extra ? `${extra} ` : ''
  return `${prefix}${formatFileSize(originalSize)} → ${formatFileSize(outputSize)}`
}
