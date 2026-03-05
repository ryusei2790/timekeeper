'use client';

import { dailyStateService } from '@/lib/data/dailyState';
import type { DailyState, DelayRecord, EventStatus, ScheduleItem } from '@/types';
import { create } from 'zustand';

interface DailyStateStore {
  /** 今日の日次状態 */
  todayState: DailyState | null;
  isLoading: boolean;
  error: string | null;

  /** 指定日の状態を読み込む */
  loadDailyState: (date: string) => Promise<void>;
  /** スケジュールアイテムのステータスを更新する */
  updateEventStatus: (eventId: string, status: EventStatus) => Promise<void>;
  /** 遅延を記録する */
  recordDelay: (delay: DelayRecord) => Promise<void>;
  /** 日次状態を保存する */
  saveDailyState: (state: Omit<DailyState, 'createdAt' | 'updatedAt'>) => Promise<void>;
  /** スケジュールを更新する */
  updateSchedule: (schedule: ScheduleItem[]) => Promise<void>;
  clearError: () => void;
}

export const useDailyStateStore = create<DailyStateStore>((set, get) => ({
  todayState: null,
  isLoading: false,
  error: null,

  loadDailyState: async (date) => {
    console.log(`[DailyStateStore] loadDailyState(${date}) 開始`);
    set({ isLoading: true, error: null });
    try {
      const todayState = await dailyStateService.getByDate(date);
      console.log(
        `[DailyStateStore] loadDailyState(${date}) 完了: ${todayState ? `あり (schedule=${todayState.generatedSchedule.length}件)` : 'なし'}`
      );
      set({ todayState, isLoading: false });
    } catch (error) {
      console.error(`[DailyStateStore] loadDailyState(${date}) 失敗:`, error);
      set({
        error: error instanceof Error ? error.message : '読み込みに失敗しました',
        isLoading: false,
      });
    }
  },

  updateEventStatus: async (eventId, status) => {
    const current = get().todayState;
    if (!current) return;

    const updatedSchedule = current.generatedSchedule.map((item) =>
      item.id === eventId ? { ...item, status } : item
    );

    const completedEventIds =
      status === 'completed'
        ? [...new Set([...current.completedEventIds, eventId])]
        : current.completedEventIds.filter((id) => id !== eventId);

    const skippedEventIds =
      status === 'skipped'
        ? [...new Set([...current.skippedEventIds, eventId])]
        : current.skippedEventIds.filter((id) => id !== eventId);

    const activeEventId = status === 'active' ? eventId : current.activeEventId;

    try {
      const updated = await dailyStateService.upsert({
        ...current,
        generatedSchedule: updatedSchedule,
        completedEventIds,
        skippedEventIds,
        activeEventId,
      });
      set({ todayState: updated });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '更新に失敗しました' });
    }
  },

  recordDelay: async (delay) => {
    const current = get().todayState;
    if (!current) return;

    try {
      const updated = await dailyStateService.upsert({
        ...current,
        delays: [...current.delays, delay],
      });
      set({ todayState: updated });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '遅延記録に失敗しました' });
    }
  },

  saveDailyState: async (state) => {
    console.log(
      `[DailyStateStore] saveDailyState(${state.date}) → patternId=${state.patternId}, schedule=${state.generatedSchedule.length}件`
    );
    try {
      const saved = await dailyStateService.upsert(state);
      set({ todayState: saved });
    } catch (error) {
      console.error(`[DailyStateStore] saveDailyState(${state.date}) 失敗:`, error);
      set({ error: error instanceof Error ? error.message : '保存に失敗しました' });
      throw error;
    }
  },

  updateSchedule: async (schedule) => {
    const current = get().todayState;
    if (!current) return;

    try {
      const updated = await dailyStateService.upsert({
        ...current,
        generatedSchedule: schedule,
      });
      set({ todayState: updated });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'スケジュール更新に失敗しました' });
    }
  },

  clearError: () => set({ error: null }),
}));
