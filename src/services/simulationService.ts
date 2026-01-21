import { supabase } from "@/integrations/supabase/client";
import type { SimulationParams, ScenarioResult, ExternalIndicator, BUSINESS_UNIT_SENSITIVITY } from "@/types/simulation";
import { addDays, format, parseISO, startOfDay, differenceInDays } from "date-fns";

const SENSITIVITY = {
  aviation: { oil: 1.5, fx: 0.8, volatility: 1.2 },
  marine: { oil: 0.8, fx: 1.3, volatility: 1.0 },
  trading: { oil: 1.0, fx: 1.0, volatility: 1.8 },
  land: { oil: 0.5, fx: 0.5, volatility: 0.6 },
} as const;

type BusinessUnit = keyof typeof SENSITIVITY;

export async function runSimulation(params: SimulationParams): Promise<{
  inflows: number;
  outflows: number;
  netCash: number;
  liquidityRiskLevel: string;
  byBusinessUnit: Record<string, { inflows: number; outflows: number; netCash: number }>;
  dailyForecast: Array<{ date: string; inflows: number; outflows: number; netCash: number }>;
}> {
  // Fetch AR aging data
  const { data: arData } = await supabase.from('ar_aging').select('*');
  const { data: apData } = await supabase.from('ap_aging').select('*');
  const { data: patternsData } = await supabase.from('historical_patterns').select('*');

  const patterns = (patternsData || []).reduce((acc, p) => {
    const key = `${p.business_unit}-${p.aging_bucket}`;
    acc[key] = { probability: Number(p.collection_probability), avgDaysLate: p.avg_days_late || 0 };
    return acc;
  }, {} as Record<string, { probability: number; avgDaysLate: number }>);

  const today = startOfDay(new Date());
  const forecastDays = 30;
  const dailyData: Record<string, { inflows: number; outflows: number }> = {};
  const byBusinessUnit: Record<string, { inflows: number; outflows: number; netCash: number }> = {};

  // Initialize daily data
  for (let i = 0; i < forecastDays; i++) {
    const dateKey = format(addDays(today, i), 'yyyy-MM-dd');
    dailyData[dateKey] = { inflows: 0, outflows: 0 };
  }

  // Process AR (inflows)
  (arData || []).forEach(ar => {
    const bu = ar.business_unit as BusinessUnit;
    const sensitivity = SENSITIVITY[bu] || SENSITIVITY.land;
    
    // Calculate aging bucket
    const dueDate = parseISO(ar.due_date);
    const daysOverdue = differenceInDays(today, dueDate);
    let bucket = 'Current';
    if (daysOverdue > 0 && daysOverdue <= 30) bucket = '0-30';
    else if (daysOverdue > 30 && daysOverdue <= 60) bucket = '31-60';
    else if (daysOverdue > 60 && daysOverdue <= 90) bucket = '61-90';
    else if (daysOverdue > 90 && daysOverdue <= 120) bucket = '91-120';
    else if (daysOverdue > 120) bucket = '120+';

    const pattern = patterns[`${bu}-${bucket}`] || { probability: 0.9, avgDaysLate: 0 };
    
    // Apply simulation adjustments
    const adjustedProbability = Math.min(1, Math.max(0, 
      pattern.probability * (params.collectionEfficiencyAdjustment / 100)
    ));
    const adjustedDaysLate = pattern.avgDaysLate + params.customerPaymentDelayDays;
    const fxAdjustment = 1 + (params.fxChange / 100) * sensitivity.fx;
    const oilAdjustment = 1 + (params.oilPriceChange / 100) * sensitivity.oil * 0.1; // Oil affects costs indirectly
    
    const adjustedAmount = Number(ar.outstanding_amount) * adjustedProbability * fxAdjustment * oilAdjustment * sensitivity.volatility;
    const expectedDate = addDays(dueDate, adjustedDaysLate);
    const dateKey = format(expectedDate, 'yyyy-MM-dd');
    
    if (dailyData[dateKey]) {
      dailyData[dateKey].inflows += adjustedAmount;
    }
    
    // Track by business unit
    if (!byBusinessUnit[bu]) {
      byBusinessUnit[bu] = { inflows: 0, outflows: 0, netCash: 0 };
    }
    byBusinessUnit[bu].inflows += adjustedAmount;
  });

  // Process AP (outflows)
  (apData || []).forEach(ap => {
    const bu = ap.business_unit as BusinessUnit;
    const sensitivity = SENSITIVITY[bu] || SENSITIVITY.land;
    
    const fxAdjustment = 1 + (params.fxChange / 100) * sensitivity.fx;
    const oilAdjustment = 1 + (params.oilPriceChange / 100) * sensitivity.oil;
    
    const adjustedAmount = Number(ap.outstanding_amount) * fxAdjustment * oilAdjustment;
    const dueDate = parseISO(ap.due_date);
    const dateKey = format(dueDate, 'yyyy-MM-dd');
    
    if (dailyData[dateKey]) {
      dailyData[dateKey].outflows += adjustedAmount;
    }
    
    // Track by business unit
    if (!byBusinessUnit[bu]) {
      byBusinessUnit[bu] = { inflows: 0, outflows: 0, netCash: 0 };
    }
    byBusinessUnit[bu].outflows += adjustedAmount;
  });

  // Calculate net cash for each business unit
  Object.keys(byBusinessUnit).forEach(bu => {
    byBusinessUnit[bu].netCash = byBusinessUnit[bu].inflows - byBusinessUnit[bu].outflows;
  });

  // Convert to daily forecast array
  const dailyForecast = Object.entries(dailyData)
    .map(([date, data]) => ({
      date,
      inflows: Math.round(data.inflows * 100) / 100,
      outflows: Math.round(data.outflows * 100) / 100,
      netCash: Math.round((data.inflows - data.outflows) * 100) / 100,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Calculate totals
  const totalInflows = dailyForecast.reduce((sum, d) => sum + d.inflows, 0);
  const totalOutflows = dailyForecast.reduce((sum, d) => sum + d.outflows, 0);
  const netCash = totalInflows - totalOutflows;

  // Determine liquidity risk level
  let liquidityRiskLevel = 'Low';
  const coverageRatio = totalOutflows > 0 ? totalInflows / totalOutflows : 999;
  if (coverageRatio < 0.8) liquidityRiskLevel = 'Critical';
  else if (coverageRatio < 1.0) liquidityRiskLevel = 'High';
  else if (coverageRatio < 1.2) liquidityRiskLevel = 'Medium';

  return {
    inflows: Math.round(totalInflows * 100) / 100,
    outflows: Math.round(totalOutflows * 100) / 100,
    netCash: Math.round(netCash * 100) / 100,
    liquidityRiskLevel,
    byBusinessUnit,
    dailyForecast,
  };
}

export async function saveScenario(
  scenarioName: string,
  params: SimulationParams,
  results: { inflows: number; outflows: number; netCash: number; liquidityRiskLevel: string }
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const simulationParamsJson = JSON.parse(JSON.stringify(params));

  const { error } = await supabase.from('scenario_results').insert([{
    scenario_name: scenarioName,
    scenario_date: format(new Date(), 'yyyy-MM-dd'),
    inflows: results.inflows,
    outflows: results.outflows,
    net_cash: results.netCash,
    liquidity_risk_level: results.liquidityRiskLevel,
    simulation_params: simulationParamsJson,
    user_id: user.id,
  }]);

  if (error) throw error;
}

export async function getSavedScenarios(): Promise<ScenarioResult[]> {
  const { data, error } = await supabase
    .from('scenario_results')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  return (data || []).map(d => ({
    id: d.id,
    scenario_name: d.scenario_name,
    scenario_date: d.scenario_date,
    inflows: Number(d.inflows),
    outflows: Number(d.outflows),
    net_cash: Number(d.net_cash),
    liquidity_risk_level: d.liquidity_risk_level,
    simulation_params: d.simulation_params as unknown as SimulationParams,
  }));
}

export async function deleteScenario(id: string): Promise<void> {
  const { error } = await supabase.from('scenario_results').delete().eq('id', id);
  if (error) throw error;
}

// External indicators
export async function getExternalIndicators(): Promise<ExternalIndicator[]> {
  const { data, error } = await supabase
    .from('external_indicators')
    .select('*')
    .order('effective_date', { ascending: false });

  if (error) throw error;
  
  return (data || []).map(d => ({
    id: d.id,
    indicator_name: d.indicator_name,
    indicator_type: d.indicator_type,
    base_value: Number(d.base_value),
    scenario_adjustment: Number(d.scenario_adjustment),
    effective_date: d.effective_date,
  }));
}

export async function saveExternalIndicator(indicator: Omit<ExternalIndicator, 'id'>): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase.from('external_indicators').insert({
    ...indicator,
    user_id: user.id,
  });

  if (error) throw error;
}
