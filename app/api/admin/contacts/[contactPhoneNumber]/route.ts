import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface ContactInfo {
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
    created_at: string
    updated_at?: string
  }
  crm_profile?: {
    id: string
    full_name?: string
    preferred_name?: string
    email?: string
    date_of_birth?: string
    customer_since?: string
    lifecycle_stage?: string
    shopping_persona?: string
    communication_style?: string
    price_sensitivity?: string
    shopping_frequency?: string
    budget_range?: any
    preferred_stores?: string[]
    dietary_restrictions?: string[]
    product_interests?: string[]
    tags?: string[]
    notes?: string
    engagement_score?: number
    total_conversations?: number
    total_messages?: number
    avg_response_time_hours?: number
    complaint_count?: number
    compliment_count?: number
    notification_preferences?: any
    response_time_preference?: string
  }
  conversation_summary: {
    total_conversations: number
    total_messages: number
    unread_messages: number
    last_message_at?: string
    last_message_preview?: string
    ai_interactions_count: number
    avg_response_time_hours: number
  }
  recent_activity: Array<{
    type: 'message' | 'conversation_started' | 'ai_interaction' | 'profile_updated'
    timestamp: string
    description: string
    metadata?: any
  }>
}

export async function GET(
  request: NextRequest,
  { params }: { params: { contactPhoneNumber: string } }
) {
  try {
    const { contactPhoneNumber } = params
    
    if (!contactPhoneNumber) {
      return NextResponse.json({ error: 'Contact phone number is required' }, { status: 400 })
    }

    // Normalize phone number (remove any formatting)
    const normalizedPhone = contactPhoneNumber.replace(/\D/g, '')

    // Get contact information
    const contactQuery = await supabaseAdmin
      .from('whatsapp_contacts')
      .select('*')
      .eq('phone_number', normalizedPhone)
      .single()

    if (contactQuery.error) {
      if (contactQuery.error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
      }
      console.error('Error fetching contact:', contactQuery.error)
      return NextResponse.json({ error: 'Failed to fetch contact' }, { status: 500 })
    }

    const contact = contactQuery.data

    // Get CRM profile
    const crmProfileQuery = await supabaseAdmin
      .from('crm_profiles')
      .select('*')
      .eq('whatsapp_contact_id', contact.id)
      .single()

    const crmProfile = crmProfileQuery.data

    // Get conversation summary
    const conversationsQuery = await supabaseAdmin
      .from('conversations')
      .select(`
        id,
        created_at,
        last_message_at,
        last_message,
        total_messages,
        unread_count
      `)
      .eq('whatsapp_contact_id', contact.id)

    const conversations = conversationsQuery.data || []

    // Get AI interactions count
    const aiInteractionsQuery = await supabaseAdmin
      .from('ai_interactions')
      .select('id', { count: 'exact' })
      .in('conversation_id', conversations.map(c => c.id))

    const aiInteractionsCount = aiInteractionsQuery.count || 0

    // Get recent messages for activity timeline
    const recentMessagesQuery = await supabaseAdmin
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        from_me,
        is_ai_triggered,
        conversation_id
      `)
      .in('conversation_id', conversations.map(c => c.id))
      .order('created_at', { ascending: false })
      .limit(10)

    const recentMessages = recentMessagesQuery.data || []

    // Calculate conversation summary
    const totalConversations = conversations.length
    const totalMessages = conversations.reduce((sum, conv) => sum + (conv.total_messages || 0), 0)
    const unreadMessages = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0)
    const lastMessageAt = conversations.reduce((latest, conv) => {
      if (!latest || (conv.last_message_at && conv.last_message_at > latest)) {
        return conv.last_message_at
      }
      return latest
    }, null as string | null)

    // Get last message preview
    const lastMessagePreview = conversations.find(c => c.last_message_at === lastMessageAt)?.last_message

    // Calculate average response time
    const avgResponseTime = crmProfile?.avg_response_time_hours || 0

    const conversationSummary = {
      total_conversations: totalConversations,
      total_messages: totalMessages,
      unread_messages: unreadMessages,
      last_message_at: lastMessageAt || undefined,
      last_message_preview: lastMessagePreview || undefined,
      ai_interactions_count: aiInteractionsCount,
      avg_response_time_hours: avgResponseTime
    }

    // Build recent activity timeline
    const recentActivity: Array<{
      type: 'message' | 'conversation_started' | 'ai_interaction' | 'profile_updated'
      timestamp: string
      description: string
      metadata?: any
    }> = []

    // Add recent messages to activity
    recentMessages.forEach(msg => {
      const messageType = msg.is_ai_triggered ? 'AI Response' : 
                         msg.from_me ? 'Admin Message' : 'Customer Message'
      
      recentActivity.push({
        type: 'message' as const,
        timestamp: msg.created_at || new Date().toISOString(),
        description: `${messageType}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`,
        metadata: {
          message_id: msg.id,
          conversation_id: msg.conversation_id,
          is_ai_triggered: msg.is_ai_triggered,
          from_me: msg.from_me
        }
      })
    })

    // Add conversation started events
    conversations.forEach(conv => {
      recentActivity.push({
        type: 'conversation_started' as const,
        timestamp: conv.created_at || new Date().toISOString(),
        description: 'New conversation started',
        metadata: {
          conversation_id: conv.id
        }
      })
    })

    // Sort activity by timestamp (most recent first)
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Build response
    const contactInfo: ContactInfo = {
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
        created_at: contact.created_at || new Date().toISOString(),
        updated_at: contact.updated_at || undefined
      },
      crm_profile: crmProfile ? {
        id: crmProfile.id,
        full_name: crmProfile.full_name || undefined,
        preferred_name: crmProfile.preferred_name || undefined,
        email: crmProfile.email || undefined,
        date_of_birth: crmProfile.date_of_birth || undefined,
        customer_since: crmProfile.customer_since || undefined,
        lifecycle_stage: crmProfile.lifecycle_stage || undefined,
        shopping_persona: crmProfile.shopping_persona || undefined,
        communication_style: crmProfile.communication_style || undefined,
        price_sensitivity: crmProfile.price_sensitivity || undefined,
        shopping_frequency: crmProfile.shopping_frequency || undefined,
        budget_range: crmProfile.budget_range || undefined,
        preferred_stores: crmProfile.preferred_stores || undefined,
        dietary_restrictions: crmProfile.dietary_restrictions || undefined,
        product_interests: crmProfile.product_interests || undefined,
        tags: crmProfile.tags || undefined,
        notes: crmProfile.notes || undefined,
        engagement_score: crmProfile.engagement_score || undefined,
        total_conversations: crmProfile.total_conversations || undefined,
        total_messages: crmProfile.total_messages || undefined,
        avg_response_time_hours: crmProfile.avg_response_time_hours || undefined,
        complaint_count: crmProfile.complaint_count || undefined,
        compliment_count: crmProfile.compliment_count || undefined,
        notification_preferences: crmProfile.notification_preferences || undefined,
        response_time_preference: crmProfile.response_time_preference || undefined
      } : undefined,
      conversation_summary: conversationSummary,
      recent_activity: recentActivity.slice(0, 20) // Limit to 20 most recent activities
    }

    return NextResponse.json(contactInfo)
  } catch (error) {
    console.error('Error in contact info API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT endpoint for updating contact information
export async function PUT(
  request: NextRequest,
  { params }: { params: { contactPhoneNumber: string } }
) {
  try {
    const { contactPhoneNumber } = params
    const updates = await request.json()

    if (!contactPhoneNumber) {
      return NextResponse.json({ error: 'Contact phone number is required' }, { status: 400 })
    }

    // Normalize phone number
    const normalizedPhone = contactPhoneNumber.replace(/\D/g, '')

    // Get contact ID
    const contactQuery = await supabaseAdmin
      .from('whatsapp_contacts')
      .select('id')
      .eq('phone_number', normalizedPhone)
      .single()

    if (contactQuery.error) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    const contactId = contactQuery.data.id

    // Update contact info if provided
    if (updates.contact) {
      const { error: contactError } = await supabaseAdmin
        .from('whatsapp_contacts')
        .update({
          display_name: updates.contact.display_name,
          verified_name: updates.contact.verified_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', contactId)

      if (contactError) {
        console.error('Error updating contact:', contactError)
        return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 })
      }
    }

    // Update CRM profile if provided
    if (updates.crm_profile) {
      const { error: crmError } = await supabaseAdmin
        .from('crm_profiles')
        .upsert({
          whatsapp_contact_id: contactId,
          ...updates.crm_profile,
          updated_at: new Date().toISOString()
        })

      if (crmError) {
        console.error('Error updating CRM profile:', crmError)
        return NextResponse.json({ error: 'Failed to update CRM profile' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in contact info PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 