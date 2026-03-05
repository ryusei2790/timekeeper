# データモデル設計

## 概要

このドキュメントでは、Timekeeperアプリケーションで使用するデータ構造を定義します。
現在は PGlite（IndexedDB）でローカル保存。Phase 6 で Supabase Postgres にもミラーリング（write-through）する。

## データストレージ構造

### LocalStorageキー

```typescript
const STORAGE_KEYS = {
  locations: 'timekeeper_locations',
  routineItems: 'timekeeper_routine_items',
  patterns: 'timekeeper_patterns',
  travelRoutes: 'timekeeper_travel_routes',
  calendarEvents: 'timekeeper_calendar_events',
  dailyStates: 'timekeeper_daily_states',
  settings: 'timekeeper_settings',
  calendarAuth: 'timekeeper_calendar_auth'
};
```

## エンティティ定義

### 1. Location（場所）

よく使う場所のマスタデータ

```typescript
interface Location {
  id: string;                    // UUID
  name: string;                  // "自宅", "会社", "ジム"
  aliases: string[];             // ["オフィス", "職場", "仕事場"]
  address?: string;              // "東京都渋谷区..." (任意、将来API用)
  createdAt: string;             // ISO 8601形式
  updatedAt: string;             // ISO 8601形式
}
```

**バリデーション**:
- `name`: 必須、1-50文字
- `aliases`: 各エイリアスは1-50文字
- `id`: UUID v4

**インデックス**: `id`, `name`

**例**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "自宅",
  "aliases": ["マイホーム", "家"],
  "createdAt": "2026-03-01T00:00:00.000Z",
  "updatedAt": "2026-03-01T00:00:00.000Z"
}
```

---

### 2. RoutineItem（習慣項目）

生活習慣の各項目。「何をするか・何分かかるか」のみを定義し、開始時刻はパターンごとに `PatternRoutineItem` で管理する。

```typescript
interface RoutineItem {
  id: string;                    // UUID
  name: string;                  // "朝食", "運動", "勉強"
  duration: number;              // 30 (分)
  locationId: string | null;     // 場所ID（任意）
  icon?: string;                 // "🍽️" (Emoji)
  color?: string;                // "#FF6B6B" (HEX色)
  isFlexible: boolean;           // 時間調整可能か
  priority: number;              // 1-5 (5が最高優先度)
  createdAt: string;             // ISO 8601形式
  updatedAt: string;             // ISO 8601形式
}
```

**バリデーション**:
- `name`: 必須、1-50文字
- `duration`: 1-1440（分）
- `priority`: 1-5
- `color`: HEX色（#RRGGBB）

**例**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "朝食",
  "duration": 30,
  "locationId": "550e8400-e29b-41d4-a716-446655440000",
  "icon": "🍽️",
  "color": "#FF6B6B",
  "isFlexible": true,
  "priority": 3,
  "createdAt": "2026-03-01T00:00:00.000Z",
  "updatedAt": "2026-03-01T00:00:00.000Z"
}
```

---

### 3. PatternRoutineItem（パターン内習慣項目）

`LifePattern` と `RoutineItem` の中間型。同一の `RoutineItem` を複数パターンで異なる開始時刻に使い回せる。

```typescript
interface PatternRoutineItem {
  routineItemId: string;         // 参照する RoutineItem の ID
  startTime: string;             // このパターン内での開始時刻（HH:mm形式）
}
```

---

### 4. LifePattern（生活習慣パターン）

パターンと適用ルール

```typescript
interface LifePattern {
  id: string;                    // UUID
  name: string;                  // "平日パターン"
  rules: PatternRule;            // 適用ルール
  patternItems: PatternRoutineItem[]; // 習慣項目と開始時刻のリスト
  createdAt: string;             // ISO 8601形式
  updatedAt: string;             // ISO 8601形式
}

interface PatternRule {
  dayOfWeek: number[];           // [1,2,3,4,5] = 月〜金 (0=日, 6=土)
  keywords: string[];            // ["出勤", "オフィス"]
  isDefault: boolean;            // デフォルトパターンか
  priority: number;              // 複数該当時の優先度（大きいほど優先）
}
```

**バリデーション**:
- `name`: 必須、1-50文字
- `dayOfWeek`: 0-6の配列
- `keywords`: 各キーワードは1-50文字
- `priority`: 1-100
- `patternItems[].startTime`: HH:mm形式

