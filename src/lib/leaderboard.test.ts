// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The module reads import.meta.env at load time; stub before importing.
vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co')
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key')

const { fetchLeaderboard, sanitizeName, submitScore } = await import('./leaderboard')

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v
    },
    clear: () => {
      store = {}
    },
  }
})()
vi.stubGlobal('localStorage', localStorageMock)

beforeEach(() => localStorageMock.clear())
afterEach(() => vi.restoreAllMocks())

describe('sanitizeName', () => {
  it('trims, collapses whitespace, caps at 20 chars', () => {
    expect(sanitizeName('  Aman   Rai  ')).toBe('Aman Rai')
    expect(sanitizeName('A'.repeat(30))!.length).toBe(20)
  })
  it('rejects too-short and blocklisted names', () => {
    expect(sanitizeName(' A ')).toBeNull()
    expect(sanitizeName('fuckface')).toBeNull()
  })
})

describe('submitScore', () => {
  it('maps 201 to ok, 409 to already_submitted, 500 to error', async () => {
    for (const [status, expected] of [
      [201, 'ok'],
      [409, 'already_submitted'],
      [500, 'error'],
    ] as const) {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status })))
      expect(await submitScore(213, 880, 'Tester')).toBe(expected)
    }
  })

  it('returns error on network failure without throwing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')))
    expect(await submitScore(213, 880, 'Tester')).toBe('error')
  })
})

describe('fetchLeaderboard', () => {
  it('ranks rows, finds your rank by client id, reads total from content-range', async () => {
    const clientId = 'me-me-me'
    localStorageMock.setItem('bts_client_id', clientId)
    const rows = [
      { player_name: 'Top', score: 1000, client_id: 'other1' },
      { player_name: 'You', score: 880, client_id: clientId },
      { player_name: 'Third', score: 500, client_id: 'other2' },
    ]
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(rows), {
          status: 200,
          headers: { 'content-range': '0-2/57' },
        }),
      ),
    )
    const data = await fetchLeaderboard(213)
    expect(data).not.toBeNull()
    expect(data!.totalPlayers).toBe(57)
    expect(data!.yourRank).toBe(2)
    expect(data!.entries[0]).toEqual({ player_name: 'Top', score: 1000 })
  })

  it('returns null on failure without throwing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')))
    expect(await fetchLeaderboard(213)).toBeNull()
  })
})
