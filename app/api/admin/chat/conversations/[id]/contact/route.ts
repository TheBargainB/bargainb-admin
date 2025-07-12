import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface BasicContactInfo {
  conversation_id: string
  contact: {
    id: string
    phone_number: string
    whatsapp_jid: string
    display_name?: string
    push_name?: string
    verified_name?: string
    profile_picture_url?: string
    is_active: boolean
    is_business_account?: boolean
    last_seen_at?: string
    whatsapp_status?: string
    created_at: string
    updated_at?: string
  }
  conversation_context: {
    total_messages: number
    unread_count: number
    last_message_at?: string
    last_message_preview?: string
    conversation_status: string
    ai_enabled: boolean
    created_at: string
  }
  quick_stats: {
    total_conversations_with_contact: number
    avg_response_time_hours: number
    last_activity_hours_ago: number
    engagement_level: 'low' | 'medium' | 'high'
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: conversationId } = params
    
    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 })
    }

    // Get conversation with contact information
    const conversationQuery = await supabaseAdmin
      .from('conversations')
      .select(`
        *,
        whatsapp_contacts!inner(*)
      `)
      .eq('id', conversationId)
      .single()

    if (conversationQuery.error) {
      if (conversationQuery.error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }
      console.error('Error fetching conversation:', conversationQuery.error)
      return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 })
    }

    const conversation = conversationQuery.data
    const contact = conversation.whatsapp_contacts

    // Get all conversations with this contact for quick stats
    const allConversationsQuery = await supabaseAdmin
      .from('conversations')
      .select('id, created_at, total_messages, last_message_at')
      .eq('whatsapp_contact_id', contact.id)

    const allConversations = allConversationsQuery.data || []

    // Get CRM profile for basic stats (optional)
    const crmProfileQuery = await supabaseAdmin
      .from('crm_profiles')
      .select('avg_response_time_hours, engagement_score')
      .eq('whatsapp_contact_id', contact.id)
      .single()

    const crmProfile = crmProfileQuery.data

    // Calculate quick stats
    const totalConversations = allConversations.length
    const avgResponseTime = crmProfile?.avg_response_time_hours || 0
    
    // Calculate hours since last activity
    const lastActivity = conversation.last_message_at || conversation.created_at
    const lastActivityHoursAgo = lastActivity 
      ? Math.floor((Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60))
      : 0

    // Determine engagement level
    const engagementScore = crmProfile?.engagement_score || 0
    const engagementLevel = engagementScore > 70 ? 'high' : 
                           engagementScore > 40 ? 'medium' : 'low'

    // Get last message preview
    const lastMessagePreview = conversation.last_message
      ? conversation.last_message.length > 100 
        ? conversation.last_message.substring(0, 100) + '...'
        : conversation.last_message
      : undefined

    // Build response
    const basicContactInfo: BasicContactInfo = {
      conversation_id: conversationId,
      contact: {
        id: contact.id,
        phone_number: contact.phone_number,
        whatsapp_jid: contact.whatsapp_jid,
        display_name: contact.display_name || undefined,
        push_name: contact.push_name || undefined,
        verified_name: contact.verified_name || undefined,
        profile_picture_url: contact.profile_picture_url || undefined,
        is_active: contact.is_active || false,
        is_business_account: contact.is_business_account || undefined,
        last_seen_at: contact.last_seen_at || undefined,
        whatsapp_status: contact.whatsapp_status || undefined,
        created_at: contact.created_at || new Date().toISOString(),
        updated_at: contact.updated_at || undefined
      },
      conversation_context: {
        total_messages: conversation.total_messages || 0,
        unread_count: conversation.unread_count || 0,
        last_message_at: conversation.last_message_at || undefined,
        last_message_preview: lastMessagePreview,
        conversation_status: conversation.status || 'active',
        ai_enabled: conversation.ai_enabled || false,
        created_at: conversation.created_at || new Date().toISOString()
      },
      quick_stats: {
        total_conversations_with_contact: totalConversations,
        avg_response_time_hours: avgResponseTime,
        last_activity_hours_ago: lastActivityHoursAgo,
        engagement_level: engagementLevel as 'low' | 'medium' | 'high'
      }
    }

    return NextResponse.json(basicContactInfo)
  } catch (error) {
    console.error('Error in basic contact info API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT endpoint for updating basic contact information
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: conversationId } = params
    const updates = await request.json()

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 })
    }

    // Get conversation to find contact
    const conversationQuery = await supabaseAdmin
      .from('conversations')
      .select('whatsapp_contact_id')
      .eq('id', conversationId)
      .single()

    if (conversationQuery.error) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const contactId = conversationQuery.data.whatsapp_contact_id

    // Update contact information
    if (updates.contact) {
      const contactUpdates = {
        display_name: updates.contact.display_name,
        verified_name: updates.contact.verified_name,
        whatsapp_status: updates.contact.whatsapp_status,
        updated_at: new Date().toISOString()
      }

      const { error: contactError } = await supabaseAdmin
        .from('whatsapp_contacts')
        .update(contactUpdates)
        .eq('id', contactId)

      if (contactError) {
        console.error('Error updating contact:', contactError)
        return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 })
      }
    }

    // Update conversation context if provided
    if (updates.conversation_context) {
      const conversationUpdates = {
        status: updates.conversation_context.conversation_status,
        ai_enabled: updates.conversation_context.ai_enabled,
        updated_at: new Date().toISOString()
      }

      const { error: conversationError } = await supabaseAdmin
        .from('conversations')
        .update(conversationUpdates)
        .eq('id', conversationId)

      if (conversationError) {
        console.error('Error updating conversation:', conversationError)
        return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in basic contact info PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 