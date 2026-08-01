import { useCallback, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Decision, Pitch, Score } from './types'
import rawPitches from './data/pitches.game.json'
import { dailyPitch, istDateString, istYesterdayString, pitchNumber, practicePitch } from './lib/dailyPitch'
import { scorePitch } from './lib/scoring'
import {
  hasPlayedToday,
  loadStats,
  practiceLeft,
  recordDailyResult,
  recordPracticeUse,
  saveStats,
} from './lib/storage'
import { buildShareText } from './lib/share'
import { confettiBurst } from './lib/confetti'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Home } from './components/Home'
import { PitchCard } from './components/PitchCard'
import { DealForm } from './components/DealForm'
import { RevealSequence } from './components/RevealSequence'
import { ScoreScreen } from './components/ScoreScreen'
import { HowToModal } from './components/HowToModal'
import { LeaderboardScreen } from './components/LeaderboardScreen'
import { SubmitScore } from './components/SubmitScore'
import { leaderboardEnabled } from './lib/leaderboard'

const pitches = rawPitches as unknown as Pitch[]

type Screen = 'home' | 'game' | 'reveal' | 'score' | 'leaderboard'

interface Round {
  pitch: Pitch
  isPractice: boolean
  decision?: Decision
  score?: Score
}

export default function App() {
  const [stats, setStats] = useState(loadStats)
  const [screen, setScreen] = useState<Screen>('home')
  const [round, setRound] = useState<Round | null>(null)
  const [showHowTo, setShowHowTo] = useState(false)
  const [toast, setToast] = useState('')

  const now = new Date()
  const today = istDateString(now)
  const pitchNo = pitchNumber(now)
  const playedToday = hasPlayedToday(stats, today)
  const practiceRemaining = practiceLeft(stats, today)

  const showToast = useCallback((message: string) => {
    setToast(message)
    setTimeout(() => setToast(''), 2500)
  }, [])

  const startDaily = useCallback(() => {
    setRound({ pitch: dailyPitch(pitches, pitchNo), isPractice: false })
    setScreen('game')
  }, [pitchNo])

  const startPractice = useCallback(() => {
    if (practiceRemaining <= 0) {
      showToast('Practice pitches used up — come back tomorrow!')
      return
    }
    const slot = 3 - practiceRemaining
    const next = recordPracticeUse(stats, today)
    setStats(next)
    saveStats(next)
    setRound({ pitch: practicePitch(pitches, slot, pitchNo), isPractice: true })
    setScreen('game')
  }, [practiceRemaining, stats, today, pitchNo, showToast])

  const submitDecision = useCallback(
    (decision: Decision) => {
      if (!round) return
      const score = scorePitch(round.pitch, decision)
      setRound({ ...round, decision, score })
      if (!round.isPractice) {
        const next = recordDailyResult(stats, score.total, pitchNo, today, istYesterdayString(now))
        setStats(next)
        saveStats(next)
      }
      setScreen('reveal')
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [round, stats, pitchNo, today],
  )

  const revealDone = useCallback(() => {
    setScreen('score')
    if (round?.score && round.score.total >= 700) {
      confettiBurst()
    }
  }, [round])

  const share = useCallback(() => {
    if (!round?.score) return
    const text = buildShareText(round.score, pitchNo, stats.currentStreak, stats.bestScore)
    const copy = () =>
      navigator.clipboard
        .writeText(text)
        .then(() => showToast('Copied to clipboard!'))
        .catch(() => showToast('Could not copy — try a screenshot!'))
    if (navigator.share) {
      navigator.share({ text }).catch(copy)
    } else {
      copy()
    }
  }, [round, pitchNo, stats, showToast])

  const goHome = useCallback(() => {
    setRound(null)
    setScreen('home')
  }, [])

  const header = useMemo(
    () =>
      screen === 'game' && round ? (
        <div className="mx-auto flex w-full max-w-sm items-center justify-between px-4 pt-4">
          <button className="text-xl" style={{ color: 'var(--text-secondary)' }} onClick={goHome} aria-label="Back">
            ←
          </button>
          <div className="font-display font-bold">
            🦈 BE THE <span style={{ color: 'var(--accent-gold)' }}>SHARK</span>
          </div>
          <div className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
            {round.isPractice ? 'PRACTICE' : `#${pitchNo}`}
          </div>
        </div>
      ) : null,
    [screen, round, pitchNo, goHome],
  )

  return (
    <ErrorBoundary onReset={goHome}>
      {header}

      {screen === 'home' && (
        <Home
          pitchNo={pitchNo}
          pitchCount={pitches.length}
          playedToday={playedToday}
          practiceRemaining={practiceRemaining}
          stats={stats}
          showLeaderboard={leaderboardEnabled()}
          onPlayDaily={startDaily}
          onPlayPractice={startPractice}
          onHowTo={() => setShowHowTo(true)}
          onLeaderboard={() => setScreen('leaderboard')}
        />
      )}

      {screen === 'game' && round && (
        <div className="mx-auto w-full max-w-sm px-4 pt-4 pb-12">
          <PitchCard pitch={round.pitch} />
          <DealForm pitch={round.pitch} onSubmit={submitDecision} />
        </div>
      )}

      {screen === 'reveal' && round && <RevealSequence pitch={round.pitch} onDone={revealDone} />}

      {screen === 'score' && round?.decision && round?.score && (
        <>
          <ScoreScreen
            pitch={round.pitch}
            decision={round.decision}
            score={round.score}
            stats={stats}
            isPractice={round.isPractice}
            onShare={share}
            onHome={goHome}
          />
          {!round.isPractice && (
            <div className="mx-auto -mt-8 w-full max-w-sm px-4 pb-12">
              <SubmitScore pitchNo={pitchNo} score={round.score.total} onViewLeaderboard={() => setScreen('leaderboard')} />
            </div>
          )}
        </>
      )}

      {screen === 'leaderboard' && <LeaderboardScreen pitchNo={pitchNo} onHome={goHome} />}

      <AnimatePresence>{showHowTo && <HowToModal onClose={() => setShowHowTo(false)} />}</AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-bold"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-accent)' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </ErrorBoundary>
  )
}
