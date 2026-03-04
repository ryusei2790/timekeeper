import type { PGlite } from '@electric-sql/pglite';
import { initSchema } from './schema';

let db: PGlite | null = null;
let initPromise: Promise<PGlite> | null = null;

/**
 * PGliteインスタンスを取得する（シングルトン）
 * IndexedDBに永続化される
 */
export async function getDb(): Promise<PGlite> {
  if (typeof window === 'undefined') {
    throw new Error('PGlite はブラウザ専用です');
  }

  if (db) return db;

  if (!initPromise) {
    initPromise = (async () => {
      const { PGlite } = await import('@electric-sql/pglite');
      const instance = new PGlite('idb://timekeeper');
      await initSchema(instance);
      db = instance;
      return db;
    })();
  }

  return initPromise;
}
