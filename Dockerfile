# =============================================================================
# Dockerfile — 開発環境用
# このプロジェクトはブラウザ内DB（PGlite）を使用するため、
# サーバーサイドのDBコンテナは不要。Next.js dev server のみを起動する。
# =============================================================================

FROM node:22-alpine

# pnpm を有効化（Node.js 22 に同梱の corepack 経由）
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 依存関係のキャッシュ効率化のため package.json / lockfile を先にコピー
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 依存関係インストール（node_modules はコンテナ内に保持）
RUN pnpm install --frozen-lockfile

# ソースコード全体をコピー（.dockerignore で不要ファイルを除外済み）
COPY . .

# Next.js dev server のポート
EXPOSE 3000

# 開発サーバー起動
# HOST=0.0.0.0 を指定してコンテナ外からアクセス可能にする
CMD ["pnpm", "dev", "--hostname", "0.0.0.0"]
