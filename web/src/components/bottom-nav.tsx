'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { getNavItems } from '@/lib/nav-items';

interface BottomNavProps {
  admin: boolean;
  masterAdmin: boolean;
}

export function BottomNav({ admin, masterAdmin }: BottomNavProps) {
  const pathname = usePathname();
  const items = getNavItems(admin, masterAdmin);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t bg-card/95 backdrop-blur-sm md:hidden">
      <div className="flex items-stretch justify-around">
        {items.map(({ href, label, icon: Icon }) => {
          const ativo = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors',
                ativo ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
