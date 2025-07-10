import { NextRequest, NextResponse } from 'next/server'
import { sendMessage } from '@/lib/whatsapp-ai-service'
import { createMessage } from '@/actions/chat-v2/messages.actions'
import { updateConversation } from '@/actions/chat-v2/conversations.actions'
import { getConversationById } from '@/actions/chat-v2/conversations.actions'
import { getContactById } from '@/actions/chat-v2/contacts.actions'

interface SendMessageRequest {
  conversationId: string
  phoneNumber: string
  message: string
  messageType?: 'text' | 'image' | 'video' | 'audio' | 'document'
  mediaUrl?: string
  caption?: string
  replyToMessageId?: string
}

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Send message API called')
    
    const body: SendMessageRequest = await request.json()
    const {
      conversationId,
      phoneNumber,
      message,
      messageType = 'text',
      mediaUrl,
      caption,
      replyToMessageId
    } = body

    // Validate required fields
    if (!conversationId || !phoneNumber || !message.trim()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: conversationId, phoneNumber, and message are required' 
        },
        { status: 400 }
      )
    }

    console.log('📤 Sending message:', {
      conversationId,
      phoneNumber,
      messageType,
      messageLength: message.length
    })

    // Get conversation and contact details
    const [conversation, contact] = await Promise.all([
      getConversationById(conversationId),
      // We can get contact via conversation relation if needed
      phoneNumber ? null : null // For now, we have phoneNumber directly
    ])

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Send message via WASender
    const sendResult = await sendMessage(phoneNumber, message, {
      conversationId,
      replyToMessageId,
      messageType,
      mediaUrl,
      caption
    })

    if (!sendResult.success) {
      console.error('❌ WASender send failed:', sendResult.error)
      return NextResponse.json(
        { 
          success: false, 
          error: sendResult.error || 'Failed to send message via WASender' 
        },
        { status: 500 }
      )
    }

    console.log('✅ Message sent via WASender:', sendResult.messageId)

    // Create message record in database
    const messageData = {
      conversation_id: conversationId,
      whatsapp_message_id: sendResult.messageId || '',
      content: message,
      message_type: messageType,
      direction: 'outbound',
      from_me: true,
      whatsapp_status: 'sent',
      sender_type: 'admin',
      media_url: mediaUrl || null,
      reply_to_message_id: replyToMessageId || null,
      created_at: new Date().toISOString()
    }

    try {
      const newMessage = await createMessage(messageData)
      console.log('✅ Message saved to database:', newMessage.id)

      // Update conversation last message timestamp
      await updateConversation(conversationId, {
        last_message_at: new Date().toISOString()
      })

      return NextResponse.json({
        success: true,
        data: {
          message: newMessage,
          wasender_message_id: sendResult.messageId
        },
        message: 'Message sent successfully'
      })

    } catch (dbError) {
      console.error('❌ Database error after successful send:', dbError)
      
      // Message was sent but DB failed - this is tricky
      // We should still return success since the message was delivered
      return NextResponse.json({
        success: true,
        data: {
          wasender_message_id: sendResult.messageId
        },
        warning: 'Message sent but database update failed',
        message: 'Message sent successfully'
      })
    }

  } catch (error) {
    console.error('❌ Send message API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// =============================================================================
// GET METHOD - Get message sending status/history
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

    // Return recent outbound messages for this conversation
    // This could be useful for checking send status
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