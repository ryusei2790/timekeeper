import { now } from '@/lib/utils/id';
import { addMinutesToTime, minutesBetween } from '@/lib/utils/time';
import type { DelayRecord, ScheduleItem } from '@/types';

/**
 * イベントが遅延しているか検出する
 *
 * @param event 完了処理をしたスケジュールアイテム
 * @param actualEndTime 実際の終了時刻（HH:mm）
 * @returns 遅延がある場合は DelayRecord、遅延なしの場合は null
 */
export function detectDelay(event: ScheduleItem, actualEndTime: string): DelayRecord | null {
  const delayMinutes = minutesBetween(event.adjustedEndTime, actualEndTime);

  if (delayMinutes <= 0) return null;

  return {
    eventId: event.id,
    originalEndTime: event.adjustedEndTime,
    actualEndTime,
    delayMinutes,
    timestamp: now(),
  };
}

/**
 * 遅延に基づいてスケジュールを調整する
 *
 * 遅延の伝播ルール:
 * - isFlexible=true のアイテムは後ろにシフトする
 * - isFlexible=false（カレンダー予定）は変更しない
 * - カレンダー予定より後の flexible アイテムは
 *   カレンダー予定の終了後から再配置される
 *
 * @param schedule 現在のスケジュール
 * @param delayMinutes 遅延時間（分）
 * @param fromIndex この index 以降のアイテムを調整する
 * @returns 調整済みのスケジュール（新しい配列）
 */
export function adjustSchedule(
  schedule: ScheduleItem[],
  delayMinutes: number,
  fromIndex: number
): ScheduleItem[] {
  if (delayMinutes <= 0) return schedule;

  return schedule.map((item, index) => {
    if (index <= fromIndex) return item;
    if (!item.isFlexible) return item; // カレンダー予定は変更しない

    return {
      ...item,
      adjustedStartTime: addMinutesToTime(item.adjustedStartTime, delayMinutes),
      adjustedEndTime: addMinutesToTime(item.adjustedEndTime, delayMinutes),
    };
  });
}

/**
 * スケジュール全体の遅延影響を計算する
 *
 * あるアイテムが遅延した場合に、以降のアイテムが
 * どれだけ影響を受けるかをシミュレーションする。
 *
 * @param schedule 現在のスケジュール
 * @param eventId 遅延したイベントの ID
 * @param actualEndTime 実際の終了時刻（HH:mm）
 * @returns 調整済みのスケジュール
 */
export function applyDelay(
  schedule: ScheduleItem[],
  eventId: string,
  actualEndTime: string
): ScheduleItem[] {
  const eventIndex = schedule.findIndex((item) => item.id === eventId);
  if (eventIndex === -1) return schedule;

  const event = schedule[eventIndex];
  const delay = detectDelay(event, actualEndTime);
  if (!delay) return schedule;

  // 遅延したイベント自体の終了時刻を更新
  const updatedSchedule = schedule.map((item, idx) =>
    idx === eventIndex ? { ...item, adjustedEndTime: actualEndTime } : item
  );

  return adjustSchedule(updatedSchedule, delay.delayMinutes, eventIndex);
}
