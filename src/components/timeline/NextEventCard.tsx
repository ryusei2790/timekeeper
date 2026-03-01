'use client';

import { Card, CardContent } from '@/components/ui/card';
import { formatDuration, useTimeUntilEvent } from '@/hooks/useDailySchedule';
import type { ScheduleItem } from '@/types';
import { MapPin } from 'lucide-react';

interface NextEventCardProps {
  event: ScheduleItem;
  currentTime: string;
}

/**
 * 次のイベントを表示するカード
 */
export function NextEventCard({ event, currentTime }: NextEventCardProps) {
  const { minutesUntil } = useTimeUntilEvent(event, currentTime);

  return (
    <Card className="border-gray-200 bg-gray-50">
      <CardContent className="pt-4 pb-3">
        <p className="text-muted-foreground mb-2 text-xs font-medium">⏭️ 次のイベント</p>

        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              {event.icon && <span className="text-lg">{event.icon}</span>}
              <h3 className="truncate font-medium">{event.title}</h3>
            </div>

            <div className="text-muted-foreground mt-0.5 flex items-center gap-3 text-xs">
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

          {minutesUntil !== null && minutesUntil > 0 && (
            <span className="text-muted-foreground shrink-0 text-xs">
              あと {formatDuration(minutesUntil)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
