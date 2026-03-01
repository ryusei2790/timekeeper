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
LocalStorage
  └── lib/storage/base.ts (BaseStorage<T>)
        └── lib/storage/index.ts (エンティティ別インスタンス)
              └── lib/data/*.ts (CRUDサービス層)
                    └── store/use*Store.ts (Zustand Store)
                          └── React コンポーネント
```

### 重要な設計上のルール

- **`@/lib/utils`** は shadcn/ui が参照する `cn()` のみを export する（変更禁止）。`generateId()` / `now()` は `@/lib/utils/id` から import すること
- **`'use client'`** を全 Zustand store ファイルに付与する（LocalStorage はブラウザ専用）
- **`BaseStorage`** は全メソッドで `typeof window === 'undefined'` をチェックしている（SSR安全）
- **Settings** は Singleton。初回起動時に `settingsService.initialize(locationId)` を呼ぶ必要がある

### エンティティと LocalStorage キー

| エンティティ  | Storage キー                 | サービス               | Store                 |
| ------------- | ---------------------------- | ---------------------- | --------------------- |
| Location      | `timekeeper_locations`       | `locationService`      | `useLocationStore`    |
| RoutineItem   | `timekeeper_routine_items`   | `routineItemService`   | `useRoutineStore`     |
| LifePattern   | `timekeeper_patterns`        | `patternService`       | `usePatternStore`     |
| TravelRoute   | `timekeeper_travel_routes`   | `travelRouteService`   | `useTravelRouteStore` |
| CalendarEvent | `timekeeper_calendar_events` | `calendarEventService` | `useCalendarStore`    |
| DailyState    | `timekeeper_daily_states`    | `dailyStateService`    | `useDailyStateStore`  |
| Settings      | `timekeeper_settings`        | `settingsService`      | `useSettingsStore`    |

### 型定義

全エンティティの型は `src/types/index.ts` に集約。CRUD操作では `CreateInput<T>` / `UpdateInput<T>` ユーティリティ型を使う。

### バリデーション

`src/lib/validations/schemas.ts` に Zod v4 スキーマ。フォーム用の型は `z.infer<typeof CreateXxxSchema>` で取得。Zod v4 はエラーメッセージを `{ error: '...' }` で指定する（v3 の `{ message: '...' }` ではない）。

### ナビゲーション構造

5画面構成: `/`（ホーム）、`/patterns`（パターン管理）、`/places`（場所・移動）、`/calendar`（カレンダー連携）、`/settings`（設定）

## 実装フェーズ

- ✅ Phase 0: セットアップ
- ✅ Phase 1: データ層（型定義・Storage・CRUD・Zustand）
- ⬜ Phase 2: コアロジック（`lib/scheduler/`, `lib/calendar/`）
- ⬜ Phase 3: 基本UI（`components/forms/`, `components/layout/`）
- ⬜ Phase 4: ホーム画面・タイムライン（`components/timeline/`）
- ⬜ Phase 5: CalDAV連携（tsdav、Apple ID認証）⚠️ accessToken 暗号化必須
- ⬜ Phase 6: デプロイ（Vercel）

設計ドキュメントは `docs/` 配下（requirements.md, data-model.md, ui-design.md 等）。
