<template>
  <button
    class="audio-btn relative flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/8 transition-all duration-300 hover:border-emerald-glow/30 group"
    :aria-label="audioEnabled ? $t('audio.off') : $t('audio.on')"
    @click="toggle"
  >
    <!-- 音波图标 -->
    <div class="flex items-end gap-0.5 h-4">
      <span
        v-for="(h, i) in barHeights"
        :key="i"
        class="block w-0.5 rounded-full transition-all duration-150"
        :class="audioEnabled ? 'bg-emerald-glow' : 'bg-white/30'"
        :style="{
          height: `${audioEnabled ? h : 4}px`,
          animationDelay: `${i * 0.1}s`,
        }"
      />
    </div>
    <span class="text-xs font-body text-white/50 group-hover:text-white/80 transition-colors">
      {{ $t('audio.toggle') }}
    </span>

    <!-- 隐藏的 audio 元素 -->
    <audio ref="audioRef" loop preload="none">
      <source :src="AUDIO_SRC" type="audio/mpeg" />
    </audio>
  </button>
</template>

<script setup lang="ts">
import { useTarotStore } from '~/stores/tarot'

// 使用免版权的冥想环境音（binaural beats / ambient）
const AUDIO_SRC = 'https://cdn.pixabay.com/audio/2022/08/04/audio_2dde668d05.mp3'

const store = useTarotStore()
const audioEnabled = computed(() => store.audioEnabled)
const audioRef = ref<HTMLAudioElement | null>(null)

// 音波柱高度（随机，配合动画）
const barHeights = ref([6, 10, 14, 10, 6])
let barInterval: ReturnType<typeof setInterval> | null = null

function animateBars() {
  barHeights.value = barHeights.value.map(() => Math.floor(Math.random() * 12) + 4)
}

async function toggle() {
  store.toggleAudio()
  const audio = audioRef.value
  if (!audio) return

  if (store.audioEnabled) {
    audio.volume = 0.25
    try {
      await audio.play()
    } catch {
      // 某些浏览器需要用户手势后才能播放
    }
    barInterval = setInterval(animateBars, 150)
  } else {
    audio.pause()
    if (barInterval) clearInterval(barInterval)
  }
}

onBeforeUnmount(() => {
  if (barInterval) clearInterval(barInterval)
  audioRef.value?.pause()
})
</script>
