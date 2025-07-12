import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// Types for the unified real-time manager
interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'ai' | 'admin'
  senderName: string
  timestamp: string
  confidence?: number
  status?: string
  metadata?: Record<string, any>
}

interface ChatConversation {
  id: string
  title: string
  user: string
  timestamp: string
  lastMessage: string
  unread_count: number
  avatar?: string
  phone_number?: string
  contact?: any
}

interface NotificationItem {
  id: string
  title: string
  message: string
  timestamp: string
  type: 'message' | 'conversation' | 'system'
  unread: boolean
  conversationId?: string
  avatar?: string
}

interface UnifiedRealTimeOptions {
  selectedConversationId?: string | null
  onMessagesUpdate?: (messages: ChatMessage[]) => void
  onConversationsUpdate?: (conversations: ChatConversation[]) => void
  onNotificationsUpdate?: (notifications: NotificationItem[]) => void
  onGlobalUnreadUpdate?: (count: number) => void
}

interface UnifiedRealTimeReturn {
  isConnected: boolean
  connectionStatus: string
  globalUnreadCount: number
  refreshAll: () => Promise<void>
  cleanup: () => void
}

/**
 * 🎯 UNIFIED REAL-TIME MANAGER - FIXED VERSION
 * 
 * Centralized real-time subscription manager that handles:
 * - ✅ Messages for selected conversation
 * - ✅ Conversations list updates
 * - ✅ Global notifications and unread counts
 * - ✅ Proper cleanup and unique channel names
 * - ✅ Smart reconnection logic
 * - 🔧 FIXED: Better error handling and UI update propagation
 */
