import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { refreshGlobalUnreadCount } from '@/hooks/useGlobalNotifications'

interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'ai' | 'admin'
  senderName: string
  timestamp: string
  confidence?: number
  status?: string
  metadata?: Record<string, any>
}

interface ChatConversation {
  id: string
  user: string
  email: string
  avatar: string
  lastMessage: string
  timestamp: string
  status: 'active' | 'resolved' | 'escalated'
  unread_count: number
  type: string
  aiConfidence: number
  lastMessageAt?: string
  remoteJid?: string
  conversationId?: string
  phoneNumber?: string
}

interface UseRealTimeChatOptions {
  selectedContact: string | null
  selectedConversation: ChatConversation | undefined
  loadConversationsFromDatabase: (silent?: boolean) => Promise<void>
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  isAtBottom: () => boolean
  setDatabaseMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
}

export const useRealTimeChat = ({
  selectedContact,
  selectedConversation,
  loadConversationsFromDatabase,
  messagesEndRef,
  isAtBottom,
  setDatabaseMessages
}: UseRealTimeChatOptions) => {
  // Real-time subscriptions state
  const [messageSubscription, setMessageSubscription] = useState<any>(null)
  const [conversationSubscription, setConversationSubscription] = useState<any>(null)
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false)
  const [connectionRetryCount, setConnectionRetryCount] = useState(0)

  // Refs to avoid stale closures in real-time subscriptions
  const selectedContactRef = useRef(selectedContact)
  const selectedConversationRef = useRef(selectedConversation)

  // Keep refs updated with current values
  useEffect(() => {
    selectedContactRef.current = selectedContact
  }, [selectedContact])

  useEffect(() => {
    selectedConversationRef.current = selectedConversation
  }, [selectedConversation])

  // Store conversation ID to prevent infinite loops from object changes
  const conversationId = selectedConversation?.conversationId || selectedConversation?.id
  const remoteJid = selectedConversation?.remoteJid || selectedConversation?.email

  // ✨ REAL-TIME MESSAGE DISPLAY - Like WhatsApp ✨
  // Set up real-time subscriptions for current conversation messages
  useEffect(() => {
    if (!conversationId) {
      // Clean up existing subscriptions when no conversation is selected
      if (messageSubscription) {
        console.log('🧹 Cleaning up message subscription (no conversation selected)')
        supabase.removeChannel(messageSubscription)
        setMessageSubscription(null)
      }
      setIsRealTimeConnected(false)
      return
    }

    console.log('📡 Setting up real-time messages for conversation:', conversationId)

    // Clean up existing subscription first
    if (messageSubscription) {
      console.log('🧹 Cleaning up previous message subscription')
      supabase.removeChannel(messageSubscription)
    }

    // Create new subscription for instant message updates
    const newMessageSubscription = supabase
      .channel(`messages-${conversationId}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          console.log('🔔 NEW MESSAGE ARRIVED:', payload.new?.content?.substring(0, 50) + '...')
          
          // Instantly add the new message to the current view
          const rawMessage = payload.new
          if (rawMessage && selectedConversationRef.current) {
            
            // Format the raw database message to match ChatMessage interface
            const selectedConversation = selectedConversationRef.current
            const contactName = selectedConversation.user || 'Unknown'
            
            // Determine sender type based on direction
            let senderType: 'user' | 'admin' | 'ai' = 'user'
            let senderName = contactName
            
            if (rawMessage.direction === 'outbound') {
              senderType = 'admin'
              senderName = 'BargainB'
            } else if (rawMessage.direction === 'inbound') {
              senderType = 'user'
              senderName = contactName
            }
            
            // Check for AI generation indicators
            const rawData = rawMessage.raw_message_data as any
            if (rawData?.ai_generated || rawData?.from_ai) {
              senderType = 'ai'
              senderName = 'AI Assistant'
            }
            
            // Format message to match ChatMessage interface
            const formattedMessage: ChatMessage = {
              id: rawMessage.id,
              content: rawMessage.content || '',
              sender: senderType,
              senderName: senderName,
              timestamp: new Date(rawMessage.created_at || new Date()).toLocaleTimeString(),
              confidence: rawData?.ai_confidence || undefined,
              status: rawMessage.whatsapp_status || 'sent',
              metadata: rawData || {}
            }
            
            // Add message directly to state for instant display
            setDatabaseMessages(prevMessages => {
              // Check if message already exists to prevent duplicates
              const messageExists = prevMessages.some(msg => msg.id === formattedMessage.id)
              if (messageExists) {
                console.log('⚠️ Message already exists, skipping duplicate')
                return prevMessages
              }
              
              // Add formatted message to list
              const updatedMessages = [...prevMessages, formattedMessage]
              console.log('✅ Message formatted and added instantly to UI:', senderType, formattedMessage.content.substring(0, 30))
              return updatedMessages
            })
            
            // Auto-scroll to new message if user is at bottom
            setTimeout(() => {
              if (messagesEndRef.current && isAtBottom()) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
                console.log('📍 Auto-scrolled to new message')
              }
            }, 100)
            
            // Also refresh conversation list to update last message
            setTimeout(() => {
              loadConversationsFromDatabase(true)
            }, 200)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          console.log('🔄 Message updated (status change):', payload.new?.id)
          
          // Update the specific message in state
          const rawUpdatedMessage = payload.new
          if (rawUpdatedMessage && selectedConversationRef.current) {
            
            // Format the updated message properly
            const selectedConversation = selectedConversationRef.current
            const contactName = selectedConversation.user || 'Unknown'
            
            let senderType: 'user' | 'admin' | 'ai' = 'user'
            let senderName = contactName
            
            if (rawUpdatedMessage.direction === 'outbound') {
              senderType = 'admin'
              senderName = 'BargainB'
            } else if (rawUpdatedMessage.direction === 'inbound') {
              senderType = 'user'
              senderName = contactName
            }
            
            const rawData = rawUpdatedMessage.raw_message_data as any
            if (rawData?.ai_generated || rawData?.from_ai) {
              senderType = 'ai'
              senderName = 'AI Assistant'
            }
            
            const formattedUpdatedMessage: ChatMessage = {
              id: rawUpdatedMessage.id,
              content: rawUpdatedMessage.content || '',
              sender: senderType,
              senderName: senderName,
              timestamp: new Date(rawUpdatedMessage.created_at || new Date()).toLocaleTimeString(),
              confidence: rawData?.ai_confidence || undefined,
              status: rawUpdatedMessage.whatsapp_status || 'sent',
              metadata: rawData || {}
            }
            
            setDatabaseMessages(prevMessages => 
              prevMessages.map(msg => 
                msg.id === formattedUpdatedMessage.id ? formattedUpdatedMessage : msg
              )
            )
            console.log('✅ Message status updated instantly:', formattedUpdatedMessage.status)
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Real-time message subscription:', status)
        if (status === 'SUBSCRIBED') {
          setIsRealTimeConnected(true)
          setConnectionRetryCount(0)
          console.log('✅ Real-time messages CONNECTED - messages will appear instantly')
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setIsRealTimeConnected(false)
          console.warn('⚠️ Real-time messages DISCONNECTED:', status)
          if (connectionRetryCount < 2) {
            setConnectionRetryCount(prev => prev + 1)
            console.log('🔄 Will retry connection...')
          }
        }
      })

    setMessageSubscription(newMessageSubscription)

    return () => {
      if (newMessageSubscription) {
        console.log('🧹 Cleaning up message subscription')
        supabase.removeChannel(newMessageSubscription)
      }
    }
  }, [conversationId, connectionRetryCount]) // ✅ Only depend on primitive values that should trigger re-subscription

  // Real-time conversation list updates
  useEffect(() => {
    console.log('📡 Setting up real-time conversation list updates')

    // Clean up existing subscription first
    if (conversationSubscription) {
      supabase.removeChannel(conversationSubscription)
    }

    // Subscribe to new messages globally to update conversation list
    const newConversationSubscription = supabase
      .channel(`conversations-global-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations'
        },
        async (payload) => {
          console.log('🔔 NEW CONVERSATION CREATED - refreshing list immediately')
          
          // Refresh conversation list immediately when new conversation is created
          setTimeout(() => {
            loadConversationsFromDatabase(true)
          }, 100)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          console.log('🔔 New message globally - updating conversation list')
          
          // Update conversation list to show new last message
          setTimeout(() => {
            loadConversationsFromDatabase(true)
          }, 300)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations'
        },
        async (payload) => {
          console.log('🔔 Conversation updated - refreshing list')
          
          setTimeout(() => {
            loadConversationsFromDatabase(true)
          }, 500)
        }
      )
      .subscribe((status) => {
        console.log('📡 Conversation list subscription:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Conversation list real-time CONNECTED')
        }
      })

    setConversationSubscription(newConversationSubscription)

    return () => {
      if (newConversationSubscription) {
        console.log('🧹 Cleaning up conversation subscription')
        supabase.removeChannel(newConversationSubscription)
      }
    }
  }, []) // ✅ Empty deps - conversation list subscription should be stable

  // Cleanup function for all subscriptions
  const cleanupSubscriptions = useCallback(() => {
    if (messageSubscription) {
      console.log('🧹 Cleaning up message subscription')
      supabase.removeChannel(messageSubscription)
      setMessageSubscription(null)
    }
    if (conversationSubscription) {
      console.log('🧹 Cleaning up conversation subscription')
      supabase.removeChannel(conversationSubscription)
      setConversationSubscription(null)
    }
    setIsRealTimeConnected(false)
    setConnectionRetryCount(0)
  }, []) // ✅ Use refs instead of dependencies to avoid infinite loops

  return {
    isRealTimeConnected,
    connectionRetryCount,
    cleanupSubscriptions
  }
} 