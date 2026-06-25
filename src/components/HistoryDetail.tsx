import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowLeft } from "lucide-react";
import { db } from "@/db";
import { MODULE_LABELS } from "@/lib/constants";
import type { HistoryRecord } from "@/types";

export function HistoryDetail() {
  const { id } = useParams({ from: "/history/$id" });
  const [record, setRecord] = useState<HistoryRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    db.historyRecords
      .get(numId)
      .then((r) => {
        if (r) {
          setRecord(r);
        } else {
          setNotFound(true);
        }
      })
      .catch((err) => {
        console.error("读取记录详情失败:", err);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>加载中...</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (notFound || !record) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg text-muted-foreground">😕 记录不存在</p>
            <p className="mt-2 text-sm text-muted-foreground">
              该记录可能已被删除，或 ID 无效。
            </p>
            <Link
              to="/history"
              className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
            >
              返回列表
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {/* 返回按钮 */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => navigate({ to: "/history" })}
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        返回列表
      </Button>

      {/* 概要信息 */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="mb-4 text-lg font-bold">📊 答题概要</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
            <div>
              <span className="text-muted-foreground">模块：</span>
              <span className="font-medium">
                {MODULE_LABELS[record.module] ?? record.module}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">题量：</span>
              <span className="font-medium">{record.questionCount} 题</span>
            </div>
            <div>
              <span className="text-muted-foreground">用时：</span>
              <span className="font-medium tabular-nums">
                {record.durationSeconds} 秒
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">正确：</span>
              <span
                className={`font-medium tabular-nums ${
                  record.correctCount === record.totalCount
                    ? "text-green-600"
                    : ""
                }`}
              >
                {record.correctCount} / {record.totalCount}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">正确率：</span>
              <span className="font-medium tabular-nums">
                {Math.round((record.correctCount / record.totalCount) * 100)}%
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">完成时间：</span>
              <span className="font-medium tabular-nums">
                {new Date(record.createdAt).toLocaleString("zh-CN")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 逐题批改 */}
      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 text-lg font-bold">📝 逐题批改</h3>
          <div className="space-y-1 rounded-lg border">
            {record.details.map((d, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-3 py-2 text-sm ${
                  i % 2 === 0 ? "bg-muted/30" : ""
                }`}
              >
                <span className="w-6 text-center tabular-nums text-muted-foreground">
                  {i + 1}
                </span>
                <span className="flex-1 font-mono text-xs sm:text-sm">
                  {d.questionText}
                </span>
                <span
                  className={`w-20 text-right font-mono text-xs sm:text-sm ${
                    d.isCorrect ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {d.userAnswer || "—"}
                </span>
                <span className="w-20 text-right font-mono text-xs text-muted-foreground sm:text-sm">
                  {d.correctAnswer}
                </span>
                <span className="w-6">
                  {d.isCorrect ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
