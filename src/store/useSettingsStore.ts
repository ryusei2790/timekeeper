'use client';

import { settingsService } from '@/lib/data/settings';
import { syncSettingsUpsert } from '@/lib/sync/writeThrough';
import { useAuthStore } from '@/store/useAuthStore';
import type { Settings } from '@/types';
import { create } from 'zustand';

interface SettingsStore {
  settings: Settings | null;
  isLoading: boolean;
  error: string | null;

  loadSettings: () => Promise<void>;
  initializeSettings: (defaultLocationId: string) => Promise<void>;
  updateSettings: (data: Partial<Omit<Settings, 'createdAt' | 'updatedAt'>>) => Promise<void>;
  clearError: () => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: null,
  isLoading: false,
  error: null,

  loadSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const settings = await settingsService.get();
      set({ settings, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '設定の読み込みに失敗しました',
        isLoading: false,
      });
    }
  },

  initializeSettings: async (defaultLocationId) => {
    try {
      const settings = await settingsService.initialize(defaultLocationId);
      set({ settings });
      if (useAuthStore.getState().user) {
        syncSettingsUpsert(settings).catch(console.warn);
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '設定の初期化に失敗しました' });
    }
  },

  updateSettings: async (data) => {
    try {
      const updated = await settingsService.update(data);
      set({ settings: updated });
      if (useAuthStore.getState().user) {
        syncSettingsUpsert(updated).catch(console.warn);
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '設定の更新に失敗しました' });
    }
  },

  clearError: () => set({ error: null }),
}));
