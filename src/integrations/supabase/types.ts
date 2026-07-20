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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          account_name: string
          active: boolean
          assigned_salesperson_id: number | null
          created_at: string
          customer_number: string
          date_last_sale: string | null
          id: string
          notes: string | null
          priority: string
          region: string | null
          source: string
          territory: string | null
          updated_at: string
        }
        Insert: {
          account_name: string
          active?: boolean
          assigned_salesperson_id?: number | null
          created_at?: string
          customer_number: string
          date_last_sale?: string | null
          id?: string
          notes?: string | null
          priority?: string
          region?: string | null
          source?: string
          territory?: string | null
          updated_at?: string
        }
        Update: {
          account_name?: string
          active?: boolean
          assigned_salesperson_id?: number | null
          created_at?: string
          customer_number?: string
          date_last_sale?: string | null
          id?: string
          notes?: string | null
          priority?: string
          region?: string | null
          source?: string
          territory?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_assigned_salesperson_id_fkey"
            columns: ["assigned_salesperson_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_assigned_salesperson_id_fkey"
            columns: ["assigned_salesperson_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_insights: {
        Row: {
          content: string
          content_type: string
          created_at: string
          id: string
          user_id: number | null
        }
        Insert: {
          content: string
          content_type: string
          created_at?: string
          id?: string
          user_id?: number | null
        }
        Update: {
          content?: string
          content_type?: string
          created_at?: string
          id?: string
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_insights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      call_notes: {
        Row: {
          account_id: string
          call_task_id: string | null
          created_at: string
          id: string
          next_follow_up_date: string | null
          note: string
          outcome: string | null
          salesperson_id: number | null
        }
        Insert: {
          account_id: string
          call_task_id?: string | null
          created_at?: string
          id?: string
          next_follow_up_date?: string | null
          note: string
          outcome?: string | null
          salesperson_id?: number | null
        }
        Update: {
          account_id?: string
          call_task_id?: string | null
          created_at?: string
          id?: string
          next_follow_up_date?: string | null
          note?: string
          outcome?: string | null
          salesperson_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "call_notes_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_notes_call_task_id_fkey"
            columns: ["call_task_id"]
            isOneToOne: false
            referencedRelation: "call_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_notes_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_notes_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      call_tasks: {
        Row: {
          account_id: string
          assigned_salesperson_id: number | null
          completed_at: string | null
          created_at: string
          due_date: string | null
          id: string
          priority: string
          rollover_count: number
          status: string
          territory: string | null
          updated_at: string
          week_start_date: string
        }
        Insert: {
          account_id: string
          assigned_salesperson_id?: number | null
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          priority?: string
          rollover_count?: number
          status?: string
          territory?: string | null
          updated_at?: string
          week_start_date: string
        }
        Update: {
          account_id?: string
          assigned_salesperson_id?: number | null
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          priority?: string
          rollover_count?: number
          status?: string
          territory?: string | null
          updated_at?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_tasks_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_tasks_assigned_salesperson_id_fkey"
            columns: ["assigned_salesperson_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_tasks_assigned_salesperson_id_fkey"
            columns: ["assigned_salesperson_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      import_batches: {
        Row: {
          created_count: number | null
          error_count: number | null
          errors: Json | null
          file_name: string
          id: string
          notes: string | null
          skipped_count: number | null
          total_rows: number | null
          updated_count: number | null
          uploaded_at: string
          uploaded_by: number | null
        }
        Insert: {
          created_count?: number | null
          error_count?: number | null
          errors?: Json | null
          file_name: string
          id?: string
          notes?: string | null
          skipped_count?: number | null
          total_rows?: number | null
          updated_count?: number | null
          uploaded_at?: string
          uploaded_by?: number | null
        }
        Update: {
          created_count?: number | null
          error_count?: number | null
          errors?: Json | null
          file_name?: string
          id?: string
          notes?: string | null
          skipped_count?: number | null
          total_rows?: number | null
          updated_count?: number | null
          uploaded_at?: string
          uploaded_by?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "import_batches_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_batches_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          notifications: Json[] | null
          updated_at: string
          user_id: number
        }
        Insert: {
          created_at?: string
          id?: string
          notifications?: Json[] | null
          updated_at?: string
          user_id: number
        }
        Update: {
          created_at?: string
          id?: string
          notifications?: Json[] | null
          updated_at?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      prospects: {
        Row: {
          activity_log: Json[] | null
          ai_company_insights: Json[] | null
          business_address: string | null
          business_name: string
          created_at: string | null
          email: string | null
          id: string
          last_contact: string | null
          location_type: string | null
          notes: string | null
          owner_email: string | null
          owner_name: string | null
          owner_phone: string | null
          phone_number: string | null
          priority: string | null
          rating: number | null
          review_count: number | null
          status: string | null
          territory: string | null
          updated_at: string | null
          user_id: number
          website: string | null
        }
        Insert: {
          activity_log?: Json[] | null
          ai_company_insights?: Json[] | null
          business_address?: string | null
          business_name: string
          created_at?: string | null
          email?: string | null
          id?: string
          last_contact?: string | null
          location_type?: string | null
          notes?: string | null
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          phone_number?: string | null
          priority?: string | null
          rating?: number | null
          review_count?: number | null
          status?: string | null
          territory?: string | null
          updated_at?: string | null
          user_id: number
          website?: string | null
        }
        Update: {
          activity_log?: Json[] | null
          ai_company_insights?: Json[] | null
          business_address?: string | null
          business_name?: string
          created_at?: string | null
          email?: string | null
          id?: string
          last_contact?: string | null
          location_type?: string | null
          notes?: string | null
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          phone_number?: string | null
          priority?: string | null
          rating?: number | null
          review_count?: number | null
          status?: string | null
          territory?: string | null
          updated_at?: string | null
          user_id?: number
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          created_at: string | null
          id: string
          keyword: string
          location: string
          radius: number | null
          results: Json
          user_id: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          keyword: string
          location: string
          radius?: number | null
          results: Json
          user_id?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          keyword?: string
          location?: string
          radius?: number | null
          results?: Json
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_searches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_searches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      territories: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          user_id: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          user_id: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "territories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "territories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_insights_tracking: {
        Row: {
          last_pep_talk_date: string | null
          last_recommendations_date: string | null
          user_id: number
        }
        Insert: {
          last_pep_talk_date?: string | null
          last_recommendations_date?: string | null
          user_id: number
        }
        Update: {
          last_pep_talk_date?: string | null
          last_recommendations_date?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_insights_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_insights_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: number
          lastLogin: string | null
          password: string | null
          region: string | null
          role: string | null
          savedSearches: number | null
          supervisor_id: number | null
          territory: string | null
          totalSearches: number | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: number
          lastLogin?: string | null
          password?: string | null
          region?: string | null
          role?: string | null
          savedSearches?: number | null
          supervisor_id?: number | null
          territory?: string | null
          totalSearches?: number | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: number
          lastLogin?: string | null
          password?: string | null
          region?: string | null
          role?: string | null
          savedSearches?: number | null
          supervisor_id?: number | null
          territory?: string | null
          totalSearches?: number | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      user_stats: {
        Row: {
          id: number | null
          searches_last_30_days: number | null
          total_prospects: number | null
          total_saved_searches: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      current_user_id: { Args: never; Returns: number }
      current_user_region: { Args: never; Returns: string }
      current_user_role: { Args: never; Returns: string }
      get_calls_dashboard: {
        Args: { p_user_id: number; p_week_start: string }
        Returns: {
          completed_this_week: number
          follow_ups_due: number
          not_called_yet: number
          overdue_calls: number
          rolled_over: number
          sold_this_week: number
          this_week_calls: number
        }[]
      }
      get_dashboard_metrics: {
        Args: {
          p_supervisor_id?: number
          p_user_id: number
          p_user_type: string
        }
        Returns: {
          emails_sent: number
          face_to_face: number
          new_prospects: number
          total_prospects: number
        }[]
      }
      roll_over_and_seed_week: {
        Args: { p_salesperson_id: number; p_week_start: string }
        Returns: undefined
      }
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
