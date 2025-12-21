<template>
  <div 
    class="materials-modal"
    :class="{ show: isVisible }"
    @click.self="$emit('close')"
  >
    <div class="materials-modal-content">
      <div class="materials-modal-header">
        <h3>管理练习素材</h3>
        <button 
          class="materials-modal-close" 
          @click="$emit('close')"
        >
          ×
        </button>
      </div>
      <div class="materials-modal-body">
        <!-- 素材管理内容将在这里添加 -->
        <p>素材管理功能开发中...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isVisible: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()
</script>

<style scoped>
/* 样式已在全局 style.css 中定义 */
</style>

