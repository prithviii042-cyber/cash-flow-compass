import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { arAgingService, apAgingService, contractTermsService, historicalPatternsService } from '@/services/dataService';
import { generateCashForecast, getBusinessUnitStats, getLiquidityStatus, getTopDelayedItems } from '@/services/forecastService';
import type { BusinessUnit } from '@/types/cashflow';
import type { Database } from '@/integrations/supabase/types';

type DBBusinessUnit = Database['public']['Enums']['business_unit'];
type DBContractType = Database['public']['Enums']['contract_type'];

// Define input types for inserts (without auto-generated fields)
interface ARAgingInput {
  customer_id: string;
  business_unit: DBBusinessUnit;
  invoice_id: string;
  invoice_date: string;
  due_date: string;
  currency: string;
  invoice_amount: number;
  outstanding_amount: number;
}

interface APAgingInput {
  vendor_id: string;
  business_unit: DBBusinessUnit;
  invoice_id: string;
  due_date: string;
  currency: string;
  invoice_amount: number;
  outstanding_amount: number;
  critical_flag?: boolean;
}

interface ContractTermsInput {
  counterparty_id: string;
  business_unit: DBBusinessUnit;
  payment_terms_days: number;
  contract_type: DBContractType;
  advance_payment_percent?: number;
  penalty_or_prebill?: boolean;
}

interface HistoricalPatternsInput {
  business_unit: DBBusinessUnit;
  aging_bucket: string;
  collection_probability: number;
  avg_days_late?: number;
}

// AR Aging Hooks
export function useARAgingRecords(businessUnit?: BusinessUnit) {
  return useQuery({
    queryKey: ['ar-aging', businessUnit],
    queryFn: () => arAgingService.getAll(businessUnit),
  });
}

export function useInsertARAgingRecords() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (records: ARAgingInput[]) => arAgingService.insert(records),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ar-aging'] });
      queryClient.invalidateQueries({ queryKey: ['cash-forecast'] });
      queryClient.invalidateQueries({ queryKey: ['business-unit-stats'] });
    },
  });
}

// AP Aging Hooks
export function useAPAgingRecords(businessUnit?: BusinessUnit) {
  return useQuery({
    queryKey: ['ap-aging', businessUnit],
    queryFn: () => apAgingService.getAll(businessUnit),
  });
}

export function useInsertAPAgingRecords() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (records: APAgingInput[]) => apAgingService.insert(records),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ap-aging'] });
      queryClient.invalidateQueries({ queryKey: ['cash-forecast'] });
      queryClient.invalidateQueries({ queryKey: ['business-unit-stats'] });
    },
  });
}

// Contract Terms Hooks
export function useContractTerms(businessUnit?: BusinessUnit) {
  return useQuery({
    queryKey: ['contract-terms', businessUnit],
    queryFn: () => contractTermsService.getAll(businessUnit),
  });
}

export function useInsertContractTerms() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (records: ContractTermsInput[]) => contractTermsService.insert(records),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-terms'] });
    },
  });
}

// Historical Patterns Hooks
export function useHistoricalPatterns(businessUnit?: BusinessUnit) {
  return useQuery({
    queryKey: ['historical-patterns', businessUnit],
    queryFn: () => historicalPatternsService.getAll(businessUnit),
  });
}

export function useInsertHistoricalPatterns() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (records: HistoricalPatternsInput[]) => historicalPatternsService.insert(records),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['historical-patterns'] });
      queryClient.invalidateQueries({ queryKey: ['cash-forecast'] });
    },
  });
}

// Forecast Hooks
export function useCashForecast(forecastDays: number = 14, businessUnit?: BusinessUnit) {
  return useQuery({
    queryKey: ['cash-forecast', forecastDays, businessUnit],
    queryFn: () => generateCashForecast({ forecastDays, businessUnit }),
  });
}

export function useBusinessUnitStats() {
  return useQuery({
    queryKey: ['business-unit-stats'],
    queryFn: () => getBusinessUnitStats(),
  });
}

export function useLiquidityStatus() {
  const { data: forecasts } = useCashForecast(7);
  
  return useQuery({
    queryKey: ['liquidity-status', forecasts],
    queryFn: () => getLiquidityStatus(forecasts || []),
    enabled: !!forecasts && forecasts.length > 0,
  });
}

export function useTopDelayedItems(limit: number = 5) {
  return useQuery({
    queryKey: ['top-delayed-items', limit],
    queryFn: () => getTopDelayedItems(limit),
  });
}
