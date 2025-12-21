// 单字包含了3500中文常用字
import type { PracticeTexts } from '@/types'

const practiceTexts: PracticeTexts = {
    word: [
        '一乙二十丁厂七卜人入八九几儿了力乃',
    ],
    sentence: [
        "春风又绿江南岸，柳絮纷飞入梦来。",
        "雁字回时云淡淡，菊花开处露浓浓。",
        "小楼一夜听春雨，深巷明朝卖杏花。",
    ]
};

// ES6 模块导出
export { practiceTexts };

