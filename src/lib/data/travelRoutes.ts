import { travelRoutesStorage } from '@/lib/storage';
import { generateId, now } from '@/lib/utils/id';
import type { CreateInput, TravelRoute, UpdateInput } from '@/types';

/**
 * TravelRoute エンティティの CRUD サービス
 */
export const travelRouteService = {
  /**
   * 全ての移動ルートを取得する
   */
  getAll(): TravelRoute[] {
    return travelRoutesStorage.get() ?? [];
  },

  /**
   * ID で移動ルートを取得する
   */
  getById(id: string): TravelRoute | null {
    return this.getAll().find((r) => r.id === id) ?? null;
  },

  /**
   * 新しい移動ルートを作成する
   */
  create(data: CreateInput<TravelRoute>): TravelRoute {
    const newRoute: TravelRoute = {
      ...data,
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
    };
    travelRoutesStorage.update((routes) => [...(routes ?? []), newRoute]);
    return newRoute;
  },

  /**
   * 既存の移動ルートを更新する
   * @throws 指定 ID のルートが見つからない場合
   */
  update(id: string, data: UpdateInput<TravelRoute>): TravelRoute {
    const routes = this.getAll();
    const index = routes.findIndex((r) => r.id === id);

    if (index === -1) {
      throw new Error(`TravelRoute が見つかりません: ${id}`);
    }

    const updated: TravelRoute = {
      ...routes[index],
      ...data,
      id,
      updatedAt: now(),
    };

    routes[index] = updated;
    travelRoutesStorage.set(routes);
    return updated;
  },

  /**
   * 移動ルートを削除する
   */
  delete(id: string): void {
    const routes = this.getAll().filter((r) => r.id !== id);
    travelRoutesStorage.set(routes);
  },

  /**
   * 特定の出発地・目的地間のルートを全て取得する
   * @param fromLocationId 出発地の Location ID
   * @param toLocationId 目的地の Location ID
   */
  findRoutes(fromLocationId: string, toLocationId: string): TravelRoute[] {
    return this.getAll().filter(
      (r) => r.fromLocationId === fromLocationId && r.toLocationId === toLocationId
    );
  },

  /**
   * 特定の出発地・目的地間のデフォルトルートを取得する
   * @param fromLocationId 出発地の Location ID
   * @param toLocationId 目的地の Location ID
   * @returns デフォルトルート、存在しない場合は最初のルート、それもなければ null
   */
  findDefaultRoute(fromLocationId: string, toLocationId: string): TravelRoute | null {
    const routes = this.findRoutes(fromLocationId, toLocationId);
    if (routes.length === 0) return null;
    return routes.find((r) => r.isDefault) ?? routes[0];
  },
};
