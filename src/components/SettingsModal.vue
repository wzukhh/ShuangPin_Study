<template>
  <div 
    class="settings-modal"
    :class="{ show: isVisible }"
    @click.self="$emit('close')"
  >
    <div class="settings-modal-content">
      <div class="settings-modal-body">
        <!-- 通用设置区域 -->
        <div class="settings-section-group">
          <h4 class="settings-section-title">通用设置</h4>
          <div class="settings-section-content">
            <!-- 跳过数字/字母设置 -->
            <div class="settings-item">
              <div class="settings-item-header">
                <label class="settings-item-label" for="skipNonChinese">
                  跳过数字/字母
                </label>
              </div>
              <div class="settings-item-description">
                练习时自动跳过数字和字母，只练习汉字
              </div>
              <div class="settings-item-control">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    id="skipNonChinese"
                    :checked="skipNonChinese"
                    @change="$emit('update:skip-non-chinese', ($event.target as HTMLInputElement).checked)"
                  >
                  <span>启用</span>
                </label>
              </div>
            </div>
            
            <!-- 管理练习素材按钮 -->
            <div class="settings-item">
              <div class="settings-item-header">
                <span class="settings-item-label">管理练习素材</span>
              </div>
              <div class="settings-item-description">
                管理内置练习素材和自定义上传的素材
              </div>
              <div class="settings-item-control">
                <button 
                  class="btn" 
                  @click="$emit('open-materials')"
                >
                  管理素材
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 高级设置区域 -->
        <div class="settings-section-group">
          <h4 class="settings-section-title">高级设置</h4>
          <div class="settings-section-content">
            <!-- 高级设置项将在这里添加 -->
          </div>
        </div>

        <!-- AI设置区域 -->
        <div class="settings-section-group">
          <h4 class="settings-section-title">AI设置</h4>
          <div class="settings-section-content">
            <!-- AI设置项将在这里添加 -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isVisible: boolean
  skipNonChinese: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  'update:skip-non-chinese': [value: boolean]
  'open-materials': []
}>()
</script>

<style scoped>
/* 样式已在全局 style.css 中定义 */
</style>

