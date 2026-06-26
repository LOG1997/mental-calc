import type { ModuleType } from '@/types';

export const MODULE_LABELS: Record<ModuleType, string> = {
    two_digit_add_sub: '两位数加减',
    make_hundred: '凑整百',
    three_digit_add: '三位数加法',
    three_digit_sub: '三位数减法',
    three_digit_mixed: '三位数加减混合',
    multi_add: '多数连加',
    mixed_add_sub: '混合加减',
};



export const STORAGE_KEY_CONFIG = 'mathConfig';
