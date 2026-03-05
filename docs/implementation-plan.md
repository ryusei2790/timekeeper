# 実装計画

## 開発フェーズ

全体を6つのフェーズに分け、段階的に実装していきます。

---

## Phase 0: プロジェクトセットアップ（1週間）

### 目標
Next.jsプロジェクトの初期セットアップと開発環境の構築

### タスク

#### 1. Next.jsプロジェクト作成
```bash
npx create-next-app@latest timekeeper --typescript --tailwind --app --src-dir
cd timekeeper
```

- [x] App Router使用
- [x] TypeScript有効
- [x] TailwindCSS有効
- [x] src/ディレクトリ使用

#### 2. shadcn/uiセットアップ
```bash
npx shadcn-ui@latest init
```

必要なコンポーネントをインストール:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add dropdown-menu
```

#### 3. 依存パッケージインストール
```bash
pnpm add zustand zod react-hook-form @hookform/resolvers date-fns
pnpm add lucide-react
pnpm add -D @types/node
```

#### 4. プロジェクト構造作成
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── patterns/
│   ├── places/
│   ├── calendar/
│   └── settings/
├── components/
│   ├── ui/           # shadcn/ui
│   ├── layout/       # レイアウト
│   ├── timeline/     # タイムライン
│   ├── forms/        # フォーム
│   └── common/       # 共通
├── lib/
│   ├── storage/      # LocalStorage
│   ├── calendar/     # CalDAV
│   ├── scheduler/    # スケジューラー
│   ├── utils/        # ユーティリティ
│   └── validations/  # Zodスキーマ
├── hooks/            # カスタムフック
├── store/            # Zustand
├── types/            # 型定義
└── constants/        # 定数
```

#### 5. ESLint・Prettier設定
```bash
pnpm add -D prettier prettier-plugin-tailwindcss
pnpm add -D husky lint-staged
```

