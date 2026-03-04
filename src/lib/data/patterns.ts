import { getDb } from '@/lib/db';
import { generateId, now } from '@/lib/utils/id';
import type {
  CreateInput,
  LifePattern,
  PatternRule,
  PatternRoutineItem,
  UpdateInput,
} from '@/types';

interface LifePatternRow {
  id: string;
  name: string;
  rules: PatternRule;
  pattern_items: PatternRoutineItem[];
  created_at: string;
  updated_at: string;
}

function rowToPattern(row: LifePatternRow): LifePattern {
  return {
    id: row.id,
    name: row.name,
    rules: row.rules,
    patternItems: row.pattern_items,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * LifePattern エンティティの CRUD サービス
 */
export const patternService = {
  /**
   * 全てのパターンを取得する
   */
  async getAll(): Promise<LifePattern[]> {
    const db = await getDb();
    const result = await db.query<LifePatternRow>(
      'SELECT * FROM life_patterns ORDER BY created_at'
    );
    return result.rows.map(rowToPattern);
  },

  /**
   * ID でパターンを取得する
   */
  async getById(id: string): Promise<LifePattern | null> {
    const db = await getDb();
    const result = await db.query<LifePatternRow>('SELECT * FROM life_patterns WHERE id = $1', [
      id,
    ]);
    return result.rows[0] ? rowToPattern(result.rows[0]) : null;
  },

  /**
   * デフォルトパターンを取得する
   */
  async getDefault(): Promise<LifePattern | null> {
    const all = await this.getAll();
    return all.find((p) => p.rules.isDefault) ?? null;
  },

  /**
   * 新しいパターンを作成する
   */
  async create(data: CreateInput<LifePattern>): Promise<LifePattern> {
    const db = await getDb();
    const newPattern: LifePattern = {
      ...data,
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
    };
    await db.query(
      `INSERT INTO life_patterns (id, name, rules, pattern_items, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        newPattern.id,
        newPattern.name,
        JSON.stringify(newPattern.rules),
        JSON.stringify(newPattern.patternItems),
        newPattern.createdAt,
        newPattern.updatedAt,
      ]
    );
    return newPattern;
  },

  /**
   * 既存のパターンを更新する
   * @throws 指定 ID のパターンが見つからない場合
   */
  async update(id: string, data: UpdateInput<LifePattern>): Promise<LifePattern> {
    const current = await this.getById(id);
    if (!current) throw new Error(`LifePattern が見つかりません: ${id}`);

    const updated: LifePattern = {
      ...current,
      ...data,
      id,
      updatedAt: now(),
    };
    const db = await getDb();
    await db.query(
      `UPDATE life_patterns SET name=$1, rules=$2, pattern_items=$3, updated_at=$4 WHERE id=$5`,
      [
        updated.name,
        JSON.stringify(updated.rules),
        JSON.stringify(updated.patternItems),
        updated.updatedAt,
        id,
      ]
    );
    return updated;
  },

  /**
   * パターンを削除する
   */
  async delete(id: string): Promise<void> {
    const db = await getDb();
    await db.query('DELETE FROM life_patterns WHERE id = $1', [id]);
  },

  /**
   * 曜日とキーワードに基づいて適用パターンを選択する
   */
  async selectPattern(dayOfWeek: number, keywords: string[]): Promise<LifePattern | null> {
    const patterns = await this.getAll();

    const keywordMatches = patterns.filter((p) =>
      p.rules.keywords.some((kw) => keywords.some((k) => k.includes(kw)))
    );
    if (keywordMatches.length > 0) {
      return keywordMatches.sort((a, b) => b.rules.priority - a.rules.priority)[0];
    }

    const dayMatches = patterns.filter((p) => p.rules.dayOfWeek.includes(dayOfWeek));
    if (dayMatches.length > 0) {
      return dayMatches.sort((a, b) => b.rules.priority - a.rules.priority)[0];
    }

    return this.getDefault();
  },
};
