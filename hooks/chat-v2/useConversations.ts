'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useToast } from '@/hooks/use-toast'
import type { 
  Conversation, 
  ConversationFilters,
  ConversationsResponse
} from '@/types/chat-v2.types'
import {
  getConversations,
  getConversationById,
  createConversation,
  updateConversation,
  markConversationRead,
  deleteConversation
} from '@/actions/chat-v2'

// =============================================================================
// TYPES
// =============================================================================

export interface UseConversationsOptions {
  auto_fetch?: boolean
  initial_filters?: ConversationFilters
}

export interface UseConversationsReturn {
  // Data
  conversations: Conversation[]
  total_count: number
  total_unread: number
  selected_conversation: Conversation | null
  
  // Loading states
  is_loading: boolean
  is_refreshing: boolean
  is_creating: boolean
  is_updating: boolean
  
  // Error states
  error: string | null
  
  // Filters and search
  filters: ConversationFilters
  search_term: string
  
  // Actions
  fetchConversations: () => Promise<void>
  refreshConversations: () => Promise<void>
  selectConversation: (conversationId: string | null) => Promise<void>
  markAsRead: (conversationId: string) => Promise<void>
  refreshNotifications: () => Promise<void>
  updateFilters: (newFilters: Partial<ConversationFilters>) => void
  setSearchTerm: (term: string) => void
  clearError: () => void
  
  // State setters for unified real-time manager
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>
  setSelectedConversation: React.Dispatch<React.SetStateAction<Conversation | null>>
  setTotalUnread: React.Dispatch<React.SetStateAction<number>>
}

// =============================================================================
// HOOK - PURE DATA MANAGER (NO SUBSCRIPTIONS)
// =============================================================================

export const useConversations = (options: UseConversationsOptions = {}): UseConversationsReturn => {
  const {
    auto_fetch = true,
    initial_filters = {}
  } = options

  const { toast } = useToast()

  // =============================================================================
  // STATE
  // =============================================================================

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [total_count, setTotalCount] = useState(0)
  const [total_unread, setTotalUnread] = useState(0)
  const [selected_conversation, setSelectedConversation] = useState<Conversation | null>(null)
  
  // Loading states
  const [is_loading, setIsLoading] = useState(false)
  const [is_refreshing, setIsRefreshing] = useState(false)
  const [is_creating, setIsCreating] = useState(false)
  const [is_updating, setIsUpdating] = useState(false)
  
  // Error state
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [filters, setFilters] = useState<ConversationFilters>(initial_filters)
  const [search_term, setSearchTerm] = useState('')

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const active_filters = useMemo((): ConversationFilters => ({
    ...filters,
    search: search_term.trim() || undefined
  }), [filters, search_term])

  // =============================================================================
  // ACTIONS
  // =============================================================================

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response: ConversationsResponse = await getConversations(active_filters)
      
      setConversations(response.conversations)
      setTotalCount(response.total_count)
      setTotalUnread(response.unread_count)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch conversations'
      setError(errorMessage)
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      
    } finally {
      setIsLoading(false)
    }
  }, [active_filters, toast])

  const refreshConversations = useCallback(async () => {
    try {
      setIsRefreshing(true)
      setError(null)
      
      const response: ConversationsResponse = await getConversations(active_filters)
      
      setConversations(response.conversations)
      setTotalCount(response.total_count)
      setTotalUnread(response.unread_count)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh conversations'
      setError(errorMessage)
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      
    } finally {
      setIsRefreshing(false)
    }
  }, [active_filters, toast])

  const selectConversation = useCallback(async (conversationId: string | null) => {
    try {
      if (!conversationId) {
        setSelectedConversation(null)
        return
      }

      // Find conversation in current list first
      const existingConversation = conversations.find(conv => conv.id === conversationId)
      if (existingConversation) {
        setSelectedConversation(existingConversation)
        return
      }

      // If not in list, fetch it
      const conversation = await getConversationById(conversationId)
      if (conversation) {
        setSelectedConversation(conversation)
      } else {
        throw new Error('Conversation not found')
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to select conversation'
      setError(errorMessage)
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    }
  }, [conversations, toast])

  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      setIsUpdating(true)
      
      await markConversationRead(conversationId)
      
      // Update local state
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unread_count: 0 }
          : conv
      ))
      
      // Update selected conversation
      setSelectedConversation(prev => 
        prev?.id === conversationId 
          ? { ...prev, unread_count: 0 }
          : prev
      )
      
      // Recalculate total unread
      setTotalUnread(prev => {
        const conversation = conversations.find(conv => conv.id === conversationId)
        return Math.max(0, prev - (conversation?.unread_count || 0))
      })
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark as read'
      setError(errorMessage)
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      
    } finally {
      setIsUpdating(false)
    }
  }, [conversations, toast])

  const refreshNotifications = useCallback(async () => {
    try {
      const unreadConvos = conversations.filter(c => c.unread_count > 0)
      setTotalUnread(unreadConvos.reduce((sum, c) => sum + c.unread_count, 0))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh notifications'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    }
  }, [conversations, toast])

  const updateFilters = useCallback((newFilters: Partial<ConversationFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Auto-fetch on mount and filter changes
  useEffect(() => {
    if (auto_fetch) {
      fetchConversations()
    }
  }, [auto_fetch, fetchConversations])

  // =============================================================================
  // RETURN
  // =============================================================================

  return {
    // Data
    conversations,
    total_count,
    total_unread,
    selected_conversation,
    
    // Loading states
    is_loading,
    is_refreshing,
    is_creating,
    is_updating,
    
    // Error states
    error,
    
    // Filters and search
    filters,
    search_term,
    
    // Actions
    fetchConversations,
    refreshConversations,
    selectConversation,
    markAsRead,
    refreshNotifications,
    updateFilters,
    setSearchTerm,
    clearError,
    
    // State setters for unified real-time manager
    setConversations,
    setSelectedConversation,
    setTotalUnread
  }
} 