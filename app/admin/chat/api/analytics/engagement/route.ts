import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('📈 Fetching engagement data...')

    // Get messages for the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        id,
        created_at,
        direction,
        conversation_id,
        conversations!inner(
          id,
          whatsapp_contact_id,
          status
        )
      `)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('❌ Error fetching messages:', messagesError)
      throw messagesError
    }

    // Get active contacts
    const { data: contacts, error: contactsError } = await supabase
      .from('whatsapp_contacts')
      .select('id, phone_number, display_name, last_seen_at')
      .eq('is_active', true)

    if (contactsError) {
      console.error('❌ Error fetching contacts:', contactsError)
      throw contactsError
    }

    // Process daily engagement
    const dailyEngagement: Record<string, any> = {}
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      dailyEngagement[date] = {
        date,
        totalMessages: 0,
        inboundMessages: 0,
        outboundMessages: 0,
        activeUsers: new Set(),
        responseRate: 0
      }
      return date
    }).reverse()

    messages?.forEach(message => {
      if (!message.created_at) return // Skip messages without created_at
      
      const date = message.created_at.split('T')[0]
      if (dailyEngagement[date]) {
        dailyEngagement[date].totalMessages++
        
        if (message.direction === 'inbound') {
          dailyEngagement[date].inboundMessages++
        } else {
          dailyEngagement[date].outboundMessages++
        }

        // Check if conversations exists and has whatsapp_contact_id
        if (message.direction === 'inbound' && message.conversations && typeof message.conversations === 'object' && 'whatsapp_contact_id' in message.conversations) {
          const conversation = message.conversations as { whatsapp_contact_id?: string }
          if (conversation.whatsapp_contact_id) {
            dailyEngagement[date].activeUsers.add(conversation.whatsapp_contact_id)
          }
        }
      }
    })

    // Calculate response rates and convert sets to numbers
    const engagementChart = last7Days.map(date => {
      const data = dailyEngagement[date]
      const responseRate = data.inboundMessages > 0 
        ? Math.round((data.outboundMessages / data.inboundMessages) * 100)
        : 0
      
      return {
        date,
        name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        totalMessages: data.totalMessages,
        inboundMessages: data.inboundMessages,
        outboundMessages: data.outboundMessages,
        activeUsers: data.activeUsers.size,
        responseRate
      }
    })

    // Calculate hourly engagement for today
    const today = new Date().toISOString().split('T')[0]
    const todayMessages = messages?.filter(m => m.created_at && m.created_at.startsWith(today)) || []
    
    const hourlyEngagement: Record<number, number> = {}
    for (let i = 0; i < 24; i++) {
      hourlyEngagement[i] = 0
    }

    todayMessages.forEach(message => {
      if (!message.created_at) return // Skip messages without created_at
      
      const hour = new Date(message.created_at).getHours()
      hourlyEngagement[hour]++
    })

    const hourlyChart = Object.entries(hourlyEngagement).map(([hour, count]) => ({
      hour: parseInt(hour),
      time: `${hour.padStart(2, '0')}:00`,
      messages: count
    }))

    // Calculate overall metrics
    const totalMessages = messages?.length || 0
    const totalInbound = messages?.filter(m => m.direction === 'inbound').length || 0
    const totalOutbound = messages?.filter(m => m.direction === 'outbound').length || 0
    const totalActiveUsers = new Set(
      messages
        ?.filter(m => m.direction === 'inbound' && m.conversations && typeof m.conversations === 'object' && 'whatsapp_contact_id' in m.conversations)
        ?.map(m => {
          const conversation = m.conversations as { whatsapp_contact_id?: string }
          return conversation.whatsapp_contact_id
        })
        ?.filter(Boolean)
    ).size

    const engagement = {
      daily: engagementChart,
      hourly: hourlyChart,
      summary: {
        totalMessages,
        totalInbound,
        totalOutbound,
        totalActiveUsers,
        avgResponseRate: totalInbound > 0 ? Math.round((totalOutbound / totalInbound) * 100) : 0,
        peakHour: hourlyChart.reduce((max, current) => 
          current.messages > max.messages ? current : max, hourlyChart[0])?.hour || 0
      }
    }

    console.log('✅ Engagement data calculated:', engagement.summary)

    return NextResponse.json({
      success: true,
      data: engagement
    })

  } catch (error) {
    console.error('❌ Error in engagement API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch engagement data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 