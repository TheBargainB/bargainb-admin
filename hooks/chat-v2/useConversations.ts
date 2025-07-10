'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useToast } from '@/hooks/use-toast'
import type { 
  Conversation, 
  ConversationFilters,
  ConversationsResponse,
  RealtimeConversationPayload
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
  enable_realtime?: boolean
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
  
  // Real-time status
  is_realtime_connected: boolean
}

// =============================================================================
// HOOK
// =============================================================================

export const useConversations = (options: UseConversationsOptions = {}): UseConversationsReturn => {
  const {
    auto_fetch = true,
    enable_realtime = true,
    initial_filters = {}
  } = options

  const { toast } = useToast()
  const supabase = createClient()

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
  
  // Real-time connection status
  const [is_realtime_connected, setIsRealtimeConnected] = useState(false)

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
  // REAL-TIME SUBSCRIPTIONS
  // =============================================================================

  useEffect(() => {
    if (!enable_realtime) return

    const channel = supabase
      .channel('conversations_realtime')
      .on(
        'postgres_changes' as any,
        { 
          event: '*', 
          schema: 'public', 
          table: 'conversations' 
        },
        (payload: any) => {
          console.log('📡 Conversation real-time update:', payload.eventType)
          
          if (payload.eventType === 'INSERT' && payload.new) {
            // Add new conversation to the list
            const newConversation = payload.new as any // Will be properly typed by actions
            setConversations(prev => {
              // Avoid duplicates
              if (prev.some(conv => conv.id === newConversation.id)) {
                return prev
              }
              return [newConversation, ...prev]
            })
            setTotalCount(prev => prev + 1)
          }
          
          else if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedConversation = payload.new as any
            
            setConversations(prev => prev.map(conv => 
              conv.id === updatedConversation.id 
                ? { ...conv, ...updatedConversation }
                : conv
            ))
            
            // Update selected conversation if it matches
            setSelectedConversation(prev => 
              prev?.id === updatedConversation.id 
                ? { ...prev, ...updatedConversation }
                : prev
            )
            
            // Recalculate total unread
            setTotalUnread(prev => {
              const oldConversation = conversations.find(conv => conv.id === updatedConversation.id)
              const oldUnread = oldConversation?.unread_count || 0
              const newUnread = updatedConversation.unread_count || 0
              return Math.max(0, prev - oldUnread + newUnread)
            })
          }
          
          else if (payload.eventType === 'DELETE' && payload.old) {
            const deletedId = (payload.old as any).id
            
            setConversations(prev => prev.filter(conv => conv.id !== deletedId))
            setTotalCount(prev => Math.max(0, prev - 1))
            
            // Clear selected conversation if it was deleted
            setSelectedConversation(prev => 
              prev?.id === deletedId ? null : prev
            )
          }
        }
      )
      .subscribe((status) => {
        setIsRealtimeConnected(status === 'SUBSCRIBED')
        console.log('📡 Conversations subscription status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
      setIsRealtimeConnected(false)
    }
  }, [enable_realtime, supabase, conversations])

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
    
    // Real-time status
    is_realtime_connected
  }
} 