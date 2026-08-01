import type { GameStats } from '../types'
import { scoreBucket } from './format'

const STORAGE_KEY = 'bts_state'

export const defaultStats: GameStats = {
  currentStreak: 0,
  maxStreak: 0,
  gamesPlayed: 0,
  totalScore: 0,
  bestScore: 0,
  lastPlayedDate: '',
  lastPracticeDate: '',
  practiceUsed: 0,
  scoreDistribution: [0, 0, 0, 0, 0],
  pitchNumber: 0,
}

export function loadStats(): GameStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaultStats }
    return { ...defaultStats, ...JSON.parse(raw) }
  } catch {
    return { ...defaultStats }
  }
}

export function saveStats(stats: GameStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch {
    // storage unavailable (private mode) — play continues without persistence
  }
}

/**
 * Record a finished daily game. Streak rule (ported from v6): continue if the
 * last play was yesterday (or this is the first ever game); reset to 1 if the
 * last play is older; a same-day replay never alters the streak.
 */
export function recordDailyResult(
  stats: GameStats,
  total: number,
  pitchNo: number,
  today: string,
  yesterday: string,
): GameStats {
  const next: GameStats = { ...stats, scoreDistribution: [...stats.scoreDistribution] }
  next.gamesPlayed += 1
  next.totalScore += total
  next.pitchNumber = pitchNo
  if (total > next.bestScore) next.bestScore = total
  next.scoreDistribution[scoreBucket(total)] += 1

  if (next.lastPlayedDate === yesterday || next.lastPlayedDate === '') {
    next.currentStreak += 1
  } else if (next.lastPlayedDate !== today) {
    next.currentStreak = 1
  }
  if (next.currentStreak > next.maxStreak) next.maxStreak = next.currentStreak
  next.lastPlayedDate = today
  return next
}

/** Uses one of the day's 3 practice plays. Practice never touches daily stats. */
export function recordPracticeUse(stats: GameStats, today: string): GameStats {
  const next = { ...stats, scoreDistribution: [...stats.scoreDistribution] as GameStats['scoreDistribution'] }
  if (next.lastPracticeDate !== today) {
    next.lastPracticeDate = today
    next.practiceUsed = 0
  }
  next.practiceUsed += 1
  return next
}

export function practiceLeft(stats: GameStats, today: string): number {
  return stats.lastPracticeDate === today ? Math.max(0, 3 - stats.practiceUsed) : 3
}

export function hasPlayedToday(stats: GameStats, today: string): boolean {
  return stats.lastPlayedDate === today
}
