<template>
  <div class="tarot-deck relative w-full" :style="{ height: deckHeight + 'px' }">
    <!-- 牌堆容器 -->
    <div
      ref="deckRef"
      class="relative w-full h-full flex items-center justify-center overflow-visible touch-none"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointerleave="onPointerUp"
    >
      <!-- 单张牌（扇形展开） -->
      <div
        v-for="(card, i) in visibleCards"
        :key="card.id"
        :ref="(el) => setCardRef(el, i)"
        class="absolute"
        :style="cardPositionStyle(i)"
        :data-index="i"
      >
        <TarotCardItem
          :card="card"
          :index="i"
          :is-clickable="isSelecting && !isCardSelected(card)"
          :is-selected="isCardSelected(card)"
          :card-width="computedCardW"
          :card-height="computedCardH"
          @click="onCardClick"
        />
      </div>
    </div>

    <!-- 交互提示 (仅移动端且未交互时显示) -->
    <transition name="fade">
      <div
        v-if="showHint && isMobile"
        class="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
      >
        <div class="flex flex-col items-center gap-4">
          <div class="swipe-hint-icon relative w-12 h-12">
            <svg viewBox="0 0 24 24" class="w-full h-full text-mystic-gold/60" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 013 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1" />
            </svg>
          </div>
          <p class="text-xs font-body text-white/40 tracking-widest uppercase">
            {{ $t('home.swipeHint') || '滑动旋转探索' }}
          </p>
        </div>
      </div>
    </transition>

    <!-- 选牌提示 -->
    <transition name="fade">
      <div
        v-if="isSelecting"
        class="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none"
      >
        <div class="glass px-4 py-2 rounded-full border border-white/8">
          <p class="text-xs font-body text-white/50 text-center">
            {{ $t('home.selectedCount', { current: store.selectedCards.length, total: store.requiredCards }) }}
          </p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { useTarotStore } from '~/stores/tarot'
import type { CardWithOrientation } from '~/types/tarot'

const store = useTarotStore()
const deckRef = ref<HTMLElement | null>(null)

// Vue 3 动态 ref 收集（处理 v-for）
const cardEls: HTMLElement[] = []

function setCardRef(el: Element | ComponentPublicInstance | null, index: number) {
  if (el instanceof HTMLElement) {
    cardEls[index] = el
  }
}

const CARD_W = 80
const CARD_H = 130
const deckHeight = 280
// 最多展示 22 张牌（大阿卡纳）防止页面过于拥挤
const MAX_VISIBLE = 22

// 移动端适配
const isMobile = useMediaQuery('(max-width: 768px)')
const computedCardW = computed(() => isMobile.value ? 72 : CARD_W)
const computedCardH = computed(() => isMobile.value ? 116 : CARD_H)

// 旋转交互状态
const deckRotation = ref(0)
const isDragging = ref(false)
const lastPointerX = ref(0)
const lastVibratedRotation = ref(0)
const showHint = ref(true)

function onPointerDown(e: PointerEvent) {
  isDragging.value = true
  lastPointerX.value = e.clientX
  showHint.value = false
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging.value) return
  const deltaX = e.clientX - lastPointerX.value
  // 敏感度调整：移动端更灵敏
  const sensitivity = isMobile.value ? 0.35 : 0.2
  deckRotation.value += deltaX * sensitivity
  lastPointerX.value = e.clientX

  // 震动反馈 (每旋转一定角度触发一次短促震动)
  if (import.meta.client && isMobile.value && Math.abs(deckRotation.value - lastVibratedRotation.value) > 2.5) {
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate(8)
    }
    lastVibratedRotation.value = deckRotation.value
  }
}

function onPointerUp() {
  isDragging.value = false
}

const isSelecting = computed(() => store.phase === 'selecting')

// 显示前 MAX_VISIBLE 张
const visibleCards = computed(() =>
  store.currentDeck.slice(0, MAX_VISIBLE),
)

function isCardSelected(card: CardWithOrientation) {
  return store.selectedCards.some(c => c.id === card.id)
}

// 计算扇形位置
function cardPositionStyle(index: number): Record<string, string> {
  const total = visibleCards.value.length
  const spread = isMobile.value ? 240 : Math.min(total * 9, 340) // 移动端减小展开角度，增加堆叠感
  const angle = (total > 1 ? -spread / 2 + (index / (total - 1)) * spread : 0) + deckRotation.value
  const radius = isMobile.value ? 280 : 320
  const radian = (angle * Math.PI) / 180
  const x = Math.sin(radian) * radius
  const y = -Math.cos(radian) * radius + radius - computedCardH.value / 2 - 20

  return {
    transform: `translateX(calc(-50% + ${x}px)) translateY(${y}px) rotate(${angle}deg)`,
    transformOrigin: 'center bottom',
    zIndex: String(index),
    transition: isDragging.value ? 'none' : 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.3s ease',
  }
}

async function onCardClick(index: number) {
  if (!isSelecting.value) return
  if (store.selectedCards.length >= store.requiredCards) return

  const cardEl = cardEls[index]
  if (cardEl && import.meta.client) {
    const { default: gsap } = await import('gsap')
    gsap.to(cardEl, {
      y: -25,
      scale: 1.06,
      duration: 0.2,
      ease: 'power2.out',
      onComplete: () => {
        gsap.to(cardEl, { y: 0, scale: 1, duration: 0.2, ease: 'power2.in' })
      },
    })
  }

  // 选牌时的震动反馈
  if (import.meta.client && isMobile.value && window.navigator?.vibrate) {
    window.navigator.vibrate(15)
  }

  store.drawCard(index)
}

// 洗牌入场动画
watch(() => store.phase, async (phase) => {
  if (phase !== 'selecting') return
  if (!import.meta.client) return
  await nextTick()
  const els = cardEls.filter(Boolean)
  if (!els.length) return

  const { default: gsap } = await import('gsap')
  gsap.set(els, { opacity: 0, scale: 0.85 })
  gsap.to(els, {
    opacity: 1,
    scale: 1,
    duration: 0.45,
    stagger: { amount: 0.7, from: 'center' },
    ease: 'back.out(1.3)',
  })
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.swipe-hint-icon {
  animation: swipe-hint 2s ease-in-out infinite;
}

@keyframes swipe-hint {
  0%, 100% { transform: translateX(-20px) rotate(-10deg); opacity: 0.2; }
  50% { transform: translateX(20px) rotate(10deg); opacity: 0.8; }
}
</style>
