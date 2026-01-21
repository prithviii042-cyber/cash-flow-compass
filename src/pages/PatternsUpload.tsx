import { MainLayout } from '@/components/layout/MainLayout';
import { FileUploadZone } from '@/components/upload/FileUploadZone';
import { UploadStatusBadge } from '@/components/upload/UploadStatusBadge';
import { UploadValidation } from '@/types/cashflow';
import { mockHistoricalPatterns } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { ArrowLeft, FileSpreadsheet, Info, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PatternsUpload() {
  const handleUpload = async (file: File): Promise<UploadValidation> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return {
      success: true,
      errors: [],
      warnings: [],
      recordCount: 28,
    };
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

  const getProbabilityColor = (prob: number) => {
    if (prob >= 0.9) return 'text-success';
    if (prob >= 0.75) return 'text-warning';
    return 'text-destructive';
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
          <h1 className="text-3xl font-bold gradient-text">Historical Patterns Upload</h1>
          <p className="text-muted-foreground mt-1">
            Upload historical collection patterns to improve forecast accuracy
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <FileUploadZone
              title="Historical Cash Patterns"
              description="Upload historical collection and payment pattern data"
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
                    <span className="text-muted-foreground">Business_Unit</span>
                    <span className="text-foreground">Choice, Required</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Aging_Bucket</span>
                    <span className="text-foreground">Text, Required</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Collection_Probability</span>
                    <span className="text-foreground">Number (0-1), Required</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Avg_Days_Late</span>
                    <span className="text-foreground">Number, Optional</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pattern Explanation */}
            <div className="mt-6 bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">How Patterns Work</h3>
              </div>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>
                  Historical patterns help the system predict when invoices will actually be paid based on past behavior.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong className="text-foreground">Collection Probability:</strong> Likelihood of collecting within the aging bucket (0-1)</li>
                  <li><strong className="text-foreground">Avg Days Late:</strong> Average delay past due date for this bucket</li>
                </ul>
                <p>
                  Forecasted inflow = Outstanding Amount × Collection Probability, adjusted by Avg Days Late
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <UploadStatusBadge
              status="success"
              label="Historical Patterns"
              lastUpdated={new Date('2025-01-15T11:30:00')}
              recordCount={28}
            />

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Current Patterns</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {mockHistoricalPatterns.length} patterns loaded
              </p>

              <div className="space-y-3">
                {mockHistoricalPatterns.map((pattern) => (
                  <div
                    key={pattern.id}
                    className="p-3 rounded-lg bg-accent/30 text-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn('bu-badge', getBuBadgeClass(pattern.businessUnit))}>
                        {pattern.businessUnit}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-muted text-xs text-muted-foreground">
                        {pattern.agingBucket} days
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Collection Prob.</span>
                      <span className={cn('font-medium number-mono', getProbabilityColor(pattern.collectionProbability))}>
                        {(pattern.collectionProbability * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-muted-foreground">Avg Days Late</span>
                      <span className="text-foreground number-mono">+{pattern.avgDaysLate}</span>
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
