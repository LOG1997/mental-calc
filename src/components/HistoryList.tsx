import { useState, useEffect } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db";
import { MODULE_LABELS } from "@/lib/constants";
import type { HistoryRecord } from "@/types";

export function HistoryList() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    db.historyRecords
      .orderBy("createdAt")
      .reverse()
      .toArray()
      .then(setRecords)
      .catch((err) => {
        console.error("读取历史记录失败:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">📋 历史记录</h2>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>加载中...</p>
          </CardContent>
        </Card>
      ) : records.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="text-lg">📭 暂无历史记录</p>
            <p className="mt-2 text-sm">
              完成一次答题后，记录将自动保存到这里。
            </p>
            <Link
              to="/"
              className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
            >
              去练习
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">#</th>
                    <th className="px-4 py-3 text-left font-medium">模块</th>
                    <th className="px-4 py-3 text-left font-medium">题量</th>
                    <th className="px-4 py-3 text-left font-medium">正确率</th>
                    <th className="px-4 py-3 text-left font-medium">用时</th>
                    <th className="px-4 py-3 text-left font-medium">
                      完成时间
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr
                      key={r.id}
                      className="cursor-pointer border-b transition-colors hover:bg-muted/30"
                      onClick={() =>
                        navigate({
                          to: "/mental-calc/history/$id",
                          params: { id: String(r.id) },
                        })
                      }
                    >
                      <td className="px-4 py-3 text-muted-foreground">
                        {i + 1}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {MODULE_LABELS[r.module] ?? r.module}
                      </td>
                      <td className="px-4 py-3">{r.questionCount} 题</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            r.correctCount === r.totalCount
                              ? "font-semibold text-green-600"
                              : ""
                          }
                        >
                          {r.correctCount}/{r.totalCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {r.durationSeconds} 秒
                      </td>
                      <td className="px-4 py-3 tabular-nums text-muted-foreground">
                        {new Date(r.createdAt).toLocaleString("zh-CN", {
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
