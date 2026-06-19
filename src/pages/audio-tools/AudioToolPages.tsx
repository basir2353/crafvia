import { useEffect, useRef, useState } from 'react'
import { formatFileSize } from '../../api/compress'
import { AudioToolShell } from '../../components/AudioToolShell'
import {
  AUDIO_ACCEPT,
  changeSpeedConfig,
  convertMp3Config,
  fadeAudioConfig,
  mergeAudioConfig,
  normalizeAudioConfig,
  removeNoiseConfig,
  reverseAudioConfig,
  speechToTextConfig,
  trimAudioConfig,
} from '../../config/audioTools'
import {
  changeAudioSpeed,
  convertAudioToMp3,
  fadeAudioFile,
  mergeAudioFiles,
  normalizeAudioFile,
  removeNoiseFromAudio,
  reverseAudioFile,
  trimAudioFile,
  type AudioProcessResult,
  type Mp3Bitrate,
} from '../../utils/audioProcess'
import {
  getAudioMetadata,
  isSupportedAudioFile,
  type AudioMetadata,
} from '../../utils/audioInfo'
import { transcribeAudioFile } from '../../api/speechToText'
import { MicrophoneRecorder, isMicrophoneSupported } from '../../utils/microphoneRecord'

const MAX_FILE_BYTES = 50 * 1024 * 1024
const MAX_MERGE_TOTAL_BYTES = 80 * 1024 * 1024

const BITRATE_OPTIONS: Mp3Bitrate[] = [64, 128, 192, 256, 320]

type ResultState = AudioProcessResult & { stats: string }

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function resultStats(result: AudioProcessResult, extra?: string): string {
  const prefix = extra ? `${extra} ` : ''
  return `${prefix}${formatFileSize(result.originalSize)} → ${formatFileSize(result.outputSize)}`
}

function useSingleAudioUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState<AudioMetadata | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isPreparingPreview, setIsPreparingPreview] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetPreview = (url: string | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(url)
  }

  const handleFileChange = (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return

    if (!isSupportedAudioFile(file)) {
      setError('Unsupported file format.')
      setSelectedFile(null)
      setMetadata(null)
      resetPreview(null)
      return
    }

    if (file.size > MAX_FILE_BYTES) {
      setError('File exceeds 50MB limit.')
      setSelectedFile(null)
      setMetadata(null)
      resetPreview(null)
      return
    }

    setSelectedFile(file)
    setError(null)
    setIsPreparingPreview(true)
    resetPreview(URL.createObjectURL(file))

    void getAudioMetadata(file)
      .then(setMetadata)
      .catch(() =>
        setMetadata({ duration: Number.NaN, canPreview: false }),
      )
      .finally(() => setIsPreparingPreview(false))
  }

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    },
    [previewUrl],
  )

  return {
    selectedFile,
    metadata,
    previewUrl,
    isPreparingPreview,
    error,
    setError,
    handleFileChange,
    resetPreview,
  }
}

function useAudioProcessor(
  processor: (
    file: File,
    callbacks: { onStatus?: (m: string) => void; onProgress?: (m: string) => void },
  ) => Promise<AudioProcessResult>,
) {
  const upload = useSingleAudioUpload()
  const [isProcessing, setIsProcessing] = useState(false)
  const [progressMessage, setProgressMessage] = useState<string | null>(null)
  const [result, setResult] = useState<ResultState | null>(null)
  const [resultPreviewUrl, setResultPreviewUrl] = useState<string | null>(null)

  const resetResultPreview = (url: string | null) => {
    if (resultPreviewUrl) URL.revokeObjectURL(resultPreviewUrl)
    setResultPreviewUrl(url)
  }

  const run = async (extra?: string) => {
    if (!upload.selectedFile) return
    setIsProcessing(true)
    upload.setError(null)
    setResult(null)
    resetResultPreview(null)
    setProgressMessage(null)

    try {
      const output = await processor(upload.selectedFile, {
        onStatus: setProgressMessage,
        onProgress: setProgressMessage,
      })
      setResult({ ...output, stats: resultStats(output, extra) })
      if (output.blob.type.startsWith('audio/')) {
        resetResultPreview(URL.createObjectURL(output.blob))
      }
    } catch (err) {
      upload.setError(err instanceof Error ? err.message : 'Processing failed.')
    } finally {
      setIsProcessing(false)
      setProgressMessage(null)
    }
  }

  useEffect(
    () => () => {
      if (resultPreviewUrl) URL.revokeObjectURL(resultPreviewUrl)
    },
    [resultPreviewUrl],
  )

  return {
    upload,
    isProcessing,
    progressMessage,
    result,
    resultPreviewUrl,
    run,
  }
}

