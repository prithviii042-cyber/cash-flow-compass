import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { FileUploadZone } from '@/components/upload/FileUploadZone';
import { UploadStatusBadge } from '@/components/upload/UploadStatusBadge';
import { UploadValidation } from '@/types/cashflow';
import { useAPAgingRecords, useInsertAPAgingRecords } from '@/hooks/useDataHooks';
import { validateAPUpload } from '@/services/dataService';
import { cn } from '@/lib/utils';
import { ArrowLeft, FileSpreadsheet, Info, AlertTriangle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';

type DBBusinessUnit = Database['public']['Enums']['business_unit'];

export default function APAgingUpload() {
  const { data: apRecords, isLoading } = useAPAgingRecords();
  const insertMutation = useInsertAPAgingRecords();
  const [lastUploadDate, setLastUploadDate] = useState<Date | null>(null);

  useEffect(() => {
    if (apRecords && apRecords.length > 0) {
      const latestRecord = apRecords.reduce((latest, record) => {
        const recordDate = new Date(record.created_at);
        return recordDate > latest ? recordDate : latest;
      }, new Date(0));
      setLastUploadDate(latestRecord);
    }
  }, [apRecords]);

  const handleUpload = async (file: File): Promise<UploadValidation> => {
    const mockParsedRecords = [
      {
        vendor_id: 'VEND-NEW-001',
        business_unit: 'Marine' as DBBusinessUnit,
        invoice_id: `AP-${Date.now()}`,
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currency: 'USD',
        invoice_amount: 2200000,
        outstanding_amount: 2200000,
        critical_flag: false,
      },
    ];

    const validation = await validateAPUpload(mockParsedRecords);
    
    if (!validation.success) {
      return validation;
    }

    const result = await insertMutation.mutateAsync(mockParsedRecords);
    return result;
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
              status={apRecords && apRecords.length > 0 ? 'success' : 'pending'}
              label="AP Aging Data"
              lastUpdated={lastUploadDate || undefined}
              recordCount={apRecords?.length || 0}
            />

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Current Data Preview</h3>
              </div>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : apRecords && apRecords.length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    {apRecords.length} records loaded
                  </p>
                  <div className="space-y-3">
                    {apRecords.slice(0, 4).map((record) => (
                      <div
                        key={record.id}
                        className={cn(
                          'p-3 rounded-lg text-sm',
                          record.critical_flag ? 'bg-destructive/10 border border-destructive/30' : 'bg-accent/30'
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{record.vendor_id}</span>
                            {record.critical_flag && (
                              <AlertTriangle className="w-4 h-4 text-destructive" />
                            )}
                          </div>
                          <span className={cn('bu-badge', getBuBadgeClass(record.business_unit))}>
                            {record.business_unit}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>{record.invoice_id}</span>
                          <span className="number-mono">{formatCurrency(Number(record.outstanding_amount))}</span>
                        </div>
                        <div className="mt-1">
                          <span className="text-xs text-muted-foreground">
                            Due: {new Date(record.due_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No AP aging data uploaded yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
