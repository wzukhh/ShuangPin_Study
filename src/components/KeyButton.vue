<template>
  <button
    class="key"
    :class="{
      'key-number': isNumber,
      active: isActive
    }"
    @click="$emit('click')"
  >
    <div class="key-main">{{ keyChar }}</div>
    <template v-if="showExtra && !isNumber">
      <div 
        v-if="initialsText" 
        class="key-extra key-initials"
      >
        {{ initialsText }}
      </div>
      <div 
        v-if="finalsText" 
        class="key-extra key-finals"
      >
        {{ finalsText }}
      </div>
    </template>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KeyboardConfig } from '@/types'

interface Props {
  keyChar: string
  config: KeyboardConfig
  showExtra: boolean
  activeKeys?: string[]
}

const props = defineProps<Props>()

defineEmits<{
  click: []
}>()

const isNumber = computed(() => /^[0-9]$/.test(props.keyChar))

const isActive = computed(() => {
  return props.activeKeys?.includes(props.keyChar) ?? false
})

// 获取声母文本
const initialsText = computed(() => {
  if (!props.showExtra || isNumber.value) return ''
  const initials = props.config.keys.initials[props.keyChar]
  return initials || ''
})

// 获取韵母文本
const finalsText = computed(() => {
  if (!props.showExtra || isNumber.value) return ''
  const finals = props.config.keys.finals[props.keyChar]
  return finals || ''
})
</script>

<style scoped>
/* 样式已在全局 style.css 中定义 */
</style>

