-- Create enum for indicator types
CREATE TYPE public.indicator_type AS ENUM ('payment', 'oil', 'fx', 'macro');

-- Create external_indicators table
CREATE TABLE public.external_indicators (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    indicator_name TEXT NOT NULL,
    indicator_type indicator_type NOT NULL,
    base_value NUMERIC NOT NULL,
    scenario_adjustment NUMERIC NOT NULL DEFAULT 0,
    effective_date DATE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scenario_results table
CREATE TABLE public.scenario_results (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    scenario_name TEXT NOT NULL,
    scenario_date DATE NOT NULL,
    inflows NUMERIC NOT NULL DEFAULT 0,
    outflows NUMERIC NOT NULL DEFAULT 0,
    net_cash NUMERIC NOT NULL DEFAULT 0,
    liquidity_risk_level TEXT NOT NULL DEFAULT 'Low',
    simulation_params JSONB NOT NULL DEFAULT '{}',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.external_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenario_results ENABLE ROW LEVEL SECURITY;

-- RLS policies for external_indicators
CREATE POLICY "Treasury and FP&A can view indicators"
ON public.external_indicators FOR SELECT
USING (has_valid_role());

CREATE POLICY "Treasury and FP&A can insert indicators"
ON public.external_indicators FOR INSERT
WITH CHECK (has_valid_role());

CREATE POLICY "Treasury can update indicators"
ON public.external_indicators FOR UPDATE
USING (is_treasury());

CREATE POLICY "Treasury can delete indicators"
ON public.external_indicators FOR DELETE
USING (is_treasury());

-- RLS policies for scenario_results
CREATE POLICY "Treasury and FP&A can view scenarios"
ON public.scenario_results FOR SELECT
USING (has_valid_role());

CREATE POLICY "Treasury and FP&A can insert scenarios"
ON public.scenario_results FOR INSERT
WITH CHECK (has_valid_role());

CREATE POLICY "Treasury can update scenarios"
ON public.scenario_results FOR UPDATE
USING (is_treasury());

CREATE POLICY "Treasury can delete scenarios"
ON public.scenario_results FOR DELETE
USING (is_treasury());

-- Add triggers for updated_at
CREATE TRIGGER update_external_indicators_updated_at
BEFORE UPDATE ON public.external_indicators
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scenario_results_updated_at
BEFORE UPDATE ON public.scenario_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();