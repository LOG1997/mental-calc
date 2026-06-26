import React from 'react'
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useNavigate } from "@tanstack/react-router"
import type { Question } from "@/types"

export function ScoreDialog(props: { visible: boolean, finalElapsed: string, correctCount: number, totalQuestions: number, questions: Question[], answers: (string | undefined)[], handleRestart: () => void }) {
    const navigate = useNavigate()
    const { visible, finalElapsed, correctCount, totalQuestions, questions, answers, handleRestart } = props
    return (
        <Dialog open={visible} onOpenChange={() => { }}>
            <DialogContent
                className="max-h-[85vh] max-w-xl overflow-y-auto"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="text-center text-xl">
                        🎉 答题完成！
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* 成绩摘要 */}
                    <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">总耗时</p>
                            <p className="text-2xl font-bold tabular-nums">
                                {finalElapsed} 秒
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">正确率</p>
                            <p className="text-2xl font-bold tabular-nums">
                                {correctCount} / {totalQuestions}
                            </p>
                        </div>
                    </div>

                    {/* 逐题批改 */}
                    <div className="space-y-2">
                        <h3 className="font-medium">逐题批改</h3>
                        <div className="max-h-60 space-y-1 overflow-y-auto rounded-lg border">
                            {questions.map((q, i) => {
                                const userAns = answers[i] || "";
                                const isCorrect = String(q.answer) === userAns;
                                return (
                                    <div
                                        key={q.id}
                                        className={`flex items-center gap-3 px-3 py-2 text-sm ${i % 2 === 0 ? "bg-muted/30" : ""
                                            }`}
                                    >
                                        <span className="w-6 text-center tabular-nums text-muted-foreground">
                                            {i + 1}
                                        </span>
                                        <span className="flex-1 font-mono">{q.text}</span>
                                        <span
                                            className={`w-20 text-right font-mono ${isCorrect ? "text-green-600" : "text-red-600"
                                                }`}
                                        >
                                            {userAns || "—"}
                                        </span>
                                        <span className="w-20 text-right font-mono text-muted-foreground">
                                            {q.answer}
                                        </span>
                                        <span className="w-6">
                                            {isCorrect ? (
                                                <Check className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <X className="h-4 w-4 text-red-500" />
                                            )}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex justify-center gap-3 pt-2">
                        <Button onClick={handleRestart} size="lg">
                            重新开始
                        </Button>
                        <Button
                            onClick={() => navigate({ to: "/history" })}
                            variant="outline"
                            size="lg"
                        >
                            查看历史
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