**例**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "name": "平日パターン",
  "rules": {
    "dayOfWeek": [1, 2, 3, 4, 5],
    "keywords": ["出勤", "オフィス"],
    "isDefault": false,
    "priority": 10
  },
  "patternItems": [
    { "routineItemId": "550e8400-e29b-41d4-a716-446655440001", "startTime": "07:30" },
    { "routineItemId": "550e8400-e29b-41d4-a716-446655440003", "startTime": "09:00" }
  ],
  "createdAt": "2026-03-01T00:00:00.000Z",
  "updatedAt": "2026-03-01T00:00:00.000Z"
}
```

---

### 5. TravelRoute（移動ルート）

場所間の移動ルート

```typescript
type TravelMethod = 'walk' | 'car' | 'train' | 'bus' | 'bike' | 'other';

interface TravelRoute {
  id: string;                    // UUID
  fromLocationId: string;        // 出発地ID
  toLocationId: string;          // 目的地ID
  method: TravelMethod;          // 移動手段
  duration: number;              // 所要時間（分）
  isDefault: boolean;            // このルートのデフォルト手段か
  createdAt: string;             // ISO 8601形式
  updatedAt: string;             // ISO 8601形式
}
```

**バリデーション**:
- `fromLocationId`: 有効なLocation ID
- `toLocationId`: 有効なLocation ID（fromと異なる）
- `duration`: 1-1440（分）
- 同一区間（from-to）でデフォルトは1つのみ

**インデックス**: `fromLocationId`, `toLocationId`

**例**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "fromLocationId": "550e8400-e29b-41d4-a716-446655440000",
  "toLocationId": "550e8400-e29b-41d4-a716-446655440004",
  "method": "car",
  "duration": 30,
  "isDefault": true,
  "createdAt": "2026-03-01T00:00:00.000Z",
  "updatedAt": "2026-03-01T00:00:00.000Z"
}
```

---

### 6. CalendarEvent（カレンダー予定）

Apple Calendarから取得したイベント

```typescript
interface CalendarEvent {
  id: string;                    // CalDAVのUID
  title: string;                 // "定例会議"
  startTime: string;             // ISO 8601形式（日時）
  endTime: string;               // ISO 8601形式（日時）
  locationName: string | null;   // "会社" (カレンダーの場所文字列)
  description: string | null;    // イベントの説明
  isAllDay: boolean;             // 終日イベントか
  calendarId: string;            // カレンダー識別子
  syncedAt: string;              // 最終同期日時
}
```

**バリデーション**:
- `title`: 必須、1-200文字
- `startTime` < `endTime`
- `isAllDay`: trueの場合、時刻は00:00

**インデックス**: `startTime`, `calendarId`

**例**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440005",
  "title": "定例会議",
  "startTime": "2026-03-01T10:00:00.000Z",
  "endTime": "2026-03-01T11:00:00.000Z",
  "locationName": "会社",
  "description": "週次の定例会議",
  "isAllDay": false,
  "calendarId": "primary",
  "syncedAt": "2026-03-01T06:00:00.000Z"
}
```

---

### 7. DailyState（日次状態）

その日のスケジュール実行状態

```typescript
type EventStatus = 'pending' | 'active' | 'completed' | 'skipped';

interface DailyState {
  date: string;                  // "2026-03-01" (YYYY-MM-DD)
  patternId: string;             // 適用されたLifePatternのID
  currentLocationId: string;     // 現在地のLocation ID
  activeEventId: string | null;  // 現在実行中のイベントID
  completedEventIds: string[];   // 完了したイベントのID配列
  skippedEventIds: string[];     // スキップしたイベントのID配列
  delays: DelayRecord[];         // 遅延記録
  generatedSchedule: ScheduleItem[]; // 生成されたスケジュール
  createdAt: string;             // ISO 8601形式
  updatedAt: string;             // ISO 8601形式
}

interface DelayRecord {
  eventId: string;               // イベントID
  originalEndTime: string;       // 元の終了時刻（HH:mm）
  actualEndTime: string;         // 実際の終了時刻（HH:mm）
  delayMinutes: number;          // 遅延時間（分）
  timestamp: string;             // 記録日時（ISO 8601）
}

interface ScheduleItem {
  id: string;                    // UUID
  title: string;                 // "朝食", "定例会議"
  originalStartTime: string;     // "07:30" (HH:mm)
  originalEndTime: string;       // "08:00" (HH:mm)
  adjustedStartTime: string;     // "07:30" (HH:mm、調整後)
  adjustedEndTime: string;       // "08:00" (HH:mm、調整後)
  type: 'routine' | 'calendar' | 'travel';
  status: EventStatus;           // イベントの状態
  locationId: string | null;     // 場所ID
  locationName: string | null;   // 場所名（表示用）
  isFlexible: boolean;           // 時間調整可能か
  priority: number;              // 優先度
  icon?: string;                 // アイコン
  color?: string;                // 色

