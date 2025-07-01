# BargainB AI Agent - WhatsApp Integration Implementation Plan

## 🎯 **Implementation Plan for Existing WhatsApp System**

Since you already have a working WhatsApp chat system with Supabase, here's the step-by-step integration plan:

---

## **Phase 1: Database Schema Updates** ⏱️ 30 minutes

### **1.1 Update Existing Tables**

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Add AI capabilities to existing whatsapp_chats table
ALTER TABLE whatsapp_chats 
ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_thread_id VARCHAR,
ADD COLUMN IF NOT EXISTS ai_config JSONB DEFAULT '{"enabled": false, "response_style": "helpful"}'::jsonb;

-- Add AI indicators to existing messages table  
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS sender_type VARCHAR DEFAULT 'user',
ADD COLUMN IF NOT EXISTS is_ai_triggered BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_thread_id VARCHAR;

-- Create AI interaction logs table
CREATE TABLE IF NOT EXISTS ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_chat_id UUID REFERENCES whatsapp_chats(id),
  user_id UUID NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  thread_id VARCHAR NOT NULL,
  processing_time_ms INTEGER,
  tokens_used INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Update sender_type for existing admin messages
UPDATE messages SET sender_type = 'admin' WHERE sender_type = 'user' AND admin_id IS NOT NULL;
```

### **1.2 Add Indexes for Performance**

```sql
-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_chats_ai_enabled ON whatsapp_chats(ai_enabled) WHERE ai_enabled = true;
CREATE INDEX IF NOT EXISTS idx_messages_sender_type ON messages(sender_type);
CREATE INDEX IF NOT EXISTS idx_messages_ai_triggered ON messages(is_ai_triggered) WHERE is_ai_triggered = true;
CREATE INDEX IF NOT EXISTS idx_ai_interactions_chat_user ON ai_interactions(whatsapp_chat_id, user_id);
```

---

## **Phase 2: Backend AI Integration** ⏱️ 2 hours

### **2.1 Create AI Agent Service**

Create `lib/whatsapp-ai-service.ts`:

```typescript
// lib/whatsapp-ai-service.ts
import { createClient } from '@supabase/supabase-js';

export interface AIAgentConfig {
  baseUrl: string;
  apiKey: string;
  assistantId: string;
}

export class WhatsAppAIService {
  private aiConfig: AIAgentConfig;
  private supabase;

