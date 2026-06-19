import type { LucideIcon } from 'lucide-react'
import {
  Code2,
  FileImage,
  FileType,
  Image,
  Lock,
  Palette,
  RotateCw,
  Mic,
  PenLine,
  QrCode,
  Scissors,
  Shrink,
  Sparkles,
  Volume2,
  Wand2,
} from 'lucide-react'

export type RelatedTool = {
  name: string
  description: string
  icon: LucideIcon
  href: string
}

export type CompressionMode = 'image' | 'jpg' | 'png' | 'pdf' | 'heic' | 'background'

export type ToolConfig = {
  path: string
  category: string
  breadcrumb: string
  title: string
  lead: string
  uploadTitle: string
  uploadHint?: string
  accept: string
  multiple?: boolean
  compressionMode: CompressionMode
  actionLabel?: string
  processingLabel?: string
  downloadLabel?: string
  serverNotice?: string
  uploadVariant?: 'default' | 'pdf'
  donateInsideCard?: boolean
  whatIsTitle: string
  whatIsBody: string
  howToTitle: string
  howToSteps: string[]
  faqs: { question: string; answer: string }[]
  popularTitle: string
  popularOptions: { label: string; href?: string }[]
  relatedTools: RelatedTool[]
}

export const whyCrafvia = [
  '100% free with no account required',
  'Files never leave your browser — complete privacy',
  'Instant processing at your CPU\'s speed',
]

export const compressImageConfig: ToolConfig = {
  path: '/tools/compress-image',
  category: 'Image Tools',
  breadcrumb: 'Compress Image',
  title: 'Compress Image - Free & Instant',
  lead:
    'Reduce image file size without losing quality. Runs entirely in your browser.',
  uploadTitle: 'Drop your images here or click to browse',
  uploadHint:
    'Supports JPG, PNG, WebP, GIF, BMP. Multiple files supported on Pro+.',
  accept: 'image/jpeg,image/png,image/webp,image/gif,image/bmp',
  multiple: true,
  compressionMode: 'image',
  whatIsTitle: 'What is Compress Image?',
  whatIsBody:
    'Compress Image is a free online tool that reduces the file size of your photos and graphics without sending them to a server. Everything happens locally in your browser using modern Web APIs, so your images stay private and results are instant. Whether you need smaller files for email, websites, or storage, you can optimize JPG, PNG, WebP, and more in seconds.',
  howToTitle: 'How to use Compress Image',
  howToSteps: [
    'Upload your image (JPG, PNG, or WebP) by dragging it into the tool area or clicking to browse.',
    'Adjust the quality slider to control the compression level — lower values mean smaller files.',
    'Preview the compressed result side-by-side with the original to compare quality.',
    'Click Download to save the optimized image to your device.',
  ],
  faqs: [
    {
      question: 'Does compressing reduce image quality?',
      answer:
        'Some quality loss can occur at lower compression levels, but you control the trade-off with the quality slider. Higher settings keep more detail while still reducing file size.',
    },
    {
      question: 'What image formats are supported?',
      answer:
        'You can compress JPG, PNG, WebP, GIF, and BMP files. Output format matches your input unless you choose to convert during export.',
    },
    {
      question: 'Is there a file size limit?',
      answer:
        'Limits depend on your device memory and browser. Most images up to several hundred MB work fine on modern computers.',
    },
    {
      question: 'Do my images get uploaded to a server?',
      answer:
        'No. All compression runs locally in your browser. Your files never leave your device.',
    },
    {
      question: 'Can I compress multiple images at once?',
      answer:
        'Batch compression is available on Pro+. Free users can compress one image at a time.',
    },
  ],
  popularTitle: 'Popular Compress Image Options',
  popularOptions: [
    { label: 'Compress JPG Online Free', href: '/tools/compress-jpg' },
    { label: 'Compress PNG Online Free' },
    { label: 'Compress WebP Online Free' },
    { label: 'Compress Image to 100KB Online Free' },
    { label: 'Compress Image to 50KB Online Free' },
    { label: 'Compress Image to 200KB Online Free' },
    { label: 'Compress Image for Email' },
    { label: 'Compress Image for Web' },
    { label: 'Bulk Compress Images Online' },
  ],
  relatedTools: [
    {
      name: 'Compress JPG',
      description: 'Optimize JPG images for the web',
      icon: FileImage,
      href: '/tools/compress-jpg',
    },
    {
      name: 'Image Converter',
      description: 'Convert between image formats',
      icon: Image,
      href: '#',
    },
    {
      name: 'Image Resizer',
      description: 'Resize images to exact dimensions',
      icon: Shrink,
      href: '/tools/image-resizer',
    },
    {
      name: 'Remove Background',
      description: 'Remove backgrounds with one click',
      icon: Wand2,
      href: '/tools/remove-background',
    },
    {
      name: 'HEIC to JPG',
      description: 'Convert iPhone photos to JPG',
      icon: Image,
      href: '/tools/heic-to-jpg',
    },
    {
      name: 'Compress PNG',
      description: 'Reduce PNG file size losslessly',
      icon: FileImage,
      href: '#',
    },
  ],
}

