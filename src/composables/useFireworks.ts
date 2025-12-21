import { onUnmounted, ref, type Ref } from 'vue'

/**
 * 烟花效果
 */
export function useFireworks(canvasRef: Ref<HTMLCanvasElement | undefined>) {
  let fireworksAnimation: number | null = null
  let fireworksCtx: CanvasRenderingContext2D | null = null
  const particles = ref<Array<{
    x: number
    y: number
    vx: number
    vy: number
    color: string
    life: number
    decay: number
  }>>([])

  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe']

  const createFirework = (x: number, y: number) => {
    const particleCount = 50
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount
      const speed = Math.random() * 5 + 2
      particles.value.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
        decay: Math.random() * 0.02 + 0.01
      })
    }
  }

  const start = () => {
    if (!canvasRef.value) return

    const canvas = canvasRef.value
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    fireworksCtx = canvas.getContext('2d')
    
    if (!fireworksCtx) return

    particles.value = []

    // 创建多个烟花
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        createFirework(
          Math.random() * window.innerWidth,
          Math.random() * window.innerHeight * 0.5
        )
      }, i * 200)
    }

    const animate = () => {
      if (!fireworksCtx || !canvas) return

      fireworksCtx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      fireworksCtx.fillRect(0, 0, canvas.width, canvas.height)

      for (let i = particles.value.length - 1; i >= 0; i--) {
        const p = particles.value[i]
        p.x += p.vx
        p.y += p.vy
        p.life -= p.decay

        if (p.life <= 0) {
          particles.value.splice(i, 1)
          continue
        }

        fireworksCtx.globalAlpha = p.life
        fireworksCtx.fillStyle = p.color
        fireworksCtx.beginPath()
        fireworksCtx.arc(p.x, p.y, 3, 0, Math.PI * 2)
        fireworksCtx.fill()
      }

      fireworksCtx.globalAlpha = 1.0

      if (particles.value.length > 0) {
        fireworksAnimation = requestAnimationFrame(animate)
      }
    }

    animate()
  }

  const stop = () => {
    if (fireworksAnimation) {
      cancelAnimationFrame(fireworksAnimation)
      fireworksAnimation = null
    }
    if (fireworksCtx && canvasRef.value) {
      fireworksCtx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    }
    particles.value = []
  }

  onUnmounted(() => {
    stop()
  })

  return {
    start,
    stop
  }
}

