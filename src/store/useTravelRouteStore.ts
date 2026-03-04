'use client';

import { travelRouteService } from '@/lib/data/travelRoutes';
import type { CreateInput, TravelRoute, UpdateInput } from '@/types';
import { create } from 'zustand';

interface TravelRouteStore {
  travelRoutes: TravelRoute[];
  isLoading: boolean;
  error: string | null;

  loadTravelRoutes: () => Promise<void>;
  addTravelRoute: (data: CreateInput<TravelRoute>) => Promise<TravelRoute>;
  updateTravelRoute: (id: string, data: UpdateInput<TravelRoute>) => Promise<void>;
  deleteTravelRoute: (id: string) => Promise<void>;
  getRouteById: (id: string) => TravelRoute | undefined;
  clearError: () => void;
}

export const useTravelRouteStore = create<TravelRouteStore>((set, get) => ({
  travelRoutes: [],
  isLoading: false,
  error: null,

  loadTravelRoutes: async () => {
    set({ isLoading: true, error: null });
    try {
      const travelRoutes = await travelRouteService.getAll();
      set({ travelRoutes, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '読み込みに失敗しました',
        isLoading: false,
      });
    }
  },

  addTravelRoute: async (data) => {
    try {
      const newRoute = await travelRouteService.create(data);
      set((state) => ({ travelRoutes: [...state.travelRoutes, newRoute] }));
      return newRoute;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '追加に失敗しました' });
      throw error;
    }
  },

  updateTravelRoute: async (id, data) => {
    try {
      const updated = await travelRouteService.update(id, data);
      set((state) => ({
        travelRoutes: state.travelRoutes.map((r) => (r.id === id ? updated : r)),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '更新に失敗しました' });
      throw error;
    }
  },

  deleteTravelRoute: async (id) => {
    try {
      await travelRouteService.delete(id);
      set((state) => ({
        travelRoutes: state.travelRoutes.filter((r) => r.id !== id),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '削除に失敗しました' });
      throw error;
    }
  },

  getRouteById: (id) => get().travelRoutes.find((r) => r.id === id),

  clearError: () => set({ error: null }),
}));