export function TrimAudioPage() {
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(10)
  const { upload, isProcessing, progressMessage, result, resultPreviewUrl, run } =
    useAudioProcessor((file, callbacks) =>
      trimAudioFile(file, startTime, endTime, upload.metadata ?? undefined, callbacks),
    )

  useEffect(() => {
    if (upload.metadata?.duration && Number.isFinite(upload.metadata.duration) && upload.metadata.duration > 0) {
      setEndTime(Math.max(1, Math.ceil(upload.metadata.duration)))
      setStartTime(0)
    }
  }, [upload.metadata])

  const maxDuration =
    upload.metadata?.duration && Number.isFinite(upload.metadata.duration)
      ? Math.floor(upload.metadata.duration)
      : 300

  return (
    <AudioToolShell
      config={trimAudioConfig}
      accept={AUDIO_ACCEPT}
      selectedFile={upload.selectedFile}
      onFileChange={upload.handleFileChange}
      metadata={upload.metadata}
      isProcessing={isProcessing}
      isPreparingPreview={upload.isPreparingPreview}
      progressMessage={progressMessage}
      error={upload.error}
      previewUrl={upload.previewUrl}
      resultPreviewUrl={resultPreviewUrl}
      resultStats={result?.stats ?? null}
      onDownload={result ? () => downloadBlob(result.blob, result.filename) : undefined}
      onAction={() => void run('Trimmed successfully!')}
      actionDisabled={!upload.selectedFile || endTime <= startTime}
    >
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="audio-trim-start">
          Start (seconds): {startTime}
        </label>
        <input
          id="audio-trim-start"
          type="range"
          min={0}
          max={Math.max(endTime - 1, 0)}
          value={startTime}
          onChange={(e) => setStartTime(Number(e.target.value))}
          className="tool-slider"
          disabled={!upload.selectedFile || isProcessing}
        />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="audio-trim-end">
          End (seconds): {endTime}
        </label>
        <input
          id="audio-trim-end"
          type="range"
          min={startTime + 1}
          max={maxDuration}
          value={endTime}
          onChange={(e) => setEndTime(Number(e.target.value))}
          className="tool-slider"
          disabled={!upload.selectedFile || isProcessing}
        />
      </div>
    </AudioToolShell>
  )
}

export function ConvertMp3Page() {
  const [bitrate, setBitrate] = useState<Mp3Bitrate>(192)
  const { upload, isProcessing, progressMessage, result, resultPreviewUrl, run } =
    useAudioProcessor((file, callbacks) =>
      convertAudioToMp3(file, bitrate, upload.metadata ?? undefined, callbacks),
    )

  const handleRun = async () => {
    if (!upload.selectedFile) return
    await run(`Converted successfully at ${bitrate} kbps!`)
  }

  return (
    <AudioToolShell
      config={convertMp3Config}
      accept={AUDIO_ACCEPT}
      selectedFile={upload.selectedFile}
      onFileChange={upload.handleFileChange}
      metadata={upload.metadata}
      isProcessing={isProcessing}
      isPreparingPreview={upload.isPreparingPreview}
      progressMessage={progressMessage}
      error={upload.error}
      previewUrl={upload.previewUrl}
      resultPreviewUrl={resultPreviewUrl}
      resultStats={result?.stats ?? null}
      onDownload={result ? () => downloadBlob(result.blob, result.filename) : undefined}
      onAction={() => void handleRun()}
      actionDisabled={!upload.selectedFile}
    >
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="mp3-bitrate">
          Audio quality
        </label>
        <select
          id="mp3-bitrate"
          className="tool-select"
          value={bitrate}
          onChange={(e) => setBitrate(Number(e.target.value) as Mp3Bitrate)}
          disabled={!upload.selectedFile || isProcessing}
        >
          {BITRATE_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {value} kbps
            </option>
          ))}
        </select>
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="mp3-output-format">
          Output format
        </label>
        <select id="mp3-output-format" className="tool-select" value="mp3" disabled>
          <option value="mp3">MP3</option>
        </select>
      </div>
    </AudioToolShell>
  )
}

