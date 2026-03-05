'use client';

import { locationService } from '@/lib/data/locations';
import { locationToRecord, syncDelete, syncUpsert } from '@/lib/sync/writeThrough';
import { useAuthStore } from '@/store/useAuthStore';
import type { CreateInput, Location, UpdateInput } from '@/types';
import { create } from 'zustand';

interface LocationStore {
  /** 場所リスト */
  locations: Location[];
  /** ローディング状態 */
  isLoading: boolean;
  /** エラーメッセージ */
  error: string | null;

  /** DBからデータを読み込む */
  loadLocations: () => Promise<void>;
  /** 場所を追加する */
  addLocation: (data: CreateInput<Location>) => Promise<Location>;
  /** 場所を更新する */
  updateLocation: (id: string, data: UpdateInput<Location>) => Promise<void>;
  /** 場所を削除する */
  deleteLocation: (id: string) => Promise<void>;
  /** ID で場所を取得する */
  getLocationById: (id: string) => Location | undefined;
  /** エラーをクリアする */
  clearError: () => void;
}

export const useLocationStore = create<LocationStore>((set, get) => ({
  locations: [],
  isLoading: false,
  error: null,

  loadLocations: async () => {
    set({ isLoading: true, error: null });
    try {
      const locations = await locationService.getAll();
      set({ locations, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '読み込みに失敗しました',
        isLoading: false,
      });
    }
  },

  addLocation: async (data) => {
    try {
      const newLocation = await locationService.create(data);
      set((state) => ({ locations: [...state.locations, newLocation] }));
      const user = useAuthStore.getState().user;
      if (user) {
        syncUpsert('locations', locationToRecord(newLocation, user.id)).catch(console.warn);
      }
      return newLocation;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '追加に失敗しました' });
      throw error;
    }
  },

  updateLocation: async (id, data) => {
    try {
      const updated = await locationService.update(id, data);
      set((state) => ({
        locations: state.locations.map((loc) => (loc.id === id ? updated : loc)),
      }));
      const user = useAuthStore.getState().user;
      if (user) {
        syncUpsert('locations', locationToRecord(updated, user.id)).catch(console.warn);
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '更新に失敗しました' });
      throw error;
    }
  },

  deleteLocation: async (id) => {
    try {
      await locationService.delete(id);
      set((state) => ({
        locations: state.locations.filter((loc) => loc.id !== id),
      }));
      if (useAuthStore.getState().user) {
        syncDelete('locations', id).catch(console.warn);
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '削除に失敗しました' });
      throw error;
    }
  },

  getLocationById: (id) => get().locations.find((loc) => loc.id === id),

  clearError: () => set({ error: null }),
}));
