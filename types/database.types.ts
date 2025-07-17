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
      ai_config_templates: {
        Row: {
          config: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          config: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_interactions: {
        Row: {
          ai_response: string
          conversation_id: string | null
          created_at: string | null
          error_message: string | null
          id: string
          processing_time_ms: number | null
          response_style: string | null
          success: boolean | null
          thread_id: string
          tokens_used: number | null
          updated_at: string | null
          user_id: string
          user_message: string
          whatsapp_chat_id: string | null
        }
        Insert: {
          ai_response: string
          conversation_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          processing_time_ms?: number | null
          response_style?: string | null
          success?: boolean | null
          thread_id: string
          tokens_used?: number | null
          updated_at?: string | null
          user_id: string
          user_message: string
          whatsapp_chat_id?: string | null
        }
        Update: {
          ai_response?: string
          conversation_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          processing_time_ms?: number | null
          response_style?: string | null
          success?: boolean | null
          thread_id?: string
          tokens_used?: number | null
          updated_at?: string | null
          user_id?: string
          user_message?: string
          whatsapp_chat_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_interactions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversation_assistants"
            referencedColumns: ["conversation_id"]
          },
          {
            foreignKeyName: "ai_interactions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage_analytics: {
        Row: {
          avg_processing_time_ms: number | null
          created_at: string | null
          date: string
          id: string
          success_rate: number | null
          total_interactions: number | null
          total_tokens_used: number | null
          unique_chats: number | null
          unique_users: number | null
        }
        Insert: {
          avg_processing_time_ms?: number | null
          created_at?: string | null
          date: string
          id?: string
          success_rate?: number | null
          total_interactions?: number | null
          total_tokens_used?: number | null
          unique_chats?: number | null
          unique_users?: number | null
        }
        Update: {
          avg_processing_time_ms?: number | null
          created_at?: string | null
          date?: string
          id?: string
          success_rate?: number | null
          total_interactions?: number | null
          total_tokens_used?: number | null
          unique_chats?: number | null
          unique_users?: number | null
        }
        Relationships: []
      }
      budget_categories: {
        Row: {
          allocated_amount: number
          budget_period_id: string | null
          category_name: string
          category_type: string | null
          created_at: string | null
          id: string
          is_flexible: boolean | null
          priority_level: number | null
          spent_amount: number | null
          updated_at: string | null
        }
        Insert: {
          allocated_amount: number
          budget_period_id?: string | null
          category_name: string
          category_type?: string | null
          created_at?: string | null
          id?: string
          is_flexible?: boolean | null
          priority_level?: number | null
          spent_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          allocated_amount?: number
          budget_period_id?: string | null
          category_name?: string
          category_type?: string | null
          created_at?: string | null
          id?: string
          is_flexible?: boolean | null
          priority_level?: number | null
          spent_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_categories_budget_period_id_fkey"
            columns: ["budget_period_id"]
            isOneToOne: false
            referencedRelation: "budget_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_expenses: {
        Row: {
          amount: number
          budget_category_id: string | null
          created_at: string | null
          expense_date: string
          expense_name: string
          expense_type: string | null
          grocery_list_id: string | null
          id: string
          notes: string | null
          payment_method: string | null
          products_data: Json | null
          receipt_url: string | null
          store_name: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          budget_category_id?: string | null
          created_at?: string | null
          expense_date: string
          expense_name: string
          expense_type?: string | null
          grocery_list_id?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          products_data?: Json | null
          receipt_url?: string | null
          store_name?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          budget_category_id?: string | null
          created_at?: string | null
          expense_date?: string
          expense_name?: string
          expense_type?: string | null
          grocery_list_id?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          products_data?: Json | null
          receipt_url?: string | null
          store_name?: string | null
          updated_at?: string | null
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
            foreignKeyName: "budget_expenses_grocery_list_id_fkey"
            columns: ["grocery_list_id"]
            isOneToOne: false
            referencedRelation: "grocery_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_periods: {
        Row: {
          created_at: string | null
          crm_profile_id: string | null
          currency: string | null
          end_date: string
          id: string
          is_active: boolean | null
          period_name: string
          period_type: string
          start_date: string
          total_budget: number
          total_saved: number | null
          total_spent: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          crm_profile_id?: string | null
          currency?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          period_name: string
          period_type: string
          start_date: string
          total_budget: number
          total_saved?: number | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          crm_profile_id?: string | null
          currency?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          period_name?: string
          period_type?: string
          start_date?: string
          total_budget?: number
          total_saved?: number | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_periods_crm_profile_id_fkey"
            columns: ["crm_profile_id"]
            isOneToOne: false
            referencedRelation: "crm_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_savings_goals: {
        Row: {
          achieved_at: string | null
          created_at: string | null
          crm_profile_id: string | null
          current_amount: number | null
          goal_name: string
          goal_type: string | null
          id: string
          is_achieved: boolean | null
          is_active: boolean | null
          target_amount: number
          target_date: string | null
          updated_at: string | null
        }
        Insert: {
          achieved_at?: string | null
          created_at?: string | null
          crm_profile_id?: string | null
          current_amount?: number | null
          goal_name: string
          goal_type?: string | null
          id?: string
          is_achieved?: boolean | null
          is_active?: boolean | null
          target_amount: number
          target_date?: string | null
          updated_at?: string | null
        }
        Update: {
          achieved_at?: string | null
          created_at?: string | null
          crm_profile_id?: string | null
          current_amount?: number | null
          goal_name?: string
          goal_type?: string | null
          id?: string
          is_achieved?: boolean | null
          is_active?: boolean | null
          target_amount?: number
          target_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_savings_goals_crm_profile_id_fkey"
            columns: ["crm_profile_id"]
            isOneToOne: false
            referencedRelation: "crm_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          id: string
          level_1: string | null
          level_2: string | null
          level_3: string | null
          level_4: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          level_1?: string | null
          level_2?: string | null
          level_3?: string | null
          level_4?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          level_1?: string | null
          level_2?: string | null
          level_3?: string | null
          level_4?: string | null
          updated_at?: string | null
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
          last_message: string | null
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
          last_message?: string | null
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
          last_message?: string | null
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
            referencedRelation: "customer_360"
            referencedColumns: ["contact_id"]
          },
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
          avg_response_time_hours: number | null
          budget_range: unknown | null
          communication_style: string | null
          complaint_count: number | null
          compliment_count: number | null
          created_at: string | null
          customer_since: string | null
          date_of_birth: string | null
          dietary_restrictions: string[] | null
          email: string | null
          engagement_score: number | null
          full_name: string | null
          id: string
          lifecycle_stage: string | null
          notes: string | null
          notification_preferences: Json | null
          preferred_name: string | null
          preferred_stores: string[] | null
          price_sensitivity: string | null
          product_interests: string[] | null
          response_time_preference: string | null
          shopping_frequency: string | null
          shopping_persona: string | null
          tags: string[] | null
          total_conversations: number | null
          total_messages: number | null
          updated_at: string | null
          whatsapp_contact_id: string | null
        }
        Insert: {
          avg_response_time_hours?: number | null
          budget_range?: unknown | null
          communication_style?: string | null
          complaint_count?: number | null
          compliment_count?: number | null
          created_at?: string | null
          customer_since?: string | null
          date_of_birth?: string | null
          dietary_restrictions?: string[] | null
          email?: string | null
          engagement_score?: number | null
          full_name?: string | null
          id?: string
          lifecycle_stage?: string | null
          notes?: string | null
          notification_preferences?: Json | null
          preferred_name?: string | null
          preferred_stores?: string[] | null
          price_sensitivity?: string | null
          product_interests?: string[] | null
          response_time_preference?: string | null
          shopping_frequency?: string | null
          shopping_persona?: string | null
          tags?: string[] | null
          total_conversations?: number | null
          total_messages?: number | null
          updated_at?: string | null
          whatsapp_contact_id?: string | null
        }
        Update: {
          avg_response_time_hours?: number | null
          budget_range?: unknown | null
          communication_style?: string | null
          complaint_count?: number | null
          compliment_count?: number | null
          created_at?: string | null
          customer_since?: string | null
          date_of_birth?: string | null
          dietary_restrictions?: string[] | null
          email?: string | null
          engagement_score?: number | null
          full_name?: string | null
          id?: string
          lifecycle_stage?: string | null
          notes?: string | null
          notification_preferences?: Json | null
          preferred_name?: string | null
          preferred_stores?: string[] | null
          price_sensitivity?: string | null
          product_interests?: string[] | null
          response_time_preference?: string | null
          shopping_frequency?: string | null
          shopping_persona?: string | null
          tags?: string[] | null
          total_conversations?: number | null
          total_messages?: number | null
          updated_at?: string | null
          whatsapp_contact_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_profiles_whatsapp_contact_id_fkey"
            columns: ["whatsapp_contact_id"]
            isOneToOne: true
            referencedRelation: "customer_360"
            referencedColumns: ["contact_id"]
          },
          {
            foreignKeyName: "crm_profiles_whatsapp_contact_id_fkey"
            columns: ["whatsapp_contact_id"]
            isOneToOne: true
            referencedRelation: "whatsapp_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_events: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          crm_profile_id: string
          event_data: Json | null
          event_description: string | null
          event_type: string
          id: string
          message_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          crm_profile_id: string
          event_data?: Json | null
          event_description?: string | null
          event_type: string
          id?: string
          message_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          crm_profile_id?: string
          event_data?: Json | null
          event_description?: string | null
          event_type?: string
          id?: string
          message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_events_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversation_assistants"
            referencedColumns: ["conversation_id"]
          },
          {
            foreignKeyName: "customer_events_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_events_crm_profile_id_fkey"
            columns: ["crm_profile_id"]
            isOneToOne: false
            referencedRelation: "crm_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_events_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      features: {
        Row: {
          created_at: string | null
          feature: string
          id: string
          product_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          feature: string
          id?: string
          product_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          feature?: string
          id?: string
          product_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "features_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      grocery_lists: {
        Row: {
          actual_total: number | null
          auto_reorder_enabled: boolean | null
          created_at: string | null
          crm_profile_id: string
          estimated_total: number | null
          id: string
          is_template: boolean | null
          list_name: string | null
          preferred_store: string | null
          products: Json
          reorder_frequency: string | null
          shopping_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          actual_total?: number | null
          auto_reorder_enabled?: boolean | null
          created_at?: string | null
          crm_profile_id: string
          estimated_total?: number | null
          id?: string
          is_template?: boolean | null
          list_name?: string | null
          preferred_store?: string | null
          products?: Json
          reorder_frequency?: string | null
          shopping_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_total?: number | null
          auto_reorder_enabled?: boolean | null
          created_at?: string | null
          crm_profile_id?: string
          estimated_total?: number | null
          id?: string
          is_template?: boolean | null
          list_name?: string | null
          preferred_store?: string | null
          products?: Json
          reorder_frequency?: string | null
          shopping_date?: string | null
          status?: string | null
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
      images: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          size: string | null
          source: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          size?: string | null
          source?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          size?: string | null
          source?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          created_at: string | null
          id: string
          ingredient: string
          product_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ingredient: string
          product_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ingredient?: string
          product_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturers: {
        Row: {
          address: string | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      meal_plans: {
        Row: {
          completed_at: string | null
          created_at: string | null
          crm_profile_id: string | null
          custom_meal_name: string | null
          id: string
          is_completed: boolean | null
          meal_date: string
          meal_type: string
          notes: string | null
          plan_name: string | null
          planned_servings: number | null
          recipe_id: string | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          crm_profile_id?: string | null
          custom_meal_name?: string | null
          id?: string
          is_completed?: boolean | null
          meal_date: string
          meal_type: string
          notes?: string | null
          plan_name?: string | null
          planned_servings?: number | null
          recipe_id?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          crm_profile_id?: string | null
          custom_meal_name?: string | null
          id?: string
          is_completed?: boolean | null
          meal_date?: string
          meal_type?: string
          notes?: string | null
          plan_name?: string | null
          planned_servings?: number | null
          recipe_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_crm_profile_id_fkey"
            columns: ["crm_profile_id"]
            isOneToOne: false
            referencedRelation: "crm_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plans_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
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
          whatsapp_message_id: string | null
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
          whatsapp_message_id?: string | null
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
          whatsapp_message_id?: string | null
          whatsapp_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversation_assistants"
            referencedColumns: ["conversation_id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition: {
        Row: {
          carbohydrates: number | null
          created_at: string | null
          energy_kcal: number | null
          energy_kj: number | null
          fat: number | null
          fiber: number | null
          polyols: number | null
          product_id: string
          proteins: number | null
          salt: number | null
          saturated_fat: number | null
          sodium: number | null
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
          product_id: string
          proteins?: number | null
          salt?: number | null
          saturated_fat?: number | null
          sodium?: number | null
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
          product_id?: string
          proteins?: number | null
          salt?: number | null
          saturated_fat?: number | null
          sodium?: number | null
          sugars?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      price_history: {
        Row: {
          created_at: string | null
          id: string
          price: number
          price_change_amount: number | null
          price_change_percentage: number | null
          price_change_type: string | null
          promo_price: number | null
          recorded_at: string | null
          source: string | null
          store_product_id: string
          valid_from: string
          valid_to: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          price: number
          price_change_amount?: number | null
          price_change_percentage?: number | null
          price_change_type?: string | null
          promo_price?: number | null
          recorded_at?: string | null
          source?: string | null
          store_product_id: string
          valid_from: string
          valid_to?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          price?: number
          price_change_amount?: number | null
          price_change_percentage?: number | null
          price_change_type?: string | null
          promo_price?: number | null
          recorded_at?: string | null
          source?: string | null
          store_product_id?: string
          valid_from?: string
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_history_store_product_id_fkey"
            columns: ["store_product_id"]
            isOneToOne: false
            referencedRelation: "store_products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          additives: string | null
          brand: string | null
          category_id: string | null
          created_at: string | null
          description: string | null
          embedding: string | null
          gtin: string | null
          id: string
          is_variant: boolean | null
          manufacturer_id: string | null
          pk_amount: string | null
          pk_qty: number | null
          preparation_usage: string | null
          quantity: string | null
          recycling_info: string | null
          regulated_product_name: string | null
          serving_size: number | null
          serving_unit: string | null
          source: string | null
          storage_info: string | null
          title: string
          unit: string | null
          unit_amount: number | null
          updated_at: string | null
          variant_group_id: string | null
        }
        Insert: {
          additives?: string | null
          brand?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          embedding?: string | null
          gtin?: string | null
          id?: string
          is_variant?: boolean | null
          manufacturer_id?: string | null
          pk_amount?: string | null
          pk_qty?: number | null
          preparation_usage?: string | null
          quantity?: string | null
          recycling_info?: string | null
          regulated_product_name?: string | null
          serving_size?: number | null
          serving_unit?: string | null
          source?: string | null
          storage_info?: string | null
          title: string
          unit?: string | null
          unit_amount?: number | null
          updated_at?: string | null
          variant_group_id?: string | null
        }
        Update: {
          additives?: string | null
          brand?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          embedding?: string | null
          gtin?: string | null
          id?: string
          is_variant?: boolean | null
          manufacturer_id?: string | null
          pk_amount?: string | null
          pk_qty?: number | null
          preparation_usage?: string | null
          quantity?: string | null
          recycling_info?: string | null
          regulated_product_name?: string | null
          serving_size?: number | null
          serving_unit?: string | null
          source?: string | null
          storage_info?: string | null
          title?: string
          unit?: string | null
          unit_amount?: number | null
          updated_at?: string | null
          variant_group_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ingredients: {
        Row: {
          created_at: string | null
          gtin: string | null
          id: string
          is_optional: boolean | null
          notes: string | null
          quantity: number
          recipe_id: string | null
          unit: string
        }
        Insert: {
          created_at?: string | null
          gtin?: string | null
          id?: string
          is_optional?: boolean | null
          notes?: string | null
          quantity: number
          recipe_id?: string | null
          unit: string
        }
        Update: {
          created_at?: string | null
          gtin?: string | null
          id?: string
          is_optional?: boolean | null
          notes?: string | null
          quantity?: number
          recipe_id?: string | null
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          cook_time_minutes: number | null
          created_at: string | null
          created_by: string | null
          cuisine_type: string | null
          description: string | null
          dietary_tags: string[] | null
          difficulty_level: string | null
          id: string
          image_url: string | null
          instructions: string | null
          is_public: boolean | null
          name: string
          nutrition_info: Json | null
          prep_time_minutes: number | null
          servings: number | null
          updated_at: string | null
        }
        Insert: {
          cook_time_minutes?: number | null
          created_at?: string | null
          created_by?: string | null
          cuisine_type?: string | null
          description?: string | null
          dietary_tags?: string[] | null
          difficulty_level?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_public?: boolean | null
          name: string
          nutrition_info?: Json | null
          prep_time_minutes?: number | null
          servings?: number | null
          updated_at?: string | null
        }
        Update: {
          cook_time_minutes?: number | null
          created_at?: string | null
          created_by?: string | null
          cuisine_type?: string | null
          description?: string | null
          dietary_tags?: string[] | null
          difficulty_level?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_public?: boolean | null
          name?: string
          nutrition_info?: Json | null
          prep_time_minutes?: number | null
          servings?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "crm_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      store_prices: {
        Row: {
          created_at: string | null
          id: string
          normalized_price_per_kg: number | null
          normalized_price_per_l: number | null
          normalized_price_per_piece: number | null
          price: number
          price_normalization_confidence: number | null
          price_per_unit: number | null
          price_unit: string | null
          promo_price: number | null
          store_product_id: string
          valid_from: string
          valid_to: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          normalized_price_per_kg?: number | null
          normalized_price_per_l?: number | null
          normalized_price_per_piece?: number | null
          price: number
          price_normalization_confidence?: number | null
          price_per_unit?: number | null
          price_unit?: string | null
          promo_price?: number | null
          store_product_id: string
          valid_from: string
          valid_to?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          normalized_price_per_kg?: number | null
          normalized_price_per_l?: number | null
          normalized_price_per_piece?: number | null
          price?: number
          price_normalization_confidence?: number | null
          price_per_unit?: number | null
          price_unit?: string | null
          promo_price?: number | null
          store_product_id?: string
          valid_from?: string
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_prices_store_product_id_fkey"
            columns: ["store_product_id"]
            isOneToOne: false
            referencedRelation: "store_products"
            referencedColumns: ["id"]
          },
        ]
      }
      store_products: {
        Row: {
          brand: string | null
          canonical_url: string | null
          created_at: string | null
          embedding: string | null
          gtin: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          match_confidence: number | null
          match_method: string | null
          product_id: string | null
          size: string | null
          source_data: Json | null
          store_id: string
          store_product_id: string
          title: string
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          brand?: string | null
          canonical_url?: string | null
          created_at?: string | null
          embedding?: string | null
          gtin?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          match_confidence?: number | null
          match_method?: string | null
          product_id?: string | null
          size?: string | null
          source_data?: Json | null
          store_id: string
          store_product_id: string
          title: string
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          brand?: string | null
          canonical_url?: string | null
          created_at?: string | null
          embedding?: string | null
          gtin?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          match_confidence?: number | null
          match_method?: string | null
          product_id?: string | null
          size?: string | null
          source_data?: Json | null
          store_id?: string
          store_product_id?: string
          title?: string
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          country: string
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
          website: string
        }
        Insert: {
          country: string
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          website: string
        }
        Update: {
          country?: string
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          website?: string
        }
        Relationships: []
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
    }
    Views: {
      conversation_assistants: {
        Row: {
          assistant_config: Json | null
          assistant_created_at: string | null
          assistant_id: string | null
          assistant_metadata: Json | null
          assistant_name: string | null
          conversation_created_at: string | null
          conversation_id: string | null
          display_name: string | null
          phone_number: string | null
        }
        Relationships: []
      }
      crm_analytics: {
        Row: {
          avg_engagement: number | null
          customer_count: number | null
          lifecycle_stage: string | null
          persona_count: number | null
          shopping_persona: string | null
        }
        Relationships: []
      }
      customer_360: {
        Row: {
          contact_id: string | null
          customer_since: string | null
          dietary_restrictions: string[] | null
          email: string | null
          engagement_score: number | null
          engagement_status: string | null
          full_name: string | null
          grocery_lists_count: number | null
          last_message_at: string | null
          last_seen_at: string | null
          lifecycle_stage: string | null
          phone_number: string | null
          preferred_name: string | null
          preferred_stores: string[] | null
          profile_picture_url: string | null
          shopping_persona: string | null
          total_conversations: number | null
          total_messages: number | null
          whatsapp_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      ai_agent_demo: {
        Args: { user_request?: string }
        Returns: {
          demo_section: string
          function_used: string
          product_title: string
          store_name: string
          price: number
          relevance_score: number
          ai_suggestion: string
        }[]
      }
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      build_grocery_list: {
        Args: { product_ids: string[]; budget: number }
        Returns: {
          product_id: string
          gtin: string
          product_title: string
          store_name: string
          price: number
          promo_price: number
          cumulative_cost: number
          within_budget: boolean
        }[]
      }
      calculate_and_store_normalized_prices: {
        Args: Record<PropertyKey, never>
        Returns: {
          processed_count: number
          success_count: number
          error_count: number
        }[]
      }
      calculate_meal_cost: {
        Args: { ingredient_ids: string[] }
        Returns: {
          total_cost: number
          ingredient_count: number
          average_cost_per_ingredient: number
          cost_breakdown: Json
        }[]
      }
      calculate_normalized_unit_price: {
        Args: {
          product_price: number
          product_size: string
          existing_price_per_unit?: number
          existing_price_unit?: string
        }
        Returns: {
          normalized_price_per_kg: number
          normalized_price_per_l: number
          normalized_price_per_piece: number
          base_quantity: number
          base_unit: string
          confidence_score: number
        }[]
      }
      compare_product_prices: {
        Args: { gtin_input: string }
        Returns: {
          store_name: string
          product_title: string
          price: number
          promo_price: number
          price_difference: number
          cheapest_store: boolean
          store_url: string
        }[]
      }
      compare_unit_prices: {
        Args: { product_name: string; min_size?: number }
        Returns: {
          product_title: string
          store_name: string
          total_price: number
          package_size: string
          price_per_kg: number
          price_per_l: number
          price_per_piece: number
          best_unit_price: number
          unit_type: string
          value_rating: string
        }[]
      }
      convert_to_base_unit: {
        Args: { quantity: number; unit_text: string }
        Returns: Record<string, unknown>
      }
      extract_quantity_and_unit: {
        Args: { size_text: string }
        Returns: Record<string, unknown>
      }
      generate_assistant_name: {
        Args: { phone_number: string }
        Returns: string
      }
      generate_product_embeddings: {
        Args: { batch_size?: number }
        Returns: number
      }
      get_budget_meal_options: {
        Args: { budget_per_meal: number; dietary_preferences?: string[] }
        Returns: {
          meal_concept: string
          total_cost: number
          ingredient_count: number
          main_ingredients: Json
          stores_needed: string[]
          cost_per_serving: number
          dietary_tags: string[]
          savings_opportunity: number
        }[]
      }
      get_meal_planning_categories: {
        Args: Record<PropertyKey, never>
        Returns: {
          category_id: string
          category_name: string
          category_path: string
          level: number
          parent_name: string
          product_count: number
        }[]
      }
      get_price_alerts: {
        Args: { price_change_threshold?: number; days_back?: number }
        Returns: {
          product_title: string
          gtin: string
          store_name: string
          old_price: number
          new_price: number
          change_amount: number
          change_percentage: number
          change_type: string
          change_date: string
        }[]
      }
      get_price_alternatives: {
        Args: { target_product_id: string; max_price: number }
        Returns: {
          alternative_product_id: string
          gtin: string
          product_title: string
          brand: string
          category_match: boolean
          price: number
          store_name: string
          savings: number
          similarity_score: number
        }[]
      }
      get_price_trends: {
        Args: { product_gtin: string; days_back?: number }
        Returns: {
          store_name: string
          current_price: number
          lowest_price: number
          highest_price: number
          average_price: number
          price_changes: number
          trend_direction: string
          last_change_date: string
          last_change_amount: number
        }[]
      }
      get_products_by_meal_category: {
        Args: {
          meal_category_name: string
          max_price?: number
          store_preference?: string
        }
        Returns: {
          product_id: string
          product_title: string
          brand: string
          gtin: string
          best_price: number
          best_store: string
          importance_score: number
          meal_category: string
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      import_json_array: {
        Args: { products_json: Json }
        Returns: string[]
      }
      import_product_from_json: {
        Args: { product_data: Json }
        Returns: string
      }
      increment_conversation_stats: {
        Args: { conversation_id: string; is_inbound: boolean }
        Returns: undefined
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      link_store_products_to_master: {
        Args: Record<PropertyKey, never>
        Returns: {
          processed_count: number
          total_linked: number
        }[]
      }
      normalize_unit: {
        Args: { unit_text: string }
        Returns: string
      }
      search_cheapest_products: {
        Args: { query_text: string; max_price?: number }
        Returns: {
          gtin: string
          product_title: string
          store_name: string
          price: number
          promo_price: number
          price_per_unit: number
          price_unit: string
          store_url: string
          product_url: string
        }[]
      }
      search_cheapest_products_normalized: {
        Args: {
          query_text: string
          max_price?: number
          compare_by_unit?: boolean
        }
        Returns: {
          gtin: string
          product_title: string
          store_name: string
          total_price: number
          size_info: string
          price_per_kg: number
          price_per_l: number
          price_per_piece: number
          best_unit_price: string
          store_url: string
        }[]
      }
      semantic_product_search: {
        Args: {
          search_query: string
          similarity_threshold?: number
          max_results?: number
        }
        Returns: {
          product_id: string
          gtin: string
          title: string
          brand: string
          similarity_score: number
          search_rank: number
        }[]
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      smart_grocery_search: {
        Args: {
          user_query: string
          max_budget?: number
          store_preference?: string
        }
        Returns: {
          search_type: string
          product_id: string
          gtin: string
          product_title: string
          brand: string
          store_name: string
          price: number
          relevance_score: number
          price_rank: number
          suggestion: string
        }[]
      }
      smart_meal_planning: {
        Args: {
          meal_description: string
          budget_per_meal?: number
          dietary_restrictions?: string[]
        }
        Returns: {
          meal_component: string
          product_id: string
          gtin: string
          product_title: string
          store_name: string
          price: number
          quantity_needed: string
          component_cost: number
          dietary_flags: string[]
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      suggest_store_split: {
        Args: { product_ids: string[] }
        Returns: {
          strategy: string
          total_cost: number
          store_breakdown: Json
          savings_amount: number
          recommendation: string
        }[]
      }
      test_ai_agent_integration: {
        Args: Record<PropertyKey, never>
        Returns: {
          function_name: string
          status: string
          result_count: number
          sample_result: string
        }[]
      }
      test_ai_agent_workflow: {
        Args: { test_budget?: number; test_store_preference?: string }
        Returns: {
          test_name: string
          test_result: string
          execution_time_ms: number
          details: Json
        }[]
      }
      upgrade_to_real_embeddings: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      user_status: "pending" | "approved" | "invited"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export interface CRMProfile {
  id: string
  created_at: string
  whatsapp_contact_id: string
  full_name: string
  email: string
  preferred_name: string
  // Location info
  country: string | null
  city: string | null
  // Preferences and selections
  selected_stores: string[] | null
  dietary_preferences: string[] | null
  food_allergies: string[] | null
  grocery_items: string[] | null
  integrations: string[] | null
  // Language preference
  preferred_language: string | null
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
