import { useEffect, useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { formatFileSize } from '../../api/compress'
import { VideoToolShell } from '../../components/VideoToolShell'
import {
  addSubtitlesConfig,
  compressVideoConfig,
  convertMp4Config,
  mergeVideosConfig,
  muteVideoConfig,
  resizeVideoConfig,
  rotateVideoConfig,
  screenRecorderConfig,
  trimVideoConfig,
  VIDEO_ACCEPT,
  videoToGifConfig,
  webcamRecorderConfig,
} from '../../config/videoTools'
import {
  addSubtitlesToVideo,
  compressVideoFile,
  convertVideoToMp4,
  mergeVideoFiles,
  muteVideoFile,
  resizeVideoFile,
  rotateVideoFile,
  trimVideoFile,
  videoToGifFile,
  type VideoProcessResult,
} from '../../utils/videoProcess'
import {
  getVideoMetadata,
  isSupportedVideoFile,
  type VideoMetadata,
} from '../../utils/videoInfo'
import { validateSubtitleFile } from '../../utils/subtitleFile'
import {
  attachStreamToVideo,
  buildRecordingBlob,
  extensionForMimeType,
  getRecorderMimeType,
  getScreenStream,
  getWebcamStream,
  parseMediaAccessError,
  RECORDER_TIMESLICE_MS,
  stopMediaRecorder,
  stopMediaStream,
} from '../../utils/mediaRecorder'

const MAX_FILE_BYTES = 100 * 1024 * 1024
const MAX_MERGE_TOTAL_BYTES = 150 * 1024 * 1024

type ResultState = VideoProcessResult & { stats: string }

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function resultStats(result: VideoProcessResult, extra?: string): string {
  const prefix = extra ? `${extra} ` : ''
  return `${prefix}${formatFileSize(result.originalSize)} → ${formatFileSize(result.outputSize)}`
}

function useSingleVideoUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null)
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

    if (!isSupportedVideoFile(file)) {
      setError('Unsupported file format.')
      setSelectedFile(null)
      setMetadata(null)
      resetPreview(null)
      return
    }

    if (file.size > MAX_FILE_BYTES) {
      setError('File exceeds 100MB limit.')
      setSelectedFile(null)
      setMetadata(null)
      resetPreview(null)
      return
    }

    setSelectedFile(file)
    setError(null)
    setIsPreparingPreview(true)
    resetPreview(URL.createObjectURL(file))

    void getVideoMetadata(file)
      .then(setMetadata)
      .catch(() =>
        setMetadata({ duration: Number.NaN, width: 0, height: 0, canPreview: false }),
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

function useVideoProcessor(
  processor: (
    file: File,
    callbacks: { onStatus?: (m: string) => void; onProgress?: (m: string) => void },
  ) => Promise<VideoProcessResult>,
) {
  const upload = useSingleVideoUpload()
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
      if (output.blob.type.startsWith('video/')) {
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

export function TrimVideoPage() {
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(10)
  const { upload, isProcessing, progressMessage, result, resultPreviewUrl, run } =
    useVideoProcessor((file, callbacks) =>
      trimVideoFile(file, startTime, endTime, upload.metadata ?? undefined, callbacks),
    )
  useEffect(() => {
    if (upload.metadata?.duration && Number.isFinite(upload.metadata.duration)) {
      setEndTime(Math.min(10, Math.floor(upload.metadata.duration)))
      setStartTime(0)
    }
  }, [upload.metadata])

  return (
    <VideoToolShell
      config={trimVideoConfig}
      accept={VIDEO_ACCEPT}
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
        <label className="tool-control-label" htmlFor="trim-start">Start (seconds): {startTime}</label>
        <input id="trim-start" type="range" min={0} max={Math.max(endTime - 1, 0)} value={startTime} onChange={(e) => setStartTime(Number(e.target.value))} className="tool-slider" disabled={!upload.selectedFile || isProcessing} />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="trim-end">End (seconds): {endTime}</label>
        <input id="trim-end" type="range" min={startTime + 1} max={upload.metadata?.duration && Number.isFinite(upload.metadata.duration) ? Math.floor(upload.metadata.duration) : 300} value={endTime} onChange={(e) => setEndTime(Number(e.target.value))} className="tool-slider" disabled={!upload.selectedFile || isProcessing} />
      </div>
    </VideoToolShell>
  )
}

export function ConvertMp4Page() {
  const { upload, isProcessing, progressMessage, result, resultPreviewUrl, run } =
    useVideoProcessor((file, callbacks) =>
      convertVideoToMp4(file, upload.metadata ?? undefined, callbacks),
    )

  return (
    <VideoToolShell config={convertMp4Config} accept={VIDEO_ACCEPT} selectedFile={upload.selectedFile} onFileChange={upload.handleFileChange} metadata={upload.metadata} isProcessing={isProcessing} isPreparingPreview={upload.isPreparingPreview} progressMessage={progressMessage} error={upload.error} previewUrl={upload.previewUrl} resultPreviewUrl={resultPreviewUrl} resultStats={result?.stats ?? null} onDownload={result ? () => downloadBlob(result.blob, result.filename) : undefined} onAction={() => void run('Converted successfully!')} actionDisabled={!upload.selectedFile} />
  )
}

export function CompressVideoPage() {
  const [crf, setCrf] = useState(28)
  const { upload, isProcessing, progressMessage, result, resultPreviewUrl, run } =
    useVideoProcessor((file, callbacks) =>
      compressVideoFile(file, crf, upload.metadata ?? undefined, callbacks),
    )

  return (
    <VideoToolShell config={compressVideoConfig} accept={VIDEO_ACCEPT} selectedFile={upload.selectedFile} onFileChange={upload.handleFileChange} metadata={upload.metadata} isProcessing={isProcessing} isPreparingPreview={upload.isPreparingPreview} progressMessage={progressMessage} error={upload.error} previewUrl={upload.previewUrl} resultPreviewUrl={resultPreviewUrl} resultStats={result?.stats ?? null} onDownload={result ? () => downloadBlob(result.blob, result.filename) : undefined} onAction={() => void run('Compressed successfully!')} actionDisabled={!upload.selectedFile}>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="video-crf">Compression (lower = better quality): {crf}</label>
        <input id="video-crf" type="range" min={18} max={35} value={crf} onChange={(e) => setCrf(Number(e.target.value))} className="tool-slider" disabled={isProcessing} />
      </div>
    </VideoToolShell>
  )
}

export function VideoToGifPage() {
  const [fps, setFps] = useState(10)
  const [width, setWidth] = useState(480)
  const [startSeconds, setStartSeconds] = useState(0)
  const [durationSeconds, setDurationSeconds] = useState(5)
  const { upload, isProcessing, progressMessage, result, run } = useVideoProcessor(
    (file, callbacks) =>
      videoToGifFile(file, { fps, width, startSeconds, durationSeconds }, callbacks),
  )

  return (
    <VideoToolShell config={videoToGifConfig} accept={VIDEO_ACCEPT} selectedFile={upload.selectedFile} onFileChange={upload.handleFileChange} metadata={upload.metadata} isProcessing={isProcessing} isPreparingPreview={upload.isPreparingPreview} progressMessage={progressMessage} error={upload.error} previewUrl={upload.previewUrl} resultStats={result?.stats ?? null} onDownload={result ? () => downloadBlob(result.blob, result.filename) : undefined} onAction={() => void run('GIF created successfully!')} actionDisabled={!upload.selectedFile}>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="gif-fps">FPS: {fps}</label>
        <input id="gif-fps" type="range" min={5} max={20} value={fps} onChange={(e) => setFps(Number(e.target.value))} className="tool-slider" disabled={isProcessing} />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="gif-width">Width: {width}px</label>
        <input id="gif-width" type="range" min={240} max={720} step={20} value={width} onChange={(e) => setWidth(Number(e.target.value))} className="tool-slider" disabled={isProcessing} />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="gif-start">Start (seconds): {startSeconds}</label>
        <input id="gif-start" type="range" min={0} max={300} value={startSeconds} onChange={(e) => setStartSeconds(Number(e.target.value))} className="tool-slider" disabled={isProcessing} />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="gif-duration">Duration (seconds): {durationSeconds}</label>
        <input id="gif-duration" type="range" min={1} max={30} value={durationSeconds} onChange={(e) => setDurationSeconds(Number(e.target.value))} className="tool-slider" disabled={isProcessing} />
      </div>
    </VideoToolShell>
  )
}

export function MergeVideosPage() {
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
      if (!isSupportedVideoFile(file)) {
        setError('Unsupported file format detected.')
        return
      }
      if (file.size > MAX_FILE_BYTES) {
        setError('One or more files exceed 100MB limit.')
        return
      }
    }
    setFiles((current) => {
      const combined = [...current, ...incoming]
      const totalSize = combined.reduce((sum, file) => sum + file.size, 0)
      if (totalSize > MAX_MERGE_TOTAL_BYTES) {
        setError('Combined file size exceeds 150MB. Use smaller or shorter videos.')
        return current
      }
      return combined
    })
    setError(null)
    setResult(null)
  }

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Add at least two videos to merge.')
      return
    }
    setIsProcessing(true)
    setError(null)
    setResult(null)
    if (resultPreviewUrl) URL.revokeObjectURL(resultPreviewUrl)
    setResultPreviewUrl(null)

    try {
      const output = await mergeVideoFiles(files, {
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

  return (
    <VideoToolShell config={mergeVideosConfig} accept={VIDEO_ACCEPT} multiple selectedFile={null} selectedFiles={files} onFileChange={handleFileChange} isProcessing={isProcessing} progressMessage={progressMessage} error={error} resultPreviewUrl={resultPreviewUrl} resultStats={result?.stats ?? null} onDownload={result ? () => downloadBlob(result.blob, result.filename) : undefined} onAction={handleMerge} actionDisabled={files.length < 2} />
  )
}

export function ResizeVideoPage() {
  const [preset, setPreset] = useState('1280x720')
  const [width, height] = preset.split('x').map(Number) as [number, number]
  const { upload, isProcessing, progressMessage, result, resultPreviewUrl, run } =
    useVideoProcessor((file, callbacks) =>
      resizeVideoFile(file, width, height, upload.metadata ?? undefined, callbacks),
    )

  return (
    <VideoToolShell config={resizeVideoConfig} accept={VIDEO_ACCEPT} selectedFile={upload.selectedFile} onFileChange={upload.handleFileChange} metadata={upload.metadata} isProcessing={isProcessing} isPreparingPreview={upload.isPreparingPreview} progressMessage={progressMessage} error={upload.error} previewUrl={upload.previewUrl} resultPreviewUrl={resultPreviewUrl} resultStats={result?.stats ?? null} onDownload={result ? () => downloadBlob(result.blob, result.filename) : undefined} onAction={() => void run('Resized successfully!')} actionDisabled={!upload.selectedFile}>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="resize-preset">Resolution</label>
        <select id="resize-preset" className="tool-select" value={preset} onChange={(e) => setPreset(e.target.value)} disabled={isProcessing}>
          <option value="3840x2160">4K (3840 × 2160)</option>
          <option value="1920x1080">1080p (1920 × 1080)</option>
          <option value="1280x720">720p (1280 × 720)</option>
          <option value="854x480">480p (854 × 480)</option>
          <option value="640x360">360p (640 × 360)</option>
        </select>
      </div>
    </VideoToolShell>
  )
}

export function RotateVideoPage() {
  const [rotation, setRotation] = useState<90 | 180 | 270>(90)
  const { upload, isProcessing, progressMessage, result, resultPreviewUrl, run } =
    useVideoProcessor((file, callbacks) =>
      rotateVideoFile(file, rotation, upload.metadata ?? undefined, callbacks),
    )

  return (
    <VideoToolShell config={rotateVideoConfig} accept={VIDEO_ACCEPT} selectedFile={upload.selectedFile} onFileChange={upload.handleFileChange} metadata={upload.metadata} isProcessing={isProcessing} isPreparingPreview={upload.isPreparingPreview} progressMessage={progressMessage} error={upload.error} previewUrl={upload.previewUrl} resultPreviewUrl={resultPreviewUrl} resultStats={result?.stats ?? null} onDownload={result ? () => downloadBlob(result.blob, result.filename) : undefined} onAction={() => void run('Rotated successfully!')} actionDisabled={!upload.selectedFile}>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="video-rotation">Rotation</label>
        <select id="video-rotation" className="tool-select" value={rotation} onChange={(e) => setRotation(Number(e.target.value) as 90 | 180 | 270)} disabled={isProcessing}>
          <option value={90}>90° clockwise</option>
          <option value={180}>180°</option>
          <option value={270}>270° clockwise</option>
        </select>
      </div>
    </VideoToolShell>
  )
}

export function MuteVideoPage() {
  const { upload, isProcessing, progressMessage, result, resultPreviewUrl, run } =
    useVideoProcessor((file, callbacks) =>
      muteVideoFile(file, upload.metadata ?? undefined, callbacks),
    )

  return (
    <VideoToolShell config={muteVideoConfig} accept={VIDEO_ACCEPT} selectedFile={upload.selectedFile} onFileChange={upload.handleFileChange} metadata={upload.metadata} isProcessing={isProcessing} isPreparingPreview={upload.isPreparingPreview} progressMessage={progressMessage} error={upload.error} previewUrl={upload.previewUrl} resultPreviewUrl={resultPreviewUrl} resultStats={result?.stats ?? null} onDownload={result ? () => downloadBlob(result.blob, result.filename) : undefined} onAction={() => void run('Audio removed successfully!')} actionDisabled={!upload.selectedFile} />
  )
}

export function AddSubtitlesPage() {
  const upload = useSingleVideoUpload()
  const subtitleInputRef = useRef<HTMLInputElement>(null)
  const [subtitleFile, setSubtitleFile] = useState<File | null>(null)
  const [subtitleError, setSubtitleError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progressMessage, setProgressMessage] = useState<string | null>(null)
  const [result, setResult] = useState<ResultState | null>(null)
  const [resultPreviewUrl, setResultPreviewUrl] = useState<string | null>(null)

  const handleSubtitleChange = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return

    setSubtitleError(null)
    setResult(null)
    if (resultPreviewUrl) URL.revokeObjectURL(resultPreviewUrl)
    setResultPreviewUrl(null)

    const validation = await validateSubtitleFile(file)
    if (!validation.ok) {
      setSubtitleError(validation.reason)
      setSubtitleFile(null)
      return
    }

    setSubtitleFile(file)
    if (subtitleInputRef.current) subtitleInputRef.current.value = ''
  }

  const handleAction = async () => {
    if (!upload.selectedFile || !subtitleFile) return
    setIsProcessing(true)
    upload.setError(null)
    setSubtitleError(null)
    setResult(null)
    if (resultPreviewUrl) URL.revokeObjectURL(resultPreviewUrl)
    setResultPreviewUrl(null)

    try {
      const output = await addSubtitlesToVideo(
        upload.selectedFile,
        subtitleFile,
        upload.metadata ?? undefined,
        {
          onStatus: setProgressMessage,
          onProgress: setProgressMessage,
        },
      )
      setResult({ ...output, stats: resultStats(output, 'Subtitles added successfully!') })
      setResultPreviewUrl(URL.createObjectURL(output.blob))
    } catch (err) {
      upload.setError(err instanceof Error ? err.message : 'Failed to add subtitles.')
    } finally {
      setIsProcessing(false)
      setProgressMessage(null)
    }
  }

  const handleSubtitleDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (isProcessing) return
    void handleSubtitleChange(event.dataTransfer.files)
  }

  const subtitleZoneClass = [
    'upload-zone',
    subtitleFile ? 'upload-zone-has-file' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <VideoToolShell
      config={addSubtitlesConfig}
      accept={VIDEO_ACCEPT}
      selectedFile={upload.selectedFile}
      onFileChange={upload.handleFileChange}
      metadata={upload.metadata}
      isProcessing={isProcessing}
      isPreparingPreview={upload.isPreparingPreview}
      progressMessage={progressMessage}
      error={subtitleError ?? upload.error}
      previewUrl={upload.previewUrl}
      resultPreviewUrl={resultPreviewUrl}
      resultStats={result?.stats ?? null}
      onDownload={result ? () => downloadBlob(result.blob, result.filename) : undefined}
      onAction={handleAction}
      actionDisabled={!upload.selectedFile || !subtitleFile}
    >
      <div className="tool-controls">
        <label className="tool-control-label">Subtitle file (.srt or .vtt)</label>
        <button
          type="button"
          className={subtitleZoneClass}
          onClick={() => subtitleInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onDrop={handleSubtitleDrop}
          disabled={isProcessing}
        >
          <span className="upload-icon-wrap">
            <Upload size={28} strokeWidth={2} aria-hidden />
          </span>
          <span className="upload-title">
            {subtitleFile ? subtitleFile.name : 'Drop subtitle file here or click to browse'}
          </span>
          <span className="upload-hint">
            {subtitleFile
              ? `${formatFileSize(subtitleFile.size)} — click to change file`
              : 'Supports .srt, .vtt, and plain-text subtitle files'}
          </span>
          <input
            ref={subtitleInputRef}
            type="file"
            accept=".srt,.vtt,text/plain,application/x-subrip"
            className="upload-input"
            aria-hidden
            onChange={(e) => void handleSubtitleChange(e.target.files)}
            disabled={isProcessing}
          />
        </button>
      </div>
    </VideoToolShell>
  )
}

function RecorderPage({
  config,
  getStream,
  filenameBase,
  device,
}: {
  config: typeof screenRecorderConfig
  getStream: () => Promise<MediaStream>
  filenameBase: string
  device: 'camera' | 'screen'
}) {
  const [error, setError] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [liveStream, setLiveStream] = useState<MediaStream | null>(null)
  const [resultPreviewUrl, setResultPreviewUrl] = useState<string | null>(null)
  const [downloadFilename, setDownloadFilename] = useState(`${filenameBase}.webm`)
  const [result, setResult] = useState<{ blob: Blob; stats: string } | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const mimeTypeRef = useRef('video/webm')
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const cleanupPreviewUrl = (url: string | null) => {
    if (url) URL.revokeObjectURL(url)
  }

  const stopStream = () => {
    stopMediaStream(streamRef.current)
    streamRef.current = null
    setLiveStream(null)
    if (videoRef.current) videoRef.current.srcObject = null
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video || !liveStream) return

    void attachStreamToVideo(video, liveStream).catch(() => {
      setError('Could not display camera preview. Check camera permissions.')
    })

    return () => {
      video.srcObject = null
    }
  }, [liveStream])

  const handleStart = async () => {
    setError(null)
    setResult(null)
    cleanupPreviewUrl(resultPreviewUrl)
    setResultPreviewUrl(null)

    if (!navigator.mediaDevices) {
      setError('Recording is not supported in this browser.')
      return
    }

    setIsStarting(true)
    try {
      const stream = await getStream()
      streamRef.current = stream
      setLiveStream(stream)

      stream.getVideoTracks()[0]?.addEventListener('ended', () => {
        if (recorderRef.current?.state === 'recording') {
          stopMediaRecorder(recorderRef.current)
          setIsRecording(false)
        }
      })

      const mimeType = getRecorderMimeType()
      mimeTypeRef.current = mimeType
      setDownloadFilename(`${filenameBase}${extensionForMimeType(mimeType)}`)

      const recorder = new MediaRecorder(stream, { mimeType })
      chunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }

      recorder.onerror = () => {
        setError('Recording failed. Try again.')
        setIsRecording(false)
        stopStream()
      }

      recorder.onstop = () => {
        const blob = buildRecordingBlob(chunksRef.current, mimeTypeRef.current)
        if (blob.size === 0) {
          setError('No video was captured. Record for at least one second, then stop.')
          stopStream()
          return
        }

        const url = URL.createObjectURL(blob)
        setResult({
          blob,
          stats: `Recording saved (${formatFileSize(blob.size)}).`,
        })
        setResultPreviewUrl(url)
        stopStream()
      }

      recorder.start(RECORDER_TIMESLICE_MS)
      recorderRef.current = recorder
      setIsRecording(true)
    } catch (err) {
      setError(parseMediaAccessError(err, device))
      stopStream()
    } finally {
      setIsStarting(false)
    }
  }

  const handleStop = () => {
    stopMediaRecorder(recorderRef.current)
    setIsRecording(false)
  }

  useEffect(
    () => () => {
      stopMediaRecorder(recorderRef.current)
      stopStream()
      cleanupPreviewUrl(resultPreviewUrl)
    },
    [resultPreviewUrl],
  )

  return (
    <VideoToolShell
      config={config}
      selectedFile={null}
      onFileChange={() => {}}
      isProcessing={isStarting || isRecording}
      progressMessage={isStarting ? 'Starting…' : isRecording ? 'Recording…' : null}
      error={error}
      resultPreviewUrl={resultPreviewUrl}
      resultStats={result?.stats ?? null}
      onDownload={result ? () => downloadBlob(result.blob, downloadFilename) : undefined}
      onAction={isRecording ? handleStop : handleStart}
      actionLabel={isRecording ? 'Stop Recording' : config.actionLabel}
      actionEnabledWhileProcessing={isRecording}
      actionDisabled={isStarting}
      showUpload={false}
    >
      {(isRecording || !result) && (
        <div className="tool-preview">
          <video ref={videoRef} autoPlay muted playsInline controls={!isRecording} />
        </div>
      )}
      {isRecording && (
        <div className="tool-controls">
          <span className="pdf-file-meta">Recording in progress — click Stop Recording when finished.</span>
        </div>
      )}
    </VideoToolShell>
  )
}

export function ScreenRecorderPage() {
  return (
    <RecorderPage
      config={screenRecorderConfig}
      filenameBase="screen-recording"
      device="screen"
      getStream={getScreenStream}
    />
  )
}

export function WebcamRecorderPage() {
  return (
    <RecorderPage
      config={webcamRecorderConfig}
      filenameBase="webcam-recording"
      device="camera"
      getStream={getWebcamStream}
    />
  )
}
