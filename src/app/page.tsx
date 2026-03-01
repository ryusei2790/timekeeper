'use client';

import { CurrentEventCard } from '@/components/timeline/CurrentEventCard';
import { NextEventCard } from '@/components/timeline/NextEventCard';
import { Timeline } from '@/components/timeline/Timeline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useDailySchedule } from '@/hooks/useDailySchedule';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { formatJapaneseDate } from '@/lib/utils/date';
import { useLocationStore } from '@/store/useLocationStore';
import { MapPin, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const { timeString, now } = useCurrentTime();
  const {
    schedule,
    todayState,
    activeEvent,
    nextEvent,
    patterns,
    handleComplete,
    handleSkip,
    regenerateWithPattern,
  } = useDailySchedule();
  const { locations } = useLocationStore();

  const isLoading = todayState === null && patterns.length === 0;

  /** 現在地の名前 */
  const currentLocationName = todayState
    ? (locations.find((l) => l.id === todayState.currentLocationId)?.name ?? '不明')
    : null;

  /** 適用中パターン名 */
  const currentPattern = patterns.find((p) => p.id === todayState?.patternId);

  return (
    <div className="container max-w-2xl space-y-4 py-4">
      {/* ページヘッダー */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">{formatJapaneseDate(now)}</h1>
          <p className="mt-0.5 font-mono text-3xl font-semibold tabular-nums">{timeString}</p>
        </div>
        {currentLocationName && (
          <Badge variant="secondary" className="mt-1 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {currentLocationName}
          </Badge>
        )}
      </div>

      {/* パターンセレクター */}
      {patterns.length > 0 && (
        <div className="flex items-center gap-2">
          <Select
            value={todayState?.patternId ?? ''}
            onValueChange={(patternId) => {
              const pattern = patterns.find((p) => p.id === patternId);
              if (pattern) regenerateWithPattern(pattern);
            }}
          >
            <SelectTrigger className="h-8 w-auto text-xs">
              <SelectValue placeholder="パターンを選択" />
            </SelectTrigger>
            <SelectContent>
              {patterns.map((p) => (
                <SelectItem key={p.id} value={p.id} className="text-xs">
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {currentPattern && (
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground h-8 px-2 text-xs"
              onClick={() => {
                if (currentPattern) regenerateWithPattern(currentPattern);
              }}
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              再生成
            </Button>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : schedule.length === 0 && patterns.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {/* 現在のイベント */}
          {activeEvent && (
            <CurrentEventCard
              event={activeEvent}
              currentTime={timeString}
              onComplete={handleComplete}
              onSkip={handleSkip}
            />
          )}

          {/* 次のイベント */}
          {nextEvent && !activeEvent && (
            <NextEventCard event={nextEvent} currentTime={timeString} />
          )}

          {/* タイムライン */}
          <div>
            <h2 className="text-muted-foreground mb-2 text-sm font-semibold">
              📋 今日のスケジュール
            </h2>
            <Timeline
              schedule={schedule}
              currentTime={timeString}
              onComplete={handleComplete}
              onSkip={handleSkip}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/** パターン・場所未設定時の初期案内 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center space-y-3 py-16 text-center">
      <p className="text-4xl">🗓️</p>
      <h2 className="text-lg font-semibold">まずは設定を完了しましょう</h2>
      <p className="text-muted-foreground max-w-xs text-sm">
        場所・パターン・習慣項目を登録すると、今日のスケジュールが自動生成されます。
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <a
          href="/places"
          className="border-input bg-background hover:bg-accent inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium shadow-sm"
        >
          📍 場所を追加
        </a>
        <a
          href="/patterns"
          className="border-input bg-background hover:bg-accent inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium shadow-sm"
        >
          📋 パターンを作成
        </a>
      </div>
    </div>
  );
}
