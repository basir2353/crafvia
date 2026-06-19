import {
  FileText,
  FileType,
  Languages,
  ListTree,
  PenLine,
  Search,
  Sparkles,
  Type,
  Wand2,
} from 'lucide-react'
import type { RelatedTool } from './tools'
import type {
  ContentType,
  ImprovementType,
  LengthType,
  WriterMode,
} from '../utils/aiWriterOptions'

export type AiWritingToolConfig = {
  path: string
  category: string
  breadcrumb: string
  title: string
  lead: string
  actionLabel: string
  processingLabel: string
  downloadLabel: string
  whatIsTitle: string
  whatIsBody: string
  howToTitle: string
  howToSteps: string[]
  faqs: { question: string; answer: string }[]
  popularTitle: string
  popularOptions: { label: string; href?: string }[]
  relatedTools: RelatedTool[]
}

export type AiWritingPreset = {
  slug: string
  mode: WriterMode
  contentType?: ContentType
  improvementType?: ImprovementType
  showModeSelector?: boolean
  showContentTypeSelector?: boolean
  showImprovementSelector?: boolean
  showContinueWriting?: boolean
  defaultLength?: LengthType
  promptLabel?: string
  promptPlaceholder?: string
  sourceLabel?: string
  sourcePlaceholder?: string
}

const aiRelated: RelatedTool[] = [
  { name: 'AI Writer', description: 'Generate and improve any text', icon: PenLine, href: '/tools/ai-writer' },
  { name: 'Paraphrase', description: 'Rewrite text in different words', icon: PenLine, href: '/tools/paraphrase' },
  { name: 'Summarize', description: 'Summarize long text into key points', icon: FileType, href: '/tools/summarize' },
  { name: 'Grammar Check', description: 'Fix grammar and spelling errors', icon: Wand2, href: '/tools/grammar-check' },
  { name: 'Email Writer', description: 'Draft professional emails quickly', icon: PenLine, href: '/tools/email-writer' },
  { name: 'Translate Text', description: 'Translate text between languages', icon: Languages, href: '/tools/translate-text' },
]

const baseFaq = [
  {
    question: 'Is my text sent to a server?',
    answer:
      'Your text is sent securely to our server for AI processing using your configured provider (OpenAI, Gemini, Groq, etc.). We do not store your content permanently.',
  },
  {
    question: 'Which AI provider is used?',
    answer:
      'Crafvia uses the AI provider configured in server/.env. Without an API key, local template fallback mode is used for development.',
  },
  {
    question: 'Can I edit and export the output?',
    answer: 'Yes. Edit in the built-in editor, copy to clipboard, or download as TXT or DOCX.',
  },
]

function cfg(
  partial: Omit<
    AiWritingToolConfig,
    'category' | 'popularTitle' | 'faqs' | 'relatedTools' | 'popularOptions'
  > & {
    faqs?: AiWritingToolConfig['faqs']
    relatedTools?: RelatedTool[]
    popularOptions?: AiWritingToolConfig['popularOptions']
  },
): AiWritingToolConfig {
  return {
    category: 'AI Writing',
    popularTitle: `Popular ${partial.breadcrumb} Options`,
    popularOptions: partial.popularOptions ?? [
      { label: `${partial.breadcrumb} Online Free`, href: partial.path },
    ],
    faqs: partial.faqs ?? baseFaq,
    relatedTools: partial.relatedTools ?? aiRelated,
    ...partial,
  }
}

