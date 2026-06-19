import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Coffee,
  Download,
  Loader2,
  Pause,
  Play,
  RotateCw,
  Square,
} from 'lucide-react'
import type { EdgeVoice } from '../utils/edgeTtsBrowser'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatFileSize } from '../api/compress'
import { openDonatePage } from '../api/config'
import { generateSpeechApi, type TextToSpeechResult } from '../api/textToSpeech'
import { textToSpeechConfig, whyCrafvia } from '../config/tools'
import {
  countWords,
  detectLanguageFromText,
  filterVoices,
  getBestVoice,
  getDefaultVoice,
  LANGUAGE_OPTIONS,
  sortVoicesByPreference,
  type GenderFilter,
} from '../utils/speechVoices'
import {
  loadSpeechVoices,
  MAX_TEXT_LENGTH,
  type SpeechPitch,
  type SpeechSpeed,
} from '../utils/textToSpeech'
import { stopWebSpeech } from '../utils/webSpeech'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import './CompressImage.css'

const config = textToSpeechConfig

const SPEED_OPTIONS: { value: SpeechSpeed; label: string }[] = [
  { value: 0.5, label: '0.5x' },
  { value: 0.75, label: '0.75x' },
  { value: 1, label: '1x' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
  { value: 2, label: '2x' },
]

const PITCH_OPTIONS: { value: SpeechPitch; label: string }[] = [
  { value: 0.75, label: 'Low' },
  { value: 1, label: 'Normal' },
  { value: 1.25, label: 'High' },
]

const GENDER_OPTIONS: { value: GenderFilter; label: string }[] = [
  { value: 'all', label: 'All voices' },
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
]

export function TextToSpeechPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [text, setText] = useState('')
  const [allVoices, setAllVoices] = useState<EdgeVoice[]>([])
  const [isLoadingVoices, setIsLoadingVoices] = useState(true)
  const [language, setLanguage] = useState('en')
  const [languageAuto, setLanguageAuto] = useState(true)
  const [gender, setGender] = useState<GenderFilter>('all')
  const [selectedVoiceName, setSelectedVoiceName] = useState('')
  const [speed, setSpeed] = useState<SpeechSpeed>(1)
  const [pitch, setPitch] = useState<SpeechPitch>(1)
  const [volume, setVolume] = useState(100)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progressMessage, setProgressMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<TextToSpeechResult | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const filteredVoices = useMemo(
    () => sortVoicesByPreference(filterVoices(allVoices, language, gender), language),
    [allVoices, language, gender],
  )

  const selectedVoice = useMemo(
    () => filteredVoices.find((voice) => voice.ShortName === selectedVoiceName) ?? null,
    [filteredVoices, selectedVoiceName],
  )

  const characterCount = text.length
  const wordCount = countWords(text)

  const resetAudioUrl = (url: string | null) => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(url)
  }

  useEffect(() => {
    let cancelled = false

    void loadSpeechVoices()
      .then((voices) => {
        if (cancelled) return
        setAllVoices(voices)
        const defaultVoice = getDefaultVoice(voices)
        if (defaultVoice) {
          setSelectedVoiceName(defaultVoice.ShortName)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Unable to load voices. Check your connection and refresh the page.')
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingVoices(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const trimmed = text.trim()
    if (!languageAuto || trimmed.length < 2) return undefined

    const timer = window.setTimeout(() => {
      const detected = detectLanguageFromText(trimmed)
      if (detected && detected !== language) {
        setLanguage(detected)
      }
    }, 400)

    return () => window.clearTimeout(timer)
  }, [text, languageAuto, language])

  useEffect(() => {
    if (filteredVoices.length === 0) {
      setSelectedVoiceName('')
      return
    }

    const bestVoice = getBestVoice(allVoices, language, gender, selectedVoiceName)
    if (bestVoice && bestVoice.ShortName !== selectedVoiceName) {
      setSelectedVoiceName(bestVoice.ShortName)
    }
  }, [filteredVoices, allVoices, language, gender, selectedVoiceName])

  useEffect(() => {
    const currentUrl = audioUrl
    return () => {
      if (currentUrl) URL.revokeObjectURL(currentUrl)
      stopWebSpeech()
    }
  }, [audioUrl])

  const handleGenerate = async () => {
    const trimmed = text.trim()
    if (!trimmed) {
      setError('Please enter some text to convert.')
      return
    }

    if (trimmed.length > MAX_TEXT_LENGTH) {
      setError(`Text exceeds ${MAX_TEXT_LENGTH.toLocaleString()} character limit.`)
      return
    }

    if (!selectedVoice) {
      setError('Please select a voice for the chosen language.')
      return
    }

    setIsProcessing(true)
    setError(null)
    setResult(null)
    resetAudioUrl(null)
    setIsPlaying(false)
    stopWebSpeech()

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    try {
      const speechResult = await generateSpeechApi(
        trimmed,
        selectedVoice,
        speed,
        pitch,
        volume / 100,
        {
          allVoices,
          languageCode: language,
          gender,
          languageAuto,
          onStatus: setProgressMessage,
        },
      )

      if (speechResult.voiceUsed.ShortName !== selectedVoice.ShortName) {
        setSelectedVoiceName(speechResult.voiceUsed.ShortName)
      }

      const url = URL.createObjectURL(speechResult.blob)
      setResult(speechResult)
      setAudioUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsProcessing(false)
      setProgressMessage(null)
    }
  }

  const handleDownload = () => {
    if (!result) return
    const url = URL.createObjectURL(result.blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = result.filename
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handlePlay = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      if (audio.paused) {
        await audio.play()
      } else {
        audio.pause()
      }
    } catch {
      setError('Unable to play audio. Try generating again.')
    }
  }

  const handlePause = () => {
    audioRef.current?.pause()
  }

  const handleStop = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    setIsPlaying(false)
  }

  const handleReplay = async () => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    try {
      await audio.play()
    } catch {
      setError('Unable to replay audio.')
    }
  }

  const donateBar = (
    <div className="tool-donate-bar">
      <Coffee size={16} aria-hidden />
      <span>
        Enjoying this tool?{' '}
        <a
          href="#donate"
          onClick={(e) => {
            e.preventDefault()
            void openDonatePage()
          }}
        >
          Buy us a coffee!
        </a>
      </span>
    </div>
  )

  return (
    <div className="app tool-page">
      <Header />
      <main className="tool-main">
        <div className="tool-container">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={14} aria-hidden />
            <span>{config.category}</span>
            <ChevronRight size={14} aria-hidden />
            <span className="breadcrumb-current">{config.breadcrumb}</span>
          </nav>

          <header className="tool-header">
            <h1 className="tool-title">{config.title}</h1>
            <p className="tool-lead">{config.lead}</p>
          </header>

          <div className="upload-outer">
            <div className="tool-controls">
              <label className="tool-control-label" htmlFor="tts-text">
                Your text
              </label>
              <textarea
                id="tts-text"
                className="tool-textarea"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste your text here…"
                disabled={isProcessing}
                maxLength={MAX_TEXT_LENGTH}
              />
              <div className="tool-text-counts">
                <span>
                  {characterCount.toLocaleString()} characters · {wordCount.toLocaleString()} words
                </span>
                <span>
                  {characterCount.toLocaleString()} / {MAX_TEXT_LENGTH.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="tool-controls">
              <label className="tool-control-label" htmlFor="tts-language">
                Language
              </label>
              <select
                id="tts-language"
                className="tool-select"
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value)
                  setLanguageAuto(false)
                }}
                disabled={isProcessing || isLoadingVoices}
              >
                {LANGUAGE_OPTIONS.filter((option) => option.code !== 'all').map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="tool-controls">
              <label className="tool-control-label" htmlFor="tts-gender">
                Voice type
              </label>
              <select
                id="tts-gender"
                className="tool-select"
                value={gender}
                onChange={(e) => setGender(e.target.value as GenderFilter)}
                disabled={isProcessing || isLoadingVoices}
              >
                {GENDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="tool-controls">
              <label className="tool-control-label" htmlFor="tts-voice">
                Voice
              </label>
              <select
                id="tts-voice"
                className="tool-select"
                value={selectedVoiceName}
                onChange={(e) => setSelectedVoiceName(e.target.value)}
                disabled={isProcessing || isLoadingVoices || filteredVoices.length === 0}
              >
                {filteredVoices.length === 0 ? (
                  <option value="">No voices available</option>
                ) : (
                  filteredVoices.map((voice) => (
                    <option key={voice.ShortName} value={voice.ShortName}>
                      {voice.FriendlyName} ({voice.Locale})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="tool-controls">
              <label className="tool-control-label" htmlFor="tts-speed">
                Speaking speed
              </label>
              <select
                id="tts-speed"
                className="tool-select"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value) as SpeechSpeed)}
                disabled={isProcessing}
              >
                {SPEED_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="tool-controls">
              <label className="tool-control-label" htmlFor="tts-pitch">
                Pitch
              </label>
              <select
                id="tts-pitch"
                className="tool-select"
                value={pitch}
                onChange={(e) => setPitch(Number(e.target.value) as SpeechPitch)}
                disabled={isProcessing}
              >
                {PITCH_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="tool-controls">
              <label className="tool-control-label" htmlFor="tts-volume">
                Volume ({volume}%)
              </label>
              <input
                id="tts-volume"
                type="range"
                className="tool-slider"
                min={0}
                max={100}
                step={5}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                disabled={isProcessing}
              />
            </div>

            <button
              type="button"
              className="tool-compress-btn"
              onClick={handleGenerate}
              disabled={isProcessing || isLoadingVoices || filteredVoices.length === 0}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="spin" aria-hidden />
                  {progressMessage ?? config.processingLabel}
                </>
              ) : isLoadingVoices ? (
                <>
                  <Loader2 size={18} className="spin" aria-hidden />
                  Loading voices…
                </>
              ) : (
                config.actionLabel
              )}
            </button>

            {error && <p className="tool-error">{error}</p>}

            {result && (
              <div className="tool-result">
                <p className="tool-result-stats">
                  Speech generated successfully! {result.textLength.toLocaleString()} characters →{' '}
                  {formatFileSize(result.blob.size)} MP3
                </p>
                <button
                  type="button"
                  className="tool-download-btn"
                  onClick={handleDownload}
                >
                  <Download size={18} aria-hidden />
                  {config.downloadLabel}
                </button>
              </div>
            )}

            {audioUrl && (
              <div className="tool-controls">
                <label className="tool-control-label">Audio player</label>
                <div className="tool-audio-controls">
                  <div className="pdf-file-actions">
                    <button
                      type="button"
                      className="pdf-file-action-btn"
                      onClick={handlePlay}
                      title={isPlaying ? 'Pause' : 'Play'}
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause size={18} aria-hidden /> : <Play size={18} aria-hidden />}
                    </button>
                    <button
                      type="button"
                      className="pdf-file-action-btn"
                      onClick={handlePause}
                      title="Pause"
                      aria-label="Pause"
                    >
                      <Pause size={18} aria-hidden />
                    </button>
                    <button
                      type="button"
                      className="pdf-file-action-btn"
                      onClick={handleStop}
                      title="Stop"
                      aria-label="Stop"
                    >
                      <Square size={18} aria-hidden />
                    </button>
                    <button
                      type="button"
                      className="pdf-file-action-btn"
                      onClick={handleReplay}
                      title="Replay"
                      aria-label="Replay"
                    >
                      <RotateCw size={18} aria-hidden />
                    </button>
                  </div>
                </div>
                <div className="tool-preview">
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    controls
                    preload="metadata"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                  />
                </div>
              </div>
            )}
          </div>

          {donateBar}

          <article className="tool-content-block">
            <h2>{config.whatIsTitle}</h2>
            <p>{config.whatIsBody}</p>
          </article>

          <article className="tool-content-block">
            <h2>{config.howToTitle}</h2>
            <ol className="tool-steps">
              {config.howToSteps.map((step, i) => (
                <li key={step}>
                  <span className="step-num">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </article>

          <article className="tool-content-block">
            <h2>Why Crafvia?</h2>
            <ul className="tool-checklist">
              {whyCrafvia.map((item) => (
                <li key={item}>
                  <Check size={18} strokeWidth={2.5} aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <section className="tool-content-block tool-faq-block">
            <h2>FAQ</h2>
            <ul className="tool-faq-list">
              {config.faqs.map((faq, index) => {
                const isOpen = openFaq === index
                return (
                  <li key={faq.question}>
                    <button
                      type="button"
                      className={`tool-faq-item ${isOpen ? 'tool-faq-item-open' : ''}`}
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      aria-expanded={isOpen}
                    >
                      <span>{faq.question}</span>
                      <ChevronDown size={20} aria-hidden />
                    </button>
                    {isOpen && (
                      <div className="tool-faq-answer">{faq.answer}</div>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>

          <section className="tool-content-block">
            <h2>{config.popularTitle}</h2>
            <ul className="option-pills">
              {config.popularOptions.map((option) => (
                <li key={option.label}>
                  {option.href ? (
                    <Link to={option.href} className="option-pill">
                      {option.label}
                      <ArrowRight size={16} aria-hidden />
                    </Link>
                  ) : (
                    <a href="#" className="option-pill">
                      {option.label}
                      <ArrowRight size={16} aria-hidden />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="tool-content-block related-tools-section">
            <h2>Related Tools</h2>
            <ul className="related-tools-grid related-tools-grid-3">
              {config.relatedTools.map((tool) => {
                const Icon = tool.icon
                const isInternal = tool.href.startsWith('/')
                return (
                  <li key={tool.name}>
                    {isInternal ? (
                      <Link to={tool.href} className="related-tool-card">
                        <span className="related-tool-icon">
                          <Icon size={20} strokeWidth={2} aria-hidden />
                        </span>
                        <span className="related-tool-text">
                          <span className="related-tool-name">{tool.name}</span>
                          <span className="related-tool-desc">
                            {tool.description}
                          </span>
                        </span>
                        <ArrowRight
                          className="related-tool-arrow"
                          size={18}
                          aria-hidden
                        />
                      </Link>
                    ) : (
                      <a href={tool.href} className="related-tool-card">
                        <span className="related-tool-icon">
                          <Icon size={20} strokeWidth={2} aria-hidden />
                        </span>
                        <span className="related-tool-text">
                          <span className="related-tool-name">{tool.name}</span>
                          <span className="related-tool-desc">
                            {tool.description}
                          </span>
                        </span>
                        <ArrowRight
                          className="related-tool-arrow"
                          size={18}
                          aria-hidden
                        />
                      </a>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
