import { ARAgingRecord, APAgingRecord, ContractTerms, HistoricalPattern, DailyCashForecast, BusinessUnit } from '@/types/cashflow';

export const mockARRecords: ARAgingRecord[] = [
  {
    id: '1',
    customerId: 'CUST-001',
    businessUnit: 'Aviation',
    invoiceId: 'INV-2024-001',
    invoiceDate: new Date('2024-12-01'),
    dueDate: new Date('2025-01-15'),
    currency: 'USD',
    invoiceAmount: 2500000,
    outstandingAmount: 2500000,
    agingBucket: '0-30',
  },
  {
    id: '2',
    customerId: 'CUST-002',
    businessUnit: 'Marine',
    invoiceId: 'INV-2024-002',
    invoiceDate: new Date('2024-11-15'),
    dueDate: new Date('2025-01-10'),
    currency: 'USD',
    invoiceAmount: 4800000,
    outstandingAmount: 3200000,
    agingBucket: '31-60',
  },
  {
    id: '3',
    customerId: 'CUST-003',
    businessUnit: 'Trading',
    invoiceId: 'INV-2024-003',
    invoiceDate: new Date('2024-10-20'),
    dueDate: new Date('2024-12-20'),
    currency: 'EUR',
    invoiceAmount: 1800000,
    outstandingAmount: 1800000,
    agingBucket: '61-90',
  },
  {
    id: '4',
    customerId: 'CUST-004',
    businessUnit: 'Land',
    invoiceId: 'INV-2024-004',
    invoiceDate: new Date('2024-12-10'),
    dueDate: new Date('2025-01-25'),
    currency: 'USD',
    invoiceAmount: 950000,
    outstandingAmount: 950000,
    agingBucket: '0-30',
  },
  {
    id: '5',
    customerId: 'CUST-005',
    businessUnit: 'Aviation',
    invoiceId: 'INV-2024-005',
    invoiceDate: new Date('2024-09-01'),
    dueDate: new Date('2024-10-01'),
    currency: 'USD',
    invoiceAmount: 3200000,
    outstandingAmount: 1600000,
    agingBucket: '120+',
  },
];

export const mockAPRecords: APAgingRecord[] = [
  {
    id: '1',
    vendorId: 'VEND-001',
    businessUnit: 'Aviation',
    invoiceId: 'AP-2024-001',
    dueDate: new Date('2025-01-20'),
    currency: 'USD',
    invoiceAmount: 1800000,
    outstandingAmount: 1800000,
    criticalFlag: false,
  },
  {
    id: '2',
    vendorId: 'VEND-002',
    businessUnit: 'Marine',
    invoiceId: 'AP-2024-002',
    dueDate: new Date('2025-01-18'),
    currency: 'USD',
    invoiceAmount: 3200000,
    outstandingAmount: 3200000,
    criticalFlag: true,
  },
  {
    id: '3',
    vendorId: 'VEND-003',
    businessUnit: 'Trading',
    invoiceId: 'AP-2024-003',
    dueDate: new Date('2025-01-25'),
    currency: 'EUR',
    invoiceAmount: 2100000,
    outstandingAmount: 2100000,
    criticalFlag: false,
  },
  {
    id: '4',
    vendorId: 'VEND-004',
    businessUnit: 'Land',
    invoiceId: 'AP-2024-004',
    dueDate: new Date('2025-01-22'),
    currency: 'USD',
    invoiceAmount: 650000,
    outstandingAmount: 650000,
    criticalFlag: false,
  },
];

export const mockContractTerms: ContractTerms[] = [
  { id: '1', counterpartyId: 'CUST-001', businessUnit: 'Aviation', paymentTermsDays: 30, contractType: 'Term', advancePaymentPercent: 10, penaltyOrPrebill: false },
  { id: '2', counterpartyId: 'CUST-002', businessUnit: 'Marine', paymentTermsDays: 45, contractType: 'Term', advancePaymentPercent: 0, penaltyOrPrebill: true },
  { id: '3', counterpartyId: 'CUST-003', businessUnit: 'Trading', paymentTermsDays: 15, contractType: 'Spot', advancePaymentPercent: 50, penaltyOrPrebill: false },
  { id: '4', counterpartyId: 'CUST-004', businessUnit: 'Land', paymentTermsDays: 30, contractType: 'Term', advancePaymentPercent: 0, penaltyOrPrebill: false },
];

export const mockHistoricalPatterns: HistoricalPattern[] = [
  { id: '1', businessUnit: 'Aviation', agingBucket: '0-30', collectionProbability: 0.95, avgDaysLate: 3 },
  { id: '2', businessUnit: 'Aviation', agingBucket: '31-60', collectionProbability: 0.88, avgDaysLate: 8 },
  { id: '3', businessUnit: 'Marine', agingBucket: '0-30', collectionProbability: 0.92, avgDaysLate: 5 },
  { id: '4', businessUnit: 'Marine', agingBucket: '31-60', collectionProbability: 0.82, avgDaysLate: 12 },
  { id: '5', businessUnit: 'Trading', agingBucket: '0-30', collectionProbability: 0.90, avgDaysLate: 2 },
  { id: '6', businessUnit: 'Trading', agingBucket: '61-90', collectionProbability: 0.70, avgDaysLate: 15 },
  { id: '7', businessUnit: 'Land', agingBucket: '0-30', collectionProbability: 0.98, avgDaysLate: 1 },
];

export const generateForecastData = (): DailyCashForecast[] => {
  const forecasts: DailyCashForecast[] = [];
  const today = new Date();
  
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    const baseInflow = 8000000 + Math.random() * 4000000;
    const baseOutflow = 6000000 + Math.random() * 3000000;
    
    forecasts.push({
      date,
      totalInflows: baseInflow,
      totalOutflows: baseOutflow,
      netCash: baseInflow - baseOutflow,
      byBusinessUnit: {
        Aviation: { inflows: baseInflow * 0.35, outflows: baseOutflow * 0.30 },
        Marine: { inflows: baseInflow * 0.30, outflows: baseOutflow * 0.35 },
        Land: { inflows: baseInflow * 0.15, outflows: baseOutflow * 0.15 },
        Trading: { inflows: baseInflow * 0.20, outflows: baseOutflow * 0.20 },
      },
    });
  }
  
  return forecasts;
};

export const businessUnitStats: Record<BusinessUnit, { totalAR: number; totalAP: number; exposure: number }> = {
  Aviation: { totalAR: 8500000, totalAP: 5200000, exposure: 3300000 },
  Marine: { totalAR: 6200000, totalAP: 4800000, exposure: 1400000 },
  Land: { totalAR: 2100000, totalAP: 1500000, exposure: 600000 },
  Trading: { totalAR: 4500000, totalAP: 3200000, exposure: 1300000 },
};
