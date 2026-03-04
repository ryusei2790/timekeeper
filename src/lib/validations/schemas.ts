import { z } from 'zod';

// -----------------------------------------------
// 共通ヘルパースキーマ
// -----------------------------------------------

/** ISO 8601 日時文字列のスキーマ */
const isoDatetime = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, {
  error: '有効な日時形式ではありません',
});

/** HH:mm 形式の時刻スキーマ */
const timeString = z
  .string()
  .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, { error: '時刻は HH:mm 形式で入力してください' });

/** YYYY-MM-DD 形式の日付スキーマ */
const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { error: '日付は YYYY-MM-DD 形式で入力してください' });

/** HEX 色コードのスキーマ */
const hexColor = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, { error: '色は #RRGGBB 形式で入力してください' });

/** UUID v4 のスキーマ */
const uuid = z.string().uuid({ error: '有効な ID ではありません' });

// -----------------------------------------------
// Location スキーマ
// -----------------------------------------------

export const LocationSchema = z.object({
  id: uuid,
  name: z.string().min(1, '名前は必須です').max(50, '50文字以内で入力してください'),
  aliases: z.array(z.string().min(1).max(50)),
  address: z.string().max(200).optional(),
  createdAt: isoDatetime,
  updatedAt: isoDatetime,
});

export const CreateLocationSchema = LocationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// -----------------------------------------------
// RoutineItem スキーマ
// -----------------------------------------------

export const RoutineItemSchema = z.object({
  id: uuid,
  name: z.string().min(1, '名前は必須です').max(50, '50文字以内で入力してください'),
  duration: z
    .number()
    .min(1, '1分以上を設定してください')
    .max(1440, '1440分以内で設定してください'),
  locationId: uuid.nullable(),
  icon: z.string().optional(),
  color: hexColor.optional(),
  isFlexible: z.boolean(),
  priority: z.number().int().min(1).max(5),
  createdAt: isoDatetime,
  updatedAt: isoDatetime,
});

export const CreateRoutineItemSchema = RoutineItemSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// -----------------------------------------------
// PatternRoutineItem スキーマ
// -----------------------------------------------

export const PatternRoutineItemSchema = z.object({
  routineItemId: uuid,
  startTime: timeString,
});

// -----------------------------------------------
// PatternRule スキーマ
// -----------------------------------------------

export const PatternRuleSchema = z.object({
  dayOfWeek: z.array(z.number().int().min(0).max(6)),
  keywords: z.array(z.string().min(1).max(50)),
  isDefault: z.boolean(),
  priority: z.number().int().min(1).max(100),
});

// -----------------------------------------------
// LifePattern スキーマ
// -----------------------------------------------

export const LifePatternSchema = z.object({
  id: uuid,
  name: z.string().min(1, '名前は必須です').max(50, '50文字以内で入力してください'),
  rules: PatternRuleSchema,
  patternItems: z.array(PatternRoutineItemSchema),
  createdAt: isoDatetime,
  updatedAt: isoDatetime,
});

export const CreateLifePatternSchema = LifePatternSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// -----------------------------------------------
// TravelRoute スキーマ
// -----------------------------------------------

export const TravelMethodSchema = z.enum(['walk', 'car', 'train', 'bus', 'bike', 'other']);

export const TravelRouteSchema = z.object({
  id: uuid,
  fromLocationId: uuid,
  toLocationId: uuid,
  method: TravelMethodSchema,
  duration: z
    .number()
    .min(1, '1分以上を設定してください')
    .max(1440, '1440分以内で設定してください'),
  isDefault: z.boolean(),
  createdAt: isoDatetime,
  updatedAt: isoDatetime,
});

export const CreateTravelRouteSchema = TravelRouteSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).refine((data) => data.fromLocationId !== data.toLocationId, {
  message: '出発地と目的地は異なる場所を選択してください',
  path: ['toLocationId'],
});

// -----------------------------------------------
// CalendarEvent スキーマ
// -----------------------------------------------

export const CalendarEventSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  startTime: isoDatetime,
  endTime: isoDatetime,
  locationName: z.string().nullable(),
  description: z.string().nullable(),
  isAllDay: z.boolean(),
  calendarId: z.string().min(1),
  syncedAt: isoDatetime,
});

// -----------------------------------------------
// Settings スキーマ
// -----------------------------------------------

export const NotificationSettingsSchema = z.object({
  enabled: z.boolean(),
  beforeEventMinutes: z.number().int().min(0).max(60),
  delayWarning: z.boolean(),
});

export const CalendarSyncSettingsSchema = z.object({
  autoSync: z.boolean(),
  syncIntervalMinutes: z.number().int().min(5).max(1440),
  lastSyncAt: isoDatetime.nullable(),
});

export const SettingsSchema = z.object({
  defaultLocationId: uuid,
  weekStartsOn: z.union([z.literal(0), z.literal(1)]),
  timeFormat: z.enum(['12h', '24h']),
  theme: z.enum(['light', 'dark', 'system']),
  notifications: NotificationSettingsSchema,
  calendarSync: CalendarSyncSettingsSchema,
  createdAt: isoDatetime,
  updatedAt: isoDatetime,
});

// -----------------------------------------------
// DailyState スキーマ
// -----------------------------------------------

export const EventStatusSchema = z.enum(['pending', 'active', 'completed', 'skipped']);

export const DelayRecordSchema = z.object({
  eventId: uuid,
  originalEndTime: timeString,
  actualEndTime: timeString,
  delayMinutes: z.number().min(0),
  timestamp: isoDatetime,
});

export const ScheduleItemSchema = z.object({
  id: uuid,
  title: z.string().min(1),
  originalStartTime: timeString,
  originalEndTime: timeString,
  adjustedStartTime: timeString,
  adjustedEndTime: timeString,
  type: z.enum(['routine', 'calendar', 'travel']),
  status: EventStatusSchema,
  locationId: uuid.nullable(),
  locationName: z.string().nullable(),
  isFlexible: z.boolean(),
  priority: z.number().int().min(1).max(5),
  icon: z.string().optional(),
  color: hexColor.optional(),
  sourceId: z.string().min(1),
  canChangeMethod: z.boolean().optional(),
});

export const DailyStateSchema = z.object({
  date: dateString,
  patternId: uuid,
  currentLocationId: uuid,
  activeEventId: uuid.nullable(),
  completedEventIds: z.array(uuid),
  skippedEventIds: z.array(uuid),
  delays: z.array(DelayRecordSchema),
  generatedSchedule: z.array(ScheduleItemSchema),
  createdAt: isoDatetime,
  updatedAt: isoDatetime,
});

// -----------------------------------------------
// 型エクスポート（Zod から TypeScript 型を推論）
// -----------------------------------------------

export type LocationFormValues = z.infer<typeof CreateLocationSchema>;
export type RoutineItemFormValues = z.infer<typeof CreateRoutineItemSchema>;
export type LifePatternFormValues = z.infer<typeof CreateLifePatternSchema>;
export type TravelRouteFormValues = z.infer<typeof CreateTravelRouteSchema>;
