import { describe, expect, it } from 'vitest'
import { defaultStats, practiceLeft, recordDailyResult, recordPracticeUse } from './storage'

const T1 = '2026-08-01'
const T1_YDAY = '2026-07-31'
const T2 = '2026-08-02'
const T2_YDAY = '2026-08-01'

describe('recordDailyResult streak logic (v6 port)', () => {
  it('first game ever starts a streak of 1', () => {
    const s = recordDailyResult(defaultStats, 700, 213, T1, T1_YDAY)
    expect(s.currentStreak).toBe(1)
    expect(s.maxStreak).toBe(1)
    expect(s.gamesPlayed).toBe(1)
    expect(s.lastPlayedDate).toBe(T1)
  })

  it('playing on consecutive IST days extends the streak', () => {
    const day1 = recordDailyResult(defaultStats, 700, 213, T1, T1_YDAY)
    const day2 = recordDailyResult(day1, 500, 214, T2, T2_YDAY)
    expect(day2.currentStreak).toBe(2)
    expect(day2.maxStreak).toBe(2)
  })

  it('a gap resets the streak to 1 but keeps maxStreak', () => {
    const day1 = recordDailyResult(defaultStats, 700, 213, T1, T1_YDAY)
    const day2 = recordDailyResult(day1, 500, 214, T2, T2_YDAY)
    const later = recordDailyResult(day2, 900, 220, '2026-08-08', '2026-08-07')
    expect(later.currentStreak).toBe(1)
    expect(later.maxStreak).toBe(2)
  })

  it('accumulates score, best, and distribution buckets', () => {
    let s = recordDailyResult(defaultStats, 150, 1, T1, T1_YDAY)
    s = recordDailyResult(s, 999, 2, T2, T2_YDAY)
    expect(s.totalScore).toBe(1149)
    expect(s.bestScore).toBe(999)
    expect(s.scoreDistribution).toEqual([1, 0, 0, 0, 1])
  })

  it('does not mutate the input stats object', () => {
    const before = { ...defaultStats, scoreDistribution: [...defaultStats.scoreDistribution] }
    recordDailyResult(defaultStats, 700, 213, T1, T1_YDAY)
    expect(defaultStats).toEqual(before)
  })
})

describe('practice quota', () => {
  it('gives 3 plays per IST day and resets on a new day', () => {
    expect(practiceLeft(defaultStats, T1)).toBe(3)
    let s = recordPracticeUse(defaultStats, T1)
    s = recordPracticeUse(s, T1)
    s = recordPracticeUse(s, T1)
    expect(practiceLeft(s, T1)).toBe(0)
    expect(practiceLeft(s, T2)).toBe(3)
    s = recordPracticeUse(s, T2)
    expect(practiceLeft(s, T2)).toBe(2)
  })
})
