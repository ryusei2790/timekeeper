'use client';

import { generateDailySchedule } from '@/lib/scheduler/generator';
import { selectPattern } from '@/lib/scheduler/pattern-selector';
import { completeEvent, skipEvent } from '@/lib/scheduler/event-handler';
import { todayString } from '@/lib/utils/date';
import { minutesBetween, isTimeBefore } from '@/lib/utils/time';
import { useCalendarStore } from '@/store/useCalendarStore';
import { useDailyStateStore } from '@/store/useDailyStateStore';
import { useLocationStore } from '@/store/useLocationStore';
import { usePatternStore } from '@/store/usePatternStore';
import { useRoutineStore } from '@/store/useRoutineStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTravelRouteStore } from '@/store/useTravelRouteStore';
import type { LifePattern, ScheduleItem } from '@/types';
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';

/**
 * 今日のスケジュールを管理するフック
 *
 * - 初回マウント時にデータをロードし、スケジュールを生成（未生成の場合）
 * - イベントの完了・スキップ処理を提供
 */
export function useDailySchedule() {
  const {
    todayState,
    isLoading: isDailyStateLoading,
    loadDailyState,
    saveDailyState,
    updateSchedule,
  } = useDailyStateStore();
  const { patterns, loadPatterns } = usePatternStore();
  const { routineItems, loadRoutineItems } = useRoutineStore();
  const { locations, loadLocations } = useLocationStore();
  const { travelRoutes, loadTravelRoutes } = useTravelRouteStore();
  const { calendarEvents, loadCalendarEvents } = useCalendarStore();
  const { settings, loadSettings } = useSettingsStore();

  const today = todayString();

  // 初回ロード
  useEffect(() => {
    console.log(`[useDailySchedule] データロード開始 (today=${today})`);
    loadDailyState(today);
    loadPatterns();
    loadRoutineItems();
    loadLocations();
    loadTravelRoutes();
    loadCalendarEvents();
    loadSettings();
  }, [
    today,
    loadDailyState,
    loadPatterns,
    loadRoutineItems,
    loadLocations,
    loadTravelRoutes,
    loadCalendarEvents,
    loadSettings,
  ]);

  // スケジュール未生成かつ必要データが揃ったら生成
  useEffect(() => {
    console.log(
      `[useDailySchedule] スケジュール生成チェック: loading=${isDailyStateLoading}, todayState=${todayState !== null ? 'あり' : 'null'}, settings=${settings ? 'あり' : 'null'}, patterns=${patterns.length}件`
    );
    if (isDailyStateLoading) return; // DBロード完了待ち
    if (todayState !== null) {
      console.log(
        `[useDailySchedule] 既存スケジュールあり → 生成スキップ (schedule=${todayState.generatedSchedule.length}件, patternId=${todayState.patternId})`
      );
      return; // 既存データあり
    }
    if (!settings) {
      console.log('[useDailySchedule] settings未ロード → スキップ');
      return;
    }
    if (patterns.length === 0) {
      console.log('[useDailySchedule] patterns未ロード → スキップ');
      return;
    }

    const todayDate = new Date();
    const pattern = selectPattern(todayDate, patterns, calendarEvents);
    if (!pattern) {
      console.log('[useDailySchedule] selectPattern → null（マッチするパターンなし）');
      return;
    }

    console.log(
      `[useDailySchedule] スケジュール生成開始 (pattern="${pattern.name}", routineItems=${routineItems.length}件)`
    );
    const generated = generateDailySchedule({
      date: todayDate,
      pattern,
      routineItems,
      calendarEvents,
      locations,
      travelRoutes,
      settings,
    });

    // 最初の pending アイテムを active に設定して開始状態にする
    const firstPending = generated.generatedSchedule.find((item) => item.status === 'pending');
    const initializedSchedule = firstPending
      ? generated.generatedSchedule.map((item) =>
          item.id === firstPending.id ? { ...item, status: 'active' as const } : item
        )
      : generated.generatedSchedule;

    console.log(`[useDailySchedule] スケジュール生成完了: ${initializedSchedule.length}件`);
    saveDailyState({
      ...generated,
      generatedSchedule: initializedSchedule,
      activeEventId: firstPending?.id ?? null,
    });
  }, [
    isDailyStateLoading,
    todayState,
    settings,
    patterns,
    routineItems,
    calendarEvents,
    locations,
    travelRoutes,
    saveDailyState,
  ]);

  /** スケジュールを特定パターンで再生成する */
  const regenerateWithPattern = useCallback(
    (pattern: LifePattern) => {
      if (!settings) return;

      const todayDate = new Date();
      const generated = generateDailySchedule({
        date: todayDate,
        pattern,
        routineItems,
        calendarEvents,
        locations,
        travelRoutes,
        settings,
        startLocationId: todayState?.currentLocationId,
      });

      // 最初の pending アイテムを active に設定
      const firstPending = generated.generatedSchedule.find((item) => item.status === 'pending');
      const initializedSchedule = firstPending
        ? generated.generatedSchedule.map((item) =>
            item.id === firstPending.id ? { ...item, status: 'active' as const } : item
          )
        : generated.generatedSchedule;

      saveDailyState({
        ...generated,
        generatedSchedule: initializedSchedule,
        activeEventId: firstPending?.id ?? null,
      });
      toast.success(`${pattern.name} でスケジュールを再生成しました`);
    },
    [settings, routineItems, calendarEvents, locations, travelRoutes, todayState, saveDailyState]
  );

  /** イベントを完了にする */
  const handleComplete = useCallback(
    (eventId: string, actualEndTime?: string) => {
      if (!todayState) return;
      const newState = completeEvent(todayState, eventId, actualEndTime);
      saveDailyState(newState);
    },
    [todayState, saveDailyState]
  );

  /** イベントをスキップする */
  const handleSkip = useCallback(
    (eventId: string) => {
      if (!todayState) return;
      const newState = skipEvent(todayState, eventId);
      saveDailyState(newState);
    },
    [todayState, saveDailyState]
  );

  /** 現在アクティブなイベント */
  const activeEvent =
    todayState?.generatedSchedule.find((item) => item.id === todayState.activeEventId) ?? null;

  /** 次の pending イベント */
  const nextEvent =
    todayState?.generatedSchedule.find(
      (item) => item.status === 'pending' && item.id !== todayState.activeEventId
    ) ?? null;

  return {
    schedule: todayState?.generatedSchedule ?? [],
    todayState,
    activeEvent,
    nextEvent,
    patterns,
    handleComplete,
    handleSkip,
    regenerateWithPattern,
  };
}

