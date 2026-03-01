import { STORAGE_KEYS } from '@/constants';
import type {
  CalendarAuth,
  CalendarEvent,
  DailyState,
  LifePattern,
  Location,
  RoutineItem,
  Settings,
  TravelRoute,
} from '@/types';
import { BaseStorage } from './base';

/** 場所マスタのストレージインスタンス */
export const locationsStorage = new BaseStorage<Location[]>(STORAGE_KEYS.locations);

/** 習慣項目のストレージインスタンス */
export const routineItemsStorage = new BaseStorage<RoutineItem[]>(STORAGE_KEYS.routineItems);

/** 生活習慣パターンのストレージインスタンス */
export const patternsStorage = new BaseStorage<LifePattern[]>(STORAGE_KEYS.patterns);

/** 移動ルートのストレージインスタンス */
export const travelRoutesStorage = new BaseStorage<TravelRoute[]>(STORAGE_KEYS.travelRoutes);

/** カレンダーイベントのストレージインスタンス */
export const calendarEventsStorage = new BaseStorage<CalendarEvent[]>(STORAGE_KEYS.calendarEvents);

/** 日次状態のストレージインスタンス */
export const dailyStatesStorage = new BaseStorage<DailyState[]>(STORAGE_KEYS.dailyStates);

/** アプリケーション設定のストレージインスタンス */
export const settingsStorage = new BaseStorage<Settings>(STORAGE_KEYS.settings);

/** カレンダー認証情報のストレージインスタンス */
export const calendarAuthStorage = new BaseStorage<CalendarAuth>(STORAGE_KEYS.calendarAuth);

export { BaseStorage };
