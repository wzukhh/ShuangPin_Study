<template>
  <div class="help-panel">
    <div 
      class="help-content"
      :class="{ show: isVisible }"
      @click.stop
    >
      <h4>使用说明</h4>
      <ul>
        <li><strong>开始练习：</strong>点击"开始"按钮，在输入框中输入当前高亮汉字对应的双拼按键（2个字母）</li>
        <li><strong>输入方式：</strong>可以使用虚拟键盘点击输入，或使用物理键盘直接输入-需要切换为英文输入模式</li>
        <li><strong>输入反馈：</strong>输入正确后文本自动左移，错误时字符显示红色，正确后显示绿色</li>
        <li><strong>控制按钮：</strong>"开始"开始练习，"暂停/继续"暂停或继续，"重置"重新开始</li>
        <li><strong>练习设置：</strong>可调整练习类型（单字/句子）、双拼方案，其中单字练习包含了<strong>3500中文常用字</strong></li>
        <li><strong>双拼码提示：</strong>勾选"双拼码"可在虚拟键盘上显示声母和韵母提示</li>
        <li><strong>统计信息：</strong>实时显示总字数、已完成、错误数和用时，可查看详细错误记录</li>
        <li><strong>完成练习：</strong>完成后会显示统计弹窗，包括用时最长的字和总用时</li>
        <li><strong>主题切换：</strong>点击右上角主题按钮可切换明亮/黑暗主题</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

interface Props {
  isVisible: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

// 点击外部关闭
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const helpContent = document.querySelector('.help-content')
  const helpPanel = document.querySelector('.help-panel')
  
  if (helpPanel && !helpPanel.contains(target) && helpContent?.classList.contains('show')) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* 样式已在全局 style.css 中定义 */
</style>

