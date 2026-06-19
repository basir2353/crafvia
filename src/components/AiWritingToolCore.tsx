import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Coffee,
  Copy,
  Download,
  Loader2,
  RotateCw,
  Sparkles,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAiWriterLimits, generateAiContent } from '../api/aiWriter'
import { openDonatePage } from '../api/config'
import type { AiWritingPreset, AiWritingToolConfig } from '../config/aiWritingTools'
import { whyCrafvia } from '../config/tools'
import {
  buildExportFilename,
  copyHtmlToClipboard,
  downloadDocxFile,
  downloadTextFile,
} from '../utils/contentExport'
import { htmlToPlainText, markdownToHtml } from '../utils/markdownToHtml'
import {
  CONTENT_TYPE_OPTIONS,
  countWords,
  IMPROVEMENT_OPTIONS,
  LENGTH_OPTIONS,
  MODE_OPTIONS,
  TONE_OPTIONS,
  type ContentType,
  type ImprovementType,
  type LengthType,
  type ToneType,
  type WriterMode,
} from '../utils/aiWriterOptions'
import { Footer } from './Footer'
import { Header } from './Header'
import '../pages/CompressImage.css'

const MAX_PROMPT_LENGTH = 10_000

type SavedDraft = {
  prompt: string
  sourceText: string
  editorHtml: string
  mode: WriterMode
  contentType: ContentType
  improvementType: ImprovementType
  tone: ToneType
  customTone: string
  length: LengthType
  customWordCount: number
  targetLanguage: string
}

type Props = {
  config: AiWritingToolConfig
  preset: AiWritingPreset
}

function draftKey(slug: string) {
  return `crafvia-ai-${slug}-draft`
}

