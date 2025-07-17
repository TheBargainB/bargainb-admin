import { Tables, Database } from './database.types'

// Database types (re-exported for convenience)
export type WhatsAppContact = Tables<'whatsapp_contacts'>
export type AIInteraction = Tables<'ai_interactions'>
export type UsageAnalytics = Tables<'ai_usage_analytics'>
// Note: conversation_assistants view needs to be created in database
export type UserAssignment = {
  conversation_id: string
  assistant_id: string
  assistant_name: string
  phone_number: string
  display_name: string
  assistant_created_at: string
  conversation_created_at: string
}

// External BB Agent Assistant interface (comes from BB Agent API)
export interface BBAssistant {
  assistant_id: string
  graph_id: string
  name: string
  description: string | null
  version: number
  created_at: string
  updated_at: string
  config: {
    tags: string[]
    recursion_limit: number
    configurable: any
  }
  metadata: any
}

// Form data interfaces
export interface CreateAssistantData {
  name: string
  description: string
  recursion_limit: number
  configurable: string
}

export interface AssignUserData {
  phone_number: string
  assistant_id: string
  priority?: 'low' | 'normal' | 'high'
  auto_enable?: boolean
  notification_settings?: Record<string, any>
  schedule?: Record<string, any> | null
  custom_config?: Record<string, any>
  notes?: string
}

// Component prop types
export type AssistantTableMode = 'view' | 'select'
export type DialogMode = 'view' | 'edit' | 'create' 

// AI Message Status - matching database constraint
export type AIMessageStatus = 
  | 'pending'      // Message queued for processing
  | 'processing'   // Currently being processed by AI
  | 'completed'    // AI response generated and sent
  | 'sending'      // Being sent via WhatsApp
  | 'sent'         // Successfully sent via WhatsApp
  | 'delivered'    // Delivered to WhatsApp user
  | 'failed'       // Failed to process or send
  | 'error'        // Error occurred during processing 