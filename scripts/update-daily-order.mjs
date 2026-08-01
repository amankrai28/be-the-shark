// Maintains the pinned daily-pitch order (src/data/dailyOrder.json).
//
// The daily schedule is an explicit list of pitch ids, NOT a live shuffle of
// the dataset — so adding new pitches can never reshuffle days that players
// have already seen. New pitch ids are appended (deterministically shuffled)
// to the END of the cycle; existing entries are never moved or removed, even
// if a pitch is later dropped from the dataset (dailyPitch skips dead ids).
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const ORDER_PATH = join(root, 'src', 'data', 'dailyOrder.json')

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seededShuffle(arr, seed) {
  const out = [...arr]
  const rand = mulberry32(seed)
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

const pitches = JSON.parse(readFileSync(join(root, 'data', 'pitches.json'), 'utf8'))
const allIds = pitches.map((p) => p.id)

let order
if (existsSync(ORDER_PATH)) {
  order = JSON.parse(readFileSync(ORDER_PATH, 'utf8'))
} else {
  // First run: reproduce the exact order the live app used before pinning
  // (seededOrder over the launch dataset, seed 20260101) so no live day shifts.
  const DAILY_SEED = 20260101
  // faithful port of seededOrder from src/lib/dailyPitch.ts:
  const n = pitches.length
  const ord = Array.from({ length: n }, (_, i) => i)
  const rand = mulberry32(DAILY_SEED)
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[ord[i], ord[j]] = [ord[j], ord[i]]
  }
  order = ord.map((i) => pitches[i].id)
}

const known = new Set(order)
const newIds = allIds.filter((id) => !known.has(id))
if (newIds.length > 0) {
  order = order.concat(seededShuffle(newIds, 20260101 + order.length))
  console.log(`appended ${newIds.length} new pitch ids to the daily order`)
} else {
  console.log('no new pitches to append')
}

writeFileSync(ORDER_PATH, JSON.stringify(order))
console.log(`daily order: ${order.length} entries -> src/data/dailyOrder.json`)
