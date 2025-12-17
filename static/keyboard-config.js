// 键盘配置数据
// 每套配置包含：code（唯一标识）、name（中文名称）、keys（按键配置）
// keys 包含三个字段：
//   initials: { 声母: 按键 } - 一个按键可以对应多个声母
//   finals: { 韵母: 按键 } - 一个按键可以对应多个韵母
//   zeroInitials: { 韵母: 按键组合 } - 零声母情况下，韵母对应的按键组合（两个字母）

const keyboardConfigs = [
    {
        code: 'xiaohe',
        name: '小鹤',
        keys: {
            // 方案专用声母，用于特殊情况，映射：声母 -> 按键（单个字母）
            initials: {
                'sh': 'u',
                'ch': 'i',
                'zh': 'v'
            },
            // 韵母映射：韵母 -> 按键（单个字母）
            // 同一个按键对应多个韵母时，使用逗号拼接作为key
            finals: {
                // 第一行
                'iu': 'q', 'ei': 'w', 'e': 'e', 'uan': 'r', 'ue,ve': 't', 'un': 'y', 'u': 'u', 'i': 'i', 'o,uo': 'o', 'ie': 'p',
                // 第二行
                'a': 'a', 'ong,iong': 's', 'ai': 'd', 'en': 'f', 'eng': 'g', 'ang': 'h', 'an': 'j', 'uai,ing': 'k', 'iang,uang': 'l',
                // 第三行
                'ou': 'z', 'ia,ua': 'x', 'ao': 'c', 'ü,ui': 'v', 'in': 'b', 'iao': 'n', 'ian': 'm'
            },
            // 零声母映射：拼音 -> 按键组合（两个字母）
            zeroInitials: {
                'a': 'aa', 'ai': 'ai', 'an': 'an', 'ang': 'ah', 'ao': 'ao',
                'e': 'ee', 'ei': 'ei', 'en': 'en', 'eng': 'eg', 'er': 'er',
                'o': 'oo', 'ou': 'ou'
            }
        }
    },
    {
        code: 'ziranma',
        name: '自然码',
        keys: {
            initials: {
                'zh': 'v',
                'ch': 'i',
                'sh': 'u'
            },
            finals: {
                "iu": "q", "ei": "w", "e": "e", "uan": "r", "ue": "t", "un": "y", "u": "u", "i": "i", "o": "o", "ie": "p",
                "a": "a", "ong": "s", "ai": "d", "en": "f", "eng": "g", "ang": "h", "an": "j", "ing": "k", "ian": "l",
                "ou": "z", "ia": "x", "ao": "c", "iao": "v", "in": "b", "uang": "n", "iang": "m"
            },
            zeroInitials: {
                "a": "aa", "ai": "ai", "an": "an","ang": "ah", "ao": "ao", 
                "e": "ee", "ei": "ei", "en": "en", "eng": "eg", "er": "er",
                "o": "oo", "ou": "ou"
            }
        }
    },
    {
        code: 'weiruan',
        name: '微软双拼',
        keys: {
            initials: {
                'zh': 'v', 'ch': 'i', 'sh': 'u'
            },
            finals: {
                'iu': 'q', 'ing': 'w', 'e': 'e', 'uan': 'r', 'uang': 't', 'un': 'y', 'ong': 'x', 'u': 'i', 'iuo': 'o', 'ie': 'p',
                'a': 'a', 'iong': 's', 'ai': 'd', 'en': 'f', 'eng': 'g', 'ang': 'h', 'an': 'j', 'uai': 'k', 'iang': 'l',
                'ou': 'z', 'ia': 'm', 'ao': 'c', 'uang': 'b', 'in': 'n', 'iao': 'l', 'ian': 'm'
            },
            zeroInitials: {
                'a': 'aa', 'ai': 'ai', 'an': 'an', 'ang': 'ah', 'ao': 'ao',
                'e': 'ee', 'ei': 'ei', 'en': 'en', 'eng': 'eg', 'er': 'er',
                'o': 'oo', 'ou': 'ou'
            }
        }
    },
    {
        code: 'sougou',
        name: '搜狗双拼',
        keys: {
            initials: {
                'zh': 'v', 'ch': 'i', 'sh': 'u'
            },
            finals: {
                'iu': 'q', 'ing': 'w', 'e': 'e', 'uan': 'r', 'uang': 't', 'un': 'y', 'ong': 'x', 'u': 'i', 'uo': 'o', 'ie': 'p',
                'a': 'a', 'iong': 's', 'ai': 'd', 'en': 'f', 'eng': 'g', 'ang': 'h', 'an': 'j', 'uai': 'k', 'iang': 'l',
                'ou': 'z', 'ia': 'm', 'ao': 'c', 'uang': 'b', 'in': 'n', 'iao': 'l', 'ian': 'm'
            },
            zeroInitials: {
                'a': 'aa', 'ai': 'ai', 'an': 'an', 'ang': 'ah', 'ao': 'ao',
                'e': 'ee', 'ei': 'ei', 'en': 'en', 'eng': 'eg', 'er': 'er',
                'o': 'oo', 'ou': 'ou'
            }
        }
    },
    {
        code: 'abc',
        name: '智能ABC双拼',
        keys: {
            initials: {
                'zh': 'v', 'ch': 'i', 'sh': 'u'
            },
            finals: {
                'iu': 'q', 'ing': 'w', 'e': 'e', 'uan': 'r', 'uang': 't', 'un': 'y', 'ong': 'x', 'u': 'i', 'uo': 'o', 'ie': 'p',
                'a': 'a', 'iong': 's', 'ai': 'd', 'en': 'f', 'eng': 'g', 'ang': 'h', 'an': 'j', 'uai': 'k', 'iang': 'l',
                'ou': 'z', 'ia': 'm', 'ao': 'c', 'uang': 'b', 'in': 'n', 'iao': 'l', 'ian': 'm'
            },
            zeroInitials: {
                'a': 'aa', 'ai': 'ai', 'an': 'an', 'ang': 'ah', 'ao': 'ao',
                'e': 'ee', 'ei': 'ei', 'en': 'en', 'eng': 'eg', 'er': 'er',
                'o': 'oo', 'ou': 'ou'
            }
        }
    }
];

// 通用声母映射：声母 -> 按键（单个字母），所有方案共用
const commonInitials = {
    // 第1行
    'q': 'q',
    'w': 'w',
    'r': 'r',
    't': 't',
    'y': 'y',
    'p': 'p',
    // 第2行
    's': 's',
    'd': 'd',
    'f': 'f',
    'g': 'g',
    'h': 'h',
    'j': 'j',
    'k': 'k',
    'l': 'l',
    // 第3行
    'z': 'z',
    'x': 'x',
    'c': 'c',
    'b': 'b',
    'n': 'n',
    'm': 'm'
};

// 获取当前配置（默认使用第一套配置）
function getCurrentConfig() {
    const savedConfigCode = localStorage.getItem('keyboardConfig') || keyboardConfigs[0].code;
    return keyboardConfigs.find(config => config.code === savedConfigCode) || keyboardConfigs[0];
}

// 获取所有配置列表
function getAllConfigs() {
    return keyboardConfigs;
}

