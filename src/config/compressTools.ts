import { Archive, Code, FileCode, FileJson, Image, Music } from 'lucide-react'
import type { RelatedTool } from './tools'

export type CompressToolConfig = {
  path: string
  category: string
  breadcrumb: string
  title: string
  lead: string
  whatIsTitle: string
  whatIsBody: string
  howToTitle: string
  howToSteps: string[]
  faqs: { question: string; answer: string }[]
  popularTitle: string
  popularOptions: { label: string; href?: string }[]
  relatedTools: RelatedTool[]
}

const compressRelated: RelatedTool[] = [
  { name: 'Compress WebP', description: 'Optimize WebP images', icon: Image, href: '/tools/compress-webp' },
  { name: 'Minify HTML', description: 'Shrink HTML for faster pages', icon: Code, href: '/tools/compress-html' },
  { name: 'Minify CSS', description: 'Compress stylesheets', icon: FileCode, href: '/tools/compress-css' },
  { name: 'Minify JavaScript', description: 'Minify JS for production', icon: Code, href: '/tools/compress-js' },
  { name: 'Create ZIP Archive', description: 'Bundle files into ZIP', icon: Archive, href: '/tools/compress-zip' },
  { name: 'Compress Audio', description: 'Reduce audio file size', icon: Music, href: '/tools/compress-audio' },
]

const baseFaq = [
  {
    question: 'Is my data sent to a server?',
    answer: 'Text minifiers and ZIP/SVG/audio tools run in your browser. WebP and GIF compression is processed on the server and files are not stored.',
  },
  {
    question: 'How much size reduction can I expect?',
    answer: 'Results depend on your input. Minifiers remove whitespace and comments. Image and audio compression trade quality for smaller file size.',
  },
]

function cfg(
  partial: Omit<CompressToolConfig, 'category' | 'popularTitle' | 'faqs' | 'relatedTools' | 'popularOptions'> & {
    faqs?: CompressToolConfig['faqs']
    relatedTools?: RelatedTool[]
    popularOptions?: CompressToolConfig['popularOptions']
  },
): CompressToolConfig {
  return {
    category: 'Compressors',
    popularTitle: `Popular ${partial.breadcrumb} Options`,
    popularOptions: partial.popularOptions ?? [{ label: `${partial.breadcrumb} Online Free`, href: partial.path }],
    faqs: partial.faqs ?? baseFaq,
    relatedTools: partial.relatedTools ?? compressRelated,
    ...partial,
  }
}

export const compressWebpConfig = cfg({
  path: '/tools/compress-webp',
  breadcrumb: 'Compress WebP',
  title: 'Compress WebP',
  lead: 'Optimize WebP images to reduce file size while keeping visual quality.',
  whatIsTitle: 'What is Compress WebP?',
  whatIsBody: 'Compress WebP re-encodes WebP images with adjustable quality to produce smaller files for the web.',
  howToTitle: 'How to compress WebP',
  howToSteps: ['Upload a WebP image.', 'Adjust quality.', 'Compress and download the optimized file.'],
})

export const compressGifConfig = cfg({
  path: '/tools/compress-gif',
  breadcrumb: 'Compress GIF',
  title: 'Compress GIF',
  lead: 'Reduce GIF file size for faster loading in browsers and apps.',
  whatIsTitle: 'What is Compress GIF?',
  whatIsBody: 'Compress GIF optimizes animated or static GIF images using server-side image processing.',
  howToTitle: 'How to compress GIF',
  howToSteps: ['Upload a GIF file.', 'Click compress.', 'Download the smaller GIF.'],
})

export const compressSvgConfig = cfg({
  path: '/tools/compress-svg',
  breadcrumb: 'Compress SVG',
  title: 'Compress SVG',
  lead: 'Optimize SVG graphics by removing comments and unnecessary whitespace.',
  whatIsTitle: 'What is Compress SVG?',
  whatIsBody: 'Compress SVG minifies vector markup locally in your browser without uploading to a server.',
  howToTitle: 'How to compress SVG',
  howToSteps: ['Paste SVG code or upload an .svg file.', 'Optimize instantly.', 'Copy or download the minified SVG.'],
})