export const compressPngConfig: ToolConfig = {
  path: '/tools/compress-png',
  category: 'Image Tools',
  breadcrumb: 'Compress PNG',
  title: 'Compress PNG - Free & Instant',
  lead: 'Reduce PNG file size while preserving transparency.',
  uploadTitle: 'Drop your PNG here or click to browse',
  uploadHint: 'Supports PNG files with transparency.',
  accept: 'image/png',
  multiple: false,
  compressionMode: 'png',
  actionLabel: 'Compress PNG',
  processingLabel: 'Compressing…',
  downloadLabel: 'Download compressed PNG',
  whatIsTitle: 'What is Compress PNG?',
  whatIsBody:
    'Compress PNG optimizes PNG graphics using lossless compression while keeping alpha transparency intact.',
  howToTitle: 'How to use Compress PNG',
  howToSteps: [
    'Upload your PNG file.',
    'Adjust the compression level.',
    'Download the optimized PNG and compare file sizes.',
  ],
  faqs: [
    {
      question: 'Will transparency be preserved?',
      answer: 'Yes. PNG compression keeps transparency while reducing file size.',
    },
    {
      question: 'Is PNG compression lossless?',
      answer: 'Yes. PNG uses lossless compression.',
    },
  ],
  popularTitle: 'Popular Compress PNG Options',
  popularOptions: [
    { label: 'Compress PNG Online Free' },
    { label: 'Optimize PNG for Web', href: '/tools/compress-png' },
  ],
  relatedTools: [
    { name: 'Compress Image', description: 'Reduce image file size', icon: Image, href: '/tools/compress-image' },
    { name: 'Compress JPG', description: 'Optimize JPG images', icon: FileImage, href: '/tools/compress-jpg' },
    { name: 'PNG to JPG', description: 'Convert PNG to JPG', icon: Image, href: '/tools/png-to-jpg' },
    { name: 'Image Converter', description: 'Convert image formats', icon: Palette, href: '/tools/image-converter' },
  ],
}

export const compressJpgConfig: ToolConfig = {
  path: '/tools/compress-jpg',
  category: 'Image Tools',
  breadcrumb: 'Compress JPG',
  title: 'Compress JPG - Free & Instant',
  lead:
    'Optimize JPG images for the web. Runs entirely in your browser.',
  uploadTitle: 'Drop your images here or click to browse',
  uploadHint:
    'Supports JPG, PNG, WebP, GIF, BMP. Multiple files supported on Pro+.',
  accept: 'image/jpeg,image/jpg',
  multiple: true,
  compressionMode: 'jpg',
  whatIsTitle: 'What is Compress JPG?',
  whatIsBody:
    'Compress JPG is a free online tool built specifically for JPEG photos. It reduces file size while keeping your images looking sharp — perfect for websites, email attachments, and social media. Because everything runs in your browser, your JPG files never get uploaded to a server and results appear instantly.',
  howToTitle: 'How to use Compress JPG',
  howToSteps: [
    'Drop your JPG file into the upload area or click Browse to select it.',
    'Use the quality slider to set compression level (recommended: 75–85 for web use).',
    'Compare the original and compressed versions side-by-side.',
    'Download the optimized JPG — typically 40–70% smaller.',
  ],
  faqs: [
    {
      question: 'What is the best quality setting for web?',
      answer:
        'For most websites, a quality setting between 75 and 85 offers the best balance of file size and visual quality. You can preview results before downloading.',
    },
    {
      question: 'Is JPG compression lossy?',
      answer:
        'Yes. JPG uses lossy compression, which removes some data to reduce file size. At higher quality settings, the difference is usually hard to notice.',
    },
    {
      question: 'Will this strip EXIF data?',
      answer:
        'By default, metadata such as location and camera info may be removed during compression to save space. You can keep EXIF on Pro+ if needed.',
    },
    {
      question: 'Can I compress JPGs for email?',
      answer:
        'Absolutely. Compressing JPGs before attaching them to email helps stay under size limits while keeping photos clear enough to view.',
    },
  ],
  popularTitle: 'Popular Compress JPG Options',
  popularOptions: [
    { label: 'Compress JPG to 100KB' },
    { label: 'Compress JPG to 50KB' },
    { label: 'Compress JPG for Email' },
    { label: 'Compress JPG for Web' },
    { label: 'Bulk Compress JPG Online' },
    { label: 'Compress Large JPG Files' },
  ],
  relatedTools: [
    {
      name: 'Compress Image',
      description: 'Reduce image file size without losing quality',
      icon: Image,
      href: '/tools/compress-image',
    },
    {
      name: 'Compress PNG',
      description: 'Reduce PNG file sizes effectively',
      icon: FileImage,
      href: '#',
    },
    {
      name: 'Image Converter',
      description: 'Convert images between JPG, PNG, WebP, and more',
      icon: Image,
      href: '#',
    },
    {
      name: 'Image Resizer',
      description: 'Resize images to any dimension with presets',
      icon: Shrink,
      href: '/tools/image-resizer',
    },
    {
      name: 'Photo Effects',
      description: 'Apply cartoon, sketch, and artistic effects to photos',
      icon: Palette,
      href: '#',
    },
    {
      name: 'Favicon Generator',
      description: 'Generate favicons in all sizes from one image',
      icon: Sparkles,
      href: '#',
    },
  ],
}

