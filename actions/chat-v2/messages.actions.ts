import { createClient } from '@/utils/supabase/client'
import type { 
  Message, 
  MessageInsert, 
  MessageUpdate, 
  MessagesResponse,
  WASenderMessage,
  WASenderWebhookPayload,
  ProcessedWebhookMessage,
  MessageType,
  MessageStatus,
  SenderType
} from '@/types/chat-v2.types'

const supabase = createClient()

// =============================================================================
// FETCH MESSAGES
// =============================================================================

export async function getMessagesByConversation(
  conversationId: string,
  limit: number = 50,
  offset: number = 0
): Promise<MessagesResponse> {
  try {
    // First get the conversation data
    const { data: conversationData, error: convError } = await supabase
      .from('conversations')
      .select(`
        *,
        whatsapp_contacts!conversations_whatsapp_contact_id_fkey (
          id,
          phone_number,
          whatsapp_jid,
          display_name,
          push_name,
          verified_name,
          profile_picture_url,
          is_active,
          last_seen_at,
          created_at,
          updated_at
        )
      `)
      .eq('id', conversationId)
      .single()

    if (convError) {
      console.error('❌ Error fetching conversation:', convError)
      throw new Error(`Failed to fetch conversation: ${convError.message}`)
    }

    // Get total message count first
    const { count: totalCount, error: countError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)

    if (countError) {
      console.error('❌ Error getting message count:', countError)
      throw new Error(`Failed to get message count: ${countError.message}`)
    }

    // For initial fetch (offset = 0), get the latest messages
    // For pagination (offset > 0), get older messages for "Load older messages" functionality
    let messagesQuery = supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)

    if (offset === 0) {
      // Initial fetch: Get the latest messages (newest first, then reverse for chronological display)
      messagesQuery = messagesQuery
        .order('created_at', { ascending: false })
        .limit(limit)
    } else {
      // Pagination: Get older messages (oldest first for prepending to existing list)  
      // Calculate the offset from the beginning to get older messages
      messagesQuery = messagesQuery
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1)
    }

    const { data: messagesData, error: messagesError } = await messagesQuery

    if (messagesError) {
      console.error('❌ Error fetching messages:', messagesError)
      throw new Error(`Failed to fetch messages: ${messagesError.message}`)
    }

    // For initial fetch, reverse the messages to show in chronological order (oldest to newest)
    // For pagination, keep the order as-is since we're prepending older messages
    const orderedMessages: any[] = offset === 0 && messagesData ? [...messagesData].reverse() : (messagesData || [])

    // Transform conversation data
    const conversation = {
      id: conversationData.id,
      whatsapp_contact_id: conversationData.whatsapp_contact_id,
      whatsapp_conversation_id: conversationData.whatsapp_conversation_id,
      title: conversationData.title || undefined,
      unread_count: conversationData.unread_count || 0,
      last_message_at: conversationData.last_message_at || undefined,
      status: (conversationData.status as 'active' | 'archived' | 'resolved') || 'active',
      created_at: conversationData.created_at || new Date().toISOString(),
      updated_at: conversationData.updated_at || undefined,
      
      contact: conversationData.whatsapp_contacts ? {
        id: conversationData.whatsapp_contacts.id,
        phone_number: conversationData.whatsapp_contacts.phone_number,
        whatsapp_jid: conversationData.whatsapp_contacts.whatsapp_jid,
        display_name: conversationData.whatsapp_contacts.display_name || undefined,
        push_name: conversationData.whatsapp_contacts.push_name || undefined,
        verified_name: conversationData.whatsapp_contacts.verified_name || undefined,
        profile_picture_url: conversationData.whatsapp_contacts.profile_picture_url || undefined,
        is_active: conversationData.whatsapp_contacts.is_active || false,
        last_seen_at: conversationData.whatsapp_contacts.last_seen_at || undefined,
        created_at: conversationData.whatsapp_contacts.created_at || new Date().toISOString(),
        updated_at: conversationData.whatsapp_contacts.updated_at || undefined,
      } : undefined
    }

    // Transform messages data
    const messages: Message[] = orderedMessages.map((msg: any) => {
      const senderType: SenderType = msg.direction === 'inbound' ? 'user' : 
                                   msg.is_ai_triggered ? 'ai' : 'admin'
      
      const senderName = senderType === 'user' 
        ? (conversation.contact?.display_name || conversation.contact?.push_name || conversation.contact?.phone_number || 'User')
        : senderType === 'ai' 
          ? 'AI Assistant'
          : 'BargainB'

      return {
        id: msg.id,
        conversation_id: msg.conversation_id,
        content: msg.content,
        direction: msg.direction as 'inbound' | 'outbound',
        from_me: msg.from_me,
        message_type: (msg.message_type as MessageType) || 'text',
        sender_type: senderType,
        whatsapp_message_id: msg.whatsapp_message_id || undefined,
        whatsapp_status: (msg.whatsapp_status as MessageStatus) || 'sent',
        media_url: msg.media_url || undefined,
        created_at: msg.created_at || new Date().toISOString(),
        
        // UI-specific fields
        sender_name: senderName,
        is_ai_generated: msg.is_ai_triggered || false,
        ai_confidence: (msg.raw_message_data as any)?.ai_confidence || undefined
      }
    })

    return {
      messages,
      total_count: totalCount || 0,
      conversation
    }

  } catch (error) {
    console.error('❌ Error in getMessagesByConversation:', error)
    throw error
  }
}

