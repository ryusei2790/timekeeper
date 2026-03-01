import { EVENT_COLORS } from '@/constants';
import { generateId } from '@/lib/utils/id';
import { addMinutesToTime, calcEndTime, isTimeBefore, minutesBetween } from '@/lib/utils/time';
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
import { matchLocation } from './location-matcher';
import { findRoute } from './route-finder';

/** generateDailySchedule の引数型 */
export interface GeneratorInput {
  date: Date;
  pattern: LifePattern;
  routineItems: RoutineItem[];
  calendarEvents: CalendarEvent[];
  locations: Location[];
  travelRoutes: TravelRoute[];
  settings: Settings;
  /** 当日の開始時の現在地 ID（設定のデフォルトを上書きする場合に指定） */
  startLocationId?: string;
}

/**
 * RoutineItem から ScheduleItem を生成する
 */
function routineToScheduleItem(item: RoutineItem, locations: Location[]): ScheduleItem {
  const endTime = calcEndTime(item.startTime, item.duration);
  const location = item.locationId ? locations.find((l) => l.id === item.locationId) : undefined;

  return {
    id: generateId(),
    title: item.name,
    originalStartTime: item.startTime,
    originalEndTime: endTime,
    adjustedStartTime: item.startTime,
    adjustedEndTime: endTime,
    type: 'routine',
    status: 'pending',
    locationId: item.locationId,
    locationName: location?.name ?? null,
    isFlexible: item.isFlexible,
    priority: item.priority,
    icon: item.icon,
    color: item.color ?? EVENT_COLORS.routine,
    sourceId: item.id,
  };
}

/**
 * CalendarEvent から ScheduleItem を生成する
 */
function calendarToScheduleItem(event: CalendarEvent, locations: Location[]): ScheduleItem | null {
  // 終日イベントはスキップ
  if (event.isAllDay) return null;

  const startDate = new Date(event.startTime);
  const endDate = new Date(event.endTime);

  const startTime = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
  const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

  const location = matchLocation(event.locationName, locations);

  return {
    id: generateId(),
    title: event.title,
    originalStartTime: startTime,
    originalEndTime: endTime,
    adjustedStartTime: startTime,
    adjustedEndTime: endTime,
    type: 'calendar',
    status: 'pending',
    locationId: location?.id ?? null,
    locationName: event.locationName,
    isFlexible: false, // カレンダー予定は固定
    priority: 5, // カレンダー予定は最優先
    color: EVENT_COLORS.calendar,
    sourceId: event.id,
  };
}

/**
 * 移動イベント（TravelRoute）から ScheduleItem を生成する
 */
function travelToScheduleItem(
  route: TravelRoute,
  startTime: string,
  fromLocation: Location,
  toLocation: Location
): ScheduleItem {
  const endTime = calcEndTime(startTime, route.duration);

  return {
    id: generateId(),
    title: `${fromLocation.name} → ${toLocation.name}`,
    originalStartTime: startTime,
    originalEndTime: endTime,
    adjustedStartTime: startTime,
    adjustedEndTime: endTime,
    type: 'travel',
    status: 'pending',
    locationId: toLocation.id,
    locationName: toLocation.name,
    isFlexible: true,
    priority: 4,
    color: EVENT_COLORS.travel,
    sourceId: route.id,
    travelRoute: route,
    canChangeMethod: true,
  };
}

/**
 * スケジュールアイテムを時系列でソートする
 */
function sortByTime(items: ScheduleItem[]): ScheduleItem[] {
  return [...items].sort((a, b) => {
    const diff = minutesBetween(b.adjustedStartTime, a.adjustedStartTime);
    if (diff !== 0) return diff;
    // 同時刻の場合: カレンダー予定を優先（isFlexible=false を先に）
    return a.isFlexible === b.isFlexible ? 0 : a.isFlexible ? 1 : -1;
  });
}

/**
 * 2つのアイテムが時間的に重複しているか判定する
 */
function hasOverlap(a: ScheduleItem, b: ScheduleItem): boolean {
  return (
    isTimeBefore(a.adjustedStartTime, b.adjustedEndTime) &&
    isTimeBefore(b.adjustedStartTime, a.adjustedEndTime)
  );
}

/**
 * 移動イベントを挿入する
 *
 * ソート済みのスケジュールを走査し、連続するアイテム間で場所が変わる場合に
 * 移動イベントを挿入する。移動時間が確保できない場合は後続の flexible アイテムを後ろにシフトする。
 */
