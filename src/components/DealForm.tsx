import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Decision, Pitch } from '../types'
import { formatLakhs, valuationLakhs } from '../lib/format'

interface Props {
  pitch: Pitch
  onSubmit: (decision: Decision) => void
}

export function DealForm({ pitch, onSubmit }: Props) {
  const [countering, setCountering] = useState(false)
  const [amount, setAmount] = useState(pitch.askAmount)
  const [equity, setEquity] = useState(pitch.askEquity)

  if (countering) {
    const minAmount = Math.max(1, Math.round(pitch.askAmount * 0.3))
    const maxAmount = Math.round(pitch.askAmount * 2.5)
    const askValuation = valuationLakhs(pitch.askAmount, pitch.askEquity)
    const yourValuation = valuationLakhs(amount, equity)
    const delta = askValuation > 0 ? ((yourValuation - askValuation) / askValuation) * 100 : 0

    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card mt-4 p-4">
        <h2 className="font-display text-center text-lg font-bold">Your Counter Offer</h2>

        <div className="mt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Amount:{' '}
              <strong className="font-display" style={{ color: 'var(--accent-gold)' }}>
                {formatLakhs(amount)}
              </strong>
            </span>
          </div>
          <input
            type="range"
            min={minAmount}
            max={maxAmount}
            step={Math.max(1, Math.round(pitch.askAmount / 100))}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-2"
            aria-label="Offer amount"
          />
          <div className="mt-1 flex justify-between font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
            <span>{formatLakhs(minAmount)}</span>
            <span>{formatLakhs(maxAmount)}</span>
          </div>
        </div>

        <div className="mt-4">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Equity:{' '}
            <strong className="font-display" style={{ color: 'var(--accent-gold)' }}>
              {equity}%
            </strong>
          </span>
          <input
            type="range"
            min={1}
            max={80}
            step={0.5}
            value={equity}
            onChange={(e) => setEquity(Number(e.target.value))}
            className="mt-2"
            aria-label="Equity percentage"
          />
          <div className="mt-1 flex justify-between font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
            <span>1%</span>
            <span>80%</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl p-3" style={{ background: 'var(--bg-surface)' }}>
          <div className="text-center">
            <div className="stat-label">Their Valuation</div>
            <div className="stat-value">{formatLakhs(askValuation)}</div>
          </div>
          <div className="font-mono text-xs" style={{ color: delta < 0 ? 'var(--accent-red)' : 'var(--accent-teal)' }}>
            {delta === 0 ? '0%' : `${delta > 0 ? '+' : ''}${delta.toFixed(0)}%`} →
          </div>
          <div className="text-center">
            <div className="stat-label">Your Valuation</div>
            <div className="stat-value">{formatLakhs(yourValuation)}</div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button className="btn-outline flex-1 py-3" onClick={() => setCountering(false)}>
            ← Back
          </button>
          <button
            className="btn-gold flex-1 py-3"
            onClick={() => onSubmit({ type: 'counter', amount, equity })}
          >
            Submit Offer →
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="mt-4">
      <h2 className="font-display text-center text-lg font-bold">What's your call?</h2>
      <div className="mt-3 flex flex-col gap-3">
        <button className="action-card" onClick={() => onSubmit({ type: 'go_out' })}>
          <div className="text-2xl">🚫</div>
          <div className="font-display mt-1 font-bold">I'm Out</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
            No deal
          </div>
        </button>
        <button className="action-card" onClick={() => onSubmit({ type: 'match_ask' })}>
          <div className="text-2xl">🤝</div>
          <div className="font-display mt-1 font-bold">Offer Ask</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Their terms
          </div>
        </button>
        <button className="action-card" onClick={() => setCountering(true)}>
          <div className="text-2xl">📝</div>
          <div className="font-display mt-1 font-bold">Counter</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Your terms
          </div>
        </button>
      </div>
    </div>
  )
}
