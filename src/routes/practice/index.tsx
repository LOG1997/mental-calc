import { createFileRoute } from '@tanstack/react-router'
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ToolBar } from './parts/-ToolBar'
import { formatTime } from '@/utils/format'
import { ScoreDialog } from '@/routes/common-units/-ScoreDialog'
import Numpad from './parts/-Keyboard'
import { Button } from '@/components/ui/button'
import MainCard from './parts/-MainCard'
import { useViewModel } from './useViewModel'

export const Route = createFileRoute('/practice/')({
    component: RouteComponent,
})

function RouteComponent() {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const {
        isMobile,
        isStarted,
        isWaiting,
        showBlur,
        isFinished,
        holdProgress,
        handleRestart,
        elapsedRealtime,
        currentIndex,
        totalQuestions,
        questions,
        amount,
        setAmount,
        handleLongPressStart,
        handleLongPressEnd,
        dialogVisible,
        finalResult,
        setDialogVisible,
        submitAnswer
    } = useViewModel({
        inputRef,
    })
    // ======== 渲染 ========
    return (
        <>
            {/* ======== 主内容区 ======== */}
            <main className="mx-auto max-w-3xl px-4 py-2">
                {/* 选择器工具栏 */}
                {
                    (!isStarted && !isWaiting) && (
                        <ToolBar />
                    )
                }

                {/* 答题卡片 */}
                <Card className="relative overflow-hidden h-1/3">
                    {/* 模糊层 */}
                    {showBlur && (
                        <>
                            <div className="pointer-events-none absolute inset-0 z-20 backdrop-blur-sm bg-white/30" />
                            <div className="pointer-events-none absolute inset-0 z-20 opacity-50 bg-white" />
                        </>
                    )}

                    <CardContent className="p-2 h-60">
                        {!isFinished && (
                            <div className="space-y-6">
                                {/* 进度条区域 */}
                                {isWaiting ? (
                                    <div className="space-y-2 h-full">
                                        <p className="text-center text-sm text-muted-foreground">
                                            按住
                                            {
                                                !isMobile && <span>回车键</span>
                                            }
                                            不放...
                                        </p>
                                        <Progress value={holdProgress} className="h-3" />
                                    </div>
                                ) : isStarted ? (
                                    <div className="space-y-2">
                                        <Button className='absolute top-2 right-2' onClick={handleRestart}>重开</Button>
                                        {/* 实时计时 */}
                                        <div className="text-center text-sm tabular-nums text-muted-foreground">
                                            <p>
                                                ⏱ 已用时间: {formatTime(elapsedRealtime)}
                                            </p>
                                        </div>
                                        {/* 进度条 */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-sm text-muted-foreground">
                                                <span>
                                                    第 {currentIndex + 1} 题 / 共 {totalQuestions} 题
                                                </span>
                                                <span>
                                                    {Math.round(
                                                        ((currentIndex + 1) / totalQuestions) * 100,
                                                    )}
                                                    %
                                                </span>
                                            </div>
                                            <Progress
                                                value={((currentIndex + 1) / totalQuestions) * 100}
                                                className="h-2"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-4 text-center text-muted-foreground">
                                        选择模块和题量后，长按
                                        {
                                            !isMobile && <span>回车键</span>
                                        }
                                        开始
                                    </div>
                                )}

                                {/* 算式展示 */}
                                {isStarted && (
                                    <MainCard
                                        currentQuestion={questions[currentIndex]}
                                        currentIndex={currentIndex}
                                        amount={amount}
                                        setAmount={setAmount}
                                        inputRef={inputRef}
                                    />
                                )}
                            </div>
                        )}

                        {/* 未开始时占位提示 */}
                        {!isStarted && !isFinished && !isWaiting && (
                            <div onTouchStart={handleLongPressStart} onTouchEnd={handleLongPressEnd} className="py-16 text-center text-muted-foreground absolute inset-0 flex items-center justify-center z-50">
                                <p className="text-lg">🎯 准备好了吗？</p>
                                <p className="mt-2 text-sm">长按
                                    {
                                        !isMobile && <span>回车键</span>
                                    }
                                    开始答题</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>

            {/* ======== 长按浮层 ======== */}
            {isWaiting && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="w-80 rounded-lg bg-white p-8 shadow-xl">
                        <p className="mb-4 text-center text-lg font-medium">
                            长按
                            {
                                !isMobile && <span>回车键</span>
                            }

                            开始答题
                        </p>
                        <Progress value={holdProgress} className="h-3" />
                        {
                            !isMobile && (
                                <p className="mt-3 text-center text-sm text-muted-foreground">
                                    松开即取消
                                </p>
                            )
                        }

                    </div>
                </div>
            )}

            {/* ======== 成绩弹窗 ======== */}
            {dialogVisible && finalResult && <ScoreDialog
                visible={dialogVisible}
                setVisible={setDialogVisible}
                finalElapsed={finalResult.durationSeconds.toString()}
                correctCount={finalResult.correctCount}
                totalQuestions={finalResult.totalCount}
                questions={finalResult.details}
                answers={finalResult.details.map((item) => item.userAnswer)}
                handleRestart={handleRestart}
            />}
            {
                isMobile && <Numpad
                    value={amount}
                    onChange={(val) => {
                        if (!isStarted) {
                            return
                        }
                        setAmount(val)
                    }}
                    onConfirm={submitAnswer}
                    decimal={true}
                    maxLength={12}
                />
            }

        </>
    );
}


