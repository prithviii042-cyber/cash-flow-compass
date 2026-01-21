-- Create enum for business units
CREATE TYPE public.business_unit AS ENUM ('Aviation', 'Marine', 'Land', 'Trading');

-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('treasury', 'fpa');

-- Create enum for contract types
CREATE TYPE public.contract_type AS ENUM ('Spot', 'Term');

-- Create user_roles table for role-based access control
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create AR_AGING table (aging_bucket calculated on read, not stored)
CREATE TABLE public.ar_aging (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_id TEXT NOT NULL,
    business_unit business_unit NOT NULL,
    invoice_id TEXT NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    invoice_amount NUMERIC(15,2) NOT NULL,
    outstanding_amount NUMERIC(15,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AP_AGING table
CREATE TABLE public.ap_aging (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    vendor_id TEXT NOT NULL,
    business_unit business_unit NOT NULL,
    invoice_id TEXT NOT NULL,
    due_date DATE NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    invoice_amount NUMERIC(15,2) NOT NULL,
    outstanding_amount NUMERIC(15,2) NOT NULL,
    critical_flag BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create CONTRACT_TERMS table
CREATE TABLE public.contract_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    counterparty_id TEXT NOT NULL,
    business_unit business_unit NOT NULL,
    payment_terms_days INTEGER NOT NULL,
    contract_type contract_type NOT NULL,
    advance_payment_percent NUMERIC(5,2) DEFAULT 0,
    penalty_or_prebill BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create HISTORICAL_PATTERNS table
CREATE TABLE public.historical_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    business_unit business_unit NOT NULL,
    aging_bucket TEXT NOT NULL,
    collection_probability NUMERIC(5,4) NOT NULL CHECK (collection_probability >= 0 AND collection_probability <= 1),
    avg_days_late INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for user info
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_aging ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ap_aging ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historical_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Helper function: Check if user is treasury
CREATE OR REPLACE FUNCTION public.is_treasury()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'treasury')
$$;

-- Helper function: Check if user is FP&A
CREATE OR REPLACE FUNCTION public.is_fpa()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'fpa')
$$;

-- Helper function: Check if user has any valid role
CREATE OR REPLACE FUNCTION public.has_valid_role()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_treasury() OR public.is_fpa()
$$;

-- Function to calculate aging bucket dynamically
CREATE OR REPLACE FUNCTION public.calculate_aging_bucket(p_due_date DATE)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
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

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_ar_aging_updated_at BEFORE UPDATE ON public.ar_aging FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ap_aging_updated_at BEFORE UPDATE ON public.ap_aging FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contract_terms_updated_at BEFORE UPDATE ON public.contract_terms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_historical_patterns_updated_at BEFORE UPDATE ON public.historical_patterns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user profiles
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for user_roles (only treasury can manage roles)
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Treasury can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.is_treasury());
CREATE POLICY "Treasury can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.is_treasury());

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- RLS Policies for AR_AGING
CREATE POLICY "Treasury and FP&A can view AR aging" ON public.ar_aging FOR SELECT TO authenticated USING (public.has_valid_role());
CREATE POLICY "Treasury and FP&A can insert AR aging" ON public.ar_aging FOR INSERT TO authenticated WITH CHECK (public.has_valid_role());
CREATE POLICY "Treasury can update AR aging" ON public.ar_aging FOR UPDATE TO authenticated USING (public.is_treasury());
CREATE POLICY "Treasury can delete AR aging" ON public.ar_aging FOR DELETE TO authenticated USING (public.is_treasury());

-- RLS Policies for AP_AGING
CREATE POLICY "Treasury and FP&A can view AP aging" ON public.ap_aging FOR SELECT TO authenticated USING (public.has_valid_role());
CREATE POLICY "Treasury and FP&A can insert AP aging" ON public.ap_aging FOR INSERT TO authenticated WITH CHECK (public.has_valid_role());
CREATE POLICY "Treasury can update AP aging" ON public.ap_aging FOR UPDATE TO authenticated USING (public.is_treasury());
CREATE POLICY "Treasury can delete AP aging" ON public.ap_aging FOR DELETE TO authenticated USING (public.is_treasury());

-- RLS Policies for CONTRACT_TERMS
CREATE POLICY "Treasury and FP&A can view contracts" ON public.contract_terms FOR SELECT TO authenticated USING (public.has_valid_role());
CREATE POLICY "Treasury and FP&A can insert contracts" ON public.contract_terms FOR INSERT TO authenticated WITH CHECK (public.has_valid_role());
CREATE POLICY "Treasury can update contracts" ON public.contract_terms FOR UPDATE TO authenticated USING (public.is_treasury());
CREATE POLICY "Treasury can delete contracts" ON public.contract_terms FOR DELETE TO authenticated USING (public.is_treasury());

-- RLS Policies for HISTORICAL_PATTERNS (NO DELETE allowed for anyone - historical data protection)
CREATE POLICY "Treasury and FP&A can view patterns" ON public.historical_patterns FOR SELECT TO authenticated USING (public.has_valid_role());
CREATE POLICY "Treasury and FP&A can insert patterns" ON public.historical_patterns FOR INSERT TO authenticated WITH CHECK (public.has_valid_role());
CREATE POLICY "Treasury can update patterns" ON public.historical_patterns FOR UPDATE TO authenticated USING (public.is_treasury());
-- Note: No DELETE policy for historical_patterns - deletion is disabled per security requirements

-- Create indexes for performance
CREATE INDEX idx_ar_aging_business_unit ON public.ar_aging(business_unit);
CREATE INDEX idx_ar_aging_due_date ON public.ar_aging(due_date);
CREATE INDEX idx_ar_aging_customer_id ON public.ar_aging(customer_id);
CREATE INDEX idx_ap_aging_business_unit ON public.ap_aging(business_unit);
CREATE INDEX idx_ap_aging_due_date ON public.ap_aging(due_date);
CREATE INDEX idx_ap_aging_vendor_id ON public.ap_aging(vendor_id);
CREATE INDEX idx_contract_terms_business_unit ON public.contract_terms(business_unit);
CREATE INDEX idx_contract_terms_counterparty ON public.contract_terms(counterparty_id);
CREATE INDEX idx_historical_patterns_business_unit ON public.historical_patterns(business_unit);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);