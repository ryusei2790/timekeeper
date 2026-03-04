import { getDb } from '@/lib/db';
import { now } from '@/lib/utils/id';
import type { DailyState, DelayRecord, ScheduleItem } from '@/types';

interface DailyStateRow {
  date: string;
  pattern_id: string;
  current_location_id: string;
  active_event_id: string | null;
  completed_event_ids: string[];
  skipped_event_ids: string[];
  delays: DelayRecord[];
  generated_schedule: ScheduleItem[];
  created_at: string;
  updated_at: string;
}

function rowToDailyState(row: DailyStateRow): DailyState {
  return {
    date: row.date,
    patternId: row.pattern_id,
    currentLocationId: row.current_location_id,
    activeEventId: row.active_event_id,
    completedEventIds: row.completed_event_ids,
    skippedEventIds: row.skipped_event_ids,
    delays: row.delays,
    generatedSchedule: row.generated_schedule,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * DailyState エンティティのサービス
 * 日付をキーとして管理（1日1レコード）
 */
export const dailyStateService = {
  /**
   * 全ての日次状態を取得する
   */
  async getAll(): Promise<DailyState[]> {
    const db = await getDb();
    const result = await db.query<DailyStateRow>('SELECT * FROM daily_states ORDER BY date DESC');
    return result.rows.map(rowToDailyState);
  },

  /**
   * 特定の日付の状態を取得する
   * @param date YYYY-MM-DD 形式の日付
   */
  async getByDate(date: string): Promise<DailyState | null> {
    const db = await getDb();
    const result = await db.query<DailyStateRow>('SELECT * FROM daily_states WHERE date = $1', [
      date,
    ]);
    return result.rows[0] ? rowToDailyState(result.rows[0]) : null;
  },

  /**
   * 日次状態を作成または更新する（Upsert）
   */
  async upsert(data: Omit<DailyState, 'createdAt' | 'updatedAt'>): Promise<DailyState> {
    const db = await getDb();
    const existing = await this.getByDate(data.date);
    const createdAt = existing?.createdAt ?? now();
    const updatedAt = now();

    await db.query(
      `INSERT INTO daily_states (date, pattern_id, current_location_id, active_event_id, completed_event_ids, skipped_event_ids, delays, generated_schedule, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (date) DO UPDATE SET
         pattern_id=$2, current_location_id=$3, active_event_id=$4, completed_event_ids=$5,
         skipped_event_ids=$6, delays=$7, generated_schedule=$8, updated_at=$10`,
      [
        data.date,
        data.patternId,
        data.currentLocationId,
        data.activeEventId ?? null,
        JSON.stringify(data.completedEventIds),
        JSON.stringify(data.skippedEventIds),
        JSON.stringify(data.delays),
        JSON.stringify(data.generatedSchedule),
        createdAt,
        updatedAt,
      ]
    );

    return { ...data, createdAt, updatedAt };
  },

  /**
   * 特定の日付の状態を削除する
   */
  async deleteByDate(date: string): Promise<void> {
    const db = await getDb();
    await db.query('DELETE FROM daily_states WHERE date = $1', [date]);
  },

  /**
   * 古いデータを削除する
   * @param keepDays 保持する日数（デフォルト: 30日）
   */
  async cleanup(keepDays: number = 30): Promise<void> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - keepDays);
    const cutoffStr = cutoff.toISOString().split('T')[0];

    const db = await getDb();
    await db.query('DELETE FROM daily_states WHERE date < $1', [cutoffStr]);
  },
};
