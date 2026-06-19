import { z } from 'zod'

export const genToolSlugSchema = z.enum([
  'password-generator',
  'barcode-generator',
  'color-palette',
  'logo-maker',
  'meme-generator',
  'name-generator',
])

export const genToolRequestSchema = z.object({
  text: z.string().optional(),
  options: z.record(z.string(), z.unknown()).optional(),
})

export const imageGenerateSchema = z.object({
  prompt: z.string().min(1).max(1000),
  aspectRatio: z.enum(['1:1', '16:9', '9:16', '4:3']).default('1:1'),
})

export const nameGenerateSchema = z.object({
  category: z.enum(['project', 'business', 'startup', 'brand']).default('project'),
  keyword: z.string().max(40).optional(),
  count: z.coerce.number().int().min(1).max(30).default(10),
  useAi: z.boolean().optional().default(false),
})
