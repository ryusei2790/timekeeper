import { DEFAULT_SETTINGS } from '@/constants';
import { settingsStorage } from '@/lib/storage';
import { now } from '@/lib/utils/id';
import type { Settings } from '@/types';

/**
 * Settings エンティティのサービス
 * Settings は Singleton（1レコードのみ）
 */
export const settingsService = {
  /**
   * 設定を取得する
   * 未設定の場合は null を返す（初回セットアップが必要）
   */
  get(): Settings | null {
    return settingsStorage.get();
  },

  /**
   * 設定が存在するか確認する
   */
  exists(): boolean {
    return settingsStorage.exists();
  },

  /**
   * 設定を初期化する（初回起動時）
   * @param defaultLocationId デフォルトの場所 ID
   * @returns 初期化された Settings
   */
  initialize(defaultLocationId: string): Settings {
    const settings: Settings = {
      ...DEFAULT_SETTINGS,
      defaultLocationId,
      createdAt: now(),
      updatedAt: now(),
    };
    settingsStorage.set(settings);
    return settings;
  },

  /**
   * 設定を更新する
   * @param data 更新するフィールド
   * @throws 設定が初期化されていない場合
   */
  update(data: Partial<Omit<Settings, 'createdAt' | 'updatedAt'>>): Settings {
    const current = this.get();
    if (!current) {
      throw new Error('設定が初期化されていません。先に initialize() を呼び出してください。');
    }

    const updated: Settings = {
      ...current,
      ...data,
      updatedAt: now(),
    };
    settingsStorage.set(updated);
    return updated;
  },
};
