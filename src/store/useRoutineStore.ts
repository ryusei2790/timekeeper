'use client';

import { routineItemService } from '@/lib/data/routineItems';
import type { CreateInput, RoutineItem, UpdateInput } from '@/types';
import { create } from 'zustand';

interface RoutineStore {
  routineItems: RoutineItem[];
  isLoading: boolean;
  error: string | null;

  loadRoutineItems: () => void;
  addRoutineItem: (data: CreateInput<RoutineItem>) => RoutineItem;
  updateRoutineItem: (id: string, data: UpdateInput<RoutineItem>) => void;
  deleteRoutineItem: (id: string) => void;
  getRoutineItemById: (id: string) => RoutineItem | undefined;
  clearError: () => void;
}

export const useRoutineStore = create<RoutineStore>((set, get) => ({
  routineItems: [],
  isLoading: false,
  error: null,

  loadRoutineItems: () => {
    set({ isLoading: true, error: null });
    try {
      const routineItems = routineItemService.getAll();
      set({ routineItems, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '読み込みに失敗しました',
        isLoading: false,
      });
    }
  },

  addRoutineItem: (data) => {
    try {
      const newItem = routineItemService.create(data);
      set((state) => ({ routineItems: [...state.routineItems, newItem] }));
      return newItem;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '追加に失敗しました' });
      throw error;
    }
  },

  updateRoutineItem: (id, data) => {
    try {
      const updated = routineItemService.update(id, data);
      set((state) => ({
        routineItems: state.routineItems.map((item) => (item.id === id ? updated : item)),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '更新に失敗しました' });
      throw error;
    }
  },

  deleteRoutineItem: (id) => {
    try {
      routineItemService.delete(id);
      set((state) => ({
        routineItems: state.routineItems.filter((item) => item.id !== id),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '削除に失敗しました' });
      throw error;
    }
  },

  getRoutineItemById: (id) => get().routineItems.find((item) => item.id === id),

  clearError: () => set({ error: null }),
}));
