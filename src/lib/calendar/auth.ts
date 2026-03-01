'use client';

import { BaseStorage } from '@/lib/storage/base';
import { STORAGE_KEYS } from '@/constants/storage';
import type { CalendarAuth } from '@/types';

/** CalendarAuth を保存する Storage インスタンス */
const authStorage = new BaseStorage<CalendarAuth>(STORAGE_KEYS.calendarAuth);

/**
 * Apple CalDAV の標準エンドポイント
 * Apple ID + アプリ用パスワードで BasicAuth 認証する
 */
export const APPLE_CALDAV_URL = 'https://caldav.icloud.com';

/**
 * CalDAV 接続情報を保存する
 *
 * @param username Apple ID のメールアドレス
 * @param appPassword アプリ用パスワード（Apple ID の設定で生成）
 * @returns 保存された CalendarAuth
 */
export function saveCalendarAuth(username: string, appPassword: string): CalendarAuth {
  const now = new Date().toISOString();
  const auth: CalendarAuth = {
    provider: 'apple',
    username,
    serverUrl: APPLE_CALDAV_URL,
    accessToken: appPassword,
    createdAt: now,
    updatedAt: now,
  };

  // createdAt は既存認証があれば引き継ぐ
  const existing = authStorage.get();
  auth.createdAt = existing?.createdAt ?? now;

  authStorage.set(auth);
  return auth;
}

/**
 * 保存済みの CalDAV 認証情報を取得する
 *
 * @returns CalendarAuth（未接続の場合は null）
 */
export function getCalendarAuth(): CalendarAuth | null {
  return authStorage.get();
}

/**
 * CalDAV に接続済みかどうかを返す
 */
export function isCalendarConnected(): boolean {
  return authStorage.exists();
}

/**
 * CalDAV 認証情報を削除する（切断）
 */
export function disconnectCalendar(): void {
  authStorage.delete();
}

/**
 * 保存済み認証情報から BasicAuth ヘッダー値を生成する
 *
 * @param auth CalendarAuth
 * @returns "Basic <base64>" 形式の文字列
 */
export function buildBasicAuthHeader(auth: CalendarAuth): string {
  const credentials = `${auth.username}:${auth.accessToken}`;
  const encoded =
    typeof window !== 'undefined' ? btoa(credentials) : Buffer.from(credentials).toString('base64');
  return `Basic ${encoded}`;
}