export const compressPdfConfig: ToolConfig = {
  path: '/tools/compress-pdf',
  category: 'PDF Tools',
  breadcrumb: 'Compress PDF',
  title: 'Compress PDF - Free & Instant',
  lead:
    'Reduce PDF file size while keeping quality. Runs entirely in your browser.',
  uploadTitle: 'Drop a PDF file or click to browse',
  accept: 'application/pdf',
  multiple: false,
  compressionMode: 'pdf',
  serverNotice:
    'Files are uploaded to our secure server for compression and automatically deleted after processing.',
  uploadVariant: 'pdf',
  donateInsideCard: true,
  whatIsTitle: 'What is Compress PDF?',
  whatIsBody:
    'Compress PDF is a free online tool that lets you reduce PDF file size while keeping quality directly in your browser. Unlike other tools, Crafvia processes everything using modern browser technologies; your files never leave your device. This means faster processing, complete privacy, and no file size limits from server uploads.',
  howToTitle: 'How to use Compress PDF',
  howToSteps: [
    'Upload your PDF file (any size).',
    'Choose a compression level: low (best quality), medium, or high (smallest size).',
    'The tool recompresses embedded images and removes unnecessary metadata.',
    'Download the optimized PDF.',
  ],
  faqs: [
    {
      question: 'How much can PDFs be compressed?',
      answer:
        'Results vary by document. PDFs with large images often shrink 40–70%. Text-only PDFs may see smaller reductions.',
    },
    {
      question: 'Will text quality be affected?',
      answer:
        'Text in your PDF stays sharp. Compression mainly targets embedded images and redundant metadata.',
    },
    {
      question: 'Can I compress password-protected PDFs?',
      answer:
        'You will need to unlock the PDF first. Password-protected files cannot be processed until the password is removed.',
    },
    {
      question: 'Is there a page limit?',
      answer:
        'Free users can compress PDFs up to a generous page count. Pro+ supports larger documents and batch processing.',
    },
  ],
  popularTitle: 'Popular Compress PDF Options',
  popularOptions: [
    { label: 'Compress PDF Online Free' },
    { label: 'Compress PDF Free' },
    { label: 'Compress PDF to 100KB Online Free' },
    { label: 'Compress PDF to 200KB Free' },
    { label: 'Compress PDF to 500KB Online' },
    { label: 'Reduce PDF Size to Under 1MB Free' },
    { label: 'Compress PDF for Email Attachment Free' },
    { label: 'Compress PDF for WhatsApp Free' },
    { label: 'Compress Scanned PDF Online Free' },
    { label: 'Compress PDF Without Losing Quality Free' },
    { label: 'Compress Large PDF File Online Free' },
    { label: 'Reduce PDF File Size Online Free' },
  ],
  relatedTools: [
    {
      name: 'Merge PDF',
      description: 'Combine multiple PDFs into one file',
      icon: FileType,
      href: '/tools/merge-pdf',
    },
    {
      name: 'Split PDF',
      description: 'Split PDFs by page range or extract pages',
      icon: Scissors,
      href: '/tools/split-pdf',
    },
    {
      name: 'PDF to Image',
      description: 'Convert PDF pages to images in any format',
      icon: Image,
      href: '/tools/pdf-to-image',
    },
    {
      name: 'Rotate PDF',
      description: 'Rotate PDF pages any direction',
      icon: RotateCw,
      href: '/tools/rotate-pdf',
    },
    {
      name: 'Protect PDF',
      description: 'Add password protection to any PDF',
      icon: Lock,
      href: '/tools/protect-pdf',
    },
    {
      name: 'HTML to PDF',
      description: 'Convert HTML code or files into PDF documents',
      icon: Code2,
      href: '/tools/html-to-pdf',
    },
  ],
}

export const mergePdfConfig: ToolConfig = {
  path: '/tools/merge-pdf',
  category: 'PDF Tools',
  breadcrumb: 'Merge PDF',
  title: 'Merge PDF - Free & Instant',
  lead:
    'Combine multiple PDFs into a single file. Runs entirely in your browser — your files never leave your device.',
  uploadTitle: 'Drop PDF files here or click to browse',
  uploadHint: 'Select multiple PDFs. Drag to reorder before merging.',
  accept: 'application/pdf',
  multiple: true,
  compressionMode: 'pdf',
  actionLabel: 'Merge PDF',
  processingLabel: 'Merging…',
  downloadLabel: 'Download merged PDF',
  uploadVariant: 'pdf',
  donateInsideCard: true,
  whatIsTitle: 'What is Merge PDF?',
  whatIsBody:
    'Merge PDF is a free online tool that combines multiple PDF files into one document without uploading them to a server. Everything happens locally in your browser, so your files stay private. Reorder files by dragging, preview each PDF, then download a single merged file.',
  howToTitle: 'How to use Merge PDF',
  howToSteps: [
    'Upload two or more PDF files by dragging them into the tool area or clicking to browse.',
    'Review the file list — drag items to reorder, preview any file, or remove unwanted PDFs.',
    'Click Merge PDF to combine all files in the order shown.',
    'Download your merged PDF as merged-document.pdf.',
  ],
  faqs: [
    {
      question: 'How many PDFs can I merge?',
      answer:
        'You can merge up to 50 PDFs at once. Each file can be up to 20MB. Add more files anytime before merging.',
    },
    {
      question: 'Do my files get uploaded to a server?',
      answer:
        'No. Merging runs entirely in your browser. Your PDFs never leave your device.',
    },
    {
      question: 'Can I change the merge order?',
      answer:
        'Yes. Drag and drop files in the list to reorder them before clicking Merge PDF.',
    },
    {
      question: 'Will quality be preserved?',
      answer:
        'Yes. Pages, images, text, and formatting are copied as-is into the merged document.',
    },
    {
      question: 'Can I merge password-protected PDFs?',
      answer:
        'No. Remove the password first using an unlock tool, then merge the files.',
    },
  ],
  popularTitle: 'Popular Merge PDF Options',
  popularOptions: [
    { label: 'Merge PDF Online Free' },
    { label: 'Combine PDF Files' },
    { label: 'Join PDF Documents' },
    { label: 'Merge PDF for Email' },
    { label: 'Merge Scanned PDFs' },
    { label: 'Merge Large PDF Files' },
  ],
  relatedTools: [
    {
      name: 'Compress PDF',
      description: 'Shrink PDF files while keeping readability',
      icon: FileType,
      href: '/tools/compress-pdf',
    },
    {
      name: 'Split PDF',
      description: 'Split PDFs by page range or extract pages',
      icon: Scissors,
      href: '/tools/split-pdf',
    },
    {
      name: 'PDF to Image',
      description: 'Convert PDF pages to images in any format',
      icon: Image,
      href: '/tools/pdf-to-image',
    },
    {
      name: 'Rotate PDF',
      description: 'Rotate PDF pages any direction',
      icon: RotateCw,
      href: '/tools/rotate-pdf',
    },
    {
      name: 'Protect PDF',
      description: 'Add password protection to any PDF',
      icon: Lock,
      href: '/tools/protect-pdf',
    },
    {
      name: 'HTML to PDF',
      description: 'Convert HTML code or files into PDF documents',
      icon: Code2,
      href: '/tools/html-to-pdf',
    },
  ],
}

