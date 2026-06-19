import { z } from 'zod'

export const seoToolSlugSchema = z.enum([
  'meta-tag-generator',
  'sitemap-generator',
  'robots-txt',
  'open-graph-preview',
  'schema-markup',
  'keyword-density',
  'slug-generator',
  'heading-analyzer',
  'canonical-checker',
  'page-speed-tips',
  'backlink-checker',
])

export const seoToolRequestSchema = z.object({
  text: z.string().max(500_000).optional(),
  options: z.record(z.string(), z.unknown()).optional(),
})
