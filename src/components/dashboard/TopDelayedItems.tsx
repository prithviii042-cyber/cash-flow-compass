import { mockARRecords, mockAPRecords } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { AlertTriangle, Clock } from 'lucide-react';
import { differenceInDays } from 'date-fns';

export function TopDelayedItems() {
  const today = new Date();

  const delayedAR = mockARRecords
    .filter((record) => record.dueDate < today)
    .map((record) => ({
      ...record,
      daysOverdue: differenceInDays(today, record.dueDate),
    }))
    .sort((a, b) => b.outstandingAmount - a.outstandingAmount)
    .slice(0, 5);

  const criticalAP = mockAPRecords
    .filter((record) => record.criticalFlag)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 5);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  const getBuBadgeClass = (bu: string) => {
    const classes: Record<string, string> = {
      Aviation: 'bu-aviation',
      Marine: 'bu-marine',
      Land: 'bu-land',
      Trading: 'bu-trading',
    };
    return classes[bu] || '';
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Delayed Customers */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-warning" />
          <h3 className="text-lg font-semibold text-foreground">Delayed Customers</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">AR items past due date</p>

        <div className="space-y-3">
          {delayedAR.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No overdue items</p>
          ) : (
            delayedAR.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-foreground">{record.customerId}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn('bu-badge', getBuBadgeClass(record.businessUnit))}>
                      {record.businessUnit}
                    </span>
                    <span className="text-xs text-destructive">{record.daysOverdue} days overdue</span>
                  </div>
                </div>
                <span className="text-lg font-semibold text-destructive number-mono">
                  {formatCurrency(record.outstandingAmount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Critical Vendors */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <h3 className="text-lg font-semibold text-foreground">Critical Vendors</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Flagged AP items requiring attention</p>

        <div className="space-y-3">
          {criticalAP.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No critical items</p>
          ) : (
            criticalAP.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 hover:bg-destructive/15 transition-colors border border-destructive/20"
              >
                <div>
                  <p className="font-medium text-foreground">{record.vendorId}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn('bu-badge', getBuBadgeClass(record.businessUnit))}>
                      {record.businessUnit}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Due: {record.dueDate.toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <span className="text-lg font-semibold text-foreground number-mono">
                  {formatCurrency(record.outstandingAmount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
