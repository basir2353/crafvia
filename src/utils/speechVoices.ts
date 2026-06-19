import type { EdgeVoice } from './edgeTtsBrowser'

export type LanguageOption = {
  code: string
  label: string
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'all', label: 'All languages' },
  { code: 'en', label: 'English' },
  { code: 'ur', label: 'Urdu' },
  { code: 'ar', label: 'Arabic' },
  { code: 'hi', label: 'Hindi' },
  { code: 'pa', label: 'Punjabi' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'es', label: 'Spanish' },
  { code: 'it', label: 'Italian' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'ru', label: 'Russian' },
  { code: 'tr', label: 'Turkish' },
  { code: 'bn', label: 'Bengali' },
  { code: 'fa', label: 'Persian' },
]

export type GenderFilter = 'all' | 'female' | 'male'

const LANGUAGE_LOCALE_PREFIXES: Record<string, string[]> = {
  en: ['en-'],
  ur: ['ur-'],
  ar: ['ar-'],
  hi: ['hi-'],
  pa: ['pa-', 'hi-'],
  fr: ['fr-'],
  de: ['de-'],
  es: ['es-'],
  it: ['it-'],
  pt: ['pt-'],
  zh: ['zh-'],
  ja: ['ja-'],
  ko: ['ko-'],
  ru: ['ru-'],
  tr: ['tr-'],
  bn: ['bn-'],
  fa: ['fa-'],
}

const LANGUAGE_FALLBACKS: Record<string, string[]> = {
  pa: ['pa', 'hi'],
}

const PREFERRED_VOICE_NAMES: Partial<Record<string, string[]>> = {
  en: ['en-US-JennyNeural', 'en-US-AriaNeural', 'en-GB-SoniaNeural', 'en-US-GuyNeural'],
  ur: ['ur-PK-UzmaNeural', 'ur-PK-AsadNeural', 'ur-IN-GulNeural', 'ur-IN-SalmanNeural'],
  ar: ['ar-SA-ZariyahNeural', 'ar-EG-SalmaNeural', 'ar-AE-FatimaNeural', 'ar-SA-HamedNeural'],
  hi: ['hi-IN-SwaraNeural', 'hi-IN-MadhurNeural'],
  pa: ['hi-IN-SwaraNeural', 'hi-IN-MadhurNeural'],
  fr: ['fr-FR-DeniseNeural', 'fr-FR-HenriNeural', 'fr-FR-VivienneMultilingualNeural'],
  de: ['de-DE-KatjaNeural', 'de-DE-ConradNeural', 'de-DE-SeraphinaMultilingualNeural'],
  es: ['es-ES-ElviraNeural', 'es-MX-DaliaNeural', 'es-ES-AlvaroNeural'],
  it: ['it-IT-ElsaNeural', 'it-IT-IsabellaNeural', 'it-IT-GiuseppeMultilingualNeural'],
  pt: ['pt-BR-FranciscaNeural', 'pt-PT-RaquelNeural', 'pt-BR-ThalitaMultilingualNeural'],
  zh: ['zh-CN-XiaoxiaoNeural', 'zh-CN-YunxiNeural', 'zh-TW-HsiaoChenNeural'],
  ja: ['ja-JP-NanamiNeural', 'ja-JP-KeitaNeural'],
  ko: ['ko-KR-SunHiNeural', 'ko-KR-HyunsuMultilingualNeural'],
  ru: ['ru-RU-SvetlanaNeural', 'ru-RU-DmitryNeural'],
  tr: ['tr-TR-EmelNeural', 'tr-TR-AhmetNeural'],
  bn: ['bn-IN-TanishaaNeural', 'bn-BD-NabanitaNeural', 'bn-IN-BashkarNeural'],
  fa: ['fa-IR-DilaraNeural', 'fa-IR-FaridNeural'],
}

const MULTILINGUAL_FALLBACK_VOICES = [
  'en-US-AvaMultilingualNeural',
  'en-US-AndrewMultilingualNeural',
  'en-US-EmmaMultilingualNeural',
]

