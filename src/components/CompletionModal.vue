<template>
  <div 
    class="completion-modal"
    :class="{ show: isVisible }"
    @click.self="$emit('close')"
  >
    <div class="completion-content">
      <div class="completion-icon">🎉</div>
      <h2>🏆恭喜完成✨</h2>
      <p v-if="stats">{{ stats.totalTime }}</p>
      
      <!-- 统计信息 -->
      <div v-if="stats && stats.slowestChars.length > 0" class="completion-stats">
        <div class="completion-stats-section">
          <h3>用时最长的{{ stats.slowestChars.length }}个字</h3>
          <div class="completion-chars-list">
            <div 
              v-for="(item, index) in stats.slowestChars" 
              :key="index"
              class="completion-char-item"
            >
              <span class="char-rank">{{ index + 1 }}.</span>
              <span class="char-text">{{ item.char }}</span>
              <span class="char-pinyin">{{ item.pinyin }}</span>
              <span class="char-duration">{{ item.duration }}秒</span>
              <span class="char-count">({{ item.inputCount }}次)</span>
            </div>
          </div>
        </div>
        
        <div class="completion-total-time">
          <span class="total-time-label">总用时:</span>
          <span class="total-time-value">{{ stats.totalTime }}</span>
        </div>
      </div>
      
      <div class="completion-buttons">
        <button 
          v-if="hasErrors"
          class="btn completion-btn" 
          @click="$emit('view-errors')"
        >
          查看错误记录
        </button>
        <button 
          class="btn completion-btn" 
          @click="$emit('close')"
        >
          确定
        </button>
      </div>
    </div>
    <canvas ref="canvasRef" id="fireworksCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useFireworks } from '@/composables/useFireworks'

interface CompletionStats {
  slowestChars: Array<{
    char: string
    pinyin: string
    duration: number
    inputCount: number
  }>
  totalTime: string
}

interface Props {
  isVisible: boolean
  message?: string
  stats?: CompletionStats
  hasErrors: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  'view-errors': []
}>()

const canvasRef = ref<HTMLCanvasElement>()
const fireworks = useFireworks(canvasRef)

// 监听显示状态，启动/停止烟花
watch(() => props.isVisible, (visible) => {
  if (visible) {
    fireworks.start()
  } else {
    fireworks.stop()
  }
})
</script>

<style scoped>
/* 样式已在全局 style.css 中定义 */
</style>

