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

### データ保存（現在：PGlite 移行完了）
- **PGlite（`@electric-sql/pglite` v0.3.15）**（v1〜v1.4：現在の実装）
  - ブラウザ内でWASM版PostgreSQLを動作
  - IndexedDBによる永続化（容量制限なし）
  - SQLクエリ対応（生SQL + 型付きクエリ）
  - サーバー不要・完全プライベート・オフライン動作
  - LocalStorageからの自動マイグレーション対応（`src/lib/db/migrate.ts`）
  - **制約：デバイス間同期は不可**（IndexedDBは端末ローカル）

### クロスデバイス同期（Phase 6：実装中）
- **Supabase Auth（Magic Link）**
  - `@supabase/supabase-js@^2.98.0` + `@supabase/ssr@^0.9.0`（インストール済み）
  - メールアドレス入力 → Supabase がワンタイムリンクを送信 → クリックでセッション確立
  - Cookie によるセッション管理（`createBrowserClient` / `createServerClient`）
  - Row Level Security（RLS）: `auth.uid() = user_id` でデータ分離
  - 将来の Google/Apple/GitHub 認証はダッシュボードで ON にするだけ（コード変更不要）
- **データ同期戦略**（オフラインファースト維持）
  - 未ログイン: PGlite のみで全機能動作
  - ログイン中: PGlite + Supabase write-through（ベストエフォート）
  - ログイン時: ローカルにデータあれば `uploadAll`、なければ `downloadAll`
  - 衝突解決: Last-Write-Wins（`updated_at` ISO 8601 辞書順）
- **新規ファイル**: `src/lib/supabase/` / `src/lib/sync/` / `src/store/useAuthStore.ts`
- **環境変数**: `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`

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
│   │   ├── db/        # PGlite初期化・スキーマ・マイグレーション
│   │   ├── data/      # CRUDサービス層（async SQL）
│   │   ├── calendar/  # カレンダー連携（.icsパーサー等）
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
  "next": "16.1.6",
  "react": "19.2.3",
  "react-dom": "19.2.3",
  "typescript": "5",
  "zustand": "5.0.11",
  "react-hook-form": "7.71.2",
  "@hookform/resolvers": "5.2.2",
  "zod": "4.3.6",
  "date-fns": "4.1.0",
  "lucide-react": "0.575.0",
  "tailwindcss": "4",
  "@electric-sql/pglite": "0.3.15",
  "uuid": "13.0.0"
}
```

### 開発依存
```json
{
  "@types/node": "20",
  "@types/react": "19",
  "@types/react-dom": "19",
  "eslint": "9",
  "eslint-config-next": "16.1.6",
  "prettier": "3.8.1",
  "prettier-plugin-tailwindcss": "0.6.x",
  "husky": "9.1.7",
  "lint-staged": "16.3.0",
  "vitest": "4.0.18"
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

### Phase 6（実装中）
- **Supabase Auth（Magic Link）**：`login` ブランチで実装中
  - PGlite はそのまま維持（オフラインファースト）
  - ログイン時のみ Supabase にも write-through
  - 全7テーブルを Supabase Postgres に mirror（`user_id UUID` + RLS）
- **Vercelデプロイ**：Phase 6 として本番公開

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
