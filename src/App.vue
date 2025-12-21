<template>
  <div class="container">
    <!-- 顶部工具栏 -->
    <Toolbar
      :is-playing="practice.isPlaying.value"
      :difficulty="difficulty"
      :source="source"
      :file-name="fileName"
      :configs="configs"
      :current-config-code="currentConfigCode"
      :show-key-extra="showKeyExtra"
      :is-dark-theme="theme.isDarkTheme.value"
      @start="practice.start"
      @pause="practice.pause"
      @reset="practice.reset"
      @update:difficulty="difficulty = $event"
      @update:source="source = $event"
      @update:config="currentConfigCode = $event"
      @toggle-key-extra="showKeyExtra = !showKeyExtra"
      @open-settings="showSettingsModal = true"
      @toggle-theme="theme.toggleTheme"
      @toggle-help="helpPanel.toggle"
      @file-selected="handleFileSelected"
    />

    <!-- 中间打字区域 -->
    <TypingArea
      :text-items="practice.textItems.value"
      :current-index="practice.currentIndex.value"
      :scroll-position="practice.scrollPosition.value"
      :progress="practice.progress.value"
      :is-playing="practice.isPlaying.value"
      :model-value="practice.inputValue.value"
      @input="handleTypingInput"
      @update:model-value="practice.inputValue.value = $event"
    />

    <!-- 底部虚拟键盘 -->
    <VirtualKeyboard
      :config="currentConfig"
      :show-key-extra="showKeyExtra"
      :active-keys="activeKeys"
      @key-click="handleKeyClick"
    />

    <!-- 统计面板 -->
    <StatsPanel
      :total-chars="statistics.totalValidChars.value"
      :completed-chars="statistics.completedChars.value"
      :error-count="statistics.errorCount.value"
      :time-elapsed="statistics.timeElapsed.value"
      @view-errors="showErrorModal = true"
    />

    <!-- 使用说明 -->
    <HelpPanel :is-visible="showHelp" @close="helpPanel.close" />

    <!-- 完成弹窗 -->
    <CompletionModal
      :is-visible="showCompletionModal"
      :stats="completionStats"
      :has-errors="statistics.errorCount.value > 0"
      @close="showCompletionModal = false"
      @view-errors="showErrorModal = true"
    />

    <!-- 错误记录弹窗 -->
    <ErrorModal
      :is-visible="showErrorModal"
      :error-records="errorRecordsForDisplay"
      @close="showErrorModal = false"
    />

    <!-- 设置弹窗 -->
    <SettingsModal
      :is-visible="showSettingsModal"
      :skip-non-chinese="skipNonChinese"
      @close="showSettingsModal = false"
      @update:skip-non-chinese="skipNonChinese = $event"
      @open-materials="showMaterialsModal = true"
    />

    <!-- 素材管理弹窗 -->
    <MaterialsModal
      :is-visible="showMaterialsModal"
      @close="showMaterialsModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Toolbar from './components/Toolbar.vue'
import TypingArea from './components/TypingArea.vue'
import VirtualKeyboard from './components/VirtualKeyboard.vue'
import StatsPanel from './components/StatsPanel.vue'
import HelpPanel from './components/HelpPanel.vue'
import CompletionModal from './components/CompletionModal.vue'
import ErrorModal from './components/ErrorModal.vue'
import SettingsModal from './components/SettingsModal.vue'
import MaterialsModal from './components/MaterialsModal.vue'
import { getAllConfigs, getCurrentConfig } from './config/keyboard-config'
import { useLocalStorageSimple } from './composables/useLocalStorage'
import { useTheme } from './composables/useTheme'
import { useStatistics } from './composables/useStatistics'
import { useTypingPractice } from './composables/useTypingPractice'
import { useCompletionStats } from './composables/useCompletionStats'
import { useKeyboardEvents } from './composables/useKeyboardEvents'
import { useHelpPanel } from './composables/useHelpPanel'
import { processFile, validateFile, saveUploadedFile, loadUploadedFile, clearUploadedFile } from './utils/fileHandler'
import type { KeyboardConfig } from './types'

// 配置
const configs = getAllConfigs()
const currentConfigCode = useLocalStorageSimple('keyboardConfig', configs[0].code)
const currentConfig = computed(() => {
  return configs.find(c => c.code === currentConfigCode.value) || configs[0]
})

// 设置
const difficulty = useLocalStorageSimple<'sentence' | 'word'>('difficulty', 'sentence')
const source = ref<'builtin' | 'upload'>('builtin')
const fileName = ref<string>('')
const showKeyExtra = useLocalStorageSimple('showKeyExtra', true)
const skipNonChinese = useLocalStorageSimple('skipNonChinese', true)
const customSentences = ref<string[] | null>(null)

// UI 状态
const helpPanel = useHelpPanel()
const showHelp = helpPanel.isVisible
const showCompletionModal = ref(false)
const showErrorModal = ref(false)
const showSettingsModal = ref(false)
const showMaterialsModal = ref(false)
const activeKeys = ref<string[]>([])

// 组合式函数
const theme = useTheme()
const statistics = useStatistics()
const practice = useTypingPractice(
  currentConfig,
  difficulty,
  source,
  skipNonChinese,
  customSentences
)

