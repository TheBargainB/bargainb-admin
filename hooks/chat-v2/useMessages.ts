'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useToast } from '@/hooks/use-toast'
import type { 
  Message, 
  Conversation,
  MessageInsert,
  MessagesResponse,
  MessageInputState,
  MessageStatus
} from '@/types/chat-v2.types'
import {
  getMessagesByConversation,
  createMessage,
  updateMessage,
  updateMessageStatus,
  deleteMessage,
  updateConversationLastMessage
} from '@/actions/chat-v2'

// =============================================================================
// TYPES
// =============================================================================

export interface UseMessagesOptions {
  conversation_id?: string
  auto_fetch?: boolean
  messages_per_page?: number
}

export interface UseMessagesReturn {
  // Data
  messages: Message[]
  conversation: Conversation | null
  total_count: number
  
  // Pagination
  has_more: boolean
  current_page: number
  
  // Loading states
  is_loading: boolean
  is_refreshing: boolean
  is_sending: boolean
  is_loading_more: boolean
  
  // Error states
  error: string | null
  
  // Message input state
  input_state: MessageInputState
  
  // Actions
  fetchMessages: () => Promise<void>
  refreshMessages: () => Promise<void>
  loadMoreMessages: () => Promise<void>
  sendMessage: (content: string) => Promise<void>
  updateMessageContent: (messageId: string, content: string) => Promise<void>
  deleteMessageById: (messageId: string) => Promise<void>
  markMessagesAsRead: () => Promise<void>
  
  // Input actions
  setInputContent: (content: string) => void
  setReplyToMessage: (message: Message | null) => void
  handleInputChange: (contentOrEvent: string | React.ChangeEvent<HTMLTextAreaElement>) => void
  handleCancelReply: () => void
  clearInput: () => void
  clearError: () => void
  
  // State setters for unified real-time manager
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  setConversation: React.Dispatch<React.SetStateAction<Conversation | null>>
  
  // Utilities
  getLatestMessage: () => Message | null
  getUnreadMessages: () => Message[]
}

// =============================================================================
// HOOK - PURE DATA MANAGER (NO SUBSCRIPTIONS)
// =============================================================================