// =============================================================================
// CREATE MESSAGE
// =============================================================================

export async function createMessage(messageData: MessageInsert): Promise<Message> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select('*')
      .single()

    if (error) {
      console.error('❌ Error creating message:', error)
      throw new Error(`Failed to create message: ${error.message}`)
    }

    if (!data) {
      throw new Error('No data returned from message creation')
    }

    // Get conversation data for sender name
    const { data: conversationData } = await supabase
      .from('conversations')
      .select(`
        whatsapp_contacts!conversations_whatsapp_contact_id_fkey (
          display_name,
          push_name,
          phone_number
        )
      `)
      .eq('id', data.conversation_id)
      .single()

    // Transform to clean type
    const senderType: SenderType = data.direction === 'inbound' ? 'user' : 
                                 data.is_ai_triggered ? 'ai' : 'admin'
    
    const senderName = senderType === 'user' 
      ? (conversationData?.whatsapp_contacts?.display_name || 
         conversationData?.whatsapp_contacts?.push_name || 
         conversationData?.whatsapp_contacts?.phone_number || 'User')
      : senderType === 'ai' 
        ? 'AI Assistant'
        : 'BargainB'

    const message: Message = {
      id: data.id,
      conversation_id: data.conversation_id,
      content: data.content,
      direction: data.direction as 'inbound' | 'outbound',
      from_me: data.from_me,
      message_type: (data.message_type as MessageType) || 'text',
      sender_type: senderType,
      whatsapp_message_id: data.whatsapp_message_id || undefined,
      whatsapp_status: (data.whatsapp_status as MessageStatus) || 'sent',
      media_url: data.media_url || undefined,
      created_at: data.created_at || new Date().toISOString(),
      
      sender_name: senderName,
      is_ai_generated: data.is_ai_triggered || false,
      ai_confidence: (data.raw_message_data as any)?.ai_confidence || undefined
    }

    console.log('✅ Message created:', message.id)
    return message

  } catch (error) {
    console.error('❌ Error in createMessage:', error)
    throw error
  }
}

// =============================================================================
// UPDATE MESSAGE
// =============================================================================

