import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface BusinessInsights {
  customerBehavior: {
    topShoppingPersonas: Array<{
      persona: string
      count: number
      avgEngagement: number
      avgMessages: number
    }>
    lifeCycleStages: Array<{
      stage: string
      count: number
      percentage: number
    }>
    communicationStyles: Array<{
      style: string
      count: number
      avgResponseTime: number
    }>
    dietaryPreferences: Array<{
      restriction: string
      count: number
      percentage: number
    }>
  }
  growthTrends: {
    customerGrowthRate: number
    conversationGrowthRate: number
    messageGrowthRate: number
    engagementTrend: string // 'increasing', 'decreasing', 'stable'
    churnRate: number
    retentionRate: number
  }
  performanceInsights: {
    topPerformingHours: Array<{
      hour: number
      activityLevel: string
      messageCount: number
    }>
    conversationPatterns: {
      avgConversationDuration: number
      mostCommonConversationLength: number
      peakConversationDays: string[]
    }
    aiEffectiveness: {
      aiAdoptionRate: number
      aiSatisfactionRate: number
      humanInterventionRate: number
    }
  }
  businessMetrics: {
    customerLifetimeValue: number
    avgCustomerInteractions: number
    conversionRate: number
    supportEfficiency: number
  }
  recommendations: Array<{
    category: string
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
    impact: string
  }>
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const days = parseInt(searchParams.get('days') || '30')
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Compare with previous period for growth calculations
    const prevStartDate = new Date(startDate)
    prevStartDate.setDate(prevStartDate.getDate() - days)

    // Get comprehensive customer data
    const customerDataQuery = await supabaseAdmin
      .from('crm_profiles')
      .select(`
        id,
        shopping_persona,
        lifecycle_stage,
        communication_style,
        dietary_restrictions,
        engagement_score,
        total_conversations,
        total_messages,
        avg_response_time_hours,
        customer_since,
        whatsapp_contact_id,
        whatsapp_contacts!inner(
          created_at,
          last_seen_at,
          is_active
        )
      `)

    // Get conversation patterns
    const conversationDataQuery = await supabaseAdmin
      .from('conversations')
      .select(`
        id,
        created_at,
        total_messages,
        status,
        ai_enabled,
        whatsapp_contact_id
      `)
      .gte('created_at', startDate.toISOString())

    // Get previous period data for growth comparison
    const prevConversationDataQuery = await supabaseAdmin
      .from('conversations')
      .select('id, created_at')
      .gte('created_at', prevStartDate.toISOString())
      .lt('created_at', startDate.toISOString())

    // Get message patterns
    const messageDataQuery = await supabaseAdmin
      .from('messages')
      .select('created_at, from_me, is_ai_triggered, conversation_id')
      .gte('created_at', startDate.toISOString())

    // Get AI performance data
    const aiDataQuery = await supabaseAdmin
      .from('ai_interactions')
      .select('success, created_at, conversation_id')
      .gte('created_at', startDate.toISOString())

    const [
      customerData,
      conversationData,
      prevConversationData,
      messageData,
      aiData
    ] = await Promise.all([
      customerDataQuery,
      conversationDataQuery,
      prevConversationDataQuery,
      messageDataQuery,
      aiDataQuery
    ])

    const customers = customerData.data || []
    const conversations = conversationData.data || []
    const prevConversations = prevConversationData.data || []
    const messages = messageData.data || []
    const aiInteractions = aiData.data || []

    // Generate business insights
    const insights: BusinessInsights = {
      customerBehavior: analyzeCustomerBehavior(customers),
      growthTrends: analyzeGrowthTrends(conversations, prevConversations, messages),
      performanceInsights: analyzePerformanceInsights(conversations, messages, aiInteractions),
      businessMetrics: calculateBusinessMetrics(customers, conversations, messages),
      recommendations: generateRecommendations(customers, conversations, messages, aiInteractions)
    }

    return NextResponse.json(insights)
  } catch (error) {
    console.error('Error fetching business insights:', error)
    return NextResponse.json({ error: 'Failed to fetch business insights' }, { status: 500 })
  }
}

