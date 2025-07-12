import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params
    
    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: 'Conversation ID is required' },
        { status: 400 }
      )
    }

    console.log(`📖 Marking conversation as read: ${conversationId}`)

    const now = new Date().toISOString()

    // Update the conversation's updated_at timestamp and reset unread count
    // Note: Using 'id' and 'whatsapp_contact_id' as these are the actual column names
    const { error: updateConversationError } = await supabase
      .from('conversations')
      .update({ 
        updated_at: now,
        unread_count: 0  // Reset unread count when marking as read
      })
      .eq('id', conversationId)  // Using 'id' not 'conversation_id'

    if (updateConversationError) {
      console.error('❌ Error updating conversation read time:', updateConversationError)
      return NextResponse.json(
        { success: false, error: 'Failed to update conversation read status' },
        { status: 500 }
      )
    }

    console.log('✅ Updated conversation read time and reset unread count')

    // Messages are considered read when conversation unread_count is 0
    // No need to update individual message timestamps due to schema cache issues
    console.log('✅ Messages marked as read via conversation unread_count reset')

    return NextResponse.json({
      success: true,
      message: 'Conversation marked as read',
      conversationId,
      readAt: now
    })

  } catch (error) {
    console.error('❌ Error marking conversation as read:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 