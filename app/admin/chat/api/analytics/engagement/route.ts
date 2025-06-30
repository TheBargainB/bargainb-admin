import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('📈 Fetching engagement analytics...')

    // Get messages with conversation data for the last 7 days
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    
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
      .gte('created_at', last7Days.toISOString())
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('❌ Error fetching messages:', messagesError)
      throw messagesError
    }

    // Get active contacts
    const { data: contacts, error: contactsError } = await supabase
      .from('whatsapp_contacts')
      .select('id, created_at, last_seen_at')

    if (contactsError) {
      console.error('❌ Error fetching contacts:', contactsError)
      throw contactsError
    }

    // Calculate daily message counts
    const dailyMessages: Record<string, number> = {}
    const dailyInbound: Record<string, number> = {}
    const dailyOutbound: Record<string, number> = {}
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      dailyMessages[date] = 0
      dailyInbound[date] = 0
      dailyOutbound[date] = 0
    }

    messages?.forEach(message => {
      const date = message.created_at.split('T')[0]
      if (dailyMessages[date] !== undefined) {
        dailyMessages[date]++
        if (message.direction === 'inbound') {
          dailyInbound[date]++
        } else {
          dailyOutbound[date]++
        }
      }
    })

    // Calculate active users (users who sent messages in last 7 days)
    const activeUsers = new Set()
    messages?.forEach(message => {
      if (message.direction === 'inbound' && message.conversations?.whatsapp_contact_id) {
        activeUsers.add(message.conversations.whatsapp_contact_id)
      }
    })

    // Calculate response rate (% of inbound messages that got a response)
    const inboundCount = messages?.filter(m => m.direction === 'inbound').length || 0
    const outboundCount = messages?.filter(m => m.direction === 'outbound').length || 0
    const responseRate = inboundCount > 0 ? Math.round((outboundCount / inboundCount) * 100) : 100

    // Calculate peak hours (hour of day with most messages)
    const hourlyActivity: Record<number, number> = {}
    for (let i = 0; i < 24; i++) {
      hourlyActivity[i] = 0
    }

    messages?.forEach(message => {
      const hour = new Date(message.created_at).getHours()
      hourlyActivity[hour]++
    })

    const peakHour = Object.entries(hourlyActivity).reduce((a, b) => 
      hourlyActivity[parseInt(a[0])] > hourlyActivity[parseInt(b[0])] ? a : b
    )[0]

    const engagement = {
      totalMessages7Days: messages?.length || 0,
      inboundMessages7Days: inboundCount,
      outboundMessages7Days: outboundCount,
      activeUsers: activeUsers.size,
      responseRate,
      peakHour: parseInt(peakHour),
      dailyMessages: Object.entries(dailyMessages).map(([date, count]) => ({
        date,
        total: count,
        inbound: dailyInbound[date],
        outbound: dailyOutbound[date]
      })),
      hourlyActivity: Object.entries(hourlyActivity).map(([hour, count]) => ({
        hour: parseInt(hour),
        count
      }))
    }

    console.log('✅ Engagement analytics calculated:', engagement)

    return NextResponse.json({
      success: true,
      data: engagement
    })

  } catch (error) {
    console.error('❌ Error in engagement analytics API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch engagement analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 