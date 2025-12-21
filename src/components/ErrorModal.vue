<template>
  <div 
    class="error-modal"
    :class="{ show: isVisible }"
    @click.self="$emit('close')"
  >
    <div class="error-modal-content">
      <div class="error-modal-header">
        <h3>错误记录</h3>
        <button 
          class="error-modal-close" 
          @click="$emit('close')"
        >
          ×
        </button>
      </div>
      <div class="error-modal-body">
        <div v-if="errorRecords.length === 0" class="error-record-empty">
          暂无错误记录
        </div>
        <div 
          v-for="(record, index) in errorRecords" 
          :key="index"
          class="error-record-item"
        >
          <div class="error-record-char">
            [ {{ record.char }} {{ record.pinyin }} ] 双拼: [ <span class="monospace">{{ record.correctKeys }}</span> ] 索引: <span class="monospace">{{ record.index }}</span>
          </div>
          <div class="error-record-info">
            错误次数: {{ record.errors.length }}
          </div>
          <div class="error-record-detail">
            <div 
              v-for="(error, errorIndex) in record.errors" 
              :key="errorIndex"
              class="error-record-detail-item"
            >
              {{ errorIndex + 1 }}. 输入按键: [<span class="monospace">{{ error.input }}</span>] 时间: {{ formatTime(error.time) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ErrorRecord } from '@/types'

interface ErrorRecordItem {
  char: string
  pinyin: string
  correctKeys: string
  index: number
  errors: ErrorRecord[]
}

interface Props {
  isVisible: boolean
  errorRecords: ErrorRecordItem[]
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN')
}
</script>

<style scoped>
/* 样式已在全局 style.css 中定义 */
</style>