export const compressAudioConfig = cfg({
  path: '/tools/compress-audio',
  breadcrumb: 'Compress Audio',
  title: 'Compress Audio',
  lead: 'Reduce audio file size by re-encoding to a lower bitrate MP3.',
  whatIsTitle: 'What is Compress Audio?',
  whatIsBody: 'Compress Audio uses FFmpeg in your browser to re-encode audio files to smaller MP3 output.',
  howToTitle: 'How to compress audio',
  howToSteps: ['Upload an audio file.', 'Choose output quality.', 'Compress and download the MP3.'],
})

export const compressZipConfig = cfg({
  path: '/tools/compress-zip',
  breadcrumb: 'Create ZIP Archive',
  title: 'Create ZIP Archive',
  lead: 'Bundle multiple files into a single ZIP archive in your browser.',
  whatIsTitle: 'What is Create ZIP Archive?',
  whatIsBody: 'Create ZIP Archive packs selected files into a compressed .zip download without server uploads.',
  howToTitle: 'How to create a ZIP',
  howToSteps: ['Select one or more files.', 'Click create archive.', 'Download the ZIP file.'],
})

export const compressHtmlConfig = cfg({
  path: '/tools/compress-html',
  breadcrumb: 'Minify HTML',
  title: 'Minify HTML',
  lead: 'Remove whitespace and line breaks from HTML for faster page loads.',
  whatIsTitle: 'What is Minify HTML?',
  whatIsBody: 'Minify HTML strips unnecessary whitespace between tags to reduce HTML payload size.',
  howToTitle: 'How to minify HTML',
  howToSteps: ['Paste your HTML.', 'View the minified output instantly.', 'Copy or download the result.'],
})

export const compressCssConfig = cfg({
  path: '/tools/compress-css',
  breadcrumb: 'Minify CSS',
  title: 'Minify CSS',
  lead: 'Minify CSS stylesheets by removing comments and whitespace.',
  whatIsTitle: 'What is Minify CSS?',
  whatIsBody: 'Minify CSS compresses stylesheets for production deployment.',
  howToTitle: 'How to minify CSS',
  howToSteps: ['Paste CSS code.', 'See minified output.', 'Copy or download.'],
})

export const compressJsConfig = cfg({
  path: '/tools/compress-js',
  breadcrumb: 'Minify JavaScript',
  title: 'Minify JavaScript',
  lead: 'Minify JavaScript for production by removing comments and whitespace.',
  whatIsTitle: 'What is Minify JavaScript?',
  whatIsBody: 'Minify JavaScript reduces script size for faster downloads. Uses safe whitespace and comment removal.',
  howToTitle: 'How to minify JavaScript',
  howToSteps: ['Paste JavaScript code.', 'View minified output.', 'Copy or download.'],
})

export const compressJsonConfig = cfg({
  path: '/tools/compress-json',
  breadcrumb: 'Minify JSON',
  title: 'Minify JSON',
  lead: 'Remove whitespace from JSON while validating structure.',
  whatIsTitle: 'What is Minify JSON?',
  whatIsBody: 'Minify JSON parses and re-serializes JSON without formatting to reduce payload size.',
  howToTitle: 'How to minify JSON',
  howToSteps: ['Paste JSON.', 'Get validated minified output.', 'Copy or download.'],
  relatedTools: [
    { name: 'JSON Formatter', description: 'Format and validate JSON', icon: FileJson, href: '/tools/json-formatter' },
    ...compressRelated.filter((t) => t.href !== '/tools/compress-json'),
  ],
})

export const compressXmlConfig = cfg({
  path: '/tools/compress-xml',
  breadcrumb: 'Minify XML',
  title: 'Minify XML',
  lead: 'Minify XML documents by removing comments and extra whitespace.',
  whatIsTitle: 'What is Minify XML?',
  whatIsBody: 'Minify XML compresses XML markup for APIs, configs, and feeds.',
  howToTitle: 'How to minify XML',
  howToSteps: ['Paste XML.', 'View minified output.', 'Copy or download.'],
})
