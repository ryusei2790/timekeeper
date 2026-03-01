import { format, isSameDay, isToday, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

/**
 * Date を YYYY-MM-DD 形式にフォーマット
 * @param date フォーマット対象の Date
 */
export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * 今日の日付を YYYY-MM-DD 形式で返す
 */
export function todayString(): string {
  return formatDate(new Date());
}

/**
 * 日本語の日付表示（例: 3月1日（月））
 * @param date フォーマット対象の Date
 */
export function formatJapaneseDate(date: Date): string {
  return format(date, 'M月d日（E）', { locale: ja });
}

/**
 * Date が今日か確認
 * @param date 確認対象の Date
 */
export function isTodayDate(date: Date): boolean {
  return isToday(date);
}

/**
 * 2つの Date が同じ日か確認
 * @param a 比較元の Date
 * @param b 比較対象の Date
 */
export function areSameDay(a: Date, b: Date): boolean {
  return isSameDay(a, b);
}

/**
 * ISO 8601 文字列から Date に変換
 * @param isoStr ISO 8601 形式の文字列
 */
export function fromISOString(isoStr: string): Date {
  return parseISO(isoStr);
}
