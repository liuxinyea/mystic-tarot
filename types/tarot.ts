// TypeScript 类型定义

export interface TarotCardMeanings {
  light: string[]
  shadow: string[]
}

export interface TarotCard {
  name: string
  number: string
  arcana: string
  suit: string
  img: string
  fortune_telling: string[]
  keywords: string[]
  meanings: TarotCardMeanings
  Archetype?: string
  'Hebrew Alphabet'?: string
  Numerology?: string
  Elemental?: string
  'Mythical/Spiritual'?: string
  'Questions to Ask'?: string[]
}

export interface CardWithOrientation extends TarotCard {
  id: string            // 唯一 ID（name + index）
  isReversed: boolean   // 是否逆位
  position?: string     // 牌阵位置名称（过去/现在/未来...）
}

export type SpreadType = 'single' | 'three' | 'celtic'

export interface SpreadConfig {
  type: SpreadType
  count: number
  positions: string[]
}

export const SPREAD_CONFIGS: Record<SpreadType, SpreadConfig> = {
  single: {
    type: 'single',
    count: 1,
    positions: ['spread.positions.present'],
  },
  three: {
    type: 'three',
    count: 3,
    positions: ['spread.positions.past', 'spread.positions.present', 'spread.positions.future'],
  },
  celtic: {
    type: 'celtic',
    count: 10,
    positions: [
      'spread.positions.situation', 'spread.positions.challenge', 'spread.positions.foundation', 'spread.positions.recent',
      'spread.positions.hopes', 'spread.positions.external', 'spread.positions.advice',
      'spread.positions.advice', 'spread.positions.hopes', 'spread.positions.outcome',
    ],
  },
}

// 花色映射 (Keys)
export const SUIT_NAMES: Record<string, string> = {
  Trump: 'card.majorArcana',
  Cups: 'card.suitCups',
  Wands: 'card.suitWands',
  Pentacles: 'card.suitPentacles',
  Swords: 'card.suitSwords',
}

// 判断牌的花色
export function getSuitFromImg(img: string): string {
  const prefix = img.charAt(0)
  const map: Record<string, string> = {
    m: 'Trump',
    c: 'Cups',
    w: 'Wands',
    p: 'Pentacles',
    s: 'Swords',
  }
  return map[prefix] || 'Unknown'
}