export async function updateMessage(
  messageId: string,
  updates: MessageUpdate
): Promise<Message> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .update(updates)
      .eq('id', messageId)
      .select('*')
      .single()

    if (error) {
      console.error('❌ Error updating message:', error)
      throw new Error(`Failed to update message: ${error.message}`)
    }

    if (!data) {
      throw new Error('Message not found')
    }

    // Get conversation data for sender name
    const { data: conversationData } = await supabase
      .from('conversations')
      .select(`
        whatsapp_contacts!conversations_whatsapp_contact_id_fkey (
          display_name,
          push_name,
          phone_number
        )
      `)
      .eq('id', data.conversation_id)
      .single()

    // Transform to clean type
    const senderType: SenderType = data.direction === 'inbound' ? 'user' : 
                                 data.is_ai_triggered ? 'ai' : 'admin'
    
    const senderName = senderType === 'user' 
      ? (conversationData?.whatsapp_contacts?.display_name || 
         conversationData?.whatsapp_contacts?.push_name || 
         conversationData?.whatsapp_contacts?.phone_number || 'User')
      : senderType === 'ai' 
        ? 'AI Assistant'
        : 'BargainB'

    const message: Message = {
      id: data.id,
      conversation_id: data.conversation_id,
      content: data.content,
      direction: data.direction as 'inbound' | 'outbound',
      from_me: data.from_me,
      message_type: (data.message_type as MessageType) || 'text',
      sender_type: senderType,
      whatsapp_message_id: data.whatsapp_message_id || undefined,
      whatsapp_status: (data.whatsapp_status as MessageStatus) || 'sent',
      media_url: data.media_url || undefined,
      created_at: data.created_at || new Date().toISOString(),
      
      sender_name: senderName,
      is_ai_generated: data.is_ai_triggered || false,
      ai_confidence: (data.raw_message_data as any)?.ai_confidence || undefined
    }

    console.log('✅ Message updated:', message.id)
    return message

  } catch (error) {
    console.error('❌ Error in updateMessage:', error)
    throw error
  }
}

// =============================================================================
// UPDATE MESSAGE STATUS
// =============================================================================

export async function updateMessageStatus(
  messageId: string,
  status: MessageStatus
): Promise<void> {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ whatsapp_status: status })
      .eq('id', messageId)

    if (error) {
      console.error('❌ Error updating message status:', error)
      throw new Error(`Failed to update message status: ${error.message}`)
    }

    console.log('✅ Message status updated:', messageId, status)

  } catch (error) {
    console.error('❌ Error in updateMessageStatus:', error)
    throw error
  }
}

// =============================================================================
// DELETE MESSAGE
// =============================================================================

export async function deleteMessage(messageId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)

    if (error) {
      console.error('❌ Error deleting message:', error)
      throw new Error(`Failed to delete message: ${error.message}`)
    }

    console.log('✅ Message deleted:', messageId)

  } catch (error) {
    console.error('❌ Error in deleteMessage:', error)
    throw error
  }
}

// =============================================================================
// GET MESSAGE BY WHATSAPP MESSAGE ID
// =============================================================================

export async function getMessageByWhatsAppId(
  whatsappMessageId: string
): Promise<Message | null> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('whatsapp_message_id', whatsappMessageId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Message not found
      }
      console.error('❌ Error fetching message by WhatsApp ID:', error)
      throw new Error(`Failed to fetch message: ${error.message}`)
    }

    if (!data) return null

    // Get conversation data for sender name
    const { data: conversationData } = await supabase
      .from('conversations')
      .select(`
        whatsapp_contacts!conversations_whatsapp_contact_id_fkey (
          display_name,
          push_name,
          phone_number
        )
      `)
      .eq('id', data.conversation_id)
      .single()

    // Transform to clean type
    const senderType: SenderType = data.direction === 'inbound' ? 'user' : 
                                 data.is_ai_triggered ? 'ai' : 'admin'
    
    const senderName = senderType === 'user' 
      ? (conversationData?.whatsapp_contacts?.display_name || 
         conversationData?.whatsapp_contacts?.push_name || 
         conversationData?.whatsapp_contacts?.phone_number || 'User')
      : senderType === 'ai' 
        ? 'AI Assistant'
        : 'BargainB'

    const message: Message = {
      id: data.id,
      conversation_id: data.conversation_id,
      content: data.content,
      direction: data.direction as 'inbound' | 'outbound',
      from_me: data.from_me,
      message_type: (data.message_type as MessageType) || 'text',
      sender_type: senderType,
      whatsapp_message_id: data.whatsapp_message_id || undefined,
      whatsapp_status: (data.whatsapp_status as MessageStatus) || 'sent',
      media_url: data.media_url || undefined,
      created_at: data.created_at || new Date().toISOString(),
      
      sender_name: senderName,
      is_ai_generated: data.is_ai_triggered || false,
      ai_confidence: (data.raw_message_data as any)?.ai_confidence || undefined
    }

    return message

  } catch (error) {
    console.error('❌ Error in getMessageByWhatsAppId:', error)
    throw error
  }
}