  constructor() {
    this.aiConfig = {
      baseUrl: process.env.BARGAINB_API_URL || 'https://ht-ample-carnation-93-62e3a16b2190526eac38c74198169a7f.us.langgraph.app',
      apiKey: process.env.BARGAINB_API_KEY || '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',
      assistantId: process.env.BARGAINB_ASSISTANT_ID || '5fd12ecb-9268-51f0-8168-fc7952c7c8b8'
    };

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
        .from('whatsapp_chats')
        .select('ai_enabled, ai_thread_id, ai_config')
        .eq('id', chatId)
        .single();

      if (!chatData?.ai_enabled) {
        return { success: false, error: 'AI not enabled for this chat' };
      }

      // 2. Get or create AI thread
      let threadId = chatData.ai_thread_id;
      if (!threadId) {
        threadId = await this.createAIThread(userId);
        
        // Update chat with thread ID
        await this.supabase
          .from('whatsapp_chats')
          .update({ ai_thread_id: threadId })
          .eq('id', chatId);
      }

      // 3. Clean the message (remove @bb)
      const cleanMessage = message.replace(/@bb\s*/i, '').trim();

      // 4. Get user profile for context
      const userProfile = await this.getUserProfile(userId);

      // 5. Send to AI agent
      const startTime = Date.now();
      const aiResponse = await this.callAIAgent(threadId, cleanMessage, userId, userProfile);
      const processingTime = Date.now() - startTime;

      // 6. Log the interaction
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

  private async createAIThread(userId: string): Promise<string> {
    const response = await fetch(`${this.aiConfig.baseUrl}/threads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': this.aiConfig.apiKey
      },
      body: JSON.stringify({
        metadata: { user_id: userId, source: 'whatsapp' }
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

  private async callAIAgent(threadId: string, message: string, userId: string, userProfile: any): Promise<string> {
    const response = await fetch(`${this.aiConfig.baseUrl}/threads/${threadId}/runs/wait`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': this.aiConfig.apiKey
      },
      body: JSON.stringify({
        assistant_id: this.aiConfig.assistantId,
        input: {
          messages: [{ role: 'user', content: message }]
        },
        config: {
          configurable: { 
            user_id: userId,
            source: 'whatsapp',
            user_profile: userProfile
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

  private async logAIInteraction(
    chatId: string, 
    userId: string, 
    userMessage: string, 
    aiResponse: string, 
    threadId: string, 
    processingTime: number
  ) {
    await this.supabase
      .from('ai_interactions')
      .insert({
        whatsapp_chat_id: chatId,
        user_id: userId,
        user_message: userMessage,
        ai_response: aiResponse,
        thread_id: threadId,
        processing_time_ms: processingTime,
        tokens_used: aiResponse.length // Approximate token count
      });
  }

  async enableAIForChat(chatId: string, config = { enabled: true, response_style: 'helpful' }): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('whatsapp_chats')
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

  async getAIUsageStats(chatId: string): Promise<any> {
    const { data } = await this.supabase
      .from('ai_interactions')
      .select('*')
      .eq('whatsapp_chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(10);

    return data || [];
  }
}
```

### **2.2 Create API Route for AI Processing**

Create `app/api/whatsapp/ai/route.ts`:

```typescript
// app/api/whatsapp/ai/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppAIService } from '@/lib/whatsapp-ai-service';

export async function POST(request: NextRequest) {
  try {
    const { chatId, message, userId } = await request.json();

    // Validate required fields
    if (!chatId || !message || !userId) {
      return NextResponse.json({ 
        error: 'Missing required fields: chatId, message, userId' 
      }, { status: 400 });
    }

    // Check if message contains @bb mention
    const containsBBMention = /@bb/i.test(message);
    
    if (!containsBBMention) {
      return NextResponse.json({ 
        error: 'No @bb mention found',
        requiresAI: false 
      }, { status: 400 });
    }

    const aiService = new WhatsAppAIService();
    const result = await aiService.processAIMessage(chatId, message, userId);

    if (result.success) {
      return NextResponse.json({ 
        aiResponse: result.aiResponse,
        success: true 
      });
    } else {
      return NextResponse.json({ 
        error: result.error,
        success: false 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
```

---

## **Phase 3: Frontend Integration** ⏱️ 3 hours

### **3.1 Update Message Input Component**

Modify your existing message input to detect @bb:

```tsx
// components/chat/MessageInput.tsx
'use client';

import { useState } from 'react';

interface MessageInputProps {
  onSendMessage: (message: string, isAI?: boolean) => Promise<void>;
  disabled?: boolean;
  chatId: string;
  userId: string;
  aiEnabled?: boolean;
}

export default function MessageInput({ 
  onSendMessage, 
  disabled, 
  chatId, 
  userId, 
  aiEnabled 
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || disabled || isProcessing) return;

    const containsBBMention = /@bb/i.test(message);
    
    if (containsBBMention && aiEnabled) {
      setIsProcessing(true);
      
      try {
        // Send to AI processing endpoint
        const response = await fetch('/api/whatsapp/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId,
            message,
            userId
          })
        });

        const data = await response.json();

        if (data.success) {
          // Send both user message and AI response
          await onSendMessage(message, true); // User message with AI trigger
          // AI response will be automatically added by the backend
        } else {
          console.error('AI processing failed:', data.error);
          // Send as regular message
          await onSendMessage(message, false);
        }
      } catch (error) {
        console.error('AI request failed:', error);
        // Fallback to regular message
        await onSendMessage(message, false);
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Regular admin message
      await onSendMessage(message, false);
    }

    setMessage('');
  };

  return (
    <div className="p-4 border-t bg-white">
      <div className="flex space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            aiEnabled 
              ? "Type @bb for AI assistance or send admin message..." 
              : "Type your message..."
          }
          className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={disabled || isProcessing}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled || isProcessing}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors"
        >
          {isProcessing ? 'AI...' : 'Send'}
        </button>
      </div>
      
      {aiEnabled && (
        <div className="text-xs text-gray-500 mt-2 flex items-center">
          <span className="text-blue-600">🤖</span>
          <span className="ml-1">Type @bb to get AI assistance</span>
        </div>
      )}
    </div>
  );
}
```

### **3.2 Update Message Display Component**

Add AI indicators to your existing message bubbles:

```tsx
// components/chat/MessageBubble.tsx
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  content: string;
  sender_type: 'user' | 'admin' | 'ai_agent';
  is_ai_triggered?: boolean;
  created_at: string;
  admin_name?: string;
}

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender_type === 'user';
  const isAI = message.sender_type === 'ai_agent';
  const isAdmin = message.sender_type === 'admin';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
        isUser 
          ? 'bg-blue-600 text-white' 
          : isAI 
            ? 'bg-purple-100 text-purple-900 border border-purple-200'
            : 'bg-gray-100 text-gray-900'
      }`}>
        {/* Sender indicator */}
        {(isAI || isAdmin) && (
          <div className="flex items-center space-x-2 mb-2">
            {isAI ? (
              <>
                <span className="text-xs font-semibold text-purple-700">
                  🤖 AI Assistant
                </span>
                <span className="text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded">
                  @bb
                </span>
              </>
            ) : (
              <span className="text-xs font-semibold text-gray-600">
                👨‍💼 {message.admin_name || 'Admin'}
              </span>
            )}
          </div>
        )}

        {/* Message content */}
        <div className="text-sm whitespace-pre-wrap">{message.content}</div>

        {/* Timestamp and indicators */}
        <div className={`text-xs mt-2 flex items-center justify-between ${
          isUser ? 'text-blue-200' : 'text-gray-500'
        }`}>
          <span>
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
          
          {message.is_ai_triggered && isUser && (
            <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
              ✨ AI
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
```

### **3.3 Add AI Configuration Tab**

Add this to your existing user profile tabs:

```tsx
// components/admin/AIConfigTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { WhatsAppAIService } from '@/lib/whatsapp-ai-service';

interface AIConfigTabProps {
  chatId: string;
  userId: string;
}

export default function AIConfigTab({ chatId, userId }: AIConfigTabProps) {
  const [config, setConfig] = useState({
    enabled: false,
    response_style: 'helpful' as 'concise' | 'detailed' | 'helpful'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    loadAIConfig();
    loadAIStats();
  }, [chatId]);

  const loadAIConfig = async () => {
    try {
      const response = await fetch(`/api/whatsapp/chats/${chatId}/ai-config`);
      if (response.ok) {
        const data = await response.json();
        setConfig({
          enabled: data.ai_enabled || false,
          response_style: data.ai_config?.response_style || 'helpful'
        });
      }
    } catch (error) {
      console.error('Error loading AI config:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAIStats = async () => {
    try {
      const aiService = new WhatsAppAIService();
      const usage = await aiService.getAIUsageStats(chatId);
      setStats(usage);
    } catch (error) {
      console.error('Error loading AI stats:', error);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/whatsapp/chats/${chatId}/ai-config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        // Show success message
        alert('AI configuration saved successfully!');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading AI configuration...</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">AI Assistant Configuration</h3>
        
        <div className="space-y-4">
          {/* Enable/Disable AI */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium">Enable AI Assistant</h4>
              <p className="text-sm text-gray-600">Allow users to trigger AI with @bb</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({...config, enabled: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {config.enabled && (
            <>
              {/* Response Style */}
              <div className="p-3 border rounded-lg">
                <label className="block text-sm font-medium mb-2">
                  Response Style
                </label>
                <select
                  value={config.response_style}
                  onChange={(e) => setConfig({
                    ...config, 
                    response_style: e.target.value as any
                  })}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="concise">Concise & Quick</option>
                  <option value="detailed">Detailed & Thorough</option>
                  <option value="helpful">Helpful & Friendly</option>
                </select>
              </div>

              {/* AI Capabilities Info */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">AI Capabilities</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>✅ Product search across Dutch supermarkets</li>
                  <li>✅ Price comparison (Albert Heijn, Jumbo, Dirk)</li>
                  <li>✅ Meal planning and recipes</li>
                  <li>✅ Budget tracking and recommendations</li>
                  <li>✅ Personalized shopping lists</li>
                </ul>
              </div>
            </>
          )}

          {/* Save Button */}
          <button
            onClick={saveConfig}
            disabled={saving}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>

      {/* Usage Statistics */}
      {config.enabled && stats.length > 0 && (
        <div className="border-t pt-6">
          <h4 className="font-medium mb-3">Recent AI Interactions</h4>
          <div className="space-y-2">
            {stats.slice(0, 5).map((interaction, index) => (
              <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                <div className="font-medium truncate">
                  {interaction.user_message.substring(0, 50)}...
                </div>
                <div className="text-gray-600 text-xs">
                  {interaction.processing_time_ms}ms • {new Date(interaction.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## **Phase 4: Testing & Deployment** ⏱️ 1 hour

### **4.1 Environment Variables**

Add to your `.env.local`:

```bash
# AI Agent Configuration
BARGAINB_API_URL=https://ht-ample-carnation-93-62e3a16b2190526eac38c74198169a7f.us.langgraph.app
BARGAINB_API_KEY=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  
BARGAINB_ASSISTANT_ID=5fd12ecb-9268-51f0-8168-fc7952c7c8b8

# Supabase (you probably already have these)
NEXT_PUBLIC_SUPABASE_URL=https://oumhprsxyxnocgbzosvh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **4.2 Testing Checklist**

- [ ] **Database Updates Applied**: Run the SQL schema updates
- [ ] **AI Service Created**: WhatsAppAIService class working
- [ ] **API Route Working**: `/api/whatsapp/ai` endpoint responding
- [ ] **@bb Detection**: Message input detects @bb mentions
- [ ] **AI Responses**: Messages show with AI indicators
- [ ] **Configuration**: AI config tab enables/disables per chat
- [ ] **Error Handling**: Graceful fallback when AI fails

### **4.3 Quick Test**

1. Enable AI for a test chat
2. Send message: `@bb what are some good breakfast cereals?`
3. Verify AI response appears with purple bubble and 🤖 indicator
4. Check `ai_interactions` table has logged the interaction

---

## 🚀 **Ready to Deploy!**

This integration plan:
- ✅ Works with your existing WhatsApp system
- ✅ Minimal code changes required  
- ✅ Uses your existing Supabase database
- ✅ Leverages your deployed AI agent
- ✅ Maintains admin override capabilities
- ✅ Provides usage tracking and configuration

**Total Implementation Time: ~6 hours**

Start with Phase 1 (database updates) and test each phase before moving to the next! 