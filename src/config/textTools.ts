import { AlignLeft, Clock, Hash, Replace, Search, Type } from 'lucide-react'
import type { RelatedTool } from './tools'

export type TextToolConfig = {
  path: string
  category: string
  breadcrumb: string
  title: string
  lead: string
  actionLabel?: string
  whatIsTitle: string
  whatIsBody: string
  howToTitle: string
  howToSteps: string[]
  faqs: { question: string; answer: string }[]
  popularTitle: string
  popularOptions: { label: string; href?: string }[]
  relatedTools: RelatedTool[]
}

const textRelated: RelatedTool[] = [
  { name: 'Word Counter', description: 'Count words and characters', icon: Hash, href: '/tools/word-counter' },
  { name: 'Case Converter', description: 'Convert text between cases', icon: Type, href: '/tools/case-converter' },
  { name: 'Find and Replace', description: 'Find and replace patterns', icon: Replace, href: '/tools/find-replace' },
  { name: 'Lorem Ipsum', description: 'Generate placeholder text', icon: AlignLeft, href: '/tools/lorem-ipsum' },
  { name: 'Text Diff', description: 'Compare two text versions', icon: Search, href: '/tools/text-diff' },
  { name: 'Reading Time', description: 'Estimate reading time', icon: Clock, href: '/tools/reading-time' },
]

const baseFaq = [
  {
    question: 'Is my text uploaded to a server?',
    answer:
      'Text tools run primarily in your browser for instant, private processing. An optional server API is available for the same operations.',
  },
  {
    question: 'Is there a character limit?',
    answer: 'Each tool supports up to 100,000 characters per input for reliable performance.',
  },
  {
    question: 'Can I copy or download results?',
    answer: 'Yes. Copy results to your clipboard or download them as a plain text file.',
  },
]

function cfg(
  partial: Omit<TextToolConfig, 'category' | 'popularTitle' | 'faqs' | 'relatedTools' | 'popularOptions'> & {
    faqs?: TextToolConfig['faqs']
    relatedTools?: RelatedTool[]
    popularOptions?: TextToolConfig['popularOptions']
  },
): TextToolConfig {
  return {
    category: 'Text Tools',
    popularTitle: `Popular ${partial.breadcrumb} Options`,
    popularOptions: partial.popularOptions ?? [
      { label: `${partial.breadcrumb} Online Free`, href: partial.path },
    ],
    faqs: partial.faqs ?? baseFaq,
    relatedTools: partial.relatedTools ?? textRelated,
    ...partial,
  }
}

export const wordCounterConfig = cfg({
  path: '/tools/word-counter',
  breadcrumb: 'Word Counter',
  title: 'Word Counter - Free & Instant',
  lead: 'Count words, characters, sentences, paragraphs, and lines instantly.',
  whatIsTitle: 'What is Word Counter?',
  whatIsBody:
    'Word Counter gives you detailed text statistics as you type — perfect for essays, posts, and content limits.',
  howToTitle: 'How to use Word Counter',
  howToSteps: ['Paste or type your text.', 'View live word and character counts.', 'Copy stats or clear to start again.'],
})

export const caseConverterConfig = cfg({
  path: '/tools/case-converter',
  breadcrumb: 'Case Converter',
  title: 'Case Converter - Free & Instant',
  lead: 'Convert text between uppercase, lowercase, title case, camelCase, and more.',
  actionLabel: 'Convert Case',
  whatIsTitle: 'What is Case Converter?',
  whatIsBody: 'Case Converter transforms text formatting for code, titles, headings, and documents.',
  howToTitle: 'How to use Case Converter',
  howToSteps: ['Paste your text.', 'Choose a case style.', 'Click Convert Case and copy the result.'],
})

export const loremIpsumConfig = cfg({
  path: '/tools/lorem-ipsum',
  breadcrumb: 'Lorem Ipsum',
  title: 'Lorem Ipsum Generator - Free & Instant',
  lead: 'Generate placeholder Lorem Ipsum text for designs and mockups.',
  actionLabel: 'Generate Lorem Ipsum',
  whatIsTitle: 'What is Lorem Ipsum?',
  whatIsBody: 'Lorem Ipsum generates filler text for layouts, wireframes, and design previews.',
  howToTitle: 'How to use Lorem Ipsum',
  howToSteps: ['Choose paragraph count and length.', 'Click Generate Lorem Ipsum.', 'Copy or download the placeholder text.'],
})

