import { onMounted, onUnmounted, type Ref } from 'vue'

/**
 * 物理键盘事件处理
 */
export function useKeyboardEvents(
  isPlaying: Ref<boolean>,
  onKeyPress: (key: string) => void,
  onKeyHighlight?: (key: string) => void
) {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isPlaying.value) return

    const key = event.key

    // 处理字母（转换为小写）和数字
    if (/^[a-z]$/i.test(key)) {
      const keyLower = key.toLowerCase()
      onKeyPress(keyLower)
      onKeyHighlight?.(keyLower)
    } else if (/^[0-9]$/.test(key)) {
      onKeyPress(key)
      onKeyHighlight?.(key)
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })
}

