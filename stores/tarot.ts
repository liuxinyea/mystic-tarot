import { defineStore } from 'pinia'
import type { CardWithOrientation, SpreadType } from '~/types/tarot'
import { SPREAD_CONFIGS } from '~/types/tarot'
import { generateShuffledDeck } from '~/utils/tarotData'

export const useTarotStore = defineStore('tarot', () => {
  const { locale } = useI18n()

  // ============================================================
  // State
  // ============================================================
  const currentDeck = ref<CardWithOrientation[]>([])
  const selectedCards = ref<CardWithOrientation[]>([])
  const spreadType = ref<SpreadType>('three')
  const isShuffling = ref(false)
  const isAnalyzing = ref(false)
  const interpretation = ref('')
  const isUsingLocalFallback = ref(false)
  const audioEnabled = ref(false)
  const phase = ref<'idle' | 'shuffling' | 'selecting' | 'revealing' | 'interpreting'>('idle')

  // ============================================================
  // Getters
  // ============================================================
  const requiredCards = computed(() => SPREAD_CONFIGS[spreadType.value].count)
  const canReveal = computed(() => selectedCards.value.length >= requiredCards.value)
  const spreadPositions = computed(() => SPREAD_CONFIGS[spreadType.value].positions)

  // ============================================================
  // Actions
  // ============================================================

  /** 洗牌 */
  async function shuffleDeck() {
    isShuffling.value = true
    phase.value = 'shuffling'
    // 模拟洗牌时间（配合 GSAP 动画）
    await new Promise(resolve => setTimeout(resolve, 1200))
    currentDeck.value = await generateShuffledDeck(locale.value)
    isShuffling.value = false
    phase.value = 'selecting'
  }

  /** 抽一张牌 */
  function drawCard(index: number) {
    if (selectedCards.value.length >= requiredCards.value) return
    const card = currentDeck.value[index]
    if (!card) return

    // 触觉反馈（移动端）
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50)
    }

    // 标记位置
    const positionIndex = selectedCards.value.length
    const cardWithPosition: CardWithOrientation = {
      ...card,
      position: SPREAD_CONFIGS[spreadType.value].positions[positionIndex],
    }

    selectedCards.value.push(cardWithPosition)
  }

  /** 揭示牌阵 */
  function revealCards() {
    if (!canReveal.value) return
    phase.value = 'revealing'
  }

  /** 获取 AI 解读 */
  async function fetchInterpretation() {
    phase.value = 'interpreting'
    isAnalyzing.value = true
    interpretation.value = ''
    isUsingLocalFallback.value = false

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cards: selectedCards.value,
          spreadType: spreadType.value,
          userContext: 'my beloved wife',
        }),
      })

      if (!response.ok) throw new Error('API error')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader')

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        // 解析 SSE data 行
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') break
            if (data.startsWith('{')) {
              try {
                const parsed = JSON.parse(data)
                if (parsed.fallback) {
                  // 本地降级
                  isUsingLocalFallback.value = true
                  interpretation.value = parsed.text
                } else if (parsed.text) {
                  interpretation.value += parsed.text
                }
              } catch {
                interpretation.value += data
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Interpretation fetch failed:', error)
      // 降级到本地解读
      const { getLocalInterpretation } = await import('~/utils/tarotData')
      isUsingLocalFallback.value = true
      interpretation.value = getLocalInterpretation(selectedCards.value, spreadType.value)
    } finally {
      isAnalyzing.value = false
    }
  }

  /** 切换音频 */
  function toggleAudio() {
    audioEnabled.value = !audioEnabled.value
  }

  /** 重置所有状态 */
  function reset() {
    currentDeck.value = []
    selectedCards.value = []
    interpretation.value = ''
    isAnalyzing.value = false
    isShuffling.value = false
    isUsingLocalFallback.value = false
    phase.value = 'idle'
  }

  return {
    // State
    currentDeck,
    selectedCards,
    spreadType,
    isShuffling,
    isAnalyzing,
    interpretation,
    isUsingLocalFallback,
    audioEnabled,
    phase,
    // Getters
    requiredCards,
    canReveal,
    spreadPositions,
    // Actions
    shuffleDeck,
    drawCard,
    revealCards,
    fetchInterpretation,
    toggleAudio,
    reset,
  }
})
