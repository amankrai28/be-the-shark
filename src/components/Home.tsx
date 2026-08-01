import { motion } from 'framer-motion'

interface Props {
  pitchNo: number
  playedToday: boolean
  practiceRemaining: number
  onPlayDaily: () => void
  onPlayPractice: () => void
  onHowTo: () => void
}

export function Home({ pitchNo, playedToday, practiceRemaining, onPlayDaily, onPlayPractice, onHowTo }: Props) {
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

      <button className="btn-outline mt-3 w-full py-3.5" onClick={onPlayPractice} disabled={practiceRemaining <= 0}>
        🎲 Practice{' '}
        <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
          ({practiceRemaining} left today)
        </span>
      </button>

      <button className="font-display mt-5 text-sm font-bold" style={{ color: 'var(--accent-gold)' }} onClick={onHowTo}>
        ❓ How to Play
      </button>

      <div className="mt-6 text-xs" style={{ color: 'var(--text-muted)' }}>
        New pitch every day · 478 pitches · 1000 points possible
      </div>
    </div>
  )
}
