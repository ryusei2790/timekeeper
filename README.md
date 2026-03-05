# TimeKeeper

> 生活習慣パターンとカレンダーを統合し、移動時間を考慮した最適な日次スケジュールを自動生成する Web アプリ

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![PGlite](https://img.shields.io/badge/PGlite-0.3-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 概要

TimeKeeper は、毎日の生活習慣（ルーティン）をパターンとして登録し、Apple Calendar などの .ics ファイルと組み合わせることで、**移動時間込みの現実的な日次スケジュール**を自動生成します。

- カレンダーと習慣の両方を一元管理
- 場所間の移動時間をスケジュールに挿入
- 遅延が発生した場合も、後続の予定を自動で調整
- すべてのデータはブラウザ内に保存（サーバー不要・オフライン動作）

---

## スクリーンショット

> スクリーンショットは [`docs/images/`](docs/images/) フォルダに配置し、以下の形式で参照できます。

<!-- 画像が揃ったら以下のコメントを解除してください -->
<!--
| ホーム画面 | パターン管理 |
|---|---|
| ![ホーム](docs/images/home.png) | ![パターン管理](docs/images/patterns.png) |

| 場所・移動 | カレンダー連携 |
|---|---|
| ![場所](docs/images/places.png) | ![カレンダー](docs/images/calendar.png) |
-->

---

## 機能

### 実装済み

| 機能                         | 説明                                                               |
| ---------------------------- | ------------------------------------------------------------------ |
| **生活習慣パターン管理**     | 複数パターンを登録し、曜日・キーワードによる自動選択               |
| **場所・移動ルート管理**     | 場所を登録し、徒歩/車/電車などの移動時間を設定                     |
| **カレンダー連携**           | `.ics` ファイルのインポートと差分同期                              |
| **スケジュール自動生成**     | ルーティン + カレンダー + 移動時間を統合して日次スケジュールを生成 |
| **リアルタイムタイムライン** | 現在のイベント・次のイベントをリアルタイム表示                     |
| **イベント操作**             | 完了・スキップ操作と遅延検出による後続スケジュールの自動調整       |
| **オフライン永続化**         | PGlite（ブラウザ内 PostgreSQL）による IndexedDB 保存               |
| **レスポンシブ UI**          | モバイル: ボトムタブバー、デスクトップ: サイドバー                 |

### 今後の予定

- Google Calendar OAuth によるリアルタイム同期
- Supabase + パスフレーズ方式によるクロスデバイス同期
- PWA 対応・プッシュ通知
- ダークモード

---

## 技術スタック

| カテゴリ           | 技術                                       |
| ------------------ | ------------------------------------------ |
| **フレームワーク** | Next.js 16 (App Router), React 19          |
| **言語**           | TypeScript 5                               |
| **スタイリング**   | TailwindCSS v4, shadcn/ui (Radix UI)       |
| **状態管理**       | Zustand 5                                  |
| **フォーム**       | React Hook Form + Zod v4                   |
| **データベース**   | PGlite v0.3.15 (IndexedDB 上の PostgreSQL) |
| **日付処理**       | date-fns v4                                |
| **アイコン**       | Lucide React                               |
| **テスト**         | Vitest + Testing Library                   |
| **開発ツール**     | ESLint, Prettier, Husky                    |
| **デプロイ**       | Vercel（予定）                             |

---

## アーキテクチャ

```
┌─────────────────────────────────────────────────────┐
│                   UI 層 (React)                      │
│  App Router ページ / Timeline / Forms / AppShell    │
└──────────────────────────┬──────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────┐
│             Zustand ストア (非同期)                   │
│  usePatternStore / useLocationStore / ...           │
└──────────────────────────┬──────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────┐
│                 コアロジック層                        │
│  lib/scheduler/   ← スケジュール生成・遅延調整        │
│  lib/calendar/    ← .ics パース・同期                │
└──────────────────────────┬──────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────┐
│              データアクセス層 (サービス)               │
│  lib/data/*.ts  ← 非同期 SQL CRUD                   │
└──────────────────────────┬──────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────┐
│           データベース層 (PGlite + IndexedDB)         │
│  lib/db/index.ts (getDb) / schema.ts / migrate.ts  │
└─────────────────────────────────────────────────────┘
```

### スケジュール生成アルゴリズム

1. 選択中のパターンからルーティンをスケジュール項目に変換
2. カレンダーイベント（当日分）を変換
3. 時刻順にマージ・ソート（固定イベント優先）
4. 重複を解決（フレキシブルな項目を後ろにシフト）
5. 場所が変わる箇所に移動イベントを自動挿入

---

## 画面構成

| 画面             | URL         | 説明                                           |
| ---------------- | ----------- | ---------------------------------------------- |
| **ホーム**       | `/`         | 今日のスケジュール・タイムライン・イベント操作 |
| **パターン管理** | `/patterns` | 生活習慣パターンとルーティン項目の CRUD        |
| **場所・移動**   | `/places`   | 場所と移動ルートの CRUD                        |
| **カレンダー**   | `/calendar` | .ics ファイルのインポートと同期状態            |
| **設定**         | `/settings` | 一般設定・データのエクスポート/インポート/削除 |

---

## データモデル

| エンティティ    | 説明                                                                       |
| --------------- | -------------------------------------------------------------------------- |
| `Location`      | 場所マスタ（エイリアス含む）                                               |
| `RoutineItem`   | 習慣項目（名前・所要時間・場所・柔軟性）                                   |
| `LifePattern`   | 習慣パターン（複数 RoutineItem + 自動選択ルール）                          |
| `TravelRoute`   | 場所間の移動ルート（手段・所要時間）                                       |
| `CalendarEvent` | .ics からインポートしたカレンダーイベント                                  |
| `DailyState`    | 当日の状態（アクティブイベント・完了済み・遅延記録・生成済みスケジュール） |
| `Settings`      | アプリ設定（デフォルト場所・時刻形式・テーマ等）                           |

型定義はすべて [`src/types/index.ts`](src/types/index.ts) に集約しています。

---

## セットアップ

### 必要環境

- Node.js 20 以上
- pnpm 9 以上

### インストールと起動

```bash
# リポジトリのクローン
git clone <repository-url>
cd timekeeper

# 依存関係のインストール
pnpm install

# 開発サーバー起動
pnpm dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

初回起動時に PGlite（IndexedDB）のデータベースが自動的に初期化されます。

> **注意:** PGlite はブラウザ専用のため、SSR（サーバーサイドレンダリング）では動作しません。データはブラウザの IndexedDB に保存されます。

---

## 開発コマンド

```bash
pnpm dev          # 開発サーバー起動 (http://localhost:3000)
pnpm build        # プロダクションビルド
pnpm lint         # ESLint 実行
pnpm format       # Prettier フォーマット
pnpm type-check   # TypeScript 型チェック
pnpm test         # Vitest テスト実行
pnpm test:watch   # テストをウォッチモードで実行
pnpm test:ui      # Vitest UI を開く
```

shadcn/ui コンポーネントの追加:

```bash
pnpm dlx shadcn@latest add <component-name>
```

---

## プロジェクト構造

```
src/
├── app/                    # Next.js App Router ページ
│   ├── layout.tsx          # ルートレイアウト（DB初期化・AppShell）
│   ├── page.tsx            # ホーム（タイムライン）
│   ├── patterns/page.tsx   # パターン管理
│   ├── places/page.tsx     # 場所・移動ルート
│   ├── calendar/page.tsx   # カレンダー連携
│   └── settings/page.tsx   # 設定
├── components/
│   ├── ui/                 # shadcn/ui コンポーネント
│   ├── layout/             # AppShell / Sidebar / BottomTabBar
│   ├── forms/              # データ入力ダイアログ（各エンティティ）
│   ├── timeline/           # タイムライン表示コンポーネント
│   └── common/             # DbInitializer など共通コンポーネント
├── lib/
│   ├── db/                 # PGlite 初期化・スキーマ・マイグレーション
│   ├── data/               # 7 CRUD サービス（非同期 SQL）
│   ├── scheduler/          # スケジュール生成・遅延調整ロジック
│   ├── calendar/           # .ics パース・同期ロジック
│   ├── validations/        # Zod スキーマ
│   └── utils/              # 汎用ユーティリティ（id, time, date）
├── store/                  # 7 Zustand ストア（エンティティ別）
├── types/index.ts          # 全エンティティの TypeScript 型定義
└── constants/              # 定数（色・ナビ・デフォルト設定）

docs/                       # 設計ドキュメント
├── requirements.md         # 要件定義
├── tech-stack.md           # 技術選定
├── data-model.md           # データモデル詳細
├── ui-design.md            # UI/UX 設計
└── implementation-plan.md  # 実装フェーズ計画
```

---

## ロードマップ

| フェーズ  | 内容                                          | 状態    |
| --------- | --------------------------------------------- | ------- |
| Phase 0   | プロジェクトセットアップ                      | ✅ 完了 |
| Phase 1   | データ層（型定義・CRUD・Zustand）             | ✅ 完了 |
| Phase 1.5 | PGlite 移行（LocalStorage → IndexedDB）       | ✅ 完了 |
| Phase 2   | コアロジック（スケジューラ・カレンダー）      | ✅ 完了 |
| Phase 3   | 基本 UI（パターン・場所・設定画面）           | ✅ 完了 |
| Phase 4   | ホーム画面・リアルタイムタイムライン          | ✅ 完了 |
| Phase 5a  | カレンダー連携（.ics インポート）             | ✅ 完了 |
| Phase 5b  | Google Calendar OAuth リアルタイム同期        | ⬜ 予定 |
| Phase 6   | Supabase クロスデバイス同期 + Vercel デプロイ | ⬜ 予定 |

---

## ライセンス

MIT
