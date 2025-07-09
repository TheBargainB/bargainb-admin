import { createClient } from '@/utils/supabase/client'
import { AIInteraction, UsageAnalytics } from '@/types/ai-management.types'
import { apiClient, API_ENDPOINTS, ApiClientError } from '@/lib'

export interface AnalyticsResponse {
  success: boolean
  data?: UsageAnalytics[]
  error?: string
}

export interface InteractionsResponse {
  success: boolean
  data?: AIInteraction[]
  error?: string
}

export interface AIStatsResponse {
  success: boolean
  data?: {
    totalInteractions: number
    successRate: number
    avgProcessingTime: number
    totalTokens: number
    uniqueUsers: number
    [key: string]: any
  }
  error?: string
}

/**
 * Fetch AI analytics data
 */
export const fetchAnalytics = async (): Promise<AnalyticsResponse> => {
  try {
    // Try API route first
    const response = await apiClient.get<UsageAnalytics[]>(API_ENDPOINTS.AI_ANALYTICS)

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data || []
      }
    } else {
      // Fallback to direct Supabase query
      const supabase = createClient()
      const { data, error } = await supabase
        .from('ai_usage_analytics')
        .select('*')
        .order('date', { ascending: false })
        .limit(30)

      if (error) {
        throw error
      }

      return {
        success: true,
        data: data || []
      }
    }
  } catch (error) {
    console.error('Error fetching analytics:', error)
    // Graceful failure for analytics
    return {
      success: true,
      data: []
    }
  }
}

/**
 * Fetch AI interactions data
 */
export const fetchInteractions = async (limit: number = 100): Promise<InteractionsResponse> => {
  try {
    // Try API route first
    const response = await apiClient.get<AIInteraction[]>(`${API_ENDPOINTS.AI_INTERACTIONS}?limit=${limit}`)

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data || []
      }
    } else {
      // Fallback to direct Supabase query
      const supabase = createClient()
      const { data, error } = await supabase
        .from('ai_interactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        throw error
      }

      return {
        success: true,
        data: data || []
      }
    }
  } catch (error) {
    console.error('Error fetching interactions:', error)
    // Graceful failure for interactions
    return {
      success: true,
      data: []
    }
  }
}

/**
 * Fetch AI stats from the stats API
 */
export const fetchAIStats = async (): Promise<AIStatsResponse> => {
  try {
    const response = await apiClient.get<any>(API_ENDPOINTS.AI_STATS)

    if (response.success && response.data) {
      const data = response.data
      
      if (data && !data.error) {
        return {
          success: true,
          data: {
            totalInteractions: data.totalInteractions || 0,
            successRate: data.successRate || 0,
            avgProcessingTime: data.avgProcessingTime || 0,
            totalTokens: data.totalTokens || 0,
            uniqueUsers: data.uniqueUsers || 0,
            ...data
          }
        }
      } else {
        return {
          success: false,
          error: data.error || 'Invalid stats response'
        }
      }
    } else {
      return {
        success: false,
        error: response.error || 'Failed to fetch stats'
      }
    }
  } catch (error) {
    console.error('Error fetching AI stats:', error)
    return {
      success: false,
      error: error instanceof ApiClientError ? error.message : 'Failed to fetch AI stats'
    }
  }
}

/**
 * Calculate metrics from interactions data
 */
export const calculateMetricsFromInteractions = (interactions: AIInteraction[]) => {
  const totalInteractions = interactions.length
  const successfulInteractions = interactions.filter(i => i.success).length
  const successRate = totalInteractions > 0 ? (successfulInteractions / totalInteractions) * 100 : 0

  // Calculate processing time metrics
  const processingTimes = interactions
    .filter(i => i.processing_time_ms != null)
    .map(i => i.processing_time_ms!)
  const avgProcessingTime = processingTimes.length > 0 
    ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length 
    : 0

  // Calculate token usage
  const totalTokens = interactions.reduce((sum, i) => sum + (i.tokens_used || 0), 0)

  // Calculate unique users
  const uniqueUsers = new Set(interactions.map(i => i.user_id)).size

  // Calculate daily interactions for trends
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  const todayInteractions = interactions.filter(i => i.created_at && i.created_at.startsWith(today)).length
  const yesterdayInteractions = interactions.filter(i => i.created_at && i.created_at.startsWith(yesterday)).length
  
  const interactionsTrend = yesterdayInteractions > 0 
    ? ((todayInteractions - yesterdayInteractions) / yesterdayInteractions) * 100 
    : 0

  return {
    totalInteractions,
    successRate,
    avgProcessingTime,
    totalTokens,
    uniqueUsers,
    todayInteractions,
    interactionsTrend
  }
}

/**
 * Calculate cost metrics from interactions
 */
export const calculateCostMetrics = (interactions: AIInteraction[]) => {
  const costPerThousandTokens = 0.002 // $0.002 per 1K tokens (example rate)
  const totalTokens = interactions.reduce((sum, i) => sum + (i.tokens_used || 0), 0)
  const totalCost = (totalTokens / 1000) * costPerThousandTokens
  const avgCostPerInteraction = interactions.length > 0 
    ? totalCost / interactions.length 
    : 0

  // Monthly projection based on current usage
  const currentDayOfMonth = new Date().getDate()
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  const projectedMonthlyCost = currentDayOfMonth > 0 
    ? (totalCost / currentDayOfMonth) * daysInMonth 
    : 0

  return {
    totalCost,
    avgCostPerInteraction,
    monthlyCost: totalCost,
    projectedMonthlyCost
  }
}

/**
 * Refresh all analytics data
 */
export const refreshAllAnalytics = async () => {
  const [analyticsResult, interactionsResult, statsResult] = await Promise.allSettled([
    fetchAnalytics(),
    fetchInteractions(),
    fetchAIStats()
  ])

  return {
    analytics: analyticsResult.status === 'fulfilled' ? analyticsResult.value : null,
    interactions: interactionsResult.status === 'fulfilled' ? interactionsResult.value : null,
    stats: statsResult.status === 'fulfilled' ? statsResult.value : null
  }
} 