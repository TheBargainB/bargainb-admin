import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Helper function to normalize phone numbers to E.164 format
function normalizePhoneNumber(phoneNumber: string): string {
  // Remove WhatsApp suffix and clean the number
  let cleaned = phoneNumber.replace('@s.whatsapp.net', '').replace(/[^\d+]/g, '')
  
  // If it starts with +, use as is
  if (cleaned.startsWith('+')) {
    return cleaned
  }
  
  // Add + for all numbers
  return `+${cleaned}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversationId, phoneNumber, message } = body

    if (!conversationId || !phoneNumber || !message) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: conversationId, phoneNumber, and message are required' 
      }, { status: 400 })
    }

    const apiKey = process.env.WASENDER_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'WASender API key not configured' 
      }, { status: 500 })
    }

    // Clean and format the phone number for WhatsApp API (E.164 format)
    const cleanPhoneNumber = normalizePhoneNumber(phoneNumber)
    console.log('📱 Chat 2.0 - Sending message to:', cleanPhoneNumber, 'Original:', phoneNumber)

    // Send message via WASender API
    const apiRes = await fetch('https://www.wasenderapi.com/api/send-message', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        to: cleanPhoneNumber,
        text: message 
      }),
    })

    if (!apiRes.ok) {
      const errorData = await apiRes.json()
      console.error('❌ WASender API error:', errorData)
      return NextResponse.json({ 
        success: false, 
        error: errorData.message || 'Failed to send message via WASender' 
      }, { status: apiRes.status })
    }

    const apiData = await apiRes.json()
    console.log('✅ Chat 2.0 - WASender API response:', apiData)

    if (!apiData.success || !apiData.data?.msgId) {
      console.error('❌ Invalid WASender API response:', apiData)
      return NextResponse.json({
        success: false,
        error: 'Invalid response from WASender API'
      }, { status: 500 })
    }

    // Store the sent message in Chat 2.0 database
    const now = new Date().toISOString()
    const whatsappMessageId = apiData.data.msgId.toString()

    // Store the outbound message
    const { data: newMessage, error: messageError } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: conversationId,
        whatsapp_message_id: whatsappMessageId,
        content: message,
        message_type: 'text',
        direction: 'outbound',
        from_me: true,
        whatsapp_status: 'sent',
        sender_type: 'admin',
        raw_message_data: {
          whatsapp_message_id: whatsappMessageId,
          api_response: apiData,
          sent_by: 'admin',
          original_phone: cleanPhoneNumber,
          api_timestamp: now
        },
        created_at: now
      })
      .select()
      .single()

    if (messageError) {
      console.error('❌ Error storing message:', messageError)
      return NextResponse.json({
        success: false,
        error: 'Failed to store message in database'
      }, { status: 500 })
    }

    console.log('✅ Message stored in database:', newMessage.id)

    // Update conversation stats
    const { data: currentConversation } = await supabaseAdmin
      .from('conversations')
      .select('total_messages')
      .eq('id', conversationId)
      .single()

    if (currentConversation) {
      const newTotalMessages = (currentConversation.total_messages || 0) + 1

      const { error: statsError } = await supabaseAdmin
        .from('conversations')
        .update({
          total_messages: newTotalMessages,
          last_message_at: now,
          updated_at: now
        })
        .eq('id', conversationId)

      if (statsError) {
        console.warn('⚠️ Error updating conversation stats:', statsError)
      } else {
        console.log('✅ Conversation stats updated: total_messages =', newTotalMessages)
      }
    }

    // Check for @bb mention and trigger AI processing
    if (message && /@bb/i.test(message)) {
      console.log('🤖 @bb mention detected, triggering AI processing...')
      
      try {
        // Get the WhatsApp contact ID for the conversation
        const { data: conversationData } = await supabaseAdmin
          .from('conversations')
          .select('whatsapp_contact_id')
          .eq('id', conversationId)
          .single()
        
        if (!conversationData?.whatsapp_contact_id) {
          console.error('❌ Could not find WhatsApp contact ID for conversation:', conversationId)
        } else {
          // Call the AI processing API
          const aiResponse = await fetch(`${request.nextUrl.origin}/api/whatsapp/ai`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chatId: conversationId,
              message: message,
              userId: conversationData.whatsapp_contact_id
            })
          })

          if (aiResponse.ok) {
            const aiResult = await aiResponse.json()
            console.log('✅ AI processing successful:', aiResult.success)
          } else {
            console.error('❌ AI processing failed:', aiResponse.status, aiResponse.statusText)
          }
        }
      } catch (error) {
        console.error('❌ Error calling AI API:', error)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully',
      data: {
        message: newMessage,
        wasender_message_id: whatsappMessageId
      }
    })

  } catch (error) {
    console.error('❌ Send message error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    
    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: 'conversationId parameter is required' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        conversation_id: conversationId,
        status: 'ready_to_send'
      }
    })
    
  } catch (error) {
    console.error('❌ Get send message status error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 