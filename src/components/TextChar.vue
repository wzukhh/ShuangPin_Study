<template>
  <div 
    class="text-item"
    :style="{
      transform: `translateX(${position}px)`
    }"
  >
    <div class="pinyin">{{ item.pinyin }}</div>
    <div 
      class="character"
      :class="{
        current: index === currentIndex,
        completed: index < currentIndex,
        error: hasError
      }"
    >
      {{ item.char }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TextItem } from '@/types'

interface Props {
  item: TextItem
  index: number
  currentIndex: number
  scrollPosition: number
}

const props = defineProps<Props>()

// 计算字符位置（每个字符宽度 28px）
const position = computed(() => {
  const basePosition = props.scrollPosition
  const charWidth = 28
  return basePosition + (props.index * charWidth)
})

// 判断是否有错误（简化版，后续在状态管理中完善）
const hasError = computed(() => {
  // 这里后续会根据错误记录来判断
  return false
})
</script>

<style scoped>
/* 样式已在全局 style.css 中定义 */
</style>