export const AI_WRITING_PRESETS: Record<string, AiWritingPreset> = {
  'ai-writer': {
    slug: 'ai-writer',
    mode: 'generate',
    showModeSelector: true,
    showContentTypeSelector: true,
    showImprovementSelector: true,
    showContinueWriting: true,
  },
  paraphrase: {
    slug: 'paraphrase',
    mode: 'improve',
    improvementType: 'rewrite',
    sourceLabel: 'Text to paraphrase',
    sourcePlaceholder: 'Paste the text you want to rewrite in different words…',
  },
  summarize: {
    slug: 'summarize',
    mode: 'improve',
    improvementType: 'summarize',
    defaultLength: 'short',
    sourceLabel: 'Text to summarize',
    sourcePlaceholder: 'Paste the long text you want summarized into key points…',
  },
  'grammar-check': {
    slug: 'grammar-check',
    mode: 'improve',
    improvementType: 'grammar',
    sourceLabel: 'Text to check',
    sourcePlaceholder: 'Paste the text you want to check for grammar and punctuation errors…',
  },
  'tone-changer': {
    slug: 'tone-changer',
    mode: 'improve',
    improvementType: 'tone',
    sourceLabel: 'Text to adjust',
    sourcePlaceholder: 'Paste the text and choose a new tone below…',
  },
  'headline-generator': {
    slug: 'headline-generator',
    mode: 'generate',
    contentType: 'headline',
    defaultLength: 'short',
    promptLabel: 'Topic or keywords',
    promptPlaceholder: 'Describe your article topic, product, or keywords for headline ideas…',
  },
  'blog-outline': {
    slug: 'blog-outline',
    mode: 'generate',
    contentType: 'blog-outline',
    defaultLength: 'medium',
    promptLabel: 'Blog topic',
    promptPlaceholder: 'Describe the blog post topic, audience, and main points to cover…',
  },
  'email-writer': {
    slug: 'email-writer',
    mode: 'generate',
    contentType: 'email',
    promptLabel: 'Email purpose',
    promptPlaceholder: 'Describe the email purpose, recipient, and key points to include…',
  },
  'product-description': {
    slug: 'product-description',
    mode: 'generate',
    contentType: 'product-description',
    promptLabel: 'Product details',
    promptPlaceholder: 'Describe the product name, features, benefits, and target audience…',
  },
  'social-caption': {
    slug: 'social-caption',
    mode: 'generate',
    contentType: 'caption',
    defaultLength: 'short',
    promptLabel: 'Post topic',
    promptPlaceholder: 'Describe your post, platform, and message…',
  },
  'resume-builder': {
    slug: 'resume-builder',
    mode: 'generate',
    contentType: 'resume',
    defaultLength: 'long',
    promptLabel: 'Your background',
    promptPlaceholder:
      'Enter your name, job target, experience, skills, education, and achievements…',
  },
  'cover-letter': {
    slug: 'cover-letter',
    mode: 'generate',
    contentType: 'cover-letter',
    promptLabel: 'Job and background',
    promptPlaceholder:
      'Describe the role, company, your experience, and why you are a strong fit…',
  },
  'translate-text': {
    slug: 'translate-text',
    mode: 'improve',
    improvementType: 'translate',
    sourceLabel: 'Text to translate',
    sourcePlaceholder: 'Paste the text you want to translate…',
  },
  'keyword-extractor': {
    slug: 'keyword-extractor',
    mode: 'improve',
    improvementType: 'keywords',
    defaultLength: 'short',
    sourceLabel: 'Text to analyze',
    sourcePlaceholder: 'Paste the text to extract SEO keywords and key phrases from…',
  },
  'readability-score': {
    slug: 'readability-score',
    mode: 'improve',
    improvementType: 'readability-score',
    sourceLabel: 'Text to analyze',
    sourcePlaceholder: 'Paste the text to analyze readability and get an improved version…',
  },
  'plagiarism-check': {
    slug: 'plagiarism-check',
    mode: 'improve',
    improvementType: 'plagiarism',
    sourceLabel: 'Text to check',
    sourcePlaceholder: 'Paste the text to analyze for potential plagiarism risks…',
  },
}

export const paraphraseConfig = cfg({
  path: '/tools/paraphrase',
  breadcrumb: 'Paraphrase',
  title: 'Paraphrase - Free & Instant',
  lead: 'Rewrite text in different words while keeping the same meaning. Powered by AI.',
  actionLabel: 'Paraphrase Text',
  processingLabel: 'Paraphrasing…',
  downloadLabel: 'Download paraphrased text',
  whatIsTitle: 'What is Paraphrase?',
  whatIsBody:
    'Paraphrase rewrites your text with fresh wording while preserving the original meaning — ideal for avoiding repetition and improving clarity.',
  howToTitle: 'How to use Paraphrase',
  howToSteps: [
    'Paste the text you want to rewrite.',
    'Choose tone and output length.',
    'Click Paraphrase Text and review the result.',
    'Copy or download the paraphrased content.',
  ],
})

export const summarizeConfig = cfg({
  path: '/tools/summarize',
  breadcrumb: 'Summarize',
  title: 'Summarize - Free & Instant',
  lead: 'Condense long text into clear, concise key points. Powered by AI.',
  actionLabel: 'Summarize Text',
  processingLabel: 'Summarizing…',
  downloadLabel: 'Download summary',
  whatIsTitle: 'What is Summarize?',
  whatIsBody:
    'Summarize turns long articles, reports, and documents into short summaries with the most important points.',
  howToTitle: 'How to use Summarize',
  howToSteps: [
    'Paste the text you want to summarize.',
    'Choose summary length.',
    'Click Summarize Text and review the key points.',
    'Copy or download the summary.',
  ],
})

