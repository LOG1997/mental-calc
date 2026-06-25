import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, X } from "lucide-react";
import type { ModuleType, QuestionCount, Question } from "@/types";
import { generateQuestions } from "@/utils/mathGenerator";

// ======== 常量 ========

const MODULE_LABELS: Record<ModuleType, string> = {
  two_digit_add_sub: "两位数加减",
  make_hundred: "凑整百",
  three_digit_add: "三位数加法",
  three_digit_sub: "三位数减法",
  three_digit_mixed: "三位数加减混合",
  multi_add: "多数连加",
  mixed_add_sub: "混合加减",
};

const QUESTION_COUNT_OPTIONS: QuestionCount[] = [10, 15, 20, 30, 50, 100];

const HOLD_DURATION_MS = 1000;
const HOLD_TICK_MS = 50;
const HOLD_TICK_INCREMENT = 100 / (HOLD_DURATION_MS / HOLD_TICK_MS);

// ======== 组件 ========

export function MathGame() {
  // ======== 状态 ========
  const [currentModule, setCurrentModule] =
    useState<ModuleType>("two_digit_add_sub");
  const [questionCount, setQuestionCount] = useState<QuestionCount>(10);
  const [questions, setQuestions] = useState<Question[]>(() =>
    generateQuestions("two_digit_add_sub", 10),
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | undefined)[]>([]);
  const [isStarted, setIsStarted] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  // ======== Refs ========
  const inputRef = useRef<HTMLInputElement>(null);
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdProgressRef = useRef(0);
  const longPressTriggeredRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);

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
      setCurrentModule(module);
      setQuestionCount(count);
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
    },
    [],
  );

  // ======== 模块切换 ========
  const handleModuleChange = useCallback(
    (value: string) => {
      resetAndRegenerate(value as ModuleType, questionCount);
    },
    [questionCount, resetAndRegenerate],
  );

  // ======== 题量切换 ========
  const handleCountChange = useCallback(
    (value: string) => {
      const count = parseInt(value, 10) as QuestionCount;
      resetAndRegenerate(currentModule, count);
    },
    [currentModule, resetAndRegenerate],
  );

  // ======== 提交答案 ========
  const submitAnswer = useCallback(() => {
    if (!inputRef.current) return;

    const rawAnswer = inputRef.current.value.trim();

    // 验证：非空且为数字
    if (rawAnswer === "" || !/^\d+$/.test(rawAnswer)) {
      alert("请输入有效的数字答案");
      inputRef.current.value = "";
      inputRef.current.focus();
      return;
    }

    // 记录首次答题时间
    if (startTimeRef.current === null) {
      const now = Date.now();
      startTimeRef.current = now;
      setStartTime(now);
    }

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

    // 清空输入框（下一题会通过 effect 聚焦，但需要先清空值）
    inputRef.current.value = "";
  }, [answers, currentIndex, totalQuestions]);

  // ======== 键盘事件处理 ========
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log("按键", e);
      if (e.key !== " ") return;
      // 防止重复触发（按键保持时浏览器重复发送 keydown）
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
            // 长按完成
            if (holdTimerRef.current) {
              clearInterval(holdTimerRef.current);
              holdTimerRef.current = null;
            }
            longPressTriggeredRef.current = true;
            setHoldProgress(100);
            setIsWaiting(false);
            setIsStarted(true);
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
      if (e.key !== " ") return;

      // 重置长按触发标记
      longPressTriggeredRef.current = false;

      // 如果正在长按等待中，取消
      if (holdTimerRef.current) {
        clearInterval(holdTimerRef.current);
        holdTimerRef.current = null;
        setHoldProgress(0);
        holdProgressRef.current = 0;
        setIsWaiting(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      // 清理残留的 timer
      if (holdTimerRef.current) {
        clearInterval(holdTimerRef.current);
        holdTimerRef.current = null;
      }
    };
  }, [isStarted, isFinished, submitAnswer]);

  // ======== 自动聚焦输入框 ========
  useEffect(() => {
    if (isStarted && !isFinished && inputRef.current) {
      // 使用 setTimeout 确保 DOM 更新后再聚焦
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, isStarted, isFinished]);

  // ======== 重新开始（保留模块和题量） ========
  const handleRestart = useCallback(() => {
    resetAndRegenerate(currentModule, questionCount);
  }, [currentModule, questionCount, resetAndRegenerate]);

  // ======== 计算成绩 ========
  const correctCount = questions.filter(
    (q, i) => String(q.answer) === answers[i],
  ).length;

  const elapsedSeconds =
    startTime && endTime ? ((endTime - startTime) / 1000).toFixed(1) : "0.0";

  // ======== 是否显示模糊层 ========
  const showBlur = !isStarted && !isFinished;

  // ======== 渲染 ========
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ======== Header ======== */}
      <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold tracking-tight">🧮 速算练习</h1>
          <div className="flex items-center gap-3">
            {/* 模块选择 */}
            <Select value={currentModule} onValueChange={handleModuleChange}>
              <SelectTrigger className="w-[170px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MODULE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 题量选择 */}
            <Select
              value={String(questionCount)}
              onValueChange={handleCountChange}
            >
              <SelectTrigger className="w-[100px]">
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
        </div>
      </header>

      {/* ======== 主内容区 ======== */}
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Card className="relative overflow-hidden">
          {/* 模糊层 */}
          {showBlur && (
            <>
              <div className="pointer-events-none absolute inset-0 z-20 backdrop-blur-sm bg-white/30" />
              <div className="pointer-events-none absolute inset-0 z-20 opacity-50 bg-white" />
            </>
          )}

          <CardContent className="p-8">
            {/* 未开始 / 进行中的内容 */}
            {!isFinished && (
              <div className="space-y-6">
                {/* 长按进度条（等待开始）或 答题进度条 */}
                {isWaiting ? (
                  <div className="space-y-2">
                    <p className="text-center text-sm text-muted-foreground">
                      按住 Enter 键不放...
                    </p>
                    <Progress value={holdProgress} className="h-3" />
                  </div>
                ) : isStarted ? (
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
                ) : (
                  <div className="py-4 text-center text-muted-foreground">
                    选择模块和题量后，长按 Enter 键开始
                  </div>
                )}

                {/* 算式展示 */}
                {isStarted && currentQuestion && (
                  <div className="space-y-6">
                    <div className="rounded-lg bg-muted/50 p-6 text-center">
                      <span className="text-2xl font-bold tracking-wide">
                        {currentQuestion.text}
                      </span>
                    </div>

                    {/* 答案输入 */}
                    <div className="mx-auto max-w-xs">
                      <Input
                        ref={inputRef}
                        type="text"
                        inputMode="numeric"
                        placeholder="输入答案"
                        className="text-center text-lg"
                        autoComplete="off"
                      />
                      <p className="mt-2 text-center text-xs text-muted-foreground">
                        输入答案后按 Enter 提交
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 未开始时：空白占位提示 */}
            {!isStarted && !isFinished && !isWaiting && (
              <div className="py-16 text-center text-muted-foreground">
                <p className="text-lg">🎯 准备好了吗？</p>
                <p className="mt-2 text-sm">长按 Enter 键 3 秒开始答题</p>
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
              长按 Enter 键 3 秒开始答题
            </p>
            <Progress value={holdProgress} className="h-3" />
            <p className="mt-3 text-center text-sm text-muted-foreground">
              松开即取消
            </p>
          </div>
        </div>
      )}

      {/* ======== 成绩弹窗 ======== */}
      <Dialog open={isFinished} onOpenChange={() => {}}>
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
                <p className="text-2xl font-bold">{elapsedSeconds} 秒</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">正确率</p>
                <p className="text-2xl font-bold">
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
                      className={`flex items-center gap-3 px-3 py-2 text-sm ${
                        i % 2 === 0 ? "bg-muted/30" : ""
                      }`}
                    >
                      <span className="w-6 text-center text-muted-foreground">
                        {i + 1}
                      </span>
                      <span className="flex-1 font-mono">{q.text}</span>
                      <span
                        className={`w-20 text-right font-mono ${
                          isCorrect ? "text-green-600" : "text-red-600"
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
            <div className="flex justify-center pt-2">
              <Button onClick={handleRestart} size="lg">
                重新开始
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
