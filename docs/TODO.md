# 開発TODO

進捗管理用のチェックリストです。各タスクが完了したらチェックを入れていきます。

## 凡例
- [ ] 未着手
- [x] 完了
- [~] スキップ/保留

---

## Phase 0: プロジェクトセットアップ

### プロジェクト初期化
- [x] Next.jsプロジェクト作成
- [x] TypeScript設定確認
- [x] TailwindCSS設定確認
- [x] App Router動作確認

### shadcn/ui セットアップ
- [x] shadcn/ui初期化（canary版）
- [x] 必要なコンポーネントインストール
  - [x] button
  - [x] card
  - [x] input
  - [x] label
  - [x] select
  - [x] dialog
  - [x] tabs
  - [x] badge
  - [x] separator
  - [x] toast
  - [x] dropdown-menu
  - [x] checkbox
  - [x] switch

### 依存パッケージ
- [x] zustand インストール
- [x] zod インストール
- [x] react-hook-form インストール
- [x] @hookform/resolvers インストール
- [x] date-fns インストール
- [x] lucide-react インストール

### プロジェクト構造
- [x] src/app ディレクトリ構成
- [x] src/components ディレクトリ構成
- [x] src/lib ディレクトリ構成
- [x] src/hooks ディレクトリ作成
- [x] src/store ディレクトリ作成
- [x] src/types ディレクトリ作成
- [x] src/constants ディレクトリ作成

### 開発環境
- [x] ESLint設定
- [x] Prettier設定
- [x] Husky設定
- [x] lint-staged設定
- [x] .gitignore確認

### デプロイ
- [ ] Vercelプロジェクト作成
- [ ] GitHub連携
- [ ] 初回デプロイ確認

---

## Phase 1: データ層の実装

### TypeScript型定義（src/types/index.ts）
- [x] Location型
- [x] RoutineItem型（startTime削除、durationのみ）
- [x] PatternRoutineItem型（routineItemId + startTime）
- [x] LifePattern型（patternItems: PatternRoutineItem[]）
- [x] PatternRule型
- [x] TravelRoute型
- [x] TravelMethod型
- [x] CalendarEvent型
- [x] DailyState型
- [x] DelayRecord型
- [x] ScheduleItem型
- [x] EventStatus型
- [x] Settings型
- [~] CalendarAuth型（CalDAV廃止のためスキップ）

### Zodバリデーション（src/lib/validations/）
- [x] LocationSchema
- [x] RoutineItemSchema（startTime削除）
- [x] PatternRoutineItemSchema
- [x] LifePatternSchema（patternItems対応）
- [x] PatternRuleSchema
- [x] TravelRouteSchema
- [x] CalendarEventSchema
- [x] DailyStateSchema
- [x] SettingsSchema

### LocalStorage操作（src/lib/storage/）
- [x] Storage基底クラス
- [x] locationsStorage
- [x] routineItemsStorage
- [x] patternsStorage
- [x] travelRoutesStorage
- [x] calendarEventsStorage
- [x] dailyStatesStorage
- [x] settingsStorage
- [~] calendarAuthStorage（CalDAV廃止のためスキップ）

### データサービス（src/lib/data/）
- [x] locationService
  - [x] getAll
  - [x] getById
  - [x] create
  - [x] update
  - [x] delete
- [x] routineItemService
  - [x] getAll
  - [x] getById
  - [x] create
  - [x] update
  - [x] delete
- [x] patternService
  - [x] getAll（routineItemIds→patternItems自動マイグレーション付き）
  - [x] getById
  - [x] getDefault
  - [x] selectPattern
  - [x] create
  - [x] update
  - [x] delete
- [x] travelRouteService
  - [x] getAll
  - [x] getById
  - [x] findRoute
  - [x] findFasterRoutes
  - [x] create
  - [x] update
  - [x] delete
- [x] calendarEventService
  - [x] getAll
  - [x] getByDate
  - [x] create
  - [x] update
  - [x] delete
- [x] dailyStateService
  - [x] get
  - [x] create
  - [x] update
  - [x] delete
- [x] settingsService
  - [x] get
  - [x] update

### Zustand Store（src/store/）
- [x] useLocationStore
- [x] useRoutineStore
- [x] usePatternStore
- [x] useTravelRouteStore
- [x] useCalendarStore
- [x] useDailyStateStore
- [x] useSettingsStore

### ユーティリティ（src/lib/utils/）
- [x] 時刻操作関数
  - [x] parseTime
  - [x] formatTime
  - [x] addMinutes
  - [x] subtractMinutes
  - [x] minutesBetween
- [x] 日付操作関数
  - [x] formatDate
  - [x] isToday
  - [x] isSameDay
  - [x] getDayOfWeek
- [x] UUID生成（generateId）
- [x] now()

---

## Phase 2: コアロジックの実装

### パターン選択（src/lib/data/patterns.ts に統合）
- [x] selectPattern関数
- [x] 曜日マッチング
- [x] キーワードマッチング
- [x] 優先度判定
- [x] デフォルトフォールバック

### 場所マッチング（src/lib/scheduler/location-matcher.ts）
- [x] matchLocation関数
- [x] 完全一致
- [x] エイリアスマッチング
- [x] 大文字小文字無視

