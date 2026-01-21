import { cn } from '@/lib/utils';
import { LiquidityStatus } from '@/types/cashflow';

interface LiquidityIndicatorProps {
  status: LiquidityStatus;
  netPosition: number;
  threshold: {
    green: number;
    amber: number;
  };
}

export function LiquidityIndicator({ status, netPosition, threshold }: LiquidityIndicatorProps) {
  const statusConfig = {
    Green: {
      label: 'Healthy',
      description: 'Liquidity position is strong',
      class: 'status-green',
      bgClass: 'bg-success/10 border-success/30',
    },
    Amber: {
      label: 'Caution',
      description: 'Monitor closely',
      class: 'status-amber',
      bgClass: 'bg-warning/10 border-warning/30',
    },
    Red: {
      label: 'Critical',
      description: 'Immediate attention required',
      class: 'status-red',
      bgClass: 'bg-destructive/10 border-destructive/30',
    },
  };

  const config = statusConfig[status];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  return (
    <div className={cn('rounded-xl border p-6', config.bgClass)}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={cn('status-indicator', config.class)} />
            <span className="text-lg font-semibold text-foreground">{config.label}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{config.description}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Net Position (14 days)</span>
          <span className={cn('font-medium number-mono', netPosition >= 0 ? 'text-success' : 'text-destructive')}>
            {formatCurrency(netPosition)}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              status === 'Green' && 'bg-success',
              status === 'Amber' && 'bg-warning',
              status === 'Red' && 'bg-destructive'
            )}
            style={{ width: `${Math.min(100, Math.max(10, (netPosition / threshold.green) * 100))}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Critical: {formatCurrency(0)}</span>
          <span>Target: {formatCurrency(threshold.green)}</span>
        </div>
      </div>
    </div>
  );
}
