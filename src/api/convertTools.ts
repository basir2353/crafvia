import type {
  ConvertToolRequest,
  ConvertToolResponse,
  ConvertToolSlug,
} from '../utils/convertProcess'
import { processConvertTool } from '../utils/convertProcess'

export type CurrencyRates = {
  base: string
  rates: Record<string, number>
  updatedAt: string
  provider: string
}

export function processConvertLocal(
  slug: ConvertToolSlug,
  request: ConvertToolRequest,
): ConvertToolResponse {
  try {
    return processConvertTool(slug, request)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Conversion failed.' }
  }
}

export async function fetchCurrencyRates(base = 'USD'): Promise<CurrencyRates> {
  const response = await fetch(`/api/convert/currency/rates?base=${encodeURIComponent(base)}`)
  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error ?? 'Failed to load exchange rates.')
  }
  return response.json() as Promise<CurrencyRates>
}

export { processConvertTool }
