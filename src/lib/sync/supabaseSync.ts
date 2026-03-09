import { getDb } from '@/lib/db';
import { calendarEventService } from '@/lib/data/calendarEvents';
import { dailyStateService } from '@/lib/data/dailyState';
import { locationService } from '@/lib/data/locations';
import { patternService } from '@/lib/data/patterns';
import { routineItemService } from '@/lib/data/routineItems';
import { settingsService } from '@/lib/data/settings';
import { travelRouteService } from '@/lib/data/travelRoutes';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  calendarEventToRecord,
  locationToRecord,
  patternToRecord,
  routineItemToRecord,
  travelRouteToRecord,
} from './writeThrough';

// -----------------------------------------------
// uploadAll: PGlite → Supabase（ローカル優先）
// -----------------------------------------------

/**
 * PGlite の全データを Supabase へ一括アップロードする。
 * ログイン時にローカルにデータがある場合に使用する。
 */
export async function uploadAll(userId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  console.log('[supabaseSync] uploadAll 開始');

  const [locations, routineItems, patterns, travelRoutes, calendarEvents, dailyStates, settings] =
    await Promise.all([
      locationService.getAll(),
      routineItemService.getAll(),
      patternService.getAll(),
      travelRouteService.getAll(),
      calendarEventService.getAll(),
      dailyStateService.getAll(),
      settingsService.get(),
    ]);

  const upsertPromises: Promise<void>[] = [];

  if (locations.length > 0) {
    upsertPromises.push(
      supabase
        .from('locations')
        .upsert(
          locations.map((l) => locationToRecord(l, userId)),
          { onConflict: 'id' }
        )
        .then((res: { error: { message: string } | null }) => {
          const error = res.error;
          if (error) console.warn('[supabaseSync] locations upload 失敗:', error.message);
        })
    );
  }

  if (routineItems.length > 0) {
    upsertPromises.push(
      supabase
        .from('routine_items')
        .upsert(
          routineItems.map((r) => routineItemToRecord(r, userId)),
          { onConflict: 'id' }
        )
        .then((res: { error: { message: string } | null }) => {
          const error = res.error;
          if (error) console.warn('[supabaseSync] routine_items upload 失敗:', error.message);
        })
    );
  }

  if (patterns.length > 0) {
    upsertPromises.push(
      supabase
        .from('life_patterns')
        .upsert(
          patterns.map((p) => patternToRecord(p, userId)),
          { onConflict: 'id' }
        )
        .then((res: { error: { message: string } | null }) => {
          const error = res.error;
          if (error) console.warn('[supabaseSync] life_patterns upload 失敗:', error.message);
        })
    );
  }

  if (travelRoutes.length > 0) {
    upsertPromises.push(
      supabase
        .from('travel_routes')
        .upsert(
          travelRoutes.map((r) => travelRouteToRecord(r, userId)),
          { onConflict: 'id' }
        )
        .then((res: { error: { message: string } | null }) => {
          const error = res.error;
          if (error) console.warn('[supabaseSync] travel_routes upload 失敗:', error.message);
        })
    );
  }

  if (calendarEvents.length > 0) {
    upsertPromises.push(
      supabase
        .from('calendar_events')
        .upsert(
          calendarEvents.map((e) => calendarEventToRecord(e, userId)),
          { onConflict: 'id' }
        )
        .then((res: { error: { message: string } | null }) => {
          const error = res.error;
          if (error) console.warn('[supabaseSync] calendar_events upload 失敗:', error.message);
        })
    );
  }

  // daily_states: 複合 PK（id, user_id）
  if (dailyStates.length > 0) {
    const records = dailyStates.map((ds) => ({
      id: ds.date,
      user_id: userId,
      pattern_id: ds.patternId,
      current_location_id: ds.currentLocationId,
      active_event_id: ds.activeEventId,
      completed_event_ids: ds.completedEventIds,
      skipped_event_ids: ds.skippedEventIds,
      delays: ds.delays,
      generated_schedule: ds.generatedSchedule,
      created_at: ds.createdAt,
      updated_at: ds.updatedAt,
    }));
    upsertPromises.push(
      supabase
        .from('daily_states')
        .upsert(records, { onConflict: 'id,user_id' })
        .then((res: { error: { message: string } | null }) => {
          const error = res.error;
          if (error) console.warn('[supabaseSync] daily_states upload 失敗:', error.message);
        })
    );
  }

  // settings: PK = user_id
  // LWW: Supabase の updated_at と比較し、新しい方を優先する
  if (settings) {
    const settingsUploadPromise = (async () => {
      const { data: remoteSettings, error: fetchError } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) {
        console.warn('[supabaseSync] settings remote 取得失敗:', fetchError.message);
      }

      if (remoteSettings && remoteSettings.updated_at > settings.updatedAt) {
        // Supabase の方が新しい → ローカルに反映してアップロードをスキップ
        console.log('[supabaseSync] settings: Supabase が新しいためローカルに反映します');
        const db = await getDb();
        await db.query(
          `UPDATE settings SET
            default_location_id=$1, week_starts_on=$2, time_format=$3, theme=$4,
            notifications=$5, calendar_sync=$6, updated_at=$7
           WHERE id='default' AND updated_at < $7`,
          [
            remoteSettings.default_location_id,
            remoteSettings.week_starts_on,
            remoteSettings.time_format,
            remoteSettings.theme,
            JSON.stringify(remoteSettings.notifications),
            JSON.stringify(remoteSettings.calendar_sync),
            remoteSettings.updated_at,
          ]
        );
      } else {
        // ローカルの方が新しい（または Supabase に未保存）→ 通常通り upsert
        const { error } = await supabase.from('settings').upsert(
          {
            user_id: userId,
            default_location_id: settings.defaultLocationId,
            week_starts_on: settings.weekStartsOn,
            time_format: settings.timeFormat,
            theme: settings.theme,
            notifications: settings.notifications,
            calendar_sync: settings.calendarSync,
            created_at: settings.createdAt,
            updated_at: settings.updatedAt,
          },
          { onConflict: 'user_id' }
        );
        if (error) console.warn('[supabaseSync] settings upload 失敗:', error.message);
      }
    })();
    upsertPromises.push(settingsUploadPromise);
  }

  await Promise.all(upsertPromises);
  console.log('[supabaseSync] uploadAll 完了');
}

