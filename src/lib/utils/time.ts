import { addMinutes, differenceInMinutes, format, parse } from 'date-fns';

/**
 * HH:mm 文字列を Date オブジェクトにパースする（日付は今日）
 * @param timeStr HH:mm 形式の時刻文字列
 */
export function parseTime(timeStr: string): Date {
  return parse(timeStr, 'HH:mm', new Date());
}

/**
 * Date オブジェクトを HH:mm 文字列にフォーマットする
 * @param date フォーマット対象の Date
 */
export function formatTime(date: Date): string {
  return format(date, 'HH:mm');
}

/**
 * HH:mm 形式の時刻に指定した分数を加算する
 * @param timeStr 元の時刻（HH:mm）
 * @param minutes 加算する分数
 * @returns 加算後の時刻（HH:mm）
 */
export function addMinutesToTime(timeStr: string, minutes: number): string {
  const date = parseTime(timeStr);
  return formatTime(addMinutes(date, minutes));
}

/**
 * 2つの HH:mm 時刻の差分を分で返す
 * @param start 開始時刻（HH:mm）
 * @param end 終了時刻（HH:mm）
 * @returns 差分（分）、end が start より前の場合は負数
 */
export function minutesBetween(start: string, end: string): number {
  return differenceInMinutes(parseTime(end), parseTime(start));
}

/**
 * 現在時刻を HH:mm 形式で返す
 */
export function currentTimeString(): string {
  return format(new Date(), 'HH:mm');
}

/**
 * HH:mm 形式の時刻を比較する
 * @param start 比較元の時刻（HH:mm）
 * @param end 比較対象の時刻（HH:mm）
 * @returns start < end の場合 true
 */
export function isTimeBefore(start: string, end: string): boolean {
  return minutesBetween(start, end) > 0;
}

/**
 * RoutineItem の startTime と duration から endTime を計算する
 * @param startTime 開始時刻（HH:mm）
 * @param duration 所要時間（分）
 * @returns 終了時刻（HH:mm）
 */
export function calcEndTime(startTime: string, duration: number): string {
  return addMinutesToTime(startTime, duration);
}
