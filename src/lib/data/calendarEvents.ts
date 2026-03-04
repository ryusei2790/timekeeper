import { getDb } from '@/lib/db';
import { now } from '@/lib/utils/id';
import type { CalendarEvent } from '@/types';

interface CalendarEventRow {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  location_name: string | null;
  description: string | null;
  is_all_day: boolean;
  calendar_id: string;
  synced_at: string;
}

function rowToCalendarEvent(row: CalendarEventRow): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    startTime: row.start_time,
    endTime: row.end_time,
    locationName: row.location_name,
    description: row.description,
    isAllDay: row.is_all_day,
    calendarId: row.calendar_id,
    syncedAt: row.synced_at,
  };
}

/**
 * CalendarEvent エンティティのサービス
 * CalDAV から同期したイベントの管理を担当する
 */
export const calendarEventService = {
  /**
   * 全てのカレンダーイベントを取得する
   */
  async getAll(): Promise<CalendarEvent[]> {
    const db = await getDb();
    const result = await db.query<CalendarEventRow>(
      'SELECT * FROM calendar_events ORDER BY start_time'
    );
    return result.rows.map(rowToCalendarEvent);
  },

  /**
   * ID でイベントを取得する
   */
  async getById(id: string): Promise<CalendarEvent | null> {
    const db = await getDb();
    const result = await db.query<CalendarEventRow>('SELECT * FROM calendar_events WHERE id = $1', [
      id,
    ]);
    return result.rows[0] ? rowToCalendarEvent(result.rows[0]) : null;
  },

  /**
   * 特定の日付範囲のイベントを取得する
   * @param startDate 開始日（YYYY-MM-DD形式）
   * @param endDate 終了日（YYYY-MM-DD形式）
   */
  async getByDateRange(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    const db = await getDb();
    const result = await db.query<CalendarEventRow>(
      `SELECT * FROM calendar_events WHERE substr(start_time, 1, 10) >= $1 AND substr(start_time, 1, 10) <= $2 ORDER BY start_time`,
      [startDate, endDate]
    );
    return result.rows.map(rowToCalendarEvent);
  },

  /**
   * 特定の日付のイベントを取得する
   */
  async getByDate(date: string): Promise<CalendarEvent[]> {
    return this.getByDateRange(date, date);
  },

  /**
   * イベントを一括保存する（同期時に使用、既存データは上書き）
   */
  async saveAll(events: CalendarEvent[]): Promise<void> {
    const db = await getDb();
    await db.exec('DELETE FROM calendar_events');
    for (const e of events) {
      await db.query(
        `INSERT INTO calendar_events (id, title, start_time, end_time, location_name, description, is_all_day, calendar_id, synced_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          e.id,
          e.title,
          e.startTime,
          e.endTime,
          e.locationName ?? null,
          e.description ?? null,
          e.isAllDay,
          e.calendarId,
          e.syncedAt,
        ]
      );
    }
  },

  /**
   * イベントを upsert する（同期時に使用）
   */
  async upsertMany(events: CalendarEvent[]): Promise<void> {
    const db = await getDb();
    const syncedAt = now();
    for (const e of events) {
      await db.query(
        `INSERT INTO calendar_events (id, title, start_time, end_time, location_name, description, is_all_day, calendar_id, synced_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
           title=$2, start_time=$3, end_time=$4, location_name=$5, description=$6, is_all_day=$7, calendar_id=$8, synced_at=$9`,
        [
          e.id,
          e.title,
          e.startTime,
          e.endTime,
          e.locationName ?? null,
          e.description ?? null,
          e.isAllDay,
          e.calendarId,
          syncedAt,
        ]
      );
    }
  },

  /**
   * 全てのカレンダーイベントを削除する
   */
  async clear(): Promise<void> {
    const db = await getDb();
    await db.exec('DELETE FROM calendar_events');
  },
};
