import { getDb } from '@/lib/db';
import { generateId, now } from '@/lib/utils/id';
import type { CreateInput, RoutineItem, UpdateInput } from '@/types';

interface RoutineItemRow {
  id: string;
  name: string;
  duration: number;
  location_id: string | null;
  icon: string | null;
  color: string | null;
  is_flexible: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

function rowToRoutineItem(row: RoutineItemRow): RoutineItem {
  return {
    id: row.id,
    name: row.name,
    duration: row.duration,
    locationId: row.location_id,
    icon: row.icon ?? undefined,
    color: row.color ?? undefined,
    isFlexible: row.is_flexible,
    priority: row.priority,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * RoutineItem エンティティの CRUD サービス
 */
export const routineItemService = {
  /**
   * 全ての習慣項目を取得する
   */
  async getAll(): Promise<RoutineItem[]> {
    const db = await getDb();
    const result = await db.query<RoutineItemRow>(
      'SELECT * FROM routine_items ORDER BY created_at'
    );
    console.log(`[routineItemService] getAll() → ${result.rows.length}件取得`);
    return result.rows.map(rowToRoutineItem);
  },

  /**
   * ID で習慣項目を取得する
   */
  async getById(id: string): Promise<RoutineItem | null> {
    const db = await getDb();
    const result = await db.query<RoutineItemRow>('SELECT * FROM routine_items WHERE id = $1', [
      id,
    ]);
    return result.rows[0] ? rowToRoutineItem(result.rows[0]) : null;
  },

  /**
   * 複数の ID で習慣項目をまとめて取得する
   */
  async getByIds(ids: string[]): Promise<RoutineItem[]> {
    if (ids.length === 0) return [];
    const all = await this.getAll();
    return ids.flatMap((id) => {
      const item = all.find((r) => r.id === id);
      return item ? [item] : [];
    });
  },

  /**
   * 新しい習慣項目を作成する
   */
  async create(data: CreateInput<RoutineItem>): Promise<RoutineItem> {
    const db = await getDb();
    const newItem: RoutineItem = {
      ...data,
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
    };
    console.log(`[routineItemService] create() → id=${newItem.id}, name="${newItem.name}"`);
    await db.query(
      `INSERT INTO routine_items (id, name, duration, location_id, icon, color, is_flexible, priority, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        newItem.id,
        newItem.name,
        newItem.duration,
        newItem.locationId ?? null,
        newItem.icon ?? null,
        newItem.color ?? null,
        newItem.isFlexible,
        newItem.priority,
        newItem.createdAt,
        newItem.updatedAt,
      ]
    );
    return newItem;
  },

  /**
   * 既存の習慣項目を更新する
   * @throws 指定 ID の習慣項目が見つからない場合
   */
  async update(id: string, data: UpdateInput<RoutineItem>): Promise<RoutineItem> {
    console.log(`[routineItemService] update() → id=${id}`);
    const current = await this.getById(id);
    if (!current) throw new Error(`RoutineItem が見つかりません: ${id}`);

    const updated: RoutineItem = {
      ...current,
      ...data,
      id,
      updatedAt: now(),
    };
    const db = await getDb();
    await db.query(
      `UPDATE routine_items SET name=$1, duration=$2, location_id=$3, icon=$4, color=$5, is_flexible=$6, priority=$7, updated_at=$8 WHERE id=$9`,
      [
        updated.name,
        updated.duration,
        updated.locationId ?? null,
        updated.icon ?? null,
        updated.color ?? null,
        updated.isFlexible,
        updated.priority,
        updated.updatedAt,
        id,
      ]
    );
    return updated;
  },

  /**
   * 習慣項目を削除する
   */
  async delete(id: string): Promise<void> {
    console.log(`[routineItemService] delete() → id=${id}`);
    const db = await getDb();
    await db.query('DELETE FROM routine_items WHERE id = $1', [id]);
  },
};
