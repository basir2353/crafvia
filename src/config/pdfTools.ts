import { FileType, Image, Lock, RotateCw, Scissors } from 'lucide-react'
import type { RelatedTool } from './tools'

export type PdfToolConfig = {
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
  serverNotice?: string
  whatIsTitle: string
  whatIsBody: string
  howToTitle: string
  howToSteps: string[]
  faqs: { question: string; answer: string }[]
  popularTitle: string
  popularOptions: { label: string; href?: string }[]
  relatedTools: RelatedTool[]
}

const pdfRelated: RelatedTool[] = [
  { name: 'Compress PDF', description: 'Shrink PDF files while keeping readability', icon: FileType, href: '/tools/compress-pdf' },
  { name: 'Merge PDF', description: 'Combine multiple PDFs into one file', icon: FileType, href: '/tools/merge-pdf' },
  { name: 'Split PDF', description: 'Split PDFs by page range or extract pages', icon: Scissors, href: '/tools/split-pdf' },
  { name: 'PDF to Image', description: 'Convert PDF pages to images', icon: Image, href: '/tools/pdf-to-image' },
  { name: 'Rotate PDF', description: 'Rotate PDF pages any direction', icon: RotateCw, href: '/tools/rotate-pdf' },
  { name: 'Protect PDF', description: 'Add password protection to any PDF', icon: Lock, href: '/tools/protect-pdf' },
]

const baseFaq = [
  {
    question: 'Do my PDFs get uploaded to a server?',
    answer: 'Most PDF tools run entirely in your browser. Your files stay on your device unless noted otherwise.',
  },
  {
    question: 'Is there a file size limit?',
    answer: 'Each PDF can be up to 20MB for browser-based tools.',
  },
]

function cfg(
  partial: Omit<PdfToolConfig, 'category' | 'popularTitle' | 'faqs' | 'relatedTools' | 'popularOptions'> & {
    faqs?: PdfToolConfig['faqs']
    relatedTools?: RelatedTool[]
    popularOptions?: PdfToolConfig['popularOptions']
  },
): PdfToolConfig {
  return {
    category: 'PDF Tools',
    popularTitle: `Popular ${partial.breadcrumb} Options`,
    popularOptions: partial.popularOptions ?? [{ label: `${partial.breadcrumb} Online Free`, href: partial.path }],
    faqs: partial.faqs ?? baseFaq,
    relatedTools: partial.relatedTools ?? pdfRelated,
    ...partial,
  }
}

export const splitPdfConfig = cfg({
  path: '/tools/split-pdf',
  breadcrumb: 'Split PDF',
  title: 'Split PDF - Free & Instant',
  lead: 'Extract pages or split PDFs by page range. Runs entirely in your browser.',
  uploadTitle: 'Drop a PDF file or click to browse',
  uploadHint: 'Enter a page range like 1-3,5,7 to extract pages.',
  actionLabel: 'Split PDF',
  processingLabel: 'Splitting…',
  downloadLabel: 'Download split PDF',
  whatIsTitle: 'What is Split PDF?',
  whatIsBody: 'Split PDF lets you extract specific pages or page ranges from a PDF document without uploading files to a server.',
  howToTitle: 'How to use Split PDF',
  howToSteps: ['Upload your PDF.', 'Enter the pages to extract (e.g. 1-3,5).', 'Download the new PDF with only those pages.'],
})

export const pdfToImageConfig = cfg({
  path: '/tools/pdf-to-image',
  breadcrumb: 'PDF to Image',
  title: 'PDF to Image - Free & Instant',
  lead: 'Convert every PDF page to PNG or JPG images in a ZIP file. Processed locally in your browser.',
  uploadTitle: 'Drop a PDF file or click to browse',
  uploadHint: 'All pages are exported as separate images.',
  actionLabel: 'Convert to Images',
  processingLabel: 'Converting…',
  downloadLabel: 'Download images ZIP',
  whatIsTitle: 'What is PDF to Image?',
  whatIsBody: 'PDF to Image renders each page of your PDF as a high-quality image and packages them in a ZIP download.',
  howToTitle: 'How to use PDF to Image',
  howToSteps: ['Upload your PDF.', 'Choose PNG or JPG output.', 'Download the ZIP containing all page images.'],
})

