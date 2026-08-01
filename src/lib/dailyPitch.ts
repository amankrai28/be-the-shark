import type { Pitch } from '../types'
import pinnedOrder from '../data/dailyOrder.json'

/**
 * All daily-game time math is pinned to IST (UTC+5:30) so every player in the
 * world sees the same pitch on the same "day", regardless of device timezone.
 */
const IST_OFFSET_MS = 330 * 60 * 1000
/** 2026-01-01T00:00 IST — pitch #1's day. */
const EPOCH_MS = Date.UTC(2025, 11, 31, 18, 30)
const DAY_MS = 86_400_000

/** 1-based day number since the epoch; this IS the public "Pitch #N". */
export function pitchNumber(now: Date = new Date()): number {
  return Math.floor((now.getTime() - EPOCH_MS) / DAY_MS) + 1
}

/** YYYY-MM-DD of the IST calendar day — used for streak / once-a-day keys. */
export function istDateString(now: Date = new Date()): string {
  const shifted = new Date(now.getTime() + IST_OFFSET_MS)
  const y = shifted.getUTCFullYear()
  const m = String(shifted.getUTCMonth() + 1).padStart(2, '0')
  const d = String(shifted.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** IST date string of the day before the given moment. */
export function istYesterdayString(now: Date = new Date()): string {
  return istDateString(new Date(now.getTime() - DAY_MS))
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Deterministic Fisher–Yates: same seed + same length → same order, forever. */
export function seededOrder(length: number, seed: number): number[] {
  const order = Array.from({ length }, (_, i) => i)
  const rand = mulberry32(seed)
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return order
}

const PRACTICE_SEED = 79190831

/**
 * The daily schedule is PINNED: an explicit pitch-id list committed at
 * src/data/dailyOrder.json (maintained by scripts/update-daily-order.mjs).
 * New pitches append to the end of the cycle, so days players have already
 * seen can never reshuffle. Ids no longer present in the dataset are skipped
 * deterministically.
 */
export function dailyPitch(
  pitches: Pitch[],
  day: number = pitchNumber(),
  order: number[] = pinnedOrder as number[],
): Pitch {
  const byId = new Map(pitches.map((p) => [p.id, p]))
  const n = order.length
  let idx = (((day - 1) % n) + n) % n
  for (let hops = 0; hops < n; hops++) {
    const pitch = byId.get(order[idx])
    if (pitch) return pitch
    idx = (idx + 1) % n
  }
  return pitches[0]
}

/**
 * Practice pitch for a given day + slot (0–2). Uses an independent shuffled
 * order and never serves that day's daily pitch (spoiler guard).
 */
export function practicePitch(
  pitches: Pitch[],
  slot: number,
  day: number = pitchNumber(),
  dailyOrder?: number[],
): Pitch {
  const order = seededOrder(pitches.length, PRACTICE_SEED)
  const daily = dailyPitch(pitches, day, dailyOrder)
  const n = pitches.length
  let idx = ((day - 1) * 3 + slot) % n
  let pick = pitches[order[idx]]
  if (pick.id === daily.id) {
    idx = (idx + 1) % n
    pick = pitches[order[idx]]
  }
  return pick
}
