import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface EnhancedContact {
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
    created_at: string
    updated_at?: string
  }
  crm_profile: {
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
  conversation_history: {
    current_conversation: {
      id: string
      created_at: string
      total_messages: number
      unread_count: number
      last_message_at?: string
      last_message?: string
      status: string
      ai_enabled: boolean
      assistant_name?: string
    }
    previous_conversations: Array<{
      id: string
      created_at: string
      total_messages: number
      last_message_at?: string
      status: string
      duration_hours?: number
    }>
    summary: {
      total_conversations: number
      total_messages: number
      avg_messages_per_conversation: number
      avg_conversation_duration_hours: number
      most_active_day: string
      most_active_hour: number
    }
  }
  ai_insights: {
    interaction_summary: {
      total_ai_interactions: number
      successful_interactions: number
      failed_interactions: number
      success_rate: number
      avg_processing_time_ms: number
      last_ai_interaction_at?: string
    }
    conversation_analysis: {
      sentiment_trend: string // 'positive', 'negative', 'neutral', 'mixed'
      topic_categories: string[]
      urgency_level: 'low' | 'medium' | 'high'
      customer_satisfaction_score: number
      response_quality_score: number
    }
    recommendations: Array<{
      type: 'engagement' | 'support' | 'sales' | 'retention'
      priority: 'high' | 'medium' | 'low'
      action: string
      reason: string
    }>
  }
  activity_timeline: Array<{
    timestamp: string
    type: 'message' | 'conversation_started' | 'ai_interaction' | 'profile_updated' | 'call' | 'email'
    description: string
    details?: any
  }>
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

    // Get CRM profile
    const crmProfileQuery = await supabaseAdmin
      .from('crm_profiles')
      .select('*')
      .eq('whatsapp_contact_id', contact.id)
      .single()

    let crmProfile = crmProfileQuery.data

    // Create CRM profile if it doesn't exist
    if (!crmProfile) {
      const { data: newCrmProfile } = await supabaseAdmin
        .from('crm_profiles')
        .insert({
          whatsapp_contact_id: contact.id,
          customer_since: contact.created_at,
          lifecycle_stage: 'new',
          engagement_score: 50,
          created_at: new Date().toISOString()
        })
        .select('*')
        .single()

      crmProfile = newCrmProfile
    }

    // Get conversation history
    const conversationHistoryQuery = await supabaseAdmin
      .from('conversations')
      .select('id, created_at, total_messages, last_message_at, status, updated_at')
      .eq('whatsapp_contact_id', contact.id)
      .order('created_at', { ascending: false })

    const allConversations = conversationHistoryQuery.data || []
    const currentConversation = allConversations.find(c => c.id === conversationId)
    const previousConversations = allConversations.filter(c => c.id !== conversationId)

    // Get AI interactions
    const aiInteractionsQuery = await supabaseAdmin
      .from('ai_interactions')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })

    const aiInteractions = aiInteractionsQuery.data || []

    // Get messages for activity timeline
    const messagesQuery = await supabaseAdmin
      .from('messages')
      .select('id, content, created_at, from_me, is_ai_triggered, message_type')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(50)

    const messages = messagesQuery.data || []

    // Get customer events
    const customerEventsQuery = await supabaseAdmin
      .from('customer_events')
      .select('*')
      .eq('crm_profile_id', crmProfile?.id || '')
      .order('created_at', { ascending: false })
      .limit(20)

    const customerEvents = customerEventsQuery.data || []

    // Build conversation history summary
    const conversationSummary = {
      total_conversations: allConversations.length,
      total_messages: allConversations.reduce((sum, conv) => sum + (conv.total_messages || 0), 0),
      avg_messages_per_conversation: allConversations.length > 0 
        ? allConversations.reduce((sum, conv) => sum + (conv.total_messages || 0), 0) / allConversations.length 
        : 0,
      avg_conversation_duration_hours: calculateAvgDuration(allConversations),
      most_active_day: findMostActiveDay(allConversations),
      most_active_hour: findMostActiveHour(messages)
    }

    // Build AI insights
    const aiInsights = {
      interaction_summary: {
        total_ai_interactions: aiInteractions.length,
        successful_interactions: aiInteractions.filter(ai => ai.success).length,
        failed_interactions: aiInteractions.filter(ai => !ai.success).length,
        success_rate: aiInteractions.length > 0 
          ? (aiInteractions.filter(ai => ai.success).length / aiInteractions.length) * 100 
          : 0,
        avg_processing_time_ms: aiInteractions.length > 0 
          ? aiInteractions.reduce((sum, ai) => sum + (ai.processing_time_ms || 0), 0) / aiInteractions.length 
          : 0,
        last_ai_interaction_at: aiInteractions[0]?.created_at || undefined
      },
      conversation_analysis: analyzeConversation(messages, aiInteractions),
             recommendations: generateRecommendations(crmProfile || {}, aiInteractions, messages)
    }

    // Build activity timeline
    const activityTimeline = buildActivityTimeline(messages, customerEvents, aiInteractions)

    // Build enhanced contact response
    const enhancedContact: EnhancedContact = {
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
        created_at: contact.created_at || new Date().toISOString(),
        updated_at: contact.updated_at || undefined
      },
             crm_profile: {
         id: crmProfile?.id || '',
         full_name: crmProfile?.full_name || undefined,
         preferred_name: crmProfile?.preferred_name || undefined,
         email: crmProfile?.email || undefined,
         date_of_birth: crmProfile?.date_of_birth || undefined,
         customer_since: crmProfile?.customer_since || undefined,
         lifecycle_stage: crmProfile?.lifecycle_stage || undefined,
         shopping_persona: crmProfile?.shopping_persona || undefined,
         communication_style: crmProfile?.communication_style || undefined,
         price_sensitivity: crmProfile?.price_sensitivity || undefined,
         shopping_frequency: crmProfile?.shopping_frequency || undefined,
         budget_range: crmProfile?.budget_range || undefined,
         preferred_stores: crmProfile?.preferred_stores || undefined,
         dietary_restrictions: crmProfile?.dietary_restrictions || undefined,
         product_interests: crmProfile?.product_interests || undefined,
         tags: crmProfile?.tags || undefined,
         notes: crmProfile?.notes || undefined,
         engagement_score: crmProfile?.engagement_score || undefined,
         total_conversations: crmProfile?.total_conversations || undefined,
         total_messages: crmProfile?.total_messages || undefined,
         avg_response_time_hours: crmProfile?.avg_response_time_hours || undefined,
         complaint_count: crmProfile?.complaint_count || undefined,
         compliment_count: crmProfile?.compliment_count || undefined,
         notification_preferences: crmProfile?.notification_preferences || undefined,
         response_time_preference: crmProfile?.response_time_preference || undefined
       },
      conversation_history: {
        current_conversation: {
          id: currentConversation?.id || conversationId,
          created_at: currentConversation?.created_at || new Date().toISOString(),
          total_messages: currentConversation?.total_messages || 0,
          unread_count: conversation.unread_count || 0,
          last_message_at: currentConversation?.last_message_at || undefined,
          last_message: conversation.last_message || undefined,
          status: currentConversation?.status || 'active',
          ai_enabled: conversation.ai_enabled || false,
          assistant_name: conversation.assistant_name || undefined
        },
        previous_conversations: previousConversations.map(conv => ({
          id: conv.id,
          created_at: conv.created_at || new Date().toISOString(),
          total_messages: conv.total_messages || 0,
          last_message_at: conv.last_message_at || undefined,
          status: conv.status || 'active',
          duration_hours: conv.updated_at && conv.created_at 
            ? (new Date(conv.updated_at).getTime() - new Date(conv.created_at).getTime()) / (1000 * 60 * 60)
            : undefined
        })),
        summary: conversationSummary
      },
      ai_insights: aiInsights,
      activity_timeline: activityTimeline
    }

    return NextResponse.json(enhancedContact)
  } catch (error) {
    console.error('Error in enhanced contact API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper functions
function calculateAvgDuration(conversations: any[]): number {
  if (conversations.length === 0) return 0
  
  const durations = conversations
    .filter(conv => conv.updated_at && conv.created_at)
    .map(conv => (new Date(conv.updated_at).getTime() - new Date(conv.created_at).getTime()) / (1000 * 60 * 60))
  
  return durations.length > 0 ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length : 0
}

function findMostActiveDay(conversations: any[]): string {
  const dayMap = new Map<string, number>()
  
  conversations.forEach(conv => {
    const day = new Date(conv.created_at).toLocaleDateString('en-US', { weekday: 'long' })
    dayMap.set(day, (dayMap.get(day) || 0) + 1)
  })
  
  return Array.from(dayMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Monday'
}

function findMostActiveHour(messages: any[]): number {
  const hourMap = new Map<number, number>()
  
  messages.forEach(msg => {
    const hour = new Date(msg.created_at).getHours()
    hourMap.set(hour, (hourMap.get(hour) || 0) + 1)
  })
  
  return Array.from(hourMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 12
}

function analyzeConversation(messages: any[], aiInteractions: any[]) {
  // Analyze sentiment (simplified)
  const customerMessages = messages.filter(msg => !msg.from_me && !msg.is_ai_triggered)
  const sentimentKeywords = {
    positive: ['good', 'great', 'excellent', 'perfect', 'amazing', 'love', 'happy', 'satisfied'],
    negative: ['bad', 'terrible', 'awful', 'hate', 'angry', 'disappointed', 'frustrated', 'problem']
  }
  
  let positiveCount = 0
  let negativeCount = 0
  
  customerMessages.forEach(msg => {
    const content = msg.content.toLowerCase()
    positiveCount += sentimentKeywords.positive.filter(word => content.includes(word)).length
    negativeCount += sentimentKeywords.negative.filter(word => content.includes(word)).length
  })
  
  const sentiment_trend = positiveCount > negativeCount ? 'positive' : 
                         negativeCount > positiveCount ? 'negative' : 'neutral'
  
  // Analyze topics (simplified)
  const topicKeywords = {
    'product_inquiry': ['product', 'item', 'price', 'cost', 'buy', 'purchase'],
    'support': ['help', 'support', 'issue', 'problem', 'fix'],
    'order': ['order', 'delivery', 'shipping', 'track'],
    'general': ['hello', 'hi', 'thanks', 'thank you']
  }
  
  const topicCounts = new Map<string, number>()
  customerMessages.forEach(msg => {
    const content = msg.content.toLowerCase()
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => content.includes(keyword))) {
        topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1)
      }
    })
  })
  
  const topic_categories = Array.from(topicCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([topic]) => topic)
  
  // Determine urgency
  const urgentKeywords = ['urgent', 'emergency', 'asap', 'immediately', 'help']
  const hasUrgentKeywords = customerMessages.some(msg => 
    urgentKeywords.some(keyword => msg.content.toLowerCase().includes(keyword))
  )
  
  const urgency_level = hasUrgentKeywords ? 'high' : 
                       negativeCount > 2 ? 'medium' : 'low'
  
  // Calculate scores
  const customer_satisfaction_score = Math.max(0, Math.min(100, 70 + (positiveCount - negativeCount) * 10))
  const response_quality_score = aiInteractions.length > 0 
    ? (aiInteractions.filter(ai => ai.success).length / aiInteractions.length) * 100 
    : 0
  
  return {
    sentiment_trend,
    topic_categories,
    urgency_level,
    customer_satisfaction_score,
    response_quality_score
  }
}

