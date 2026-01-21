export type BusinessUnit = 'Aviation' | 'Marine' | 'Land' | 'Trading';
export type ContractType = 'Spot' | 'Term';
export type AgingBucket = '0-30' | '31-60' | '61-90' | '91-120' | '120+';
export type LiquidityStatus = 'Green' | 'Amber' | 'Red';
export type UserRole = 'Treasury' | 'FP&A';

export interface ARAgingRecord {
  id: string;
  customerId: string;
  businessUnit: BusinessUnit;
  invoiceId: string;
  invoiceDate: Date;
  dueDate: Date;
  currency: string;
  invoiceAmount: number;
  outstandingAmount: number;
  agingBucket: AgingBucket;
}

export interface APAgingRecord {
  id: string;
  vendorId: string;
  businessUnit: BusinessUnit;
  invoiceId: string;
  dueDate: Date;
  currency: string;
  invoiceAmount: number;
  outstandingAmount: number;
  criticalFlag: boolean;
}

export interface ContractTerms {
  id: string;
  counterpartyId: string;
  businessUnit: BusinessUnit;
  paymentTermsDays: number;
  contractType: ContractType;
  advancePaymentPercent?: number;
  penaltyOrPrebill: boolean;
}

export interface HistoricalPattern {
  id: string;
  businessUnit: BusinessUnit;
  agingBucket: AgingBucket;
  collectionProbability: number;
  avgDaysLate: number;
}

export interface DailyCashForecast {
  date: Date;
  totalInflows: number;
  totalOutflows: number;
  netCash: number;
  byBusinessUnit: {
    [key in BusinessUnit]?: {
      inflows: number;
      outflows: number;
    };
  };
}

export interface UploadValidation {
  success: boolean;
  errors: string[];
  warnings: string[];
  recordCount: number;
}
