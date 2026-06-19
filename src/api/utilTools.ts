import type { UtilToolRequest, UtilToolResponse, UtilToolSlug } from '../utils/utilProcess'
import { processUtilTool } from '../utils/utilProcess'

export function processUtilLocal(
  slug: UtilToolSlug,
  request: UtilToolRequest,
): UtilToolResponse {
  try {
    return processUtilTool(slug, request)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Utility failed.' }
  }
}

export { processUtilTool }
