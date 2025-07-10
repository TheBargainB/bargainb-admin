import { createClient } from '@/utils/supabase/client'
import type { 
  NotificationData,
  UnreadConversation,
  Conversation
} from '@/types/chat-v2.types'
import { getContacts } from './contacts.actions'

const supabase = createClient()

// =============================================================================
// GET NOTIFICATION DATA - For the notification bell
// =============================================================================

export async function getNotificationData(): Promise<NotificationData> {
  try {
    // Get all conversations with unread messages
    const { data: conversationsData, error } = await supabase
      .from('conversations')
      .select(`
        id,
        unread_count,
        last_message_at,
        whatsapp_contact_id,
        whatsapp_contacts!conversations_whatsapp_contact_id_fkey (
          display_name,
          push_name,
          verified_name,
          phone_number
        )
      `)
      .gt('unread_count', 0)
      .order('last_message_at', { ascending: false, nullsFirst: false })

    if (error) {
      console.error('❌ Error fetching notification data:', error)
      throw new Error(`Failed to fetch notification data: ${error.message}`)
    }

    const conversations = conversationsData || []
    
    // Calculate totals
    const total_unread = conversations.reduce((total, conv) => total + (conv.unread_count || 0), 0)
    const conversations_with_unread = conversations.length

    // Get the latest message for the most recent unread conversation
    let latest_message = undefined
    if (conversations.length > 0) {
      const latestConv = conversations[0]
      
      // Get the latest message from this conversation
      const { data: latestMessageData, error: messageError } = await supabase
        .from('messages')
        .select('id, content, created_at')
        .eq('conversation_id', latestConv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

             if (!messageError && latestMessageData) {
         const contact = Array.isArray(latestConv.whatsapp_contacts) 
           ? latestConv.whatsapp_contacts[0] 
           : latestConv.whatsapp_contacts
         
         const contactName = contact?.display_name ||
                            contact?.push_name ||
                            contact?.verified_name ||
                            contact?.phone_number ||
                            'Unknown'

        latest_message = {
          id: latestMessageData.id,
          conversation_id: latestConv.id,
          content: latestMessageData.content,
          contact_name: contactName,
          created_at: latestMessageData.created_at
        }
      }
    }

    return {
      total_unread,
      conversations_with_unread,
      latest_message
    }

  } catch (error) {
    console.error('❌ Error in getNotificationData:', error)
    throw error
  }
}

// =============================================================================
// GET UNREAD CONVERSATIONS - Detailed list for notification dropdown
// =============================================================================

export async function getUnreadConversations(limit: number = 10): Promise<UnreadConversation[]> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        unread_count,
        last_message_at,
        whatsapp_contact_id,
        whatsapp_contacts!conversations_whatsapp_contact_id_fkey (
          display_name,
          push_name,
          verified_name,
          phone_number
        )
      `)
      .gt('unread_count', 0)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .limit(limit)

    if (error) {
      console.error('❌ Error fetching unread conversations:', error)
      throw new Error(`Failed to fetch unread conversations: ${error.message}`)
    }

    // Get the last message for each conversation
    const unreadConversations: UnreadConversation[] = []
    
    for (const conv of data || []) {
      // Get the latest message content
      const { data: latestMessage, error: messageError } = await supabase
        .from('messages')
        .select('content, created_at')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

             const contact = Array.isArray(conv.whatsapp_contacts) 
         ? conv.whatsapp_contacts[0] 
         : conv.whatsapp_contacts
       
       const contactName = contact?.display_name ||
                          contact?.push_name ||
                          contact?.verified_name ||
                          contact?.phone_number ||
                          'Unknown'

      unreadConversations.push({
        conversation_id: conv.id,
        contact_name: contactName,
        unread_count: conv.unread_count || 0,
        last_message: latestMessage?.content || 'No messages',
        last_message_at: conv.last_message_at || new Date().toISOString()
      })
    }

    return unreadConversations

  } catch (error) {
    console.error('❌ Error in getUnreadConversations:', error)
    throw error
  }
}

// =============================================================================
// GET TOTAL UNREAD COUNT - Simple count for notification badge
// =============================================================================

export async function getTotalUnreadCount(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('unread_count')
      .gt('unread_count', 0)

    if (error) {
      console.error('❌ Error fetching total unread count:', error)
      throw new Error(`Failed to fetch unread count: ${error.message}`)
    }

    const totalUnread = (data || []).reduce((total, conv) => total + (conv.unread_count || 0), 0)
    return totalUnread

  } catch (error) {
    console.error('❌ Error in getTotalUnreadCount:', error)
    throw error
  }
}

// =============================================================================
// MARK ALL CONVERSATIONS AS READ
// =============================================================================

export async function markAllConversationsAsRead(): Promise<void> {
  try {
    const { error } = await supabase
      .from('conversations')
      .update({ 
        unread_count: 0,
        updated_at: new Date().toISOString()
      })
      .gt('unread_count', 0)

    if (error) {
      console.error('❌ Error marking all conversations as read:', error)
      throw new Error(`Failed to mark all as read: ${error.message}`)
    }

    console.log('✅ All conversations marked as read')

  } catch (error) {
    console.error('❌ Error in markAllConversationsAsRead:', error)
    throw error
  }
}

// =============================================================================
// MARK SPECIFIC CONVERSATION AS READ
// =============================================================================

export async function markConversationAsRead(conversationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('conversations')
      .update({ 
        unread_count: 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)

    if (error) {
      console.error('❌ Error marking conversation as read:', error)
      throw new Error(`Failed to mark conversation as read: ${error.message}`)
    }

    console.log('✅ Conversation marked as read:', conversationId)

  } catch (error) {
    console.error('❌ Error in markConversationAsRead:', error)
    throw error
  }
}

// =============================================================================
// GET CONVERSATIONS WITH UNREAD COUNT
// =============================================================================

export async function getConversationsWithUnreadCount(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('id')
      .gt('unread_count', 0)

    if (error) {
      console.error('❌ Error fetching conversations with unread count:', error)
      throw new Error(`Failed to fetch conversations count: ${error.message}`)
    }

    return (data || []).length

  } catch (error) {
    console.error('❌ Error in getConversationsWithUnreadCount:', error)
    throw error
  }
}

// =============================================================================
// INCREMENT UNREAD COUNT FOR CONVERSATION
// =============================================================================

export async function incrementUnreadCount(conversationId: string): Promise<void> {
  try {
    // First get current count
    const { data: currentData, error: fetchError } = await supabase
      .from('conversations')
      .select('unread_count')
      .eq('id', conversationId)
      .single()

    if (fetchError) {
      console.error('❌ Error fetching current unread count:', fetchError)
      throw new Error(`Failed to fetch current count: ${fetchError.message}`)
    }

    const newCount = (currentData?.unread_count || 0) + 1
    
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ 
        unread_count: newCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)

    if (updateError) {
      console.error('❌ Error incrementing unread count:', updateError)
      throw new Error(`Failed to increment unread count: ${updateError.message}`)
    }

    console.log('✅ Unread count incremented for conversation:', conversationId, 'New count:', newCount)

  } catch (error) {
    console.error('❌ Error in incrementUnreadCount:', error)
    throw error
  }
}

// =============================================================================
// GET NOTIFICATION SUMMARY - For dashboard widgets
// =============================================================================

export async function getNotificationSummary(): Promise<{
  total_unread_messages: number;
  unread_conversations: number;
  total_conversations: number;
  active_contacts: number;
}> {
  try {
    // Get unread data
    const { data: unreadData, error: unreadError } = await supabase
      .from('conversations')
      .select('unread_count')

    if (unreadError) {
      throw new Error(`Failed to fetch unread data: ${unreadError.message}`)
    }

    // Get total conversations count
    const { count: totalConversations, error: totalError } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })

    if (totalError) {
      throw new Error(`Failed to fetch total conversations: ${totalError.message}`)
    }

    // Get active contacts count
    const { count: activeContacts, error: contactsError } = await supabase
      .from('whatsapp_contacts')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    if (contactsError) {
      throw new Error(`Failed to fetch active contacts: ${contactsError.message}`)
    }

    // Calculate totals
    const total_unread_messages = (unreadData || []).reduce((total, conv) => total + (conv.unread_count || 0), 0)
    const unread_conversations = (unreadData || []).filter(conv => (conv.unread_count || 0) > 0).length

    return {
      total_unread_messages,
      unread_conversations,
      total_conversations: totalConversations || 0,
      active_contacts: activeContacts || 0
    }

  } catch (error) {
    console.error('❌ Error in getNotificationSummary:', error)
    throw error
  }
}

// =============================================================================
// REAL-TIME NOTIFICATION HELPERS
// =============================================================================

export async function handleNewMessageNotification(
  conversationId: string,
  messageContent: string,
  isInbound: boolean = true
): Promise<NotificationData> {
  try {
    // Only increment unread count for inbound messages
    if (isInbound) {
      await incrementUnreadCount(conversationId)
    }

    // Return updated notification data
    return await getNotificationData()

  } catch (error) {
    console.error('❌ Error in handleNewMessageNotification:', error)
    throw error
  }
}

// =============================================================================
// WEBHOOK NOTIFICATION PROCESSING
// =============================================================================

export async function processWebhookNotification(
  conversationId: string,
  messageContent: string,
  fromMe: boolean
): Promise<void> {
  try {
    // Only create notification for incoming messages (not from us)
    if (!fromMe) {
      await incrementUnreadCount(conversationId)
      console.log('✅ Notification processed for new webhook message:', conversationId)
    }

  } catch (error) {
    console.error('❌ Error in processWebhookNotification:', error)
    throw error
  }
} 