// Build-time data prep: reads the canonical dataset (data/pitches.json) and
// emits the game copy (src/data/pitches.game.json) with company/founder names
// obfuscated (XOR + base64 — deterrence, not security) and dead fields dropped.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const KEY = 'betheshark'

export function encodeName(name) {
  if (!name) return ''
  const utf8 = unescape(encodeURIComponent(name))
  let out = ''
  for (let i = 0; i < utf8.length; i++) {
    out += String.fromCharCode(utf8.charCodeAt(i) ^ KEY.charCodeAt(i % KEY.length))
  }
  return Buffer.from(out, 'binary').toString('base64')
}

export function prepare(pitches) {
  return pitches.map((p) => {
    const { employees, companyName, founderName, ...rest } = p
    return { ...rest, companyName: encodeName(companyName), founderName: encodeName(founderName) }
  })
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())
if (isMain) {
  const pitches = JSON.parse(readFileSync(join(root, 'data', 'pitches.json'), 'utf8'))
  const out = prepare(pitches)
  mkdirSync(join(root, 'src', 'data'), { recursive: true })
  writeFileSync(join(root, 'src', 'data', 'pitches.game.json'), JSON.stringify(out))
  console.log(`prepared ${out.length} pitches -> src/data/pitches.game.json`)
}
