import { z } from 'zod'

export const textToolSlugSchema = z.enum([
  'word-counter',
  'case-converter',
  'lorem-ipsum',
  'remove-duplicates',
  'sort-lines',
  'reverse-text',
  'find-replace',
  'add-line-numbers',
  'remove-spaces',
  'text-diff',
  'fancy-text',
  'morse-code',
  'binary-converter',
  'reading-time',
])

export const textToolRequestSchema = z.object({
  text: z.string().max(100_000).optional(),
  textA: z.string().max(100_000).optional(),
  textB: z.string().max(100_000).optional(),
  options: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
    .optional(),
})
