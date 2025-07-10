'use client'

import { useState, useCallback, useMemo } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useConversations } from './useConversations'
import { useMessages } from './useMessages'
import { useContacts } from './useContacts'
import { useNotifications } from './useNotifications'

// =============================================================================
// TYPES
// =============================================================================

export interface UseChatManagementOptions {
  enable_realtime?: boolean
  enable_notifications?: boolean
  enable_sound?: boolean
  auto_fetch?: boolean
}

export interface ChatPanelState {
  conversations_panel_width: number
  messages_panel_width: number
  contact_panel_width: number
  is_contact_panel_visible: boolean
  is_mobile_view: boolean
}

export interface UseChatManagementReturn {
  // Sub-hooks (full access to all their functionality)
  conversations: ReturnType<typeof useConversations>
  messages: ReturnType<typeof useMessages>
  contacts: ReturnType<typeof useContacts>
  notifications: ReturnType<typeof useNotifications>
  
  // Panel state
  panel_state: ChatPanelState
  
  // Combined state
  selected_conversation_id: string | null
  is_loading: boolean
  has_errors: boolean
  
  // Main actions
  selectConversation: (conversationId: string | null) => Promise<void>
  startNewConversation: (contactPhone: string) => Promise<void>
  markCurrentConversationAsRead: () => Promise<void>
  refreshAll: () => Promise<void>
  clearAllErrors: () => void
  
  // Panel controls
  toggleContactPanel: () => void
  setContactPanelVisible: (visible: boolean) => void
  setPanelWidths: (widths: Partial<Omit<ChatPanelState, 'is_contact_panel_visible' | 'is_mobile_view'>>) => void
  setMobileView: (isMobile: boolean) => void
  
  // Connection status
  is_connected: boolean
  connection_status: string
}

// =============================================================================
// HOOK
// =============================================================================

