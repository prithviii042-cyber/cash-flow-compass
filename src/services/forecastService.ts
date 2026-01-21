import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { calculateAgingBucket } from './dataService';
import type { DailyCashForecast, BusinessUnit } from '@/types/cashflow';

type ARAgingRow = Database['public']['Tables']['ar_aging']['Row'];
type APAgingRow = Database['public']['Tables']['ap_aging']['Row'];
type HistoricalPatternsRow = Database['public']['Tables']['historical_patterns']['Row'];
type DBBusinessUnit = Database['public']['Enums']['business_unit'];

interface ForecastConfig {
  forecastDays: number;
  businessUnit?: BusinessUnit;
}

interface BusinessUnitStats {
  totalAR: number;
  totalAP: number;
  exposure: number;
}

export async function generateCashForecast(config: ForecastConfig = { forecastDays: 14 }): Promise<DailyCashForecast[]> {
  const { forecastDays, businessUnit } = config;
  
  // Fetch AR aging data
  let arQuery = supabase.from('ar_aging').select('*');
  if (businessUnit) {
    arQuery = arQuery.eq('business_unit', businessUnit as DBBusinessUnit);
  }
  const { data: arRecords, error: arError } = await arQuery;
  
  if (arError) {
    console.error('Error fetching AR records:', arError);
    throw arError;
  }

  // Fetch AP aging data
  let apQuery = supabase.from('ap_aging').select('*');
  if (businessUnit) {
    apQuery = apQuery.eq('business_unit', businessUnit as DBBusinessUnit);
  }
  const { data: apRecords, error: apError } = await apQuery;
  
  if (apError) {
    console.error('Error fetching AP records:', apError);
    throw apError;
  }

  // Fetch historical patterns
  const { data: patterns, error: patternsError } = await supabase
    .from('historical_patterns')
    .select('*');
  
  if (patternsError) {
    console.error('Error fetching patterns:', patternsError);
    throw patternsError;
  }

  // Build pattern lookup
  const patternLookup: Record<string, HistoricalPatternsRow> = {};
  patterns?.forEach(p => {
    patternLookup[`${p.business_unit}-${p.aging_bucket}`] = p;
  });

  // Generate forecast for each day
  const forecasts: DailyCashForecast[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < forecastDays; i++) {
    const forecastDate = new Date(today);
    forecastDate.setDate(today.getDate() + i);

    const dayForecast: DailyCashForecast = {
      date: forecastDate,
      totalInflows: 0,
      totalOutflows: 0,
      netCash: 0,
      byBusinessUnit: {},
    };

    // Calculate inflows from AR
    arRecords?.forEach(ar => {
      const dueDate = new Date(ar.due_date);
      const agingBucket = calculateAgingBucket(dueDate);
      const pattern = patternLookup[`${ar.business_unit}-${agingBucket}`];
      
      // Default values if no pattern exists
      const collectionProbability = pattern?.collection_probability ?? 0.85;
      const avgDaysLate = pattern?.avg_days_late ?? 5;
      
      // Calculate expected collection date
      const expectedCollectionDate = new Date(dueDate);
      expectedCollectionDate.setDate(dueDate.getDate() + avgDaysLate);
      expectedCollectionDate.setHours(0, 0, 0, 0);
      
      // Check if this invoice is expected to be collected on this forecast date
      if (expectedCollectionDate.getTime() === forecastDate.getTime()) {
        const expectedInflow = Number(ar.outstanding_amount) * Number(collectionProbability);
        
        dayForecast.totalInflows += expectedInflow;
        
        // Add to business unit breakdown
        const bu = ar.business_unit as BusinessUnit;
        if (!dayForecast.byBusinessUnit[bu]) {
          dayForecast.byBusinessUnit[bu] = { inflows: 0, outflows: 0 };
        }
        dayForecast.byBusinessUnit[bu]!.inflows += expectedInflow;
      }
    });

    // Calculate outflows from AP
    apRecords?.forEach(ap => {
      const dueDate = new Date(ap.due_date);
      dueDate.setHours(0, 0, 0, 0);
      
      // Expected payment on due date
      if (dueDate.getTime() === forecastDate.getTime()) {
        const expectedOutflow = Number(ap.outstanding_amount);
        
        dayForecast.totalOutflows += expectedOutflow;
        
        // Add to business unit breakdown
        const bu = ap.business_unit as BusinessUnit;
        if (!dayForecast.byBusinessUnit[bu]) {
          dayForecast.byBusinessUnit[bu] = { inflows: 0, outflows: 0 };
        }
        dayForecast.byBusinessUnit[bu]!.outflows += expectedOutflow;
      }
    });

    dayForecast.netCash = dayForecast.totalInflows - dayForecast.totalOutflows;
    forecasts.push(dayForecast);
  }

  return forecasts;
}

export async function getBusinessUnitStats(): Promise<Record<BusinessUnit, BusinessUnitStats>> {
  const businessUnits: BusinessUnit[] = ['Aviation', 'Marine', 'Land', 'Trading'];
  const stats: Record<BusinessUnit, BusinessUnitStats> = {} as Record<BusinessUnit, BusinessUnitStats>;

  for (const bu of businessUnits) {
    // Get AR totals
    const { data: arData } = await supabase
      .from('ar_aging')
      .select('outstanding_amount')
      .eq('business_unit', bu as DBBusinessUnit);
    
    const totalAR = arData?.reduce((sum, r) => sum + Number(r.outstanding_amount), 0) || 0;

    // Get AP totals
    const { data: apData } = await supabase
      .from('ap_aging')
      .select('outstanding_amount')
      .eq('business_unit', bu as DBBusinessUnit);
    
    const totalAP = apData?.reduce((sum, r) => sum + Number(r.outstanding_amount), 0) || 0;

    stats[bu] = {
      totalAR,
      totalAP,
      exposure: totalAR - totalAP,
    };
  }

  return stats;
}

export async function getLiquidityStatus(forecasts: DailyCashForecast[]): Promise<'Green' | 'Amber' | 'Red'> {
  // Calculate 7-day net cash
  const next7Days = forecasts.slice(0, 7);
  const net7Days = next7Days.reduce((sum, f) => sum + f.netCash, 0);

  // Simple thresholds - these could be configurable
  if (net7Days >= 10000000) return 'Green';
  if (net7Days >= 0) return 'Amber';
  return 'Red';
}

export async function getTopDelayedItems(limit: number = 5) {
  const today = new Date();
  
  // Get overdue AR
  const { data: overdueAR } = await supabase
    .from('ar_aging')
    .select('*')
    .lt('due_date', today.toISOString().split('T')[0])
    .order('outstanding_amount', { ascending: false })
    .limit(limit);

  // Get upcoming critical AP
  const { data: criticalAP } = await supabase
    .from('ap_aging')
    .select('*')
    .eq('critical_flag', true)
    .order('due_date', { ascending: true })
    .limit(limit);

  return {
    overdueAR: overdueAR || [],
    criticalAP: criticalAP || [],
  };
}
