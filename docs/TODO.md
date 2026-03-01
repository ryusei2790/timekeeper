# 開発TODO

進捗管理用のチェックリストです。各タスクが完了したらチェックを入れていきます。

## 凡例
- [ ] 未着手
- [x] 完了
- [~] スキップ/保留

---

## Phase 0: プロジェクトセットアップ

### プロジェクト初期化
- [ ] Next.jsプロジェクト作成
- [ ] TypeScript設定確認
- [ ] TailwindCSS設定確認
- [ ] App Router動作確認

### shadcn/ui セットアップ
- [ ] shadcn/ui初期化
- [ ] 必要なコンポーネントインストール
  - [ ] button
  - [ ] card
  - [ ] input
  - [ ] label
  - [ ] select
  - [ ] dialog
  - [ ] tabs
  - [ ] badge
  - [ ] separator
  - [ ] toast
  - [ ] dropdown-menu

### 依存パッケージ
- [ ] zustand インストール
- [ ] zod インストール
- [ ] react-hook-form インストール
- [ ] @hookform/resolvers インストール
- [ ] date-fns インストール
- [ ] lucide-react インストール

### プロジェクト構造
- [ ] src/app ディレクトリ構成
- [ ] src/components ディレクトリ構成
- [ ] src/lib ディレクトリ構成
- [ ] src/hooks ディレクトリ作成
- [ ] src/store ディレクトリ作成
- [ ] src/types ディレクトリ作成
- [ ] src/constants ディレクトリ作成

### 開発環境
- [ ] ESLint設定
- [ ] Prettier設定
- [ ] Husky設定
- [ ] lint-staged設定
- [ ] .gitignore確認

### デプロイ
- [ ] Vercelプロジェクト作成
- [ ] GitHub連携
- [ ] 初回デプロイ確認

---

## Phase 1: データ層の実装

### TypeScript型定義（src/types/index.ts）
- [ ] Location型
- [ ] RoutineItem型
- [ ] LifePattern型
- [ ] PatternRule型
- [ ] TravelRoute型
- [ ] TravelMethod型
- [ ] CalendarEvent型
- [ ] DailyState型
- [ ] DelayRecord型
- [ ] ScheduleItem型
- [ ] EventStatus型
- [ ] Settings型
- [ ] CalendarAuth型

### Zodバリデーション（src/lib/validations/）
- [ ] LocationSchema
- [ ] RoutineItemSchema
- [ ] LifePatternSchema
- [ ] PatternRuleSchema
- [ ] TravelRouteSchema
- [ ] CalendarEventSchema
- [ ] DailyStateSchema
- [ ] SettingsSchema

### LocalStorage操作（src/lib/storage/）
- [ ] Storage基底クラス
- [ ] locationsStorage
- [ ] routineItemsStorage
- [ ] patternsStorage
- [ ] travelRoutesStorage
- [ ] calendarEventsStorage
- [ ] dailyStatesStorage
- [ ] settingsStorage
- [ ] calendarAuthStorage

### データサービス（src/lib/data/）
- [ ] locationService
  - [ ] getAll
  - [ ] getById
  - [ ] create
  - [ ] update
  - [ ] delete
- [ ] routineItemService
  - [ ] getAll
  - [ ] getById
  - [ ] create
  - [ ] update
  - [ ] delete
- [ ] patternService
  - [ ] getAll
  - [ ] getById
  - [ ] create
  - [ ] update
  - [ ] delete
- [ ] travelRouteService
  - [ ] getAll
  - [ ] getById
  - [ ] findRoute
  - [ ] findFasterRoutes
  - [ ] create
  - [ ] update
  - [ ] delete
- [ ] calendarEventService
  - [ ] getAll
  - [ ] getByDate
  - [ ] create
  - [ ] update
  - [ ] delete
- [ ] dailyStateService
  - [ ] get
  - [ ] create
  - [ ] update
  - [ ] delete
- [ ] settingsService
  - [ ] get
  - [ ] update

### Zustand Store（src/store/）
- [ ] useLocationStore
- [ ] useRoutineStore
- [ ] usePatternStore
- [ ] useTravelRouteStore
- [ ] useCalendarStore
- [ ] useDailyStateStore
- [ ] useSettingsStore

