// 练习数据：汉字和对应的拼音（keys 会根据 pinyin 自动生成）
let practiceData = [];

// 虚拟键盘布局（字母按键）
const keyboardLayout = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
];

// 全局变量
let currentIndex = 0;
let isPlaying = false;
let currentText = [];
let difficulty = 'sentence';
let scrollPosition = -14; // 初始向左偏移半个字符位置
let hasStarted = false; // 是否已经点击过开始按钮

// 统计变量
let totalValidChars = 0; // 有效汉字总数
let completedChars = 0; // 已完成数量
let errorCount = 0; // 错误总数
let startTime = null; // 开始时间
let pausedTime = 0; // 已暂停的时间（累计）
let timerInterval = null; // 计时器
let errorRecords = {}; // 错误记录 {charIndex: [{input: 'xxx', time: timestamp}, ...]}
let charTimingRecords = {}; // 每个字的输入时间记录 {charIndex: {startTime: timestamp, endTime: timestamp, duration: ms, inputCount: number}}
let currentCharStartTime = null; // 当前字的开始时间
let pauseStartTime = null; // 暂停开始时间
let totalPausedDuration = 0; // 总暂停时长（毫秒）

// DOM 元素
const textContainer = document.getElementById('textContainer');
const typingInput = document.getElementById('typingInput');
const virtualKeyboard = document.getElementById('virtualKeyboard');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const difficultySelect = document.getElementById('difficultySelect');
const helpToggle = document.getElementById('helpToggle');
const helpContent = document.getElementById('helpContent');
const helpPanel = document.querySelector('.help-panel');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const completionModal = document.getElementById('completionModal');
const completionCloseBtn = document.getElementById('completionCloseBtn');
const configSelect = document.getElementById('configSelect');
const showKeyExtraCheckbox = document.getElementById('showKeyExtra');
const totalCharsEl = document.getElementById('totalChars');
const completedCharsEl = document.getElementById('completedChars');
const errorCountEl = document.getElementById('errorCount');
const timeElapsedEl = document.getElementById('timeElapsed');
const viewErrorsBtn = document.getElementById('viewErrorsBtn');
const errorModal = document.getElementById('errorModal');
const errorModalCloseBtn = document.getElementById('errorModalCloseBtn');
const errorModalBody = document.getElementById('errorModalBody');
const progressBar = document.getElementById('progressBar');

// 当前键盘配置
let currentKeyboardConfig = null;

// 是否显示声母/韵母
let showKeyExtra = true;

// 缓存的配置预处理结果
let cachedConfigData = null;
let cachedConfigCode = null;


// 预处理配置，生成优化后的数据结构
function preprocessConfig(config) {
    const configKeys = config.keys || {};
    // 新的数据结构：initials 和 finals 的 key 是按键，value 是声母/韵母（逗号分隔）
    const initialsMap = configKeys.initials || {};  // { 按键: 声母字符串（逗号分隔） }
    const finalsMap = configKeys.finals || {};      // { 按键: 韵母字符串（逗号分隔） }
    const zeroInitialsMap = configKeys.zeroInitials || {};
    
    // 将新的数据结构转换为查找用的数据结构：{ 声母: 按键 }
    // 先添加通用声母
    const allInitials = { ...commonInitials };
    
    // 处理方案专用的声母映射（按键 -> 声母字符串）
    Object.keys(initialsMap).forEach(key => {
        const initialsStr = initialsMap[key];
        // 处理逗号分隔的多个声母
        const initials = initialsStr.split(',').map(s => s.trim());
        initials.forEach(initial => {
            allInitials[initial] = key;
        });
    });
    
    // 按长度从长到短排序声母键（优先匹配长的，如 sh, ch, zh）
    const initialKeys = Object.keys(allInitials).sort((a, b) => b.length - a.length);
    
    // 预处理韵母：收集所有韵母，按长度从长到短排序
    // 将新的数据结构转换为查找用的数据结构：{ 韵母: 按键 }
    const allFinals = [];
    Object.keys(finalsMap).forEach(key => {
        const finalsStr = finalsMap[key];
        // 处理逗号分隔的多个韵母
        const finals = finalsStr.split(',').map(s => s.trim());
        finals.forEach(final => {
            allFinals.push({
                final: final,
                key: key
            });
        });
    });
    
    // 按长度从长到短排序
    allFinals.sort((a, b) => b.final.length - a.final.length);
    
    return {
        zeroInitialsMap,
        allInitials,
        initialKeys,
        allFinals
    };
}

// 获取缓存的配置数据（如果配置改变则重新预处理）
function getCachedConfigData(config) {
    const configCode = config.code;
    
    // 如果配置没有改变，直接返回缓存
    if (cachedConfigData && cachedConfigCode === configCode) {
        return cachedConfigData;
    }
    
    // 配置改变，重新预处理并缓存
    cachedConfigData = preprocessConfig(config);
    cachedConfigCode = configCode;
    
    return cachedConfigData;
}

