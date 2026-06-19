function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function markdownToHtml(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const html: string[] = []
  let inList = false

  const closeList = () => {
    if (inList) {
      html.push('</ul>')
      inList = false
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed) {
      closeList()
      continue
    }

    if (trimmed.startsWith('### ')) {
      closeList()
      html.push(`<h3>${escapeHtml(trimmed.slice(4))}</h3>`)
      continue
    }

    if (trimmed.startsWith('## ')) {
      closeList()
      html.push(`<h2>${escapeHtml(trimmed.slice(3))}</h2>`)
      continue
    }

    if (trimmed.startsWith('# ')) {
      closeList()
      html.push(`<h1>${escapeHtml(trimmed.slice(2))}</h1>`)
      continue
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        html.push('<ul>')
        inList = true
      }
      html.push(`<li>${escapeHtml(trimmed.slice(2))}</li>`)
      continue
    }

    closeList()
    html.push(`<p>${escapeHtml(trimmed)}</p>`)
  }

  closeList()
  return html.join('')
}

export function htmlToPlainText(html: string): string {
  const container = document.createElement('div')
  container.innerHTML = html
  return container.innerText.replace(/\n{3,}/g, '\n\n').trim()
}
