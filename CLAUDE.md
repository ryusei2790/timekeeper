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
```

初回起動時に `src/components/common/DbInitializer.tsx` が `migrateFromLocalStorage()` を実行（旧LocalStorageデータをPGliteに移行）。

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

### 型定義

全エンティティの型は `src/types/index.ts` に集約。CRUD操作では `CreateInput<T>` / `UpdateInput<T>` ユーティリティ型を使う。

### バリデーション

`src/lib/validations/schemas.ts` に Zod v4 スキーマ。フォーム用の型は `z.infer<typeof CreateXxxSchema>` で取得。Zod v4 はエラーメッセージを `{ error: '...' }` で指定する（v3 の `{ message: '...' }` ではない）。

### ナビゲーション構造

5画面構成: `/`（ホーム）、`/patterns`（パターン管理）、`/places`（場所・移動）、`/calendar`（カレンダー連携）、`/settings`（設定）

## 実装フェーズ

- ✅ Phase 0: セットアップ
- ✅ Phase 1: データ層（型定義・CRUD・Zustand）
- ✅ Phase 1.5: PGlite移行（LocalStorage → IndexedDB上のPostgreSQL）
- ✅ Phase 2: コアロジック（`lib/scheduler/`, `lib/calendar/`）
- ✅ Phase 3: 基本UI（`components/forms/`, `components/layout/`）
- ✅ Phase 4: ホーム画面・タイムライン（`components/timeline/`）
- ✅ Phase 5a: カレンダー連携（.ics ファイルインポート）
- ⬜ Phase 5b: Google Calendar OAuth リアルタイム同期（将来・v2）
- ⬜ Phase 6: Supabase統合（パスフレーズ方式・クロスデバイス同期）+ Vercel デプロイ

設計ドキュメントは `docs/` 配下（requirements.md, data-model.md, ui-design.md 等）。
