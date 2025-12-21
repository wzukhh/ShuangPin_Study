<template>
  <div class="typing-area">
    <!-- 进度条 -->
    <div class="progress-bar-container">
      <div 
        class="progress-bar" 
        :style="{ width: `${progress}%` }"
      ></div>
    </div>
    
    <!-- 文本容器 -->
    <div class="text-container">
      <TextChar
        v-for="(item, index) in textItems"
        :key="index"
        :item="item"
        :index="index"
        :current-index="currentIndex"
        :scroll-position="scrollPosition"
      />
    </div>
    
    <!-- 输入框 -->
    <div class="input-wrapper">
      <input
        ref="inputRef"
        :value="inputValue"
        type="text"
        class="typing-input"
        :disabled="!isPlaying"
        autocomplete="off"
        spellcheck="false"
        @input="handleInput"
        @keydown="handleKeyDown"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import TextChar from './TextChar.vue'
import type { TextItem } from '@/types'

interface Props {
  textItems: TextItem[]
  currentIndex: number
  scrollPosition: number
  progress: number
  isPlaying: boolean
  modelValue?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  input: [value: string]
  'update:model-value': [value: string]
}>()

const inputRef = ref<HTMLInputElement>()
const inputValue = computed({
  get: () => props.modelValue || '',
  set: (value: string) => emit('update:model-value', value)
})

// 监听外部清空输入框
watch(() => props.isPlaying, (newVal) => {
  if (!newVal && inputRef.value) {
    inputRef.value.value = ''
  }
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  emit('input', value)
  emit('update:model-value', value)
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (!props.isPlaying) {
    event.preventDefault()
    return
  }
  
  // 允许退格和删除
  if (event.key === 'Backspace' || event.key === 'Delete') {
    return
  }
  
  // 只允许字母和数字
  if (!/^[a-z0-9]$/i.test(event.key)) {
    event.preventDefault()
  }
}

// 暴露方法供父组件调用
const focus = () => {
  inputRef.value?.focus()
}

const clear = () => {
  inputValue.value = ''
}

defineExpose({
  focus,
  clear
})
</script>

<style scoped>
/* 样式已在全局 style.css 中定义 */
</style>

