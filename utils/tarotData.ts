import type { TarotCard, CardWithOrientation, SpreadType, SpreadConfig } from '~/types/tarot'
import { SPREAD_CONFIGS, SUIT_NAMES } from '~/types/tarot'

// ============================================================
// 基础牌库数据（静态嵌入，避免 SSR 下大 JSON 动态导入问题）
// 数据通过 Nuxt useNuxtApp 或客户端 fetch 懒加载
// ============================================================
let _cachedCards: Record<string, TarotCard[]> = {}

export async function getAllCards(locale: string = 'zh'): Promise<TarotCard[]> {
  const lang = locale === 'zh' ? 'zh' : 'en'
  if (_cachedCards[lang]) return _cachedCards[lang]

  // 在客户端通过 fetch 获取（已放入 public/tarot-zh.json 和 tarot-en.json）
  // 在服务端通过直接 import 获取
  if (import.meta.server) {
    let data
    if (lang === 'zh') {
      data = await import('~/assets/tarot-zh.json')
    } else {
      data = await import('~/assets/tarot-images.json')
    }
    _cachedCards[lang] = data.default.cards as TarotCard[]
  } else {
    const config = useRuntimeConfig()
    const res = await fetch(`${config.app.baseURL}tarot-${lang}.json`)
    const data = await res.json()
    _cachedCards[lang] = data.cards as TarotCard[]
  }
  return _cachedCards[lang]
}

// 同步版本（仅客户端）：缓存已加载后调用
export function getAllCardsSync(locale: string = 'zh'): TarotCard[] {
  const lang = locale === 'zh' ? 'zh' : 'en'
  return _cachedCards[lang] ?? []
}

// ============================================================
// 洗牌工具
// ============================================================
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// ============================================================
// 生成带方向的牌堆
// ============================================================
export async function generateShuffledDeck(locale: string = 'zh'): Promise<CardWithOrientation[]> {
  const cards = await getAllCards(locale)
  const shuffled = shuffleArray(cards)
  return shuffled.map((card, index) => ({
    ...card,
    id: `${card.name.replace(/\s+/g, '-').toLowerCase()}-${index}`,
    isReversed: Math.random() > 0.5,
  }))
}

// ============================================================
// 本地解读生成器（无 API Key 时的降级方案）
// ============================================================
function getLocalInterpretation(cards: CardWithOrientation[], spreadType: SpreadType, locale: string = 'zh'): string {
  const config: SpreadConfig = SPREAD_CONFIGS[spreadType]
  const isEn = locale === 'en'

  const suitMapEn: Record<string, string> = {
    Trump: 'Major Arcana', Cups: 'Cups', Wands: 'Wands', Pentacles: 'Pentacles', Swords: 'Swords'
  }
  const suitMapZh: Record<string, string> = {
    Trump: '大阿卡纳', Cups: '圣杯', Wands: '权杖', Pentacles: '星币', Swords: '宝剑'
  }
  const suitMap = isEn ? suitMapEn : suitMapZh

  let text = ''

  // Section 1: 核心意象
  const section1Title = isEn ? 'Core Spread Imagery' : '牌阵核心意象'
  text += `## ${section1Title}\n\n`
  
  const cardSummaries = cards.map((card, i) => {
    const pos = config.positions[i] || (isEn ? `Position ${i + 1}` : `第${i + 1}张`)
    const orientation = card.isReversed 
      ? (isEn ? 'Reversed' : '逆位') 
      : (isEn ? 'Upright' : '正位')
    const suit = suitMap[card.suit] || card.suit
    const keywordsLabel = isEn ? 'Keywords' : '关键词'
    
    return `**${pos}**：${card.name}（${suit} · ${orientation}）\n${keywordsLabel}：${card.keywords.slice(0, 3).join(isEn ? ', ' : '、')}`
  })
  text += cardSummaries.join('\n\n') + '\n\n'

  // Section 2: 针对性分析
  const section2Title = isEn ? 'Detailed Analysis' : '针对性分析'
  text += `## ${section2Title}\n\n`
  
  cards.forEach((card, i) => {
    const pos = config.positions[i] || (isEn ? `Position ${i + 1}` : `第${i + 1}张`)
    const meanings = card.isReversed ? card.meanings.shadow : card.meanings.light
    const meaningText = meanings.slice(0, 2).join(isEn ? '; ' : '；')
    text += `**${pos}** — ${card.name}\n${meaningText}。\n\n`
  })

  // Section 3: 暖心建议
  const section3Title = isEn ? 'Heartfelt Advice' : '暖心建议'
  text += `## ${section3Title}\n\n`
  
  const allFortune = cards.flatMap(c => c.fortune_telling).slice(0, 3)
  text += allFortune.map(f => `• ${f}`).join('\n')
  
  const footer = isEn 
    ? '\n\nMay the stars guide you to your inner answers. Every card is a gentle response from the universe. 💚'
    : '\n\n愿星辰指引你找到内心的答案，每一张牌都是宇宙对你的温柔回应。💚'
  text += footer

  return text
}

export { getLocalInterpretation }
