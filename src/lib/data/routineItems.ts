import { routineItemsStorage } from '@/lib/storage';
import { generateId, now } from '@/lib/utils/id';
import type { CreateInput, RoutineItem, UpdateInput } from '@/types';

/**
 * RoutineItem エンティティの CRUD サービス
 */
export const routineItemService = {
  /**
   * 全ての習慣項目を取得する
   */
  getAll(): RoutineItem[] {
    return routineItemsStorage.get() ?? [];
  },

  /**
   * ID で習慣項目を取得する
   */
  getById(id: string): RoutineItem | null {
    return this.getAll().find((item) => item.id === id) ?? null;
  },

  /**
   * 複数の ID で習慣項目をまとめて取得する
   * @param ids 取得する RoutineItem の ID リスト
   * @returns 見つかった RoutineItem の配列（順序は ids に従う）
   */
  getByIds(ids: string[]): RoutineItem[] {
    const all = this.getAll();
    return ids.flatMap((id) => {
      const item = all.find((r) => r.id === id);
      return item ? [item] : [];
    });
  },

  /**
   * 新しい習慣項目を作成する
   */
  create(data: CreateInput<RoutineItem>): RoutineItem {
    const newItem: RoutineItem = {
      ...data,
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
    };
    routineItemsStorage.update((items) => [...(items ?? []), newItem]);
    return newItem;
  },

  /**
   * 既存の習慣項目を更新する
   * @throws 指定 ID の習慣項目が見つからない場合
   */
  update(id: string, data: UpdateInput<RoutineItem>): RoutineItem {
    const items = this.getAll();
    const index = items.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new Error(`RoutineItem が見つかりません: ${id}`);
    }

    const updated: RoutineItem = {
      ...items[index],
      ...data,
      id,
      updatedAt: now(),
    };

    items[index] = updated;
    routineItemsStorage.set(items);
    return updated;
  },

  /**
   * 習慣項目を削除する
   */
  delete(id: string): void {
    const items = this.getAll().filter((item) => item.id !== id);
    routineItemsStorage.set(items);
  },
};
