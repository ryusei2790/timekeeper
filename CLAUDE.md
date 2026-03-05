# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # 開発サーバー起動 (http://localhost:3000)
pnpm build        # プロダクションビルド
pnpm lint         # ESLint 実行
pnpm format       # Prettier フォーマット
pnpm type-check   # TypeScript 型チェック（エラーゼロを維持すること）
```

shadcn/ui コンポーネントの追加:

```bash
pnpm dlx shadcn@latest add <component-name>
```

## Architecture

### データフロー

```
PGlite (IndexedDB上のPostgreSQL, idb://timekeeper)
  └── lib/db/index.ts (getDb() シングルトン)
        └── lib/data/*.ts (CRUDサービス層 - 非同期SQL)
              └── store/use*Store.ts (Zustand Store - async)
                    └── React コンポーネント

[ログイン中のみ] write-through（ベストエフォート）:
  store/use*Store.ts
    └── lib/sync/writeThrough.ts
          └── Supabase Postgres（クラウド）
```

初回起動時に `src/components/common/DbInitializer.tsx` が以下を実行:

1. `migrateFromLocalStorage()` — 旧LocalStorageデータをPGliteに移行
2. `useAuthStore.getState().initialize()` — Supabase セッション確認
3. セッションあり → `syncOnLogin(user.id)` — クラウド同期

### 重要な設計上のルール

- **`@/lib/utils`** は shadcn/ui が参照する `cn()` のみを export する（変更禁止）。`generateId()` / `now()` は `@/lib/utils/id` から import すること
- **`'use client'`** を全 Zustand store ファイルに付与する（PGlite はブラウザ専用）
- **`getDb()`** は `typeof window === 'undefined'` のとき例外を投げる（SSR安全）
- **Settings** は Singleton（テーブル上の id='default' レコード）。初回起動時に `settingsService.initialize(locationId)` を呼ぶ必要がある
- **全サービスメソッドは非同期**（`async/await`）。Zustand store の `load*()` も `Promise<void>` を返す

### エンティティと DB テーブル

| エンティティ  | テーブル名        | サービス               | Store                 |
| ------------- | ----------------- | ---------------------- | --------------------- |
| Location      | `locations`       | `locationService`      | `useLocationStore`    |
| RoutineItem   | `routine_items`   | `routineItemService`   | `useRoutineStore`     |
| LifePattern   | `life_patterns`   | `patternService`       | `usePatternStore`     |
| TravelRoute   | `travel_routes`   | `travelRouteService`   | `useTravelRouteStore` |
| CalendarEvent | `calendar_events` | `calendarEventService` | `useCalendarStore`    |
| DailyState    | `daily_states`    | `dailyStateService`    | `useDailyStateStore`  |
| Settings      | `settings`        | `settingsService`      | `useSettingsStore`    |
| (Auth)        | Supabase Auth     | —                      | `useAuthStore`        |

### 型定義

全エンティティの型は `src/types/index.ts` に集約。CRUD操作では `CreateInput<T>` / `UpdateInput<T>` ユーティリティ型を使う。

### バリデーション

`src/lib/validations/schemas.ts` に Zod v4 スキーマ。フォーム用の型は `z.infer<typeof CreateXxxSchema>` で取得。Zod v4 はエラーメッセージを `{ error: '...' }` で指定する（v3 の `{ message: '...' }` ではない）。

### 認証・同期（Phase 6）

- **Supabase Auth（Magic Link）**: `src/lib/supabase/client.ts` / `server.ts`
- **Auth Store**: `src/store/useAuthStore.ts`（`user`, `initialize`, `signInWithMagicLink`, `signOut`）
- **Write-through**: `src/lib/sync/writeThrough.ts`（ログイン中のみ Supabase にも書く）
- **初期同期**: `src/lib/sync/supabaseSync.ts`（`syncOnLogin` / `uploadAll` / `downloadAll`）
- **ログインページ**: `src/app/login/page.tsx`
- **コールバック**: `src/app/auth/callback/route.ts`（`/settings` へリダイレクト）
- **Middleware**: `middleware.ts`（セッション Cookie リフレッシュのみ）
- **他ストアからの Auth 参照**: `useAuthStore.getState().user`（フック呼び出し不可・循環依存防止）
- **環境変数**: `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### ナビゲーション構造

6画面構成: `/`（ホーム）、`/patterns`（パターン管理）、`/places`（場所・移動）、`/calendar`（カレンダー連携）、`/settings`（設定）、`/login`（ログイン・ナビなし）

## 実装フェーズ

- ✅ Phase 0: セットアップ
- ✅ Phase 1: データ層（型定義・CRUD・Zustand）
- ✅ Phase 1.5: PGlite移行（LocalStorage → IndexedDB上のPostgreSQL）
- ✅ Phase 2: コアロジック（`lib/scheduler/`, `lib/calendar/`）
- ✅ Phase 3: 基本UI（`components/forms/`, `components/layout/`）
- ✅ Phase 4: ホーム画面・タイムライン（`components/timeline/`）
- ✅ Phase 5a: カレンダー連携（.ics ファイルインポート）
- ✅ バグ修正: settings未初期化によるスケジュール生成不能を修正（`DbInitializer.tsx` でアプリ起動時に自動初期化）
- ⬜ Phase 5b: Google Calendar OAuth リアルタイム同期（将来・v2）
- 🔄 Phase 6: Supabase Auth（Magic Link）+ クロスデバイス同期 + Vercel デプロイ（実装中）

設計ドキュメントは `docs/` 配下（requirements.md, data-model.md, ui-design.md 等）。
