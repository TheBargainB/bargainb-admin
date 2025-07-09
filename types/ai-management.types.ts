import { Tables, Database } from './database.types'

// Database types (re-exported for convenience)
export type WhatsAppContact = Tables<'whatsapp_contacts'>
export type AIInteraction = Tables<'ai_interactions'>
export type UsageAnalytics = Tables<'ai_usage_analytics'>
export type UserAssignment = Database['public']['Views']['conversation_assistants']['Row']

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