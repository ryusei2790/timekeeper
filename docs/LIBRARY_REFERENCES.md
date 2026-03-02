# ライブラリリファレンス

開発で使用する主要ライブラリの公式ドキュメントと重要なリンク集

---

## Core Framework

### Next.js 14
- **公式ドキュメント**: https://nextjs.org/docs
- **App Router**: https://nextjs.org/docs/app
- **API Reference**: https://nextjs.org/docs/app/api-reference

**重要なセクション**:
- [Routing](https://nextjs.org/docs/app/building-your-application/routing)
- [Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [Metadata](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)

**よく使う機能**:
```typescript
// layout.tsx
export const metadata: Metadata = { ... }

// page.tsx
export default function Page() { ... }

// Client Component
'use client'

// Server Actions
'use server'
```

### React 18
- **公式ドキュメント**: https://react.dev
- **Hooks Reference**: https://react.dev/reference/react

**重要なセクション**:
- [useState](https://react.dev/reference/react/useState)
- [useEffect](https://react.dev/reference/react/useEffect)
- [useMemo](https://react.dev/reference/react/useMemo)
- [useCallback](https://react.dev/reference/react/useCallback)
- [Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)

### TypeScript
- **公式ドキュメント**: https://www.typescriptlang.org/docs/
- **Handbook**: https://www.typescriptlang.org/docs/handbook/intro.html

**重要なセクション**:
- [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

---

## UI & Styling

### TailwindCSS
- **公式ドキュメント**: https://tailwindcss.com/docs
- **Core Concepts**: https://tailwindcss.com/docs/utility-first

**重要なセクション**:
- [Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [Customization](https://tailwindcss.com/docs/configuration)
- [Functions & Directives](https://tailwindcss.com/docs/functions-and-directives)

**よく使うクラス**:
```typescript
// レイアウト
'flex items-center justify-between'
'grid grid-cols-3 gap-4'

// レスポンシブ
'sm:w-full md:w-1/2 lg:w-1/3'

// 状態
'hover:bg-blue-500 focus:ring-2'
```

### shadcn/ui
- **公式ドキュメント**: https://ui.shadcn.com
- **Components**: https://ui.shadcn.com/docs/components

**重要なコンポーネント**:
- [Button](https://ui.shadcn.com/docs/components/button)
- [Dialog](https://ui.shadcn.com/docs/components/dialog)
- [Form](https://ui.shadcn.com/docs/components/form)
- [Select](https://ui.shadcn.com/docs/components/select)
- [Tabs](https://ui.shadcn.com/docs/components/tabs)
- [Card](https://ui.shadcn.com/docs/components/card)
- [Toast](https://ui.shadcn.com/docs/components/toast)

**インストールコマンド**:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
```

### Lucide React (Icons)
- **公式サイト**: https://lucide.dev
- **Icon Search**: https://lucide.dev/icons/

**使い方**:
```typescript
import { Calendar, Home, Settings } from 'lucide-react'

<Calendar className="w-4 h-4" />
```

---

## State Management

### Zustand
- **公式ドキュメント**: https://docs.pmnd.rs/zustand/getting-started/introduction
- **GitHub**: https://github.com/pmndrs/zustand

**重要なセクション**:
- [Getting Started](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [TypeScript Guide](https://docs.pmnd.rs/zustand/guides/typescript)
- [Persisting Store](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)

**基本的な使い方**:
```typescript
import { create } from 'zustand'

interface BearStore {
  bears: number
  increase: () => void
}

const useBearStore = create<BearStore>((set) => ({
  bears: 0,
  increase: () => set((state) => ({ bears: state.bears + 1 })),
}))

// Component
const bears = useBearStore((state) => state.bears)
```

---

## Forms & Validation

### React Hook Form
- **公式ドキュメント**: https://react-hook-form.com
- **API**: https://react-hook-form.com/docs

**重要なセクション**:
- [useForm](https://react-hook-form.com/docs/useform)
- [Controller](https://react-hook-form.com/docs/usecontroller/controller)
- [Validation](https://react-hook-form.com/docs/useform/register#options)
- [TypeScript](https://react-hook-form.com/ts)

**基本的な使い方**:
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { ... }
})

<form onSubmit={form.handleSubmit(onSubmit)}>
  <input {...form.register('name')} />
</form>
```

### Zod
- **公式ドキュメント**: https://zod.dev
- **GitHub**: https://github.com/colinhacks/zod

**重要なセクション**:
- [Basic Usage](https://zod.dev/#basic-usage)
- [Primitives](https://zod.dev/#primitives)
- [Objects](https://zod.dev/#objects)
- [Arrays](https://zod.dev/#arrays)
- [Type Inference](https://zod.dev/#type-inference)

**基本的な使い方**:
```typescript
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1).max(50),
  email: z.string().email(),
  age: z.number().min(0).max(120),
})

type Schema = z.infer<typeof schema>
```

---

## Date & Time

### date-fns
- **公式ドキュメント**: https://date-fns.org/docs/Getting-Started
- **API Reference**: https://date-fns.org/docs/

**よく使う関数**:
- [format](https://date-fns.org/docs/format) - 日付フォーマット
- [parse](https://date-fns.org/docs/parse) - 文字列をパース
- [addMinutes](https://date-fns.org/docs/addMinutes) - 分を追加
- [differenceInMinutes](https://date-fns.org/docs/differenceInMinutes) - 差分計算
- [isToday](https://date-fns.org/docs/isToday) - 今日かどうか
- [isSameDay](https://date-fns.org/docs/isSameDay) - 同じ日かどうか

**基本的な使い方**:
```typescript
import { format, addMinutes, parse } from 'date-fns'
import { ja } from 'date-fns/locale'

format(new Date(), 'yyyy-MM-dd', { locale: ja })
addMinutes(new Date(), 30)
parse('14:30', 'HH:mm', new Date())
```

---

## Calendar Integration

### .ics ファイルパーサー（MVP ✅）
- **RFC 5545（iCalendar）仕様**: https://datatracker.ietf.org/doc/html/rfc5545
- **実装ファイル**: `src/lib/calendar/ics.ts`

**自前パーサーの仕様**:
```typescript
// .ics テキストを CalendarEvent[] に変換
export function parseIcsText(text: string): CalendarEvent[]

// 対応フィールド: UID, SUMMARY, DTSTART, DTEND, LOCATION, DESCRIPTION
// 日時形式: UTC (Z suffix) / ローカル / 終日 (VALUE=DATE)
// calendarId: 'ics-import' 固定
```

**対応カレンダーアプリ**:
- TimeTree（.ics エクスポート）
- Google Calendar（設定 → カレンダーをエクスポート）
- Apple Calendar（ファイル → 書き出し）

---

### Google Calendar API（将来：v2）
- **公式ドキュメント**: https://developers.google.com/calendar/api/guides/overview
- **Events リソース**: https://developers.google.com/calendar/api/v3/reference/events
- **OAuth 2.0**: https://developers.google.com/identity/protocols/oauth2/web-server

**主要パラメータ（events.list）**:

| パラメータ | 説明 |
|---|---|
| `calendarId` | `primary` でプライマリカレンダー |
| `timeMin` / `timeMax` | RFC3339 形式で取得範囲を指定 |
| `singleEvents` | `true` で定期イベントを展開 |
| `syncToken` | 差分同期用トークン（前回レスポンスから取得） |
| `maxResults` | 最大 2500 件 |

**型マッピング（Google Event → CalendarEvent）**:

| Google API フィールド | CalendarEvent フィールド |
|---|---|
| `id` | `id` |
| `summary` | `title` |
| `start.dateTime` または `start.date` | `startTime`（ISO 8601） |
| `end.dateTime` または `end.date` | `endTime`（ISO 8601） |
| `location` | `locationName` |
| `description` | `description` |
| `start.date` のみ存在（dateTime なし） | `isAllDay: true` |
| 固定値 `'google-calendar'` | `calendarId` |

**OAuth 2.0 フロー（Next.js Route Handler）**:
```typescript
// /api/google/auth/route.ts
// → GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET を環境変数から取得
// → https://accounts.google.com/o/oauth2/v2/auth へリダイレクト

// /api/google/callback/route.ts
// → 認可コードを受け取り https://oauth2.googleapis.com/token でトークン交換
// → アクセストークン・リフレッシュトークン・syncToken を LocalStorage に保存
```

**セキュリティ注意事項**:
- `GOOGLE_CLIENT_SECRET` はサーバーサイド（Route Handler）でのみ使用
- アクセストークン有効期限は 1 時間。リフレッシュトークンで更新が必要
- 本番環境では HTTPS 必須（OAuth リダイレクト URI の制約）

---

## Utility Libraries

### clsx & tailwind-merge
- **clsx**: https://github.com/lukeed/clsx
- **tailwind-merge**: https://github.com/dcastil/tailwind-merge

**使い方**:
```typescript
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 使用例
cn('px-2 py-1', isActive && 'bg-blue-500')
```

### class-variance-authority (cva)
- **GitHub**: https://github.com/joe-bell/cva

**使い方**:
```typescript
import { cva } from 'class-variance-authority'

const button = cva('button', {
  variants: {
    intent: {
      primary: 'bg-blue-500',
      secondary: 'bg-gray-500',
    },
    size: {
      sm: 'text-sm',
      md: 'text-base',
    },
  },
})
```

---

## Development Tools

### ESLint
- **公式ドキュメント**: https://eslint.org/docs/latest/
- **Next.js Config**: https://nextjs.org/docs/app/building-your-application/configuring/eslint

### Prettier
- **公式ドキュメント**: https://prettier.io/docs/en/
- **Tailwind Plugin**: https://github.com/tailwindlabs/prettier-plugin-tailwindcss

---

## Deployment

### Vercel
- **公式ドキュメント**: https://vercel.com/docs
- **Next.js on Vercel**: https://vercel.com/docs/frameworks/nextjs

**重要なセクション**:
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Deployment](https://vercel.com/docs/deployments/overview)
- [Custom Domains](https://vercel.com/docs/custom-domains)

---

## 追加リソース

### デザイン参考
- **Tailwind UI**: https://tailwindui.com/components
- **shadcn/ui Themes**: https://ui.shadcn.com/themes
- **Radix UI**: https://www.radix-ui.com/primitives/docs/overview/introduction

### 学習リソース
- **React Patterns**: https://www.patterns.dev/react
- **TypeScript Cheatsheet**: https://www.typescriptlang.org/cheatsheets
- **Next.js Learn**: https://nextjs.org/learn

### コミュニティ
- **Next.js Discord**: https://discord.gg/nextjs
- **React Discord**: https://discord.gg/react
- **Tailwind Discord**: https://discord.gg/tailwindcss

---

## クイックリファレンス

### よく使うコマンド

```bash
# 開発サーバー起動
pnpm dev

# ビルド
pnpm build

# 本番サーバー起動
pnpm start

# Lint
pnpm lint

# Format
pnpm format

# shadcn/ui コンポーネント追加
npx shadcn-ui@latest add [component-name]

# 型チェック
pnpm type-check
```

### よく使うショートカット

**VS Code**:
- `Cmd/Ctrl + Shift + P` - Command Palette
- `Cmd/Ctrl + P` - ファイル検索
- `F12` - 定義へ移動
- `Shift + F12` - 参照を検索
- `Cmd/Ctrl + .` - Quick Fix

---

## トラブルシューティング

### よくあるエラーと解決方法

#### TypeScript エラー
```bash
# 型定義の再生成
pnpm dlx @types/node

# キャッシュクリア
rm -rf .next
pnpm dev
```

#### TailwindCSS が反映されない
```bash
# Tailwind設定確認
# tailwind.config.ts の content パスを確認

# 開発サーバー再起動
pnpm dev
```

#### shadcn/ui コンポーネントが見つからない
```bash
# components.json 確認
# コンポーネント再インストール
npx shadcn-ui@latest add [component-name]
```

---

## バージョン情報

このプロジェクトで使用する推奨バージョン:

```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.4.0",
  "zustand": "^4.4.0",
  "react-hook-form": "^7.48.0",
  "zod": "^3.22.0",
  "date-fns": "^3.0.0"
}
```

最新バージョンは各ライブラリの公式サイトで確認してください。

---

## 更新履歴

- 2026-03-02: tsdav 削除、.ics パーサー追加、Google Calendar API（将来 v2）セクション追加
- 2026-03-01: 初版作成
