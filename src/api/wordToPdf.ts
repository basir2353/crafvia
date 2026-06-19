export type WordToPdfServerResult = {
  blob: Blob
  filename: string
  originalSize: number
  outputSize: number
  pageCount: number
}

function parseSizeHeader(value: string | null): number {
  if (!value) return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export async function convertWordToPdfServer(file: File): Promise<WordToPdfServerResult> {
  const formData = new FormData()
  formData.append('file', file)

  const headers: HeadersInit = {}
  const token = localStorage.getItem('crafvia_access_token')
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch('/api/pdf/word-to-pdf', {
    method: 'POST',
    body: formData,
    headers,
  })

  if (!response.ok) {
    let message = 'Could not convert Word document to PDF.'
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
  const base = file.name.replace(/\.(docx|doc)$/i, '') || 'document'
  const pageCount = Number(response.headers.get('X-Page-Count') ?? '1')

  return {
    blob,
    filename: filenameMatch?.[1] ?? `${base}.pdf`,
    originalSize: parseSizeHeader(response.headers.get('X-Original-Size')) || file.size,
    outputSize: parseSizeHeader(response.headers.get('X-Compressed-Size')) || blob.size,
    pageCount: Number.isFinite(pageCount) && pageCount > 0 ? pageCount : 1,
  }
}