export const grammarCheckConfig = cfg({
  path: '/tools/grammar-check',
  breadcrumb: 'Grammar Check',
  title: 'Grammar Check - Free & Instant',
  lead: 'Fix grammar, punctuation, and writing errors instantly. Powered by AI.',
  actionLabel: 'Check Grammar',
  processingLabel: 'Checking…',
  downloadLabel: 'Download corrected text',
  whatIsTitle: 'What is Grammar Check?',
  whatIsBody:
    'Grammar Check finds and fixes grammar, punctuation, and common writing mistakes in your text.',
  howToTitle: 'How to use Grammar Check',
  howToSteps: [
    'Paste the text to check.',
    'Click Check Grammar.',
    'Review the corrected version in the editor.',
    'Copy or download the result.',
  ],
})

export const toneChangerConfig = cfg({
  path: '/tools/tone-changer',
  breadcrumb: 'Tone Changer',
  title: 'Tone Changer - Free & Instant',
  lead: 'Adjust writing tone and style — professional, casual, friendly, and more.',
  actionLabel: 'Change Tone',
  processingLabel: 'Adjusting tone…',
  downloadLabel: 'Download text',
  whatIsTitle: 'What is Tone Changer?',
  whatIsBody:
    'Tone Changer rewrites your text to match a different tone or style without changing the core message.',
  howToTitle: 'How to use Tone Changer',
  howToSteps: [
    'Paste the text to adjust.',
    'Select the desired tone.',
    'Click Change Tone and review the result.',
    'Copy or download the updated text.',
  ],
})

export const headlineGeneratorConfig = cfg({
  path: '/tools/headline-generator',
  breadcrumb: 'Headline Generator',
  title: 'Headline Generator - Free & Instant',
  lead: 'Create catchy headlines and titles for articles, ads, and content.',
  actionLabel: 'Generate Headlines',
  processingLabel: 'Generating…',
  downloadLabel: 'Download headlines',
  whatIsTitle: 'What is Headline Generator?',
  whatIsBody:
    'Headline Generator creates multiple compelling title options for blogs, articles, ads, and landing pages.',
  howToTitle: 'How to use Headline Generator',
  howToSteps: [
    'Enter your topic or keywords.',
    'Choose tone and length.',
    'Click Generate Headlines.',
    'Pick your favorite and copy or download.',
  ],
})

export const blogOutlineConfig = cfg({
  path: '/tools/blog-outline',
  breadcrumb: 'Blog Outline',
  title: 'Blog Outline - Free & Instant',
  lead: 'Generate structured blog post outlines with sections and key points.',
  actionLabel: 'Generate Outline',
  processingLabel: 'Generating…',
  downloadLabel: 'Download outline',
  whatIsTitle: 'What is Blog Outline?',
  whatIsBody:
    'Blog Outline creates a clear structure for your post with headings, sections, and bullet points before you write.',
  howToTitle: 'How to use Blog Outline',
  howToSteps: [
    'Describe your blog topic and audience.',
    'Choose tone and length.',
    'Click Generate Outline.',
    'Use the outline to write your full post.',
  ],
})

export const emailWriterConfig = cfg({
  path: '/tools/email-writer',
  breadcrumb: 'Email Writer',
  title: 'Email Writer - Free & Instant',
  lead: 'Draft professional emails quickly with AI assistance.',
  actionLabel: 'Write Email',
  processingLabel: 'Writing…',
  downloadLabel: 'Download email',
  whatIsTitle: 'What is Email Writer?',
  whatIsBody:
    'Email Writer helps you compose clear, professional emails for business, follow-ups, outreach, and more.',
  howToTitle: 'How to use Email Writer',
  howToSteps: [
    'Describe the email purpose and key points.',
    'Choose tone and length.',
    'Click Write Email.',
    'Edit, copy, or download the draft.',
  ],
})

export const productDescriptionConfig = cfg({
  path: '/tools/product-description',
  breadcrumb: 'Product Description',
  title: 'Product Description - Free & Instant',
  lead: 'Write compelling product descriptions for e-commerce and marketing.',
  actionLabel: 'Write Description',
  processingLabel: 'Writing…',
  downloadLabel: 'Download description',
  whatIsTitle: 'What is Product Description?',
  whatIsBody:
    'Product Description generates persuasive copy that highlights features, benefits, and value for online stores.',
  howToTitle: 'How to use Product Description',
  howToSteps: [
    'Enter product details and target audience.',
    'Choose tone and length.',
    'Click Write Description.',
    'Copy or download the product copy.',
  ],
})

