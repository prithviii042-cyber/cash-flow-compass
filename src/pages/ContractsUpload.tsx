import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { FileUploadZone } from '@/components/upload/FileUploadZone';
import { UploadStatusBadge } from '@/components/upload/UploadStatusBadge';
import { UploadValidation } from '@/types/cashflow';
import { useContractTerms, useInsertContractTerms } from '@/hooks/useDataHooks';
import { cn } from '@/lib/utils';
import { ArrowLeft, FileSpreadsheet, Info, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';

type DBBusinessUnit = Database['public']['Enums']['business_unit'];
type DBContractType = Database['public']['Enums']['contract_type'];

export default function ContractsUpload() {
  const { data: contracts, isLoading } = useContractTerms();
  const insertMutation = useInsertContractTerms();
  const [lastUploadDate, setLastUploadDate] = useState<Date | null>(null);

  useEffect(() => {
    if (contracts && contracts.length > 0) {
      const latestRecord = contracts.reduce((latest, record) => {
        const recordDate = new Date(record.created_at);
        return recordDate > latest ? recordDate : latest;
      }, new Date(0));
      setLastUploadDate(latestRecord);
    }
  }, [contracts]);

  const handleUpload = async (file: File): Promise<UploadValidation> => {
    const mockParsedRecords = [
      {
        counterparty_id: 'CUST-NEW-001',
        business_unit: 'Aviation' as DBBusinessUnit,
        payment_terms_days: 30,
        contract_type: 'Term' as DBContractType,
        advance_payment_percent: 10,
        penalty_or_prebill: false,
      },
    ];

    const result = await insertMutation.mutateAsync(mockParsedRecords);
    return result;
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
          <h1 className="text-3xl font-bold gradient-text">Contract Terms Upload</h1>
          <p className="text-muted-foreground mt-1">
            Upload contract terms to improve payment timing forecasts
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <FileUploadZone
              title="Contract Terms"
              description="Upload contract terms master data in CSV or Excel format"
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
                    <span className="text-muted-foreground">Counterparty_ID</span>
                    <span className="text-foreground">Text, Required</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Business_Unit</span>
                    <span className="text-foreground">Choice, Required</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Payment_Terms_Days</span>
                    <span className="text-foreground">Number, Required</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Contract_Type</span>
                    <span className="text-foreground">Choice (Spot/Term), Required</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Advance_Payment_Percent</span>
                    <span className="text-foreground">Number, Optional</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Penalty_or_Prebill</span>
                    <span className="text-foreground">Boolean, Optional</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-warning/10 border border-warning/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-warning">Spot Contract Validation</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    All Spot contracts should have explicit payment terms defined. Contracts without terms will be highlighted for review.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <UploadStatusBadge
              status={contracts && contracts.length > 0 ? 'success' : 'pending'}
              label="Contract Terms Data"
              lastUpdated={lastUploadDate || undefined}
              recordCount={contracts?.length || 0}
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
              ) : contracts && contracts.length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    {contracts.length} records loaded
                  </p>
                  <div className="space-y-3">
                    {contracts.slice(0, 4).map((contract) => (
                      <div
                        key={contract.id}
                        className="p-3 rounded-lg bg-accent/30 text-sm"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-foreground">{contract.counterparty_id}</span>
                          <span className={cn('bu-badge', getBuBadgeClass(contract.business_unit))}>
                            {contract.business_unit}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span className={cn(
                            'px-2 py-0.5 rounded text-xs',
                            contract.contract_type === 'Term' ? 'bg-primary/20 text-primary' : 'bg-warning/20 text-warning'
                          )}>
                            {contract.contract_type}
                          </span>
                          <span className="number-mono">{contract.payment_terms_days} days</span>
                        </div>
                        {contract.advance_payment_percent && Number(contract.advance_payment_percent) > 0 && (
                          <div className="mt-1">
                            <span className="text-xs text-muted-foreground">
                              Advance: {contract.advance_payment_percent}%
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No contract terms uploaded yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
