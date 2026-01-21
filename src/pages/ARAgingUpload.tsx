import { MainLayout } from '@/components/layout/MainLayout';
import { FileUploadZone } from '@/components/upload/FileUploadZone';
import { UploadStatusBadge } from '@/components/upload/UploadStatusBadge';
import { UploadValidation } from '@/types/cashflow';
import { mockARRecords } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { ArrowLeft, FileSpreadsheet, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ARAgingUpload() {
  const handleUpload = async (file: File): Promise<UploadValidation> => {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock validation
    return {
      success: true,
      errors: [],
      warnings: ['2 AR records have no matching CONTRACT_TERMS entry'],
      recordCount: 156,
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

  const getAgingClass = (bucket: string) => {
    if (bucket === '0-30') return 'text-success';
    if (bucket === '31-60') return 'text-warning';
    return 'text-destructive';
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold gradient-text">AR Aging Upload</h1>
          <p className="text-muted-foreground mt-1">
            Upload accounts receivable aging data to update cash inflow forecasts
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Upload Zone */}
          <div className="col-span-2">
            <FileUploadZone
              title="AR Aging Report"
              description="Upload your AR aging report in CSV or Excel format"
              acceptedFormats={['.csv', '.xlsx', '.xls']}
              onUpload={handleUpload}
            />

            {/* Required Fields Info */}
            <div className="mt-6 bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Required Fields</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Customer_ID</span>
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
                    <span className="text-muted-foreground">Invoice_Date</span>
                    <span className="text-foreground">Date, Required</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Due_Date</span>
                    <span className="text-foreground">Date, Required</span>
                  </div>
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
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                * Aging_Bucket will be auto-calculated based on Due_Date
              </p>
            </div>
          </div>

          {/* Status & Preview */}
          <div className="space-y-6">
            <UploadStatusBadge
              status="success"
              label="AR Aging Data"
              lastUpdated={new Date('2025-01-20T10:30:00')}
              recordCount={156}
            />

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Current Data Preview</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {mockARRecords.length} records loaded
              </p>

              <div className="space-y-3">
                {mockARRecords.slice(0, 4).map((record) => (
                  <div
                    key={record.id}
                    className="p-3 rounded-lg bg-accent/30 text-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{record.customerId}</span>
                      <span className={cn('bu-badge', getBuBadgeClass(record.businessUnit))}>
                        {record.businessUnit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>{record.invoiceId}</span>
                      <span className="number-mono">{formatCurrency(record.outstandingAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">
                        Due: {record.dueDate.toLocaleDateString()}
                      </span>
                      <span className={cn('text-xs font-medium', getAgingClass(record.agingBucket))}>
                        {record.agingBucket} days
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
