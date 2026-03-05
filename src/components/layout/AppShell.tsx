'use client';

import { usePathname } from 'next/navigation';
import { BottomTabBar } from './BottomTabBar';
import { Sidebar } from './Sidebar';

/**
 * アプリ全体のレイアウトシェル。
 * /login・/auth パスではナビゲーションを非表示にする。
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/auth');

  if (isAuthPage) {
    return <div className="bg-background min-h-screen">{children}</div>;
  }

  return (
    <div className="bg-background min-h-screen">
      <Sidebar />

      {/* メインコンテンツ: サイドバー分のマージンを確保 */}
      <main className="pb-16 md:ml-16 md:pb-0 lg:ml-56">{children}</main>

      <BottomTabBar />
    </div>
  );
}