// 根据 pinyin 生成 keys（使用预处理后的配置数据）
function generateKeysFromPinyin(pinyin, config) {
    // 如果 pinyin 为 null 或空字符串，返回 null
    if (!pinyin || pinyin.trim() === '') {
        return null;
    }
    
    const pinyinLower = pinyin.toLowerCase().trim();
    
    // 获取预处理后的配置数据（带缓存）
    const configData = getCachedConfigData(config);
    const { zeroInitialsMap, allInitials, initialKeys, allFinals } = configData;
    
    // 1. 首先检查是否是零声母（在 zeroInitials 中查找）
    if (zeroInitialsMap[pinyinLower]) {
        return zeroInitialsMap[pinyinLower];
    }
    
    // 2. 如果不是零声母，需要匹配声母和韵母
    // 匹配声母
    let matchedInitial = null;
    let matchedInitialKey = null;
    let remainingPinyin = pinyinLower;
    
    for (const initial of initialKeys) {
        if (pinyinLower.startsWith(initial)) {
            matchedInitial = initial;
            matchedInitialKey = allInitials[initial];
            remainingPinyin = pinyinLower.substring(initial.length);
            break;
        }
    }
    
    // 如果没有匹配到声母，可能是零声母但不在 zeroInitials 中，返回 null
    if (!matchedInitial) {
        return null;
    }
    
    // 匹配韵母
    let matchedFinal = null;
    let matchedFinalKey = null;
    
    for (const item of allFinals) {
        if (remainingPinyin === item.final) {
            matchedFinal = item.final;
            matchedFinalKey = item.key;
            break;
        }
    }
    
    // 如果没有匹配到韵母，返回 null
    if (!matchedFinal) {
        return null;
    }
    
    // 返回声母按键 + 韵母按键
    return matchedInitialKey + matchedFinalKey;
}

// 为 practiceData 生成 keys
function generateKeysForPracticeData(data, config) {
    return data.map(item => ({
        ...item,
        keys: generateKeysFromPinyin(item.pinyin, config)
    }));
}

// 从 practiceTexts 中随机选择文本并生成 practiceData
function generatePracticeDataFromText() {
    let selectedText = '';
    if (difficulty === 'sentence') {
        // 如果选择了句子，随机取一个句子
        const sentences = practiceTexts.sentence || [];
        if (sentences.length === 0) {
            practiceData = [];
            return;
        }
        const randomIndex = Math.floor(Math.random() * sentences.length);
        selectedText = sentences[randomIndex];
    } else if (difficulty === 'word') {
        // 如果选择了单字，把所有 word 合并为一个完整字符串，然后随机打乱顺序
        const wordArrays = practiceTexts.word || [];
        if (wordArrays.length === 0) {
            practiceData = [];
            return;
        }
        
        // 合并所有 word 数组为一个字符串
        const allWords = wordArrays.join('');
        
        // 将字符串转换为字符数组
        const wordArray = Array.from(allWords);
        
        // 随机打乱顺序（Fisher-Yates 洗牌算法）
        for (let i = wordArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]];
        }
        
        // 将打乱后的字符数组重新组合为字符串
        selectedText = wordArray.join('');
    } else {
        practiceData = [];
        return;
    }
    
    // 将 selectedText 转换为 practiceData 格式
    practiceData = []; // 初始化 practiceData
    
    // 1. 去掉前后、内部的所有空格
    const textWithoutSpaces = selectedText.replace(/\s+/g, '');
    
    // 2. 把整句话使用 pinyinPro.pinyin 转换，结果是空格分隔的字符串，用空格分隔后转换为数组
    let pinyinArray = [];
    if (typeof pinyinPro !== 'undefined' && pinyinPro.pinyin) {
        const pinyinString = pinyinPro.pinyin(textWithoutSpaces, {toneType: 'none'});
        pinyinArray = pinyinString ? pinyinString.split(/\s+/) : [];
    }
    
    // 3. 根据 textWithoutSpaces 中汉字的索引，取转换后对应索引处的拼音，非汉字设置为 null
    const charArray = Array.from(textWithoutSpaces);
    let pinyinIndex = 0; // 拼音数组的索引
    
    charArray.forEach(item => {
        let pinyin = null;
        // 使用正则表达式，判断当前item是不是汉字
        if (/^[\u4e00-\u9fa5]$/.test(item)) {
            // 如果是汉字，从拼音数组中取对应索引的拼音
            if (pinyinIndex < pinyinArray.length) {
                pinyin = pinyinArray[pinyinIndex];
            }
        }
        pinyinIndex++;
        practiceData.push({
            pinyin: pinyin,
            char: item,
            keys: null
        });
    });
}

// 初始化
function init() {
    loadTheme();
    initKeyboardConfig();
    loadShowKeyExtraSetting();
    generatePracticeDataFromText(); // 从 practiceTexts 中随机选择文本生成 practiceData
    generateText();
    createVirtualKeyboard();
    setupEventListeners();
    updateDisplay();
    checkAndShowHelp(); // 检查是否需要显示使用说明
}

// 加载显示声母/韵母的设置
function loadShowKeyExtraSetting() {
    const saved = localStorage.getItem('showKeyExtra');
    if (saved !== null) {
        showKeyExtra = saved === 'true';
    } else {
        showKeyExtra = true; // 默认显示
    }
    if (showKeyExtraCheckbox) {
        showKeyExtraCheckbox.checked = showKeyExtra;
    }
}

