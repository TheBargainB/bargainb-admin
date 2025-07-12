import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface ChartData {
  conversationsTrend: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      borderColor: string
      backgroundColor: string
    }>
  }
  messagingVolume: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      borderColor: string
      backgroundColor: string
    }>
  }
  aiInteractions: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      borderColor: string
      backgroundColor: string
    }>
  }
  contactGrowth: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      borderColor: string
      backgroundColor: string
    }>
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const days = parseInt(searchParams.get('days') || '30')
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get conversation trends
    const conversationsTrendQuery = await supabaseAdmin
      .from('conversations')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    // Get messaging volume
    const messagingVolumeQuery = await supabaseAdmin
      .from('messages')
      .select('created_at, from_me, is_ai_triggered')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    // Get AI interactions
    const aiInteractionsQuery = await supabaseAdmin
      .from('ai_interactions')
      .select('created_at, success')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    // Get contact growth
    const contactGrowthQuery = await supabaseAdmin
      .from('whatsapp_contacts')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    const [conversationsData, messagesData, aiData, contactsData] = await Promise.all([
      conversationsTrendQuery,
      messagingVolumeQuery,
      aiInteractionsQuery,
      contactGrowthQuery
    ])

    // Process data for charts
    const chartData: ChartData = {
      conversationsTrend: processConversationsTrend(conversationsData.data || []),
      messagingVolume: processMessagingVolume(messagesData.data || []),
      aiInteractions: processAiInteractions(aiData.data || []),
      contactGrowth: processContactGrowth(contactsData.data || [])
    }

    return NextResponse.json(chartData)
  } catch (error) {
    console.error('Error fetching charts data:', error)
    return NextResponse.json({ error: 'Failed to fetch charts data' }, { status: 500 })
  }
}

function processConversationsTrend(data: Array<{ created_at: string | null }>) {
  const validData = data.filter(d => d.created_at) as Array<{ created_at: string }>
  const dailyData = groupByDay(validData, 'created_at')
  const labels = Object.keys(dailyData).sort()
  const values = labels.map(date => dailyData[date].length)

  return {
    labels,
    datasets: [{
      label: 'New Conversations',
      data: values,
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)'
    }]
  }
}

function processMessagingVolume(data: Array<{ created_at: string | null, from_me: boolean, is_ai_triggered: boolean | null }>) {
  const validData = data.filter(d => d.created_at) as Array<{ created_at: string, from_me: boolean, is_ai_triggered: boolean | null }>
  const dailyData = groupByDay(validData, 'created_at')
  const labels = Object.keys(dailyData).sort()
  
  const customerMessages = labels.map(date => 
    dailyData[date].filter(msg => !msg.from_me && !msg.is_ai_triggered).length
  )
  const aiMessages = labels.map(date => 
    dailyData[date].filter(msg => msg.is_ai_triggered).length
  )
  const adminMessages = labels.map(date => 
    dailyData[date].filter(msg => msg.from_me && !msg.is_ai_triggered).length
  )

  return {
    labels,
    datasets: [
      {
        label: 'Customer Messages',
        data: customerMessages,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)'
      },
      {
        label: 'AI Messages',
        data: aiMessages,
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)'
      },
      {
        label: 'Admin Messages',
        data: adminMessages,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)'
      }
    ]
  }
}

function processAiInteractions(data: Array<{ created_at: string | null, success: boolean | null }>) {
  const validData = data.filter(d => d.created_at) as Array<{ created_at: string, success: boolean | null }>
  const dailyData = groupByDay(validData, 'created_at')
  const labels = Object.keys(dailyData).sort()
  
  const successful = labels.map(date => 
    dailyData[date].filter(interaction => interaction.success).length
  )
  const failed = labels.map(date => 
    dailyData[date].filter(interaction => !interaction.success).length
  )

  return {
    labels,
    datasets: [
      {
        label: 'Successful AI Interactions',
        data: successful,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)'
      },
      {
        label: 'Failed AI Interactions',
        data: failed,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)'
      }
    ]
  }
}

function processContactGrowth(data: Array<{ created_at: string | null }>) {
  const validData = data.filter(d => d.created_at) as Array<{ created_at: string }>
  const dailyData = groupByDay(validData, 'created_at')
  const labels = Object.keys(dailyData).sort()
  
  let cumulative = 0
  const values = labels.map(date => {
    cumulative += dailyData[date].length
    return cumulative
  })

  return {
    labels,
    datasets: [{
      label: 'Total Contacts',
      data: values,
      borderColor: 'rgb(99, 102, 241)',
      backgroundColor: 'rgba(99, 102, 241, 0.1)'
    }]
  }
}

function groupByDay<T extends { created_at: string }>(data: Array<T>, dateField: string) {
  return data.reduce((acc, item) => {
    const date = new Date(item[dateField as keyof T] as string).toISOString().split('T')[0]
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(item)
    return acc
  }, {} as Record<string, T[]>)
} 