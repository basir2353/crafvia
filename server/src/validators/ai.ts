import { z } from 'zod'

const contentTypeSchema = z.enum([
  'blog-post',
  'article',
  'social-media',
  'linkedin',
  'product-description',
  'marketing-copy',
  'website',
  'landing-page',
  'email',
  'cover-letter',
  'business-proposal',
  'caption',
  'advertisement',
  'youtube-description',
  'seo-content',
  'headline',
  'blog-outline',
  'resume',
  'custom',
])

const improvementTypeSchema = z.enum([
  'rewrite',
  'expand',
  'shorten',
  'grammar',
  'readability',
  'readability-score',
  'clarity',
  'professionalism',
  'seo',
  'tone',
  'spelling',
  'summarize',
  'translate',
  'humanize',
  'keywords',
  'plagiarism',
])

const toneSchema = z.enum([
  'professional',
  'casual',
  'friendly',
  'formal',
  'persuasive',
  'marketing',
  'technical',
  'creative',
  'educational',
  'conversational',
  'business',
  'custom',
])

const lengthSchema = z.enum(['short', 'medium', 'long', 'custom'])

export const aiWriterRequestSchema = z
  .object({
    mode: z.enum(['generate', 'improve', 'continue']),
    prompt: z.string().max(10_000).optional(),
    sourceText: z.string().max(20_000).optional(),
    existingContent: z.string().max(30_000).optional(),
    contentType: contentTypeSchema.optional(),
    improvementType: improvementTypeSchema.optional(),
    tone: toneSchema.default('professional'),
    customTone: z.string().max(120).optional(),
    length: lengthSchema.default('medium'),
    customWordCount: z.coerce.number().int().min(50).max(3000).optional(),
    targetLanguage: z.string().max(80).optional(),
    toolSlug: z.string().max(80).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.mode === 'generate' && !value.prompt?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['prompt'],
        message: 'Prompt is required for content generation.',
      })
    }

    if (value.mode === 'generate' && !value.contentType) {
      ctx.addIssue({
        code: 'custom',
        path: ['contentType'],
        message: 'Content type is required.',
      })
    }

    if (value.mode === 'improve' && !value.sourceText?.trim() && !value.existingContent?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['sourceText'],
        message: 'Source text is required for improvements.',
      })
    }

    if (value.mode === 'improve' && !value.improvementType) {
      ctx.addIssue({
        code: 'custom',
        path: ['improvementType'],
        message: 'Improvement type is required.',
      })
    }

    if (value.mode === 'continue' && !value.existingContent?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['existingContent'],
        message: 'Existing content is required to continue writing.',
      })
    }

    if (value.length === 'custom' && !value.customWordCount) {
      ctx.addIssue({
        code: 'custom',
        path: ['customWordCount'],
        message: 'Custom word count is required when length is custom.',
      })
    }

    if (value.tone === 'custom' && !value.customTone?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['customTone'],
        message: 'Custom tone description is required.',
      })
    }

    if (value.improvementType === 'translate' && !value.targetLanguage?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['targetLanguage'],
        message: 'Target language is required for translation.',
      })
    }
  })

export const recordAiWriterJobSchema = z.object({
  promptLength: z.coerce.number().int().nonnegative().max(50_000),
  outputLength: z.coerce.number().int().positive().max(100_000),
})