// 保存显示声母/韵母的设置
function saveShowKeyExtraSetting() {
    localStorage.setItem('showKeyExtra', showKeyExtra.toString());
}

// 初始化键盘配置
function initKeyboardConfig() {
    // 加载配置列表到选择器
    const configs = getAllConfigs();
    configSelect.innerHTML = '';
    configs.forEach(config => {
        const option = document.createElement('option');
        option.value = config.code;
        option.textContent = config.name;
        configSelect.appendChild(option);
    });
    
    // 加载当前配置
    currentKeyboardConfig = getCurrentConfig();
    configSelect.value = currentKeyboardConfig.code;
}

// 根据练习类型生成文本
function generateTextByDifficulty() {
    // 直接使用 practiceData，不再根据练习类型重复
    let baseData = [...practiceData];
    
    // 根据当前键盘配置生成 keys
    if (!currentKeyboardConfig) {
        currentKeyboardConfig = getCurrentConfig();
    }
    baseData = generateKeysForPracticeData(baseData, currentKeyboardConfig);
    
    // 只打印baseData中的keys，用来调试
    console.log('双拼按键:', baseData.map(item => item.keys));

    return baseData;
}

// 生成文本
function generateText() {
    currentText = generateTextByDifficulty();
    currentIndex = 0;
    scrollPosition = -14; // 初始向左偏移一个字符位置（42px = 28px宽度 + 14px间隔）
    // 跳过不需要输入的字符，找到第一个需要输入的字符
    skipToNextInputChar();
    highlightKeys(''); // 清除高亮
    renderText();
    
    // 初始化统计
    totalValidChars = currentText.filter(item => item.keys && item.keys.trim() !== '').length;
    updateStats();
    // 初始化进度条（updateStats 会更新进度条，但这里确保初始为 0）
    if (progressBar) {
        progressBar.style.width = '0%';
    }
}

// 渲染文本（使用 DocumentFragment 优化性能）
function renderText() {
    // 使用 DocumentFragment 批量操作 DOM，减少重排和重绘
    const fragment = document.createDocumentFragment();
    
    currentText.forEach((item, index) => {
        const textItem = document.createElement('div');
        textItem.className = 'text-item';
        
        // 每个汉字宽度28px + 间隔14px = 42px
        textItem.style.transform = `translateX(${scrollPosition + index * 42}px)`;
        
        const pinyinEl = document.createElement('div');
        pinyinEl.className = 'pinyin';
        // 如果 pinyin 为 null 或空字符串，不显示拼音（pinyin 和 keys 后期会通过函数生成）
        pinyinEl.textContent = (item.pinyin && item.pinyin.trim() !== '') ? item.pinyin : '';
        
        const charEl = document.createElement('div');
        charEl.className = 'character';
        
        // 对于不需要输入的字符（keys 为 null 或空），直接标记为 completed
        if (!item.keys || item.keys.trim() === '') {
            charEl.classList.add('completed');
        } else if (index === currentIndex) {
            charEl.classList.add('current');
        } else if (index < currentIndex) {
            charEl.classList.add('completed');
        }
        // 如果是最后一个字且已完成，也标记为completed
        if (index === currentText.length - 1 && currentIndex > index) {
            charEl.classList.add('completed');
        }
        charEl.textContent = item.char;
        
        textItem.appendChild(pinyinEl);
        textItem.appendChild(charEl);
        fragment.appendChild(textItem);
    });
    
    // 一次性清空并添加所有元素，减少 DOM 操作
    textContainer.innerHTML = '';
    textContainer.appendChild(fragment);
}

