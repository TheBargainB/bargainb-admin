import { useState } from 'react'

interface AnalyticsInsights {
  totalConversations: number
  totalMessages: number
  averageResponseTime: number
  activeConversations: number
  resolvedConversations: number
  escalatedConversations: number
  aiConfidenceAverage: number
  dailyMessageVolume: number
  [key: string]: any
}

interface ChartData {
  daily: Array<{
    date: string
    messages: number
    conversations: number
    aiResponses: number
  }>
  hourly: Array<{
    hour: string
    messages: number
    conversations: number
  }>
  summary: {
    totalMessages: number
    totalConversations: number
    avgResponseTime: number
    peakHour: string
  }
  [key: string]: any
}

export const useAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsInsights | null>(null)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)

  // Load analytics insights and chart data
  const loadAnalyticsData = async (days: number = 7) => {
    try {
      setIsLoadingAnalytics(true)
      console.log(`📊 Loading analytics data for ${days} days...`)
      
      // Load insights and chart data in parallel
      const [insightsResponse, chartsResponse] = await Promise.all([
        fetch('/admin/chat/api/analytics/insights'),
        fetch(`/admin/chat/api/analytics/charts?days=${days}`)
      ])
      
      if (insightsResponse.ok) {
        const insightsResult = await insightsResponse.json()
        if (insightsResult.success) {
          setAnalyticsData(insightsResult.data)
          console.log('✅ Analytics insights loaded:', insightsResult.data)
        } else {
          console.warn('⚠️ Analytics insights failed:', insightsResult.error)
        }
      } else {
        console.error('❌ Failed to fetch analytics insights:', insightsResponse.status)
      }
      
      if (chartsResponse.ok) {
        const chartsResult = await chartsResponse.json()
        if (chartsResult.success) {
          setChartData(chartsResult.data)
          console.log('✅ Chart data loaded:', chartsResult.data.summary)
        } else {
          console.warn('⚠️ Chart data failed:', chartsResult.error)
        }
      } else {
        console.error('❌ Failed to fetch chart data:', chartsResponse.status)
      }
      
    } catch (error) {
      console.error('❌ Error loading analytics data:', error)
      // Don't show toast for analytics errors - not critical for chat functionality
    } finally {
      setIsLoadingAnalytics(false)
    }
  }

  // Load engagement metrics
  const loadEngagementMetrics = async () => {
    try {
      console.log('📈 Loading engagement metrics...')
      
      const response = await fetch('/admin/chat/api/analytics/engagement')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch engagement metrics: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Engagement metrics loaded:', result.data)
        return result.data
      } else {
        console.warn('⚠️ Engagement metrics failed:', result.error)
        return null
      }
    } catch (error) {
      console.error('❌ Error loading engagement metrics:', error)
      return null
    }
  }

  // Get analytics summary for dashboard cards
  const getAnalyticsSummary = () => {
    if (!analyticsData) {
      return {
        totalConversations: 0,
        totalMessages: 0,
        averageResponseTime: 0,
        activeConversations: 0,
        aiConfidenceAverage: 0
      }
    }

    return {
      totalConversations: analyticsData.totalConversations || 0,
      totalMessages: analyticsData.totalMessages || 0,
      averageResponseTime: analyticsData.averageResponseTime || 0,
      activeConversations: analyticsData.activeConversations || 0,
      aiConfidenceAverage: analyticsData.aiConfidenceAverage || 0,
      resolvedConversations: analyticsData.resolvedConversations || 0,
      escalatedConversations: analyticsData.escalatedConversations || 0,
      dailyMessageVolume: analyticsData.dailyMessageVolume || 0
    }
  }

  // Get chart data for different time periods
  const getChartDataForPeriod = (period: 'daily' | 'hourly' = 'daily') => {
    if (!chartData) return []
    
    return chartData[period] || []
  }

  // Calculate trends from chart data
  const calculateTrends = () => {
    if (!chartData || !chartData.daily || chartData.daily.length < 2) {
      return {
        messagesTrend: 0,
        conversationsTrend: 0,
        aiResponsesTrend: 0
      }
    }

    const recent = chartData.daily.slice(-3) // Last 3 days
    const previous = chartData.daily.slice(-6, -3) // Previous 3 days

    const recentAvg = {
      messages: recent.reduce((sum, day) => sum + day.messages, 0) / recent.length,
      conversations: recent.reduce((sum, day) => sum + day.conversations, 0) / recent.length,
      aiResponses: recent.reduce((sum, day) => sum + day.aiResponses, 0) / recent.length
    }

    const previousAvg = {
      messages: previous.reduce((sum, day) => sum + day.messages, 0) / previous.length,
      conversations: previous.reduce((sum, day) => sum + day.conversations, 0) / previous.length,
      aiResponses: previous.reduce((sum, day) => sum + day.aiResponses, 0) / previous.length
    }

    return {
      messagesTrend: previousAvg.messages > 0 ? 
        ((recentAvg.messages - previousAvg.messages) / previousAvg.messages) * 100 : 0,
      conversationsTrend: previousAvg.conversations > 0 ? 
        ((recentAvg.conversations - previousAvg.conversations) / previousAvg.conversations) * 100 : 0,
      aiResponsesTrend: previousAvg.aiResponses > 0 ? 
        ((recentAvg.aiResponses - previousAvg.aiResponses) / previousAvg.aiResponses) * 100 : 0
    }
  }

  // Clear analytics data
  const clearAnalyticsData = () => {
    setAnalyticsData(null)
    setChartData(null)
    console.log('🧹 Analytics data cleared')
  }

  return {
    // State
    analyticsData,
    chartData,
    isLoadingAnalytics,
    
    // Functions
    loadAnalyticsData,
    loadEngagementMetrics,
    getAnalyticsSummary,
    getChartDataForPeriod,
    calculateTrends,
    clearAnalyticsData,
    
    // Setters (for advanced usage)
    setAnalyticsData,
    setChartData
  }
} 