### ユーティリティ（src/lib/utils/）
- [ ] 時刻操作関数
  - [ ] parseTime
  - [ ] formatTime
  - [ ] addMinutes
  - [ ] subtractMinutes
  - [ ] minutesBetween
- [ ] 日付操作関数
  - [ ] formatDate
  - [ ] isToday
  - [ ] isSameDay
  - [ ] getDayOfWeek
- [ ] UUID生成
- [ ] 配列操作ヘルパー

---

## Phase 2: コアロジックの実装

### パターン選択（src/lib/scheduler/pattern-selector.ts）
- [ ] selectPattern関数
- [ ] 曜日マッチング
- [ ] キーワードマッチング
- [ ] 優先度判定
- [ ] デフォルトフォールバック

### 場所マッチング（src/lib/scheduler/location-matcher.ts）
- [ ] matchLocation関数
- [ ] 完全一致
- [ ] エイリアスマッチング
- [ ] 大文字小文字無視

### スケジュール生成（src/lib/scheduler/generator.ts）
- [ ] generateDailySchedule関数
- [ ] 習慣項目→ScheduleItem変換
- [ ] カレンダー予定→ScheduleItem変換
- [ ] 時系列マージ
- [ ] 現在地追跡ロジック
- [ ] 移動イベント挿入
- [ ] 衝突検出
- [ ] 衝突解決（習慣スキップ）

### 移動ルート検索（src/lib/scheduler/route-finder.ts）
- [ ] findRoute関数
- [ ] findFasterRoutes関数
- [ ] デフォルト手段の取得

### 遅延検出・調整（src/lib/scheduler/delay-adjuster.ts）
- [ ] detectDelay関数
- [ ] adjustSchedule関数
- [ ] 柔軟なイベントの調整
- [ ] 固定イベントの保護
- [ ] 移動時間最適化提案

### イベントハンドラー（src/lib/scheduler/event-handler.ts）
- [ ] completeEvent関数
- [ ] skipEvent関数
- [ ] ステータス更新
- [ ] 現在地更新
- [ ] 次のイベントアクティブ化

---

## Phase 3: 基本UI実装

### レイアウト（src/components/layout/）
- [ ] RootLayout
- [ ] Sidebar（デスクトップ）
- [ ] BottomTabBar（モバイル）
- [ ] Header
- [ ] Navigation

### パターン管理画面（src/app/patterns/）
- [ ] page.tsx（一覧）
- [ ] PatternList コンポーネント
- [ ] PatternCard コンポーネント
- [ ] PatternCreateDialog
- [ ] PatternEditDialog
- [ ] PatternForm コンポーネント
- [ ] RoutineItemList コンポーネント
- [ ] RoutineItemDialog（追加/編集）
- [ ] RoutineItemForm コンポーネント
- [ ] ドラッグ&ドロップ実装
- [ ] 削除確認ダイアログ

### 場所・移動時間設定画面（src/app/places/）
- [ ] page.tsx（タブ）
- [ ] LocationTab コンポーネント
  - [ ] LocationList
  - [ ] LocationDialog
  - [ ] LocationForm
- [ ] TravelRouteTab コンポーネント
  - [ ] TravelRouteList
  - [ ] RouteGroup（区間グループ）
  - [ ] TravelRouteDialog
  - [ ] TravelRouteForm
  - [ ] デフォルト手段切り替え

### 設定画面（src/app/settings/）
- [ ] page.tsx
- [ ] GeneralSettings コンポーネント
- [ ] DataManagement コンポーネント
- [ ] エクスポート機能
- [ ] インポート機能
- [ ] データ削除機能

### 共通フォーム（src/components/forms/）
- [ ] LocationFormFields
- [ ] RoutineItemFormFields
- [ ] PatternFormFields
- [ ] TravelRouteFormFields

### レスポンシブ対応
- [ ] モバイルレイアウト確認
- [ ] タブレットレイアウト確認
- [ ] デスクトップレイアウト確認

---

## Phase 4: ホーム画面とタイムライン

### ホーム画面（src/app/page.tsx）
- [ ] ページレイアウト
- [ ] PageHeader コンポーネント
- [ ] 日付ナビゲーション
- [ ] PatternSelector コンポーネント
- [ ] 現在地表示

