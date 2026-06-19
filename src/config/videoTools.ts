import { FileType, Mic, Scissors, Shrink, Video } from 'lucide-react'
import type { RelatedTool } from './tools'

export type VideoToolConfig = {
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

export const VIDEO_ACCEPT =
  'video/*,.mp4,.mov,.avi,.mkv,.webm,.m4v,.flv,.mpeg,.mpg,.3gp,.wmv'

const videoRelated: RelatedTool[] = [
  { name: 'Trim Video', description: 'Cut video to exact start and end points', icon: Scissors, href: '/tools/trim-video' },
  { name: 'Convert MP4', description: 'Convert videos to MP4 format', icon: FileType, href: '/tools/convert-mp4' },
  { name: 'Compress Video', description: 'Reduce video file size', icon: Shrink, href: '/tools/compress-video' },
  { name: 'Video to MP3', description: 'Extract audio from any video file', icon: Mic, href: '/tools/video-to-mp3' },
  { name: 'Merge Videos', description: 'Combine multiple videos into one', icon: Video, href: '/tools/merge-videos' },
  { name: 'Video to GIF', description: 'Convert video clips to animated GIFs', icon: Video, href: '/tools/video-to-gif' },
]

const baseFaq = [
  {
    question: 'Do my videos get uploaded to a server?',
    answer: 'No. All video tools run entirely in your browser using FFmpeg. Your files never leave your device.',
  },
  {
    question: 'Which video formats are supported?',
    answer: 'MP4, MOV, AVI, MKV, WebM, M4V, FLV, MPEG, MPG, 3GP, WMV, and most iPhone and Android recordings.',
  },
  {
    question: 'Is there a file size limit?',
    answer: 'Videos up to 100MB are supported. Larger files may fail due to browser memory limits.',
  },
]

function cfg(
  partial: Omit<VideoToolConfig, 'category' | 'popularTitle' | 'faqs' | 'relatedTools' | 'popularOptions'> & {
    faqs?: VideoToolConfig['faqs']
    relatedTools?: RelatedTool[]
    popularOptions?: VideoToolConfig['popularOptions']
  },
): VideoToolConfig {
  return {
    category: 'Video Tools',
    popularTitle: `Popular ${partial.breadcrumb} Options`,
    popularOptions: partial.popularOptions ?? [{ label: `${partial.breadcrumb} Online Free`, href: partial.path }],
    faqs: partial.faqs ?? baseFaq,
    relatedTools: partial.relatedTools ?? videoRelated,
    ...partial,
  }
}

export const trimVideoConfig = cfg({
  path: '/tools/trim-video',
  breadcrumb: 'Trim Video',
  title: 'Trim Video - Free & Instant',
  lead: 'Cut video to exact start and end points. Runs entirely in your browser.',
  uploadTitle: 'Drop your video here or click to browse',
  uploadHint: 'Set start and end times, then trim your clip.',
  actionLabel: 'Trim Video',
  processingLabel: 'Trimming…',
  downloadLabel: 'Download trimmed video',
  whatIsTitle: 'What is Trim Video?',
  whatIsBody: 'Trim Video lets you cut any section from a video file without uploading it to a server.',
  howToTitle: 'How to use Trim Video',
  howToSteps: ['Upload your video.', 'Set start and end times in seconds.', 'Click Trim Video and download your clip.'],
})

export const convertMp4Config = cfg({
  path: '/tools/convert-mp4',
  breadcrumb: 'Convert MP4',
  title: 'Convert MP4 - Free & Instant',
  lead: 'Convert any video to MP4 format. Runs entirely in your browser.',
  uploadTitle: 'Drop your video here or click to browse',
  actionLabel: 'Convert to MP4',
  processingLabel: 'Converting…',
  downloadLabel: 'Download MP4',
  whatIsTitle: 'What is Convert MP4?',
  whatIsBody: 'Convert MP4 transforms MOV, AVI, MKV, WebM, and other formats into widely compatible MP4 files.',
  howToTitle: 'How to use Convert MP4',
  howToSteps: ['Upload your video.', 'Click Convert to MP4.', 'Download the converted file.'],
})

export const compressVideoConfig = cfg({
  path: '/tools/compress-video',
  breadcrumb: 'Compress Video',
  title: 'Compress Video - Free & Instant',
  lead: 'Reduce video file size while keeping good quality. Runs in your browser.',
  uploadTitle: 'Drop your video here or click to browse',
  actionLabel: 'Compress Video',
  processingLabel: 'Compressing…',
  downloadLabel: 'Download compressed video',
  whatIsTitle: 'What is Compress Video?',
  whatIsBody: 'Compress Video reduces file size using efficient H.264 encoding with adjustable quality.',
  howToTitle: 'How to use Compress Video',
  howToSteps: ['Upload your video.', 'Choose compression level.', 'Download the smaller MP4 file.'],
})

export const videoToGifConfig = cfg({
  path: '/tools/video-to-gif',
  breadcrumb: 'Video to GIF',
  title: 'Video to GIF - Free & Instant',
  lead: 'Convert video clips to animated GIFs. Runs entirely in your browser.',
  uploadTitle: 'Drop your video here or click to browse',
  actionLabel: 'Convert to GIF',
  processingLabel: 'Converting…',
  downloadLabel: 'Download GIF',
  whatIsTitle: 'What is Video to GIF?',
  whatIsBody: 'Video to GIF turns a section of your video into an animated GIF you can share anywhere.',
  howToTitle: 'How to use Video to GIF',
  howToSteps: ['Upload your video.', 'Adjust FPS, width, and clip duration.', 'Download your GIF.'],
})

export const mergeVideosConfig = cfg({
  path: '/tools/merge-videos',
  breadcrumb: 'Merge Videos',
  title: 'Merge Videos - Free & Instant',
  lead: 'Combine multiple videos into one file. Runs entirely in your browser.',
  uploadTitle: 'Drop video files here or click to browse',
  uploadHint: 'Select multiple videos to merge in order.',
  actionLabel: 'Merge Videos',
  processingLabel: 'Merging…',
  downloadLabel: 'Download merged video',
  whatIsTitle: 'What is Merge Videos?',
  whatIsBody: 'Merge Videos joins multiple clips into a single MP4 file without server uploads.',
  howToTitle: 'How to use Merge Videos',
  howToSteps: ['Upload two or more videos.', 'Click Merge Videos.', 'Download the combined MP4.'],
})

export const resizeVideoConfig = cfg({
  path: '/tools/resize-video',
  breadcrumb: 'Resize Video',
  title: 'Resize Video - Free & Instant',
  lead: 'Change video resolution and dimensions. Runs entirely in your browser.',
  uploadTitle: 'Drop your video here or click to browse',
  actionLabel: 'Resize Video',
  processingLabel: 'Resizing…',
  downloadLabel: 'Download resized video',
  whatIsTitle: 'What is Resize Video?',
  whatIsBody: 'Resize Video changes the width and height of your video for social media, web, or storage.',
  howToTitle: 'How to use Resize Video',
  howToSteps: ['Upload your video.', 'Choose a target resolution.', 'Download the resized MP4.'],
})

export const rotateVideoConfig = cfg({
  path: '/tools/rotate-video',
  breadcrumb: 'Rotate Video',
  title: 'Rotate Video - Free & Instant',
  lead: 'Rotate video orientation by 90°, 180°, or 270°. Runs in your browser.',
  uploadTitle: 'Drop your video here or click to browse',
  actionLabel: 'Rotate Video',
  processingLabel: 'Rotating…',
  downloadLabel: 'Download rotated video',
  whatIsTitle: 'What is Rotate Video?',
  whatIsBody: 'Rotate Video fixes sideways or upside-down recordings from phones and cameras.',
  howToTitle: 'How to use Rotate Video',
  howToSteps: ['Upload your video.', 'Select rotation angle.', 'Download the rotated MP4.'],
})

export const muteVideoConfig = cfg({
  path: '/tools/mute-video',
  breadcrumb: 'Mute Video',
  title: 'Mute Video - Free & Instant',
  lead: 'Remove audio from any video file. Runs entirely in your browser.',
  uploadTitle: 'Drop your video here or click to browse',
  actionLabel: 'Mute Video',
  processingLabel: 'Removing audio…',
  downloadLabel: 'Download muted video',
  whatIsTitle: 'What is Mute Video?',
  whatIsBody: 'Mute Video strips the audio track while keeping the video intact.',
  howToTitle: 'How to use Mute Video',
  howToSteps: ['Upload your video.', 'Click Mute Video.', 'Download the silent MP4.'],
})

export const addSubtitlesConfig = cfg({
  path: '/tools/add-subtitles',
  breadcrumb: 'Add Subtitles',
  title: 'Add Subtitles - Free & Instant',
  lead: 'Burn SRT or VTT subtitles into your video. Runs entirely in your browser.',
  uploadTitle: 'Drop your video here or click to browse',
  uploadHint: 'Also upload an .srt or .vtt subtitle file below.',
  actionLabel: 'Add Subtitles',
  processingLabel: 'Adding subtitles…',
  downloadLabel: 'Download subtitled video',
  whatIsTitle: 'What is Add Subtitles?',
  whatIsBody: 'Add Subtitles embeds caption text permanently into your video from an SRT or VTT file.',
  howToTitle: 'How to use Add Subtitles',
  howToSteps: ['Upload your video and subtitle file.', 'Click Add Subtitles.', 'Download the captioned MP4.'],
})

export const screenRecorderConfig = cfg({
  path: '/tools/screen-recorder',
  breadcrumb: 'Screen Recorder',
  title: 'Screen Recorder - Free & Instant',
  lead: 'Record your screen directly in the browser. No uploads — recording stays on your device.',
  uploadTitle: '',
  actionLabel: 'Start Recording',
  processingLabel: 'Recording…',
  downloadLabel: 'Download recording',
  whatIsTitle: 'What is Screen Recorder?',
  whatIsBody: 'Screen Recorder captures your screen, a window, or a browser tab using your browser\'s built-in APIs.',
  howToTitle: 'How to use Screen Recorder',
  howToSteps: ['Click Start Recording and choose what to share.', 'Click Stop when finished.', 'Preview and download your recording.'],
})

export const webcamRecorderConfig = cfg({
  path: '/tools/webcam-recorder',
  breadcrumb: 'Webcam Recorder',
  title: 'Webcam Recorder - Free & Instant',
  lead: 'Record video from your webcam in the browser. Nothing is uploaded to a server.',
  uploadTitle: '',
  actionLabel: 'Start Recording',
  processingLabel: 'Recording…',
  downloadLabel: 'Download recording',
  whatIsTitle: 'What is Webcam Recorder?',
  whatIsBody: 'Webcam Recorder uses your camera and microphone to create a video file locally in your browser.',
  howToTitle: 'How to use Webcam Recorder',
  howToSteps: ['Click Start Recording and allow camera access.', 'Click Stop when finished.', 'Preview and download your video.'],
})
