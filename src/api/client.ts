const ACCESS_TOKEN_KEY = 'crafvia_access_token'
const REFRESH_TOKEN_KEY = 'crafvia_refresh_token'

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers)
  const token = getAccessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(path, { ...init, headers })

  if (response.status === 401 && getRefreshToken()) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      headers.set('Authorization', `Bearer ${getAccessToken()}`)
      const retry = await fetch(path, { ...init, headers })
      if (!retry.ok) throw await parseError(retry)
      return parseJson<T>(retry)
    }
  }

  if (!response.ok) throw await parseError(response)
  return parseJson<T>(response)
}

async function parseJson<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

async function parseError(response: Response): Promise<Error> {
  try {
    const data = (await response.json()) as { error?: string }
    return new Error(data.error ?? 'Request failed')
  } catch {
    return new Error('Request failed')
  }
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!response.ok) {
      clearTokens()
      return false
    }
    const data = (await response.json()) as { accessToken: string }
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken)
    return true
  } catch {
    clearTokens()
    return false
  }
}
