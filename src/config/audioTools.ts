import { Mic, Music, Scissors, Shuffle, Volume2, Waves } from 'lucide-react'
import type { RelatedTool } from './tools'

export type AudioToolConfig = {
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

export const AUDIO_ACCEPT =
  'audio/*,.mp3,.wav,.aac,.m4a,.ogg,.flac,.wma,.aiff,.opus'

const audioRelated: RelatedTool[] = [
  { name: 'Trim Audio', description: 'Cut audio to exact duration', icon: Scissors, href: '/tools/trim-audio' },
  { name: 'Convert MP3', description: 'Convert audio to MP3 format', icon: Music, href: '/tools/convert-mp3' },
  { name: 'Normalize Audio', description: 'Balance audio volume levels', icon: Volume2, href: '/tools/normalize-audio' },
  { name: 'Text to Speech', description: 'Convert written text into natural speech', icon: Mic, href: '/tools/text-to-speech' },
  { name: 'Merge Audio', description: 'Combine multiple audio files', icon: Waves, href: '/tools/merge-audio' },
  { name: 'Change Audio Speed', description: 'Speed up or slow down audio', icon: Shuffle, href: '/tools/change-speed' },
]

const baseFaq = [
  {
    question: 'Do my audio files get uploaded to a server?',
    answer: 'No. All audio tools run entirely in your browser using FFmpeg. Your files never leave your device.',
  },
  {
    question: 'Which audio formats are supported?',
    answer: 'MP3, WAV, AAC, M4A, OGG, FLAC, WMA, AIFF, OPUS, and most common mobile audio formats.',
  },
  {
    question: 'Is there a file size limit?',
    answer: 'Audio files up to 50MB are supported. Larger files may fail due to browser memory limits.',
  },
]

function cfg(
  partial: Omit<AudioToolConfig, 'category' | 'popularTitle' | 'faqs' | 'relatedTools' | 'popularOptions'> & {
    faqs?: AudioToolConfig['faqs']
    relatedTools?: RelatedTool[]
    popularOptions?: AudioToolConfig['popularOptions']
  },
): AudioToolConfig {
  return {
    category: 'Audio Tools',
    popularTitle: `Popular ${partial.breadcrumb} Options`,
    popularOptions: partial.popularOptions ?? [{ label: `${partial.breadcrumb} Online Free`, href: partial.path }],
    faqs: partial.faqs ?? baseFaq,
    relatedTools: partial.relatedTools ?? audioRelated,
    ...partial,
  }
}

export const trimAudioConfig = cfg({
  path: '/tools/trim-audio',
  breadcrumb: 'Trim Audio',
  title: 'Trim Audio - Free & Instant',
  lead: 'Cut audio to exact start and end points. Runs entirely in your browser.',
  uploadTitle: 'Drop your audio here or click to browse',
  uploadHint: 'Set start and end times, then trim your clip.',
  actionLabel: 'Trim Audio',
  processingLabel: 'Trimming…',
  downloadLabel: 'Download trimmed audio',
  whatIsTitle: 'What is Trim Audio?',
  whatIsBody: 'Trim Audio lets you cut any section from an audio file without uploading it to a server.',
  howToTitle: 'How to use Trim Audio',
  howToSteps: ['Upload your audio file.', 'Set start and end times in seconds.', 'Click Trim Audio and download your clip.'],
})

export const convertMp3Config = cfg({
  path: '/tools/convert-mp3',
  breadcrumb: 'Convert MP3',
  title: 'Convert MP3 - Free & Instant',
  lead: 'Convert any audio file to MP3 format. Runs entirely in your browser.',
  uploadTitle: 'Drop your audio here or click to browse',
  actionLabel: 'Convert to MP3',
  processingLabel: 'Converting…',
  downloadLabel: 'Download MP3',
  whatIsTitle: 'What is Convert MP3?',
  whatIsBody: 'Convert MP3 transforms WAV, AAC, M4A, OGG, FLAC, and other formats into widely compatible MP3 files.',
  howToTitle: 'How to use Convert MP3',
  howToSteps: ['Upload your audio file.', 'Choose MP3 quality.', 'Click Convert to MP3 and download.'],
})

export const normalizeAudioConfig = cfg({
  path: '/tools/normalize-audio',
  breadcrumb: 'Normalize Audio',
  title: 'Normalize Audio - Free & Instant',
  lead: 'Balance audio volume levels for consistent playback. Runs in your browser.',
  uploadTitle: 'Drop your audio here or click to browse',
  actionLabel: 'Normalize Audio',
  processingLabel: 'Normalizing…',
  downloadLabel: 'Download normalized audio',
  whatIsTitle: 'What is Normalize Audio?',
  whatIsBody: 'Normalize Audio evens out volume differences so quiet and loud sections sound balanced.',
  howToTitle: 'How to use Normalize Audio',
  howToSteps: ['Upload your audio file.', 'Click Normalize Audio.', 'Download the balanced MP3 file.'],
})

export const mergeAudioConfig = cfg({
  path: '/tools/merge-audio',
  breadcrumb: 'Merge Audio',
  title: 'Merge Audio - Free & Instant',
  lead: 'Combine multiple audio files into one. Runs entirely in your browser.',
  uploadTitle: 'Drop audio files here or click to browse',
  uploadHint: 'Select multiple files to merge in order.',
  actionLabel: 'Merge Audio',
  processingLabel: 'Merging…',
  downloadLabel: 'Download merged audio',
  whatIsTitle: 'What is Merge Audio?',
  whatIsBody: 'Merge Audio joins multiple clips into a single MP3 file without server uploads.',
  howToTitle: 'How to use Merge Audio',
  howToSteps: ['Upload two or more audio files.', 'Click Merge Audio.', 'Download the combined MP3.'],
})

export const changeSpeedConfig = cfg({
  path: '/tools/change-speed',
  breadcrumb: 'Change Audio Speed',
  title: 'Change Audio Speed - Free & Instant',
  lead: 'Speed up or slow down audio without changing pitch. Runs in your browser.',
  uploadTitle: 'Drop your audio here or click to browse',
  actionLabel: 'Change Speed',
  processingLabel: 'Processing…',
  downloadLabel: 'Download audio',
  whatIsTitle: 'What is Change Audio Speed?',
  whatIsBody: 'Change Audio Speed adjusts playback tempo from 0.25x to 3x while keeping pitch natural.',
  howToTitle: 'How to use Change Audio Speed',
  howToSteps: ['Upload your audio file.', 'Choose a speed multiplier.', 'Download the adjusted MP3.'],
})

export const fadeAudioConfig = cfg({
  path: '/tools/fade-audio',
  breadcrumb: 'Fade In/Out',
  title: 'Fade In/Out - Free & Instant',
  lead: 'Add smooth fade-in and fade-out effects to any audio file. Runs in your browser.',
  uploadTitle: 'Drop your audio here or click to browse',
  actionLabel: 'Apply Fade',
  processingLabel: 'Applying fade…',
  downloadLabel: 'Download audio',
  whatIsTitle: 'What is Fade In/Out?',
  whatIsBody: 'Fade In/Out adds gradual volume transitions at the start and end of your audio.',
  howToTitle: 'How to use Fade In/Out',
  howToSteps: ['Upload your audio file.', 'Set fade-in and fade-out duration.', 'Download the faded MP3.'],
})

export const reverseAudioConfig = cfg({
  path: '/tools/reverse-audio',
  breadcrumb: 'Reverse Audio',
  title: 'Reverse Audio - Free & Instant',
  lead: 'Play audio backwards. Runs entirely in your browser.',
  uploadTitle: 'Drop your audio here or click to browse',
  actionLabel: 'Reverse Audio',
  processingLabel: 'Reversing…',
  downloadLabel: 'Download reversed audio',
  whatIsTitle: 'What is Reverse Audio?',
  whatIsBody: 'Reverse Audio plays your clip from end to start — useful for creative effects.',
  howToTitle: 'How to use Reverse Audio',
  howToSteps: ['Upload your audio file.', 'Click Reverse Audio.', 'Preview and download the reversed MP3.'],
})

export const removeNoiseConfig = cfg({
  path: '/tools/remove-noise',
  breadcrumb: 'Remove Background Noise',
  title: 'Remove Background Noise - Free & Instant',
  lead: 'Reduce background noise from audio recordings. Runs entirely in your browser.',
  uploadTitle: 'Drop your audio here or click to browse',
  actionLabel: 'Remove Noise',
  processingLabel: 'Cleaning audio…',
  downloadLabel: 'Download cleaned audio',
  whatIsTitle: 'What is Remove Background Noise?',
  whatIsBody: 'Remove Background Noise filters out hiss, hum, and ambient noise from voice recordings.',
  howToTitle: 'How to use Remove Background Noise',
  howToSteps: ['Upload your audio file.', 'Click Remove Noise.', 'Download the cleaned MP3.'],
})

export const speechToTextConfig = cfg({
  path: '/tools/speech-to-text',
  breadcrumb: 'Speech to Text',
  title: 'Speech to Text - Free & Instant',
  lead: 'Transcribe speech from your microphone or audio file using Whisper AI.',
  uploadTitle: 'Drop an audio file here or click to browse',
  uploadHint: 'Or use live microphone transcription below.',
  actionLabel: 'Transcribe Audio',
  processingLabel: 'Transcribing…',
  downloadLabel: 'Download transcript',
  whatIsTitle: 'What is Speech to Text?',
  whatIsBody: 'Speech to Text converts spoken words into editable text using Whisper AI transcription.',
  howToTitle: 'How to use Speech to Text',
  howToSteps: [
    'Upload an audio file or click Start Listening with your microphone.',
    'Speak clearly or play your audio.',
    'Copy or download the transcript.',
  ],
  faqs: [
    ...baseFaq,
    {
      question: 'Which browsers support speech recognition?',
      answer: 'Upload an audio file or record with your microphone. Transcription runs on the server using Whisper AI (Groq).',
    },
  ],
})
