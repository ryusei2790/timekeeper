'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  disconnectCalendar,
  getCalendarAuth,
  isCalendarConnected,
  saveCalendarAuth,
} from '@/lib/calendar/auth';
import type { SyncResult } from '@/lib/calendar/sync';
import { useCalendarStore } from '@/store/useCalendarStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import type { CalendarAuth } from '@/types';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { AlertCircle, Calendar, CheckCircle, Loader2, RefreshCw, Unlink } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

// -----------------------------------------------
// ページコンポーネント
// -----------------------------------------------

export default function CalendarPage() {
  const [auth, setAuth] = useState<CalendarAuth | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [connectOpen, setConnectOpen] = useState(false);

  const { settings, loadSettings, updateSettings } = useSettingsStore();
  const { loadCalendarEvents } = useCalendarStore();

  // 初回ロード
  useEffect(() => {
    setAuth(getCalendarAuth());
    loadSettings();
  }, [loadSettings]);

  const isConnected = isCalendarConnected();

  /** 手動同期を実行する（サーバー側 API Route 経由で CalDAV にアクセス） */
  const handleSync = useCallback(async () => {
    const currentAuth = getCalendarAuth();
    if (!currentAuth) {
      toast.error('認証情報がありません');
      return;
    }

    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/caldav/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentAuth.username,
          accessToken: currentAuth.accessToken,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: '同期に失敗しました' }));
        throw new Error(err.error ?? '同期に失敗しました');
      }

      const result: SyncResult = await res.json();
      setSyncResult(result);
      loadCalendarEvents();
      toast.success(
        `同期完了: ${result.added}件追加, ${result.updated}件更新, ${result.deleted}件削除`
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '同期に失敗しました');
    } finally {
      setIsSyncing(false);
    }
  }, [loadCalendarEvents]);

  /** 接続を解除する */
  const handleDisconnect = useCallback(() => {
    disconnectCalendar();
    setAuth(null);
    setSyncResult(null);
    toast.success('カレンダーの接続を解除しました');
  }, []);

  /** 自動同期の切り替え */
  const handleAutoSyncToggle = useCallback(
    (enabled: boolean) => {
      if (!settings) return;
      updateSettings({ calendarSync: { ...settings.calendarSync, autoSync: enabled } });
    },
    [settings, updateSettings]
  );

  return (
    <div className="container max-w-2xl space-y-6 py-6">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-2xl font-bold">カレンダー連携</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Apple CalendarをCalDAVで接続してスケジュールを同期します
        </p>
      </div>

      {/* 接続状態カード */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <CardTitle className="text-base">Apple Calendar</CardTitle>
            {isConnected ? (
              <Badge variant="default" className="ml-auto bg-green-500 hover:bg-green-600">
                <CheckCircle className="mr-1 h-3 w-3" />
                接続済み
              </Badge>
            ) : (
              <Badge variant="secondary" className="ml-auto">
                未接続
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConnected && auth ? (
            <>
              {/* 接続済み状態 */}
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">アカウント: </span>
                  <span className="font-medium">{auth.username}</span>
                </p>
                {settings?.calendarSync.lastSyncAt && (
                  <p>
                    <span className="text-muted-foreground">最終同期: </span>
                    <span>
                      {format(new Date(settings.calendarSync.lastSyncAt), 'M月d日 HH:mm', {
                        locale: ja,
                      })}
                    </span>
                  </p>
                )}
              </div>

              {/* 同期結果 */}
              {syncResult && (
                <div className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
                  同期完了: {syncResult.added}件追加 / {syncResult.updated}件更新 /{' '}
                  {syncResult.deleted}件削除（合計 {syncResult.total}件）
                </div>
              )}

              {/* アクションボタン */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleDisconnect}
                >
                  <Unlink className="mr-1.5 h-3.5 w-3.5" />
                  接続を解除
                </Button>
                <Button size="sm" onClick={handleSync} disabled={isSyncing}>
                  {isSyncing ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  今すぐ同期
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* 未接続状態 */}
              <p className="text-muted-foreground text-sm">
                Apple IDとアプリ用パスワードでCalDAVに接続します
              </p>
              <ConnectDialog
                open={connectOpen}
                onOpenChange={setConnectOpen}
                onConnected={(newAuth) => setAuth(newAuth)}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* 同期設定カード */}
      {isConnected && settings && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">同期設定</CardTitle>
            <CardDescription className="text-xs">カレンダーの自動同期を設定します</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">自動同期</p>
                <p className="text-muted-foreground text-xs">定期的にカレンダーを同期します</p>
              </div>
              <Switch
                checked={settings.calendarSync.autoSync}
                onCheckedChange={handleAutoSyncToggle}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">同期間隔</p>
                <p className="text-muted-foreground text-xs">
                  {settings.calendarSync.syncIntervalMinutes}分ごとに同期
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 注意事項カード */}
      {!isConnected && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4">
            <div className="flex gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div className="space-y-1 text-sm text-amber-800">
                <p className="font-medium">接続に必要なもの</p>
                <ul className="ml-1 list-inside list-disc space-y-0.5 text-xs">
                  <li>Apple IDのメールアドレス</li>
                  <li>
                    <a
                      href="https://appleid.apple.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      appleid.apple.com
                    </a>
                    で生成したアプリ用パスワード
                  </li>
                  <li>2ファクタ認証が有効なApple ID</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// -----------------------------------------------
// 接続ダイアログ
// -----------------------------------------------

interface ConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: (auth: CalendarAuth) => void;
}

function ConnectDialog({ open, onOpenChange, onConnected }: ConnectDialogProps) {
  const [username, setUsername] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!username.trim() || !appPassword.trim()) return;

      setIsSubmitting(true);
      try {
        const auth = saveCalendarAuth(username.trim(), appPassword.trim());
        onConnected(auth);
        onOpenChange(false);
        setUsername('');
        setAppPassword('');
        toast.success('Apple Calendarに接続しました');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : '接続に失敗しました');
      } finally {
        setIsSubmitting(false);
      }
    },
    [username, appPassword, onConnected, onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Calendar className="mr-1.5 h-4 w-4" />
          カレンダーに接続
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apple Calendarに接続</DialogTitle>
          <DialogDescription>Apple IDとアプリ用パスワードを入力してください</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Apple ID（メールアドレス）</Label>
            <Input
              id="username"
              type="email"
              placeholder="example@icloud.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="appPassword">アプリ用パスワード</Label>
            <Input
              id="appPassword"
              type="password"
              placeholder="xxxx-xxxx-xxxx-xxxx"
              value={appPassword}
              onChange={(e) => setAppPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <p className="text-muted-foreground text-xs">
              Apple IDの管理画面で生成したアプリ用パスワードを入力してください
            </p>
          </div>

          <div className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <p className="font-medium">⚠️ セキュリティに関するご注意</p>
            <p className="mt-1">
              入力された認証情報はこのデバイスのみに保存されます。 アプリ用パスワードはApple
              IDの設定から生成できます。
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={!username.trim() || !appPassword.trim() || isSubmitting}
            >
              {isSubmitting ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
              接続
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
