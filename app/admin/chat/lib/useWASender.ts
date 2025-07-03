import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

interface WhatsAppMessage {
  id: string
  fromMe: boolean
  remoteJid: string
  conversation: string
  timestamp: number
  status?: number
}

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

interface UseWASenderOptions {
  selectedContact: string | undefined
  selectedConversation: ChatConversation | undefined
  newMessage: string
  setNewMessage: (message: string) => void
  loadConversationsFromDatabase: () => Promise<void>
  onConversationCreated?: (conversation: ChatConversation) => void
}

export const useWASender = ({
  selectedContact,
  selectedConversation,
  newMessage,
  setNewMessage,
  loadConversationsFromDatabase,
  onConversationCreated
}: UseWASenderOptions) => {
  const { toast } = useToast()
  
  // WhatsApp State
  const [whatsappMessages, setWhatsappMessages] = useState<WhatsAppMessage[]>([])
  const [whatsappContacts, setWhatsappContacts] = useState<WhatsAppContact[]>([])
  const [allContacts, setAllContacts] = useState<WhatsAppContact[]>([])
  const [isLoadingContacts, setIsLoadingContacts] = useState(false)
  const [isSyncingContacts, setIsSyncingContacts] = useState(false)
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)

  // Load WhatsApp data
  const loadWhatsAppData = async () => {
    try {
      // Note: We no longer need to fetch from webhook since we're using database conversations
      // Just set empty arrays to avoid errors
      setWhatsappMessages([])
      setWhatsappContacts([])
      
      console.log('✅ WhatsApp data loading completed (using database instead)')
    } catch (error) {
      console.error('Error loading WhatsApp data:', error)
      toast({
        title: "Error loading data",
        description: "Failed to load WhatsApp data.",
        variant: "destructive"
      })
    }
  }

  // Get message status icon based on WhatsApp status codes
  const getMessageStatusIcon = (status?: string, metadata?: Record<string, any>) => {
    if (!status && !metadata) return null
    
    const whatsappStatus = metadata?.whatsapp_status
    const statusName = metadata?.whatsapp_status_name || status
    
    // Log for debugging
    if (whatsappStatus || statusName) {
      console.log('🔍 Message status debug:', { status, whatsappStatus, statusName, metadata })
    }
    
    // Check WhatsApp-specific status first, then fall back to general status
    const statusToCheck = whatsappStatus || status
    
    switch (statusToCheck) {
      case '1': // WhatsApp status code for pending
      case '2': // WhatsApp status code for sent
      case 'pending':
      case 'sent':
        return '✓'
      case '3': // WhatsApp status code for delivered
      case 'delivered':
        return '✓✓'
      case '4': // WhatsApp status code for read
      case 'read':
        return '✓✓' // In a real app, this would be blue
      case 'failed':
      case 'error':
      case '0': // WhatsApp status code for error
        return '❌'
      default:
        return statusName ? `(${statusName})` : null
    }
  }

  // Send WhatsApp message
  const sendWhatsAppMessage = async () => {
    if (!selectedContact || !newMessage.trim()) {
      toast({
        title: "Cannot send message",
        description: "Please select a contact and enter a message.",
        variant: "destructive"
      })
      return false
    }

    try {
      // Extract phone number from JID
      const remoteJid = selectedContact
      const phoneNumber = remoteJid.replace('@s.whatsapp.net', '')
      
      if (!phoneNumber || phoneNumber.length < 10) {
        throw new Error('Invalid phone number format for WhatsApp message.')
      }

      console.log('📱 Sending WhatsApp message to:', phoneNumber)
      
      const response = await fetch('/admin/chat/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          message: newMessage.trim(),
          remoteJid
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ Message sent successfully:', result)

      setNewMessage('')
      
      toast({
        title: "Message sent",
        description: "Your WhatsApp message has been sent successfully."
      })

      return true
    } catch (error) {
      console.error('❌ Error sending WhatsApp message:', error)
      
      toast({
        title: "Failed to send message",
        description: error instanceof Error ? error.message : "Failed to send WhatsApp message.",
        variant: "destructive"
      })
      
      return false
    }
  }

  // Sync contacts with WASender API
  const syncContactsWithWASender = async () => {
    try {
      setIsSyncingContacts(true)
      console.log('🔄 Manually syncing contacts with WASender API and storing in database...')
      
      // Call the new sync endpoint that both fetches from WASender and stores in database
      const response = await fetch('/admin/chat/api/contacts/sync', {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error(`Failed to sync contacts: ${response.status} ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Contacts synced",
          description: result.message,
          variant: "default"
        })
        
        return true
      } else {
        toast({
          title: "Sync failed",
          description: result.error || "Failed to sync contacts from WASender API.",
          variant: "destructive"
        })
        
        return false
      }
    } catch (error) {
      console.error('❌ Error syncing contacts:', error)
      toast({
        title: "Sync failed",
        description: "Failed to sync contacts from WASender API.",
        variant: "destructive"
      })
      
      return false
    } finally {
      setIsSyncingContacts(false)
    }
  }

  // Start conversation with a contact
  const startConversationWithContact = async (contact: WhatsAppContact) => {
    setIsCreatingConversation(true)
    
    try {
      // Create a new conversation in the database using the new API
      const response = await fetch('/admin/chat/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact: {
            phone_number: contact.jid.replace('@s.whatsapp.net', ''),
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
        console.log('✅ Conversation created successfully:', result.conversation)
        
        // Refresh conversations to show the new one
        await loadConversationsFromDatabase()
        
        // Call the callback if provided
        if (onConversationCreated) {
          onConversationCreated(result.conversation)
        }
        
        toast({
          title: "Conversation started",
          description: `Started conversation with ${contact.name || contact.notify || contact.phone_number}`
        })
        
        return result.conversation
      } else {
        throw new Error(result.error || 'Failed to create conversation')
      }
    } catch (error) {
      console.error('❌ Error creating conversation:', error)
      toast({
        title: "Failed to start conversation",
        description: error instanceof Error ? error.message : "Could not start conversation",
        variant: "destructive"
      })
      
      return null
    } finally {
      setIsCreatingConversation(false)
    }
  }

  // Start new chat with a contact (more comprehensive version)
  const startNewChat = async (contact: WhatsAppContact) => {
    if (!contact) {
      toast({
        title: "No contact selected",
        description: "Please select a contact to start a conversation.",
        variant: "destructive"
      })
      return null
    }

    setIsCreatingConversation(true)

    try {
      // Clean the phone number to remove @s.whatsapp.net if present
      const phoneNumber = contact.phone_number || contact.jid.replace('@s.whatsapp.net', '')
      
      console.log('🆕 Starting new chat with contact:', {
        name: contact.name,
        phone: phoneNumber,
        jid: contact.jid
      })

      // Create conversation with enhanced data
      const conversationData = {
        contact: {
          phone_number: phoneNumber,
          name: contact.name || contact.notify || `Contact ${phoneNumber}`,
          notify: contact.notify || contact.name,
          img_url: contact.imgUrl,
          verified_name: contact.verifiedName,
          status: contact.status
        },
        conversation_metadata: {
          started_by: 'admin',
          initial_source: 'manual_start',
          contact_source: 'contacts_list'
        }
      }

      const response = await fetch('/admin/chat/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(conversationData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success && result.conversation) {
        console.log('✅ New chat created successfully:', result.conversation)
        
        // Refresh conversations list
        await loadConversationsFromDatabase()
        
        const newConversation = {
          id: result.conversation.id,
          user: contact.name || contact.notify || phoneNumber,
          email: contact.jid,
          avatar: contact.imgUrl || "/placeholder.svg",
          lastMessage: "Conversation started",
          timestamp: new Date().toISOString(),
          status: 'active' as const,
          unread_count: 0,
          type: 'whatsapp',
          aiConfidence: 0,
          remoteJid: contact.jid,
          conversationId: result.conversation.id,
          phoneNumber: phoneNumber
        }
        
        // Call the callback if provided
        if (onConversationCreated) {
          onConversationCreated(newConversation)
        }

        toast({
          title: contact.name || contact.notify || `WhatsApp ${phoneNumber}`,
          description: `WhatsApp conversation with ${contact.name || contact.notify || phoneNumber}`,
          variant: "default"
        })

        return newConversation
      } else {
        throw new Error(result.error || 'Failed to create conversation')
      }
    } catch (error) {
      console.error('❌ Error starting new chat:', error)
      
      toast({
        title: "Failed to start conversation",
        description: error instanceof Error ? error.message : "Could not start the conversation. Please try again.",
        variant: "destructive"
      })
      
      return null
    } finally {
      setIsCreatingConversation(false)
    }
  }

  // Helper function to extract phone number from JID
  const extractPhoneNumber = (jidOrEmail: string) => {
    // Remove @s.whatsapp.net suffix
    const cleaned = jidOrEmail.replace('@s.whatsapp.net', '')
    
    // If it looks like a phone number (starts with + or is all digits), return as-is
    if (cleaned.match(/^\+?\d+$/)) {
      return cleaned
    }
    
    // Otherwise, it might be an email or other identifier
    return cleaned
  }

  // Clear WhatsApp data
  const clearWhatsAppData = () => {
    setWhatsappMessages([])
    setWhatsappContacts([])
    setAllContacts([])
  }

  return {
    // State
    whatsappMessages,
    whatsappContacts,
    allContacts,
    isLoadingContacts,
    isSyncingContacts,
    isCreatingConversation,
    
    // Setters
    setWhatsappMessages,
    setWhatsappContacts,
    setAllContacts,
    setIsLoadingContacts,
    
    // Functions
    loadWhatsAppData,
    sendWhatsAppMessage,
    syncContactsWithWASender,
    startConversationWithContact,
    startNewChat,
    getMessageStatusIcon,
    extractPhoneNumber,
    clearWhatsAppData
  }
} 