const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504])

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function hasKey(value: string | undefined): boolean {
  return Boolean(value?.trim())
}

export function getGeminiApiKey(
  googleApiKey?: string,
  geminiApiKey?: string,
): string {
  return googleApiKey?.trim() || geminiApiKey?.trim() || ''
}

export async function fetchWithRetryExport(
  url: string,
  init: RequestInit,
  retries = 2,
): Promise<Response> {
  let lastResponse: Response | null = null

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const response = await fetch(url, init)
    lastResponse = response

    if (response.ok || !RETRYABLE_STATUS.has(response.status) || attempt === retries) {
      return response
    }

    const retryAfter = Number(response.headers.get('retry-after') ?? '0')
    const delayMs = retryAfter > 0 ? retryAfter * 1000 : (attempt + 1) * 1000
    await sleep(delayMs)
  }

  return lastResponse!
}
