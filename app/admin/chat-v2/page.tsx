'use client'

import { useState, useEffect, useCallback } from 'react'
import { AlertCircle, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'

// Chat 2.0 Components
import { ConversationList } from '@/components/chat-v2/conversations/ConversationList'
import { MessageArea } from '@/components/chat-v2/messages/MessageArea'
import { ContactProfile } from '@/components/chat-v2/contacts/ContactProfile'
import { ContactsDialog } from '@/components/chat-v2/contacts/ContactsDialog'
import { NewContactDialog } from '@/components/chat-v2/contacts/NewContactDialog'
import { AssistantAssignmentDialog } from '@/components/chat-v2/contacts/AssistantAssignmentDialog'
import { MessageInput } from '@/components/chat-v2/messages/MessageInput'
import { RealTimeDebugger } from '@/components/chat-v2/RealTimeDebugger'

// Chat 2.0 Hooks
import { useChatManagement } from '@/hooks/chat-v2/useChatManagement'
import { createClient } from '@/utils/supabase/client'

// Types
import type { Contact } from '@/types/chat-v2.types'
import type { MessageType } from '@/types/chat-v2.types'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ChatV2Page() {
  // =============================================================================
  // HOOKS & STATE
  // =============================================================================

  const {
    // Sub-hooks
    conversations,
    messages,
    contacts,
    notifications,
    
    // Main state
    selected_conversation_id,
    is_loading,
    has_errors,
    is_connected,
    
    // Panel state
    panel_state,
    
    // Actions
    selectConversation,
    startNewConversation,
    markCurrentConversationAsRead,
    refreshAll,
    clearAllErrors,
    
    // Panel controls
    toggleContactPanel,
    setContactPanelVisible,
    setPanelWidths,
    setMobileView
  } = useChatManagement()

  const { toast } = useToast()
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Local state for dialogs
  const [isContactsDialogOpen, setIsContactsDialogOpen] = useState(false)
  const [isNewContactDialogOpen, setIsNewContactDialogOpen] = useState(false)
  const [isAssistantAssignmentDialogOpen, setIsAssistantAssignmentDialogOpen] = useState(false)
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([])
  const [contactForAssignment, setContactForAssignment] = useState<Contact | null>(null)

  // State for loading messages
  const [isLoading, setIsLoading] = useState(false)

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleConversationSelect = (conversationId: string) => {
    selectConversation(conversationId)
    
    // Auto-mark conversation as read when selected
    conversations.markAsRead(conversationId)
    
    setContactPanelVisible(true) // Auto-open contact profile
  }

  // =============================================================================
  // MESSAGE SENDING WITH WASENDER INTEGRATION
  // =============================================================================

  // Use the messages.sendMessage function directly - it has proper real-time integration
  const handleSendMessage = useCallback(async (content: string, messageType?: MessageType, mediaFile?: File) => {
    if (!content.trim()) return

    try {
      // Use the messages hook's sendMessage function which has proper real-time integration
      await messages.sendMessage(content)
      
      // Refresh conversations to update last message (this is handled by real-time but good for backup)
      await conversations.refreshConversations()

    } catch (error) {
      console.error('❌ Send message error:', error)
      
      toast({
        title: "Failed to send message",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      })
    }
  }, [messages, conversations, toast])

  // =============================================================================
  // REAL-TIME UPDATES SETUP
  // =============================================================================

  // Real-time subscriptions are handled by individual hooks (useMessages, useConversations, etc.)
  // No additional page-level subscriptions needed to avoid conflicts

  // =============================================================================
  // PERIODIC REFRESH FOR RELIABILITY (REDUCED FREQUENCY)
  // =============================================================================

  useEffect(() => {
    if (!isClient) return

    // Set up periodic refresh as backup when disconnected (reduced frequency)
    const interval = setInterval(() => {
      if (!is_connected) {
        console.log('🔄 Backup refresh while disconnected...')
        refreshAll()
      }
    }, 60000) // 60 seconds

    return () => clearInterval(interval)
  }, [isClient, is_connected, refreshAll])

  const handleContactProfileSendMessage = () => {
    console.log('Send message clicked from contact profile')
    // TODO: Focus on message input or trigger send action
  }

  const handleNewConversation = () => {
    setIsContactsDialogOpen(true)
  }

  const handleStartConversation = (selectedContacts: any[]) => {
    if (selectedContacts.length > 0) {
      startNewConversation(selectedContacts[0].phone_number)
      setIsContactsDialogOpen(false)
    }
  }

  const handleCreateNewContact = async (contact: any) => {
    // Add the new contact to the list and close the dialog
    await contacts.refreshContacts()
    setIsNewContactDialogOpen(false)
  }

  const handleContactDelete = async (contactId: string) => {
    try {
      await contacts.deleteContactById(contactId)
      // Refresh contacts list to remove the deleted contact
      await contacts.refreshContacts()
    } catch (error) {
      console.error('Error deleting contact:', error)
    }
  }

  const handleAssignAI = (contactId: string) => {
    // Find the contact by ID
    const contact = conversations.selected_conversation?.contact
    if (contact) {
      setContactForAssignment(contact)
      setIsAssistantAssignmentDialogOpen(true)
    }
  }

  const handleAssignmentDialogClose = () => {
    setIsAssistantAssignmentDialogOpen(false)
    setContactForAssignment(null)
  }

  const handleAssignmentChange = () => {
    // Refresh data after assignment change
    conversations.refreshConversations()
    toast({
      title: "Assignment Updated",
      description: "AI assistant assignment has been updated successfully.",
    })
  }

  // Handle contact profile collapse/expand
  const [isContactPanelCollapsed, setIsContactPanelCollapsed] = useState(false)

  const handleContactPanelToggle = (collapsed: boolean) => {
    setIsContactPanelCollapsed(collapsed)
  }


  const handleContactSelection = (contact: Contact) => {
    setSelectedContactIds([contact.id])
  }

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderError = () => {
    if (!has_errors) return null

    const firstError = conversations.error || messages.error || contacts.error || notifications.error

    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {firstError || 'An error occurred. Please try again.'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const renderLoadingSkeleton = () => (
    <div className="flex h-[calc(100vh-5rem)] bg-gray-100 dark:bg-gray-900">
      {/* Left panel skeleton */}
      <div className="w-96 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-full" />
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Center panel skeleton */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
          <Skeleton className="h-6 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    </div>
  )

  const renderEmptyState = () => (
    <div className="flex-1 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6 mx-auto">
          <MessageSquare className="w-12 h-12 text-gray-400" />
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Welcome to Chat 2.0
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Select a conversation from the list to start chatting, or create a new conversation with your contacts.
        </p>
        
        <Button 
          onClick={handleNewConversation}
          className="bg-green-600 hover:bg-green-700"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Start New Chat
        </Button>
      </div>
    </div>
  )

  // =============================================================================
  // RENDER
  // =============================================================================

  // Show loading skeleton on initial load
  if (conversations.is_loading && conversations.conversations.length === 0) {
    return renderLoadingSkeleton()
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* Error display */}
      {renderError()}
      
      {/* Left Panel - Conversations (Extra Wide for Full Message Preview) */}
      <div className={cn(
        'w-[28rem] flex-shrink-0 bg-white dark:bg-gray-900',
        'border-r border-gray-200 dark:border-gray-700',
        'overflow-hidden flex flex-col h-full'
      )}>
        <ConversationList
          conversations={conversations.conversations}
          selected_conversation_id={conversations.selected_conversation?.id}
          total_count={conversations.total_count}
          total_unread={conversations.total_unread}
          search_term={conversations.search_term}
          filters={conversations.filters}
          is_loading={conversations.is_loading}
          is_refreshing={conversations.is_refreshing}
          is_syncing_contacts={contacts.is_syncing}
          onConversationSelect={handleConversationSelect}
          onSearchChange={conversations.setSearchTerm}
          onFilterChange={conversations.updateFilters}
          onRefresh={conversations.refreshConversations}
          onNewConversation={handleNewConversation}
          onSyncContacts={contacts.syncContacts}
        />
      </div>

      {/* Center Panel - Messages (Expanded) */}
      <div className="flex-1 flex flex-col min-w-0 max-w-none h-full overflow-hidden">
          {/* Message Area */}
          {conversations.selected_conversation ? (
            <MessageArea
              conversation={conversations.selected_conversation}
              messages={messages.messages}
              input_state={messages.input_state}
              is_loading_messages={messages.is_loading}
              is_sending_message={messages.is_sending}
              has_more_messages={messages.has_more}
              onSendMessage={messages.sendMessage}
              onLoadMoreMessages={messages.loadMoreMessages}
              onMessageReply={messages.setReplyToMessage}
              onMessageDelete={messages.deleteMessageById}
              onMessageCopy={(content) => navigator.clipboard.writeText(content)}
              onInputChange={messages.handleInputChange}
              onReplyCancel={messages.handleCancelReply}
              onMarkAsRead={messages.markMessagesAsRead}
            />
          ) : (
            renderEmptyState()
          )}
      </div>

      {/* Right Panel - Contact Profile (Collapsible) */}
      {panel_state.is_contact_panel_visible && conversations.selected_conversation && (
        <div className={cn(
          "flex-shrink-0 border-l border-gray-200 dark:border-gray-700 overflow-hidden h-full transition-all duration-300",
          "w-[28rem]"
        )}>
          <ContactProfile
            contact={conversations.selected_conversation?.contact}
            conversation={conversations.selected_conversation}
            is_visible={true}
            onSendMessage={handleContactProfileSendMessage}
            onDeleteContact={handleContactDelete}
            onCollapseToggle={handleContactPanelToggle}
          />
        </div>
      )}

      {/* Contacts Dialog */}
      <ContactsDialog
        is_open={isContactsDialogOpen}
        contacts={contacts.contacts}
        selected_contact_ids={[]}
        search_term={contacts.search_term}
        is_loading={contacts.is_loading}
        allow_multiple={false}
        onClose={() => setIsContactsDialogOpen(false)}
        onContactSelect={handleContactSelection}
        onSearchChange={contacts.setSearchTerm}
        onStartConversation={handleStartConversation}
        onCreateNewContact={() => setIsNewContactDialogOpen(true)}
        onContactDelete={handleContactDelete}
      />

      {/* New Contact Dialog */}
      <NewContactDialog
        is_open={isNewContactDialogOpen}
        onClose={() => setIsNewContactDialogOpen(false)}
        onContactCreated={handleCreateNewContact}
      />

      {/* Assistant Assignment Dialog */}
      <AssistantAssignmentDialog
        isOpen={isAssistantAssignmentDialogOpen}
        contact={contactForAssignment}
        onClose={handleAssignmentDialogClose}
        onAssignmentChange={handleAssignmentChange}
      />

      {/* Connection status indicator */}
      {!is_connected && (
        <div className="absolute top-4 right-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-sm">
          Reconnecting...
        </div>
      )}

      {/* Debug Panel - Temporary for troubleshooting */}
      <div className="absolute bottom-4 right-4 w-80">
        <RealTimeDebugger
          selectedConversationId={selected_conversation_id}
          className="w-full"
        />
      </div>
    </div>
  )
} 