'use client';

import { fetchEvents } from './caldav';
import { calendarEventService } from '@/lib/data/calendarEvents';
import { settingsService } from '@/lib/data/settings';
import type { CalendarEvent } from '@/types';

// -----------------------------------------------
// 同期範囲の設定
// -----------------------------------------------

/** 同期対象の前後日数（今日を基準に前後何日分を取得するか） */
const SYNC_RANGE_DAYS_BEFORE = 1;
const SYNC_RANGE_DAYS_AFTER = 14;

// -----------------------------------------------
// 同期処理
// -----------------------------------------------

/**
 * CalDAV からイベントを取得して LocalStorage に保存する
 *
 * - 既存イベントとの差分を計算し、追加・更新・削除を反映する
 * - 同期成功後は Settings の lastSyncAt を更新する
 *
 * @returns 同期結果サマリー
 * @throws CalDAV 通信エラーの場合
 */
export async function syncCalendarEvents(): Promise<SyncResult> {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - SYNC_RANGE_DAYS_BEFORE);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + SYNC_RANGE_DAYS_AFTER);
  endDate.setHours(23, 59, 59, 999);

  // CalDAV からイベントを取得
  const fetchedEvents = await fetchEvents(startDate, endDate);

  // 差分計算と保存
  const result = applyEventDiff(fetchedEvents);

  // 最終同期日時を Settings に記録
  updateLastSyncAt(now.toISOString());

  return result;
}

/**
 * 取得したイベントと既存イベントの差分を計算し LocalStorage に反映する
 *
 * @param fetchedEvents CalDAV から取得したイベント
 * @returns 同期結果サマリー
 */
function applyEventDiff(fetchedEvents: CalendarEvent[]): SyncResult {
  const existing = calendarEventService.getAll();
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
    } else if (old.syncedAt !== event.syncedAt || hasEventChanged(old, event)) {
      updated++;
      toUpsert.push(event);
    }
  }

  if (toUpsert.length > 0) {
    calendarEventService.upsertMany(toUpsert);
  }

  // 削除（同期範囲内で取得されなかったイベントを除去）
  const toKeep = existing.filter((event) => {
    if (fetchedMap.has(event.id)) return true; // 今回取得済み → 残す
    if (!isEventInSyncRange(event)) return true; // 範囲外 → 削除しない
    deleted++;
    return false; // 範囲内で消えた → 削除
  });

  if (deleted > 0) {
    calendarEventService.saveAll(toKeep);
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
 * イベントが同期範囲内かどうかを判定する
 */
function isEventInSyncRange(event: CalendarEvent): boolean {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - SYNC_RANGE_DAYS_BEFORE);

  const end = new Date(now);
  end.setDate(end.getDate() + SYNC_RANGE_DAYS_AFTER);

  const eventStart = new Date(event.startTime);
  return eventStart >= start && eventStart <= end;
}

/**
 * Settings の calendarSync.lastSyncAt を更新する
 */
function updateLastSyncAt(syncedAt: string): void {
  try {
    const settings = settingsService.get();
    if (!settings) return;

    settingsService.update({
      calendarSync: {
        ...settings.calendarSync,
        lastSyncAt: syncedAt,
      },
    });
  } catch {
    // Settings 更新失敗は同期失敗扱いにしない
  }
}

// -----------------------------------------------
// 型定義
// -----------------------------------------------

/**
 * 同期処理の結果サマリー
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
