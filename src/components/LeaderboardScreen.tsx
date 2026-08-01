import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { fetchLeaderboard, type LeaderboardData } from '../lib/leaderboard'
import { scoreEmoji } from '../lib/format'

interface Props {
  pitchNo: number
  onHome: () => void
}

export function LeaderboardScreen({ pitchNo, onHome }: Props) {
  const [data, setData] = useState<LeaderboardData | null | 'loading'>('loading')

  useEffect(() => {
    let alive = true
    fetchLeaderboard(pitchNo).then((d) => {
      if (alive) setData(d)
    })
    return () => {
      alive = false
    }
  }, [pitchNo])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto w-full max-w-sm px-4 pt-8 pb-12">
      <h2 className="font-display text-center text-2xl font-bold">
        🏆 Today's <span style={{ color: 'var(--accent-gold)' }}>Leaderboard</span>
      </h2>
      <div className="font-mono mt-1 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
        PITCH #{pitchNo} · COMMUNITY SCORES
      </div>

      {data === 'loading' && (
        <div className="mt-10 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          Loading…
        </div>
      )}

      {data === null && (
        <div className="card mt-6 p-5 text-center">
          <div className="text-2xl">🌊</div>
          <div className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            The leaderboard is unreachable right now. Your game and streak are unaffected — try again later.
          </div>
        </div>
      )}

      {data !== 'loading' && data !== null && (
        <>
          <div className="mt-3 text-center text-xs" style={{ color: 'var(--text-secondary)' }}>
            {data.totalPlayers} player{data.totalPlayers === 1 ? '' : 's'} today
            {data.yourRank ? (
              <>
                {' '}
                · you're{' '}
                <strong style={{ color: 'var(--accent-gold)' }}>#{data.yourRank}</strong>
              </>
            ) : null}
          </div>

          <div className="card mt-4 overflow-hidden">
            {data.entries.length === 0 && (
              <div className="p-5 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                No scores yet today — be the first!
              </div>
            )}
            {data.entries.map((e, i) => (
              <div
                key={`${e.player_name}-${i}`}
                className="flex items-center gap-3 px-4 py-2.5"
                style={{
                  borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                  background: data.yourRank === i + 1 ? 'color-mix(in srgb, var(--accent-gold) 8%, transparent)' : 'none',
                }}
              >
                <span className="font-mono w-8 text-xs" style={{ color: i < 3 ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
                <span className="flex-1 truncate text-sm font-bold">{e.player_name}</span>
                <span className="font-mono text-sm" style={{ color: 'var(--text-primary)' }}>
                  {scoreEmoji(e.score)} {e.score}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <button className="btn-outline mt-5 w-full py-3.5" onClick={onHome}>
        ← Home
      </button>
    </motion.div>
  )
}