const URDU_MARKERS = /[\u0679\u0688\u0691\u06BA\u06BE\u06C1\u06D2\u06AF\u06CC\u067E\u0686\u0698\u06A9]/
const PERSIAN_MARKERS = /[\u06AF\u067E\u0686\u0698]/
const GURMUKHI_RANGE = /[\u0A00-\u0A7F]/
const ARABIC_SCRIPT_RANGE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/
const DEVANAGARI_RANGE = /[\u0900-\u097F]/
const BENGALI_RANGE = /[\u0980-\u09FF]/
const CYRILLIC_RANGE = /[\u0400-\u04FF]/
const CJK_RANGE = /[\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/
const LATIN_RANGE = /[A-Za-z\u00C0-\u024F]/

function countPatternMatches(text: string, pattern: RegExp): number {
  const matches = text.match(new RegExp(pattern.source, 'g'))
  return matches?.length ?? 0
}

function matchesLanguage(locale: string, languageCode: string): boolean {
  const normalized = locale.toLowerCase().replace('_', '-')
  const prefixes = LANGUAGE_LOCALE_PREFIXES[languageCode]
  if (prefixes) {
    return prefixes.some((prefix) => normalized.startsWith(prefix))
  }
  const code = languageCode.toLowerCase()
  return normalized.startsWith(`${code}-`) || normalized === code
}

function matchesGender(voice: EdgeVoice, gender: GenderFilter): boolean {
  if (gender === 'all') return true
  return voice.Gender.toLowerCase() === gender
}

function isAvailableVoice(voice: EdgeVoice): boolean {
  return voice.Status === 'GA'
}

export function detectLanguageFromText(text: string): string | null {
  const trimmed = text.trim()
  if (!trimmed) return null

  const scores: Record<string, number> = {}

  const urduMarkers = countPatternMatches(trimmed, URDU_MARKERS)
  const persianMarkers = countPatternMatches(trimmed, PERSIAN_MARKERS)
  const gurmukhi = countPatternMatches(trimmed, GURMUKHI_RANGE)
  const arabicScript = countPatternMatches(trimmed, ARABIC_SCRIPT_RANGE)
  const devanagari = countPatternMatches(trimmed, DEVANAGARI_RANGE)
  const bengali = countPatternMatches(trimmed, BENGALI_RANGE)
  const cyrillic = countPatternMatches(trimmed, CYRILLIC_RANGE)
  const cjk = countPatternMatches(trimmed, CJK_RANGE)
  const latin = countPatternMatches(trimmed, LATIN_RANGE)

  if (gurmukhi > 0) scores.pa = gurmukhi
  if (devanagari > 0) scores.hi = devanagari
  if (bengali > 0) scores.bn = bengali
  if (cyrillic > 0) scores.ru = cyrillic
  if (cjk > 0) {
    if (/[\u3040-\u30FF]/.test(trimmed)) scores.ja = cjk
    else if (/[\uAC00-\uD7AF]/.test(trimmed)) scores.ko = cjk
    else scores.zh = cjk
  }

  if (arabicScript > 0) {
    if (urduMarkers > 0) {
      scores.ur = arabicScript + urduMarkers * 2
    } else if (persianMarkers > 0) {
      scores.fa = arabicScript + persianMarkers * 2
    } else {
      scores.ar = arabicScript
      scores.ur = arabicScript * 0.35
    }
  }

  if (latin > 0) {
    scores.en = latin
    if (/[àâçéèêëîïôùûüœæ]/i.test(trimmed)) scores.fr = (scores.fr ?? 0) + latin * 0.4
    if (/[äöüß]/i.test(trimmed)) scores.de = (scores.de ?? 0) + latin * 0.4
    if (/[ñ¿¡]/i.test(trimmed)) scores.es = (scores.es ?? 0) + latin * 0.4
    if (/[ąćęłńóśźż]/i.test(trimmed)) scores.pl = (scores.pl ?? 0) + latin * 0.2
    if (/[ğışöüç]/i.test(trimmed)) scores.tr = (scores.tr ?? 0) + latin * 0.5
  }

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1])
  if (ranked.length === 0) return 'en'
  if (ranked[0][1] < 2 && latin > 0) return 'en'
  return ranked[0][0]
}

