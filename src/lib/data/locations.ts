import { getDb } from '@/lib/db';
import { generateId, now } from '@/lib/utils/id';
import type { CreateInput, Location, UpdateInput } from '@/types';

interface LocationRow {
  id: string;
  name: string;
  aliases: Location['aliases'];
  address: string | null;
  created_at: string;
  updated_at: string;
}

function rowToLocation(row: LocationRow): Location {
  return {
    id: row.id,
    name: row.name,
    aliases: row.aliases,
    address: row.address ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Location エンティティの CRUD サービス
 * PGlite（IndexedDB上のPostgreSQL）への永続化を担当する
 */
export const locationService = {
  /**
   * 全ての場所を取得する
   */
  async getAll(): Promise<Location[]> {
    const db = await getDb();
    const result = await db.query<LocationRow>('SELECT * FROM locations ORDER BY created_at');
    return result.rows.map(rowToLocation);
  },

  /**
   * ID で場所を取得する
   */
  async getById(id: string): Promise<Location | null> {
    const db = await getDb();
    const result = await db.query<LocationRow>('SELECT * FROM locations WHERE id = $1', [id]);
    return result.rows[0] ? rowToLocation(result.rows[0]) : null;
  },

  /**
   * 新しい場所を作成する
   */
  async create(data: CreateInput<Location>): Promise<Location> {
    const db = await getDb();
    const newLocation: Location = {
      ...data,
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
    };
    await db.query(
      `INSERT INTO locations (id, name, aliases, address, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        newLocation.id,
        newLocation.name,
        JSON.stringify(newLocation.aliases),
        newLocation.address ?? null,
        newLocation.createdAt,
        newLocation.updatedAt,
      ]
    );
    return newLocation;
  },

  /**
   * 既存の場所を更新する
   * @throws 指定 ID の場所が見つからない場合
   */
  async update(id: string, data: UpdateInput<Location>): Promise<Location> {
    const current = await this.getById(id);
    if (!current) throw new Error(`Location が見つかりません: ${id}`);

    const updated: Location = {
      ...current,
      ...data,
      id,
      updatedAt: now(),
    };
    await getDb().then((db) =>
      db.query(`UPDATE locations SET name=$1, aliases=$2, address=$3, updated_at=$4 WHERE id=$5`, [
        updated.name,
        JSON.stringify(updated.aliases),
        updated.address ?? null,
        updated.updatedAt,
        id,
      ])
    );
    return updated;
  },

  /**
   * 場所を削除する
   */
  async delete(id: string): Promise<void> {
    const db = await getDb();
    await db.query('DELETE FROM locations WHERE id = $1', [id]);
  },

  /**
   * 名前またはエイリアスで場所を検索する（大文字小文字無視）
   */
  async findByName(name: string): Promise<Location | null> {
    const normalized = name.toLowerCase().trim();
    const all = await this.getAll();
    return (
      all.find(
        (loc) =>
          loc.name.toLowerCase() === normalized ||
          loc.aliases.some((alias) => alias.toLowerCase() === normalized)
      ) ?? null
    );
  },
};
