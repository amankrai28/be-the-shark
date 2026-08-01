import type { Score } from '../types'
import { scoreEmoji, scoreTitle } from './format'
import { AMOUNT_POINTS, DEAL_CALL_POINTS, EQUITY_POINTS } from './scoring'

function bar(points: number, max: number): string {
  const filled = Math.round((points / max) * 5)
  return '🟩'.repeat(filled) + '⬛'.repeat(5 - filled)
}

/** Share text, format ported verbatim from the v6 prototype. */
export function buildShareText(
  score: Score,
  pitchNo: number,
  currentStreak: number,
  bestScore: number,
): string {
  return `${scoreEmoji(score.total)} Be The Shark — Pitch #${pitchNo}
Score: ${score.total}/1000 (${scoreTitle(score.total)})

Deal Call  ${bar(score.dealPrediction, DEAL_CALL_POINTS)}
Amount     ${bar(score.amountAccuracy, AMOUNT_POINTS)}
Equity     ${bar(score.equityAccuracy, EQUITY_POINTS)}

🔥 Streak: ${currentStreak} | 🏆 Best: ${bestScore}

Play at betheshark.in`
}
