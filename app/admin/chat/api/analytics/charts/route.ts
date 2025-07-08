import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching chart data...')

    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '7')
    
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    
    // Get messages for the time period
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
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('❌ Error fetching messages:', messagesError)
      throw messagesError
    }

    // Get conversations created in this period
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select('id, created_at, status')
      .gte('created_at', startDate.toISOString())

    if (conversationsError) {
      console.error('❌ Error fetching conversations:', conversationsError)
      throw conversationsError
    }

    // Initialize daily data
    const dailyData: Record<string, any> = {}
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      dailyData[date] = {
        date,
        messages: 0,
        inbound: 0,
        outbound: 0,
        conversations: 0,
        activeUsers: new Set()
      }
    }

    // Process messages
    messages?.forEach(message => {
      if (!message.created_at) return // Skip messages without created_at
      
      const date = message.created_at.split('T')[0]
      if (dailyData[date]) {
        dailyData[date].messages++
        if (message.direction === 'inbound') {
          dailyData[date].inbound++
          // Check if conversations exists and has whatsapp_contact_id
          if (message.conversations && typeof message.conversations === 'object' && 'whatsapp_contact_id' in message.conversations) {
            const conversation = message.conversations as { whatsapp_contact_id?: string }
            if (conversation.whatsapp_contact_id) {
              dailyData[date].activeUsers.add(conversation.whatsapp_contact_id)
            }
          }
        } else {
          dailyData[date].outbound++
        }
      }
    })

    // Process conversations
    conversations?.forEach(conversation => {
      if (!conversation.created_at) return // Skip conversations without created_at
      
      const date = conversation.created_at.split('T')[0]
      if (dailyData[date]) {
        dailyData[date].conversations++
      }
    })

    // Convert to chart format
    const chartData = Object.values(dailyData).map((day: any) => ({
      date: day.date,
      name: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      messages: day.messages,
      inbound: day.inbound,
      outbound: day.outbound,
      conversations: day.conversations,
      activeUsers: day.activeUsers.size
    }))

    // Calculate hourly distribution for today
    const today = new Date().toISOString().split('T')[0]
    const todayMessages = messages?.filter(m => m.created_at && m.created_at.startsWith(today)) || []
    
    const hourlyData: Record<number, number> = {}
    for (let i = 0; i < 24; i++) {
      hourlyData[i] = 0
    }

    todayMessages.forEach(message => {
      if (!message.created_at) return // Skip messages without created_at
      
      const hour = new Date(message.created_at).getHours()
      hourlyData[hour]++
    })

    const hourlyChart = Object.entries(hourlyData).map(([hour, count]) => ({
      hour: parseInt(hour),
      time: `${hour.padStart(2, '0')}:00`,
      messages: count
    }))

    // Calculate message type distribution
    const totalInbound = messages?.filter(m => m.direction === 'inbound').length || 0
    const totalOutbound = messages?.filter(m => m.direction === 'outbound').length || 0
    
    const messageTypes = [
      { name: 'Received', value: totalInbound, color: '#3b82f6' },
      { name: 'Sent', value: totalOutbound, color: '#10b981' }
    ]

    // Calculate response times
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

    const responseTimeChart = responseTimes.length > 0 ? [
      { name: '< 1 min', value: responseTimes.filter(t => t < 1).length },
      { name: '1-5 min', value: responseTimes.filter(t => t >= 1 && t < 5).length },
      { name: '5-15 min', value: responseTimes.filter(t => t >= 5 && t < 15).length },
      { name: '15+ min', value: responseTimes.filter(t => t >= 15).length }
    ] : []

    const charts = {
      daily: chartData,
      hourly: hourlyChart,
      messageTypes,
      responseTimes: responseTimeChart,
      summary: {
        totalMessages: messages?.length || 0,
        avgDailyMessages: Math.round((messages?.length || 0) / days),
        peakHour: hourlyChart.reduce((max, current) => 
          current.messages > max.messages ? current : max, hourlyChart[0])?.hour || 0
      }
    }

    console.log('✅ Chart data calculated:', charts.summary)

    return NextResponse.json({
      success: true,
      data: charts
    })

  } catch (error) {
    console.error('❌ Error in charts API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch chart data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 