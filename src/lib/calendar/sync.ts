import { calendarEventService } from '@/lib/data/calendarEvents';
import { settingsService } from '@/lib/data/settings';
import type { CalendarEvent } from '@/types';

// -----------------------------------------------
// インポート処理
// -----------------------------------------------

/**
 * パース済みイベントを PGlite に保存する（差分計算あり）
 *
 * - 既存イベントとの差分を計算し、追加・更新・削除を反映する
 * - インポート成功後は Settings の lastSyncAt を更新する
 *
 * @param events .ics からパースしたイベント
 * @returns インポート結果サマリー
 */
export async function importCalendarEvents(events: CalendarEvent[]): Promise<SyncResult> {
  const result = await applyEventDiff(events);
  await updateLastSyncAt(new Date().toISOString());
  return result;
}

/**
 * 取得したイベントと既存イベントの差分を計算し DB に反映する
 */
async function applyEventDiff(fetchedEvents: CalendarEvent[]): Promise<SyncResult> {
  const existing = await calendarEventService.getAll();
  const existingMap = new Map(existing.map((e) => [e.id, e]));
  const fetchedMap = new Map(fetchedEvents.map((e) => [e.id, e]));

  let added = 0;
  let updated = 0;
  let deleted = 0;

  // 追加・更新
  const toUpsert: CalendarEvent[] = [];
  for (const event of fetchedEvents) {
    const old = existingMap.get(event.id);
    if (!old) {
      added++;
      toUpsert.push(event);
    } else if (hasEventChanged(old, event)) {
      updated++;
      toUpsert.push(event);
    }
  }

  if (toUpsert.length > 0) {
    await calendarEventService.upsertMany(toUpsert);
  }

  // 削除（ics-import カレンダーで今回取得されなかったイベントを除去）
  const toKeep = existing.filter((event) => {
    if (fetchedMap.has(event.id)) return true; // 今回取得済み → 残す
    if (event.calendarId !== 'ics-import') return true; // 他カレンダー → 触らない
    deleted++;
    return false; // ics-import で消えた → 削除
  });

  if (deleted > 0) {
    await calendarEventService.saveAll(toKeep);
  }

  return { added, updated, deleted, total: fetchedEvents.length };
}

/**
 * 2 つのイベントの内容が変更されているかチェックする
 */
function hasEventChanged(a: CalendarEvent, b: CalendarEvent): boolean {
  return (
    a.title !== b.title ||
    a.startTime !== b.startTime ||
    a.endTime !== b.endTime ||
    a.locationName !== b.locationName ||
    a.description !== b.description ||
    a.isAllDay !== b.isAllDay
  );
}

/**
 * Settings の calendarSync.lastSyncAt を更新する
 */
async function updateLastSyncAt(syncedAt: string): Promise<void> {
  try {
    const settings = await settingsService.get();
    if (!settings) return;

    await settingsService.update({
      calendarSync: {
        ...settings.calendarSync,
        lastSyncAt: syncedAt,
      },
    });
  } catch {
    // Settings 更新失敗はインポート失敗扱いにしない
  }
}

// -----------------------------------------------
// Google Calendar 用インポート処理
// -----------------------------------------------

/**
 * Google Calendar iCal URL からパースしたイベントを PGlite に保存する（差分計算あり）
 *
 * - calendarId を 'google-calendar' で統一する
 * - 'google-calendar' カレンダーのイベントのみ差分管理（他カレンダーは触らない）
 * - 保存成功後は Settings の googleLastSyncAt を更新する
 *
 * @param events .ics からパースしたイベント
 * @returns インポート結果サマリー
 */
export async function importCalendarEventsFromGoogle(events: CalendarEvent[]): Promise<SyncResult> {
  // calendarId を 'google-calendar' で上書き
  const googleEvents = events.map((e) => ({ ...e, calendarId: 'google-calendar' }));

  const existing = await calendarEventService.getAll();
  const existingMap = new Map(existing.map((e) => [e.id, e]));
  const fetchedMap = new Map(googleEvents.map((e) => [e.id, e]));

  let added = 0;
  let updated = 0;
  let deleted = 0;

  // 追加・更新
  const toUpsert: CalendarEvent[] = [];
  for (const event of googleEvents) {
    const old = existingMap.get(event.id);
    if (!old) {
      added++;
      toUpsert.push(event);
    } else if (hasEventChanged(old, event)) {
      updated++;
      toUpsert.push(event);
    }
  }
  if (toUpsert.length > 0) {
    await calendarEventService.upsertMany(toUpsert);
  }

  // 削除（google-calendar で今回取得されなかったイベントを除去）
  const toKeep = existing.filter((event) => {
    if (fetchedMap.has(event.id)) return true; // 今回取得済み → 残す
    if (event.calendarId !== 'google-calendar') return true; // 他カレンダー → 触らない
    deleted++;
    return false; // google-calendar で消えた → 削除
  });
  if (deleted > 0) {
    await calendarEventService.saveAll(toKeep);
  }

  await updateGoogleLastSyncAt(new Date().toISOString());
  return { added, updated, deleted, total: googleEvents.length };
}

/**
 * Settings の calendarSync.googleLastSyncAt を更新する
 */
async function updateGoogleLastSyncAt(syncedAt: string): Promise<void> {
  try {
    const settings = await settingsService.get();
    if (!settings) return;
    await settingsService.update({
      calendarSync: { ...settings.calendarSync, googleLastSyncAt: syncedAt },
    });
  } catch {
    // Settings 更新失敗は同期失敗扱いにしない
  }
}

// -----------------------------------------------
// 型定義
// -----------------------------------------------

/**
 * インポート処理の結果サマリー
 */
export interface SyncResult {
  /** 新規追加されたイベント数 */
  added: number;
  /** 更新されたイベント数 */
  updated: number;
  /** 削除されたイベント数 */
  deleted: number;
  /** 取得したイベントの合計数 */
  total: number;
}
