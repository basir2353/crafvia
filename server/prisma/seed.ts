import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type CategorySeed = {
  slug: string
  name: string
  iconName: string
  iconBg: string
  iconColor: string
  sortOrder: number
  tools: Array<{
    slug: string
    name: string
    description: string
    href?: string
    keywords: string
    isPopular?: boolean
    requiresPro?: boolean
    compressionMode?: string
    accept?: string
  }>
}

const categories: CategorySeed[] = [
  {
    slug: 'image-tools',
    name: 'Image Tools',
    iconName: 'Image',
    iconBg: '#eff6ff',
    iconColor: '#2563eb',
    sortOrder: 1,
    tools: [
      { slug: 'compress-image', name: 'Compress Image', description: 'Reduce image file size without losing quality', href: '/tools/compress-image', keywords: 'compress image jpg png webp optimize', isPopular: true, compressionMode: 'image', accept: 'image/*' },
      { slug: 'compress-jpg', name: 'Compress JPG', description: 'Optimize JPG images for the web', href: '/tools/compress-jpg', keywords: 'compress jpg jpeg photo optimize', isPopular: true, compressionMode: 'jpg', accept: 'image/jpeg' },
      { slug: 'compress-png', name: 'Compress PNG', description: 'Reduce PNG file size losslessly', href: '/tools/compress-png', keywords: 'compress png optimize' },
      { slug: 'heic-to-jpg', name: 'HEIC to JPG', description: 'Convert iPhone photos to universal JPG format', href: '/tools/heic-to-jpg', keywords: 'heic jpg convert iphone', isPopular: true, compressionMode: 'heic', accept: '.heic,.HEIC,image/heic,image/heif' },
      { slug: 'remove-background', name: 'Remove Background', description: 'Remove image backgrounds with one click', href: '/tools/remove-background', keywords: 'remove background transparent', isPopular: true, compressionMode: 'background', accept: 'image/*,.heic,.HEIC,.heif,.HEIF' },
      { slug: 'image-converter', name: 'Image Converter', description: 'Convert between image formats', href: '/tools/image-converter', keywords: 'convert image jpg png webp' },
      { slug: 'image-resizer', name: 'Image Resizer', description: 'Resize images to exact dimensions', href: '/tools/image-resizer', keywords: 'resize image dimensions scale', isPopular: true, compressionMode: 'resize', accept: 'image/*,.heic,.HEIC,.heif,.HEIF' },
      { slug: 'crop-image', name: 'Crop Image', description: 'Crop images to any aspect ratio', href: '/tools/crop-image', keywords: 'crop image trim' },
      { slug: 'rotate-image', name: 'Rotate Image', description: 'Rotate and flip images', href: '/tools/rotate-image', keywords: 'rotate flip image' },
      { slug: 'webp-to-jpg', name: 'WebP to JPG', description: 'Convert WebP images to JPG', href: '/tools/webp-to-jpg', keywords: 'webp jpg convert' },
      { slug: 'png-to-jpg', name: 'PNG to JPG', description: 'Convert PNG images to JPG', href: '/tools/png-to-jpg', keywords: 'png jpg convert' },
      { slug: 'jpg-to-png', name: 'JPG to PNG', description: 'Convert JPG images to PNG', href: '/tools/jpg-to-png', keywords: 'jpg png convert' },
      { slug: 'image-to-pdf', name: 'Image to PDF', description: 'Convert images into a PDF document', href: '/tools/image-to-pdf', keywords: 'image pdf convert' },
      { slug: 'watermark-image', name: 'Watermark Image', description: 'Add text or logo watermarks', href: '/tools/watermark-image', keywords: 'watermark image logo' },
      { slug: 'photo-effects', name: 'Photo Effects', description: 'Apply cartoon, sketch, and artistic effects', href: '/tools/photo-effects', keywords: 'photo effects filter cartoon' },
      { slug: 'favicon-generator', name: 'Favicon Generator', description: 'Generate favicons in all sizes from one image', href: '/tools/favicon-generator', keywords: 'favicon icon generator' },
      { slug: 'blur-image', name: 'Blur Image', description: 'Apply blur effects to images', href: '/tools/blur-image', keywords: 'blur image effect' },
      { slug: 'sharpen-image', name: 'Sharpen Image', description: 'Sharpen blurry photos', href: '/tools/sharpen-image', keywords: 'sharpen image clarity' },
    ],
  },
  {
    slug: 'pdf-tools',
    name: 'PDF Tools',
    iconName: 'FileType',
    iconBg: '#fef2f2',
    iconColor: '#dc2626',
    sortOrder: 2,
    tools: [
      { slug: 'compress-pdf', name: 'Compress PDF', description: 'Shrink PDF files while keeping readability', href: '/tools/compress-pdf', keywords: 'compress pdf reduce size', isPopular: true, compressionMode: 'pdf', accept: 'application/pdf' },
      { slug: 'merge-pdf', name: 'Merge PDF', description: 'Combine multiple PDFs into a single file', href: '/tools/merge-pdf', keywords: 'merge pdf combine join', isPopular: true, compressionMode: 'pdf', accept: 'application/pdf' },
      { slug: 'split-pdf', name: 'Split PDF', description: 'Split PDFs by page range or extract pages', href: '/tools/split-pdf', keywords: 'split pdf pages extract', compressionMode: 'pdf', accept: 'application/pdf' },
      { slug: 'pdf-to-image', name: 'PDF to Image', description: 'Convert PDF pages to images', href: '/tools/pdf-to-image', keywords: 'pdf image convert jpg png', compressionMode: 'pdf', accept: 'application/pdf' },
      { slug: 'rotate-pdf', name: 'Rotate PDF', description: 'Rotate PDF pages any direction', href: '/tools/rotate-pdf', keywords: 'rotate pdf pages', compressionMode: 'pdf', accept: 'application/pdf' },
      { slug: 'protect-pdf', name: 'Protect PDF', description: 'Add password protection to any PDF', href: '/tools/protect-pdf', keywords: 'protect pdf password lock', compressionMode: 'pdf', accept: 'application/pdf' },
      { slug: 'unlock-pdf', name: 'Unlock PDF', description: 'Remove password from PDF files', href: '/tools/unlock-pdf', keywords: 'unlock pdf password remove', compressionMode: 'pdf', accept: 'application/pdf' },
      { slug: 'html-to-pdf', name: 'HTML to PDF', description: 'Convert HTML into PDF documents', href: '/tools/html-to-pdf', keywords: 'html pdf convert' },
      { slug: 'pdf-to-word', name: 'PDF to Word', description: 'Convert PDF to editable Word documents', href: '/tools/pdf-to-word', keywords: 'pdf word docx convert', requiresPro: true, compressionMode: 'pdf', accept: 'application/pdf' },
      { slug: 'word-to-pdf', name: 'Word to PDF', description: 'Convert Word documents to PDF', href: '/tools/word-to-pdf', keywords: 'word pdf docx convert', accept: '.doc,.docx' },
      { slug: 'extract-pdf-text', name: 'Extract PDF Text', description: 'Extract text content from PDF files', href: '/tools/extract-pdf-text', keywords: 'extract pdf text ocr', compressionMode: 'pdf', accept: 'application/pdf' },
      { slug: 'reorder-pdf', name: 'Reorder PDF Pages', description: 'Drag and drop to reorder PDF pages', href: '/tools/reorder-pdf', keywords: 'reorder pdf pages sort', compressionMode: 'pdf', accept: 'application/pdf' },
      { slug: 'delete-pdf-pages', name: 'Delete PDF Pages', description: 'Remove unwanted pages from PDFs', href: '/tools/delete-pdf-pages', keywords: 'delete pdf pages remove', compressionMode: 'pdf', accept: 'application/pdf' },
      { slug: 'pdf-metadata', name: 'Edit PDF Metadata', description: 'View and edit PDF document properties', href: '/tools/pdf-metadata', keywords: 'pdf metadata properties', compressionMode: 'pdf', accept: 'application/pdf' },
    ],
  },
  {
    slug: 'video-tools',
    name: 'Video Tools',
    iconName: 'Video',
    iconBg: '#f5f3ff',
    iconColor: '#7c3aed',
    sortOrder: 3,
    tools: [
      { slug: 'trim-video', name: 'Trim Video', description: 'Cut video to exact start and end points', href: '/tools/trim-video', keywords: 'trim video cut clip', accept: 'video/*,.mp4,.mov,.avi,.mkv,.webm,.m4v,.flv,.mpeg,.mpg,.3gp,.wmv' },
      { slug: 'convert-mp4', name: 'Convert MP4', description: 'Convert videos to MP4 format', href: '/tools/convert-mp4', keywords: 'convert mp4 video', accept: 'video/*,.mp4,.mov,.avi,.mkv,.webm,.m4v,.flv,.mpeg,.mpg,.3gp,.wmv' },
      { slug: 'compress-video', name: 'Compress Video', description: 'Reduce video file size', href: '/tools/compress-video', keywords: 'compress video reduce size', accept: 'video/*,.mp4,.mov,.avi,.mkv,.webm,.m4v,.flv,.mpeg,.mpg,.3gp,.wmv' },
      { slug: 'video-to-mp3', name: 'Video to MP3', description: 'Extract audio from any video file', href: '/tools/video-to-mp3', keywords: 'video mp3 audio extract', isPopular: true, accept: 'video/*,.mp4,.mov,.avi,.mkv,.webm,.m4v,.flv,.mpeg,.mpg,.3gp,.wmv' },
      { slug: 'video-to-gif', name: 'Video to GIF', description: 'Convert video clips to animated GIFs', href: '/tools/video-to-gif', keywords: 'video gif convert', accept: 'video/*,.mp4,.mov,.avi,.mkv,.webm,.m4v,.flv,.mpeg,.mpg,.3gp,.wmv' },
      { slug: 'merge-videos', name: 'Merge Videos', description: 'Combine multiple videos into one', href: '/tools/merge-videos', keywords: 'merge video combine', accept: 'video/*,.mp4,.mov,.avi,.mkv,.webm,.m4v,.flv,.mpeg,.mpg,.3gp,.wmv' },
      { slug: 'resize-video', name: 'Resize Video', description: 'Change video resolution and dimensions', href: '/tools/resize-video', keywords: 'resize video resolution', accept: 'video/*,.mp4,.mov,.avi,.mkv,.webm,.m4v,.flv,.mpeg,.mpg,.3gp,.wmv' },
      { slug: 'rotate-video', name: 'Rotate Video', description: 'Rotate video orientation', href: '/tools/rotate-video', keywords: 'rotate video flip', accept: 'video/*,.mp4,.mov,.avi,.mkv,.webm,.m4v,.flv,.mpeg,.mpg,.3gp,.wmv' },
      { slug: 'mute-video', name: 'Mute Video', description: 'Remove audio track from videos', href: '/tools/mute-video', keywords: 'mute video remove audio', accept: 'video/*,.mp4,.mov,.avi,.mkv,.webm,.m4v,.flv,.mpeg,.mpg,.3gp,.wmv' },
      { slug: 'add-subtitles', name: 'Add Subtitles', description: 'Add subtitle tracks to videos', href: '/tools/add-subtitles', keywords: 'subtitles video captions', requiresPro: true, accept: 'video/*,.mp4,.mov,.avi,.mkv,.webm,.m4v,.flv,.mpeg,.mpg,.3gp,.wmv' },
      { slug: 'screen-recorder', name: 'Screen Recorder', description: 'Record your screen in the browser', href: '/tools/screen-recorder', keywords: 'screen record capture' },
      { slug: 'webcam-recorder', name: 'Webcam Recorder', description: 'Record video from your webcam', href: '/tools/webcam-recorder', keywords: 'webcam record video' },
    ],
  },
  {
    slug: 'audio-tools',
    name: 'Audio Tools',
    iconName: 'Mic',
    iconBg: '#ecfdf5',
    iconColor: '#059669',
    sortOrder: 4,
    tools: [
      { slug: 'trim-audio', name: 'Trim Audio', description: 'Cut audio to exact duration', href: '/tools/trim-audio', keywords: 'trim audio cut', accept: 'audio/*,.mp3,.wav,.aac,.m4a,.ogg,.flac,.wma,.aiff,.opus' },
      { slug: 'convert-mp3', name: 'Convert MP3', description: 'Convert audio to MP3 format', href: '/tools/convert-mp3', keywords: 'convert mp3 audio', accept: 'audio/*,.mp3,.wav,.aac,.m4a,.ogg,.flac,.wma,.aiff,.opus' },
      { slug: 'normalize-audio', name: 'Normalize Audio', description: 'Balance audio volume levels', href: '/tools/normalize-audio', keywords: 'normalize audio volume', accept: 'audio/*,.mp3,.wav,.aac,.m4a,.ogg,.flac,.wma,.aiff,.opus' },
      { slug: 'text-to-speech', name: 'Text to Speech', description: 'Convert written text into natural speech', href: '/tools/text-to-speech', keywords: 'text speech tts voice', isPopular: true },
      { slug: 'speech-to-text', name: 'Speech to Text', description: 'Transcribe audio to text', href: '/tools/speech-to-text', keywords: 'speech text transcribe stt', requiresPro: true, accept: 'audio/*,.mp3,.wav,.aac,.m4a,.ogg,.flac,.wma,.aiff,.opus' },
      { slug: 'merge-audio', name: 'Merge Audio', description: 'Combine multiple audio files', href: '/tools/merge-audio', keywords: 'merge audio combine', accept: 'audio/*,.mp3,.wav,.aac,.m4a,.ogg,.flac,.wma,.aiff,.opus' },
      { slug: 'change-speed', name: 'Change Audio Speed', description: 'Speed up or slow down audio', href: '/tools/change-speed', keywords: 'audio speed tempo', accept: 'audio/*,.mp3,.wav,.aac,.m4a,.ogg,.flac,.wma,.aiff,.opus' },
      { slug: 'remove-noise', name: 'Remove Background Noise', description: 'Clean up noisy audio recordings', href: '/tools/remove-noise', keywords: 'noise removal audio clean', requiresPro: true, accept: 'audio/*,.mp3,.wav,.aac,.m4a,.ogg,.flac,.wma,.aiff,.opus' },
      { slug: 'fade-audio', name: 'Fade In/Out', description: 'Add fade effects to audio', href: '/tools/fade-audio', keywords: 'fade audio in out', accept: 'audio/*,.mp3,.wav,.aac,.m4a,.ogg,.flac,.wma,.aiff,.opus' },
      { slug: 'reverse-audio', name: 'Reverse Audio', description: 'Play audio backwards', href: '/tools/reverse-audio', keywords: 'reverse audio backwards', accept: 'audio/*,.mp3,.wav,.aac,.m4a,.ogg,.flac,.wma,.aiff,.opus' },
    ],
  },
  {
    slug: 'ai-writing',
    name: 'AI Writing',
    iconName: 'PenLine',
    iconBg: '#fdf4ff',
    iconColor: '#c026d3',
    sortOrder: 5,
    tools: [
      { slug: 'ai-writer', name: 'AI Writer', description: 'Generate and improve text with AI assistance', href: '/tools/ai-writer', keywords: 'ai writer generate text', isPopular: true, requiresPro: false },
      { slug: 'paraphrase', name: 'Paraphrase', description: 'Rewrite text in different words', href: '/tools/paraphrase', keywords: 'paraphrase rewrite text' },
      { slug: 'summarize', name: 'Summarize', description: 'Summarize long text into key points', href: '/tools/summarize', keywords: 'summarize text summary' },
      { slug: 'grammar-check', name: 'Grammar Check', description: 'Fix grammar and spelling errors', href: '/tools/grammar-check', keywords: 'grammar check spelling' },
      { slug: 'tone-changer', name: 'Tone Changer', description: 'Adjust writing tone and style', href: '/tools/tone-changer', keywords: 'tone changer writing style' },
      { slug: 'headline-generator', name: 'Headline Generator', description: 'Create catchy headlines and titles', href: '/tools/headline-generator', keywords: 'headline title generator' },
      { slug: 'blog-outline', name: 'Blog Outline', description: 'Generate blog post outlines', href: '/tools/blog-outline', keywords: 'blog outline writing' },
      { slug: 'email-writer', name: 'Email Writer', description: 'Draft professional emails quickly', href: '/tools/email-writer', keywords: 'email writer draft' },
      { slug: 'product-description', name: 'Product Description', description: 'Write compelling product descriptions', href: '/tools/product-description', keywords: 'product description ecommerce' },
      { slug: 'social-caption', name: 'Social Caption', description: 'Create social media captions', href: '/tools/social-caption', keywords: 'social caption instagram' },
      { slug: 'resume-builder', name: 'Resume Builder', description: 'Build professional resumes', href: '/tools/resume-builder', keywords: 'resume cv builder' },
      { slug: 'cover-letter', name: 'Cover Letter', description: 'Generate tailored cover letters', href: '/tools/cover-letter', keywords: 'cover letter job' },
      { slug: 'translate-text', name: 'Translate Text', description: 'Translate text between languages', href: '/tools/translate-text', keywords: 'translate language text' },
      { slug: 'keyword-extractor', name: 'Keyword Extractor', description: 'Extract keywords from text', href: '/tools/keyword-extractor', keywords: 'keyword extract seo' },
      { slug: 'readability-score', name: 'Readability Score', description: 'Analyze text readability', href: '/tools/readability-score', keywords: 'readability score text' },
      { slug: 'plagiarism-check', name: 'Plagiarism Check', description: 'Check text for duplicate content', href: '/tools/plagiarism-check', keywords: 'plagiarism check duplicate', requiresPro: true },
    ],
  },
  {
    slug: 'seo-tools',
    name: 'SEO Tools',
    iconName: 'Search',
    iconBg: '#fff7ed',
    iconColor: '#ea580c',
    sortOrder: 6,
    tools: [
      { slug: 'meta-tag-generator', name: 'Meta Tag Generator', description: 'Generate SEO meta tags for pages', href: '/tools/meta-tag-generator', keywords: 'meta tag seo generator', isPopular: true },
      { slug: 'sitemap-generator', name: 'Sitemap Generator', description: 'Create XML sitemaps for websites', href: '/tools/sitemap-generator', keywords: 'sitemap xml generator' },
      { slug: 'robots-txt', name: 'Robots.txt Generator', description: 'Generate robots.txt files', href: '/tools/robots-txt', keywords: 'robots txt seo' },
      { slug: 'open-graph-preview', name: 'Open Graph Preview', description: 'Preview social sharing cards', href: '/tools/open-graph-preview', keywords: 'open graph og preview' },
      { slug: 'schema-markup', name: 'Schema Markup', description: 'Generate JSON-LD structured data', href: '/tools/schema-markup', keywords: 'schema markup json-ld' },
      { slug: 'keyword-density', name: 'Keyword Density', description: 'Analyze keyword density in text', href: '/tools/keyword-density', keywords: 'keyword density seo' },
      { slug: 'slug-generator', name: 'URL Slug Generator', description: 'Create SEO-friendly URL slugs', href: '/tools/slug-generator', keywords: 'slug url seo' },
      { slug: 'heading-analyzer', name: 'Heading Analyzer', description: 'Analyze H1-H6 heading structure', href: '/tools/heading-analyzer', keywords: 'heading analyzer h1 seo' },
      { slug: 'canonical-checker', name: 'Canonical Checker', description: 'Validate canonical URLs', href: '/tools/canonical-checker', keywords: 'canonical url seo' },
      { slug: 'page-speed-tips', name: 'Page Speed Tips', description: 'Get performance optimization tips', href: '/tools/page-speed-tips', keywords: 'page speed performance' },
      { slug: 'backlink-checker', name: 'Backlink Checker', description: 'Analyze backlink profiles', href: '/tools/backlink-checker', keywords: 'backlink checker seo', requiresPro: true },
    ],
  },
  {
    slug: 'developer-tools',
    name: 'Developer Tools',
    iconName: 'Code2',
    iconBg: '#f0f9ff',
    iconColor: '#0284c7',
    sortOrder: 7,
    tools: [
      { slug: 'json-formatter', name: 'JSON Formatter', description: 'Beautify and validate JSON data', href: '/tools/json-formatter', keywords: 'json format validate beautify', isPopular: true },
      { slug: 'base64-encode', name: 'Base64 Encode', description: 'Encode text and files to Base64', href: '/tools/base64-encode', keywords: 'base64 encode decode' },
      { slug: 'regex-tester', name: 'Regex Tester', description: 'Test regular expressions live', href: '/tools/regex-tester', keywords: 'regex test pattern' },
      { slug: 'uuid-generator', name: 'UUID Generator', description: 'Generate random UUIDs', href: '/tools/uuid-generator', keywords: 'uuid generate guid' },
      { slug: 'hash-generator', name: 'Hash Generator', description: 'Generate MD5, SHA hashes', href: '/tools/hash-generator', keywords: 'hash md5 sha generate' },
      { slug: 'url-encoder', name: 'URL Encoder', description: 'Encode and decode URLs', href: '/tools/url-encoder', keywords: 'url encode decode' },
      { slug: 'html-formatter', name: 'HTML Formatter', description: 'Format and minify HTML', href: '/tools/html-formatter', keywords: 'html format minify' },
      { slug: 'css-formatter', name: 'CSS Formatter', description: 'Format and minify CSS', href: '/tools/css-formatter', keywords: 'css format minify' },
      { slug: 'js-formatter', name: 'JS Formatter', description: 'Format and minify JavaScript', href: '/tools/js-formatter', keywords: 'javascript format minify' },
      { slug: 'jwt-decoder', name: 'JWT Decoder', description: 'Decode JSON Web Tokens', href: '/tools/jwt-decoder', keywords: 'jwt decode token' },
      { slug: 'cron-generator', name: 'Cron Generator', description: 'Build cron expressions visually', href: '/tools/cron-generator', keywords: 'cron schedule generator' },
      { slug: 'color-converter', name: 'Color Converter', description: 'Convert HEX, RGB, HSL colors', href: '/tools/color-converter', keywords: 'color convert hex rgb' },
      { slug: 'diff-checker', name: 'Diff Checker', description: 'Compare two text blocks', href: '/tools/diff-checker', keywords: 'diff compare text' },
      { slug: 'markdown-preview', name: 'Markdown Preview', description: 'Preview rendered Markdown', href: '/tools/markdown-preview', keywords: 'markdown preview render' },
      { slug: 'sql-formatter', name: 'SQL Formatter', description: 'Format SQL queries', href: '/tools/sql-formatter', keywords: 'sql format beautify' },
      { slug: 'yaml-validator', name: 'YAML Validator', description: 'Validate YAML syntax', href: '/tools/yaml-validator', keywords: 'yaml validate parse' },
      { slug: 'api-tester', name: 'API Tester', description: 'Send HTTP requests and inspect responses', href: '/tools/api-tester', keywords: 'api test http rest' },
      { slug: 'lorem-json', name: 'JSON Generator', description: 'Generate sample JSON data', href: '/tools/lorem-json', keywords: 'json generate mock data' },
      { slug: 'timestamp-converter', name: 'Timestamp Converter', description: 'Convert Unix timestamps to dates', href: '/tools/timestamp-converter', keywords: 'timestamp unix convert' },
      { slug: 'html-entity', name: 'HTML Entity Encoder', description: 'Encode/decode HTML entities', href: '/tools/html-entity', keywords: 'html entity encode' },
      { slug: 'csv-to-json', name: 'CSV to JSON', description: 'Convert CSV data to JSON', href: '/tools/csv-to-json', keywords: 'csv json convert' },
      { slug: 'json-to-csv', name: 'JSON to CSV', description: 'Convert JSON data to CSV', href: '/tools/json-to-csv', keywords: 'json csv convert' },
    ],
  },
  {
    slug: 'text-tools',
    name: 'Text Tools',
    iconName: 'Type',
    iconBg: '#f8fafc',
    iconColor: '#475569',
    sortOrder: 8,
    tools: [
      { slug: 'word-counter', name: 'Word Counter', description: 'Count words, characters, and sentences', href: '/tools/word-counter', keywords: 'word counter count text' },
      { slug: 'case-converter', name: 'Case Converter', description: 'Convert text between cases', href: '/tools/case-converter', keywords: 'case converter upper lower' },
      { slug: 'lorem-ipsum', name: 'Lorem Ipsum', description: 'Generate placeholder text', href: '/tools/lorem-ipsum', keywords: 'lorem ipsum placeholder' },
      { slug: 'remove-duplicates', name: 'Remove Duplicates', description: 'Remove duplicate lines from text', href: '/tools/remove-duplicates', keywords: 'duplicate lines remove' },
      { slug: 'sort-lines', name: 'Sort Lines', description: 'Sort lines alphabetically', href: '/tools/sort-lines', keywords: 'sort lines text alpha' },
      { slug: 'reverse-text', name: 'Reverse Text', description: 'Reverse text character by character', href: '/tools/reverse-text', keywords: 'reverse text backwards' },
      { slug: 'find-replace', name: 'Find and Replace', description: 'Find and replace text patterns', href: '/tools/find-replace', keywords: 'find replace text' },
      { slug: 'add-line-numbers', name: 'Add Line Numbers', description: 'Number each line of text', href: '/tools/add-line-numbers', keywords: 'line numbers text' },
      { slug: 'remove-spaces', name: 'Remove Extra Spaces', description: 'Clean up whitespace in text', href: '/tools/remove-spaces', keywords: 'spaces whitespace remove' },
      { slug: 'text-diff', name: 'Text Diff', description: 'Compare two text versions', href: '/tools/text-diff', keywords: 'text diff compare' },
      { slug: 'emoji-picker', name: 'Emoji Picker', description: 'Browse and copy emojis', href: '/tools/emoji-picker', keywords: 'emoji picker copy' },
      { slug: 'fancy-text', name: 'Fancy Text', description: 'Generate stylized Unicode text', href: '/tools/fancy-text', keywords: 'fancy text unicode style' },
      { slug: 'morse-code', name: 'Morse Code', description: 'Convert text to Morse code', href: '/tools/morse-code', keywords: 'morse code convert' },
      { slug: 'binary-converter', name: 'Binary Converter', description: 'Convert text to binary and back', href: '/tools/binary-converter', keywords: 'binary text convert' },
      { slug: 'reading-time', name: 'Reading Time', description: 'Estimate reading time for text', href: '/tools/reading-time', keywords: 'reading time estimate' },
    ],
  },
  {
    slug: 'calculators',
    name: 'Calculators',
    iconName: 'Calculator',
    iconBg: '#fefce8',
    iconColor: '#ca8a04',
    sortOrder: 9,
    tools: [
      { slug: 'percentage-calculator', name: 'Percentage Calculator', description: 'Calculate percentages easily', href: '/tools/percentage-calculator', keywords: 'percentage calculator math', isPopular: true },
      { slug: 'bmi-calculator', name: 'BMI Calculator', description: 'Calculate body mass index', href: '/tools/bmi-calculator', keywords: 'bmi calculator health' },
      { slug: 'loan-calculator', name: 'Loan Calculator', description: 'Calculate loan payments and interest', href: '/tools/loan-calculator', keywords: 'loan calculator mortgage' },
      { slug: 'tip-calculator', name: 'Tip Calculator', description: 'Calculate tips and split bills', href: '/tools/tip-calculator', keywords: 'tip calculator split bill' },
      { slug: 'age-calculator', name: 'Age Calculator', description: 'Calculate exact age from birthdate', href: '/tools/age-calculator', keywords: 'age calculator birthday' },
      { slug: 'gpa-calculator', name: 'GPA Calculator', description: 'Calculate grade point average', href: '/tools/gpa-calculator', keywords: 'gpa calculator grades' },
      { slug: 'discount-calculator', name: 'Discount Calculator', description: 'Calculate sale prices and savings', href: '/tools/discount-calculator', keywords: 'discount calculator sale' },
      { slug: 'compound-interest', name: 'Compound Interest', description: 'Calculate compound interest growth', href: '/tools/compound-interest', keywords: 'compound interest investment' },
      { slug: 'unit-converter', name: 'Unit Converter', description: 'Convert between measurement units', href: '/tools/unit-converter', keywords: 'unit converter measurement' },
    ],
  },
  {
    slug: 'ai-generation',
    name: 'AI Generation',
    iconName: 'Sparkles',
    iconBg: '#eef2ff',
    iconColor: '#4f46e5',
    sortOrder: 10,
    tools: [
      { slug: 'image-generator', name: 'Image Generator', description: 'Generate images from text prompts', href: '/tools/image-generator', keywords: 'image generator ai art', requiresPro: true },
      { slug: 'qr-code-generator', name: 'QR Code Generator', description: 'Create custom QR codes for any URL', href: '/tools/qr-code-generator', keywords: 'qr code generator', isPopular: true },
      { slug: 'password-generator', name: 'Password Generator', description: 'Generate strong secure passwords', href: '/tools/password-generator', keywords: 'password generator secure', isPopular: true },
      { slug: 'barcode-generator', name: 'Barcode Generator', description: 'Create barcodes for products', href: '/tools/barcode-generator', keywords: 'barcode generator' },
      { slug: 'color-palette', name: 'Color Palette Generator', description: 'Generate harmonious color palettes', href: '/tools/color-palette', keywords: 'color palette generator design' },
      { slug: 'logo-maker', name: 'Logo Maker', description: 'Create simple logos quickly', href: '/tools/logo-maker', keywords: 'logo maker design', requiresPro: true },
      { slug: 'meme-generator', name: 'Meme Generator', description: 'Create memes with custom text', href: '/tools/meme-generator', keywords: 'meme generator funny' },
      { slug: 'name-generator', name: 'Name Generator', description: 'Generate random names for projects', href: '/tools/name-generator', keywords: 'name generator random' },
    ],
  },
  {
    slug: 'converters',
    name: 'Converters',
    iconName: 'ArrowRight',
    iconBg: '#f0fdf4',
    iconColor: '#16a34a',
    sortOrder: 11,
    tools: [
      { slug: 'length-converter', name: 'Length Converter', description: 'Convert length units', href: '/tools/length-converter', keywords: 'length convert meter feet', isPopular: true },
      { slug: 'weight-converter', name: 'Weight Converter', description: 'Convert weight units', href: '/tools/weight-converter', keywords: 'weight convert kg lb' },
      { slug: 'temperature-converter', name: 'Temperature Converter', description: 'Convert Celsius, Fahrenheit, Kelvin', href: '/tools/temperature-converter', keywords: 'temperature convert celsius' },
      { slug: 'speed-converter', name: 'Speed Converter', description: 'Convert speed units', href: '/tools/speed-converter', keywords: 'speed convert mph kmh' },
      { slug: 'area-converter', name: 'Area Converter', description: 'Convert area units', href: '/tools/area-converter', keywords: 'area convert square' },
      { slug: 'volume-converter', name: 'Volume Converter', description: 'Convert volume units', href: '/tools/volume-converter', keywords: 'volume convert liter gallon' },
      { slug: 'time-converter', name: 'Time Converter', description: 'Convert time zones and durations', href: '/tools/time-converter', keywords: 'time zone convert' },
      { slug: 'data-converter', name: 'Data Size Converter', description: 'Convert KB, MB, GB, TB', href: '/tools/data-converter', keywords: 'data size convert bytes' },
      { slug: 'angle-converter', name: 'Angle Converter', description: 'Convert degrees and radians', href: '/tools/angle-converter', keywords: 'angle convert degree radian' },
      { slug: 'pressure-converter', name: 'Pressure Converter', description: 'Convert pressure units', href: '/tools/pressure-converter', keywords: 'pressure convert psi bar' },
      { slug: 'energy-converter', name: 'Energy Converter', description: 'Convert energy units', href: '/tools/energy-converter', keywords: 'energy convert joule calorie' },
      { slug: 'currency-converter', name: 'Currency Converter', description: 'Convert between world currencies', href: '/tools/currency-converter', keywords: 'currency convert exchange rate', isPopular: true },
    ],
  },
  {
    slug: 'compressors',
    name: 'Compressors',
    iconName: 'Shrink',
    iconBg: '#fff1f2',
    iconColor: '#e11d48',
    sortOrder: 12,
    tools: [
      { slug: 'compress-webp', name: 'Compress WebP', description: 'Optimize WebP images', href: '/tools/compress-webp', keywords: 'compress webp optimize' },
      { slug: 'compress-gif', name: 'Compress GIF', description: 'Reduce GIF file size', href: '/tools/compress-gif', keywords: 'compress gif optimize' },
      { slug: 'compress-svg', name: 'Compress SVG', description: 'Optimize SVG graphics', href: '/tools/compress-svg', keywords: 'compress svg optimize' },
      { slug: 'compress-audio', name: 'Compress Audio', description: 'Reduce audio file size', href: '/tools/compress-audio', keywords: 'compress audio mp3' },
      { slug: 'compress-zip', name: 'Create ZIP Archive', description: 'Compress files into ZIP archives', href: '/tools/compress-zip', keywords: 'zip compress archive' },
      { slug: 'compress-html', name: 'Minify HTML', description: 'Minify HTML for faster loading', href: '/tools/compress-html', keywords: 'minify html compress' },
      { slug: 'compress-css', name: 'Minify CSS', description: 'Minify CSS stylesheets', href: '/tools/compress-css', keywords: 'minify css compress' },
      { slug: 'compress-js', name: 'Minify JavaScript', description: 'Minify JS for production', href: '/tools/compress-js', keywords: 'minify javascript compress' },
      { slug: 'compress-json', name: 'Minify JSON', description: 'Remove whitespace from JSON', href: '/tools/compress-json', keywords: 'minify json compress' },
      { slug: 'compress-xml', name: 'Minify XML', description: 'Minify XML documents', href: '/tools/compress-xml', keywords: 'minify xml compress' },
    ],
  },
  {
    slug: 'utilities',
    name: 'Utilities',
    iconName: 'Wrench',
    iconBg: '#faf5ff',
    iconColor: '#9333ea',
    sortOrder: 13,
    tools: [
      { slug: 'stopwatch', name: 'Stopwatch', description: 'Precise stopwatch timer', href: '/tools/stopwatch', keywords: 'stopwatch timer clock' },
      { slug: 'countdown-timer', name: 'Countdown Timer', description: 'Set countdown timers', href: '/tools/countdown-timer', keywords: 'countdown timer alarm' },
      { slug: 'pomodoro-timer', name: 'Pomodoro Timer', description: 'Productivity pomodoro technique timer', href: '/tools/pomodoro-timer', keywords: 'pomodoro timer productivity' },
      { slug: 'random-number', name: 'Random Number', description: 'Generate random numbers in a range', href: '/tools/random-number', keywords: 'random number generator' },
      { slug: 'dice-roller', name: 'Dice Roller', description: 'Roll virtual dice', href: '/tools/dice-roller', keywords: 'dice roll random game' },
      { slug: 'coin-flip', name: 'Coin Flip', description: 'Flip a virtual coin', href: '/tools/coin-flip', keywords: 'coin flip random' },
      { slug: 'decision-maker', name: 'Decision Maker', description: 'Make random decisions for you', href: '/tools/decision-maker', keywords: 'decision random choose' },
      { slug: 'notepad', name: 'Online Notepad', description: 'Quick notes in your browser', href: '/tools/notepad', keywords: 'notepad notes write' },
      { slug: 'clipboard-manager', name: 'Clipboard Manager', description: 'Manage copied text snippets', href: '/tools/clipboard-manager', keywords: 'clipboard copy paste' },
      { slug: 'file-hash', name: 'File Hash Checker', description: 'Verify file integrity with hashes', href: '/tools/file-hash', keywords: 'file hash checksum verify' },
      { slug: 'exif-viewer', name: 'EXIF Viewer', description: 'View image metadata and EXIF data', href: '/tools/exif-viewer', keywords: 'exif metadata viewer' },
      { slug: 'color-picker-tool', name: 'Color Picker', description: 'Pick colors from images and screen', href: '/tools/color-picker-tool', keywords: 'color picker eyedropper' },
      { slug: 'screen-color', name: 'Screen Color Picker', description: 'Pick colors from anywhere on screen', href: '/tools/screen-color', keywords: 'screen color picker' },
      { slug: 'pixel-ruler', name: 'Pixel Ruler', description: 'Measure pixels on screen', href: '/tools/pixel-ruler', keywords: 'pixel ruler measure screen' },
      { slug: 'bulk-rename', name: 'Bulk File Rename', description: 'Rename multiple files at once', href: '/tools/bulk-rename', keywords: 'bulk rename files batch' },
    ],
  },
  {
    slug: 'security-tools',
    name: 'Security Tools',
    iconName: 'Lock',
    iconBg: '#ecfccb',
    iconColor: '#65a30d',
    sortOrder: 14,
    tools: [
      { slug: 'password-strength', name: 'Password Strength', description: 'Check password strength and security', href: '/tools/password-strength', keywords: 'password strength checker security' },
      { slug: 'encrypt-text', name: 'Encrypt Text', description: 'Encrypt text with AES encryption', href: '/tools/encrypt-text', keywords: 'encrypt text aes security' },
      { slug: 'decrypt-text', name: 'Decrypt Text', description: 'Decrypt AES encrypted text', href: '/tools/decrypt-text', keywords: 'decrypt text aes security' },
      { slug: 'pgp-keygen', name: 'PGP Key Generator', description: 'Generate PGP encryption key pairs', href: '/tools/pgp-keygen', keywords: 'pgp key generate encryption' },
      { slug: 'ssl-checker', name: 'SSL Checker', description: 'Check SSL certificate details', href: '/tools/ssl-checker', keywords: 'ssl certificate checker' },
      { slug: 'ip-lookup', name: 'IP Lookup', description: 'Look up IP address information', href: '/tools/ip-lookup', keywords: 'ip lookup geolocation' },
      { slug: 'whois-lookup', name: 'WHOIS Lookup', description: 'Look up domain WHOIS records', href: '/tools/whois-lookup', keywords: 'whois domain lookup' },
      { slug: 'secure-delete', name: 'Secure File Delete', description: 'Securely wipe file data from memory', href: '/tools/secure-delete', keywords: 'secure delete wipe privacy' },
    ],
  },
]