// 创建虚拟键盘
function createVirtualKeyboard() {
    virtualKeyboard.innerHTML = '';
    
    if (!currentKeyboardConfig) {
        currentKeyboardConfig = getCurrentConfig();
    }
    
    const configKeys = currentKeyboardConfig.keys || {};
    // 新的数据结构：initials 和 finals 的 key 是按键，value 是声母/韵母（逗号分隔）
    const initialsMap = configKeys.initials || {};  // { 按键: 声母字符串（逗号分隔） }
    const finalsMap = configKeys.finals || {};      // { 按键: 韵母字符串（逗号分隔） }
    const zeroInitialsMap = configKeys.zeroInitials || {};  // { 韵母: 按键组合 }
    
    // 直接使用新的数据结构：按键 -> 声母列表
    const keyToInitials = {};
    Object.keys(initialsMap).forEach(key => {
        const initialsStr = initialsMap[key];
        // 处理逗号分隔的多个声母
        const initials = initialsStr.split(',').map(s => s.trim());
        keyToInitials[key] = initials;
    });
    
    // 直接使用新的数据结构：按键 -> 韵母列表
    const keyToFinals = {};
    Object.keys(finalsMap).forEach(key => {
        const finalsStr = finalsMap[key];
        // 处理逗号分隔的多个韵母
        const finals = finalsStr.split(',').map(s => s.trim());
        keyToFinals[key] = finals;
    });
    
    // 反向查找：按键组合 -> 零声母韵母列表（用于显示提示，但实际显示在按键上可能不太合适）
    // 这里先不处理 zeroInitials 的显示，因为它是两个按键的组合
    
    keyboardLayout.forEach((row, rowIndex) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'keyboard-row';
        
        // 第二行和第三行需要偏移，模拟真实键盘布局
        if (rowIndex === 1) {
            // 第二行向左偏移约半个键位（约30px）
            rowDiv.style.marginLeft = '30px';
        } else if (rowIndex === 2) {
            // 第三行向左偏移约一个键位（约60px）
            rowDiv.style.marginLeft = '-110px';
        }
        
        row.forEach(key => {
            const keyBtn = document.createElement('div');
            keyBtn.className = 'key';
            keyBtn.dataset.key = key;
            
            // 主按键文字
            const keyMain = document.createElement('div');
            keyMain.className = 'key-main';
            keyMain.textContent = key.toUpperCase();
            keyBtn.appendChild(keyMain);
            
            // 查找该按键对应的声母（右上角，红色）
            const initials = keyToInitials[key];
            if (initials && initials.length > 0 && showKeyExtra) {
                const initialsDiv = document.createElement('div');
                initialsDiv.className = 'key-extra key-initials';
                initialsDiv.innerHTML = initials.join('<br>');
                keyBtn.appendChild(initialsDiv);
            }
            
            // 查找该按键对应的韵母（右下角，蓝色）
            const finals = keyToFinals[key];
            if (finals && finals.length > 0 && showKeyExtra) {
                const finalsDiv = document.createElement('div');
                finalsDiv.className = 'key-extra key-finals';
                finalsDiv.innerHTML = finals.join('<br>');
                keyBtn.appendChild(finalsDiv);
            }
            
            keyBtn.addEventListener('click', () => handleKeyClick(key));
            rowDiv.appendChild(keyBtn);
        });
        
        virtualKeyboard.appendChild(rowDiv);
    });
    
    // 创建零声母显示
    createZeroInitialsDisplay(zeroInitialsMap);
}

// 创建零声母显示
function createZeroInitialsDisplay(zeroInitialsMap) {
    if (!virtualKeyboard) return;
    
    // 将零声母按键按按键组合分组
    const keysByCombo = {};
    Object.keys(zeroInitialsMap).forEach(yun => {
        const combo = zeroInitialsMap[yun];
        if (!keysByCombo[combo]) {
            keysByCombo[combo] = [];
        }
        keysByCombo[combo].push(yun);
    });
    
    // 如果没有零声母，不显示
    if (Object.keys(keysByCombo).length === 0) {
        return;
    }
    
    // 创建零声母容器
    const zeroInitialsContainer = document.createElement('div');
    zeroInitialsContainer.className = 'zero-initials-display';
    
    // 创建标签
    const label = document.createElement('div');
    label.className = 'zero-initials-label';
    label.textContent = '零声母：';
    zeroInitialsContainer.appendChild(label);
    
    // 创建内容区域
    const content = document.createElement('div');
    content.className = 'zero-initials-content';
    
    // 为每个按键组合创建显示项
    Object.keys(keysByCombo).sort().forEach(combo => {
        const yuns = keysByCombo[combo];
        
        const item = document.createElement('span');
        item.className = 'zero-initials-item';
        
        const comboSpan = document.createElement('span');
        comboSpan.className = 'zero-combo';
        comboSpan.textContent = combo.toUpperCase();
        
        const yunsSpan = document.createElement('span');
        yunsSpan.className = 'zero-yuns';
        yunsSpan.textContent = `(${yuns.join(' ')})`;
        
        item.appendChild(comboSpan);
        item.appendChild(yunsSpan);
        content.appendChild(item);
    });
    
    zeroInitialsContainer.appendChild(content);
    virtualKeyboard.appendChild(zeroInitialsContainer);
}

// 处理虚拟键盘点击
function handleKeyClick(key) {
    if (!isPlaying) return;
    
    const currentValue = typingInput.value;
    typingInput.value = currentValue + key;
    typingInput.focus();
    
    // 视觉反馈
    const keyBtn = document.querySelector(`[data-key="${key}"]`);
    if (keyBtn) {
        keyBtn.classList.add('pressed');
        setTimeout(() => {
            keyBtn.classList.remove('pressed');
        }, 150);
    }
    
    checkInput();
}

