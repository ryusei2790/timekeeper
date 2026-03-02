/**
 * TimeKeeper の全エンティティ型定義
 *
 * @module types
 */

// -----------------------------------------------
// Location（場所マスタ）
// -----------------------------------------------

/**
 * 場所マスタ
 * よく使う場所を管理するエンティティ
 */
export interface Location {
  /** UUID v4 */
  id: string;
  /** 場所の表示名（例: "自宅", "会社"） */
  name: string;
  /** 別名リスト（カレンダー予定の場所名マッチングに使用） */
  aliases: string[];
  /** 住所（任意、将来の地図API連携用） */
  address?: string;
  /** ISO 8601 形式の作成日時 */
  createdAt: string;
  /** ISO 8601 形式の更新日時 */
  updatedAt: string;
}

// -----------------------------------------------
// RoutineItem（習慣項目）
// -----------------------------------------------

/**
 * 習慣項目
 * 生活習慣の各アクティビティを定義するエンティティ
 */
export interface RoutineItem {
  /** UUID v4 */
  id: string;
  /** 習慣名（例: "朝食", "運動"） */
  name: string;
  /** 開始時刻（HH:mm 形式） */
  startTime: string;
  /** 所要時間（分） */
  duration: number;
  /** 実施場所の Location ID（null の場合は現在地のまま） */
  locationId: string | null;
  /** 表示アイコン（絵文字） */
  icon?: string;
  /** 表示色（HEX形式: #RRGGBB） */
  color?: string;
  /** 時間調整可能か（遅延発生時にシフトできるか） */
  isFlexible: boolean;
  /** 優先度（1-5、5が最高） */
  priority: number;
  /** ISO 8601 形式の作成日時 */
  createdAt: string;
  /** ISO 8601 形式の更新日時 */
  updatedAt: string;
}

// -----------------------------------------------
// LifePattern（生活習慣パターン）
// -----------------------------------------------

/**
 * パターン適用ルール
 * どの日にどのパターンを適用するかのルール定義
 */
export interface PatternRule {
  /** 適用する曜日の配列（0=日, 1=月, ..., 6=土） */
  dayOfWeek: number[];
  /** カレンダー予定タイトルにマッチするキーワード */
  keywords: string[];
  /** デフォルトパターンとして使用するか */
  isDefault: boolean;
  /** 複数パターンが該当した場合の優先度（大きいほど優先） */
  priority: number;
}

/**
 * 生活習慣パターン
 * 曜日やキーワードに基づいて適用される習慣セット
 */
export interface LifePattern {
  /** UUID v4 */
  id: string;
  /** パターン名（例: "平日パターン", "休日パターン"） */
  name: string;
  /** 適用ルール */
  rules: PatternRule;
  /** このパターンに含まれる RoutineItem の ID リスト */
  routineItemIds: string[];
  /** ISO 8601 形式の作成日時 */
  createdAt: string;
  /** ISO 8601 形式の更新日時 */
  updatedAt: string;
}

// -----------------------------------------------
// TravelRoute（移動ルート）
// -----------------------------------------------

/**
 * 移動手段
 */
export type TravelMethod = 'walk' | 'car' | 'train' | 'bus' | 'bike' | 'other';

/**
 * 移動ルート
 * 場所間の移動手段と所要時間を定義
 */
export interface TravelRoute {
  /** UUID v4 */
  id: string;
  /** 出発地の Location ID */
  fromLocationId: string;
  /** 目的地の Location ID */
  toLocationId: string;
  /** 移動手段 */
  method: TravelMethod;
  /** 所要時間（分） */
  duration: number;
  /** この区間のデフォルト移動手段か */
  isDefault: boolean;
  /** ISO 8601 形式の作成日時 */
  createdAt: string;
  /** ISO 8601 形式の更新日時 */
  updatedAt: string;
}

// -----------------------------------------------
// CalendarEvent（カレンダーイベント）
// -----------------------------------------------

/**
 * Apple Calendar から取得したイベント
 */
export interface CalendarEvent {
  /** CalDAV の UID */
  id: string;
  /** イベントタイトル */
  title: string;
  /** 開始日時（ISO 8601形式） */
  startTime: string;
  /** 終了日時（ISO 8601形式） */
  endTime: string;
  /** カレンダーの場所文字列（null の場合は場所未設定） */
  locationName: string | null;
  /** イベントの説明 */
  description: string | null;
  /** 終日イベントか */
  isAllDay: boolean;
  /** カレンダー識別子 */
  calendarId: string;
  /** 最終同期日時（ISO 8601形式） */
  syncedAt: string;
}

// -----------------------------------------------
// ScheduleItem（スケジュールアイテム）
// -----------------------------------------------

/**
 * スケジュールアイテムのステータス
 */
export type EventStatus = 'pending' | 'active' | 'completed' | 'skipped';

/**
 * スケジュールアイテム
 * DailyState.generatedSchedule を構成する各アイテム
 */
