import fs from 'fs'
import path from 'path'

const transcript =
  'C:/Users/COMPUTER PANEL/.cursor/projects/e-Archive-2-1/agent-transcripts/87bed04c-691c-44ec-979f-91cb6b1bacb1/87bed04c-691c-44ec-979f-91cb6b1bacb1.jsonl'

const targets = [
  'src/utils/convertProcess.ts',
  'server/src/services/currencyRates.ts',
  'server/src/validators/convert.ts',
  'server/src/routes/convert.ts',
  'src/api/convertTools.ts',
  'src/config/convertTools.ts',
  'src/components/ConvertToolShell.tsx',
  'src/pages/converters/ConvertToolPages.tsx',
]

const lines = fs.readFileSync(transcript, 'utf8').split('\n')
const found = new Map()

for (const line of lines) {
  if (!line.includes('"Write"')) continue
  try {
    const obj = JSON.parse(line)
    const writes = obj.message?.content?.filter((c) => c.type === 'tool_use' && c.name === 'Write') ?? []
    for (const w of writes) {
      const p = w.input?.path?.replace(/\\/g, '/')
      if (!p) continue
      const normalized = p
        .replace(/^E:\/Archive \(2\) \(1\)\//i, '')
        .replace(/^e:\/archive \(2\) \(1\)\//i, '')
        .toLowerCase()
      for (const t of targets) {
        if (normalized.endsWith(t.toLowerCase())) {
          if (!found.has(t) || (w.input.contents?.length ?? 0) > (found.get(t).length ?? 0)) {
            found.set(t, w.input.contents ?? '')
          }
        }
      }
    }
  } catch {
    // skip
  }
}

const root = 'E:/Archive (2) (1)'
for (const [rel, contents] of found) {
  const out = path.join(root, rel)
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, contents, 'utf8')
  console.log('restored', rel, contents.length, 'chars')
}

for (const t of targets) {
  if (!found.has(t)) console.log('MISSING', t)
}