  // タイプごとの追加情報
  sourceId: string;              // RoutineItem/CalendarEvent/TravelRouteのID
  travelRoute?: TravelRoute;     // type='travel'の場合のみ
  canChangeMethod?: boolean;     // 移動手段変更可能か
}
```

**バリデーション**:
- `date`: YYYY-MM-DD形式
- `currentLocationId`: 有効なLocation ID
- `delays`: delayMinutes >= 0

**インデックス**: `date`

**例**:
```json
{
  "date": "2026-03-01",
  "patternId": "550e8400-e29b-41d4-a716-446655440002",
  "currentLocationId": "550e8400-e29b-41d4-a716-446655440004",
  "activeEventId": "550e8400-e29b-41d4-a716-446655440010",
  "completedEventIds": [
    "550e8400-e29b-41d4-a716-446655440008",
    "550e8400-e29b-41d4-a716-446655440009"
  ],
  "skippedEventIds": [],
  "delays": [
    {
      "eventId": "550e8400-e29b-41d4-a716-446655440009",
      "originalEndTime": "08:00",
      "actualEndTime": "08:15",
      "delayMinutes": 15,
      "timestamp": "2026-03-01T08:15:00.000Z"
    }
  ],
  "generatedSchedule": [/* ScheduleItem配列 */],
  "createdAt": "2026-03-01T00:00:00.000Z",
  "updatedAt": "2026-03-01T10:30:00.000Z"
}
```

---

### 8. Settings（設定）

アプリケーション全体の設定

```typescript
interface Settings {
  defaultLocationId: string;     // 1日の開始位置（通常は自宅）
  weekStartsOn: number;          // 週の開始曜日（0=日, 1=月）
  timeFormat: '12h' | '24h';     // 時刻表示形式
  theme: 'light' | 'dark' | 'system'; // テーマ（将来対応）
  notifications: NotificationSettings; // 通知設定（将来対応）
  calendarSync: CalendarSyncSettings; // カレンダー同期設定
  createdAt: string;             // ISO 8601形式
  updatedAt: string;             // ISO 8601形式
}

interface NotificationSettings {
  enabled: boolean;
  beforeEventMinutes: number;    // イベント何分前に通知するか
  delayWarning: boolean;         // 遅延警告の通知
}

interface CalendarSyncSettings {
  autoSync: boolean;             // 自動同期の有効/無効
  syncIntervalMinutes: number;   // 同期間隔（分）
  lastSyncAt: string | null;     // 最終同期日時
}
```

**例**:
```json
{
  "defaultLocationId": "550e8400-e29b-41d4-a716-446655440000",
  "weekStartsOn": 1,
  "timeFormat": "24h",
  "theme": "system",
  "notifications": {
    "enabled": false,
    "beforeEventMinutes": 15,
    "delayWarning": true
  },
  "calendarSync": {
    "autoSync": true,
    "syncIntervalMinutes": 60,
    "lastSyncAt": "2026-03-01T06:00:00.000Z"
  },
  "createdAt": "2026-03-01T00:00:00.000Z",
  "updatedAt": "2026-03-01T10:00:00.000Z"
}
```

---

### 9. CalendarAuth（カレンダー認証情報）

Apple Calendar認証情報（セキュアに保存）

```typescript
interface CalendarAuth {
  provider: 'apple' | 'google';  // プロバイダー
  username: string;              // Apple ID
  serverUrl: string;             // CalDAVサーバーURL
  accessToken: string;           // アクセストークン（暗号化推奨）
  refreshToken?: string;         // リフレッシュトークン
  expiresAt?: string;            // トークン有効期限
  createdAt: string;             // ISO 8601形式
  updatedAt: string;             // ISO 8601形式
}
```

**セキュリティ注意**:
- LocalStorageに保存する場合、トークンは暗号化する
- 本番環境では環境変数やセキュアストレージを使用

---

## データ関連図

```
Location
  ↑
  |--- TravelRoute (from/to)
  |--- RoutineItem (defaultLocation)
  |--- ScheduleItem (location)
  |--- DailyState (currentLocation)
  |--- Settings (defaultLocation)

RoutineItem
  ↑
  |--- PatternRoutineItem (routineItemId)
  |--- ScheduleItem (sourceId)

PatternRoutineItem
  ↑
  |--- LifePattern (patternItems)

LifePattern
  ↑
  |--- DailyState (patternId)

TravelRoute
  ↑
  |--- ScheduleItem (travelRoute)

CalendarEvent
  ↑
  |--- ScheduleItem (sourceId)

DailyState
  |--- ScheduleItem[] (generatedSchedule)
```

## データフロー

### 1. スケジュール生成フロー

```
1. 日付から適用するLifePatternを選択
   ↓
2. LifePatternからRoutineItemsを取得
   ↓
3. その日のCalendarEventsを取得
   ↓
4. RoutineItems + CalendarEventsを時系列にマージ
   ↓
5. 現在地を初期化（Settings.defaultLocation）
   ↓
