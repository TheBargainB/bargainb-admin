// =============================================================================
// DEPRECATED: This hook has been replaced by the unified real-time system
// =============================================================================

// ❌ OLD BROKEN SYSTEM (DISABLED)
// This hook had multiple problems:
// - Complex global state management
// - Competing subscription setups
// - Channel conflicts
// - Disabled subscriptions due to bugs

// ✅ NEW UNIFIED SYSTEM
// Use the new unified system instead:
// import { useGlobalNotifications } from './chat-v2/useGlobalNotifications'

import { useGlobalNotifications as useNewGlobalNotifications } from './chat-v2/useGlobalNotifications'

interface GlobalNotifications {
  unreadMessages: number
  refreshUnreadCount: () => Promise<void>
  markAllAsRead: () => Promise<void>
  isLoading: boolean
}

// Backward compatibility wrapper
export const useGlobalNotifications = (enabled: boolean = true): GlobalNotifications => {
  console.warn('⚠️ DEPRECATED: useGlobalNotifications from hooks/useGlobalNotifications.ts')
  console.warn('✅ Use: import { useGlobalNotifications } from "./chat-v2/useGlobalNotifications"')
  
  const {
    unreadMessages,
    refreshUnreadCount,
    markAllAsRead,
    isLoading
  } = useNewGlobalNotifications(enabled)
  
  return {
    unreadMessages,
    refreshUnreadCount,
    markAllAsRead,
    isLoading
  }
}

// Export function for backward compatibility
export const refreshGlobalUnreadCount = async () => {
  console.warn('⚠️ DEPRECATED: refreshGlobalUnreadCount from hooks/useGlobalNotifications.ts')
  console.warn('✅ Use: import { refreshGlobalUnreadCount } from "./chat-v2/useGlobalNotifications"')
  
  const { refreshGlobalUnreadCount: newRefresh } = await import('./chat-v2/useGlobalNotifications')
  return newRefresh()
} 