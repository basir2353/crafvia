export type UnlockPdfOptions = {
  file: File
  password: string
}

export type UnlockPdfResult = {
  blob: Blob
  originalSize: number
  outputSize: number
  filename: string
}

function parseSizeHeader(value: string | null): number {
  if (!value) return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export async function unlockPdf({
  file,
  password,
}: UnlockPdfOptions): Promise<UnlockPdfResult> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('password', password)

  const headers: HeadersInit = {}
  const token = localStorage.getItem('crafvia_access_token')
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch('/api/pdf/unlock', {
    method: 'POST',
    body: formData,
    headers,
  })

  if (!response.ok) {
    let message = 'Could not unlock PDF.'
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
  const base = file.name.replace(/\.pdf$/i, '') || 'document'
  const filename = filenameMatch?.[1] ?? `${base}-unlocked.pdf`

  return {
    blob,
    originalSize: parseSizeHeader(response.headers.get('X-Original-Size')) || file.size,
    outputSize: parseSizeHeader(response.headers.get('X-Compressed-Size')) || blob.size,
    filename,
  }
}
