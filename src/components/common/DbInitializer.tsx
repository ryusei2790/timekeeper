'use client';

import { migrateFromLocalStorage } from '@/lib/db/migrate';
import { settingsService } from '@/lib/data/settings';
import { getDb } from '@/lib/db';
import { syncOnLogin } from '@/lib/sync/supabaseSync';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect } from 'react';

/**
 * PGlite の初期化と LocalStorage からのデータ移行を行うクライアントコンポーネント。
 * Auth 初期化と syncOnLogin も担当する。
 * layout.tsx に配置して、アプリ起動時に一度だけ実行される。
 */
export function DbInitializer() {
  useEffect(() => {
    async function init() {
      console.log('[DbInitializer] マイグレーション開始');
      await migrateFromLocalStorage();
      console.log('[DbInitializer] マイグレーション完了');

      // settings が未初期化の場合はデフォルト値で初期化する
      const existing = await settingsService.get();
      if (!existing) {
        const db = await getDb();
        const { rows } = await db.query<{ id: string }>('SELECT id FROM locations LIMIT 1');
        const defaultLocationId = rows[0]?.id ?? '';
        console.log(
          `[DbInitializer] settings未初期化 → 初期化 (defaultLocationId="${defaultLocationId}")`
        );
        await settingsService.initialize(defaultLocationId);
      }

      // Auth 初期化（セッション確認）
      await useAuthStore.getState().initialize();
      console.log('[DbInitializer] Auth 初期化完了');

      // ログイン中なら Supabase と同期
      const user = useAuthStore.getState().user;
      if (user) {
        console.log('[DbInitializer] syncOnLogin 開始');
        await syncOnLogin(user.id);
        console.log('[DbInitializer] syncOnLogin 完了');
      }
    }

    init().catch((error) => {
      console.error('[DbInitializer] 初期化失敗:', error);
    });
  }, []);

  return null;
}
