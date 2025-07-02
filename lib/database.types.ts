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
      admin_users: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          permissions: Json | null
          role: string
          updated_at: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_interactions: {
        Row: {
          id: string
          user_message: string | null
          ai_response: string | null
          processing_time_ms: number | null
          tokens_used: number | null
          created_at: string | null
          success: boolean | null
          error_message: string | null
          conversation_id: string | null
          ai_thread_id: string | null
        }
        Insert: {
          id?: string
          user_message?: string | null
          ai_response?: string | null
          processing_time_ms?: number | null
          tokens_used?: number | null
          created_at?: string | null
          success?: boolean | null
          error_message?: string | null
          conversation_id?: string | null
          ai_thread_id?: string | null
        }
        Update: {
          id?: string
          user_message?: string | null
          ai_response?: string | null
          processing_time_ms?: number | null
          tokens_used?: number | null
          created_at?: string | null
          success?: boolean | null
          error_message?: string | null
          conversation_id?: string | null
          ai_thread_id?: string | null
        }
        Relationships: []
      }
      albert_prices: {
        Row: {
          gtin: string
          price_current: number | null
          price_original: number | null
          is_available: boolean | null
          offer_description: string | null
          last_updated: string | null
          created_at: string | null
        }
        Insert: {
          gtin: string
          price_current?: number | null
          price_original?: number | null
          is_available?: boolean | null
          offer_description?: string | null
          last_updated?: string | null
          created_at?: string | null
        }
        Update: {
          gtin?: string
          price_current?: number | null
          price_original?: number | null
          is_available?: boolean | null
          offer_description?: string | null
          last_updated?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          ai_config: Json | null
          ai_enabled: boolean | null
          ai_thread_id: string | null
          assistant_config: Json | null
          assistant_created_at: string | null
          assistant_id: string | null
          assistant_metadata: Json | null
          assistant_name: string | null
          conversation_type: string | null
          created_at: string | null
          description: string | null
          id: string
          last_message_at: string | null
          status: string | null
          title: string | null
          total_messages: number | null
          unread_count: number | null
          updated_at: string | null
          whatsapp_contact_id: string
          whatsapp_conversation_id: string
        }
        Insert: {
          ai_config?: Json | null
          ai_enabled?: boolean | null
          ai_thread_id?: string | null
          assistant_config?: Json | null
          assistant_created_at?: string | null
          assistant_id?: string | null
          assistant_metadata?: Json | null
          assistant_name?: string | null
          conversation_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          last_message_at?: string | null
          status?: string | null
          title?: string | null
          total_messages?: number | null
          unread_count?: number | null
          updated_at?: string | null
          whatsapp_contact_id: string
          whatsapp_conversation_id: string
        }
        Update: {
          ai_config?: Json | null
          ai_enabled?: boolean | null
          ai_thread_id?: string | null
          assistant_config?: Json | null
          assistant_created_at?: string | null
          assistant_id?: string | null
          assistant_metadata?: Json | null
          assistant_name?: string | null
          conversation_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          last_message_at?: string | null
          status?: string | null
          title?: string | null
          total_messages?: number | null
          unread_count?: number | null
          updated_at?: string | null
          whatsapp_contact_id?: string
          whatsapp_conversation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_whatsapp_contact_id_fkey"
            columns: ["whatsapp_contact_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_profiles: {
        Row: {
          id: string
          whatsapp_contact_id: string
          email: string | null
          full_name: string | null
          preferred_name: string | null
          lifecycle_stage: string | null
          customer_since: string | null
          preferred_stores: string[] | null
          shopping_persona: string | null
          dietary_restrictions: string[] | null
          engagement_score: number | null
          engagement_status: string | null
          total_conversations: number | null
          total_messages: number | null
          tags: string[] | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          whatsapp_contact_id: string
          email?: string | null
          full_name?: string | null
          preferred_name?: string | null
          lifecycle_stage?: string | null
          customer_since?: string | null
          preferred_stores?: string[] | null
          shopping_persona?: string | null
          dietary_restrictions?: string[] | null
          engagement_score?: number | null
          engagement_status?: string | null
          total_conversations?: number | null
          total_messages?: number | null
          tags?: string[] | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          whatsapp_contact_id?: string
          email?: string | null
          full_name?: string | null
          preferred_name?: string | null
          lifecycle_stage?: string | null
          customer_since?: string | null
          preferred_stores?: string[] | null
          shopping_persona?: string | null
          dietary_restrictions?: string[] | null
          engagement_score?: number | null
          engagement_status?: string | null
          total_conversations?: number | null
          total_messages?: number | null
          tags?: string[] | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_profiles_whatsapp_contact_id_fkey"
            columns: ["whatsapp_contact_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_events: {
        Row: {
          id: string
          crm_profile_id: string
          event_type: string
          event_description: string | null
          event_data: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          crm_profile_id: string
          event_type: string
          event_description?: string | null
          event_data?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          crm_profile_id?: string
          event_type?: string
          event_description?: string | null
          event_data?: Json | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_events_crm_profile_id_fkey"
            columns: ["crm_profile_id"]
            isOneToOne: false
            referencedRelation: "crm_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dirk_prices: {
        Row: {
          gtin: string
          price_current: number | null
          price_original: number | null
          is_available: boolean | null
          offer_description: string | null
          last_updated: string | null
          created_at: string | null
        }
        Insert: {
          gtin: string
          price_current?: number | null
          price_original?: number | null
          is_available?: boolean | null
          offer_description?: string | null
          last_updated?: string | null
          created_at?: string | null
        }
        Update: {
          gtin?: string
          price_current?: number | null
          price_original?: number | null
          is_available?: boolean | null
          offer_description?: string | null
          last_updated?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      jumbo_prices: {
        Row: {
          gtin: string
          price_current: number | null
          price_promo: number | null
          is_available: boolean | null
          last_updated: string | null
          created_at: string | null
        }
        Insert: {
          gtin: string
          price_current?: number | null
          price_promo?: number | null
          is_available?: boolean | null
          last_updated?: string | null
          created_at?: string | null
        }
        Update: {
          gtin?: string
          price_current?: number | null
          price_promo?: number | null
          is_available?: boolean | null
          last_updated?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          admin_id: string | null
          ai_thread_id: string | null
          content: string
          conversation_id: string
          created_at: string | null
          direction: string
          from_me: boolean
          id: string
          is_ai_triggered: boolean | null
          media_url: string | null
          message_type: string | null
          raw_message_data: Json | null
          sender_type: string | null
          whatsapp_message_id: string
          whatsapp_status: string | null
        }
        Insert: {
          admin_id?: string | null
          ai_thread_id?: string | null
          content: string
          conversation_id: string
          created_at?: string | null
          direction: string
          from_me: boolean
          id?: string
          is_ai_triggered?: boolean | null
          media_url?: string | null
          message_type?: string | null
          raw_message_data?: Json | null
          sender_type?: string | null
          whatsapp_message_id: string
          whatsapp_status?: string | null
        }
        Update: {
          admin_id?: string | null
          ai_thread_id?: string | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          direction?: string
          from_me?: boolean
          id?: string
          is_ai_triggered?: boolean | null
          media_url?: string | null
          message_type?: string | null
          raw_message_data?: Json | null
          sender_type?: string | null
          whatsapp_message_id?: string
          whatsapp_status?: string | null
        }
        Relationships: []
      }
      repo_brands: {
        Row: {
          brand_id: string
          name: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          brand_id?: string
          name: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          brand_id?: string
          name?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      repo_categories: {
        Row: {
          category_id: string
          name: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string
          name: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          name?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      repo_products: {
        Row: {
          gtin: string
          id: string
          title: string | null
          title_original: string | null
          description: string | null
          image: string | null
          brand_id: string | null
          subcategory_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          gtin: string
          id?: string
          title?: string | null
          title_original?: string | null
          description?: string | null
          image?: string | null
          brand_id?: string | null
          subcategory_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          gtin?: string
          id?: string
          title?: string | null
          title_original?: string | null
          description?: string | null
          image?: string | null
          brand_id?: string | null
          subcategory_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "repo_products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "repo_brands"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "repo_products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "repo_subcategories"
            referencedColumns: ["subcategory_id"]
          },
        ]
      }
      repo_subcategories: {
        Row: {
          subcategory_id: string
          name: string
          category_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          subcategory_id?: string
          name: string
          category_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          subcategory_id?: string
          name?: string
          category_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "repo_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "repo_categories"
            referencedColumns: ["category_id"]
          },
        ]
      }
      whatsapp_contacts: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          is_active: boolean | null
          is_business_account: boolean | null
          last_seen_at: string | null
          last_synced_at: string | null
          phone_number: string
          profile_picture_url: string | null
          push_name: string | null
          raw_contact_data: Json | null
          updated_at: string | null
          verified_name: string | null
          whatsapp_jid: string
          whatsapp_status: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          is_business_account?: boolean | null
          last_seen_at?: string | null
          last_synced_at?: string | null
          phone_number: string
          profile_picture_url?: string | null
          push_name?: string | null
          raw_contact_data?: Json | null
          updated_at?: string | null
          verified_name?: string | null
          whatsapp_jid: string
          whatsapp_status?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          is_business_account?: boolean | null
          last_seen_at?: string | null
          last_synced_at?: string | null
          phone_number?: string
          profile_picture_url?: string | null
          push_name?: string | null
          raw_contact_data?: Json | null
          updated_at?: string | null
          verified_name?: string | null
          whatsapp_jid?: string
          whatsapp_status?: string | null
        }
        Relationships: []
      }
      qa_auto_test_cases: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          test_data: Json | null
          test_name: string
          test_steps: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          test_data?: Json | null
          test_name: string
          test_steps?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          test_data?: Json | null
          test_name?: string
          test_steps?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      qa_ci_triggers: {
        Row: {
          conditions: Json | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          trigger_name: string
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          conditions?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          trigger_name: string
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          conditions?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          trigger_name?: string
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      qa_detected_issues: {
        Row: {
          created_at: string | null
          id: string
          issue_description: string
          issue_severity: string | null
          issue_type: string | null
          resolution_status: string | null
          screenshot_url: string | null
          severity: string | null
          status: string | null
          test_run_id: string | null
          title: string | null
          description: string | null
          auto_test_generated: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          issue_description: string
          issue_severity?: string | null
          issue_type?: string | null
          resolution_status?: string | null
          screenshot_url?: string | null
          severity?: string | null
          status?: string | null
          test_run_id?: string | null
          title?: string | null
          description?: string | null
          auto_test_generated?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          issue_description?: string
          issue_severity?: string | null
          issue_type?: string | null
          resolution_status?: string | null
          screenshot_url?: string | null
          severity?: string | null
          status?: string | null
          test_run_id?: string | null
          title?: string | null
          description?: string | null
          auto_test_generated?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qa_detected_issues_test_run_id_fkey"
            columns: ["test_run_id"]
            isOneToOne: false
            referencedRelation: "qa_test_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      qa_screenshots: {
        Row: {
          created_at: string | null
          id: string
          screenshot_type: string | null
          screenshot_url: string
          test_run_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          screenshot_type?: string | null
          screenshot_url: string
          test_run_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          screenshot_type?: string | null
          screenshot_url?: string
          test_run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qa_screenshots_test_run_id_fkey"
            columns: ["test_run_id"]
            isOneToOne: false
            referencedRelation: "qa_test_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      qa_test_results: {
        Row: {
          created_at: string | null
          error_message: string | null
          execution_time: number | null
          id: string
          result_data: Json | null
          status: string
          test_run_id: string | null
          test_script_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          execution_time?: number | null
          id?: string
          result_data?: Json | null
          status: string
          test_run_id?: string | null
          test_script_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          execution_time?: number | null
          id?: string
          result_data?: Json | null
          status?: string
          test_run_id?: string | null
          test_script_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qa_test_results_test_run_id_fkey"
            columns: ["test_run_id"]
            isOneToOne: false
            referencedRelation: "qa_test_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qa_test_results_test_script_id_fkey"
            columns: ["test_script_id"]
            isOneToOne: false
            referencedRelation: "qa_test_scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      qa_test_runs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          environment: string | null
          id: string
          run_name: string
          run_number: number | null
          script_id: string | null
          started_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          environment?: string | null
          id?: string
          run_name: string
          run_number?: number | null
          script_id?: string | null
          started_at?: string | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          environment?: string | null
          id?: string
          run_name?: string
          run_number?: number | null
          script_id?: string | null
          started_at?: string | null
          status?: string
        }
        Relationships: []
      }
      qa_test_scripts: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string | null
          script_content: string
          script_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          script_content: string
          script_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          script_content?: string
          script_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      qa_trigger_executions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          execution_result: Json | null
          id: string
          started_at: string | null
          status: string
          trigger_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          execution_result?: Json | null
          id?: string
          started_at?: string | null
          status: string
          trigger_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          execution_result?: Json | null
          id?: string
          started_at?: string | null
          status?: string
          trigger_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qa_trigger_executions_trigger_id_fkey"
            columns: ["trigger_id"]
            isOneToOne: false
            referencedRelation: "qa_ci_triggers"
            referencedColumns: ["id"]
          },
        ]
      }
      grocery_lists: {
        Row: {
          id: string
          crm_profile_id: string
          contact_id: string | null
          list_name: string
          items: Json | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          crm_profile_id: string
          contact_id?: string | null
          list_name: string
          items?: Json | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          crm_profile_id?: string
          contact_id?: string | null
          list_name?: string
          items?: Json | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grocery_lists_crm_profile_id_fkey"
            columns: ["crm_profile_id"]
            isOneToOne: false
            referencedRelation: "crm_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {}
    Functions: {
      exec_sql: {
        Args: {
          sql: string
        }
        Returns: unknown
      }
    }
    Enums: {}
    CompositeTypes: {}
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  DefaultSchemaCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends DefaultSchemaCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = DefaultSchemaCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : DefaultSchemaCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][DefaultSchemaCompositeTypeNameOrOptions]
    : never
