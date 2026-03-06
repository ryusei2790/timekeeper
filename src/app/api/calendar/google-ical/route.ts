import { NextResponse } from 'next/server';

/**
 * Google Calendar iCal URL プロキシ
 *
 * ブラウザから直接 Google Calendar の iCal URL にアクセスすると CORS エラーになるため、
 * サーバーサイドでフェッチしてテキストを返すプロキシ。
 * google.com ドメインのみ許可する（SSRFリスク軽減）。
 */
export async function POST(request: Request): Promise<Response> {
  let url: unknown;
  try {
    const body = await request.json();
    url = body.url;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'url is required' }, { status: 400 });
  }

  // URL バリデーション（google.com ドメインのみ許可）
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  if (!parsed.hostname.endsWith('google.com')) {
    return NextResponse.json({ error: 'Only google.com URLs are allowed' }, { status: 400 });
  }

  // Google iCal URL にフェッチ
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch calendar' }, { status: 502 });
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: `Google Calendar returned ${response.status}` },
      { status: 502 }
    );
  }

  const icsText = await response.text();
  return new Response(icsText, {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
}
