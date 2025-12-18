// 键盘配置数据
// 每套配置包含：code（唯一标识）、name（中文名称）、keys（按键配置）
// keys 包含三个字段：
//   initials: { 按键: 声母 } - 一个按键可以对应多个声母
//   finals: { 按键: 韵母 } - 一个按键可以对应多个韵母
//   zeroInitials: { 韵母: 按键组合 } - 零声母情况下，韵母对应的按键组合（两个字母）

const keyboardConfigs = [
    {
        code: 'xiaohe',
        name: '小鹤',
        keys: {
            // 方案专用声母，用于特殊情况，映射：按键 -> 声母（单个字母）
            initials: {
                u: 'sh',
                i: 'ch',
                v: 'zh'
            },
            // 韵母映射：按键 -> 韵母
            // 同一个按键对应多个韵母时，使用逗号拼接作为value
            finals: {
                q: "iu", w: "ei", e: "e", r: "uan,üan", t: "ue,üe", y: "un,ün", u: "u", i: "i", o: "o,uo", p: "ie", 
                a: "a", s: "iong,ong", d: "ai", f: "en", g: "eng", h: "ang", j: "an", k: "ing,uai", l: "iang,uang", 
                z: "ou", x: "ia,ua", c: "ao", v: "ü,ui", b: "in", n: "iao", m: "ian"
            },
            // 零声母映射：拼音 -> 按键组合（两个字母）
            zeroInitials: {
                a: 'aa', 
                ai: 'ai', 
                an: 'an', 
                ang: 'ah', 
                ao: 'ao',
                e: 'ee', 
                ei: 'ei', 
                en: 'en', 
                eng: 'eg', 
                er: 'er',
                o: 'oo', 
                ou: 'ou'
            }
        }
    },
    {
        code: 'ziranma',
        name: '自然码',
        keys: {
            initials: {
                u: 'sh',
                i: 'ch',
                v: 'zh'
            },
            finals: {
                q: "iu", w: "ia,ua", e: "e", r: "uan,üan", t: "ue,üe", y: "uai,ing", u: "u", i: "i", o: "o,uo", p: "un,ün", 
                a: "a", s: "ong,iong", d: "iang,uang", f: "en", g: "eng", h: "ang", j: "an", k: "ao", l: "ai", 
                z: "ei", x: "ie", c: "iao", v: "ü,ui", b: "ou", n: "in", m: "ian"
            },
            zeroInitials: {
                a: 'aa',
                ai: 'ai',
                an: 'an',
                ang: 'ah',
                ao: 'ao',
                e: 'ee',
                ei: 'ei',
                en: 'en',
                eng: 'eg',
                er: 'er',
                o: 'oo',
                ou: 'ou'
            }
        }
    },
    {
        code: 'weiruan',
        name: '微软',
        keys: {
            initials: {
                u: 'sh',
                i: 'ch',
                v: 'zh'
            },
            finals: {
                q: "iu", w: "ia,ua", e: "e", r: "er,uan", t: "ue", y: "ü,uai", u: "u", i: "i", o: "o,uo", p: "un", 
                a: "a", s: "ong,iong", d: "iang,uang", f: "en", g: "eng", h: "ang", j: "an", k: "ao", l: "ai", ';': "ing",
                z: "ei", x: "ie", c: "iao", v: "ui,üe", b: "ou", n: "in", m: "ian" 
            },
            zeroInitials: {
                a: 'oa',
                ai: 'ol',
                an: 'oj',
                ang: 'oh',
                ao: 'ok',
                e: 'oe',
                ei: 'oz',
                en: 'of',
                eng: 'og',
                er: 'or',
                o: 'oo',
                ou: 'ob'
            }
        }
    },
    {
        code: 'sougou',
        name: '搜狗',
        keys: {
            initials: {
                u: 'sh',
                i: 'ch',
                v: 'zh'
            },
            finals: {
                q: "iu", w: "ia,ua", e: "e", r: "er,uan", t: "ue,üe", y: "ü,uai", u: "u", i: "i", o: "o,uo", p: "un", 
                a: "a", s: "ong,iong", d: "iang,uang", f: "en", g: "eng", h: "ang", j: "an", k: "ao", l: "ai", ';' : "ing",
                z: "ei", x: "ie", c: "iao", v: "ui", b: "ou", n: "in", m: "ian"
            },
            zeroInitials: {
                a: 'oa',
                ai: 'ol',
                an: 'oj',
                ang: 'oh',
                ao: 'ok',
                e: 'oe',
                ei: 'oz',
                en: 'of',
                eng: 'og',
                er: 'or',
                o: 'oo',
                ou: 'ob'
            }
        }
    },
    {
        code: 'abc',
        name: '智能ABC',
        keys: {
            initials: {
                u: 'sh',
                i: 'ch',
                v: 'zh'
            },
            finals: {
                q: "ei", w: "ian", e: "e", r: "iu,er", t: "iang,uang", y: "ing", u: "u", i: "i", o: "o,uo", p: "uan", 
                a: "a", s: "ong,iong", d: "ia,ua", f: "en", g: "eng", h: "ang", j: "an", k: "ao", l: "ai", 
                z: "iao", x: "ie", c: "in,uai", v: "ü,üe", b: "ou", n: "un", m: "ui,ue"
            },
            zeroInitials: {
                a: 'oa',
                ai: 'ol',
                an: 'oj',
                ang: 'oh',
                ao: 'ok',
                e: 'oe',
                ei: 'oq',
                en: 'of',
                eng: 'og',
                er: 'or',
                o: 'oo',
                ou: 'ob'
            }
        }
    }
];

// 通用声母映射：声母 -> 按键（单个字母），所有方案共用
const commonInitials = {
    // 第1行
    q: 'q',
    w: 'w',
    r: 'r',
    t: 't',
    y: 'y',
    p: 'p',
    // 第2行
    s: 's',
    d: 'd',
    f: 'f',
    g: 'g',
    h: 'h',
    j: 'j',
    k: 'k',
    l: 'l',
    // 第3行
    z: 'z',
    x: 'x',
    c: 'c',
    b: 'b',
    n: 'n',
    m: 'm'
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

