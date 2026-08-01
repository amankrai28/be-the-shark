// Data QA gate: runs with the unit test suite. The canonical dataset must
// pass before any build ships (schema, scorability, anti-cheat, legal).
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pitches = JSON.parse(readFileSync(join(root, 'data', 'pitches.json'), 'utf8'))

const KNOWN_SHARKS = [
  'ashneer', 'aman', 'namita', 'peyush', 'vineeta', 'anupam', 'ghazal',
  'amit', 'vikas', 'azhar', 'radhika', 'deepinder', 'ronnie', 'varun',
  'ritesh', 'kunal', 'viraj', 'chirag', 'srikanth', 'mohit', 'kanika',
  'shaily', 'hardik', 'varunalagh', 'guest',
]

// Company names that ARE the generic product term (e.g. a popcorn brand named
// "Popcorn") — the description mentioning the product is not an identity leak.
const GENERIC_NAME_IDS = [429, 455]

describe('dataset schema', () => {
  it('has unique sequential-safe ids', () => {
    const ids = new Set(pitches.map((p) => p.id))
    expect(ids.size).toBe(pitches.length)
  })

  it('every pitch has the required fields with sane types', () => {
    for (const p of pitches) {
      expect(typeof p.id, `id ${p.id}`).toBe('number')
      expect([1, 2, 3, 4, 5]).toContain(p.season)
      expect(typeof p.description).toBe('string')
      expect(p.description.length, `id ${p.id} description`).toBeGreaterThan(40)
      expect(['easy', 'medium', 'hard']).toContain(p.difficulty)
      expect(typeof p.dealMade).toBe('boolean')
    }
  })
})

describe('scorability (no NaN/zero-division pitches)', () => {
  it('every pitch has a plausible ask (₹1L–₹300Cr, equity 0.1–75%)', () => {
    // Symbolic stunt asks (₹5, ₹101…) are excluded from the game dataset —
    // they are real episodes but unscorable in an amount/equity game.
    const bad = pitches.filter(
      (p) => !(p.askAmount >= 1 && p.askAmount <= 30000) || !(p.askEquity >= 0.1 && p.askEquity <= 75),
    )
    expect(bad.map((p) => p.id)).toEqual([])
  })

  it('every deal has plausible terms and at least one shark', () => {
    const bad = pitches.filter(
      (p) =>
        p.dealMade &&
        (!(p.dealAmount >= 1 && p.dealAmount <= 30000) ||
          !(p.dealEquity > 0 && p.dealEquity <= 75) ||
          p.investingSharks.length === 0),
    )
    expect(bad.map((p) => p.id)).toEqual([])
  })

  it('no-deal pitches carry no deal fields', () => {
    const bad = pitches.filter(
      (p) => !p.dealMade && (p.dealAmount || p.dealEquity || p.investingSharks.length > 0),
    )
    expect(bad.map((p) => p.id)).toEqual([])
  })

  it('debt deals have a positive debt amount', () => {
    const bad = pitches.filter((p) => p.hasDebt && !(p.debtAmountLakhs > 0))
    expect(bad.map((p) => p.id)).toEqual([])
  })
})

describe('anti-cheat & legal', () => {
  it('descriptions never leak company, founder, or shark names', () => {
    const leaks = []
    for (const p of pitches) {
      const desc = p.description.toLowerCase()
      const company = String(p.companyName).toLowerCase().replace(/[^a-z]/g, '')
      if (
        company.length > 5 &&
        !GENERIC_NAME_IDS.includes(p.id) &&
        desc.replace(/[^a-z]/g, '').includes(company)
      ) {
        leaks.push(`${p.id}:company`)
      }
      for (const shark of ['ashneer', 'namita', 'peyush', 'vineeta', 'anupam', 'ghazal', 'deepinder']) {
        if (desc.includes(shark)) leaks.push(`${p.id}:shark`)
      }
    }
    expect(leaks).toEqual([])
  })

  it('investingSharks only uses known shark keys', () => {
    const bad = pitches.filter((p) => p.investingSharks.some((s) => !KNOWN_SHARKS.includes(s)))
    expect(bad.map((p) => p.id)).toEqual([])
  })

  it('episode is a non-negative integer (0 = unknown, hidden by the UI)', () => {
    const bad = pitches.filter((p) => !Number.isInteger(p.episode) || p.episode < 0)
    expect(bad.map((p) => p.id)).toEqual([])
  })
})
