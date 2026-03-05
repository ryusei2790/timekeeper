import { now } from '@/lib/utils/id';
import type {
  CalendarEvent,
  DailyState,
  LifePattern,
  Location,
  RoutineItem,
  Settings,
  TravelRoute,
} from '@/types';
import { getDb } from './index';

const STORAGE_KEYS = {
  locations: 'timekeeper_locations',
  routineItems: 'timekeeper_routine_items',
  patterns: 'timekeeper_patterns',
  travelRoutes: 'timekeeper_travel_routes',
  calendarEvents: 'timekeeper_calendar_events',
  dailyStates: 'timekeeper_daily_states',
  settings: 'timekeeper_settings',
} as const;

const MIGRATION_FLAG_KEY = 'timekeeper_migrated_to_pglite';

function readLocalStorage<T>(key: string): T[] | null {
  try {
    const item = window.localStorage.getItem(key);
    if (!item) return null;
    return JSON.parse(item) as T[];
  } catch {
    return null;
  }
}

/**
 * LocalStorage のデータを PGlite に移行する（初回のみ実行）
 */
export async function migrateFromLocalStorage(): Promise<void> {
  if (typeof window === 'undefined') return;

  console.log('[DB:Migrate] マイグレーション確認中...');
  const migrationFlag = window.localStorage.getItem(MIGRATION_FLAG_KEY);
  console.log(
    `[DB:Migrate] 移行済みフラグ: ${migrationFlag ? `あり (${migrationFlag})` : 'なし → 移行を実行'}`
  );

  // 既に移行済みなら何もしない
  if (migrationFlag) return;

  const db = await getDb();

  // locations
  const locations = readLocalStorage<Location>(STORAGE_KEYS.locations);
  console.log(`[DB:Migrate] locations: ${locations ? `${locations.length}件` : 'データなし'}`);
  if (locations) {
    for (const loc of locations) {
      await db.query(
        `INSERT INTO locations (id, name, aliases, address, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
        [
          loc.id,
          loc.name,
          JSON.stringify(loc.aliases),
          loc.address ?? null,
          loc.createdAt,
          loc.updatedAt,
        ]
      );
    }
  }

  // routine_items
  const routineItems = readLocalStorage<RoutineItem>(STORAGE_KEYS.routineItems);
  console.log(
    `[DB:Migrate] routine_items: ${routineItems ? `${routineItems.length}件` : 'データなし'}`
  );
  if (routineItems) {
    for (const item of routineItems) {
      await db.query(
        `INSERT INTO routine_items (id, name, duration, location_id, icon, color, is_flexible, priority, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING`,
        [
          item.id,
          item.name,
          item.duration,
          item.locationId ?? null,
          item.icon ?? null,
          item.color ?? null,
          item.isFlexible,
          item.priority,
          item.createdAt,
          item.updatedAt,
        ]
      );
    }
  }

  // life_patterns
  const patterns = readLocalStorage<LifePattern>(STORAGE_KEYS.patterns);
  console.log(`[DB:Migrate] life_patterns: ${patterns ? `${patterns.length}件` : 'データなし'}`);
  if (patterns) {
    for (const p of patterns) {
      await db.query(
        `INSERT INTO life_patterns (id, name, rules, pattern_items, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
        [
          p.id,
          p.name,
          JSON.stringify(p.rules),
          JSON.stringify(p.patternItems ?? []),
          p.createdAt,
          p.updatedAt,
        ]
      );
    }
  }

  // travel_routes
  const travelRoutes = readLocalStorage<TravelRoute>(STORAGE_KEYS.travelRoutes);
  console.log(
    `[DB:Migrate] travel_routes: ${travelRoutes ? `${travelRoutes.length}件` : 'データなし'}`
  );
  if (travelRoutes) {
    for (const r of travelRoutes) {
      await db.query(
        `INSERT INTO travel_routes (id, from_location_id, to_location_id, method, duration, is_default, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
        [
          r.id,
          r.fromLocationId,
          r.toLocationId,
          r.method,
          r.duration,
          r.isDefault,
          r.createdAt,
          r.updatedAt,
        ]
      );
    }
  }

  // calendar_events
  const calendarEvents = readLocalStorage<CalendarEvent>(STORAGE_KEYS.calendarEvents);
  console.log(
    `[DB:Migrate] calendar_events: ${calendarEvents ? `${calendarEvents.length}件` : 'データなし'}`
  );
  if (calendarEvents) {
    for (const e of calendarEvents) {
      await db.query(
        `INSERT INTO calendar_events (id, title, start_time, end_time, location_name, description, is_all_day, calendar_id, synced_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING`,
        [
          e.id,
          e.title,
          e.startTime,
          e.endTime,
          e.locationName ?? null,
          e.description ?? null,
          e.isAllDay,
          e.calendarId,
          e.syncedAt,
        ]
      );
    }
  }

  // daily_states
  const dailyStates = readLocalStorage<DailyState>(STORAGE_KEYS.dailyStates);
  console.log(
    `[DB:Migrate] daily_states: ${dailyStates ? `${dailyStates.length}件` : 'データなし'}`
  );
  if (dailyStates) {
    for (const s of dailyStates) {
      await db.query(
        `INSERT INTO daily_states (date, pattern_id, current_location_id, active_event_id, completed_event_ids, skipped_event_ids, delays, generated_schedule, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (date) DO NOTHING`,
        [
          s.date,
          s.patternId,
          s.currentLocationId,
          s.activeEventId ?? null,
          JSON.stringify(s.completedEventIds),
          JSON.stringify(s.skippedEventIds),
          JSON.stringify(s.delays),
          JSON.stringify(s.generatedSchedule),
          s.createdAt,
          s.updatedAt,
        ]
      );
    }
  }

  // settings (singleton)
  const settingsRaw = window.localStorage.getItem(STORAGE_KEYS.settings);
  console.log(`[DB:Migrate] settings: ${settingsRaw ? 'あり' : 'データなし'}`);
  if (settingsRaw) {
    try {
      const s = JSON.parse(settingsRaw) as Settings;
      await db.query(
        `INSERT INTO settings (id, default_location_id, week_starts_on, time_format, theme, notifications, calendar_sync, created_at, updated_at)
         VALUES ('default', $1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
        [
          s.defaultLocationId,
          s.weekStartsOn,
          s.timeFormat,
          s.theme,
          JSON.stringify(s.notifications),
          JSON.stringify(s.calendarSync),
          s.createdAt,
          s.updatedAt,
        ]
      );
    } catch {
      // 設定が壊れていた場合は無視
    }
  }

  // 移行完了フラグを設定
  window.localStorage.setItem(MIGRATION_FLAG_KEY, now());

  console.log('[DB] LocalStorage から PGlite への移行が完了しました');
}
