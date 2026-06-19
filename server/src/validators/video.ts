import { z } from 'zod'

export const recordVideoConvertJobSchema = z.object({
  originalSize: z.coerce.number().int().positive().max(4 * 1024 * 1024 * 1024),
  outputSize: z.coerce.number().int().positive().max(2 * 1024 * 1024 * 1024),
})
