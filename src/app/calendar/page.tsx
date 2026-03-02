'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { importCalendarEvents } from '@/lib/calendar/sync';
import { parseIcsText } from '@/lib/calendar/ics';
import type { SyncResult } from '@/lib/calendar/sync';
import { useCalendarStore } from '@/store/useCalendarStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { AlertCircle, Calendar, CheckCircle, FileUp, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function CalendarPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<SyncResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { settings, loadSettings } = useSettingsStore();
  const { loadCalendarEvents } = useCalendarStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

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

      const result = importCalendarEvents(events);
      setImportResult(result);
      loadCalendarEvents();
      toast.success(
        `インポート完了: ${result.added}件追加, ${result.updated}件更新, ${result.deleted}件削除`
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'インポートに失敗しました');
    } finally {
      setIsImporting(false);
    }
  }, [selectedFile, loadCalendarEvents]);

  /** ファイル選択ダイアログを開く */
  const handleSelectClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="container max-w-2xl space-y-6 py-6">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-2xl font-bold">カレンダー連携</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          .ics ファイルをインポートしてスケジュールを同期します
        </p>
      </div>

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
                  <span className="font-medium">Google Calendar</span>: 設定 → カレンダーの設定 →
                  「カレンダーをエクスポート」
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
    </div>
  );
}
