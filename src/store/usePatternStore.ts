'use client';

import { patternService } from '@/lib/data/patterns';
import type { CreateInput, LifePattern, UpdateInput } from '@/types';
import { create } from 'zustand';

interface PatternStore {
  patterns: LifePattern[];
  isLoading: boolean;
  error: string | null;

  loadPatterns: () => Promise<void>;
  addPattern: (data: CreateInput<LifePattern>) => Promise<LifePattern>;
  updatePattern: (id: string, data: UpdateInput<LifePattern>) => Promise<void>;
  deletePattern: (id: string) => Promise<void>;
  getPatternById: (id: string) => LifePattern | undefined;
  clearError: () => void;
}

export const usePatternStore = create<PatternStore>((set, get) => ({
  patterns: [],
  isLoading: false,
  error: null,

  loadPatterns: async () => {
    set({ isLoading: true, error: null });
    try {
      const patterns = await patternService.getAll();
      set({ patterns, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '読み込みに失敗しました',
        isLoading: false,
      });
    }
  },

  addPattern: async (data) => {
    try {
      const newPattern = await patternService.create(data);
      set((state) => ({ patterns: [...state.patterns, newPattern] }));
      return newPattern;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '追加に失敗しました' });
      throw error;
    }
  },

  updatePattern: async (id, data) => {
    try {
      const updated = await patternService.update(id, data);
      set((state) => ({
        patterns: state.patterns.map((p) => (p.id === id ? updated : p)),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '更新に失敗しました' });
      throw error;
    }
  },

  deletePattern: async (id) => {
    try {
      await patternService.delete(id);
      set((state) => ({
        patterns: state.patterns.filter((p) => p.id !== id),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '削除に失敗しました' });
      throw error;
    }
  },

  getPatternById: (id) => get().patterns.find((p) => p.id === id),

  clearError: () => set({ error: null }),
}));
