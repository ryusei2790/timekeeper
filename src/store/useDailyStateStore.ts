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
  loadDailyState: (date: string) => void;
  /** スケジュールアイテムのステータスを更新する */
  updateEventStatus: (eventId: string, status: EventStatus) => void;
  /** 遅延を記録する */
  recordDelay: (delay: DelayRecord) => void;
  /** 日次状態を保存する */
  saveDailyState: (state: Omit<DailyState, 'createdAt' | 'updatedAt'>) => void;
  /** スケジュールを更新する */
  updateSchedule: (schedule: ScheduleItem[]) => void;
  clearError: () => void;
}

export const useDailyStateStore = create<DailyStateStore>((set, get) => ({
  todayState: null,
  isLoading: false,
  error: null,

  loadDailyState: (date) => {
    set({ isLoading: true, error: null });
    try {
      const todayState = dailyStateService.getByDate(date);
      set({ todayState, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '読み込みに失敗しました',
        isLoading: false,
      });
    }
  },

  updateEventStatus: (eventId, status) => {
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
      const updated = dailyStateService.upsert({
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

  recordDelay: (delay) => {
    const current = get().todayState;
    if (!current) return;

    try {
      const updated = dailyStateService.upsert({
        ...current,
        delays: [...current.delays, delay],
      });
      set({ todayState: updated });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '遅延記録に失敗しました' });
    }
  },

  saveDailyState: (state) => {
    try {
      const saved = dailyStateService.upsert(state);
      set({ todayState: saved });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '保存に失敗しました' });
      throw error;
    }
  },

  updateSchedule: (schedule) => {
    const current = get().todayState;
    if (!current) return;

    try {
      const updated = dailyStateService.upsert({
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
