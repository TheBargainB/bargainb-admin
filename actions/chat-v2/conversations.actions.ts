import { createClient } from '@/utils/supabase/client'
import type { 
  Conversation, 
  ConversationInsert, 
  ConversationUpdate, 
  ConversationFilters,
  ConversationsResponse,
  ApiResponse
} from '@/types/chat-v2.types'

const supabase = createClient()

// =============================================================================
// FETCH CONVERSATIONS
// =============================================================================

export async function getConversations(
  filters: ConversationFilters = {}
): Promise<ConversationsResponse> {
  try {
    let query = supabase
      .from('conversations')
      .select(`
        *,
        whatsapp_contacts!conversations_whatsapp_contact_id_fkey (
          id,
          phone_number,
          whatsapp_jid,
          display_name,
          push_name,
          verified_name,
          profile_picture_url,
          is_active,
          last_seen_at,
          created_at,
          updated_at,
          crm_profiles (
            id,
            full_name,
            preferred_name,
            email,
            notes,
            tags,
            lifecycle_stage,
            engagement_score,
            total_conversations,
            total_messages
          )
        )
      `)
      .order('last_message_at', { ascending: false, nullsFirst: false })

    // Apply search filter
    if (filters.search) {
      query = query.or(`
        title.ilike.%${filters.search}%,
        whatsapp_contacts.display_name.ilike.%${filters.search}%,
        whatsapp_contacts.push_name.ilike.%${filters.search}%,
        whatsapp_contacts.phone_number.ilike.%${filters.search}%
      `)
    }

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'unread') {
        query = query.gt('unread_count', 0)
      } else {
        query = query.eq('status', filters.status)
      }
    }

    // Apply date range filter
    if (filters.date_range) {
      query = query
        .gte('last_message_at', filters.date_range.start)
        .lte('last_message_at', filters.date_range.end)
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ Error fetching conversations:', error)
      throw new Error(`Failed to fetch conversations: ${error.message}`)
    }

    // Get last messages for each conversation
    const conversationsWithMessages = await Promise.all(
      (data || []).map(async (conv) => {
        // Fetch the latest message for this conversation
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('content')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        return {
          ...conv,
          last_message_content: lastMessage?.content || null
        }
      })
    )

    // Transform data to match our clean types
    const conversations: Conversation[] = conversationsWithMessages.map(conv => ({
      id: conv.id,
      whatsapp_contact_id: conv.whatsapp_contact_id,
      whatsapp_conversation_id: conv.whatsapp_conversation_id,
      title: conv.title || undefined,
      unread_count: conv.unread_count || 0,
      last_message_at: conv.last_message_at || undefined,
      last_message: conv.last_message_content || undefined,
      status: (conv.status as 'active' | 'archived' | 'resolved') || 'active',
      created_at: conv.created_at || new Date().toISOString(),
      updated_at: conv.updated_at || undefined,
      
      // Add contact data with CRM profile
      contact: conv.whatsapp_contacts ? {
        id: conv.whatsapp_contacts.id,
        phone_number: conv.whatsapp_contacts.phone_number,
        whatsapp_jid: conv.whatsapp_contacts.whatsapp_jid,
        display_name: conv.whatsapp_contacts.display_name || undefined,
        push_name: conv.whatsapp_contacts.push_name || undefined,
        verified_name: conv.whatsapp_contacts.verified_name || undefined,
        profile_picture_url: conv.whatsapp_contacts.profile_picture_url || undefined,
        is_active: conv.whatsapp_contacts.is_active || false,
        last_seen_at: conv.whatsapp_contacts.last_seen_at || undefined,
        created_at: conv.whatsapp_contacts.created_at || new Date().toISOString(),
        updated_at: conv.whatsapp_contacts.updated_at || undefined,
        
        // Add CRM profile data
        crm_profile: conv.whatsapp_contacts.crm_profiles ? {
          id: conv.whatsapp_contacts.crm_profiles.id,
          full_name: conv.whatsapp_contacts.crm_profiles.full_name || undefined,
          preferred_name: conv.whatsapp_contacts.crm_profiles.preferred_name || undefined,
          email: conv.whatsapp_contacts.crm_profiles.email || undefined,
          notes: conv.whatsapp_contacts.crm_profiles.notes || undefined,
          tags: conv.whatsapp_contacts.crm_profiles.tags || undefined,
          lifecycle_stage: conv.whatsapp_contacts.crm_profiles.lifecycle_stage || undefined,
          engagement_score: conv.whatsapp_contacts.crm_profiles.engagement_score || undefined,
          total_conversations: conv.whatsapp_contacts.crm_profiles.total_conversations || undefined,
          total_messages: conv.whatsapp_contacts.crm_profiles.total_messages || undefined,
        } : undefined
      } : undefined
    }))

    // Calculate total unread count
    const unread_count = conversations.reduce((total, conv) => total + conv.unread_count, 0)

    return {
      conversations,
      total_count: conversations.length,
      unread_count
    }

  } catch (error) {
    console.error('❌ Error in getConversations:', error)
    throw error
  }
}

