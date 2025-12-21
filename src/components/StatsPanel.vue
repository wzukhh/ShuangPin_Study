<template>
  <div class="stats-panel">
    <div class="stats-item">
      <span class="stats-label">总字数:</span>
      <span class="stats-value" id="totalChars">{{ totalChars }}</span>
    </div>
    <div class="stats-item">
      <span class="stats-label">已完成:</span>
      <span class="stats-value" id="completedChars">{{ completedChars }}</span>
    </div>
    <div class="stats-item">
      <span class="stats-label">错误数:</span>
      <span class="stats-value" id="errorCount">{{ errorCount }}</span>
    </div>
    <div class="stats-item">
      <span class="stats-label">用时:</span>
      <span class="stats-value" id="timeElapsed">{{ timeElapsed }}</span>
    </div>
    <button 
      class="btn stats-btn" 
      @click="$emit('view-errors')"
    >
      查看错误记录
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  totalChars: number
  completedChars: number
  errorCount: number
  timeElapsed: string
}

defineProps<Props>()

defineEmits<{
  'view-errors': []
}>()
</script>

<style scoped>
/* 样式已在全局 style.css 中定义 */
</style>

