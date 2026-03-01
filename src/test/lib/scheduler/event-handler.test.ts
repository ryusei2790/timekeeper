import { describe, expect, it } from 'vitest';
import { completeEvent, skipEvent } from '@/lib/scheduler/event-handler';
import { makeDailyState, makeScheduleItem } from '@/test/factories';

describe('completeEvent', () => {
  it('指定したイベントのステータスが completed になる', () => {
    const item = makeScheduleItem({ id: 'ev-1', status: 'active' });
    const state = makeDailyState({ generatedSchedule: [item], activeEventId: item.id });

    const result = completeEvent(state, item.id, '07:30');

    const updated = result.generatedSchedule.find((s) => s.id === item.id);
    expect(updated?.status).toBe('completed');
  });

  it('completedEventIds に ID が追加される', () => {
    const item = makeScheduleItem({ id: 'ev-1', status: 'active' });
    const state = makeDailyState({ generatedSchedule: [item], activeEventId: item.id });

    const result = completeEvent(state, item.id, '07:30');
    expect(result.completedEventIds).toContain(item.id);
  });

  it('次の pending イベントが active になる', () => {
    const current = makeScheduleItem({ id: 'ev-1', status: 'active' });
    const next = makeScheduleItem({
      id: 'ev-2',
      status: 'pending',
      adjustedStartTime: '08:00',
      adjustedEndTime: '08:30',
    });
    const state = makeDailyState({
      generatedSchedule: [current, next],
      activeEventId: current.id,
    });

    const result = completeEvent(state, current.id, '07:30');
    const nextItem = result.generatedSchedule.find((s) => s.id === next.id);
    expect(nextItem?.status).toBe('active');
    expect(result.activeEventId).toBe(next.id);
  });

  it('遅延があった場合 delays に記録される', () => {
    // adjustedEndTime: 07:30、actualEndTime: 07:45 → 15分遅延
    const item = makeScheduleItem({
      id: 'ev-1',
      status: 'active',
      adjustedStartTime: '07:00',
      adjustedEndTime: '07:30',
    });
    const state = makeDailyState({ generatedSchedule: [item], activeEventId: item.id });

    const result = completeEvent(state, item.id, '07:45');
    expect(result.delays).toHaveLength(1);
    expect(result.delays[0].delayMinutes).toBe(15);
  });

  it('遅延がない場合は delays に記録されない', () => {
    const item = makeScheduleItem({
      id: 'ev-1',
      status: 'active',
      adjustedStartTime: '07:00',
      adjustedEndTime: '07:30',
    });
    const state = makeDailyState({ generatedSchedule: [item], activeEventId: item.id });

    // 定刻通り終了
    const result = completeEvent(state, item.id, '07:30');
    expect(result.delays).toHaveLength(0);
  });

  it('遅延があった場合に後続の flexible アイテムがシフトされる', () => {
    const current = makeScheduleItem({
      id: 'ev-1',
      status: 'active',
      adjustedStartTime: '07:00',
      adjustedEndTime: '07:30',
      isFlexible: true,
    });
    const next = makeScheduleItem({
      id: 'ev-2',
      status: 'pending',
      adjustedStartTime: '08:00',
      adjustedEndTime: '08:30',
      isFlexible: true,
    });
    const state = makeDailyState({
      generatedSchedule: [current, next],
      activeEventId: current.id,
    });

    // 15分遅延
    const result = completeEvent(state, current.id, '07:45');
    const nextItem = result.generatedSchedule.find((s) => s.id === next.id);
    expect(nextItem?.adjustedStartTime).toBe('08:15');
    expect(nextItem?.adjustedEndTime).toBe('08:45');
  });

  it('遅延があっても固定イベント（isFlexible=false）はシフトされない', () => {
    const current = makeScheduleItem({
      id: 'ev-1',
      status: 'active',
      adjustedStartTime: '07:00',
      adjustedEndTime: '07:30',
      isFlexible: true,
    });
    const fixed = makeScheduleItem({
      id: 'ev-2',
      status: 'pending',
      adjustedStartTime: '08:00',
      adjustedEndTime: '09:00',
      isFlexible: false,
    });
    const state = makeDailyState({
      generatedSchedule: [current, fixed],
      activeEventId: current.id,
    });

    // 30分遅延
    const result = completeEvent(state, current.id, '08:00');
    const fixedItem = result.generatedSchedule.find((s) => s.id === fixed.id);
    expect(fixedItem?.adjustedStartTime).toBe('08:00'); // 変化なし
  });

  it('存在しない ID の場合は状態が変化しない', () => {
    const item = makeScheduleItem({ id: 'ev-1', status: 'active' });
    const state = makeDailyState({ generatedSchedule: [item] });

    const result = completeEvent(state, 'non-existent', '07:30');
    expect(result).toEqual(state);
  });
});

describe('skipEvent', () => {
  it('指定したイベントのステータスが skipped になる', () => {
    const item = makeScheduleItem({ id: 'ev-1', status: 'active' });
    const state = makeDailyState({ generatedSchedule: [item], activeEventId: item.id });

    const result = skipEvent(state, item.id);
    const updated = result.generatedSchedule.find((s) => s.id === item.id);
    expect(updated?.status).toBe('skipped');
  });

  it('skippedEventIds に ID が追加される', () => {
    const item = makeScheduleItem({ id: 'ev-1', status: 'active' });
    const state = makeDailyState({ generatedSchedule: [item], activeEventId: item.id });

    const result = skipEvent(state, item.id);
    expect(result.skippedEventIds).toContain(item.id);
  });

  it('次の pending イベントが active になる', () => {
    const current = makeScheduleItem({ id: 'ev-1', status: 'active' });
    const next = makeScheduleItem({ id: 'ev-2', status: 'pending' });
    const state = makeDailyState({
      generatedSchedule: [current, next],
      activeEventId: current.id,
    });

    const result = skipEvent(state, current.id);
    const nextItem = result.generatedSchedule.find((s) => s.id === next.id);
    expect(nextItem?.status).toBe('active');
    expect(result.activeEventId).toBe(next.id);
  });

  it('スキップ後に pending がない場合 activeEventId は null', () => {
    const item = makeScheduleItem({ id: 'ev-1', status: 'active' });
    const state = makeDailyState({ generatedSchedule: [item], activeEventId: item.id });

    const result = skipEvent(state, item.id);
    expect(result.activeEventId).toBeNull();
  });
});
