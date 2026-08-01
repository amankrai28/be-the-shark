import type { Score } from '../types'
import { scoreEmoji, scoreTitle } from './format'
import { AMOUNT_POINTS, DEAL_CALL_POINTS, EQUITY_POINTS } from './scoring'

/**
 * Hand-drawn canvas score card (1080×1350, 4:5) — renders well in WhatsApp
 * chats, IG feed, and X. No image library; brand tokens are inlined.
 */
const W = 1080
const H = 1350

const BG = '#0b0e13'
const CARD = '#13171e'
const SURFACE = '#1c2230'
const BORDER = '#2a3040'
const TEXT = '#f0f2f5'
const MUTED = '#5a6478'
const SECONDARY = '#8b95a8'
const GOLD = '#ffd700'
const ORANGE = '#ff8c00'
const TEAL = '#00c9a7'

const DISPLAY = '"Outfit", -apple-system, "Segoe UI", sans-serif'
const MONO = '"JetBrains Mono", ui-monospace, Menlo, monospace'

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function goldGradient(ctx: CanvasRenderingContext2D, x: number, y: number, w: number): CanvasGradient {
  const g = ctx.createLinearGradient(x, y, x + w, y)
  g.addColorStop(0, GOLD)
  g.addColorStop(1, ORANGE)
  return g
}

export async function drawShareCard(
  score: Score,
  pitchNo: number,
  streak: number,
  best: number,
): Promise<Blob | null> {
  try {
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      await document.fonts.ready
    }
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // background + dotted texture
    ctx.fillStyle = BG
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#1a1f2a'
    for (let y = 30; y < H; y += 56) {
      for (let x = 30; x < W; x += 56) {
        ctx.beginPath()
        ctx.arc(x, y, 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    ctx.textAlign = 'center'

    // header
    ctx.font = '90px serif'
    ctx.fillText('🦈', W / 2, 150)
    ctx.font = `800 76px ${DISPLAY}`
    ctx.fillStyle = TEXT
    const title = 'BE THE '
    const tw = ctx.measureText(title).width
    const sw = ctx.measureText('SHARK').width
    const startX = W / 2 - (tw + sw) / 2
    ctx.textAlign = 'left'
    ctx.fillText(title, startX, 260)
    ctx.fillStyle = GOLD
    ctx.fillText('SHARK', startX + tw, 260)
    ctx.textAlign = 'center'
    ctx.font = `700 30px ${MONO}`
    ctx.fillStyle = SECONDARY
    ctx.fillText(`P I T C H   # ${pitchNo}`, W / 2, 320)

    // score panel
    const px = 80
    const pw = W - 160
    roundRect(ctx, px, 380, pw, 560, 32)
    ctx.fillStyle = CARD
    ctx.fill()
    ctx.strokeStyle = BORDER
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.font = '80px serif'
    ctx.fillText(scoreEmoji(score.total), W / 2, 490)
    ctx.font = `800 150px ${DISPLAY}`
    ctx.fillStyle = GOLD
    ctx.fillText(String(score.total), W / 2, 650)
    ctx.font = `700 40px ${DISPLAY}`
    ctx.fillStyle = MUTED
    ctx.fillText('/ 1000', W / 2, 705)
    ctx.font = `700 34px ${MONO}`
    ctx.fillStyle = TEAL
    ctx.fillText(scoreTitle(score.total).split('').join(' '), W / 2, 770)

    // component bars
    const rows: [string, number, number][] = [
      ['Deal Call', score.dealPrediction, DEAL_CALL_POINTS],
      ['Amount', score.amountAccuracy, AMOUNT_POINTS],
      ['Equity', score.equityAccuracy, EQUITY_POINTS],
    ]
    let by = 830
    for (const [label, pts, max] of rows) {
      ctx.textAlign = 'left'
      ctx.font = `500 28px ${DISPLAY}`
      ctx.fillStyle = SECONDARY
      ctx.fillText(label, px + 50, by + 10)
      const bx = px + 240
      const bw = pw - 420
      roundRect(ctx, bx, by - 12, bw, 24, 12)
      ctx.fillStyle = SURFACE
      ctx.fill()
      if (pts > 0) {
        roundRect(ctx, bx, by - 12, Math.max(24, (pts / max) * bw), 24, 12)
        ctx.fillStyle = goldGradient(ctx, bx, by, bw)
        ctx.fill()
      }
      ctx.textAlign = 'right'
      ctx.font = `700 26px ${MONO}`
      ctx.fillStyle = TEXT
      ctx.fillText(`${pts}/${max}`, px + pw - 40, by + 8)
      by += 76
    }

    // streak / best strip
    roundRect(ctx, px, 1080, pw, 120, 24)
    ctx.fillStyle = CARD
    ctx.fill()
    ctx.strokeStyle = BORDER
    ctx.stroke()
    ctx.textAlign = 'center'
    ctx.font = `700 40px ${DISPLAY}`
    ctx.fillStyle = TEXT
    ctx.fillText(`🔥 Streak ${streak}`, W / 2 - 230, 1155)
    ctx.fillText(`🏆 Best ${best}`, W / 2 + 230, 1155)
    ctx.strokeStyle = BORDER
    ctx.beginPath()
    ctx.moveTo(W / 2, 1105)
    ctx.lineTo(W / 2, 1175)
    ctx.stroke()

    // footer
    ctx.font = `700 36px ${DISPLAY}`
    ctx.fillStyle = GOLD
    ctx.fillText('Play at be-the-shark.vercel.app', W / 2, 1285)

    return await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  } catch {
    return null
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}
