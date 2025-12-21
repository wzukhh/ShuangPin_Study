import { ref, watch, type Ref } from 'vue'

/**
 * 本地存储封装（对象类型）
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const storedValue = localStorage.getItem(key)
  const initialValue = storedValue ? JSON.parse(storedValue) : defaultValue

  const value = ref<T>(initialValue) as Ref<T>

  watch(value, (newValue) => {
    localStorage.setItem(key, JSON.stringify(newValue))
  }, { deep: true })

  return value
}

// 简单值的存储（字符串、数字、布尔值）
export function useLocalStorageSimple<T extends string | number | boolean>(
  key: string,
  defaultValue: T
) {
  const storedValue = localStorage.getItem(key)
  let initialValue: T = defaultValue

  if (storedValue !== null) {
    if (typeof defaultValue === 'number') {
      initialValue = Number(storedValue) as T
    } else if (typeof defaultValue === 'boolean') {
      initialValue = (storedValue === 'true') as T
    } else {
      initialValue = storedValue as T
    }
  }

  const value = ref<T>(initialValue)

  watch(value, (newValue) => {
    localStorage.setItem(key, String(newValue))
  })

  return value
}

