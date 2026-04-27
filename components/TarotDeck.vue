<template>
  <div class="tarot-deck relative w-full" :style="{ height: deckHeight + 'px' }">
    <!-- 牌堆容器 -->
    <div
      ref="deckRef"
      class="relative w-full h-full flex items-center justify-center overflow-visible"
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
          :card-width="CARD_W"
          :card-height="CARD_H"
          @click="onCardClick"
        />
      </div>
    </div>

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
  const spread = Math.min(total * 9, 340) // 总展开角度（度）
  const angle = total > 1 ? -spread / 2 + (index / (total - 1)) * spread : 0
  const radius = 320
  const radian = (angle * Math.PI) / 180
  const x = Math.sin(radian) * radius
  const y = -Math.cos(radian) * radius + radius - CARD_H / 2 - 20

  return {
    transform: `translateX(calc(-50% + ${x}px)) translateY(${y}px) rotate(${angle}deg)`,
    transformOrigin: 'center bottom',
    zIndex: String(index),
    transition: 'filter 0.3s ease',
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
</style>
