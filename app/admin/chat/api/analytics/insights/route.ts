import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('💡 Fetching insights data...')

    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    // Get conversations
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select('id, created_at, status, total_messages, unread_count')
      .gte('created_at', last7d.toISOString())

    if (conversationsError) {
      console.error('❌ Error fetching conversations:', conversationsError)
      throw conversationsError
    }

    // Get messages  
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('id, created_at, direction, conversation_id')
      .gte('created_at', last7d.toISOString())
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('❌ Error fetching messages:', messagesError)
      throw messagesError
    }

    // Get active contacts
    const { data: contacts, error: contactsError } = await supabase
      .from('whatsapp_contacts')
      .select('id, created_at, last_seen_at')
      .eq('is_active', true)

    if (contactsError) {
      console.error('❌ Error fetching contacts:', contactsError)
      throw contactsError
    }

    // Calculate insights
    const totalConversations = conversations?.length || 0
    const activeConversations = conversations?.filter(c => c.status === 'active').length || 0
    
    // Messages in last 24h
    const messages24h = messages?.filter(msg => 
      msg.created_at && new Date(msg.created_at) > last24h
    ) || []

    const totalMessages24h = messages24h.length
    const inboundMessages24h = messages24h.filter(m => m.direction === 'inbound').length
    const outboundMessages24h = messages24h.filter(m => m.direction === 'outbound').length

    // Calculate response times (time between inbound and next outbound message)
    const responseTimes: number[] = []
    if (messages && messages.length > 1) {
      for (let i = 1; i < messages.length; i++) {
        const current = messages[i]
        const previous = messages[i - 1]
        
        // Skip if either message doesn't have created_at
        if (!current.created_at || !previous.created_at) continue
        
        if (previous.direction === 'inbound' && current.direction === 'outbound') {
          const responseTime = new Date(current.created_at).getTime() - new Date(previous.created_at).getTime()
          responseTimes.push(Math.round(responseTime / (1000 * 60))) // Convert to minutes
        }
      }
    }

    const avgResponseTime = responseTimes.length > 0 
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0

    // Peak hours analysis
    const hourlyActivity: Record<number, number> = {}
    for (let i = 0; i < 24; i++) {
      hourlyActivity[i] = 0
    }

    messages?.forEach(message => {
      if (!message.created_at) return // Skip messages without created_at
      
      const hour = new Date(message.created_at).getHours()
      hourlyActivity[hour]++
    })

    const peakHour = Object.entries(hourlyActivity).reduce((a, b) => 
      hourlyActivity[parseInt(a[0])] > hourlyActivity[parseInt(b[0])] ? a : b
    )[0]

    // Conversation trends
    const conversationsByDay: Record<string, number> = {}
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      conversationsByDay[date] = 0
      return date
    })

    conversations?.forEach(conv => {
      if (!conv.created_at) return // Skip conversations without created_at
      
      const date = conv.created_at.split('T')[0]
      if (conversationsByDay[date] !== undefined) {
        conversationsByDay[date]++
      }
    })

    const insights = {
      overview: {
        totalConversations,
        activeConversations,
        totalMessages24h,
        inboundMessages24h,
        outboundMessages24h,
        avgResponseTime,
        peakHour: parseInt(peakHour)
      },
      trends: {
        conversationsByDay: last7Days.map(date => ({
          date,
          conversations: conversationsByDay[date]
        })),
        hourlyActivity: Object.entries(hourlyActivity).map(([hour, count]) => ({
          hour: parseInt(hour),
          messages: count
        }))
      },
      responseAnalysis: {
        avgResponseTime,
        responseTimes: responseTimes.slice(0, 100), // Limit to 100 for chart
        responseDistribution: [
          { range: '< 1 min', count: responseTimes.filter(t => t < 1).length },
          { range: '1-5 min', count: responseTimes.filter(t => t >= 1 && t < 5).length },
          { range: '5-15 min', count: responseTimes.filter(t => t >= 5 && t < 15).length },
          { range: '15+ min', count: responseTimes.filter(t => t >= 15).length }
        ]
      }
    }

    console.log('✅ Insights data calculated:', insights.overview)

    return NextResponse.json({
      success: true,
      data: insights
    })

  } catch (error) {
    console.error('❌ Error in insights API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch insights data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 