// -----------------------------------------------
// downloadAll: Supabase → PGlite（新デバイス用）
// -----------------------------------------------

/**
 * Supabase から PGlite へ全データをダウンロードする。
 * ローカルが空の場合（新デバイス）に使用する。
 * LWW（Last-Write-Wins）: updated_at / synced_at の辞書順比較で新しい方を優先。
 * サービス層を経由せず getDb() 直接使用（write-through の二重発火防止）。
 */
export async function downloadAll(userId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  console.log('[supabaseSync] downloadAll 開始');

  const [locRes, routineRes, patternRes, travelRes, calRes, dailyRes, settingsRes] =
    await Promise.all([
      supabase.from('locations').select('*').eq('user_id', userId),
      supabase.from('routine_items').select('*').eq('user_id', userId),
      supabase.from('life_patterns').select('*').eq('user_id', userId),
      supabase.from('travel_routes').select('*').eq('user_id', userId),
      supabase.from('calendar_events').select('*').eq('user_id', userId),
      supabase.from('daily_states').select('*').eq('user_id', userId),
      supabase.from('settings').select('*').eq('user_id', userId).maybeSingle(),
    ]);

  const db = await getDb();

  // locations
  for (const r of locRes.data ?? []) {
    await db.query(
      `INSERT INTO locations (id, name, aliases, address, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         name=$2, aliases=$3, address=$4, updated_at=$6
         WHERE locations.updated_at < $6`,
      [r.id, r.name, JSON.stringify(r.aliases), r.address, r.created_at, r.updated_at]
    );
  }

  // routine_items
  for (const r of routineRes.data ?? []) {
    await db.query(
      `INSERT INTO routine_items (id, name, duration, location_id, icon, color, is_flexible, priority, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         name=$2, duration=$3, location_id=$4, icon=$5, color=$6, is_flexible=$7, priority=$8, updated_at=$10
         WHERE routine_items.updated_at < $10`,
      [
        r.id,
        r.name,
        r.duration,
        r.location_id,
        r.icon,
        r.color,
        r.is_flexible,
        r.priority,
        r.created_at,
        r.updated_at,
      ]
    );
  }

  // life_patterns
  for (const r of patternRes.data ?? []) {
    await db.query(
      `INSERT INTO life_patterns (id, name, rules, pattern_items, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         name=$2, rules=$3, pattern_items=$4, updated_at=$6
         WHERE life_patterns.updated_at < $6`,
      [
        r.id,
        r.name,
        JSON.stringify(r.rules),
        JSON.stringify(r.pattern_items),
        r.created_at,
        r.updated_at,
      ]
    );
  }

  // travel_routes
  for (const r of travelRes.data ?? []) {
    await db.query(
      `INSERT INTO travel_routes (id, from_location_id, to_location_id, method, duration, is_default, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         from_location_id=$2, to_location_id=$3, method=$4, duration=$5, is_default=$6, updated_at=$8
         WHERE travel_routes.updated_at < $8`,
      [
        r.id,
        r.from_location_id,
        r.to_location_id,
        r.method,
        r.duration,
        r.is_default,
        r.created_at,
        r.updated_at,
      ]
    );
  }

  // calendar_events（LWW 基準: synced_at）
  for (const r of calRes.data ?? []) {
    await db.query(
      `INSERT INTO calendar_events (id, title, start_time, end_time, location_name, description, is_all_day, calendar_id, synced_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
         title=$2, start_time=$3, end_time=$4, location_name=$5, description=$6, is_all_day=$7, calendar_id=$8, synced_at=$9
         WHERE calendar_events.synced_at < $9`,
      [
        r.id,
        r.title,
        r.start_time,
        r.end_time,
        r.location_name,
        r.description,
        r.is_all_day,
        r.calendar_id,
        r.synced_at,
      ]
    );
  }

  // daily_states（複合 PK: date + user_id → PGlite は date のみ）
  for (const r of dailyRes.data ?? []) {
    await db.query(
      `INSERT INTO daily_states (date, pattern_id, current_location_id, active_event_id, completed_event_ids, skipped_event_ids, delays, generated_schedule, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (date) DO UPDATE SET
         pattern_id=$2, current_location_id=$3, active_event_id=$4, completed_event_ids=$5,
         skipped_event_ids=$6, delays=$7, generated_schedule=$8, updated_at=$10
         WHERE daily_states.updated_at < $10`,
      [
        r.id,
        r.pattern_id,
        r.current_location_id,
        r.active_event_id,
        JSON.stringify(r.completed_event_ids),
        JSON.stringify(r.skipped_event_ids),
        JSON.stringify(r.delays),
        JSON.stringify(r.generated_schedule),
        r.created_at,
        r.updated_at,
      ]
    );
  }

  // settings
  if (settingsRes.data) {
    const s = settingsRes.data;
    await db.query(
      `INSERT INTO settings (id, default_location_id, week_starts_on, time_format, theme, notifications, calendar_sync, created_at, updated_at)
       VALUES ('default', $1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         default_location_id=$1, week_starts_on=$2, time_format=$3, theme=$4,
         notifications=$5, calendar_sync=$6, updated_at=$8
         WHERE settings.updated_at < $8`,
      [
        s.default_location_id,
        s.week_starts_on,
        s.time_format,
        s.theme,
        JSON.stringify(s.notifications),
        JSON.stringify(s.calendar_sync),
        s.created_at,
        s.updated_at,
      ]
    );
  }

  console.log('[supabaseSync] downloadAll 完了');
}

// -----------------------------------------------
// syncOnLogin: ログイン時の同期振り分け
// -----------------------------------------------

/**
 * ログイン時の同期処理。
 * ローカルにデータがあれば uploadAll（ローカル優先）、
 * なければ downloadAll（新デバイス）。
 */
export async function syncOnLogin(userId: string): Promise<void> {
  const locations = await locationService.getAll();
  if (locations.length > 0) {
    await uploadAll(userId);
  } else {
    await downloadAll(userId);
  }
}
