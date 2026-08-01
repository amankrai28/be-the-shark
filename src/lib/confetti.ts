/** Minimal canvas confetti burst (replaces the prototype's bundled library). */
export function confettiBurst({
  particleCount = 150,
  spread = 80,
  originY = 0.6,
  colors = ['#FFD700', '#FF6B35', '#00C9A7', '#845EC2'],
}: {
  particleCount?: number
  spread?: number
  originY?: number
  colors?: string[]
} = {}): void {
  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999'
  canvas.width = window.innerWidth * devicePixelRatio
  canvas.height = window.innerHeight * devicePixelRatio
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    canvas.remove()
    return
  }
  ctx.scale(devicePixelRatio, devicePixelRatio)

  const cx = window.innerWidth / 2
  const cy = window.innerHeight * originY
  const spreadRad = (spread * Math.PI) / 180
  const parts = Array.from({ length: particleCount }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * spreadRad
    const speed = 6 + Math.random() * 8
    return {
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 4 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      life: 1,
    }
  })

  let frame = 0
  const tick = () => {
    frame++
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    let alive = false
    for (const p of parts) {
      p.vy += 0.25
      p.x += p.vx
      p.y += p.vy
      p.rot += p.vr
      p.life -= 0.008
      if (p.life <= 0 || p.y > window.innerHeight + 20) continue
      alive = true
      ctx.save()
      ctx.globalAlpha = Math.max(0, p.life)
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
      ctx.restore()
    }
    if (alive && frame < 400) requestAnimationFrame(tick)
    else canvas.remove()
  }
  requestAnimationFrame(tick)
}
