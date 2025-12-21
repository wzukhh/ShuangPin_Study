# Vue3 项目工作原理详解

以 `TypingArea.vue` 组件为例，详细说明 Vue3 的工作机制。

## 📋 组件概览

`TypingArea.vue` 是打字练习区域组件，负责显示练习文本、进度条和输入框。

## 🏗️ Vue3 组件结构

Vue3 组件采用 **单文件组件（SFC）** 格式，包含三个部分：

```vue
<template>
  <!-- HTML 模板 -->
</template>

<script setup lang="ts">
  // TypeScript 逻辑
</script>

<style scoped>
  /* CSS 样式 */
</style>
```

---

## 1️⃣ Template（模板）- 声明式 UI

### 核心概念：声明式编程

Vue3 使用**声明式**方式描述 UI，而不是命令式操作 DOM。

```vue
<template>
  <!-- 进度条：通过 :style 绑定动态样式 -->
  <div 
    class="progress-bar" 
    :style="{ width: `${progress}%` }"
  ></div>
  
  <!-- 列表渲染：v-for 指令 -->
  <TextChar
    v-for="(item, index) in textItems"
    :key="index"
    :item="item"
    :index="index"
    :current-index="currentIndex"
  />
  
  <!-- 条件渲染：:disabled 属性绑定 -->
  <input
    :value="inputValue"
    :disabled="!isPlaying"
    @input="handleInput"
  />
</template>
```

### 关键语法说明：

#### 1. **属性绑定** `:prop` 或 `v-bind:prop`
```vue
:style="{ width: `${progress}%` }"
:disabled="!isPlaying"
:value="inputValue"
```
- `:` 是 `v-bind:` 的简写
- 将 JavaScript 表达式的值绑定到 HTML 属性
- 当 `progress` 变化时，进度条宽度自动更新

#### 2. **事件监听** `@event` 或 `v-on:event`
```vue
@input="handleInput"
@keydown="handleKeyDown"
```
- `@` 是 `v-on:` 的简写
- 监听 DOM 事件并执行方法

#### 3. **列表渲染** `v-for`
```vue
<TextChar
  v-for="(item, index) in textItems"
  :key="index"
  :item="item"
/>
```
- 遍历数组生成多个元素
- `:key` 帮助 Vue 追踪每个元素，优化渲染性能

#### 4. **条件渲染** `v-if` / `v-show`
```vue
<!-- 在 Toolbar 组件中 -->
<template v-if="difficulty === 'sentence'">
  <!-- 只在句子模式显示 -->
</template>
```

---

## 2️⃣ Script Setup - 组合式 API

### `<script setup>` 语法糖

这是 Vue3 的**组合式 API（Composition API）**，使用 `<script setup>` 语法：

```vue
<script setup lang="ts">
// 1. 导入依赖
import { ref, computed, watch } from 'vue'
import TextChar from './TextChar.vue'
import type { TextItem } from '@/types'

// 2. 定义 Props（组件接收的外部数据）
interface Props {
  textItems: TextItem[]
  currentIndex: number
  progress: number
  isPlaying: boolean
  modelValue?: string
}

const props = defineProps<Props>()

// 3. 定义 Emits（组件向父组件发送的事件）
const emit = defineEmits<{
  input: [value: string]
  'update:model-value': [value: string]
}>()

// 4. 响应式数据
const inputRef = ref<HTMLInputElement>()

// 5. 计算属性
const inputValue = computed({
  get: () => props.modelValue || '',
  set: (value) => emit('update:model-value', value)
})

// 6. 方法
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('input', target.value)
}

// 7. 监听器
watch(() => props.isPlaying, (newVal) => {
  if (!newVal && inputRef.value) {
    inputRef.value.value = ''
  }
})

// 8. 暴露方法给父组件
defineExpose({
  focus: () => inputRef.value?.focus(),
  clear: () => { /* ... */ }
})
</script>
```

### 详细解析：

#### 1. **Props（属性）** - 父组件向子组件传递数据

```typescript
interface Props {
  textItems: TextItem[]      // 练习文本数组
  currentIndex: number       // 当前输入位置
  progress: number          // 进度百分比
  isPlaying: boolean        // 是否正在练习
  modelValue?: string       // v-model 绑定的值
}

const props = defineProps<Props>()
```

**在父组件中使用：**
```vue
<TypingArea
  :text-items="practice.textItems.value"
  :current-index="practice.currentIndex.value"
  :progress="practice.progress.value"
  :is-playing="practice.isPlaying.value"
  :model-value="practice.inputValue.value"
/>
```

