import { BottomTabBar } from './BottomTabBar';
import { Sidebar } from './Sidebar';

/**
 * アプリ全体のレイアウトシェル
 * Sidebar（デスクトップ）と BottomTabBar（モバイル）を提供する
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background min-h-screen">
      <Sidebar />

      {/* メインコンテンツ: サイドバー分のマージンを確保 */}
      <main className="pb-16 md:ml-16 md:pb-0 lg:ml-56">{children}</main>

      <BottomTabBar />
    </div>
  );
}
