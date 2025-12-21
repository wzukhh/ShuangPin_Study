// 键盘配置类型定义

// 按键配置
export interface KeyboardKeys {
  // 方案专用声母，用于特殊情况，映射：按键 -> 声母（单个字母）
  initials: Record<string, string>;
  // 韵母映射：按键 -> 韵母（同一个按键对应多个韵母时，使用逗号拼接）
  finals: Record<string, string>;
  // 零声母映射：拼音 -> 按键组合（两个字母）
  zeroInitials: Record<string, string>;
}

// 键盘配置项
export interface KeyboardConfig {
  code: string;
  name: string;
  keys: KeyboardKeys;
}

// 练习文本类型
export interface PracticeTexts {
  word: string[];
  sentence: string[];
}

// 文本项（用于练习）
export interface TextItem {
  char: string;
  pinyin: string;
  keys: string | null;
}

// 错误记录
export interface ErrorRecord {
  input: string;
  time: number;
}

// 字符时间记录
export interface CharTimingRecord {
  startTime: number | null;
  endTime: number | null;
  duration: number;
  inputCount: number;
  pauseDuration: number;
}