export function NormalizeAudioPage() {
  const { upload, isProcessing, progressMessage, result, resultPreviewUrl, run } =
    useAudioProcessor((file, callbacks) =>
      normalizeAudioFile(file, upload.metadata ?? undefined, callbacks),
    )

  return (
    <AudioToolShell
      config={normalizeAudioConfig}
      accept={AUDIO_ACCEPT}
      selectedFile={upload.selectedFile}
      onFileChange={upload.handleFileChange}
      metadata={upload.metadata}
      isProcessing={isProcessing}
      isPreparingPreview={upload.isPreparingPreview}
      progressMessage={progressMessage}
      error={upload.error}
      previewUrl={upload.previewUrl}
      resultPreviewUrl={resultPreviewUrl}
      resultStats={result?.stats ?? null}
      onDownload={result ? () => downloadBlob(result.blob, result.filename) : undefined}
      onAction={() => void run('Normalized successfully!')}
      actionDisabled={!upload.selectedFile}
    />
  )
}

export function MergeAudioPage() {
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progressMessage, setProgressMessage] = useState<string | null>(null)
  const [result, setResult] = useState<ResultState | null>(null)
  const [resultPreviewUrl, setResultPreviewUrl] = useState<string | null>(null)

  const handleFileChange = (fileList: FileList | null) => {
    if (!fileList) return
    const incoming = Array.from(fileList)
    for (const file of incoming) {
      if (!isSupportedAudioFile(file)) {
        setError('Unsupported file format detected.')
        return
      }
      if (file.size > MAX_FILE_BYTES) {
        setError('One or more files exceed 50MB limit.')
        return
      }
    }
    setFiles((current) => {
      const combined = [...current, ...incoming]
      const totalSize = combined.reduce((sum, file) => sum + file.size, 0)
      if (totalSize > MAX_MERGE_TOTAL_BYTES) {
        setError('Combined file size exceeds 80MB. Use smaller or shorter audio files.')
        return current
      }
      return combined
    })
    setError(null)
    setResult(null)
  }

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Add at least two audio files to merge.')
      return
    }
    setIsProcessing(true)
    setError(null)
    setResult(null)
    if (resultPreviewUrl) URL.revokeObjectURL(resultPreviewUrl)
    setResultPreviewUrl(null)

    try {
      const output = await mergeAudioFiles(files, {
        onStatus: setProgressMessage,
        onProgress: setProgressMessage,
      })
      setResult({ ...output, stats: resultStats(output, 'Merged successfully!') })
      setResultPreviewUrl(URL.createObjectURL(output.blob))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Merge failed.')
    } finally {
      setIsProcessing(false)
      setProgressMessage(null)
    }
  }

  useEffect(
    () => () => {
      if (resultPreviewUrl) URL.revokeObjectURL(resultPreviewUrl)
    },
    [resultPreviewUrl],
  )

  return (
    <AudioToolShell
      config={mergeAudioConfig}
      accept={AUDIO_ACCEPT}
      multiple
      selectedFile={null}
      selectedFiles={files}
      onFileChange={handleFileChange}
      isProcessing={isProcessing}
      progressMessage={progressMessage}
      error={error}
      resultPreviewUrl={resultPreviewUrl}
      resultStats={result?.stats ?? null}
      onDownload={result ? () => downloadBlob(result.blob, result.filename) : undefined}
      onAction={handleMerge}
      actionDisabled={files.length < 2}
    />
  )
}

export function ChangeSpeedPage() {
  const [speed, setSpeed] = useState(1)
  const { upload, isProcessing, progressMessage, result, resultPreviewUrl, run } =
    useAudioProcessor((file, callbacks) =>
      changeAudioSpeed(file, speed, upload.metadata ?? undefined, callbacks),
    )

  return (
    <AudioToolShell
      config={changeSpeedConfig}
      accept={AUDIO_ACCEPT}
      selectedFile={upload.selectedFile}
      onFileChange={upload.handleFileChange}
      metadata={upload.metadata}
      isProcessing={isProcessing}
      isPreparingPreview={upload.isPreparingPreview}
      progressMessage={progressMessage}
      error={upload.error}
      previewUrl={upload.previewUrl}
      resultPreviewUrl={resultPreviewUrl}
      resultStats={result?.stats ?? null}
      onDownload={result ? () => downloadBlob(result.blob, result.filename) : undefined}
      onAction={() => void run(`Speed changed to ${speed}x!`)}
      actionDisabled={!upload.selectedFile}
    >
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="audio-speed">
          Speed: {speed}x
        </label>
        <input
          id="audio-speed"
          type="range"
          min={0.25}
          max={3}
          step={0.25}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="tool-slider"
          disabled={!upload.selectedFile || isProcessing}
        />
      </div>
    </AudioToolShell>
  )
}

