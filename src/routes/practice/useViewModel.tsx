import React, { useEffect, useRef, useCallback, useState } from "react";
import { db } from "@/utils/db";
import type { ModuleType, QuestionCount, Question, HistoryRecord } from "@/types";
import { generateQuestions } from "@/utils/mathGenerator";
import { useGlobalSettingStore, practiceStore, usePageStateStore } from '@/stores'
import { getIsMobile } from '@/utils/system'
import { toast } from 'sonner'
import { CircleX, CircleCheck } from 'lucide-react'

const HOLD_DURATION_MS = 1000;
const HOLD_TICK_MS = 50;
const HOLD_TICK_INCREMENT = 100 / (HOLD_DURATION_MS / HOLD_TICK_MS);


export const useViewModel = (props: {
    inputRef: React.RefObject<HTMLInputElement | null>
}) => {
    const { inputRef } = props
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
    const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const holdProgressRef = useRef(0);
    const longPressTriggeredRef = useRef(false);
    const startTimeRef = useRef<number | null>(null);
    const hasSavedRef = useRef(false);

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
            toast.error(<span className='test-red-400' > 答案错误 </span>, {
                duration: 2000,
                icon: <CircleX className='text-red-500 size-4' />,
                position: "top-center"
            })
        }
        if (isCorrect) {
            toast.success(<span className='test-green-400' > 答案正确 </span>, {
                duration: 2000,
                icon: <CircleCheck className='text-green-500 size-4' />,
                position: "top-center"
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
    }, [currentModule, questionCount, resetAndRegenerate, seedConfig]);

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
    return {
        isStarted,
        isWaiting,
        isMobile,
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
    }
}