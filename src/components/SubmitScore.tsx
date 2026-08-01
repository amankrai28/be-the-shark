import { useState } from 'react'
import { leaderboardEnabled, sanitizeName, submitScore, type SubmitResult } from '../lib/leaderboard'

interface Props {
  pitchNo: number
  score: number
  onViewLeaderboard: () => void
}

const NAME_KEY = 'bts_player_name'

type Phase = 'idle' | 'sending' | 'done' | 'already' | 'failed'

/** Opt-in leaderboard submission block on the daily score screen. */
export function SubmitScore({ pitchNo, score, onViewLeaderboard }: Props) {
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem(NAME_KEY) ?? ''
    } catch {
      return ''
    }
  })
  const [phase, setPhase] = useState<Phase>('idle')
  const [error, setError] = useState('')

  if (!leaderboardEnabled()) return null

  const submit = async () => {
    const clean = sanitizeName(name)
    if (!clean) {
      setError('Pick a name between 2 and 20 characters.')
      return
    }
    setError('')
    setPhase('sending')
    try {
      localStorage.setItem(NAME_KEY, clean)
    } catch {
      // persistence unavailable — submission still proceeds
    }
    const result: SubmitResult = await submitScore(pitchNo, score, clean)
    setPhase(result === 'ok' ? 'done' : result === 'already_submitted' ? 'already' : 'failed')
  }

  if (phase === 'done' || phase === 'already') {
    return (
      <div className="card mt-3 p-4 text-center">
        <div className="text-sm" style={{ color: 'var(--accent-teal)' }}>
          {phase === 'done' ? '✓ Score submitted!' : '✓ Already on the board today'}
        </div>
        <button className="btn-gold mt-3 w-full py-3" onClick={onViewLeaderboard}>
          🏆 View Leaderboard
        </button>
      </div>
    )
  }

  return (
    <div className="card mt-3 p-4">
      <div className="mono-label text-center">Community Leaderboard</div>
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={name}
          maxLength={20}
          placeholder="Your name"
          onChange={(e) => setName(e.target.value)}
          className="min-w-0 flex-1 rounded-xl px-3 py-2.5 text-sm"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-accent)', color: 'var(--text-primary)' }}
          aria-label="Display name"
        />
        <button
          className="btn-gold shrink-0 px-4 py-2.5 text-sm"
          onClick={submit}
          disabled={phase === 'sending'}
        >
          {phase === 'sending' ? '…' : 'Submit'}
        </button>
      </div>
      {error && (
        <div className="mt-2 text-xs" style={{ color: 'var(--accent-red)' }}>
          {error}
        </div>
      )}
      {phase === 'failed' && (
        <div className="mt-2 text-xs" style={{ color: 'var(--accent-red)' }}>
          Couldn't reach the leaderboard — check your connection and try again.
        </div>
      )}
      <button
        className="font-display mt-3 w-full text-center text-sm font-bold"
        style={{ color: 'var(--accent-gold)' }}
        onClick={onViewLeaderboard}
      >
        View today's board →
      </button>
    </div>
  )
}
