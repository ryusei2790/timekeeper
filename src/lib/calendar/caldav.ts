'use client';

import { createDAVClient, DAVCalendar, DAVCalendarObject } from 'tsdav';
import { getCalendarAuth } from './auth';
import type { CalendarAuth, CalendarEvent } from '@/types';
import { generateId } from '@/lib/utils/id';

// -----------------------------------------------
// DAV クライアント生成
// -----------------------------------------------

/**
 * tsdav の DAV クライアントを生成する
 *
 * @param auth 認証情報
 * @returns 初期化済み DAVClient
 */
async function createClient(auth: CalendarAuth) {
  const client = await createDAVClient({
    serverUrl: auth.serverUrl,
    credentials: {
      username: auth.username,
      password: auth.accessToken,
    },
    authMethod: 'Basic',
    defaultAccountType: 'caldav',
  });
  return client;
}

// -----------------------------------------------
// カレンダー一覧の取得
// -----------------------------------------------

/**
 * サーバー上のカレンダー一覧を取得する
 *
 * @returns カレンダーオブジェクトの配列
 * @throws 未接続の場合、または通信エラーの場合
 */
export async function fetchCalendars(): Promise<DAVCalendar[]> {
  const auth = getCalendarAuth();
  if (!auth) throw new Error('CalDAV 認証情報が見つかりません');

  const client = await createClient(auth);
  return client.fetchCalendars();
}

// -----------------------------------------------
// イベントの取得
// -----------------------------------------------

/**
 * 指定期間のカレンダーイベントを取得する
 *
 * @param startDate 取得開始日（Date オブジェクト）
 * @param endDate 取得終了日（Date オブジェクト）
 * @returns CalendarEvent の配列
 * @throws 未接続の場合、または通信エラーの場合
 */
export async function fetchEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
  const auth = getCalendarAuth();
  if (!auth) throw new Error('CalDAV 認証情報が見つかりません');

  const client = await createClient(auth);
  const calendars = await client.fetchCalendars();

  const allEvents: CalendarEvent[] = [];

  for (const calendar of calendars) {
    const objects = await client.fetchCalendarObjects({
      calendar,
      timeRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    });

    for (const obj of objects) {
      const event = parseCalendarObject(obj, calendar.url ?? '');
      if (event) allEvents.push(event);
    }
  }

  return allEvents;
}

// -----------------------------------------------
// iCal パース
// -----------------------------------------------

/**
 * DAVCalendarObject を CalendarEvent に変換する
 *
 * @param obj tsdav から取得した CalendarObject
 * @param calendarId カレンダー識別子（URL）
 * @returns CalendarEvent（パース失敗時は null）
 */
function parseCalendarObject(obj: DAVCalendarObject, calendarId: string): CalendarEvent | null {
  try {
    const data: string = typeof obj.data === 'string' ? obj.data : '';

    // UID
    const uid = extractICalField(data, 'UID') ?? obj.url ?? generateId();

    // タイトル
    const summary = extractICalField(data, 'SUMMARY');
    if (!summary) return null;

    // 開始・終了
    const dtstart = extractICalField(data, 'DTSTART');
    const dtend = extractICalField(data, 'DTEND');
    if (!dtstart) return null;

    const startTime = parseICalDate(dtstart);
    const endTime = dtend ? parseICalDate(dtend) : startTime;

    // 終日イベント判定（VALUE=DATE の場合）
    const isAllDay =
      dtstart.includes('VALUE=DATE') || /^\d{8}$/.test(dtstart.split(':').pop() ?? '');

    // 場所・説明
    const location = extractICalField(data, 'LOCATION');
    const description = extractICalField(data, 'DESCRIPTION');

    return {
      id: uid,
      title: unescapeICalText(summary),
      startTime,
      endTime,
      locationName: location ? unescapeICalText(location) : null,
      description: description ? unescapeICalText(description) : null,
      isAllDay,
      calendarId,
      syncedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/**
 * iCal テキストから指定フィールドの値を抽出する
 *
 * @param data iCal テキスト全体
 * @param field フィールド名（例: "SUMMARY", "DTSTART"）
 * @returns 値文字列（見つからない場合は null）
 */
function extractICalField(data: string, field: string): string | null {
  // FIELD;params:value または FIELD:value の両形式に対応
  const regex = new RegExp(`^${field}(?:;[^:]*)?:(.+)$`, 'mi');
  const match = data.match(regex);
  if (!match) return null;

  // 折り返し行（RFC 5545: 行末 CRLF + 先頭スペース/タブ）を結合
  return match[1].replace(/\r?\n[ \t]/g, '').trim();
}

/**
 * iCal の日時文字列（DTSTART/DTEND の値部分）を ISO 8601 形式に変換する
 *
 * @param value iCal 日時文字列（例: "20240301T090000Z", "20240301"）
 * @returns ISO 8601 形式の文字列
 */
function parseICalDate(value: string): string {
  // "VALUE=DATE:" または "TZID=...:" プレフィックスを除去
  const rawValue = value.includes(':') ? value.split(':').pop()! : value;

  if (/^\d{8}T\d{6}Z$/.test(rawValue)) {
    // UTC: 20240301T090000Z → 2024-03-01T09:00:00Z
    return `${rawValue.slice(0, 4)}-${rawValue.slice(4, 6)}-${rawValue.slice(6, 8)}T${rawValue.slice(9, 11)}:${rawValue.slice(11, 13)}:${rawValue.slice(13, 15)}Z`;
  }

  if (/^\d{8}T\d{6}$/.test(rawValue)) {
    // ローカル時刻: 20240301T090000 → 2024-03-01T09:00:00
    return `${rawValue.slice(0, 4)}-${rawValue.slice(4, 6)}-${rawValue.slice(6, 8)}T${rawValue.slice(9, 11)}:${rawValue.slice(11, 13)}:${rawValue.slice(13, 15)}`;
  }

  if (/^\d{8}$/.test(rawValue)) {
    // 終日: 20240301 → 2024-03-01T00:00:00
    return `${rawValue.slice(0, 4)}-${rawValue.slice(4, 6)}-${rawValue.slice(6, 8)}T00:00:00`;
  }

  // そのまま返す（すでに ISO 形式の場合）
  return rawValue;
}

/**
 * iCal テキストのエスケープ文字を元に戻す
 *
 * @param text エスケープされた iCal テキスト
 * @returns アンエスケープ後のテキスト
 */
function unescapeICalText(text: string): string {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}
