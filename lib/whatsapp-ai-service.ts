import { createClient } from '@supabase/supabase-js';
import { getOrCreateAssistantForConversation } from './assistant-service';

export interface AIAgentConfig {
  baseUrl: string;
  apiKey: string;
  assistantId: string;
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
      baseUrl: process.env.BARGAINB_API_URL || 'https://ht-ample-carnation-93-62e3a16b2190526eac38c74198169a7f.us.langgraph.app',
      apiKey: process.env.BARGAINB_API_KEY || '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',
      assistantId: process.env.BARGAINB_ASSISTANT_ID || '5fd12ecb-9268-51f0-8168-fc7952c7c8b8'
    };

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for server-side operations');
    }

    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for server-side operations
    );
  }

  async processAIMessage(chatId: string, message: string, userId: string): Promise<{
    success: boolean;
    aiResponse?: string;
    error?: string;
  }> {
    try {
      // 1. Check if AI is enabled for this chat
      const { data: chatData } = await this.supabase
        .from('conversations')
        .select('ai_enabled, ai_thread_id, ai_config, assistant_id')
        .eq('id', chatId)
        .single();

      if (!chatData?.ai_enabled) {
        return { success: false, error: 'AI not enabled for this chat' };
      }

      // 2. Get or create per-user assistant
      let assistantId = chatData.assistant_id;
      if (!assistantId) {
        console.log('🤖 No assistant found for conversation, creating one...');
        assistantId = await getOrCreateAssistantForConversation(chatId);
      }

      // 3. Get or create AI thread
      let threadId = chatData.ai_thread_id;
      if (!threadId) {
        threadId = await this.createAIThread(userId, assistantId);
        
        // Update chat with thread ID
        await this.supabase
          .from('conversations')
          .update({ ai_thread_id: threadId })
          .eq('id', chatId);
      }

      // 4. Clean the message (remove @bb)
      const cleanMessage = message.replace(/@bb\s*/i, '').trim();

      // 5. Get user profile for context
      const userProfile = await this.getUserProfile(userId);

      // 6. Send to AI agent with per-user assistant
      const startTime = Date.now();
      const aiResponse = await this.callAIAgent(threadId, cleanMessage, userId, userProfile, chatData.ai_config, assistantId);
      const processingTime = Date.now() - startTime;

      // 6. Save AI response as a message in the conversation
      await this.saveAIResponseMessage(chatId, aiResponse, threadId);

      // 7. Log the interaction
      await this.logAIInteraction(chatId, userId, cleanMessage, aiResponse, threadId, processingTime);

      return { success: true, aiResponse };

    } catch (error) {
      console.error('AI processing error:', error);
      return { 
        success: false, 
        error: 'Sorry, I encountered an error processing your request. Please try again.' 
      };
    }
  }

  private async createAIThread(userId: string, assistantId?: string): Promise<string> {
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
          assistant_id: assistantId || this.aiConfig.assistantId
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
      .eq('id', userId)
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
        assistant_id: assistantId || this.aiConfig.assistantId,
        input: {
          messages: [{ role: 'user', content: message }]
        },
        config: {
          configurable: { 
            user_id: userId,
            source: 'whatsapp',
            user_profile: userProfile,
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
    return data.messages[data.messages.length - 1]?.content || 'No response available';
  }

  private async saveAIResponseMessage(chatId: string, aiResponse: string, threadId?: string) {
    // Generate a unique WhatsApp message ID for the AI response
    const whatsappMessageId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Save AI response as a message in the conversation
    const { error } = await this.supabase
      .from('messages')
      .insert({
        conversation_id: chatId,
        whatsapp_message_id: whatsappMessageId,
        content: aiResponse,
        message_type: 'text',
        direction: 'outbound', // AI responses are outbound messages
        from_me: true, // AI responses are sent by the system (from our perspective)
        sender_type: 'ai_agent', // Mark as AI agent message
        is_ai_triggered: true, // Mark as AI-triggered
        ai_thread_id: threadId, // Include AI thread ID for tracking
        // created_at is automatically set by the database
      });

    if (error) {
      console.error('Error saving AI response message:', error);
      throw new Error(`Failed to save AI response: ${error.message}`);
    }

    // Send the AI response back to the user via WhatsApp
    // Use setTimeout to ensure this doesn't block the main response
    setTimeout(() => {
      this.sendAIResponseToWhatsApp(chatId, aiResponse).catch(error => {
        console.error('Failed to send AI response to WhatsApp:', error);
      });
    }, 100);
  }

  private async sendAIResponseToWhatsApp(chatId: string, aiResponse: string) {
    try {
      // Get conversation details to find the contact phone number
      const { data: conversation } = await this.supabase
        .from('conversations')
        .select(`
          id,
          whatsapp_contact_id
        `)
        .eq('id', chatId)
        .single();

      if (!conversation) {
        console.error('❌ Conversation not found for AI response sending');
        return;
      }

      // Get the contact details
      let phoneNumber = null;
      if (conversation.whatsapp_contact_id) {
        const { data: contact } = await this.supabase
          .from('whatsapp_contacts')
          .select('phone_number, whatsapp_jid')
          .eq('id', conversation.whatsapp_contact_id)
          .single();
        
        phoneNumber = contact?.phone_number;
        
        // Fallback to whatsapp_jid if phone_number is not available
        if (!phoneNumber && contact?.whatsapp_jid) {
          phoneNumber = contact.whatsapp_jid.replace('@s.whatsapp.net', '');
        }
      }

      if (!phoneNumber) {
        console.error('❌ No phone number found for conversation:', chatId);
        return;
      }

      // Clean phone number for WhatsApp API
      let cleanPhoneNumber = phoneNumber;
      if (phoneNumber.includes('@s.whatsapp.net')) {
        cleanPhoneNumber = phoneNumber.replace('@s.whatsapp.net', '');
      }
      if (!cleanPhoneNumber.startsWith('+')) {
        cleanPhoneNumber = `+${cleanPhoneNumber}`;
      }

      console.log('📤 Sending AI response to WhatsApp:', cleanPhoneNumber);

      // Check if WASender API key is available
      const apiKey = process.env.WASENDER_API_KEY;
      if (!apiKey) {
        console.error('❌ WASENDER_API_KEY not configured - cannot send AI response');
        return;
      }

      // Send via WASender API
      const apiResponse = await fetch('https://www.wasenderapi.com/api/send-message', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          to: cleanPhoneNumber, // WASender expects E.164 format with + 
          text: aiResponse 
        }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        console.error('❌ Failed to send AI response via WhatsApp:', errorData);
        return;
      }

      const apiData = await apiResponse.json();
      console.log('✅ AI response sent successfully via WhatsApp:', apiData);

      // Update the message with the actual WhatsApp message ID from the API
      if (apiData.data?.msgId) {
        await this.supabase
          .from('messages')
          .update({ 
            whatsapp_message_id: apiData.data.msgId.toString(),
            whatsapp_status: 'sent'
          })
          .eq('conversation_id', chatId)
          .eq('sender_type', 'ai_agent')
          .order('created_at', { ascending: false })
          .limit(1);
      }

    } catch (error) {
      console.error('❌ Error sending AI response to WhatsApp:', error);
      // Don't throw error - message was saved successfully, sending is optional
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
    // Log in ai_interactions table (using conversation_id to match our database)
    await this.supabase
      .from('ai_interactions')
      .insert({
        conversation_id: chatId, // This should match our table schema
        user_id: userId,
        user_message: userMessage,
        ai_response: aiResponse,
        thread_id: threadId,
        processing_time_ms: processingTime,
        tokens_used: aiResponse.length // Approximate token count
      });
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
          ai_config: config 
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

    return data || [];
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
      ? interactions!.reduce((sum, i) => sum + i.processing_time_ms, 0) / totalInteractions 
      : 0;

    return {
      totalInteractions,
      avgProcessingTime,
      totalChatsWithAI: chatsWithAI?.length || 0,
      recentInteractions: interactions?.slice(0, 10) || []
    };
  }

  async testAIConnection(): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      const response = await fetch(`${this.aiConfig.baseUrl}/assistants/${this.aiConfig.assistantId}`, {
        headers: {
          'X-Api-Key': this.aiConfig.apiKey
        }
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

  async getAssistantInfo(): Promise<{ success: boolean; assistant?: any; error?: string }> {
    try {
      const response = await fetch(`${this.aiConfig.baseUrl}/assistants/${this.aiConfig.assistantId}`, {
        headers: {
          'X-Api-Key': this.aiConfig.apiKey
        }
      });

      if (!response.ok) {
        return { 
          success: false, 
          error: `Failed to fetch assistant: ${response.statusText}` 
        };
      }

      const assistant = await response.json();
      return { success: true, assistant };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
} 