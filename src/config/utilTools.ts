import { Clock, Dices, FileText, Hash, Palette, Timer } from 'lucide-react'
import type { RelatedTool } from './tools'

export type UtilToolConfig = {
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

const utilRelated: RelatedTool[] = [
  { name: 'Stopwatch', description: 'Precise timing', icon: Timer, href: '/tools/stopwatch' },
  { name: 'Countdown Timer', description: 'Set a countdown', icon: Clock, href: '/tools/countdown-timer' },
  { name: 'Random Number', description: 'Numbers in a range', icon: Dices, href: '/tools/random-number' },
  { name: 'Online Notepad', description: 'Quick notes', icon: FileText, href: '/tools/notepad' },
  { name: 'File Hash Checker', description: 'Verify checksums', icon: Hash, href: '/tools/file-hash' },
  { name: 'Color Picker', description: 'Pick from images', icon: Palette, href: '/tools/color-picker-tool' },
]

const baseFaq = [
  {
    question: 'Is my data sent to a server?',
    answer: 'Utility tools run entirely in your browser. Notes and clipboard snippets are stored locally on your device.',
  },
  {
    question: 'Do timers work in the background?',
    answer: 'Timers keep running while the tab is open. Browsers may throttle background tabs, so keep the tab active for best accuracy.',
  },
]

function cfg(
  partial: Omit<UtilToolConfig, 'category' | 'popularTitle' | 'faqs' | 'relatedTools' | 'popularOptions'> & {
    faqs?: UtilToolConfig['faqs']
    relatedTools?: RelatedTool[]
    popularOptions?: UtilToolConfig['popularOptions']
  },
): UtilToolConfig {
  return {
    category: 'Utilities',
    popularTitle: `Popular ${partial.breadcrumb} Options`,
    popularOptions: partial.popularOptions ?? [{ label: `${partial.breadcrumb} Online Free`, href: partial.path }],
    faqs: partial.faqs ?? baseFaq,
    relatedTools: partial.relatedTools ?? utilRelated,
    ...partial,
  }
}

export const stopwatchConfig = cfg({
  path: '/tools/stopwatch',
  breadcrumb: 'Stopwatch',
  title: 'Stopwatch',
  lead: 'Precise stopwatch with lap times. Runs entirely in your browser.',
  whatIsTitle: 'What is Stopwatch?',
  whatIsBody: 'Stopwatch measures elapsed time with centisecond precision and records lap splits.',
  howToTitle: 'How to use Stopwatch',
  howToSteps: ['Press Start to begin.', 'Tap Lap to record splits.', 'Press Stop, then Reset to clear.'],
})

export const countdownTimerConfig = cfg({
  path: '/tools/countdown-timer',
  breadcrumb: 'Countdown Timer',
  title: 'Countdown Timer',
  lead: 'Set a countdown in hours, minutes, and seconds with an alert when time is up.',
  whatIsTitle: 'What is Countdown Timer?',
  whatIsBody: 'Countdown Timer counts down to zero and plays a short beep when finished.',
  howToTitle: 'How to use Countdown Timer',
  howToSteps: ['Set hours, minutes, and seconds.', 'Press Start.', 'Pause or reset anytime.'],
})

export const pomodoroTimerConfig = cfg({
  path: '/tools/pomodoro-timer',
  breadcrumb: 'Pomodoro Timer',
  title: 'Pomodoro Timer',
  lead: 'Classic Pomodoro workflow: focused work sessions with short and long breaks.',
  whatIsTitle: 'What is Pomodoro Timer?',
  whatIsBody: 'Pomodoro Timer alternates work and break intervals to boost productivity.',
  howToTitle: 'How to use Pomodoro Timer',
  howToSteps: ['Start a work session.', 'Take a short break when it ends.', 'After four sessions, take a long break.'],
})

export const randomNumberConfig = cfg({
  path: '/tools/random-number',
  breadcrumb: 'Random Number',
  title: 'Random Number Generator',
  lead: 'Generate cryptographically random integers within any range.',
  whatIsTitle: 'What is Random Number Generator?',
  whatIsBody: 'Random Number Generator uses crypto.getRandomValues for unbiased random integers.',
  howToTitle: 'How to generate random numbers',
  howToSteps: ['Set min and max values.', 'Choose how many numbers to generate.', 'Click Generate.'],
})

export const diceRollerConfig = cfg({
  path: '/tools/dice-roller',
  breadcrumb: 'Dice Roller',
  title: 'Dice Roller',
  lead: 'Roll virtual dice with custom sides and multiple dice at once.',
  whatIsTitle: 'What is Dice Roller?',
  whatIsBody: 'Dice Roller simulates fair dice rolls for games and decisions.',
  howToTitle: 'How to roll dice',
  howToSteps: ['Choose number of sides (default 6).', 'Select how many dice to roll.', 'Click Roll.'],
})

export const coinFlipConfig = cfg({
  path: '/tools/coin-flip',
  breadcrumb: 'Coin Flip',
  title: 'Coin Flip',
  lead: 'Flip a virtual coin for a fair Heads or Tails result.',
  whatIsTitle: 'What is Coin Flip?',
  whatIsBody: 'Coin Flip gives a random Heads or Tails outcome using secure randomness.',
  howToTitle: 'How to flip a coin',
  howToSteps: ['Click Flip coin.', 'View the result instantly.', 'Flip again anytime.'],
})

export const decisionMakerConfig = cfg({
  path: '/tools/decision-maker',
  breadcrumb: 'Decision Maker',
  title: 'Decision Maker',
  lead: 'Enter options and let the tool pick one at random.',
  whatIsTitle: 'What is Decision Maker?',
  whatIsBody: 'Decision Maker randomly selects from your list of choices.',
  howToTitle: 'How to make a decision',
  howToSteps: ['Enter one option per line.', 'Click Decide.', 'Use the picked result.'],
})

export const notepadConfig = cfg({
  path: '/tools/notepad',
  breadcrumb: 'Online Notepad',
  title: 'Online Notepad',
  lead: 'Quick notes saved automatically in your browser.',
  whatIsTitle: 'What is Online Notepad?',
  whatIsBody: 'Online Notepad auto-saves text to localStorage so your notes persist between visits.',
  howToTitle: 'How to use Online Notepad',
  howToSteps: ['Start typing.', 'Notes save automatically.', 'Download or clear when done.'],
})

export const clipboardManagerConfig = cfg({
  path: '/tools/clipboard-manager',
  breadcrumb: 'Clipboard Manager',
  title: 'Clipboard Manager',
  lead: 'Save and reuse text snippets locally in your browser.',
  whatIsTitle: 'What is Clipboard Manager?',
  whatIsBody: 'Clipboard Manager stores snippets on your device for quick copy and reuse.',
  howToTitle: 'How to manage snippets',
  howToSteps: ['Add a label and text snippet.', 'Click Copy on any saved snippet.', 'Delete snippets you no longer need.'],
})

export const fileHashConfig = cfg({
  path: '/tools/file-hash',
  breadcrumb: 'File Hash Checker',
  title: 'File Hash Checker',
  lead: 'Compute MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes for any file.',
  whatIsTitle: 'What is File Hash Checker?',
  whatIsBody: 'File Hash Checker computes checksums locally to verify file integrity.',
  howToTitle: 'How to check a file hash',
  howToSteps: ['Upload a file.', 'Select hash algorithm.', 'Copy the computed hash.'],
})

export const exifViewerConfig = cfg({
  path: '/tools/exif-viewer',
  breadcrumb: 'EXIF Viewer',
  title: 'EXIF Viewer',
  lead: 'View image metadata and EXIF data from photos.',
  whatIsTitle: 'What is EXIF Viewer?',
  whatIsBody: 'EXIF Viewer reads JPEG EXIF blocks and image dimensions without uploading files.',
  howToTitle: 'How to view EXIF data',
  howToSteps: ['Upload a JPEG or image file.', 'View parsed metadata.', 'Copy the report.'],
})

export const colorPickerToolConfig = cfg({
  path: '/tools/color-picker-tool',
  breadcrumb: 'Color Picker',
  title: 'Color Picker',
  lead: 'Pick colors from an uploaded image or enter HEX values.',
  whatIsTitle: 'What is Color Picker?',
  whatIsBody: 'Color Picker reads pixel colors from images and converts between HEX, RGB, and HSL.',
  howToTitle: 'How to pick a color',
  howToSteps: ['Upload an image or use the color input.', 'Click the image to sample a pixel.', 'Copy HEX, RGB, or HSL values.'],
})

export const screenColorConfig = cfg({
  path: '/tools/screen-color',
  breadcrumb: 'Screen Color Picker',
  title: 'Screen Color Picker',
  lead: 'Capture your screen and pick colors from anywhere on screen.',
  whatIsTitle: 'What is Screen Color Picker?',
  whatIsBody: 'Screen Color Picker uses screen capture to sample colors from your display.',
  howToTitle: 'How to pick screen colors',
  howToSteps: ['Click Capture screen and share a window or screen.', 'Click the capture to sample a color.', 'Copy the color values.'],
})

export const pixelRulerConfig = cfg({
  path: '/tools/pixel-ruler',
  breadcrumb: 'Pixel Ruler',
  title: 'Pixel Ruler',
  lead: 'Measure pixel distances on an uploaded image or screen capture.',
  whatIsTitle: 'What is Pixel Ruler?',
  whatIsBody: 'Pixel Ruler measures straight-line distances in pixels between two points.',
  howToTitle: 'How to measure pixels',
  howToSteps: ['Upload an image or capture your screen.', 'Click start and end points.', 'Read the pixel distance.'],
})

export const bulkRenameConfig = cfg({
  path: '/tools/bulk-rename',
  breadcrumb: 'Bulk File Rename',
  title: 'Bulk File Rename',
  lead: 'Rename multiple files with patterns and download as a ZIP archive.',
  whatIsTitle: 'What is Bulk File Rename?',
  whatIsBody: 'Bulk File Rename previews new filenames using {name}, {ext}, and {index} tokens, then packs renamed files into a ZIP.',
  howToTitle: 'How to bulk rename files',
  howToSteps: [
    'Select multiple files.',
    'Enter a pattern like photo-{index}.',
    'Preview new names and download the ZIP.',
  ],
})