export const videoToMp3Config: ToolConfig = {
  path: '/tools/video-to-mp3',
  category: 'Video Tools',
  breadcrumb: 'Video to MP3',
  title: 'Video to MP3 - Free & Instant',
  lead:
    'Extract audio from any video and save as MP3. Runs entirely in your browser — your files never leave your device.',
  uploadTitle: 'Drop your video here or click to browse',
  uploadHint:
    'Supports MP4, MOV, AVI, MKV, WebM, M4V, and more from iPhone, Android, and desktop.',
  accept: 'video/*,.mp4,.mov,.avi,.mkv,.webm,.m4v,.flv,.mpeg,.mpg,.3gp,.wmv',
  multiple: false,
  compressionMode: 'image',
  actionLabel: 'Convert to MP3',
  processingLabel: 'Converting…',
  downloadLabel: 'Download MP3',
  whatIsTitle: 'What is Video to MP3?',
  whatIsBody:
    'Video to MP3 is a free online tool that extracts audio from video files and converts it to high-quality MP3. Upload videos from iPhone, Android, Windows, or Mac — processing runs locally in your browser using FFmpeg, so your files stay private. Choose your preferred audio bitrate and download instantly.',
  howToTitle: 'How to use Video to MP3',
  howToSteps: [
    'Upload your video by dragging it into the tool area or clicking to browse.',
    'Preview the video and review file details including duration and resolution.',
    'Select your preferred MP3 audio quality (64–320 kbps).',
    'Click Convert to MP3, then download your extracted audio file.',
  ],
  faqs: [
    {
      question: 'Which video formats are supported?',
      answer:
        'MP4, MOV, AVI, MKV, WebM, M4V, FLV, MPEG, MPG, 3GP, WMV, and most common video formats work. iPhone and Android recordings are supported.',
    },
    {
      question: 'Do my videos get uploaded to a server?',
      answer:
        'No. Conversion runs entirely in your browser. Your videos never leave your device.',
    },
    {
      question: 'Which audio quality should I choose?',
      answer:
        '128 kbps is great for speech and smaller files. 192–256 kbps suits music. 320 kbps offers the highest quality MP3 output.',
    },
    {
      question: 'What if my video has no audio?',
      answer:
        'The tool detects videos without audio tracks and shows a clear error message instead of producing an empty file.',
    },
    {
      question: 'Is there a file size limit?',
      answer:
        'Videos up to 100MB are supported. Larger files may fail due to browser memory limits.',
    },
  ],
  popularTitle: 'Popular Video to MP3 Options',
  popularOptions: [
    { label: 'Video to MP3 Online Free' },
    { label: 'Extract Audio from Video' },
    { label: 'Convert MP4 to MP3' },
    { label: 'Convert MOV to MP3' },
    { label: 'iPhone Video to MP3' },
    { label: 'YouTube Video to MP3' },
  ],
  relatedTools: [
    {
      name: 'Compress Video',
      description: 'Reduce video file size',
      icon: Shrink,
      href: '/tools/compress-video',
    },
    {
      name: 'Convert MP4',
      description: 'Convert videos to MP4 format',
      icon: FileType,
      href: '/tools/convert-mp4',
    },
    {
      name: 'Trim Video',
      description: 'Cut video to exact start and end points',
      icon: Scissors,
      href: '/tools/trim-video',
    },
    {
      name: 'Video to GIF',
      description: 'Convert video clips to animated GIFs',
      icon: Image,
      href: '#',
    },
    {
      name: 'Merge Videos',
      description: 'Combine multiple videos into one',
      icon: FileType,
      href: '#',
    },
    {
      name: 'Mute Video',
      description: 'Remove audio track from videos',
      icon: RotateCw,
      href: '#',
    },
  ],
}

export const textToSpeechConfig: ToolConfig = {
  path: '/tools/text-to-speech',
  category: 'Audio Tools',
  breadcrumb: 'Text to Speech',
  title: 'Text to Speech - Free & Instant',
  lead:
    'Convert written text into natural-sounding speech with multiple voices and languages. Runs in your browser — your text stays private.',
  uploadTitle: 'Enter or paste your text below',
  uploadHint: 'Supports short and long text, paragraphs, Unicode, and emojis.',
  accept: '',
  multiple: false,
  compressionMode: 'image',
  actionLabel: 'Generate Speech',
  processingLabel: 'Generating…',
  downloadLabel: 'Download MP3',
  whatIsTitle: 'What is Text to Speech?',
  whatIsBody:
    'Text to Speech is a free online tool that converts written text into natural-sounding audio. Choose from dozens of languages and voices, adjust speed, pitch, and volume, then listen or download as MP3. Processing uses your browser with Microsoft neural voices and Web Speech technology, so your text never passes through our servers.',
  howToTitle: 'How to use Text to Speech',
  howToSteps: [
    'Enter or paste your text into the text area.',
    'Select a language and voice, then adjust speed, pitch, and volume.',
    'Click Generate Speech to create your audio.',
    'Use the audio player to play, pause, stop, or replay.',
    'Click Download MP3 to save the audio file to your device.',
  ],
  faqs: [
    {
      question: 'Which languages are supported?',
      answer:
        'English, Urdu, Arabic, Hindi, Punjabi, French, German, Spanish, Italian, Portuguese, Chinese, Japanese, Korean, Russian, Turkish, and many more neural voices are available.',
    },
    {
      question: 'Does my text get uploaded to a server?',
      answer:
        'No. Speech synthesis runs in your browser. Your text is sent directly to Microsoft Edge speech services from your device, not through Crafvia servers.',
    },
    {
      question: 'Can I use male and female voices?',
      answer:
        'Yes. Filter voices by gender and pick from available neural voices for your selected language.',
    },
    {
      question: 'Is there a text length limit?',
      answer:
        'Up to 5,000 characters per conversion. Longer passages are split automatically for reliable audio generation.',
    },
    {
      question: 'Can I download the audio?',
      answer:
        'Yes. After generation, use Download MP3 to save a high-quality audio file to your device.',
    },
  ],
  popularTitle: 'Popular Text to Speech Options',
  popularOptions: [
    { label: 'Text to Speech Online Free' },
    { label: 'Urdu Text to Speech' },
    { label: 'Arabic Text to Speech' },
    { label: 'Hindi Text to Speech' },
    { label: 'English Text to Speech' },
    { label: 'Natural Voice Generator' },
  ],
  relatedTools: [
    {
      name: 'Speech to Text',
      description: 'Transcribe audio to text',
      icon: Mic,
      href: '/tools/speech-to-text',
    },
    {
      name: 'Video to MP3',
      description: 'Extract audio from video files',
      icon: Volume2,
      href: '/tools/video-to-mp3',
    },
    {
      name: 'Convert MP3',
      description: 'Convert audio to MP3 format',
      icon: FileType,
      href: '/tools/convert-mp3',
    },
    {
      name: 'Change Audio Speed',
      description: 'Speed up or slow down audio',
      icon: RotateCw,
      href: '/tools/change-speed',
    },
    {
      name: 'Merge Audio',
      description: 'Combine multiple audio files',
      icon: FileType,
      href: '/tools/merge-audio',
    },
    {
      name: 'Normalize Audio',
      description: 'Balance audio volume levels',
      icon: Volume2,
      href: '/tools/normalize-audio',
    },
  ],
}

