import type { Question, ModuleType } from "@/types";

// ======== 工具函数 ========

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ======== 各模块生成函数 ========

/**
 * 两位数加减法（根据 seed 参数组合生成指定题型）
 * @param count 题目数量
 * @param seed 包含四个布尔标志：carryAdd, noCarryAdd, borrowSub, noBorrowSub
 * 特别地，当四个参数全部为 false 时，视为生成全部类型（等同于全为 true）
 */
function generateTwoDigitAddSub(count: number, seed: any): Question[] {
    const { borrowSub, carryAdd, noBorrowSub, noCarryAdd } = seed;

    // 如果全部为 false，则全部开启（避免返回空集）
    if (!carryAdd.enable && !noCarryAdd.enable && !borrowSub.enable && !noBorrowSub.enable) {
        carryAdd.enable = true;
        noCarryAdd.enable = true;
        borrowSub.enable = true;
        noBorrowSub.enable = true;
    }

    // 收集需要生成的题型
    const activeTypes: string[] = [];
    if (carryAdd.enable) activeTypes.push('carryAdd');
    if (noCarryAdd.enable) activeTypes.push('noCarryAdd');
    if (borrowSub.enable) activeTypes.push('borrowSub');
    if (noBorrowSub.enable) activeTypes.push('noBorrowSub');

    const set = new Set<string>();
    const questions: Question[] = [];
    let attempts = 0;
    const maxAttempts = count * 200; // 安全上限

    while (questions.length < count && attempts < maxAttempts) {
        attempts++;

        // 从激活的题型中随机选一种
        const type = activeTypes[Math.floor(Math.random() * activeTypes.length)];

        let a = randInt(10, 99);
        let b = randInt(10, 99);
        let isValid = false;
        let key = '';
        let text = '';
        let correctAnswer = 0;

        // 内层循环：针对当前类型生成符合条件的数字
        let innerAttempts = 0;
        while (!isValid && innerAttempts < 100) {
            innerAttempts++;
            a = randInt(10, 99);
            b = randInt(10, 99);

            if (type === 'carryAdd') {
                if ((a % 10) + (b % 10) >= 10) {
                    key = `${a}+${b}`;
                    text = `${a} + ${b} = ?`;
                    correctAnswer = a + b;
                    isValid = true;
                }
            } else if (type === 'noCarryAdd') {
                if ((a % 10) + (b % 10) < 10) {
                    key = `${a}+${b}`;
                    text = `${a} + ${b} = ?`;
                    correctAnswer = a + b;
                    isValid = true;
                }
            } else if (type === 'borrowSub') {
                const big = Math.max(a, b);
                const small = Math.min(a, b);
                if ((big % 10) < (small % 10)) {
                    key = `${big}-${small}`;
                    text = `${big} - ${small} = ?`;
                    correctAnswer = big - small;
                    isValid = true;
                }
            } else if (type === 'noBorrowSub') {
                const big = Math.max(a, b);
                const small = Math.min(a, b);
                if ((big % 10) >= (small % 10)) {
                    key = `${big}-${small}`;
                    text = `${big} - ${small} = ?`;
                    correctAnswer = big - small;
                    isValid = true;
                }
            }
        }

        if (!isValid) continue; // 内层未找到则跳过

        // 全局去重
        if (set.has(key)) continue;
        set.add(key);

        questions.push({
            id: questions.length,
            text: text,
            correctAnswer: correctAnswer,
            durationSeconds: 0,
            startTimestamp: 0,
            endTimestamp: 0,
        });
    }

    return shuffle(questions);
}

/**
 * 凑整百
 * 目标数从 100, 200, 300, ..., 900 中随机选取，
 * 生成形如 "x + ? = 整百数" 的题目，其中 1 ≤ x ≤ 目标数-1。
 */
