// =============================================================================
// CHAT 2.0 HOOKS - CLEAN EXPORTS
// =============================================================================

// Specialized Hooks
export { useConversations } from './useConversations'
export type { UseConversationsOptions, UseConversationsReturn } from './useConversations'

export { useMessages } from './useMessages'
export type { UseMessagesOptions, UseMessagesReturn } from './useMessages'

export { useContacts } from './useContacts'
export type { UseContactsOptions, UseContactsReturn } from './useContacts'

export { useNotifications } from './useNotifications'
export type { UseNotificationsOptions, UseNotificationsReturn } from './useNotifications'

// Main Orchestrator Hook
export { useChatManagement } from './useChatManagement'
export type { 
  UseChatManagementOptions, 
  UseChatManagementReturn,
  ChatPanelState 
} from './useChatManagement'

// =============================================================================
// RE-EXPORTS FOR CONVENIENCE
// =============================================================================

// Most common usage - import the main hook
export { useChatManagement as default } from './useChatManagement' 