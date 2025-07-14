// ===================================================
// BargainB Assistant Management Service
// Phase 2: Assistant Creation and Management Logic
// ===================================================


import { supabaseAdmin } from './supabase'
import { Json, Database } from '../types/database.types'

// Types based on LangGraph API documentation
export interface AssistantConfig {
  tags?: string[]
  recursion_limit?: number
  configurable?: {
    user_preferences?: {
      budget_limit?: number
      dietary_restrictions?: string[]
      preferred_stores?: string[]
      language?: string
      region?: string
    }
    ai_behavior?: {
      response_style?: 'concise' | 'detailed' | 'friendly'
      price_sensitivity?: 'budget' | 'balanced' | 'premium'
      health_focus?: boolean
    }
  }
}

export interface AssistantMetadata {
  conversation_id: string
  phone_number: string
  contact_name?: string | null
  created_for: 'bargainb_user'
  region: string
  created_by: 'admin' | 'auto'
}

export interface AssistantResponse {
  assistant_id: string
  graph_id: string
  config: AssistantConfig
  created_at: string
  updated_at: string
  metadata: AssistantMetadata
  version: number
  name: string
  description: string | null
}

// Environment variables
const AI_API_URL = 'https://agent-bb-cad80ee101cc572f9a46a59272c39cf5.us.langgraph.app'
const AI_API_KEY = process.env.LANGSMITH_API_KEY || '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'

