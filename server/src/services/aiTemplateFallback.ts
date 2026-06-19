function extractTopic(prompt: string): string {
  const topicMatch = prompt.match(/Topic or instructions:\s*(.+)/i)
  if (topicMatch?.[1]) return topicMatch[1].trim()

  const sourceMatch = prompt.match(/Source text:\s*[\r\n]+---[\r\n]+([\s\S]*?)[\r\n]+---/i)
  if (sourceMatch?.[1]) {
    return sourceMatch[1].trim().slice(0, 120)
  }

  return prompt.trim().slice(0, 120) || 'your topic'
}

function extractWordTarget(prompt: string): number {
  const match = prompt.match(/about (\d+) words/i)
  return match ? Number(match[1]) : 300
}

function buildParagraphs(topic: string, tone: string, count: number): string[] {
  const openers = [
    `${topic} matters because it helps readers understand the subject clearly and act with confidence.`,
    `When approaching ${topic}, a ${tone} perspective keeps the message focused and useful.`,
    `Strong content about ${topic} combines practical advice with clear structure.`,
    `Readers looking into ${topic} usually want actionable ideas they can apply immediately.`,
    `A well-written piece on ${topic} should answer key questions while staying easy to scan.`,
  ]

  const paragraphs: string[] = []
  for (let index = 0; index < count; index += 1) {
    paragraphs.push(openers[index % openers.length])
  }
  return paragraphs
}

export function generateTemplateFallback(userPrompt: string, _maxTokens: number): string {
  const topic = extractTopic(userPrompt)
  const wordTarget = extractWordTarget(userPrompt)
  const toneMatch = userPrompt.match(/Tone:\s*([^\n.]+)/i)
  const tone = toneMatch?.[1]?.trim() || 'professional'
  const paragraphCount = Math.max(3, Math.min(8, Math.ceil(wordTarget / 90)))

  const isImprovement = /rewrite|expand|shorten|grammar|readability|clarity|professionalism|seo|summarize|translate|humanize|improve/i.test(
    userPrompt,
  )

  const title = isImprovement ? 'Improved Content' : 'Generated Content'
  const paragraphs = buildParagraphs(topic, tone, paragraphCount)

  const bullets = [
    `Define the main goal around ${topic}`,
    `Use a ${tone} voice throughout the content`,
    `Break complex ideas into short, readable sections`,
    `End with a clear takeaway or next step`,
  ]

  return [
    `## ${title}`,
    '',
    `### Introduction`,
    paragraphs[0],
    '',
    `### Key Points`,
    ...bullets.map((item) => `- ${item}`),
    '',
    `### Main Content`,
    ...paragraphs.slice(1).map((paragraph) => paragraph),
    '',
    `### Conclusion`,
    `This draft gives you a structured starting point about ${topic}. Edit it in the editor, regenerate for another version, or add your API key in server/.env for full AI-powered writing.`,
    '',
    `_Generated in local fallback mode. Add GROQ_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY for real AI output._`,
  ].join('\n')
}