// =============================================================================
// WASENDER WEBHOOK PROCESSING
// =============================================================================

export function extractMessageContent(wasenderMessage: WASenderMessage): {
  content: string;
  messageType: MessageType;
} {
  const message = wasenderMessage.message

  if (!message) {
    return { content: '', messageType: 'text' }
  }

  // Text messages - check extendedTextMessage first, then conversation
  if (message.extendedTextMessage?.text) {
    return { content: message.extendedTextMessage.text, messageType: 'text' }
  }
  
  if (message.conversation) {
    return { content: message.conversation, messageType: 'text' }
  }

  // Media messages
  if (message.imageMessage) {
    return { content: '[Image]', messageType: 'image' }
  }
  
  if (message.videoMessage) {
    return { content: '[Video]', messageType: 'video' }
  }
  
  if (message.audioMessage) {
    return { content: '[Audio]', messageType: 'audio' }
  }
  
  if (message.documentMessage) {
    return { content: '[Document]', messageType: 'document' }
  }
  
  if (message.stickerMessage) {
    return { content: '[Sticker]', messageType: 'sticker' }
  }

  return { content: '', messageType: 'text' }
}

export function extractPhoneNumber(remoteJid: string): string {
  return remoteJid.replace('@s.whatsapp.net', '').replace('@c.us', '')
}

export function processWASenderWebhookMessage(
  wasenderMessage: WASenderMessage
): ProcessedWebhookMessage | null {
  try {
    const { content, messageType } = extractMessageContent(wasenderMessage)
    
    // Skip empty messages
    if (!content.trim() && messageType === 'text') {
      console.log('⚠️ Skipping empty message:', wasenderMessage.key.id)
      return null
    }

    const phoneNumber = extractPhoneNumber(wasenderMessage.key.remoteJid)
    const direction = wasenderMessage.key.fromMe ? 'outbound' : 'inbound'
    
    // Create message data for database
    const messageData: MessageInsert = {
      content,
      conversation_id: '', // Will be set by the caller
      direction,
      from_me: wasenderMessage.key.fromMe,
      message_type: messageType,
      whatsapp_message_id: wasenderMessage.key.id,
      whatsapp_status: wasenderMessage.key.fromMe ? 'sent' : 'delivered',
      sender_type: direction === 'inbound' ? 'user' : 'admin',
      raw_message_data: JSON.parse(JSON.stringify(wasenderMessage)), // Convert to Json type
      created_at: new Date(wasenderMessage.messageTimestamp * 1000).toISOString()
    }

    // Extract media URLs if present
    const mediaFiles: any[] = []
    if (wasenderMessage.message) {
      const mediaTypes = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage']
      
      for (const mediaTypeKey of mediaTypes) {
        const mediaMessage = (wasenderMessage.message as any)[mediaTypeKey]
        if (mediaMessage?.url) {
          mediaFiles.push({
            type: mediaTypeKey.replace('Message', '') as MessageType,
            url: mediaMessage.url,
            // Note: Decryption would happen here in production
          })
        }
      }
    }

    return {
      conversation_id: '', // Will be set by the caller
      message_data: messageData,
      should_trigger_ai: direction === 'inbound', // Incoming messages might trigger AI
      media_files: mediaFiles.length > 0 ? mediaFiles : undefined
    }

  } catch (error) {
    console.error('❌ Error processing WASender webhook message:', error)
    return null
  }
}

// =============================================================================
// BB MENTION DETECTION
// =============================================================================

export interface BBMentionDetection {
  is_bb_mention: boolean;
  user_query: string;
  original_content: string;
  mention_patterns: string[];
}

/**
 * Detect @bb mentions in message content and extract the user query
 */
