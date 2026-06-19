import { z } from 'zod'

export const compressToolSlugSchema = z.enum([
  'compress-webp',
  'compress-gif',
  'compress-svg',
  'compress-audio',
  'compress-zip',
  'compress-html',
  'compress-css',
  'compress-js',
  'compress-json',
  'compress-xml',
])

export const compressToolRequestSchema = z.object({
  text: z.string().optional(),
  options: z.record(z.string(), z.unknown()).optional(),
})