function insertTravelEvents(
  items: ScheduleItem[],
  locations: Location[],
  travelRoutes: TravelRoute[],
  startLocationId: string
): ScheduleItem[] {
  const result: ScheduleItem[] = [];
  let currentLocationId = startLocationId;

  for (const item of items) {
    const itemLocationId = item.locationId;

    // 場所が変わる場合は移動イベントを挿入
    if (itemLocationId && itemLocationId !== currentLocationId) {
      const route = findRoute(currentLocationId, itemLocationId, travelRoutes);

      if (route) {
        const fromLoc = locations.find((l) => l.id === currentLocationId);
        const toLoc = locations.find((l) => l.id === itemLocationId);

        if (fromLoc && toLoc) {
          // 移動開始時刻 = アイテム開始時刻 - 移動時間
          const travelStart = addMinutesToTime(item.adjustedStartTime, -route.duration);
          const travelEnd = item.adjustedStartTime;

          // 前のアイテムと重複しないか確認
          const lastItem = result[result.length - 1];
          const noConflict = !lastItem || !isTimeBefore(travelStart, lastItem.adjustedEndTime);

          if (noConflict) {
            const travelItem = travelToScheduleItem(route, travelStart, fromLoc, toLoc);
            travelItem.originalStartTime = travelStart;
            travelItem.originalEndTime = travelEnd;
            result.push(travelItem);
          }
        }
      }
    }

    result.push(item);

    // 現在地を更新
    if (itemLocationId) {
      currentLocationId = itemLocationId;
    }
  }

  return result;
}

/**
 * 日次スケジュールを生成するメイン関数
 *
 * 処理フロー:
 * 1. パターンの RoutineItem から ScheduleItem を生成
 * 2. CalendarEvent から ScheduleItem を生成
 * 3. 全アイテムを時系列にマージ・ソート
 * 4. カレンダー予定と重複する flexible なアイテムをシフト
 * 5. 場所変更箇所に移動イベントを挿入
 *
 * @returns 生成された DailyState（createdAt/updatedAt は呼び出し元で設定）
 */
export function generateDailySchedule(
  input: GeneratorInput
): Omit<DailyState, 'createdAt' | 'updatedAt'> {
  const {
    date,
    pattern,
    routineItems,
    calendarEvents,
    locations,
    travelRoutes,
    settings,
    startLocationId,
  } = input;

  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const currentLocationId = startLocationId ?? settings.defaultLocationId;

  // Step 1: パターンの RoutineItem → ScheduleItem
  const patternItemIds = new Set(pattern.routineItemIds);
  const routineScheduleItems = routineItems
    .filter((item) => patternItemIds.has(item.id))
    .map((item) => routineToScheduleItem(item, locations));

  // Step 2: CalendarEvent → ScheduleItem（当日分のみ）
  const calendarScheduleItems = calendarEvents
    .filter((e) => e.startTime.startsWith(dateStr) && !e.isAllDay)
    .flatMap((e) => {
      const item = calendarToScheduleItem(e, locations);
      return item ? [item] : [];
    });

  // Step 3: 時系列マージ
  const allItems = sortByTime([...routineScheduleItems, ...calendarScheduleItems]);

  // Step 4: カレンダー予定と重複する flexible アイテムをシフト
  const resolvedItems = resolveConflicts(allItems);

  // Step 5: 移動イベントを挿入
  const scheduleWithTravel = insertTravelEvents(
    resolvedItems,
    locations,
    travelRoutes,
    currentLocationId
  );

  return {
    date: dateStr,
    patternId: pattern.id,
    currentLocationId,
    activeEventId: null,
    completedEventIds: [],
    skippedEventIds: [],
    delays: [],
    generatedSchedule: scheduleWithTravel,
  };
}

/**
 * スケジュールアイテムの時間衝突を解決する
 *
 * カレンダー予定（isFlexible=false）と重複する flexible アイテムを後ろにシフトする。
 * flexible 同士の衝突は後のアイテムを後ろにシフトする。
 */
function resolveConflicts(items: ScheduleItem[]): ScheduleItem[] {
  const result: ScheduleItem[] = [];

  for (const item of items) {
    const conflicting = result.filter((existing) => hasOverlap(existing, item));

    if (conflicting.length === 0) {
      result.push(item);
      continue;
    }

    if (!item.isFlexible) {
      // 固定アイテム（カレンダー予定）: 重複する flexible なアイテムをシフト
      for (const conflict of conflicting) {
        if (conflict.isFlexible) {
          const shiftMinutes = minutesBetween(conflict.adjustedStartTime, item.adjustedEndTime);
          const idx = result.indexOf(conflict);
          result[idx] = shiftItem(conflict, shiftMinutes);
        }
      }
      result.push(item);
    } else {
      // flexible アイテム: 最後の衝突アイテムの終了後にシフト
      const latestEnd = conflicting.reduce((latest, c) => {
        return isTimeBefore(latest, c.adjustedEndTime) ? c.adjustedEndTime : latest;
      }, '00:00');

      const shiftMinutes = minutesBetween(item.adjustedStartTime, latestEnd);
      if (shiftMinutes > 0) {
        result.push(shiftItem(item, shiftMinutes));
      } else {
        result.push(item);
      }
    }
  }

  return result;
}

/**
 * ScheduleItem の adjustedStartTime / adjustedEndTime を指定した分数だけシフトする
 */
function shiftItem(item: ScheduleItem, minutes: number): ScheduleItem {
  return {
    ...item,
    adjustedStartTime: addMinutesToTime(item.adjustedStartTime, minutes),
    adjustedEndTime: addMinutesToTime(item.adjustedEndTime, minutes),
  };
}
