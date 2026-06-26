import { useState, useCallback } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MODULE_LABELS, } from '@/constants/constant'
import type { ModuleType, QuestionCount } from '@/types'
import { useGlobalSettingStore } from '@/stores'

export function ToolBar() {
    const globalSettingStore = useGlobalSettingStore()
    const { module, questionCount } = globalSettingStore.config

    const QUESTION_COUNT_OPTIONS: QuestionCount[] = [10, 15, 20, 30, 50, 100];
    const handleModuleChange = useCallback((currentModule: ModuleType) => {
        globalSettingStore.setModule(currentModule)
    }, [])
    const handleCountChange = useCallback((count: string) => {
        globalSettingStore.setQuestionCount(Number(count) as QuestionCount)
    }, [])
    return (
        <div className="mb-4 flex items-center justify-end gap-3">
            <Select value={module} onValueChange={handleModuleChange}>
                <SelectTrigger className="w-42.5">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(MODULE_LABELS).map(([key, { name: label }]) => (
                        <SelectItem key={key} value={key}>
                            {label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={String(questionCount)}
                onValueChange={handleCountChange}
            >
                <SelectTrigger className="w-25">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {QUESTION_COUNT_OPTIONS.map((n) => (
                        <SelectItem key={n} value={String(n)}>
                            {n} 题
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
