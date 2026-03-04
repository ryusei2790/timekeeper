# 技術スタック

## フロントエンド

### フレームワーク
- **Next.js 16+** (App Router)
  - React 19+
  - TypeScript 5+
  - サーバーコンポーネントとクライアントコンポーネントの使い分け

### スタイリング
- **TailwindCSS 3+**
  - ユーティリティファーストCSS
  - レスポンシブデザイン
  - カスタムテーマ設定

- **shadcn/ui**
  - Radix UIベースのコンポーネントライブラリ
  - 高いカスタマイズ性
  - アクセシビリティ対応

### 状態管理
- **Zustand** (推奨)
  - シンプルで軽量な状態管理
  - TypeScript完全サポート
  - DevTools対応

**代替案**: React Context API（シンプルなケースのみ）

### フォームバリデーション
- **React Hook Form**
  - パフォーマンス最適化
  - Zodとの連携

- **Zod**
  - TypeScript-firstバリデーション
  - スキーマ定義による型安全性

### 日付・時刻処理
- **date-fns**
  - 軽量で使いやすい
  - イミュータブル
  - TypeScript対応

### アイコン
- **Lucide React**
  - shadcn/uiとの相性が良い
  - モダンなアイコンセット

## バックエンド

### データ保存（MVP → v1.5移行中）
- **LocalStorage**（MVP：現在の実装）
  - ブラウザ内保存
  - 5-10MBの容量制限
  - JSON形式でシリアライズ

- **PGlite（`@electric-sql/pglite`）**（v1.5：移行予定）
  - ブラウザ内でWASM版PostgreSQLを動作
  - IndexedDBによる永続化（容量制限なし）
  - SQLクエリ対応（Drizzle ORM経由）
  - サーバー不要・完全プライベート・オフライン動作
  - デバイス間同期は不可（個人端末での利用が前提）

### 将来の拡張（v2以降）
- **Supabase**
  - PostgreSQLデータベース
  - リアルタイム同期
  - 認証機能
  - ストレージ

## 外部API連携

### カレンダーデータ取り込み（MVP ✅）
- **.ics（iCalendar RFC 5545）ファイルのブラウザ内パース**
  - FileReader API でファイル読み込み
  - 自前パーサー（`src/lib/calendar/ics.ts`）
  - ライブラリ不使用（tsdav は削除済み）
  - 対応アプリ：TimeTree、Google Calendar、Apple Calendar など

### Google Calendar API 連携（将来：v2）
- **Google Calendar REST API v3**
  - 認証：OAuth 2.0 Authorization Code Flow
  - スコープ：`https://www.googleapis.com/auth/calendar.readonly`
  - 主要エンドポイント：`GET /calendar/v3/calendars/primary/events`
  - 差分同期：`syncToken` パラメータ（初回全件取得→以降差分のみ）
- **実装方針（v2）**：
  - OAuth フロー：Next.js Route Handler（`/api/google/auth`, `/api/google/callback`）で処理
  - Client ID / Secret：Vercel 環境変数（`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`）
  - アクセストークン：LocalStorage → v2 では Supabase セッション管理に移行

### 将来の拡張
- **Google Maps API**（移動時間計算）

## デプロイ・インフラ

### ホスティング
- **Vercel**
  - Next.jsとの完全な統合
  - 自動デプロイ（Git連携）
  - エッジファンクション対応
  - 無料枠で十分

### ドメイン
- Vercel提供のサブドメイン（MVP）
- カスタムドメイン（将来）

### CI/CD
- **Vercel自動デプロイ**
  - mainブランチプッシュで本番デプロイ
  - プレビューデプロイ（PR単位）

### 環境変数管理
- `.env.local` (開発環境)
- Vercel環境変数設定（本番環境）

## 開発ツール

### パッケージマネージャー
- **pnpm**
  - npmより高速・省ストレージ

### コード品質
- **ESLint**
  - Next.js推奨設定
  - TypeScript対応
  - Prettier連携

- **Prettier**
  - コードフォーマット自動化
  - TailwindCSS class整列プラグイン

### 型チェック
- **TypeScript**
  - strictモード有効
  - 型定義ファイルの管理

### Git Hooks
- **Husky**
  - pre-commitフック（lint、format）
  - commit-msgフック（コミットメッセージ検証）

- **lint-staged**
  - ステージングファイルのみlint

### テスト
- **Vitest** ✅ 導入済み
  - 43件のユニットテスト PASS
  - `src/test/` 配下（factories.ts + 各テストファイル）
- **React Testing Library**（将来対応）
- **Playwright**（E2Eテスト、将来対応）

## プロジェクト構成

