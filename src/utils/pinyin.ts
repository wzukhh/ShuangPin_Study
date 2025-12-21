// pinyin-pro 工具封装
// 为了兼容原项目中使用 pinyinPro.pinyin() 的方式
import { pinyin } from 'pinyin-pro';

// pinyin-pro 选项类型
interface PinyinOptions {
    toneType?: 'none' | 'symbol' | 'num';
    pattern?: 'first' | 'all';
    [key: string]: any;
}

// 导出 pinyin 函数，保持与原项目 API 兼容
export const pinyinPro = {
    pinyin: (text: string, options: PinyinOptions = {}): string => {
        // 默认不显示声调，与原项目保持一致
        const defaultOptions: PinyinOptions = { toneType: 'none', ...options };
        return pinyin(text, defaultOptions);
    }
};

// 也可以直接导出 pinyin 函数供新代码使用
export { pinyin };

