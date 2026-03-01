# コードスニペット集

開発でよく使うコードパターンのスニペット集

---

## 目次

1. [TypeScript型定義](#typescript型定義)
2. [Zustand Store](#zustand-store)
3. [React Hook Form + Zod](#react-hook-form--zod)
4. [shadcn/ui コンポーネント](#shadcnui-コンポーネント)
5. [カスタムフック](#カスタムフック)
6. [LocalStorage操作](#localstorage操作)
7. [日付・時刻操作](#日付時刻操作)
8. [Next.js App Router](#nextjs-app-router)

---

## TypeScript型定義

### 基本的なエンティティ型

```typescript
// src/types/index.ts

export interface Location {
  id: string;
  name: string;
  aliases: string[];
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoutineItem {
  id: string;
  name: string;
  startTime: string;
  duration: number;
  locationId: string | null;
  icon?: string;
  color?: string;
  isFlexible: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface LifePattern {
  id: string;
  name: string;
  rules: PatternRule;
  routineItemIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PatternRule {
  dayOfWeek: number[];
  keywords: string[];
  isDefault: boolean;
  priority: number;
}
```

### ユーティリティ型

```typescript
// Omit で特定のプロパティを除外
type CreateLocationInput = Omit<Location, 'id' | 'createdAt' | 'updatedAt'>;

// Pick で特定のプロパティのみ抽出
type LocationSummary = Pick<Location, 'id' | 'name'>;

// Partial で全てのプロパティをオプションに
type UpdateLocationInput = Partial<Location>;

// Required で全てのプロパティを必須に
type CompleteLocation = Required<Location>;
```

---

## Zustand Store

### 基本的なStore

```typescript
// src/store/useLocationStore.ts

import { create } from 'zustand';
import { Location } from '@/types';
import { locationService } from '@/lib/data/locations';

interface LocationStore {
  locations: Location[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadLocations: () => void;
  addLocation: (location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLocation: (id: string, data: Partial<Location>) => void;
  deleteLocation: (id: string) => void;
  getLocationById: (id: string) => Location | undefined;
}

export const useLocationStore = create<LocationStore>((set, get) => ({
  locations: [],
  isLoading: false,
  error: null,

  loadLocations: () => {
    set({ isLoading: true, error: null });
    try {
      const locations = locationService.getAll();
      set({ locations, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addLocation: (data) => {
    try {
      const newLocation = locationService.create(data);
      set((state) => ({
        locations: [...state.locations, newLocation]
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateLocation: (id, data) => {
    try {
      const updated = locationService.update(id, data);
      set((state) => ({
        locations: state.locations.map((loc) =>
          loc.id === id ? updated : loc
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  deleteLocation: (id) => {
    try {
      locationService.delete(id);
      set((state) => ({
        locations: state.locations.filter((loc) => loc.id !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  getLocationById: (id) => {
    return get().locations.find((loc) => loc.id === id);
  },
}));
```

### Persist Store（LocalStorage連携）

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsStore {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'timekeeper-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

---

## React Hook Form + Zod

### フォームの基本パターン

```typescript
// src/components/forms/LocationForm.tsx

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

// Zodスキーマ
const locationSchema = z.object({
  name: z.string().min(1, '名前は必須です').max(50, '50文字以内で入力してください'),
  aliases: z.array(z.string()).default([]),
  address: z.string().optional(),
});

type LocationFormValues = z.infer<typeof locationSchema>;

interface LocationFormProps {
  defaultValues?: Partial<LocationFormValues>;
  onSubmit: (data: LocationFormValues) => void;
}

export function LocationForm({ defaultValues, onSubmit }: LocationFormProps) {
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: '',
      aliases: [],
      address: '',
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>場所名</FormLabel>
              <FormControl>
                <Input placeholder="自宅" {...field} />
              </FormControl>
              <FormDescription>
                よく使う場所の名前を入力してください
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>住所（任意）</FormLabel>
              <FormControl>
                <Input placeholder="東京都..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">保存</Button>
      </form>
    </Form>
  );
}
```

### 配列フィールドの操作

```typescript
import { useFieldArray } from 'react-hook-form';

const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: 'aliases',
});

// 使用例
<div>
  {fields.map((field, index) => (
    <div key={field.id}>
      <Input {...form.register(`aliases.${index}`)} />
      <Button onClick={() => remove(index)}>削除</Button>
    </div>
  ))}
  <Button onClick={() => append('')}>追加</Button>
</div>
```

---

## shadcn/ui コンポーネント

### Dialog（モーダル）

```typescript
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function LocationDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>場所を追加</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新しい場所を追加</DialogTitle>
          <DialogDescription>
            よく使う場所を登録してください
          </DialogDescription>
        </DialogHeader>
        <LocationForm
          onSubmit={(data) => {
            console.log(data);
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
```

### Tabs

```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function PlacesTabs() {
  return (
    <Tabs defaultValue="locations">
      <TabsList>
        <TabsTrigger value="locations">場所</TabsTrigger>
        <TabsTrigger value="routes">移動ルート</TabsTrigger>
      </TabsList>

      <TabsContent value="locations">
        <LocationList />
      </TabsContent>

      <TabsContent value="routes">
        <TravelRouteList />
      </TabsContent>
    </Tabs>
  );
}
```

### Toast（通知）

```typescript
import { useToast } from '@/components/ui/use-toast';

export function MyComponent() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: '保存しました',
      description: '場所が正常に保存されました',
    });
  };

  const handleError = () => {
    toast({
      title: 'エラー',
      description: '保存に失敗しました',
      variant: 'destructive',
    });
  };

  return (
    <div>
      <Button onClick={handleSave}>保存</Button>
    </div>
  );
}
```

---

## カスタムフック

### useLocalStorage

```typescript
// src/hooks/useLocalStorage.ts

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}
```

### useCurrentTime

```typescript
// src/hooks/useCurrentTime.ts

import { useState, useEffect } from 'react';

export function useCurrentTime(intervalMs: number = 1000) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return currentTime;
}
```

### useDailySchedule

```typescript
// src/hooks/useDailySchedule.ts

import { useEffect } from 'react';
import { useDailyStateStore } from '@/store/useDailyStateStore';
import { generateDailySchedule } from '@/lib/scheduler/generator';
import { usePatternStore } from '@/store/usePatternStore';
import { useCalendarStore } from '@/store/useCalendarStore';

export function useDailySchedule(date: Date) {
  const { dailyState, setDailyState } = useDailyStateStore();
  const { patterns } = usePatternStore();
  const { events } = useCalendarStore();

  useEffect(() => {
    const schedule = generateDailySchedule(date, patterns, events);
    setDailyState(schedule);
  }, [date, patterns, events]);

  return dailyState;
}
```

---

## LocalStorage操作

### Storage基底クラス

```typescript
// src/lib/storage/storage.ts

export class Storage<T> {
  constructor(private key: string) {}

  get(): T | null {
    if (typeof window === 'undefined') return null;

    try {
      const item = window.localStorage.getItem(this.key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading ${this.key}:`, error);
      return null;
    }
  }

  set(data: T): void {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(this.key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error writing ${this.key}:`, error);
      throw error;
    }
  }

  update(updater: (data: T | null) => T): void {
    const current = this.get();
    const updated = updater(current);
    this.set(updated);
  }

  delete(): void {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(this.key);
  }

  clear(): void {
    this.delete();
  }
}
```

### データサービス例

```typescript
// src/lib/data/locations.ts

import { v4 as uuidv4 } from 'uuid';
import { Location } from '@/types';
import { Storage } from '@/lib/storage/storage';

const storage = new Storage<Location[]>('timekeeper_locations');

export const locationService = {
  getAll(): Location[] {
    return storage.get() || [];
  },

  getById(id: string): Location | null {
    const locations = this.getAll();
    return locations.find((loc) => loc.id === id) || null;
  },

  create(data: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>): Location {
    const newLocation: Location = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storage.update((locations) => [...(locations || []), newLocation]);
    return newLocation;
  },

  update(id: string, data: Partial<Location>): Location {
    const locations = this.getAll();
    const index = locations.findIndex((loc) => loc.id === id);

    if (index === -1) {
      throw new Error(`Location with id ${id} not found`);
    }

    const updated: Location = {
      ...locations[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    locations[index] = updated;
    storage.set(locations);
    return updated;
  },

  delete(id: string): void {
    const locations = this.getAll();
    const filtered = locations.filter((loc) => loc.id !== id);
    storage.set(filtered);
  },
};
```

---

## 日付・時刻操作

### よく使うdate-fns関数

```typescript
import {
  format,
  parse,
  addMinutes,
  subMinutes,
  differenceInMinutes,
  isToday,
  isSameDay,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { ja } from 'date-fns/locale';

// 日付フォーマット
export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatDateTime(date: Date): string {
  return format(date, 'yyyy-MM-dd HH:mm:ss');
}

export function formatTime(date: Date): string {
  return format(date, 'HH:mm');
}

export function formatJapaneseDate(date: Date): string {
  return format(date, 'M月d日（E）', { locale: ja });
}

// 時刻のパース
export function parseTime(timeString: string): Date {
  return parse(timeString, 'HH:mm', new Date());
}

// 時刻の操作
export function addMinutesToTime(timeString: string, minutes: number): string {
  const date = parseTime(timeString);
  const newDate = addMinutes(date, minutes);
  return formatTime(newDate);
}

// 時刻の差分
export function minutesBetween(start: string, end: string): number {
  const startDate = parseTime(start);
  const endDate = parseTime(end);
  return differenceInMinutes(endDate, startDate);
}

// 日付チェック
export function isTodayDate(date: Date): boolean {
  return isToday(date);
}

export function areSameDay(date1: Date, date2: Date): boolean {
  return isSameDay(date1, date2);
}
```

---

## Next.js App Router

### ページコンポーネント

```typescript
// src/app/patterns/page.tsx

import { Metadata } from 'next';
import { PatternList } from '@/components/patterns/PatternList';

export const metadata: Metadata = {
  title: 'パターン管理 | Timekeeper',
  description: '生活習慣パターンの管理',
};

export default function PatternsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">パターン管理</h1>
      <PatternList />
    </div>
  );
}
```

### レイアウトコンポーネント

```typescript
// src/app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Timekeeper',
  description: '生活習慣とスケジュールを管理',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
```

### Server Component と Client Component

```typescript
// Server Component（デフォルト）
// src/app/patterns/page.tsx

import { getPatterns } from '@/lib/data/patterns';

export default async function PatternsPage() {
  // サーバーサイドでデータ取得
  const patterns = await getPatterns();

  return <PatternList patterns={patterns} />;
}

// Client Component
// src/components/patterns/PatternList.tsx

'use client';

import { useState } from 'react';

export function PatternList({ patterns }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // クライアントサイドのインタラクション
  return (
    <div>
      {patterns.map((pattern) => (
        <div key={pattern.id} onClick={() => setSelectedId(pattern.id)}>
          {pattern.name}
        </div>
      ))}
    </div>
  );
}
```

---

## ユーティリティ関数

### UUID生成

```typescript
import { v4 as uuidv4 } from 'uuid';

export function generateId(): string {
  return uuidv4();
}
```

### cn（classname merge）

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 使用例
<div className={cn('px-2 py-1', isActive && 'bg-blue-500')} />
```

### エラーハンドリング

```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return '不明なエラーが発生しました';
}
```

---

## 参考リンク

各スニペットの詳細は [LIBRARY_REFERENCES.md](./LIBRARY_REFERENCES.md) を参照してください。
