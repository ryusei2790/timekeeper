'use client';

import { createBrowserClient } from '@supabase/ssr';

let client: ReturnType<typeof createBrowserClient> | null = null;

/**
 * ブラウザ用 Supabase クライアントのシングルトンを返す。
 * 環境変数が未設定の場合は null を返す（オフライン動作を維持するため）。
 */
export function getSupabaseClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  client = createBrowserClient(url, key);
  return client;
}