export function FadeAudioPage() {
  const [fadeIn, setFadeIn] = useState(0)
  const [fadeOut, setFadeOut] = useState(2)
  const { upload, isProcessing, progressMessage, result, resultPreviewUrl, run } =
    useAudioProcessor((file, callbacks) =>
      fadeAudioFile(file, fadeIn, fadeOut, upload.metadata ?? undefined, callbacks),
    )

  const maxFade =
    upload.metadata?.duration && Number.isFinite(upload.metadata.duration)
      ? Math.min(30, Math.floor(upload.metadata.duration))
      : 30

  useEffect(() => {
    if (upload.metadata?.duration && Number.isFinite(upload.metadata.duration)) {
      const max = Math.min(30, Math.floor(upload.metadata.duration))
      setFadeOut(Math.min(2, max))
      setFadeIn(0)
    }
  }, [upload.metadata])

  return (
    <AudioToolShell
      config={fadeAudioConfig}
      accept={AUDIO_ACCEPT}
      selectedFile={upload.selectedFile}
      onFileChange={upload.handleFileChange}
      metadata={upload.metadata}
      isProcessing={isProcessing}
      isPreparingPreview={upload.isPreparingPreview}
      progressMessage={progressMessage}
      error={upload.error}
      previewUrl={upload.previewUrl}
      resultPreviewUrl={resultPreviewUrl}
      resultStats={result?.stats ?? null}
      onDownload={result ? () => downloadBlob(result.blob, result.filename) : undefined}
      onAction={() => void run('Fade applied successfully!')}
      actionDisabled={!upload.selectedFile}
    >
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="fade-in">
          Fade in (seconds): {fadeIn}
        </label>
        <input
          id="fade-in"
          type="range"
          min={0}
          max={maxFade}
          value={fadeIn}
          onChange={(e) => setFadeIn(Number(e.target.value))}
          className="tool-slider"
          disabled={!upload.selectedFile || isProcessing}
        />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="fade-out">
          Fade out (seconds): {fadeOut}
        </label>
        <input
          id="fade-out"
          type="range"
          min={0}
          max={maxFade}
          value={fadeOut}
          onChange={(e) => setFadeOut(Number(e.target.value))}
          className="tool-slider"
          disabled={!upload.selectedFile || isProcessing}
        />
      </div>
    </AudioToolShell>
  )
}

export function ReverseAudioPage() {
  const { upload, isProcessing, progressMessage, result, resultPreviewUrl, run } =
    useAudioProcessor((file, callbacks) =>
      reverseAudioFile(file, upload.metadata ?? undefined, callbacks),
    )

  return (
    <AudioToolShell
      config={reverseAudioConfig}
      accept={AUDIO_ACCEPT}
      selectedFile={upload.selectedFile}
      onFileChange={upload.handleFileChange}
      metadata={upload.metadata}
      isProcessing={isProcessing}
      isPreparingPreview={upload.isPreparingPreview}
      progressMessage={progressMessage}
      error={upload.error}
      previewUrl={upload.previewUrl}
      resultPreviewUrl={resultPreviewUrl}
      resultStats={result?.stats ?? null}
      onDownload={result ? () => downloadBlob(result.blob, result.filename) : undefined}
      onAction={() => void run('Reversed successfully!')}
      actionDisabled={!upload.selectedFile}
    />
  )
}

export function RemoveNoisePage() {
  const { upload, isProcessing, progressMessage, result, resultPreviewUrl, run } =
    useAudioProcessor((file, callbacks) =>
      removeNoiseFromAudio(file, upload.metadata ?? undefined, callbacks),
    )

  return (
    <AudioToolShell
      config={removeNoiseConfig}
      accept={AUDIO_ACCEPT}
      selectedFile={upload.selectedFile}
      onFileChange={upload.handleFileChange}
      metadata={upload.metadata}
      isProcessing={isProcessing}
      isPreparingPreview={upload.isPreparingPreview}
      progressMessage={progressMessage}
      error={upload.error}
      previewUrl={upload.previewUrl}
      resultPreviewUrl={resultPreviewUrl}
      resultStats={result?.stats ?? null}
      onDownload={result ? () => downloadBlob(result.blob, result.filename) : undefined}
      onAction={() => void run('Noise removed successfully!')}
      actionDisabled={!upload.selectedFile}
    />
  )
}

