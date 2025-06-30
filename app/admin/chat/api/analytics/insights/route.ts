import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching analytics insights...')

    // Get total conversations
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select('id, created_at, status, updated_at')
      .eq('status', 'active')

    if (conversationsError) {
      console.error('❌ Error fetching conversations:', conversationsError)
      throw conversationsError
    }

    // Get total messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('id, created_at, direction, conversation_id')

    if (messagesError) {
      console.error('❌ Error fetching messages:', messagesError)
      throw messagesError
    }

    // Get total WhatsApp contacts
    const { data: contacts, error: contactsError } = await supabase
      .from('whatsapp_contacts')
      .select('id, created_at')

    if (contactsError) {
      console.error('❌ Error fetching contacts:', contactsError)
      throw contactsError
    }

    // Calculate metrics
    const totalConversations = conversations?.length || 0
    const totalMessages = messages?.length || 0
    const totalContacts = contacts?.length || 0

    // Calculate messages in last 24h
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentMessages = messages?.filter(msg => 
      new Date(msg.created_at) > last24h
    ) || []

    // Calculate average response time (simplified - time between user and admin messages)
    let totalResponseTime = 0
    let responseCount = 0
    
    if (messages && messages.length > 1) {
      for (let i = 1; i < messages.length; i++) {
        const current = messages[i]
        const previous = messages[i - 1]
        
        // If previous was from user and current is from admin/AI
        if (previous.direction === 'inbound' && current.direction === 'outbound') {
          const responseTime = new Date(current.created_at).getTime() - new Date(previous.created_at).getTime()
          totalResponseTime += responseTime
          responseCount++
        }
      }
    }

    const avgResponseTimeMs = responseCount > 0 ? totalResponseTime / responseCount : 0
    const avgResponseTimeSeconds = Math.round(avgResponseTimeMs / 1000)

    // Calculate success rate (conversations without escalation)
    const resolvedConversations = conversations?.filter(conv => 
      conv.status === 'active' || conv.status === 'resolved'
    ) || []
    const successRate = totalConversations > 0 
      ? Math.round((resolvedConversations.length / totalConversations) * 100)
      : 100

    const insights = {
      totalConversations,
      totalMessages,
      totalContacts,
      recentMessages: recentMessages.length,
      avgResponseTime: avgResponseTimeSeconds > 0 ? `${avgResponseTimeSeconds}s` : '< 1s',
      avgResponseTimeMs,
      successRate,
      activeConversations: totalConversations,
      messagesLast24h: recentMessages.length
    }

    console.log('✅ Analytics insights calculated:', insights)

    return NextResponse.json({
      success: true,
      data: insights
    })

  } catch (error) {
    console.error('❌ Error in analytics insights API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch analytics insights',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 