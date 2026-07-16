'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { getNavItems } from '@/lib/nav-items';

interface NavLinksProps {
  admin: boolean;
  masterAdmin: boolean;
}

export function NavLinks({ admin, masterAdmin }: NavLinksProps) {
  const pathname = usePathname();
  const items = getNavItems(admin, masterAdmin);

  return (
    <nav className="hidden items-center gap-1 text-sm md:flex">
      {items.map(({ href, label, icon: Icon }) => {
        const ativo = href === '/' ? pathname === '/' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors',
              ativo
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
