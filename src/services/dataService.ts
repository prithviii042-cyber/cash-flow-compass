import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import type { UploadValidation, BusinessUnit } from '@/types/cashflow';

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

// Helper to calculate aging bucket on the client side
export function calculateAgingBucket(dueDate: Date): string {
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return 'Current';
  if (diffDays <= 30) return '0-30';
  if (diffDays <= 60) return '31-60';
  if (diffDays <= 90) return '61-90';
  if (diffDays <= 120) return '91-120';
  return '120+';
}

// AR Aging Service
export const arAgingService = {
  async getAll(businessUnit?: BusinessUnit) {
    let query = supabase.from('ar_aging').select('*').order('due_date', { ascending: true });
    
    if (businessUnit) {
      query = query.eq('business_unit', businessUnit as DBBusinessUnit);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async insert(records: ARAgingInput[]): Promise<UploadValidation> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const recordsWithUser = records.map(record => ({
      ...record,
      user_id: user?.id || null,
    }));

    const { data, error } = await supabase.from('ar_aging').insert(recordsWithUser).select();
    
    if (error) {
      return {
        success: false,
        errors: [error.message],
        warnings: [],
        recordCount: 0,
      };
    }

    return {
      success: true,
      errors: [],
      warnings: [],
      recordCount: data.length,
    };
  },

  async delete(id: string) {
    const { error } = await supabase.from('ar_aging').delete().eq('id', id);
    if (error) throw error;
  },
};

// AP Aging Service
export const apAgingService = {
  async getAll(businessUnit?: BusinessUnit) {
    let query = supabase.from('ap_aging').select('*').order('due_date', { ascending: true });
    
    if (businessUnit) {
      query = query.eq('business_unit', businessUnit as DBBusinessUnit);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async insert(records: APAgingInput[]): Promise<UploadValidation> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const recordsWithUser = records.map(record => ({
      ...record,
      critical_flag: record.critical_flag ?? false,
      user_id: user?.id || null,
    }));

    const { data, error } = await supabase.from('ap_aging').insert(recordsWithUser).select();
    
    if (error) {
      return {
        success: false,
        errors: [error.message],
        warnings: [],
        recordCount: 0,
      };
    }

    return {
      success: true,
      errors: [],
      warnings: [],
      recordCount: data.length,
    };
  },

  async delete(id: string) {
    const { error } = await supabase.from('ap_aging').delete().eq('id', id);
    if (error) throw error;
  },
};

// Contract Terms Service
export const contractTermsService = {
  async getAll(businessUnit?: BusinessUnit) {
    let query = supabase.from('contract_terms').select('*').order('created_at', { ascending: false });
    
    if (businessUnit) {
      query = query.eq('business_unit', businessUnit as DBBusinessUnit);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getByCounterparty(counterpartyId: string) {
    const { data, error } = await supabase
      .from('contract_terms')
      .select('*')
      .eq('counterparty_id', counterpartyId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async insert(records: ContractTermsInput[]): Promise<UploadValidation> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const recordsWithUser = records.map(record => ({
      ...record,
      advance_payment_percent: record.advance_payment_percent ?? 0,
      penalty_or_prebill: record.penalty_or_prebill ?? false,
      user_id: user?.id || null,
    }));

    const { data, error } = await supabase.from('contract_terms').insert(recordsWithUser).select();
    
    if (error) {
      return {
        success: false,
        errors: [error.message],
        warnings: [],
        recordCount: 0,
      };
    }

    // Check for Spot contracts without payment terms
    const warnings: string[] = [];
    const spotWithoutTerms = records.filter(r => 
      r.contract_type === 'Spot' && (!r.payment_terms_days || r.payment_terms_days === 0)
    );
    if (spotWithoutTerms.length > 0) {
      warnings.push(`${spotWithoutTerms.length} Spot contract(s) have no payment terms defined`);
    }

    return {
      success: true,
      errors: [],
      warnings,
      recordCount: data.length,
    };
  },

  async delete(id: string) {
    const { error } = await supabase.from('contract_terms').delete().eq('id', id);
    if (error) throw error;
  },
};

// Historical Patterns Service
export const historicalPatternsService = {
  async getAll(businessUnit?: BusinessUnit) {
    let query = supabase.from('historical_patterns').select('*').order('business_unit', { ascending: true });
    
    if (businessUnit) {
      query = query.eq('business_unit', businessUnit as DBBusinessUnit);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getByBusinessUnitAndBucket(businessUnit: BusinessUnit, agingBucket: string) {
    const { data, error } = await supabase
      .from('historical_patterns')
      .select('*')
      .eq('business_unit', businessUnit as DBBusinessUnit)
      .eq('aging_bucket', agingBucket)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async insert(records: HistoricalPatternsInput[]): Promise<UploadValidation> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const recordsWithUser = records.map(record => ({
      ...record,
      avg_days_late: record.avg_days_late ?? 0,
      user_id: user?.id || null,
    }));

    const { data, error } = await supabase.from('historical_patterns').insert(recordsWithUser).select();
    
    if (error) {
      return {
        success: false,
        errors: [error.message],
        warnings: [],
        recordCount: 0,
      };
    }

    return {
      success: true,
      errors: [],
      warnings: [],
      recordCount: data.length,
    };
  },

  // Note: Delete is intentionally not implemented per security requirements
};

// Validation helpers
export async function validateARUpload(records: Partial<ARAgingInput>[]): Promise<UploadValidation> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for missing business unit
  const missingBU = records.filter(r => !r.business_unit);
  if (missingBU.length > 0) {
    errors.push(`${missingBU.length} record(s) are missing Business_Unit (required)`);
  }

  // Check for matching contract terms
  const customerIds = [...new Set(records.map(r => r.customer_id).filter(Boolean))];
  const { data: contracts } = await supabase
    .from('contract_terms')
    .select('counterparty_id')
    .in('counterparty_id', customerIds as string[]);
  
  const contractCustomerIds = new Set(contracts?.map(c => c.counterparty_id) || []);
  const unmatchedCustomers = customerIds.filter(id => !contractCustomerIds.has(id as string));
  
  if (unmatchedCustomers.length > 0) {
    warnings.push(`${unmatchedCustomers.length} customer(s) have no matching CONTRACT_TERMS`);
  }

  return {
    success: errors.length === 0,
    errors,
    warnings,
    recordCount: records.length,
  };
}

export async function validateAPUpload(records: Partial<APAgingInput>[]): Promise<UploadValidation> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for missing business unit
  const missingBU = records.filter(r => !r.business_unit);
  if (missingBU.length > 0) {
    errors.push(`${missingBU.length} record(s) are missing Business_Unit (required)`);
  }

  return {
    success: errors.length === 0,
    errors,
    warnings,
    recordCount: records.length,
  };
}
