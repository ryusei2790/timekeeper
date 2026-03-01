'use client';

import { TimelineItem } from './TimelineItem';
import type { ScheduleItem } from '@/types';
import { CalendarX } from 'lucide-react';

interface TimelineProps {
  schedule: ScheduleItem[];
  currentTime: string;
  onComplete?: (eventId: string) => void;
  onSkip?: (eventId: string) => void;
}

/**
 * 1日のタイムラインを表示するコンポーネント
 */
export function Timeline({ schedule, currentTime, onComplete, onSkip }: TimelineProps) {
  if (schedule.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center py-16">
        <CalendarX className="mb-3 h-12 w-12 opacity-40" />
        <p className="text-sm">今日のスケジュールがありません</p>
        <p className="mt-1 text-xs opacity-70">パターンを設定するとスケジュールが生成されます</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {schedule.map((item) => (
        <TimelineItem
          key={item.id}
          item={item}
          currentTime={currentTime}
          onComplete={onComplete}
          onSkip={onSkip}
        />
      ))}
    </div>
  );
}
