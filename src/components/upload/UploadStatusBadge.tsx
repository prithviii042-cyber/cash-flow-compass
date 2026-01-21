import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type UploadStatus = 'pending' | 'success' | 'error';

interface UploadStatusBadgeProps {
  status: UploadStatus;
  label: string;
  lastUpdated?: Date;
  recordCount?: number;
}

export function UploadStatusBadge({ status, label, lastUpdated, recordCount }: UploadStatusBadgeProps) {
  const config = {
    pending: {
      icon: Clock,
      bgClass: 'bg-muted',
      iconClass: 'text-muted-foreground',
      textClass: 'text-muted-foreground',
    },
    success: {
      icon: CheckCircle,
      bgClass: 'bg-success/10',
      iconClass: 'text-success',
      textClass: 'text-success',
    },
    error: {
      icon: AlertCircle,
      bgClass: 'bg-destructive/10',
      iconClass: 'text-destructive',
      textClass: 'text-destructive',
    },
  };

  const { icon: Icon, bgClass, iconClass, textClass } = config[status];

  return (
    <div className={cn('flex items-center gap-3 p-4 rounded-lg border border-border', bgClass)}>
      <Icon className={cn('w-5 h-5', iconClass)} />
      <div className="flex-1">
        <p className={cn('font-medium', textClass)}>{label}</p>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground">
            Last updated: {lastUpdated.toLocaleDateString()} at {lastUpdated.toLocaleTimeString()}
          </p>
        )}
        {recordCount !== undefined && status === 'success' && (
          <p className="text-xs text-muted-foreground">{recordCount} records loaded</p>
        )}
      </div>
    </div>
  );
}
