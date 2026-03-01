'use client';

import { NAV_ITEMS } from '@/constants';
import { cn } from '@/lib/utils';
import { Calendar, CalendarDays, Home, MapPin, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ICON_MAP = {
  Home,
  Calendar,
  MapPin,
  CalendarDays,
  Settings,
} as const;

/**
 * デスクトップ用サイドバーナビゲーション（md以上で表示）
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-card fixed inset-y-0 z-10 hidden flex-col border-r md:flex md:w-16 lg:w-56">
      {/* アプリ名 */}
      <div className="flex h-14 items-center border-b px-4">
        <span className="hidden text-lg font-bold lg:block">TimeKeeper</span>
        <span className="text-sm font-bold lg:hidden">TK</span>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {NAV_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.icon as keyof typeof ICON_MAP];
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="hidden lg:block">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
