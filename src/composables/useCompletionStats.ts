import { computed } from 'vue'
import type { TextItem, CharTimingRecord } from '@/types'

/**
 * 完成统计信息生成
 */
export function useCompletionStats(
  textItems: () => TextItem[],
  charTimingRecords: () => Record<number, CharTimingRecord>,
  totalTime: () => number
) {
  // 用时最长的字符（前10个）
  const slowestChars = computed(() => {
    const records = charTimingRecords()
    const items = textItems()
    
    const sortedChars = Object.keys(records)
      .map(index => {
        const record = records[parseInt(index)]
        const item = items[parseInt(index)]
        if (!item || !record.duration) return null
        return {
          char: item.char,
          pinyin: item.pinyin || '',
          duration: record.duration,
          inputCount: record.inputCount || 1
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)
    
    return sortedChars.map(item => ({
      ...item,
      duration: Number((item.duration / 1000).toFixed(2)) // 转换为秒
    }))
  })

  // 总用时格式化
  const totalTimeFormatted = computed(() => {
    const seconds = totalTime()
    if (seconds < 60) {
      return `${seconds}秒`
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${minutes}分${secs}秒`
    } else {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      return `${hours}小时${minutes}分${secs}秒`
    }
  })

  return {
    slowestChars,
    totalTimeFormatted
  }
}

