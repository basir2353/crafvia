import { Braces, Code2, Hash, Link2, Search } from 'lucide-react'
import type { RelatedTool } from './tools'

export type DevToolConfig = {
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

const devRelated: RelatedTool[] = [
  { name: 'JSON Formatter', description: 'Beautify and validate JSON', icon: Braces, href: '/tools/json-formatter' },
  { name: 'Base64 Encode', description: 'Encode and decode Base64', icon: Code2, href: '/tools/base64-encode' },
  { name: 'Regex Tester', description: 'Test regex patterns live', icon: Search, href: '/tools/regex-tester' },
  { name: 'Hash Generator', description: 'MD5 and SHA hashes', icon: Hash, href: '/tools/hash-generator' },
  { name: 'UUID Generator', description: 'Generate UUID v4', icon: Hash, href: '/tools/uuid-generator' },
  { name: 'API Tester', description: 'Send HTTP requests', icon: Link2, href: '/tools/api-tester' },
]

const baseFaq = [
  {
    question: 'Is my data uploaded to a server?',
    answer: 'Developer tools run primarily in your browser. Your code and data stay on your device unless you use API Tester to call external URLs.',
  },
  {
    question: 'Can I copy or download results?',
    answer: 'Yes. Copy output to your clipboard or download files where supported.',
  },
]

function cfg(
  partial: Omit<DevToolConfig, 'category' | 'popularTitle' | 'faqs' | 'relatedTools' | 'popularOptions'> & {
    faqs?: DevToolConfig['faqs']
    relatedTools?: RelatedTool[]
    popularOptions?: DevToolConfig['popularOptions']
  },
): DevToolConfig {
  return {
    category: 'Developer Tools',
    popularTitle: `Popular ${partial.breadcrumb} Options`,
    popularOptions: partial.popularOptions ?? [{ label: `${partial.breadcrumb} Online Free`, href: partial.path }],
    faqs: partial.faqs ?? baseFaq,
    relatedTools: partial.relatedTools ?? devRelated,
    ...partial,
  }
}

export const base64EncodeConfig = cfg({
  path: '/tools/base64-encode',
  breadcrumb: 'Base64 Encode',
  title: 'Base64 Encode & Decode',
  lead: 'Encode and decode text and files to Base64 with Unicode support.',
  actionLabel: 'Convert',
  whatIsTitle: 'What is Base64 Encode?',
  whatIsBody: 'Base64 Encode converts text or binary data to Base64 and back — useful for APIs, data URIs, and encoding files.',
  howToTitle: 'How to use Base64 Encode',
  howToSteps: ['Enter text or upload a file.', 'Choose encode or decode mode.', 'Copy or download the result.'],
})

export const regexTesterConfig = cfg({
  path: '/tools/regex-tester',
  breadcrumb: 'Regex Tester',
  title: 'Regex Tester - Live Matching',
  lead: 'Test regular expressions with flags, live match highlighting, and error detection.',
  whatIsTitle: 'What is Regex Tester?',
  whatIsBody: 'Regex Tester lets you test patterns against sample text with real-time match highlighting.',
  howToTitle: 'How to use Regex Tester',
  howToSteps: ['Enter your regex pattern and flags.', 'Paste test text.', 'Review highlighted matches and match list.'],
})

export const uuidGeneratorConfig = cfg({
  path: '/tools/uuid-generator',
  breadcrumb: 'UUID Generator',
  title: 'UUID Generator - v4',
  lead: 'Generate cryptographically random UUID v4 values in bulk.',
  actionLabel: 'Generate UUIDs',
  whatIsTitle: 'What is UUID Generator?',
  whatIsBody: 'UUID Generator creates random version-4 UUIDs for databases, APIs, and unique identifiers.',
  howToTitle: 'How to use UUID Generator',
  howToSteps: ['Set how many UUIDs to generate.', 'Click Generate.', 'Copy or download the list.'],
})

export const hashGeneratorConfig = cfg({
  path: '/tools/hash-generator',
  breadcrumb: 'Hash Generator',
  title: 'Hash Generator - MD5 & SHA',
  lead: 'Generate MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes from text or files.',
  actionLabel: 'Generate Hash',
  whatIsTitle: 'What is Hash Generator?',
  whatIsBody: 'Hash Generator computes cryptographic hashes for verifying data integrity.',
  howToTitle: 'How to use Hash Generator',
  howToSteps: ['Select a hash algorithm.', 'Enter text or upload a file.', 'Copy the hash result.'],
})

export const urlEncoderConfig = cfg({
  path: '/tools/url-encoder',
  breadcrumb: 'URL Encoder',
  title: 'URL Encoder & Decoder',
  lead: 'URL-encode and decode text with full Unicode support.',
  actionLabel: 'Convert',
  whatIsTitle: 'What is URL Encoder?',
  whatIsBody: 'URL Encoder converts special characters for safe use in URLs and query strings.',
  howToTitle: 'How to use URL Encoder',
  howToSteps: ['Enter text to encode or decode.', 'Choose encode/decode and component mode.', 'Copy the result.'],
})

export const htmlFormatterConfig = cfg({
  path: '/tools/html-formatter',
  breadcrumb: 'HTML Formatter',
  title: 'HTML Formatter',
  lead: 'Beautify, minify, and validate HTML structure.',
  actionLabel: 'Format HTML',
  whatIsTitle: 'What is HTML Formatter?',
  whatIsBody: 'HTML Formatter indents or minifies HTML and checks basic tag balance.',
  howToTitle: 'How to use HTML Formatter',
  howToSteps: ['Paste HTML markup.', 'Choose beautify or minify.', 'Copy the formatted output.'],
})

export const cssFormatterConfig = cfg({
  path: '/tools/css-formatter',
  breadcrumb: 'CSS Formatter',
  title: 'CSS Formatter',
  lead: 'Beautify and minify CSS with structure validation.',
  actionLabel: 'Format CSS',
  whatIsTitle: 'What is CSS Formatter?',
  whatIsBody: 'CSS Formatter formats stylesheets for readability or production minification.',
  howToTitle: 'How to use CSS Formatter',
  howToSteps: ['Paste CSS code.', 'Choose beautify or minify.', 'Copy the result.'],
})

export const jsFormatterConfig = cfg({
  path: '/tools/js-formatter',
  breadcrumb: 'JS Formatter',
  title: 'JavaScript Formatter',
  lead: 'Beautify, minify, and validate JavaScript syntax.',
  actionLabel: 'Format JavaScript',
  whatIsTitle: 'What is JS Formatter?',
  whatIsBody: 'JS Formatter formats JavaScript code and reports syntax errors before minifying.',
  howToTitle: 'How to use JS Formatter',
  howToSteps: ['Paste JavaScript code.', 'Beautify or minify.', 'Fix any syntax errors reported.'],
})

export const jwtDecoderConfig = cfg({
  path: '/tools/jwt-decoder',
  breadcrumb: 'JWT Decoder',
  title: 'JWT Decoder',
  lead: 'Decode JWT header and payload. Does not verify signatures.',
  actionLabel: 'Decode JWT',
  whatIsTitle: 'What is JWT Decoder?',
  whatIsBody: 'JWT Decoder reads JSON Web Token headers and payloads and shows expiration — without claiming signature verification.',
  howToTitle: 'How to use JWT Decoder',
  howToSteps: ['Paste a JWT token.', 'Decode to view header and payload.', 'Check expiration status.'],
})

export const cronGeneratorConfig = cfg({
  path: '/tools/cron-generator',
  breadcrumb: 'Cron Generator',
  title: 'Cron Expression Generator',
  lead: 'Build cron expressions visually with human-readable explanations.',
  actionLabel: 'Generate Cron',
  whatIsTitle: 'What is Cron Generator?',
  whatIsBody: 'Cron Generator helps you build valid 5-field cron expressions for schedulers like cron, Kubernetes, and GitHub Actions.',
  howToTitle: 'How to use Cron Generator',
  howToSteps: ['Set minute, hour, day, month, and weekday fields.', 'Generate the cron expression.', 'Copy the result.'],
})

export const colorConverterConfig = cfg({
  path: '/tools/color-converter',
  breadcrumb: 'Color Converter',
  title: 'Color Converter - HEX RGB HSL',
  lead: 'Convert between HEX, RGB, and HSL with live color preview.',
  whatIsTitle: 'What is Color Converter?',
  whatIsBody: 'Color Converter translates color values between common web formats.',
  howToTitle: 'How to use Color Converter',
  howToSteps: ['Select input format.', 'Enter a color value.', 'View converted HEX, RGB, and HSL.'],
})

export const diffCheckerConfig = cfg({
  path: '/tools/diff-checker',
  breadcrumb: 'Diff Checker',
  title: 'Diff Checker',
  lead: 'Compare two text blocks with highlighted additions and removals.',
  actionLabel: 'Compare',
  whatIsTitle: 'What is Diff Checker?',
  whatIsBody: 'Diff Checker shows line-by-line differences between two versions of text or code.',
  howToTitle: 'How to use Diff Checker',
  howToSteps: ['Paste original and updated text.', 'Compare to see additions and removals.', 'Copy the diff report.'],
})

export const markdownPreviewConfig = cfg({
  path: '/tools/markdown-preview',
  breadcrumb: 'Markdown Preview',
  title: 'Markdown Preview',
  lead: 'Live Markdown rendering with HTML export.',
  whatIsTitle: 'What is Markdown Preview?',
  whatIsBody: 'Markdown Preview renders Markdown to HTML in real time for writing and documentation.',
  howToTitle: 'How to use Markdown Preview',
  howToSteps: ['Write Markdown in the editor.', 'Preview rendered output live.', 'Copy or download HTML.'],
})

export const sqlFormatterConfig = cfg({
  path: '/tools/sql-formatter',
  breadcrumb: 'SQL Formatter',
  title: 'SQL Formatter',
  lead: 'Format and beautify SQL queries.',
  actionLabel: 'Format SQL',
  whatIsTitle: 'What is SQL Formatter?',
  whatIsBody: 'SQL Formatter adds line breaks and keyword casing to make SQL queries readable.',
  howToTitle: 'How to use SQL Formatter',
  howToSteps: ['Paste your SQL query.', 'Format to beautify.', 'Copy the formatted SQL.'],
})

export const yamlValidatorConfig = cfg({
  path: '/tools/yaml-validator',
  breadcrumb: 'YAML Validator',
  title: 'YAML Validator',
  lead: 'Validate YAML syntax and convert to JSON.',
  actionLabel: 'Validate YAML',
  whatIsTitle: 'What is YAML Validator?',
  whatIsBody: 'YAML Validator checks YAML syntax and converts valid YAML to JSON.',
  howToTitle: 'How to use YAML Validator',
  howToSteps: ['Paste YAML content.', 'Validate syntax.', 'Convert to JSON if needed.'],
})

export const apiTesterConfig = cfg({
  path: '/tools/api-tester',
  breadcrumb: 'API Tester',
  title: 'API Tester - HTTP Client',
  lead: 'Send GET, POST, PUT, PATCH, DELETE requests with headers and body.',
  actionLabel: 'Send Request',
  whatIsTitle: 'What is API Tester?',
  whatIsBody: 'API Tester sends HTTP requests from your browser and displays status, headers, and response body.',
  howToTitle: 'How to use API Tester',
  howToSteps: ['Enter URL and method.', 'Add headers and request body.', 'Send and inspect the response.'],
  faqs: [
    ...baseFaq,
    {
      question: 'Why do some APIs fail with CORS errors?',
      answer: 'Browsers block cross-origin requests unless the server allows your origin. This is a browser security feature, not a tool limitation.',
    },
  ],
})

export const jsonGeneratorConfig = cfg({
  path: '/tools/lorem-json',
  breadcrumb: 'JSON Generator',
  title: 'JSON Generator - Sample Data',
  lead: 'Generate nested sample JSON for testing and prototyping.',
  actionLabel: 'Generate JSON',
  whatIsTitle: 'What is JSON Generator?',
  whatIsBody: 'JSON Generator creates realistic nested JSON mock data for development and testing.',
  howToTitle: 'How to use JSON Generator',
  howToSteps: ['Configure depth and array size.', 'Generate sample JSON.', 'Copy or download the output.'],
})

export const timestampConverterConfig = cfg({
  path: '/tools/timestamp-converter',
  breadcrumb: 'Timestamp Converter',
  title: 'Timestamp Converter',
  lead: 'Convert Unix timestamps to dates and back with millisecond support.',
  actionLabel: 'Convert',
  whatIsTitle: 'What is Timestamp Converter?',
  whatIsBody: 'Timestamp Converter translates between Unix epoch timestamps and human-readable dates.',
  howToTitle: 'How to use Timestamp Converter',
  howToSteps: ['Choose timestamp-to-date or date-to-timestamp.', 'Enter a value.', 'View converted results.'],
})

export const htmlEntityConfig = cfg({
  path: '/tools/html-entity',
  breadcrumb: 'HTML Entity Encoder',
  title: 'HTML Entity Encoder',
  lead: 'Encode and decode HTML entities with Unicode support.',
  actionLabel: 'Convert',
  whatIsTitle: 'What is HTML Entity Encoder?',
  whatIsBody: 'HTML Entity Encoder converts special characters to HTML entities and back.',
  howToTitle: 'How to use HTML Entity Encoder',
  howToSteps: ['Enter text to encode or decode.', 'Choose mode.', 'Copy the result.'],
})

export const csvToJsonConfig = cfg({
  path: '/tools/csv-to-json',
  breadcrumb: 'CSV to JSON',
  title: 'CSV to JSON Converter',
  lead: 'Convert CSV data to JSON with upload or paste support.',
  actionLabel: 'Convert to JSON',
  whatIsTitle: 'What is CSV to JSON?',
  whatIsBody: 'CSV to JSON parses comma-separated data into a JSON array of objects.',
  howToTitle: 'How to use CSV to JSON',
  howToSteps: ['Paste or upload CSV.', 'Convert to JSON.', 'Copy or download the JSON file.'],
})

export const jsonToCsvConfig = cfg({
  path: '/tools/json-to-csv',
  breadcrumb: 'JSON to CSV',
  title: 'JSON to CSV Converter',
  lead: 'Convert JSON arrays to CSV format.',
  actionLabel: 'Convert to CSV',
  whatIsTitle: 'What is JSON to CSV?',
  whatIsBody: 'JSON to CSV flattens JSON arrays of objects into CSV spreadsheets.',
  howToTitle: 'How to use JSON to CSV',
  howToSteps: ['Paste or upload JSON.', 'Convert to CSV.', 'Copy or download the CSV file.'],
})
