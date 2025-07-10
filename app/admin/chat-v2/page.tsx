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
import { MessageInput } from '@/components/chat-v2/messages/MessageInput'

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
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([])

  // State for loading messages
  const [isLoading, setIsLoading] = useState(false)

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleConversationSelect = (conversationId: string) => {
    selectConversation(conversationId)
    setContactPanelVisible(true) // Auto-open contact profile
  }

  // =============================================================================
  // MESSAGE SENDING WITH WASENDER INTEGRATION
  // =============================================================================

  const handleSendMessage = useCallback(async (content: string, messageType?: MessageType, mediaFile?: File) => {
    if (!conversations.selected_conversation || !content.trim()) return

    // Get contact phone number
    const contact = conversations.selected_conversation?.contact
    const phoneNumber = contact?.phone_number
    
    if (!phoneNumber) {
      toast({
        title: "Cannot send message",
        description: "Contact phone number not found",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      console.log('📤 Sending message via API:', {
        conversationId: conversations.selected_conversation.id,
        phoneNumber,
        content,
        messageType
      })

      // Prepare request data
      const requestData: any = {
        conversationId: conversations.selected_conversation.id,
        phoneNumber: phoneNumber,
        message: content,
        messageType: messageType || 'text'
      }

      // Handle media file if provided
      if (mediaFile && messageType !== 'text') {
        // TODO: Upload media file to cloud storage and get URL
        // For now, we'll skip media files
        console.warn('⚠️ Media file upload not implemented yet')
        toast({
          title: "Media not supported yet",
          description: "Text messages only for now",
          variant: "destructive"
        })
        return
      }

      // Add reply context if replying
      if (messages.input_state.reply_to_message) {
        requestData.replyToMessageId = messages.input_state.reply_to_message.id
      }

      // Send message via API
      const response = await fetch('/admin/chat-v2/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to send message')
      }

      console.log('✅ Message sent successfully:', result.data)

      // Clear input state
      messages.handleInputChange('')
      messages.handleCancelReply()

      // Refresh messages to show the sent message
      await messages.refreshMessages()

      // Refresh conversations to update last message
      await conversations.refreshConversations()

      toast({
        title: "Message sent",
        description: "Your message has been delivered",
        variant: "default"
      })

    } catch (error) {
      console.error('❌ Send message error:', error)
      
      toast({
        title: "Failed to send message",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [conversations.selected_conversation, conversations, messages, toast])

  // =============================================================================
  // REAL-TIME UPDATES SETUP
  // =============================================================================

  useEffect(() => {
    if (!isClient || !conversations.selected_conversation) return

    console.log('🔔 Setting up real-time subscription for conversation:', conversations.selected_conversation.id)
    
    const supabase = createClient()
    
    // Subscribe to new messages in the current conversation
    const messageChannel = supabase
      .channel(`messages:${conversations.selected_conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversations.selected_conversation.id}`
        },
        (payload) => {
          console.log('🔔 New message received via real-time:', payload.new)
          
          // Refresh messages to show the new message
          messages.refreshMessages()
          
          // Update conversation last message time
          conversations.refreshConversations()
          
          // Update notification counts
          conversations.refreshNotifications()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversations.selected_conversation.id}`
        },
        (payload) => {
          console.log('🔔 Message updated via real-time:', payload.new)
          
          // Refresh messages to show status updates
          messages.refreshMessages()
        }
      )
      .subscribe()

    // Subscribe to conversation updates (unread count, etc.)
    const conversationChannel = supabase
      .channel(`conversation:${conversations.selected_conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `id=eq.${conversations.selected_conversation.id}`
        },
        (payload) => {
          console.log('🔔 Conversation updated via real-time:', payload.new)
          
          // Refresh conversations list
          conversations.refreshConversations()
          
          // Update notifications
          conversations.refreshNotifications()
        }
      )
      .subscribe()

    // Global message subscription for all conversations (for notification updates)
    const globalMessageChannel = supabase
      .channel('global-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: 'direction=eq.inbound'
        },
        (payload) => {
          console.log('🔔 New inbound message globally:', payload.new)
          
          // Update global notification counts
          conversations.refreshNotifications()
          
          // If it's not for the current conversation, just update notifications
          if (conversations.selected_conversation && payload.new.conversation_id !== conversations.selected_conversation.id) {
            conversations.refreshConversations()
          }
        }
      )
      .subscribe()

    // Cleanup subscriptions
    return () => {
      console.log('🔔 Cleaning up real-time subscriptions')
      supabase.removeChannel(messageChannel)
      supabase.removeChannel(conversationChannel)
      supabase.removeChannel(globalMessageChannel)
    }
  }, [isClient, conversations.selected_conversation, messages, conversations])

  // =============================================================================
  // PERIODIC REFRESH FOR RELIABILITY
  // =============================================================================

  useEffect(() => {
    if (!isClient) return

    // Set up periodic refresh every 30 seconds as backup to real-time
    const refreshInterval = setInterval(() => {
      console.log('🔄 Periodic refresh triggered')
      
      // Only refresh if not actively loading
      if (!conversations.is_loading && !messages.is_loading) {
        conversations.refreshConversations()
        conversations.refreshNotifications()
        
        if (conversations.selected_conversation) {
          messages.refreshMessages()
        }
      }
    }, 30000) // 30 seconds

    return () => {
      clearInterval(refreshInterval)
    }
  }, [isClient, conversations, messages])

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
      
      {/* Left Panel - Conversations (Wider for Better Message Preview) */}
      <div className={cn(
        'w-96 flex-shrink-0 bg-white dark:bg-gray-900',
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

      {/* Right Panel - Contact Profile (Wider Fixed Width) */}
      {panel_state.is_contact_panel_visible && conversations.selected_conversation && (
        <div className="w-[28rem] flex-shrink-0 border-l border-gray-200 dark:border-gray-700 overflow-hidden h-full">
          <ContactProfile
            contact={conversations.selected_conversation?.contact}
            conversation={conversations.selected_conversation}
            is_visible={true}
            onSendMessage={handleContactProfileSendMessage}
       
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

      {/* Connection status indicator */}
      {!is_connected && (
        <div className="absolute top-4 right-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-sm">
          Reconnecting...
        </div>
      )}
    </div>
  )
} 