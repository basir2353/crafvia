import type {
  CompressToolRequest,
  CompressToolResponse,
  CompressToolSlug,
} from '../utils/compressProcess'
import { processCompressTool } from '../utils/compressProcess'

export function processCompressLocal(
  slug: CompressToolSlug,
  request: CompressToolRequest,
): CompressToolResponse {
  try {
    return processCompressTool(slug, request)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Compression failed.' }
  }
}

export { processCompressTool }
