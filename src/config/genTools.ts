import { Lock, Palette, PenLine, QrCode, Sparkles, Type } from 'lucide-react'
import type { RelatedTool } from './tools'

export type GenToolConfig = {
  path: string
  category: string
  breadcrumb: string
  title: string
  lead: string
  actionLabel?: string
  processingLabel?: string
  whatIsTitle: string
  whatIsBody: string
  howToTitle: string
  howToSteps: string[]
  faqs: { question: string; answer: string }[]
  popularTitle: string
  popularOptions: { label: string; href?: string }[]
  relatedTools: RelatedTool[]
}

const genRelated: RelatedTool[] = [
  { name: 'QR Code Generator', description: 'Create custom QR codes', icon: QrCode, href: '/tools/qr-code-generator' },
  { name: 'Password Generator', description: 'Strong secure passwords', icon: Lock, href: '/tools/password-generator' },
  { name: 'Image Generator', description: 'AI images from prompts', icon: Sparkles, href: '/tools/image-generator' },
  { name: 'Color Palette', description: 'Harmonious color palettes', icon: Palette, href: '/tools/color-palette' },
  { name: 'Logo Maker', description: 'Simple logo designs', icon: PenLine, href: '/tools/logo-maker' },
  { name: 'Name Generator', description: 'Project and brand names', icon: Type, href: '/tools/name-generator' },
]

const baseFaq = [
  {
    question: 'Does my data get uploaded?',
    answer: 'Most tools run in your browser. AI image and name generation use the configured API with your prompt only.',
  },
  {
    question: 'Can I download results?',
    answer: 'Yes. Every tool supports copy or download/export where applicable.',
  },
]

function cfg(
  partial: Omit<GenToolConfig, 'category' | 'popularTitle' | 'faqs' | 'relatedTools' | 'popularOptions'> & {
    faqs?: GenToolConfig['faqs']
    relatedTools?: RelatedTool[]
    popularOptions?: GenToolConfig['popularOptions']
  },
): GenToolConfig {
  return {
    category: 'AI Generation',
    popularTitle: `Popular ${partial.breadcrumb} Options`,
    popularOptions: partial.popularOptions ?? [{ label: `${partial.breadcrumb} Online Free`, href: partial.path }],
    faqs: partial.faqs ?? baseFaq,
    relatedTools: partial.relatedTools ?? genRelated,
    processingLabel: 'Generating…',
    ...partial,
  }
}

export const passwordGeneratorConfig = cfg({
  path: '/tools/password-generator',
  breadcrumb: 'Password Generator',
  title: 'Password Generator - Strong & Secure',
  lead: 'Generate cryptographically secure passwords with custom length, character sets, and strength scoring.',
  actionLabel: 'Generate Passwords',
  whatIsTitle: 'What is Password Generator?',
  whatIsBody: 'Password Generator creates strong random passwords using secure browser randomness. Customize length, uppercase, lowercase, numbers, and symbols, then copy or bulk-generate multiple passwords.',
  howToTitle: 'How to use Password Generator',
  howToSteps: [
    'Set password length and character options.',
    'Choose how many passwords to generate.',
    'Click Generate and review the strength indicator.',
    'Copy a password or download the full list.',
  ],
})

export const imageGeneratorConfig = cfg({
  path: '/tools/image-generator',
  breadcrumb: 'Image Generator',
  title: 'Image Generator - AI Art from Text',
  lead: 'Generate images from text prompts with multiple aspect ratios. Uses your configured AI provider when available.',
  actionLabel: 'Generate Image',
  whatIsTitle: 'What is Image Generator?',
  whatIsBody: 'Image Generator turns text prompts into images. When OpenAI is configured, it uses DALL·E. Otherwise a styled fallback artwork is generated from your prompt.',
  howToTitle: 'How to use Image Generator',
  howToSteps: [
    'Describe the image you want in the prompt field.',
    'Select an aspect ratio.',
    'Click Generate Image and wait for the preview.',
    'Download the result as PNG.',
  ],
  faqs: [
    ...baseFaq,
    {
      question: 'Which AI provider is used?',
      answer: 'OpenAI DALL·E when OPENAI_API_KEY is set in server/.env. Otherwise a local styled artwork fallback is generated.',
    },
  ],
})