// LangGraph Platform API Client
class LangGraphPlatformClient {
  private baseUrl: string
  private apiKey: string

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl
    this.apiKey = apiKey
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': this.apiKey,
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`LangGraph API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Search assistants
  async searchAssistants(params: {
    metadata?: Record<string, any>
    limit?: number
    offset?: number
  } = {}): Promise<any[]> {
    return this.request('/assistants/search', {
      method: 'POST',
      body: JSON.stringify({
        metadata: {},
        limit: 10,
        offset: 0,
        ...params
      })
    })
  }

  // Get assistant by ID
  async getAssistant(assistantId: string): Promise<any> {
    return this.request(`/assistants/${assistantId}`)
  }

  // Create assistant
  async createAssistant(data: {
    graph_id: string
    config?: Record<string, any>
    metadata?: Record<string, any>
    name?: string
  }): Promise<any> {
    return this.request('/assistants', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // Update assistant
  async updateAssistant(assistantId: string, data: {
    config?: Record<string, any>
    metadata?: Record<string, any>
    name?: string
  }): Promise<any> {
    return this.request(`/assistants/${assistantId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  // Delete assistant
  async deleteAssistant(assistantId: string): Promise<void> {
    await this.request(`/assistants/${assistantId}`, {
      method: 'DELETE'
    })
  }
}

export const langGraphClient = new LangGraphPlatformClient(AI_API_URL, AI_API_KEY)

/**
 * Create a new assistant for a specific conversation/user
 */
export const createUserAssistant = async (
  conversationId: string,
  phoneNumber: string,
  contactName?: string | null,
  userPreferences?: AssistantConfig['configurable']
): Promise<string> => {
  try {
    console.log('🤖 Creating new assistant for conversation:', conversationId)
    
    // Generate assistant name
    const assistantName = contactName 
      ? `BargainB Assistant for ${contactName}`
      : `BargainB Assistant for ${phoneNumber}`
    
    // Prepare assistant configuration
    const assistantConfig: AssistantConfig = {
      tags: ['bargainb', 'grocery', 'personalized'],
      recursion_limit: 25,
      configurable: {
        user_preferences: {
          budget_limit: 100, // Default €100 budget
          dietary_restrictions: [],
          preferred_stores: ['Albert Heijn', 'Jumbo', 'Dirk'],
          language: 'dutch',
          region: 'netherlands',
          ...userPreferences?.user_preferences
        },
        ai_behavior: {
          response_style: 'friendly',
          price_sensitivity: 'balanced',
          health_focus: true,
          ...userPreferences?.ai_behavior
        }
      }
    }
    
    // Prepare metadata
    const metadata: AssistantMetadata = {
      conversation_id: conversationId,
      phone_number: phoneNumber,
      contact_name: contactName,
      created_for: 'bargainb_user',
      region: 'netherlands',
      created_by: 'admin'
    }
    
    // Call LangGraph Create Assistant API
         const assistant = await langGraphClient.createAssistant({
       graph_id: "product_retrieval_agent",
       config: assistantConfig,
       metadata: metadata,
       name: assistantName
     })
    
    console.log('✅ Assistant created successfully:', assistant.assistant_id)
    
    // Store assistant info in database
    const { data, error } = await supabaseAdmin
      .from('conversations')
      .update({
        assistant_config: assistantConfig as unknown as Json,
        assistant_metadata: metadata as unknown as Json,
        assistant_id: assistant.assistant_id,
        assistant_name: assistantName || 'Shopping Assistant',
        assistant_created_at: new Date().toISOString(),
        ai_enabled: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Failed to store assistant in database:', error)
      // Don't throw error - assistant was created successfully
    } else {
      console.log('✅ Assistant info stored in database')
    }
    
    return assistant.assistant_id
    
  } catch (error) {
    console.error('❌ Error creating user assistant:', error)
    throw new Error(`Failed to create personal assistant: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get assistant for a conversation - NO SHARED ASSISTANT FALLBACK
 * Returns null if no personal assistant exists
 */
export const getAssistantForConversation = async (
  conversationId: string
): Promise<string | null> => {
  try {
    // Check if conversation already has an assistant
    const { data: conversation, error } = await supabaseAdmin
      .from('conversations')
      .select('assistant_id, whatsapp_contact_id')
      .eq('id', conversationId)
      .single()
    
    if (error) {
      console.error('❌ Error fetching conversation:', error)
      return null
    }
    
    // Return existing assistant if available, otherwise null
    if (conversation.assistant_id) {
      console.log('✅ Found existing personal assistant:', conversation.assistant_id)
      return conversation.assistant_id
    }
    
    console.log('ℹ️ No personal assistant found for conversation:', conversationId)
    return null
    
  } catch (error) {
    console.error('❌ Error in getAssistantForConversation:', error)
    return null
  }
}

/**
 * Create assistant for conversation if it doesn't exist
 * Will NOT fall back to shared assistant - creates a new one or returns null
 */
export const getOrCreateAssistantForConversation = async (
  conversationId: string
): Promise<string | null> => {
  try {
    // Check if conversation already has an assistant
    const existingAssistant = await getAssistantForConversation(conversationId)
    if (existingAssistant) {
      return existingAssistant
    }
    
    // Get contact info for assistant creation
    const { data: conversation, error: conversationError } = await supabaseAdmin
      .from('conversations')
      .select(`
        whatsapp_contact_id,
        whatsapp_contacts (
          phone_number,
          display_name,
          push_name
        )
      `)
      .eq('id', conversationId)
      .single()
    
    if (conversationError || !conversation?.whatsapp_contacts) {
      console.error('❌ Error fetching conversation details:', conversationError)
      return null
    }
    
    const contact = conversation.whatsapp_contacts
    const contactName = contact.display_name || contact.push_name || null
    
    console.log('🆕 Creating new personal assistant for conversation:', conversationId)
    
    // Create new personal assistant
    return await createUserAssistant(
      conversationId,
      contact.phone_number,
      contactName
    )
    
  } catch (error) {
    console.error('❌ Error in getOrCreateAssistantForConversation:', error)
    return null
  }
}

/**
 * Update assistant configuration
 */
export const updateAssistantConfig = async (
  assistantId: string,
  config: Partial<AssistantConfig>,
  metadata?: Partial<AssistantMetadata>
): Promise<boolean> => {
  try {
    console.log('🔧 Updating assistant config:', assistantId)
    
    const assistant = await langGraphClient.updateAssistant(assistantId, {
      config: config,
      metadata: metadata
    })
    
    // Update database record
    const { error: dbError } = await supabaseAdmin
      .from('conversations')
      .update({
        assistant_config: config,
        assistant_metadata: metadata
      })
      .eq('assistant_id', assistantId)
    
    if (dbError) {
      console.error('❌ Failed to update assistant in database:', dbError)
    }
    
    console.log('✅ Assistant config updated successfully')
    return true
    
  } catch (error) {
    console.error('❌ Error updating assistant config:', error)
    return false
  }
}

/**
 * Delete an assistant
 */
export const deleteAssistant = async (assistantId: string): Promise<boolean> => {
  try {
    console.log('🗑️ Deleting assistant:', assistantId)
    
    await langGraphClient.deleteAssistant(assistantId)
    
    // Update database to remove assistant reference
    const { error: dbError } = await supabaseAdmin
      .from('conversations')
      .update({
        assistant_id: null,
        assistant_name: null,
        assistant_created_at: null,
        assistant_config: null,
        assistant_metadata: null,
        ai_enabled: false
      })
      .eq('assistant_id', assistantId)
    
    if (dbError) {
      console.error('❌ Failed to remove assistant from database:', dbError)
    }
    
    console.log('✅ Assistant deleted successfully')
    return true
    
  } catch (error) {
    console.error('❌ Error deleting assistant:', error)
    return false
  }
}

/**
 * Get assistant details from LangGraph API
 */
export const getAssistantDetails = async (assistantId: string): Promise<AssistantResponse | null> => {
  try {
    const assistant = await langGraphClient.getAssistant(assistantId)
    return assistant
    
  } catch (error) {
    console.error('❌ Error fetching assistant details:', error)
    return null
  }
}

/**
 * List all assistants for monitoring
 */
export const listAllAssistants = async (): Promise<AssistantResponse[]> => {
  try {
         const assistants = await langGraphClient.searchAssistants({
       limit: 100
     })
    return assistants
    
  } catch (error) {
    console.error('❌ Error listing assistants:', error)
    return []
  }
}

function getDisplayName(contact: Database['public']['Tables']['whatsapp_contacts']['Row']): string {
  const displayName = contact.display_name ?? contact.push_name ?? contact.verified_name
  return displayName || 'Unknown Contact'
} 