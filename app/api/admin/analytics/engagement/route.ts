import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface EngagementMetrics {
  responseTime: {
    avgResponseTimeHours: number
    medianResponseTimeHours: number
    responseTimeDistribution: {
      immediate: number // < 1 hour
      quick: number // 1-4 hours
      moderate: number // 4-24 hours
      slow: number // > 24 hours
    }
  }
  conversationQuality: {
    avgConversationLength: number
    avgEngagementScore: number
    completionRate: number
    resolutionRate: number
  }
  userActivity: {
    activeUsers: number
    totalMessages: number
    avgMessagesPerUser: number
    peakHours: Array<{
      hour: number
      messageCount: number
    }>
  }
  aiPerformance: {
    totalAiInteractions: number
    successRate: number
    avgProcessingTime: number
    userSatisfactionScore: number
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const days = parseInt(searchParams.get('days') || '30')
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get conversations with response time data
    const conversationsQuery = await supabaseAdmin
      .from('conversations')
      .select(`
        id,
        created_at,
        total_messages,
        status,
        whatsapp_contact_id,
        crm_profiles!inner(
          avg_response_time_hours,
          engagement_score,
          total_conversations,
          total_messages
        )
      `)
      .gte('created_at', startDate.toISOString())

    // Get messages for activity analysis
    const messagesQuery = await supabaseAdmin
      .from('messages')
      .select('created_at, from_me, conversation_id, is_ai_triggered')
      .gte('created_at', startDate.toISOString())

    // Get AI interactions for performance metrics
    const aiInteractionsQuery = await supabaseAdmin
      .from('ai_interactions')
      .select('processing_time_ms, success, created_at')
      .gte('created_at', startDate.toISOString())

    // Get active contacts
    const activeContactsQuery = await supabaseAdmin
      .from('whatsapp_contacts')
      .select('id, last_seen_at')
      .gte('last_seen_at', startDate.toISOString())

    const [conversationsData, messagesData, aiData, contactsData] = await Promise.all([
      conversationsQuery,
      messagesQuery,
      aiInteractionsQuery,
      activeContactsQuery
    ])

    const conversations = conversationsData.data || []
    const messages = messagesData.data || []
    const aiInteractions = aiData.data || []
    const activeContacts = contactsData.data || []

    // Process engagement metrics
    const engagementMetrics: EngagementMetrics = {
      responseTime: calculateResponseTimeMetrics(conversations),
      conversationQuality: calculateConversationQuality(conversations),
      userActivity: calculateUserActivity(messages, activeContacts),
      aiPerformance: calculateAiPerformance(aiInteractions)
    }

    return NextResponse.json(engagementMetrics)
  } catch (error) {
    console.error('Error fetching engagement metrics:', error)
    return NextResponse.json({ error: 'Failed to fetch engagement metrics' }, { status: 500 })
  }
}

function calculateResponseTimeMetrics(conversations: any[]) {
  const responseTimes = conversations
    .map(conv => conv.crm_profiles?.avg_response_time_hours)
    .filter(time => time !== null && time !== undefined)

  if (responseTimes.length === 0) {
    return {
      avgResponseTimeHours: 0,
      medianResponseTimeHours: 0,
      responseTimeDistribution: {
        immediate: 0,
        quick: 0,
        moderate: 0,
        slow: 0
      }
    }
  }

  const avg = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
  const sorted = responseTimes.sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]

  const distribution = {
    immediate: responseTimes.filter(t => t < 1).length,
    quick: responseTimes.filter(t => t >= 1 && t < 4).length,
    moderate: responseTimes.filter(t => t >= 4 && t < 24).length,
    slow: responseTimes.filter(t => t >= 24).length
  }

  return {
    avgResponseTimeHours: Math.round(avg * 100) / 100,
    medianResponseTimeHours: Math.round(median * 100) / 100,
    responseTimeDistribution: distribution
  }
}

function calculateConversationQuality(conversations: any[]) {
  const validConversations = conversations.filter(conv => conv.total_messages > 0)
  
  if (validConversations.length === 0) {
    return {
      avgConversationLength: 0,
      avgEngagementScore: 0,
      completionRate: 0,
      resolutionRate: 0
    }
  }

  const avgLength = validConversations.reduce((sum, conv) => sum + (conv.total_messages || 0), 0) / validConversations.length
  
  const engagementScores = validConversations
    .map(conv => conv.crm_profiles?.engagement_score)
    .filter(score => score !== null && score !== undefined)
  
  const avgEngagement = engagementScores.length > 0 
    ? engagementScores.reduce((sum, score) => sum + score, 0) / engagementScores.length 
    : 0

  const resolvedConversations = validConversations.filter(conv => conv.status === 'resolved').length
  const completedConversations = validConversations.filter(conv => conv.total_messages >= 5).length

  return {
    avgConversationLength: Math.round(avgLength * 100) / 100,
    avgEngagementScore: Math.round(avgEngagement * 100) / 100,
    completionRate: Math.round((completedConversations / validConversations.length) * 100),
    resolutionRate: Math.round((resolvedConversations / validConversations.length) * 100)
  }
}

function calculateUserActivity(messages: any[], activeContacts: any[]) {
  const userMessages = messages.filter(msg => !msg.from_me && !msg.is_ai_triggered)
  const uniqueConversations = new Set(userMessages.map(msg => msg.conversation_id))
  const totalMessages = userMessages.length
  const avgMessagesPerUser = uniqueConversations.size > 0 ? totalMessages / uniqueConversations.size : 0

  // Calculate peak hours
  const hourlyMessages = userMessages.reduce((acc, msg) => {
    const hour = new Date(msg.created_at).getHours()
    acc[hour] = (acc[hour] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  const peakHours = Object.entries(hourlyMessages)
    .map(([hour, count]) => ({ hour: parseInt(hour), messageCount: count as number }))
    .sort((a, b) => b.messageCount - a.messageCount)
    .slice(0, 6)

  return {
    activeUsers: activeContacts.length,
    totalMessages,
    avgMessagesPerUser: Math.round(avgMessagesPerUser * 100) / 100,
    peakHours
  }
}

function calculateAiPerformance(aiInteractions: any[]) {
  if (aiInteractions.length === 0) {
    return {
      totalAiInteractions: 0,
      successRate: 0,
      avgProcessingTime: 0,
      userSatisfactionScore: 0
    }
  }

  const successfulInteractions = aiInteractions.filter(interaction => interaction.success).length
  const successRate = (successfulInteractions / aiInteractions.length) * 100

  const processingTimes = aiInteractions
    .map(interaction => interaction.processing_time_ms)
    .filter(time => time !== null && time !== undefined)
  
  const avgProcessingTime = processingTimes.length > 0 
    ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length 
    : 0

  // Mock user satisfaction score - in real implementation, this would come from feedback data
  const userSatisfactionScore = Math.min(100, Math.max(0, 85 + (successRate - 85) * 0.5))

  return {
    totalAiInteractions: aiInteractions.length,
    successRate: Math.round(successRate * 100) / 100,
    avgProcessingTime: Math.round(avgProcessingTime),
    userSatisfactionScore: Math.round(userSatisfactionScore * 100) / 100
  }
} 