function generateMakeHundred(count: number, seed: any): Question[] {
    console.log('generateMakeHundred seed', seed);

    // 从 seed 中读取配置（若未定义则默认 true，即混合）
    const above = seed?.aboveHundred?.enable ?? true;
    const below = seed?.belowHundred?.enable ?? true;

    // 确定模式：
    // - 'above'  : 只取答案 > 100
    // - 'below'  : 只取答案 < 100
    // - 'mixed'  : 答案范围不限（包括两者都为 false 的情况）
    const mode = (above && !below) ? 'above'
        : (!above && below) ? 'below'
            : 'mixed';

    const targets = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

    // 预生成所有合法组合 (target, x) 并计算答案
    const allCombinations: { target: number; x: number; answer: number }[] = [];
    for (const target of targets) {
        for (let x = 1; x < target; x++) {
            allCombinations.push({ target, x, answer: target - x });
        }
    }

    // 根据模式过滤（mixed 模式不过滤，即全部输出）
    let filtered = allCombinations;
    if (mode === 'above') {
        filtered = allCombinations.filter(q => q.answer > 100);
    } else if (mode === 'below') {
        filtered = allCombinations.filter(q => q.answer < 100);
    }
    // 若 mode === 'mixed'，则 filtered 保留全部

    // 若过滤后无可用题目（极少发生），抛出错误
    if (filtered.length === 0) {
        throw new Error(`No questions available for mode: ${mode}`);
    }

    // 打乱后随机抽取 count 个（若 count 超过总数，则返回全部）
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));

    // 构造最终题目数组
    return selected.map((q, index) => ({
        id: index,
        text: `${q.x} + ? = ${q.target}`,
        correctAnswer: q.answer,
        durationSeconds: 0,
        startTimestamp: 0,
        endTimestamp: 0,
    }));
}

/** 三位数加法：两个100~999的数相加 */
function generateThreeDigitAdd(count: number): Question[] {
    const set = new Set<string>();
    const questions: Question[] = [];
    let attempts = 0;

    while (questions.length < count && attempts < count * 20) {
        attempts++;
        const a = randInt(100, 999);
        const b = randInt(100, 999);
        const key = `${a}+${b}`;
        if (set.has(key)) continue;
        set.add(key);
        questions.push({
            id: questions.length,
            text: `${a} + ${b} = ?`,
            correctAnswer: a + b,
            durationSeconds: 0,
            startTimestamp: 0,
            endTimestamp: 0,
        });
    }

    return shuffle(questions);
}

/** 三位数减法：两个100~999的数，确保被减数 >= 减数 */
function generateThreeDigitSub(count: number): Question[] {
    const set = new Set<string>();
    const questions: Question[] = [];
    let attempts = 0;

    while (questions.length < count && attempts < count * 20) {
        attempts++;
        const a = randInt(100, 999);
        const b = randInt(100, 999);
        const big = Math.max(a, b);
        const small = Math.min(a, b);
        if (big === small) continue; // 避免无意义的0答案
        const key = `${big}-${small}`;
        if (set.has(key)) continue;
        set.add(key);
        questions.push({
            id: questions.length,
            text: `${big} - ${small} = ?`,
            correctAnswer: big - small,
            durationSeconds: 0,
            startTimestamp: 0,
            endTimestamp: 0,
        });
    }

    return shuffle(questions);
}

