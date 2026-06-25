import Dexie, { type Table } from 'dexie';
import type { HistoryRecord } from '@/types';

/**
 * IndexedDB 数据库封装
 * 表 historyRecords: 自增主键 id，索引 createdAt 用于排序
 */
class MathHistoryDB extends Dexie {
  historyRecords!: Table<HistoryRecord, number>;

  constructor() {
    super('MathHistoryDB');
    this.version(1).stores({
      historyRecords: '++id, createdAt, module',
    });
  }
}

export const db = new MathHistoryDB();
