import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Pitch } from '../types'
import { formatLakhs } from '../lib/format'
import { decodeName } from '../lib/obfuscate'
import { sharkInfo } from '../lib/sharks'

interface Props {
  pitch: Pitch
  onDone: () => void
}

/** Staged reveal: suspense → verdict → actual terms + sharks + company → score. */
export function RevealSequence({ pitch, onDone }: Props) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1500),
      setTimeout(() => setStep(2), 2900),
      setTimeout(onDone, 5400),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onDone])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="suspense"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-5xl"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 0.7 }}
            >
              🦈🦈🦈
            </motion.div>
            <div className="mono-label mt-4" style={{ color: 'var(--accent-gold)' }}>
              The Reveal
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="verdict"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div
              className="font-display text-5xl font-extrabold"
              style={{ color: pitch.dealMade ? 'var(--accent-teal)' : 'var(--accent-red)' }}
            >
              {pitch.dealMade ? 'DEAL' : 'NO DEAL'}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-sm"
          >
            {pitch.dealMade ? (
              <div className="card p-4">
                <div className="mono-label" style={{ color: 'var(--accent-gold)' }}>
                  Actual Deal Terms
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="stat-tile">
                    <div className="stat-label">Amount</div>
                    <div className="stat-value">{formatLakhs(pitch.dealAmount || pitch.askAmount)}</div>
                  </div>
                  <div className="stat-tile">
                    <div className="stat-label">Equity</div>
                    <div className="stat-value">{pitch.dealEquity ?? pitch.askEquity}%</div>
                  </div>
                </div>
                {pitch.hasDebt && pitch.debtAmountLakhs ? (
                  <div className="mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    + {formatLakhs(pitch.debtAmountLakhs)} debt{pitch.dealNote ? ` — ${pitch.dealNote}` : ''}
                  </div>
                ) : null}
                <div className="mono-label mt-4">Investing Shark(s)</div>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  {pitch.investingSharks.map((key) => {
                    const s = sharkInfo(key)
                    return (
                      <span key={key} className="chip" style={{ textTransform: 'none', fontSize: 11 }}>
                        {s.emoji} {s.name}
                      </span>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="card p-5">
                <div className="text-3xl">🚫</div>
                <div className="font-display mt-2 font-bold">All sharks passed on this one</div>
              </div>
            )}

            <div className="card mt-3 p-4">
              <div className="mono-label">The Company</div>
              <div className="font-display mt-1 text-lg font-bold" style={{ color: 'var(--accent-gold)' }}>
                {decodeName(pitch.companyName) || '—'}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Season {pitch.season}
                {pitch.episode >= 1 ? ` · Episode ${pitch.episode}` : ''}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
