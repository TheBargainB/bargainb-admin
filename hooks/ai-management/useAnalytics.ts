'use client'

import { useState, useCallback, useMemo } from 'react'
import { AIInteraction, UsageAnalytics } from '@/types/ai-management.types'
import {
  fetchAnalytics,
  fetchInteractions,
  calculateMetricsFromInteractions,
  calculateCostMetrics,
  refreshAllAnalytics
} from '@/actions/ai-management'

interface AnalyticsMetrics {
  totalInteractions: number
  successRate: number
  avgProcessingTime: number
  totalTokens: number
  uniqueUsers: number
  todayInteractions: number
  interactionsTrend: number
}

interface CostMetrics {
  totalCost: number
  avgCostPerInteraction: number
  monthlyCost: number
  projectedMonthlyCost: number
}

interface UseAnalyticsReturn {
  interactions: AIInteraction[]
  analytics: UsageAnalytics[]
  metrics: AnalyticsMetrics
  costMetrics: CostMetrics
  loading: boolean
  error: string | null
  fetchAnalytics: () => Promise<void>
  fetchInteractions: (limit?: number) => Promise<void>
  refreshAll: () => Promise<void>
}

export const useAnalytics = (): UseAnalyticsReturn => {
  const [interactions, setInteractions] = useState<AIInteraction[]>([])
  const [analytics, setAnalytics] = useState<UsageAnalytics[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleError = useCallback((error: unknown, operation: string) => {
    const message = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error(`Error ${operation}:`, error)
    setError(message)
  }, [])

  const fetchInteractionsData = useCallback(async (limit: number = 100) => {
    try {
      setError(null)
      const result = await fetchInteractions(limit)
      setInteractions(result.data || [])
    } catch (error) {
      console.error('Error fetching interactions:', error)
      setInteractions([])
      // Don't show error for graceful degradation
    }
  }, [])

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setError(null)
      const result = await fetchAnalytics()
      setAnalytics(result.data || [])
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setAnalytics([])
      // Don't show error for graceful degradation
    }
  }, [])

  const refreshAll = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchInteractionsData(),
        fetchAnalyticsData()
      ])
    } catch (error) {
      handleError(error, 'refreshing analytics data')
    } finally {
      setLoading(false)
    }
  }, [fetchInteractionsData, fetchAnalyticsData, handleError])

  // Calculate real-time metrics from interactions
  const metrics = useMemo((): AnalyticsMetrics => {
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
  }, [interactions])

  // Calculate cost metrics
  const costMetrics = useMemo((): CostMetrics => {
    const costPerThousandTokens = 0.002 // $0.002 per 1K tokens (example rate)
    const totalCost = (metrics.totalTokens / 1000) * costPerThousandTokens
    const avgCostPerInteraction = metrics.totalInteractions > 0 
      ? totalCost / metrics.totalInteractions 
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
  }, [metrics])

  return {
    interactions,
    analytics,
    metrics,
    costMetrics,
    loading,
    error,
    fetchAnalytics: fetchAnalyticsData,
    fetchInteractions: fetchInteractionsData,
    refreshAll
  }
} 