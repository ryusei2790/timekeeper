import { describe, expect, it } from 'vitest';
import { addMinutesToTime, calcEndTime, isTimeBefore, minutesBetween } from '@/lib/utils/time';

describe('addMinutesToTime', () => {
  it('正の分数を加算できる', () => {
    expect(addMinutesToTime('09:00', 30)).toBe('09:30');
  });

  it('負の分数を加算できる（減算）', () => {
    expect(addMinutesToTime('09:30', -30)).toBe('09:00');
  });

  it('時をまたいで加算できる', () => {
    expect(addMinutesToTime('09:45', 30)).toBe('10:15');
  });

  it('0分の加算は変化なし', () => {
    expect(addMinutesToTime('09:00', 0)).toBe('09:00');
  });

  it('60分加算すると1時間増える', () => {
    expect(addMinutesToTime('08:00', 60)).toBe('09:00');
  });
});

describe('minutesBetween', () => {
  it('同じ時刻の差分は0', () => {
    expect(minutesBetween('09:00', '09:00')).toBe(0);
  });

  it('30分の差分を計算できる', () => {
    expect(minutesBetween('09:00', '09:30')).toBe(30);
  });

  it('逆順の場合は負数を返す', () => {
    expect(minutesBetween('09:30', '09:00')).toBe(-30);
  });

  it('1時間の差分を計算できる', () => {
    expect(minutesBetween('08:00', '09:00')).toBe(60);
  });

  it('複数時間の差分を計算できる', () => {
    expect(minutesBetween('07:00', '10:30')).toBe(210);
  });
});

describe('isTimeBefore', () => {
  it('start < end の場合 true', () => {
    expect(isTimeBefore('09:00', '09:30')).toBe(true);
  });

  it('start > end の場合 false', () => {
    expect(isTimeBefore('09:30', '09:00')).toBe(false);
  });

  it('start === end の場合 false', () => {
    expect(isTimeBefore('09:00', '09:00')).toBe(false);
  });
});

describe('calcEndTime', () => {
  it('開始時刻 + 所要時間 = 終了時刻', () => {
    expect(calcEndTime('09:00', 30)).toBe('09:30');
  });

  it('60分の場合は1時間後', () => {
    expect(calcEndTime('07:00', 60)).toBe('08:00');
  });

  it('90分の場合は1時間30分後', () => {
    expect(calcEndTime('06:30', 90)).toBe('08:00');
  });
});
