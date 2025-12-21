import { ref, computed, onUnmounted } from 'vue'
import type { ErrorRecord, CharTimingRecord } from '@/types'

/**
 * 统计管理
 */
export function useStatistics() {
  const totalValidChars = ref(0)
  const completedChars = ref(0)
  const errorCount = ref(0)
  const startTime = ref<number | null>(null)
  const pausedTime = ref(0)
  const timerInterval = ref<number | null>(null)
  const errorRecords = ref<Record<number, ErrorRecord[]>>({})
  const charTimingRecords = ref<Record<number, CharTimingRecord>>({})
  const currentCharStartTime = ref<number | null>(null)
  const pauseStartTime = ref<number | null>(null)
  const totalPausedDuration = ref(0)
  
  // 暴露 totalPausedDuration 供外部访问
  const getTotalPausedDuration = () => totalPausedDuration.value

  // 计算用时（秒）
  const timeElapsed = computed(() => {
    if (!startTime.value) return '0秒'
    
    const now = Date.now()
    const elapsed = now - startTime.value - totalPausedDuration.value
    const seconds = Math.floor(elapsed / 1000)
    
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

  // 计算进度百分比
  const progress = computed(() => {
    if (totalValidChars.value === 0) return 0
    return Math.round((completedChars.value / totalValidChars.value) * 100)
  })

  // 开始计时
  const startTimer = () => {
    if (timerInterval.value) return
    
    if (!startTime.value) {
      startTime.value = Date.now()
    }
    
    // 计时器主要用于触发响应式更新，实际时间由 computed 计算
    timerInterval.value = window.setInterval(() => {
      // 触发响应式更新（虽然 computed 会自动更新，但这里确保定时器运行）
    }, 100)
  }

  // 停止计时
  const stopTimer = () => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
  }

  // 记录错误
  const recordError = (charIndex: number, input: string) => {
    if (!errorRecords.value[charIndex]) {
      errorRecords.value[charIndex] = []
    }
    errorRecords.value[charIndex].push({
      input,
      time: Date.now()
    })
    errorCount.value++
  }

  // 记录字符开始时间
  const recordCharStart = (charIndex: number) => {
    if (currentCharStartTime.value === null) {
      currentCharStartTime.value = Date.now()
      if (!charTimingRecords.value[charIndex]) {
        charTimingRecords.value[charIndex] = {
          startTime: null,
          endTime: null,
          duration: 0,
          inputCount: 0,
          pauseDuration: 0
        }
      }
    }
  }

  // 记录字符完成时间
  const recordCharComplete = (charIndex: number) => {
    if (currentCharStartTime.value) {
      const endTime = Date.now()
      const duration = endTime - currentCharStartTime.value
      
      if (!charTimingRecords.value[charIndex]) {
        charTimingRecords.value[charIndex] = {
          startTime: null,
          endTime: null,
          duration: 0,
          inputCount: 0,
          pauseDuration: 0
        }
      }
      
      const record = charTimingRecords.value[charIndex]
      const actualDuration = duration - record.pauseDuration
      
      record.endTime = endTime
      record.duration = actualDuration
      record.inputCount++
      record.pauseDuration = 0
      
      currentCharStartTime.value = null
    }
  }

  // 记录暂停
  const recordPause = () => {
    pauseStartTime.value = Date.now()
    if (currentCharStartTime.value !== null) {
      // 累加到当前字的暂停时长
      // 这里需要知道当前索引，由调用方传入
    }
  }

  // 记录继续
  const recordResume = (currentIndex: number) => {
    if (pauseStartTime.value && currentCharStartTime.value !== null) {
      const pauseDuration = Date.now() - pauseStartTime.value
      totalPausedDuration.value += pauseDuration
      
      if (charTimingRecords.value[currentIndex]) {
        charTimingRecords.value[currentIndex].pauseDuration += pauseDuration
      }
    }
    pauseStartTime.value = null
  }

  // 重置统计
  const reset = () => {
    completedChars.value = 0
    errorCount.value = 0
    errorRecords.value = {}
    charTimingRecords.value = {}
    currentCharStartTime.value = null
    pauseStartTime.value = null
    totalPausedDuration.value = 0
    pausedTime.value = 0
    startTime.value = null
    stopTimer()
  }

  // 清理
  onUnmounted(() => {
    stopTimer()
  })

  return {
    // 状态
    totalValidChars,
    completedChars,
    errorCount,
    errorRecords,
    charTimingRecords,
    currentCharStartTime,
    startTime,
    totalPausedDuration,
    
    // 计算属性
    timeElapsed,
    progress,
    
    // 方法
    startTimer,
    stopTimer,
    recordError,
    recordCharStart,
    recordCharComplete,
    recordPause,
    recordResume,
    reset,
    setTotalValidChars: (count: number) => {
      totalValidChars.value = count
    },
    incrementCompleted: () => {
      completedChars.value++
    },
    getTotalPausedDuration: () => totalPausedDuration.value
  }
}

