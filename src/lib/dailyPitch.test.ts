import { describe, expect, it } from 'vitest'
import type { Pitch } from '../types'
import {
  dailyPitch,
  istDateString,
  istYesterdayString,
  pitchNumber,
  practicePitch,
  seededOrder,
} from './dailyPitch'

const makePitches = (n: number): Pitch[] =>
  Array.from({ length: n }, (_, i) => ({ id: i + 1 }) as Pitch)

describe('pitchNumber', () => {
  it('is #1 on 2026-01-01 IST and #213 on 2026-08-01 IST', () => {
    expect(pitchNumber(new Date('2026-01-01T00:00:00+05:30'))).toBe(1)
    expect(pitchNumber(new Date('2026-08-01T12:00:00+05:30'))).toBe(213)
  })

  it('is identical at the same instant in any timezone', () => {
    // 2026-03-15T20:00 in New York == 2026-03-16T05:30 IST — one instant, one number
    const nyEvening = new Date('2026-03-15T20:00:00-04:00')
    const istMorning = new Date('2026-03-16T05:30:00+05:30')
    expect(nyEvening.getTime()).toBe(istMorning.getTime())
    expect(pitchNumber(nyEvening)).toBe(pitchNumber(istMorning))
  })

  it('increments exactly once at IST midnight', () => {
    const before = new Date('2026-05-31T23:59:59+05:30')
    const after = new Date('2026-06-01T00:00:01+05:30')
    expect(pitchNumber(after)).toBe(pitchNumber(before) + 1)
  })
})

describe('istDateString', () => {
  it('formats the IST calendar day regardless of timezone representation', () => {
    expect(istDateString(new Date('2026-08-01T00:30:00+05:30'))).toBe('2026-08-01')
    // 20:00 UTC on Jul 31 is already Aug 1 in IST
    expect(istDateString(new Date('2026-07-31T20:00:00Z'))).toBe('2026-08-01')
    expect(istYesterdayString(new Date('2026-08-01T10:00:00+05:30'))).toBe('2026-07-31')
  })
})

describe('daily pitch selection', () => {
  const pitches = makePitches(478)

  it('is deterministic: same day → same pitch', () => {
    expect(dailyPitch(pitches, 213).id).toBe(dailyPitch(pitches, 213).id)
  })

  it('covers all pitches with no repeats within one full cycle (incl. month boundaries)', () => {
    const seen = new Set<number>()
    for (let day = 1; day <= 478; day++) seen.add(dailyPitch(pitches, day).id)
    expect(seen.size).toBe(478)
  })

  it('90-day simulated window: consecutive days never repeat, order is stable', () => {
    const first = Array.from({ length: 90 }, (_, i) => dailyPitch(pitches, 100 + i).id)
    const second = Array.from({ length: 90 }, (_, i) => dailyPitch(pitches, 100 + i).id)
    expect(first).toEqual(second)
    expect(new Set(first).size).toBe(90)
  })

  it('seededOrder is a permutation and stable across calls', () => {
    const a = seededOrder(478, 42)
    const b = seededOrder(478, 42)
    expect(a).toEqual(b)
    expect(new Set(a).size).toBe(478)
    expect(a).not.toEqual(seededOrder(478, 43))
  })
})

describe('practice pitch', () => {
  const pitches = makePitches(478)

  it('never serves the daily pitch', () => {
    for (let day = 1; day <= 500; day++) {
      const daily = dailyPitch(pitches, day)
      for (let slot = 0; slot < 3; slot++) {
        expect(practicePitch(pitches, slot, day).id).not.toBe(daily.id)
      }
    }
  })

  it('gives three distinct pitches per day, deterministically', () => {
    const ids = [0, 1, 2].map((s) => practicePitch(pitches, s, 213).id)
    expect(new Set(ids).size).toBe(3)
    expect(ids).toEqual([0, 1, 2].map((s) => practicePitch(pitches, s, 213).id))
  })
})
