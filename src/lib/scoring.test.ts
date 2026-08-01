import { describe, expect, it } from 'vitest'
import type { Pitch } from '../types'
import { scorePitch } from './scoring'

const base: Pitch = {
  id: 1,
  season: 1,
  episode: 1,
  industry: 'Food and Beverage',
  city: 'Delhi',
  description: 'x',
  yearsInBusiness: 3,
  annualRevenue: '₹95 L',
  profitMargin: 'N/A',
  askAmount: 50,
  askEquity: 5,
  dealMade: true,
  dealAmount: 75,
  dealEquity: 16,
  investingSharks: ['aman'],
  companyName: 'X',
  founderName: '',
  productCategory: 'Food and Beverage',
  salesChannel: 'Hybrid',
  difficulty: 'medium',
}

describe('scorePitch', () => {
  it('awards full 1000 for exact counter on a deal', () => {
    const s = scorePitch(base, { type: 'counter', amount: 75, equity: 16 })
    expect(s).toEqual({ dealPrediction: 300, amountAccuracy: 350, equityAccuracy: 350, total: 1000 })
  })

  it('awards full 1000 for correctly calling no-deal', () => {
    const p = { ...base, dealMade: false, dealAmount: null, dealEquity: null, investingSharks: [] }
    const s = scorePitch(p, { type: 'go_out' })
    expect(s.total).toBe(1000)
  })

  it('scores 0 when going out on a real deal', () => {
    const s = scorePitch(base, { type: 'go_out' })
    expect(s).toEqual({ dealPrediction: 0, amountAccuracy: 0, equityAccuracy: 0, total: 0 })
  })

  it('scores 0 when offering on a no-deal pitch', () => {
    const p = { ...base, dealMade: false, dealAmount: null, dealEquity: null }
    const s = scorePitch(p, { type: 'match_ask' })
    expect(s.total).toBe(0)
  })

  it('matches v6 linear falloff: zero accuracy points at 50% deviation', () => {
    // actual 100L: offering 150L is 50% off -> 0 points; 125L is 25% off -> 175
    const p = { ...base, dealAmount: 100, dealEquity: 10 }
    expect(scorePitch(p, { type: 'counter', amount: 150, equity: 10 }).amountAccuracy).toBe(0)
    expect(scorePitch(p, { type: 'counter', amount: 125, equity: 10 }).amountAccuracy).toBe(175)
    expect(scorePitch(p, { type: 'counter', amount: 100, equity: 15 }).equityAccuracy).toBe(0)
  })

  it('match_ask scores against actual deal terms using the ask as the offer', () => {
    // ask 50 vs actual 75 -> deviation 33.3% -> 350*(1-0.667) = 117
    const s = scorePitch(base, { type: 'match_ask' })
    expect(s.dealPrediction).toBe(300)
    expect(s.amountAccuracy).toBe(117)
  })

  it('falls back to ask terms when a deal record lacks amount/equity', () => {
    const p = { ...base, dealAmount: null, dealEquity: null }
    const s = scorePitch(p, { type: 'match_ask' })
    expect(s.total).toBe(1000) // offer == ask == fallback actual
  })

  it('never divides by zero on corrupt zero-amount records (id 244 class)', () => {
    const p = { ...base, askAmount: 0, askEquity: 0.5, dealAmount: 0, dealEquity: 0.5 }
    const s = scorePitch(p, { type: 'counter', amount: 0, equity: 0.5 })
    expect(Number.isFinite(s.total)).toBe(true)
    expect(s.amountAccuracy).toBe(0) // unscorable component yields 0, not NaN
    expect(s.equityAccuracy).toBe(350)
  })

  it('scores against the equity-cash portion for debt deals', () => {
    const p = { ...base, dealAmount: 50, dealEquity: 2, hasDebt: true, debtAmountLakhs: 50 }
    const s = scorePitch(p, { type: 'counter', amount: 50, equity: 2 })
    expect(s.total).toBe(1000)
  })
})
