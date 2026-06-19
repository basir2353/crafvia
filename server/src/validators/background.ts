import { z } from 'zod'

export const recordBackgroundJobSchema = z.object({
  originalSize: z.coerce.number().int().positive().max(500 * 1024 * 1024),
  outputSize: z.coerce.number().int().positive().max(500 * 1024 * 1024),
})
