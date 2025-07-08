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
          id: number
          level_1: string | null
          level_2: string | null
          level_3: string | null
          level_4: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          level_1?: string | null
          level_2?: string | null
          level_3?: string | null
          level_4?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          level_1?: string | null
          level_2?: string | null
          level_3?: string | null
          level_4?: string | null
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
          gtin: string | null
          id: number
        }
        Insert: {
          created_at?: string | null
          feature: string
          gtin?: string | null
          id?: number
        }
        Update: {
          created_at?: string | null
          feature?: string
          gtin?: string | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "features_gtin_fkey"
            columns: ["gtin"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["gtin"]
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
          gtin: string | null
          id: number
          size: string | null
          source: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          gtin?: string | null
          id?: number
          size?: string | null
          source?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          gtin?: string | null
          id?: number
          size?: string | null
          source?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "images_gtin_fkey"
            columns: ["gtin"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["gtin"]
          },
        ]
      }
      ingredients: {
        Row: {
          created_at: string | null
          gtin: string | null
          id: number
          ingredient: string
        }
        Insert: {
          created_at?: string | null
          gtin?: string | null
          id?: number
          ingredient: string
        }
        Update: {
          created_at?: string | null
          gtin?: string | null
          id?: number
          ingredient?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_gtin_fkey"
            columns: ["gtin"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["gtin"]
          },
        ]
      }
      manufacturers: {
        Row: {
          address: string | null
          created_at: string | null
          id: number
          name: string
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          id?: number
          name: string
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          id?: number
          name?: string
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
          gtin: string
          polyols: number | null
          protein: number | null
          salt: number | null
          saturated_fat: number | null
          sugars: number | null
        }
        Insert: {
          carbohydrates?: number | null
          created_at?: string | null
          energy_kcal?: number | null
          energy_kj?: number | null
          fat?: number | null
          gtin: string
          polyols?: number | null
          protein?: number | null
          salt?: number | null
          saturated_fat?: number | null
          sugars?: number | null
        }
        Update: {
          carbohydrates?: number | null
          created_at?: string | null
          energy_kcal?: number | null
          energy_kj?: number | null
          fat?: number | null
          gtin?: string
          polyols?: number | null
          protein?: number | null
          salt?: number | null
          saturated_fat?: number | null
          sugars?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_gtin_fkey"
            columns: ["gtin"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["gtin"]
          },
        ]
      }
      products: {
        Row: {
          additives: string | null
          brand: string | null
          category_id: number | null
          created_at: string | null
          description: string | null
          gtin: string | null
          id: string
          is_variant: boolean | null
          manufacturer_id: number | null
          preparation_usage: string | null
          recycling_info: string | null
          regulated_product_name: string | null
          source: string | null
          storage_info: string | null
          title: string
          variant_group: string | null
        }
        Insert: {
          additives?: string | null
          brand?: string | null
          category_id?: number | null
          created_at?: string | null
          description?: string | null
          gtin?: string | null
          id?: string
          is_variant?: boolean | null
          manufacturer_id?: number | null
          preparation_usage?: string | null
          recycling_info?: string | null
          regulated_product_name?: string | null
          source?: string | null
          storage_info?: string | null
          title: string
          variant_group?: string | null
        }
        Update: {
          additives?: string | null
          brand?: string | null
          category_id?: number | null
          created_at?: string | null
          description?: string | null
          gtin?: string | null
          id?: string
          is_variant?: boolean | null
          manufacturer_id?: number | null
          preparation_usage?: string | null
          recycling_info?: string | null
          regulated_product_name?: string | null
          source?: string | null
          storage_info?: string | null
          title?: string
          variant_group?: string | null
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
      generate_assistant_name: {
        Args: { phone_number: string }
        Returns: string
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
    }
    Enums: {
      user_status: "pending" | "approved" | "invited"
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
      user_status: ["pending", "approved", "invited"],
    },
  },
} as const
