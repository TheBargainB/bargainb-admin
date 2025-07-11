import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

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

    // Clean the phone number for WhatsApp API (E.164 format with +)
    let cleanPhoneNumber = phoneNumber
    if (phoneNumber.includes('@s.whatsapp.net')) {
      cleanPhoneNumber = phoneNumber.replace('@s.whatsapp.net', '')
    }
    
    // Remove any spaces, dashes, or other formatting characters
    cleanPhoneNumber = cleanPhoneNumber.replace(/[\s\-\(\)]/g, '')
    
    if (!cleanPhoneNumber.startsWith('+')) {
      cleanPhoneNumber = `+${cleanPhoneNumber}`
    }
    
    console.log('🚀 Chat 2.0 - Sending message to:', cleanPhoneNumber, 'Original:', phoneNumber)

    // Send message directly via WASender API
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
    console.log('✅ Chat 2.0 - Message sent successfully:', apiData)

    // Store the sent message in Chat 2.0 database structure
    const now = new Date().toISOString()
    const whatsappMessageId = apiData.data?.msgId?.toString() || `out_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Store the outbound message in the messages table
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
      console.error('❌ Error storing message in Chat 2.0 structure:', messageError)
    } else {
      console.log('✅ Message stored in Chat 2.0 CRM structure:', newMessage.id)
    }

    // Update conversation stats manually
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

    // Check for @bb mention in sent messages and trigger AI processing
    if (message && /@bb/i.test(message)) {
      console.log('🤖 @bb mention detected in sent message, triggering AI processing...')
      
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
          // Call the AI processing API with correct user ID
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
            console.log('✅ AI processing successful from Chat 2.0 send-message:', aiResult.success)
          } else {
            console.error('❌ AI processing failed from Chat 2.0 send-message:', aiResponse.status, aiResponse.statusText)
          }
        }
      } catch (error) {
        console.error('❌ Error calling AI API from Chat 2.0 send-message:', error)
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
    console.error('❌ Chat 2.0 send message API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}

// =============================================================================
// GET METHOD - Get message sending status
// =============================================================================

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