import type { PGlite } from '@electric-sql/pglite';

/**
 * 全エンティティのDDLスキーマを初期化する
 */
export async function initSchema(db: PGlite): Promise<void> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS locations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      aliases JSONB NOT NULL DEFAULT '[]',
      address TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS routine_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      duration INTEGER NOT NULL,
      location_id TEXT,
      icon TEXT,
      color TEXT,
      is_flexible BOOLEAN NOT NULL DEFAULT false,
      priority INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS life_patterns (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      rules JSONB NOT NULL,
      pattern_items JSONB NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS travel_routes (
      id TEXT PRIMARY KEY,
      from_location_id TEXT NOT NULL,
      to_location_id TEXT NOT NULL,
      method TEXT NOT NULL,
      duration INTEGER NOT NULL,
      is_default BOOLEAN NOT NULL DEFAULT false,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS calendar_events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      location_name TEXT,
      description TEXT,
      is_all_day BOOLEAN NOT NULL DEFAULT false,
      calendar_id TEXT NOT NULL,
      synced_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS daily_states (
      date TEXT PRIMARY KEY,
      pattern_id TEXT NOT NULL,
      current_location_id TEXT NOT NULL,
      active_event_id TEXT,
      completed_event_ids JSONB NOT NULL DEFAULT '[]',
      skipped_event_ids JSONB NOT NULL DEFAULT '[]',
      delays JSONB NOT NULL DEFAULT '[]',
      generated_schedule JSONB NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY DEFAULT 'default',
      default_location_id TEXT NOT NULL DEFAULT '',
      week_starts_on INTEGER NOT NULL DEFAULT 0,
      time_format TEXT NOT NULL DEFAULT '24h',
      theme TEXT NOT NULL DEFAULT 'system',
      notifications JSONB NOT NULL DEFAULT '{}',
      calendar_sync JSONB NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT ''
    );
  `);
}
