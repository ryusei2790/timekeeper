import type { TravelRoute } from '@/types';

/**
 * 指定した出発地・目的地間のデフォルトルートを返す
 *
 * @param fromLocationId 出発地の Location ID
 * @param toLocationId 目的地の Location ID
 * @param routes 全移動ルート一覧
 * @returns デフォルトルート。なければ最短ルート。どちらもなければ null
 */
export function findRoute(
  fromLocationId: string,
  toLocationId: string,
  routes: TravelRoute[]
): TravelRoute | null {
  const candidates = routes.filter(
    (r) => r.fromLocationId === fromLocationId && r.toLocationId === toLocationId
  );

  if (candidates.length === 0) return null;

  const defaultRoute = candidates.find((r) => r.isDefault);
  if (defaultRoute) return defaultRoute;

  // デフォルトがない場合は最短時間のルートを返す
  return candidates.sort((a, b) => a.duration - b.duration)[0];
}

/**
 * 現在の移動時間より短い代替ルートを返す（遅延時の移動手段変更提案に使用）
 *
 * @param fromLocationId 出発地の Location ID
 * @param toLocationId 目的地の Location ID
 * @param currentDuration 現在の移動時間（分）
 * @param routes 全移動ルート一覧
 * @returns 現在より短いルートの配列（短い順）
 */
export function findFasterRoutes(
  fromLocationId: string,
  toLocationId: string,
  currentDuration: number,
  routes: TravelRoute[]
): TravelRoute[] {
  return routes
    .filter(
      (r) =>
        r.fromLocationId === fromLocationId &&
        r.toLocationId === toLocationId &&
        r.duration < currentDuration
    )
    .sort((a, b) => a.duration - b.duration);
}
