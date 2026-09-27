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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      copy_allocations: {
        Row: {
          amount: number
          created_at: string
          deleted_at: string | null
          id: string
          status: string
          trader_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          deleted_at?: string | null
          id?: string
          status?: string
          trader_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          deleted_at?: string | null
          id?: string
          status?: string
          trader_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "copy_allocations_trader_id_fkey"
            columns: ["trader_id"]
            isOneToOne: false
            referencedRelation: "traders"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_wallets: {
        Row: {
          active: boolean
          address: string
          asset: string
          created_at: string
          deleted_at: string | null
          deposit_fee: number
          id: string
          max_deposit: number
          min_deposit: number
          network: string
          updated_at: string
          withdrawal_fee: number
        }
        Insert: {
          active?: boolean
          address: string
          asset: string
          created_at?: string
          deleted_at?: string | null
          deposit_fee?: number
          id?: string
          max_deposit?: number
          min_deposit?: number
          network: string
          updated_at?: string
          withdrawal_fee?: number
        }
        Update: {
          active?: boolean
          address?: string
          asset?: string
          created_at?: string
          deleted_at?: string | null
          deposit_fee?: number
          id?: string
          max_deposit?: number
          min_deposit?: number
          network?: string
          updated_at?: string
          withdrawal_fee?: number
        }
        Relationships: []
      }
      deposits: {
        Row: {
          amount: number
          asset: string
          created_at: string
          deleted_at: string | null
          id: string
          network: string
          status: string
          tx_reference: string | null
          updated_at: string
          user_id: string
          wallet_address: string | null
          wallet_id: string | null
        }
        Insert: {
          amount: number
          asset: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          network: string
          status?: string
          tx_reference?: string | null
          updated_at?: string
          user_id: string
          wallet_address?: string | null
          wallet_id?: string | null
        }
        Update: {
          amount?: number
          asset?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          network?: string
          status?: string
          tx_reference?: string | null
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deposits_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "crypto_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          message: string
          read_at: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          message: string
          read_at?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          message?: string
          read_at?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          balance: number
          country: string
          created_at: string
          deleted_at: string | null
          full_name: string
          id: string
          kyc_status: string
          phone: string
          updated_at: string
        }
        Insert: {
          balance?: number
          country?: string
          created_at?: string
          deleted_at?: string | null
          full_name?: string
          id: string
          kyc_status?: string
          phone?: string
          updated_at?: string
        }
        Update: {
          balance?: number
          country?: string
          created_at?: string
          deleted_at?: string | null
          full_name?: string
          id?: string
          kyc_status?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          message: string
          reply: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          message: string
          reply?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          message?: string
          reply?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      traders: {
        Row: {
          aum: number
          created_at: string
          deleted_at: string | null
          featured: boolean
          followers: number
          handle: string
          id: string
          name: string
          risk_level: string
          roi_12m: number
          strategy: string
          updated_at: string
        }
        Insert: {
          aum?: number
          created_at?: string
          deleted_at?: string | null
          featured?: boolean
          followers?: number
          handle: string
          id?: string
          name: string
          risk_level: string
          roi_12m?: number
          strategy: string
          updated_at?: string
        }
        Update: {
          aum?: number
          created_at?: string
          deleted_at?: string | null
          featured?: boolean
          followers?: number
          handle?: string
          id?: string
          name?: string
          risk_level?: string
          roi_12m?: number
          strategy?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
      withdrawals: {
        Row: {
          amount: number
          asset: string
          created_at: string
          deleted_at: string | null
          destination: string
          id: string
          network: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          asset?: string
          created_at?: string
          deleted_at?: string | null
          destination: string
          id?: string
          network: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          asset?: string
          created_at?: string
          deleted_at?: string | null
          destination?: string
          id?: string
          network?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      allocate_copy: {
        Args: { _amount: number; _trader_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      request_withdrawal: {
        Args: { _amount: number; _destination: string; _network: string }
        Returns: string
      }
      review_deposit: {
        Args: { _id: string; _status: string }
        Returns: undefined
      }
      review_kyc: {
        Args: { _status: string; _user_id: string }
        Returns: undefined
      }
      review_withdrawal: {
        Args: { _id: string; _status: string }
        Returns: undefined
      }
      set_copy_status: {
        Args: { _id: string; _status: string }
        Returns: undefined
      }
      submit_kyc: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["super_admin", "admin", "user"],
    },
  },
} as const