export function SpeechToTextPage() {
  const upload = useSingleAudioUpload()
  const [transcript, setTranscript] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [progressMessage, setProgressMessage] = useState<string | null>(null)
  const recorderRef = useRef<MicrophoneRecorder | null>(null)

  const microphoneSupported = isMicrophoneSupported()

  useEffect(
    () => () => {
      recorderRef.current?.cancel()
    },
    [],
  )

  const handleTranscribe = async () => {
    if (!upload.selectedFile) return
    setIsTranscribing(true)
    upload.setError(null)
    setProgressMessage('Transcribing audio on the server…')

    try {
      const text = await transcribeAudioFile(upload.selectedFile, upload.selectedFile.name, 'en')
      setTranscript(text)
    } catch (err) {
      upload.setError(err instanceof Error ? err.message : 'Transcription failed.')
    } finally {
      setIsTranscribing(false)
      setProgressMessage(null)
    }
  }

  const handleStartListening = async () => {
    if (!microphoneSupported) {
      upload.setError('Microphone recording is not supported in this browser.')
      return
    }

    upload.setError(null)
    recorderRef.current?.cancel()
    const recorder = new MicrophoneRecorder()
    recorderRef.current = recorder

    try {
      await recorder.start()
      setIsListening(true)
      setTranscript('')
      setProgressMessage('Recording… speak clearly, then click Stop Listening.')
    } catch (err) {
      upload.setError(
        err instanceof Error
          ? err.message
          : 'Could not access microphone. Allow microphone permission and try again.',
      )
      setIsListening(false)
      setProgressMessage(null)
    }
  }

  const handleStopListening = async () => {
    const recorder = recorderRef.current
    if (!recorder) {
      setIsListening(false)
      return
    }

    setIsListening(false)
    setIsTranscribing(true)
    setProgressMessage('Transcribing your recording…')

    try {
      const { blob, filename } = await recorder.stop()
      recorderRef.current = null
      const text = await transcribeAudioFile(blob, filename, 'en')
      setTranscript(text)
    } catch (err) {
      upload.setError(err instanceof Error ? err.message : 'Transcription failed.')
    } finally {
      setIsTranscribing(false)
      setProgressMessage(null)
    }
  }

  const handleDownloadTranscript = () => {
    if (!transcript.trim()) return
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' })
    downloadBlob(blob, 'transcript.txt')
  }

  const hasTranscript = transcript.trim().length > 0

  return (
    <AudioToolShell
      config={speechToTextConfig}
      accept={AUDIO_ACCEPT}
      selectedFile={upload.selectedFile}
      onFileChange={upload.handleFileChange}
      metadata={upload.metadata}
      isProcessing={isTranscribing}
      isPreparingPreview={upload.isPreparingPreview}
      progressMessage={progressMessage}
      error={upload.error}
      previewUrl={upload.previewUrl}
      resultStats={hasTranscript ? 'Transcription ready.' : null}
      onDownload={hasTranscript ? handleDownloadTranscript : undefined}
      onAction={() => void handleTranscribe()}
      actionDisabled={!upload.selectedFile || isListening}
    >
      <div className="tool-controls">
        <label className="tool-control-label">Live microphone</label>
        {!microphoneSupported && (
          <span className="pdf-file-meta">
            Microphone recording is not available in this browser.
          </span>
        )}
        {microphoneSupported && (
          <span className="pdf-file-meta">
            Click Start Listening, speak clearly, then Stop Listening to transcribe your voice.
          </span>
        )}
        <button
          type="button"
          className="tool-compress-btn"
          onClick={() => void (isListening ? handleStopListening() : handleStartListening())}
          disabled={!microphoneSupported || isTranscribing || upload.isPreparingPreview}
        >
          {isListening ? 'Stop Listening' : 'Start Listening'}
        </button>
      </div>

      {upload.selectedFile && (
        <div className="tool-controls">
          <span className="pdf-file-meta">
            File transcription is processed securely on the server using Whisper AI.
          </span>
        </div>
      )}

      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="speech-transcript">
          Transcript
        </label>
        <textarea
          id="speech-transcript"
          className="tool-textarea"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Transcribed text will appear here. You can edit it before downloading."
          rows={8}
          disabled={isTranscribing}
        />
      </div>
    </AudioToolShell>
  )
}
