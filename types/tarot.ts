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
    positions: ['当下'],
  },
  three: {
    type: 'three',
    count: 3,
    positions: ['过去', '现在', '未来'],
  },
  celtic: {
    type: 'celtic',
    count: 10,
    positions: [
      '当前处境', '挑战', '根基', '近期影响',
      '希望与恐惧', '外部影响', '自我态度',
      '建议', '希望', '最终结果',
    ],
  },
}

// 花色映射
export const SUIT_NAMES: Record<string, string> = {
  Trump: '大阿卡纳',
  Cups: '圣杯',
  Wands: '权杖',
  Pentacles: '星币',
  Swords: '宝剑',
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