export const useMessages = (options: UseMessagesOptions = {}): UseMessagesReturn => {
  const {
    conversation_id,
    auto_fetch = true,
    messages_per_page = 50
  } = options

  const { toast } = useToast()

  // =============================================================================
  // STATE
  // =============================================================================

  const [messages, setMessages] = useState<Message[]>([])
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [total_count, setTotalCount] = useState(0)
  
  // Pagination state
  const [has_more, setHasMore] = useState(true)
  const [current_page, setCurrentPage] = useState(0)
  
  // Loading states
  const [is_loading, setIsLoading] = useState(false)
  const [is_refreshing, setIsRefreshing] = useState(false)
  const [is_sending, setIsSending] = useState(false)
  const [is_loading_more, setIsLoadingMore] = useState(false)
  
  // Error state
  const [error, setError] = useState<string | null>(null)
  
  // Message input state
  const [input_state, setInputState] = useState<MessageInputState>({
    content: '',
    is_sending: false,
    reply_to_message: undefined
  })

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const sorted_messages = useMemo(() => {
    return [...messages].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
  }, [messages])

  // =============================================================================
  // ACTIONS
  // =============================================================================

  const fetchMessages = useCallback(async () => {
    if (!conversation_id) return

    try {
      setIsLoading(true)
      setError(null)
      
      const response: MessagesResponse = await getMessagesByConversation(
        conversation_id, 
        messages_per_page, 
        0
      )
      
      setMessages(response.messages)
      setConversation(response.conversation)
      setTotalCount(response.total_count)
      setCurrentPage(1)
      setHasMore(response.messages.length >= messages_per_page)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch messages'
      setError(errorMessage)
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      
    } finally {
      setIsLoading(false)
    }
  }, [conversation_id, messages_per_page, toast])

  const refreshMessages = useCallback(async () => {
    if (!conversation_id) return

    try {
      setIsRefreshing(true)
      setError(null)
      
      const response: MessagesResponse = await getMessagesByConversation(
        conversation_id, 
        messages_per_page * (current_page || 1),
        0
      )
      
      setMessages(response.messages)
      setConversation(response.conversation)
      setTotalCount(response.total_count)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh messages'
      setError(errorMessage)
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      
    } finally {
      setIsRefreshing(false)
    }
  }, [conversation_id, messages_per_page, current_page, toast])

  const loadMoreMessages = useCallback(async () => {
    if (!conversation_id || !has_more || is_loading_more) return

    try {
      setIsLoadingMore(true)
      setError(null)
      
      const nextPage = current_page + 1
      const offset = messages_per_page * current_page
      
      const response: MessagesResponse = await getMessagesByConversation(
        conversation_id,
        messages_per_page,
        offset
      )
      
      if (response.messages.length > 0) {
        setMessages(prev => [...response.messages, ...prev])
        setCurrentPage(nextPage)
        setHasMore(response.messages.length >= messages_per_page)
      } else {
        setHasMore(false)
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load more messages'
      setError(errorMessage)
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      
    } finally {
      setIsLoadingMore(false)
    }
  }, [conversation_id, has_more, is_loading_more, current_page, messages_per_page, toast])

  const sendMessage = useCallback(async (content: string) => {
    if (!conversation_id || !content.trim() || !conversation) return

    try {
      setIsSending(true)
      setInputState(prev => ({ ...prev, is_sending: true }))
      setError(null)
      
      // Get the phone number from the conversation
      const phoneNumber = conversation.contact?.phone_number
      if (!phoneNumber) {
        throw new Error('No phone number found for this conversation')
      }

      // Call the send-message API endpoint
      const response = await fetch('/api/admin/chat/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: conversation_id,
          phoneNumber: phoneNumber,
          message: content.trim()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to send message')
      }

      // The API already handles storing the message and updating conversation stats
      // Refresh messages to get the latest state
      await refreshMessages()
      
      // Clear input
      setInputState({
        content: '',
        is_sending: false,
        reply_to_message: undefined
      })
      
      toast({
        title: 'Message sent',
        description: 'Your message has been sent successfully.',
      })
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
      setError(errorMessage)
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      
      setInputState(prev => ({ ...prev, is_sending: false }))
      
    } finally {
      setIsSending(false)
    }
  }, [conversation_id, conversation, toast, refreshMessages])

  const updateMessageContent = useCallback(async (messageId: string, content: string) => {
    try {
      await updateMessage(messageId, { content })
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content }
          : msg
      ))
      
      toast({
        title: 'Message updated',
        description: 'Message has been updated successfully.',
      })
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update message'
      setError(errorMessage)
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    }
  }, [toast])

  const deleteMessageById = useCallback(async (messageId: string) => {
    try {
      await deleteMessage(messageId)
      
      // Remove from local state
      setMessages(prev => prev.filter(msg => msg.id !== messageId))
      
      toast({
        title: 'Message deleted',
        description: 'Message has been deleted successfully.',
      })
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete message'
      setError(errorMessage)
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    }
  }, [toast])

  const markMessagesAsRead = useCallback(async () => {
    if (!conversation_id) return

    try {
      // This would typically be handled by the conversations hook
      // when a conversation is selected, but we provide it here for completeness
      console.log('📖 Marking messages as read for conversation:', conversation_id)
      
    } catch (err) {
      console.error('❌ Error marking messages as read:', err)
    }
  }, [conversation_id])

  // =============================================================================
  // INPUT ACTIONS
  // =============================================================================

  const setInputContent = useCallback((content: string) => {
    setInputState(prev => ({ ...prev, content }))
  }, [])

  const setReplyToMessage = useCallback((message: Message | null) => {
    setInputState(prev => ({ ...prev, reply_to_message: message || undefined }))
  }, [])

  const handleInputChange = useCallback((contentOrEvent: string | React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = typeof contentOrEvent === 'string' 
      ? contentOrEvent 
      : contentOrEvent.target.value
    
    setInputState(prev => ({ ...prev, content }))
  }, [])

  const handleCancelReply = useCallback(() => {
    setInputState(prev => ({ ...prev, reply_to_message: undefined }))
  }, [])

  const clearInput = useCallback(() => {
    setInputState({
      content: '',
      is_sending: false,
      reply_to_message: undefined
    })
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  const getLatestMessage = useCallback((): Message | null => {
    if (sorted_messages.length === 0) return null
    return sorted_messages[sorted_messages.length - 1]
  }, [sorted_messages])

  const getUnreadMessages = useCallback((): Message[] => {
    return sorted_messages.filter(msg => 
      msg.direction === 'inbound' && 
      msg.whatsapp_status !== 'read'
    )
  }, [sorted_messages])

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Auto-fetch when conversation_id changes
  useEffect(() => {
    if (auto_fetch && conversation_id) {
      fetchMessages()
    } else if (!conversation_id) {
      // Clear messages when no conversation is selected
      setMessages([])
      setConversation(null)
      setTotalCount(0)
      clearInput()
    }
  }, [auto_fetch, conversation_id, fetchMessages, clearInput])

  // =============================================================================
  // RETURN
  // =============================================================================

  return {
    // Data
    messages: sorted_messages,
    conversation,
    total_count,
    
    // Pagination
    has_more,
    current_page,
    
    // Loading states
    is_loading,
    is_refreshing,
    is_sending,
    is_loading_more,
    
    // Error states
    error,
    
    // Message input state
    input_state,
    
    // Actions
    fetchMessages,
    refreshMessages,
    loadMoreMessages,
    sendMessage,
    updateMessageContent,
    deleteMessageById,
    markMessagesAsRead,
    
    // Input actions
    setInputContent,
    setReplyToMessage,
    handleInputChange,
    handleCancelReply,
    clearInput,
    clearError,
    
    // State setters for unified real-time manager
    setMessages,
    setConversation,
    
    // Utilities
    getLatestMessage,
    getUnreadMessages
  }
} 