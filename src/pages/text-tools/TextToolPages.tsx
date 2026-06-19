import { useMemo, useState } from 'react'
import { processTextLocal } from '../../api/textTools'
import { TextOutputActions, TextToolShell } from '../../components/TextToolShell'
import {
  addLineNumbersConfig,
  binaryConverterConfig,
  caseConverterConfig,
  emojiPickerConfig,
  fancyTextConfig,
  findReplaceConfig,
  loremIpsumConfig,
  morseCodeConfig,
  readingTimeConfig,
  removeDuplicatesConfig,
  removeSpacesConfig,
  reverseTextConfig,
  sortLinesConfig,
  textDiffConfig,
  wordCounterConfig,
} from '../../config/textTools'
import { EMOJI_CATEGORIES } from '../../utils/textProcess'
import type {
  CaseType,
  EmojiCategory,
  FancyTextStyle,
  ReverseMode,
  SortOrder,
  SpaceCleanup,
} from '../../utils/textProcess'

function useTextToolState() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const resetMessages = () => {
    setError(null)
    setSuccess(null)
  }

  return { input, setInput, output, setOutput, error, setError, success, setSuccess, resetMessages }
}

export function WordCounterPage() {
  const { input, setInput, resetMessages } = useTextToolState()
  const stats = useMemo(
    () => processTextLocal('word-counter', { text: input }).stats,
    [input],
  )

  return (
    <TextToolShell config={wordCounterConfig}>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="word-counter-input">
          Your text
        </label>
        <textarea
          id="word-counter-input"
          className="tool-textarea"
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            resetMessages()
          }}
          placeholder="Paste or type text to count words, characters, and sentences…"
        />
        <div className="tool-text-counts">
          <span>Live count — runs in your browser</span>
        </div>
      </div>

      {stats && (
        <div className="tool-controls">
          <label className="tool-control-label">Statistics</label>
          <div className="pdf-file-info">
            <span className="pdf-file-meta">Words: {stats.words.toLocaleString()}</span>
            <span className="pdf-file-meta">Characters: {stats.characters.toLocaleString()}</span>
            <span className="pdf-file-meta">
              Characters (no spaces): {stats.charactersNoSpaces.toLocaleString()}
            </span>
            <span className="pdf-file-meta">Sentences: {stats.sentences.toLocaleString()}</span>
            <span className="pdf-file-meta">Paragraphs: {stats.paragraphs.toLocaleString()}</span>
            <span className="pdf-file-meta">Lines: {stats.lines.toLocaleString()}</span>
          </div>
        </div>
      )}
    </TextToolShell>
  )
}

export function CaseConverterPage() {
  const { input, setInput, output, setOutput, error, setError, success, setSuccess, resetMessages } =
    useTextToolState()
  const [caseType, setCaseType] = useState<CaseType>('upper')

  const handleConvert = () => {
    resetMessages()
    const result = processTextLocal('case-converter', { text: input, options: { caseType } })
    if (result.error) {
      setError(result.error)
      return
    }
    setOutput(result.output ?? '')
    setSuccess('Case converted successfully.')
  }

  return (
    <TextToolShell config={caseConverterConfig}>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="case-input">
          Input text
        </label>
        <textarea
          id="case-input"
          className="tool-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste text to convert…"
        />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="case-type">
          Case style
        </label>
        <select
          id="case-type"
          className="tool-select"
          value={caseType}
          onChange={(e) => setCaseType(e.target.value as CaseType)}
        >
          <option value="upper">UPPERCASE</option>
          <option value="lower">lowercase</option>
          <option value="title">Title Case</option>
          <option value="sentence">Sentence case</option>
          <option value="camel">camelCase</option>
          <option value="pascal">PascalCase</option>
          <option value="snake">snake_case</option>
          <option value="kebab">kebab-case</option>
          <option value="constant">CONSTANT_CASE</option>
        </select>
      </div>
      <button type="button" className="tool-compress-btn" onClick={handleConvert}>
        {caseConverterConfig.actionLabel}
      </button>
      {error && <p className="tool-error">{error}</p>}
      {success && (
        <div className="tool-result">
          <p className="tool-result-stats">{success}</p>
        </div>
      )}
      {output && (
        <div className="tool-controls">
          <label className="tool-control-label">Output</label>
          <textarea className="tool-textarea" value={output} readOnly />
          <TextOutputActions output={output} />
        </div>
      )}
    </TextToolShell>
  )
}

