'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useToast } from '@/hooks/use-toast'
import type { 
  NotificationData,
  Conversation
} from '@/types/chat-v2.types'
import {
  getNotificationData,
  getUnreadConversations,
  markAllConversationsAsRead,
  processWebhookNotification
} from '@/actions/chat-v2'

// Local types for this hook
interface NotificationItem {
  conversation_id: string
  contact_name: string
  phone_number: string
  last_message: string
  unread_count: number
  created_at: string
}

interface NotificationSummary {
  unread_count: number
  total_conversations: number
  last_updated: string
}

// =============================================================================
// TYPES
// =============================================================================

export interface UseNotificationsOptions {
  enable_realtime?: boolean
  enable_sound?: boolean
  poll_interval?: number
  max_notifications?: number
}

export interface UseNotificationsReturn {
  // Notification data
  notification_data: NotificationData | null
  notification_items: NotificationItem[]
  total_unread: number
  has_notifications: boolean
  
  // Summary data
  summary: NotificationSummary | null
  
  // Loading states
  is_loading: boolean
  is_refreshing: boolean
  is_marking_read: boolean
  
  // Error states
  error: string | null
  
  // Actions
  fetchNotifications: () => Promise<void>
  refreshNotifications: () => Promise<void>
  markAllAsRead: () => Promise<void>
  markConversationAsRead: (conversationId: string) => Promise<void>
  clearNotifications: () => void
  clearError: () => void
  
  // Sound control
  toggleSound: () => void
  playNotificationSound: () => void
  is_sound_enabled: boolean
  
  // Real-time status
  is_realtime_connected: boolean
  last_updated: Date | null
}

// =============================================================================
// HOOK
// =============================================================================