export function detectBBMention(content: string): BBMentionDetection {
  if (!content || typeof content !== 'string') {
    return {
      is_bb_mention: false,
      user_query: '',
      original_content: content || '',
      mention_patterns: []
    }
  }

  const lowerContent = content.toLowerCase()
  
  // Define various @bb mention patterns
  const mentionPatterns = [
    '@bb',
    '@bargainb', 
    '@bargain',
    'hey bb',
    'hi bb',
    'bb help',
    'bb please',
    'bb can you'
  ]
  
  // Check for any mention patterns
  const foundPatterns = mentionPatterns.filter(pattern => 
    lowerContent.includes(pattern.toLowerCase())
  )
  
  const is_bb_mention = foundPatterns.length > 0
  
  if (!is_bb_mention) {
    return {
      is_bb_mention: false,
      user_query: '',
      original_content: content,
      mention_patterns: []
    }
  }
  
  // Extract the user query by removing mention patterns
  let cleanedQuery = content
  
  // Remove the mention patterns from the beginning or anywhere in the text
  foundPatterns.forEach(pattern => {
    // Create regex to remove the pattern (case insensitive)
    const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    cleanedQuery = cleanedQuery.replace(regex, '')
  })
  
  // Clean up the query
  const user_query = cleanedQuery
    .trim()
    .replace(/^[,\-\s]+/, '') // Remove leading punctuation
    .replace(/[,\-\s]+$/, '') // Remove trailing punctuation
    .trim()
  
  console.log('🤖 BB Mention detected:', {
    original: content,
    patterns: foundPatterns,
    extracted_query: user_query
  })
  
  return {
    is_bb_mention: true,
    user_query,
    original_content: content,
    mention_patterns: foundPatterns
  }
}

/**
 * Enhanced message processing that includes @bb mention detection
 */
export function processIncomingMessageWithBBDetection(
  wasenderMessage: WASenderMessage
): ProcessedWebhookMessage | null {
  try {
    // First do the standard processing
    const standardProcessing = processWASenderWebhookMessage(wasenderMessage)
    
    if (!standardProcessing) {
      return null
    }
    
    // Only check for @bb mentions in inbound text messages
    if (standardProcessing.message_data.direction === 'inbound' && 
        standardProcessing.message_data.message_type === 'text') {
      
      // Detect @bb mentions
      const bbDetection = detectBBMention(standardProcessing.message_data.content)
      
      if (bbDetection.is_bb_mention) {
        console.log('🤖 Processing message with BB mention:', bbDetection.user_query)
        
        // Update the processed message to indicate BB mention
        return {
          ...standardProcessing,
          should_trigger_ai: true, // Force AI trigger for @bb mentions
          bb_mention_data: bbDetection // Add the detection data
        }
      }
    }
    
    // Return standard processing if no @bb mention
    return standardProcessing
    
  } catch (error) {
    console.error('❌ Error processing message with BB detection:', error)
    return null
  }
}

/**
 * Check if a message content contains any BB mention patterns
 */
export function hasBBMention(content: string): boolean {
  const detection = detectBBMention(content)
  return detection.is_bb_mention
}

/**
 * Extract clean user query from a message with @bb mention
 */
export function extractBBQuery(content: string): string {
  const detection = detectBBMention(content)
  return detection.user_query
}

/**
 * Process a message after it's been created to handle @bb mentions
 */
export async function processMessageForBBMention(
  message: Message
): Promise<{
  requires_ai_response: boolean;
  user_query: string;
  bb_detection: BBMentionDetection;
}> {
  try {
    // Only process inbound text messages
    if (message.direction !== 'inbound' || message.message_type !== 'text') {
      return {
        requires_ai_response: false,
        user_query: '',
        bb_detection: {
          is_bb_mention: false,
          user_query: '',
          original_content: message.content,
          mention_patterns: []
        }
      }
    }
    
    const bb_detection = detectBBMention(message.content)
    
    if (bb_detection.is_bb_mention) {
      console.log('🤖 Message requires AI response:', {
        message_id: message.id,
        conversation_id: message.conversation_id,
        user_query: bb_detection.user_query
      })
    }
    
    return {
      requires_ai_response: bb_detection.is_bb_mention,
      user_query: bb_detection.user_query,
      bb_detection
    }
    
  } catch (error) {
    console.error('❌ Error processing message for BB mention:', error)
    return {
      requires_ai_response: false,
      user_query: '',
      bb_detection: {
        is_bb_mention: false,
        user_query: '',
        original_content: message.content,
        mention_patterns: []
      }
    }
  }
}