export function LoremIpsumPage() {
  const { output, setOutput, error, setError, success, setSuccess, resetMessages } = useTextToolState()
  const [paragraphs, setParagraphs] = useState(3)
  const [wordsPerParagraph, setWordsPerParagraph] = useState(50)

  const handleGenerate = () => {
    resetMessages()
    const result = processTextLocal('lorem-ipsum', {
      options: { paragraphs, wordsPerParagraph },
    })
    if (result.error) {
      setError(result.error)
      return
    }
    setOutput(result.output ?? '')
    setSuccess('Lorem Ipsum generated successfully.')
  }

  return (
    <TextToolShell config={loremIpsumConfig}>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="lorem-paragraphs">
          Paragraphs: {paragraphs}
        </label>
        <input
          id="lorem-paragraphs"
          type="range"
          min={1}
          max={10}
          value={paragraphs}
          onChange={(e) => setParagraphs(Number(e.target.value))}
          className="tool-slider"
        />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="lorem-words">
          Words per paragraph: {wordsPerParagraph}
        </label>
        <input
          id="lorem-words"
          type="range"
          min={10}
          max={150}
          value={wordsPerParagraph}
          onChange={(e) => setWordsPerParagraph(Number(e.target.value))}
          className="tool-slider"
        />
      </div>
      <button type="button" className="tool-compress-btn" onClick={handleGenerate}>
        {loremIpsumConfig.actionLabel}
      </button>
      {error && <p className="tool-error">{error}</p>}
      {success && (
        <div className="tool-result">
          <p className="tool-result-stats">{success}</p>
        </div>
      )}
      {output && (
        <div className="tool-controls">
          <label className="tool-control-label">Generated text</label>
          <textarea className="tool-textarea" value={output} readOnly rows={10} />
          <TextOutputActions output={output} />
        </div>
      )}
    </TextToolShell>
  )
}

export function RemoveDuplicatesPage() {
  const { input, setInput, output, setOutput, error, setError, success, setSuccess, resetMessages } =
    useTextToolState()
  const [caseSensitive, setCaseSensitive] = useState(false)

  const handleProcess = () => {
    resetMessages()
    const result = processTextLocal('remove-duplicates', {
      text: input,
      options: { caseSensitive },
    })
    if (result.error) {
      setError(result.error)
      return
    }
    setOutput(result.output ?? '')
    setSuccess('Duplicate lines removed successfully.')
  }

  return (
    <TextToolShell config={removeDuplicatesConfig}>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="dup-input">
          Input text (one item per line)
        </label>
        <textarea
          id="dup-input"
          className="tool-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste lines of text…"
        />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
          />{' '}
          Case sensitive matching
        </label>
      </div>
      <button type="button" className="tool-compress-btn" onClick={handleProcess}>
        {removeDuplicatesConfig.actionLabel}
      </button>
      {error && <p className="tool-error">{error}</p>}
      {success && (
        <div className="tool-result">
          <p className="tool-result-stats">{success}</p>
        </div>
      )}
      {output && (
        <div className="tool-controls">
          <label className="tool-control-label">Output</label>
          <textarea className="tool-textarea" value={output} readOnly />
          <TextOutputActions output={output} />
        </div>
      )}
    </TextToolShell>
  )
}

export function SortLinesPage() {
  const { input, setInput, output, setOutput, error, setError, success, setSuccess, resetMessages } =
    useTextToolState()
  const [order, setOrder] = useState<SortOrder>('asc')
  const [caseSensitive, setCaseSensitive] = useState(false)

  const handleProcess = () => {
    resetMessages()
    const result = processTextLocal('sort-lines', {
      text: input,
      options: { order, caseSensitive },
    })
    if (result.error) {
      setError(result.error)
      return
    }
    setOutput(result.output ?? '')
    setSuccess('Lines sorted successfully.')
  }

  return (
    <TextToolShell config={sortLinesConfig}>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="sort-input">
          Input text
        </label>
        <textarea
          id="sort-input"
          className="tool-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste lines to sort…"
        />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="sort-order">
          Sort order
        </label>
        <select
          id="sort-order"
          className="tool-select"
          value={order}
          onChange={(e) => setOrder(e.target.value as SortOrder)}
        >
          <option value="asc">A → Z</option>
          <option value="desc">Z → A</option>
        </select>
      </div>
      <div className="tool-controls">
        <label className="tool-control-label">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
          />{' '}
          Case sensitive sort
        </label>
      </div>
      <button type="button" className="tool-compress-btn" onClick={handleProcess}>
        {sortLinesConfig.actionLabel}
      </button>
      {error && <p className="tool-error">{error}</p>}
      {success && (
        <div className="tool-result">
          <p className="tool-result-stats">{success}</p>
        </div>
      )}
      {output && (
        <div className="tool-controls">
          <label className="tool-control-label">Output</label>
          <textarea className="tool-textarea" value={output} readOnly />
          <TextOutputActions output={output} />
        </div>
      )}
    </TextToolShell>
  )
}

