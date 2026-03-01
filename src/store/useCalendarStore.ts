'use client';

import { calendarEventService } from '@/lib/data/calendarEvents';
import type { CalendarEvent } from '@/types';
import { create } from 'zustand';

interface CalendarStore {
  calendarEvents: CalendarEvent[];
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  lastSyncAt: string | null;

  loadCalendarEvents: () => void;
  getEventsByDate: (date: string) => CalendarEvent[];
  saveEvents: (events: CalendarEvent[]) => void;
  clearEvents: () => void;
  clearError: () => void;
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  calendarEvents: [],
  isLoading: false,
  isSyncing: false,
  error: null,
  lastSyncAt: null,

  loadCalendarEvents: () => {
    set({ isLoading: true, error: null });
    try {
      const calendarEvents = calendarEventService.getAll();
      set({ calendarEvents, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '読み込みに失敗しました',
        isLoading: false,
      });
    }
  },

  getEventsByDate: (date) => {
    return get().calendarEvents.filter((e) => e.startTime.startsWith(date));
  },

  saveEvents: (events) => {
    try {
      calendarEventService.upsertMany(events);
      const all = calendarEventService.getAll();
      set({ calendarEvents: all, lastSyncAt: new Date().toISOString() });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '保存に失敗しました' });
      throw error;
    }
  },

  clearEvents: () => {
    calendarEventService.clear();
    set({ calendarEvents: [] });
  },

  clearError: () => set({ error: null }),
}));
