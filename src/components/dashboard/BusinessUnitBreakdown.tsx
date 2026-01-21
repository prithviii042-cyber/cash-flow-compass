import { BusinessUnit } from '@/types/cashflow';
import { businessUnitStats } from '@/data/mockData';
import { Plane, Ship, Truck, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buConfig: Record<BusinessUnit, { icon: typeof Plane; colorClass: string; badgeClass: string }> = {
  Aviation: { icon: Plane, colorClass: 'text-aviation', badgeClass: 'bu-aviation' },
  Marine: { icon: Ship, colorClass: 'text-marine', badgeClass: 'bu-marine' },
  Land: { icon: Truck, colorClass: 'text-land', badgeClass: 'bu-land' },
  Trading: { icon: BarChart3, colorClass: 'text-trading', badgeClass: 'bu-trading' },
};

export function BusinessUnitBreakdown() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  const totalExposure = Object.values(businessUnitStats).reduce((sum, bu) => sum + bu.exposure, 0);

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-1">Business Unit Exposure</h3>
      <p className="text-sm text-muted-foreground mb-6">AR/AP breakdown by segment</p>

      <div className="space-y-4">
        {(Object.keys(businessUnitStats) as BusinessUnit[]).map((bu) => {
          const stats = businessUnitStats[bu];
          const config = buConfig[bu];
          const Icon = config.icon;
          const exposurePercent = (stats.exposure / totalExposure) * 100;

          return (
            <div key={bu} className="p-4 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn('p-2 rounded-lg bg-background', config.colorClass)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={cn('bu-badge', config.badgeClass)}>{bu}</span>
                  </div>
                </div>
                <span className={cn('text-lg font-semibold number-mono', stats.exposure >= 0 ? 'text-success' : 'text-destructive')}>
                  {formatCurrency(stats.exposure)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total AR</p>
                  <p className="font-medium text-success number-mono">{formatCurrency(stats.totalAR)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total AP</p>
                  <p className="font-medium text-destructive number-mono">{formatCurrency(stats.totalAP)}</p>
                </div>
              </div>

              <div className="mt-3">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full', config.colorClass.replace('text-', 'bg-'))}
                    style={{ width: `${exposurePercent}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{exposurePercent.toFixed(1)}% of total exposure</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
