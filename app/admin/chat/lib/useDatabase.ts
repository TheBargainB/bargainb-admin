import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { refreshGlobalUnreadCount } from '@/hooks/useGlobalNotifications'
import { ContactService } from './contact-service'

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

interface UseDatabaseOptions {
  onConversationsUpdate?: (conversations: ChatConversation[]) => void
  onMessagesUpdate?: (messages: ChatMessage[]) => void
  onContactsCountUpdate?: (count: number) => void
}

export const useDatabase = ({
  onConversationsUpdate,
  onMessagesUpdate,
  onContactsCountUpdate
}: UseDatabaseOptions = {}) => {
  const { toast } = useToast()
  
  // Loading states
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [isLoadingContactsCount, setIsLoadingContactsCount] = useState(false)
  const [isDeletingConversation, setIsDeletingConversation] = useState(false)

  // Data states
  const [contactsCount, setContactsCount] = useState(0)
  const [aiPromptsData, setAiPromptsData] = useState<any>(null)

  // Load messages for selected conversation from database
  const loadMessagesFromDatabase = async (remoteJid: string, silent: boolean = false) => {
    if (!remoteJid) return []

    try {
      if (!silent) {
        setIsLoadingMessages(true)
      }
      console.log('📨 Loading messages from database for:', remoteJid)
      
      const url = `/admin/chat/api/messages?remoteJid=${encodeURIComponent(remoteJid)}`
      console.log('🔗 API URL:', url)
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('📦 API Response:', result)
      
      if (result.success) {
        console.log(`✅ Loaded ${result.data.messages.length} messages from database`)
        const messages = result.data.messages || []
        
        // Update via callback if provided
        if (onMessagesUpdate) {
          onMessagesUpdate(messages)
        }
        
        return messages
      } else {
        console.log('📭 No messages found in database for this conversation')
        if (onMessagesUpdate) {
          onMessagesUpdate([])
        }
        return []
      }
    } catch (error) {
      console.error('❌ Error loading messages from database:', error)
      if (onMessagesUpdate) {
        onMessagesUpdate([])
      }
      if (!silent) {
        toast({
          title: "Error loading messages",
          description: "Failed to load conversation messages from database.",
          variant: "destructive"
        })
      }
      return []
    } finally {
      if (!silent) {
        setIsLoadingMessages(false)
      }
    }
  }

  // Load conversations from database
  const loadConversationsFromDatabase = async (silent: boolean = false) => {
    try {
      if (!silent) {
        setIsLoadingConversations(true)
        console.log('💬 Loading conversations from database...')
      }
      
      const response = await fetch('/admin/chat/api/conversations')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch conversations: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        if (!silent) {
          console.log(`✅ Loaded ${result.data.conversations.length} conversations from database`)
        }
        const conversations = result.data.conversations || []
        
        // Update via callback if provided
        if (onConversationsUpdate) {
          onConversationsUpdate(conversations)
        }
        
        // Refresh global unread count when conversations are loaded (but don't spam)
        if (!silent) {
          setTimeout(() => refreshGlobalUnreadCount(), 300)
        }
        
        return conversations
      } else {
        console.log('📭 No conversations found in database')
        if (onConversationsUpdate) {
          onConversationsUpdate([])
        }
        return []
      }
    } catch (error) {
      console.error('❌ Error loading conversations from database:', error)
      if (onConversationsUpdate) {
        onConversationsUpdate([])
      }
      if (!silent) {
        toast({
          title: "Error loading conversations",
          description: "Failed to load conversations from database.",
          variant: "destructive"
        })
      }
      return []
    } finally {
      if (!silent) {
        setIsLoadingConversations(false)
      }
    }
  }

  // Mark conversation as read
  const markConversationAsRead = async (conversationId: string) => {
    try {
      console.log('📖 Marking conversation as read:', conversationId)
      
      const response = await fetch(`/admin/chat/api/conversations/${conversationId}/read`, {
        method: 'POST',
      })

      if (response.ok) {
        console.log('✅ Conversation marked as read')
        
        // Refresh global unread count
        setTimeout(() => refreshGlobalUnreadCount(), 300)
        
        return true
      } else {
        console.warn('⚠️ Failed to mark conversation as read:', response.status)
        return false
      }
    } catch (error) {
      console.error('❌ Error marking conversation as read:', error)
      // Don't show toast for this error - it's not critical to user experience
      return false
    }
  }

  // Delete conversation function
  const deleteConversation = async (conversationId: string) => {
    try {
      setIsDeletingConversation(true)
      console.log('🗑️ Deleting conversation:', conversationId)
      
      const response = await fetch(`/admin/chat/api/conversations/${conversationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Failed to delete conversation: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Conversation deleted successfully')
        
        toast({
          title: "Conversation deleted",
          description: "The conversation and all its messages have been removed.",
        })
        
        // Reload conversations to ensure consistency
        await loadConversationsFromDatabase()
        
        return true
      } else {
        throw new Error(result.error || 'Failed to delete conversation')
      }
    } catch (error) {
      console.error('❌ Error deleting conversation:', error)
      toast({
        title: "Error deleting conversation",
        description: "Failed to delete the conversation. Please try again.",
        variant: "destructive"
      })
      return false
    } finally {
      setIsDeletingConversation(false)
    }
  }

  // Load contacts count for stats using ContactService
  const loadContactsCount = async () => {
    try {
      setIsLoadingContactsCount(true)
      console.log('📋 Fetching contacts count via ContactService')
      const contacts = await ContactService.getAllContacts()
      console.log(`📱 Found ${contacts.length} total contacts via ContactService`)
      
      setContactsCount(contacts.length)
      
      // Update via callback if provided
      if (onContactsCountUpdate) {
        onContactsCountUpdate(contacts.length)
      }
      
      return contacts.length
    } catch (error) {
      console.error('❌ Error loading contacts count via ContactService:', error)
      return 0
    } finally {
      setIsLoadingContactsCount(false)
    }
  }

  // Load AI prompts and configuration
  const loadAiPromptsData = async (selectedConversation?: { remoteJid?: string; conversationId?: string }) => {
    if (!selectedConversation?.remoteJid) return null
    
    try {
      console.log('🤖 Loading AI prompts and config for:', selectedConversation.remoteJid)
      
      // Get AI thread and configuration data by joining with whatsapp_contacts
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
          *,
          whatsapp_contacts!inner(whatsapp_jid)
        `)
        .eq('whatsapp_contacts.whatsapp_jid', selectedConversation.remoteJid)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error loading AI config:', error)
        return null
      }
      
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('ai_thread_id, created_at')
        .eq('conversation_id', selectedConversation.conversationId || selectedConversation.remoteJid)
        .eq('sender_type', 'ai_agent')
        .not('ai_thread_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
      
      const promptsData = {
        conversation: conversations,
        aiThreadId: messages?.[0]?.ai_thread_id,
        lastAiInteraction: messages?.[0]?.created_at,
        totalAiMessages: messages?.length || 0,
        assistantId: '5fd12ecb-9268-51f0-8168-fc7952c7c8b8',
        apiUrl: 'https://ht-ample-carnation-93-62e3a16b2190526eac38c74198169a7f.us.langgraph.app'
      }
      
      setAiPromptsData(promptsData)
      console.log('✅ Loaded AI config data')
      
      return promptsData
    } catch (error) {
      console.error('❌ Failed to load AI prompts data:', error)
      return null
    }
  }

  // Clear all database-related state
  const clearDatabaseState = () => {
    setContactsCount(0)
    setAiPromptsData(null)
    console.log('🧹 Database state cleared')
  }

  // Refresh all data (useful for manual refresh)
  const refreshAllData = async (selectedConversation?: { remoteJid?: string; conversationId?: string }) => {
    console.log('🔄 Refreshing all database data...')
    
    const promises = [
      loadConversationsFromDatabase(true),
      loadContactsCount()
    ]
    
    if (selectedConversation?.remoteJid) {
      promises.push(
        loadMessagesFromDatabase(selectedConversation.remoteJid, true),
        loadAiPromptsData(selectedConversation)
      )
    }
    
    await Promise.all(promises)
    console.log('✅ All database data refreshed')
  }

  return {
    // Loading states
    isLoadingMessages,
    isLoadingConversations,
    isLoadingContactsCount,
    isDeletingConversation,
    
    // Data states
    contactsCount,
    aiPromptsData,
    
    // Database operations
    loadMessagesFromDatabase,
    loadConversationsFromDatabase,
    markConversationAsRead,
    deleteConversation,
    loadContactsCount,
    loadAiPromptsData,
    
    // Utility functions
    clearDatabaseState,
    refreshAllData,
    
    // Setters (for advanced usage)
    setContactsCount,
    setAiPromptsData
  }
} 