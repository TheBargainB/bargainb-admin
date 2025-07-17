import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { AGENT_BB_CONFIG } from '@/lib/constants'

// Process AI message and generate response
async function processWithAI(user: any, content: string): Promise<string | null> {
  try {
    console.log('🧠 Processing AI message for user:', user.id)
    
    const response = await fetch(`${AGENT_BB_CONFIG.BASE_URL}/threads/${user.thread_id || 'default'}/runs/wait`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env[AGENT_BB_CONFIG.API_KEY_ENV] || ''
      },
      body: JSON.stringify({
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
              language_code: user.language_code || 'en'
            }
          }
        }
      })
    })

    if (response.ok) {
      const data = await response.json()
      
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
      
      return aiResponse || 'Hi! Thanks for your message. How can I help you with grocery shopping today?'
    } else {
      console.error('❌ AI service error:', response.status)
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
    
    const response = await fetch('https://www.wasenderapi.com/api/send-message', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WASENDER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: `+${phoneNumber.replace(/^\+/, '')}`,
        text: message
      })
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ WhatsApp message sent successfully:', result.data?.msgId)
      return { success: true, messageId: result.data?.msgId?.toString() }
    } else {
      console.error('❌ Failed to send WhatsApp message:', response.status)
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

    // Get user profile
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

    // Store incoming user message
    await supabaseAdmin
      .from('user_conversations')
      .insert({
        user_profile_id: user.id,
        whatsapp_message_id: `user_${Date.now()}`,
        content: content,
        message_type: 'user_message',
        whatsapp_status: 'delivered'
      })

    await supabaseAdmin
      .from('ai_messages')
      .insert({
        user_profile_id: user.id,
        content: content,
        message_type: 'user',
        status: 'pending'
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
    
    const sendResult = await sendWhatsAppMessage(user.phone_number, aiResponse)
    
    if (sendResult.success) {
      // Store AI response in both tables
      await supabaseAdmin
        .from('user_conversations')
        .insert({
          user_profile_id: user.id,
          whatsapp_message_id: sendResult.messageId || `ai_${Date.now()}`,
          content: aiResponse,
          message_type: 'ai_response',
          whatsapp_status: 'sent',
          sent_at: new Date().toISOString()
        })

      await supabaseAdmin
        .from('ai_messages')
        .insert({
          user_profile_id: user.id,
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