import OpenAI from 'openai'
import type { CardWithOrientation, SpreadType } from '~/types/tarot'
import { SPREAD_CONFIGS, SUIT_NAMES } from '~/types/tarot'
import { getLocalInterpretation } from '~/utils/tarotData'

interface AnalyzeRequest {
  cards: CardWithOrientation[]
  spreadType: SpreadType
  userContext?: string
  locale?: string
}

function buildPrompt(cards: CardWithOrientation[], spreadType: SpreadType, userContext: string, locale: string = 'zh'): string {
  const config = SPREAD_CONFIGS[spreadType]
  const isEn = locale === 'en'
  
  const suitMapEn: Record<string, string> = {
    Trump: 'Major Arcana', Cups: 'Cups', Wands: 'Wands', Pentacles: 'Pentacles', Swords: 'Swords'
  }
  const suitMapZh: Record<string, string> = {
    Trump: '大阿卡纳', Cups: '圣杯', Wands: '权杖', Pentacles: '星币', Swords: '宝剑'
  }
  const suitMap = isEn ? suitMapEn : suitMapZh

  const positionMapEn: Record<string, string> = {
    'spread.positions.past': 'Past',
    'spread.positions.present': 'Present',
    'spread.positions.future': 'Future',
    'spread.positions.situation': 'Current Situation',
    'spread.positions.challenge': 'Challenge',
    'spread.positions.foundation': 'Foundation',
    'spread.positions.recent': 'Recent Influences',
    'spread.positions.hopes': 'Hopes and Fears',
    'spread.positions.external': 'External Influences',
    'spread.positions.advice': 'Advice',
    'spread.positions.outcome': 'Final Outcome'
  }
  const positionMapZh: Record<string, string> = {
    'spread.positions.past': '过去',
    'spread.positions.present': '现在',
    'spread.positions.future': '未来',
    'spread.positions.situation': '当前处境',
    'spread.positions.challenge': '挑战',
    'spread.positions.foundation': '根基',
    'spread.positions.recent': '近期影响',
    'spread.positions.hopes': '希望与恐惧',
    'spread.positions.external': '外部影响',
    'spread.positions.advice': '建议',
    'spread.positions.outcome': '最终结果'
  }
  const positionMap = isEn ? positionMapEn : positionMapZh

  const cardDescriptions = cards.map((card, i) => {
    const posKey = config.positions[i]
    const pos = positionMap[posKey] || (isEn ? `Position ${i + 1}` : `第${i + 1}张`)
    const orientation = card.isReversed ? (isEn ? 'Reversed' : '逆位') : (isEn ? 'Upright' : '正位')
    const suit = suitMap[card.suit] || card.suit
    const meanings = card.isReversed ? card.meanings.shadow : card.meanings.light
    return `【${pos}】${card.name}（${suit} · ${orientation}）
  ${isEn ? 'Keywords' : '关键词'}：${card.keywords.join(isEn ? ', ' : '、')}
  ${isEn ? 'Core Meaning' : '核心含义'}：${meanings.slice(0, 3).join(isEn ? '; ' : '；')}`
  }).join('\n\n')

  if (isEn) {
    return `You are an expert tarot reader, astrologer, and psychologist, acting as a loving and insightful spiritual guide.

You are performing a tarot reading for ${userContext}. Please use a gentle, intimate, and healing tone, as if whispering warm wisdom.

【Spread Type】${config.type === 'single' ? 'Single Card' : config.type === 'three' ? 'Three Cards (Past · Present · Future)' : 'Celtic Cross'}

【Drawn Cards】
${cardDescriptions}

Please provide a deep interpretation in English using Markdown H2 (##) headers:

## Core Spread Imagery

Describe the overall energy and theme of these cards together (2-3 paragraphs, poetic expression).

## Detailed Analysis

Analyze each card based on its position and orientation (one paragraph per card, 2-3 sentences each).

## Heartfelt Advice

Give 3 gentle, specific, and actionable pieces of advice, followed by an encouraging closing statement (ending with 💚).

Ensure the tone is tender and full of love, creating an emotional connection that makes the reader feel understood and cared for.`
  }

  return `你是一位精通韦特塔罗、占星术和心理学的专家占卜师，同时也是一位充满爱意和洞察力的灵性向导。

你正在为 ${userContext} 进行塔罗占卜解读。请以温柔、亲昵、充满疗愈感的语气来解读，就像在悄悄耳语一样温暖。

【牌阵类型】${config.type === 'single' ? '单张牌' : config.type === 'three' ? '三张牌（过去·现在·未来）' : '凯尔特十字'}

【抽到的牌阵】
${cardDescriptions}

请按以下结构给出深度解读（用中文，使用 Markdown 格式的二级标题 ##）：

## 牌阵核心意象

描述这些牌在一起所呈现的整体能量和主题（2-3段，富有诗意的表达）

## 针对性分析

针对每张牌的位置含义，结合正逆位进行深度分析（每张牌一段，2-3句话）

## 暖心建议

基于牌阵给出3条温柔、具体、可执行的建议，以及一句鼓励的话（以💚结尾）

请确保语气温柔、充满爱意，有适当的情感联结，让阅读者感受到被理解和呵护。`
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<AnalyzeRequest>(event)

  const { cards, spreadType = 'three', userContext = 'my beloved wife', locale = 'zh' } = body

  // 设置 SSE 响应头
  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  })

  // 无 API Key → 本地降级
  if (!config.openaiApiKey) {
    const localText = getLocalInterpretation(cards, spreadType, locale)
    const sseData = JSON.stringify({ fallback: true, text: localText })
    return `data: ${sseData}\n\ndata: [DONE]\n\n`
  }

  // OpenAI 流式解读
  try {
    const openai = new OpenAI({ apiKey: config.openaiApiKey })
    const prompt = buildPrompt(cards, spreadType, userContext, locale)

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: locale === 'en' 
            ? 'You are a gentle, insightful tarot reader, skilled at using poetic and healing language to help people understand their inner selves.'
            : '你是一位温柔、充满洞察力的塔罗占卜师，擅长用诗意而疗愈的语言帮助人们理解内心。',
        },
        { role: 'user', content: prompt },
      ],
      stream: true,
      temperature: 0.85,
      max_tokens: 1200,
    })

    const chunks: string[] = []

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || ''
      if (text) {
        chunks.push(`data: ${JSON.stringify({ text })}\n\n`)
      }
    }

    return chunks.join('') + 'data: [DONE]\n\n'
  } catch (error) {
    console.error('OpenAI API error:', error)
    // 降级到本地解读
    const localText = getLocalInterpretation(cards, spreadType, locale)
    const sseData = JSON.stringify({ fallback: true, text: localText })
    return `data: ${sseData}\n\ndata: [DONE]\n\n`
  }
})
