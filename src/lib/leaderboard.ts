/**
 * Community leaderboard client. Plain fetch against Supabase PostgREST — no
 * SDK, keeps the bundle lean. Scores are client-computed, so this is a
 * community board, not a trust anchor; integrity bounds live in the database.
 *
 * Every call degrades quietly: the game must never block on this module.
 */

const URL_BASE = import.meta.env.VITE_SUPABASE_URL as string | undefined
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const TABLE = 'bts_daily_scores'
const TIMEOUT_MS = 6000

export interface LeaderboardEntry {
  player_name: string
  score: number
}

export interface LeaderboardData {
  entries: LeaderboardEntry[]
  totalPlayers: number
  yourRank: number | null
}

export type SubmitResult = 'ok' | 'already_submitted' | 'error'

export function leaderboardEnabled(): boolean {
  return Boolean(URL_BASE && API_KEY)
}

/** Anonymous per-browser id — no account, no PII. */
export function getClientId(): string {
  const KEY = 'bts_client_id'
  try {
    let id = localStorage.getItem(KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(KEY, id)
    }
    return id
  } catch {
    return crypto.randomUUID()
  }
}

const NAME_BLOCKLIST = /fuck|shit|bitch|chutiya|madarchod|bhenchod|gandu|randi/i

export function sanitizeName(raw: string): string | null {
  const name = raw.trim().replace(/\s+/g, ' ').slice(0, 20)
  if (name.length < 2) return null
  if (NAME_BLOCKLIST.test(name)) return null
  return name
}

async function api(path: string, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    return await fetch(`${URL_BASE}/rest/v1/${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        apikey: API_KEY!,
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        ...init.headers,
      },
    })
  } finally {
    clearTimeout(timer)
  }
}

export async function submitScore(
  pitchNumber: number,
  score: number,
  playerName: string,
): Promise<SubmitResult> {
  if (!leaderboardEnabled()) return 'error'
  try {
    const res = await api(TABLE, {
      method: 'POST',
      body: JSON.stringify({
        pitch_number: pitchNumber,
        score,
        player_name: playerName,
        client_id: getClientId(),
      }),
    })
    if (res.status === 201) return 'ok'
    if (res.status === 409) return 'already_submitted'
    return 'error'
  } catch {
    return 'error'
  }
}

export async function fetchLeaderboard(pitchNumber: number): Promise<LeaderboardData | null> {
  if (!leaderboardEnabled()) return null
  try {
    const res = await api(
      `${TABLE}?pitch_number=eq.${pitchNumber}&select=player_name,score,client_id` +
        `&order=score.desc,created_at.asc&limit=200`,
      { headers: { Prefer: 'count=exact' } },
    )
    if (!res.ok) return null
    const rows = (await res.json()) as (LeaderboardEntry & { client_id: string })[]
    const contentRange = res.headers.get('content-range') // e.g. "0-49/123"
    const totalPlayers = contentRange ? Number(contentRange.split('/')[1]) || rows.length : rows.length
    const clientId = getClientId()
    const idx = rows.findIndex((r) => r.client_id === clientId)
    return {
      entries: rows.slice(0, 50).map(({ player_name, score }) => ({ player_name, score })),
      totalPlayers,
      yourRank: idx >= 0 ? idx + 1 : null,
    }
  } catch {
    return null
  }
}
