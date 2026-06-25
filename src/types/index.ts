export interface Question {
  id: number;
  text: string;        // 展示给用户的算式，如 "34 + 56 = ?"
  answer: number;      // 标准答案
  userAnswer?: string; // 用户输入
}

export type ModuleType =
  | 'two_digit_add_sub'
  | 'make_hundred'
  | 'three_digit_add'
  | 'three_digit_sub'
  | 'three_digit_mixed'
  | 'multi_add'
  | 'mixed_add_sub';

export type QuestionCount = 10 | 15 | 20 | 30 | 50 | 100;

export type ModuleLabel = Record<ModuleType, string>;

// ======== 历史记录类型 ========

export interface HistoryDetail {
  questionText: string;
  userAnswer: string;
  correctAnswer: number;
  isCorrect: boolean;
}

export interface HistoryRecord {
  id?: number;
  module: ModuleType;
  questionCount: number;
  startTime: number;
  endTime: number;
  durationSeconds: number;
  correctCount: number;
  totalCount: number;
  details: HistoryDetail[];
  createdAt: number;
}
