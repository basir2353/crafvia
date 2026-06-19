import { z } from 'zod'

export const devToolSlugSchema = z.enum([
  'base64-encode',
  'regex-tester',
  'uuid-generator',
  'hash-generator',
  'url-encoder',
  'html-formatter',
  'css-formatter',
  'js-formatter',
  'jwt-decoder',
  'cron-generator',
  'color-converter',
  'diff-checker',
  'markdown-preview',
  'sql-formatter',
  'yaml-validator',
  'lorem-json',
  'timestamp-converter',
  'html-entity',
  'csv-to-json',
  'json-to-csv',
])

export const devToolRequestSchema = z.object({
  text: z.string().max(2_000_000).optional(),
  textA: z.string().max(2_000_000).optional(),
  textB: z.string().max(2_000_000).optional(),
  options: z.record(z.string(), z.unknown()).optional(),
})
