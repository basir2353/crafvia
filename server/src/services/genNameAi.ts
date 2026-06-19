import { AppError } from '../middleware/errorHandler.js'
import { generateAiCompletion, isAiConfigured } from './aiProvider.js'
import { generateNamesLocal, type NameCategory } from './genProcess.js'

export async function generateNames(input: {
  category: NameCategory
  keyword?: string
  count: number
  useAi?: boolean
}): Promise<{ names: string[]; provider: string }> {
  const count = Math.min(30, Math.max(1, input.count))

  if (!input.useAi || !(await isAiConfigured())) {
    return {
      names: generateNamesLocal({
        category: input.category,
        keyword: input.keyword,
        count,
      }),
      provider: 'template',
    }
  }

  const keywordPart = input.keyword?.trim() ? ` incorporating the keyword "${input.keyword.trim()}"` : ''
  const prompt = `Generate exactly ${count} unique, creative ${input.category} names${keywordPart}.
Return only the names, one per line, without numbering or bullets.
Keep each name concise (1-4 words).`

  const content = await generateAiCompletion(
    [
      {
        role: 'system',
        content: 'You are a creative naming assistant. Output only name lines, nothing else.',
      },
      { role: 'user', content: prompt },
    ],
    500,
  )

  const names = content
    .split('\n')
    .map((line) => line.replace(/^\d+[\).\s-]+/, '').trim())
    .filter(Boolean)
    .slice(0, count)

  if (names.length === 0) {
    throw new AppError('AI returned no names. Try again.', 502)
  }

  while (names.length < count) {
    names.push(...generateNamesLocal({ category: input.category, keyword: input.keyword, count: 1 }))
    if (names.length > count * 2) break
  }

  return { names: [...new Set(names)].slice(0, count), provider: 'ai' }
}