`.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

#### 6. Git初期化
```bash
git init
git add .
git commit -m "feat: initial project setup"
```

#### 7. Vercelデプロイ設定
- Vercelプロジェクト作成
- GitHub連携
- 環境変数設定

**成果物**:
- ✅ 動作するNext.jsアプリ
- ✅ shadcn/uiセットアップ完了
- ✅ Vercelデプロイ完了

---

## Phase 1: データ層の実装（1週間）

### 目標
LocalStorageによるデータ永続化と型定義の完成

### タスク

#### 1. TypeScript型定義（`src/types/index.ts`）
- [ ] Location型
- [ ] RoutineItem型
- [ ] LifePattern型
- [ ] TravelRoute型
- [ ] CalendarEvent型
- [ ] DailyState型
- [ ] Settings型
- [ ] ScheduleItem型

参照: `data-model.md`

#### 2. Zodバリデーションスキーマ（`src/lib/validations/`）
- [ ] LocationSchema
- [ ] RoutineItemSchema
- [ ] LifePatternSchema
- [ ] TravelRouteSchema
- [ ] CalendarEventSchema
- [ ] SettingsSchema

#### 3. LocalStorage操作（`src/lib/storage/`）
> ✅ 完了・PGliteに移行済み（Phase 1.5参照）
```typescript
// 現在は src/lib/db/ + src/lib/data/ に移行済み
// LocalStorageからPGliteへの自動マイグレーションも実装済み
```

#### 4. データアクセス層（`src/lib/data/`）
各エンティティのCRUD操作を実装:

```typescript
// locations.ts
export const locationService = {
  getAll(): Location[]
  getById(id: string): Location | null
  create(data: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>): Location
  update(id: string, data: Partial<Location>): Location
  delete(id: string): void
};
```

同様に:
- [ ] locationService
- [ ] routineItemService
- [ ] patternService
- [ ] travelRouteService
- [ ] calendarEventService
- [ ] dailyStateService
- [ ] settingsService

#### 5. Zustand Store（`src/store/`）
```typescript
// useLocationStore.ts
export const useLocationStore = create<LocationStore>((set) => ({
  locations: [],
  addLocation: (location) => set((state) => ({ ... })),
  updateLocation: (id, data) => set((state) => ({ ... })),
  deleteLocation: (id) => set((state) => ({ ... })),
  loadLocations: () => set({ locations: locationService.getAll() }),
}));
```

同様に:
- [ ] useLocationStore
- [ ] useRoutineStore
- [ ] usePatternStore
- [ ] useTravelRouteStore
- [ ] useCalendarStore
- [ ] useDailyStateStore
- [ ] useSettingsStore

#### 6. ユーティリティ関数（`src/lib/utils/`）
- [ ] 時刻操作（parseTime, formatTime, addMinutes, etc.）
- [ ] 日付操作（formatDate, isToday, etc.）
- [ ] UUID生成
- [ ] 配列操作

**成果物**:
- ✅ 完全な型定義
- ✅ LocalStorageによる永続化
- ✅ Zustandによる状態管理
- ✅ データアクセス層

---

## Phase 1.5: PGlite移行 ✅ 完了

### 目標
LocalStorage（5-10MB制限）からPGlite（IndexedDB上のPostgreSQL）へ移行し、容量制限を撤廃

### 実装済みファイル
- `src/lib/db/index.ts` — PGlite シングルトン初期化（`getDb()`）
- `src/lib/db/schema.ts` — 全テーブル DDL（7テーブル）
- `src/lib/db/migrate.ts` — LocalStorage → PGlite 自動マイグレーション
- `src/lib/data/` — 全7サービスを非同期SQL操作に書き換え
- `src/store/` — 全7 Zustand store を async 化
- `src/components/common/DbInitializer.tsx` — 初回起動時にマイグレーション実行 + **settings未初期化時の自動初期化**
- `src/lib/storage/` — 削除済み（BaseStorage廃止）

### バグ修正（2026-03-05）
**settings未初期化によるスケジュール生成不能バグを修正**

- **原因**: `settingsService.initialize()` が `/settings` ページを開いたときにしか呼ばれない設計だった。一度も `/settings` を訪問していない場合、DBにsettingsレコードが存在せず `settings=null` のままとなり、`useDailySchedule` フック内の `if (!settings) return` でスケジュール生成が永遠にスキップされていた。
- **修正**: `DbInitializer.tsx` に settings の存在チェックを追加し、未初期化の場合はアプリ起動時に自動でデフォルト値（`defaultLocationId: ''`）で初期化するよう変更。

### テーブル構成（PGlite / IndexedDB）
| テーブル | 対応エンティティ |
|---------|---------------|
| `locations` | Location |
| `routine_items` | RoutineItem |
| `life_patterns` | LifePattern |
| `travel_routes` | TravelRoute |
| `calendar_events` | CalendarEvent |
| `daily_states` | DailyState |
| `settings` | Settings（singleton） |

---

## Phase 2: コアロジックの実装（1-2週間）

### 目標
スケジュール生成とリアルタイム追跡のコアロジックを実装

### タスク

#### 1. パターン選択ロジック（`src/lib/scheduler/pattern-selector.ts`）
```typescript
export function selectPattern(
  date: Date,
  patterns: LifePattern[],
  calendarEvents: CalendarEvent[]
): LifePattern
```

- [ ] 曜日マッチング
- [ ] キーワードマッチング
- [ ] 優先度による選択
- [ ] デフォルトフォールバック

#### 2. 場所マッチング（`src/lib/scheduler/location-matcher.ts`）
```typescript
export function matchLocation(
  locationName: string,
  locations: Location[]
): Location | null
```

- [ ] 名前の完全一致
- [ ] エイリアスマッチング
- [ ] あいまいマッチング（将来）

#### 3. スケジュール生成エンジン（`src/lib/scheduler/generator.ts`）
```typescript
export function generateDailySchedule(
  date: Date,
  pattern: LifePattern,
  calendarEvents: CalendarEvent[],
  locations: Location[],
  travelRoutes: TravelRoute[],
  settings: Settings
): DailyState
```

実装内容:
- [ ] 習慣項目からScheduleItem生成
- [ ] カレンダー予定からScheduleItem生成
- [ ] 時系列マージ
- [ ] 現在地追跡
- [ ] 移動イベント挿入
- [ ] 衝突検出・解決

#### 4. 移動ルート検索（`src/lib/scheduler/route-finder.ts`）
```typescript
export function findRoute(
  fromLocationId: string,
  toLocationId: string,
  routes: TravelRoute[]
): TravelRoute | null

