'use client';

import { migrateFromLocalStorage } from '@/lib/db/migrate';
import { settingsService } from '@/lib/data/settings';
import { useEffect } from 'react';

/**
 * PGlite の初期化と LocalStorage からのデータ移行を行うクライアントコンポーネント
 * layout.tsx に配置して、アプリ起動時に一度だけ実行される
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
        console.log('[DbInitializer] settings未初期化 → デフォルト値で初期化');
        await settingsService.initialize('');
      }
    }

    init().catch((error) => {
      console.error('[DbInitializer] 初期化失敗:', error);
    });
  }, []);

  return null;
}
