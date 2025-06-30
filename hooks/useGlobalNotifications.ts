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

export const useGlobalNotifications = (): GlobalNotifications => {
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
  }, [])

  const markAllAsRead = useCallback(async () => {
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
  }, [refreshUnreadCount])

  // Set global refresh function reference
  useEffect(() => {
    globalRefreshFunction = refreshUnreadCount
  }, [refreshUnreadCount])

  // Set up real-time subscriptions at the global level
  useEffect(() => {
    let messageSubscription: any = null
    let conversationSubscription: any = null
    let interval: NodeJS.Timeout | null = null

    const setupRealTimeSubscriptions = async () => {
      try {
        console.log('🔔 Setting up global notifications subscriptions...')
        
        // Subscribe to new messages in the new 'messages' table
        messageSubscription = supabase
          .channel('global-chat-messages')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages'
            },
            (payload) => {
              console.log('🔔 New message detected, refreshing unread count')
              // Refresh unread count when new messages arrive
              setTimeout(() => refreshUnreadCount(), 500) // Small delay to ensure DB consistency
            }
          )
          .subscribe((status) => {
            console.log('🔔 Messages subscription status:', status)
          })

        // Subscribe to conversation updates (for read status changes)
        conversationSubscription = supabase
          .channel('global-chat-conversations')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'conversations'
            },
            (payload) => {
              console.log('🔔 Conversation updated, refreshing unread count')
              // Refresh when conversations are updated (like read status)
              setTimeout(() => refreshUnreadCount(), 300)
            }
          )
          .subscribe((status) => {
            console.log('🔔 Conversations subscription status:', status)
          })

        // Initial load
        await refreshUnreadCount()

        // Refresh every 30 seconds as backup
        interval = setInterval(() => refreshUnreadCount(), 30000)
      } catch (error) {
        console.error('❌ Error setting up global real-time subscriptions:', error)
      }
    }

    setupRealTimeSubscriptions()

    return () => {
      if (messageSubscription) {
        supabase.removeChannel(messageSubscription)
      }
      if (conversationSubscription) {
        supabase.removeChannel(conversationSubscription)
      }
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [refreshUnreadCount])

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