/**
 * Complete message processing pipeline: detect @bb mentions + assign assistant + prepare for AI
 * This is the main function to call when a new message is created
 */
export async function processIncomingMessageWithFullPipeline(
  message: Message
): Promise<{
  bb_mention_detected: boolean;
  assistant_assigned: boolean;
  assistant_id?: string;
  ready_for_ai_processing: boolean;
  user_query: string;
  error?: string;
}> {
  try {
    console.log('🔄 Processing message through full pipeline:', message.id)
    
    // Step 1: Check for @bb mention
    const bbAnalysis = await processMessageForBBMention(message)
    
    if (!bbAnalysis.requires_ai_response) {
      console.log('📝 Message does not require AI processing')
      return {
        bb_mention_detected: false,
        assistant_assigned: false,
        ready_for_ai_processing: false,
        user_query: ''
      }
    }

    // Step 2: Import assistant assignment functions (to avoid circular dependency)
    const { processBBMentionWithAssignment } = await import('./assistant-assignment.actions')
    
    // Step 3: Process @bb mention with assistant assignment
    const assignmentResult = await processBBMentionWithAssignment(
      message.conversation_id,
      bbAnalysis.bb_detection
    )
    
    console.log('✅ Full pipeline completed:', {
      bb_mention_detected: true,
      assistant_assigned: assignmentResult.assistant_assigned,
      ready_for_ai_processing: assignmentResult.ready_for_ai_processing
    })
    
    return {
      bb_mention_detected: true,
      assistant_assigned: assignmentResult.assistant_assigned,
      assistant_id: assignmentResult.assistant_id,
      ready_for_ai_processing: assignmentResult.ready_for_ai_processing,
      user_query: bbAnalysis.user_query,
      error: assignmentResult.error
    }
    
  } catch (error) {
    console.error('❌ Error in processIncomingMessageWithFullPipeline:', error)
    return {
      bb_mention_detected: false,
      assistant_assigned: false,
      ready_for_ai_processing: false,
      user_query: '',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// =============================================================================
// UPDATE CONVERSATION LAST MESSAGE
// =============================================================================

export async function updateConversationLastMessage(
  conversationId: string,
  messageContent: string,
  messageTimestamp: string
): Promise<void> {
  try {
    // Also increment unread count if it's an inbound message
    const { error } = await supabase
      .from('conversations')
      .update({
        last_message_at: messageTimestamp,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)

    if (error) {
      console.error('❌ Error updating conversation last message:', error)
      throw new Error(`Failed to update conversation: ${error.message}`)
    }

    console.log('✅ Conversation last message updated:', conversationId)

  } catch (error) {
    console.error('❌ Error in updateConversationLastMessage:', error)
    throw error
  }
}

// =============================================================================
// INCREMENT UNREAD COUNT
// =============================================================================

export async function incrementUnreadCount(conversationId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('increment_conversation_unread', {
      conversation_id: conversationId
    })

    // If the RPC function doesn't exist, fall back to manual increment
    if (error && error.code === '42883') {
      const { data: currentData, error: fetchError } = await supabase
        .from('conversations')
        .select('unread_count')
        .eq('id', conversationId)
        .single()

      if (fetchError) {
        throw fetchError
      }

      const newCount = (currentData?.unread_count || 0) + 1
      
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ 
          unread_count: newCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)

      if (updateError) {
        throw updateError
      }
    } else if (error) {
      throw error
    }

    console.log('✅ Unread count incremented for conversation:', conversationId)

  } catch (error) {
    console.error('❌ Error in incrementUnreadCount:', error)
    throw error
  }
} 