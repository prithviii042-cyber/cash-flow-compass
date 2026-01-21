import { MainLayout } from '@/components/layout/MainLayout';
import { FileUploadZone } from '@/components/upload/FileUploadZone';
import { UploadStatusBadge } from '@/components/upload/UploadStatusBadge';
import { UploadValidation } from '@/types/cashflow';
import { mockAPRecords } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { ArrowLeft, FileSpreadsheet, Info, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function APAgingUpload() {
  const handleUpload = async (file: File): Promise<UploadValidation> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return {
      success: true,
      errors: [],
      warnings: [],
      recordCount: 89,
    };
  };

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
    <MainLayout>
      <div className="space-y-8">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold gradient-text">AP Aging Upload</h1>
          <p className="text-muted-foreground mt-1">
            Upload accounts payable aging data to update cash outflow forecasts
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <FileUploadZone
              title="AP Aging Report"
              description="Upload your AP aging report in CSV or Excel format"
              acceptedFormats={['.csv', '.xlsx', '.xls']}
              onUpload={handleUpload}
            />

            <div className="mt-6 bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Required Fields</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Vendor_ID</span>
                    <span className="text-foreground">Text, Required</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Business_Unit</span>
                    <span className="text-foreground">Choice, Required</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Invoice_ID</span>
                    <span className="text-foreground">Text, Required</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Due_Date</span>
                    <span className="text-foreground">Date, Required</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Currency</span>
                    <span className="text-foreground">Text, Required</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Invoice_Amount</span>
                    <span className="text-foreground">Number, Required</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Outstanding_Amount</span>
                    <span className="text-foreground">Number, Required</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Critical_Flag</span>
                    <span className="text-foreground">Boolean, Optional</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <UploadStatusBadge
              status="success"
              label="AP Aging Data"
              lastUpdated={new Date('2025-01-20T09:15:00')}
              recordCount={89}
            />

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Current Data Preview</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {mockAPRecords.length} records loaded
              </p>

              <div className="space-y-3">
                {mockAPRecords.map((record) => (
                  <div
                    key={record.id}
                    className={cn(
                      'p-3 rounded-lg text-sm',
                      record.criticalFlag ? 'bg-destructive/10 border border-destructive/30' : 'bg-accent/30'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{record.vendorId}</span>
                        {record.criticalFlag && (
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                      <span className={cn('bu-badge', getBuBadgeClass(record.businessUnit))}>
                        {record.businessUnit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>{record.invoiceId}</span>
                      <span className="number-mono">{formatCurrency(record.outstandingAmount)}</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-xs text-muted-foreground">
                        Due: {record.dueDate.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
