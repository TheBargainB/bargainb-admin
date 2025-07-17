import { createClient } from '@/utils/supabase/client'
import type { 
  Conversation
} from '@/types/chat-v2.types'
import { 
  createUserAssignment,
  fetchBBAssistants,
  type AssignUserData 
} from '@/actions/ai-management'

const supabase = createClient()

// =============================================================================
// ASSISTANT ASSIGNMENT TYPES
// =============================================================================

export interface AssistantAssignmentResult {
  success: boolean
  assistant_id?: string
  conversation_id: string
  was_already_assigned: boolean
  assignment_created?: boolean
  error?: string
}

export interface ConversationAssistantInfo {
  has_assistant: boolean
  assistant_id?: string
  assistant_name?: string
  assistant_config?: any
  ai_enabled?: boolean
}

// =============================================================================
// CHECK EXISTING ASSIGNMENT
// =============================================================================

/**
 * Check if a conversation already has an AI assistant assigned
 */
export async function checkConversationAssistant(
  conversationId: string
): Promise<ConversationAssistantInfo> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('assistant_id, assistant_name, assistant_config, ai_enabled')
      .eq('id', conversationId)
      .single()

    if (error) {
      console.error('❌ Error checking conversation assistant:', error)
      return { has_assistant: false }
    }

    const hasAssistant = !!(data?.assistant_id && data?.ai_enabled)

    return {
      has_assistant: hasAssistant,
      assistant_id: data?.assistant_id || undefined,
      assistant_name: data?.assistant_name || undefined,
      assistant_config: data?.assistant_config || undefined,
      ai_enabled: data?.ai_enabled || false
    }

  } catch (error) {
    console.error('❌ Error in checkConversationAssistant:', error)
    return { has_assistant: false }
  }
}

// =============================================================================
// GET DEFAULT ASSISTANT
// =============================================================================

/**
 * Get the default assistant or create one if none exists
 */
export async function getDefaultAssistant(): Promise<string | null> {
  try {
    // Fetch available assistants from the AI management system
    const assistantsResult = await fetchBBAssistants()
    
    if (!assistantsResult.success || !assistantsResult.data) {
      console.warn('⚠️ No assistants available from BB Agent system')
      return null
    }

    const assistants = assistantsResult.data
    
    if (assistants.length === 0) {
      console.warn('⚠️ No assistants found in BB Agent system')
      return null
    }

    // Find a default assistant or use the first one
    const defaultAssistant = assistants.find(assistant => 
      assistant.name.toLowerCase().includes('default') ||
      assistant.name.toLowerCase().includes('bargainb') ||
      assistant.name.toLowerCase().includes('grocery') ||
      assistant.name.toLowerCase().includes('beeb')
    ) || assistants[0]

    console.log('✅ Using default assistant:', defaultAssistant.name, '(ID:', defaultAssistant.assistant_id, ')')
    return defaultAssistant.assistant_id

  } catch (error) {
    console.error('❌ Error getting default assistant:', error)
    return null
  }
}

// =============================================================================
// ASSIGN ASSISTANT TO CONVERSATION
// =============================================================================

/**
 * Assign an AI assistant to a conversation for direct communication
 */