export const socialCaptionConfig = cfg({
  path: '/tools/social-caption',
  breadcrumb: 'Social Caption',
  title: 'Social Caption - Free & Instant',
  lead: 'Create engaging social media captions for Instagram, Facebook, and more.',
  actionLabel: 'Generate Caption',
  processingLabel: 'Generating…',
  downloadLabel: 'Download caption',
  whatIsTitle: 'What is Social Caption?',
  whatIsBody:
    'Social Caption writes short, engaging captions tailored to your post topic and platform.',
  howToTitle: 'How to use Social Caption',
  howToSteps: [
    'Describe your post and platform.',
    'Choose tone.',
    'Click Generate Caption.',
    'Copy or download the caption.',
  ],
})

export const resumeBuilderConfig = cfg({
  path: '/tools/resume-builder',
  breadcrumb: 'Resume Builder',
  title: 'Resume Builder - Free & Instant',
  lead: 'Build professional resumes and CVs with AI assistance.',
  actionLabel: 'Build Resume',
  processingLabel: 'Building…',
  downloadLabel: 'Download resume',
  whatIsTitle: 'What is Resume Builder?',
  whatIsBody:
    'Resume Builder creates a structured professional resume from your experience, skills, and education.',
  howToTitle: 'How to use Resume Builder',
  howToSteps: [
    'Enter your background, skills, and job target.',
    'Choose tone.',
    'Click Build Resume.',
    'Edit, copy, or download your resume.',
  ],
})

export const coverLetterConfig = cfg({
  path: '/tools/cover-letter',
  breadcrumb: 'Cover Letter',
  title: 'Cover Letter - Free & Instant',
  lead: 'Generate tailored cover letters for job applications.',
  actionLabel: 'Write Cover Letter',
  processingLabel: 'Writing…',
  downloadLabel: 'Download cover letter',
  whatIsTitle: 'What is Cover Letter?',
  whatIsBody:
    'Cover Letter creates personalized cover letters based on the role, company, and your background.',
  howToTitle: 'How to use Cover Letter',
  howToSteps: [
    'Describe the job, company, and your experience.',
    'Choose tone and length.',
    'Click Write Cover Letter.',
    'Edit, copy, or download the letter.',
  ],
})

export const translateTextConfig = cfg({
  path: '/tools/translate-text',
  breadcrumb: 'Translate Text',
  title: 'Translate Text - Free & Instant',
  lead: 'Translate text between languages with AI-powered accuracy.',
  actionLabel: 'Translate',
  processingLabel: 'Translating…',
  downloadLabel: 'Download translation',
  whatIsTitle: 'What is Translate Text?',
  whatIsBody:
    'Translate Text converts your content into another language while preserving meaning and natural phrasing.',
  howToTitle: 'How to use Translate Text',
  howToSteps: [
    'Paste the text to translate.',
    'Enter the target language.',
    'Click Translate.',
    'Copy or download the translated text.',
  ],
})

export const keywordExtractorConfig = cfg({
  path: '/tools/keyword-extractor',
  breadcrumb: 'Keyword Extractor',
  title: 'Keyword Extractor - Free & Instant',
  lead: 'Extract SEO keywords and key phrases from any text.',
  actionLabel: 'Extract Keywords',
  processingLabel: 'Extracting…',
  downloadLabel: 'Download keywords',
  whatIsTitle: 'What is Keyword Extractor?',
  whatIsBody:
    'Keyword Extractor identifies primary, secondary, and long-tail keywords for SEO and content planning.',
  howToTitle: 'How to use Keyword Extractor',
  howToSteps: [
    'Paste the text to analyze.',
    'Click Extract Keywords.',
    'Review the keyword groups.',
    'Copy or download the results.',
  ],
  relatedTools: [
    { name: 'AI Writer', description: 'Generate SEO content', icon: PenLine, href: '/tools/ai-writer' },
    { name: 'Summarize', description: 'Summarize long text', icon: FileType, href: '/tools/summarize' },
    { name: 'Blog Outline', description: 'Plan blog structure', icon: ListTree, href: '/tools/blog-outline' },
    { name: 'Headline Generator', description: 'Create catchy titles', icon: Type, href: '/tools/headline-generator' },
    { name: 'Readability Score', description: 'Analyze readability', icon: FileText, href: '/tools/readability-score' },
    { name: 'Paraphrase', description: 'Rewrite text', icon: PenLine, href: '/tools/paraphrase' },
  ],
})

