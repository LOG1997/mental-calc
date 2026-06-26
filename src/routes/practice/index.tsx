import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { db } from "@/utils/db";
import type { ModuleType, QuestionCount, Question } from "@/types";
import { generateQuestions } from "@/utils/mathGenerator";
import { ToolBar } from './parts/-ToolBar'
import { useGlobalSettingStore, practiceStore } from '@/stores'
import { formatTime } from '@/utils/format'
import { ScoreDialog } from './parts/-ScoreDialog'
import Numpad from './parts/-Keyboard'
import { getIsMobile } from '@/utils/system'

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
    const { module: currentModule, questionCount } = globalSettingStore.config
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

    // ======== 重置并重新生成题库 ========
    const resetAndRegenerate = useCallback(
        (module: ModuleType, count: QuestionCount) => {
            // 取消进行中的长按
            if (holdTimerRef.current) {
                clearInterval(holdTimerRef.current);
                holdTimerRef.current = null;
            }
            // 持久化配置
            hasSavedRef.current = false;
            setQuestions(generateQuestions(module, count));
            setCurrentIndex(0);
            setAnswers([]);
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
        },
        [],
    );


    // ======== 提交答案 ========
    const submitAnswer = useCallback(() => {
        if (!inputRef.current) return;

        const rawAnswer = inputRef.current.value.trim();

        // 验证：非空且为数字
        if (rawAnswer === "" || !/^\d+$/.test(rawAnswer)) {
            alert("请输入有效的数字答案");
            // inputRef.current.value = "";
            setAmount('')
            inputRef.current.focus();
            return;
        }

        // 记录首次答题时间
        // if (startTimeRef.current === null) {
        //   const now = Date.now();
        //   startTimeRef.current = now;
        //   setStartTime(now);
        // }

        // 记录答案
        const newAnswers = [...answers];
        newAnswers[currentIndex] = rawAnswer;
        setAnswers(newAnswers);

        // 判断是否最后一题
        if (currentIndex >= totalQuestions - 1) {
            const now = Date.now();
            setEndTime(now);
            setIsFinished(true);
        } else {
            setCurrentIndex((prev) => prev + 1);
        }

        // 清空输入框
        // inputRef.current.value = "";
        setAmount('')
        console.log('c重置ubmitAnswer', rawAnswer, amount)
    }, [answers, currentIndex, totalQuestions, amount]);

    // ======== 键盘事件处理 ========
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== "Enter") return;
            if (e.repeat) return;

            // 场景一：未开始 → 开始长按计时
            if (!isStarted && !isFinished) {
                e.preventDefault();
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

            // 场景二：答题中 → 提交当前答案
            if (isStarted && !isFinished && !longPressTriggeredRef.current) {
                e.preventDefault();
                submitAnswer();
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key !== "Enter") return;

            longPressTriggeredRef.current = false;

            if (holdTimerRef.current) {
                clearInterval(holdTimerRef.current);
                holdTimerRef.current = null;
                setHoldProgress(0);
                holdProgressRef.current = 0;
                setIsWaiting(false);
            }
        };

        const handleCardTouchStart = (e: TouchEvent) => {
            console.log('touchstart', e)
            if (!isStarted && !isFinished) {
                e.preventDefault();
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
        const handleCardTouchEnd = (e: TouchEvent) => {
            console.log('touchend', e)
            // alert('touchend')
            longPressTriggeredRef.current = false;

            if (holdTimerRef.current) {
                clearInterval(holdTimerRef.current);
                holdTimerRef.current = null;
                setHoldProgress(0);
                holdProgressRef.current = 0;
                setIsWaiting(false);
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        isMobile && cardRef.current?.addEventListener("touchstart", handleCardTouchStart);
        isMobile && cardRef.current?.addEventListener("touchend", handleCardTouchEnd);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            isMobile && cardRef.current?.removeEventListener("touchstart", handleCardTouchStart);
            isMobile && cardRef.current?.removeEventListener("touchend", handleCardTouchEnd);
            if (holdTimerRef.current) {
                clearInterval(holdTimerRef.current);
                holdTimerRef.current = null;
            }
        };
    }, [isStarted, isFinished, submitAnswer]);

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
            (q, i) => String(q.answer) === answers[i],
        ).length;

        db.historyRecords
            .add({
                module: currentModule,
                questionCount,
                startTime: startTimeRef.current,
                endTime,
                durationSeconds: Math.round(duration * 10) / 10,
                correctCount,
                totalCount: questions.length,
                details: questions.map((q, i) => ({
                    questionText: q.text,
                    userAnswer: answers[i] || "",
                    correctAnswer: q.answer,
                    isCorrect: String(q.answer) === (answers[i] || ""),
                })),
                createdAt: Date.now(),
            })
            .catch((err) => console.error("保存历史记录失败:", err));
    }, [isFinished]);

    // ======== 重新开始 ========
    const handleRestart = useCallback(() => {
        resetAndRegenerate(currentModule, questionCount);
    }, [currentModule, questionCount, resetAndRegenerate]);

    // ======== 计算成绩 ========
    const correctCount = questions.filter(
        (q, i) => String(q.answer) === answers[i],
    ).length;

    const finalElapsed =
        startTime && endTime ? ((endTime - startTime) / 1000).toFixed(1) : "0.0";

    // ======== 是否显示模糊层 ========
    const showBlur = !isStarted && !isFinished;

    // ======== 渲染 ========
    return (
        <>
            {/* ======== 主内容区 ======== */}
            <main className="mx-auto max-w-3xl px-4 py-2">
                {/* 选择器工具栏 */}
                <ToolBar />

                {/* 答题卡片 */}
                <Card className="relative overflow-hidden h-1/3">
                    {/* 模糊层 */}
                    {showBlur && (
                        <>
                            <div className="pointer-events-none absolute inset-0 z-20 backdrop-blur-sm bg-white/30" />
                            <div className="pointer-events-none absolute inset-0 z-20 opacity-50 bg-white" />
                        </>
                    )}

                    <CardContent className="p-2">
                        {!isFinished && (
                            <div className="space-y-6">
                                {/* 进度条区域 */}
                                {isWaiting ? (
                                    <div className="space-y-2">
                                        <p className="text-center text-sm text-muted-foreground">
                                            按住回车键不放...
                                        </p>
                                        <Progress value={holdProgress} className="h-3" />
                                    </div>
                                ) : isStarted ? (
                                    <div className="space-y-2">
                                        {/* 实时计时 */}
                                        <div className="text-center text-sm tabular-nums text-muted-foreground">
                                            ⏱ 已用时间: {formatTime(elapsedRealtime)}
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
                                                className="text-center text-lg"
                                                autoComplete="off"
                                                value={amount}
                                                readOnly={isMobile ? true : false}
                                                onChange={(e) => setAmount(e.target.value)}
                                            />
                                            <p className="mt-2 text-center text-xs text-muted-foreground">
                                                输入答案后按空格键提交
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 未开始时占位提示 */}
                        {!isStarted && !isFinished && !isWaiting && (
                            <div ref={cardRef} className="py-16 text-center text-muted-foreground">
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
            <ScoreDialog
                visible={isFinished}
                finalElapsed={finalElapsed}
                correctCount={correctCount}
                totalQuestions={totalQuestions}
                questions={questions}
                answers={answers}
                handleRestart={handleRestart}
            />
            {
                isMobile && <Numpad
                    value={amount}
                    onChange={(val) => { setAmount(val) }}
                    onConfirm={submitAnswer}
                    decimal={true}
                    maxLength={12}
                />
            }

        </>
    );
}
