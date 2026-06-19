import { AiWritingToolCore } from '../../components/AiWritingToolCore'
import {
  AI_WRITING_PRESETS,
  AI_WRITING_TOOL_ENTRIES,
  type AiWritingToolConfig,
} from '../../config/aiWritingTools'
import { aiWriterConfig } from '../../config/tools'

function makePage(config: AiWritingToolConfig, slug: string) {
  const preset = AI_WRITING_PRESETS[slug]
  return function AiWritingToolPage() {
    return <AiWritingToolCore config={config} preset={preset} />
  }
}

export function AiWriterPage() {
  return (
    <AiWritingToolCore
      config={{
        path: aiWriterConfig.path,
        category: aiWriterConfig.category,
        breadcrumb: aiWriterConfig.breadcrumb,
        title: aiWriterConfig.title,
        lead: aiWriterConfig.lead,
        actionLabel: aiWriterConfig.actionLabel ?? 'Generate Content',
        processingLabel: aiWriterConfig.processingLabel ?? 'Generating…',
        downloadLabel: aiWriterConfig.downloadLabel ?? 'Download',
        whatIsTitle: aiWriterConfig.whatIsTitle,
        whatIsBody: aiWriterConfig.whatIsBody,
        howToTitle: aiWriterConfig.howToTitle,
        howToSteps: aiWriterConfig.howToSteps,
        faqs: aiWriterConfig.faqs,
        popularTitle: aiWriterConfig.popularTitle,
        popularOptions: aiWriterConfig.popularOptions,
        relatedTools: aiWriterConfig.relatedTools,
      }}
      preset={AI_WRITING_PRESETS['ai-writer']}
    />
  )
}

export const ParaphrasePage = makePage(
  AI_WRITING_TOOL_ENTRIES.find((e) => e.slug === 'paraphrase')!.config,
  'paraphrase',
)
export const SummarizePage = makePage(
  AI_WRITING_TOOL_ENTRIES.find((e) => e.slug === 'summarize')!.config,
  'summarize',
)
export const GrammarCheckPage = makePage(
  AI_WRITING_TOOL_ENTRIES.find((e) => e.slug === 'grammar-check')!.config,
  'grammar-check',
)
export const ToneChangerPage = makePage(
  AI_WRITING_TOOL_ENTRIES.find((e) => e.slug === 'tone-changer')!.config,
  'tone-changer',
)
export const HeadlineGeneratorPage = makePage(
  AI_WRITING_TOOL_ENTRIES.find((e) => e.slug === 'headline-generator')!.config,
  'headline-generator',
)
export const BlogOutlinePage = makePage(
  AI_WRITING_TOOL_ENTRIES.find((e) => e.slug === 'blog-outline')!.config,
  'blog-outline',
)
export const EmailWriterPage = makePage(
  AI_WRITING_TOOL_ENTRIES.find((e) => e.slug === 'email-writer')!.config,
  'email-writer',
)
export const ProductDescriptionPage = makePage(
  AI_WRITING_TOOL_ENTRIES.find((e) => e.slug === 'product-description')!.config,
  'product-description',
)
export const SocialCaptionPage = makePage(
  AI_WRITING_TOOL_ENTRIES.find((e) => e.slug === 'social-caption')!.config,
  'social-caption',
)
export const ResumeBuilderPage = makePage(
  AI_WRITING_TOOL_ENTRIES.find((e) => e.slug === 'resume-builder')!.config,
  'resume-builder',
)
export const CoverLetterPage = makePage(
  AI_WRITING_TOOL_ENTRIES.find((e) => e.slug === 'cover-letter')!.config,
  'cover-letter',
)
export const TranslateTextPage = makePage(
  AI_WRITING_TOOL_ENTRIES.find((e) => e.slug === 'translate-text')!.config,
  'translate-text',
)
export const KeywordExtractorPage = makePage(
  AI_WRITING_TOOL_ENTRIES.find((e) => e.slug === 'keyword-extractor')!.config,
  'keyword-extractor',
)
export const ReadabilityScorePage = makePage(
  AI_WRITING_TOOL_ENTRIES.find((e) => e.slug === 'readability-score')!.config,
  'readability-score',
)
export const PlagiarismCheckPage = makePage(
  AI_WRITING_TOOL_ENTRIES.find((e) => e.slug === 'plagiarism-check')!.config,
  'plagiarism-check',
)