export const useNotifications = (options: UseNotificationsOptions = {}): UseNotificationsReturn => {
  const {
    enable_realtime = true,
    enable_sound = false,
    poll_interval = 30000, // 30 seconds
    max_notifications = 10
  } = options

  const { toast } = useToast()
  const supabase = createClient()

  // =============================================================================
  // STATE
  // =============================================================================

  const [notification_data, setNotificationData] = useState<NotificationData | null>(null)
  const [notification_items, setNotificationItems] = useState<NotificationItem[]>([])
  const [summary, setSummary] = useState<NotificationSummary | null>(null)
  
  // Loading states
  const [is_loading, setIsLoading] = useState(false)
  const [is_refreshing, setIsRefreshing] = useState(false)
  const [is_marking_read, setIsMarkingRead] = useState(false)
  
  // Error state
  const [error, setError] = useState<string | null>(null)
  
  // Sound settings
  const [is_sound_enabled, setIsSoundEnabled] = useState(enable_sound)
  
  // Real-time and polling
  const [is_realtime_connected, setIsRealtimeConnected] = useState(false)
  const [last_updated, setLastUpdated] = useState<Date | null>(null)

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const total_unread = useMemo(() => {
    return notification_data?.total_unread || 0
  }, [notification_data])

  const has_notifications = useMemo(() => {
    return total_unread > 0
  }, [total_unread])

  // =============================================================================
  // ACTIONS
  // =============================================================================

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Fetch notification data and items in parallel
      const [notificationData, unreadConversations] = await Promise.all([
        getNotificationData(),
        getUnreadConversations(max_notifications)
      ])
      
      // Create summary from the data
      const notificationSummary: NotificationSummary = {
        unread_count: notificationData.total_unread,
        total_conversations: unreadConversations.length,
        last_updated: new Date().toISOString()
      }
      
      // Map UnreadConversation to NotificationItem
      const notificationItems: NotificationItem[] = unreadConversations.map((conv: any) => ({
        conversation_id: conv.conversation_id,
        contact_name: conv.contact_name || 'Unknown Contact',
        phone_number: conv.phone_number || 'Unknown',
        last_message: conv.last_message,
        unread_count: conv.unread_count,
        created_at: conv.last_message_at
      }))

      setNotificationData(notificationData)
      setNotificationItems(notificationItems)
      setSummary(notificationSummary)
      setLastUpdated(new Date())
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications'
      setError(errorMessage)
      
      console.error('❌ Notification fetch error:', err)
      
    } finally {
      setIsLoading(false)
    }
  }, [max_notifications])

  const refreshNotifications = useCallback(async () => {
    try {
      setIsRefreshing(true)
      setError(null)
      
      // Fetch fresh data
      const [notificationData, unreadConversations] = await Promise.all([
        getNotificationData(),
        getUnreadConversations(max_notifications)
      ])
      
      // Create summary from the data
      const notificationSummary: NotificationSummary = {
        unread_count: notificationData.total_unread,
        total_conversations: unreadConversations.length,
        last_updated: new Date().toISOString()
      }

      // Map UnreadConversation to NotificationItem
      const notificationItems: NotificationItem[] = unreadConversations.map(conv => ({
        conversation_id: conv.conversation_id,
        contact_name: conv.contact_name,
        phone_number: conv.contact?.phone_number || 'Unknown',
        last_message: conv.last_message,
        unread_count: conv.unread_count,
        created_at: conv.last_message_at
      }))
      
      setNotificationData(notificationData)
      setNotificationItems(notificationItems)
      setSummary(notificationSummary)
      setLastUpdated(new Date())
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh notifications'
      setError(errorMessage)
      
      console.error('❌ Notification refresh error:', err)
      
    } finally {
      setIsRefreshing(false)
    }
  }, [max_notifications])

  const markAllAsRead = useCallback(async () => {
    try {
      setIsMarkingRead(true)
      setError(null)
      
      await markAllConversationsAsRead()
      
      // Clear local notification state
      setNotificationData(prev => prev ? { ...prev, total_unread: 0 } : null)
      setNotificationItems([])
      setSummary(prev => prev ? { ...prev, unread_count: 0 } : null)
      setLastUpdated(new Date())
      
      toast({
        title: 'All notifications cleared',
        description: 'All conversations have been marked as read.',
      })
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark all as read'
      setError(errorMessage)
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      
    } finally {
      setIsMarkingRead(false)
    }
  }, [toast])

  const markConversationAsRead = useCallback(async (conversationId: string) => {
    try {
      // This would typically be handled by the conversations hook
      // Remove the conversation from notification items
      setNotificationItems(prev => 
        prev.filter(item => item.conversation_id !== conversationId)
      )
      
      // Update notification counts
      setNotificationData(prev => {
        if (!prev) return null
        const unreadConversation = notification_items.find(item => item.conversation_id === conversationId)
        const unreadCount = unreadConversation?.unread_count || 0
        return {
          ...prev,
          total_unread: Math.max(0, prev.total_unread - unreadCount)
        }
      })
      
      setSummary(prev => {
        if (!prev) return null
        return {
          ...prev,
          unread_count: Math.max(0, prev.unread_count - 1)
        }
      })
      
      setLastUpdated(new Date())
      
    } catch (err) {
      console.error('❌ Error updating notification state:', err)
    }
  }, [notification_items])

  const clearNotifications = useCallback(() => {
    setNotificationData(null)
    setNotificationItems([])
    setSummary(null)
    setLastUpdated(new Date())
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // =============================================================================
  // SOUND CONTROL
  // =============================================================================

  const toggleSound = useCallback(() => {
    setIsSoundEnabled(prev => !prev)
  }, [])

  const playNotificationSound = useCallback(() => {
    if (!is_sound_enabled) return
    
    try {
      // Create a subtle notification sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
      
    } catch (err) {
      console.warn('⚠️ Could not play notification sound:', err)
    }
  }, [is_sound_enabled])

  // =============================================================================
  // REAL-TIME SUBSCRIPTIONS
  // =============================================================================

  useEffect(() => {
    if (!enable_realtime) return

    // Subscribe to conversation changes for notifications
    const conversationsChannel = supabase
      .channel('notifications_conversations')
      .on(
        'postgres_changes' as any,
        { 
          event: '*', 
          schema: 'public', 
          table: 'conversations' 
        },
        (payload: any) => {
          console.log('📡 Notification real-time update (conversations):', payload.eventType)
          
          if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedConversation = payload.new
            
            // Check if unread count changed
            if (payload.old && updatedConversation.unread_count !== payload.old.unread_count) {
              // Refresh notifications to get updated counts
              refreshNotifications()
              
              // Play sound for new messages (when unread count increases)
              if (updatedConversation.unread_count > (payload.old.unread_count || 0)) {
                playNotificationSound()
              }
            }
          }
        }
      )
      .subscribe((status) => {
        setIsRealtimeConnected(status === 'SUBSCRIBED')
        console.log('📡 Notifications subscription status:', status)
      })

    // Subscribe to message changes for real-time notifications
    const messagesChannel = supabase
      .channel('notifications_messages')
      .on(
        'postgres_changes' as any,
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: 'direction=eq.inbound'
        },
        (payload: any) => {
          console.log('📡 New inbound message for notifications:', payload.new?.id)
          
          // Process new message for notifications
          if (payload.new) {
            processWebhookNotification(payload.new)
              .then(() => {
                refreshNotifications()
                playNotificationSound()
              })
              .catch(err => {
                console.error('❌ Error processing webhook notification:', err)
              })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(conversationsChannel)
      supabase.removeChannel(messagesChannel)
      setIsRealtimeConnected(false)
    }
  }, [enable_realtime, supabase, refreshNotifications, playNotificationSound])

  // =============================================================================
  // POLLING FALLBACK
  // =============================================================================

  useEffect(() => {
    if (enable_realtime || !poll_interval) return

    const interval = setInterval(() => {
      refreshNotifications()
    }, poll_interval)

    return () => clearInterval(interval)
  }, [enable_realtime, poll_interval, refreshNotifications])

  // =============================================================================
  // INITIAL FETCH
  // =============================================================================

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // =============================================================================
  // RETURN
  // =============================================================================

  return {
    // Notification data
    notification_data,
    notification_items,
    total_unread,
    has_notifications,
    
    // Summary data
    summary,
    
    // Loading states
    is_loading,
    is_refreshing,
    is_marking_read,
    
    // Error states
    error,
    
    // Actions
    fetchNotifications,
    refreshNotifications,
    markAllAsRead,
    markConversationAsRead,
    clearNotifications,
    clearError,
    
    // Sound control
    toggleSound,
    playNotificationSound,
    is_sound_enabled,
    
    // Real-time status
    is_realtime_connected,
    last_updated
  }
} 