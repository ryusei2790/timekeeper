'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatDuration, useEventTiming } from '@/hooks/useDailySchedule';
import type { ScheduleItem } from '@/types';
import { Check, MapPin, SkipForward } from 'lucide-react';

interface CurrentEventCardProps {
  event: ScheduleItem;
  currentTime: string;
  onComplete: (eventId: string) => void;
  onSkip: (eventId: string) => void;
}

/**
 * 現在実行中のイベントを表示するカード
 */
export function CurrentEventCard({
  event,
  currentTime,
  onComplete,
  onSkip,
}: CurrentEventCardProps) {
  const { remainingMinutes, progressPercent } = useEventTiming(event, currentTime);

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="pt-4 pb-3">
        <p className="mb-2 text-xs font-medium text-blue-600">🎯 現在のイベント</p>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              {event.icon && <span className="text-xl">{event.icon}</span>}
              <h3 className="truncate font-semibold text-blue-900">{event.title}</h3>
            </div>

            <div className="mt-1 flex items-center gap-3 text-xs text-blue-700">
              <span>
                {event.adjustedStartTime} – {event.adjustedEndTime}
              </span>
              {event.locationName && (
                <span className="flex items-center gap-0.5">
                  <MapPin className="h-3 w-3" />
                  {event.locationName}
                </span>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1">
            {remainingMinutes !== null && (
              <span className="text-sm font-semibold text-blue-700">
                残り {formatDuration(remainingMinutes)}
              </span>
            )}
          </div>
        </div>

        {/* プログレスバー */}
        <Progress value={progressPercent} className="mt-3 h-1.5 bg-blue-100" />

        {/* アクションボタン */}
        <div className="mt-3 flex justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
            onClick={() => onSkip(event.id)}
          >
            <SkipForward className="mr-1 h-3.5 w-3.5" />
            スキップ
          </Button>
          <Button
            size="sm"
            className="h-8 bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => onComplete(event.id)}
          >
            <Check className="mr-1 h-3.5 w-3.5" />
            完了
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