export const barcodeGeneratorConfig = cfg({
  path: '/tools/barcode-generator',
  breadcrumb: 'Barcode Generator',
  title: 'Barcode Generator - CODE128, EAN-13, UPC',
  lead: 'Create scannable barcodes for products and labels. Export as PNG or SVG.',
  actionLabel: 'Generate Barcode',
  whatIsTitle: 'What is Barcode Generator?',
  whatIsBody: 'Barcode Generator creates CODE128, EAN-13, and UPC barcodes with validation and check-digit handling. Preview instantly and download PNG or SVG.',
  howToTitle: 'How to use Barcode Generator',
  howToSteps: [
    'Choose a barcode format.',
    'Enter product data or numeric code.',
    'Click Generate to preview the barcode.',
    'Download as PNG or SVG.',
  ],
})

export const colorPaletteConfig = cfg({
  path: '/tools/color-palette',
  breadcrumb: 'Color Palette Generator',
  title: 'Color Palette Generator',
  lead: 'Generate random, harmonious, complementary, analogous, and triadic color palettes with HEX and RGB output.',
  actionLabel: 'Generate Palette',
  whatIsTitle: 'What is Color Palette Generator?',
  whatIsBody: 'Color Palette Generator produces designer-friendly color schemes. Copy individual colors or export the full palette.',
  howToTitle: 'How to use Color Palette Generator',
  howToSteps: [
    'Select a palette mode.',
    'Optionally set a base color for harmonious schemes.',
    'Click Generate Palette.',
    'Copy HEX/RGB values or export as CSS.',
  ],
})

export const logoMakerConfig = cfg({
  path: '/tools/logo-maker',
  breadcrumb: 'Logo Maker',
  title: 'Logo Maker - Simple Logo Creator',
  lead: 'Create simple logos with text, icons, colors, and fonts. Export as PNG or SVG.',
  actionLabel: 'Generate Logo',
  whatIsTitle: 'What is Logo Maker?',
  whatIsBody: 'Logo Maker combines icon shapes, brand text, and colors into a clean logo preview. Download high-resolution PNG or editable SVG.',
  howToTitle: 'How to use Logo Maker',
  howToSteps: [
    'Enter your brand or company name.',
    'Pick an icon, font, and colors.',
    'Click Generate Logo to preview.',
    'Download PNG or SVG.',
  ],
})

export const memeGeneratorConfig = cfg({
  path: '/tools/meme-generator',
  breadcrumb: 'Meme Generator',
  title: 'Meme Generator - Add Top & Bottom Text',
  lead: 'Upload an image or pick a template, add classic meme text, and download as PNG.',
  actionLabel: 'Generate Meme',
  whatIsTitle: 'What is Meme Generator?',
  whatIsBody: 'Meme Generator overlays bold top and bottom text on your image using the classic meme style. Works on mobile and desktop entirely in your browser.',
  howToTitle: 'How to use Meme Generator',
  howToSteps: [
    'Upload an image or select a template.',
    'Enter top and bottom text.',
    'Click Generate Meme to preview.',
    'Download the meme as PNG.',
  ],
})

export const nameGeneratorConfig = cfg({
  path: '/tools/name-generator',
  breadcrumb: 'Name Generator',
  title: 'Name Generator - Project & Brand Names',
  lead: 'Generate project, business, startup, and brand names with optional keywords. AI-enhanced when configured.',
  actionLabel: 'Generate Names',
  whatIsTitle: 'What is Name Generator?',
  whatIsBody: 'Name Generator produces creative name ideas for projects, businesses, startups, and brands. Use keywords to steer results or enable AI for richer suggestions.',
  howToTitle: 'How to use Name Generator',
  howToSteps: [
    'Choose a name category.',
    'Add an optional keyword.',
    'Set how many names to generate.',
    'Copy your favorites from the results.',
  ],
})
