import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { AGENT_BB_CONFIG } from '@/lib/constants'

// Get or create thread for user's assistant
async function getOrCreateThread(assistantId: string, userId: string): Promise<string> {
  try {
    console.log('🧵 Getting/creating thread for assistant:', assistantId, 'user:', userId)
    
    // First, check if user already has a thread_id in their recent conversations
    const { data: recentConversation, error: conversationError } = await supabaseAdmin
      .from('user_conversations')
      .select('thread_id')
      .eq('user_profile_id', userId)
      .eq('assistant_id', assistantId)
      .not('thread_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (conversationError && conversationError.code !== 'PGRST116') {
      console.error('❌ Error fetching recent conversation:', conversationError)
      // Don't throw here, continue to create new thread
    }

    // If user already has a thread_id, verify it's still valid
    if (recentConversation?.thread_id) {
      console.log('🔍 Found existing thread ID:', recentConversation.thread_id)
      
      // Verify the thread still exists by trying to use it
      try {
        const verifyResponse = await fetch(`${AGENT_BB_CONFIG.BASE_URL}/threads/${recentConversation.thread_id}`, {
          method: 'GET',
          headers: {
            'X-Api-Key': process.env[AGENT_BB_CONFIG.API_KEY_ENV] || ''
          }
        })
        
        if (verifyResponse.ok) {
          console.log('✅ Existing thread is valid, reusing:', recentConversation.thread_id)
          return recentConversation.thread_id
        } else {
          console.warn('⚠️ Existing thread invalid, creating new one')
        }
      } catch (error) {
        console.warn('⚠️ Error verifying existing thread, creating new one:', error)
      }
    }

    // Create new thread if none exists or existing one is invalid
    console.log('🆕 Creating new thread for user:', userId)
    const response = await fetch(`${AGENT_BB_CONFIG.BASE_URL}/threads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env[AGENT_BB_CONFIG.API_KEY_ENV] || ''
      },
      body: JSON.stringify({
        metadata: { 
          user_id: userId,
          assistant_id: assistantId,
          source: 'whatsapp_new_system'
        }
      })
    })

    if (response.ok) {
      const data = await response.json()
      const threadId = data.thread_id
      console.log('✅ New thread created:', threadId)
      
      // Note: thread_id will be stored in user_conversations table 
      // when the conversation record is created later in the process
      console.log('✅ Thread will be stored in conversation record')
      
      return threadId
    } else {
      console.error('❌ Error creating thread:', response.status)
      throw new Error(`Failed to create thread: ${response.status}`)
    }
  } catch (error) {
    console.error('❌ Error in getOrCreateThread:', error)
    throw error
  }
}

// Process AI message and generate response
async function processWithAI(user: any, content: string): Promise<string | null> {
  try {
    console.log('🧠 Processing AI message for user:', user.id)
    console.log('🤖 Using assistant:', user.assistant_id)
    
    if (!user.assistant_id) {
      console.error('❌ No assistant_id found for user')
      return 'Hi! Thanks for your message. How can I help you with grocery shopping today?'
    }

    // Get or create thread for this assistant
    const threadId = await getOrCreateThread(user.assistant_id, user.id)
    
    const response = await fetch(`${AGENT_BB_CONFIG.BASE_URL}/threads/${threadId}/runs/wait`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env[AGENT_BB_CONFIG.API_KEY_ENV] || ''
      },
      body: JSON.stringify({
        assistant_id: user.assistant_id,
        input: {
          messages: [{ role: 'user', content }]
        },
        config: {
          configurable: { 
            user_id: user.id,
            source: 'whatsapp',
            user_profile: {
              full_name: user.full_name,
              phone_number: user.phone_number,
              country_code: user.country_code,
              language_code: user.language_code || 'en',
              dietary_restrictions: user.dietary_restrictions,
              budget_level: user.budget_level,
              store_preference: user.store_preference
            }
          }
        }
      })
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ AI response received:', data)
      
      // Handle different AI response formats
      let aiResponse = null
      if (typeof data === 'string') {
        aiResponse = data
      } else if (data.messages && data.messages.length > 0) {
        const lastMessage = data.messages[data.messages.length - 1]
        aiResponse = lastMessage.content || lastMessage
      } else if (data.content) {
        aiResponse = data.content
      } else if (data.response) {
        aiResponse = data.response
      }
      
      if (!aiResponse) {
        console.warn('⚠️ No valid AI response found in data:', data)
        return 'Hi! Thanks for your message. How can I help you with grocery shopping today?'
      }
      
      console.log('✅ AI response extracted:', aiResponse.substring(0, 100) + '...')
      return aiResponse
    } else {
      const errorText = await response.text()
      console.error('❌ AI service error:', response.status, errorText)
      return 'Hi! Thanks for your message. How can I help you with grocery shopping today?'
    }
  } catch (error) {
    console.error('❌ Error calling AI service:', error)
    return 'Hi! Thanks for your message. How can I help you with grocery shopping today?'
  }
}

// Send WhatsApp message via WASender API
async function sendWhatsAppMessage(phoneNumber: string, message: string): Promise<{ success: boolean, messageId?: string }> {
  try {
    console.log('📤 Sending WhatsApp message to:', phoneNumber)
    
    // Get WASender API credentials from environment
    const wasenderApiKey = process.env.WASENDER_API_KEY
    const wasenderApiUrl = process.env.WASENDER_API_URL || 'https://www.wasenderapi.com'

    if (!wasenderApiKey) {
      console.error('WASENDER_API_KEY not found in environment variables')
      return { success: false }
    }

    // Clean and format phone number
    let cleanPhone = phoneNumber.replace(/^\++/, '+').replace(/\s+/g, '')
    
    // If phone number doesn't start with +, add it
    if (!cleanPhone.startsWith('+')) {
      // If it starts with 0, replace with +31 (Dutch country code)
      if (cleanPhone.startsWith('0')) {
        cleanPhone = '+31' + cleanPhone.substring(1)
      } else {
        // Otherwise just add +
        cleanPhone = '+' + cleanPhone
      }
    }
    
    // Prepare the payload for WASender API
    const payload = {
      to: cleanPhone,
      text: message
    }

    console.log('📤 Sending WhatsApp message via WASender API:', {
      to: cleanPhone,
      textPreview: message.substring(0, 50) + (message.length > 50 ? '...' : '')
    })

    // Send message via WASender API
    const wasenderResponse = await fetch(`${wasenderApiUrl}/api/send-message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${wasenderApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const responseData = await wasenderResponse.json()

    if (wasenderResponse.ok) {
      console.log('✅ WASender API success:', responseData)
      return { 
        success: true, 
        messageId: responseData.data?.msgId?.toString() 
      }
    } else {
      console.error('❌ WASender API error:', responseData)
      return { success: false }
    }
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error)
    return { success: false }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, content, phone_number } = body

    console.log('🔄 Processing AI request for user:', user_id)

    // Get user profile with assistant info
    const { data: user, error: userError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', user_id)
      .single()

    if (userError || !user) {
      console.error('❌ User not found:', userError)
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 })
    }

    console.log('👤 Found user:', user.full_name, 'Assistant:', user.assistant_id)

    // Get thread_id early for both user and AI messages
    let threadId = null
    if (user.assistant_id) {
      threadId = await getOrCreateThread(user.assistant_id, user.id)
    }

    // Store incoming user message
    await supabaseAdmin
      .from('user_conversations')
      .insert({
        user_profile_id: user.id,
        assistant_id: user.assistant_id,
        thread_id: threadId, // ✅ Store thread_id for user message too
        whatsapp_message_id: `user_${Date.now()}`,
        content: content,
        message_type: 'user_message',
        whatsapp_status: 'delivered'
      })

    await supabaseAdmin
      .from('ai_messages')
      .insert({
        user_profile_id: user.id,
        assistant_id: user.assistant_id,
        content: content,
        message_type: 'user',
        status: 'processing'
      })

    // Generate AI response
    const aiResponse = await processWithAI(user, content)
    
    if (!aiResponse) {
      return NextResponse.json({
        success: false,
        error: 'Failed to generate AI response'
      }, { status: 500 })
    }

    // Send AI response via WhatsApp
    if (!user.phone_number) {
      return NextResponse.json({
        success: false,
        error: 'User phone number not found'
      }, { status: 400 })
    }
    
    // First create conversation record with null whatsapp_message_id
    // This ensures the record exists BEFORE sending, so webhook can always find it
    const { data: conversationRecord, error: convError } = await supabaseAdmin
      .from('user_conversations')
      .insert({
        user_profile_id: user.id,
        assistant_id: user.assistant_id,
        thread_id: threadId, // ✅ Store the thread_id for future reuse (null if no assistant)
        whatsapp_message_id: null, // ✅ Start with null for webhook matching
        content: aiResponse,
        message_type: 'ai_response',
        whatsapp_status: 'pending',
        sent_at: new Date().toISOString()
      })
      .select()
      .single()

    if (convError) {
      console.error('❌ Error creating conversation record:', convError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create conversation record'
      }, { status: 500 })
    }

    console.log('✅ Created conversation record for webhook matching:', conversationRecord?.id)
    
    // Now send the WhatsApp message
    const sendResult = await sendWhatsAppMessage(user.phone_number, aiResponse)
    
    if (sendResult.success) {
      // If we got a WhatsApp message ID immediately, update the record
      if (sendResult.messageId) {
        await supabaseAdmin
          .from('user_conversations')
          .update({ 
            whatsapp_message_id: sendResult.messageId,
            whatsapp_status: 'sent'
          })
          .eq('id', conversationRecord.id)
        
        console.log('✅ Updated conversation record with WhatsApp ID:', sendResult.messageId)
      }

      await supabaseAdmin
        .from('ai_messages')
        .insert({
          user_profile_id: user.id,
          assistant_id: user.assistant_id,
          content: aiResponse,
          message_type: 'assistant',
          status: 'completed'
        })

      console.log('✅ Complete AI processing and WhatsApp delivery successful')
      
      return NextResponse.json({
        success: true,
        ai_response: aiResponse,
        whatsapp_message_id: sendResult.messageId
      })
    } else {
      // Update conversation record to show failed status
      await supabaseAdmin
        .from('user_conversations')
        .update({ whatsapp_status: 'failed' })
        .eq('id', conversationRecord.id)
        
      return NextResponse.json({
        success: false,
        error: 'Failed to send WhatsApp message'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Error in process-ai-responses route:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 