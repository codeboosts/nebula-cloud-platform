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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      credits: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          service_type: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description: string
          id?: string
          service_type?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          service_type?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      managed_databases: {
        Row: {
          connection_string: string | null
          created_at: string
          database_type: string
          id: string
          instance_size: string
          monthly_cost: number
          name: string
          region: string
          status: string
          storage_gb: number
          updated_at: string
          user_id: string
          version: string
        }
        Insert: {
          connection_string?: string | null
          created_at?: string
          database_type: string
          id?: string
          instance_size?: string
          monthly_cost: number
          name: string
          region?: string
          status?: string
          storage_gb?: number
          updated_at?: string
          user_id: string
          version: string
        }
        Update: {
          connection_string?: string | null
          created_at?: string
          database_type?: string
          id?: string
          instance_size?: string
          monthly_cost?: number
          name?: string
          region?: string
          status?: string
          storage_gb?: number
          updated_at?: string
          user_id?: string
          version?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          resource_id: string | null
          service_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          resource_id?: string | null
          service_type?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          resource_id?: string | null
          service_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      pipelines: {
        Row: {
          branch: string | null
          created_at: string
          id: string
          last_run_at: string | null
          name: string
          repository_url: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          branch?: string | null
          created_at?: string
          id?: string
          last_run_at?: string | null
          name: string
          repository_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          branch?: string | null
          created_at?: string
          id?: string
          last_run_at?: string | null
          name?: string
          repository_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_group_rules: {
        Row: {
          created_at: string
          description: string | null
          id: string
          port_range: string
          protocol: string
          rule_type: string
          security_group_id: string
          source_destination: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          port_range: string
          protocol: string
          rule_type: string
          security_group_id: string
          source_destination: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          port_range?: string
          protocol?: string
          rule_type?: string
          security_group_id?: string
          source_destination?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_group_rules_security_group_id_fkey"
            columns: ["security_group_id"]
            isOneToOne: false
            referencedRelation: "security_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      security_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      storage_buckets: {
        Row: {
          created_at: string
          file_count: number | null
          id: string
          monthly_cost: number | null
          name: string
          public_access: boolean
          region: string
          size_bytes: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_count?: number | null
          id?: string
          monthly_cost?: number | null
          name: string
          public_access?: boolean
          region?: string
          size_bytes?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_count?: number | null
          id?: string
          monthly_cost?: number | null
          name?: string
          public_access?: boolean
          region?: string
          size_bytes?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vps_instances: {
        Row: {
          cpu_cores: number
          created_at: string
          id: string
          image: string
          instance_type: string
          ip_address: unknown | null
          monthly_cost: number
          name: string
          ram_gb: number
          region: string
          status: string
          storage_gb: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cpu_cores: number
          created_at?: string
          id?: string
          image?: string
          instance_type: string
          ip_address?: unknown | null
          monthly_cost: number
          name: string
          ram_gb: number
          region?: string
          status?: string
          storage_gb: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cpu_cores?: number
          created_at?: string
          id?: string
          image?: string
          instance_type?: string
          ip_address?: unknown | null
          monthly_cost?: number
          name?: string
          ram_gb?: number
          region?: string
          status?: string
          storage_gb?: number
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