function generateRecommendations(crmProfile: any, aiInteractions: any[], messages: any[]) {
  const recommendations = []
  
  // Engagement recommendations
  if ((crmProfile.engagement_score || 0) < 50) {
    recommendations.push({
      type: 'engagement' as const,
      priority: 'high' as const,
      action: 'Increase customer engagement',
      reason: 'Low engagement score indicates customer may need more attention'
    })
  }
  
  // Support recommendations
  const failedAiInteractions = aiInteractions.filter(ai => !ai.success).length
  if (failedAiInteractions > 2) {
    recommendations.push({
      type: 'support' as const,
      priority: 'medium' as const,
      action: 'Review AI responses and provide human support',
      reason: 'Multiple failed AI interactions suggest customer needs human assistance'
    })
  }
  
  // Retention recommendations
  const lastMessageTime = messages[0]?.created_at
  if (lastMessageTime) {
    const hoursSinceLastMessage = (Date.now() - new Date(lastMessageTime).getTime()) / (1000 * 60 * 60)
    if (hoursSinceLastMessage > 72) {
      recommendations.push({
        type: 'retention' as const,
        priority: 'medium' as const,
        action: 'Follow up with customer',
        reason: 'Customer has been inactive for over 72 hours'
      })
    }
  }
  
  return recommendations
}

