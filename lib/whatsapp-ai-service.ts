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

      // 2. SPEED OPTIMIZATION: Use existing assistant or default shared assistant
      let assistantId = chatData.assistant_id || this.aiConfig.assistantId;
      console.log('🚀 Using assistant (speed mode):', assistantId);

      // 3. SPEED OPTIMIZATION: Get or create thread + user profile in parallel
      const cleanMessage = message.replace(/@bb\s*/i, '').trim();
      
      const [threadId, userProfile] = await Promise.all([
        this.getOrCreateThreadFast(chatId, userId, assistantId, chatData.ai_thread_id),
        this.getUserProfileFast(userId) // Non-blocking, returns null if not found quickly
      ]);

      // 4. Send to AI agent - optimized call
      const startTime = Date.now();
      const aiResponse = await this.callAIAgentFast(threadId, cleanMessage, userId, userProfile, chatData.ai_config, assistantId);
      const processingTime = Date.now() - startTime;

      // 5. SPEED OPTIMIZATION: Save response and log in parallel (non-blocking)
      Promise.all([
        this.saveAIResponseMessage(chatId, aiResponse, threadId),
        this.logAIInteraction(chatId, userId, cleanMessage, aiResponse, threadId, processingTime)
      ]).catch(error => console.warn('⚠️ Background save failed:', error));

      return { success: true, aiResponse };

    } catch (error) {
      console.error('AI processing error:', error);
      return { 
        success: false, 
        error: 'Sorry, I encountered an error processing your request. Please try again.' 
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
      .eq('whatsapp_contact_id', userId)  // Fix: userId is actually whatsapp_contact_id
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

      // Validate phone number format
      if (!/^\+\d{10,15}$/.test(cleanPhoneNumber)) {
        console.error('❌ Invalid phone number format:', cleanPhoneNumber);
        return;
      }

      console.log('📤 Sending AI response to WhatsApp:', cleanPhoneNumber.replace(/(\+\d{1,3})\d{4,}(\d{4})/, '$1***$2'));

      // Check if WASender API key is available
      const apiKey = process.env.WASENDER_API_KEY;
      if (!apiKey) {
        console.error('❌ WASENDER_API_KEY not configured - cannot send AI response');
        return;
      }

      // Validate API key format
      if (apiKey.length < 10) {
        console.error('❌ Invalid WASENDER_API_KEY format - too short');
        return;
      }

      // Send via WASender API with retry logic
      const apiResponse = await this.fetchWithRetry('https://www.wasenderapi.com/api/send-message', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'BargainB-AI/1.0',
        },
        body: JSON.stringify({ 
          to: cleanPhoneNumber, // WASender expects E.164 format with + 
          text: aiResponse 
        }),
      }, 3, 1000); // 3 retries with 1 second initial delay

      if (!apiResponse.ok) {
        let errorData;
        try {
          errorData = await apiResponse.json();
        } catch {
          errorData = { message: `HTTP ${apiResponse.status}: ${apiResponse.statusText}` };
        }
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
      // Enhanced error logging with more context
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorContext = {
        chatId,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      };
      
      console.error('❌ Error sending AI response to WhatsApp:', errorContext);
      
      // Log specific error types for debugging
      if (errorMessage.includes('fetch failed')) {
        console.error('🔍 Network connectivity issue detected. Check internet connection and API endpoint.');
      } else if (errorMessage.includes('timeout')) {
        console.error('🔍 Request timeout detected. WASender API may be slow or unavailable.');
      } else if (errorMessage.includes('ENOTFOUND')) {
        console.error('🔍 DNS resolution failed. Check if WASender API domain is accessible.');
      }
      
      // Don't throw error - message was saved successfully, sending is optional
    }
  }

  // Helper method for fetch with retry logic and timeout
  private async fetchWithRetry(
    url: string, 
    options: RequestInit, 
    maxRetries: number = 3, 
    initialDelay: number = 1000
  ): Promise<Response> {
    let lastError: Error = new Error('All retry attempts failed');
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Add timeout to fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        // If successful or client error (4xx), don't retry
        if (response.ok || (response.status >= 400 && response.status < 500)) {
          return response;
        }
        
        // Server errors (5xx) should be retried
        if (response.status >= 500 && attempt < maxRetries) {
          console.warn(`🔄 Server error ${response.status}, retrying in ${initialDelay * Math.pow(2, attempt)}ms...`);
          await this.delay(initialDelay * Math.pow(2, attempt)); // Exponential backoff
          continue;
        }
        
        return response;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < maxRetries) {
          const delay = initialDelay * Math.pow(2, attempt);
          console.warn(`🔄 Fetch attempt ${attempt + 1} failed: ${lastError.message}. Retrying in ${delay}ms...`);
          await this.delay(delay);
        } else {
          console.error(`💥 All ${maxRetries + 1} fetch attempts failed. Last error: ${lastError.message}`);
        }
      }
    }
    
    throw lastError;
  }

  // Helper method for delay
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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

      // Test API connectivity without sending a message
      const response = await this.fetchWithRetry('https://www.wasenderapi.com/api/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'BargainB-AI/1.0',
        },
      }, 2, 500); // 2 retries with 500ms initial delay for testing

      if (response.ok) {
        return { 
          success: true, 
          apiKeyConfigured: true,
          apiReachable: true 
        };
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        
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