/** Format an amount in ₹ lakhs as the Indian display string (₹X L / ₹X Cr). */
export function formatLakhs(lakhs: number): string {
  if (lakhs >= 100) {
    const cr = lakhs / 100
    return cr % 1 === 0 ? `₹${cr} Cr` : `₹${cr.toFixed(2)} Cr`
  }
  return lakhs % 1 === 0 ? `₹${lakhs} L` : `₹${lakhs.toFixed(1)} L`
}

/** Implied valuation in lakhs from an amount (lakhs) and equity (%). */
export function valuationLakhs(amountLakhs: number, equityPct: number): number {
  if (equityPct <= 0) return 0
  return (amountLakhs / equityPct) * 100
}

export function scoreEmoji(total: number): string {
  return total >= 900 ? '🦈' : total >= 700 ? '🔥' : total >= 500 ? '💰' : total >= 300 ? '📊' : '🐟'
}

export function scoreTitle(total: number): string {
  return total >= 900
    ? 'SHARK MODE'
    : total >= 700
      ? 'INVESTOR PRO'
      : total >= 500
        ? 'DEAL MAKER'
        : total >= 300
          ? 'APPRENTICE'
          : 'INTERN'
}

/** Bucket index (0–4) for the score distribution: 0-200 / 200-400 / 400-600 / 600-800 / 800-1000. */
export function scoreBucket(total: number): number {
  return total >= 800 ? 4 : total >= 600 ? 3 : total >= 400 ? 2 : total >= 200 ? 1 : 0
}
