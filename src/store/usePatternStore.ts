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
    console.log('[PatternStore] loadPatterns 開始');
    set({ isLoading: true, error: null });
    try {
      const patterns = await patternService.getAll();
      console.log(`[PatternStore] loadPatterns 完了: ${patterns.length}件`);
      set({ patterns, isLoading: false });
    } catch (error) {
      console.error('[PatternStore] loadPatterns 失敗:', error);
      set({
        error: error instanceof Error ? error.message : '読み込みに失敗しました',
        isLoading: false,
      });
    }
  },

  addPattern: async (data) => {
    console.log(`[PatternStore] addPattern: name="${data.name}"`);
    try {
      const newPattern = await patternService.create(data);
      set((state) => ({ patterns: [...state.patterns, newPattern] }));
      return newPattern;
    } catch (error) {
      console.error('[PatternStore] addPattern 失敗:', error);
      set({ error: error instanceof Error ? error.message : '追加に失敗しました' });
      throw error;
    }
  },

  updatePattern: async (id, data) => {
    console.log(`[PatternStore] updatePattern: id=${id}`);
    try {
      const updated = await patternService.update(id, data);
      set((state) => ({
        patterns: state.patterns.map((p) => (p.id === id ? updated : p)),
      }));
    } catch (error) {
      console.error('[PatternStore] updatePattern 失敗:', error);
      set({ error: error instanceof Error ? error.message : '更新に失敗しました' });
      throw error;
    }
  },

  deletePattern: async (id) => {
    console.log(`[PatternStore] deletePattern: id=${id}`);
    try {
      await patternService.delete(id);
      set((state) => ({
        patterns: state.patterns.filter((p) => p.id !== id),
      }));
    } catch (error) {
      console.error('[PatternStore] deletePattern 失敗:', error);
      set({ error: error instanceof Error ? error.message : '削除に失敗しました' });
      throw error;
    }
  },

  getPatternById: (id) => get().patterns.find((p) => p.id === id),

  clearError: () => set({ error: null }),
}));