// 设置事件监听器
function setupEventListeners() {
    // 输入框事件
    typingInput.addEventListener('input', checkInput);
    typingInput.addEventListener('keydown', (e) => {
        // 如果未开始或已暂停，阻止输入
        if (!isPlaying) {
            e.preventDefault();
            return;
        }
        if (e.key === 'Backspace' || e.key === 'Delete') {
            // 允许退格
            return;
        }
        // 阻止非字母字符
        if (!/^[a-z]$/i.test(e.key)) {
            e.preventDefault();
        }
    });
    
    // 物理键盘事件
    document.addEventListener('keydown', (e) => {
        if (!isPlaying) return;
        const key = e.key.toLowerCase();
        if (/^[a-z]$/.test(key)) {
            const keyBtn = document.querySelector(`[data-key="${key}"]`);
            if (keyBtn) {
                keyBtn.classList.add('pressed');
            }
        }
    });
    
    document.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (/^[a-z]$/.test(key)) {
            const keyBtn = document.querySelector(`[data-key="${key}"]`);
            if (keyBtn) {
                keyBtn.classList.remove('pressed');
            }
        }
    });
    
    // 按钮事件
    startBtn.addEventListener('click', start);
    pauseBtn.addEventListener('click', pause);
    resetBtn.addEventListener('click', reset);
    
    // 设置事件
    difficultySelect.addEventListener('change', (e) => {
        difficulty = e.target.value;
        // 如果正在练习，重新生成文本
        if (isPlaying || currentText.length > 0) {
            reset();
        }
    });
    
    // 配置选择事件
    configSelect.addEventListener('change', (e) => {
        const selectedCode = e.target.value;
        const selectedConfig = getAllConfigs().find(config => config.code === selectedCode);
        if (selectedConfig) {
            currentKeyboardConfig = selectedConfig;
            localStorage.setItem('keyboardConfig', selectedConfig.code);
            // 清除配置缓存，强制重新预处理
            cachedConfigCode = null;
            cachedConfigData = null;
            createVirtualKeyboard();
            // 切换配置后重新生成文本（因为 keys 会改变）
            generateText();
        }
    });
    
    // 显示声母/韵母复选框事件
    showKeyExtraCheckbox.addEventListener('change', (e) => {
        showKeyExtra = e.target.checked;
        saveShowKeyExtraSetting();
        // 重新创建虚拟键盘以应用设置
        createVirtualKeyboard();
    });
    
    // 帮助面板
    helpToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const wasShowing = helpContent.classList.contains('show');
        helpContent.classList.toggle('show');
        // 如果关闭了帮助（之前是显示的），且是首次自动显示的，记录用户已查看过
        if (wasShowing && !helpContent.classList.contains('show')) {
            markHelpAsViewed();
        }
    });
    
    // 点击外部关闭帮助
    document.addEventListener('click', (e) => {
        if (helpPanel && !helpPanel.contains(e.target) && helpContent.classList.contains('show')) {
            helpContent.classList.remove('show');
            // 关闭时记录用户已查看过（如果是首次自动显示的）
            markHelpAsViewed();
        }
    });
    
    // 主题切换
    themeToggle.addEventListener('click', toggleTheme);
    
    // 完成弹窗关闭按钮
    if (completionCloseBtn) {
        completionCloseBtn.addEventListener('click', closeCompletionModal);
    }
    
    // 错误记录弹窗事件
    if (viewErrorsBtn) {
        viewErrorsBtn.addEventListener('click', showErrorModal);
    }
    if (errorModalCloseBtn) {
        errorModalCloseBtn.addEventListener('click', hideErrorModal);
    }
    if (errorModal) {
        errorModal.addEventListener('click', (e) => {
            if (e.target === errorModal) {
                hideErrorModal();
            }
        });
    }
    
    // 点击弹窗外部关闭
    if (completionModal) {
        completionModal.addEventListener('click', (e) => {
            if (e.target === completionModal) {
                closeCompletionModal();
            }
        });
    }
}

// 切换主题
function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.contains('dark-theme');
    
    if (isDark) {
        body.classList.remove('dark-theme');
        themeIcon.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('dark-theme');
        themeIcon.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    }
}

// 加载保存的主题
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // 优先使用保存的主题，如果没有则根据系统偏好
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        themeIcon.textContent = '☀️';
    } else {
        document.body.classList.remove('dark-theme');
        themeIcon.textContent = '🌙';
    }
}

// 跳过不需要输入的字符，找到下一个需要输入的字符索引
function skipToNextInputChar() {
    while (currentIndex < currentText.length) {
        const item = currentText[currentIndex];
        // 如果 keys 为 null 或空字符串，跳过
        if (!item.keys || item.keys.trim() === '') {
            currentIndex++;
            scrollPosition -= 42;
        } else {
            // 记录当前字的开始时间（只在播放状态下记录）
            if (isPlaying) {
                currentCharStartTime = Date.now();
                // 初始化该字的记录
                if (!charTimingRecords[currentIndex]) {
                    charTimingRecords[currentIndex] = {
                        inputCount: 0,
                        pauseDuration: 0
                    };
                }
            }
            break;
        }
    }
}

// 高亮虚拟键盘按键
let highlightTimeout = null;
let lastHighlightedKeys = '';

function highlightKeys(keys) {
    // 使用 requestAnimationFrame 优化性能
    if (highlightTimeout) {
        cancelAnimationFrame(highlightTimeout);
    }
    
    highlightTimeout = requestAnimationFrame(() => {
        // 清除之前的高亮
        if (lastHighlightedKeys) {
            lastHighlightedKeys.split('').forEach(key => {
                const keyEl = document.querySelector(`.key[data-key="${key.toLowerCase()}"]`);
                if (keyEl) {
                    keyEl.classList.remove('active');
                }
            });
        }
        
        // 高亮当前输入的按键
        if (keys) {
            keys.split('').forEach(key => {
                const keyEl = document.querySelector(`.key[data-key="${key.toLowerCase()}"]`);
                if (keyEl) {
                    keyEl.classList.add('active');
                }
            });
            lastHighlightedKeys = keys;
        } else {
            lastHighlightedKeys = '';
        }
    });
}

