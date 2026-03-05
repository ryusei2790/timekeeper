# 認証・マルチデバイス同期 設計方針

## 概要

Magic Link（パスワード不要のメール認証）+ Supabase によるクラウド同期を実装する。
未ログインでも従来通りローカル（PGlite + IndexedDB）で全機能が動作するオフラインファースト設計を維持する。

---

## 認証方式: Magic Link

- メールアドレスを入力するとログインリンクが届く（パスワード不要）
- Supabase Auth の `signInWithOtp({ email })` を使用
- コールバック URL: `/auth/callback?code=...` → セッション確立 → `/settings` へリダイレクト
- セッションは Cookie で管理（`@supabase/ssr` の `createBrowserClient`）

---

## データ同期戦略

### オフラインファースト

```
未ログイン: PGlite (IndexedDB) のみ  ← 従来通り
ログイン中: PGlite + Supabase（Write-through）
```

### ログイン時の初期同期

| 状況 | 動作 |
|------|------|
| ローカルにデータがある | PGlite → Supabase へ upload（ローカル優先） |
| ローカルが空（新デバイス）| Supabase → PGlite へ download |

### Write-through（ログイン中）

データ変更のたびに PGlite と Supabase の両方に書き込む。
PGlite への書き込みが成功した後、Supabase への書き込みをベストエフォートで実行する。
Supabase への書き込みが失敗してもユーザーへの影響はなし（コンソールに警告のみ）。

### 衝突解決: Last-Write-Wins

`updated_at`（ISO 8601 文字列）の辞書順比較で新しい方を正とする。
同一ユーザーが複数デバイスを同時操作するケースは稀なため、シンプルな upsert で十分とみなす。

---

## アーキテクチャ

```
[未ログイン]
  React Component
    → Zustand Store
      → CRUD Service (src/lib/data/)
        → PGlite (IndexedDB)

[ログイン中]
  React Component
    → Zustand Store
      → CRUD Service (src/lib/data/)
        → PGlite (IndexedDB)
      → writeThrough (src/lib/sync/writeThrough.ts)  ← 副作用として追加
        → Supabase
```

**既存の CRUD サービス層は無変更。Zustand Store のミューテーションに副作用として追加する。**

---

## Supabase テーブル設計

PGlite の 7 テーブルを mirror し、各テーブルに `user_id UUID` カラムを追加する。
全テーブルに Row Level Security (RLS) を有効化し、`auth.uid() = user_id` ポリシーを設定する。

### PGlite との差分

| テーブル | PGlite | Supabase |
|---------|--------|----------|
| `daily_states` | PK: `date TEXT` | PK: `(id, user_id)` の複合キー |
| `settings` | PK: `id = 'default'`（固定文字列） | PK: `user_id UUID` |
| その他 5 テーブル | PK: `id TEXT` | PK: `id TEXT`（`user_id` を追加） |

### Supabase DDL（参考）

```sql
-- 例: locations テーブル
CREATE TABLE locations (
  id         TEXT PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  aliases    JSONB NOT NULL DEFAULT '[]',
  address    TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own data only" ON locations
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- settings テーブル（user_id が PK）
CREATE TABLE settings (
  user_id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  default_location_id TEXT NOT NULL DEFAULT '',
  week_starts_on      INTEGER NOT NULL DEFAULT 0,
  time_format         TEXT NOT NULL DEFAULT '24h',
  theme               TEXT NOT NULL DEFAULT 'system',
  notifications       JSONB NOT NULL DEFAULT '{}',
  calendar_sync       JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL,
  updated_at          TIMESTAMPTZ NOT NULL
);
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own data only" ON settings
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- daily_states テーブル（複合 PK）
CREATE TABLE daily_states (
  id                  TEXT NOT NULL,  -- YYYY-MM-DD
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_id          TEXT NOT NULL,
  current_location_id TEXT NOT NULL,
  active_event_id     TEXT,
  completed_event_ids JSONB NOT NULL DEFAULT '[]',
  skipped_event_ids   JSONB NOT NULL DEFAULT '[]',
  delays              JSONB NOT NULL DEFAULT '[]',
  generated_schedule  JSONB NOT NULL DEFAULT '[]',
  created_at          TIMESTAMPTZ NOT NULL,
  updated_at          TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (id, user_id)
);
ALTER TABLE daily_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own data only" ON daily_states
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## 追加・変更ファイル一覧

### 新規作成

| ファイル | 役割 |
|---------|------|
| `src/lib/supabase/client.ts` | ブラウザ用 Supabase クライアント（シングルトン） |
| `src/lib/supabase/server.ts` | Server Components / Route Handlers 用クライアント |
| `src/lib/sync/supabaseSync.ts` | `syncOnLogin` / `uploadAll` / `downloadAll` |
| `src/lib/sync/writeThrough.ts` | `syncUpsert` / `syncDelete` / `syncDailyStateUpsert` / `syncSettingsUpsert` |
| `src/store/useAuthStore.ts` | Auth 状態管理（user, isInitialized, initialize, signInWithMagicLink, signOut） |
| `src/app/login/page.tsx` | Magic Link ログインページ |
| `src/app/auth/callback/route.ts` | Magic Link コールバックハンドラー |
| `middleware.ts` | セッション Cookie リフレッシュ（ルート保護なし） |

### 変更

| ファイル | 変更内容 |
|---------|---------|
| `src/components/common/DbInitializer.tsx` | Auth 初期化 + ログイン時に `syncOnLogin` を呼ぶ |
| `src/components/layout/AppShell.tsx` | `/login`, `/auth` パスで Sidebar・BottomTabBar を非表示 |
| `src/app/settings/page.tsx` | 「アカウント」カード追加（ログイン/ログアウト/手動同期） |
| `src/store/useLocationStore.ts` | add/update/delete に Write-through を追加 |
| `src/store/useRoutineStore.ts` | 同上 |
| `src/store/usePatternStore.ts` | 同上 |
| `src/store/useTravelRouteStore.ts` | 同上 |
| `src/store/useCalendarStore.ts` | saveEvents/clearEvents に Write-through を追加 |
| `src/store/useDailyStateStore.ts` | save/update 系メソッドに Write-through を追加 |
| `src/store/useSettingsStore.ts` | update/initialize に Write-through を追加 |

---

## 環境変数

`.env.local` に追加（Supabase ダッシュボードの Project Settings > API から取得）:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## UI フロー

```
設定ページ（未ログイン）
  └─ 「ログイン」ボタン → /login

/login
  └─ メールアドレス入力 → 送信
  └─ 「メールを確認してください」画面

メール内リンクをクリック
  └─ /auth/callback?code=... → セッション確立 → /settings へリダイレクト

設定ページ（ログイン中）
  ├─ ログイン中のメールアドレス表示
  ├─ 「今すぐ同期」ボタン（手動で Supabase へ upload）
  └─ 「ログアウト」ボタン
```

---

## 制約・注意事項

- **calendar_events**: PGlite には `updated_at` がなく `synced_at` のみ。Supabase 側にも `updated_at` は設けず、`synced_at` を LWW の比較基準に使う
- **循環依存防止**: Zustand Store から `useAuthStore` を参照する際は `useAuthStore.getState().user`（フック外 `getState()`）を使用し、React のルールに違反しない
- **Write-through はベストエフォート**: Supabase への書き込み失敗は `console.warn` のみ。PGlite 書き込み済みのためユーザー体験への影響なし
- **ログアウト後もローカルデータは保持**: PGlite のデータは削除しない。再ログイン時に upload が走る
