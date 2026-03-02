'use client';

import type { CalendarEvent } from '@/types';
import { generateId } from '@/lib/utils/id';

/**
 * .ics（iCalendar）テキストをパースして CalendarEvent 配列を返す
 *
 * @param text .ics ファイルの全文テキスト
 * @returns パースに成功したイベントの配列
 */
export function parseIcsText(text: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  // VEVENT ブロックを全件抽出
  const veventPattern = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/gi;
  let match;

  while ((match = veventPattern.exec(text)) !== null) {
    const event = parseVEvent(match[1]);
    if (event) events.push(event);
  }

  return events;
}

/**
 * VEVENT ブロックのテキストから CalendarEvent を生成する
 */
function parseVEvent(vevent: string): CalendarEvent | null {
  try {
    const uid = extractField(vevent, 'UID') ?? generateId();
    const summary = extractField(vevent, 'SUMMARY');
    if (!summary) return null;

    const dtstart = extractField(vevent, 'DTSTART');
    const dtend = extractField(vevent, 'DTEND');
    if (!dtstart) return null;

    const startTime = parseICalDate(dtstart);
    const endTime = dtend ? parseICalDate(dtend) : startTime;

    // 終日イベント判定（VALUE=DATE または 8桁数字のみの値）
    const isAllDay =
      dtstart.includes('VALUE=DATE') || /^\d{8}$/.test(dtstart.split(':').pop() ?? '');

    const location = extractField(vevent, 'LOCATION');
    const description = extractField(vevent, 'DESCRIPTION');

    return {
      id: uid,
      title: unescapeICalText(summary),
      startTime,
      endTime,
      locationName: location ? unescapeICalText(location) : null,
      description: description ? unescapeICalText(description) : null,
      isAllDay,
      calendarId: 'ics-import',
      syncedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/**
 * VEVENT テキストから指定フィールドの値を抽出する
 *
 * FIELD:value および FIELD;params:value の両形式に対応。
 * RFC 5545 の折り返し行（CRLF + 先頭スペース/タブ）も結合する。
 */
function extractField(data: string, field: string): string | null {
  const regex = new RegExp(`^${field}(?:;[^:]*)?:(.+)$`, 'mi');
  const match = data.match(regex);
  if (!match) return null;
  return match[1].replace(/\r?\n[ \t]/g, '').trim();
}

/**
 * iCal の日時文字列（DTSTART / DTEND の値部分）を ISO 8601 形式に変換する
 *
 * @param value iCal 日時文字列（例: "20240301T090000Z", "20240301"）
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

  // すでに ISO 形式の場合はそのまま返す
  return rawValue;
}

/**
 * iCal テキストのエスケープ文字を元に戻す
 */
function unescapeICalText(text: string): string {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}