### スケジュール生成（src/lib/scheduler/generator.ts）
- [x] generateDailySchedule関数
- [x] 習慣項目→ScheduleItem変換（PatternRoutineItem.startTime使用）
- [x] カレンダー予定→ScheduleItem変換
- [x] 時系列マージ
- [x] 現在地追跡ロジック
- [x] 移動イベント挿入
- [x] 衝突検出
- [x] 衝突解決（flexible習慣をシフト）

### ユニットテスト（src/test/）
- [x] Vitest セットアップ
- [x] scheduler/generator テスト（8件）
- [x] lib/utils テスト（35件）
- [x] 合計43件 PASS

---

## Phase 3: 基本UI実装

### レイアウト（src/components/layout/）
- [x] AppShell（RootLayout）
- [x] Sidebar（デスクトップ）
- [x] BottomTabBar（モバイル）

### パターン管理画面（src/app/patterns/）
- [x] page.tsx（習慣項目一覧 + パターン一覧）
- [x] RoutineItemForm（チェックボックス + startTimeなし）
- [x] PatternForm（習慣選択時にstartTime入力）
- [x] 削除確認ダイアログ（Dialog + onDelete）
- [~] ドラッグ&ドロップ（将来対応）

### 場所・移動時間設定画面（src/app/places/）
- [x] page.tsx（タブ）
- [x] LocationForm
- [x] TravelRouteForm
- [x] デフォルト手段切り替え

### 設定画面（src/app/settings/）
- [x] page.tsx
- [x] GeneralSettings
- [x] DataManagement
- [x] エクスポート機能（JSON）
- [x] インポート機能（JSON）
- [x] データ削除機能

### 共通フォーム（src/components/forms/）
- [x] RoutineItemForm
- [x] PatternForm
- [x] LocationForm
- [x] TravelRouteForm

### レスポンシブ対応
- [x] モバイルレイアウト（下部タブバー）
- [x] デスクトップレイアウト（サイドバー）

---

## Phase 4: ホーム画面とタイムライン

### ホーム画面（src/app/page.tsx）
- [x] ページレイアウト
- [x] 日付・時刻表示
- [x] PatternSelector
- [x] スケジュール生成ボタン

### イベントカード（src/components/timeline/）
- [x] CurrentEventCard
- [x] NextEventCard

### タイムライン（src/components/timeline/）
- [x] Timeline コンポーネント
- [x] TimelineItem（ステータス・時刻・タイトル・移動イベント）

### リアルタイム更新（src/hooks/）
- [x] useCurrentTime
- [x] useDailySchedule
- [x] useEventTiming

### イベント処理
- [x] completeEvent実装
- [x] skipEvent実装

---

## Phase 5a: .ics ファイルインポート ✅

### .ics パーサー（src/lib/calendar/ics.ts）
- [x] RFC 5545 準拠パース
- [x] DTSTART / DTEND / SUMMARY / LOCATION / DESCRIPTION / X-ALLDAY 対応
- [x] タイムゾーン処理

### 同期処理（差分更新）
- [x] 差分更新（追加・更新・削除）
- [x] UID ベースのマッチング

### カレンダー連携画面（src/app/calendar/）
- [x] page.tsx
- [x] .ics ファイルアップロード UI
- [x] インポート済みイベント一覧・削除

---

## Phase 5b: Google Calendar OAuth 同期（将来：v2）

- [ ] Google OAuth 2.0 認証フロー（Next.js Route Handler）
- [ ] Google Calendar REST API v3 連携
- [ ] syncToken 差分同期
- [ ] 手動同期ボタン + 自動同期間隔設定

---

## Phase 6: 仕上げ・デプロイ

### バグ修正
- [ ] 全機能の動作確認
- [ ] エッジケーステスト
- [ ] エラーハンドリング改善

### パフォーマンス最適化
- [ ] バンドルサイズ確認
- [ ] Lighthouse実行

### アクセシビリティ
- [ ] キーボードナビゲーション
- [ ] ARIA属性追加

### デプロイ
- [ ] Vercel プロジェクト作成
- [ ] 環境変数設定
- [ ] 本番デプロイ・動作確認

---

## 追加機能（v2以降）

### 優先度高
- [ ] Google Calendar OAuth リアルタイム同期
- [ ] Supabase移行
- [ ] プッシュ通知
- [ ] PWA対応

### 優先度中
- [ ] ダークモード
- [ ] データ分析
- [ ] AI最適化提案

### 優先度低
- [ ] チーム共有
- [ ] 多言語対応
- [ ] Electronアプリ

---

## 備考

### 現在の状況（2026-03-04）
- Phase 0〜5a 実装完了
- 43件のユニットテスト PASS
- データモデル変更：RoutineItem から startTime を分離し PatternRoutineItem として管理
- LocalStorage の後方互換マイグレーション実装済み

### 次のアクション
1. Phase 6: Vercel デプロイ
2. v2: Google Calendar OAuth 同期

### 開発Tips
- 小さく始めて段階的に実装
- 早めにデプロイして動作確認
- 定期的にコミット
- 困ったらドキュメントを見返す
