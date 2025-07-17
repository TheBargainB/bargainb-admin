import { supabaseAdmin } from './supabase';
import { getOrCreateAssistantForConversation } from './assistant-service';
import { createClient } from '@/utils/supabase/client'
import { formatPhoneNumber as formatPhoneNumberUtil, isValidPhoneNumber as isValidPhoneNumberUtil, extractPhoneNumber as extractPhoneNumberUtil, normalizePhoneNumber } from './api-utils'
import { AGENT_BB_CONFIG } from '@/lib/constants'

// =============================================================================
// WASENDER API CONFIGURATION
// =============================================================================

const WASENDER_API_BASE_URL = process.env.WASENDER_API_URL || 'https://www.wasenderapi.com'
const WASENDER_API_KEY = process.env.WASENDER_API_KEY || ''
const WASENDER_SESSION_ID = process.env.WASENDER_SESSION_ID || ''

interface WASenderResponse {
  success: boolean
  data?: any
  error?: string
}

interface SendMessageOptions {
  to: string
  text?: string
  imageUrl?: string
  videoUrl?: string
  audioUrl?: string
  documentUrl?: string
  replyToMessageId?: string
}

interface WebhookPayload {
  event: string
  data: {
    messages?: Array<{
      key: {
        remoteJid: string
        fromMe: boolean
        id: string
      }
      message: {
        conversation?: string
        extendedTextMessage?: {
          text: string
        }
        imageMessage?: {
          url: string
          mediaKey: string
          mimetype: string
          caption?: string
        }
        videoMessage?: {
          url: string
          mediaKey: string
          mimetype: string
          caption?: string
        }
        audioMessage?: {
          url: string
          mediaKey: string
          mimetype: string
        }
        documentMessage?: {
          url: string
          mediaKey: string
          mimetype: string
          fileName?: string
        }
      }
      pushName?: string
      messageTimestamp: number
    }>
  }
}

// =============================================================================
// WASENDER API CLIENT
// =============================================================================

class WASenderClient {
  private apiKey: string
  private sessionId: string
  private baseUrl: string