export const removeDuplicatesConfig = cfg({
  path: '/tools/remove-duplicates',
  breadcrumb: 'Remove Duplicates',
  title: 'Remove Duplicates - Free & Instant',
  lead: 'Remove duplicate lines from any text list.',
  actionLabel: 'Remove Duplicates',
  whatIsTitle: 'What is Remove Duplicates?',
  whatIsBody: 'Remove Duplicates cleans lists by keeping only unique lines.',
  howToTitle: 'How to use Remove Duplicates',
  howToSteps: ['Paste your text with one item per line.', 'Choose case sensitivity.', 'Click Remove Duplicates.'],
})

export const sortLinesConfig = cfg({
  path: '/tools/sort-lines',
  breadcrumb: 'Sort Lines',
  title: 'Sort Lines - Free & Instant',
  lead: 'Sort lines alphabetically in ascending or descending order.',
  actionLabel: 'Sort Lines',
  whatIsTitle: 'What is Sort Lines?',
  whatIsBody: 'Sort Lines alphabetizes multi-line text for lists, names, and data cleanup.',
  howToTitle: 'How to use Sort Lines',
  howToSteps: ['Paste your text.', 'Choose sort order.', 'Click Sort Lines and copy the result.'],
})

export const reverseTextConfig = cfg({
  path: '/tools/reverse-text',
  breadcrumb: 'Reverse Text',
  title: 'Reverse Text - Free & Instant',
  lead: 'Reverse text by characters, words, or lines.',
  actionLabel: 'Reverse Text',
  whatIsTitle: 'What is Reverse Text?',
  whatIsBody: 'Reverse Text flips your content character-by-character, word-by-word, or line-by-line.',
  howToTitle: 'How to use Reverse Text',
  howToSteps: ['Paste your text.', 'Choose reverse mode.', 'Click Reverse Text and copy the output.'],
})

export const findReplaceConfig = cfg({
  path: '/tools/find-replace',
  breadcrumb: 'Find and Replace',
  title: 'Find and Replace - Free & Instant',
  lead: 'Find and replace text patterns with optional regex support.',
  actionLabel: 'Replace Text',
  whatIsTitle: 'What is Find and Replace?',
  whatIsBody: 'Find and Replace updates all matching text patterns in your content.',
  howToTitle: 'How to use Find and Replace',
  howToSteps: ['Paste your text.', 'Enter find and replace values.', 'Click Replace Text.'],
})

export const addLineNumbersConfig = cfg({
  path: '/tools/add-line-numbers',
  breadcrumb: 'Add Line Numbers',
  title: 'Add Line Numbers - Free & Instant',
  lead: 'Number each line of text automatically.',
  actionLabel: 'Add Line Numbers',
  whatIsTitle: 'What is Add Line Numbers?',
  whatIsBody: 'Add Line Numbers prefixes each line with sequential numbers for scripts, code snippets, and lists.',
  howToTitle: 'How to use Add Line Numbers',
  howToSteps: ['Paste your text.', 'Set starting number and separator.', 'Click Add Line Numbers.'],
})

export const removeSpacesConfig = cfg({
  path: '/tools/remove-spaces',
  breadcrumb: 'Remove Extra Spaces',
  title: 'Remove Extra Spaces - Free & Instant',
  lead: 'Clean up extra whitespace, trim lines, and normalize text.',
  actionLabel: 'Clean Whitespace',
  whatIsTitle: 'What is Remove Extra Spaces?',
  whatIsBody: 'Remove Extra Spaces fixes messy spacing, trailing spaces, and inconsistent whitespace.',
  howToTitle: 'How to use Remove Extra Spaces',
  howToSteps: ['Paste your text.', 'Choose a cleanup mode.', 'Click Clean Whitespace.'],
})

