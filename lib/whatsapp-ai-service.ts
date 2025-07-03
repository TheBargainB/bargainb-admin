import { createClient } from '@supabase/supabase-js';
import { getOrCreateAssistantForConversation } from './assistant-service';

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
      baseUrl: process.env.BARGAINB_API_URL || 'https://ht-ample-carnation-93-62e3a16b2190526eac38c74198169a7f.us.langgraph.app',
      apiKey: process.env.BARGAINB_API_KEY || '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'
    };

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for server-side operations');
    }

    // Enhanced Supabase client configuration for serverless environments
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role for server-side operations
      {
        auth: {
          persistSession: false, // Don't persist sessions in serverless functions
          autoRefreshToken: false, // Don't auto-refresh tokens in serverless
        },
        global: {
          headers: {
            'User-Agent': 'BargainB-Admin/1.0',
          },
        },
        // Add fetch options for better serverless compatibility
        db: {
          schema: 'public',
        },
        // Configure realtime (disable for serverless performance)
        realtime: {
          params: {
            eventsPerSecond: 1,
          },
        },
      }
    );
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
        .select('ai_enabled, ai_thread_id, ai_config, assistant_id')
        .eq('id', chatId)
        .single();

      if (!chatData?.ai_enabled) {
        console.log('❌ AI not enabled for chat:', chatId);
        return { success: false, error: 'AI not enabled for this chat' };
      }

      console.log('✅ AI enabled for chat, assistant_id:', chatData.assistant_id);

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
      const cleanMessage = message.replace(/@bb\s*/i, '').trim();
      console.log('📝 Cleaned message:', cleanMessage);
      
      const [threadId, userProfile] = await Promise.all([
        this.getOrCreateThreadFast(chatId, userId, assistantId, chatData.ai_thread_id),
        this.getUserProfileFast(userId) // Non-blocking, returns null if not found quickly
      ]);

      console.log('✅ Thread ID:', threadId);
      console.log('✅ User profile:', userProfile ? 'found' : 'not found');

      // 4. Send to AI agent - optimized call
      console.log('🤖 Calling AI agent...');
      const startTime = Date.now();
      let aiResponse;
      
      try {
        aiResponse = await this.callAIAgentFast(threadId, cleanMessage, userId, userProfile, chatData.ai_config, assistantId);
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
        this.logAIInteraction(chatId, userId, cleanMessage, aiResponse, threadId, processingTime)
          .catch(logError => console.warn('⚠️ Background log also failed:', logError));
          
        return { 
          success: false, 
          error: `Response generated but save failed: ${error instanceof Error ? error.message : 'Unknown save error'}`,
          aiResponse: aiResponse // Still return the AI response for debugging
        };
      }
      
      // 6. Log interaction (can be background)
      this.logAIInteraction(chatId, userId, cleanMessage, aiResponse, threadId, processingTime)
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
  private async getOrCreateThreadFast(chatId: string, userId: string, assistantId: string, existingThreadId?: string): Promise<string> {
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
        .select('full_name, preferred_name, shopping_persona, preferred_stores, dietary_restrictions')
        .eq('whatsapp_contact_id', userId)  // Fix: userId is actually whatsapp_contact_id
        .single();
      return data;
    } catch {
      console.log('🚀 Skipping user profile (speed mode)');
      return null; // Return null for speed - AI can work without profile
    }
  }

  // SPEED OPTIMIZED: Faster AI agent call with reduced timeout
  private async callAIAgentFast(threadId: string, message: string, userId: string, userProfile: any, aiConfig?: any, assistantId?: string): Promise<string> {
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
            RESPONSE_STYLE: aiConfig?.response_style ?? 'concise' // Changed from 'helpful' to 'concise'
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
          raw_message_data: {
            ai_generated: true,
            from_ai: true,
            thread_id: threadId,
            generated_at: new Date().toISOString(),
            ai_response_for: 'whatsapp_mention'
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

      // Send AI response via WhatsApp
      console.log('📤 Sending AI response via WhatsApp...');
      await this.sendAIResponseToWhatsApp(chatId, aiResponse, contact.phone_number);

      console.log('✅ AI response saved and sent successfully');

    } catch (error) {
      console.error('❌ Critical error in saveAIResponseMessage:', error);
      throw error; // Re-throw so caller can handle it
    }
  }

  private async sendAIResponseToWhatsApp(chatId: string, aiResponse: string, phoneNumber: string) {
    try {
      // Clean phone number for WASender API
      let cleanPhoneNumber = phoneNumber;
      if (!cleanPhoneNumber.startsWith('+')) {
        cleanPhoneNumber = `+${cleanPhoneNumber}`;
      }

      console.log('📤 Sending AI response to WhatsApp:', cleanPhoneNumber.replace(/(\+\d{1,3})\d{4,}(\d{4})/, '$1***$2'));

      const apiKey = process.env.WASENDER_API_KEY;
      if (!apiKey) {
        const error = 'WASENDER_API_KEY not configured - cannot send AI response';
        console.error('❌', error);
        throw new Error(error);
      }

      // Send via WASender API
      const apiResponse = await fetch('https://www.wasenderapi.com/api/send-message', {
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

      if (!apiResponse.ok) {
        let errorData;
        try {
          errorData = await apiResponse.json();
        } catch {
          errorData = { message: apiResponse.statusText };
        }
        console.error('❌ WhatsApp API error:', apiResponse.status, errorData);
        throw new Error(`WhatsApp API failed (${apiResponse.status}): ${errorData.message || apiResponse.statusText}`);
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
          ai_response: aiResponse,
          thread_id: threadId,
          processing_time_ms: processingTime,
          tokens_used: aiResponse.length // Approximate token count
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
      // Test basic connection to AI service
      const response = await fetch(`${this.aiConfig.baseUrl}/assistants/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.aiConfig.apiKey
        },
        body: JSON.stringify({
          metadata: {},
          graph_id: "product_retrieval_agent",
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
}