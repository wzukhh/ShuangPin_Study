# 组件说明

## 组件结构

### 主要组件

#### 1. Toolbar.vue
顶部工具栏组件，包含：
- 控制按钮（开始、暂停、重置）
- 练习类型选择（句子/单字）
- 素材来源选择（内置/上传）
- 双拼方案选择
- 双拼码显示切换
- 设置、主题、帮助按钮

**Props:**
- `isPlaying`: 是否正在练习
- `difficulty`: 练习类型
- `source`: 素材来源
- `fileName`: 文件名
- `configs`: 键盘配置列表
- `currentConfigCode`: 当前配置代码
- `showKeyExtra`: 是否显示双拼码
- `isDarkTheme`: 是否暗色主题

**Events:**
- `start`, `pause`, `reset`
- `update:difficulty`, `update:source`, `update:config`
- `toggle-key-extra`, `open-settings`, `toggle-theme`, `toggle-help`
- `file-selected`

#### 2. TypingArea.vue
打字区域组件，包含：
- 进度条
- 文本显示（使用 TextChar 组件）
- 输入框

**Props:**
- `textItems`: 文本项数组
- `currentIndex`: 当前索引
- `scrollPosition`: 滚动位置
- `progress`: 进度百分比
- `isPlaying`: 是否正在练习

**Events:**
- `input`: 输入事件
- `update:input-value`: 更新输入值

**Methods:**
- `focus()`: 聚焦输入框
- `clear()`: 清空输入框

#### 3. VirtualKeyboard.vue
虚拟键盘组件，包含：
- 数字行
- 字母行（3行）
- 零声母显示

**Props:**
- `config`: 键盘配置
- `showKeyExtra`: 是否显示双拼码
- `activeKeys`: 激活的按键数组

**Events:**
- `key-click`: 按键点击事件

#### 4. StatsPanel.vue
统计面板组件，显示：
- 总字数
- 已完成
- 错误数
- 用时
- 查看错误记录按钮

**Props:**
- `totalChars`: 总字数
- `completedChars`: 已完成数
- `errorCount`: 错误数
- `timeElapsed`: 用时字符串

**Events:**
- `view-errors`: 查看错误记录

### 子组件

#### 5. TextChar.vue
文本字符组件，显示单个字符及其拼音。

**Props:**
- `item`: 文本项
- `index`: 索引
- `currentIndex`: 当前索引
- `scrollPosition`: 滚动位置

#### 6. KeyButton.vue
键盘按键组件，显示按键及其声母/韵母提示。

**Props:**
- `keyChar`: 按键字符
- `config`: 键盘配置
- `showExtra`: 是否显示额外信息
- `activeKeys`: 激活的按键数组

**Events:**
- `click`: 点击事件

### 模态框组件

#### 7. CompletionModal.vue
完成弹窗，显示练习完成信息和统计。

**Props:**
- `isVisible`: 是否可见
- `message`: 完成消息
- `stats`: 统计信息
- `hasErrors`: 是否有错误

**Events:**
- `close`: 关闭事件
- `view-errors`: 查看错误记录

#### 8. ErrorModal.vue
错误记录弹窗，显示详细的错误信息。

**Props:**
- `isVisible`: 是否可见
- `errorRecords`: 错误记录数组

**Events:**
- `close`: 关闭事件

#### 9. SettingsModal.vue
设置弹窗，包含各种设置选项。

**Props:**
- `isVisible`: 是否可见
- `skipNonChinese`: 是否跳过非中文字符

**Events:**
- `close`: 关闭事件
- `update:skip-non-chinese`: 更新跳过非中文字符设置
- `open-materials`: 打开素材管理

#### 10. MaterialsModal.vue
素材管理弹窗，管理练习素材。

**Props:**
- `isVisible`: 是否可见

**Events:**
- `close`: 关闭事件

### 其他组件

#### 11. HelpPanel.vue
使用说明面板，显示使用帮助信息。

**Props:**
- `isVisible`: 是否可见

## 组件关系

```
App.vue
├── Toolbar.vue
├── TypingArea.vue
│   └── TextChar.vue (多个)
├── VirtualKeyboard.vue
│   └── KeyButton.vue (多个)
├── StatsPanel.vue
├── HelpPanel.vue
├── CompletionModal.vue
├── ErrorModal.vue
├── SettingsModal.vue
└── MaterialsModal.vue
```

## 注意事项

1. 所有组件使用 `<script setup lang="ts">` 语法
2. 样式使用全局 CSS（`src/assets/style.css`），组件内使用 `<style scoped>` 仅用于特殊样式
3. 组件间通过 props 和 events 通信
4. 状态管理将在后续步骤中实现

