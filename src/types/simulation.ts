export interface SimulationParams {
  customerPaymentDelayDays: number;
  collectionEfficiencyAdjustment: number;
  oilPriceChange: number;
  fxChange: number;
}

export interface ScenarioResult {
  id?: string;
  scenario_name: string;
  scenario_date: string;
  inflows: number;
  outflows: number;
  net_cash: number;
  liquidity_risk_level: string;
  simulation_params: SimulationParams;
}

export interface ExternalIndicator {
  id?: string;
  indicator_name: string;
  indicator_type: 'payment' | 'oil' | 'fx' | 'macro';
  base_value: number;
  scenario_adjustment: number;
  effective_date: string;
}

export const BUSINESS_UNIT_SENSITIVITY = {
  aviation: { oil: 1.5, fx: 0.8, volatility: 1.2 },
  marine: { oil: 0.8, fx: 1.3, volatility: 1.0 },
  trading: { oil: 1.0, fx: 1.0, volatility: 1.8 },
  land: { oil: 0.5, fx: 0.5, volatility: 0.6 },
} as const;

export const DEFAULT_SIMULATION_PARAMS: SimulationParams = {
  customerPaymentDelayDays: 0,
  collectionEfficiencyAdjustment: 100,
  oilPriceChange: 0,
  fxChange: 0,
};
