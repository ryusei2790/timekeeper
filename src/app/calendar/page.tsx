'use client';

import { CurrentEventCard } from '@/components/timeline/CurrentEventCard';
import { NextEventCard } from '@/components/timeline/NextEventCard';
import { Timeline } from '@/components/timeline/Timeline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { parseIcsText } from '@/lib/calendar/ics';
import { importCalendarEvents } from '@/lib/calendar/sync';
import type { SyncResult } from '@/lib/calendar/sync';
import { useDailySchedule } from '@/hooks/useDailySchedule';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { useSettingsStore } from '@/store/useSettingsStore';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { AlertCircle, Calendar, CheckCircle, FileUp, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function CalendarPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<SyncResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { settings } = useSettingsStore();
  const timeString = useCurrentTime()?.timeString ?? '';
  const { schedule, todayState, activeEvent, nextEvent, patterns, handleComplete, handleSkip } =
    useDailySchedule();

  const isLoading = todayState === null && patterns.length === 0;

  /** ファイル選択時のハンドラー */
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setImportResult(null);
  }, []);

  /** インポートを実行する */
  const handleImport = useCallback(async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    setImportResult(null);
    try {
      const text = await selectedFile.text();
      const events = parseIcsText(text);

      if (events.length === 0) {
        toast.error('イベントが見つかりませんでした。有効な .ics ファイルか確認してください。');
        return;
      }

      const result = await importCalendarEvents(events);
      setImportResult(result);
      toast.success(
        `インポート完了: ${result.added}件追加, ${result.updated}件更新, ${result.deleted}件削除`
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'インポートに失敗しました');
    } finally {
      setIsImporting(false);
    }
  }, [selectedFile]);

  /** ファイル選択ダイアログを開く */
  const handleSelectClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="container mt-8 ml-8 max-w-2xl space-y-6 py-6">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-2xl font-bold">カレンダー連携</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          .ics ファイルをインポートしてスケジュールを同期します
        </p>
      </div>

      <Tabs defaultValue="import">
        <TabsList>
          <TabsTrigger value="import">インポート</TabsTrigger>
          <TabsTrigger value="schedule">今日のスケジュール</TabsTrigger>
        </TabsList>

        {/* インポートタブ */}
        <TabsContent value="import" className="mt-4 space-y-4">
          {/* インポートカード */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <CardTitle className="text-base">カレンダーのインポート</CardTitle>
                {settings?.calendarSync.lastSyncAt && (
                  <Badge variant="secondary" className="ml-auto">
                    <CheckCircle className="mr-1 h-3 w-3 text-green-600" />
                    最終インポート:{' '}
                    {format(new Date(settings.calendarSync.lastSyncAt), 'M月d日 HH:mm', {
                      locale: ja,
                    })}
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs">
                TimeTree・Google Calendar・Apple Calendar など、.ics
                エクスポートに対応しているカレンダーアプリのファイルをインポートできます
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ファイル選択エリア */}
              <div
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 transition-colors hover:bg-gray-50"
                onClick={handleSelectClick}
              >
                <FileUp className="text-muted-foreground mb-2 h-8 w-8" />
                <p className="text-sm font-medium">
                  {selectedFile ? selectedFile.name : '.ics ファイルを選択'}
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  クリックしてファイルを選択してください
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".ics,text/calendar"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* インポートボタン */}
              {selectedFile && (
                <Button className="w-full" onClick={handleImport} disabled={isImporting}>
                  {isImporting ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <FileUp className="mr-1.5 h-4 w-4" />
                  )}
                  {isImporting ? 'インポート中...' : 'インポート'}
                </Button>
              )}

              {/* インポート結果 */}
              {importResult && (
                <div className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
                  インポート完了: {importResult.added}件追加 / {importResult.updated}件更新 /{' '}
                  {importResult.deleted}件削除（合計 {importResult.total}件のイベントを処理）
                </div>
              )}
            </CardContent>
          </Card>

          {/* 使い方ガイドカード */}
          <Card className="border-blue-100 bg-blue-50">
            <CardContent className="pt-4">
              <div className="flex gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <div className="space-y-2 text-sm text-blue-800">
                  <p className="font-medium">.ics ファイルの取得方法</p>
                  <ul className="ml-1 list-inside list-disc space-y-1 text-xs">
                    <li>
                      <span className="font-medium">TimeTree</span>: アプリ設定 → カレンダー設定 →
                      「iCal 購読」から .ics URL を開いて保存
                    </li>
                    <li>
                      <span className="font-medium">Google Calendar</span>: 設定 → カレンダーの設定
                      → 「カレンダーをエクスポート」
                    </li>
                    <li>
                      <span className="font-medium">Apple Calendar</span>: ファイル → 書き出し →
                      カレンダーを書き出し
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 今日のスケジュールタブ */}
        <TabsContent value="schedule" className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          ) : schedule.length === 0 ? (
            <CalendarScheduleEmptyState />
          ) : (
            <div className="space-y-3">
              {activeEvent && (
                <CurrentEventCard
                  event={activeEvent}
                  currentTime={timeString}
                  onComplete={handleComplete}
                  onSkip={handleSkip}
                />
              )}
              {!activeEvent && nextEvent && (
                <NextEventCard event={nextEvent} currentTime={timeString} />
              )}
              <div>
                <p className="text-muted-foreground mb-2 text-sm font-semibold">
                  今日のスケジュール
                </p>
                <Timeline
                  schedule={schedule}
                  currentTime={timeString}
                  onComplete={handleComplete}
                  onSkip={handleSkip}
                />
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/** スケジュール未生成時の EmptyState（カレンダーページ用） */
function CalendarScheduleEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center space-y-3 py-16 text-center">
      <p className="text-4xl">📅</p>
      <h2 className="text-lg font-semibold">スケジュールが未生成です</h2>
      <p className="text-muted-foreground max-w-xs text-sm">
        ホーム画面でパターンを選択すると今日のスケジュールが自動生成されます。
      </p>
      <Link
        href="/"
        className="border-input bg-background hover:bg-accent inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium shadow-sm transition-colors"
      >
        ホームへ移動
      </Link>
    </div>
  );
}
