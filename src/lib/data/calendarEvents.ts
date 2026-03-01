import { calendarEventsStorage } from '@/lib/storage';
import { now } from '@/lib/utils/id';
import type { CalendarEvent } from '@/types';

/**
 * CalendarEvent エンティティのサービス
 * CalDAV から同期したイベントの管理を担当する
 */
export const calendarEventService = {
  /**
   * 全てのカレンダーイベントを取得する
   */
  getAll(): CalendarEvent[] {
    return calendarEventsStorage.get() ?? [];
  },

  /**
   * ID でイベントを取得する
   */
  getById(id: string): CalendarEvent | null {
    return this.getAll().find((e) => e.id === id) ?? null;
  },

  /**
   * 特定の日付範囲のイベントを取得する
   * @param startDate 開始日（YYYY-MM-DD形式）
   * @param endDate 終了日（YYYY-MM-DD形式）
   */
  getByDateRange(startDate: string, endDate: string): CalendarEvent[] {
    return this.getAll().filter((e) => {
      const eventDate = e.startTime.substring(0, 10);
      return eventDate >= startDate && eventDate <= endDate;
    });
  },

  /**
   * 特定の日付のイベントを取得する
   * @param date 日付（YYYY-MM-DD形式）
   */
  getByDate(date: string): CalendarEvent[] {
    return this.getByDateRange(date, date);
  },

  /**
   * イベントを一括保存する（同期時に使用）
   * 既存データは上書きされる
   * @param events 保存するイベントの配列
   */
  saveAll(events: CalendarEvent[]): void {
    calendarEventsStorage.set(events);
  },

  /**
   * イベントを upsert する（同期時に使用）
   * 既存の ID は更新、新規 ID は追加する
   * @param events 同期するイベントの配列
   */
  upsertMany(events: CalendarEvent[]): void {
    const existing = this.getAll();
    const eventMap = new Map(existing.map((e) => [e.id, e]));

    const syncedAt = now();
    for (const event of events) {
      eventMap.set(event.id, { ...event, syncedAt });
    }

    calendarEventsStorage.set(Array.from(eventMap.values()));
  },

  /**
   * 全てのカレンダーイベントを削除する
   */
  clear(): void {
    calendarEventsStorage.set([]);
  },
};
