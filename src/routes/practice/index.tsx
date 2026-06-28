import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useCallback, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { db } from "@/utils/db";
import type { ModuleType, QuestionCount, Question, HistoryRecord } from "@/types";
import { generateQuestions } from "@/utils/mathGenerator";
import { ToolBar } from './parts/-ToolBar'
import { useGlobalSettingStore, practiceStore, usePageStateStore } from '@/stores'
import { formatTime } from '@/utils/format'
import { ScoreDialog } from '@/routes/common-units/-ScoreDialog'
import Numpad from './parts/-Keyboard'
import { getIsMobile } from '@/utils/system'
import { toast } from 'sonner'
import { CircleX, CircleCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/practice/')({
    component: RouteComponent,

})

// ======== 常量 ========

const HOLD_DURATION_MS = 1000;
const HOLD_TICK_MS = 50;
const HOLD_TICK_INCREMENT = 100 / (HOLD_DURATION_MS / HOLD_TICK_MS);


function RouteComponent() {
    const isMobile = getIsMobile()
    const globalSettingStore = useGlobalSettingStore()
    const pageStateStore = usePageStateStore()
    const { module: currentModule, questionCount, autoDone } = globalSettingStore.config
    const currentPracticeStore = practiceStore[currentModule]()
    const { config: seedConfig } = currentPracticeStore

    // ======== 状态 ========
    const [questions, setQuestions] = useState<Question[]>(() =>
        generateQuestions(currentModule, questionCount, seedConfig),
    );
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<(string | undefined)[]>([]);
    const [isStarted, setIsStarted] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);
    const [holdProgress, setHoldProgress] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [endTime, setEndTime] = useState<number | null>(null);
    const [isFinished, setIsFinished] = useState(false);
    const [elapsedRealtime, setElapsedRealtime] = useState(0);
    const [amount, setAmount] = useState('')
    const [dialogVisible, setDialogVisible] = useState(false)
    const [finalResult, setFinalResult] = useState<HistoryRecord | null>(null)
    // ======== Refs ========
    const inputRef = useRef<HTMLInputElement>(null);
    const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const holdProgressRef = useRef(0);
    const longPressTriggeredRef = useRef(false);
    const startTimeRef = useRef<number | null>(null);
    const hasSavedRef = useRef(false);
    const cardRef = useRef<HTMLDivElement>(null);


    // ======== 派生值 ========
    const currentQuestion = questions[currentIndex];
    const totalQuestions = questions.length;
    const init = useCallback(() => {
        setCurrentIndex(0);
        setAnswers([]);
        hasSavedRef.current = false;
        setIsStarted(false);
        setIsFinished(false);
        setIsWaiting(false);
        setHoldProgress(0);
        holdProgressRef.current = 0;
        longPressTriggeredRef.current = false;
        setStartTime(null);
        startTimeRef.current = null;
        setEndTime(null);
        setElapsedRealtime(0);
        if (holdTimerRef.current) {
            clearInterval(holdTimerRef.current);
            holdTimerRef.current = null;
        }
    }, [])
    // ======== 重置并重新生成题库 ========
    const resetAndRegenerate = useCallback(
        (module: ModuleType, count: QuestionCount) => {
            setQuestions(generateQuestions(module, count, seedConfig));
            init()
        },
        [],
    );


    // ======== 提交答案 ========
    const submitAnswer = useCallback(() => {
        if (!inputRef.current) return;

        const rawAnswer = inputRef.current.value.trim();

        // 验证：非空且为数字
        if (rawAnswer === "" || !/^\d+$/.test(rawAnswer)) {
            toast.error("请输入有效的数字答案", { position: "top-center" })
            setAmount('')
            inputRef.current.focus();
            return;
        }
        // 判断答案是否正确
        const isCorrect = rawAnswer === currentQuestion.correctAnswer.toString();
        if (!isCorrect) {
            toast.error(<span className='test-red-400'>答案错误</span>, {
                duration: 2000,
                icon: <CircleX className='text-red-500 size-4' />,
                position: "bottom-right"
            })
        }
        if (isCorrect) {
            toast.success(<span className='test-green-400'>答案正确</span>, {
                duration: 2000,
                icon: <CircleCheck className='text-green-500 size-4' />,
                position: "bottom-center"
            })
        }
        // 记录答案
        const newAnswers = [...answers];
        newAnswers[currentIndex] = rawAnswer;
        setAnswers(newAnswers);

        const now = Date.now();
        questions[currentIndex].endTimestamp = now;
        questions[currentIndex].durationSeconds = Math.round(
            100 * ((questions[currentIndex].endTimestamp -
                questions[currentIndex].startTimestamp) /
                1000),
        ) / 100;
        // 判断是否最后一题
        if (currentIndex >= totalQuestions - 1) {
            setEndTime(now);
            setIsFinished(true);
        } else {

            setCurrentIndex((prev) => prev + 1);
        }

        // 清空输入框
        // inputRef.current.value = "";
        setAmount('')
    }, [answers, currentIndex, totalQuestions, amount]);

    useEffect(() => {
        if (isStarted && !isFinished) {
            const now = Date.now();
            questions[currentIndex].startTimestamp = now;
        }
        pageStateStore.setPracticeConfig({
            isStarted: isStarted || isWaiting,
        })
    }, [currentQuestion, isStarted, isFinished, isWaiting]);

    // ======== 键盘事件处理 ========

    const handleLongPressStart = () => {
        if (!isStarted && !isFinished) {
            setIsWaiting(true);
            holdProgressRef.current = 0;
            setHoldProgress(0);
            longPressTriggeredRef.current = false;

            holdTimerRef.current = setInterval(() => {
                holdProgressRef.current += HOLD_TICK_INCREMENT;
                const current = Math.min(holdProgressRef.current, 100);
                setHoldProgress(current);

                if (holdProgressRef.current >= 100) {
                    if (holdTimerRef.current) {
                        clearInterval(holdTimerRef.current);
                        holdTimerRef.current = null;
                    }
                    longPressTriggeredRef.current = true;
                    setHoldProgress(100);
                    setIsWaiting(false);
                    setIsStarted(true);
                    // 记录首次答题时间
                    if (startTimeRef.current === null) {
                        const now = Date.now();
                        startTimeRef.current = now;
                        setStartTime(now);
                    }
                }
            }, HOLD_TICK_MS);

            return;
        }
    }
    const handleLongPressEnd = () => {
        longPressTriggeredRef.current = false;
        if (holdTimerRef.current) {
            clearInterval(holdTimerRef.current);
            holdTimerRef.current = null;
            setHoldProgress(0);
            holdProgressRef.current = 0;
            setIsWaiting(false);
        }
    }
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== "Enter") return;
            if (e.repeat) return;

            e.preventDefault();
            // 场景一：未开始 → 开始长按计时
            handleLongPressStart();

            // 场景二：答题中 → 提交当前答案
            if (isStarted && !isFinished && !longPressTriggeredRef.current) {
                e.preventDefault();
                submitAnswer();
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key !== "Enter") return;
            handleLongPressEnd()
        };


        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        // isMobile && cardRef.current?.addEventListener("touchstart", handleCardTouchStart);
        // isMobile && cardRef.current?.addEventListener("touchend", handleCardTouchEnd);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            // isMobile && cardRef.current?.removeEventListener("touchstart", handleCardTouchStart);
            // isMobile && cardRef.current?.removeEventListener("touchend", handleCardTouchEnd);
            if (holdTimerRef.current) {
                clearInterval(holdTimerRef.current);
                holdTimerRef.current = null;
            }
        };
    }, [isStarted, isFinished, submitAnswer,]);

    // ======== 自动聚焦输入框 ========
    useEffect(() => {
        if (isStarted && !isFinished && inputRef.current) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [currentIndex, isStarted, isFinished]);

    // ======== 实时计时器 ========
    useEffect(() => {
        if (startTime === null || isFinished) {
            setElapsedRealtime(0);
            return;
        }
        const timer = setInterval(() => {
            setElapsedRealtime((Date.now() - startTime) / 1000);
        }, 100);
        return () => clearInterval(timer);
    }, [startTime, isFinished]);

    // ======== 答题完成后保存到 IndexedDB ========
    useEffect(() => {
        if (!isFinished || hasSavedRef.current) return;
        if (!startTimeRef.current || !endTime) return;

        hasSavedRef.current = true;

        const duration = (endTime - startTimeRef.current) / 1000;
        const correctCount = questions.filter(
            (q, i) => String(q.correctAnswer) === answers[i],
        ).length;
        const finalResultBlock = {
            module: currentModule,
            questionCount,
            startTime: startTimeRef.current,
            endTime,
            durationSeconds: Math.round(duration * 10) / 10,
            correctCount,
            totalCount: questions.length,
            details: questions.map((q, i) => ({
                id: q.id,
                questionText: q.text,
                userAnswer: answers[i] || "",
                correctAnswer: q.correctAnswer,
                isCorrect: String(q.correctAnswer) === (answers[i] || ""),
                startTimestamp: q.startTimestamp,
                endTimestamp: q.endTimestamp,
                durationSeconds: Math.round(100 * (q.endTimestamp - q.startTimestamp) / 1000) / 100,
            })),
            createdAt: Date.now(),
        }
        setFinalResult(finalResultBlock);
        db.historyRecords
            .add(finalResultBlock)
            .catch((err) => console.error("保存历史记录失败:", err))
            .finally(() => {
                init()
            });
        setDialogVisible(true)

    }, [isFinished]);

    // ======== 重新开始 ========
    const handleRestart = useCallback(() => {
        resetAndRegenerate(currentModule, questionCount);
        setDialogVisible(false)

    }, [currentModule, questionCount, resetAndRegenerate]);

    useEffect(() => {
        resetAndRegenerate(currentModule, questionCount);
    }, [currentModule, questionCount]);

    // ======== 是否显示模糊层 ========
    const showBlur = !isStarted && !isFinished;
    // 
    // 监听答案输入，满足条件自动提交
    useEffect(() => {
        if (!autoDone || !isStarted || currentIndex >= questions.length) {
            return
        }
        const correctAnswerStr = String(questions[currentIndex].correctAnswer);
        const userAnswerStr = amount;

        // 当用户输入的位数等于正确答案的位数时，自动提交
        if (userAnswerStr.length > 0 && userAnswerStr.length === correctAnswerStr.length) {
            console.log("位数匹配，自动提交", userAnswerStr)
            submitAnswer();
        }
    }, [currentIndex, isStarted, isFinished, submitAnswer, autoDone, amount]);

    // ======== 渲染 ========
    return (
        <>
            {/* ======== 主内容区 ======== */}
            <main className="mx-auto max-w-3xl px-4 py-2">
                {/* 选择器工具栏 */}
                {
                    !isStarted && (
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
                                            按住回车键不放...
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
                                        选择模块和题量后，长按回车键开始
                                    </div>
                                )}

                                {/* 算式展示 */}
                                {isStarted && (
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
                                            <p className="mt-2 text-center text-xs text-muted-foreground">
                                                输入答案后按回车键提交
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 未开始时占位提示 */}
                        {!isStarted && !isFinished && !isWaiting && (
                            <div ref={cardRef} onTouchStart={handleLongPressStart} onTouchEnd={handleLongPressEnd} className="py-16 text-center text-muted-foreground">
                                <p className="text-lg">🎯 准备好了吗？</p>
                                <p className="mt-2 text-sm">长按回车键开始答题</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>

            {/* ======== 长按浮层 ======== */}
            {isWaiting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-80 rounded-lg bg-white p-8 shadow-xl">
                        <p className="mb-4 text-center text-lg font-medium">
                            长按回车键开始答题
                        </p>
                        <Progress value={holdProgress} className="h-3" />
                        <p className="mt-3 text-center text-sm text-muted-foreground">
                            松开即取消
                        </p>
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


