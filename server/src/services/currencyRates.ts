import { AppError } from '../middleware/errorHandler.js'

export type CurrencyRatesResult = {
  base: string
  rates: Record<string, number>
  updatedAt: string
  provider: string
}

type CacheEntry = {
  data: CurrencyRatesResult
  expiresAt: number
}

const CACHE_TTL_MS = 60 * 60 * 1000
const cache = new Map<string, CacheEntry>()

async function fetchRatesFromApi(base: string): Promise<CurrencyRatesResult> {
  const code = base.toUpperCase()
  const url = `https://open.er-api.com/v6/latest/${code}`

  const response = await fetch(url, { signal: AbortSignal.timeout(15_000) })
  if (!response.ok) {
    throw new AppError(`Exchange rate API unavailable (${response.status}).`, 502)
  }

  const data = (await response.json()) as {
    result?: string
    base_code?: string
    time_last_update_utc?: string
    rates?: Record<string, number>
  }

  if (data.result !== 'success' || !data.rates) {
    throw new AppError('Exchange rate API returned invalid data.', 502)
  }

  return {
    base: data.base_code ?? code,
    rates: data.rates,
    updatedAt: data.time_last_update_utc ?? new Date().toISOString(),
    provider: 'open.er-api.com',
  }
}

export async function getCurrencyRates(base = 'USD'): Promise<CurrencyRatesResult> {
  const code = base.toUpperCase()
  const cached = cache.get(code)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data
  }

  try {
    const data = await fetchRatesFromApi(code)
    cache.set(code, { data, expiresAt: Date.now() + CACHE_TTL_MS })
    return data
  } catch (error) {
    if (cached) return cached.data
    throw error
  }
}
