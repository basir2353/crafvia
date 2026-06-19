import { minifyCss, minifyHtml, minifyJs } from './devProcess'
import { minifyJsonText } from './jsonFormat'

export type CompressToolSlug =
  | 'compress-webp'
  | 'compress-gif'
  | 'compress-svg'
  | 'compress-audio'
  | 'compress-zip'
  | 'compress-html'
  | 'compress-css'
  | 'compress-js'
  | 'compress-json'
  | 'compress-xml'

export type CompressToolRequest = {
  text?: string
  options?: Record<string, unknown>
}

export type CompressToolResponse = {
  output?: string
  error?: string
  meta?: Record<string, unknown>
}

function compressionMeta(original: string, output: string): Record<string, unknown> {
  const originalBytes = new Blob([original]).size
  const outputBytes = new Blob([output]).size
  const savedBytes = Math.max(0, originalBytes - outputBytes)
  const savedPercent =
    originalBytes > 0 ? Math.round((savedBytes / originalBytes) * 100) : 0
  return { originalBytes, outputBytes, savedBytes, savedPercent }
}

export function minifyXml(xml: string): string {
  return xml
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export function minifySvg(svg: string): string {
  return svg
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\?xml[^?]*\?>\s*/i, (m) => m.trim())
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .replace(/\s*([=/>])\s*/g, '$1')
    .trim()
}

export function processCompressTool(
  slug: CompressToolSlug,
  request: CompressToolRequest,
): CompressToolResponse {
  const text = request.text ?? ''

  switch (slug) {
    case 'compress-html': {
      if (!text.trim()) return { error: 'Enter HTML to minify.' }
      const output = minifyHtml(text)
      return { output, meta: compressionMeta(text, output) }
    }
    case 'compress-css': {
      if (!text.trim()) return { error: 'Enter CSS to minify.' }
      const output = minifyCss(text)
      return { output, meta: compressionMeta(text, output) }
    }
    case 'compress-js': {
      if (!text.trim()) return { error: 'Enter JavaScript to minify.' }
      const output = minifyJs(text)
      return { output, meta: compressionMeta(text, output) }
    }
    case 'compress-json': {
      if (!text.trim()) return { error: 'Enter JSON to minify.' }
      const result = minifyJsonText(text)
      if ('message' in result) {
        return {
          error: `Invalid JSON at line ${result.line}, column ${result.column}: ${result.message}`,
        }
      }
      return { output: result.formatted, meta: compressionMeta(text, result.formatted) }
    }
    case 'compress-xml': {
      if (!text.trim()) return { error: 'Enter XML to minify.' }
      const output = minifyXml(text)
      return { output, meta: compressionMeta(text, output) }
    }
    case 'compress-svg': {
      if (!text.trim()) return { error: 'Enter SVG markup to optimize.' }
      if (!/<svg[\s>]/i.test(text)) return { error: 'Input does not look like SVG markup.' }
      const output = minifySvg(text)
      return { output, meta: compressionMeta(text, output) }
    }
    case 'compress-webp':
    case 'compress-gif':
    case 'compress-audio':
    case 'compress-zip':
      return { error: 'This tool requires file upload in the browser.' }
    default:
      return { error: 'Unknown compressor tool.' }
  }
}