export function AiWritingToolCore({ config, preset }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [prompt, setPrompt] = useState('')
  const [sourceText, setSourceText] = useState('')
  const [mode, setMode] = useState<WriterMode>(preset.mode)
  const [contentType, setContentType] = useState<ContentType>(
    preset.contentType ?? 'blog-post',
  )
  const [improvementType, setImprovementType] = useState<ImprovementType>(
    preset.improvementType ?? 'rewrite',
  )
  const [tone, setTone] = useState<ToneType>('professional')
  const [customTone, setCustomTone] = useState('')
  const [length, setLength] = useState<LengthType>(preset.defaultLength ?? 'medium')
  const [customWordCount, setCustomWordCount] = useState(400)
  const [targetLanguage, setTargetLanguage] = useState('Spanish')
  const [editorHtml, setEditorHtml] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [copyMessage, setCopyMessage] = useState<string | null>(null)
  const [aiProvider, setAiProvider] = useState<string | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const storageKey = draftKey(preset.slug)

  const showModeSelector = preset.showModeSelector ?? false
  const showContentTypeSelector = preset.showContentTypeSelector ?? false
  const showImprovementSelector = preset.showImprovementSelector ?? false
  const showContinueWriting = preset.showContinueWriting ?? false
  const isGenerateMode = mode === 'generate'

  const editorPlainText = useMemo(() => htmlToPlainText(editorHtml), [editorHtml])
  const inputWordCount = countWords(isGenerateMode ? prompt : sourceText)
  const outputWordCount = countWords(editorPlainText)
  const outputCharCount = editorPlainText.length

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (!saved) return
      const draft = JSON.parse(saved) as SavedDraft
      setPrompt(draft.prompt ?? '')
      setSourceText(draft.sourceText ?? '')
      setEditorHtml(draft.editorHtml ?? '')
      if (showModeSelector) setMode(draft.mode ?? preset.mode)
      if (showContentTypeSelector) setContentType(draft.contentType ?? preset.contentType ?? 'blog-post')
      if (showImprovementSelector) {
        setImprovementType(draft.improvementType ?? preset.improvementType ?? 'rewrite')
      }
      setTone(draft.tone ?? 'professional')
      setCustomTone(draft.customTone ?? '')
      setLength(draft.length ?? preset.defaultLength ?? 'medium')
      setCustomWordCount(draft.customWordCount ?? 400)
      setTargetLanguage(draft.targetLanguage ?? 'Spanish')
      if (editorRef.current && draft.editorHtml) {
        editorRef.current.innerHTML = draft.editorHtml
      }
    } catch {
      // Ignore invalid saved drafts.
    }
  }, [storageKey, showModeSelector, showContentTypeSelector, showImprovementSelector, preset])

  useEffect(() => {
    const draft: SavedDraft = {
      prompt,
      sourceText,
      editorHtml,
      mode,
      contentType,
      improvementType,
      tone,
      customTone,
      length,
      customWordCount,
      targetLanguage,
    }
    localStorage.setItem(storageKey, JSON.stringify(draft))
  }, [
    storageKey,
    prompt,
    sourceText,
    editorHtml,
    mode,
    contentType,
    improvementType,
    tone,
    customTone,
    length,
    customWordCount,
    targetLanguage,
  ])

  useEffect(() => {
    void fetchAiWriterLimits()
      .then((limits) => {
        setAiProvider(limits.configured ? limits.provider : null)
      })
      .catch(() => setAiProvider(null))
  }, [])

  const setEditorContent = (markdown: string) => {
    const html = markdownToHtml(markdown)
    setEditorHtml(html)
    if (editorRef.current) {
      editorRef.current.innerHTML = html
    }
  }

  const appendEditorContent = (markdown: string) => {
    const html = markdownToHtml(markdown)
    const combined = `${editorHtml}${editorHtml ? '<br>' : ''}${html}`
    setEditorHtml(combined)
    if (editorRef.current) {
      editorRef.current.innerHTML = combined
    }
  }

  const handleEditorInput = () => {
    if (editorRef.current) {
      setEditorHtml(editorRef.current.innerHTML)
    }
  }

  const runEditorCommand = (command: string, value?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
    handleEditorInput()
  }

  const buildRequest = (requestMode: WriterMode | 'continue') => ({
    mode: requestMode,
    prompt: requestMode === 'generate' ? prompt.trim() : undefined,
    sourceText: requestMode === 'improve' ? sourceText.trim() : undefined,
    existingContent: requestMode === 'continue' ? editorPlainText : undefined,
    contentType: requestMode === 'generate' ? contentType : undefined,
    improvementType: requestMode === 'improve' ? improvementType : undefined,
    tone,
    customTone: tone === 'custom' ? customTone.trim() : undefined,
    length,
    customWordCount: length === 'custom' ? customWordCount : undefined,
    targetLanguage:
      mode === 'improve' && improvementType === 'translate'
        ? targetLanguage.trim()
        : undefined,
    toolSlug: preset.slug,
  })

  const validateForm = (): string | null => {
    if (isGenerateMode && !prompt.trim()) {
      return 'Please enter a topic or prompt.'
    }

    if (!isGenerateMode && !sourceText.trim()) {
      return 'Please enter text to process.'
    }

    if (prompt.length > MAX_PROMPT_LENGTH || sourceText.length > MAX_PROMPT_LENGTH) {
      return `Input exceeds ${MAX_PROMPT_LENGTH.toLocaleString()} character limit.`
    }

    if (tone === 'custom' && !customTone.trim()) {
      return 'Please describe your custom tone.'
    }

    if (length === 'custom' && (!customWordCount || customWordCount < 50)) {
      return 'Please enter a custom word count of at least 50.'
    }

    if (mode === 'improve' && improvementType === 'translate' && !targetLanguage.trim()) {
      return 'Please enter a target language for translation.'
    }

    return null
  }

  const handleGenerate = async () => {
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setSuccess(null)
      return
    }

    setIsProcessing(true)
    setError(null)
    setSuccess(null)
    setCopyMessage(null)

    try {
      const result = await generateAiContent(buildRequest(mode))
      setEditorContent(result.content)
      const providerNote =
        result.provider === 'template'
          ? ' (local fallback mode — add an API key for full AI)'
          : result.provider
            ? ` via ${result.provider}`
            : ''
      setSuccess(
        `Content generated successfully (${result.wordCount.toLocaleString()} words)${providerNote}.`,
      )
      setAiProvider(result.provider ?? aiProvider)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleContinue = async () => {
    if (!editorPlainText.trim()) {
      setError('Generate or enter content before continuing.')
      return
    }

    setIsProcessing(true)
    setError(null)
    setSuccess(null)
    setCopyMessage(null)

    try {
      const result = await generateAiContent(buildRequest('continue'))
      appendEditorContent(result.content)
      setSuccess('Continuation added successfully.')
      setAiProvider(result.provider ?? aiProvider)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCopy = async () => {
    if (!editorPlainText.trim()) {
      setError('There is no content to copy.')
      return
    }

    try {
      await copyHtmlToClipboard(editorRef.current?.innerHTML ?? editorHtml)
      setCopyMessage('Copied to clipboard.')
      setError(null)
    } catch {
      setError('Unable to copy content. Your browser may have blocked clipboard access.')
    }
  }

  const handleDownloadTxt = () => {
    if (!editorPlainText.trim()) {
      setError('There is no content to download.')
      return
    }
    downloadTextFile(
      editorPlainText,
      buildExportFilename(prompt || sourceText, 'txt'),
    )
    setSuccess('TXT file downloaded.')
    setError(null)
  }

  const handleDownloadDocx = async () => {
    if (!editorPlainText.trim()) {
      setError('There is no content to download.')
      return
    }

    try {
      await downloadDocxFile(
        editorRef.current?.innerHTML ?? editorHtml,
        buildExportFilename(prompt || sourceText, 'docx'),
      )
      setSuccess('DOCX file downloaded.')
      setError(null)
    } catch {
      setError('Unable to create DOCX file.')
    }
  }

  return (
    <div className="app tool-page">
      <Header />
      <main className="tool-main">
        <div className="tool-container">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={14} aria-hidden />
            <Link to="/categories/ai-writing">{config.category}</Link>
            <ChevronRight size={14} aria-hidden />
            <span className="breadcrumb-current">{config.breadcrumb}</span>
          </nav>

          <header className="tool-header">
            <h1 className="tool-title">{config.title}</h1>
            <p className="tool-lead">{config.lead}</p>
          </header>

          <div className="upload-outer">
            {showModeSelector && (
              <div className="tool-controls">
                <label className="tool-control-label" htmlFor="writer-mode">
                  Writing mode
                </label>
                <select
                  id="writer-mode"
                  className="tool-select"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as WriterMode)}
                  disabled={isProcessing}
                >
                  {MODE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {isGenerateMode ? (
              <div className="tool-controls">
                <label className="tool-control-label" htmlFor="writer-prompt">
                  {preset.promptLabel ?? 'Topic or prompt'}
                </label>
                <textarea
                  id="writer-prompt"
                  className="tool-textarea"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    preset.promptPlaceholder ??
                    'Describe what you want the AI to write…'
                  }
                  disabled={isProcessing}
                  maxLength={MAX_PROMPT_LENGTH}
                />
                <div className="tool-text-counts">
                  <span>{inputWordCount.toLocaleString()} words</span>
                  <span>
                    {prompt.length.toLocaleString()} / {MAX_PROMPT_LENGTH.toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="tool-controls">
                <label className="tool-control-label" htmlFor="writer-source">
                  {preset.sourceLabel ?? 'Text to improve'}
                </label>
                <textarea
                  id="writer-source"
                  className="tool-textarea"
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder={
                    preset.sourcePlaceholder ??
                    'Paste the text you want to rewrite, expand, fix, or translate…'
                  }
                  disabled={isProcessing}
                  maxLength={MAX_PROMPT_LENGTH}
                />
                <div className="tool-text-counts">
                  <span>{inputWordCount.toLocaleString()} words</span>
                  <span>
                    {sourceText.length.toLocaleString()} / {MAX_PROMPT_LENGTH.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {isGenerateMode && showContentTypeSelector && (
              <div className="tool-controls">
                <label className="tool-control-label" htmlFor="content-type">
                  Content type
                </label>
                <select
                  id="content-type"
                  className="tool-select"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as ContentType)}
                  disabled={isProcessing}
                >
                  {CONTENT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {!isGenerateMode && showImprovementSelector && (
              <div className="tool-controls">
                <label className="tool-control-label" htmlFor="improvement-type">
                  Improvement action
                </label>
                <select
                  id="improvement-type"
                  className="tool-select"
                  value={improvementType}
                  onChange={(e) => setImprovementType(e.target.value as ImprovementType)}
                  disabled={isProcessing}
                >
                  {IMPROVEMENT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {mode === 'improve' && improvementType === 'translate' && (
              <div className="tool-controls">
                <label className="tool-control-label" htmlFor="target-language">
                  Target language
                </label>
                <input
                  id="target-language"
                  className="tool-select"
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  placeholder="e.g. Spanish, French, Urdu"
                  disabled={isProcessing}
                />
              </div>
            )}

            <div className="tool-controls">
              <label className="tool-control-label" htmlFor="writer-tone">
                Tone
              </label>
              <select
                id="writer-tone"
                className="tool-select"
                value={tone}
                onChange={(e) => setTone(e.target.value as ToneType)}
                disabled={isProcessing}
              >
                {TONE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {tone === 'custom' && (
              <div className="tool-controls">
                <label className="tool-control-label" htmlFor="custom-tone">
                  Custom tone description
                </label>
                <input
                  id="custom-tone"
                  className="tool-select"
                  value={customTone}
                  onChange={(e) => setCustomTone(e.target.value)}
                  placeholder="Describe the tone you want"
                  disabled={isProcessing}
                />
              </div>
            )}

            <div className="tool-controls">
              <label className="tool-control-label" htmlFor="writer-length">
                Output length
              </label>
              <select
                id="writer-length"
                className="tool-select"
                value={length}
                onChange={(e) => setLength(e.target.value as LengthType)}
                disabled={isProcessing}
              >
                {LENGTH_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {length === 'custom' && (
              <div className="tool-controls">
                <label className="tool-control-label" htmlFor="custom-word-count">
                  Custom word count
                </label>
                <input
                  id="custom-word-count"
                  type="number"
                  className="tool-select"
                  min={50}
                  max={3000}
                  value={customWordCount}
                  onChange={(e) => setCustomWordCount(Number(e.target.value))}
                  disabled={isProcessing}
                />
              </div>
            )}

            {aiProvider && (
              <div className="tool-text-counts">
                <span>AI provider: {aiProvider}</span>
              </div>
            )}

            <button
              type="button"
              className="tool-compress-btn"
              onClick={() => void handleGenerate()}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="spin" aria-hidden />
                  {config.processingLabel}
                </>
              ) : (
                config.actionLabel
              )}
            </button>

            {error && <p className="tool-error">{error}</p>}
            {success && (
              <div className="tool-result">
                <p className="tool-result-stats">{success}</p>
              </div>
            )}
            {copyMessage && (
              <div className="tool-result">
                <p className="tool-result-stats">{copyMessage}</p>
              </div>
            )}

            <div className="tool-controls">
              <label className="tool-control-label">Generated content</label>
              <div className="tool-editor-toolbar">
                <button
                  type="button"
                  className="tool-editor-btn"
                  onClick={() => runEditorCommand('bold')}
                  disabled={isProcessing}
                >
                  B
                </button>
                <button
                  type="button"
                  className="tool-editor-btn"
                  onClick={() => runEditorCommand('italic')}
                  disabled={isProcessing}
                >
                  I
                </button>
                <button
                  type="button"
                  className="tool-editor-btn"
                  onClick={() => runEditorCommand('underline')}
                  disabled={isProcessing}
                >
                  U
                </button>
                <button
                  type="button"
                  className="tool-editor-btn"
                  onClick={() => runEditorCommand('insertUnorderedList')}
                  disabled={isProcessing}
                >
                  List
                </button>
                <button
                  type="button"
                  className="tool-editor-btn"
                  onClick={() => runEditorCommand('formatBlock', 'h2')}
                  disabled={isProcessing}
                >
                  H2
                </button>
                <button
                  type="button"
                  className="tool-editor-btn"
                  onClick={() => runEditorCommand('formatBlock', 'h3')}
                  disabled={isProcessing}
                >
                  H3
                </button>
              </div>
              <div
                ref={editorRef}
                className="tool-editor"
                contentEditable={!isProcessing}
                role="textbox"
                aria-multiline="true"
                aria-label="Generated content editor"
                onInput={handleEditorInput}
                suppressContentEditableWarning
              />
              <div className="tool-text-counts">
                <span>
                  {outputWordCount.toLocaleString()} words · {outputCharCount.toLocaleString()}{' '}
                  characters
                </span>
                <span>Draft auto-saved locally</span>
              </div>
              <div className="tool-editor-actions">
                <button
                  type="button"
                  className="tool-secondary-btn"
                  onClick={() => void handleCopy()}
                  disabled={isProcessing || !editorPlainText.trim()}
                >
                  <Copy size={16} aria-hidden />
                  Copy
                </button>
                <button
                  type="button"
                  className="tool-secondary-btn"
                  onClick={handleDownloadTxt}
                  disabled={isProcessing || !editorPlainText.trim()}
                >
                  <Download size={16} aria-hidden />
                  Download TXT
                </button>
                <button
                  type="button"
                  className="tool-secondary-btn"
                  onClick={() => void handleDownloadDocx()}
                  disabled={isProcessing || !editorPlainText.trim()}
                >
                  <Download size={16} aria-hidden />
                  Download DOCX
                </button>
                <button
                  type="button"
                  className="tool-secondary-btn"
                  onClick={() => void handleGenerate()}
                  disabled={isProcessing}
                >
                  <RotateCw size={16} aria-hidden />
                  Regenerate
                </button>
                {showContinueWriting && (
                  <button
                    type="button"
                    className="tool-secondary-btn"
                    onClick={() => void handleContinue()}
                    disabled={isProcessing || !editorPlainText.trim()}
                  >
                    <Sparkles size={16} aria-hidden />
                    Continue writing
                  </button>
                )}
              </div>
            </div>
          </div>

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
                    {isOpen && <div className="tool-faq-answer">{faq.answer}</div>}
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
                          <span className="related-tool-desc">{tool.description}</span>
                        </span>
                        <ArrowRight className="related-tool-arrow" size={18} aria-hidden />
                      </Link>
                    ) : (
                      <a href={tool.href} className="related-tool-card">
                        <span className="related-tool-icon">
                          <Icon size={20} strokeWidth={2} aria-hidden />
                        </span>
                        <span className="related-tool-text">
                          <span className="related-tool-name">{tool.name}</span>
                          <span className="related-tool-desc">{tool.description}</span>
                        </span>
                        <ArrowRight className="related-tool-arrow" size={18} aria-hidden />
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