### イベントカード（src/components/timeline/）
- [ ] CurrentEventCard
  - [ ] イベント情報表示
  - [ ] カウントダウン
  - [ ] 完了ボタン
  - [ ] スキップボタン
- [ ] NextEventCard
  - [ ] イベント情報表示
  - [ ] 開始までの時間

### タイムライン（src/components/timeline/）
- [ ] Timeline コンポーネント
- [ ] TimelineItem コンポーネント
  - [ ] ステータスアイコン
  - [ ] 時刻表示
  - [ ] タイトル・場所
  - [ ] 移動イベント表示
  - [ ] 移動手段変更ボタン
  - [ ] 空き時間表示
- [ ] TravelMethodSelector コンポーネント

### リアルタイム更新（src/hooks/）
- [ ] useCurrentTime
- [ ] useNextEventCountdown
- [ ] useActiveEvent
- [ ] useDailySchedule

### イベント処理
- [ ] completeEvent実装
- [ ] skipEvent実装
- [ ] changeTravelMethod実装

### 遅延通知（src/components/common/）
- [ ] DelayNotification コンポーネント
- [ ] 遅延情報表示
- [ ] 提案表示
- [ ] アクションボタン

---

## Phase 5: カレンダー連携

### CalDAV認証（src/lib/calendar/auth.ts）
- [ ] authenticate関数
- [ ] saveAuthToken関数
- [ ] loadAuthToken関数
- [ ] clearAuthToken関数
- [ ] isAuthenticated関数

### カレンダー操作（src/lib/calendar/caldav.ts）
- [ ] tsdavクライアント初期化
- [ ] getCalendars関数
- [ ] getEvents関数
- [ ] parseCalendarEvent関数
- [ ] iCalendarパース処理

### 同期処理（src/lib/calendar/sync.ts）
- [ ] syncCalendar関数（手動）
- [ ] autoSync関数（自動）
- [ ] 差分更新ロジック
- [ ] 同期履歴保存

### カレンダー連携画面（src/app/calendar/）
- [ ] page.tsx
- [ ] ConnectionStatus コンポーネント
- [ ] AuthDialog コンポーネント
- [ ] SyncSettings コンポーネント
- [ ] SyncHistory コンポーネント

### エラーハンドリング
- [ ] 認証エラー処理
- [ ] ネットワークエラー処理
- [ ] パースエラー処理
- [ ] ユーザー通知

---

## Phase 6: 仕上げ・デプロイ

### バグ修正
- [ ] 全機能の動作確認
- [ ] エッジケーステスト
- [ ] エラーハンドリング改善

### パフォーマンス最適化
- [ ] バンドルサイズ確認
- [ ] Lighthouse実行
- [ ] 画像最適化
- [ ] コード分割確認

### アクセシビリティ
- [ ] キーボードナビゲーション
- [ ] ARIA属性追加
- [ ] コントラスト比確認
- [ ] スクリーンリーダーテスト

### ドキュメント
- [ ] README更新
- [ ] 使い方ガイド作成
- [ ] トラブルシューティング

### デプロイ
- [ ] 環境変数設定
- [ ] 本番デプロイ
- [ ] 動作確認
- [ ] カスタムドメイン設定（任意）

### ユーザーテスト
- [ ] 実際に使用
- [ ] フィードバック収集
- [ ] 改善実施

---

## 追加機能（v2以降）

### 優先度高
- [ ] Supabase移行
- [ ] プッシュ通知
- [ ] ダークモード
- [ ] PWA対応

### 優先度中
- [ ] Google Calendar対応
- [ ] データ分析
- [ ] AI最適化提案
- [ ] ウィジェット

### 優先度低
- [ ] チーム共有
- [ ] 多言語対応
- [ ] Electronアプリ
- [ ] React Nativeアプリ

---

## 備考

### 現在の状況
- ドキュメント作成完了
- 実装開始前

### 次のアクション
1. Phase 0のセットアップから開始
2. 各フェーズごとにブランチを切る
3. 完了したらmainにマージ

### 開発Tips
- 小さく始めて段階的に実装
- 早めにデプロイして動作確認
- 定期的にコミット
- 困ったらドキュメントを見返す
