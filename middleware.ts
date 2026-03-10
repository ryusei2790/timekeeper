import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * セッション Cookie のリフレッシュのみを行うミドルウェア。
 * ルート保護は行わない（未ログインでも全機能利用可能）。
 */
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 環境変数未設定の場合はスルー（オフライン動作維持）
  if (!url || !key) {
    return NextResponse.next({ request });
  }

  // Supabase SSR 公式推奨パターン:
  // response を先に作成し、setAll でその response に Cookie を設定する
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // セッションを更新してCookieを同期する（getUser でサーバー検証）
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    /*
     * 以下を除く全リクエストにマッチ:
     * - _next/static（静的ファイル）
     * - _next/image（画像最適化）
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
