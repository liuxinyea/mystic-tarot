<template>
  <canvas ref="canvasRef" class="absolute inset-0 w-full h-full pointer-events-none" />
</template>

<script setup lang="ts">
/**
 * StarField — CSS Canvas 星空粒子背景
 * 使用 requestAnimationFrame 驱动，星点随机闪烁
 */

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationId: number | null = null

interface Star {
  x: number
  y: number
  radius: number
  opacity: number
  speed: number
  phase: number
}

function createStars(count: number, w: number, h: number): Star[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    radius: Math.random() * 1.2 + 0.2,
    opacity: Math.random() * 0.7 + 0.1,
    speed: Math.random() * 0.015 + 0.005,
    phase: Math.random() * Math.PI * 2,
  }))
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let stars: Star[] = []

  function resize() {
    if (!canvas) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    stars = createStars(180, canvas.width, canvas.height)
  }

  resize()
  window.addEventListener('resize', resize)

  let t = 0
  function draw() {
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    t += 1

    // 绘制深空背景渐变
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.7,
    )
    gradient.addColorStop(0, 'rgba(10, 15, 40, 0.4)')
    gradient.addColorStop(1, 'rgba(5, 5, 5, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 绘制星点
    for (const star of stars) {
      const twinkle = Math.sin(t * star.speed + star.phase) * 0.4 + 0.6
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`
      ctx.fill()

      // 偶尔绘制微弱的翡翠绿星点
      if (star.radius > 0.9) {
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius * 1.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(16, 185, 129, ${star.opacity * twinkle * 0.15})`
        ctx.fill()
      }
    }

    animationId = requestAnimationFrame(draw)
  }

  draw()

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resize)
    if (animationId) cancelAnimationFrame(animationId)
  })
})
</script>