// 检查输入
function checkInput() {
    // 如果未开始或已暂停，不允许输入
    if (!isPlaying) {
        return;
    }
    
    if (currentIndex >= currentText.length) {
        // 清除高亮
        highlightKeys('');
        return;
    }
    
    const currentItem = currentText[currentIndex];
    
    // 如果当前字还没有开始计时，记录开始时间
    if (currentCharStartTime === null && isPlaying) {
        currentCharStartTime = Date.now();
        if (!charTimingRecords[currentIndex]) {
            charTimingRecords[currentIndex] = {
                inputCount: 0,
                pauseDuration: 0
            };
        }
    }
    
    // 如果当前字符不需要输入，自动跳过
    if (!currentItem.keys || currentItem.keys.trim() === '') {
        highlightKeys('');
        skipToNextInputChar();
        updateDisplay();
        
        // 检查是否完成
        if (currentIndex >= currentText.length) {
            pause();
            setTimeout(() => {
                showCompletionModal();
            }, 200);
        }
        return;
    }
    
    const inputValue = typingInput.value.toLowerCase().trim();
    const expectedKeys = currentItem.keys.toLowerCase();
    
    // 高亮当前输入的按键
    highlightKeys(inputValue);
    
    // 首先判断输入按键的数量是否和 keys 字符数量相同
    if (inputValue.length !== expectedKeys.length) {
        // 输入长度不匹配，继续等待输入或显示错误
        if (inputValue.length > expectedKeys.length) {
            // 输入过长，显示错误
            recordError(inputValue);
            const charEl = document.querySelectorAll('.character')[currentIndex];
            if (charEl) {
                charEl.classList.add('error');
                setTimeout(() => {
                    charEl.classList.remove('error');
                }, 500);
            }
            // 清空输入，让用户重新输入
            typingInput.value = '';
            highlightKeys('');
        }
        // 如果输入长度小于期望长度，继续等待输入
        return;
    }
    
    // 输入长度匹配，判断输入按键顺序是否和 keys 顺序完全一致
    if (inputValue === expectedKeys) {
        // 输入正确，短暂保持高亮后清除
        setTimeout(() => {
            highlightKeys('');
        }, 200);
        
        // 输入正确，记录该字的输入时间
        if (currentCharStartTime && isPlaying) {
            const endTime = Date.now();
            const duration = endTime - currentCharStartTime;
            
            if (!charTimingRecords[currentIndex]) {
                charTimingRecords[currentIndex] = {
                    inputCount: 0,
                    pauseDuration: 0
                };
            }
            
            // 减去该字期间的暂停时间
            const actualDuration = duration - charTimingRecords[currentIndex].pauseDuration;
            charTimingRecords[currentIndex].endTime = endTime;
            charTimingRecords[currentIndex].duration = actualDuration;
            charTimingRecords[currentIndex].inputCount++;
            
            // 重置暂停时长记录和开始时间
            charTimingRecords[currentIndex].pauseDuration = 0;
            currentCharStartTime = null;
        }
        
        // 输入正确
        currentIndex++;
        completedChars++;
        typingInput.value = '';
        
        // 更新滚动位置（每个汉字宽度28px + 间隔14px = 42px）
        scrollPosition -= 42;
        
        // 跳过不需要输入的字符
        skipToNextInputChar();
        
        updateDisplay();
        updateStats();
        
        // 检查是否完成
        if (currentIndex >= currentText.length) {
            pause();
            // 延迟显示完成弹窗，等待文字移动动画完成
            setTimeout(() => {
                showCompletionModal();
            }, 200);
        }
    } else {
        // 输入错误（长度相同但顺序不对）
        recordError(inputValue);
        const charEl = document.querySelectorAll('.character')[currentIndex];
        if (charEl) {
            charEl.classList.add('error');
            setTimeout(() => {
                charEl.classList.remove('error');
            }, 500);
        }
        // 清空输入，让用户重新输入
        typingInput.value = '';
        highlightKeys('');
    }
}

// 记录错误
function recordError(inputValue) {
    errorCount++;
    const charIndex = currentIndex;
    if (!errorRecords[charIndex]) {
        errorRecords[charIndex] = [];
    }
    errorRecords[charIndex].push({
        input: inputValue,
        time: Date.now()
    });
    
    // 增加该字的输入次数
    if (charTimingRecords[charIndex]) {
        charTimingRecords[charIndex].inputCount++;
    }
    
    updateStats();
}

// 更新统计显示
function updateStats() {
    if (totalCharsEl) {
        totalCharsEl.textContent = totalValidChars;
        totalCharsEl.classList.add('updated');
        setTimeout(() => totalCharsEl.classList.remove('updated'), 500);
    }
    if (completedCharsEl) {
        completedCharsEl.textContent = completedChars;
        completedCharsEl.classList.add('updated');
        setTimeout(() => completedCharsEl.classList.remove('updated'), 500);
    }
    if (errorCountEl) {
        errorCountEl.textContent = errorCount;
        if (errorCount > 0) {
            errorCountEl.classList.add('updated');
            setTimeout(() => errorCountEl.classList.remove('updated'), 500);
        }
    }
    // 更新进度条
    if (progressBar && totalValidChars > 0) {
        const progress = (completedChars / totalValidChars) * 100;
        progressBar.style.width = `${progress}%`;
    }
}