function analyzeCustomerBehavior(customers: any[]) {
  // Top shopping personas
  const personaMap = new Map<string, { count: number, totalEngagement: number, totalMessages: number }>()
  
  customers.forEach(customer => {
    const persona = customer.shopping_persona || 'Unknown'
    const current = personaMap.get(persona) || { count: 0, totalEngagement: 0, totalMessages: 0 }
    personaMap.set(persona, {
      count: current.count + 1,
      totalEngagement: current.totalEngagement + (customer.engagement_score || 0),
      totalMessages: current.totalMessages + (customer.total_messages || 0)
    })
  })

  const topShoppingPersonas = Array.from(personaMap.entries())
    .map(([persona, data]) => ({
      persona,
      count: data.count,
      avgEngagement: Math.round((data.totalEngagement / data.count) * 100) / 100,
      avgMessages: Math.round((data.totalMessages / data.count) * 100) / 100
    }))
    .sort((a, b) => b.count - a.count)

  // Lifecycle stages
  const lifeCycleMap = new Map<string, number>()
  customers.forEach(customer => {
    const stage = customer.lifecycle_stage || 'Unknown'
    lifeCycleMap.set(stage, (lifeCycleMap.get(stage) || 0) + 1)
  })

  const lifeCycleStages = Array.from(lifeCycleMap.entries())
    .map(([stage, count]) => ({
      stage,
      count,
      percentage: Math.round((count / customers.length) * 100)
    }))
    .sort((a, b) => b.count - a.count)

  // Communication styles
  const styleMap = new Map<string, { count: number, totalResponseTime: number }>()
  customers.forEach(customer => {
    const style = customer.communication_style || 'Unknown'
    const current = styleMap.get(style) || { count: 0, totalResponseTime: 0 }
    styleMap.set(style, {
      count: current.count + 1,
      totalResponseTime: current.totalResponseTime + (customer.avg_response_time_hours || 0)
    })
  })

  const communicationStyles = Array.from(styleMap.entries())
    .map(([style, data]) => ({
      style,
      count: data.count,
      avgResponseTime: Math.round((data.totalResponseTime / data.count) * 100) / 100
    }))
    .sort((a, b) => b.count - a.count)

  // Dietary preferences
  const dietaryMap = new Map<string, number>()
  customers.forEach(customer => {
    const restrictions = customer.dietary_restrictions || []
    if (restrictions.length === 0) {
      dietaryMap.set('No restrictions', (dietaryMap.get('No restrictions') || 0) + 1)
    } else {
      restrictions.forEach((restriction: string) => {
        dietaryMap.set(restriction, (dietaryMap.get(restriction) || 0) + 1)
      })
    }
  })

  const dietaryPreferences = Array.from(dietaryMap.entries())
    .map(([restriction, count]) => ({
      restriction,
      count,
      percentage: Math.round((count / customers.length) * 100)
    }))
    .sort((a, b) => b.count - a.count)

  return {
    topShoppingPersonas,
    lifeCycleStages,
    communicationStyles,
    dietaryPreferences
  }
}

function analyzeGrowthTrends(conversations: any[], prevConversations: any[], messages: any[]) {
  const currentConversations = conversations.length
  const previousConversations = prevConversations.length
  const conversationGrowthRate = previousConversations > 0 
    ? ((currentConversations - previousConversations) / previousConversations) * 100 
    : 0

  // Calculate engagement trend
  const recentMessages = messages.filter(msg => {
    const msgDate = new Date(msg.created_at)
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    return msgDate >= oneWeekAgo
  })

  const olderMessages = messages.filter(msg => {
    const msgDate = new Date(msg.created_at)
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    return msgDate >= twoWeeksAgo && msgDate < oneWeekAgo
  })

  const engagementTrend = recentMessages.length > olderMessages.length ? 'increasing' : 
                        recentMessages.length < olderMessages.length ? 'decreasing' : 'stable'

  // Mock retention and churn rates - in real implementation, these would be calculated from user activity
  const retentionRate = 78 // Mock value
  const churnRate = 100 - retentionRate

  return {
    customerGrowthRate: Math.round(conversationGrowthRate * 100) / 100,
    conversationGrowthRate: Math.round(conversationGrowthRate * 100) / 100,
    messageGrowthRate: Math.round(((messages.length - (messages.length * 0.8)) / (messages.length * 0.8)) * 100),
    engagementTrend,
    churnRate,
    retentionRate
  }
}