export const readabilityScoreConfig = cfg({
  path: '/tools/readability-score',
  breadcrumb: 'Readability Score',
  title: 'Readability Score - Free & Instant',
  lead: 'Analyze text readability and get an improved version.',
  actionLabel: 'Analyze Readability',
  processingLabel: 'Analyzing…',
  downloadLabel: 'Download analysis',
  whatIsTitle: 'What is Readability Score?',
  whatIsBody:
    'Readability Score estimates how easy your text is to read, highlights issues, and suggests an improved version.',
  howToTitle: 'How to use Readability Score',
  howToSteps: [
    'Paste the text to analyze.',
    'Click Analyze Readability.',
    'Review the score, issues, and improved text.',
    'Copy or download the results.',
  ],
})

export const plagiarismCheckConfig = cfg({
  path: '/tools/plagiarism-check',
  breadcrumb: 'Plagiarism Check',
  title: 'Plagiarism Check - Free & Instant',
  lead: 'Analyze text for potential plagiarism risks and similarity patterns.',
  actionLabel: 'Check Plagiarism',
  processingLabel: 'Analyzing…',
  downloadLabel: 'Download report',
  whatIsTitle: 'What is Plagiarism Check?',
  whatIsBody:
    'Plagiarism Check provides an AI-assisted analysis of potential duplicate content risks and recommendations.',
  howToTitle: 'How to use Plagiarism Check',
  howToSteps: [
    'Paste the text to check.',
    'Click Check Plagiarism.',
    'Review the risk report and recommendations.',
    'Copy or download the report.',
  ],
  faqs: [
    ...baseFaq,
    {
      question: 'Does this compare against the entire web?',
      answer:
        'This tool provides AI-assisted pattern analysis. For official plagiarism detection against web databases, use a dedicated plagiarism service.',
    },
  ],
  relatedTools: [
    { name: 'Grammar Check', description: 'Fix writing errors', icon: Wand2, href: '/tools/grammar-check' },
    { name: 'Paraphrase', description: 'Rewrite text', icon: PenLine, href: '/tools/paraphrase' },
    { name: 'Readability Score', description: 'Analyze readability', icon: FileText, href: '/tools/readability-score' },
    { name: 'AI Writer', description: 'Generate original content', icon: Sparkles, href: '/tools/ai-writer' },
    { name: 'Keyword Extractor', description: 'Extract SEO keywords', icon: Search, href: '/tools/keyword-extractor' },
    { name: 'Summarize', description: 'Summarize text', icon: FileType, href: '/tools/summarize' },
  ],
})

export const AI_WRITING_TOOL_ENTRIES: {
  slug: string
  config: AiWritingToolConfig
  preset: AiWritingPreset
}[] = [
  { slug: 'paraphrase', config: paraphraseConfig, preset: AI_WRITING_PRESETS.paraphrase },
  { slug: 'summarize', config: summarizeConfig, preset: AI_WRITING_PRESETS.summarize },
  { slug: 'grammar-check', config: grammarCheckConfig, preset: AI_WRITING_PRESETS['grammar-check'] },
  { slug: 'tone-changer', config: toneChangerConfig, preset: AI_WRITING_PRESETS['tone-changer'] },
  { slug: 'headline-generator', config: headlineGeneratorConfig, preset: AI_WRITING_PRESETS['headline-generator'] },
  { slug: 'blog-outline', config: blogOutlineConfig, preset: AI_WRITING_PRESETS['blog-outline'] },
  { slug: 'email-writer', config: emailWriterConfig, preset: AI_WRITING_PRESETS['email-writer'] },
  { slug: 'product-description', config: productDescriptionConfig, preset: AI_WRITING_PRESETS['product-description'] },
  { slug: 'social-caption', config: socialCaptionConfig, preset: AI_WRITING_PRESETS['social-caption'] },
  { slug: 'resume-builder', config: resumeBuilderConfig, preset: AI_WRITING_PRESETS['resume-builder'] },
  { slug: 'cover-letter', config: coverLetterConfig, preset: AI_WRITING_PRESETS['cover-letter'] },
  { slug: 'translate-text', config: translateTextConfig, preset: AI_WRITING_PRESETS['translate-text'] },
  { slug: 'keyword-extractor', config: keywordExtractorConfig, preset: AI_WRITING_PRESETS['keyword-extractor'] },
  { slug: 'readability-score', config: readabilityScoreConfig, preset: AI_WRITING_PRESETS['readability-score'] },
  { slug: 'plagiarism-check', config: plagiarismCheckConfig, preset: AI_WRITING_PRESETS['plagiarism-check'] },
]