export function findFasterRoutes(
  fromLocationId: string,
  toLocationId: string,
  currentDuration: number,
  routes: TravelRoute[]
): TravelRoute[]
```

#### 5. 遅延検出・調整（`src/lib/scheduler/delay-adjuster.ts`）
```typescript
export function detectDelay(
  event: ScheduleItem,
  actualEndTime: Date
): DelayRecord | null

export function adjustSchedule(
  schedule: ScheduleItem[],
  delayMinutes: number,
  fromIndex: number
): ScheduleItem[]
```

実装内容:
- [ ] 遅延時間計算
- [ ] 柔軟なイベントの調整
- [ ] 固定イベントの保護
- [ ] 移動時間の最適化提案

#### 6. イベント完了ハンドラー（`src/lib/scheduler/event-handler.ts`）
```typescript
export function completeEvent(
  state: DailyState,
  eventId: string,
  actualEndTime?: Date
): DailyState

export function skipEvent(
  state: DailyState,
  eventId: string
): DailyState
```

**成果物**:
- ✅ スケジュール自動生成
- ✅ 現在地追跡
- ✅ 遅延検出・調整
- ✅ イベント完了処理

---

## Phase 3: 基本UI実装（2週間）

### 目標
パターン管理、場所・移動時間設定画面の実装

### タスク

#### 1. レイアウトコンポーネント（`src/components/layout/`）
- [ ] RootLayout（`src/app/layout.tsx`）
- [ ] Sidebar（デスクトップ）
- [ ] BottomTabBar（モバイル）
- [ ] Header
- [ ] Navigation

#### 2. パターン管理画面（`src/app/patterns/`）
- [ ] パターン一覧表示
- [ ] パターン作成フォーム
- [ ] パターン編集フォーム
- [ ] 習慣項目管理
  - [ ] 習慣項目追加モーダル
  - [ ] 習慣項目編集モーダル
  - [ ] ドラッグ&ドロップ並び替え
- [ ] パターン削除（確認ダイアログ付き）

**使用コンポーネント**:
- Dialog（モーダル）
- Form（react-hook-form + zod）
- Select（ドロップダウン）
- Checkbox
- Input

#### 3. 場所・移動時間設定画面（`src/app/places/`）
- [ ] タブコンポーネント（場所/移動ルート）
- [ ] 場所タブ
  - [ ] 場所一覧表示
  - [ ] 場所追加フォーム
  - [ ] 場所編集フォーム
  - [ ] 場所削除
- [ ] 移動ルートタブ
  - [ ] ルート一覧表示（区間でグループ化）
  - [ ] ルート追加フォーム
  - [ ] ルート編集フォーム
  - [ ] デフォルト手段の切り替え
  - [ ] ルート削除

#### 4. 設定画面（`src/app/settings/`）
- [ ] 一般設定
  - [ ] デフォルト開始位置
  - [ ] 週の開始曜日
  - [ ] 時刻表示形式
- [ ] データ管理
  - [ ] エクスポート機能
  - [ ] インポート機能
  - [ ] データ削除（確認ダイアログ）

#### 5. 共通フォームコンポーネント（`src/components/forms/`）
- [ ] LocationForm
- [ ] RoutineItemForm
- [ ] PatternForm
- [ ] TravelRouteForm

#### 6. レスポンシブ対応
- [ ] モバイルレイアウト
- [ ] タブレットレイアウト
- [ ] デスクトップレイアウト

**成果物**:
- ✅ パターンCRUD完成
- ✅ 場所・移動ルートCRUD完成
- ✅ 設定画面完成
- ✅ レスポンシブ対応

---

## Phase 4: ホーム画面とタイムライン（2週間）

### 目標
メイン機能であるスケジュール表示とリアルタイム追跡の実装

### タスク

#### 1. ホーム画面（`src/app/page.tsx`）
- [ ] ページレイアウト
- [ ] 日付ナビゲーション（前日/翌日）
- [ ] パターンセレクター
- [ ] 現在地表示

#### 2. 現在・次のイベントカード（`src/components/timeline/`）
- [ ] CurrentEventCard
  - [ ] イベント情報表示
  - [ ] 残り時間カウントダウン
  - [ ] 完了ボタン
  - [ ] スキップボタン
- [ ] NextEventCard
  - [ ] 次のイベント情報
  - [ ] 開始までの時間

#### 3. タイムラインコンポーネント（`src/components/timeline/`）
- [ ] Timeline（親コンポーネント）
- [ ] TimelineItem
  - [ ] ステータスアイコン（✅🔵⏰⚠️）
  - [ ] 時刻表示
  - [ ] タイトル・場所表示
  - [ ] 移動イベントの特殊表示
  - [ ] 移動手段変更ボタン
  - [ ] 空き時間の表示
- [ ] 仮想スクロール（長いリストの場合）

#### 4. リアルタイム更新（`src/hooks/`）
- [ ] useCurrentTime
  - [ ] 1秒ごとに現在時刻を更新
- [ ] useNextEventCountdown
  - [ ] 次のイベントまでの時間を計算
- [ ] useActiveEvent
  - [ ] 現在のイベントを動的に判定

#### 5. イベント完了・スキップ処理
- [ ] completeEvent処理
  - [ ] ステータス更新
  - [ ] 遅延検出
  - [ ] スケジュール調整
  - [ ] 現在地更新
- [ ] skipEvent処理
  - [ ] ステータス更新
  - [ ] 次のイベントをアクティブに

#### 6. 遅延通知コンポーネント（`src/components/common/`）
- [ ] DelayNotification
  - [ ] 遅延情報表示
  - [ ] 移動手段変更提案
  - [ ] アクション（承諾/却下）

#### 7. カスタムフック（`src/hooks/`）
- [ ] useDailySchedule
- [ ] useScheduleGenerator
- [ ] useEventCompletion

**成果物**:
- ✅ ホーム画面完成
- ✅ タイムライン表示
- ✅ リアルタイム追跡
- ✅ イベント完了機能
- ✅ 遅延検出・通知

---

## Phase 5: カレンダー連携

### Phase 5a: .ics ファイルインポート ✅ 完了

#### 実装済みファイル
- `src/lib/calendar/ics.ts` — .ics パーサー（`parseIcsText(text): CalendarEvent[]`）
- `src/lib/calendar/sync.ts` — 差分保存（`importCalendarEvents(events): SyncResult`）
- `src/app/calendar/page.tsx` — ファイルアップロード UI
- `src/app/settings/page.tsx` — インポート済みイベント確認カード（日付グループ表示・削除ボタン）

#### 動作
1. ユーザーが .ics ファイルを選択
2. FileReader API でテキスト読み込み
3. `parseIcsText` で VEVENT ブロックを CalendarEvent 配列に変換
4. `importCalendarEvents` で LocalStorage に差分保存
5. ホーム画面のスケジュール生成に自動反映（`calendarId: 'ics-import'`）

---

### Phase 5b: Google カレンダーリアルタイム同期（将来：v2）

#### 目標
Google Calendar REST API v3 + OAuth 2.0 によるリアルタイム同期を実装

#### タスク

##### 1. Google Cloud Console 設定
- [ ] プロジェクト作成
- [ ] Google Calendar API を有効化
- [ ] OAuth 2.0 認証情報作成（Web アプリケーション）
- [ ] リダイレクト URI 登録（`https://<app-url>/api/google/callback`）

