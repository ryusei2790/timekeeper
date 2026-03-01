'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { minutesBetween } from '@/lib/utils/time';
import type { ScheduleItem } from '@/types';
import { Check, ChevronRight, MapPin, SkipForward } from 'lucide-react';

interface TimelineItemProps {
  item: ScheduleItem;
  /** 現在時刻（HH:mm）- 現在進行中かどうかの判定に使用 */
  currentTime: string;
  onComplete?: (eventId: string) => void;
  onSkip?: (eventId: string) => void;
}

/** ステータスに応じたアイコンと色を返す */
function StatusIndicator({ status }: { status: ScheduleItem['status'] }) {
  if (status === 'completed') {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
        <Check className="h-4 w-4" />
      </span>
    );
  }
  if (status === 'active') {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500">
        <span className="h-2.5 w-2.5 rounded-full bg-white" />
      </span>
    );
  }
  if (status === 'skipped') {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <SkipForward className="h-3.5 w-3.5" />
      </span>
    );
  }
  // pending
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 bg-white" />
  );
}

/**
 * タイムラインの1アイテム
 */
export function TimelineItem({ item, currentTime, onComplete, onSkip }: TimelineItemProps) {
  const isActive = item.status === 'active';
  const isCompleted = item.status === 'completed';
  const isSkipped = item.status === 'skipped';
  const isTravel = item.type === 'travel';

  // 遅延判定: 現在時刻がスケジュール上の開始時刻を過ぎているが pending
  const isDelayed =
    item.status === 'pending' && minutesBetween(item.adjustedStartTime, currentTime) > 0;

  const duration = minutesBetween(item.adjustedStartTime, item.adjustedEndTime);

  return (
    <div
      className={cn(
        'flex gap-3 py-2',
        isCompleted && 'opacity-50',
        isSkipped && 'line-through opacity-40'
      )}
    >
      {/* 左カラム: 時刻 + 縦線 */}
      <div className="flex w-12 shrink-0 flex-col items-end gap-0.5">
        <span
          className={cn(
            'text-xs font-medium tabular-nums',
            isActive ? 'text-blue-600' : 'text-muted-foreground',
            isDelayed && 'text-orange-500'
          )}
        >
          {item.adjustedStartTime}
        </span>
      </div>

      {/* 縦線 + ステータスインジケーター */}
      <div className="relative flex flex-col items-center">
        <StatusIndicator status={item.status} />
        <div className="bg-border mt-1 w-px flex-1" />
      </div>

      {/* 右カラム: イベント内容 */}
      <div
        className={cn(
          'mb-3 min-w-0 flex-1 rounded-lg border p-3',
          isActive && 'border-blue-200 bg-blue-50'
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            {/* タイトル行 */}
            <div className="flex flex-wrap items-center gap-1.5">
              {item.icon && <span>{item.icon}</span>}
              <span className={cn('text-sm font-medium', isActive && 'text-blue-900')}>
                {item.title}
              </span>
              {isTravel && (
                <Badge variant="secondary" className="px-1.5 py-0 text-xs">
                  移動
                </Badge>
              )}
              {item.type === 'calendar' && (
                <Badge className="bg-purple-100 px-1.5 py-0 text-xs text-purple-700 hover:bg-purple-100">
                  予定
                </Badge>
              )}
              {isDelayed && (
                <Badge variant="destructive" className="px-1.5 py-0 text-xs">
                  遅延
                </Badge>
              )}
            </div>

            {/* メタ情報: 時間 + 場所 */}
            <div className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-2 text-xs">
              <span>{duration}分</span>
              {item.locationName && (
                <span className="flex items-center gap-0.5">
                  <MapPin className="h-3 w-3" />
                  {item.locationName}
                </span>
              )}
              {isTravel && item.travelRoute && (
                <span className="text-xs">〜{item.adjustedEndTime}</span>
              )}
            </div>
          </div>

          {/* アクションボタン（activeの場合のみ表示） */}
          {isActive && (
            <div className="flex shrink-0 gap-1">
              {onSkip && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground h-7 px-2 text-xs"
                  onClick={() => onSkip(item.id)}
                >
                  スキップ
                </Button>
              )}
              {onComplete && (
                <Button
                  size="sm"
                  className="h-7 bg-blue-600 px-2 text-xs hover:bg-blue-700"
                  onClick={() => onComplete(item.id)}
                >
                  <Check className="mr-1 h-3 w-3" />
                  完了
                </Button>
              )}
            </div>
          )}

          {/* pending かつ将来のアイテムにはシェブロン */}
          {item.status === 'pending' && !isDelayed && (
            <ChevronRight className="text-muted-foreground/40 h-4 w-4 shrink-0" />
          )}
        </div>
      </div>
    </div>
  );
}
