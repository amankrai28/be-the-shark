import { motion } from 'framer-motion'
import type { GameStats } from '../types'
import { scoreEmoji, scoreTitle } from '../lib/format'

interface Props {
  pitchNo: number
  pitchCount: number
  playedToday: boolean
  practiceRemaining: number
  stats: GameStats
  showLeaderboard: boolean
  onPlayDaily: () => void
  onPlayPractice: () => void
  onHowTo: () => void
  onLeaderboard: () => void
}

export function Home({
  pitchNo,
  pitchCount,
  playedToday,
  practiceRemaining,
  stats,
  showLeaderboard,
  onPlayDaily,
  onPlayPractice,
  onHowTo,
  onLeaderboard,
}: Props) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col items-center justify-center px-6 text-center">
      <motion.div
        className="text-6xl"
        initial={{ y: -12 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 120 }}
      >
        🦈
      </motion.div>

      <h1 className="font-display mt-4 text-4xl font-extrabold tracking-tight">
        BE THE <span style={{ color: 'var(--accent-gold)' }}>SHARK</span>
      </h1>
      <div className="font-mono mt-2 text-[11px] font-bold tracking-[0.3em]" style={{ color: 'var(--text-secondary)' }}>
        THE DEAL-MAKING CHALLENGE
      </div>

      <p className="mt-5 text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        Read a real startup pitch. Decide:{' '}
        <strong style={{ color: 'var(--accent-gold)' }}>Deal</strong> or{' '}
        <strong style={{ color: 'var(--accent-gold)' }}>No Deal</strong>? Set your terms. See how close you get to what
        actually happened.
      </p>

      <button className="btn-gold mt-7 w-full py-3.5 text-base" onClick={onPlayDaily} disabled={playedToday}>
        {playedToday ? '✓ Played today — new pitch tomorrow' : `▶ Pitch #${pitchNo}`}
      </button>

      {stats.gamesPlayed > 0 && (
        <div className="card mt-3 w-full p-3">
          {/* lastScore > 0 also skips pre-migration states that lack the field */}
          {playedToday && stats.lastScore > 0 && (
            <div className="mb-2 text-sm">
              {scoreEmoji(stats.lastScore)} Today:{' '}
              <strong className="font-display" style={{ color: 'var(--accent-gold)' }}>
                {stats.lastScore}/1000
              </strong>{' '}
              <span className="font-mono text-[10px] tracking-widest" style={{ color: 'var(--accent-teal)' }}>
                {scoreTitle(stats.lastScore)}
              </span>
            </div>
          )}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="font-display text-lg font-bold">{stats.currentStreak}🔥</div>
              <div className="stat-label">Streak</div>
            </div>
            <div>
              <div className="font-display text-lg font-bold">{stats.maxStreak}</div>
              <div className="stat-label">Max</div>
            </div>
            <div>
              <div className="font-display text-lg font-bold">{stats.gamesPlayed}</div>
              <div className="stat-label">Played</div>
            </div>
            <div>
              <div className="font-display text-lg font-bold">{stats.bestScore}</div>
              <div className="stat-label">Best</div>
            </div>
          </div>
        </div>
      )}

      <button className="btn-outline mt-3 w-full py-3.5" onClick={onPlayPractice} disabled={practiceRemaining <= 0}>
        🎲 Practice{' '}
        <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
          ({practiceRemaining} left today)
        </span>
      </button>

      <div className="mt-5 flex items-center gap-6">
        <button className="font-display text-sm font-bold" style={{ color: 'var(--accent-gold)' }} onClick={onHowTo}>
          ❓ How to Play
        </button>
        {showLeaderboard && (
          <button className="font-display text-sm font-bold" style={{ color: 'var(--accent-gold)' }} onClick={onLeaderboard}>
            🏆 Leaderboard
          </button>
        )}
      </div>

      <div className="mt-6 text-xs" style={{ color: 'var(--text-muted)' }}>
        New pitch every day · {pitchCount} pitches · 1000 points possible
      </div>

      <div className="mt-3 max-w-xs text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        Not affiliated with any TV show or broadcaster. Built on publicly available deal data.
      </div>
    </div>
  )
}