  constructor() {
    this.apiKey = WASENDER_API_KEY
    this.sessionId = WASENDER_SESSION_ID
    this.baseUrl = WASENDER_API_BASE_URL
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<WASenderResponse> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      console.log('🔄 WASender API Request:', { url, method: options.method || 'GET' })

      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ WASender API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        })
        
        throw new Error(`WASender API Error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      console.log('✅ WASender API Success:', data)
      
      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('❌ WASender API Request Failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // =============================================================================
  // SEND MESSAGE METHODS
  // =============================================================================

  async sendTextMessage(to: string, text: string, replyToMessageId?: string): Promise<WASenderResponse> {
    const payload: any = {
      to,
      text
    }

    if (replyToMessageId) {
      payload.replyToMessageId = replyToMessageId
    }

    return this.makeRequest('/api/send-message', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }

  async sendImageMessage(to: string, imageUrl: string, caption?: string): Promise<WASenderResponse> {
    const payload: any = {
      to,
      imageUrl
    }

    if (caption) {
      payload.caption = caption
    }

    return this.makeRequest('/api/send-message', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }

  async sendVideoMessage(to: string, videoUrl: string, caption?: string): Promise<WASenderResponse> {
    const payload: any = {
      to,
      videoUrl
    }

    if (caption) {
      payload.caption = caption
    }

    return this.makeRequest('/api/send-message', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }

  async sendAudioMessage(to: string, audioUrl: string): Promise<WASenderResponse> {
    return this.makeRequest('/api/send-message', {
      method: 'POST',
      body: JSON.stringify({
        to,
        audioUrl
      })
    })
  }

  async sendDocumentMessage(to: string, documentUrl: string, fileName?: string): Promise<WASenderResponse> {
    const payload: any = {
      to,
      documentUrl
    }

    if (fileName) {
      payload.fileName = fileName
    }

    return this.makeRequest('/api/send-message', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }

  // =============================================================================
  // CONTACT SYNC METHODS
  // =============================================================================

  async syncContacts(): Promise<WASenderResponse> {
    return this.makeRequest('/api/contacts', {
      method: 'GET'
    })
  }

  async getConversations(): Promise<WASenderResponse> {
    return this.makeRequest('/api/conversations', {
      method: 'GET'
    })
  }

  async getConversationMessages(conversationId: string, limit: number = 50): Promise<WASenderResponse> {
    return this.makeRequest(`/api/conversations/${conversationId}/messages?limit=${limit}`, {
      method: 'GET'
    })
  }

  // =============================================================================
  // SESSION MANAGEMENT
  // =============================================================================

  async getSessionStatus(): Promise<WASenderResponse> {
    return this.makeRequest('/api/session/status', {
      method: 'GET'
    })
  }

  async restartSession(): Promise<WASenderResponse> {
    return this.makeRequest('/api/session/restart', {
      method: 'POST'
    })
  }
}

// =============================================================================
// WEBHOOK PROCESSING
// =============================================================================

export async function processWASenderWebhook(payload: WebhookPayload): Promise<{ success: boolean; message?: string }> {
  try {
    console.log('📨 Processing WASender webhook:', payload.event)

    if (payload.event === 'messages.upsert' && payload.data.messages) {
      const messages = payload.data.messages
      
      for (const message of messages) {
        await processIncomingMessage(message)
      }
    }

    return { success: true, message: 'Webhook processed successfully' }
  } catch (error) {
    console.error('❌ Webhook processing error:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

async function processIncomingMessage(message: any) {
  try {
    const { key, message: messageContent, pushName, messageTimestamp } = message
    
    // Skip outgoing messages (sent by us)
    if (key.fromMe) {
      console.log('⏩ Skipping outgoing message:', key.id)
      return
    }

    console.log('📥 Processing incoming message:', key.id)

    // Extract phone number from remoteJid
    const phoneNumber = key.remoteJid.replace('@s.whatsapp.net', '').replace('@c.us', '')
    
    // Get message content
    let content = ''
    let messageType = 'text'
    let mediaUrl = ''
    let mediaType = ''
    
    if (messageContent.conversation) {
      content = messageContent.conversation
    } else if (messageContent.extendedTextMessage?.text) {
      content = messageContent.extendedTextMessage.text
    } else if (messageContent.imageMessage) {
      content = messageContent.imageMessage.caption || '[Image]'
      messageType = 'image'
      mediaUrl = messageContent.imageMessage.url || ''
      mediaType = messageContent.imageMessage.mimetype || 'image/jpeg'
    } else if (messageContent.videoMessage) {
      content = messageContent.videoMessage.caption || '[Video]'
      messageType = 'video'
      mediaUrl = messageContent.videoMessage.url || ''
      mediaType = messageContent.videoMessage.mimetype || 'video/mp4'
    } else if (messageContent.audioMessage) {
      content = '[Audio]'
      messageType = 'audio'
      mediaUrl = messageContent.audioMessage.url || ''
      mediaType = messageContent.audioMessage.mimetype || 'audio/mp4'
    } else if (messageContent.documentMessage) {
      content = messageContent.documentMessage.fileName || '[Document]'
      messageType = 'document'
      mediaUrl = messageContent.documentMessage.url || ''
      mediaType = messageContent.documentMessage.mimetype || 'application/octet-stream'
    }

    // Skip if no content
    if (!content) {
      console.log('⏩ Skipping message with no content:', key.id)
      return
    }

    const supabase = createClient()

    // Find or create contact
    const { data: contact, error: contactError } = await supabase
      .from('whatsapp_contacts')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single()

    let contactId = contact?.id

    if (!contact) {
      console.log('👤 Creating new contact:', phoneNumber)
      const { data: newContact, error: createError } = await supabase
        .from('whatsapp_contacts')
        .insert({
          phone_number: phoneNumber,
          display_name: pushName || phoneNumber,
          push_name: pushName,
          is_active: true,
          last_seen_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        })
        .select('*')
        .single()

      if (createError) {
        console.error('❌ Error creating contact:', createError)
        return
      }

      contactId = newContact.id
    } else {
      // Update contact last seen
      await supabase
        .from('whatsapp_contacts')
        .update({
          last_seen_at: new Date().toISOString(),
          push_name: pushName || contact.push_name
        })
        .eq('id', contactId)
    }

    // Find or create conversation
    let { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('*')
      .eq('whatsapp_contact_id', contactId)
      .single()

    if (!conversation) {
      console.log('💬 Creating new conversation for contact:', contactId)
      const { data: newConversation, error: createConvError } = await supabase
        .from('conversations')
        .insert({
          whatsapp_contact_id: contactId,
          title: pushName || `Chat with ${phoneNumber}`,
          description: 'WhatsApp conversation',
          unread_count: 1,
          last_message_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        })
        .select('*')
        .single()

      if (createConvError) {
        console.error('❌ Error creating conversation:', createConvError)
        return
      }

      conversation = newConversation
    } else {
      // Update conversation with new message
      await supabase
        .from('conversations')
        .update({
          unread_count: (conversation.unread_count || 0) + 1,
          last_message_at: new Date().toISOString()
        })
        .eq('id', conversation.id)
    }

    // Insert message
    const messageData: any = {
      conversation_id: conversation.id,
      whatsapp_message_id: key.id,
      content,
      message_type: messageType,
      direction: 'inbound',
      status: 'delivered',
      sender_name: pushName || phoneNumber,
      created_at: new Date(messageTimestamp * 1000).toISOString()
    }

    if (mediaUrl) {
      messageData.media_url = mediaUrl
      messageData.media_type = mediaType
    }

    const { error: messageError } = await supabase
      .from('messages')
      .insert(messageData)

    if (messageError) {
      console.error('❌ Error inserting message:', messageError)
      return
    }

    console.log('✅ Message processed successfully:', key.id)

  } catch (error) {
    console.error('❌ Error processing incoming message:', error)
    throw error
  }
}

// =============================================================================
// EXPORT SINGLETON CLIENT
// =============================================================================

export const wasenderClient = new WASenderClient()

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Phone utility functions moved to api-utils.ts for consolidation
export const formatPhoneNumber = formatPhoneNumberUtil
export const extractPhoneNumber = extractPhoneNumberUtil
export const isValidPhoneNumber = isValidPhoneNumberUtil

// =============================================================================
// MESSAGE SENDING HELPERS FOR CHAT 2.0
// =============================================================================

export async function sendMessage(
  phoneNumber: string,
  message: string,
  options: {
    conversationId?: string
    replyToMessageId?: string
    messageType?: 'text' | 'image' | 'video' | 'audio' | 'document'
    mediaUrl?: string
    caption?: string
  } = {}
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    console.log('📤 sendMessage called with:', {
      originalPhone: phoneNumber,
      messageLength: message.length,
      conversationId: options.conversationId
    })

    const formattedPhone = formatPhoneNumber(phoneNumber)
    console.log('📞 Phone number formatting:', {
      original: phoneNumber,
      formatted: formattedPhone,
      isValid: isValidPhoneNumber(formattedPhone)
    })
    
    if (!isValidPhoneNumber(formattedPhone)) {
      throw new Error(`Invalid phone number format. Original: ${phoneNumber}, Formatted: ${formattedPhone}`)
    }

    let response: WASenderResponse

    // Send appropriate message type
    switch (options.messageType || 'text') {
      case 'text':
        response = await wasenderClient.sendTextMessage(
          formattedPhone,
          message,
          options.replyToMessageId
        )
        break
      
      case 'image':
        if (!options.mediaUrl) {
          throw new Error('Media URL is required for image messages')
        }
        response = await wasenderClient.sendImageMessage(
          formattedPhone,
          options.mediaUrl,
          options.caption
        )
        break
      
      case 'video':
        if (!options.mediaUrl) {
          throw new Error('Media URL is required for video messages')
        }
        response = await wasenderClient.sendVideoMessage(
          formattedPhone,
          options.mediaUrl,
          options.caption
        )
        break
      
      case 'audio':
        if (!options.mediaUrl) {
          throw new Error('Media URL is required for audio messages')
        }
        response = await wasenderClient.sendAudioMessage(
          formattedPhone,
          options.mediaUrl
        )
        break
      
      case 'document':
        if (!options.mediaUrl) {
          throw new Error('Media URL is required for document messages')
        }
        response = await wasenderClient.sendDocumentMessage(
          formattedPhone,
          options.mediaUrl,
          options.caption
        )
        break
      
      default:
        throw new Error(`Unsupported message type: ${options.messageType}`)
    }

    if (!response.success) {
      throw new Error(response.error || 'Failed to send message')
    }

    // Save message to database if conversation ID is provided
    if (options.conversationId) {
      const supabase = createClient()
      
      const messageData = {
        conversation_id: options.conversationId,
        whatsapp_message_id: response.data?.msgId?.toString() || null, // Use null instead of empty string
        content: message,
        message_type: options.messageType || 'text',
        direction: 'outbound',
        status: 'sent',
        sender_name: 'Admin',
        media_url: options.mediaUrl || null,
        media_type: options.messageType === 'text' ? null : options.messageType,
        created_at: new Date().toISOString()
      }

      const { error: dbError } = await supabase
        .from('messages')
        .insert(messageData)

      if (dbError) {
        console.error('❌ Error saving message to database:', dbError)
        // Don't fail the entire operation for DB errors
      }
    }

    return {
      success: true,
      messageId: response.data?.msgId?.toString()
    }

  } catch (error) {
    console.error('❌ Error sending message:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// =============================================================================
// CONTACT SYNC HELPERS
// =============================================================================

export async function syncContactsFromWASender(): Promise<{ success: boolean; contactsUpdated: number; error?: string }> {
  try {
    console.log('🔄 Syncing contacts from WASender...')
    
    const response = await wasenderClient.syncContacts()
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to sync contacts')
    }

    const supabase = createClient()
    let contactsUpdated = 0

    // Process contacts from WASender
    const contacts = response.data?.contacts || []
    
    for (const contact of contacts) {
      try {
        const { data: existingContact } = await supabase
          .from('whatsapp_contacts')
          .select('*')
          .eq('phone_number', contact.phone_number)
          .single()

        if (existingContact) {
          // Update existing contact
          await supabase
            .from('whatsapp_contacts')
            .update({
              display_name: contact.display_name || existingContact.display_name,
              push_name: contact.push_name || existingContact.push_name,
              verified_name: contact.verified_name || existingContact.verified_name,
              is_active: contact.is_active ?? existingContact.is_active,
              last_seen_at: contact.last_seen_at || existingContact.last_seen_at,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingContact.id)
        } else {
          // Create new contact
          await supabase
            .from('whatsapp_contacts')
            .insert({
              phone_number: contact.phone_number,
              display_name: contact.display_name || contact.phone_number,
              push_name: contact.push_name,
              verified_name: contact.verified_name,
              is_active: contact.is_active ?? true,
              last_seen_at: contact.last_seen_at,
              created_at: new Date().toISOString()
            })
        }

        contactsUpdated++
      } catch (error) {
        console.error('❌ Error processing contact:', contact.phone_number, error)
        continue
      }
    }

    console.log(`✅ Synced ${contactsUpdated} contacts from WASender`)
    
    return {
      success: true,
      contactsUpdated
    }

  } catch (error) {
    console.error('❌ Error syncing contacts:', error)
    return {
      success: false,
      contactsUpdated: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export interface AIAgentConfig {
  baseUrl: string;
  apiKey: string;
}

export interface ChatAIConfig {
  enabled: boolean;
  response_style: 'concise' | 'detailed' | 'helpful';
  auto_respond?: boolean;
  keywords?: string[];
}

export interface AIInteraction {
  id: string;
  conversation_id: string;
  user_id: string;
  user_message: string;
  ai_response: string;
  thread_id: string;
  processing_time_ms: number;
  tokens_used: number;
  created_at: string;
}

export class WhatsAppAIService {
  private aiConfig: AIAgentConfig;
  private supabase;

  constructor() {
    // Check if we're on the server-side
    if (typeof window !== 'undefined') {
      throw new Error('WhatsAppAIService should only be used on the server-side. Use API routes from client components.');
    }

    this.aiConfig = {
      baseUrl: process.env.BARGAINB_API_URL || AGENT_BB_CONFIG.BASE_URL,
      apiKey: process.env[AGENT_BB_CONFIG.API_KEY_ENV] || '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'
    };

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for server-side operations');
    }

    // Use the centralized admin client instead of creating a new one
    this.supabase = supabaseAdmin;
  }

  async processAIMessage(chatId: string, message: string, userId: string): Promise<{
    success: boolean;
    aiResponse?: string;
    error?: string;
  }> {
    try {
      console.log('🚀 Starting AI message processing for chat:', chatId);
      
      // 1. Check if AI is enabled for this chat
      const { data: chatData } = await this.supabase
        .from('conversations')
        .select('ai_enabled, ai_thread_id, ai_config, assistant_id, assistant_config, assistant_metadata, assistant_name')
        .eq('id', chatId)
        .single();

      if (!chatData?.ai_enabled) {
        console.log('❌ AI not enabled for chat:', chatId);
        return { success: false, error: 'AI not enabled for this chat' };
      }

      console.log('✅ AI enabled for chat, assistant_id:', chatData.assistant_id);
      console.log('🔍 Assistant config available:', Object.keys(chatData.assistant_config || {}).length > 0);

      // 2. Get or create personalized assistant for this conversation
      let assistantId = chatData.assistant_id;
      
      if (!assistantId) {
        console.log('🤖 No assistant found for conversation, creating personalized assistant...');
        try {
          assistantId = await getOrCreateAssistantForConversation(chatId);
          if (!assistantId) {
            return { success: false, error: 'Failed to create or get assistant for this conversation' };
          }
          console.log('✅ Created/retrieved personalized assistant:', assistantId);
        } catch (error) {
          console.error('❌ Error creating personalized assistant:', error);
          return { success: false, error: 'Failed to create personalized assistant' };
        }
      } else {
        console.log('🚀 Using existing personalized assistant:', assistantId);
      }

      // 3. SPEED OPTIMIZATION: Get or create thread + user profile in parallel
      console.log('📝 Processing message:', message);
      
      const [threadId, userProfile] = await Promise.all([
        this.getOrCreateThreadFast(chatId, userId, assistantId ?? undefined, chatData.ai_thread_id ?? undefined),
        this.getUserProfileFast(userId) // Non-blocking, returns null if not found quickly
      ]);

      console.log('✅ Thread ID:', threadId);
      console.log('✅ User profile:', userProfile ? 'found' : 'not found');

      // 4. Send to AI agent - optimized call with stored assistant configuration
      console.log('🤖 Calling AI agent...');
      const startTime = Date.now();
      let aiResponse;
      
      try {
        aiResponse = await this.callAIAgentFast(threadId, message, userId, userProfile, chatData.ai_config, assistantId ?? undefined, chatData.assistant_config ?? undefined);
        console.log('✅ AI response generated:', aiResponse?.substring(0, 100) + '...');
      } catch (error) {
        console.error('❌ AI agent call failed:', error);
        return { success: false, error: `AI agent error: ${error instanceof Error ? error.message : 'Unknown error'}` };
      }
      
      const processingTime = Date.now() - startTime;
      console.log('⏱️ AI processing time:', processingTime, 'ms');

      // 5. Save response and send via WhatsApp (with detailed error handling)
      try {
        console.log('💾 Starting to save AI response...');
        await this.saveAIResponseMessage(chatId, aiResponse, threadId);
        console.log('✅ AI response saved and sent successfully');
      } catch (error) {
        console.error('❌ Error saving AI response:', error);
        
        // Even if saving fails, we can still return the AI response
        // Log the interaction in background without failing the whole process
        this.logAIInteraction(chatId, userId, message, aiResponse, threadId, processingTime)
          .catch(logError => console.warn('⚠️ Background log also failed:', logError));
          
        return { 
          success: false, 
          error: `Response generated but save failed: ${error instanceof Error ? error.message : 'Unknown save error'}`,
          aiResponse: aiResponse // Still return the AI response for debugging
        };
      }
      
      // 6. Log interaction (can be background)
      this.logAIInteraction(chatId, userId, message, aiResponse, threadId, processingTime)
        .catch(error => console.warn('⚠️ Background log failed:', error));

      return { success: true, aiResponse };

    } catch (error) {
      console.error('❌ Critical AI processing error:', error);
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      return { 
        success: false, 
        error: `Critical error: ${error instanceof Error ? error.message : 'Unknown critical error'}` 
      };
    }
  }

  // SPEED OPTIMIZED: Fast thread management
  private async getOrCreateThreadFast(chatId: string, userId: string, assistantId: string | undefined, existingThreadId?: string): Promise<string> {
    if (existingThreadId) {
      console.log('🚀 Reusing existing thread:', existingThreadId);
      return existingThreadId;
    }

    console.log('🚀 Creating new thread...');
    const threadId = await this.createAIThread(userId, assistantId);
    
    // Update thread ID in background (non-blocking)
    this.supabase
      .from('conversations')
      .update({ ai_thread_id: threadId })
      .eq('id', chatId)
      .then(({ error }) => {
        if (error) console.warn('⚠️ Thread ID save failed:', error);
      });

    return threadId;
  }

  // SPEED OPTIMIZED: Fast user profile lookup
  private async getUserProfileFast(userId: string): Promise<any> {
    try {
      const { data } = await this.supabase
        .from('crm_profiles')
        .select('id, full_name, preferred_name, shopping_persona, preferred_stores, dietary_restrictions')
        .eq('whatsapp_contact_id', userId)  // Fix: userId is actually whatsapp_contact_id
        .single();
      return data;
    } catch {
      console.log('🚀 Skipping user profile (speed mode)');
      return null; // Return null for speed - AI can work without profile
    }
  }

  // SPEED OPTIMIZED: Faster AI agent call with reduced timeout
  private async callAIAgentFast(threadId: string, message: string, userId: string, userProfile: any, aiConfig?: any, assistantId?: string | null, assistantConfig?: any): Promise<string> {
    const response = await fetch(`${this.aiConfig.baseUrl}/threads/${threadId}/runs/wait`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': this.aiConfig.apiKey
      },
      body: JSON.stringify({
        assistant_id: assistantId,
        input: {
          messages: [{ role: 'user', content: message }]
        },
        config: {
          configurable: { 
            user_id: userId,
            source: 'whatsapp',
            user_profile: userProfile,
            // FIXED: Use actual CRM profile ID from user profile instead of hardcoded value
            CRM_PROFILE_ID: userProfile?.id || null, // Use the actual CRM profile ID
            // SPEED OPTIMIZED: Reduced timeouts and limits
            ENABLE_GUARD_RAILS: aiConfig?.guard_rails_enabled ?? true,
            MAX_MESSAGE_LENGTH: aiConfig?.max_message_length ?? 300, // Reduced from 500
            ENABLE_SPAM_DETECTION: aiConfig?.spam_detection ?? false, // Disabled for speed
            MAX_TOKENS_PER_REQUEST: aiConfig?.max_tokens_per_request ?? 2000, // Reduced from 4000
            REQUEST_TIMEOUT_SECONDS: aiConfig?.request_timeout ?? 15, // Reduced from 30
            ENABLE_CONTENT_FILTERING: aiConfig?.content_filtering ?? false, // Disabled for speed
            MAX_TOKENS_PER_USER_HOUR: aiConfig?.max_tokens_per_hour ?? 20000,
            ENABLE_FALLBACK_RESPONSES: aiConfig?.fallback_responses ?? true,
            MAX_TOOL_CALLS_PER_REQUEST: aiConfig?.max_tool_calls ?? 3, // Reduced from 5
            CUSTOM_INSTRUCTIONS: aiConfig?.custom_instructions ?? '',
            TEMPERATURE: aiConfig?.temperature ?? 0.5, // Reduced for faster responses
            RESPONSE_STYLE: aiConfig?.response_style ?? 'concise', // Changed from 'helpful' to 'concise'
            assistant_config: assistantConfig
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`AI agent request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Enhanced error handling for AI agent responses
    if (data.__error__) {
      console.error('❌ AI Agent returned error:', data.__error__);
      throw new Error(`AI Agent error: ${data.__error__.message || 'Unknown AI error'}`);
    }
    
    // Handle new LangGraph Platform API response format
    let aiResponse;
    
    // Try new API format first (direct content)
    if (typeof data === 'string') {
      aiResponse = data;
    }
    // Try nested messages format (old API)
    else if (data.messages && data.messages.length > 0) {
      const lastMessage = data.messages[data.messages.length - 1];
      aiResponse = lastMessage.content || lastMessage;
    }
    // Try direct content field
    else if (data.content) {
      aiResponse = data.content;
    }
    // Try response field
    else if (data.response) {
      aiResponse = data.response;
    }
    
    if (!aiResponse || typeof aiResponse !== 'string' || aiResponse.trim().length === 0) {
      console.warn('⚠️ AI agent returned empty or invalid response:', data);
      return 'I apologize, but I was unable to generate a proper response. Please try again.';
    }
    
    console.log('✅ AI response received:', aiResponse.substring(0, 100) + '...');
    return aiResponse;
  }

  private async createAIThread(userId: string, assistantId?: string | null): Promise<string> {
    const response = await fetch(`${this.aiConfig.baseUrl}/threads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': this.aiConfig.apiKey
      },
      body: JSON.stringify({
        metadata: { 
          user_id: userId, 
          source: 'whatsapp',
          assistant_id: assistantId 
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create AI thread: ${response.statusText}`);
    }

    const data = await response.json();
    return data.thread_id;
  }

  private async getUserProfile(userId: string): Promise<any> {
    const { data } = await this.supabase
      .from('crm_profiles')
      .select('*')
      .eq('whatsapp_contact_id', userId)
      .single();

    return data;
  }

  private async callAIAgent(threadId: string, message: string, userId: string, userProfile: any, aiConfig?: any, assistantId?: string): Promise<string> {
    const response = await fetch(`${this.aiConfig.baseUrl}/threads/${threadId}/runs/wait`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': this.aiConfig.apiKey
      },
      body: JSON.stringify({
        assistant_id: assistantId,
        input: {
          messages: [{ role: 'user', content: message }]
        },
        config: {
          configurable: { 
            user_id: userId,
            source: 'whatsapp',
            user_profile: userProfile,
            // FIXED: Use actual CRM profile ID from user profile instead of hardcoded value
            CRM_PROFILE_ID: userProfile?.id || null, // Use the actual CRM profile ID
            // Pass through the AI configuration
            ENABLE_GUARD_RAILS: aiConfig?.guard_rails_enabled ?? true,
            MAX_MESSAGE_LENGTH: aiConfig?.max_message_length ?? 500,
            ENABLE_SPAM_DETECTION: aiConfig?.spam_detection ?? true,
            MAX_TOKENS_PER_REQUEST: aiConfig?.max_tokens_per_request ?? 4000,
            REQUEST_TIMEOUT_SECONDS: aiConfig?.request_timeout ?? 30,
            ENABLE_CONTENT_FILTERING: aiConfig?.content_filtering ?? true,
            MAX_TOKENS_PER_USER_HOUR: aiConfig?.max_tokens_per_hour ?? 20000,
            ENABLE_FALLBACK_RESPONSES: aiConfig?.fallback_responses ?? true,
            MAX_TOOL_CALLS_PER_REQUEST: aiConfig?.max_tool_calls ?? 5,
            CUSTOM_INSTRUCTIONS: aiConfig?.custom_instructions ?? '',
            TEMPERATURE: aiConfig?.temperature ?? 0.7,
            RESPONSE_STYLE: aiConfig?.response_style ?? 'helpful'
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`AI agent request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Enhanced error handling for AI agent responses
    if (data.__error__) {
      console.error('❌ AI Agent returned error:', data.__error__);
      throw new Error(`AI Agent error: ${data.__error__.message || 'Unknown AI error'}`);
    }
    
    const aiResponse = data.messages?.[data.messages.length - 1]?.content;
    if (!aiResponse || typeof aiResponse !== 'string') {
      console.warn('⚠️ AI agent returned empty or invalid response:', data);
      return 'I apologize, but I was unable to generate a proper response. Please try again.';
    }
    return aiResponse;
  }

  private async saveAIResponseMessage(chatId: string, aiResponse: string, threadId?: string) {
    try {
      console.log('💾 Saving AI response for conversation:', chatId);
      
      // Get conversation details to find the phone number
      const { data: conversation, error: convError } = await this.supabase
        .from('conversations')
        .select(`
          whatsapp_contact_id,
          whatsapp_contacts!inner (
            phone_number,
            whatsapp_jid,
            display_name,
            push_name
          )
        `)
        .eq('id', chatId)
        .single();

      if (convError) {
        console.error('❌ Error fetching conversation:', convError);
        throw new Error(`Failed to fetch conversation: ${convError.message}`);
      }

      if (!conversation?.whatsapp_contacts) {
        console.error('❌ No contact found for conversation:', chatId);
        throw new Error('No WhatsApp contact found for conversation');
      }

      const contact = Array.isArray(conversation.whatsapp_contacts) 
        ? conversation.whatsapp_contacts[0] 
        : conversation.whatsapp_contacts;
      const displayName = contact.display_name || contact.push_name || contact.phone_number;

      console.log('💾 Storing AI response message in database...');
      
      // Store AI response in messages table
      const { data: newMessage, error: messageError } = await this.supabase
        .from('messages')
        .insert({
          conversation_id: chatId,
          content: aiResponse,
          message_type: 'text',
          direction: 'outbound',
          from_me: true,
          whatsapp_status: 'pending',
          whatsapp_message_id: null, // Use null instead of empty string to avoid constraint violation
          raw_message_data: {
            ai_generated: true,
            from_ai: true,
            thread_id: threadId,
            generated_at: new Date().toISOString(),
            ai_response_for: 'whatsapp_message'
          }
        })
        .select()
          .single();
        
      if (messageError) {
        console.error('❌ Error storing AI response message:', messageError);
        throw new Error(`Failed to store AI response: ${messageError.message}`);
      }

      console.log('✅ AI response stored in database with ID:', newMessage.id);

      // Update conversation stats - get current count first
      const { data: currentConv, error: convStatsError } = await this.supabase
        .from('conversations')
        .select('total_messages')
        .eq('id', chatId)
        .single();

      if (convStatsError) {
        console.warn('⚠️ Could not fetch conversation stats:', convStatsError);
      }

      const newTotal = (currentConv?.total_messages || 0) + 1;

      const { error: updateError } = await this.supabase
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          total_messages: newTotal
        })
        .eq('id', chatId);

      if (updateError) {
        console.warn('⚠️ Failed to update conversation stats:', updateError);
        }

      // Send AI response via WhatsApp with improved error handling
      console.log('📤 Sending AI response via WhatsApp...');
      try {
        await this.sendAIResponseToWhatsApp(chatId, aiResponse, contact.phone_number);
        console.log('✅ AI response saved and sent successfully');
      } catch (whatsappError) {
        console.error('❌ Failed to send AI response via WhatsApp:', whatsappError);
        
        // Update message status to failed
        await this.supabase
          .from('messages')
          .update({ 
            whatsapp_status: 'failed',
            raw_message_data: {
              ...(newMessage?.raw_message_data as Record<string, any> || {}),
              whatsapp_error: whatsappError instanceof Error ? whatsappError.message : String(whatsappError),
              failed_at: new Date().toISOString()
            }
          })
          .eq('id', newMessage.id);
        
        // Don't throw the error - we want the AI response to be saved even if WhatsApp sending fails
        console.warn('⚠️ AI response saved to database but failed to send via WhatsApp');
      }

    } catch (error) {
      console.error('❌ Critical error in saveAIResponseMessage:', error);
      throw error; // Re-throw so caller can handle it
    }
  }

  private async sendAIResponseToWhatsApp(chatId: string, aiResponse: string, phoneNumber: string) {
    try {
      // Clean and format phone number for WASender API using consolidated function
      const cleanPhoneNumber = normalizePhoneNumber(phoneNumber); // Already includes + prefix

      console.log('📤 Sending AI response to WhatsApp:', cleanPhoneNumber.replace(/(\+\d{1,3})\d{4,}(\d{4})/, '$1***$2'));

      const apiKey = process.env.WASENDER_API_KEY;
      if (!apiKey) {
        const error = 'WASENDER_API_KEY not configured - cannot send AI response';
        console.error('❌', error);
        throw new Error(error);
      }

      // Send via WASender API with retry logic
      let apiResponse: Response | undefined;
      let lastError: Error | undefined;
      const maxRetries = 3;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`📤 Attempt ${attempt}/${maxRetries} to send via WASender API...`);
          
          apiResponse = await fetch('https://www.wasenderapi.com/api/send-message', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              to: cleanPhoneNumber, 
              text: aiResponse 
            }),
          });
          
          if (apiResponse.ok) {
            console.log(`✅ WASender API call successful on attempt ${attempt}`);
            break; // Success, exit retry loop
          } else {
            const errorData = await apiResponse.json().catch(() => ({ message: apiResponse?.statusText || 'Unknown error' }));
            lastError = new Error(`WASender API failed (${apiResponse.status}): ${errorData.message || apiResponse.statusText}`);
            console.warn(`⚠️ Attempt ${attempt} failed:`, lastError.message);
            
            if (attempt < maxRetries) {
              // Wait before retry (exponential backoff)
              const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
              console.log(`⏳ Waiting ${delay}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        } catch (fetchError) {
          lastError = fetchError instanceof Error ? fetchError : new Error(String(fetchError));
          console.warn(`⚠️ Attempt ${attempt} failed with fetch error:`, lastError.message);
          
          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt - 1) * 1000;
            console.log(`⏳ Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      // Check if all retries failed
      if (!apiResponse || !apiResponse.ok) {
        if (lastError) {
          console.error('❌ All WhatsApp API attempts failed:', lastError.message);
          throw lastError;
        } else {
          console.error('❌ WhatsApp API failed with unknown error');
          throw new Error('WhatsApp API failed after all retry attempts');
        }
      }

      // At this point, apiResponse is guaranteed to be defined and successful
      if (!apiResponse) {
        throw new Error('No response received from WhatsApp API');
      }
      const apiData = await apiResponse.json();
      console.log('✅ AI response sent successfully via WhatsApp. Message ID:', apiData.data?.msgId);

      // Update the message with the actual WhatsApp message ID
      if (apiData.data?.msgId) {
        const { error: updateError } = await this.supabase
          .from('messages')
          .update({ 
            whatsapp_message_id: apiData.data.msgId.toString(),
            whatsapp_status: 'sent'
          })
          .eq('conversation_id', chatId)
          .eq('direction', 'outbound')
          .order('created_at', { ascending: false })
          .limit(1);

        if (updateError) {
          console.warn('⚠️ Failed to update message with WhatsApp ID:', updateError);
        } else {
          console.log('✅ Message updated with WhatsApp ID:', apiData.data.msgId);
        }
      }

      return apiData;

    } catch (error) {
      console.error('❌ Critical error sending AI response to WhatsApp:', error);
      throw error; // Re-throw so caller can handle it
    }
  }

  private async logAIInteraction(
    chatId: string, 
    userId: string, 
    userMessage: string, 
    aiResponse: string, 
    threadId: string, 
    processingTime: number
  ) {
    try {
    await this.supabase
      .from('ai_interactions')
      .insert({
          conversation_id: chatId,
        user_id: userId,
        user_message: userMessage,
          ai_response: aiResponse || '',
        thread_id: threadId,
        processing_time_ms: processingTime,
          tokens_used: (aiResponse?.length || 0) // Safe token count with null check
      });
    } catch (error) {
      console.warn('⚠️ Failed to log AI interaction:', error);
    }
  }

  async enableAIForChat(chatId: string, config: ChatAIConfig = { 
    enabled: true, 
    response_style: 'helpful' 
  }): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('conversations')
        .update({ 
          ai_enabled: config.enabled,
          ai_config: config as unknown as any
        })
        .eq('id', chatId);

      return !error;
    } catch (error) {
      console.error('Error enabling AI:', error);
      return false;
    }
  }

  async getAIUsageStats(chatId: string): Promise<AIInteraction[]> {
    const { data } = await this.supabase
      .from('ai_interactions')
      .select('*')
      .eq('conversation_id', chatId)
      .order('created_at', { ascending: false })
      .limit(10);

    return (data || []) as unknown as AIInteraction[];
  }

  async getAllAIStats(): Promise<{
    totalInteractions: number;
    avgProcessingTime: number;
    totalChatsWithAI: number;
    recentInteractions: AIInteraction[];
  }> {
    const { data: interactions } = await this.supabase
      .from('ai_interactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    const { data: chatsWithAI } = await this.supabase
      .from('conversations')
      .select('id')
      .eq('ai_enabled', true);

    const totalInteractions = interactions?.length || 0;
    const avgProcessingTime = totalInteractions > 0 
      ? interactions!.reduce((sum, i) => sum + (i.processing_time_ms || 0), 0) / totalInteractions 
      : 0;

    return {
      totalInteractions,
      avgProcessingTime,
      totalChatsWithAI: chatsWithAI?.length || 0,
      recentInteractions: (interactions?.slice(0, 10) || []) as unknown as AIInteraction[]
    };
  }

  async testAIConnection(): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      // Test basic connection to AI service
      const response = await fetch(`${this.aiConfig.baseUrl}/assistants/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.aiConfig.apiKey
        },
        body: JSON.stringify({
          metadata: {},
          graph_id: AGENT_BB_CONFIG.GRAPH_ID,
          limit: 1,
          offset: 0,
          sort_by: "created_at",
          sort_order: "desc"
        })
      });

      if (!response.ok) {
        return { 
          success: false, 
          error: `API returned ${response.status}: ${response.statusText}` 
        };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async testWhatsAppConnection(): Promise<{ 
    success: boolean; 
    apiKeyConfigured: boolean;
    apiReachable: boolean;
    error?: string; 
  }> {
    try {
      const apiKey = process.env.WASENDER_API_KEY;
      
      if (!apiKey) {
        return { 
          success: false, 
          apiKeyConfigured: false,
          apiReachable: false,
          error: 'WASENDER_API_KEY environment variable not configured' 
        };
      }

      if (apiKey.length < 10) {
        return { 
          success: false, 
          apiKeyConfigured: false,
          apiReachable: false,
          error: 'WASENDER_API_KEY appears to be invalid (too short)' 
        };
      }

      // Test API connectivity
      const response = await fetch('https://www.wasenderapi.com/api/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return { 
          success: true, 
          apiKeyConfigured: true,
          apiReachable: true 
        };
      } else {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        return { 
          success: false, 
          apiKeyConfigured: true,
          apiReachable: true,
          error: `API request failed: ${JSON.stringify(errorData)}` 
        };
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return { 
        success: false, 
        apiKeyConfigured: !!process.env.WASENDER_API_KEY,
        apiReachable: false,
        error: `Connection test failed: ${errorMessage}` 
      };
    }
  }

  async retryFailedMessages(conversationId?: string): Promise<{
    attempted: number;
    succeeded: number;
    failed: number;
  }> {
    try {
      console.log('🔄 Retrying failed WhatsApp messages...');
      
      // Get failed AI messages
      let query = this.supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          content,
          conversations!inner (
            whatsapp_contact_id,
            whatsapp_contacts!inner (
              phone_number
            )
          )
        `)
        .eq('whatsapp_status', 'failed')
        .eq('direction', 'outbound')
        .contains('raw_message_data', { ai_generated: true });
      
      if (conversationId) {
        query = query.eq('conversation_id', conversationId);
      }
      
      const { data: failedMessages, error } = await query.limit(10);
      
      if (error) {
        console.error('❌ Error fetching failed messages:', error);
        return { attempted: 0, succeeded: 0, failed: 0 };
      }
      
      if (!failedMessages || failedMessages.length === 0) {
        console.log('✅ No failed messages to retry');
        return { attempted: 0, succeeded: 0, failed: 0 };
      }
      
      console.log(`🔄 Found ${failedMessages.length} failed messages to retry`);
      
      let succeeded = 0;
      let failed = 0;
      
      for (const message of failedMessages) {
        // Type guard to ensure we have proper message structure
        const messageData = message as any; // Cast to bypass TypeScript inference issues
        
        try {
          if (!messageData.conversations || !messageData.conversations.whatsapp_contacts) {
            console.warn(`⚠️ Skipping message ${messageData.id} - missing contact information`);
            failed++;
            continue;
          }

          const contact = Array.isArray(messageData.conversations.whatsapp_contacts) 
            ? messageData.conversations.whatsapp_contacts[0]
            : messageData.conversations.whatsapp_contacts;
          
          if (!contact || !contact.phone_number) {
            console.warn(`⚠️ Skipping message ${messageData.id} - missing phone number`);
            failed++;
            continue;
          }
          
          await this.sendAIResponseToWhatsApp(
            messageData.conversation_id,
            messageData.content,
            contact.phone_number
          );
          
          // Update status to sent
          await this.supabase
            .from('messages')
            .update({ whatsapp_status: 'sent' })
            .eq('id', messageData.id);
          
          succeeded++;
          console.log(`✅ Successfully retried message ${messageData.id}`);
          
        } catch (error) {
          console.error(`❌ Failed to retry message ${messageData.id}:`, error);
          failed++;
        }
      }
      
      console.log(`✅ Retry completed: ${succeeded} succeeded, ${failed} failed`);
      return { attempted: failedMessages.length, succeeded, failed };
      
    } catch (error) {
      console.error('❌ Error retrying failed messages:', error);
      return { attempted: 0, succeeded: 0, failed: 0 };
    }
  }
}