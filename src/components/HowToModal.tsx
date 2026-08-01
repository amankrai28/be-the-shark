import { motion } from 'framer-motion'
import { AMOUNT_POINTS, DEAL_CALL_POINTS, EQUITY_POINTS } from '../lib/scoring'

const STEPS = [
  {
    title: 'Read the Pitch',
    body: 'An anonymized startup pitch with real data — industry, revenue, margins, and the ask.',
  },
  {
    title: 'Make Your Call',
    body: "I'm Out · Offer the Ask · Counter",
  },
  {
    title: 'See the Reveal',
    body: 'Find out what actually happened — deal or no deal, the real terms, and which shark(s) invested.',
  },
  {
    title: 'Get Scored',
    body: 'Up to 1000 points. Share your result and build your streak!',
  },
]

export function HowToModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: '#000a' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="card max-h-[85vh] w-full max-w-sm overflow-y-auto p-5"
        initial={{ y: 60 }}
        animate={{ y: 0 }}
        exit={{ y: 60 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-center text-xl font-bold">How to Play</h2>

        <div className="mt-4 flex flex-col gap-4">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex gap-3">
              <div
                className="font-display flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{ background: 'var(--gradient-gold)', color: '#1a1200' }}
              >
                {i + 1}
              </div>
              <div>
                <div className="font-display font-bold">{step.title}</div>
                <div className="mt-0.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {step.body}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl p-3" style={{ background: 'var(--bg-surface)' }}>
          <div className="mono-label">Scoring Breakdown</div>
          <div className="mt-2 flex flex-col gap-1 text-sm">
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Deal / No Deal prediction</span>
              <span className="font-mono">{DEAL_CALL_POINTS} pts</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Amount accuracy</span>
              <span className="font-mono">{AMOUNT_POINTS} pts</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Equity accuracy</span>
              <span className="font-mono">{EQUITY_POINTS} pts</span>
            </div>
            <div className="mt-1 flex justify-between border-t pt-1 font-bold" style={{ borderColor: 'var(--border)' }}>
              <span>Max Score</span>
              <span className="font-mono" style={{ color: 'var(--accent-gold)' }}>
                1000 pts
              </span>
            </div>
          </div>
        </div>

        <button className="btn-gold mt-5 w-full py-3" onClick={onClose}>
          Got it
        </button>
      </motion.div>
    </motion.div>
  )
}
