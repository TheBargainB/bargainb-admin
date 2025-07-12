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
  user: string
  email: string
  avatar: string
  lastMessage: string
  timestamp: string
  status: 'active' | 'resolved' | 'escalated'
  unread_count: number
  type: string
  aiConfidence: number
  lastMessageAt?: string
  remoteJid?: string
  conversationId?: string
  phoneNumber?: string
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
  retryCount: number
  cleanup: () => void
  refreshAll: () => void
}

/**
 * 🎯 UNIFIED REAL-TIME MANAGER
 * 
 * Centralized real-time subscription manager that handles:
 * - ✅ Messages for selected conversation
 * - ✅ Conversations list updates
 * - ✅ Global notifications and unread counts
 * - ✅ Proper cleanup and unique channel names
 * - ✅ Smart reconnection logic
 * 
 * Following the old system's proven patterns with improvements.
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

  // 🔄 Refresh all data function
  const refreshAll = useCallback(async () => {
    try {
      console.log('🔄 Unified refresh: Loading all data...')
      
      // Load conversations and calculate unread count
      const response = await fetch('/api/admin/chat/conversations')
      if (response.ok) {
        const data = await response.json()
        const conversations = data.conversations || []
        
        // Update conversations
        if (callbacksRef.current.onConversationsUpdate) {
          callbacksRef.current.onConversationsUpdate(conversations)
        }
        
        // Calculate global unread count
        const totalUnread = conversations.reduce((total: number, conv: any) => 
          total + (conv.unread_count || 0), 0
        )
        
        setGlobalUnreadCount(totalUnread)
        if (callbacksRef.current.onGlobalUnreadUpdate) {
          callbacksRef.current.onGlobalUnreadUpdate(totalUnread)
        }
        
        // Create notifications from unread conversations
        const notifications: NotificationItem[] = conversations
          .filter((conv: any) => conv.unread_count > 0)
          .map((conv: any) => ({
            id: conv.id,
            title: conv.user || 'Unknown Contact',
            message: conv.lastMessage || 'New message',
            timestamp: conv.timestamp || new Date().toISOString(),
            type: 'message' as const,
            unread: true,
            conversationId: conv.id,
            avatar: conv.avatar
          }))
        
        if (callbacksRef.current.onNotificationsUpdate) {
          callbacksRef.current.onNotificationsUpdate(notifications)
        }
        
        console.log('✅ Unified refresh completed:', {
          conversations: conversations.length,
          unread: totalUnread,
          notifications: notifications.length
        })
      }
    } catch (error) {
      console.error('❌ Unified refresh error:', error)
    }
  }, [])

  // 🧹 Cleanup function
  const cleanup = useCallback(() => {
    console.log('🧹 Unified cleanup: Removing all subscriptions...')
    
    if (messageSubscription.current) {
      supabase.removeChannel(messageSubscription.current)
      messageSubscription.current = null
    }
    
    if (conversationSubscription.current) {
      supabase.removeChannel(conversationSubscription.current)
      conversationSubscription.current = null
    }
    
    if (globalSubscription.current) {
      supabase.removeChannel(globalSubscription.current)
      globalSubscription.current = null
    }
    
    setIsConnected(false)
    setConnectionStatus('disconnected')
    setRetryCount(0)
    
    console.log('✅ Unified cleanup completed')
  }, [])

  // 📡 Setup message subscription for selected conversation
  useEffect(() => {
    if (!selectedConversationId) {
      // Clean up message subscription when no conversation selected
      if (messageSubscription.current) {
        console.log('🧹 Cleaning up message subscription (no conversation)')
        supabase.removeChannel(messageSubscription.current)
        messageSubscription.current = null
      }
      return
    }

    console.log('📡 Setting up message subscription for:', selectedConversationId)
    
    // Clean up existing subscription
    if (messageSubscription.current) {
      supabase.removeChannel(messageSubscription.current)
    }

    // Create unique channel name with timestamp (following old system pattern)
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
          }
          
          // Refresh conversations to update last message
          refreshAll()
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
          refreshAll()
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
            setTimeout(() => {
              setRetryCount(prev => prev + 1)
              console.log('🔄 Retrying message subscription...')
            }, 2000 * (retryCount + 1))
          }
        }
      })

    messageSubscription.current = newSubscription
  }, [selectedConversationId, retryCount, refreshAll])

  // 📡 Setup global subscription for conversations and notifications
  useEffect(() => {
    console.log('📡 Setting up global subscription...')
    
    // Clean up existing subscription
    if (globalSubscription.current) {
      supabase.removeChannel(globalSubscription.current)
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
          refreshAll()
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
          refreshAll()
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
          refreshAll()
        }
      )
      .subscribe((status) => {
        console.log('📡 Global subscription status:', status)
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Global subscription CONNECTED')
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.warn('⚠️ Global subscription DISCONNECTED:', status)
        }
      })

    globalSubscription.current = newSubscription
    
    // Initial data load
    refreshAll()
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
    retryCount,
    cleanup,
    refreshAll
  }
} 