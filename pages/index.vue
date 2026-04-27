<template>
  <div class="mystic-app relative min-h-screen bg-abyss overflow-x-hidden">
    <Head>
      <Title>{{ $t('common.appName') }} — MysticTarot</Title>
      <Meta name="description" :content="$t('home.subtitle')" />
    </Head>

    <!-- 星空背景层 -->
    <StarField class="fixed inset-0 z-0" />

    <!-- 暗角叠加 -->
    <div class="vignette" />

    <!-- 顶部工具栏 -->
    <header class="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-5 py-4 safe-top">
      <!-- Logo -->
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-full flex items-center justify-center" style="background: linear-gradient(135deg, #10B981, #059669);">
          <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L9.5 8.5H3L8.25 12.5L6.25 19L12 15.25L17.75 19L15.75 12.5L21 8.5H14.5L12 2Z" />
          </svg>
        </div>
        <span class="font-display text-sm text-white/80 tracking-wide">{{ $t('common.appName') }}</span>
      </div>

      <!-- 右侧工具 -->
      <div class="flex items-center gap-3">
        <!-- 语言切换 -->
        <button
          class="w-8 h-8 flex items-center justify-center rounded-full glass border border-white/8 text-white/60 hover:text-white/90 hover:border-white/20 transition-all text-[10px] font-bold tracking-tighter"
          @click="toggleLocale"
        >
          {{ locale === 'zh' ? 'EN' : '中' }}
        </button>
        <AudioPlayer />
        <!-- 重置按钮（非 idle 状态时显示） -->
        <transition name="fade">
          <button
            v-if="store.phase !== 'idle'"
            class="w-8 h-8 flex items-center justify-center rounded-full glass border border-white/8 text-white/40 hover:text-white/70 transition-colors"
            :title="$t('common.reset')"
            @click="handleReset"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </transition>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pb-10 pt-20">

      <!-- ============================================================
           Phase: IDLE — 首页
           ============================================================ -->
      <transition name="phase-fade" mode="out-in">
        <section v-if="store.phase === 'idle'" key="idle" class="flex flex-col items-center gap-8 w-full max-w-lg text-center">

          <!-- 主标题 -->
          <div class="space-y-3">
            <div class="w-16 h-px mx-auto" style="background: linear-gradient(90deg, transparent, #10B981, transparent);" />
            <h1 class="font-display text-4xl md:text-5xl text-white/95 leading-tight">
              {{ $t('home.title') }}
            </h1>
            <p class="font-body text-sm text-white/40 tracking-widest">✦ {{ $t('home.subtitle') }} ✦</p>
            <div class="w-16 h-px mx-auto" style="background: linear-gradient(90deg, transparent, #C9A96E, transparent);" />
          </div>

          <!-- 浮动神秘图案 -->
          <div class="relative w-32 h-32 animate-float">
            <svg viewBox="0 0 120 120" class="w-full h-full" fill="none">
              <circle cx="60" cy="60" r="55" stroke="rgba(16,185,129,0.15)" stroke-width="1" />
              <circle cx="60" cy="60" r="42" stroke="rgba(201,169,110,0.2)" stroke-width="0.8" stroke-dasharray="4 6" />
              <circle cx="60" cy="60" r="28" stroke="rgba(16,185,129,0.25)" stroke-width="1" />
              <!-- 星形 -->
              <path d="M60 20 L65 45 L90 45 L70 60 L78 85 L60 70 L42 85 L50 60 L30 45 L55 45 Z"
                    fill="none" stroke="rgba(201,169,110,0.4)" stroke-width="0.8" stroke-linejoin="round" />
              <!-- 中心点 -->
              <circle cx="60" cy="60" r="4" fill="#10B981" opacity="0.6" />
              <circle cx="60" cy="60" r="7" fill="none" stroke="#10B981" stroke-width="0.5" opacity="0.4" />
            </svg>
            <!-- 呼吸光晕 -->
            <div
              class="absolute inset-0 rounded-full animate-breathe pointer-events-none"
              style="background: radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%);"
            />
          </div>

          <!-- 选择牌阵 -->
          <SpreadSelector
            :selected="store.spreadType"
            @select="store.spreadType = $event"
          />

          <!-- 开始按钮 -->
          <button
            id="start-shuffle-btn"
            class="btn-primary px-10 py-4 text-base tracking-widest font-medium"
            @click="handleShuffle"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ $t('home.startButton') }}
          </button>

          <!-- 底部装饰文字 -->
          <p class="text-[11px] text-white/20 font-body tracking-widest mt-4">
            TAROT · ASTROLOGY · AI INSIGHT
          </p>
        </section>

        <!-- ============================================================
             Phase: SHUFFLING — 洗牌
             ============================================================ -->
        <section v-else-if="store.phase === 'shuffling'" key="shuffling" class="flex flex-col items-center gap-6">
          <div class="relative">
            <!-- 洗牌动画 -->
            <div class="shuffle-animation flex items-center justify-center gap-2">
              <div
                v-for="i in 5"
                :key="i"
                class="w-10 h-16 glass-card animate-float border border-emerald-glow/20"
                :style="{
                  animationDelay: `${(i - 1) * 0.15}s`,
                  transform: `rotate(${(i - 3) * 8}deg)`,
                }"
              />
            </div>
          </div>
          <p class="font-body text-sm text-white/50 animate-pulse tracking-widest">
            {{ $t('home.shuffling') }}
          </p>
        </section>

        <!-- ============================================================
             Phase: SELECTING — 抽牌
             ============================================================ -->
        <section v-else-if="store.phase === 'selecting'" key="selecting" class="w-full flex flex-col items-center gap-6">

          <!-- 已选牌区 -->
          <transition name="slide-down">
            <div v-if="store.selectedCards.length > 0" class="w-full max-w-lg">
              <SelectedCards :is-revealed="false" />
            </div>
          </transition>

          <!-- 提示语 -->
          <p class="text-sm font-body text-white/40 tracking-wider">
            {{ $t('home.selectPrompt', { count: store.requiredCards }) }}
          </p>

          <!-- 牌堆 -->
          <div class="w-full">
            <TarotDeck />
          </div>

          <!-- 揭示按钮 -->
          <transition name="fade">
            <button
              v-if="store.canReveal"
              id="reveal-btn"
              class="btn-primary px-10 py-4 text-base tracking-widest breathe-glow"
              @click="handleReveal"
            >
              ✨ {{ $t('home.revealButton') }}
            </button>
          </transition>
        </section>

        <!-- ============================================================
             Phase: REVEALING — 揭牌
             ============================================================ -->
        <section v-else-if="store.phase === 'revealing'" key="revealing" class="w-full flex flex-col items-center gap-10">
          <p class="font-display text-lg text-mystic-gold/80 animate-pulse">
            ✦ 牌阵已揭示 ✦
          </p>

          <SelectedCards :is-revealed="true" />

          <button
            id="interpret-btn"
            class="btn-primary px-10 py-4 text-base tracking-widest"
            :disabled="store.isAnalyzing"
            @click="handleInterpret"
          >
            <span v-if="!store.isAnalyzing">🔮 {{ $t('interpretation.title') }}</span>
            <span v-else class="flex items-center gap-2">
              <div class="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
              {{ $t('common.loading') }}
            </span>
          </button>
        </section>

        <!-- ============================================================
             Phase: INTERPRETING — 解读中（空态，由弹窗接管）
             ============================================================ -->
        <section v-else-if="store.phase === 'interpreting'" key="interpreting" class="flex flex-col items-center gap-6">
          <SelectedCards :is-revealed="true" />
        </section>
      </transition>
    </main>

    <!-- 解读弹窗 -->
    <Transition name="overlay-fade">
      <InterpretationPanel
        v-if="store.phase === 'interpreting'"
        @close="handleReset"
        @read-again="handleReset"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useTarotStore } from '~/stores/tarot'

const { locale, setLocale, t } = useI18n()
const store = useTarotStore()

function toggleLocale() {
  const nextLocale = locale.value === 'zh' ? 'en' : 'zh'
  setLocale(nextLocale)
}

// SEO
useSeoMeta({
  title: () => `${t('common.appName')} — MysticTarot`,
  description: () => t('home.subtitle'),
  ogTitle: () => `${t('common.appName')} — MysticTarot`,
  ogDescription: () => t('home.subtitle'),
})

async function handleShuffle() {
  await store.shuffleDeck()
}

function handleReveal() {
  store.revealCards()
  // 短暂揭牌后自动弹出解读面板并开始分析
  setTimeout(() => {
    store.fetchInterpretation()
  }, 1800)
}

function handleInterpret() {
  store.fetchInterpretation()
}

function handleReset() {
  store.reset()
}
</script>

<style scoped>
/* Phase 过渡 */
.phase-fade-enter-active,
.phase-fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.phase-fade-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
.phase-fade-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}

/* 覆盖层过渡 */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.4s ease;
}
.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

/* 下滑入场 */
.slide-down-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