export const rotatePdfConfig = cfg({
  path: '/tools/rotate-pdf',
  breadcrumb: 'Rotate PDF',
  title: 'Rotate PDF - Free & Instant',
  lead: 'Rotate all pages in a PDF by 90°, 180°, or 270°. Runs entirely in your browser.',
  uploadTitle: 'Drop a PDF file or click to browse',
  actionLabel: 'Rotate PDF',
  processingLabel: 'Rotating…',
  downloadLabel: 'Download rotated PDF',
  whatIsTitle: 'What is Rotate PDF?',
  whatIsBody: 'Rotate PDF turns every page in your document clockwise by the angle you choose.',
  howToTitle: 'How to use Rotate PDF',
  howToSteps: ['Upload your PDF.', 'Select a rotation angle.', 'Download the rotated PDF.'],
})

export const protectPdfConfig = cfg({
  path: '/tools/protect-pdf',
  breadcrumb: 'Protect PDF',
  title: 'Protect PDF - Free & Instant',
  lead: 'Add password protection to your PDF. Encrypted securely on our server and deleted after processing.',
  uploadTitle: 'Drop a PDF file or click to browse',
  uploadHint: 'Set a password that will be required to open the PDF.',
  actionLabel: 'Protect PDF',
  processingLabel: 'Encrypting…',
  downloadLabel: 'Download protected PDF',
  serverNotice: 'Files are uploaded to our secure server for encryption and automatically deleted after processing.',
  whatIsTitle: 'What is Protect PDF?',
  whatIsBody: 'Protect PDF adds password encryption so only people with the password can open your document.',
  howToTitle: 'How to use Protect PDF',
  howToSteps: ['Upload your PDF.', 'Enter a password.', 'Download the encrypted PDF.'],
})

export const unlockPdfConfig = cfg({
  path: '/tools/unlock-pdf',
  breadcrumb: 'Unlock PDF',
  title: 'Unlock PDF - Free & Instant',
  lead: 'Remove password protection from PDF files when you know the password. Processed securely on our server and deleted after processing.',
  uploadTitle: 'Drop a password-protected PDF or click to browse',
  uploadHint: 'Enter the current PDF password to unlock.',
  actionLabel: 'Unlock PDF',
  processingLabel: 'Unlocking…',
  downloadLabel: 'Download unlocked PDF',
  serverNotice: 'Files are uploaded to our secure server for decryption and automatically deleted after processing.',
  whatIsTitle: 'What is Unlock PDF?',
  whatIsBody: 'Unlock PDF removes password protection from a PDF when you provide the correct password.',
  howToTitle: 'How to use Unlock PDF',
  howToSteps: ['Upload your protected PDF.', 'Enter the current password.', 'Download the unlocked PDF.'],
})

export const htmlToPdfConfig = cfg({
  path: '/tools/html-to-pdf',
  breadcrumb: 'HTML to PDF',
  title: 'HTML to PDF - Free & Instant',
  lead: 'Convert HTML content into a PDF document. Runs entirely in your browser.',
  uploadTitle: '',
  actionLabel: 'Convert to PDF',
  processingLabel: 'Converting…',
  downloadLabel: 'Download PDF',
  whatIsTitle: 'What is HTML to PDF?',
  whatIsBody: 'HTML to PDF renders your HTML markup into a printable PDF document.',
  howToTitle: 'How to use HTML to PDF',
  howToSteps: ['Paste or type HTML in the editor.', 'Preview updates automatically.', 'Click Convert to PDF and download.'],
})

export const pdfToWordConfig = cfg({
  path: '/tools/pdf-to-word',
  breadcrumb: 'PDF to Word',
  title: 'PDF to Word - Free & Instant',
  lead: 'Extract text from PDF files into an editable Word document. Processed locally in your browser.',
  uploadTitle: 'Drop a PDF file or click to browse',
  actionLabel: 'Convert to Word',
  processingLabel: 'Converting…',
  downloadLabel: 'Download DOCX',
  whatIsTitle: 'What is PDF to Word?',
  whatIsBody: 'PDF to Word extracts readable text from your PDF and saves it as a .docx file you can edit.',
  howToTitle: 'How to use PDF to Word',
  howToSteps: ['Upload your PDF.', 'Click Convert to Word.', 'Download the editable DOCX file.'],
})

