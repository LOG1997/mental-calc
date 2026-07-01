import React from 'react'
import type { Question } from "@/types";
import { getIsMobile } from '@/utils/system'
import { Input } from "@/components/ui/input"

export default function MainCard(
    props: {
        currentQuestion: Question,
        currentIndex: number,
        amount: string,
        setAmount: React.Dispatch<React.SetStateAction<string>>,
        inputRef: React.RefObject<HTMLInputElement | null>,
    }
) {
    const { currentQuestion, currentIndex, amount, setAmount, inputRef } = props
    const isMobile = getIsMobile()
    return (
        <div className="space-y-6">
            <div className="rounded-lg bg-muted/50 p-6 text-center">
                <span className="text-2xl font-bold tracking-wide">
                    {currentQuestion.text}
                </span>
            </div>

            {/* 答案输入 */}
            <div className="mx-auto max-w-xs">
                <Input
                    key={`question-${currentIndex}`}
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    placeholder="输入答案"
                    className="text-center text-xl"
                    autoComplete="off"
                    value={amount}
                    readOnly={isMobile ? true : false}
                    onChange={(e) => setAmount(e.target.value)}
                />
                {
                    !isMobile && <p className="mt-2 text-center text-xs text-muted-foreground">
                        输入答案后按回车键提交
                    </p>
                }

            </div>
        </div>
    )
}
