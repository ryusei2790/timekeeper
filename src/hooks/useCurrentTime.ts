'use client';

import { formatTime } from '@/lib/utils/time';
import { useEffect, useState } from 'react';

/**
 * 現在時刻を1秒ごとに更新するフック
 *
 * @returns 現在時刻の Date オブジェクトと HH:mm 文字列
 */
export function useCurrentTime() {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return {
    now,
    timeString: formatTime(now),
  };
}