export const wordToPdfConfig = cfg({
  path: '/tools/word-to-pdf',
  breadcrumb: 'Word to PDF',
  title: 'Word to PDF - Free & Instant',
  lead: 'Convert Word (.docx) documents to PDF. Runs entirely in your browser.',
  uploadTitle: 'Drop a .docx file or click to browse',
  uploadHint: 'Supports Microsoft Word .doc and .docx formats.',
  actionLabel: 'Convert to PDF',
  processingLabel: 'Converting…',
  downloadLabel: 'Download PDF',
  whatIsTitle: 'What is Word to PDF?',
  whatIsBody: 'Word to PDF converts .docx documents into PDF files while preserving basic formatting.',
  howToTitle: 'How to use Word to PDF',
  howToSteps: ['Upload your .docx file.', 'Click Convert to PDF.', 'Download the PDF.'],
})

export const extractPdfTextConfig = cfg({
  path: '/tools/extract-pdf-text',
  breadcrumb: 'Extract PDF Text',
  title: 'Extract PDF Text - Free & Instant',
  lead: 'Copy or download text content from any PDF. Runs entirely in your browser.',
  uploadTitle: 'Drop a PDF file or click to browse',
  actionLabel: 'Extract Text',
  processingLabel: 'Extracting…',
  downloadLabel: 'Download text file',
  whatIsTitle: 'What is Extract PDF Text?',
  whatIsBody: 'Extract PDF Text pulls readable text from your PDF so you can copy, search, or save it as a .txt file.',
  howToTitle: 'How to use Extract PDF Text',
  howToSteps: ['Upload your PDF.', 'Click Extract Text.', 'Copy the text or download as a .txt file.'],
})

export const reorderPdfConfig = cfg({
  path: '/tools/reorder-pdf',
  breadcrumb: 'Reorder PDF Pages',
  title: 'Reorder PDF Pages - Free & Instant',
  lead: 'Drag and drop to change page order in any PDF. Runs entirely in your browser.',
  uploadTitle: 'Drop a PDF file or click to browse',
  uploadHint: 'Drag pages below to reorder before saving.',
  actionLabel: 'Save New Order',
  processingLabel: 'Saving…',
  downloadLabel: 'Download reordered PDF',
  whatIsTitle: 'What is Reorder PDF Pages?',
  whatIsBody: 'Reorder PDF Pages lets you rearrange pages by dragging them into the order you want.',
  howToTitle: 'How to use Reorder PDF Pages',
  howToSteps: ['Upload your PDF.', 'Drag pages to reorder them.', 'Download the updated PDF.'],
})

export const deletePdfPagesConfig = cfg({
  path: '/tools/delete-pdf-pages',
  breadcrumb: 'Delete PDF Pages',
  title: 'Delete PDF Pages - Free & Instant',
  lead: 'Remove unwanted pages from a PDF. Runs entirely in your browser.',
  uploadTitle: 'Drop a PDF file or click to browse',
  uploadHint: 'Enter page numbers to delete (e.g. 2,4,6-8).',
  actionLabel: 'Delete Pages',
  processingLabel: 'Processing…',
  downloadLabel: 'Download edited PDF',
  whatIsTitle: 'What is Delete PDF Pages?',
  whatIsBody: 'Delete PDF Pages removes selected pages from your document while keeping the rest intact.',
  howToTitle: 'How to use Delete PDF Pages',
  howToSteps: ['Upload your PDF.', 'Enter pages to remove.', 'Download the edited PDF.'],
})

export const pdfMetadataConfig = cfg({
  path: '/tools/pdf-metadata',
  breadcrumb: 'Edit PDF Metadata',
  title: 'Edit PDF Metadata - Free & Instant',
  lead: 'View and edit PDF document properties like title, author, and keywords. Runs in your browser.',
  uploadTitle: 'Drop a PDF file or click to browse',
  actionLabel: 'Save Metadata',
  processingLabel: 'Saving…',
  downloadLabel: 'Download updated PDF',
  whatIsTitle: 'What is Edit PDF Metadata?',
  whatIsBody: 'Edit PDF Metadata lets you update document properties stored in the PDF file header.',
  howToTitle: 'How to use Edit PDF Metadata',
  howToSteps: ['Upload your PDF.', 'Edit title, author, subject, and keywords.', 'Download the updated PDF.'],
})
