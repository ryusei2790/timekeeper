/**
 * テスト用ファクトリ関数
 * 各エンティティのデフォルト値を持つオブジェクトを生成する
 */
import type {
  CalendarEvent,
  DailyState,
  LifePattern,
  Location,
  RoutineItem,
  ScheduleItem,
  Settings,
  TravelRoute,
} from '@/types';

let counter = 0;
const nextId = () => `test-id-${++counter}`;
const NOW = '2026-03-01T00:00:00.000Z';

export function makeLocation(override: Partial<Location> = {}): Location {
  return {
    id: nextId(),
    name: '自宅',
    aliases: [],
    address: undefined,
    createdAt: NOW,
    updatedAt: NOW,
    ...override,
  };
}

export function makeRoutineItem(override: Partial<RoutineItem> = {}): RoutineItem {
  return {
    id: nextId(),
    name: '朝食',
    duration: 30,
    locationId: null,
    isFlexible: true,
    priority: 3,
    createdAt: NOW,
    updatedAt: NOW,
    ...override,
  };
}

export function makePattern(override: Partial<LifePattern> = {}): LifePattern {
  return {
    id: nextId(),
    name: '平日パターン',
    rules: {
      dayOfWeek: [1, 2, 3, 4, 5],
      keywords: [],
      isDefault: false,
      priority: 1,
    },
    patternItems: [],
    createdAt: NOW,
    updatedAt: NOW,
    ...override,
  };
}

export function makeTravelRoute(override: Partial<TravelRoute> = {}): TravelRoute {
  return {
    id: nextId(),
    fromLocationId: nextId(),
    toLocationId: nextId(),
    method: 'train',
    duration: 30,
    isDefault: true,
    createdAt: NOW,
    updatedAt: NOW,
    ...override,
  };
}

export function makeCalendarEvent(override: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: nextId(),
    title: 'ミーティング',
    startTime: '2026-03-01T10:00:00',
    endTime: '2026-03-01T11:00:00',
    locationName: null,
    description: null,
    isAllDay: false,
    calendarId: 'cal-1',
    syncedAt: NOW,
    ...override,
  };
}

export function makeScheduleItem(override: Partial<ScheduleItem> = {}): ScheduleItem {
  return {
    id: nextId(),
    title: '朝食',
    originalStartTime: '07:00',
    originalEndTime: '07:30',
    adjustedStartTime: '07:00',
    adjustedEndTime: '07:30',
    type: 'routine',
    status: 'pending',
    locationId: null,
    locationName: null,
    isFlexible: true,
    priority: 3,
    sourceId: nextId(),
    ...override,
  };
}

export function makeSettings(override: Partial<Settings> = {}): Settings {
  return {
    defaultLocationId: 'loc-home',
    weekStartsOn: 1,
    timeFormat: '24h',
    theme: 'system',
    notifications: {
      enabled: false,
      beforeEventMinutes: 10,
      delayWarning: false,
    },
    calendarSync: {
      autoSync: false,
      syncIntervalMinutes: 60,
      lastSyncAt: null,
    },
    createdAt: NOW,
    updatedAt: NOW,
    ...override,
  };
}

export function makeDailyState(override: Partial<DailyState> = {}): DailyState {
  return {
    date: '2026-03-01',
    patternId: 'pat-1',
    currentLocationId: 'loc-home',
    activeEventId: null,
    completedEventIds: [],
    skippedEventIds: [],
    delays: [],
    generatedSchedule: [],
    createdAt: NOW,
    updatedAt: NOW,
    ...override,
  };
}