export function isTextLikelyCompatible(text: string, languageCode: string): boolean {
  const detected = detectLanguageFromText(text)
  if (!detected || detected === languageCode) return true

  const crossCompatible: Record<string, string[]> = {
    en: ['fr', 'de', 'es', 'it', 'pt', 'tr'],
    ur: ['ar', 'fa'],
    ar: ['ur', 'fa'],
    fa: ['ur', 'ar'],
    pa: ['hi'],
    hi: ['pa'],
  }

  return crossCompatible[languageCode]?.includes(detected) ?? false
}

export function filterVoices(
  voices: EdgeVoice[],
  languageCode: string,
  gender: GenderFilter,
): EdgeVoice[] {
  const languageCodes =
    languageCode === 'all'
      ? ['all']
      : LANGUAGE_FALLBACKS[languageCode] ?? [languageCode]

  return voices.filter((voice) => {
    if (!isAvailableVoice(voice)) return false
    if (!matchesGender(voice, gender)) return false

    if (languageCode === 'all') return true

    return languageCodes.some((code) => matchesLanguage(voice.Locale, code))
  })
}

export function sortVoicesByPreference(
  voices: EdgeVoice[],
  languageCode: string,
): EdgeVoice[] {
  const preferred = PREFERRED_VOICE_NAMES[languageCode] ?? []
  return [...voices].sort((a, b) => {
    const aIndex = preferred.indexOf(a.ShortName)
    const bIndex = preferred.indexOf(b.ShortName)
    const aScore = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex
    const bScore = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex
    if (aScore !== bScore) return aScore - bScore
    return a.FriendlyName.localeCompare(b.FriendlyName)
  })
}

export function getBestVoice(
  voices: EdgeVoice[],
  languageCode: string,
  gender: GenderFilter,
  preferredShortName?: string,
): EdgeVoice | null {
  const filtered = sortVoicesByPreference(
    filterVoices(voices, languageCode, gender),
    languageCode,
  )

  if (filtered.length === 0) return null

  if (preferredShortName) {
    const preferred = filtered.find((voice) => voice.ShortName === preferredShortName)
    if (preferred) return preferred
  }

  return filtered[0]
}

export function getVoiceFallbackChain(
  voices: EdgeVoice[],
  languageCode: string,
  gender: GenderFilter,
  primaryVoice?: EdgeVoice | null,
): EdgeVoice[] {
  const compatible = sortVoicesByPreference(
    filterVoices(voices, languageCode, gender),
    languageCode,
  )

  const chain: EdgeVoice[] = []
  const seen = new Set<string>()

  const addVoice = (voice: EdgeVoice | null | undefined) => {
    if (!voice || seen.has(voice.ShortName)) return
    seen.add(voice.ShortName)
    chain.push(voice)
  }

  addVoice(primaryVoice)

  for (const voice of compatible) {
    addVoice(voice)
  }

  const multilingual = voices.filter(
    (voice) =>
      isAvailableVoice(voice) &&
      matchesGender(voice, gender) &&
      MULTILINGUAL_FALLBACK_VOICES.includes(voice.ShortName),
  )

  for (const shortName of MULTILINGUAL_FALLBACK_VOICES) {
    addVoice(multilingual.find((voice) => voice.ShortName === shortName))
  }

  return chain
}

export function getDefaultVoice(voices: EdgeVoice[]): EdgeVoice | null {
  return getBestVoice(voices, 'en', 'all')
}

export function resolveLanguageForText(
  text: string,
  selectedLanguage: string,
  languageAuto: boolean,
): string {
  const detected = detectLanguageFromText(text)
  if (languageAuto && detected) return detected
  if (detected && !isTextLikelyCompatible(text, selectedLanguage)) return detected
  return selectedLanguage
}

export function countWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0

  const spacedWords = trimmed.split(/\s+/).filter(Boolean)
  if (spacedWords.length > 1) return spacedWords.length

  const cjkChars = trimmed.match(CJK_RANGE)
  if (cjkChars && cjkChars.length > 1) return cjkChars.length

  return spacedWords.length || 1
}
