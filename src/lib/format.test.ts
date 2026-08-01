import { describe, expect, it } from 'vitest'
import { formatLakhs, scoreBucket, scoreEmoji, scoreTitle, valuationLakhs } from './format'

describe('formatLakhs (v6 formatter port)', () => {
  it('formats lakhs under 1 crore', () => {
    expect(formatLakhs(50)).toBe('₹50 L')
    expect(formatLakhs(45.5)).toBe('₹45.5 L')
  })
  it('formats crores at 100L and above', () => {
    expect(formatLakhs(100)).toBe('₹1 Cr')
    expect(formatLakhs(1000)).toBe('₹10 Cr')
    expect(formatLakhs(150)).toBe('₹1.50 Cr')
  })
})

describe('valuation', () => {
  it('computes implied valuation and guards zero equity', () => {
    expect(valuationLakhs(1000, 10)).toBe(10000) // ₹10Cr for 10% -> ₹100Cr
    expect(valuationLakhs(50, 0)).toBe(0)
  })
})

describe('score tiers (v6 port)', () => {
  it('maps scores to emoji, titles, and buckets at the exact v6 thresholds', () => {
    expect([scoreEmoji(900), scoreTitle(900), scoreBucket(900)]).toEqual(['🦈', 'SHARK MODE', 4])
    expect([scoreEmoji(700), scoreTitle(700), scoreBucket(700)]).toEqual(['🔥', 'INVESTOR PRO', 3])
    expect([scoreEmoji(500), scoreTitle(500), scoreBucket(500)]).toEqual(['💰', 'DEAL MAKER', 2])
    expect([scoreEmoji(300), scoreTitle(300), scoreBucket(300)]).toEqual(['📊', 'APPRENTICE', 1])
    expect([scoreEmoji(100), scoreTitle(100), scoreBucket(100)]).toEqual(['🐟', 'INTERN', 0])
  })
})