export const useChatManagement = (options: UseChatManagementOptions = {}): UseChatManagementReturn => {
  const {
    enable_realtime = true,
    enable_notifications = true,
    enable_sound = false,
    auto_fetch = true
  } = options

  const { toast } = useToast()

  // =============================================================================
  // PANEL STATE
  // =============================================================================

  const [panel_state, setPanelState] = useState<ChatPanelState>({
    conversations_panel_width: 320,
    messages_panel_width: 600,
    contact_panel_width: 300,
    is_contact_panel_visible: false,
    is_mobile_view: false
  })

  const [selected_conversation_id, setSelectedConversationId] = useState<string | null>(null)

  // =============================================================================
  // SUB-HOOKS
  // =============================================================================

  const conversations = useConversations({
    auto_fetch,
    enable_realtime
  })

  const messages = useMessages({
    conversation_id: selected_conversation_id || undefined,
    auto_fetch,
    enable_realtime
  })

  const contacts = useContacts({
    auto_fetch,
    enable_search: true
  })

  const notifications = useNotifications({
    enable_realtime: enable_realtime && enable_notifications,
    enable_sound,
    max_notifications: 10
  })

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const is_loading = useMemo(() => {
    return conversations.is_loading || 
           messages.is_loading || 
           contacts.is_loading || 
           notifications.is_loading
  }, [conversations.is_loading, messages.is_loading, contacts.is_loading, notifications.is_loading])

  const has_errors = useMemo(() => {
    return !!(conversations.error || 
              messages.error || 
              contacts.error || 
              notifications.error)
  }, [conversations.error, messages.error, contacts.error, notifications.error])

  const is_connected = useMemo(() => {
    if (!enable_realtime) return true
    return conversations.is_realtime_connected && 
           messages.is_realtime_connected &&
           notifications.is_realtime_connected
  }, [
    enable_realtime,
    conversations.is_realtime_connected, 
    messages.is_realtime_connected,
    notifications.is_realtime_connected
  ])

  const connection_status = useMemo(() => {
    if (!enable_realtime) return 'Disabled'
    if (is_connected) return 'Connected'
    if (is_loading) return 'Connecting...'
    return 'Disconnected'
  }, [enable_realtime, is_connected, is_loading])

  // =============================================================================
  // MAIN ACTIONS
  // =============================================================================

  const selectConversation = useCallback(async (conversationId: string | null) => {
    try {
      setSelectedConversationId(conversationId)
      
      // Update conversations hook
      await conversations.selectConversation(conversationId)
      
      // Auto-mark as read when selecting a conversation
      if (conversationId) {
        await conversations.markAsRead(conversationId)
        await notifications.markConversationAsRead(conversationId)
      }
      
      // Clear contact panel selection when switching conversations
      await contacts.selectContact(null)
      
      // If no conversation selected, hide contact panel
      if (!conversationId) {
        setPanelState(prev => ({ ...prev, is_contact_panel_visible: false }))
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to select conversation'
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    }
  }, [conversations, notifications, contacts, toast])

  const startNewConversation = useCallback(async (contactPhone: string) => {
    try {
      // Find or create contact
      let contact = contacts.findContactByPhone(contactPhone)
      
      if (!contact) {
        contact = await contacts.createNewContact({
          phone_number: contactPhone,
          whatsapp_jid: `${contactPhone.replace('+', '')}@s.whatsapp.net`
        })
      }
      
      // Create conversation record in database
      const conversationData = {
        whatsapp_contact_id: contact.id,
        whatsapp_conversation_id: contact.whatsapp_jid
      }
      
      // Import and use the createConversation action
      const { createConversation } = await import('@/actions/chat-v2/conversations.actions')
      const newConversation = await createConversation(conversationData)
      
      // Refresh conversations list to include the new conversation
      await conversations.refreshConversations()
      
      // Select the new conversation
      await selectConversation(newConversation.id)
      
      toast({
        title: 'New Conversation',
        description: `Started conversation with ${contacts.getDisplayName(contact)}`,
      })
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start new conversation'
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    }
  }, [contacts, conversations, selectConversation, toast])

  const markCurrentConversationAsRead = useCallback(async () => {
    if (!selected_conversation_id) return

    try {
      await conversations.markAsRead(selected_conversation_id)
      await notifications.markConversationAsRead(selected_conversation_id)
      
    } catch (err) {
      console.error('❌ Error marking conversation as read:', err)
    }
  }, [selected_conversation_id, conversations, notifications])

  const refreshAll = useCallback(async () => {
    try {
      await Promise.all([
        conversations.refreshConversations(),
        messages.refreshMessages(),
        contacts.refreshContacts(),
        notifications.refreshNotifications()
      ])
      
      toast({
        title: 'Refreshed',
        description: 'All data has been refreshed successfully.',
      })
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh data'
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    }
  }, [conversations, messages, contacts, notifications, toast])

  const clearAllErrors = useCallback(() => {
    conversations.clearError()
    messages.clearError()
    contacts.clearError()
    notifications.clearError()
  }, [conversations, messages, contacts, notifications])

  // =============================================================================
  // PANEL CONTROLS
  // =============================================================================

  const toggleContactPanel = useCallback(() => {
    setPanelState(prev => ({
      ...prev,
      is_contact_panel_visible: !prev.is_contact_panel_visible
    }))
  }, [])

  const setContactPanelVisible = useCallback((visible: boolean) => {
    setPanelState(prev => ({
      ...prev,
      is_contact_panel_visible: visible
    }))
  }, [])

  const setPanelWidths = useCallback((widths: Partial<Omit<ChatPanelState, 'is_contact_panel_visible' | 'is_mobile_view'>>) => {
    setPanelState(prev => ({
      ...prev,
      ...widths
    }))
  }, [])

  const setMobileView = useCallback((isMobile: boolean) => {
    setPanelState(prev => ({
      ...prev,
      is_mobile_view: isMobile,
      // Auto-hide contact panel on mobile
      is_contact_panel_visible: isMobile ? false : prev.is_contact_panel_visible
    }))
  }, [])

  // =============================================================================
  // RETURN
  // =============================================================================

  return {
    // Sub-hooks (full access to all their functionality)
    conversations,
    messages,
    contacts,
    notifications,
    
    // Panel state
    panel_state,
    
    // Combined state
    selected_conversation_id,
    is_loading,
    has_errors,
    
    // Main actions
    selectConversation,
    startNewConversation,
    markCurrentConversationAsRead,
    refreshAll,
    clearAllErrors,
    
    // Panel controls
    toggleContactPanel,
    setContactPanelVisible,
    setPanelWidths,
    setMobileView,
    
    // Connection status
    is_connected,
    connection_status
  }
} 