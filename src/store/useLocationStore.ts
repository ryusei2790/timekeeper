'use client';

import { locationService } from '@/lib/data/locations';
import type { CreateInput, Location, UpdateInput } from '@/types';
import { create } from 'zustand';

interface LocationStore {
  /** 場所リスト */
  locations: Location[];
  /** ローディング状態 */
  isLoading: boolean;
  /** エラーメッセージ */
  error: string | null;

  /** LocalStorage からデータを読み込む */
  loadLocations: () => void;
  /** 場所を追加する */
  addLocation: (data: CreateInput<Location>) => Location;
  /** 場所を更新する */
  updateLocation: (id: string, data: UpdateInput<Location>) => void;
  /** 場所を削除する */
  deleteLocation: (id: string) => void;
  /** ID で場所を取得する */
  getLocationById: (id: string) => Location | undefined;
  /** エラーをクリアする */
  clearError: () => void;
}

export const useLocationStore = create<LocationStore>((set, get) => ({
  locations: [],
  isLoading: false,
  error: null,

  loadLocations: () => {
    set({ isLoading: true, error: null });
    try {
      const locations = locationService.getAll();
      set({ locations, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '読み込みに失敗しました',
        isLoading: false,
      });
    }
  },

  addLocation: (data) => {
    try {
      const newLocation = locationService.create(data);
      set((state) => ({ locations: [...state.locations, newLocation] }));
      return newLocation;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '追加に失敗しました' });
      throw error;
    }
  },

  updateLocation: (id, data) => {
    try {
      const updated = locationService.update(id, data);
      set((state) => ({
        locations: state.locations.map((loc) => (loc.id === id ? updated : loc)),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '更新に失敗しました' });
      throw error;
    }
  },

  deleteLocation: (id) => {
    try {
      locationService.delete(id);
      set((state) => ({
        locations: state.locations.filter((loc) => loc.id !== id),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '削除に失敗しました' });
      throw error;
    }
  },

  getLocationById: (id) => get().locations.find((loc) => loc.id === id),

  clearError: () => set({ error: null }),
}));
