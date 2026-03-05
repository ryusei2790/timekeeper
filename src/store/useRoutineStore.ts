'use client';

import { routineItemService } from '@/lib/data/routineItems';
import { routineItemToRecord, syncDelete, syncUpsert } from '@/lib/sync/writeThrough';
import { useAuthStore } from '@/store/useAuthStore';
import type { CreateInput, RoutineItem, UpdateInput } from '@/types';
import { create } from 'zustand';

interface RoutineStore {
  routineItems: RoutineItem[];
  isLoading: boolean;
  error: string | null;

  loadRoutineItems: () => Promise<void>;
  addRoutineItem: (data: CreateInput<RoutineItem>) => Promise<RoutineItem>;
  updateRoutineItem: (id: string, data: UpdateInput<RoutineItem>) => Promise<void>;
  deleteRoutineItem: (id: string) => Promise<void>;
  getRoutineItemById: (id: string) => RoutineItem | undefined;
  clearError: () => void;
}

export const useRoutineStore = create<RoutineStore>((set, get) => ({
  routineItems: [],
  isLoading: false,
  error: null,

  loadRoutineItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const routineItems = await routineItemService.getAll();
      set({ routineItems, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '読み込みに失敗しました',
        isLoading: false,
      });
    }
  },

  addRoutineItem: async (data) => {
    try {
      const newItem = await routineItemService.create(data);
      set((state) => ({ routineItems: [...state.routineItems, newItem] }));
      const user = useAuthStore.getState().user;
      if (user) {
        syncUpsert('routine_items', routineItemToRecord(newItem, user.id)).catch(console.warn);
      }
      return newItem;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '追加に失敗しました' });
      throw error;
    }
  },

  updateRoutineItem: async (id, data) => {
    try {
      const updated = await routineItemService.update(id, data);
      set((state) => ({
        routineItems: state.routineItems.map((item) => (item.id === id ? updated : item)),
      }));
      const user = useAuthStore.getState().user;
      if (user) {
        syncUpsert('routine_items', routineItemToRecord(updated, user.id)).catch(console.warn);
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '更新に失敗しました' });
      throw error;
    }
  },

  deleteRoutineItem: async (id) => {
    try {
      await routineItemService.delete(id);
      set((state) => ({
        routineItems: state.routineItems.filter((item) => item.id !== id),
      }));
      if (useAuthStore.getState().user) {
        syncDelete('routine_items', id).catch(console.warn);
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '削除に失敗しました' });
      throw error;
    }
  },

  getRoutineItemById: (id) => get().routineItems.find((item) => item.id === id),

  clearError: () => set({ error: null }),
}));
