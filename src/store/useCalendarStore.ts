'use client';

import { calendarEventService } from '@/lib/data/calendarEvents';
import { getSupabaseClient } from '@/lib/supabase/client';
import { calendarEventToRecord, syncUpsert } from '@/lib/sync/writeThrough';
import { useAuthStore } from '@/store/useAuthStore';
import type { CalendarEvent } from '@/types';
import { create } from 'zustand';

interface CalendarStore {
  calendarEvents: CalendarEvent[];
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  lastSyncAt: string | null;

  loadCalendarEvents: () => Promise<void>;
  getEventsByDate: (date: string) => CalendarEvent[];
  saveEvents: (events: CalendarEvent[]) => Promise<void>;
  clearEvents: () => Promise<void>;
  clearError: () => void;
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  calendarEvents: [],
  isLoading: false,
  isSyncing: false,
  error: null,
  lastSyncAt: null,

  loadCalendarEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const calendarEvents = await calendarEventService.getAll();
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

  saveEvents: async (events) => {
    try {
      await calendarEventService.upsertMany(events);
      const all = await calendarEventService.getAll();
      set({ calendarEvents: all, lastSyncAt: new Date().toISOString() });
      const user = useAuthStore.getState().user;
      if (user) {
        events.forEach((e) =>
          syncUpsert('calendar_events', calendarEventToRecord(e, user.id)).catch(console.warn)
        );
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '保存に失敗しました' });
      throw error;
    }
  },

  clearEvents: async () => {
    await calendarEventService.clear();
    set({ calendarEvents: [] });
    const supabase = getSupabaseClient();
    const user = useAuthStore.getState().user;
    if (supabase && user) {
      supabase
        .from('calendar_events')
        .delete()
        .eq('user_id', user.id)
        .then((res: { error: { message: string } | null }) => {
          if (res.error)
            console.warn('[CalendarStore] calendar_events clear 失敗:', res.error.message);
        });
    }
  },

  clearError: () => set({ error: null }),
}));
