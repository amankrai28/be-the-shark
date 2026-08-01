import { motion } from 'framer-motion'
import type { Decision, GameStats, Pitch, Score } from '../types'
import { formatLakhs, scoreEmoji, scoreTitle, scoreBucket } from '../lib/format'
import { AMOUNT_POINTS, DEAL_CALL_POINTS, EQUITY_POINTS } from '../lib/scoring'

interface Props {
  pitch: Pitch
  decision: Decision
  score: Score
  stats: GameStats
  isPractice: boolean
  onShare: () => void
  onHome: () => void
}

function ScoreRow({ label, points, max }: { label: string; points: number; max: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-left text-sm" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--bg-surface)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'var(--gradient-gold)' }}
          initial={{ width: 0 }}
          animate={{ width: `${(points / max) * 100}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      </div>
      <span className="font-mono w-16 text-right text-xs" style={{ color: 'var(--text-primary)' }}>
        {points}/{max}
      </span>
    </div>
  )
}

function describeCall(decision: Decision): string {
  if (decision.type === 'go_out') return "I'm Out"
  if (decision.type === 'match_ask') return 'Offered the ask'
  return `${formatLakhs(decision.amount)} for ${decision.equity}%`
}

function describeActual(pitch: Pitch): string {
  if (!pitch.dealMade) return 'No deal'
  const amount = formatLakhs(pitch.dealAmount || pitch.askAmount)
  const equity = pitch.dealEquity ?? pitch.askEquity
  const debt = pitch.hasDebt && pitch.debtAmountLakhs ? ` + ${formatLakhs(pitch.debtAmountLakhs)} debt` : ''
  return `${amount} for ${equity}%${debt}`
}

export function ScoreScreen({ pitch, decision, score, stats, isPractice, onShare, onHome }: Props) {
  const avg = stats.gamesPlayed > 0 ? Math.round(stats.totalScore / stats.gamesPlayed) : 0
  const maxCount = Math.max(...stats.scoreDistribution, 1)
  const bucketLabels = ['0-200', '200-400', '400-600', '600-800', '800-1000']

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto w-full max-w-sm px-4 pt-8 pb-12">
      {isPractice && (
        <div className="chip mx-auto mb-3 w-fit" style={{ color: 'var(--accent-purple)' }}>
          Practice
        </div>
      )}

      <div className="card p-5 text-center">
        <div className="text-4xl">{scoreEmoji(score.total)}</div>
        <div className="mono-label mt-2">Your Score</div>
        <div className="font-display text-5xl font-extrabold" style={{ color: 'var(--accent-gold)' }}>
          {score.total}
          <span className="text-xl" style={{ color: 'var(--text-muted)' }}>
            {' '}
            / 1000
          </span>
        </div>
        <div className="font-mono mt-1 text-xs tracking-widest" style={{ color: 'var(--accent-teal)' }}>
          {scoreTitle(score.total)}
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <ScoreRow label="Deal Call" points={score.dealPrediction} max={DEAL_CALL_POINTS} />
          <ScoreRow label="Amount" points={score.amountAccuracy} max={AMOUNT_POINTS} />
          <ScoreRow label="Equity" points={score.equityAccuracy} max={EQUITY_POINTS} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 text-left">
          <div className="stat-tile">
            <div className="stat-label">Your Call</div>
            <div className="stat-value text-sm">{describeCall(decision)}</div>
          </div>
          <div className="stat-tile">
            <div className="stat-label">Actual</div>
            <div className="stat-value text-sm">{describeActual(pitch)}</div>
          </div>
        </div>
      </div>

      {!isPractice && (
        <div className="card mt-3 p-4">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="font-display text-xl font-bold">{stats.currentStreak}🔥</div>
              <div className="stat-label">Streak</div>
            </div>
            <div>
              <div className="font-display text-xl font-bold">{stats.maxStreak}</div>
              <div className="stat-label">Max</div>
            </div>
            <div>
              <div className="font-display text-xl font-bold">{stats.gamesPlayed}</div>
              <div className="stat-label">Played</div>
            </div>
            <div>
              <div className="font-display text-xl font-bold">{avg}</div>
              <div className="stat-label">Avg</div>
            </div>
          </div>

          <div className="mono-label mt-4">Score Distribution</div>
          <div className="mt-2 flex flex-col gap-1.5">
            {bucketLabels.map((label, i) => {
              const count = stats.scoreDistribution[i] || 0
              const width = Math.max(8, (count / maxCount) * 100)
              const isCurrent = scoreBucket(score.total) === i
              return (
                <div key={label} className="flex items-center gap-2">
                  <span className="font-mono w-16 text-right text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {label}
                  </span>
                  <div className="h-4 flex-1">
                    <div
                      className="flex h-full items-center justify-end rounded-sm pr-1.5"
                      style={{
                        width: `${width}%`,
                        background: isCurrent ? 'var(--gradient-gold)' : 'var(--bg-surface)',
                      }}
                    >
                      <span
                        className="font-mono text-[10px] font-bold"
                        style={{ color: isCurrent ? '#1a1200' : 'var(--text-muted)' }}
                      >
                        {count}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2">
        {!isPractice && (
          <button className="btn-gold w-full py-3.5" onClick={onShare}>
            📤 Share Score
          </button>
        )}
        <button className="btn-outline w-full py-3.5" onClick={onHome}>
          ← Home
        </button>
      </div>
    </motion.div>
  )
}
