export * from './storage';

/**
 * イベントタイプごとのデフォルト色
 */
export const EVENT_COLORS = {
  routine: '#3B82F6',
  calendar: '#8B5CF6',
  travel: '#10B981',
  free: '#E5E7EB',
} as const;

/**
 * ナビゲーション項目の定義
 */
export const NAV_ITEMS = [
  { icon: 'Home', label: 'ホーム', href: '/' },
  { icon: 'Calendar', label: 'パターン', href: '/patterns' },
  { icon: 'MapPin', label: '場所・移動', href: '/places' },
  { icon: 'CalendarDays', label: 'カレンダー', href: '/calendar' },
  { icon: 'Settings', label: '設定', href: '/settings' },
] as const;

/**
 * 移動手段の表示名マッピング
 */
export const TRAVEL_METHOD_LABELS: Record<string, string> = {
  walk: '徒歩',
  car: '車',
  train: '電車',
  bus: 'バス',
  bike: '自転車',
  other: 'その他',
};

/**
 * 移動手段のアイコンマッピング
 */
export const TRAVEL_METHOD_ICONS: Record<string, string> = {
  walk: '🚶',
  car: '🚗',
  train: '🚃',
  bus: '🚌',
  bike: '🚴',
  other: '🚀',
};

/**
 * デフォルト設定値
 */
export const DEFAULT_SETTINGS = {
  weekStartsOn: 1 as const,
  timeFormat: '24h' as const,
  theme: 'system' as const,
  notifications: {
    enabled: false,
    beforeEventMinutes: 15,
    delayWarning: true,
  },
  calendarSync: {
    autoSync: false,
    syncIntervalMinutes: 60,
    lastSyncAt: null,
  },
};