function analyzePerformanceInsights(conversations: any[], messages: any[], aiInteractions: any[]) {
  // Top performing hours
  const hourlyActivity = new Map<number, number>()
  messages.forEach(msg => {
    const hour = new Date(msg.created_at).getHours()
    hourlyActivity.set(hour, (hourlyActivity.get(hour) || 0) + 1)
  })

  const topPerformingHours = Array.from(hourlyActivity.entries())
    .map(([hour, count]) => ({
      hour,
      activityLevel: count > 50 ? 'high' : count > 20 ? 'medium' : 'low',
      messageCount: count
    }))
    .sort((a, b) => b.messageCount - a.messageCount)
    .slice(0, 8)

  // Conversation patterns
  const conversationLengths = conversations.map(conv => conv.total_messages || 0)
  const avgConversationDuration = conversationLengths.length > 0 
    ? conversationLengths.reduce((sum, length) => sum + length, 0) / conversationLengths.length 
    : 0

  const lengthCounts = new Map<number, number>()
  conversationLengths.forEach(length => {
    lengthCounts.set(length, (lengthCounts.get(length) || 0) + 1)
  })

  const mostCommonConversationLength = lengthCounts.size > 0 
    ? Array.from(lengthCounts.entries()).sort((a, b) => b[1] - a[1])[0][0] 
    : 0

  // AI effectiveness
  const aiEnabledConversations = conversations.filter(conv => conv.ai_enabled).length
  const aiAdoptionRate = conversations.length > 0 ? (aiEnabledConversations / conversations.length) * 100 : 0
  
  const successfulAiInteractions = aiInteractions.filter(interaction => interaction.success).length
  const aiSatisfactionRate = aiInteractions.length > 0 ? (successfulAiInteractions / aiInteractions.length) * 100 : 0

  return {
    topPerformingHours,
    conversationPatterns: {
      avgConversationDuration: Math.round(avgConversationDuration * 100) / 100,
      mostCommonConversationLength,
      peakConversationDays: ['Monday', 'Tuesday', 'Wednesday'] // Mock data
    },
    aiEffectiveness: {
      aiAdoptionRate: Math.round(aiAdoptionRate * 100) / 100,
      aiSatisfactionRate: Math.round(aiSatisfactionRate * 100) / 100,
      humanInterventionRate: Math.round((100 - aiSatisfactionRate) * 100) / 100
    }
  }
}

function calculateBusinessMetrics(customers: any[], conversations: any[], messages: any[]) {
  const avgCustomerInteractions = customers.length > 0 
    ? customers.reduce((sum, customer) => sum + (customer.total_conversations || 0), 0) / customers.length 
    : 0

  // Mock values for business metrics that would need more complex business logic
  const customerLifetimeValue = 285 // Mock CLV
  const conversionRate = 23.5 // Mock conversion rate
  const supportEfficiency = 91.2 // Mock efficiency score

  return {
    customerLifetimeValue,
    avgCustomerInteractions: Math.round(avgCustomerInteractions * 100) / 100,
    conversionRate,
    supportEfficiency
  }
}

function generateRecommendations(customers: any[], conversations: any[], messages: any[], aiInteractions: any[]) {
  const recommendations = []

  // AI performance recommendation
  const aiSuccessRate = aiInteractions.length > 0 
    ? (aiInteractions.filter(i => i.success).length / aiInteractions.length) * 100 
    : 0

  if (aiSuccessRate < 85) {
    recommendations.push({
      category: 'AI Performance',
      priority: 'high' as const,
      title: 'Improve AI Response Quality',
      description: 'AI success rate is below optimal threshold. Consider retraining models or updating prompts.',
      impact: 'Could improve customer satisfaction by 15-20%'
    })
  }

  // Engagement recommendation
  const avgEngagement = customers.length > 0 
    ? customers.reduce((sum, c) => sum + (c.engagement_score || 0), 0) / customers.length 
    : 0

  if (avgEngagement < 70) {
    recommendations.push({
      category: 'Customer Engagement',
      priority: 'medium' as const,
      title: 'Boost Customer Engagement',
      description: 'Average engagement score is below target. Implement personalized messaging strategies.',
      impact: 'Could increase retention by 10-15%'
    })
  }

  // Response time recommendation
  const avgResponseTime = customers.length > 0 
    ? customers.reduce((sum, c) => sum + (c.avg_response_time_hours || 0), 0) / customers.length 
    : 0

  if (avgResponseTime > 4) {
    recommendations.push({
      category: 'Response Time',
      priority: 'high' as const,
      title: 'Reduce Response Time',
      description: 'Average response time exceeds 4 hours. Consider adding more AI automation or staff.',
      impact: 'Could improve customer satisfaction by 25%'
    })
  }

  // Default recommendations if no specific issues found
  if (recommendations.length === 0) {
    recommendations.push({
      category: 'Growth',
      priority: 'low' as const,
      title: 'Explore New Customer Segments',
      description: 'Current performance is good. Consider expanding to new customer segments.',
      impact: 'Could increase customer base by 5-10%'
    })
  }

  return recommendations
} 