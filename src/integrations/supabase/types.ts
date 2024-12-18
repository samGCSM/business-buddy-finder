export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
          business_address: string | null
          business_name: string
          created_at: string | null
          email: string | null
          id: string
          last_contact: string | null
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
          business_address?: string | null
          business_name: string
          created_at?: string | null
          email?: string | null
          id?: string
          last_contact?: string | null
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
          business_address?: string | null
          business_name?: string
          created_at?: string | null
          email?: string | null
          id?: string
          last_contact?: string | null
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
          results: Json
          user_id: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          keyword: string
          location: string
          results: Json
          user_id?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          keyword?: string
          location?: string
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
          id: number
          lastLogin: string | null
          password: string | null
          role: string | null
          savedSearches: number | null
          supervisor_id: number | null
          totalSearches: number | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: number
          lastLogin?: string | null
          password?: string | null
          role?: string | null
          savedSearches?: number | null
          supervisor_id?: number | null
          totalSearches?: number | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: number
          lastLogin?: string | null
          password?: string | null
          role?: string | null
          savedSearches?: number | null
          supervisor_id?: number | null
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
      current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: number
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
