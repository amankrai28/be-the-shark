import type { Decision, Pitch, Score } from '../types'

export const DEAL_CALL_POINTS = 300
export const AMOUNT_POINTS = 350
export const EQUITY_POINTS = 350

/**
 * Accuracy points with linear falloff: full points at exact match,
 * zero at 50% deviation from the actual value.
 */
function accuracyPoints(offered: number, actual: number, max: number): number {
  if (!Number.isFinite(offered) || !Number.isFinite(actual) || actual <= 0) return 0
  return Math.max(0, Math.round(max * (1 - (Math.abs(offered - actual) / actual) * 2)))
}

/**
 * v6 scoring, verified against the prototype bundle:
 * - 300 for the correct deal/no-deal call
 * - 350 amount + 350 equity accuracy vs the actual deal terms (falls back to
 *   the ask when a deal record lacks terms)
 * - a correct "no deal" call awards the full 350 + 350
 * - a wrong call scores 0 on both accuracy components
 * When the real deal included debt (hasDebt), dealAmount/dealEquity hold the
 * equity-cash portion, so this scores against equity terms only by construction.
 */
export function scorePitch(pitch: Pitch, decision: Decision): Score {
  const predictedDeal = decision.type !== 'go_out'
  const dealPrediction = predictedDeal === pitch.dealMade ? DEAL_CALL_POINTS : 0

  let amountAccuracy = 0
  let equityAccuracy = 0

  if (pitch.dealMade && predictedDeal) {
    const offeredAmount = decision.type === 'match_ask' ? pitch.askAmount : decision.amount
    const actualAmount = pitch.dealAmount || pitch.askAmount
    amountAccuracy = accuracyPoints(offeredAmount, actualAmount, AMOUNT_POINTS)

    const offeredEquity = decision.type === 'match_ask' ? pitch.askEquity : decision.equity
    const actualEquity = pitch.dealEquity || pitch.askEquity
    equityAccuracy = accuracyPoints(offeredEquity, actualEquity, EQUITY_POINTS)
  } else if (!pitch.dealMade && !predictedDeal) {
    amountAccuracy = AMOUNT_POINTS
    equityAccuracy = EQUITY_POINTS
  }

  return {
    dealPrediction,
    amountAccuracy,
    equityAccuracy,
    total: dealPrediction + amountAccuracy + equityAccuracy,
  }
}
