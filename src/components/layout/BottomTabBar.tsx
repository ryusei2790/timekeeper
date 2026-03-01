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
 * モバイル用ボトムタブバー（md未満で表示）
 */
export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="bg-card safe-area-pb fixed inset-x-0 bottom-0 z-10 border-t md:hidden">
      <div className="flex">
        {NAV_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.icon as keyof typeof ICON_MAP];
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
