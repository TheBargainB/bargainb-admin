import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface GlobalNotifications {
  unreadMessages: number
  refreshUnreadCount: () => Promise<void>
  markAllAsRead: () => Promise<void>
  isLoading: boolean
}

let globalUnreadCount = 0
let globalRefreshFunction: (() => Promise<void>) | null = null
const subscribers = new Set<(count: number) => void>()

// Global subscription state to prevent multiple subscriptions
let globalMessageSubscription: any = null
let globalConversationSubscription: any = null
let globalPollingInterval: NodeJS.Timeout | null = null
let isSubscriptionSetup = false

export const useGlobalNotifications = (enabled: boolean = true): GlobalNotifications => {
  const [unreadMessages, setUnreadMessages] = useState(globalUnreadCount)
  const [isLoading, setIsLoading] = useState(false)
  const subscribedRef = useRef(false)

  // Subscribe to global unread count changes
  useEffect(() => {
    if (!subscribedRef.current) {
      subscribers.add(setUnreadMessages)
      subscribedRef.current = true
    }

    return () => {
      subscribers.delete(setUnreadMessages)
      subscribedRef.current = false
    }
  }, [])

  const refreshUnreadCount = useCallback(async () => {
    if (!enabled) return
    
    try {
      setIsLoading(true)
      
      // Get total unread count across all conversations
      const response = await fetch('/admin/chat/api/conversations')
      const data = await response.json()

      if (data.success && data.data?.conversations) {
        const conversations = data.data.conversations
        
        const totalUnread = conversations.reduce((total: number, conv: any) => {
          return total + (conv.unread_count || 0)
        }, 0)
        
        // Update global state
        globalUnreadCount = totalUnread
        
        // Notify all subscribers
        subscribers.forEach(callback => {
          callback(totalUnread)
        })
      }
    } catch (error) {
      console.error('❌ Error refreshing global unread count:', error)
    } finally {
      setIsLoading(false)
    }
  }, [enabled])

  const markAllAsRead = useCallback(async () => {
    if (!enabled) return
    
    try {
      // Get all conversations first
      const response = await fetch('/admin/chat/api/conversations')
      const data = await response.json()

      if (data.success && data.data?.conversations) {
        // Mark each conversation as read
        const markAsReadPromises = data.data.conversations.map((conv: any) => 
          fetch(`/admin/chat/api/conversations/${conv.id}/read`, {
            method: 'POST'
          })
        )

        await Promise.all(markAsReadPromises)
        await refreshUnreadCount()
      }
    } catch (error) {
      console.error('❌ Error marking all as read:', error)
    }
  }, [refreshUnreadCount, enabled])

  // Set global refresh function reference
  useEffect(() => {
    if (enabled) {
      globalRefreshFunction = refreshUnreadCount
    }
  }, [refreshUnreadCount, enabled])

  // Set up real-time subscriptions at the global level (only once)
  useEffect(() => {
    if (!enabled || isSubscriptionSetup) return

    const setupRealTimeSubscriptions = async () => {
      try {
        console.log('🔔 Setting up global notifications subscriptions...')
        
        // Clean up existing subscriptions first
        if (globalMessageSubscription) {
          supabase.removeChannel(globalMessageSubscription)
        }
        if (globalConversationSubscription) {
          supabase.removeChannel(globalConversationSubscription)
        }
        if (globalPollingInterval) {
          clearInterval(globalPollingInterval)
        }
        
        // Subscribe to new messages in the new 'messages' table with better error handling
        globalMessageSubscription = supabase
          .channel('global-chat-messages-notifications')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages'
            },
            (payload) => {
              console.log('🔔 New message detected, refreshing unread count')
              // Debounce refresh to prevent excessive calls
              setTimeout(() => refreshUnreadCount(), 1000)
            }
          )
          .subscribe((status) => {
            console.log('🔔 Messages subscription status:', status)
            if (status === 'SUBSCRIBED') {
              console.log('✅ Global messages subscription active')
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              console.warn('⚠️ Messages subscription failed, will rely on polling')
            }
          })

        // Subscribe to conversation updates (for read status changes)
        globalConversationSubscription = supabase
          .channel('global-chat-conversations-notifications')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'conversations'
            },
            (payload) => {
              console.log('🔔 Conversation updated, refreshing unread count')
              // Debounce refresh to prevent excessive calls
              setTimeout(() => refreshUnreadCount(), 800)
            }
          )
          .subscribe((status) => {
            console.log('🔔 Conversations subscription status:', status)
            if (status === 'SUBSCRIBED') {
              console.log('✅ Global conversations subscription active')
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              console.warn('⚠️ Conversations subscription failed, will rely on polling')
            }
          })

        // Initial load
        await refreshUnreadCount()

        // Reduced polling frequency - only refresh every 60 seconds as backup
        globalPollingInterval = setInterval(() => {
          console.log('🔄 Backup polling for unread count')
          refreshUnreadCount()
        }, 60000) // Increased from 30 seconds to 60 seconds

        isSubscriptionSetup = true
        console.log('✅ Global notifications setup complete')
        
      } catch (error) {
        console.error('❌ Error setting up global real-time subscriptions:', error)
      }
    }

    setupRealTimeSubscriptions()

    return () => {
      // Only clean up if this is the last subscriber
      if (subscribers.size <= 1) {
        if (globalMessageSubscription) {
          supabase.removeChannel(globalMessageSubscription)
          globalMessageSubscription = null
        }
        if (globalConversationSubscription) {
          supabase.removeChannel(globalConversationSubscription)
          globalConversationSubscription = null
        }
        if (globalPollingInterval) {
          clearInterval(globalPollingInterval)
          globalPollingInterval = null
        }
        isSubscriptionSetup = false
        console.log('🧹 Cleaned up global notifications subscriptions')
      }
    }
  }, [refreshUnreadCount, enabled])

  return {
    unreadMessages,
    refreshUnreadCount,
    markAllAsRead,
    isLoading
  }
}

// Export function to trigger global refresh from anywhere
export const refreshGlobalUnreadCount = () => {
  if (globalRefreshFunction) {
    globalRefreshFunction()
  }
} 