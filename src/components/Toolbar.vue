<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <!-- 核心控制按钮 -->
      <div class="toolbar-group">
        <button 
          class="btn btn-icon" 
          :disabled="isPlaying"
          @click="$emit('start')"
          title="开始"
        >
          ▶️
        </button>
        <button 
          class="btn btn-icon" 
          :disabled="!isPlaying"
          @click="$emit('pause')"
          title="暂停"
        >
          ⏸️
        </button>
        <button 
          class="btn btn-icon" 
          @click="$emit('reset')"
          title="重置"
        >
          🔄
        </button>
      </div>
      <div class="divider"></div>
      
      <!-- 练习类型选择 -->
      <label>
        <select 
          :value="difficulty" 
          @change="$emit('update:difficulty', ($event.target as HTMLSelectElement).value)"
          title="练习类型"
        >
          <option value="sentence">句子</option>
          <option value="word">单字</option>
        </select>
      </label>
      
      <!-- 素材来源选择（仅句子模式显示） -->
      <template v-if="difficulty === 'sentence'">
        <div class="divider"></div>
        <div class="source-container">
          <label>
            <select 
              :value="source" 
              @change="handleSourceChange"
              title="素材来源"
            >
              <option value="builtin">内置素材</option>
              <option value="upload">上传文件</option>
            </select>
            <span 
              v-if="fileName" 
              class="file-icon" 
              :title="fileName"
            >
              📒
            </span>
          </label>
        </div>
        <input 
          ref="fileInputRef"
          type="file" 
          accept=".txt" 
          style="display: none;"
          @change="handleFileChange"
        >
      </template>
      
      <div class="divider"></div>
      
      <!-- 双拼方案选择 -->
      <label>
        <select 
          :value="currentConfigCode" 
          @change="$emit('update:config', ($event.target as HTMLSelectElement).value)"
          title="双拼方案"
        >
          <option 
            v-for="config in configs" 
            :key="config.code" 
            :value="config.code"
          >
            {{ config.name }}
          </option>
        </select>
      </label>
      
      <div class="divider"></div>
      
      <!-- 双拼码显示切换 -->
      <button 
        class="btn btn-toggle" 
        :class="{ active: showKeyExtra }"
        @click="$emit('toggle-key-extra')"
        title="在虚拟键盘上显示双拼码"
      >
        双拼码
      </button>
    </div>
    
    <div class="toolbar-right">
      <button 
        class="btn btn-icon" 
        @click="$emit('open-settings')"
        title="设置"
      >
        ⚙️
      </button>
      <button 
        class="btn btn-icon theme-toggle" 
        @click="$emit('toggle-theme')"
        title="切换主题"
      >
        <span>{{ themeIcon }}</span>
      </button>
      <button 
        class="btn btn-icon help-toggle" 
        @click="$emit('toggle-help')"
        title="使用说明"
      >
        ℹ️
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { KeyboardConfig } from '@/types'

interface Props {
  isPlaying: boolean
  difficulty: 'sentence' | 'word'
  source: 'builtin' | 'upload'
  fileName?: string
  configs: KeyboardConfig[]
  currentConfigCode: string
  showKeyExtra: boolean
  isDarkTheme: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  start: []
  pause: []
  reset: []
  'update:difficulty': [value: 'sentence' | 'word']
  'update:source': [value: 'builtin' | 'upload']
  'update:config': [value: string]
  'toggle-key-extra': []
  'open-settings': []
  'toggle-theme': []
  'toggle-help': []
  'file-selected': [file: File]
}>()

const fileInputRef = ref<HTMLInputElement>()

const themeIcon = computed(() => props.isDarkTheme ? '☀️' : '🌙')

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    emit('file-selected', file)
  } else {
    // 用户取消了文件选择，重置为内置素材
    emit('update:source', 'builtin')
  }
  // 清空 input 值，允许重复选择同一文件
  target.value = ''
}

const handleSourceChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const newSource = target.value as 'builtin' | 'upload'
  emit('update:source', newSource)
  
  // 如果选择上传文件，触发文件选择
  if (newSource === 'upload' && !props.fileName) {
    fileInputRef.value?.click()
  }
}

const openFileDialog = () => {
  fileInputRef.value?.click()
}

defineExpose({
  openFileDialog
})
</script>

<style scoped>
/* 样式已在全局 style.css 中定义 */
</style>

