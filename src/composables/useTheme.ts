import { ref, computed, onMounted } from 'vue'
import { useLocalStorageSimple } from './useLocalStorage'

/**
 * 主题管理
 */
export function useTheme() {
  const savedTheme = localStorage.getItem('theme')
  const darkTheme = ref(savedTheme === 'dark')

  const themeIcon = computed(() => darkTheme.value ? '☀️' : '🌙')

  const toggleTheme = () => {
    darkTheme.value = !darkTheme.value
    updateTheme()
  }

  const updateTheme = () => {
    if (darkTheme.value) {
      document.body.classList.add('dark-theme')
      localStorage.setItem('theme', 'dark')
    } else {
      document.body.classList.remove('dark-theme')
      localStorage.setItem('theme', 'light')
    }
  }

  onMounted(() => {
    updateTheme()
  })

  return {
    isDarkTheme: darkTheme,
    themeIcon,
    toggleTheme
  }
}

