import { ref, onMounted } from 'vue'

/**
 * 帮助面板逻辑
 */
export function useHelpPanel() {
  const isVisible = ref(false)
  const hasViewed = ref(false)

  // 检查是否需要自动显示（首次访问）
  const checkAndShow = () => {
    const viewed = localStorage.getItem('helpViewed')
    if (!viewed) {
      // 延迟显示，让用户先看到界面
      setTimeout(() => {
        isVisible.value = true
      }, 1000)
    } else {
      hasViewed.value = true
    }
  }

  // 标记为已查看
  const markAsViewed = () => {
    if (!hasViewed.value) {
      localStorage.setItem('helpViewed', 'true')
      hasViewed.value = true
    }
  }

  // 切换显示
  const toggle = () => {
    const wasShowing = isVisible.value
    isVisible.value = !isVisible.value
    
    // 如果关闭了帮助（之前是显示的），且是首次自动显示的，记录用户已查看过
    if (wasShowing && !isVisible.value && !hasViewed.value) {
      markAsViewed()
    }
  }

  // 关闭
  const close = () => {
    if (isVisible.value) {
      isVisible.value = false
      if (!hasViewed.value) {
        markAsViewed()
      }
    }
  }

  onMounted(() => {
    checkAndShow()
  })

  return {
    isVisible,
    toggle,
    close
  }
}