/**
 * 指定したイベントまでの残り時間・経過時間を計算するフック
 *
 * @param event 対象のスケジュールアイテム
 * @param currentTimeStr 現在時刻（HH:mm）
 */
export function useEventTiming(event: ScheduleItem | null, currentTimeStr: string) {
  if (!event) return { remainingMinutes: null, elapsedMinutes: null, progressPercent: 0 };

  const totalMinutes = minutesBetween(event.adjustedStartTime, event.adjustedEndTime);
  const elapsedMinutes = Math.max(0, minutesBetween(event.adjustedStartTime, currentTimeStr));
  const remainingMinutes = Math.max(0, totalMinutes - elapsedMinutes);
  const progressPercent =
    totalMinutes > 0 ? Math.min(100, (elapsedMinutes / totalMinutes) * 100) : 0;

  return { remainingMinutes, elapsedMinutes, progressPercent };
}

/**
 * 次のイベント開始までの残り時間を計算するフック
 *
 * @param event 次のイベント
 * @param currentTimeStr 現在時刻（HH:mm）
 */
export function useTimeUntilEvent(event: ScheduleItem | null, currentTimeStr: string) {
  if (!event) return { minutesUntil: null, isStarted: false };

  const minutesUntil = minutesBetween(currentTimeStr, event.adjustedStartTime);
  const isStarted = !isTimeBefore(currentTimeStr, event.adjustedStartTime);

  return { minutesUntil: Math.max(0, minutesUntil), isStarted };
}

/**
 * 分数を「X時間Y分」形式にフォーマットする
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}分`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}時間` : `${h}時間${m}分`;
}
