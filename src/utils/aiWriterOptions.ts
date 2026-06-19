export type WriterMode = 'generate' | 'improve'

export type ContentType =
  | 'blog-post'
  | 'article'
  | 'social-media'
  | 'linkedin'
  | 'product-description'
  | 'marketing-copy'
  | 'website'
  | 'landing-page'
  | 'email'
  | 'cover-letter'
  | 'business-proposal'
  | 'caption'
  | 'advertisement'
  | 'youtube-description'
  | 'seo-content'
  | 'headline'
  | 'blog-outline'
  | 'resume'
  | 'custom'

export type ImprovementType =
  | 'rewrite'
  | 'expand'
  | 'shorten'
  | 'grammar'
  | 'readability'
  | 'readability-score'
  | 'clarity'
  | 'professionalism'
  | 'seo'
  | 'tone'
  | 'spelling'
  | 'summarize'
  | 'translate'
  | 'humanize'
  | 'keywords'
  | 'plagiarism'

export type ToneType =
  | 'professional'
  | 'casual'
  | 'friendly'
  | 'formal'
  | 'persuasive'
  | 'marketing'
  | 'technical'
  | 'creative'
  | 'educational'
  | 'conversational'
  | 'business'
  | 'custom'

export type LengthType = 'short' | 'medium' | 'long' | 'custom'

export const MODE_OPTIONS: { value: WriterMode; label: string }[] = [
  { value: 'generate', label: 'Generate new content' },
  { value: 'improve', label: 'Improve existing text' },
]

export const CONTENT_TYPE_OPTIONS: { value: ContentType; label: string }[] = [
  { value: 'blog-post', label: 'Blog post' },
  { value: 'article', label: 'Article' },
  { value: 'social-media', label: 'Social media post' },
  { value: 'linkedin', label: 'LinkedIn post' },
  { value: 'product-description', label: 'Product description' },
  { value: 'marketing-copy', label: 'Marketing copy' },
  { value: 'website', label: 'Website content' },
  { value: 'landing-page', label: 'Landing page content' },
  { value: 'email', label: 'Email' },
  { value: 'cover-letter', label: 'Cover letter' },
  { value: 'business-proposal', label: 'Business proposal' },
  { value: 'caption', label: 'Caption' },
  { value: 'advertisement', label: 'Advertisement' },
  { value: 'youtube-description', label: 'YouTube description' },
  { value: 'seo-content', label: 'SEO content' },
  { value: 'headline', label: 'Headline / title' },
  { value: 'blog-outline', label: 'Blog outline' },
  { value: 'resume', label: 'Resume / CV' },
  { value: 'custom', label: 'Custom content' },
]

export const IMPROVEMENT_OPTIONS: { value: ImprovementType; label: string }[] = [
  { value: 'rewrite', label: 'Rewrite text' },
  { value: 'expand', label: 'Expand text' },
  { value: 'shorten', label: 'Shorten text' },
  { value: 'grammar', label: 'Improve grammar' },
  { value: 'readability', label: 'Improve readability' },
  { value: 'clarity', label: 'Improve clarity' },
  { value: 'professionalism', label: 'Improve professionalism' },
  { value: 'seo', label: 'Improve SEO' },
  { value: 'tone', label: 'Change tone' },
  { value: 'spelling', label: 'Fix spelling' },
  { value: 'summarize', label: 'Summarize text' },
  { value: 'translate', label: 'Translate text' },
  { value: 'humanize', label: 'Humanize content' },
  { value: 'keywords', label: 'Extract keywords' },
  { value: 'plagiarism', label: 'Check plagiarism' },
  { value: 'readability-score', label: 'Readability analysis' },
]

export const TONE_OPTIONS: { value: ToneType; label: string }[] = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'formal', label: 'Formal' },
  { value: 'persuasive', label: 'Persuasive' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'technical', label: 'Technical' },
  { value: 'creative', label: 'Creative' },
  { value: 'educational', label: 'Educational' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'business', label: 'Business' },
  { value: 'custom', label: 'Custom tone' },
]

export const LENGTH_OPTIONS: { value: LengthType; label: string }[] = [
  { value: 'short', label: 'Short (~150 words)' },
  { value: 'medium', label: 'Medium (~400 words)' },
  { value: 'long', label: 'Long (~800 words)' },
  { value: 'custom', label: 'Custom word count' },
]

export const DRAFT_STORAGE_KEY = 'crafvia-ai-writer-draft'

export function countWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}
