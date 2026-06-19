import type { CalcToolRequest, CalcToolResponse, CalcToolSlug } from '../utils/calcProcess'
import { processCalcTool } from '../utils/calcProcess'

export function processCalcLocal(slug: CalcToolSlug, request: CalcToolRequest): CalcToolResponse {
  try {
    return processCalcTool(slug, request)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Calculation failed.' }
  }
}

export { processCalcTool }
