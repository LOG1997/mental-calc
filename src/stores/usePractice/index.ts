import { MODULE_LABELS } from '@/constants/constant';
import { useTwoDigitAddSubStore } from './useTwoDigitAddSub'
import { useMakeHundredStore } from './useMakeHundred'
import { useAddSubLastDigitStore } from './useAddSubLastDigit'
import { useMultiFormulaStore } from './useMultiFormula'

export const practiceStore = {
    // MODULE_LABELS中的key值对应store，不是value
    [MODULE_LABELS.two_digit_add_sub.value]: useTwoDigitAddSubStore,
    [MODULE_LABELS.make_hundred.value]: useMakeHundredStore,
    [MODULE_LABELS.three_digit_add.value]: useTwoDigitAddSubStore,
    [MODULE_LABELS.three_digit_sub.value]: useTwoDigitAddSubStore,
    [MODULE_LABELS.three_digit_mixed.value]: useTwoDigitAddSubStore,
    [MODULE_LABELS.multi_add.value]: useTwoDigitAddSubStore,
    [MODULE_LABELS.mixed_add_sub.value]: useTwoDigitAddSubStore,
    [MODULE_LABELS.add_sub_last_digit.value]: useAddSubLastDigitStore,
    [MODULE_LABELS.multi_formula.value]: useMultiFormulaStore,
}