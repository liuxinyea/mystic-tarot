<template>
  <div class="spread-selector flex flex-col items-center gap-6">
    <p class="text-sm font-body text-white/40 tracking-widest uppercase">
      {{ $t('home.spreadType') }}
    </p>
    <div class="grid grid-cols-3 gap-3 w-full max-w-sm">
      <button
        v-for="option in spreadOptions"
        :key="option.type"
        class="spread-option relative flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-300 cursor-pointer"
        :class="[
          selected === option.type
            ? 'glass-strong border-emerald-glow/40 glow-emerald-sm'
            : 'glass border-white/5 hover:border-white/15',
          'border'
        ]"
        @click="$emit('select', option.type)"
      >
        <!-- 图标 -->
        <div class="flex gap-1 items-end h-6">
          <span
            v-for="i in option.count > 3 ? 3 : option.count"
            :key="i"
            class="block w-1.5 rounded-sm transition-all duration-300"
            :style="{
              height: `${10 + i * 4}px`,
              background: selected === option.type
                ? 'linear-gradient(to top, #10B981, #34D399)'
                : 'rgba(255,255,255,0.25)',
            }"
          />
          <span
            v-if="option.count > 3"
            class="text-white/40 text-xs self-center ml-0.5"
          >+</span>
        </div>

        <!-- 名称 -->
        <span
          class="text-xs font-medium transition-colors duration-300"
          :class="selected === option.type ? 'text-emerald-glow' : 'text-white/60'"
        >
          {{ option.label }}
        </span>

        <!-- 描述 -->
        <span class="text-[10px] text-white/30 text-center leading-tight">
          {{ option.desc }}
        </span>

        <!-- 选中标记 -->
        <transition name="fade">
          <div
            v-if="selected === option.type"
            class="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-glow"
          />
        </transition>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SpreadType } from '~/types/tarot'

defineProps<{
  selected: SpreadType
}>()

defineEmits<{
  select: [type: SpreadType]
}>()

const { t } = useI18n()

const spreadOptions = computed(() => [
  {
    type: 'single' as SpreadType,
    count: 1,
    label: t('spread.single'),
    desc: t('spread.singleDesc'),
  },
  {
    type: 'three' as SpreadType,
    count: 3,
    label: t('spread.three'),
    desc: t('spread.threeDesc'),
  },
  {
    type: 'celtic' as SpreadType,
    count: 10,
    label: t('spread.celtic'),
    desc: t('spread.celticDesc'),
  },
])
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
