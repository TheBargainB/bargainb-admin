import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface NotificationItem {
  id: string
  type: 'message' | 'conversation' | 'system'
  title: string
  description: string
  timestamp: Date
  read: boolean
  data?: {
    conversationId?: string
    contactName?: string
    contactPhone?: string
    messagePreview?: string
  }
}

export interface NotificationStats {
  unreadCount: number
  totalCount: number
  recentItems: NotificationItem[]
}

export interface UseNotificationsReturn {
  notifications: NotificationItem[]
  unreadCount: number
  isLoading: boolean
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refresh: () => Promise<void>
}

export const useNotifications = (): UseNotificationsReturn => {
  console.log('🔔 NOTIFICATIONS: Hook initializing')
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Load notifications from conversations with unread messages
  const loadNotifications = useCallback(async () => {
    try {
      console.log('🔔 NOTIFICATIONS: Loading notifications')
      setIsLoading(true)

      // Get recent conversations with unread messages
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
          id,
          title,
          description,
          last_message_at,
          unread_count,
          whatsapp_contacts (
            phone_number,
            display_name,
            push_name
          )
        `)
        .gt('unread_count', 0)
        .order('last_message_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('🔔 NOTIFICATIONS: Error loading conversations:', error)
        return
      }

      // Get last messages for each conversation
      const notificationItems: NotificationItem[] = []
      
      for (const conv of conversations || []) {
        // Get the last message for this conversation
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        const contact = conv.whatsapp_contacts
        const contactName = contact?.display_name || contact?.push_name || `Contact ${contact?.phone_number}` || 'Unknown Contact'
        const messagePreview = lastMessage?.content || 'New message received'
        
        notificationItems.push({
          id: `conv-${conv.id}`,
          type: 'message' as const,
          title: contactName,
          description: messagePreview.length > 50 ? `${messagePreview.substring(0, 50)}...` : messagePreview,
          timestamp: new Date(lastMessage?.created_at || conv.last_message_at || new Date()),
          read: false,
          data: {
            conversationId: conv.id,
            contactName,
            contactPhone: contact?.phone_number,
            messagePreview
          }
        })
      }

      setNotifications(notificationItems)
      setUnreadCount(notificationItems.length)
      
      console.log('🔔 NOTIFICATIONS: Loaded', notificationItems.length, 'notifications')
    } catch (error) {
      console.error('🔔 NOTIFICATIONS: Error loading notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      console.log('🔔 NOTIFICATIONS: Marking as read:', notificationId)
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      )
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1))
      
      // If it's a conversation notification, mark the conversation as read
      const notification = notifications.find(n => n.id === notificationId)
      if (notification?.data?.conversationId) {
        await supabase
          .from('conversations')
          .update({ unread_count: 0 })
          .eq('id', notification.data.conversationId)
      }
      
    } catch (error) {
      console.error('🔔 NOTIFICATIONS: Error marking as read:', error)
    }
  }, [notifications])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      console.log('🔔 NOTIFICATIONS: Marking all as read')
      
      // Update local state
      setNotifications(prev => prev.map(notification => ({ ...notification, read: true })))
      setUnreadCount(0)
      
      // Mark all conversations as read
      await supabase
        .from('conversations')
        .update({ unread_count: 0 })
        .gt('unread_count', 0)
        
    } catch (error) {
      console.error('🔔 NOTIFICATIONS: Error marking all as read:', error)
    }
  }, [])

  // Set up real-time subscription for new messages
  useEffect(() => {
    console.log('🔔 NOTIFICATIONS: Setting up real-time subscription')
    
    // Subscribe to conversation updates
    const conversationSubscription = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: 'unread_count.gt.0'
        },
        (payload) => {
          console.log('🔔 NOTIFICATIONS: Conversation updated:', payload)
          loadNotifications()
        }
      )
      .subscribe()

    // Initial load
    loadNotifications()

    // Cleanup subscription
    return () => {
      console.log('🔔 NOTIFICATIONS: Cleaning up subscription')
      supabase.removeChannel(conversationSubscription)
    }
  }, [loadNotifications])

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refresh: loadNotifications
  }
} 