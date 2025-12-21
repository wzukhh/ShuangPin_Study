import { ref, computed, watch, type Ref } from 'vue'
import type { TextItem, KeyboardConfig } from '@/types'
import { practiceTexts } from '@/data/practice'
import { pinyinPro } from '@/utils/pinyin'
import { generateKeysFromPinyin } from '@/utils/keyGenerator'
import { useStatistics } from './useStatistics'

/**
 * 打字练习核心逻辑
 */
export function useTypingPractice(
  config: Ref<KeyboardConfig>,
  difficulty: Ref<'sentence' | 'word'>,
  source: Ref<'builtin' | 'upload'>,
  skipNonChinese: Ref<boolean>,
  customSentences?: Ref<string[] | null>
) {
  const statistics = useStatistics()
  
  // 状态
  const isPlaying = ref(false)
  const hasStarted = ref(false)
  const currentIndex = ref(0)
  const scrollPosition = ref(-14) // 初始向左偏移半个字符位置
  const practiceData = ref<Array<{ char: string; pinyin: string | null; keys: string | null }>>([])
  const currentText = ref<TextItem[]>([])
  const inputValue = ref('')

  // 计算属性
  const textItems = computed(() => currentText.value)
  const progress = computed(() => statistics.progress.value)

  // 生成练习数据
  const generatePracticeDataFromText = () => {
    let selectedText = ''
    
    if (difficulty.value === 'sentence') {
      const sentences = (customSentences?.value && customSentences.value.length > 0) 
        ? customSentences.value 
        : (practiceTexts.sentence || [])
      
      if (sentences.length === 0) {
        practiceData.value = []
        return
      }
      
      const randomIndex = Math.floor(Math.random() * sentences.length)
      selectedText = sentences[randomIndex]
    } else if (difficulty.value === 'word') {
      const wordArrays = practiceTexts.word || []
      if (wordArrays.length === 0) {
        practiceData.value = []
        return
      }
      
      const allWords = wordArrays.join('')
      const wordArray = Array.from(allWords)
      
      // Fisher-Yates 洗牌算法
      for (let i = wordArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]]
      }
      
      selectedText = wordArray.join('')
    } else {
      practiceData.value = []
      return
    }
    
    // 转换为 practiceData 格式
    practiceData.value = []
    const textWithoutSpaces = selectedText.replace(/\s+/g, '')
    
    let pinyinArray: string[] = []
    if (pinyinPro && pinyinPro.pinyin) {
      const pinyinString = pinyinPro.pinyin(textWithoutSpaces, { toneType: 'none' })
      pinyinArray = pinyinString ? pinyinString.split(/\s+/) : []
    }
    
    const charArray = Array.from(textWithoutSpaces)
    let index = 0
    
    charArray.forEach(item => {
      let pinyin: string | null = null
      
      if (/^[\u4e00-\u9fa5]$/.test(item)) {
        if (index < pinyinArray.length) {
          pinyin = pinyinArray[index]
        }
      } else if (!skipNonChinese.value && /^[0-9a-zA-Z]$/.test(item)) {
        pinyin = item.toLowerCase()
      }
      index++
      
      practiceData.value.push({
        pinyin,
        char: item,
        keys: null
      })
    })
  }

  // 为练习数据生成 keys
  const generateKeysForPracticeData = () => {
    return practiceData.value.map(item => ({
      ...item,
      keys: item.pinyin ? generateKeysFromPinyin(item.pinyin, config.value) : null
    }))
  }

  // 生成文本
  const generateText = () => {
    const baseData = generateKeysForPracticeData()
    currentText.value = baseData.map(item => ({
      char: item.char,
      pinyin: item.pinyin || '',
      keys: item.keys
    }))
    
    currentIndex.value = 0
    scrollPosition.value = -14
    skipToNextInputChar()
    
    // 初始化统计
    const validChars = currentText.value.filter(item => item.keys && item.keys.trim() !== '').length
    statistics.setTotalValidChars(validChars)
  }

  // 跳过不需要输入的字符
  const skipToNextInputChar = () => {
    while (currentIndex.value < currentText.value.length) {
      const item = currentText.value[currentIndex.value]
      if (item.keys && item.keys.trim() !== '') {
        break
      }
      currentIndex.value++
    }
  }

  // 检查输入
  const checkInput = (value: string) => {
    if (!isPlaying.value) return
    
    if (currentIndex.value >= currentText.value.length) return
    
    const currentItem = currentText.value[currentIndex.value]
    
    // 记录开始时间
    if (statistics.currentCharStartTime.value === null && isPlaying.value) {
      statistics.recordCharStart(currentIndex.value)
    }
    
    // 如果当前字符不需要输入，自动跳过
    if (!currentItem.keys || currentItem.keys.trim() === '') {
      skipToNextInputChar()
      
      if (currentIndex.value >= currentText.value.length) {
        pause()
        return { completed: true }
      }
      return { skipped: true }
    }
    
    const inputValueLower = value.toLowerCase().trim()
    const expectedKeys = currentItem.keys.toLowerCase()
    
    // 判断输入长度
    if (inputValueLower.length !== expectedKeys.length) {
      // 如果输入过长，记录错误并清空
      if (inputValueLower.length > expectedKeys.length) {
        statistics.recordError(currentIndex.value, inputValueLower)
        inputValue.value = ''
        return { error: true, tooLong: true }
      }
      // 如果输入长度小于期望长度，继续等待输入
      return { waiting: true }
    }
    
    // 判断输入是否正确
    if (inputValueLower === expectedKeys) {
      // 输入正确
      statistics.recordCharComplete(currentIndex.value)
      currentIndex.value++
      
      if (difficulty.value !== 'word') {
        statistics.incrementCompleted()
      }
      
      inputValue.value = ''
      
      // 单字模式：完成一轮后从头开始
      if (difficulty.value === 'word') {
        if (currentIndex.value >= currentText.value.length) {
          currentIndex.value = 0
          // 重新打乱顺序
          shuffleArray(currentText.value)
        }
        skipToNextInputChar()
        return { correct: true, wordMode: true }
      }
      
      // 句子模式：更新滚动位置
      scrollPosition.value -= 42 // 每个汉字宽度28px + 间隔14px = 42px
      skipToNextInputChar()
      
      // 检查是否完成
      if (currentIndex.value >= currentText.value.length) {
        pause()
        return { completed: true }
      }
      
      return { correct: true }
    } else {
      // 输入错误
      statistics.recordError(currentIndex.value, inputValueLower)
      inputValue.value = ''
      return { error: true }
    }
  }

  // 打乱数组（Fisher-Yates）
  const shuffleArray = <T>(array: T[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
  }

  // 开始
  const start = () => {
    if (currentIndex.value >= currentText.value.length) {
      reset()
    }
    isPlaying.value = true
    hasStarted.value = true
    statistics.startTimer()
  }

  // 暂停/继续
  const pause = () => {
    if (isPlaying.value) {
      isPlaying.value = false
      statistics.recordPause(currentIndex.value)
      statistics.stopTimer()
    } else {
      isPlaying.value = true
      statistics.recordResume(currentIndex.value)
      statistics.startTimer()
    }
  }

  // 重置
  const reset = () => {
    isPlaying.value = false
    hasStarted.value = false
    currentIndex.value = 0
    scrollPosition.value = -14
    inputValue.value = ''
    statistics.reset()
    generatePracticeDataFromText()
    generateText()
  }

  // 监听配置变化，重新生成文本
  watch([config, difficulty, source], () => {
    if (hasStarted.value) return
    generatePracticeDataFromText()
    generateText()
  }, { deep: true })

  // 初始化
  generatePracticeDataFromText()
  generateText()

  return {
    // 状态
    isPlaying,
    hasStarted,
    currentIndex,
    scrollPosition,
    textItems,
    inputValue,
    progress,
    
    // 方法
    start,
    pause,
    reset,
    checkInput,
    generateText
  }
}

