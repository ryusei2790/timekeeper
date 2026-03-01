import type { CalendarEvent, LifePattern } from '@/types';

/**
 * 日付・カレンダー予定に基づいて適用するパターンを選択する
 *
 * 優先順位:
 * 1. カレンダー予定のタイトルがキーワードにマッチするパターン（priority 降順）
 * 2. 曜日がマッチするパターン（priority 降順）
 * 3. isDefault=true のパターン
 *
 * @param date 対象日
 * @param patterns 全パターン一覧
 * @param calendarEvents その日のカレンダー予定
 * @returns 選択されたパターン。パターンがない場合は null
 */
export function selectPattern(
  date: Date,
  patterns: LifePattern[],
  calendarEvents: CalendarEvent[]
): LifePattern | null {
  if (patterns.length === 0) return null;

  const dayOfWeek = date.getDay(); // 0=日, 1=月, ..., 6=土
  const eventTitles = calendarEvents.map((e) => e.title.toLowerCase());

  // 1. キーワードマッチング
  const keywordMatches = patterns.filter((p) => {
    if (p.rules.keywords.length === 0) return false;
    return p.rules.keywords.some((kw) =>
      eventTitles.some((title) => title.includes(kw.toLowerCase()))
    );
  });

  if (keywordMatches.length > 0) {
    return keywordMatches.sort((a, b) => b.rules.priority - a.rules.priority)[0];
  }

  // 2. 曜日マッチング
  const dayMatches = patterns.filter(
    (p) => p.rules.dayOfWeek.length > 0 && p.rules.dayOfWeek.includes(dayOfWeek)
  );

  if (dayMatches.length > 0) {
    return dayMatches.sort((a, b) => b.rules.priority - a.rules.priority)[0];
  }

  // 3. デフォルトパターン
  const defaultPattern = patterns.find((p) => p.rules.isDefault);
  if (defaultPattern) return defaultPattern;

  // 4. フォールバック（パターンが存在すれば最初の1件）
  return patterns[0];
}