/** 三位数加减混合：形如 a + b - c 或 a - b + c（a,b,c均为100~999），中间过程及最终结果均不能为负 */
function generateThreeDigitMixed(count: number): Question[] {
    const set = new Set<string>();
    const questions: Question[] = [];
    let attempts = 0;

    while (questions.length < count && attempts < count * 30) {
        attempts++;
        const a = randInt(100, 999);
        const b = randInt(100, 999);
        const c = randInt(100, 999);
        const isAddFirst = Math.random() < 0.5;

        if (isAddFirst) {
            // a + b - c, 需保证 a + b >= c
            if (a + b < c) continue;
            const key = `${a}+${b}-${c}`;
            if (set.has(key)) continue;
            set.add(key);
            questions.push({
                id: questions.length,
                text: `${a} + ${b} - ${c} = ?`,
                correctAnswer: a + b - c,
                durationSeconds: 0,
                startTimestamp: 0,
                endTimestamp: 0,
            });
        } else {
            // a - b + c, 需保证 a >= b
            if (a < b) continue;
            const key = `${a}-${b}+${c}`;
            if (set.has(key)) continue;
            set.add(key);
            questions.push({
                id: questions.length,
                text: `${a} - ${b} + ${c} = ?`,
                correctAnswer: a - b + c,
                durationSeconds: 0,
                startTimestamp: 0,
                endTimestamp: 0,
            });
        }
    }

    return shuffle(questions);
}

/** 多数相加：4~5个 10~99 的数连加 */
function generateMultiAdd(count: number): Question[] {
    const set = new Set<string>();
    const questions: Question[] = [];
    let attempts = 0;

    while (questions.length < count && attempts < count * 30) {
        attempts++;
        const n = randInt(4, 5);
        const nums: number[] = [];
        for (let i = 0; i < n; i++) {
            nums.push(randInt(10, 99));
        }
        const key = nums.join("+");
        if (set.has(key)) continue;
        set.add(key);
        const correctAnswer = nums.reduce((sum, v) => sum + v, 0);
        questions.push({
            id: questions.length,
            text: `${nums.join(" + ")} = ?`,
            correctAnswer,
            durationSeconds: 0,
            startTimestamp: 0,
            endTimestamp: 0,
        });
    }

    return shuffle(questions);
}

/** 混合加减：4~5个 10~99 的数，加减随机，保证任意中间步骤结果不为负 */
function generateMixedAddSub(count: number): Question[] {
    const set = new Set<string>();
    const questions: Question[] = [];
    let attempts = 0;

    while (questions.length < count && attempts < count * 50) {
        attempts++;
        const n = randInt(4, 5);
        const nums: number[] = [];
        const ops: string[] = [];

        // 从第一个正数开始
        let running = randInt(20, 99); // 初始值稍大以避免中间变负
        const parts: string[] = [String(running)];
        nums.push(running);
        ops.push("+"); // 占位

        for (let i = 1; i < n; i++) {
            const nextNum = randInt(10, 99);
            const useAdd = Math.random() < 0.5;

            if (useAdd) {
                running += nextNum;
                parts.push("+");
                parts.push(String(nextNum));
                nums.push(nextNum);
                ops.push("+");
            } else {
                // 减法需保证 running - nextNum >= 0
                if (running - nextNum < 0) {
                    // 强制换成加法
                    running += nextNum;
                    parts.push("+");
                    parts.push(String(nextNum));
                    nums.push(nextNum);
                    ops.push("+");
                } else {
                    running -= nextNum;
                    parts.push("-");
                    parts.push(String(nextNum));
                    nums.push(nextNum);
                    ops.push("-");
                }
            }
        }

        const key = parts.join("");
        if (set.has(key)) continue;
        set.add(key);

        questions.push({
            id: questions.length,
            text: `${parts.join(" ")} = ?`,
            correctAnswer: running,
            durationSeconds: 0,
            startTimestamp: 0,
            endTimestamp: 0,
        });
    }

    return shuffle(questions);
}

// ======== 统一导出 ========

const generators: Record<ModuleType, (count: number, seed: any) => Question[]> = {
    two_digit_add_sub: generateTwoDigitAddSub,
    make_hundred: generateMakeHundred,
    three_digit_add: generateThreeDigitAdd,
    three_digit_sub: generateThreeDigitSub,
    three_digit_mixed: generateThreeDigitMixed,
    multi_add: generateMultiAdd,
    mixed_add_sub: generateMixedAddSub,
};

export function generateQuestions(
    module: ModuleType,
    count: number,
    seed?: any,
): Question[] {
    const gen = generators[module];
    return gen(count, seed);
}
