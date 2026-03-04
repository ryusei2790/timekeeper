import { DEFAULT_SETTINGS } from '@/constants';
import { getDb } from '@/lib/db';
import { now } from '@/lib/utils/id';
import type { CalendarSyncSettings, NotificationSettings, Settings } from '@/types';

interface SettingsRow {
  id: string;
  default_location_id: string;
  week_starts_on: 0 | 1;
  time_format: '12h' | '24h';
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  calendar_sync: CalendarSyncSettings;
  created_at: string;
  updated_at: string;
}

function rowToSettings(row: SettingsRow): Settings {
  return {
    defaultLocationId: row.default_location_id,
    weekStartsOn: row.week_starts_on,
    timeFormat: row.time_format,
    theme: row.theme,
    notifications: row.notifications,
    calendarSync: row.calendar_sync,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Settings エンティティのサービス
 * Settings は Singleton（1レコードのみ）
 */
export const settingsService = {
  /**
   * 設定を取得する
   */
  async get(): Promise<Settings | null> {
    const db = await getDb();
    const result = await db.query<SettingsRow>(`SELECT * FROM settings WHERE id = 'default'`);
    return result.rows[0] ? rowToSettings(result.rows[0]) : null;
  },

  /**
   * 設定が存在するか確認する
   */
  async exists(): Promise<boolean> {
    const settings = await this.get();
    return settings !== null;
  },

  /**
   * 設定を初期化する（初回起動時）
   */
  async initialize(defaultLocationId: string): Promise<Settings> {
    const db = await getDb();
    const settings: Settings = {
      ...DEFAULT_SETTINGS,
      defaultLocationId,
      createdAt: now(),
      updatedAt: now(),
    };
    await db.query(
      `INSERT INTO settings (id, default_location_id, week_starts_on, time_format, theme, notifications, calendar_sync, created_at, updated_at)
       VALUES ('default', $1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         default_location_id=$1, week_starts_on=$2, time_format=$3, theme=$4, notifications=$5, calendar_sync=$6, updated_at=$8`,
      [
        settings.defaultLocationId,
        settings.weekStartsOn,
        settings.timeFormat,
        settings.theme,
        JSON.stringify(settings.notifications),
        JSON.stringify(settings.calendarSync),
        settings.createdAt,
        settings.updatedAt,
      ]
    );
    return settings;
  },

  /**
   * 設定を更新する
   * @throws 設定が初期化されていない場合
   */
  async update(data: Partial<Omit<Settings, 'createdAt' | 'updatedAt'>>): Promise<Settings> {
    const current = await this.get();
    if (!current) {
      throw new Error('設定が初期化されていません。先に initialize() を呼び出してください。');
    }

    const updated: Settings = {
      ...current,
      ...data,
      updatedAt: now(),
    };
    const db = await getDb();
    await db.query(
      `UPDATE settings SET default_location_id=$1, week_starts_on=$2, time_format=$3, theme=$4, notifications=$5, calendar_sync=$6, updated_at=$7 WHERE id='default'`,
      [
        updated.defaultLocationId,
        updated.weekStartsOn,
        updated.timeFormat,
        updated.theme,
        JSON.stringify(updated.notifications),
        JSON.stringify(updated.calendarSync),
        updated.updatedAt,
      ]
    );
    return updated;
  },
};
