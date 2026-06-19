import { z } from 'zod'

export const recordSpeechJobSchema = z.object({
  textLength: z.coerce.number().int().positive().max(100_000),
  outputSize: z.coerce.number().int().positive().max(100 * 1024 * 1024),
})