```
timekeeper/
├── public/              # 静的ファイル
├── src/
│   ├── app/            # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx   # ホーム画面
│   │   ├── patterns/  # パターン管理画面
│   │   ├── places/    # 場所・移動時間設定画面
│   │   ├── calendar/  # カレンダー連携画面
│   │   └── settings/  # 設定画面
│   ├── components/     # UIコンポーネント
│   │   ├── ui/        # shadcn/uiコンポーネント
│   │   ├── timeline/  # タイムライン表示
│   │   ├── forms/     # フォームコンポーネント
│   │   └── common/    # 共通コンポーネント
│   ├── lib/           # ユーティリティ・ヘルパー
│   │   ├── storage/   # LocalStorage操作
│   │   ├── calendar/  # CalDAV連携
│   │   ├── scheduler/ # スケジュール生成ロジック
│   │   └── utils/     # 汎用ユーティリティ
│   ├── hooks/         # カスタムフック
│   ├── store/         # Zustand store
│   ├── types/         # TypeScript型定義
│   └── constants/     # 定数定義
├── .env.local         # 環境変数（開発）
├── .eslintrc.json     # ESLint設定
├── .prettierrc        # Prettier設定
├── tailwind.config.ts # TailwindCSS設定
├── tsconfig.json      # TypeScript設定
├── next.config.js     # Next.js設定
└── package.json
```

## 依存パッケージ（主要なもの）

### プロダクション依存
```json
{
  "next": "^16.1.6",
  "react": "^19.2.3",
  "react-dom": "^19.2.3",
  "typescript": "^5.0.0",
  "zustand": "^5.0.11",
  "react-hook-form": "^7.54.2",
  "zod": "^4.3.6",
  "date-fns": "^4.1.0",
  "lucide-react": "^0.475.0",
  "@radix-ui/react-*": "latest",
  "tailwindcss": "^4.0.0",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.6.0",
  "@electric-sql/pglite": "^0.2.x"
}
```

### 開発依存
```json
{
  "@types/node": "^20.0.0",
  "@types/react": "^19.0.0",
  "@types/react-dom": "^19.0.0",
  "eslint": "^9.0.0",
  "eslint-config-next": "^16.1.6",
  "prettier": "^3.0.0",
  "prettier-plugin-tailwindcss": "^0.6.0",
  "husky": "^9.0.0",
  "lint-staged": "^15.0.0",
  "vitest": "^3.0.0",
  "@vitest/coverage-v8": "^3.0.0"
}
```

## セキュリティ対策

### 認証情報の管理
- 環境変数での管理（.env.local、Vercel環境変数）
- Git管理対象外（.gitignoreに追加）
- クライアントサイドでの露出防止

### XSS対策
- Reactの自動エスケープに依存
- dangerouslySetInnerHTMLの使用禁止
- ユーザー入力のサニタイゼーション

### CSRF対策
- Next.jsのビルトイン保護機能
- 外部APIアクセス時のトークン検証

### データバリデーション
- Zodによる厳格なバリデーション
- クライアント・サーバー両方で実施

## パフォーマンス最適化

### Next.js最適化
- サーバーコンポーネントの活用
- 画像最適化（next/image）
- フォント最適化（next/font）
- 動的インポート（コード分割）

### バンドルサイズ最適化
- Tree shaking
- 不要なライブラリの除外
- バンドル分析（@next/bundle-analyzer）

### レンダリング最適化
- React.memoの活用
- useMemo、useCallbackの適切な使用
- 仮想化（長いリスト表示時）

## ブラウザサポート

### 対象ブラウザ
- Chrome 90+
- Safari 14+
- Firefox 90+
- Edge 90+

### モバイル対応
- iOS Safari 14+
- Android Chrome 90+

### レスポンシブブレークポイント
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

## 開発環境セットアップ

### 前提条件
- Node.js 20+ (LTS推奨)
- pnpm 9+
- Git

### セットアップ手順
```bash
# リポジトリクローン
git clone <repository-url>
cd timekeeper

# 依存関係インストール
pnpm install

# 環境変数設定
cp .env.example .env.local
# .env.localを編集

# 開発サーバー起動
pnpm dev

# ブラウザで開く
# http://localhost:3000
```

### 便利なコマンド
```bash
# 開発サーバー
pnpm dev

# ビルド
pnpm build

# 本番サーバー起動（ローカル）
pnpm start

# Lint
pnpm lint

# Format
pnpm format

# 型チェック
pnpm type-check

# テスト実行
pnpm test
```

## 今後の技術的検討事項

### v1.5で実施予定
- **PGlite移行**：LocalStorage → IndexedDB上のPostgreSQL（`@electric-sql/pglite`）
  - BaseStorage クラスを廃止し、PGlite + Drizzle ORM に置き換え
  - 全7サービス（locations, routineItems, patterns, travelRoutes, calendarEvents, dailyState, settings）を非同期SQL操作に移行
  - Zustand store は非同期対応（`loadXxx` を async 化）

### v2以降で検討
- PWA対応（オフライン動作強化）
- Webプッシュ通知
- Service Worker活用
- GraphQL（Supabase連携時）
- E2Eテストの導入
- Storybook導入（コンポーネントカタログ）

### パフォーマンスモニタリング
- Vercel Analytics
- Web Vitals計測
- エラートラッキング（Sentry等）
