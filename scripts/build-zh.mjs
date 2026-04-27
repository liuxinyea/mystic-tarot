/**
 * 合并所有塔罗牌中文数据，生成 tarot-zh.json
 * 运行方式: node scripts/build-zh.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const files = [
  'major-zh.json',
  'wands-zh.json',
  'cups-zh.json',
  'pentacles-zh.json',
  'swords-zh.json'
]

let allCards = {}

for (const file of files) {
  const filePath = path.join(__dirname, file)
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    allCards = { ...allCards, ...data }
  } else {
    console.error(`Warning: File ${file} not found.`)
  }
}

// 获取原始英文数据结构作为基础
const originalPath = path.join(root, 'assets', 'tarot-images.json')
const originalData = JSON.parse(fs.readFileSync(originalPath, 'utf-8'))

// 替换英文内容为中文内容
const translatedCards = originalData.cards.map(card => {
  const zh = allCards[card.name]
  if (zh) {
    return {
      ...card,
      name: zh.name,
      fortune_telling: zh.fortune_telling,
      keywords: zh.keywords,
      meanings: zh.meanings
    }
  }
  return card
})

const output = {
  _description: '塔罗牌中文数据 — 含义、关键词与占卜提示的地道中文适配',
  _version: '1.0.0',
  _total: translatedCards.length,
  cards: translatedCards
}

const outPath = path.join(root, 'assets', 'tarot-zh.json')
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8')
console.log(`✅ 塔罗中文数据已生成：${outPath}`)
console.log(`   共 ${output._total} 张牌`)
