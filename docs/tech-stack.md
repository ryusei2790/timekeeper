# 技術スタック

## フロントエンド

### フレームワーク
- **Next.js 14+** (App Router)
  - React 18+
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

### データ保存（MVP）
- **LocalStorage**
  - ブラウザ内保存
  - 5-10MBの容量制限
  - JSON形式でシリアライズ

### 将来の拡張（v2以降）
- **Supabase**
  - PostgreSQLデータベース
  - リアルタイム同期
  - 認証機能
  - ストレージ

## 外部API連携

### Apple Calendar連携
- **CalDAV API**
  - iCloud CalDAVエンドポイント
  - OAuth認証
  - イベントのCRUD操作

**ライブラリ候補**:
- `tsdav` - TypeScript CalDAVクライアント
- 自前実装（axios + XMLパース）

### 将来の拡張
- **Google Calendar API**
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
- **npm** または **pnpm**（推奨）
  - pnpmの方が高速・省ストレージ

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

### テスト（将来対応）
- **Jest**
- **React Testing Library**
- **Playwright**（E2Eテスト）

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
  "next": "^14.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.0.0",
  "zustand": "^4.4.0",
  "react-hook-form": "^7.48.0",
  "zod": "^3.22.0",
  "date-fns": "^3.0.0",
  "tsdav": "^2.0.0",
  "lucide-react": "^0.300.0",
  "@radix-ui/react-*": "latest",
  "tailwindcss": "^3.4.0",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.2.0"
}
```

### 開発依存
```json
{
  "@types/node": "^20.0.0",
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
  "eslint": "^8.0.0",
  "eslint-config-next": "^14.0.0",
  "prettier": "^3.0.0",
  "prettier-plugin-tailwindcss": "^0.5.0",
  "husky": "^8.0.0",
  "lint-staged": "^15.0.0"
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
- Node.js 18+ (LTS推奨)
- npm 9+ または pnpm 8+
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
```

## 今後の技術的検討事項

### v2以降で検討
- PWA対応（オフライン動作強化）
- Webプッシュ通知
- Service Worker活用
- IndexedDB移行（LocalStorageの容量制限対策）
- GraphQL（Supabase連携時）
- E2Eテストの導入
- Storybook導入（コンポーネントカタログ）

### パフォーマンスモニタリング
- Vercel Analytics
- Web Vitals計測
- エラートラッキング（Sentry等）
