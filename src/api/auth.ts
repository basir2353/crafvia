import { apiFetch, clearTokens, setTokens } from './client'

export type User = {
  id: string
  email: string
  name: string | null
  plan: 'FREE' | 'PRO'
  role: 'USER' | 'ADMIN'
}

type AuthResponse = {
  user: User
  accessToken: string
  refreshToken: string
}

export async function register(input: {
  email: string
  password: string
  name?: string
}) {
  const data = await apiFetch<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  setTokens(data.accessToken, data.refreshToken)
  return data.user
}

export async function login(input: { email: string; password: string }) {
  const data = await apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  setTokens(data.accessToken, data.refreshToken)
  return data.user
}

export async function logout() {
  const refreshToken = localStorage.getItem('crafvia_refresh_token')
  if (refreshToken) {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {})
  }
  clearTokens()
}

export async function fetchCurrentUser() {
  return apiFetch<{ user: User }>('/api/auth/me')
}

export async function upgradeToPro() {
  return apiFetch<{ message?: string; plan?: string; checkoutUrl?: string }>(
    '/api/subscriptions/checkout',
    { method: 'POST' },
  )
}
