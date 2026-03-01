import { describe, expect, it } from 'vitest';
import { selectPattern } from '@/lib/scheduler/pattern-selector';
import { makeCalendarEvent, makePattern } from '@/test/factories';

describe('selectPattern', () => {
  it('パターンが空の場合は null を返す', () => {
    const result = selectPattern(new Date('2026-03-01'), [], []);
    expect(result).toBeNull();
  });

  it('デフォルトパターンを選択する', () => {
    const defaultPattern = makePattern({
      name: 'デフォルト',
      rules: { dayOfWeek: [], keywords: [], isDefault: true, priority: 1 },
    });
    const result = selectPattern(new Date('2026-03-01'), [defaultPattern], []);
    expect(result?.id).toBe(defaultPattern.id);
  });

  it('曜日がマッチするパターンを選択する（月曜日=1）', () => {
    // 2026-03-02 は月曜日
    const mondayPattern = makePattern({
      name: '平日',
      rules: { dayOfWeek: [1, 2, 3, 4, 5], keywords: [], isDefault: false, priority: 1 },
    });
    const weekendPattern = makePattern({
      name: '休日',
      rules: { dayOfWeek: [0, 6], keywords: [], isDefault: false, priority: 1 },
    });
    const result = selectPattern(new Date('2026-03-02'), [mondayPattern, weekendPattern], []);
    expect(result?.id).toBe(mondayPattern.id);
  });

  it('曜日がマッチしない場合はデフォルトを返す', () => {
    // 2026-03-01 は日曜日
    const weekdayPattern = makePattern({
      rules: { dayOfWeek: [1, 2, 3, 4, 5], keywords: [], isDefault: false, priority: 1 },
    });
    const defaultPattern = makePattern({
      name: 'デフォルト',
      rules: { dayOfWeek: [], keywords: [], isDefault: true, priority: 1 },
    });
    const result = selectPattern(new Date('2026-03-01'), [weekdayPattern, defaultPattern], []);
    expect(result?.id).toBe(defaultPattern.id);
  });

  it('キーワードがカレンダー予定にマッチするパターンを優先する', () => {
    const normalPattern = makePattern({
      name: '通常',
      rules: { dayOfWeek: [0, 1, 2, 3, 4, 5, 6], keywords: [], isDefault: false, priority: 1 },
    });
    const travelPattern = makePattern({
      name: '出張',
      rules: {
        dayOfWeek: [],
        keywords: ['出張', '旅行'],
        isDefault: false,
        priority: 2,
      },
    });
    const event = makeCalendarEvent({ title: '東京出張' });
    const result = selectPattern(new Date('2026-03-01'), [normalPattern, travelPattern], [event]);
    expect(result?.id).toBe(travelPattern.id);
  });

  it('複数パターンがマッチした場合は priority の高いほうを選ぶ', () => {
    const low = makePattern({
      rules: { dayOfWeek: [0, 1, 2, 3, 4, 5, 6], keywords: [], isDefault: false, priority: 1 },
    });
    const high = makePattern({
      rules: { dayOfWeek: [0, 1, 2, 3, 4, 5, 6], keywords: [], isDefault: false, priority: 5 },
    });
    const result = selectPattern(new Date('2026-03-02'), [low, high], []);
    expect(result?.id).toBe(high.id);
  });

  it('キーワードマッチが曜日マッチより優先される', () => {
    // 2026-03-02 は月曜日
    const weekdayPattern = makePattern({
      name: '平日',
      rules: { dayOfWeek: [1, 2, 3, 4, 5], keywords: [], isDefault: false, priority: 10 },
    });
    const keywordPattern = makePattern({
      name: '出張',
      rules: { dayOfWeek: [], keywords: ['出張'], isDefault: false, priority: 1 },
    });
    const event = makeCalendarEvent({ title: '大阪出張' });
    const result = selectPattern(new Date('2026-03-02'), [weekdayPattern, keywordPattern], [event]);
    expect(result?.id).toBe(keywordPattern.id);
  });
});
