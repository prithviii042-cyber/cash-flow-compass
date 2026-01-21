-- Fix the calculate_aging_bucket function to have proper search_path
CREATE OR REPLACE FUNCTION public.calculate_aging_bucket(p_due_date DATE)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE 
    WHEN CURRENT_DATE - p_due_date <= 0 THEN 'Current'
    WHEN CURRENT_DATE - p_due_date <= 30 THEN '0-30'
    WHEN CURRENT_DATE - p_due_date <= 60 THEN '31-60'
    WHEN CURRENT_DATE - p_due_date <= 90 THEN '61-90'
    WHEN CURRENT_DATE - p_due_date <= 120 THEN '91-120'
    ELSE '120+'
  END
$$;