export const qrCodeGeneratorConfig: ToolConfig = {
  path: '/tools/qr-code-generator',
  category: 'AI Generation',
  breadcrumb: 'QR Code Generator',
  title: 'QR Code Generator - Free & Instant',
  lead:
    'Create custom QR codes for URLs, WiFi, contacts, WhatsApp, and more. Runs entirely in your browser — nothing leaves your device.',
  uploadTitle: 'Enter your QR content',
  uploadHint: 'Choose a QR type, customize colors and size, then generate instantly.',
  accept: '',
  multiple: false,
  compressionMode: 'image',
  actionLabel: 'Generate QR Code',
  processingLabel: 'Generating…',
  downloadLabel: 'Download QR Code',
  whatIsTitle: 'What is QR Code Generator?',
  whatIsBody:
    'QR Code Generator is a free online tool that creates scannable QR codes for websites, text, email, phone numbers, SMS, WhatsApp, WiFi credentials, contacts, social links, and map locations. Customize size, colors, margins, error correction, and add a center logo, then download as PNG, SVG, JPEG, or WEBP. Everything runs locally in your browser.',
  howToTitle: 'How to use QR Code Generator',
  howToSteps: [
    'Choose a QR code type and enter your content.',
    'Customize size, error correction, colors, margin, and optional logo.',
    'Click Generate QR Code to create your preview.',
    'Copy the image or download as PNG, SVG, JPEG, or WEBP.',
    'Use Regenerate after changing settings to refresh the QR code.',
  ],
  faqs: [
    {
      question: 'Does my data get uploaded to a server?',
      answer:
        'No. QR codes are generated entirely in your browser. Your URLs, WiFi passwords, and contact details never leave your device.',
    },
    {
      question: 'Can I add a logo to the center?',
      answer:
        'Yes. Upload a logo image and the tool places it in the center while keeping the QR code scannable with higher error correction.',
    },
    {
      question: 'Which download formats are supported?',
      answer:
        'PNG, SVG, JPEG, and WEBP. Transparent backgrounds work best with PNG and WEBP.',
    },
    {
      question: 'What QR content types are supported?',
      answer:
        'Website URLs, plain text, email, phone, SMS, WhatsApp, WiFi, vCard contacts, social media links, Google Maps locations, and custom data.',
    },
    {
      question: 'Will long URLs work?',
      answer:
        'Yes. The generator supports long URLs and automatically adds https:// when needed for website links.',
    },
  ],
  popularTitle: 'Popular QR Code Generator Options',
  popularOptions: [
    { label: 'QR Code Generator Free' },
    { label: 'URL to QR Code' },
    { label: 'WiFi QR Code' },
    { label: 'WhatsApp QR Code' },
    { label: 'vCard QR Code' },
    { label: 'Custom QR Code Maker' },
  ],
  relatedTools: [
    {
      name: 'Barcode Generator',
      description: 'Create barcodes for products',
      icon: QrCode,
      href: '/tools/barcode-generator',
    },
    {
      name: 'Password Generator',
      description: 'Generate strong secure passwords',
      icon: Lock,
      href: '/tools/password-generator',
    },
    {
      name: 'URL Encoder',
      description: 'Encode and decode URLs',
      icon: Code2,
      href: '#',
    },
    {
      name: 'Color Palette Generator',
      description: 'Generate harmonious color palettes',
      icon: Palette,
      href: '/tools/color-palette',
    },
    {
      name: 'Image Generator',
      description: 'Generate images from text prompts',
      icon: Sparkles,
      href: '/tools/image-generator',
    },
    {
      name: 'JSON Generator',
      description: 'Generate sample JSON data',
      icon: FileType,
      href: '#',
    },
  ],
}

