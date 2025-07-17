import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { normalizePhoneNumber } from '@/lib/api-utils'

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

    // Clean and format the phone number for WASender API (E.164 format with + prefix)
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
    const { data: currentStats } = await supabaseAdmin
      .from('conversations')
      .select('total_messages')
      .eq('id', conversationId)
      .single()

    await supabaseAdmin
      .from('conversations')
      .update({
        total_messages: (currentStats?.total_messages || 0) + 1,
        last_message_at: now,
        updated_at: now
      })
      .eq('id', conversationId)

    // Admin-sent messages don't need AI processing (they're FROM admin, not TO AI)

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