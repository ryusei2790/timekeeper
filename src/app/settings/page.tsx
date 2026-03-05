'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { getDb } from '@/lib/db';
import { uploadAll } from '@/lib/sync/supabaseSync';
import { useAuthStore } from '@/store/useAuthStore';
import { useCalendarStore } from '@/store/useCalendarStore';
import { useLocationStore } from '@/store/useLocationStore';
import { usePatternStore } from '@/store/usePatternStore';
import { useRoutineStore } from '@/store/useRoutineStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTravelRouteStore } from '@/store/useTravelRouteStore';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Calendar, Cloud, CloudOff, Download, RefreshCw, Trash2, Upload } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { settings, isLoading, loadSettings, updateSettings, initializeSettings } =
    useSettingsStore();
  const { locations, loadLocations } = useLocationStore();
  const { calendarEvents, loadCalendarEvents, clearEvents } = useCalendarStore();
  const { loadPatterns } = usePatternStore();
  const { loadRoutineItems } = useRoutineStore();
  const { loadTravelRoutes } = useTravelRouteStore();
  const { user, signOut } = useAuthStore();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadSettings();
    loadLocations();
    loadCalendarEvents();
  }, [loadSettings, loadLocations, loadCalendarEvents]);

  // 日付ごとにグループ化（直近10日分のみ表示）
  const eventsByDate = useMemo(() => {
    const groups = new Map<string, typeof calendarEvents>();
    for (const event of calendarEvents) {
      const dateKey = event.startTime.slice(0, 10); // YYYY-MM-DD
      if (!groups.has(dateKey)) groups.set(dateKey, []);
      groups.get(dateKey)!.push(event);
    }
    // 日付昇順でソート
    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(0, 10);
  }, [calendarEvents]);

  // 設定が未初期化で場所が存在する場合、最初の場所でデフォルト設定を初期化
  useEffect(() => {
    if (!isLoading && !settings && locations.length > 0) {
      initializeSettings(locations[0].id);
    }
  }, [isLoading, settings, locations, initializeSettings]);

  // ---- データエクスポート ----
  async function handleExport() {
    try {
      const db = await getDb();
      const tables = [
        'locations',
        'routine_items',
        'life_patterns',
        'travel_routes',
        'calendar_events',
        'daily_states',
        'settings',
      ] as const;
      const data: Record<string, unknown[]> = {};
      for (const table of tables) {
        const result = await db.query(`SELECT * FROM ${table}`);
        data[table] = result.rows;
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `timekeeper-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('データをエクスポートしました');
    } catch {
      toast.error('エクスポートに失敗しました');
    }
  }

  // ---- データインポート ----
  function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string) as Record<string, unknown[]>;
          const db = await getDb();

          // 既存データを全削除してからインポート
          for (const table of [
            'settings',
            'daily_states',
            'calendar_events',
            'travel_routes',
            'life_patterns',
            'routine_items',
            'locations',
          ]) {
            await db.query(`DELETE FROM ${table}`);
          }

          // 各テーブルにデータを挿入
          for (const [table, rows] of Object.entries(data)) {
            if (!Array.isArray(rows) || rows.length === 0) continue;
            const columns = Object.keys(rows[0] as Record<string, unknown>);
            for (const row of rows as Record<string, unknown>[]) {
              const values = columns.map((col) => row[col]);
              const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
              await db.query(
                `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
                values
              );
            }
          }

          // 全Storeを再ロード
          await Promise.all([
            loadSettings(),
            loadLocations(),
            loadCalendarEvents(),
            loadPatterns(),
            loadRoutineItems(),
            loadTravelRoutes(),
          ]);

          toast.success('データをインポートしました');
        } catch {
          toast.error('インポートに失敗しました。ファイル形式を確認してください。');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  // ---- データ全削除 ----
  async function handleClearData() {
    if (!confirm('すべてのデータを削除します。この操作は取り消せません。続けますか？')) return;
    try {
      const db = await getDb();
      for (const table of [
        'settings',
        'daily_states',
        'calendar_events',
        'travel_routes',
        'life_patterns',
        'routine_items',
        'locations',
      ]) {
        await db.query(`DELETE FROM ${table}`);
      }
      // 全Storeを再ロード
      await Promise.all([
        loadSettings(),
        loadLocations(),
        loadCalendarEvents(),
        loadPatterns(),
        loadRoutineItems(),
        loadTravelRoutes(),
      ]);
      toast.success('データを削除しました');
    } catch {
      toast.error('データの削除に失敗しました');
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-2xl space-y-4 py-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="container mt-8 ml-8 max-w-2xl space-y-6 py-6">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-2xl font-bold">設定</h1>
        <p className="text-muted-foreground mt-1 text-sm">アプリの動作をカスタマイズします</p>
      </div>

      {/* -------- アカウント -------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">アカウント</CardTitle>
          <CardDescription>ログインするとクロスデバイスでデータを同期できます</CardDescription>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Cloud className="h-4 w-4 text-green-500" />
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isSyncing}
                  onClick={async () => {
                    setIsSyncing(true);
                    try {
                      await uploadAll(user.id);
                      toast.success('同期しました');
                    } catch {
                      toast.error('同期に失敗しました');
                    } finally {
                      setIsSyncing(false);
                    }
                  }}
                >
                  <RefreshCw className={`mr-1 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  今すぐ同期
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await signOut();
                    toast.success('ログアウトしました');
                  }}
                >
                  ログアウト
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <CloudOff className="h-4 w-4" />
                <span>未ログイン（このデバイスのみで動作中）</span>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="/login">ログイン</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* -------- 一般設定 -------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">一般設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* デフォルト出発地 */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label>デフォルト出発地</Label>
              <p className="text-muted-foreground text-xs">1日の開始位置として使用される場所</p>
            </div>
            <Select
              value={settings?.defaultLocationId ?? ''}
              onValueChange={(v) => {
                updateSettings({ defaultLocationId: v });
                toast.success('出発地を更新しました');
              }}
              disabled={locations.length === 0}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="場所を選択" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* 週の開始曜日 */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label>週の開始曜日</Label>
              <p className="text-muted-foreground text-xs">カレンダー表示の先頭曜日</p>
            </div>
            <Select
              value={String(settings?.weekStartsOn ?? 1)}
              onValueChange={(v) => {
                updateSettings({ weekStartsOn: Number(v) as 0 | 1 });
                toast.success('設定を更新しました');
              }}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">日曜日</SelectItem>
                <SelectItem value="1">月曜日</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* 時刻表示形式 */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label>時刻表示形式</Label>
              <p className="text-muted-foreground text-xs">12時間制 / 24時間制</p>
            </div>
            <Select
              value={settings?.timeFormat ?? '24h'}
              onValueChange={(v) => {
                updateSettings({ timeFormat: v as '12h' | '24h' });
                toast.success('設定を更新しました');
              }}
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24時間制</SelectItem>
                <SelectItem value="12h">12時間制</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* -------- 通知設定 -------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">通知設定</CardTitle>
          <CardDescription>ブラウザの通知許可が必要です（将来対応）</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* 通知の有効/無効 */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>通知を有効にする</Label>
              <p className="text-muted-foreground text-xs">イベント開始前にブラウザ通知を送る</p>
            </div>
            <Switch
              checked={settings?.notifications.enabled ?? false}
              onCheckedChange={(v) => {
                updateSettings({
                  notifications: {
                    ...(settings?.notifications ?? {
                      enabled: false,
                      beforeEventMinutes: 15,
                      delayWarning: true,
                    }),
                    enabled: v,
                  },
                });
                toast.success('設定を更新しました');
              }}
            />
          </div>

          <Separator />

          {/* 遅延警告 */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>遅延警告</Label>
              <p className="text-muted-foreground text-xs">スケジュールが遅延したときに通知する</p>
            </div>
            <Switch
              checked={settings?.notifications.delayWarning ?? true}
              onCheckedChange={(v) => {
                updateSettings({
                  notifications: {
                    ...(settings?.notifications ?? {
                      enabled: false,
                      beforeEventMinutes: 15,
                      delayWarning: true,
                    }),
                    delayWarning: v,
                  },
                });
                toast.success('設定を更新しました');
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* -------- データ管理 -------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">データ管理</CardTitle>
          <CardDescription>
            すべてのデータは端末のブラウザ（IndexedDB）に保存されています
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-1 h-4 w-4" />
              データをエクスポート
            </Button>
            <Button variant="outline" size="sm" onClick={handleImport}>
              <Upload className="mr-1 h-4 w-4" />
              データをインポート
            </Button>
          </div>
          <Separator />
          <div>
            <Button variant="destructive" size="sm" onClick={handleClearData}>
              すべてのデータを削除
            </Button>
            <p className="text-muted-foreground mt-1 text-xs">
              パターン・場所・習慣項目などすべてのデータが削除されます
            </p>
          </div>
        </CardContent>
      </Card>

      {/* -------- カレンダーデータ -------- */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <CardTitle className="text-base">インポート済みカレンダー</CardTitle>
            <Badge variant="secondary" className="ml-auto text-xs">
              {calendarEvents.length}件
            </Badge>
          </div>
          <CardDescription>
            .ics
            ファイルからインポートされたイベントの一覧です。ホームのスケジュールに反映されます。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {calendarEvents.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center text-sm">
              インポートされたイベントはありません
              <br />
              <span className="text-xs">
                カレンダー連携ページから .ics ファイルをインポートしてください
              </span>
            </p>
          ) : (
            <div className="space-y-3">
              {eventsByDate.map(([dateKey, events]) => (
                <div key={dateKey}>
                  <p className="text-muted-foreground mb-1 text-xs font-medium">
                    {format(new Date(dateKey + 'T00:00:00'), 'M月d日(E)', { locale: ja })}
                    <span className="ml-1">({events.length}件)</span>
                  </p>
                  <div className="space-y-1">
                    {events
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-1.5 text-sm"
                        >
                          <div className="min-w-0">
                            <span className="font-medium">{event.title}</span>
                            {event.isAllDay ? (
                              <Badge variant="outline" className="ml-2 px-1.5 py-0 text-xs">
                                終日
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground ml-2 text-xs">
                                {event.startTime.slice(11, 16)} – {event.endTime.slice(11, 16)}
                              </span>
                            )}
                            {event.locationName && (
                              <span className="text-muted-foreground ml-2 text-xs">
                                📍 {event.locationName}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
              {calendarEvents.length > 0 && (
                <>
                  {eventsByDate.length <
                    new Set(calendarEvents.map((e) => e.startTime.slice(0, 10))).size && (
                    <p className="text-muted-foreground text-center text-xs">
                      ※ 直近10日分を表示（全 {calendarEvents.length} 件）
                    </p>
                  )}
                  <Separator />
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive w-full"
                    onClick={() => {
                      if (!confirm('インポートしたカレンダーデータをすべて削除しますか？')) return;
                      clearEvents();
                      toast.success('カレンダーデータを削除しました');
                    }}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    カレンダーデータをすべて削除
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* バージョン情報 */}
      <p className="text-muted-foreground pb-4 text-center text-xs">TimeKeeper v0.1.0 (MVP)</p>
    </div>
  );
}
