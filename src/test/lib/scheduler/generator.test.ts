import { describe, expect, it } from 'vitest';
import { generateDailySchedule } from '@/lib/scheduler/generator';
import {
  makeCalendarEvent,
  makeLocation,
  makePattern,
  makeRoutineItem,
  makeSettings,
  makeTravelRoute,
} from '@/test/factories';

const TODAY = new Date('2026-03-01T00:00:00');

/** テスト用のベース設定 */
function baseInput() {
  const home = makeLocation({ id: 'loc-home', name: '自宅' });
  const settings = makeSettings({ defaultLocationId: home.id });
  const pattern = makePattern({ patternItems: [] });
  return { home, settings, pattern };
}

describe('generateDailySchedule', () => {
  it('RoutineItem なし・CalendarEvent なしの場合は空のスケジュールを生成する', () => {
    const { settings, pattern } = baseInput();
    const result = generateDailySchedule({
      date: TODAY,
      pattern,
      routineItems: [],
      calendarEvents: [],
      locations: [],
      travelRoutes: [],
      settings,
    });
    expect(result.generatedSchedule).toHaveLength(0);
    expect(result.date).toBe('2026-03-01');
  });

  it('パターンに含まれる RoutineItem のみがスケジュールに追加される', () => {
    const { settings } = baseInput();
    const item1 = makeRoutineItem({ id: 'ri-1', name: '朝食', duration: 30 });
    const item2 = makeRoutineItem({ id: 'ri-2', name: '運動', duration: 60 });
    const itemOther = makeRoutineItem({ id: 'ri-other', name: '別パターンの項目', duration: 30 });
    const pattern = makePattern({
      patternItems: [
        { routineItemId: item1.id, startTime: '07:00' },
        { routineItemId: item2.id, startTime: '08:00' },
      ],
    });

    const result = generateDailySchedule({
      date: TODAY,
      pattern,
      routineItems: [item1, item2, itemOther],
      calendarEvents: [],
      locations: [],
      travelRoutes: [],
      settings,
    });

    const titles = result.generatedSchedule.map((s) => s.title);
    expect(titles).toContain('朝食');
    expect(titles).toContain('運動');
    expect(titles).not.toContain('別パターンの項目');
  });

  it('スケジュールが時系列でソートされる', () => {
    const { settings } = baseInput();
    const item1 = makeRoutineItem({ id: 'ri-1', name: '朝食', duration: 30 });
    const item2 = makeRoutineItem({ id: 'ri-2', name: '起床', duration: 15 });
    const pattern = makePattern({
      patternItems: [
        { routineItemId: item1.id, startTime: '07:00' },
        { routineItemId: item2.id, startTime: '06:30' },
      ],
    });

    const result = generateDailySchedule({
      date: TODAY,
      pattern,
      routineItems: [item1, item2],
      calendarEvents: [],
      locations: [],
      travelRoutes: [],
      settings,
    });

    const times = result.generatedSchedule.map((s) => s.adjustedStartTime);
    expect(times[0]).toBe('06:30');
    expect(times[1]).toBe('07:00');
  });

  it('終日イベントはスケジュールに含まれない', () => {
    const { settings, pattern } = baseInput();
    const allDayEvent = makeCalendarEvent({
      startTime: '2026-03-01T00:00:00',
      endTime: '2026-03-01T00:00:00',
      isAllDay: true,
    });

    const result = generateDailySchedule({
      date: TODAY,
      pattern,
      routineItems: [],
      calendarEvents: [allDayEvent],
      locations: [],
      travelRoutes: [],
      settings,
    });

    expect(result.generatedSchedule).toHaveLength(0);
  });

  it('当日以外の CalendarEvent はスケジュールに含まれない', () => {
    const { settings, pattern } = baseInput();
    const otherDayEvent = makeCalendarEvent({
      startTime: '2026-03-02T10:00:00',
      endTime: '2026-03-02T11:00:00',
    });

    const result = generateDailySchedule({
      date: TODAY,
      pattern,
      routineItems: [],
      calendarEvents: [otherDayEvent],
      locations: [],
      travelRoutes: [],
      settings,
    });

    expect(result.generatedSchedule).toHaveLength(0);
  });

  it('CalendarEvent（固定）と flexible な RoutineItem が重複した場合は RoutineItem をシフトする', () => {
    const { settings } = baseInput();
    // RoutineItem: 09:30-10:30 (flexible)
    const item = makeRoutineItem({ id: 'ri-1', name: '運動', duration: 60, isFlexible: true });
    const pattern = makePattern({
      patternItems: [{ routineItemId: item.id, startTime: '09:30' }],
    });

    // CalendarEvent: 10:00-11:00 （固定、重複）
    const event = makeCalendarEvent({
      title: 'ミーティング',
      startTime: '2026-03-01T10:00:00',
      endTime: '2026-03-01T11:00:00',
      isAllDay: false,
    });

    const result = generateDailySchedule({
      date: TODAY,
      pattern,
      routineItems: [item],
      calendarEvents: [event],
      locations: [],
      travelRoutes: [],
      settings,
    });

    const meeting = result.generatedSchedule.find((s) => s.title === 'ミーティング');
    const exercise = result.generatedSchedule.find((s) => s.title === '運動');

    // ミーティングは10:00のまま
    expect(meeting?.adjustedStartTime).toBe('10:00');

    // 運動はミーティングと重複しない位置に移動している
    const exerciseEnd = exercise?.adjustedEndTime ?? '';
    const meetingStart = meeting?.adjustedStartTime ?? '';
    // 運動の開始はミーティングの後か、終了がミーティング開始より前
    const exerciseStart = exercise?.adjustedStartTime ?? '';
    expect(exerciseStart >= meetingStart || exerciseEnd <= meetingStart).toBe(true);
  });

  it('場所が変わる場合は移動イベントが自動挿入される', () => {
    const home = makeLocation({ id: 'loc-home', name: '自宅' });
    const office = makeLocation({ id: 'loc-office', name: '会社' });
    const route = makeTravelRoute({
      fromLocationId: home.id,
      toLocationId: office.id,
      duration: 30,
    });
    const settings = makeSettings({ defaultLocationId: home.id });

    const item = makeRoutineItem({
      id: 'ri-1',
      name: '仕事',
      duration: 60,
      locationId: office.id,
      isFlexible: false,
    });
    const pattern = makePattern({
      patternItems: [{ routineItemId: item.id, startTime: '09:00' }],
    });

    const result = generateDailySchedule({
      date: TODAY,
      pattern,
      routineItems: [item],
      calendarEvents: [],
      locations: [home, office],
      travelRoutes: [route],
      settings,
    });

    const travelItem = result.generatedSchedule.find((s) => s.type === 'travel');
    expect(travelItem).toBeDefined();
    expect(travelItem?.title).toBe('自宅 → 会社');
    // 移動終了時刻 = 仕事開始時刻
    expect(travelItem?.adjustedEndTime).toBe('09:00');
  });

  it('生成された DailyState の初期値が正しい', () => {
    const { settings, pattern } = baseInput();
    const result = generateDailySchedule({
      date: TODAY,
      pattern,
      routineItems: [],
      calendarEvents: [],
      locations: [],
      travelRoutes: [],
      settings,
    });

    expect(result.activeEventId).toBeNull();
    expect(result.completedEventIds).toHaveLength(0);
    expect(result.skippedEventIds).toHaveLength(0);
    expect(result.delays).toHaveLength(0);
    expect(result.patternId).toBe(pattern.id);
  });
});