##### 2. 環境変数設定
```env
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
NEXTAUTH_SECRET=xxx   # state 検証用ランダム値
```

##### 3. OAuth フロー実装（Next.js Route Handler）
- [ ] `src/app/api/google/auth/route.ts`
  - Google 認証ページへのリダイレクト URL 生成
  - state パラメータを LocalStorage に保存（CSRF 対策）
- [ ] `src/app/api/google/callback/route.ts`
  - 認可コードをアクセストークンに交換
  - アクセストークン・リフレッシュトークンを LocalStorage に保存

##### 4. `src/lib/calendar/google.ts` 新規作成
```ts
export async function fetchGoogleEvents(
  accessToken: string,
  syncToken?: string
): Promise<{ events: CalendarEvent[]; nextSyncToken: string }>
```
- Google Event → CalendarEvent 型変換
  - `summary` → `title`
  - `start.dateTime` または `start.date` → `startTime`（ISO 8601）
  - `start.date` のみ存在 → `isAllDay: true`
  - `calendarId: 'google-calendar'`（固定）
- `syncToken` で差分同期（初回は全件取得）
- アクセストークン期限切れ時にリフレッシュトークンで更新

##### 5. `src/lib/calendar/sync.ts` 更新
- [ ] `syncGoogleCalendar(accessToken, syncToken?): SyncResult` 追加
- [ ] syncToken を LocalStorage（`timekeeper_google_sync_token`）に保存・読み込み

