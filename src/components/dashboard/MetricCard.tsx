import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: ReactNode;
  variant?: 'default' | 'inflow' | 'outflow' | 'warning';
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  variant = 'default',
}: MetricCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div className="metric-card fade-in">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p
            className={cn(
              'text-3xl font-semibold number-mono',
              variant === 'inflow' && 'text-success',
              variant === 'outflow' && 'text-destructive',
              variant === 'warning' && 'text-warning'
            )}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="p-3 rounded-xl bg-accent/50">{icon}</div>
        )}
      </div>
      {trend && trendValue && (
        <div className="mt-4 flex items-center gap-2">
          <div
            className={cn(
              'flex items-center gap-1 text-sm',
              trend === 'up' && 'text-success',
              trend === 'down' && 'text-destructive',
              trend === 'neutral' && 'text-muted-foreground'
            )}
          >
            <TrendIcon className="w-4 h-4" />
            <span>{trendValue}</span>
          </div>
          <span className="text-xs text-muted-foreground">vs last period</span>
        </div>
      )}
    </div>
  );
}
