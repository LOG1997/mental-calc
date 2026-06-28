import { useState, useCallback } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog"
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldTitle,
} from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { MODULE_LABELS, } from '@/constants/constant'
import type { ModuleType, QuestionCount } from '@/types'
import { useGlobalSettingStore } from '@/stores'
import { Settings } from 'lucide-react'

export function ToolBar() {
    const globalSettingStore = useGlobalSettingStore()
    const { module, questionCount, autoDone } = globalSettingStore.config

    const QUESTION_COUNT_OPTIONS: QuestionCount[] = [10, 15, 20, 30, 50, 100];
    const handleModuleChange = useCallback((currentModule: ModuleType) => {
        globalSettingStore.setModule(currentModule)
    }, [])
    const handleCountChange = useCallback((count: string) => {
        globalSettingStore.setQuestionCount(Number(count) as QuestionCount)
    }, [])
    return (
        <div className="mb-4 flex items-center justify-end gap-3">
            {/* 其他设置操作 */}
            <Dialog>
                <DialogTrigger asChild>
                    <Button size='icon' variant="ghost">
                        <Settings className="w-4 h-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>设置</DialogTitle>
                        <DialogDescription>
                            您的全局设置.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center gap-2">
                        <FieldGroup className="max-w-sm">
                            <Field orientation="horizontal">
                                <Checkbox
                                    id="terms-checkbox-2"
                                    name="terms-checkbox-2"
                                    defaultChecked={autoDone}
                                    onCheckedChange={(checked) => {
                                        globalSettingStore.setAutoDone(checked as boolean)
                                    }}
                                />
                                <FieldContent>
                                    <FieldLabel htmlFor="terms-checkbox-2">
                                        自动提交
                                    </FieldLabel>
                                    <FieldDescription>
                                        您输入与答案长度相等的答案后自动提交.
                                    </FieldDescription>
                                </FieldContent>
                            </Field>
                        </FieldGroup>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <DialogClose asChild>
                            <Button type="button">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* 选择答题类型 */}
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
            {/* 选择题量 */}
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
