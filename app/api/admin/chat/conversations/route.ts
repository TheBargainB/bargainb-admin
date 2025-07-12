import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import {
  getConversations,
  getConversationById,
  createConversation,
  updateConversation,
  deleteConversation,
  markConversationAsRead
} from '@/actions/chat-v2/conversations.actions'
import type { ConversationFilters } from '@/types/chat-v2.types'

// =============================================================================
// GET CONVERSATIONS
// =============================================================================

export async function GET(request: NextRequest) {
  console.log('📋 GET conversations request received...')

  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const search = searchParams.get('search') || undefined
    const status = searchParams.get('status') as 'all' | 'unread' | 'active' | 'archived' || 'all'
    const startDate = searchParams.get('start_date') || undefined
    const endDate = searchParams.get('end_date') || undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build filters
    const filters: ConversationFilters = {
      search,
      status,
      ...(startDate && endDate ? {
        date_range: { start: startDate, end: endDate }
      } : {})
    }

    // Fetch conversations
    const response = await getConversations(filters)

    console.log(`✅ Retrieved ${response.conversations.length} conversations`)
    
    return NextResponse.json({
      success: true,
      data: response,
      meta: {
        total: response.total_count,
        unread: response.unread_count,
        limit,
        offset
      }
    })

  } catch (error) {
    console.error('❌ GET conversations error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch conversations' 
      },
      { status: 500 }
    )
  }
}

// =============================================================================
// CREATE CONVERSATION
// =============================================================================

export async function POST(request: NextRequest) {
  console.log('📝 POST conversation request received...')

  try {
    const body = await request.json()
    const {
      whatsapp_contact_id,
      whatsapp_conversation_id,
      title,
      status = 'active'
    } = body

    // Validate required fields
    if (!whatsapp_contact_id || !whatsapp_conversation_id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: whatsapp_contact_id, whatsapp_conversation_id' 
        },
        { status: 400 }
      )
    }

    // Create conversation
    const conversationData = {
      whatsapp_contact_id,
      whatsapp_conversation_id,
      title,
      status,
      unread_count: 0,
      last_message_at: new Date().toISOString()
    }

    const newConversation = await createConversation(conversationData)

    console.log('✅ Conversation created:', newConversation.id)
    
    return NextResponse.json({
      success: true,
      data: newConversation
    }, { status: 201 })

  } catch (error) {
    console.error('❌ POST conversation error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create conversation' 
      },
      { status: 500 }
    )
  }
}

// =============================================================================
// UPDATE CONVERSATION
// =============================================================================

export async function PATCH(request: NextRequest) {
  console.log('🔄 PATCH conversation request received...')

  try {
    const body = await request.json()
    const { conversation_id, ...updates } = body

    // Validate required fields
    if (!conversation_id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required field: conversation_id' 
        },
        { status: 400 }
      )
    }

    // Update conversation
    const updatedConversation = await updateConversation(conversation_id, updates)

    console.log('✅ Conversation updated:', conversation_id)
    
    return NextResponse.json({
      success: true,
      data: updatedConversation
    })

  } catch (error) {
    console.error('❌ PATCH conversation error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update conversation' 
      },
      { status: 500 }
    )
  }
}

// =============================================================================
// DELETE CONVERSATION
// =============================================================================

export async function DELETE(request: NextRequest) {
  console.log('🗑️ DELETE conversation request received...')

  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversation_id')

    // Validate required fields
    if (!conversationId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required parameter: conversation_id' 
        },
        { status: 400 }
      )
    }

    // Delete conversation
    await deleteConversation(conversationId)

    console.log('✅ Conversation deleted:', conversationId)
    
    return NextResponse.json({
      success: true,
      message: 'Conversation deleted successfully'
    })

  } catch (error) {
    console.error('❌ DELETE conversation error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete conversation' 
      },
      { status: 500 }
    )
  }
} 