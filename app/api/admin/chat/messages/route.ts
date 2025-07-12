import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import {
  getMessagesByConversation,
  createMessage,
  updateMessage,
  updateMessageStatus,
  deleteMessage,
  getMessageByWhatsAppId
} from '@/actions/chat-v2/messages.actions'
import type { MessageInsert, MessageUpdate } from '@/types/chat-v2.types'

// =============================================================================
// GET MESSAGES
// =============================================================================

export async function GET(request: NextRequest) {
  console.log('📨 GET messages request received...')

  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const conversationId = searchParams.get('conversation_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const whatsappMessageId = searchParams.get('whatsapp_message_id')

    // Get single message by WhatsApp ID
    if (whatsappMessageId) {
      const message = await getMessageByWhatsAppId(whatsappMessageId)
      
      if (!message) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Message not found' 
          },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: message
      })
    }

    // Get messages by conversation
    if (!conversationId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required parameter: conversation_id or whatsapp_message_id' 
        },
        { status: 400 }
      )
    }

    // Fetch messages
    const response = await getMessagesByConversation(conversationId, limit, offset)

    console.log(`✅ Retrieved ${response.messages.length} messages for conversation ${conversationId}`)
    
    return NextResponse.json({
      success: true,
      data: response,
      meta: {
        conversation_id: conversationId,
        total: response.total_count,
        limit,
        offset,
        has_more: response.messages.length >= limit
      }
    })

  } catch (error) {
    console.error('❌ GET messages error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch messages' 
      },
      { status: 500 }
    )
  }
}

// =============================================================================
// CREATE MESSAGE
// =============================================================================

export async function POST(request: NextRequest) {
  console.log('📝 POST message request received...')

  try {
    const body = await request.json()
    const {
      conversation_id,
      content,
      direction = 'outbound',
      message_type = 'text',
      media_url,
      whatsapp_message_id,
      sender_type = 'admin'
    } = body

    // Validate required fields
    if (!conversation_id || !content) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: conversation_id, content' 
        },
        { status: 400 }
      )
    }

    // Create message data
    const messageData: MessageInsert = {
      conversation_id,
      content,
      direction,
      from_me: direction === 'outbound',
      message_type,
      whatsapp_status: 'pending',
      sender_type,
      media_url,
      whatsapp_message_id,
      created_at: new Date().toISOString()
    }

    // Create message
    const newMessage = await createMessage(messageData)

    console.log('✅ Message created:', newMessage.id)
    
    return NextResponse.json({
      success: true,
      data: newMessage
    }, { status: 201 })

  } catch (error) {
    console.error('❌ POST message error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create message' 
      },
      { status: 500 }
    )
  }
}

// =============================================================================
// UPDATE MESSAGE
// =============================================================================

export async function PATCH(request: NextRequest) {
  console.log('🔄 PATCH message request received...')

  try {
    const body = await request.json()
    const { message_id, ...updates } = body

    // Validate required fields
    if (!message_id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required field: message_id' 
        },
        { status: 400 }
      )
    }

    // Special handling for status updates
    if (updates.whatsapp_status && Object.keys(updates).length === 1) {
      await updateMessageStatus(message_id, updates.whatsapp_status)
      
      return NextResponse.json({
        success: true,
        message: 'Message status updated successfully'
      })
    }

    // Regular message update
    const updatedMessage = await updateMessage(message_id, updates)

    console.log('✅ Message updated:', message_id)
    
    return NextResponse.json({
      success: true,
      data: updatedMessage
    })

  } catch (error) {
    console.error('❌ PATCH message error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update message' 
      },
      { status: 500 }
    )
  }
}

// =============================================================================
// DELETE MESSAGE
// =============================================================================

export async function DELETE(request: NextRequest) {
  console.log('🗑️ DELETE message request received...')

  try {
    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('message_id')

    // Validate required fields
    if (!messageId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required parameter: message_id' 
        },
        { status: 400 }
      )
    }

    // Delete message
    await deleteMessage(messageId)

    console.log('✅ Message deleted:', messageId)
    
    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully'
    })

  } catch (error) {
    console.error('❌ DELETE message error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete message' 
      },
      { status: 500 }
    )
  }
} 