export const jsonFormatterConfig: ToolConfig = {
  path: '/tools/json-formatter',
  category: 'Developer Tools',
  breadcrumb: 'JSON Formatter',
  title: 'JSON Formatter - Free & Instant',
  lead:
    'Beautify, validate, and minify JSON instantly in your browser. Your data never leaves your device.',
  uploadTitle: 'Paste or type your JSON below',
  uploadHint: 'Supports nested objects, arrays, minified JSON, and large payloads.',
  accept: '',
  multiple: false,
  compressionMode: 'image',
  actionLabel: 'Format JSON',
  processingLabel: 'Formatting…',
  downloadLabel: 'Download JSON',
  whatIsTitle: 'What is JSON Formatter?',
  whatIsBody:
    'JSON Formatter is a free online tool that beautifies, validates, and minifies JSON data. Paste minified or messy JSON, format it with proper indentation, catch syntax errors with exact line and column numbers, then copy or download the result. Everything runs locally in your browser for complete privacy.',
  howToTitle: 'How to use JSON Formatter',
  howToSteps: [
    'Paste or type your JSON into the input area.',
    'Click Format JSON to beautify with proper indentation.',
    'Review validation status and fix any syntax errors shown with line numbers.',
    'Use Minify, Copy, or Download to export your formatted JSON.',
    'Click Clear to reset the input and output.',
  ],
  faqs: [
    {
      question: 'Does my JSON get uploaded to a server?',
      answer:
        'No. All formatting and validation runs entirely in your browser. Your JSON stays on your device.',
    },
    {
      question: 'Can I format minified JSON?',
      answer:
        'Yes. Paste minified JSON on a single line and click Format JSON to expand it with readable indentation.',
    },
    {
      question: 'What happens if my JSON is invalid?',
      answer:
        'The tool shows the exact error message plus the line and column where parsing failed. Invalid JSON is not formatted until the syntax is fixed.',
    },
    {
      question: 'Is there a size limit?',
      answer:
        'JSON up to 2,000,000 characters is supported. Very large payloads may be slower depending on your device.',
    },
    {
      question: 'Can I download the formatted output?',
      answer:
        'Yes. Click Download JSON to save a UTF-8 encoded formatted.json file.',
    },
  ],
  popularTitle: 'Popular JSON Formatter Options',
  popularOptions: [
    { label: 'JSON Formatter Online' },
    { label: 'JSON Beautifier' },
    { label: 'JSON Validator' },
    { label: 'JSON Pretty Print' },
    { label: 'Minify JSON' },
    { label: 'Format JSON Online Free' },
  ],
  relatedTools: [
    {
      name: 'Minify JSON',
      description: 'Remove whitespace from JSON',
      icon: Shrink,
      href: '#',
    },
    {
      name: 'CSV to JSON',
      description: 'Convert CSV data to JSON',
      icon: Code2,
      href: '#',
    },
    {
      name: 'JSON to CSV',
      description: 'Convert JSON data to CSV',
      icon: FileType,
      href: '#',
    },
    {
      name: 'YAML Validator',
      description: 'Validate YAML syntax',
      icon: Wand2,
      href: '#',
    },
    {
      name: 'JWT Decoder',
      description: 'Decode JSON Web Tokens',
      icon: Lock,
      href: '#',
    },
    {
      name: 'JSON Generator',
      description: 'Generate sample JSON data',
      icon: Sparkles,
      href: '#',
    },
  ],
}

export const aiWriterConfig: ToolConfig = {
  path: '/tools/ai-writer',
  category: 'AI Writing',
  breadcrumb: 'AI Writer',
  title: 'AI Writer - Generate & Improve Text',
  lead:
    'Generate blog posts, emails, marketing copy, and more — or improve existing text with AI-powered rewriting, grammar fixes, and tone adjustments.',
  uploadTitle: 'Enter your topic, prompt, or text',
  uploadHint: 'Describe what you want to write, or paste text to improve.',
  accept: '',
  multiple: false,
  compressionMode: 'image',
  actionLabel: 'Generate Content',
  processingLabel: 'Generating…',
  downloadLabel: 'Download',
  whatIsTitle: 'What is AI Writer?',
  whatIsBody:
    'AI Writer is a powerful writing assistant that helps you create and refine content in seconds. Generate blog posts, social captions, product descriptions, emails, and more — or improve existing text with rewrite, expand, shorten, grammar, SEO, and translation tools. Edit results in the built-in editor, then copy or download your content.',
  howToTitle: 'How to use AI Writer',
  howToSteps: [
    'Enter a topic, prompt, or paste text you want to improve.',
    'Choose content type or improvement action, tone, and output length.',
    'Click Generate Content and wait for the AI to create your draft.',
    'Edit the result in the rich text editor.',
    'Copy, download as TXT or DOCX, regenerate, or continue writing.',
  ],
  faqs: [
    {
      question: 'What content can I generate?',
      answer:
        'Blog posts, articles, social posts, LinkedIn content, product descriptions, marketing copy, emails, cover letters, proposals, captions, ads, YouTube descriptions, SEO content, and custom formats.',
    },
    {
      question: 'Can I improve existing text?',
      answer:
        'Yes. Switch to Improve mode to rewrite, expand, shorten, fix grammar, improve readability, change tone, summarize, translate, humanize, and more.',
    },
    {
      question: 'Is a Pro subscription required?',
      answer:
        'AI Writer is available on the free plan with daily limits. Add a GROQ, Gemini, or OpenAI API key in server/.env for full AI-powered output.',
    },
    {
      question: 'Can I edit and export the output?',
      answer:
        'Yes. Edit directly in the editor, copy to clipboard, or download as TXT or DOCX.',
    },
    {
      question: 'Is my draft saved automatically?',
      answer:
        'Your latest draft is auto-saved locally in your browser so you can return to it later on the same device.',
    },
  ],
  popularTitle: 'Popular AI Writer Options',
  popularOptions: [
    { label: 'AI Blog Post Writer', href: '/tools/ai-writer' },
    { label: 'AI Email Writer', href: '/tools/email-writer' },
    { label: 'AI Product Description', href: '/tools/product-description' },
    { label: 'Rewrite Text with AI', href: '/tools/paraphrase' },
    { label: 'AI Grammar Fix', href: '/tools/grammar-check' },
    { label: 'AI Content Generator', href: '/tools/ai-writer' },
  ],
  relatedTools: [
    {
      name: 'Paraphrase',
      description: 'Rewrite text in different words',
      icon: PenLine,
      href: '/tools/paraphrase',
    },
    {
      name: 'Summarize',
      description: 'Summarize long text into key points',
      icon: FileType,
      href: '/tools/summarize',
    },
    {
      name: 'Grammar Check',
      description: 'Fix grammar and spelling errors',
      icon: Wand2,
      href: '/tools/grammar-check',
    },
    {
      name: 'Tone Changer',
      description: 'Adjust writing tone and style',
      icon: Sparkles,
      href: '/tools/tone-changer',
    },
    {
      name: 'Email Writer',
      description: 'Draft professional emails quickly',
      icon: PenLine,
      href: '/tools/email-writer',
    },
    {
      name: 'Translate Text',
      description: 'Translate text between languages',
      icon: Code2,
      href: '/tools/translate-text',
    },
  ],
}

