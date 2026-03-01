import { patternsStorage } from '@/lib/storage';
import { generateId, now } from '@/lib/utils/id';
import type { CreateInput, LifePattern, UpdateInput } from '@/types';

/**
 * LifePattern エンティティの CRUD サービス
 */
export const patternService = {
  /**
   * 全てのパターンを取得する
   */
  getAll(): LifePattern[] {
    return patternsStorage.get() ?? [];
  },

  /**
   * ID でパターンを取得する
   */
  getById(id: string): LifePattern | null {
    return this.getAll().find((p) => p.id === id) ?? null;
  },

  /**
   * デフォルトパターンを取得する
   * @returns デフォルトパターン、存在しない場合は null
   */
  getDefault(): LifePattern | null {
    return this.getAll().find((p) => p.rules.isDefault) ?? null;
  },

  /**
   * 新しいパターンを作成する
   */
  create(data: CreateInput<LifePattern>): LifePattern {
    const newPattern: LifePattern = {
      ...data,
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
    };
    patternsStorage.update((patterns) => [...(patterns ?? []), newPattern]);
    return newPattern;
  },

  /**
   * 既存のパターンを更新する
   * @throws 指定 ID のパターンが見つからない場合
   */
  update(id: string, data: UpdateInput<LifePattern>): LifePattern {
    const patterns = this.getAll();
    const index = patterns.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new Error(`LifePattern が見つかりません: ${id}`);
    }

    const updated: LifePattern = {
      ...patterns[index],
      ...data,
      id,
      updatedAt: now(),
    };

    patterns[index] = updated;
    patternsStorage.set(patterns);
    return updated;
  },

  /**
   * パターンを削除する
   */
  delete(id: string): void {
    const patterns = this.getAll().filter((p) => p.id !== id);
    patternsStorage.set(patterns);
  },

  /**
   * 曜日とキーワードに基づいて適用パターンを選択する
   * 優先度順で最初にマッチしたパターンを返す
   * @param dayOfWeek 曜日（0=日, 1=月, ..., 6=土）
   * @param keywords カレンダー予定のキーワードリスト
   */
  selectPattern(dayOfWeek: number, keywords: string[]): LifePattern | null {
    const patterns = this.getAll();

    // キーワードマッチング（優先度高）
    const keywordMatches = patterns.filter((p) =>
      p.rules.keywords.some((kw) => keywords.some((k) => k.includes(kw)))
    );

    if (keywordMatches.length > 0) {
      return keywordMatches.sort((a, b) => b.rules.priority - a.rules.priority)[0];
    }

    // 曜日マッチング
    const dayMatches = patterns.filter((p) => p.rules.dayOfWeek.includes(dayOfWeek));
    if (dayMatches.length > 0) {
      return dayMatches.sort((a, b) => b.rules.priority - a.rules.priority)[0];
    }

    // デフォルトパターン
    return this.getDefault();
  },
};
