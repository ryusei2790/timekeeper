'use client';

import { formatTime } from '@/lib/utils/time';
import { useCallback, useSyncExternalStore } from 'react';

let currentTime = new Date();
const listeners = new Set<() => void>();

const subscribe = (callback: () => void) => {
  listeners.add(callback);
  const timer = setInterval(() => {
    currentTime = new Date();
    listeners.forEach((l) => l());
  }, 1000);
  return () => {
    listeners.delete(callback);
    clearInterval(timer);
  };
};

const getSnapshot = () => currentTime;
const getServerSnapshot = () => null;

/**
 * 現在時刻を1秒ごとに更新するフック
 *
 * `useSyncExternalStore` を使用することで、SSRとクライアントの
 * ハイドレーションミスマッチを安全に回避する。
 *
 * @returns 現在時刻の Date オブジェクトと HH:mm 文字列（SSR時は null）
 */
export function useCurrentTime(): { now: Date; timeString: string } | null {
  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const format = useCallback((d: Date) => formatTime(d), []);

  if (!now) return null;

  return {
    now,
    timeString: format(now),
  };
}