6. 各イベントをループ：
   - 場所が変わる？
     - Yes → TravelRouteを検索して移動イベント挿入
     - 現在地を更新
   - ScheduleItemを生成
   ↓
7. DailyState.generatedScheduleに保存
```

### 2. イベント完了フロー

```
1. ユーザーがイベント完了をマーク
   ↓
2. DailyStateを取得
   ↓
3. イベントのstatusを'completed'に変更
   ↓
4. completedEventIdsに追加
   ↓
5. 遅延チェック：
   - 実際の終了時刻 > 予定終了時刻？
     - Yes → DelayRecordを追加
     - 後続イベントを調整
   ↓
6. イベントにlocationIdがある？
   - Yes → currentLocationIdを更新
   ↓
7. 次のイベントをactiveに変更
   ↓
8. DailyStateを保存
```

### 3. 遅延調整フロー

```
1. DelayRecordから遅延時間を取得
   ↓
2. 後続のScheduleItemsをループ：
   - isFlexible = true？
     - Yes → 開始/終了時刻を遅延分だけ後ろにずらす
   - type = 'calendar' かつ isFlexible = false？
     - Yes → ループを終了（固定予定は動かさない）
   ↓
3. 移動時間の最適化：
   - より速い移動手段があるか検索
   - あれば提案（ユーザーに通知）
   ↓
4. adjustedStartTime/adjustedEndTimeを更新
```

## データ永続化戦略

### LocalStorage（MVP）

```typescript
// 保存
function saveData<T>(key: string, data: T): void {
  try {
    const json = JSON.stringify(data);
    localStorage.setItem(key, json);
  } catch (error) {
    console.error('Save failed:', error);
    // エラーハンドリング
  }
}

// 読み込み
function loadData<T>(key: string): T | null {
  try {
    const json = localStorage.getItem(key);
    if (!json) return null;
    return JSON.parse(json) as T;
  } catch (error) {
    console.error('Load failed:', error);
    return null;
  }
}
```

### 将来のSupabase移行

```sql
-- テーブル定義例
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name VARCHAR(50) NOT NULL,
  aliases TEXT[],
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_locations_user_id ON locations(user_id);
CREATE INDEX idx_locations_name ON locations(name);
```

## バリデーションスキーマ（Zod）

```typescript
import { z } from 'zod';

export const LocationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  aliases: z.array(z.string().min(1).max(50)),
  address: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const PatternRoutineItemSchema = z.object({
  routineItemId: z.string().uuid(),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
});

export const RoutineItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  duration: z.number().min(1).max(1440),
  locationId: z.string().uuid().nullable(),
  icon: z.string().emoji().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  isFlexible: z.boolean(),
  priority: z.number().min(1).max(5),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// 他のスキーマも同様に定義...
```

## データマイグレーション

将来的にデータ構造が変更された場合のマイグレーション戦略

```typescript
const DATA_VERSION = 1;

interface DataVersion {
  version: number;
  migratedAt: string;
}

function migrate(oldVersion: number, newVersion: number): void {
  // バージョンごとのマイグレーションロジック
  if (oldVersion < 1 && newVersion >= 1) {
    // v1へのマイグレーション
  }

  // バージョン情報を更新
  saveData('timekeeper_version', {
    version: newVersion,
    migratedAt: new Date().toISOString()
  });
}

---

## Supabase テーブル設計（Phase 6）

PGlite の 7 テーブルを Supabase Postgres にミラーリングする。各テーブルに `user_id UUID` を追加し、Row Level Security（RLS）で `auth.uid() = user_id` によりデータ分離する。

### PGlite との差分

| テーブル | PGlite | Supabase |
|---------|--------|----------|
| `daily_states` | PK: `date TEXT` | PK: `(id TEXT, user_id UUID)` の複合キー |
| `settings` | PK: `id = 'default'`（固定文字列） | PK: `user_id UUID` |
| その他 5 テーブル | PK: `id TEXT` | PK: `id TEXT`（`user_id UUID` を追加） |

### 認証方式

- **Supabase Auth（Magic Link）**: メールアドレス入力 → ワンタイムリンク送信 → クリックでセッション確立
- セッションは Cookie で管理（`@supabase/ssr`）
- 将来の Google/Apple 認証はダッシュボードで ON にするだけ（コード変更不要）

### 同期戦略

```
未ログイン: PGlite のみ（オフラインファースト）
ログイン中: PGlite → Supabase write-through（ベストエフォート）
ログイン時: ローカルにデータあれば uploadAll → Supabase
           ローカルが空なら downloadAll ← Supabase
衝突解決:   Last-Write-Wins（updated_at ISO 8601 辞書順）
```

詳細な DDL は `docs/auth-sync-design.md` を参照。
```
