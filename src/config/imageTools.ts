import type { LucideIcon } from 'lucide-react'
import { FileImage, Image, Palette, Scissors, Shrink, Sparkles, Wand2 } from 'lucide-react'
import type { RelatedTool } from './tools'

export type ImageToolConfig = {
  path: string
  category: string
  breadcrumb: string
  title: string
  lead: string
  uploadTitle: string
  uploadHint?: string
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

const imageRelated: RelatedTool[] = [
  { name: 'Compress Image', description: 'Reduce image file size', icon: Image, href: '/tools/compress-image' },
  { name: 'Compress PNG', description: 'Optimize PNG files losslessly', icon: FileImage, href: '/tools/compress-png' },
  { name: 'Image Converter', description: 'Convert between image formats', icon: Palette, href: '/tools/image-converter' },
  { name: 'Image Resizer', description: 'Resize to exact dimensions', icon: Shrink, href: '/tools/image-resizer' },
  { name: 'Remove Background', description: 'Remove backgrounds with one click', icon: Wand2, href: '/tools/remove-background' },
  { name: 'Crop Image', description: 'Crop to any aspect ratio', icon: Scissors, href: '/tools/crop-image' },
]

const baseFaq = [
  {
    question: 'Do my images get uploaded to a server?',
    answer: 'Most image tools run entirely in your browser. Your files stay on your device.',
  },
  {
    question: 'What image formats are supported?',
    answer: 'JPG, PNG, WebP, HEIC, GIF, BMP, TIFF, and AVIF are supported on most tools.',
  },
]

function cfg(
  partial: Omit<ImageToolConfig, 'category' | 'popularTitle' | 'faqs' | 'relatedTools' | 'popularOptions'> & {
    faqs?: ImageToolConfig['faqs']
    relatedTools?: RelatedTool[]
    popularOptions?: ImageToolConfig['popularOptions']
  },
): ImageToolConfig {
  return {
    category: 'Image Tools',
    popularTitle: `Popular ${partial.breadcrumb} Options`,
    popularOptions: partial.popularOptions ?? [{ label: `${partial.breadcrumb} Online Free`, href: partial.path }],
    faqs: partial.faqs ?? baseFaq,
    relatedTools: partial.relatedTools ?? imageRelated,
    ...partial,
  }
}

export const compressPngConfig = cfg({
  path: '/tools/compress-png',
  breadcrumb: 'Compress PNG',
  title: 'Compress PNG - Free & Instant',
  lead: 'Reduce PNG file size while preserving transparency. Optimized in your browser or on our secure server.',
  uploadTitle: 'Drop your PNG here or click to browse',
  uploadHint: 'Supports PNG files with transparency.',
  actionLabel: 'Compress PNG',
  processingLabel: 'Compressing…',
  downloadLabel: 'Download compressed PNG',
  whatIsTitle: 'What is Compress PNG?',
  whatIsBody: 'Compress PNG reduces PNG file sizes using lossless optimization while keeping transparency intact.',
  howToTitle: 'How to use Compress PNG',
  howToSteps: ['Upload your PNG file.', 'Adjust compression level.', 'Preview savings and download the optimized PNG.'],
})

export const imageConverterConfig = cfg({
  path: '/tools/image-converter',
  breadcrumb: 'Image Converter',
  title: 'Image Converter - Free & Instant',
  lead: 'Convert images between JPG, PNG, and WebP instantly in your browser.',
  uploadTitle: 'Drop your image here or click to browse',
  uploadHint: 'Supports JPG, PNG, WebP, HEIC, GIF, and more.',
  actionLabel: 'Convert image',
  processingLabel: 'Converting…',
  downloadLabel: 'Download converted image',
  whatIsTitle: 'What is Image Converter?',
  whatIsBody: 'Image Converter transforms images between popular formats with quality control and instant preview.',
  howToTitle: 'How to convert images',
  howToSteps: ['Upload your image.', 'Choose the output format.', 'Adjust quality if needed and download.'],
})

export const cropImageConfig = cfg({
  path: '/tools/crop-image',
  breadcrumb: 'Crop Image',
  title: 'Crop Image - Free & Instant',
  lead: 'Crop images with free-form or preset aspect ratios. Preview in real time.',
  uploadTitle: 'Drop your image here or click to browse',
  actionLabel: 'Crop image',
  processingLabel: 'Cropping…',
  downloadLabel: 'Download cropped image',
  whatIsTitle: 'What is Crop Image?',
  whatIsBody: 'Crop Image lets you trim photos to exact dimensions or popular aspect ratios.',
  howToTitle: 'How to crop an image',
  howToSteps: ['Upload your image.', 'Set crop area or choose an aspect ratio preset.', 'Preview and download.'],
})

export const rotateImageConfig = cfg({
  path: '/tools/rotate-image',
  breadcrumb: 'Rotate Image',
  title: 'Rotate Image - Free & Instant',
  lead: 'Rotate and flip images left, right, horizontally, or vertically.',
  uploadTitle: 'Drop your image here or click to browse',
  actionLabel: 'Apply rotation',
  processingLabel: 'Processing…',
  downloadLabel: 'Download rotated image',
  whatIsTitle: 'What is Rotate Image?',
  whatIsBody: 'Rotate Image fixes orientation and flips photos instantly in your browser.',
  howToTitle: 'How to rotate an image',
  howToSteps: ['Upload your image.', 'Choose rotate or flip options.', 'Download the result.'],
})

export const webpToJpgConfig = cfg({
  path: '/tools/webp-to-jpg',
  breadcrumb: 'WebP to JPG',
  title: 'WebP to JPG Converter - Free & Instant',
  lead: 'Convert WebP images to universal JPG format instantly.',
  uploadTitle: 'Drop your WebP file here or click to browse',
  uploadHint: 'Supports .webp files.',
  actionLabel: 'Convert to JPG',
  processingLabel: 'Converting…',
  downloadLabel: 'Download JPG',
  whatIsTitle: 'What is WebP to JPG?',
  whatIsBody: 'Convert WebP images to JPG for maximum compatibility across apps and devices.',
  howToTitle: 'How to convert WebP to JPG',
  howToSteps: ['Upload a WebP file.', 'Adjust JPG quality.', 'Download your JPG.'],
})

export const pngToJpgConfig = cfg({
  path: '/tools/png-to-jpg',
  breadcrumb: 'PNG to JPG',
  title: 'PNG to JPG Converter - Free & Instant',
  lead: 'Convert PNG images to JPG with proper background handling for transparency.',
  uploadTitle: 'Drop your PNG file here or click to browse',
  actionLabel: 'Convert to JPG',
  processingLabel: 'Converting…',
  downloadLabel: 'Download JPG',
  whatIsTitle: 'What is PNG to JPG?',
  whatIsBody: 'Convert PNG to JPG to reduce file size. Transparent areas are filled with your chosen background color.',
  howToTitle: 'How to convert PNG to JPG',
  howToSteps: ['Upload a PNG file.', 'Choose background color and quality.', 'Download your JPG.'],
})

export const jpgToPngConfig = cfg({
  path: '/tools/jpg-to-png',
  breadcrumb: 'JPG to PNG',
  title: 'JPG to PNG Converter - Free & Instant',
  lead: 'Convert JPG images to lossless PNG format instantly.',
  uploadTitle: 'Drop your JPG file here or click to browse',
  actionLabel: 'Convert to PNG',
  processingLabel: 'Converting…',
  downloadLabel: 'Download PNG',
  whatIsTitle: 'What is JPG to PNG?',
  whatIsBody: 'Convert JPG photos to PNG for lossless editing and transparency support.',
  howToTitle: 'How to convert JPG to PNG',
  howToSteps: ['Upload a JPG file.', 'Click convert.', 'Download your PNG.'],
})

export const imageToPdfConfig = cfg({
  path: '/tools/image-to-pdf',
  breadcrumb: 'Image to PDF',
  title: 'Image to PDF - Free & Instant',
  lead: 'Convert one or more images into a high-quality PDF document.',
  uploadTitle: 'Drop images here or click to browse',
  uploadHint: 'Select multiple images to combine into one PDF.',
  actionLabel: 'Create PDF',
  processingLabel: 'Creating PDF…',
  downloadLabel: 'Download PDF',
  whatIsTitle: 'What is Image to PDF?',
  whatIsBody: 'Image to PDF combines photos into a single PDF with one page per image.',
  howToTitle: 'How to convert images to PDF',
  howToSteps: ['Upload one or more images.', 'Reorder if needed.', 'Create and download your PDF.'],
})

export const watermarkImageConfig = cfg({
  path: '/tools/watermark-image',
  breadcrumb: 'Watermark Image',
  title: 'Watermark Image - Free & Instant',
  lead: 'Add text or logo watermarks with adjustable position, size, and opacity.',
  uploadTitle: 'Drop your image here or click to browse',
  actionLabel: 'Apply watermark',
  processingLabel: 'Applying watermark…',
  downloadLabel: 'Download watermarked image',
  whatIsTitle: 'What is Watermark Image?',
  whatIsBody: 'Protect your photos by adding custom text or logo watermarks with live preview.',
  howToTitle: 'How to watermark an image',
  howToSteps: ['Upload your image.', 'Add text or logo watermark settings.', 'Preview and download.'],
})

export const photoEffectsConfig = cfg({
  path: '/tools/photo-effects',
  breadcrumb: 'Photo Effects',
  title: 'Photo Effects - Free & Instant',
  lead: 'Apply cartoon, sketch, grayscale, sepia, and adjustment effects to your photos.',
  uploadTitle: 'Drop your photo here or click to browse',
  actionLabel: 'Apply effect',
  processingLabel: 'Processing…',
  downloadLabel: 'Download edited photo',
  whatIsTitle: 'What are Photo Effects?',
  whatIsBody: 'Photo Effects transforms images with artistic filters and brightness, contrast, and saturation controls.',
  howToTitle: 'How to apply photo effects',
  howToSteps: ['Upload your photo.', 'Choose an effect and adjust sliders.', 'Preview and download.'],
})

export const faviconGeneratorConfig = cfg({
  path: '/tools/favicon-generator',
  breadcrumb: 'Favicon Generator',
  title: 'Favicon Generator - Free & Instant',
  lead: 'Generate a complete favicon package with ICO, PNG sizes, and web manifest.',
  uploadTitle: 'Drop your logo or image here',
  uploadHint: 'Square images work best.',
  actionLabel: 'Generate favicons',
  processingLabel: 'Generating…',
  downloadLabel: 'Download favicon package',
  whatIsTitle: 'What is Favicon Generator?',
  whatIsBody: 'Favicon Generator creates all standard favicon sizes plus ICO and a web manifest from one image.',
  howToTitle: 'How to generate favicons',
  howToSteps: ['Upload your logo or image.', 'Click Generate favicons.', 'Download the ZIP package.'],
  relatedTools: [
    { name: 'Image Resizer', description: 'Resize images to exact dimensions', icon: Shrink, href: '/tools/image-resizer' },
    { name: 'Compress PNG', description: 'Optimize PNG files', icon: FileImage, href: '/tools/compress-png' },
    { name: 'Image Converter', description: 'Convert image formats', icon: Palette, href: '/tools/image-converter' },
    { name: 'Crop Image', description: 'Crop to aspect ratio', icon: Scissors, href: '/tools/crop-image' },
    { name: 'Watermark Image', description: 'Add watermarks', icon: Sparkles, href: '/tools/watermark-image' },
    { name: 'Photo Effects', description: 'Apply artistic effects', icon: Palette, href: '/tools/photo-effects' },
  ],
})

export const blurImageConfig = cfg({
  path: '/tools/blur-image',
  breadcrumb: 'Blur Image',
  title: 'Blur Image - Free & Instant',
  lead: 'Apply adjustable blur effects with live preview.',
  uploadTitle: 'Drop your image here or click to browse',
  actionLabel: 'Apply blur',
  processingLabel: 'Blurring…',
  downloadLabel: 'Download blurred image',
  whatIsTitle: 'What is Blur Image?',
  whatIsBody: 'Blur Image softens photos with adjustable blur strength for privacy or creative effects.',
  howToTitle: 'How to blur an image',
  howToSteps: ['Upload your image.', 'Adjust blur amount.', 'Download the result.'],
})

export const sharpenImageConfig = cfg({
  path: '/tools/sharpen-image',
  breadcrumb: 'Sharpen Image',
  title: 'Sharpen Image - Free & Instant',
  lead: 'Sharpen blurry photos with adjustable strength and live preview.',
  uploadTitle: 'Drop your image here or click to browse',
  actionLabel: 'Sharpen image',
  processingLabel: 'Sharpening…',
  downloadLabel: 'Download sharpened image',
  whatIsTitle: 'What is Sharpen Image?',
  whatIsBody: 'Sharpen Image enhances edge clarity in soft or slightly blurry photos.',
  howToTitle: 'How to sharpen an image',
  howToSteps: ['Upload your image.', 'Adjust sharpening amount.', 'Download the result.'],
})

export type ImageToolConfigKey = keyof typeof IMAGE_TOOL_CONFIGS

export const IMAGE_TOOL_CONFIGS = {
  compressPng: compressPngConfig,
  imageConverter: imageConverterConfig,
  cropImage: cropImageConfig,
  rotateImage: rotateImageConfig,
  webpToJpg: webpToJpgConfig,
  pngToJpg: pngToJpgConfig,
  jpgToPng: jpgToPngConfig,
  imageToPdf: imageToPdfConfig,
  watermarkImage: watermarkImageConfig,
  photoEffects: photoEffectsConfig,
  faviconGenerator: faviconGeneratorConfig,
  blurImage: blurImageConfig,
  sharpenImage: sharpenImageConfig,
} as const

export type { LucideIcon }