**数据流向：父组件 → 子组件（单向）**

#### 2. **Emits（事件）** - 子组件向父组件发送消息

```typescript
const emit = defineEmits<{
  input: [value: string]                    // 输入事件
  'update:model-value': [value: string]     // v-model 更新事件
}>()

// 触发事件
emit('input', target.value)
emit('update:model-value', value)
```

**在父组件中监听：**
```vue
<TypingArea
  @input="handleTypingInput"
  @update:model-value="practice.inputValue.value = $event"
/>
```

**数据流向：子组件 → 父组件（事件通信）**

#### 3. **响应式数据** - `ref()` 和 `reactive()`

```typescript
// ref：用于基本类型或对象引用
const inputRef = ref<HTMLInputElement>()  // DOM 元素引用
const count = ref(0)                     // 数字

// reactive：用于对象
const state = reactive({ name: 'Vue', version: 3 })
```

**响应式原理：**
- Vue3 使用 **Proxy** 拦截对象操作
- 当数据变化时，自动更新相关的 DOM

```typescript
// 访问：inputRef.value（注意 .value）
// 修改：inputRef.value = newValue
```

#### 4. **计算属性** - `computed()`

```typescript
const inputValue = computed({
  get: () => props.modelValue || '',
  set: (value) => emit('update:model-value', value)
})
```

**特点：**
- 基于依赖自动缓存
- 只有依赖变化时才重新计算
- 支持 getter/setter（用于 v-model）

**使用：**
```vue
<!-- 模板中直接使用，无需 .value -->
<input :value="inputValue" />

<!-- 脚本中需要 .value -->
console.log(inputValue.value)
```

#### 5. **监听器** - `watch()` 和 `watchEffect()`

```typescript
// 监听单个响应式源
watch(() => props.isPlaying, (newVal, oldVal) => {
  if (!newVal && inputRef.value) {
    inputRef.value.value = ''
  }
})

// 监听多个源
watch([() => props.isPlaying, () => props.progress], ([newPlaying, newProgress]) => {
  // 处理变化
})
```

**用途：**
- 执行副作用（如清理、API 调用）
- 数据同步
- 调试

#### 6. **生命周期钩子**

```typescript
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  // 组件挂载后执行
  inputRef.value?.focus()
})

onUnmounted(() => {
  // 组件卸载前执行
  // 清理定时器、事件监听器等
})
```

**常用生命周期：**
- `onMounted` - 组件挂载后
- `onUpdated` - 组件更新后
- `onUnmounted` - 组件卸载前
- `onBeforeMount` - 组件挂载前

#### 7. **组件通信模式**

**TypingArea 组件的通信：**

```
┌─────────────┐
│   App.vue   │  (父组件)
│  (根组件)    │
└──────┬──────┘
       │
       │ :text-items="practice.textItems.value"
       │ :current-index="practice.currentIndex.value"
       │ @input="handleTypingInput"
       │
       ▼
┌─────────────┐
│ TypingArea  │  (子组件)
│   .vue      │
└──────┬──────┘
       │
       │ :item="item"
       │ :index="index"
       │
       ▼
┌─────────────┐
│  TextChar   │  (子组件)
│   .vue      │
└─────────────┘
```

---

## 3️⃣ 数据流和响应式系统

### Vue3 响应式原理

```typescript
// 1. 创建响应式数据
const progress = ref(0)

// 2. 在模板中使用
<div :style="{ width: `${progress}%` }"></div>

// 3. 修改数据
progress.value = 50  // ✅ DOM 自动更新！

// 4. 计算属性自动更新
const progressPercent = computed(() => progress.value + '%')
```

**工作流程：**
1. **初始化**：Vue 扫描模板，找到所有响应式引用
2. **依赖追踪**：建立数据与 DOM 的依赖关系
3. **变化检测**：使用 Proxy 拦截数据变化
4. **自动更新**：重新渲染相关 DOM

### 实际例子：进度条更新

```vue
<!-- 模板 -->
<div :style="{ width: `${progress}%` }"></div>

<!-- 脚本 -->
<script setup>
const progress = ref(0)

// 当 progress 变化时：
progress.value = 50
// → Vue 检测到变化
// → 重新计算 :style 绑定
// → 更新 DOM：width: 50%
</script>
```

---

## 4️⃣ 组件使用示例

