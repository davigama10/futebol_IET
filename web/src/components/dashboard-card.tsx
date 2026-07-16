import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export function DashboardCard({ href, icon: Icon, title, description }: DashboardCardProps) {
  return (
    <Link href={href} className="group">
      <Card className="h-full gap-3 border-border/60 shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/50 group-hover:shadow-md">
        <CardHeader className="flex flex-row items-center gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5" />
          </span>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
