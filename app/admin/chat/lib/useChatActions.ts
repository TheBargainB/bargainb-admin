import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

// UI-friendly WhatsApp contact interface
interface WhatsAppContact {
  jid: string
  name?: string
  notify?: string
  status?: string
  imgUrl?: string
  verifiedName?: string
  id?: string
  phone_number?: string
  created_at?: string
  updated_at?: string
  last_seen_at?: string
}

// Chat conversation interface
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

interface UseChatActionsOptions {
  selectedContact: string | undefined
  newMessage: string
  setNewMessage: (message: string) => void
  loadConversationsFromDatabase: () => Promise<void>
  loadMessagesFromDatabase: (remoteJid: string) => Promise<void>
  setSelectedContact: (contactId: string) => void
  setDatabaseMessages: (messages: any[]) => void
  databaseConversations: ChatConversation[]
  onConversationCreated?: (conversation: ChatConversation) => void
  wasenderHook: any // WASender hook instance
}

export const useChatActions = ({
  selectedContact,
  newMessage,
  setNewMessage,
  loadConversationsFromDatabase,
  loadMessagesFromDatabase,
  setSelectedContact,
  setDatabaseMessages,
  databaseConversations,
  onConversationCreated,
  wasenderHook
}: UseChatActionsOptions) => {
  const { toast } = useToast()
  
  // Chat state
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)

  // Load WhatsApp data from WASender hook with loading state management
  const loadWhatsAppData = async () => {
    try {
      setIsLoading(true)
      await wasenderHook.loadWhatsAppData()
      console.log('✅ WhatsApp data loading completed via hook')
    } catch (error) {
      console.error('Error loading WhatsApp data:', error)
      toast({
        title: "Error loading data",
        description: "Failed to load WhatsApp data.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Send WhatsApp message using WASender hook with additional database updates
  const sendWhatsAppMessage = async () => {
    if (!newMessage.trim() || !selectedContact || isSending) return

    try {
      setIsSending(true)
      
      // Find the conversation to get the remoteJid
      const conversation = databaseConversations.find(conv => conv.id === selectedContact)
      const remoteJid = conversation?.remoteJid || conversation?.email
      
      if (!remoteJid) {
        throw new Error('Cannot find contact information for this conversation')
      }
      
      // Use the hook's sendWhatsAppMessage
      const success = await wasenderHook.sendWhatsAppMessage()
      
      if (success) {
        // Reload messages for the current conversation
        await loadMessagesFromDatabase(remoteJid)
        await loadConversationsFromDatabase()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error sending message",
        description: error instanceof Error ? error.message : "Failed to send WhatsApp message.",
        variant: "destructive"
      })
    } finally {
      setIsSending(false)
    }
  }

  // Start new chat with conversation deduplication
  const startNewChat = async (contact: WhatsAppContact) => {
    console.log('🎯 startNewChat called with contact:', contact)
    
    try {
      setIsCreatingConversation(true)
      
      // First, check if a conversation already exists with this contact
      const phoneNumber = contact.phone_number || contact.jid.replace('@s.whatsapp.net', '')
      const existingConversation = databaseConversations.find(conv => 
        conv.remoteJid === contact.jid || 
        conv.phoneNumber === phoneNumber ||
        conv.email === contact.jid
      )
      
      if (existingConversation) {
        console.log('📞 Found existing conversation:', existingConversation.id)
        setSelectedContact(existingConversation.id)
        
        // Load messages for the existing conversation
        await loadMessagesFromDatabase(existingConversation.remoteJid || existingConversation.email)
        
        toast({
          title: "Conversation opened",
          description: `Opened existing conversation with ${contact.name || contact.notify || phoneNumber}`,
        })
        return existingConversation
      }

      // Use the WASender hook's startNewChat function for new conversations
      const newConversation = await wasenderHook.startNewChat(contact)
      
      if (newConversation) {
        // Update UI state
        setSelectedContact(newConversation.id)
        
        // Initialize empty messages for the new conversation
        setDatabaseMessages([])
        
        // Refresh conversations from database to ensure consistency
        await loadConversationsFromDatabase()
        
        // Call callback if provided
        if (onConversationCreated) {
          onConversationCreated(newConversation)
        }
        
        return newConversation
      }
    } catch (error) {
      console.error('❌ Error starting new chat:', error)
      toast({
        title: "Failed to start conversation",
        description: "Could not start the conversation. Please try again.",
        variant: "destructive"
      })
      return null
    } finally {
      setIsCreatingConversation(false)
    }
  }

  // Start conversation with a contact (similar to startNewChat but with different flow)
  const startConversationWithContact = async (contact: WhatsAppContact) => {
    if (!contact) {
      toast({
        title: "No contact selected",
        description: "Please select a contact to start a conversation.",
        variant: "destructive"
      })
      return null
    }

    try {
      setIsCreatingConversation(true)
      console.log('🆕 Starting conversation with contact:', contact.name || contact.phone_number)

      // Check if conversation already exists
      const phoneNumber = contact.phone_number || contact.jid.replace('@s.whatsapp.net', '')
      const existingConversation = databaseConversations.find(conv => 
        conv.remoteJid === contact.jid || 
        conv.phoneNumber === phoneNumber ||
        conv.email === contact.jid
      )
      
      if (existingConversation) {
        console.log('📞 Found existing conversation, selecting it')
        setSelectedContact(existingConversation.id)
        
        // Load messages for existing conversation
        const remoteJid = existingConversation.remoteJid || existingConversation.email
        if (remoteJid) {
          await loadMessagesFromDatabase(remoteJid)
        }
        
        return existingConversation
      }

      // Create new conversation via API
      const response = await fetch('/admin/chat/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact: {
            phone_number: phoneNumber,
            name: contact.name || contact.notify || 'Unknown',
            notify: contact.notify,
            img_url: contact.imgUrl
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to create conversation: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success && result.conversation) {
        console.log('✅ Conversation created successfully')
        
        // Create conversation object for UI
        const newConversation: ChatConversation = {
          id: result.conversation.id,
          user: contact.name || contact.notify || phoneNumber,
          email: contact.jid,
          avatar: contact.imgUrl || "/placeholder.svg",
          lastMessage: "Conversation started",
          timestamp: new Date().toISOString(),
          status: 'active',
          unread_count: 0,
          type: 'whatsapp',
          aiConfidence: 0,
          remoteJid: contact.jid,
          conversationId: result.conversation.id,
          phoneNumber: phoneNumber
        }
        
        // Refresh conversations
        await loadConversationsFromDatabase()
        
        // Select the new conversation
        setSelectedContact(newConversation.id)
        
        // Clear messages for new conversation
        setDatabaseMessages([])
        
        // Call callback if provided
        if (onConversationCreated) {
          onConversationCreated(newConversation)
        }
        
        toast({
          title: "Conversation started",
          description: `Started conversation with ${contact.name || contact.notify || phoneNumber}`
        })
        
        return newConversation
      } else {
        throw new Error(result.error || 'Failed to create conversation')
      }
    } catch (error) {
      console.error('❌ Error starting conversation:', error)
      toast({
        title: "Failed to create conversation",
        description: "Failed to create conversation. Please try again.",
        variant: "destructive"
      })
      return null
    } finally {
      setIsCreatingConversation(false)
    }
  }

  // Clear all chat data
  const clearAllChatData = () => {
    console.log('🧹 Clearing all chat data...')
    
    // Clear localStorage chat storage
    localStorage.removeItem('chat-storage')
    
    // Clear WASender hook data
    wasenderHook.clearWhatsAppData()
    
    console.log('✅ All chat data cleared')
    
    toast({
      title: "Chat data cleared",
      description: "All conversations and messages have been cleared from cache.",
    })
  }

  return {
    // State
    isLoading,
    isSending,
    isCreatingConversation,
    
    // Functions
    loadWhatsAppData,
    sendWhatsAppMessage,
    startNewChat,
    startConversationWithContact,
    clearAllChatData,
    
    // Setters
    setIsLoading,
    setIsSending,
    setIsCreatingConversation
  }
} 