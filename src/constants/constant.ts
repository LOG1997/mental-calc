import type { ModuleType } from '@/types';

export const MODULE_LABELS: Record<ModuleType, { name: string; value: ModuleType }> = {
    two_digit_add_sub:
    {
        name: '两位数加减',
        value: 'two_digit_add_sub',
    },
    make_hundred: {
        name: '凑整百',
        value: 'make_hundred',
    },
    three_digit_add: {
        name: '三位数加法',
        value: 'three_digit_add',
    },
    three_digit_sub: {
        name: '三位数减法',
        value: 'three_digit_sub',
    },
    three_digit_mixed: {
        name: '三位数加减混合',
        value: 'three_digit_mixed',
    },
    multi_add: {
        name: '多数连加',
        value: 'multi_add',
    },
    mixed_add_sub: {
        name: '混合加减',
        value: 'mixed_add_sub',
    },
    add_sub_last_digit: {
        name: '加减法末位判断',
        value: 'add_sub_last_digit',
    },
    multi_formula: {
        name: '乘法口诀',
        value: 'multi_formula',
    },
}



export const STORAGE_KEY_CONFIG = 'mathConfig';
