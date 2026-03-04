'use client';

import { migrateFromLocalStorage } from '@/lib/db/migrate';
import { useEffect } from 'react';

/**
 * PGlite の初期化と LocalStorage からのデータ移行を行うクライアントコンポーネント
 * layout.tsx に配置して、アプリ起動時に一度だけ実行される
 */
export function DbInitializer() {
  useEffect(() => {
    migrateFromLocalStorage().catch((error) => {
      console.error('[DbInitializer] 移行に失敗しました:', error);
    });
  }, []);

  return null;
}