// 开始计时
function startTimer() {
    if (timerInterval) return;
    
    // 如果之前有暂停时间，需要调整开始时间
    if (pausedTime > 0) {
        // 从当前时间减去已用时间，得到新的开始时间
        startTime = Date.now() - pausedTime * 1000;
    } else {
        // 首次开始，记录开始时间
        startTime = Date.now();
    }
    
    timerInterval = setInterval(() => {
        if (startTime) {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            if (timeElapsedEl) {
                timeElapsedEl.textContent = `${elapsed}秒`;
            }
        }
    }, 1000);
}

// 停止计时
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    // 保存已用时间（累计），以便继续时使用
    if (startTime) {
        pausedTime = Math.floor((Date.now() - startTime) / 1000);
    }
}

// 更新显示
function updateDisplay() {
    renderText();
    
    // 更新按钮状态
    if (isPlaying) {
        // 正在播放状态
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        pauseBtn.textContent = '暂停';
        typingInput.disabled = false;
        typingInput.focus();
    } else {
        // 暂停或未开始状态
        startBtn.disabled = false;
        typingInput.disabled = true;
        
        if (hasStarted) {
            // 已经点击过开始，现在是暂停状态，显示"继续"
            pauseBtn.disabled = false;
            pauseBtn.textContent = '继续';
            startBtn.textContent = '重新开始';
        } else {
            // 初始状态，暂停按钮不可点击
            pauseBtn.disabled = true;
            pauseBtn.textContent = '暂停';
        }
    }
}



// 开始
function start() {
    if (currentIndex >= currentText.length) {
        reset();
    }
    isPlaying = true;
    hasStarted = true; // 标记已经开始
    pausedTime = 0; // 重置暂停时间
    startTimer();
    updateDisplay();
}

// 暂停/继续
function pause() {
    if (isPlaying) {
        // 当前是播放状态，点击后暂停
        isPlaying = false;
        pauseStartTime = Date.now(); // 记录暂停开始时间
        stopTimer();
    } else {
        // 当前是暂停状态，点击后继续
        isPlaying = true;
        // 计算暂停时长并累加到当前字的暂停时长
        if (pauseStartTime && currentCharStartTime !== null) {
            const pauseDuration = Date.now() - pauseStartTime;
            totalPausedDuration += pauseDuration;
            
            // 累加到当前字的暂停时长
            if (charTimingRecords[currentIndex]) {
                charTimingRecords[currentIndex].pauseDuration += pauseDuration;
            }
        }
        pauseStartTime = null;
        startTimer();
    }
    updateDisplay();
}

// 重置
function reset() {
    isPlaying = false;
    hasStarted = false; // 重置开始标志
    startBtn.textContent = '开始';
    currentIndex = 0;
    scrollPosition = -14; // 重置时也向左偏移半个字符位置
    typingInput.value = '';
    highlightKeys(''); // 清除高亮
    stopTimer();
    startTime = null;
    pausedTime = 0; // 重置暂停时间
    completedChars = 0;
    errorCount = 0;
    errorRecords = {};
    charTimingRecords = {}; // 重置字符时间记录
    currentCharStartTime = null;
    pauseStartTime = null;
    totalPausedDuration = 0;
    if (timeElapsedEl) timeElapsedEl.textContent = '0秒';
    generatePracticeDataFromText(); // 从 practiceTexts 中随机选择文本生成 practiceData
    generateText();
    updateDisplay();
    // 重置进度条
    if (progressBar) {
        progressBar.style.width = '0%';
    }
}

// 显示完成弹窗
function showCompletionModal() {
    if (!completionModal) return;
    
    // 生成统计信息
    generateCompletionStats();
    
    completionModal.classList.add('show');
    startFireworks();
}

