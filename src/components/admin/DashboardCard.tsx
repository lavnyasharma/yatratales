'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  count: number | string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function DashboardCard({
  title,
  count,
  description,
  icon,
  className,
  trend,
}: DashboardCardProps) {
  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50",
      className
    )}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300">
              {icon}
            </div>
            <div className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            trend.isPositive 
              ? "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20" 
              : "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20"
          )}>
            <span>{trend.isPositive ? '↗' : '↘'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="px-6 pb-6 space-y-2">
        <div className="space-y-1">
          <div className="text-3xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
            {count}
          </div>
          <p className="text-sm font-medium text-foreground/80">{title}</p>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );
}