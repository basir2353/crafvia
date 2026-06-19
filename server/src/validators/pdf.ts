import { z } from 'zod'

export const recordPdfMergeJobSchema = z.object({
  originalSize: z.coerce.number().int().positive().max(2 * 1024 * 1024 * 1024),
  outputSize: z.coerce.number().int().positive().max(2 * 1024 * 1024 * 1024),
})
