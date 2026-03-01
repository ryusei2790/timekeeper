import { dailyStatesStorage } from '@/lib/storage';
import { now } from '@/lib/utils/id';
import type { DailyState } from '@/types';

/**
 * DailyState エンティティのサービス
 * 日付をキーとして管理（1日1レコード）
 */
export const dailyStateService = {
  /**
   * 全ての日次状態を取得する
   */
  getAll(): DailyState[] {
    return dailyStatesStorage.get() ?? [];
  },

  /**
   * 特定の日付の状態を取得する
   * @param date YYYY-MM-DD 形式の日付
   */
  getByDate(date: string): DailyState | null {
    return this.getAll().find((state) => state.date === date) ?? null;
  },

  /**
   * 日次状態を作成または更新する（Upsert）
   * @param data createdAt・updatedAt を除いたデータ
   */
  upsert(data: Omit<DailyState, 'createdAt' | 'updatedAt'>): DailyState {
    const states = this.getAll();
    const index = states.findIndex((s) => s.date === data.date);

    if (index === -1) {
      const newState: DailyState = {
        ...data,
        createdAt: now(),
        updatedAt: now(),
      };
      dailyStatesStorage.set([...states, newState]);
      return newState;
    } else {
      const updated: DailyState = {
        ...states[index],
        ...data,
        updatedAt: now(),
      };
      states[index] = updated;
      dailyStatesStorage.set(states);
      return updated;
    }
  },

  /**
   * 特定の日付の状態を削除する
   * @param date YYYY-MM-DD 形式の日付
   */
  deleteByDate(date: string): void {
    const states = this.getAll().filter((s) => s.date !== date);
    dailyStatesStorage.set(states);
  },

  /**
   * 古いデータを削除する（LocalStorage 容量管理）
   * @param keepDays 保持する日数（デフォルト: 30日）
   */
  cleanup(keepDays: number = 30): void {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - keepDays);
    const cutoffStr = cutoff.toISOString().split('T')[0];

    const states = this.getAll().filter((s) => s.date >= cutoffStr);
    dailyStatesStorage.set(states);
  },
};
