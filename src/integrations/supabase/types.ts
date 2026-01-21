export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ap_aging: {
        Row: {
          business_unit: Database["public"]["Enums"]["business_unit"]
          created_at: string
          critical_flag: boolean
          currency: string
          due_date: string
          id: string
          invoice_amount: number
          invoice_id: string
          outstanding_amount: number
          updated_at: string
          user_id: string | null
          vendor_id: string
        }
        Insert: {
          business_unit: Database["public"]["Enums"]["business_unit"]
          created_at?: string
          critical_flag?: boolean
          currency?: string
          due_date: string
          id?: string
          invoice_amount: number
          invoice_id: string
          outstanding_amount: number
          updated_at?: string
          user_id?: string | null
          vendor_id: string
        }
        Update: {
          business_unit?: Database["public"]["Enums"]["business_unit"]
          created_at?: string
          critical_flag?: boolean
          currency?: string
          due_date?: string
          id?: string
          invoice_amount?: number
          invoice_id?: string
          outstanding_amount?: number
          updated_at?: string
          user_id?: string | null
          vendor_id?: string
        }
        Relationships: []
      }
      ar_aging: {
        Row: {
          business_unit: Database["public"]["Enums"]["business_unit"]
          created_at: string
          currency: string
          customer_id: string
          due_date: string
          id: string
          invoice_amount: number
          invoice_date: string
          invoice_id: string
          outstanding_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          business_unit: Database["public"]["Enums"]["business_unit"]
          created_at?: string
          currency?: string
          customer_id: string
          due_date: string
          id?: string
          invoice_amount: number
          invoice_date: string
          invoice_id: string
          outstanding_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          business_unit?: Database["public"]["Enums"]["business_unit"]
          created_at?: string
          currency?: string
          customer_id?: string
          due_date?: string
          id?: string
          invoice_amount?: number
          invoice_date?: string
          invoice_id?: string
          outstanding_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      contract_terms: {
        Row: {
          advance_payment_percent: number | null
          business_unit: Database["public"]["Enums"]["business_unit"]
          contract_type: Database["public"]["Enums"]["contract_type"]
          counterparty_id: string
          created_at: string
          id: string
          payment_terms_days: number
          penalty_or_prebill: boolean
          updated_at: string
          user_id: string | null
        }
        Insert: {
          advance_payment_percent?: number | null
          business_unit: Database["public"]["Enums"]["business_unit"]
          contract_type: Database["public"]["Enums"]["contract_type"]
          counterparty_id: string
          created_at?: string
          id?: string
          payment_terms_days: number
          penalty_or_prebill?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          advance_payment_percent?: number | null
          business_unit?: Database["public"]["Enums"]["business_unit"]
          contract_type?: Database["public"]["Enums"]["contract_type"]
          counterparty_id?: string
          created_at?: string
          id?: string
          payment_terms_days?: number
          penalty_or_prebill?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      historical_patterns: {
        Row: {
          aging_bucket: string
          avg_days_late: number | null
          business_unit: Database["public"]["Enums"]["business_unit"]
          collection_probability: number
          created_at: string
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          aging_bucket: string
          avg_days_late?: number | null
          business_unit: Database["public"]["Enums"]["business_unit"]
          collection_probability: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          aging_bucket?: string
          avg_days_late?: number | null
          business_unit?: Database["public"]["Enums"]["business_unit"]
          collection_probability?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_aging_bucket: { Args: { p_due_date: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_valid_role: { Args: never; Returns: boolean }
      is_fpa: { Args: never; Returns: boolean }
      is_treasury: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "treasury" | "fpa"
      business_unit: "Aviation" | "Marine" | "Land" | "Trading"
      contract_type: "Spot" | "Term"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["treasury", "fpa"],
      business_unit: ["Aviation", "Marine", "Land", "Trading"],
      contract_type: ["Spot", "Term"],
    },
  },
} as const
