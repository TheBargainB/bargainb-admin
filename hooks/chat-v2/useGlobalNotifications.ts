import { useState, useCallback } from 'react'
import { useUnifiedRealTime } from './useUnifiedRealTime'

interface GlobalNotifications {
  unreadMessages: number
  refreshUnreadCount: () => Promise<void>
  markAllAsRead: () => Promise<void>
  isLoading: boolean
  isConnected: boolean
  connectionStatus: string
}

/**
 * 🎯 CLEAN GLOBAL NOTIFICATIONS HOOK
 * 
 * Simplified global notifications using the unified real-time manager.
 * No more complex global state, no more subscription conflicts.
 * 
 * This replaces the old bloated useGlobalNotifications.ts with a clean,
 * unified approach that leverages the centralized real-time manager.
 */
export const useGlobalNotifications = (enabled: boolean = true): GlobalNotifications => {
  const [isLoading, setIsLoading] = useState(false)
  
  // Use unified real-time manager for all notifications
  const { 
    isConnected, 
    connectionStatus, 
    globalUnreadCount, 
    refreshAll 
  } = useUnifiedRealTime({
    selectedConversationId: null, // Global notifications don't need specific conversation
    onGlobalUnreadUpdate: (count) => {
      console.log('🔔 Global unread count updated:', count)
    }
  })

  const refreshUnreadCount = useCallback(async () => {
    if (!enabled) return
    
    setIsLoading(true)
    try {
      console.log('🔄 Refreshing global unread count...')
      await refreshAll()
      console.log('✅ Global unread count refreshed')
    } catch (error) {
      console.error('❌ Error refreshing global unread count:', error)
    } finally {
      setIsLoading(false)
    }
  }, [enabled, refreshAll])

  const markAllAsRead = useCallback(async () => {
    if (!enabled) return
    
    setIsLoading(true)
    try {
      console.log('📝 Marking all conversations as read...')
      
      // Get all conversations first
      const response = await fetch('/api/admin/chat/conversations')
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      
      const data = await response.json()
      const conversations = data.conversations || []
      
      // Mark each conversation as read
      const markAsReadPromises = conversations
        .filter((conv: any) => conv.unread_count > 0)
        .map((conv: any) => 
          fetch(`/api/admin/chat/conversations/${conv.id}/read`, {
            method: 'POST'
          })
        )

      await Promise.all(markAsReadPromises)
      await refreshUnreadCount()
      
      console.log('✅ All conversations marked as read')
    } catch (error) {
      console.error('❌ Error marking all as read:', error)
    } finally {
      setIsLoading(false)
    }
  }, [enabled, refreshUnreadCount])

  return {
    unreadMessages: globalUnreadCount,
    refreshUnreadCount,
    markAllAsRead,
    isLoading,
    isConnected,
    connectionStatus
  }
}

// Export function for backward compatibility
export const refreshGlobalUnreadCount = async () => {
  try {
          const response = await fetch('/api/admin/chat/conversations')
    if (response.ok) {
      const data = await response.json()
      const conversations = data.conversations || []
      const totalUnread = conversations.reduce((total: number, conv: any) => 
        total + (conv.unread_count || 0), 0
      )
      console.log('🔄 Global unread count refreshed:', totalUnread)
      return totalUnread
    }
  } catch (error) {
    console.error('❌ Error refreshing global unread count:', error)
  }
  return 0
} 