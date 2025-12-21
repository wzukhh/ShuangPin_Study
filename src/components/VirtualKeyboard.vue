<template>
  <div class="virtual-keyboard">
    <!-- 数字行 -->
    <div class="keyboard-row">
      <KeyButton
        v-for="key in numberLayout"
        :key="key"
        :key-char="key"
        :config="config"
        :show-extra="showKeyExtra"
        :active-keys="activeKeys"
        @click="$emit('key-click', key)"
      />
    </div>
    
    <!-- 字母行 -->
    <div 
      v-for="(row, rowIndex) in keyboardLayout" 
      :key="rowIndex"
      class="keyboard-row"
    >
      <KeyButton
        v-for="key in row"
        :key="key"
        :key-char="key"
        :config="config"
        :show-extra="showKeyExtra"
        :active-keys="activeKeys"
        @click="$emit('key-click', key)"
      />
    </div>
    
    <!-- 零声母显示 -->
    <div v-if="showKeyExtra && config.keys.zeroInitials" class="zero-initials-display">
      <span class="zero-initials-label">零声母:</span>
      <div class="zero-initials-content">
        <div 
          v-for="(keys, pinyin) in config.keys.zeroInitials" 
          :key="pinyin"
          class="zero-initials-item"
        >
          <span class="zero-combo">{{ keys }}</span>
          <span class="zero-yuns">({{ pinyin }})</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import KeyButton from './KeyButton.vue'
import type { KeyboardConfig } from '@/types'

interface Props {
  config: KeyboardConfig
  showKeyExtra: boolean
  activeKeys?: string[]
}

defineProps<Props>()

const emit = defineEmits<{
  'key-click': [key: string]
}>()

// 数字键盘布局
const numberLayout = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']

// 字母键盘布局
const keyboardLayout = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm']
]
</script>

<style scoped>
/* 样式已在全局 style.css 中定义 */
</style>

