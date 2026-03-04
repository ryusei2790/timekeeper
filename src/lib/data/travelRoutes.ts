import { getDb } from '@/lib/db';
import { generateId, now } from '@/lib/utils/id';
import type { CreateInput, TravelMethod, TravelRoute, UpdateInput } from '@/types';

interface TravelRouteRow {
  id: string;
  from_location_id: string;
  to_location_id: string;
  method: TravelMethod;
  duration: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

function rowToTravelRoute(row: TravelRouteRow): TravelRoute {
  return {
    id: row.id,
    fromLocationId: row.from_location_id,
    toLocationId: row.to_location_id,
    method: row.method,
    duration: row.duration,
    isDefault: row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * TravelRoute エンティティの CRUD サービス
 */
export const travelRouteService = {
  /**
   * 全ての移動ルートを取得する
   */
  async getAll(): Promise<TravelRoute[]> {
    const db = await getDb();
    const result = await db.query<TravelRouteRow>(
      'SELECT * FROM travel_routes ORDER BY created_at'
    );
    return result.rows.map(rowToTravelRoute);
  },

  /**
   * ID で移動ルートを取得する
   */
  async getById(id: string): Promise<TravelRoute | null> {
    const db = await getDb();
    const result = await db.query<TravelRouteRow>('SELECT * FROM travel_routes WHERE id = $1', [
      id,
    ]);
    return result.rows[0] ? rowToTravelRoute(result.rows[0]) : null;
  },

  /**
   * 新しい移動ルートを作成する
   */
  async create(data: CreateInput<TravelRoute>): Promise<TravelRoute> {
    const db = await getDb();
    const newRoute: TravelRoute = {
      ...data,
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
    };
    await db.query(
      `INSERT INTO travel_routes (id, from_location_id, to_location_id, method, duration, is_default, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        newRoute.id,
        newRoute.fromLocationId,
        newRoute.toLocationId,
        newRoute.method,
        newRoute.duration,
        newRoute.isDefault,
        newRoute.createdAt,
        newRoute.updatedAt,
      ]
    );
    return newRoute;
  },

  /**
   * 既存の移動ルートを更新する
   * @throws 指定 ID のルートが見つからない場合
   */
  async update(id: string, data: UpdateInput<TravelRoute>): Promise<TravelRoute> {
    const current = await this.getById(id);
    if (!current) throw new Error(`TravelRoute が見つかりません: ${id}`);

    const updated: TravelRoute = {
      ...current,
      ...data,
      id,
      updatedAt: now(),
    };
    const db = await getDb();
    await db.query(
      `UPDATE travel_routes SET from_location_id=$1, to_location_id=$2, method=$3, duration=$4, is_default=$5, updated_at=$6 WHERE id=$7`,
      [
        updated.fromLocationId,
        updated.toLocationId,
        updated.method,
        updated.duration,
        updated.isDefault,
        updated.updatedAt,
        id,
      ]
    );
    return updated;
  },

  /**
   * 移動ルートを削除する
   */
  async delete(id: string): Promise<void> {
    const db = await getDb();
    await db.query('DELETE FROM travel_routes WHERE id = $1', [id]);
  },

  /**
   * 特定の出発地・目的地間のルートを全て取得する
   */
  async findRoutes(fromLocationId: string, toLocationId: string): Promise<TravelRoute[]> {
    const db = await getDb();
    const result = await db.query<TravelRouteRow>(
      'SELECT * FROM travel_routes WHERE from_location_id = $1 AND to_location_id = $2',
      [fromLocationId, toLocationId]
    );
    return result.rows.map(rowToTravelRoute);
  },

  /**
   * 特定の出発地・目的地間のデフォルトルートを取得する
   */
  async findDefaultRoute(
    fromLocationId: string,
    toLocationId: string
  ): Promise<TravelRoute | null> {
    const routes = await this.findRoutes(fromLocationId, toLocationId);
    if (routes.length === 0) return null;
    return routes.find((r) => r.isDefault) ?? routes[0];
  },
};
