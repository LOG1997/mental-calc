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

/** 两位数加减：两个10~99的数，加减随机，减法确保被减数 >= 减数 */
function generateTwoDigitAddSub(count: number): Question[] {
    const set = new Set<string>();
    const questions: Question[] = [];
    let attempts = 0;

    while (questions.length < count && attempts < count * 20) {
        attempts++;
        const a = randInt(10, 99);
        const b = randInt(10, 99);
        const isAdd = Math.random() < 0.5;

        if (isAdd) {
            const key = `${a}+${b}`;
            if (set.has(key)) continue;
            set.add(key);
            questions.push({
                id: questions.length,
                text: `${a} + ${b} = ?`,
                answer: a + b,
            });
        } else {
            const [big, small] = a >= b ? [a, b] : [b, a];
            const key = `${big}-${small}`;
            if (set.has(key)) continue;
            set.add(key);
            questions.push({
                id: questions.length,
                text: `${big} - ${small} = ?`,
                answer: big - small,
            });
        }
    }

    return shuffle(questions);
}

/**
 * 凑整百（扩展版）
 * 目标数从 100, 200, 300, ..., 900 中随机选取，
 * 生成形如 "x + ? = 整百数" 的题目，其中 1 ≤ x ≤ 目标数-1。
 */
function generateMakeHundred(count: number): Question[] {
    // 所有可能的整百目标（100 ~ 900，步长100）
    const targets = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
    const questions: Question[] = [];

    for (let i = 0; i < count; i++) {
        // 随机选取一个目标整百数
        const target = targets[Math.floor(Math.random() * targets.length)];
        // 随机生成 x（1 到 target-1）
        const x = Math.floor(Math.random() * (target - 1)) + 1;
        questions.push({
            id: i,
            text: `${x} + ? = ${target}`,
            answer: target - x,
        });
    }

    return questions;
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
            answer: a + b,
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
            answer: big - small,
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
                answer: a + b - c,
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
                answer: a - b + c,
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
        const answer = nums.reduce((sum, v) => sum + v, 0);
        questions.push({
            id: questions.length,
            text: `${nums.join(" + ")} = ?`,
            answer,
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
            answer: running,
        });
    }

    return shuffle(questions);
}

// ======== 统一导出 ========

const generators: Record<ModuleType, (count: number) => Question[]> = {
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
): Question[] {
    const gen = generators[module];
    return gen(count);
}
