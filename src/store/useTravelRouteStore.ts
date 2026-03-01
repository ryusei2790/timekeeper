'use client';

import { travelRouteService } from '@/lib/data/travelRoutes';
import type { CreateInput, TravelRoute, UpdateInput } from '@/types';
import { create } from 'zustand';

interface TravelRouteStore {
  travelRoutes: TravelRoute[];
  isLoading: boolean;
  error: string | null;

  loadTravelRoutes: () => void;
  addTravelRoute: (data: CreateInput<TravelRoute>) => TravelRoute;
  updateTravelRoute: (id: string, data: UpdateInput<TravelRoute>) => void;
  deleteTravelRoute: (id: string) => void;
  getRouteById: (id: string) => TravelRoute | undefined;
  clearError: () => void;
}

export const useTravelRouteStore = create<TravelRouteStore>((set, get) => ({
  travelRoutes: [],
  isLoading: false,
  error: null,

  loadTravelRoutes: () => {
    set({ isLoading: true, error: null });
    try {
      const travelRoutes = travelRouteService.getAll();
      set({ travelRoutes, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '読み込みに失敗しました',
        isLoading: false,
      });
    }
  },

  addTravelRoute: (data) => {
    try {
      const newRoute = travelRouteService.create(data);
      set((state) => ({ travelRoutes: [...state.travelRoutes, newRoute] }));
      return newRoute;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '追加に失敗しました' });
      throw error;
    }
  },

  updateTravelRoute: (id, data) => {
    try {
      const updated = travelRouteService.update(id, data);
      set((state) => ({
        travelRoutes: state.travelRoutes.map((r) => (r.id === id ? updated : r)),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '更新に失敗しました' });
      throw error;
    }
  },

  deleteTravelRoute: (id) => {
    try {
      travelRouteService.delete(id);
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