export function ReverseTextPage() {
  const { input, setInput, output, setOutput, error, setError, success, setSuccess, resetMessages } =
    useTextToolState()
  const [mode, setMode] = useState<ReverseMode>('chars')

  const handleProcess = () => {
    resetMessages()
    const result = processTextLocal('reverse-text', { text: input, options: { mode } })
    if (result.error) {
      setError(result.error)
      return
    }
    setOutput(result.output ?? '')
    setSuccess('Text reversed successfully.')
  }

  return (
    <TextToolShell config={reverseTextConfig}>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="reverse-input">
          Input text
        </label>
        <textarea
          id="reverse-input"
          className="tool-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste text to reverse…"
        />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="reverse-mode">
          Reverse mode
        </label>
        <select
          id="reverse-mode"
          className="tool-select"
          value={mode}
          onChange={(e) => setMode(e.target.value as ReverseMode)}
        >
          <option value="chars">Character by character</option>
          <option value="words">Word by word</option>
          <option value="lines">Line by line</option>
        </select>
      </div>
      <button type="button" className="tool-compress-btn" onClick={handleProcess}>
        {reverseTextConfig.actionLabel}
      </button>
      {error && <p className="tool-error">{error}</p>}
      {success && (
        <div className="tool-result">
          <p className="tool-result-stats">{success}</p>
        </div>
      )}
      {output && (
        <div className="tool-controls">
          <label className="tool-control-label">Output</label>
          <textarea className="tool-textarea" value={output} readOnly />
          <TextOutputActions output={output} />
        </div>
      )}
    </TextToolShell>
  )
}

export function FindReplacePage() {
  const { input, setInput, output, setOutput, error, setError, success, setSuccess, resetMessages } =
    useTextToolState()
  const [find, setFind] = useState('')
  const [replace, setReplace] = useState('')
  const [useRegex, setUseRegex] = useState(false)
  const [caseSensitive, setCaseSensitive] = useState(true)

  const handleProcess = () => {
    resetMessages()
    if (!find) {
      setError('Please enter text to find.')
      return
    }
    try {
      const result = processTextLocal('find-replace', {
        text: input,
        options: { find, replace, useRegex, caseSensitive },
      })
      if (result.error) {
        setError(result.error)
        return
      }
      setOutput(result.output ?? '')
      setSuccess('Replace completed successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Replace failed.')
    }
  }

  return (
    <TextToolShell config={findReplaceConfig}>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="find-input">
          Input text
        </label>
        <textarea
          id="find-input"
          className="tool-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste text…"
        />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="find-value">
          Find
        </label>
        <input
          id="find-value"
          className="tool-select"
          value={find}
          onChange={(e) => setFind(e.target.value)}
          placeholder="Text or regex pattern to find"
        />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="replace-value">
          Replace with
        </label>
        <input
          id="replace-value"
          className="tool-select"
          value={replace}
          onChange={(e) => setReplace(e.target.value)}
          placeholder="Replacement text"
        />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label">
          <input type="checkbox" checked={useRegex} onChange={(e) => setUseRegex(e.target.checked)} />{' '}
          Use regular expression
        </label>
      </div>
      <div className="tool-controls">
        <label className="tool-control-label">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
          />{' '}
          Case sensitive
        </label>
      </div>
      <button type="button" className="tool-compress-btn" onClick={handleProcess}>
        {findReplaceConfig.actionLabel}
      </button>
      {error && <p className="tool-error">{error}</p>}
      {success && (
        <div className="tool-result">
          <p className="tool-result-stats">{success}</p>
        </div>
      )}
      {output && (
        <div className="tool-controls">
          <label className="tool-control-label">Output</label>
          <textarea className="tool-textarea" value={output} readOnly />
          <TextOutputActions output={output} />
        </div>
      )}
    </TextToolShell>
  )
}

