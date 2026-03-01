import { beforeEach, describe, expect, it } from 'vitest';
import {
  buildBasicAuthHeader,
  disconnectCalendar,
  getCalendarAuth,
  isCalendarConnected,
  saveCalendarAuth,
} from '@/lib/calendar/auth';

describe('saveCalendarAuth / getCalendarAuth', () => {
  beforeEach(() => {
    // 各テスト前に認証情報をクリア
    disconnectCalendar();
  });

  it('認証情報を保存して取得できる', () => {
    saveCalendarAuth('user@icloud.com', 'app-pass-1234');
    const auth = getCalendarAuth();

    expect(auth).not.toBeNull();
    expect(auth?.username).toBe('user@icloud.com');
    expect(auth?.accessToken).toBe('app-pass-1234');
    expect(auth?.provider).toBe('apple');
  });

  it('保存前は null を返す', () => {
    const auth = getCalendarAuth();
    expect(auth).toBeNull();
  });

  it('再保存すると最新の値に上書きされる', () => {
    saveCalendarAuth('old@icloud.com', 'old-pass');
    saveCalendarAuth('new@icloud.com', 'new-pass');

    const auth = getCalendarAuth();
    expect(auth?.username).toBe('new@icloud.com');
    expect(auth?.accessToken).toBe('new-pass');
  });

  it('再保存しても createdAt は変わらない', () => {
    const first = saveCalendarAuth('user@icloud.com', 'pass1');
    const second = saveCalendarAuth('user@icloud.com', 'pass2');

    expect(second.createdAt).toBe(first.createdAt);
  });
});

describe('isCalendarConnected', () => {
  beforeEach(() => {
    disconnectCalendar();
  });

  it('保存前は false を返す', () => {
    expect(isCalendarConnected()).toBe(false);
  });

  it('保存後は true を返す', () => {
    saveCalendarAuth('user@icloud.com', 'pass');
    expect(isCalendarConnected()).toBe(true);
  });
});

describe('disconnectCalendar', () => {
  it('認証情報を削除する', () => {
    saveCalendarAuth('user@icloud.com', 'pass');
    disconnectCalendar();

    expect(getCalendarAuth()).toBeNull();
    expect(isCalendarConnected()).toBe(false);
  });
});

describe('buildBasicAuthHeader', () => {
  it('"Basic <base64>" 形式の文字列を返す', () => {
    const auth = saveCalendarAuth('user@icloud.com', 'mypassword');
    const header = buildBasicAuthHeader(auth);

    expect(header).toMatch(/^Basic /);
    // デコードして検証
    const encoded = header.replace('Basic ', '');
    const decoded = atob(encoded);
    expect(decoded).toBe('user@icloud.com:mypassword');
  });
});
