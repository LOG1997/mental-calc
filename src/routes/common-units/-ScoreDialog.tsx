import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useNavigate } from "@tanstack/react-router"

export function ScoreDialog(props: { visible: boolean, setVisible: (visible: boolean) => void, finalElapsed: string, correctCount: number, totalQuestions: number, questions: any[], answers: (string | undefined)[], handleRestart?: () => void }) {
    const navigate = useNavigate()
    const { visible, setVisible, finalElapsed, correctCount, totalQuestions, questions, answers, handleRestart } = props
    const handleClose = (e: any) => {
        e.preventDefault()
        setVisible(false)
    }
    return (
        <Dialog open={visible} onOpenChange={() => { }}>
            <DialogContent
                className="max-h-[85vh] overflow-y-auto w-full"
                onInteractOutside={(e) => handleClose(e)}
                onEscapeKeyDown={(e) => handleClose(e)}
                showCloseButton={false}
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
                                const correctAnswer = String(q.correctAnswer);
                                const isCorrect = String(q.correctAnswer) === userAns;
                                return (
                                    <div
                                        key={q.id}
                                        className={`flex items-center gap-3 px-3 py-2 text-sm ${i % 2 === 0 ? "bg-muted/30" : ""
                                            }`}
                                    >
                                        <span className="w-6 text-center tabular-nums text-muted-foreground">
                                            {i + 1}
                                        </span>
                                        <span className="flex-1 flex-nowrap text-nowrap font-mono">{q.questionText}</span>
                                        <span
                                            className={`w-8 text-right font-mono ${isCorrect ? "text-green-600" : "text-red-600"
                                                }`}
                                        >
                                            {correctAnswer || "—"}
                                        </span>
                                        <span
                                            className={`w-6 text-right font-mono ${isCorrect ? "text-green-600" : "text-red-600"
                                                }`}
                                        >
                                            {userAns || "—"}
                                        </span>
                                        <span className="w-2">
                                            {isCorrect ? (
                                                <Check className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <X className="h-4 w-4 text-red-500" />
                                            )}
                                        </span>
                                        <span className="w-14">
                                            <span className="text-muted-foreground">{q.durationSeconds} 秒</span>
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex justify-center gap-3 pt-2">

                        {
                            handleRestart ? (
                                <Button onClick={handleRestart} size="lg">
                                    重新开始
                                </Button>
                            ) : (
                                <Button onClick={handleClose} size="lg">
                                    关闭
                                </Button>
                            )
                        }

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
