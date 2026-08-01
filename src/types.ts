export interface Pitch {
  id: number
  season: number
  episode: number
  industry: string
  city: string
  description: string
  yearsInBusiness: number
  annualRevenue: string
  profitMargin: string
  askAmount: number // ₹ lakhs
  askEquity: number // %
  dealMade: boolean
  dealAmount: number | null // ₹ lakhs (equity-cash portion when hasDebt)
  dealEquity: number | null // %
  investingSharks: string[]
  companyName: string
  founderName: string
  productCategory: string
  salesChannel: string
  difficulty: 'easy' | 'medium' | 'hard'
  // schema v2 (optional until data QA backfills them)
  hasDebt?: boolean
  debtAmountLakhs?: number
  dealNote?: string
  dataSource?: string
  verified?: boolean
}

export type Decision =
  | { type: 'go_out' }
  | { type: 'match_ask' }
  | { type: 'counter'; amount: number; equity: number }

export interface Score {
  dealPrediction: number // /300
  amountAccuracy: number // /350
  equityAccuracy: number // /350
  total: number // /1000
}

export interface GameStats {
  currentStreak: number
  maxStreak: number
  gamesPlayed: number
  totalScore: number
  bestScore: number
  lastPlayedDate: string // YYYY-MM-DD in IST
  lastPracticeDate: string
  practiceUsed: number
  scoreDistribution: [number, number, number, number, number]
  pitchNumber: number
}