export const heicToJpgConfig: ToolConfig = {
  path: '/tools/heic-to-jpg',
  category: 'Image Tools',
  breadcrumb: 'HEIC to JPG',
  title: 'HEIC to JPG - Free & Instant',
  lead:
    'Convert iPhone HEIC photos to universal JPG format. Runs entirely in your browser.',
  uploadTitle: 'Drop your HEIC file here or click to browse',
  uploadHint: 'Supports .heic and .HEIC files from iPhone and iPad.',
  accept: '.heic,.HEIC,image/heic,image/heif',
  multiple: false,
  compressionMode: 'heic',
  actionLabel: 'Convert now',
  processingLabel: 'Converting…',
  downloadLabel: 'Download JPG',
  whatIsTitle: 'What is HEIC to JPG?',
  whatIsBody:
    'HEIC to JPG is a free online tool that converts Apple HEIC photos into standard JPG files without uploading them to a server. Everything happens locally in your browser using heic2any, so your images stay private and results are instant. Perfect for sharing iPhone photos on websites, email, and apps that require JPG.',
  howToTitle: 'How to use HEIC to JPG',
  howToSteps: [
    'Upload your HEIC file (.heic or .HEIC) by dragging it into the tool area or clicking to browse.',
    'Adjust the quality slider to control the output JPG quality.',
    'Click Convert now to process the file in your browser.',
    'Preview the converted JPG, then click Download to save it to your device.',
  ],
  faqs: [
    {
      question: 'What is a HEIC file?',
      answer:
        'HEIC is Apple\'s default photo format on iPhone and iPad. It produces smaller files than JPG but is not universally supported. Converting to JPG makes your photos compatible everywhere.',
    },
    {
      question: 'Do my photos get uploaded to a server?',
      answer:
        'No. Conversion runs entirely in your browser. Your HEIC files never leave your device.',
    },
    {
      question: 'Which file extensions are supported?',
      answer:
        'You can convert .heic and .HEIC files. Both lowercase and uppercase extensions work.',
    },
    {
      question: 'Will converting reduce quality?',
      answer:
        'Some quality loss can occur when exporting to JPG. Use the quality slider to balance file size and visual quality before downloading.',
    },
    {
      question: 'Can I convert multiple HEIC files at once?',
      answer:
        'Free users can convert one file at a time. Batch conversion is available on Pro+.',
    },
  ],
  popularTitle: 'Popular HEIC to JPG Options',
  popularOptions: [
    { label: 'HEIC to JPG Online Free' },
    { label: 'Convert iPhone Photos to JPG' },
    { label: 'HEIC to JPEG Converter' },
    { label: 'Apple HEIC to JPG' },
    { label: 'HEIC to JPG for Windows' },
    { label: 'HEIC to JPG for Email' },
  ],
  relatedTools: [
    {
      name: 'Compress Image',
      description: 'Reduce image file size without losing quality',
      icon: Image,
      href: '/tools/compress-image',
    },
    {
      name: 'Compress JPG',
      description: 'Optimize JPG images for the web',
      icon: FileImage,
      href: '/tools/compress-jpg',
    },
    {
      name: 'Image Converter',
      description: 'Convert between image formats',
      icon: Image,
      href: '#',
    },
    {
      name: 'Image Resizer',
      description: 'Resize images to exact dimensions',
      icon: Shrink,
      href: '/tools/image-resizer',
    },
    {
      name: 'Compress PNG',
      description: 'Reduce PNG file size losslessly',
      icon: FileImage,
      href: '#',
    },
    {
      name: 'Remove Background',
      description: 'Remove backgrounds with one click',
      icon: Wand2,
      href: '/tools/remove-background',
    },
  ],
}