const contentPages = [
  {
    slug: 'pricing',
    title: 'Pricing',
    body: 'Crafvia is free for everyone. Pro unlocks batch processing, larger file limits, EXIF preservation, and priority processing for $9/month.',
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    body: 'Crafvia processes files securely. Server-processed files are automatically deleted after compression. We never sell your data.',
  },
  {
    slug: 'terms',
    title: 'Terms of Service',
    body: 'By using Crafvia you agree to use our tools responsibly. Free tier limits apply. Pro subscriptions renew monthly unless canceled.',
  },
  {
    slug: 'about',
    title: 'About Crafvia',
    body: 'Crafvia provides 170+ free online tools for images, PDFs, video, audio, writing, and development — built for speed and privacy.',
  },
  {
    slug: 'faq',
    title: 'Frequently Asked Questions',
    body: 'All basic tools are free. Files processed on our servers are deleted immediately. Pro features are optional for power users.',
  },
  {
    slug: 'blog',
    title: 'Blog',
    body: 'Tips, tutorials, and updates from the Crafvia team. Coming soon.',
  },
  {
    slug: 'changelog',
    title: 'Changelog',
    body: 'v1.0 — Initial release with compression tools, auth, and 170+ tool catalog.',
  },
]

async function main() {
  // Only reset catalog/config data — keep registered users and their sessions.
  await prisma.processingJob.deleteMany()
  await prisma.tool.deleteMany()
  await prisma.category.deleteMany()
  await prisma.contentPage.deleteMany()
  await prisma.siteConfig.deleteMany()

  let sortOrder = 0
  for (const category of categories) {
    const createdCategory = await prisma.category.create({
      data: {
        slug: category.slug,
        name: category.name,
        iconName: category.iconName,
        iconBg: category.iconBg,
        iconColor: category.iconColor,
        sortOrder: category.sortOrder,
      },
    })

    for (const tool of category.tools) {
      sortOrder += 1
      await prisma.tool.create({
        data: {
          slug: tool.slug,
          name: tool.name,
          description: tool.description,
          categoryId: createdCategory.id,
          href: tool.href ?? null,
          keywords: tool.keywords,
          isPopular: tool.isPopular ?? false,
          requiresPro: tool.requiresPro ?? false,
          compressionMode: tool.compressionMode ?? null,
          accept: tool.accept ?? null,
          sortOrder,
        },
      })
    }
  }

  for (const page of contentPages) {
    await prisma.contentPage.create({ data: page })
  }

  await prisma.siteConfig.createMany({
    data: [
      { key: 'donate_url', value: 'https://buymeacoffee.com/crafvia' },
      { key: 'pro_price_monthly', value: '9' },
      { key: 'stripe_checkout_url', value: '' },
      { key: 'support_email', value: 'support@crafvia.com' },
    ],
  })

  const toolCount = await prisma.tool.count()
  console.log(`Seeded ${toolCount} tools across ${categories.length} categories`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
