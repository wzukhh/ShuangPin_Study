import type { KeyboardConfig } from '@/types'
import { commonInitials } from '@/config/keyboard-config'

/**
 * 从拼音生成双拼按键
 */
export function generateKeysFromPinyin(pinyin: string, config: KeyboardConfig): string | null {
  if (!pinyin || pinyin.trim() === '') {
    return null
  }

  const pinyinLower = pinyin.toLowerCase().trim()
  const configKeys = config.keys || {}
  
  // 预处理配置数据
  const initialsMap = configKeys.initials || {}
  const finalsMap = configKeys.finals || {}
  const zeroInitialsMap = configKeys.zeroInitials || {}
  
  // 构建声母查找表：{ 声母: 按键 }
  const allInitials: Record<string, string> = { ...commonInitials }
  Object.keys(initialsMap).forEach(key => {
    const initialsStr = initialsMap[key]
    const initials = initialsStr.split(',').map(s => s.trim())
    initials.forEach(initial => {
      allInitials[initial] = key
    })
  })
  
  // 构建韵母查找表：{ 韵母: 按键 }
  const allFinals: Array<{ final: string; key: string }> = []
  Object.keys(finalsMap).forEach(key => {
    const finalsStr = finalsMap[key]
    const finals = finalsStr.split(',').map(s => s.trim())
    finals.forEach(final => {
      allFinals.push({ final, key })
    })
  })
  
  // 按长度降序排序，优先匹配长韵母
  allFinals.sort((a, b) => b.final.length - a.final.length)
  
  // 检查是否是零声母
  if (zeroInitialsMap[pinyinLower]) {
    return zeroInitialsMap[pinyinLower]
  }
  
  // 匹配声母
  let matchedInitial: string | null = null
  let matchedInitialKey: string | null = null
  let remainingPinyin = pinyinLower
  
  // 优先匹配长声母（如 sh, ch, zh）
  const specialInitials = ['sh', 'ch', 'zh']
  for (const special of specialInitials) {
    if (pinyinLower.startsWith(special)) {
      matchedInitial = special
      matchedInitialKey = allInitials[special]
      remainingPinyin = pinyinLower.slice(special.length)
      break
    }
  }
  
  // 如果没有匹配到特殊声母，尝试单字符声母
  if (!matchedInitial && pinyinLower.length > 0) {
    const firstChar = pinyinLower[0]
    if (allInitials[firstChar]) {
      matchedInitial = firstChar
      matchedInitialKey = allInitials[firstChar]
      remainingPinyin = pinyinLower.slice(1)
    }
  }
  
  // 如果没有声母，返回 null（零声母已在上面处理）
  if (!matchedInitial || !matchedInitialKey) {
    return null
  }
  
  // 匹配韵母
  let matchedFinal: string | null = null
  let matchedFinalKey: string | null = null
  
  for (const item of allFinals) {
    if (remainingPinyin === item.final) {
      matchedFinal = item.final
      matchedFinalKey = item.key
      break
    }
  }
  
  // 如果没有匹配到韵母，返回 null
  if (!matchedFinal || !matchedFinalKey) {
    return null
  }
  
  // 返回声母按键 + 韵母按键
  return matchedInitialKey + matchedFinalKey
}