function buildActivityTimeline(messages: any[], customerEvents: any[], aiInteractions: any[]) {
  const timeline = []
  
  // Add messages
  messages.forEach(msg => {
    const messageType = msg.is_ai_triggered ? 'AI Response' : 
                       msg.from_me ? 'Admin Message' : 'Customer Message'
    
    timeline.push({
      timestamp: msg.created_at || new Date().toISOString(),
      type: 'message' as const,
      description: `${messageType}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`,
      details: {
        message_id: msg.id,
        message_type: msg.message_type,
        from_me: msg.from_me,
        is_ai_triggered: msg.is_ai_triggered
      }
    })
  })
  
  // Add AI interactions
  aiInteractions.forEach(ai => {
    timeline.push({
      timestamp: ai.created_at || new Date().toISOString(),
      type: 'ai_interaction' as const,
      description: `AI ${ai.success ? 'successfully processed' : 'failed to process'} request`,
      details: {
        interaction_id: ai.id,
        success: ai.success,
        processing_time_ms: ai.processing_time_ms,
        tokens_used: ai.tokens_used
      }
    })
  })
  
  // Add customer events
  customerEvents.forEach(event => {
    timeline.push({
      timestamp: event.created_at || new Date().toISOString(),
      type: event.event_type as any,
      description: event.event_description || `${event.event_type} event`,
      details: event.event_data
    })
  })
  
  // Sort by timestamp (most recent first)
  return timeline
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 50) // Limit to 50 most recent activities
} 