// 完成统计
const completionStats = computed(() => {
  if (!showCompletionModal.value) return undefined
  
  const stats = useCompletionStats(
    () => practice.textItems.value,
    () => statistics.charTimingRecords.value,
    () => {
      if (statistics.startTime.value) {
        return Math.floor((Date.now() - statistics.startTime.value - statistics.getTotalPausedDuration()) / 1000)
      }
      return 0
    }
  )
  
  return {
    slowestChars: stats.slowestChars.value,
    totalTime: stats.totalTimeFormatted.value
  }
})

// 错误记录格式化
const errorRecordsForDisplay = computed(() => {
  const records: Array<{
    char: string
    pinyin: string
    correctKeys: string
    index: number
    errors: Array<{ input: string; time: number }>
  }> = []
  
  Object.keys(statistics.errorRecords.value).forEach(charIndexStr => {
    const charIndex = parseInt(charIndexStr)
    const item = practice.textItems.value[charIndex]
    if (!item) return
    
    const errors = statistics.errorRecords.value[charIndex]
    if (errors && errors.length > 0) {
      records.push({
        char: item.char,
        pinyin: item.pinyin || '',
        correctKeys: item.keys || '',
        index: charIndex,
        errors
      })
    }
  })
  
  // 按索引排序
  return records.sort((a, b) => a.index - b.index)
})

// 方法
const handleTypingInput = (value: string) => {
  const result = practice.checkInput(value)
  if (result?.completed) {
    setTimeout(() => {
      showCompletionModal.value = true
    }, 200)
  }
}

const handleKeyClick = (key: string) => {
  if (!practice.isPlaying.value) return
  
  activeKeys.value = [key]
  setTimeout(() => {
    activeKeys.value = []
  }, 100)
  
  // 将按键添加到输入框
  const newValue = practice.inputValue.value + key
  practice.inputValue.value = newValue
  handleTypingInput(newValue)
}

const handleFileSelected = async (file: File) => {
  // 验证文件
  const validation = validateFile(file)
  if (!validation.valid) {
    alert(validation.error)
    source.value = 'builtin'
    return
  }
  
  try {
    // 处理文件
    const sentences = await processFile(file)
    if (sentences && sentences.length > 0) {
      customSentences.value = sentences
      fileName.value = file.name
      saveUploadedFile(file.name, sentences)
      
      // 如果正在练习，重新生成文本
      if (practice.isPlaying.value || practice.textItems.value.length > 0) {
        practice.reset()
      }
    } else {
      alert('文件内容为空或格式不正确！')
      source.value = 'builtin'
    }
  } catch (error) {
    console.error('文件处理错误:', error)
    alert('文件处理失败：' + (error instanceof Error ? error.message : String(error)))
    source.value = 'builtin'
  }
}

// 物理键盘事件处理
useKeyboardEvents(
  practice.isPlaying,
  (key) => {
    // 将按键添加到输入框
    const newValue = practice.inputValue.value + key
    practice.inputValue.value = newValue
    handleTypingInput(newValue)
  },
  (key) => {
    // 高亮虚拟键盘按键
    activeKeys.value = [key]
    setTimeout(() => {
      activeKeys.value = []
    }, 100)
  }
)

// 监听练习完成
watch(() => practice.currentIndex.value, (newIndex) => {
  if (newIndex >= practice.textItems.value.length && practice.textItems.value.length > 0) {
    if (practice.isPlaying.value) {
      practice.pause()
      setTimeout(() => {
        showCompletionModal.value = true
      }, 200)
    }
  }
})

// 监听难度变化，处理文件上传
watch(difficulty, (newDifficulty) => {
  if (newDifficulty === 'word') {
    // 单字模式：清除上传的文件
    customSentences.value = null
    fileName.value = ''
    source.value = 'builtin'
    clearUploadedFile()
  } else {
    // 句子模式：尝试加载保存的文件
    const saved = loadUploadedFile()
    if (saved) {
      customSentences.value = saved.sentences
      fileName.value = saved.fileName
      source.value = 'upload'
    }
  }
})

// 监听素材来源变化
watch(source, (newSource) => {
  if (newSource === 'upload' && !customSentences.value) {
    // 触发文件选择（通过 Toolbar 组件）
    // 这里需要在 Toolbar 组件中处理
  } else if (newSource === 'builtin') {
    customSentences.value = null
    fileName.value = ''
    clearUploadedFile()
  }
})

// 初始化：加载保存的文件
const savedFile = loadUploadedFile()
if (savedFile && difficulty.value === 'sentence') {
  customSentences.value = savedFile.sentences
  fileName.value = savedFile.fileName
  source.value = 'upload'
}

// 监听配置变化，保存到 localStorage
watch(currentConfigCode, (newCode) => {
  localStorage.setItem('keyboardConfig', newCode)
})

// 监听设置变化，保存到 localStorage
watch(showKeyExtra, (value) => {
  localStorage.setItem('showKeyExtra', String(value))
})

watch(skipNonChinese, (value) => {
  localStorage.setItem('skipNonChinese', String(value))
})

watch(difficulty, (value) => {
  localStorage.setItem('difficulty', value)
})
</script>

<style scoped>
/* 样式已在全局 style.css 中定义 */
</style>