export interface ScheduleItem {
  /** UUID v4 */
  id: string;
  /** 表示タイトル */
  title: string;
  /** 元の開始時刻（HH:mm形式） */
  originalStartTime: string;
  /** 元の終了時刻（HH:mm形式） */
  originalEndTime: string;
  /** 遅延調整後の開始時刻（HH:mm形式） */
  adjustedStartTime: string;
  /** 遅延調整後の終了時刻（HH:mm形式） */
  adjustedEndTime: string;
  /** アイテムの種類 */
  type: 'routine' | 'calendar' | 'travel';
  /** 現在のステータス */
  status: EventStatus;
  /** 場所 ID（null の場合は場所なし） */
  locationId: string | null;
  /** 表示用の場所名 */
  locationName: string | null;
  /** 時間調整可能か */
  isFlexible: boolean;
  /** 優先度 */
  priority: number;
  /** 表示アイコン */
  icon?: string;
  /** 表示色 */
  color?: string;
  /** RoutineItem / CalendarEvent / TravelRoute の元 ID */
  sourceId: string;
  /** type='travel' の場合の移動ルート情報 */
  travelRoute?: TravelRoute;
  /** 移動手段の変更が可能か（type='travel' のみ） */
  canChangeMethod?: boolean;
}

// -----------------------------------------------
// DailyState（日次状態）
// -----------------------------------------------

/**
 * 遅延記録
 */
export interface DelayRecord {
  /** 遅延が発生したスケジュールアイテムの ID */
  eventId: string;
  /** 元の終了時刻（HH:mm形式） */
  originalEndTime: string;
  /** 実際の終了時刻（HH:mm形式） */
  actualEndTime: string;
  /** 遅延時間（分） */
  delayMinutes: number;
  /** 記録日時（ISO 8601形式） */
  timestamp: string;
}

/**
 * 日次状態
 * その日のスケジュール実行状態を管理
 */
export interface DailyState {
  /** 日付（YYYY-MM-DD形式） */
  date: string;
  /** 適用された LifePattern の ID */
  patternId: string;
  /** 現在地の Location ID */
  currentLocationId: string;
  /** 現在実行中のスケジュールアイテム ID（null の場合はなし） */
  activeEventId: string | null;
  /** 完了したアイテムの ID リスト */
  completedEventIds: string[];
  /** スキップしたアイテムの ID リスト */
  skippedEventIds: string[];
  /** 遅延記録リスト */
  delays: DelayRecord[];
  /** 生成されたスケジュール */
  generatedSchedule: ScheduleItem[];
  /** ISO 8601 形式の作成日時 */
  createdAt: string;
  /** ISO 8601 形式の更新日時 */
  updatedAt: string;
}

// -----------------------------------------------
// Settings（アプリケーション設定）
// -----------------------------------------------

/**
 * 通知設定
 */
export interface NotificationSettings {
  /** 通知を有効にするか */
  enabled: boolean;
  /** イベント開始何分前に通知するか */
  beforeEventMinutes: number;
  /** 遅延警告の通知を行うか */
  delayWarning: boolean;
}

/**
 * カレンダー同期設定
 */
export interface CalendarSyncSettings {
  /** 自動同期の有効/無効 */
  autoSync: boolean;
  /** 同期間隔（分） */
  syncIntervalMinutes: number;
  /** 最終同期日時（ISO 8601形式、未同期の場合は null） */
  lastSyncAt: string | null;
}

/**
 * アプリケーション設定
 */
export interface Settings {
  /** 1日の開始位置となるデフォルト Location ID */
  defaultLocationId: string;
  /** 週の開始曜日（0=日, 1=月） */
  weekStartsOn: 0 | 1;
  /** 時刻表示形式 */
  timeFormat: '12h' | '24h';
  /** テーマ（将来対応） */
  theme: 'light' | 'dark' | 'system';
  /** 通知設定 */
  notifications: NotificationSettings;
  /** カレンダー同期設定 */
  calendarSync: CalendarSyncSettings;
  /** ISO 8601 形式の作成日時 */
  createdAt: string;
  /** ISO 8601 形式の更新日時 */
  updatedAt: string;
}

// -----------------------------------------------
// ユーティリティ型
// -----------------------------------------------

/**
 * ID・タイムスタンプを除いた作成用入力型
 * @example CreateInput<Location> → { name, aliases, address? }
 */
export type CreateInput<T extends { id: string; createdAt: string; updatedAt: string }> = Omit<
  T,
  'id' | 'createdAt' | 'updatedAt'
>;

/**
 * 更新用部分型（id・タイムスタンプ除外）
 * @example UpdateInput<Location> → Partial<{ name, aliases, address? }>
 */
export type UpdateInput<T extends { id: string; createdAt: string; updatedAt: string }> = Partial<
  Omit<T, 'id' | 'createdAt' | 'updatedAt'>
>;
