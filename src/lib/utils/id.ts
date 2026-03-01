import { v4 as uuidv4 } from 'uuid';

/**
 * UUID v4 を生成する
 * @returns UUID v4 文字列
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * 現在時刻の ISO 8601 文字列を生成する
 * @returns ISO 8601 形式の日時文字列
 */
export function now(): string {
  return new Date().toISOString();
}