##### 6. `src/app/calendar/page.tsx` 更新
- [ ] タブ構成に変更：「.ics インポート」タブ + 「Google カレンダー」タブ
- [ ] Google 連携タブ：接続状態・最終同期日時・手動同期ボタン

**成果物（v2）**:
- [ ] Google OAuth 2.0 認証
- [ ] 差分同期（syncToken）
- [ ] 手動同期ボタン
- [ ] カレンダー連携画面（2 タブ構成）

---

## Phase 6: Supabase統合 + Vercelデプロイ

### 目標
クロスデバイスデータ同期（Supabase パスフレーズ方式）を実装し、Vercel で本番公開

### 設計方針：パスフレーズ方式
- ユーザーがメールアドレスを入力するだけでデータにアクセス（メール確認なし）
- メールアドレスをSHA-256ハッシュ化したものを `user_key` として使用
- Supabase Postgres の各テーブルに `user_key TEXT NOT NULL` 列を追加してデータ分離
- ⚠️ セキュリティ注意：他人のメールアドレスを知っていればデータが見える（個人用途前提）

### タスク

#### 1. Supabase セットアップ
- [ ] Supabase プロジェクト作成（無料枠）
- [ ] 環境変数追加（`.env.local`）：
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
  ```
- [ ] `@supabase/supabase-js` インストール
- [ ] Supabase クライアント初期化（`src/lib/supabase/client.ts`）

#### 2. Supabase テーブル作成
- [ ] PGliteと同じ7テーブルを Supabase で作成
- [ ] 各テーブルに `user_key TEXT NOT NULL` 列を追加
- [ ] `user_key` にインデックスを作成

#### 3. パスフレーズ入力UI
- [ ] `src/components/common/UserKeyInput.tsx`：メールアドレス入力モーダル
- [ ] メールアドレス → SHA-256 ハッシュ化（Web Crypto API）
- [ ] `user_key` を localStorage に保存（セッション維持）
- [ ] `src/app/layout.tsx` に組み込み

#### 4. サービス層の切り替え
- [ ] PGlite（ローカル）→ Supabase（クラウド）へのデータ移行ロジック
- [ ] 全7サービスの `getDb()` を Supabase クライアントに切り替え
- [ ] すべてのクエリに `user_key` フィルターを追加

#### 5. Vercel デプロイ
- [ ] Vercel プロジェクト作成・GitHub 連携
- [ ] 環境変数設定（Vercel ダッシュボード）
- [ ] 本番ビルド確認（`pnpm build`）
- [ ] カスタムドメイン設定（任意）

#### 6. 動作確認
- [ ] 全機能の動作確認
- [ ] 異なるブラウザで同じメールアドレスを使ってデータが共有されること確認
- [ ] バンドルサイズ・Lighthouseスコア確認

**成果物**:
- [ ] パスフレーズ方式のクロスデバイス同期
- [ ] Vercel 本番環境デプロイ
- [ ] 公開 URL

---

## スケジュール概要

| フェーズ | 期間 | 状態 |
|---------|------|------|
| Phase 0: セットアップ | 1週間 | ✅ 完了 |
| Phase 1: データ層 | 1週間 | ✅ 完了 |
| Phase 1.5: PGlite移行 | 1週間 | ✅ 完了 |
| Phase 2: コアロジック | 1-2週間 | ✅ 完了 |
| Phase 3: 基本UI | 2週間 | ✅ 完了 |
| Phase 4: ホーム画面 | 2週間 | ✅ 完了 |
| Phase 5a: .ics インポート | 1週間 | ✅ 完了 |
| Phase 5b: Google カレンダー連携 | 2-3週間 | ⬜ 将来（v2） |
| Phase 6: Supabase + Vercel デプロイ | 1-2週間 | ⬜ 未着手 |

**合計: 約2.5-3ヶ月**

---

## リスクと対策

### リスク1: Google Calendar OAuth の複雑さ
**対策**:
- MVP では .ics ファイルインポートで対応済み（Phase 5a 完了）
- v2 で OAuth フローを Route Handler で安全に実装
- アクセストークン管理は Supabase セッションに統合

### リスク2: スケジュール生成ロジックの複雑さ
**対策**:
- 段階的な実装（まずシンプルに）
- 十分なテストケース作成
- エッジケースのドキュメント化

### リスク3: レスポンシブ対応の工数
**対策**:
- モバイルファーストで実装
- TailwindCSSのブレークポイント活用
- shadcn/uiの既存コンポーネント使用

### リスク4: LocalStorageの容量制限
**対策**:
- データ量のモニタリング
- 古いデータの自動削除機能
- 早めにSupabase移行を検討

---

## 開発ガイドライン

### コーディング規約
- TypeScript strictモード
- ESLint + Prettierに従う
- コミットメッセージは[Conventional Commits](https://www.conventionalcommits.org/)形式

### ブランチ戦略
```
main           # 本番環境
├── develop    # 開発環境
└── feature/*  # 機能開発
```

### コミットプレフィックス
- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメント
- `refactor:` リファクタリング
- `test:` テスト追加
- `chore:` ビルド・設定変更

### コンポーネント設計原則
- 単一責任の原則
- Composition over Inheritance
- Propsはできるだけシンプルに
- ビジネスロジックは分離

---

## 完成後の拡張計画（v2以降）

### 優先度高
- [ ] Supabaseへのデータ移行
- [ ] 複数デバイス同期
- [ ] プッシュ通知
- [ ] ダークモード

### 優先度中
- [ ] Google Calendar リアルタイム同期（OAuth 2.0 + REST API v3）→ Phase 5b
- [ ] データ分析・レポート
- [ ] AI最適化提案
- [ ] ウィジェット機能

### 優先度低
- [ ] チーム共有機能
- [ ] 多言語対応
- [ ] デスクトップアプリ（Electron）
- [ ] モバイルアプリ（React Native）

---

## まとめ

このフェーズ分けに従って実装を進めることで、約2.5-3ヶ月でMVPを完成させることができます。

各フェーズの終了時には動作するプロトタイプが存在するため、早い段階からフィードバックを得ることが可能です。

**次のステップ**: `TODO.md`を参照して、具体的なタスクから着手してください。
