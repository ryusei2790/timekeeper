import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';
import type {
  CalendarEvent,
  DailyState,
  LifePattern,
  Location,
  RoutineItem,
  Settings,
  TravelRoute,
} from '@/types';

// -----------------------------------------------
// 型エイリアス
// -----------------------------------------------

type RegularTable =
  | 'locations'
  | 'routine_items'
  | 'life_patterns'
  | 'travel_routes'
  | 'calendar_events';

// -----------------------------------------------
// 通常テーブル用（id PRIMARY KEY）
// -----------------------------------------------

/**
 * 5つの通常テーブルへの upsert（ベストエフォート）。
 * RLS により user_id フィルタは Supabase が自動で適用する。
 */
export async function syncUpsert(
  table: RegularTable,
  record: Record<string, unknown>
): Promise<void> {
  const supabase = getSupabaseClient();
  const user = useAuthStore.getState().user;
  if (!supabase || !user) return;

  const { error } = await supabase.from(table).upsert(record, { onConflict: 'id' });
  if (error) {
    console.warn(`[writeThrough] ${table} upsert 失敗:`, error.message);
  }
}

/**
 * 5つの通常テーブルからの delete（ベストエフォート）。
 */
export async function syncDelete(table: RegularTable, id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const user = useAuthStore.getState().user;
  if (!supabase || !user) return;

  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) {
    console.warn(`[writeThrough] ${table} delete 失敗:`, error.message);
  }
}

// -----------------------------------------------
// daily_states 用（複合 PK: id + user_id）
// -----------------------------------------------

/**
 * daily_states への upsert（ベストエフォート）。
 */
export async function syncDailyStateUpsert(state: DailyState): Promise<void> {
  const supabase = getSupabaseClient();
  const user = useAuthStore.getState().user;
  if (!supabase || !user) return;

  const record = {
    id: state.date,
    user_id: user.id,
    pattern_id: state.patternId,
    current_location_id: state.currentLocationId,
    active_event_id: state.activeEventId,
    completed_event_ids: state.completedEventIds,
    skipped_event_ids: state.skippedEventIds,
    delays: state.delays,
    generated_schedule: state.generatedSchedule,
    created_at: state.createdAt,
    updated_at: state.updatedAt,
  };

  const { error } = await supabase
    .from('daily_states')
    .upsert(record, { onConflict: 'id,user_id' });
  if (error) {
    console.warn('[writeThrough] daily_states upsert 失敗:', error.message);
  }
}

// -----------------------------------------------
// settings 用（PK: user_id）
// -----------------------------------------------

/**
 * settings への upsert（ベストエフォート）。
 */
export async function syncSettingsUpsert(settings: Settings): Promise<void> {
  const supabase = getSupabaseClient();
  const user = useAuthStore.getState().user;
  if (!supabase || !user) return;

  const record = {
    user_id: user.id,
    default_location_id: settings.defaultLocationId,
    week_starts_on: settings.weekStartsOn,
    time_format: settings.timeFormat,
    theme: settings.theme,
    notifications: settings.notifications,
    calendar_sync: settings.calendarSync,
    created_at: settings.createdAt,
    updated_at: settings.updatedAt,
  };

  const { error } = await supabase.from('settings').upsert(record, { onConflict: 'user_id' });
  if (error) {
    console.warn('[writeThrough] settings upsert 失敗:', error.message);
  }
}

// -----------------------------------------------
// エンティティ → Supabase レコード変換ヘルパー
// -----------------------------------------------

export function locationToRecord(loc: Location, userId: string): Record<string, unknown> {
  return {
    id: loc.id,
    user_id: userId,
    name: loc.name,
    aliases: loc.aliases,
    address: loc.address ?? null,
    created_at: loc.createdAt,
    updated_at: loc.updatedAt,
  };
}

export function routineItemToRecord(item: RoutineItem, userId: string): Record<string, unknown> {
  return {
    id: item.id,
    user_id: userId,
    name: item.name,
    duration: item.duration,
    location_id: item.locationId ?? null,
    icon: item.icon ?? null,
    color: item.color ?? null,
    is_flexible: item.isFlexible,
    priority: item.priority,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  };
}

export function patternToRecord(p: LifePattern, userId: string): Record<string, unknown> {
  return {
    id: p.id,
    user_id: userId,
    name: p.name,
    rules: p.rules,
    pattern_items: p.patternItems,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}

export function travelRouteToRecord(r: TravelRoute, userId: string): Record<string, unknown> {
  return {
    id: r.id,
    user_id: userId,
    from_location_id: r.fromLocationId,
    to_location_id: r.toLocationId,
    method: r.method,
    duration: r.duration,
    is_default: r.isDefault,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
  };
}

export function calendarEventToRecord(e: CalendarEvent, userId: string): Record<string, unknown> {
  return {
    id: e.id,
    user_id: userId,
    title: e.title,
    start_time: e.startTime,
    end_time: e.endTime,
    location_name: e.locationName ?? null,
    description: e.description ?? null,
    is_all_day: e.isAllDay,
    calendar_id: e.calendarId,
    synced_at: e.syncedAt,
  };
}