export const removeBackgroundConfig: ToolConfig = {
  path: '/tools/remove-background',
  category: 'Image Tools',
  breadcrumb: 'Remove Background',
  title: 'Remove Background - Free & Instant',
  lead:
    'Remove image backgrounds with one click. Runs entirely in your browser.',
  uploadTitle: 'Drop your image here or click to browse',
  uploadHint:
    'Supports JPG, PNG, WebP, HEIC, HEIF, AVIF, BMP, TIFF, and GIF from any device.',
  accept: 'image/*,.heic,.HEIC,.heif,.HEIF',
  multiple: false,
  compressionMode: 'background',
  actionLabel: 'Remove Background',
  processingLabel: 'Removing background…',
  downloadLabel: 'Download PNG',
  whatIsTitle: 'What is Remove Background?',
  whatIsBody:
    'Remove Background is a free online tool that removes image backgrounds and exports a transparent PNG without uploading your files to a server. Upload photos from iPhone, Android, Windows, or Mac — HEIC and other formats are converted automatically before processing. The AI model runs locally in your browser, detects the subject, and removes the background while preserving image quality and dimensions.',
  howToTitle: 'How to use Remove Background',
  howToSteps: [
    'Upload your image by dragging it into the tool area or clicking to browse.',
    'Preview your image, then click Remove Background to process it.',
    'Wait while the background is removed — a loading indicator shows progress.',
    'Preview the transparent PNG result, then click Download to save it.',
  ],
  faqs: [
    {
      question: 'Which image formats are supported?',
      answer:
        'JPG, JPEG, PNG, WebP, HEIC, HEIF, AVIF, BMP, TIFF, and GIF are supported. iPhone HEIC photos are converted automatically — no manual conversion needed.',
    },
    {
      question: 'What format is the output?',
      answer:
        'The result is a transparent PNG file, ideal for logos, product photos, and graphics.',
    },
    {
      question: 'Are original image dimensions preserved?',
      answer:
        'Yes. The output keeps the same dimensions as your uploaded image. Very large images may be optimized for processing while maintaining quality.',
    },
    {
      question: 'Does this work on mobile?',
      answer:
        'Yes. Upload photos directly from your phone — including HEIC images from iPhone.',
    },
    {
      question: 'Why did processing fail?',
      answer:
        'Processing may fail if the file is corrupted, unsupported, or exceeds the size limit. Try a smaller image or a different format.',
    },
  ],
  popularTitle: 'Popular Remove Background Options',
  popularOptions: [
    { label: 'Remove Background Online Free' },
    { label: 'Transparent PNG Background Remover' },
    { label: 'Remove Background from Photo' },
    { label: 'Remove Background for E-commerce' },
    { label: 'Remove Background from iPhone Photos' },
    { label: 'AI Background Remover' },
  ],
  relatedTools: [
    {
      name: 'Compress Image',
      description: 'Reduce image file size without losing quality',
      icon: Image,
      href: '/tools/compress-image',
    },
    {
      name: 'Compress JPG',
      description: 'Optimize JPG images for the web',
      icon: FileImage,
      href: '/tools/compress-jpg',
    },
    {
      name: 'HEIC to JPG',
      description: 'Convert iPhone photos to JPG',
      icon: Image,
      href: '/tools/heic-to-jpg',
    },
    {
      name: 'Image Resizer',
      description: 'Resize images to exact dimensions',
      icon: Shrink,
      href: '/tools/image-resizer',
    },
    {
      name: 'Crop Image',
      description: 'Crop images to any aspect ratio',
      icon: Scissors,
      href: '#',
    },
    {
      name: 'Image Converter',
      description: 'Convert between image formats',
      icon: Palette,
      href: '#',
    },
  ],
}

export const imageResizerConfig: ToolConfig = {
  path: '/tools/image-resizer',
  category: 'Image Tools',
  breadcrumb: 'Image Resizer',
  title: 'Image Resizer - Free & Instant',
  lead:
    'Resize images to exact dimensions with presets and aspect ratio control. HEIC and other formats are handled automatically.',
  uploadTitle: 'Drop your image here or click to browse',
  uploadHint:
    'Supports JPG, PNG, WebP, HEIC, HEIF, AVIF, BMP, TIFF, and GIF from any device.',
  accept: 'image/*,.heic,.HEIC,.heif,.HEIF',
  multiple: false,
  compressionMode: 'image',
  actionLabel: 'Resize image',
  processingLabel: 'Resizing…',
  downloadLabel: 'Download resized image',
  whatIsTitle: 'What is Image Resizer?',
  whatIsBody:
    'Image Resizer is a free online tool that lets you change image dimensions to exact pixel sizes or presets. Upload photos from iPhone, Android, Windows, or Mac — HEIC files are converted automatically. Lock aspect ratio to prevent distortion, or unlock for exact dimensions. Download as JPG, PNG, or WebP.',
  howToTitle: 'How to use Image Resizer',
  howToSteps: [
    'Upload your image by dragging it into the tool area or clicking to browse.',
    'View the original dimensions, then choose a preset or enter custom width and height.',
    'Lock or unlock aspect ratio, pick an output format, and adjust quality if needed.',
    'Click Resize image, preview the result, then download your resized file.',
  ],
  faqs: [
    {
      question: 'Which image formats are supported?',
      answer:
        'JPG, JPEG, PNG, WebP, HEIC, HEIF, AVIF, BMP, TIFF, and GIF are supported. iPhone HEIC photos are converted automatically.',
    },
    {
      question: 'What does aspect ratio lock do?',
      answer:
        'When locked, the image scales proportionally to fit within your target width and height without distortion. When unlocked, the image stretches to the exact dimensions you enter.',
    },
    {
      question: 'Can I resize by percentage?',
      answer:
        'Yes. Switch to percentage mode and set a scale from 1% to 200%. Width and height update automatically while preserving proportions.',
    },
    {
      question: 'Which output format should I use?',
      answer:
        'Use PNG for transparency, JPG for photos and smaller files, or WebP for a modern balance of quality and size.',
    },
    {
      question: 'Is there a file size limit?',
      answer:
        'Free users can upload images up to 20MB. Very large images may take longer to process.',
    },
  ],
  popularTitle: 'Popular Image Resizer Options',
  popularOptions: [
    { label: 'Resize Image Online Free' },
    { label: 'Resize Image to 1920x1080' },
    { label: 'Resize Image for Instagram' },
    { label: 'Resize Image for Web' },
    { label: 'Resize iPhone Photos' },
    { label: 'Bulk Resize Images Online' },
  ],
  relatedTools: [
    {
      name: 'Compress Image',
      description: 'Reduce image file size without losing quality',
      icon: Image,
      href: '/tools/compress-image',
    },
    {
      name: 'Compress JPG',
      description: 'Optimize JPG images for the web',
      icon: FileImage,
      href: '/tools/compress-jpg',
    },
    {
      name: 'HEIC to JPG',
      description: 'Convert iPhone photos to JPG',
      icon: Image,
      href: '/tools/heic-to-jpg',
    },
    {
      name: 'Remove Background',
      description: 'Remove backgrounds with one click',
      icon: Wand2,
      href: '/tools/remove-background',
    },
    {
      name: 'Crop Image',
      description: 'Crop images to any aspect ratio',
      icon: Scissors,
      href: '#',
    },
    {
      name: 'Image Converter',
      description: 'Convert between image formats',
      icon: Palette,
      href: '#',
    },
  ],
}