export function AddLineNumbersPage() {
  const { input, setInput, output, setOutput, error, setError, success, setSuccess, resetMessages } =
    useTextToolState()
  const [startAt, setStartAt] = useState(1)
  const [separator, setSeparator] = useState('. ')

  const handleProcess = () => {
    resetMessages()
    const result = processTextLocal('add-line-numbers', {
      text: input,
      options: { startAt, separator },
    })
    if (result.error) {
      setError(result.error)
      return
    }
    setOutput(result.output ?? '')
    setSuccess('Line numbers added successfully.')
  }

  return (
    <TextToolShell config={addLineNumbersConfig}>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="line-input">
          Input text
        </label>
        <textarea
          id="line-input"
          className="tool-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste text to number…"
        />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="line-start">
          Start at
        </label>
        <input
          id="line-start"
          type="number"
          className="tool-select"
          min={1}
          value={startAt}
          onChange={(e) => setStartAt(Number(e.target.value))}
        />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="line-separator">
          Separator
        </label>
        <input
          id="line-separator"
          className="tool-select"
          value={separator}
          onChange={(e) => setSeparator(e.target.value)}
        />
      </div>
      <button type="button" className="tool-compress-btn" onClick={handleProcess}>
        {addLineNumbersConfig.actionLabel}
      </button>
      {error && <p className="tool-error">{error}</p>}
      {success && (
        <div className="tool-result">
          <p className="tool-result-stats">{success}</p>
        </div>
      )}
      {output && (
        <div className="tool-controls">
          <label className="tool-control-label">Output</label>
          <textarea className="tool-textarea" value={output} readOnly />
          <TextOutputActions output={output} />
        </div>
      )}
    </TextToolShell>
  )
}

export function RemoveSpacesPage() {
  const { input, setInput, output, setOutput, error, setError, success, setSuccess, resetMessages } =
    useTextToolState()
  const [mode, setMode] = useState<SpaceCleanup>('collapse-spaces')

  const handleProcess = () => {
    resetMessages()
    const result = processTextLocal('remove-spaces', { text: input, options: { mode } })
    if (result.error) {
      setError(result.error)
      return
    }
    setOutput(result.output ?? '')
    setSuccess('Whitespace cleaned successfully.')
  }

  return (
    <TextToolShell config={removeSpacesConfig}>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="space-input">
          Input text
        </label>
        <textarea
          id="space-input"
          className="tool-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste text with extra spaces…"
        />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="space-mode">
          Cleanup mode
        </label>
        <select
          id="space-mode"
          className="tool-select"
          value={mode}
          onChange={(e) => setMode(e.target.value as SpaceCleanup)}
        >
          <option value="collapse-spaces">Collapse extra spaces</option>
          <option value="trim-lines">Trim each line</option>
          <option value="normalize">Normalize all whitespace</option>
          <option value="remove-all">Remove all whitespace</option>
        </select>
      </div>
      <button type="button" className="tool-compress-btn" onClick={handleProcess}>
        {removeSpacesConfig.actionLabel}
      </button>
      {error && <p className="tool-error">{error}</p>}
      {success && (
        <div className="tool-result">
          <p className="tool-result-stats">{success}</p>
        </div>
      )}
      {output && (
        <div className="tool-controls">
          <label className="tool-control-label">Output</label>
          <textarea className="tool-textarea" value={output} readOnly />
          <TextOutputActions output={output} />
        </div>
      )}
    </TextToolShell>
  )
}

export function TextDiffPage() {
  const [textA, setTextA] = useState('')
  const [textB, setTextB] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleCompare = () => {
    setError(null)
    setSuccess(null)
    const result = processTextLocal('text-diff', { textA, textB })
    if (result.error) {
      setError(result.error)
      return
    }
    setOutput(result.output ?? '')
    setSuccess('Comparison complete.')
  }

  return (
    <TextToolShell config={textDiffConfig}>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="diff-a">
          Original text
        </label>
        <textarea
          id="diff-a"
          className="tool-textarea"
          value={textA}
          onChange={(e) => setTextA(e.target.value)}
          placeholder="Paste original version…"
        />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="diff-b">
          Updated text
        </label>
        <textarea
          id="diff-b"
          className="tool-textarea"
          value={textB}
          onChange={(e) => setTextB(e.target.value)}
          placeholder="Paste updated version…"
        />
      </div>
      <button type="button" className="tool-compress-btn" onClick={handleCompare}>
        {textDiffConfig.actionLabel}
      </button>
      {error && <p className="tool-error">{error}</p>}
      {success && (
        <div className="tool-result">
          <p className="tool-result-stats">{success}</p>
        </div>
      )}
      {output && (
        <div className="tool-controls">
          <label className="tool-control-label">Diff output (+ added, - removed)</label>
          <textarea className="tool-textarea" value={output} readOnly rows={12} spellCheck={false} />
          <TextOutputActions output={output} />
        </div>
      )}
    </TextToolShell>
  )
}

