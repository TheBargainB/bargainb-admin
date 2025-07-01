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
      conversations: {
        Row: {
          ai_config: Json | null
          ai_enabled: boolean | null
          ai_thread_id: string | null
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
    Views: {}
    Functions: {}
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