export const textDiffConfig = cfg({
  path: '/tools/text-diff',
  breadcrumb: 'Text Diff',
  title: 'Text Diff - Free & Instant',
  lead: 'Compare two text versions and highlight additions and removals.',
  actionLabel: 'Compare Text',
  whatIsTitle: 'What is Text Diff?',
  whatIsBody: 'Text Diff shows line-by-line differences between two text versions.',
  howToTitle: 'How to use Text Diff',
  howToSteps: ['Paste original text in the first box.', 'Paste updated text in the second box.', 'Click Compare Text.'],
})

export const emojiPickerConfig = cfg({
  path: '/tools/emoji-picker',
  breadcrumb: 'Emoji Picker',
  title: 'Emoji Picker - Free & Instant',
  lead: 'Browse and copy emojis by category.',
  whatIsTitle: 'What is Emoji Picker?',
  whatIsBody: 'Emoji Picker lets you browse popular emoji categories and copy any emoji instantly.',
  howToTitle: 'How to use Emoji Picker',
  howToSteps: ['Browse emoji categories.', 'Click an emoji to copy it.', 'Paste anywhere you need it.'],
})

export const fancyTextConfig = cfg({
  path: '/tools/fancy-text',
  breadcrumb: 'Fancy Text',
  title: 'Fancy Text - Free & Instant',
  lead: 'Generate stylized Unicode text for social posts and usernames.',
  actionLabel: 'Generate Fancy Text',
  whatIsTitle: 'What is Fancy Text?',
  whatIsBody: 'Fancy Text converts regular letters into stylized Unicode characters.',
  howToTitle: 'How to use Fancy Text',
  howToSteps: ['Enter your text.', 'Choose a style.', 'Click Generate Fancy Text and copy the result.'],
})

export const morseCodeConfig = cfg({
  path: '/tools/morse-code',
  breadcrumb: 'Morse Code',
  title: 'Morse Code Converter - Free & Instant',
  lead: 'Convert text to Morse code and decode Morse back to text.',
  actionLabel: 'Convert',
  whatIsTitle: 'What is Morse Code?',
  whatIsBody: 'Morse Code converts between plain text and International Morse Code.',
  howToTitle: 'How to use Morse Code',
  howToSteps: ['Enter text or Morse code.', 'Choose encode or decode.', 'Click Convert.'],
})

export const binaryConverterConfig = cfg({
  path: '/tools/binary-converter',
  breadcrumb: 'Binary Converter',
  title: 'Binary Converter - Free & Instant',
  lead: 'Convert text to binary and binary back to text.',
  actionLabel: 'Convert',
  whatIsTitle: 'What is Binary Converter?',
  whatIsBody: 'Binary Converter encodes text as 8-bit binary and decodes binary strings back to readable text.',
  howToTitle: 'How to use Binary Converter',
  howToSteps: ['Enter text or binary.', 'Choose encode or decode.', 'Click Convert.'],
})

export const readingTimeConfig = cfg({
  path: '/tools/reading-time',
  breadcrumb: 'Reading Time',
  title: 'Reading Time - Free & Instant',
  lead: 'Estimate how long it takes to read your text.',
  whatIsTitle: 'What is Reading Time?',
  whatIsBody: 'Reading Time calculates an estimated reading duration based on word count and reading speed.',
  howToTitle: 'How to use Reading Time',
  howToSteps: ['Paste your text.', 'Adjust words-per-minute if needed.', 'View the estimated reading time instantly.'],
})

export const TEXT_TOOL_CONFIGS: Record<string, TextToolConfig> = {
  'word-counter': wordCounterConfig,
  'case-converter': caseConverterConfig,
  'lorem-ipsum': loremIpsumConfig,
  'remove-duplicates': removeDuplicatesConfig,
  'sort-lines': sortLinesConfig,
  'reverse-text': reverseTextConfig,
  'find-replace': findReplaceConfig,
  'add-line-numbers': addLineNumbersConfig,
  'remove-spaces': removeSpacesConfig,
  'text-diff': textDiffConfig,
  'emoji-picker': emojiPickerConfig,
  'fancy-text': fancyTextConfig,
  'morse-code': morseCodeConfig,
  'binary-converter': binaryConverterConfig,
  'reading-time': readingTimeConfig,
}
