import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import {
  getNotificationData,
  getUnreadConversations,
  getTotalUnreadCount,
  markAllConversationsAsRead,
  markConversationAsRead,
  getNotificationSummary,
  handleNewMessageNotification,
  incrementUnreadCount
} from '@/actions/chat-v2/notifications.actions'

// =============================================================================
// GET NOTIFICATION DATA
// =============================================================================

export async function GET(request: NextRequest) {
  console.log('🔔 GET notifications request received...')

  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const type = searchParams.get('type') || 'overview'
    const limit = parseInt(searchParams.get('limit') || '10')

    switch (type) {
      case 'overview':
        // Get comprehensive notification data
        const notificationData = await getNotificationData()
        
        return NextResponse.json({
          success: true,
          data: notificationData
        })

      case 'unread':
        // Get unread conversations
        const unreadConversations = await getUnreadConversations(limit)
        
        return NextResponse.json({
          success: true,
          data: {
            conversations: unreadConversations,
            total_count: unreadConversations.length
          },
          meta: {
            limit
          }
        })

      case 'count':
        // Get total unread count only
        const totalUnread = await getTotalUnreadCount()
        
        return NextResponse.json({
          success: true,
          data: {
            total_unread: totalUnread
          }
        })

      case 'summary':
        // Get notification summary for dashboard
        const summary = await getNotificationSummary()
        
        return NextResponse.json({
          success: true,
          data: summary
        })

      default:
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid notification type. Use: overview, unread, count, or summary' 
          },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('❌ GET notifications error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch notifications' 
      },
      { status: 500 }
    )
  }
}

// =============================================================================
// MARK AS READ OPERATIONS
// =============================================================================

export async function PATCH(request: NextRequest) {
  console.log('✅ PATCH notifications request received...')

  try {
    const body = await request.json()
    const { action, conversation_id } = body

    // Validate required fields
    if (!action) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required field: action' 
        },
        { status: 400 }
      )
    }

    switch (action) {
      case 'mark_all_read':
        // Mark all conversations as read
        await markAllConversationsAsRead()
        
        console.log('✅ All conversations marked as read')
        
        return NextResponse.json({
          success: true,
          message: 'All conversations marked as read'
        })

      case 'mark_conversation_read':
        // Mark specific conversation as read
        if (!conversation_id) {
          return NextResponse.json(
            { 
              success: false,
              error: 'Missing required field: conversation_id for mark_conversation_read action' 
            },
            { status: 400 }
          )
        }

        await markConversationAsRead(conversation_id)
        
        console.log('✅ Conversation marked as read:', conversation_id)
        
        return NextResponse.json({
          success: true,
          message: 'Conversation marked as read'
        })

      default:
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid action. Use: mark_all_read or mark_conversation_read' 
          },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('❌ PATCH notifications error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update notifications' 
      },
      { status: 500 }
    )
  }
}

// =============================================================================
// CREATE NOTIFICATION (for testing/manual triggers)
// =============================================================================

export async function POST(request: NextRequest) {
  console.log('📬 POST notification request received...')

  try {
    const body = await request.json()
    const { 
      conversation_id,
      message_content,
      is_inbound = true,
      increment_only = false
    } = body

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

    if (increment_only) {
      // Just increment unread count
      await incrementUnreadCount(conversation_id)
      
      return NextResponse.json({
        success: true,
        message: 'Unread count incremented'
      })
    }

    // Handle new message notification
    const notificationData = await handleNewMessageNotification(
      conversation_id,
      message_content || 'New message',
      is_inbound
    )

    console.log('✅ Notification processed for conversation:', conversation_id)
    
    return NextResponse.json({
      success: true,
      data: notificationData,
      message: 'Notification created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('❌ POST notification error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create notification' 
      },
      { status: 500 }
    )
  }
}

// =============================================================================
// HEALTH CHECK
// =============================================================================

export async function OPTIONS() {
  return NextResponse.json({
    status: 'healthy',
    service: 'chat-v2-notifications',
    endpoints: {
      GET: 'Fetch notification data (types: overview, unread, count, summary)',
      PATCH: 'Mark notifications as read (actions: mark_all_read, mark_conversation_read)',
      POST: 'Create notification (for testing/manual triggers)'
    },
    timestamp: new Date().toISOString()
  })
} 