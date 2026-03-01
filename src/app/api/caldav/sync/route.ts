import { syncCalendarEvents } from '@/lib/calendar/sync';
import { APPLE_CALDAV_URL } from '@/lib/calendar/auth';
import type { CalendarAuth } from '@/types';
import { NextResponse } from 'next/server';

/**
 * POST /api/caldav/sync
 *
 * ブラウザから CalDAV に直接アクセスすると CORS エラーになるため、
 * このエンドポイントをサーバーサイドプロキシとして使用する。
 *
 * Request body: { username: string; accessToken: string }
 * Response: SyncResult
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, accessToken } = body as { username: string; accessToken: string };

    if (!username || !accessToken) {
      return NextResponse.json({ error: '認証情報が不足しています' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const auth: CalendarAuth = {
      provider: 'apple',
      username,
      serverUrl: APPLE_CALDAV_URL,
      accessToken,
      createdAt: now,
      updatedAt: now,
    };

    const result = await syncCalendarEvents(auth);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : '同期に失敗しました';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
