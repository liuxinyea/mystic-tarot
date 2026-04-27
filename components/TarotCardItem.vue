<template>
  <!-- 牌背面（未翻开） -->
  <div
    class="tarot-card-item relative select-none"
    :class="{ 'cursor-pointer': isClickable, 'is-selected': isSelected }"
    :style="cardStyle"
    @click="handleClick"
  >
    <!-- 3D 翻转容器 -->
    <div
      class="card-flip-container w-full h-full"
      :style="{ width: cardWidth + 'px', height: cardHeight + 'px' }"
    >
      <div
        ref="flipInnerRef"
        class="card-flip-inner w-full h-full"
        :class="{ flipped: isRevealed }"
      >
        <!-- 牌背面 -->
        <div class="card-face card-back-face">
          <div class="card-back-design w-full h-full relative overflow-hidden rounded-xl">
            <!-- 神秘纹章背景 -->
            <div class="absolute inset-0 bg-gradient-to-br from-[#0d1a2e] via-[#0a1520] to-[#050d1a]" />
            <!-- 边框装饰 -->
            <div class="absolute inset-0 rounded-xl border border-emerald-glow/20" />
            <div class="absolute inset-[3px] rounded-[10px] border border-mystic-gold/15" />
            <!-- 中心符文 -->
            <div class="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 80 80" class="w-2/3 h-2/3 opacity-30" fill="none">
                <!-- 六芒星 -->
                <polygon points="40,5 50,23 68,23 55,35 60,53 40,42 20,53 25,35 12,23 30,23" fill="none" stroke="#10B981" stroke-width="0.8" />
                <!-- 内圆 -->
                <circle cx="40" cy="40" r="18" fill="none" stroke="#C9A96E" stroke-width="0.6" />
                <!-- 月亮符号 -->
                <path d="M 35 28 A 12 12 0 1 0 35 52 A 8 8 0 1 1 35 28 Z" fill="#C9A96E" opacity="0.4" />
                <!-- 外环 -->
                <circle cx="40" cy="40" r="35" fill="none" stroke="#10B981" stroke-width="0.4" stroke-dasharray="3 4" />
              </svg>
            </div>
            <!-- 发光效果（选中时） -->
            <transition name="glow-fade">
              <div
                v-if="isSelected"
                class="absolute inset-0 rounded-xl pointer-events-none"
                style="box-shadow: inset 0 0 20px rgba(16,185,129,0.2), 0 0 25px rgba(16,185,129,0.4);"
              />
            </transition>
          </div>
        </div>

        <!-- 牌正面 -->
        <div class="card-face card-back w-full h-full">
          <div class="card-front-design w-full h-full relative overflow-hidden rounded-xl">
            <!-- 牌图 -->
            <img
              v-if="card"
              :src="`${config.app.baseURL}cards/${card.img}`"
              :alt="card.name"
              class="w-full h-full object-cover"
              :style="card.isReversed ? 'transform: rotate(180deg)' : ''"
              loading="lazy"
            />
            <!-- 逆位遮罩标记 -->
            <div
              v-if="card?.isReversed"
              class="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-body font-medium tracking-wider"
              style="background: rgba(201,169,110,0.2); color: #C9A96E; border: 1px solid rgba(201,169,110,0.3);"
            >
              {{ $t('card.reversed') }}
            </div>
            <!-- 底部名称 -->
            <div
              v-if="card"
              class="absolute bottom-0 inset-x-0 p-2"
              style="background: linear-gradient(to top, rgba(5,5,5,0.95) 0%, transparent 100%)"
            >
              <p class="text-center text-[10px] font-display text-mystic-gold/90 leading-tight truncate">
                {{ card.name }}
              </p>
            </div>
            <!-- 边框 -->
            <div class="absolute inset-0 rounded-xl border border-white/10 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>

    <!-- 位置标签（牌阵中的位置名） -->
    <transition name="slide-up">
      <div
        v-if="positionLabel && isRevealed"
        class="absolute -bottom-6 left-0 right-0 text-center"
      >
        <span class="text-[10px] text-white/40 tracking-widest uppercase font-body">
          {{ $t(positionLabel) }}
        </span>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import type { CardWithOrientation } from '~/types/tarot'

const config = useRuntimeConfig()

const props = defineProps<{
  card?: CardWithOrientation
  index?: number
  isClickable?: boolean
  isSelected?: boolean
  isRevealed?: boolean
  positionLabel?: string
  cardWidth?: number
  cardHeight?: number
}>()

const emit = defineEmits<{
  click: [index: number]
}>()

const flipInnerRef = ref<HTMLElement | null>(null)

const cardWidth = computed(() => props.cardWidth ?? 80)
const cardHeight = computed(() => props.cardHeight ?? 130)

const cardStyle = computed(() => ({
  width: cardWidth.value + 'px',
  height: cardHeight.value + 'px',
}))

function handleClick() {
  if (!props.isClickable) return
  emit('click', props.index ?? 0)
}

// 监听揭示状态变化，用 GSAP 做翻牌动画
watch(() => props.isRevealed, async (revealed) => {
  if (!flipInnerRef.value || !import.meta.client) return
  const { default: gsap } = await import('gsap')
  if (revealed) {
    gsap.to(flipInnerRef.value, {
      rotateY: 180,
      duration: 0.7,
      ease: 'power2.inOut',
    })
  } else {
    gsap.to(flipInnerRef.value, {
      rotateY: 0,
      duration: 0.5,
      ease: 'power2.inOut',
    })
  }
})
</script>

<style scoped>
.tarot-card-item {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), filter 0.3s ease;
}

.tarot-card-item.cursor-pointer:hover {
  transform: translateY(-8px) scale(1.04);
  filter: brightness(1.12);
  z-index: 10;
}

.tarot-card-item.is-selected {
  filter: brightness(1.1);
  animation: breathe 2.5s ease-in-out infinite;
}

.card-back-face {
  /* 背面朝向用户（初始状态） */
}

@keyframes breathe {
  0%, 100% { box-shadow: 0 0 12px rgba(16,185,129,0.3); }
  50% { box-shadow: 0 0 28px rgba(16,185,129,0.6), 0 0 50px rgba(16,185,129,0.2); }
}

.glow-fade-enter-active, .glow-fade-leave-active {
  transition: opacity 0.4s;
}
.glow-fade-enter-from, .glow-fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition: all 0.4s ease-out 0.3s;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
</style>
