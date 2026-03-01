import { locationsStorage } from '@/lib/storage';
import { generateId, now } from '@/lib/utils/id';
import type { CreateInput, Location, UpdateInput } from '@/types';

/**
 * Location エンティティの CRUD サービス
 * LocalStorage への永続化を担当する
 */
export const locationService = {
  /**
   * 全ての場所を取得する
   */
  getAll(): Location[] {
    return locationsStorage.get() ?? [];
  },

  /**
   * ID で場所を取得する
   * @param id 検索する Location の ID
   * @returns 見つかった場合は Location、見つからない場合は null
   */
  getById(id: string): Location | null {
    return this.getAll().find((loc) => loc.id === id) ?? null;
  },

  /**
   * 新しい場所を作成する
   * @param data ID・タイムスタンプを除いた入力データ
   * @returns 作成された Location
   */
  create(data: CreateInput<Location>): Location {
    const newLocation: Location = {
      ...data,
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
    };
    locationsStorage.update((locations) => [...(locations ?? []), newLocation]);
    return newLocation;
  },

  /**
   * 既存の場所を更新する
   * @param id 更新対象の Location ID
   * @param data 更新データ
   * @throws 指定 ID の場所が見つからない場合
   */
  update(id: string, data: UpdateInput<Location>): Location {
    const locations = this.getAll();
    const index = locations.findIndex((loc) => loc.id === id);

    if (index === -1) {
      throw new Error(`Location が見つかりません: ${id}`);
    }

    const updated: Location = {
      ...locations[index],
      ...data,
      id,
      updatedAt: now(),
    };

    locations[index] = updated;
    locationsStorage.set(locations);
    return updated;
  },

  /**
   * 場所を削除する
   * @param id 削除対象の Location ID
   */
  delete(id: string): void {
    const locations = this.getAll().filter((loc) => loc.id !== id);
    locationsStorage.set(locations);
  },

  /**
   * 名前またはエイリアスで場所を検索する（大文字小文字無視）
   * @param name 検索する名前またはエイリアス
   * @returns マッチした Location、見つからない場合は null
   */
  findByName(name: string): Location | null {
    const normalized = name.toLowerCase().trim();
    return (
      this.getAll().find(
        (loc) =>
          loc.name.toLowerCase() === normalized ||
          loc.aliases.some((alias) => alias.toLowerCase() === normalized)
      ) ?? null
    );
  },
};