// =============================================================================
// GET CONVERSATION BY ID
// =============================================================================

export async function getConversationById(conversationId: string): Promise<Conversation | null> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        whatsapp_contacts!conversations_whatsapp_contact_id_fkey (
          id,
          phone_number,
          whatsapp_jid,
          display_name,
          push_name,
          verified_name,
          profile_picture_url,
          is_active,
          last_seen_at,
          created_at,
          updated_at,
          crm_profiles (
            id,
            full_name,
            preferred_name,
            email,
            notes,
            tags,
            lifecycle_stage,
            engagement_score,
            total_conversations,
            total_messages
          )
        )
      `)
      .eq('id', conversationId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Conversation not found
      }
      console.error('❌ Error fetching conversation:', error)
      throw new Error(`Failed to fetch conversation: ${error.message}`)
    }

    if (!data) return null

    // Fetch the latest message for this conversation
    const { data: lastMessage } = await supabase
      .from('messages')
      .select('content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Transform to clean type
    const conversation: Conversation = {
      id: data.id,
      whatsapp_contact_id: data.whatsapp_contact_id,
      whatsapp_conversation_id: data.whatsapp_conversation_id,
      title: data.title || undefined,
      unread_count: data.unread_count || 0,
      last_message_at: data.last_message_at || undefined,
      last_message: lastMessage?.content || undefined,
      status: (data.status as 'active' | 'archived' | 'resolved') || 'active',
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || undefined,
      
      contact: data.whatsapp_contacts ? {
        id: data.whatsapp_contacts.id,
        phone_number: data.whatsapp_contacts.phone_number,
        whatsapp_jid: data.whatsapp_contacts.whatsapp_jid,
        display_name: data.whatsapp_contacts.display_name || undefined,
        push_name: data.whatsapp_contacts.push_name || undefined,
        verified_name: data.whatsapp_contacts.verified_name || undefined,
        profile_picture_url: data.whatsapp_contacts.profile_picture_url || undefined,
        is_active: data.whatsapp_contacts.is_active || false,
        last_seen_at: data.whatsapp_contacts.last_seen_at || undefined,
        created_at: data.whatsapp_contacts.created_at || new Date().toISOString(),
        updated_at: data.whatsapp_contacts.updated_at || undefined,
        
        // Add CRM profile data
        crm_profile: data.whatsapp_contacts.crm_profiles ? {
          id: data.whatsapp_contacts.crm_profiles.id,
          full_name: data.whatsapp_contacts.crm_profiles.full_name || undefined,
          preferred_name: data.whatsapp_contacts.crm_profiles.preferred_name || undefined,
          email: data.whatsapp_contacts.crm_profiles.email || undefined,
          notes: data.whatsapp_contacts.crm_profiles.notes || undefined,
          tags: data.whatsapp_contacts.crm_profiles.tags || undefined,
          lifecycle_stage: data.whatsapp_contacts.crm_profiles.lifecycle_stage || undefined,
          engagement_score: data.whatsapp_contacts.crm_profiles.engagement_score || undefined,
          total_conversations: data.whatsapp_contacts.crm_profiles.total_conversations || undefined,
          total_messages: data.whatsapp_contacts.crm_profiles.total_messages || undefined,
        } : undefined
      } : undefined
    }

    return conversation

  } catch (error) {
    console.error('❌ Error in getConversationById:', error)
    throw error
  }
}

// =============================================================================
// CREATE CONVERSATION
// =============================================================================

export async function createConversation(
  conversationData: ConversationInsert
): Promise<Conversation> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .insert(conversationData)
      .select(`
        *,
        whatsapp_contacts!conversations_whatsapp_contact_id_fkey (
          id,
          phone_number,
          whatsapp_jid,
          display_name,
          push_name,
          verified_name,
          profile_picture_url,
          is_active,
          last_seen_at,
          created_at,
          updated_at
        )
      `)
      .single()

    if (error) {
      console.error('❌ Error creating conversation:', error)
      throw new Error(`Failed to create conversation: ${error.message}`)
    }

    if (!data) {
      throw new Error('No data returned from conversation creation')
    }

    // Transform to clean type
    const conversation: Conversation = {
      id: data.id,
      whatsapp_contact_id: data.whatsapp_contact_id,
      whatsapp_conversation_id: data.whatsapp_conversation_id,
      title: data.title || undefined,
      unread_count: data.unread_count || 0,
      last_message_at: data.last_message_at || undefined,
      status: (data.status as 'active' | 'archived' | 'resolved') || 'active',
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || undefined,
      
      contact: data.whatsapp_contacts ? {
        id: data.whatsapp_contacts.id,
        phone_number: data.whatsapp_contacts.phone_number,
        whatsapp_jid: data.whatsapp_contacts.whatsapp_jid,
        display_name: data.whatsapp_contacts.display_name || undefined,
        push_name: data.whatsapp_contacts.push_name || undefined,
        verified_name: data.whatsapp_contacts.verified_name || undefined,
        profile_picture_url: data.whatsapp_contacts.profile_picture_url || undefined,
        is_active: data.whatsapp_contacts.is_active || false,
        last_seen_at: data.whatsapp_contacts.last_seen_at || undefined,
        created_at: data.whatsapp_contacts.created_at || new Date().toISOString(),
        updated_at: data.whatsapp_contacts.updated_at || undefined,
      } : undefined
    }

    console.log('✅ Conversation created:', conversation.id)
    return conversation

  } catch (error) {
    console.error('❌ Error in createConversation:', error)
    throw error
  }
}

// =============================================================================
// UPDATE CONVERSATION
// =============================================================================

export async function updateConversation(
  conversationId: string,
  updates: ConversationUpdate
): Promise<Conversation> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .select(`
        *,
        whatsapp_contacts!conversations_whatsapp_contact_id_fkey (
          id,
          phone_number,
          whatsapp_jid,
          display_name,
          push_name,
          verified_name,
          profile_picture_url,
          is_active,
          last_seen_at,
          created_at,
          updated_at
        )
      `)
      .single()

    if (error) {
      console.error('❌ Error updating conversation:', error)
      throw new Error(`Failed to update conversation: ${error.message}`)
    }

    if (!data) {
      throw new Error('Conversation not found')
    }

    // Transform to clean type
    const conversation: Conversation = {
      id: data.id,
      whatsapp_contact_id: data.whatsapp_contact_id,
      whatsapp_conversation_id: data.whatsapp_conversation_id,
      title: data.title || undefined,
      unread_count: data.unread_count || 0,
      last_message_at: data.last_message_at || undefined,
      status: (data.status as 'active' | 'archived' | 'resolved') || 'active',
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || undefined,
      
      contact: data.whatsapp_contacts ? {
        id: data.whatsapp_contacts.id,
        phone_number: data.whatsapp_contacts.phone_number,
        whatsapp_jid: data.whatsapp_contacts.whatsapp_jid,
        display_name: data.whatsapp_contacts.display_name || undefined,
        push_name: data.whatsapp_contacts.push_name || undefined,
        verified_name: data.whatsapp_contacts.verified_name || undefined,
        profile_picture_url: data.whatsapp_contacts.profile_picture_url || undefined,
        is_active: data.whatsapp_contacts.is_active || false,
        last_seen_at: data.whatsapp_contacts.last_seen_at || undefined,
        created_at: data.whatsapp_contacts.created_at || new Date().toISOString(),
        updated_at: data.whatsapp_contacts.updated_at || undefined,
      } : undefined
    }

    console.log('✅ Conversation updated:', conversation.id)
    return conversation

  } catch (error) {
    console.error('❌ Error in updateConversation:', error)
    throw error
  }
}

// =============================================================================
// MARK CONVERSATION AS READ
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
// DELETE CONVERSATION
// =============================================================================

export async function deleteConversation(conversationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)

    if (error) {
      console.error('❌ Error deleting conversation:', error)
      throw new Error(`Failed to delete conversation: ${error.message}`)
    }

    console.log('✅ Conversation deleted:', conversationId)

  } catch (error) {
    console.error('❌ Error in deleteConversation:', error)
    throw error
  }
}

// =============================================================================
// GET CONVERSATION BY WHATSAPP CONVERSATION ID
// =============================================================================

export async function getConversationByWhatsAppId(
  whatsappConversationId: string
): Promise<Conversation | null> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        whatsapp_contacts!conversations_whatsapp_contact_id_fkey (
          id,
          phone_number,
          whatsapp_jid,
          display_name,
          push_name,
          verified_name,
          profile_picture_url,
          is_active,
          last_seen_at,
          created_at,
          updated_at
        )
      `)
      .eq('whatsapp_conversation_id', whatsappConversationId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Conversation not found
      }
      console.error('❌ Error fetching conversation by WhatsApp ID:', error)
      throw new Error(`Failed to fetch conversation: ${error.message}`)
    }

    if (!data) return null

    // Transform to clean type (same as getConversationById)
    const conversation: Conversation = {
      id: data.id,
      whatsapp_contact_id: data.whatsapp_contact_id,
      whatsapp_conversation_id: data.whatsapp_conversation_id,
      title: data.title || undefined,
      unread_count: data.unread_count || 0,
      last_message_at: data.last_message_at || undefined,
      status: (data.status as 'active' | 'archived' | 'resolved') || 'active',
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || undefined,
      
      contact: data.whatsapp_contacts ? {
        id: data.whatsapp_contacts.id,
        phone_number: data.whatsapp_contacts.phone_number,
        whatsapp_jid: data.whatsapp_contacts.whatsapp_jid,
        display_name: data.whatsapp_contacts.display_name || undefined,
        push_name: data.whatsapp_contacts.push_name || undefined,
        verified_name: data.whatsapp_contacts.verified_name || undefined,
        profile_picture_url: data.whatsapp_contacts.profile_picture_url || undefined,
        is_active: data.whatsapp_contacts.is_active || false,
        last_seen_at: data.whatsapp_contacts.last_seen_at || undefined,
        created_at: data.whatsapp_contacts.created_at || new Date().toISOString(),
        updated_at: data.whatsapp_contacts.updated_at || undefined,
      } : undefined
    }

    return conversation

  } catch (error) {
    console.error('❌ Error in getConversationByWhatsAppId:', error)
    throw error
  }
}

// =============================================================================
// GET UNREAD COUNT
// =============================================================================

export async function getTotalUnreadCount(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('unread_count')

    if (error) {
      console.error('❌ Error fetching unread count:', error)
      throw new Error(`Failed to fetch unread count: ${error.message}`)
    }

    const totalUnread = (data || []).reduce((total, conv) => total + (conv.unread_count || 0), 0)
    return totalUnread

  } catch (error) {
    console.error('❌ Error in getTotalUnreadCount:', error)
    throw error
  }
} 