export async function assignAssistantToConversation(
  conversationId: string,
  phoneNumber: string
): Promise<AssistantAssignmentResult> {
  try {
    console.log('🤖 Starting assistant assignment for conversation:', conversationId)
    
    // Step 1: Check if conversation already has an assistant
    const existingAssistant = await checkConversationAssistant(conversationId)
    
    if (existingAssistant.has_assistant) {
      console.log('✅ Conversation already has assistant:', existingAssistant.assistant_id)
      return {
        success: true,
        assistant_id: existingAssistant.assistant_id!,
        conversation_id: conversationId,
        was_already_assigned: true,
        assignment_created: false
      }
    }

    // Step 2: Get default assistant
    const defaultAssistantId = await getDefaultAssistant()
    
    if (!defaultAssistantId) {
      return {
        success: false,
        conversation_id: conversationId,
        was_already_assigned: false,
        assignment_created: false,
        error: 'No default assistant available'
      }
    }

    // Step 3: Create assignment using AI management system
    const assignmentData: AssignUserData = {
      phone_number: phoneNumber,
      assistant_id: defaultAssistantId,
      auto_enable: true,
      priority: 'normal',
      notification_settings: {
        enable_notifications: true,
        enable_sound: false
      },
      custom_config: {
        trigger_source: 'direct_communication',
        assigned_at: new Date().toISOString()
      },
      notes: `Auto-assigned for direct AI communication`
    }

    console.log('🔄 Creating assistant assignment...', assignmentData)
    const assignmentResult = await createUserAssignment(assignmentData)

    if (!assignmentResult.success) {
      console.error('❌ Failed to create assignment:', assignmentResult.error)
      return {
        success: false,
        conversation_id: conversationId,
        was_already_assigned: false,
        assignment_created: false,
        error: assignmentResult.error || 'Failed to create assignment'
      }
    }

    // Step 4: Update conversation with assistant info
    const { error: updateError } = await supabase
      .from('conversations')
      .update({
        assistant_id: defaultAssistantId,
        ai_enabled: true,
        assistant_name: `BargainB Assistant`,
        assistant_config: assignmentData.custom_config,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)

    if (updateError) {
      console.error('❌ Error updating conversation with assistant:', updateError)
      // Assignment was created but conversation update failed
      return {
        success: false,
        conversation_id: conversationId,
        was_already_assigned: false,
        assignment_created: true,
        error: 'Assignment created but conversation update failed'
      }
    }

    console.log('✅ Assistant assigned successfully:', defaultAssistantId)
    return {
      success: true,
      assistant_id: defaultAssistantId,
      conversation_id: conversationId,
      was_already_assigned: false,
      assignment_created: true
    }

  } catch (error) {
    console.error('❌ Error in assignAssistantToConversation:', error)
    return {
      success: false,
      conversation_id: conversationId,
      was_already_assigned: false,
      assignment_created: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// =============================================================================
// ENSURE ASSISTANT ASSIGNED
// =============================================================================

/**
 * Ensure a conversation has an assistant assigned (assign if not)
 * This is the main function to call when ensuring assistant assignment
 */
export async function ensureConversationHasAssistant(
  conversationId: string,
  phoneNumber: string
): Promise<string | null> {
  try {
    const result = await assignAssistantToConversation(
      conversationId, 
      phoneNumber
    )

    if (result.success) {
      console.log('🤖 Conversation has assistant:', result.assistant_id)
      return result.assistant_id ?? null
    } else {
      console.error('❌ Failed to ensure assistant assignment:', result.error)
      return null
    }

  } catch (error) {
    console.error('❌ Error in ensureConversationHasAssistant:', error)
    return null
  }
}

// =============================================================================
// GET CONVERSATION PHONE NUMBER
// =============================================================================

/**
 * Get phone number for a conversation to use in assistant assignment
 */
export async function getConversationPhoneNumber(
  conversationId: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        whatsapp_contacts!conversations_whatsapp_contact_id_fkey (
          phone_number
        )
      `)
      .eq('id', conversationId)
      .single()

    if (error || !data) {
      console.error('❌ Error getting conversation phone number:', error)
      return null
    }

    const contact = Array.isArray(data.whatsapp_contacts) 
      ? data.whatsapp_contacts[0] 
      : data.whatsapp_contacts

    const phoneNumber = contact?.phone_number
    return phoneNumber ?? null

  } catch (error) {
    console.error('❌ Error in getConversationPhoneNumber:', error)
    return null
  }
}

// =============================================================================
// PROCESS BB MENTION WITH ASSIGNMENT
// =============================================================================

 