export function EmojiPickerPage() {
  const [copyMessage, setCopyMessage] = useState<string | null>(null)
  const [recent, setRecent] = useState<string[]>([])

  const handleCopy = async (emoji: string) => {
    try {
      await navigator.clipboard.writeText(emoji)
      setCopyMessage(`Copied ${emoji}`)
      setRecent((current) => [emoji, ...current.filter((e) => e !== emoji)].slice(0, 12))
    } catch {
      setCopyMessage('Unable to copy emoji.')
    }
  }

  return (
    <TextToolShell config={emojiPickerConfig}>
      {copyMessage && (
        <div className="tool-result">
          <p className="tool-result-stats">{copyMessage}</p>
        </div>
      )}
      {recent.length > 0 && (
        <div className="tool-controls">
          <label className="tool-control-label">Recently copied</label>
          <div className="tool-editor-actions">
            {recent.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="tool-secondary-btn"
                onClick={() => void handleCopy(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
      {EMOJI_CATEGORIES.map((category: EmojiCategory) => (
        <div key={category.name} className="tool-controls">
          <label className="tool-control-label">{category.name}</label>
          <div className="tool-editor-actions">
            {category.emojis.map((emoji: string) => (
              <button
                key={`${category.name}-${emoji}`}
                type="button"
                className="tool-secondary-btn"
                onClick={() => void handleCopy(emoji)}
                title={`Copy ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ))}
    </TextToolShell>
  )
}

export function FancyTextPage() {
  const { input, setInput, output, setOutput, error, setError, success, setSuccess, resetMessages } =
    useTextToolState()
  const [style, setStyle] = useState<FancyTextStyle>('bold')

  const handleProcess = () => {
    resetMessages()
    if (!input.trim()) {
      setError('Please enter text to stylize.')
      return
    }
    const result = processTextLocal('fancy-text', { text: input, options: { style } })
    if (result.error) {
      setError(result.error)
      return
    }
    setOutput(result.output ?? '')
    setSuccess('Fancy text generated successfully.')
  }

  return (
    <TextToolShell config={fancyTextConfig}>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="fancy-input">
          Input text
        </label>
        <textarea
          id="fancy-input"
          className="tool-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to stylize…"
        />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="fancy-style">
          Style
        </label>
        <select
          id="fancy-style"
          className="tool-select"
          value={style}
          onChange={(e) => setStyle(e.target.value as FancyTextStyle)}
        >
          <option value="bold">Bold</option>
          <option value="italic">Italic</option>
          <option value="script">Script</option>
          <option value="fraktur">Fraktur</option>
          <option value="monospace">Monospace</option>
          <option value="double">Double-struck</option>
          <option value="circled">Circled</option>
          <option value="squared">Squared</option>
          <option value="fullwidth">Fullwidth</option>
        </select>
      </div>
      <button type="button" className="tool-compress-btn" onClick={handleProcess}>
        {fancyTextConfig.actionLabel}
      </button>
      {error && <p className="tool-error">{error}</p>}
      {success && (
        <div className="tool-result">
          <p className="tool-result-stats">{success}</p>
        </div>
      )}
      {output && (
        <div className="tool-controls">
          <label className="tool-control-label">Output</label>
          <textarea className="tool-textarea" value={output} readOnly />
          <TextOutputActions output={output} />
        </div>
      )}
    </TextToolShell>
  )
}

export function MorseCodePage() {
  const { input, setInput, output, setOutput, error, setError, success, setSuccess, resetMessages } =
    useTextToolState()
  const [direction, setDirection] = useState<'encode' | 'decode'>('encode')

  const handleProcess = () => {
    resetMessages()
    if (!input.trim()) {
      setError('Please enter text or Morse code.')
      return
    }
    const result = processTextLocal('morse-code', { text: input, options: { direction } })
    if (result.error) {
      setError(result.error)
      return
    }
    setOutput(result.output ?? '')
    setSuccess('Conversion completed successfully.')
  }

  return (
    <TextToolShell config={morseCodeConfig}>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="morse-direction">
          Mode
        </label>
        <select
          id="morse-direction"
          className="tool-select"
          value={direction}
          onChange={(e) => setDirection(e.target.value as 'encode' | 'decode')}
        >
          <option value="encode">Text → Morse</option>
          <option value="decode">Morse → Text</option>
        </select>
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="morse-input">
          Input
        </label>
        <textarea
          id="morse-input"
          className="tool-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={direction === 'encode' ? 'Enter text…' : 'Enter Morse code (dots and dashes)…'}
        />
      </div>
      <button type="button" className="tool-compress-btn" onClick={handleProcess}>
        {morseCodeConfig.actionLabel}
      </button>
      {error && <p className="tool-error">{error}</p>}
      {success && (
        <div className="tool-result">
          <p className="tool-result-stats">{success}</p>
        </div>
      )}
      {output && (
        <div className="tool-controls">
          <label className="tool-control-label">Output</label>
          <textarea className="tool-textarea" value={output} readOnly />
          <TextOutputActions output={output} />
        </div>
      )}
    </TextToolShell>
  )
}

export function BinaryConverterPage() {
  const { input, setInput, output, setOutput, error, setError, success, setSuccess, resetMessages } =
    useTextToolState()
  const [direction, setDirection] = useState<'encode' | 'decode'>('encode')

  const handleProcess = () => {
    resetMessages()
    if (!input.trim()) {
      setError('Please enter text or binary.')
      return
    }
    try {
      const result = processTextLocal('binary-converter', {
        text: input,
        options: { direction, separator: ' ' },
      })
      if (result.error) {
        setError(result.error)
        return
      }
      setOutput(result.output ?? '')
      setSuccess('Conversion completed successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed.')
    }
  }

  return (
    <TextToolShell config={binaryConverterConfig}>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="binary-direction">
          Mode
        </label>
        <select
          id="binary-direction"
          className="tool-select"
          value={direction}
          onChange={(e) => setDirection(e.target.value as 'encode' | 'decode')}
        >
          <option value="encode">Text → Binary</option>
          <option value="decode">Binary → Text</option>
        </select>
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="binary-input">
          Input
        </label>
        <textarea
          id="binary-input"
          className="tool-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={direction === 'encode' ? 'Enter text…' : 'Enter binary (0s and 1s)…'}
          spellCheck={false}
        />
      </div>
      <button type="button" className="tool-compress-btn" onClick={handleProcess}>
        {binaryConverterConfig.actionLabel}
      </button>
      {error && <p className="tool-error">{error}</p>}
      {success && (
        <div className="tool-result">
          <p className="tool-result-stats">{success}</p>
        </div>
      )}
      {output && (
        <div className="tool-controls">
          <label className="tool-control-label">Output</label>
          <textarea className="tool-textarea" value={output} readOnly spellCheck={false} />
          <TextOutputActions output={output} />
        </div>
      )}
    </TextToolShell>
  )
}

export function ReadingTimePage() {
  const { input, setInput } = useTextToolState()
  const [wpm, setWpm] = useState(200)

  const result = useMemo(
    () => processTextLocal('reading-time', { text: input, options: { wpm } }),
    [input, wpm],
  )

  return (
    <TextToolShell config={readingTimeConfig}>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="reading-input">
          Your text
        </label>
        <textarea
          id="reading-input"
          className="tool-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste text to estimate reading time…"
        />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="reading-wpm">
          Reading speed: {wpm} WPM
        </label>
        <input
          id="reading-wpm"
          type="range"
          min={100}
          max={400}
          step={10}
          value={wpm}
          onChange={(e) => setWpm(Number(e.target.value))}
          className="tool-slider"
        />
      </div>
      {result.readingTime && (
        <div className="tool-controls">
          <label className="tool-control-label">Estimated reading time</label>
          <div className="pdf-file-info">
            <span className="pdf-file-meta">
              {result.readingTime.minutes > 0
                ? `${result.readingTime.minutes} min ${result.readingTime.seconds} sec`
                : `${result.readingTime.seconds} sec`}
            </span>
            <span className="pdf-file-meta">
              {result.readingTime.words.toLocaleString()} words at {result.readingTime.wpm} WPM
            </span>
          </div>
        </div>
      )}
    </TextToolShell>
  )
}
