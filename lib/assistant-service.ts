// ===================================================
// BargainB Assistant Management Service
// Phase 2: Assistant Creation and Management Logic
// ===================================================

import { supabase } from './supabase'
import { Json } from './database.types'
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

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
const AI_API_URL = 'https://ht-ample-carnation-93-62e3a16b2190526eac38c74198169a7f.us.langgraph.app'
const AI_API_KEY = process.env.BARGAINB_AI_AGENT_API_KEY || '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'
const SHARED_ASSISTANT_ID = '5fd12ecb-9268-51f0-8168-fc7952c7c8b8' // Fallback

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
    const response = await fetch(`${AI_API_URL}/assistants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': AI_API_KEY
      },
      body: JSON.stringify({
        graph_id: "product_retrieval_agent",
        config: assistantConfig,
        metadata: metadata,
        if_exists: "do_nothing", // Don't error if assistant already exists
        name: assistantName,
        description: `Personalized grocery shopping assistant for ${phoneNumber}`
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Failed to create assistant:', response.status, errorText)
      throw new Error(`Assistant creation failed: ${response.status} ${errorText}`)
    }
    
    const assistant: AssistantResponse = await response.json()
    console.log('✅ Assistant created successfully:', assistant.assistant_id)
    
    // Store assistant info in database
    const { data, error } = await supabase
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
    
    // Fallback to shared assistant
    console.log('🔄 Falling back to shared assistant:', SHARED_ASSISTANT_ID)
    
    // Update database with shared assistant as fallback
    await supabase
      .from('conversations')
      .update({
        assistant_id: SHARED_ASSISTANT_ID,
        assistant_name: 'Shared BargainB Assistant',
        assistant_created_at: new Date().toISOString(),
        assistant_config: { fallback: true },
        assistant_metadata: { fallback_reason: 'creation_failed' }
      })
      .eq('id', conversationId)
    
    return SHARED_ASSISTANT_ID
  }
}

/**
 * Get assistant for a conversation (create if doesn't exist)
 */
export const getOrCreateAssistantForConversation = async (
  conversationId: string
): Promise<string> => {
  try {
    // Check if conversation already has an assistant
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select('assistant_id, whatsapp_contact_id')
      .eq('id', conversationId)
      .single()
    
    if (error) {
      console.error('❌ Error fetching conversation:', error)
      return SHARED_ASSISTANT_ID
    }
    
    // Return existing assistant if available
    if (conversation.assistant_id) {
      console.log('✅ Using existing assistant:', conversation.assistant_id)
      return conversation.assistant_id
    }
    
    // Get contact info for assistant creation
    const { data: contact, error: contactError } = await supabase
      .from('whatsapp_contacts')
      .select('phone_number, display_name')
      .eq('id', conversation.whatsapp_contact_id)
      .single()
    
    if (contactError) {
      console.error('❌ Error fetching contact:', contactError)
      return SHARED_ASSISTANT_ID
    }
    
    // Create new assistant
    return await createUserAssistant(
      conversationId,
      contact.phone_number,
      contact.display_name || null
    )
    
  } catch (error) {
    console.error('❌ Error in getOrCreateAssistantForConversation:', error)
    return SHARED_ASSISTANT_ID
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
    
    const response = await fetch(`${AI_API_URL}/assistants/${assistantId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': AI_API_KEY
      },
      body: JSON.stringify({
        config: config,
        metadata: metadata
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Failed to update assistant:', response.status, errorText)
      return false
    }
    
    // Update database record
    const { error: dbError } = await supabase
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
    
    // Don't delete the shared assistant
    if (assistantId === SHARED_ASSISTANT_ID) {
      console.log('⚠️ Cannot delete shared assistant')
      return false
    }
    
    const response = await fetch(`${AI_API_URL}/assistants/${assistantId}`, {
      method: 'DELETE',
      headers: {
        'X-Api-Key': AI_API_KEY
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Failed to delete assistant:', response.status, errorText)
      return false
    }
    
    // Update database to remove assistant reference
    const { error: dbError } = await supabase
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
    const response = await fetch(`${AI_API_URL}/assistants/${assistantId}`, {
      headers: {
        'X-Api-Key': AI_API_KEY
      }
    })
    
    if (!response.ok) {
      console.error('❌ Failed to fetch assistant details:', response.status)
      return null
    }
    
    const assistant: AssistantResponse = await response.json()
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
    const response = await fetch(`${AI_API_URL}/assistants/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': AI_API_KEY
      },
      body: JSON.stringify({
        graph_id: "product_retrieval_agent",
        limit: 100,
        sort_by: "created_at",
        sort_order: "desc"
      })
    })
    
    if (!response.ok) {
      console.error('❌ Failed to list assistants:', response.status)
      return []
    }
    
    const assistants: AssistantResponse[] = await response.json()
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