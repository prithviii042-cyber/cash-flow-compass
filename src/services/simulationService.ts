import { supabase } from "@/integrations/supabase/client";
import type { SimulationParams, ScenarioResult, ExternalIndicator } from "@/types/simulation";
import { addDays, format, parseISO, startOfDay, differenceInDays } from "date-fns";

const SENSITIVITY = {
  Aviation: { oil: 1.5, fx: 0.8, volatility: 1.2 },
  Marine: { oil: 0.8, fx: 1.3, volatility: 1.0 },
  Trading: { oil: 1.0, fx: 1.0, volatility: 1.8 },
  Land: { oil: 0.5, fx: 0.5, volatility: 0.6 },
} as const;

type BusinessUnit = keyof typeof SENSITIVITY;

interface IndicatorImpact {
  oilPriceMultiplier: number;
  fxMultiplier: number;
  paymentDelayDays: number;
  collectionRateAdjustment: number;
  macroMultiplier: number;
}

// Calculate dynamic impact from external indicators
function calculateIndicatorImpact(indicators: ExternalIndicator[]): IndicatorImpact {
  const impact: IndicatorImpact = {
    oilPriceMultiplier: 1,
    fxMultiplier: 1,
    paymentDelayDays: 0,
    collectionRateAdjustment: 0,
    macroMultiplier: 1,
  };

  // Group indicators by type and calculate average adjustment
  const oilIndicators = indicators.filter(i => i.indicator_type === 'oil');
  const fxIndicators = indicators.filter(i => i.indicator_type === 'fx');
  const paymentIndicators = indicators.filter(i => i.indicator_type === 'payment');
  const macroIndicators = indicators.filter(i => i.indicator_type === 'macro');

  // Oil: Average scenario adjustment affects costs
  if (oilIndicators.length > 0) {
    const avgOilAdjustment = oilIndicators.reduce((sum, i) => sum + i.scenario_adjustment, 0) / oilIndicators.length;
    impact.oilPriceMultiplier = 1 + (avgOilAdjustment / 100);
  }

  // FX: Average scenario adjustment affects currency conversion
  if (fxIndicators.length > 0) {
    const avgFxAdjustment = fxIndicators.reduce((sum, i) => sum + i.scenario_adjustment, 0) / fxIndicators.length;
    impact.fxMultiplier = 1 + (avgFxAdjustment / 100);
  }

  // Payment: Look for specific indicators
  paymentIndicators.forEach(ind => {
    const name = ind.indicator_name.toLowerCase();
    if (name.includes('delay') || name.includes('days')) {
      impact.paymentDelayDays += ind.scenario_adjustment;
    }
    if (name.includes('collection') || name.includes('rate')) {
      impact.collectionRateAdjustment += ind.scenario_adjustment;
    }
  });

  // Macro: GDP/Inflation affects overall confidence
  if (macroIndicators.length > 0) {
    const avgMacroAdjustment = macroIndicators.reduce((sum, i) => sum + i.scenario_adjustment, 0) / macroIndicators.length;
    // Positive macro = slightly better collections, negative = worse
    impact.macroMultiplier = 1 + (avgMacroAdjustment / 100) * 0.5;
  }

  return impact;
}

export async function runSimulation(params: SimulationParams): Promise<{
  inflows: number;
  outflows: number;
  netCash: number;
  liquidityRiskLevel: string;
  byBusinessUnit: Record<string, { inflows: number; outflows: number; netCash: number }>;
  dailyForecast: Array<{ date: string; inflows: number; outflows: number; netCash: number }>;
  indicatorImpact?: IndicatorImpact;
}> {
  // Fetch all data in parallel
  const [arResult, apResult, patternsResult, indicatorsResult] = await Promise.all([
    supabase.from('ar_aging').select('*'),
    supabase.from('ap_aging').select('*'),
    supabase.from('historical_patterns').select('*'),
    supabase.from('external_indicators').select('*'),
  ]);

  const arData = arResult.data || [];
  const apData = apResult.data || [];
  const patternsData = patternsResult.data || [];
  const indicatorsData: ExternalIndicator[] = (indicatorsResult.data || []).map(d => ({
    id: d.id,
    indicator_name: d.indicator_name,
    indicator_type: d.indicator_type as 'payment' | 'oil' | 'fx' | 'macro',
    base_value: Number(d.base_value),
    scenario_adjustment: Number(d.scenario_adjustment),
    effective_date: d.effective_date,
  }));

  // Calculate dynamic indicator impact
  const indicatorImpact = calculateIndicatorImpact(indicatorsData);

  const patterns = patternsData.reduce((acc, p) => {
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
  arData.forEach(ar => {
    const bu = ar.business_unit as BusinessUnit;
    const sensitivity = SENSITIVITY[bu] || SENSITIVITY.Land;
    
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
    
    // Apply simulation adjustments + external indicator impacts
    const baseEfficiency = params.collectionEfficiencyAdjustment / 100;
    const indicatorCollectionBoost = 1 + (indicatorImpact.collectionRateAdjustment / 100);
    const macroEffect = indicatorImpact.macroMultiplier;
    
    const adjustedProbability = Math.min(1, Math.max(0, 
      pattern.probability * baseEfficiency * indicatorCollectionBoost * macroEffect
    ));
    
    // Payment delays from both slider and indicators
    const totalDelayDays = pattern.avgDaysLate + params.customerPaymentDelayDays + indicatorImpact.paymentDelayDays;
    
    // FX adjustment: combine slider + external indicators
    const sliderFxEffect = 1 + (params.fxChange / 100) * sensitivity.fx;
    const indicatorFxEffect = Math.pow(indicatorImpact.fxMultiplier, sensitivity.fx);
    const totalFxAdjustment = sliderFxEffect * indicatorFxEffect;
    
    // Oil adjustment for inflows (indirect effect on customer purchasing power)
    const sliderOilEffect = 1 + (params.oilPriceChange / 100) * sensitivity.oil * 0.1;
    const indicatorOilEffect = 1 + (indicatorImpact.oilPriceMultiplier - 1) * sensitivity.oil * 0.1;
    const totalOilAdjustment = sliderOilEffect * indicatorOilEffect;
    
    const adjustedAmount = Number(ar.outstanding_amount) * adjustedProbability * totalFxAdjustment * totalOilAdjustment * sensitivity.volatility;
    const expectedDate = addDays(dueDate, Math.round(totalDelayDays));
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
  apData.forEach(ap => {
    const bu = ap.business_unit as BusinessUnit;
    const sensitivity = SENSITIVITY[bu] || SENSITIVITY.Land;
    
    // FX adjustment: combine slider + external indicators
    const sliderFxEffect = 1 + (params.fxChange / 100) * sensitivity.fx;
    const indicatorFxEffect = Math.pow(indicatorImpact.fxMultiplier, sensitivity.fx);
    const totalFxAdjustment = sliderFxEffect * indicatorFxEffect;
    
    // Oil adjustment: direct impact on fuel/commodity costs
    const sliderOilEffect = 1 + (params.oilPriceChange / 100) * sensitivity.oil;
    const indicatorOilEffect = Math.pow(indicatorImpact.oilPriceMultiplier, sensitivity.oil);
    const totalOilAdjustment = sliderOilEffect * indicatorOilEffect;
    
    const adjustedAmount = Number(ap.outstanding_amount) * totalFxAdjustment * totalOilAdjustment;
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
    indicatorImpact,
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
