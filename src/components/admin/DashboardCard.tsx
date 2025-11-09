'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  count: number | string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

export default function DashboardCard({
  title,
  count,
  description,
  icon,
  className,
}: DashboardCardProps) {
  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-5 pt-5">
        <div className="bg-primary/10 p-3 rounded-lg">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="text-2xl font-bold">{count}</div>
        <p className="text-sm text-muted-foreground mt-1">{title}</p>
        <p className="text-xs text-muted-foreground/70 mt-2">{description}</p>
      </CardContent>
    </Card>
  );
}