export const useUnifiedRealTime = ({
  selectedConversationId,
  onMessagesUpdate,
  onConversationsUpdate,
  onNotificationsUpdate,
  onGlobalUnreadUpdate
}: UnifiedRealTimeOptions): UnifiedRealTimeReturn => {
  
  // Connection state
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [globalUnreadCount, setGlobalUnreadCount] = useState(0)
  const [retryCount, setRetryCount] = useState(0)
  
  // Subscription references
  const messageSubscription = useRef<any>(null)
  const conversationSubscription = useRef<any>(null)
  const globalSubscription = useRef<any>(null)
  
  // Refs to avoid stale closures
  const callbacksRef = useRef({
    onMessagesUpdate,
    onConversationsUpdate,
    onNotificationsUpdate,
    onGlobalUnreadUpdate
  })
  
  // Update refs when callbacks change
  useEffect(() => {
    callbacksRef.current = {
      onMessagesUpdate,
      onConversationsUpdate,
      onNotificationsUpdate,
      onGlobalUnreadUpdate
    }
  }, [onMessagesUpdate, onConversationsUpdate, onNotificationsUpdate, onGlobalUnreadUpdate])

  // 🔄 Refresh all data function - ENHANCED
  const refreshAll = useCallback(async () => {
    try {
      console.log('🔄 Unified refresh: Loading all data...')
      
      // Load conversations and calculate unread count
      const response = await fetch('/api/admin/chat/conversations')
      if (response.ok) {
        const data = await response.json()
        const conversations = data.data?.conversations || []
        
        // Update conversations with better error handling
        if (callbacksRef.current.onConversationsUpdate) {
          try {
            callbacksRef.current.onConversationsUpdate(conversations)
          } catch (error) {
            console.error('❌ Error in onConversationsUpdate callback:', error)
          }
        }
        
        // Calculate global unread count
        const totalUnread = conversations.reduce((total: number, conv: any) => 
          total + (conv.unread_count || 0), 0
        )
        
        setGlobalUnreadCount(totalUnread)
        if (callbacksRef.current.onGlobalUnreadUpdate) {
          try {
            callbacksRef.current.onGlobalUnreadUpdate(totalUnread)
          } catch (error) {
            console.error('❌ Error in onGlobalUnreadUpdate callback:', error)
          }
        }
        
        // Create notifications from unread conversations
        const notifications: NotificationItem[] = conversations
          .filter((conv: any) => conv.unread_count > 0)
          .map((conv: any) => ({
            id: conv.id,
            title: conv.contact?.display_name || conv.contact?.push_name || 'Unknown Contact',
            message: conv.last_message || 'New message',
            timestamp: conv.last_message_at || new Date().toISOString(),
            type: 'message' as const,
            unread: true,
            conversationId: conv.id,
            avatar: conv.contact?.profile_picture_url
          }))
        
        if (callbacksRef.current.onNotificationsUpdate) {
          try {
            callbacksRef.current.onNotificationsUpdate(notifications)
          } catch (error) {
            console.error('❌ Error in onNotificationsUpdate callback:', error)
          }
        }
        
        console.log('✅ Unified refresh completed:', {
          conversations: conversations.length,
          unread: totalUnread,
          notifications: notifications.length
        })
      } else {
        console.error('❌ Failed to fetch conversations:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('❌ Unified refresh error:', error)
    }
  }, [])

  // 🧹 Cleanup function - ENHANCED
  const cleanup = useCallback(() => {
    console.log('🧹 Unified cleanup: Removing all subscriptions...')
    
    if (messageSubscription.current) {
      try {
        supabase.removeChannel(messageSubscription.current)
      } catch (error) {
        console.error('❌ Error removing message subscription:', error)
      }
      messageSubscription.current = null
    }
    
    if (conversationSubscription.current) {
      try {
        supabase.removeChannel(conversationSubscription.current)
      } catch (error) {
        console.error('❌ Error removing conversation subscription:', error)
      }
      conversationSubscription.current = null
    }
    
    if (globalSubscription.current) {
      try {
        supabase.removeChannel(globalSubscription.current)
      } catch (error) {
        console.error('❌ Error removing global subscription:', error)
      }
      globalSubscription.current = null
    }
    
    setIsConnected(false)
    setConnectionStatus('disconnected')
    setRetryCount(0)
    
    console.log('✅ Unified cleanup completed')
  }, [])

  // 📡 Setup message subscription for selected conversation - ENHANCED
  useEffect(() => {
    if (!selectedConversationId) {
      // Clean up message subscription when no conversation selected
      if (messageSubscription.current) {
        console.log('🧹 Cleaning up message subscription (no conversation)')
        try {
          supabase.removeChannel(messageSubscription.current)
        } catch (error) {
          console.error('❌ Error cleaning up message subscription:', error)
        }
        messageSubscription.current = null
      }
      return
    }

    console.log('📡 Setting up message subscription for:', selectedConversationId)
    
    // Clean up existing subscription
    if (messageSubscription.current) {
      try {
        supabase.removeChannel(messageSubscription.current)
      } catch (error) {
        console.error('❌ Error removing existing message subscription:', error)
      }
    }

    // Create unique channel name with timestamp
    const channelName = `unified-messages-${selectedConversationId}-${Date.now()}`
    
    const newSubscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversationId}`
        },
        async (payload) => {
          console.log('🔔 New message arrived:', payload.new?.content?.substring(0, 50) + '...')
          
          const rawMessage = payload.new
          if (rawMessage && callbacksRef.current.onMessagesUpdate) {
            try {
              // Format message following old system pattern
              const formattedMessage: ChatMessage = {
                id: rawMessage.id,
                content: rawMessage.content || '',
                sender: rawMessage.direction === 'outbound' ? 'admin' : 'user',
                senderName: rawMessage.direction === 'outbound' ? 'BargainB' : 'User',
                timestamp: new Date(rawMessage.created_at).toLocaleTimeString(),
                status: rawMessage.whatsapp_status || 'sent',
                metadata: rawMessage.raw_message_data || {}
              }
              
              // Update messages via callback
              callbacksRef.current.onMessagesUpdate([formattedMessage])
            } catch (error) {
              console.error('❌ Error processing new message:', error)
            }
          }
          
          // Refresh conversations to update last message
          setTimeout(() => refreshAll(), 100) // Small delay to ensure message is processed
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversationId}`
        },
        async (payload) => {
          console.log('🔄 Message updated:', payload.new?.id)
          setTimeout(() => refreshAll(), 100)
        }
      )
      .subscribe((status) => {
        console.log('📡 Message subscription status:', status)
        setConnectionStatus(status)
        
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
          setRetryCount(0)
          console.log('✅ Message subscription CONNECTED')
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setIsConnected(false)
          console.warn('⚠️ Message subscription DISCONNECTED:', status)
          
          // Retry logic (max 3 times)
          if (retryCount < 3) {
            const retryDelay = 2000 * (retryCount + 1)
            console.log(`🔄 Retrying message subscription in ${retryDelay}ms...`)
            setTimeout(() => {
              setRetryCount(prev => prev + 1)
            }, retryDelay)
          }
        }
      })

    messageSubscription.current = newSubscription
  }, [selectedConversationId, retryCount, refreshAll])

  // 📡 Setup global subscription for conversations and notifications - ENHANCED
  useEffect(() => {
    console.log('📡 Setting up global subscription...')
    
    // Clean up existing subscription
    if (globalSubscription.current) {
      try {
        supabase.removeChannel(globalSubscription.current)
      } catch (error) {
        console.error('❌ Error removing existing global subscription:', error)
      }
    }

    // Create unique channel name
    const channelName = `unified-global-${Date.now()}`
    
    const newSubscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations'
        },
        async (payload) => {
          console.log('🔔 New conversation created')
          setTimeout(() => refreshAll(), 100)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations'
        },
        async (payload) => {
          console.log('🔔 Conversation updated')
          setTimeout(() => refreshAll(), 100)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          console.log('🔔 New message globally - updating conversations')
          setTimeout(() => refreshAll(), 100)
        }
      )
      .subscribe((status) => {
        console.log('📡 Global subscription status:', status)
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Global subscription CONNECTED')
          setIsConnected(true)
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.warn('⚠️ Global subscription DISCONNECTED:', status)
          setIsConnected(false)
        }
      })

    globalSubscription.current = newSubscription
    
    // Initial data load
    setTimeout(() => refreshAll(), 100)
  }, [refreshAll])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  return {
    isConnected,
    connectionStatus,
    globalUnreadCount,
    refreshAll,
    cleanup
  }
} 