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
    ENABLE_TOOLS?: boolean
    ENABLE_PRODUCT_SEARCH?: boolean
    ENABLE_PRICE_COMPARISON?: boolean
    ENABLE_SHOPPING_LIST?: boolean
    ENABLE_STORE_LOCATOR?: boolean
    ENABLE_RECIPE_SUGGESTIONS?: boolean
    ENABLE_FALLBACK_RESPONSES?: boolean
    MAX_TOOL_CALLS_PER_REQUEST?: number
    REQUEST_TIMEOUT_SECONDS?: number
    TEMPERATURE?: number
    RESPONSE_STYLE?: string
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
 * Default assistant configuration with tools enabled
 */
const DEFAULT_ASSISTANT_CONFIG: AssistantConfig = {
  tags: ['bargainb', 'grocery', 'whatsapp'],
  recursion_limit: 25,
  configurable: {
    ENABLE_TOOLS: true,
    ENABLE_PRODUCT_SEARCH: true,
    ENABLE_PRICE_COMPARISON: true,
    ENABLE_SHOPPING_LIST: true,
    ENABLE_STORE_LOCATOR: true,
    ENABLE_RECIPE_SUGGESTIONS: true,
    ENABLE_FALLBACK_RESPONSES: true,
    MAX_TOOL_CALLS_PER_REQUEST: 5,
    REQUEST_TIMEOUT_SECONDS: 30,
    TEMPERATURE: 0.7,
    RESPONSE_STYLE: 'helpful'
  }
}

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
    
    // Merge default config with user preferences
    const assistantConfig: AssistantConfig = {
      ...DEFAULT_ASSISTANT_CONFIG,
      configurable: {
        ...DEFAULT_ASSISTANT_CONFIG.configurable,
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
      graph_id: "chatbot_agent",
      config: assistantConfig,
      metadata: metadata,
      name: assistantName
    })
    
    console.log('✅ Assistant created successfully:', assistant.assistant_id)
    
    // Store assistant info in database
    const { error: updateError } = await supabaseAdmin
      .from('conversations')
      .update({
        assistant_id: assistant.assistant_id,
        assistant_name: assistantName,
        assistant_config: assistantConfig as unknown as Json,
        assistant_metadata: metadata as unknown as Json,
        assistant_created_at: new Date().toISOString(),
        ai_enabled: true
      })
      .eq('id', conversationId)
    
    if (updateError) {
      console.error('❌ Error updating conversation with assistant info:', updateError)
      // Assistant was created but database update failed - not critical
    }
    
    return assistant.assistant_id
    
  } catch (error) {
    console.error('❌ Error creating assistant:', error)
    throw error
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
 * Update assistant configuration to enable tools
 */
export const updateAssistantConfiguration = async (
  assistantId: string,
  config?: Partial<AssistantConfig>
): Promise<boolean> => {
  try {
    console.log('🔧 Updating assistant configuration:', assistantId)
    
    const updateConfig = {
      ...DEFAULT_ASSISTANT_CONFIG,
      ...config
    }
    
    const updatedAssistant = await langGraphClient.updateAssistant(assistantId, {
      config: updateConfig
    })
    
    console.log('✅ Assistant configuration updated successfully')
    return true
    
  } catch (error) {
    console.error('❌ Error updating assistant configuration:', error)
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

/**
 * Sync configurations for all existing assistants to ensure they have proper tool access
 */
export const syncAllAssistantConfigurations = async (): Promise<{
  success: boolean
  updated: number
  failed: number
  errors: string[]
}> => {
  try {
    console.log('🔄 Starting assistant configuration sync...')
    
    // Get all assistants from BB Agent
    const assistants = await langGraphClient.searchAssistants({
      metadata: {},
      limit: 100,
      offset: 0
    })
    
    let updated = 0
    let failed = 0
    const errors: string[] = []
    
    for (const assistant of assistants) {
      try {
        // Check if assistant needs configuration update
        const needsUpdate = !assistant.config || 
                          !assistant.config.configurable || 
                          !assistant.config.configurable.ENABLE_TOOLS
        
        if (needsUpdate) {
          console.log(`🔧 Updating configuration for assistant: ${assistant.name}`)
          
          const success = await updateAssistantConfiguration(assistant.assistant_id, {
            configurable: {
              ENABLE_TOOLS: true,
              ENABLE_PRODUCT_SEARCH: true,
              ENABLE_PRICE_COMPARISON: true,
              ENABLE_SHOPPING_LIST: true,
              ENABLE_STORE_LOCATOR: true,
              ENABLE_RECIPE_SUGGESTIONS: true,
              ENABLE_FALLBACK_RESPONSES: true,
              MAX_TOOL_CALLS_PER_REQUEST: 5,
              REQUEST_TIMEOUT_SECONDS: 30,
              TEMPERATURE: 0.7,
              RESPONSE_STYLE: 'helpful'
            }
          })
          
          if (success) {
            updated++
            console.log(`✅ Updated configuration for: ${assistant.name}`)
          } else {
            failed++
            errors.push(`Failed to update: ${assistant.name}`)
          }
        }
      } catch (error) {
        failed++
        const errorMsg = `Error updating ${assistant.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        errors.push(errorMsg)
        console.error('❌', errorMsg)
      }
    }
    
    console.log(`✅ Configuration sync completed: ${updated} updated, ${failed} failed`)
    
    return {
      success: true,
      updated,
      failed,
      errors
    }
    
  } catch (error) {
    console.error('❌ Error during configuration sync:', error)
    return {
      success: false,
      updated: 0,
      failed: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }
  }
}

/**
 * Fix a specific assistant that's giving "trouble accessing tools" errors
 */
export const fixAssistantToolAccess = async (assistantId: string): Promise<{
  success: boolean
  message: string
}> => {
  try {
    console.log('🔧 Fixing tool access for assistant:', assistantId)
    
    // Get current assistant details
    const assistant = await langGraphClient.getAssistant(assistantId)
    
    if (!assistant) {
      return {
        success: false,
        message: 'Assistant not found'
      }
    }
    
    // Update configuration with proper tool access
    const success = await updateAssistantConfiguration(assistantId, {
      configurable: {
        ENABLE_TOOLS: true,
        ENABLE_PRODUCT_SEARCH: true,
        ENABLE_PRICE_COMPARISON: true,
        ENABLE_SHOPPING_LIST: true,
        ENABLE_STORE_LOCATOR: true,
        ENABLE_RECIPE_SUGGESTIONS: true,
        ENABLE_FALLBACK_RESPONSES: true,
        MAX_TOOL_CALLS_PER_REQUEST: 5,
        REQUEST_TIMEOUT_SECONDS: 30,
        TEMPERATURE: 0.7,
        RESPONSE_STYLE: 'helpful'
      }
    })
    
    if (success) {
      // Update database records for conversations using this assistant
      const { error: dbError } = await supabaseAdmin
        .from('conversations')
        .update({
          assistant_config: DEFAULT_ASSISTANT_CONFIG as unknown as Json,
          updated_at: new Date().toISOString()
        })
        .eq('assistant_id', assistantId)
      
      if (dbError) {
        console.warn('⚠️ Database update failed:', dbError)
      }
      
      return {
        success: true,
        message: `Successfully fixed tool access for assistant: ${assistant.name}`
      }
    } else {
      return {
        success: false,
        message: 'Failed to update assistant configuration'
      }
    }
    
  } catch (error) {
    console.error('❌ Error fixing assistant tool access:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

function getDisplayName(contact: Database['public']['Tables']['whatsapp_contacts']['Row']): string {
  const displayName = contact.display_name ?? contact.push_name ?? contact.verified_name
  return displayName || 'Unknown Contact'
} 