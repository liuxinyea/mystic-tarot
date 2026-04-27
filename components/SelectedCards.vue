<template>
  <!-- 已选牌展示区 -->
  <div class="selected-cards-display">
    <transition-group
      name="card-appear"
      tag="div"
      class="flex items-end justify-center gap-4 flex-wrap"
    >
      <div
        v-for="(card, i) in store.selectedCards"
        :key="card.id"
        class="relative flex flex-col items-center gap-3"
      >
        <TarotCardItem
          :card="card"
          :is-revealed="isRevealed"
          :position-label="store.spreadPositions[i]"
          :card-width="CARD_W"
          :card-height="CARD_H"
        />
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useTarotStore } from '~/stores/tarot'

const store = useTarotStore()

const props = defineProps<{
  isRevealed: boolean
}>()

const CARD_W = 100
const CARD_H = 163
</script>

<style scoped>
.card-appear-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.card-appear-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.8);
}
</style>
