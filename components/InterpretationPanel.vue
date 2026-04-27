<template>
  <Teleport to="body">
    <div class="interpretation-overlay" @click.self="$emit('close')">
      <div
        ref="panelRef"
        class="interpretation-panel relative w-full max-w-3xl mx-auto h-full md:h-auto md:max-h-[90vh] flex flex-col md:rounded-3xl overflow-hidden"
        style="background: linear-gradient(160deg, rgba(13,17,30,0.97) 0%, rgba(5,5,5,0.98) 100%); border: 1px solid rgba(255,255,255,0.07);"
      >
        <!-- 顶部装饰条 -->
        <div class="h-px w-full" style="background: linear-gradient(90deg, transparent, #10B981 40%, #C9A96E 60%, transparent);" />

        <!-- Header -->
        <div class="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <h2 class="font-display text-xl text-white/90">
              {{ $t('interpretation.title') }}
            </h2>
            <p v-if="store.isUsingLocalFallback" class="text-xs text-white/30 mt-0.5">
              {{ $t('interpretation.poweredByLocal') }}
            </p>
            <p v-else-if="!store.isAnalyzing" class="text-xs text-emerald-glow/60 mt-0.5">
              {{ $t('interpretation.poweredBy') }}
            </p>
          </div>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-full glass border border-white/8 text-white/40 hover:text-white/80 transition-colors"
            @click="$emit('close')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex flex-col md:flex-row gap-0 flex-1 overflow-hidden">
          <!-- 左侧：已选牌 -->
          <div class="flex md:flex-col items-center justify-center gap-3 px-6 py-4 md:py-6 md:w-44 md:border-r md:border-white/5 flex-shrink-0">
            <div
              v-for="(card, i) in store.selectedCards"
              :key="card.id"
              class="relative flex flex-col items-center gap-1"
            >
              <div
                class="relative rounded-lg overflow-hidden border border-white/10 flex-shrink-0"
                :style="{ width: '56px', height: '91px' }"
              >
                <img
                  :src="`/cards/${card.img}`"
                  :alt="card.name"
                  class="w-full h-full object-cover"
                  :style="card.isReversed ? 'transform: rotate(180deg)' : ''"
                />
                <div
                  class="absolute bottom-0 inset-x-0"
                  style="background: linear-gradient(to top, rgba(5,5,5,0.9) 0%, transparent 100%); padding: 2px 3px;"
                >
                  <p class="text-center text-[7px] font-display text-mystic-gold/80 truncate">{{ card.name }}</p>
                </div>
              </div>
              <span class="text-[9px] text-white/30 font-body tracking-wider text-center">
                {{ store.spreadPositions[i] }}
              </span>
              <span
                class="text-[8px] px-1 rounded"
                :class="card.isReversed ? 'text-mystic-gold/60' : 'text-emerald-glow/60'"
              >
                {{ card.isReversed ? $t('card.reversed') : $t('card.upright') }}
              </span>
            </div>
          </div>

          <!-- 右侧：解读文本 -->
          <div class="flex-1 overflow-y-auto px-6 py-4 md:py-6" ref="textContainerRef">
            <!-- 加载中 -->
            <div v-if="store.isAnalyzing && !store.interpretation" class="flex flex-col items-center justify-center gap-4 py-16">
              <div class="mystic-spinner" />
              <p class="text-sm text-white/40 font-body animate-pulse">{{ $t('interpretation.loading') }}</p>
            </div>

            <!-- 解读内容（Markdown 渲染） -->
            <div
              v-else
              class="interpretation-text prose-mystic"
              :class="{ 'typewriter-cursor': store.isAnalyzing }"
              v-html="renderedMarkdown"
            />
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="flex items-center justify-between gap-3 px-6 py-4 border-t border-white/5">
          <button
            class="btn-glass text-sm"
            @click="$emit('readAgain')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ $t('interpretation.readAgain') }}
          </button>
          <button
            v-if="canShare"
            class="btn-glass text-sm"
            @click="shareReading"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {{ $t('interpretation.share') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useTarotStore } from '~/stores/tarot'

const emit = defineEmits<{
  close: []
  readAgain: []
}>()

const store = useTarotStore()
const panelRef = ref<HTMLElement | null>(null)
const textContainerRef = ref<HTMLElement | null>(null)

// 简单的 Markdown → HTML 转换（无需额外依赖）
const renderedMarkdown = computed(() => {
  const text = store.interpretation
  if (!text) return ''

  return text
    // ## 标题
    .replace(/^## (.+)$/gm, '<h3 class="interp-heading">$1</h3>')
    // **粗体**
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white/90">$1</strong>')
    // • 列表项
    .replace(/^[•·]\s(.+)$/gm, '<li class="interp-li">$1</li>')
    // 💚 结尾特殊样式
    .replace(/(💚[^\n]*)/g, '<span class="text-emerald-glow">$1</span>')
    // 换行
    .replace(/\n\n/g, '</p><p class="interp-para">')
    .replace(/\n/g, '<br/>')
    // 包裹第一段
    .replace(/^/, '<p class="interp-para">')
    .replace(/$/, '</p>')
    // 列表包裹
    .replace(/(<li[\s\S]*?<\/li>)/g, '<ul class="interp-ul">$1</ul>')
})

// 自动滚动到底部（流式输出时）
watch(() => store.interpretation, () => {
  nextTick(() => {
    const el = textContainerRef.value
    if (el) el.scrollTop = el.scrollHeight
  })
})

// 入场动画
onMounted(async () => {
  if (panelRef.value) {
    const { default: gsap } = await import('gsap')
    gsap.from(panelRef.value, {
      y: 60,
      opacity: 0,
      duration: 0.5,
      ease: 'power3.out',
    })
  }
})

const canShare = computed(() =>
  typeof navigator !== 'undefined' && !!navigator.share && !!store.interpretation,
)

async function shareReading() {
  const cards = store.selectedCards.map(c => `${c.name} (${c.isReversed ? '逆位' : '正位'})`).join(' · ')
  try {
    await navigator.share({
      title: '我的塔罗解读',
      text: `我抽到了：${cards}\n\n${store.interpretation.slice(0, 200)}...`,
    })
  } catch {
    // 用户取消
  }
}
</script>

<style>
/* Prose-mystic 样式（全局，因为是 v-html 渲染） */
.interpretation-text {
  color: rgba(255, 255, 255, 0.75);
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  line-height: 1.8;
}

.interp-heading {
  font-family: 'Playfair Display', serif;
  font-size: 1rem;
  font-weight: 600;
  color: #C9A96E;
  margin: 1.5rem 0 0.75rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid rgba(201, 169, 110, 0.2);
}

.interp-para {
  margin: 0.5rem 0;
  color: rgba(255, 255, 255, 0.72);
}

.interp-ul {
  margin: 0.5rem 0;
  padding-left: 0;
  list-style: none;
}

.interp-li {
  position: relative;
  padding-left: 1.2rem;
  margin: 0.35rem 0;
  color: rgba(255, 255, 255, 0.72);
}

.interp-li::before {
  content: '◆';
  position: absolute;
  left: 0;
  color: #10B981;
  font-size: 0.5rem;
  top: 0.35em;
}
</style>
