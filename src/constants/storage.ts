/**
 * LocalStorage のキー定数
 * 全てのキーをここで一元管理する
 */
export const STORAGE_KEYS = {
  locations: 'timekeeper_locations',
  routineItems: 'timekeeper_routine_items',
  patterns: 'timekeeper_patterns',
  travelRoutes: 'timekeeper_travel_routes',
  calendarEvents: 'timekeeper_calendar_events',
  dailyStates: 'timekeeper_daily_states',
  settings: 'timekeeper_settings',
  version: 'timekeeper_version',
} as const;

/** データバージョン（マイグレーション管理用） */
export const DATA_VERSION = 1;

/** アプリケーション名 */
export const APP_NAME = 'TimeKeeper';
