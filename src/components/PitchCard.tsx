import type { Pitch } from '../types'
import { formatLakhs, valuationLakhs } from '../lib/format'

export function PitchCard({ pitch }: { pitch: Pitch }) {
  const valuation = valuationLakhs(pitch.askAmount, pitch.askEquity)
  return (
    <div className="card p-4">
      <div className="flex flex-wrap gap-2">
        <span className="chip">{pitch.industry}</span>
        <span className="chip">{pitch.city}</span>
        <span className="chip">{pitch.salesChannel}</span>
        <span className={`chip chip-difficulty ${pitch.difficulty}`}>{pitch.difficulty}</span>
      </div>

      <p className="mt-4 text-[15px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
        {pitch.description}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="stat-tile">
          <div className="stat-label">Revenue</div>
          <div className="stat-value">{pitch.annualRevenue}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-label">Margin</div>
          <div className="stat-value">{pitch.profitMargin}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-label">Years</div>
          <div className="stat-value">{pitch.yearsInBusiness}y</div>
        </div>
        <div className="stat-tile">
          <div className="stat-label">Channel</div>
          <div className="stat-value">{pitch.salesChannel}</div>
        </div>
      </div>

      <div className="ask-box mt-4">
        <div className="mono-label" style={{ color: 'var(--accent-gold)' }}>
          The Ask
        </div>
        <div className="font-display mt-1 text-lg font-bold">
          {formatLakhs(pitch.askAmount)} for {pitch.askEquity}% equity
        </div>
        <div className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
          Valuation: {formatLakhs(valuation)}
        </div>
      </div>
    </div>
  )
}
