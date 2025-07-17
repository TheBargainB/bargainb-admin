export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      ai_messages: {
        Row: {
          agent_response_metadata: Json | null
          assistant_id: string | null
          content: string
          created_at: string | null
          error_message: string | null
          id: string
          message_type: string
          processing_time_ms: number | null
          run_id: string | null
          status: string | null
          thread_id: string | null
          updated_at: string | null
          user_profile_id: string | null
        }
        Insert: {
          agent_response_metadata?: Json | null
          assistant_id?: string | null
          content: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          message_type: string
          processing_time_ms?: number | null
          run_id?: string | null
          status?: string | null
          thread_id?: string | null
          updated_at?: string | null
          user_profile_id?: string | null
        }
        Update: {
          agent_response_metadata?: Json | null
          assistant_id?: string | null
          content?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          message_type?: string
          processing_time_ms?: number | null
          run_id?: string | null
          status?: string | null
          thread_id?: string | null
          updated_at?: string | null
          user_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_invitations: {
        Row: {
          created_at: string | null
          id: string
          invitation_count: number | null
          invitation_sent_at: string | null
          link_clicked_at: string | null
          onboarding_completed_at: string | null
          phone_number: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          invitation_count?: number | null
          invitation_sent_at?: string | null
          link_clicked_at?: string | null
          onboarding_completed_at?: string | null
          phone_number: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          invitation_count?: number | null
          invitation_sent_at?: string | null
          link_clicked_at?: string | null
          onboarding_completed_at?: string | null
          phone_number?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_conversations: {
        Row: {
          ai_message_id: string | null
          assistant_id: string | null
          content: string
          created_at: string | null
          delivered_at: string | null
          failed_at: string | null
          failure_reason: string | null
          id: string
          message_type: string
          read_at: string | null
          run_id: string | null
          sent_at: string | null
          thread_id: string | null
          updated_at: string | null
          user_profile_id: string | null
          whatsapp_jid: string | null
          whatsapp_message_id: string | null
          whatsapp_status: string | null
        }
        Insert: {
          ai_message_id?: string | null
          assistant_id?: string | null
          content: string
          created_at?: string | null
          delivered_at?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          message_type: string
          read_at?: string | null
          run_id?: string | null
          sent_at?: string | null
          thread_id?: string | null
          updated_at?: string | null
          user_profile_id?: string | null
          whatsapp_jid?: string | null
          whatsapp_message_id?: string | null
          whatsapp_status?: string | null
        }
        Update: {
          ai_message_id?: string | null
          assistant_id?: string | null
          content?: string
          created_at?: string | null
          delivered_at?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          message_type?: string
          read_at?: string | null
          run_id?: string | null
          sent_at?: string | null
          thread_id?: string | null
          updated_at?: string | null
          user_profile_id?: string | null
          whatsapp_jid?: string | null
          whatsapp_message_id?: string | null
          whatsapp_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_conversations_ai_message_id_fkey"
            columns: ["ai_message_id"]
            isOneToOne: false
            referencedRelation: "ai_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_conversations_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          ai_introduction_sent: boolean | null
          assistant_created: boolean | null
          assistant_id: string | null
          auth_user_id: string | null
          budget_level: string | null
          budget_range: unknown | null
          country_code: string | null
          created_at: string | null
          dietary_restrictions: string | null
          display_name: string | null
          email: string | null
          full_name: string | null
          household_size: number | null
          id: string
          is_business_account: boolean | null
          language_code: string | null
          last_seen_at: string | null
          lifecycle_stage: string | null
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          phone_number: string | null
          preferred_name: string | null
          preferred_stores: string[] | null
          profile_picture_url: string | null
          push_name: string | null
          store_preference: string | null
          store_websites: string | null
          updated_at: string | null
          verified_name: string | null
          whatsapp_jid: string | null
          whatsapp_raw_data: Json | null
          whatsapp_status: string | null
        }
        Insert: {
          ai_introduction_sent?: boolean | null
          assistant_created?: boolean | null
          assistant_id?: string | null
          auth_user_id?: string | null
          budget_level?: string | null
          budget_range?: unknown | null
          country_code?: string | null
          created_at?: string | null
          dietary_restrictions?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          household_size?: number | null
          id?: string
          is_business_account?: boolean | null
          language_code?: string | null
          last_seen_at?: string | null
          lifecycle_stage?: string | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          phone_number?: string | null
          preferred_name?: string | null
          preferred_stores?: string[] | null
          profile_picture_url?: string | null
          push_name?: string | null
          store_preference?: string | null
          store_websites?: string | null
          updated_at?: string | null
          verified_name?: string | null
          whatsapp_jid?: string | null
          whatsapp_raw_data?: Json | null
          whatsapp_status?: string | null
        }
        Update: {
          ai_introduction_sent?: boolean | null
          assistant_created?: boolean | null
          assistant_id?: string | null
          auth_user_id?: string | null
          budget_level?: string | null
          budget_range?: unknown | null
          country_code?: string | null
          created_at?: string | null
          dietary_restrictions?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          household_size?: number | null
          id?: string
          is_business_account?: boolean | null
          language_code?: string | null
          last_seen_at?: string | null
          lifecycle_stage?: string | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          phone_number?: string | null
          preferred_name?: string | null
          preferred_stores?: string[] | null
          profile_picture_url?: string | null
          push_name?: string | null
          store_preference?: string | null
          store_websites?: string | null
          updated_at?: string | null
          verified_name?: string | null
          whatsapp_jid?: string | null
          whatsapp_raw_data?: Json | null
          whatsapp_status?: string | null
        }
        Relationships: []
      }
      // Include all existing tables from the original file here...
      ai_config_templates: {
        Row: {
          config_data: Json | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          template_type: string | null
          updated_at: string | null
        }
        Insert: {
          config_data?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          template_type?: string | null
          updated_at?: string | null
        }
        Update: {
          config_data?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          template_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_interactions: {
        Row: {
          ai_response: string | null
          ai_response_timestamp: string | null
          created_at: string | null
          id: string
          interaction_type: string | null
          metadata: Json | null
          updated_at: string | null
          user_message: string | null
          user_message_timestamp: string | null
          whatsapp_contact_id: string | null
        }
        Insert: {
          ai_response?: string | null
          ai_response_timestamp?: string | null
          created_at?: string | null
          id?: string
          interaction_type?: string | null
          metadata?: Json | null
          updated_at?: string | null
          user_message?: string | null
          user_message_timestamp?: string | null
          whatsapp_contact_id?: string | null
        }
        Update: {
          ai_response?: string | null
          ai_response_timestamp?: string | null
          created_at?: string | null
          id?: string
          interaction_type?: string | null
          metadata?: Json | null
          updated_at?: string | null
          user_message?: string | null
          user_message_timestamp?: string | null
          whatsapp_contact_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_interactions_whatsapp_contact_id_fkey"
            columns: ["whatsapp_contact_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          ai_enabled: boolean | null
          assistant_id: string | null
          conversation_summary: string | null
          created_at: string | null
          id: string
          last_message: string | null
          last_message_at: string | null
          priority: string | null
          status: string | null
          tags: string[] | null
          title: string | null
          total_messages: number | null
          unread_count: number | null
          updated_at: string | null
          whatsapp_conversation_id: string | null
          whatsapp_contact_id: string | null
        }
        Insert: {
          ai_enabled?: boolean | null
          assistant_id?: string | null
          conversation_summary?: string | null
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          priority?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string | null
          total_messages?: number | null
          unread_count?: number | null
          updated_at?: string | null
          whatsapp_conversation_id?: string | null
          whatsapp_contact_id?: string | null
        }
        Update: {
          ai_enabled?: boolean | null
          assistant_id?: string | null
          conversation_summary?: string | null
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          priority?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string | null
          total_messages?: number | null
          unread_count?: number | null
          updated_at?: string | null
          whatsapp_conversation_id?: string | null
          whatsapp_contact_id?: string | null
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
      // Add remaining existing tables...
      ai_usage_analytics: {
        Row: {
          ai_processing_time_ms: number | null
          ai_response_length: number | null
          conversation_id: string | null
          created_at: string | null
          event_type: string | null
          id: string
          metadata: Json | null
          updated_at: string | null
          user_message_length: number | null
          whatsapp_contact_id: string | null
        }
        Insert: {
          ai_processing_time_ms?: number | null
          ai_response_length?: number | null
          conversation_id?: string | null
          created_at?: string | null
          event_type?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string | null
          user_message_length?: number | null
          whatsapp_contact_id?: string | null
        }
        Update: {
          ai_processing_time_ms?: number | null
          ai_response_length?: number | null
          conversation_id?: string | null
          created_at?: string | null
          event_type?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string | null
          user_message_length?: number | null
          whatsapp_contact_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_analytics_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_analytics_whatsapp_contact_id_fkey"
            columns: ["whatsapp_contact_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_categories: {
        Row: {
          budget_limit: number | null
          category_icon: string | null
          category_name: string
          created_at: string | null
          id: string
          is_default: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          budget_limit?: number | null
          category_icon?: string | null
          category_name: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          budget_limit?: number | null
          category_icon?: string | null
          category_name?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      budget_periods: {
        Row: {
          budget_limit: number
          created_at: string | null
          end_date: string
          id: string
          is_active: boolean | null
          period_name: string | null
          start_date: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          budget_limit: number
          created_at?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          period_name?: string | null
          start_date: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          budget_limit?: number
          created_at?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          period_name?: string | null
          start_date?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      budget_expenses: {
        Row: {
          amount: number
          budget_category_id: string | null
          budget_period_id: string | null
          created_at: string | null
          description: string | null
          expense_date: string
          id: string
          metadata: Json | null
          receipt_image_url: string | null
          store_name: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          budget_category_id?: string | null
          budget_period_id?: string | null
          created_at?: string | null
          description?: string | null
          expense_date: string
          id?: string
          metadata?: Json | null
          receipt_image_url?: string | null
          store_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          budget_category_id?: string | null
          budget_period_id?: string | null
          created_at?: string | null
          description?: string | null
          expense_date?: string
          id?: string
          metadata?: Json | null
          receipt_image_url?: string | null
          store_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_expenses_budget_category_id_fkey"
            columns: ["budget_category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_expenses_budget_period_id_fkey"
            columns: ["budget_period_id"]
            isOneToOne: false
            referencedRelation: "budget_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      grocery_lists: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          list_name: string
          metadata: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          list_name: string
          metadata?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          list_name?: string
          metadata?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      grocery_list_items: {
        Row: {
          created_at: string | null
          grocery_list_id: string | null
          id: string
          is_completed: boolean | null
          item_name: string
          metadata: Json | null
          quantity: number | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          grocery_list_id?: string | null
          id?: string
          is_completed?: boolean | null
          item_name: string
          metadata?: Json | null
          quantity?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          grocery_list_id?: string | null
          id?: string
          is_completed?: boolean | null
          item_name?: string
          metadata?: Json | null
          quantity?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grocery_list_items_grocery_list_id_fkey"
            columns: ["grocery_list_id"]
            isOneToOne: false
            referencedRelation: "grocery_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          ai_summary: string | null
          content: string
          conversation_id: string | null
          created_at: string | null
          direction: string | null
          from_me: boolean | null
          id: string
          message_type: string | null
          priority: string | null
          raw_message_data: Json | null
          sender_type: string | null
          updated_at: string | null
          whatsapp_message_id: string | null
          whatsapp_status: string | null
        }
        Insert: {
          ai_summary?: string | null
          content: string
          conversation_id?: string | null
          created_at?: string | null
          direction?: string | null
          from_me?: boolean | null
          id?: string
          message_type?: string | null
          priority?: string | null
          raw_message_data?: Json | null
          sender_type?: string | null
          updated_at?: string | null
          whatsapp_message_id?: string | null
          whatsapp_status?: string | null
        }
        Update: {
          ai_summary?: string | null
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          direction?: string | null
          from_me?: boolean | null
          id?: string
          message_type?: string | null
          priority?: string | null
          raw_message_data?: Json | null
          sender_type?: string | null
          updated_at?: string | null
          whatsapp_message_id?: string | null
          whatsapp_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_data: {
        Row: {
          carbohydrates: number | null
          created_at: string | null
          energy_kcal: number | null
          energy_kj: number | null
          fat: number | null
          fiber: number | null
          polyols: number | null
          product_id: string | null
          protein: number | null
          salt: number | null
          saturated_fat: number | null
          sugars: number | null
          updated_at: string | null
        }
        Insert: {
          carbohydrates?: number | null
          created_at?: string | null
          energy_kcal?: number | null
          energy_kj?: number | null
          fat?: number | null
          fiber?: number | null
          polyols?: number | null
          product_id?: string | null
          protein?: number | null
          salt?: number | null
          saturated_fat?: number | null
          sugars?: number | null
          updated_at?: string | null
        }
        Update: {
          carbohydrates?: number | null
          created_at?: string | null
          energy_kcal?: number | null
          energy_kj?: number | null
          fat?: number | null
          fiber?: number | null
          polyols?: number | null
          product_id?: string | null
          protein?: number | null
          salt?: number | null
          saturated_fat?: number | null
          sugars?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_data_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_offers: {
        Row: {
          created_at: string | null
          discount_amount: number | null
          discount_percentage: number | null
          end_date: string | null
          id: string
          offer_description: string | null
          offer_type: string | null
          original_price: number | null
          product_id: string | null
          special_price: number | null
          start_date: string | null
          store_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          end_date?: string | null
          id?: string
          offer_description?: string | null
          offer_type?: string | null
          original_price?: number | null
          product_id?: string | null
          special_price?: number | null
          start_date?: string | null
          store_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          end_date?: string | null
          id?: string
          offer_description?: string | null
          offer_type?: string | null
          original_price?: number | null
          product_id?: string | null
          special_price?: number | null
          start_date?: string | null
          store_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_offers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_offers_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number | null
          store_id: string | null
          updated_at: string | null
        }
        Insert: {
          brand?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price?: number | null
          store_id?: string | null
          updated_at?: string | null
        }
        Update: {
          brand?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number | null
          store_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          address: string | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      whatsapp_contacts: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          is_active: boolean | null
          is_business: boolean | null
          last_seen_at: string | null
          phone_number: string
          profile_picture_url: string | null
          push_name: string | null
          status_message: string | null
          updated_at: string | null
          verified_name: string | null
          whatsapp_jid: string
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          is_business?: boolean | null
          last_seen_at?: string | null
          phone_number: string
          profile_picture_url?: string | null
          push_name?: string | null
          status_message?: string | null
          updated_at?: string | null
          verified_name?: string | null
          whatsapp_jid: string
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          is_business?: boolean | null
          last_seen_at?: string | null
          phone_number?: string
          profile_picture_url?: string | null
          push_name?: string | null
          status_message?: string | null
          updated_at?: string | null
          verified_name?: string | null
          whatsapp_jid?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bytea_to_text: {
        Args: { data: string }
        Returns: string
      }
      create_user_ai_config: {
        Args: {
          p_user_id: string
          p_country?: string
          p_language?: string
          p_dietary_preferences?: string[]
          p_food_allergies?: string[]
          p_selected_stores?: string[]
        }
        Returns: string
      }
      generate_assistant_name: {
        Args: { phone_number: string }
        Returns: string
      }
      get_formatted_ai_config: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_pending_ai_responses: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          user_profile_id: string
          content: string
          phone_number: string
          whatsapp_jid: string
          assistant_id: string
          thread_id: string
          run_id: string
        }[]
      }
      get_user_ai_config: {
        Args: { p_user_id: string }
        Returns: Json
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_delete: {
        Args:
          | { uri: string }
          | { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_get: {
        Args: { uri: string } | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_post: {
        Args:
          | { uri: string; content: string; content_type: string }
          | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_put: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      text_to_bytea: {
        Args: { data: string }
        Returns: string
      }
      urlencode: {
        Args: { data: Json } | { string: string } | { string: string }
        Returns: string
      }
    }
    Enums: {
      user_status: "pending" | "approved" | "invited"
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
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
      user_status: ["pending", "approved", "invited"],
    },
  },
} as const
