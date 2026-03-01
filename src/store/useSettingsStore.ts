'use client';

import { settingsService } from '@/lib/data/settings';
import type { Settings } from '@/types';
import { create } from 'zustand';

interface SettingsStore {
  settings: Settings | null;
  isLoading: boolean;
  error: string | null;

  loadSettings: () => void;
  initializeSettings: (defaultLocationId: string) => void;
  updateSettings: (data: Partial<Omit<Settings, 'createdAt' | 'updatedAt'>>) => void;
  clearError: () => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: null,
  isLoading: false,
  error: null,

  loadSettings: () => {
    set({ isLoading: true, error: null });
    try {
      const settings = settingsService.get();
      set({ settings, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '設定の読み込みに失敗しました',
        isLoading: false,
      });
    }
  },

  initializeSettings: (defaultLocationId) => {
    try {
      const settings = settingsService.initialize(defaultLocationId);
      set({ settings });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '設定の初期化に失敗しました' });
    }
  },

  updateSettings: (data) => {
    try {
      const updated = settingsService.update(data);
      set({ settings: updated });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '設定の更新に失敗しました' });
    }
  },

  clearError: () => set({ error: null }),
}));