### 在 App.vue 中使用 TypingArea

```vue
<template>
  <TypingArea
    :text-items="practice.textItems.value"
    :current-index="practice.currentIndex.value"
    :scroll-position="practice.scrollPosition.value"
    :progress="practice.progress.value"
    :is-playing="practice.isPlaying.value"
    :model-value="practice.inputValue.value"
    @input="handleTypingInput"
    @update:model-value="practice.inputValue.value = $event"
  />
</template>

<script setup>
import TypingArea from './components/TypingArea.vue'
import { useTypingPractice } from './composables/useTypingPractice'

// 使用组合式函数管理状态
const practice = useTypingPractice(/* ... */)

// 处理输入事件
const handleTypingInput = (value: string) => {
  practice.checkInput(value)
}
</script>
```

### 数据流示例

```
用户输入 "sh"
    ↓
TypingArea @input 事件
    ↓
App.vue handleTypingInput()
    ↓
practice.checkInput("sh")
    ↓
useTypingPractice 检查输入
    ↓
更新 practice.inputValue
    ↓
响应式系统检测变化
    ↓
TypingArea 自动更新显示
```

---

## 5️⃣ 关键概念总结

### 1. **单向数据流**
- Props 向下流动（父 → 子）
- Events 向上流动（子 → 父）
- 数据变化只能通过事件通知父组件

### 2. **响应式系统**
- 使用 Proxy 实现
- 自动追踪依赖
- 变化时自动更新 DOM

### 3. **组合式 API 优势**
- 逻辑复用（Composables）
- 更好的 TypeScript 支持
- 更灵活的组织方式

### 4. **组件化思想**
- 单一职责
- 可复用
- 可组合

---

## 6️⃣ 与原生 JavaScript 对比

### 原生方式（命令式）：
```javascript
// 需要手动操作 DOM
const progressBar = document.querySelector('.progress-bar')
const input = document.querySelector('.typing-input')

// 手动更新
function updateProgress(value) {
  progressBar.style.width = value + '%'
}

// 手动绑定事件
input.addEventListener('input', (e) => {
  const value = e.target.value
  // 手动更新其他元素...
})
```

### Vue3 方式（声明式）：
```vue
<template>
  <div :style="{ width: `${progress}%` }"></div>
  <input @input="handleInput" />
</template>

<script setup>
const progress = ref(0)

const handleInput = (e) => {
  progress.value = calculateProgress(e.target.value)
  // Vue 自动更新 DOM！
}
</script>
```

**优势：**
- ✅ 无需手动操作 DOM
- ✅ 自动处理更新
- ✅ 代码更简洁
- ✅ 更好的性能（虚拟 DOM）

---

## 7️⃣ 实际运行流程

### 组件加载流程：

```
1. 浏览器加载 index.html
   ↓
2. 执行 main.ts
   ↓
3. createApp(App).mount('#app')
   ↓
4. 渲染 App.vue
   ↓
5. 渲染 TypingArea 组件
   ↓
6. 执行 <script setup> 代码
   ↓
7. 建立响应式系统
   ↓
8. 渲染模板到 DOM
   ↓
9. 用户交互 → 事件触发
   ↓
10. 更新响应式数据
   ↓
11. Vue 检测变化 → 重新渲染
```

### 用户输入流程：

```
用户输入 "sh"
   ↓
input 事件触发
   ↓
handleInput() 执行
   ↓
emit('input', 'sh')
   ↓
父组件 handleTypingInput('sh')
   ↓
practice.checkInput('sh')
   ↓
更新 practice.inputValue = 'sh'
   ↓
响应式系统检测到变化
   ↓
TypingArea 的 :model-value 更新
   ↓
input 元素的 value 自动更新
   ↓
用户看到输入框显示 "sh"
```

---

## 📚 总结

Vue3 的核心思想：
1. **声明式**：描述"应该是什么"，而不是"如何做"
2. **响应式**：数据变化自动更新 UI
3. **组件化**：将 UI 拆分为可复用的组件
4. **组合式 API**：灵活组织逻辑，易于复用

通过 `TypingArea` 组件，我们可以看到：
- ✅ Props 接收外部数据
- ✅ Emits 向父组件发送事件
- ✅ 响应式数据自动更新 UI
- ✅ 计算属性处理派生状态
- ✅ 监听器处理副作用
- ✅ 组件间清晰的通信模式

这就是 Vue3 的工作方式：**数据驱动视图，声明式编程，自动响应式更新**。

