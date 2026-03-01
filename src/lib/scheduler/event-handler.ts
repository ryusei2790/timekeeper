import { now } from '@/lib/utils/id';
import { currentTimeString } from '@/lib/utils/time';
import type { DailyState } from '@/types';
import { applyDelay, detectDelay } from './delay-adjuster';

/**
 * イベントを完了状態にする
 *
 * 処理内容:
 * 1. 指定イベントのステータスを completed に更新
 * 2. 実際の終了時刻と予定終了時刻を比較して遅延を検出
 * 3. 遅延があれば後続の flexible アイテムをシフト
 * 4. 次の pending アイテムを active にする
 * 5. 現在地をイベントの場所に更新する
 *
 * @param state 現在の日次状態
 * @param eventId 完了するイベントの ID
 * @param actualEndTime 実際の終了時刻（HH:mm）。省略時は現在時刻
 * @returns 更新された日次状態
 */
export function completeEvent(
  state: DailyState,
  eventId: string,
  actualEndTime?: string
): DailyState {
  const endTime = actualEndTime ?? currentTimeString();
  const eventIndex = state.generatedSchedule.findIndex((item) => item.id === eventId);
  if (eventIndex === -1) return state;

  const event = state.generatedSchedule[eventIndex];

  // 遅延を検出
  const delayRecord = detectDelay(event, endTime);

  // スケジュールに遅延を適用
  const adjustedSchedule = delayRecord
    ? applyDelay(state.generatedSchedule, eventId, endTime)
    : state.generatedSchedule;

  // イベントのステータスを completed に更新
  const updatedSchedule = adjustedSchedule.map((item) =>
    item.id === eventId ? { ...item, status: 'completed' as const } : item
  );

  // 次の pending アイテムを active にする
  const nextPending = updatedSchedule.find(
    (item) => item.status === 'pending' && item.id !== eventId
  );
  const scheduleWithActive = nextPending
    ? updatedSchedule.map((item) =>
        item.id === nextPending.id ? { ...item, status: 'active' as const } : item
      )
    : updatedSchedule;

  // 現在地を更新（イベントの場所が設定されている場合）
  const newLocationId = event.locationId ?? state.currentLocationId;

  return {
    ...state,
    generatedSchedule: scheduleWithActive,
    completedEventIds: [...state.completedEventIds, eventId],
    activeEventId: nextPending?.id ?? null,
    currentLocationId: newLocationId,
    delays: delayRecord ? [...state.delays, delayRecord] : state.delays,
    updatedAt: now(),
  };
}

/**
 * イベントをスキップ状態にする
 *
 * 処理内容:
 * 1. 指定イベントのステータスを skipped に更新
 * 2. 次の pending アイテムを active にする
 *
 * @param state 現在の日次状態
 * @param eventId スキップするイベントの ID
 * @returns 更新された日次状態
 */
export function skipEvent(state: DailyState, eventId: string): DailyState {
  const updatedSchedule = state.generatedSchedule.map((item) =>
    item.id === eventId ? { ...item, status: 'skipped' as const } : item
  );

  const nextPending = updatedSchedule.find(
    (item) => item.status === 'pending' && item.id !== eventId
  );
  const scheduleWithActive = nextPending
    ? updatedSchedule.map((item) =>
        item.id === nextPending.id ? { ...item, status: 'active' as const } : item
      )
    : updatedSchedule;

  return {
    ...state,
    generatedSchedule: scheduleWithActive,
    skippedEventIds: [...state.skippedEventIds, eventId],
    activeEventId: nextPending?.id ?? null,
    updatedAt: now(),
  };
}

/**
 * 指定したイベントをアクティブにする（手動で現在のイベントを設定する場合に使用）
 *
 * @param state 現在の日次状態
 * @param eventId アクティブにするイベントの ID
 * @returns 更新された日次状態
 */
export function activateEvent(state: DailyState, eventId: string): DailyState {
  const updatedSchedule = state.generatedSchedule.map((item) => {
    if (item.id === eventId) return { ...item, status: 'active' as const };
    if (item.status === 'active') return { ...item, status: 'pending' as const };
    return item;
  });

  return {
    ...state,
    generatedSchedule: updatedSchedule,
    activeEventId: eventId,
    updatedAt: now(),
  };
}