// 生成完成统计信息
function generateCompletionStats() {
    const statsContainer = document.getElementById('completionStats');
    const viewErrorsBtn = document.getElementById('completionViewErrorsBtn');
    if (!statsContainer) return;
    
    let html = '';
    
    // 1. 用时最长的10个字
    const sortedChars = Object.keys(charTimingRecords)
        .map(index => {
            const record = charTimingRecords[index];
            const item = currentText[parseInt(index)];
            if (!item || !record.duration) return null;
            return {
                index: parseInt(index),
                char: item.char,
                pinyin: item.pinyin || '',
                duration: record.duration,
                inputCount: record.inputCount || 1
            };
        })
        .filter(item => item !== null)
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10);
    
    // 1. 用时最长的字（放在滚动窗口中）
    if (sortedChars.length > 0) {
        html += '<div class="completion-stats-section">';
        html += '<h3>用时最长的' + sortedChars.length + '个字</h3>';
        html += '<div class="completion-chars-list">';
        sortedChars.forEach((item, idx) => {
            const seconds = (item.duration / 1000).toFixed(2);
            html += `<div class="completion-char-item">`;
            html += `<span class="char-rank">${idx + 1}.</span>`;
            html += `<span class="char-text">${item.char}</span>`;
            html += `<span class="char-pinyin">${item.pinyin}</span>`;
            html += `<span class="char-duration">${seconds}秒</span>`;
            html += `<span class="char-count">输入${item.inputCount}次</span>`;
            html += `</div>`;
        });
        html += '</div>';
        html += '</div>';
    }
    
    statsContainer.innerHTML = html;
    
    // 2. 总时长（放在烟花下方）
    const totalTimeContainer = document.getElementById('completionMessage');
    if (totalTimeContainer) {
        const totalTime = pausedTime > 0 ? pausedTime : (startTime ? Math.floor((Date.now() - startTime) / 1000) : 0);
        totalTimeContainer.innerHTML = `总用时：${totalTime}秒`;
    }
    
    // 3. 错误记录按钮（仅在有错误时显示）
    if (viewErrorsBtn) {
        const hasErrors = Object.keys(errorRecords).length > 0;
        viewErrorsBtn.style.display = hasErrors ? 'inline-block' : 'none';
        if (hasErrors) {
            viewErrorsBtn.onclick = () => {
                // 不关闭完成弹窗，只显示错误记录弹窗（z-index更高会覆盖）
                showErrorModal();
            };
        }
    }
}

// 关闭完成弹窗
function closeCompletionModal() {
    if (!completionModal) return;
    
    completionModal.classList.remove('show');
    stopFireworks();
}

// 烟花效果
let fireworksAnimation = null;
let fireworksCanvas = null;
let fireworksCtx = null;

function startFireworks() {
    fireworksCanvas = document.getElementById('fireworksCanvas');
    if (!fireworksCanvas) return;
    
    fireworksCanvas.width = window.innerWidth;
    fireworksCanvas.height = window.innerHeight;
    fireworksCtx = fireworksCanvas.getContext('2d');
    
    const particles = [];
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe'];
    
    function createFirework(x, y) {
        const particleCount = 50;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = Math.random() * 5 + 2;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1.0,
                decay: Math.random() * 0.02 + 0.01
            });
        }
    }
    
    // 创建多个烟花
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            createFirework(
                Math.random() * window.innerWidth,
                Math.random() * window.innerHeight * 0.5
            );
        }, i * 200);
    }
    
    function animate() {
        fireworksCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        fireworksCtx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
        
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            
            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }
            
            fireworksCtx.globalAlpha = p.life;
            fireworksCtx.fillStyle = p.color;
            fireworksCtx.beginPath();
            fireworksCtx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            fireworksCtx.fill();
        }
        
        fireworksCtx.globalAlpha = 1.0;
        
        if (particles.length > 0) {
            fireworksAnimation = requestAnimationFrame(animate);
        }
    }
    
    animate();
}

function stopFireworks() {
    if (fireworksAnimation) {
        cancelAnimationFrame(fireworksAnimation);
        fireworksAnimation = null;
    }
    if (fireworksCtx) {
        fireworksCtx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
    }
}

// 显示错误记录弹窗
function showErrorModal() {
    if (!errorModal || !errorModalBody) return;
    
    // 生成错误记录内容
    const errorKeys = Object.keys(errorRecords).sort((a, b) => parseInt(a) - parseInt(b));
    
    if (errorKeys.length === 0) {
        errorModalBody.innerHTML = '<div class="error-record-empty">暂无错误记录</div>';
    } else {
        let html = '';
        errorKeys.forEach(charIndex => {
            const index = parseInt(charIndex);
            const item = currentText[index];
            const errors = errorRecords[charIndex];
            
            if (item && errors && errors.length > 0) {
                html += '<div class="error-record-item">';
                html += `<div class="error-record-char">字符: ${item.char} (索引: ${index})</div>`;
                html += `<div class="error-record-info">错误次数: ${errors.length}</div>`;
                html += '<div class="error-record-detail">';
                errors.forEach((error, idx) => {
                    const time = new Date(error.time).toLocaleTimeString();
                    html += `<div class="error-record-detail-item">${idx + 1}. 输入: "${error.input}" (时间: ${time})</div>`;
                });
                html += '</div>';
                html += '</div>';
            }
        });
        errorModalBody.innerHTML = html;
    }
    
    errorModal.classList.add('show');
}

// 隐藏错误记录弹窗
function hideErrorModal() {
    if (!errorModal) return;
    errorModal.classList.remove('show');
}

// 标记是否是首次自动显示帮助
let isAutoShowingHelp = false;

// 检查并显示使用说明（首次进入时）
function checkAndShowHelp() {
    const hasViewedHelp = localStorage.getItem('hasViewedHelp');
    if (!hasViewedHelp) {
        // 首次进入，延迟一点显示，确保页面已完全加载
        isAutoShowingHelp = true;
        setTimeout(() => {
            if (helpContent) {
                helpContent.classList.add('show');
            }
        }, 300);
    }
}

// 标记用户已查看过使用说明
function markHelpAsViewed() {
    // 只有在首次自动显示后关闭时才记录
    if (isAutoShowingHelp) {
        localStorage.setItem('hasViewedHelp', 'true');
        isAutoShowingHelp = false;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);

