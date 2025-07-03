import { useState, useMemo } from 'react'
import { useToast } from '@/hooks/use-toast'
import { ContactService, Contact } from './contact-service'

// UI-friendly WhatsApp contact interface (mapped from database)
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

interface UseContactsOptions {
  onConversationCreated?: (conversation: ChatConversation) => void
  loadConversationsFromDatabase?: () => Promise<void>
  setSelectedContact?: (contactId: string | null) => void
  setDatabaseMessages?: (messages: any[]) => void
  databaseConversations?: ChatConversation[]
}

export const useContacts = ({
  onConversationCreated,
  loadConversationsFromDatabase,
  setSelectedContact,
  setDatabaseMessages,
  databaseConversations = []
}: UseContactsOptions = {}) => {
  const { toast } = useToast()
  
  // Contact state
  const [allContacts, setAllContacts] = useState<WhatsAppContact[]>([])
  const [isLoadingContacts, setIsLoadingContacts] = useState(false)
  const [contactSearchTerm, setContactSearchTerm] = useState("")
  const [isSyncingContacts, setIsSyncingContacts] = useState(false)
  
  // Dialog state
  const [isContactsDialogOpen, setIsContactsDialogOpen] = useState(false)
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)

  // Helper function to transform database contact to UI format
  const transformContactForUI = (contact: Contact): WhatsAppContact => {
    return {
      jid: contact.phone_number.replace('+', '') + '@s.whatsapp.net',
      name: contact.name ?? undefined,
      notify: contact.notify ?? undefined,
      status: contact.status ?? undefined,
      imgUrl: contact.img_url ?? undefined,
      verifiedName: contact.verified_name ?? undefined,
      id: contact.id,
      phone_number: contact.phone_number,
      created_at: contact.created_at,
      updated_at: contact.updated_at,
      last_seen_at: contact.last_seen_at ?? undefined
    }
  }

  // Load all contacts using ContactService
  const loadAllContacts = async () => {
    try {
      setIsLoadingContacts(true)
      console.log('📋 Loading all contacts from database via ContactService...')
      
      const contactsFromDb = await ContactService.getAllContacts()
      console.log('📱 Raw contacts from ContactService:', contactsFromDb.length)
      
      // Transform contacts to UI format
      const transformedContacts = contactsFromDb.map(transformContactForUI)
      console.log('✅ Transformed contacts:', transformedContacts.length)
      
      setAllContacts(transformedContacts)
      
      return transformedContacts
    } catch (error) {
      console.error('❌ Error loading contacts via ContactService:', error)
      toast({
        title: "Error loading contacts",
        description: "Failed to load contacts from database.",
        variant: "destructive"
      })
      return []
    } finally {
      setIsLoadingContacts(false)
    }
  }

  // Sync contacts with WASender API
  const syncContactsWithWASender = async () => {
    try {
      setIsSyncingContacts(true)
      console.log('🔄 Syncing contacts with WASender API...')
      
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
        
        // Refresh contacts after sync
        await loadAllContacts()
        
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

  // Handle opening contacts dialog
  const handleOpenContactsDialog = async () => {
    setIsContactsDialogOpen(true)
    await loadAllContacts()
  }

  // Start conversation with a contact
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
        
        if (setSelectedContact) {
          setSelectedContact(existingConversation.id)
        }
        
        // Load messages for existing conversation
        const remoteJid = existingConversation.remoteJid || existingConversation.email
        if (remoteJid && loadConversationsFromDatabase) {
          // Note: We'd need to pass loadMessagesFromDatabase here, but it's in useDatabase
          // For now, let the existing logic handle this
        }
        
        setIsContactsDialogOpen(false)
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
        if (loadConversationsFromDatabase) {
          await loadConversationsFromDatabase()
        }
        
        // Select the new conversation
        if (setSelectedContact) {
          setSelectedContact(newConversation.id)
        }
        
        // Clear messages for new conversation
        if (setDatabaseMessages) {
          setDatabaseMessages([])
        }
        
        // Call callback if provided
        if (onConversationCreated) {
          onConversationCreated(newConversation)
        }
        
        toast({
          title: "Conversation started",
          description: `Started conversation with ${contact.name || contact.notify || phoneNumber}`
        })
        
        setIsContactsDialogOpen(false)
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

  // Filter contacts based on search term
  const filteredContacts = useMemo(() => {
    if (!contactSearchTerm.trim()) return allContacts
    
    const searchLower = contactSearchTerm.toLowerCase()
    return allContacts.filter(contact => 
      (contact.name && contact.name.toLowerCase().includes(searchLower)) ||
      (contact.notify && contact.notify.toLowerCase().includes(searchLower)) ||
      (contact.phone_number && contact.phone_number.includes(contactSearchTerm)) ||
      (contact.jid && contact.jid.toLowerCase().includes(searchLower))
    )
  }, [allContacts, contactSearchTerm])

  // Get contacts count
  const contactsCount = allContacts.length
  const filteredContactsCount = filteredContacts.length

  // Search contacts by query
  const searchContacts = async (query: string) => {
    try {
      setIsLoadingContacts(true)
      console.log('🔍 Searching contacts:', query)
      
      const searchResults = await ContactService.searchContacts(query)
      const transformedResults = searchResults.map(transformContactForUI)
      
      setAllContacts(transformedResults)
      return transformedResults
    } catch (error) {
      console.error('❌ Error searching contacts:', error)
      toast({
        title: "Search failed",
        description: "Failed to search contacts.",
        variant: "destructive"
      })
      return []
    } finally {
      setIsLoadingContacts(false)
    }
  }

  // Clear search and reset to all contacts
  const clearSearch = () => {
    setContactSearchTerm("")
    loadAllContacts()
  }

  // Get contact by phone number
  const getContactByPhone = async (phoneNumber: string) => {
    try {
      const contact = await ContactService.getContactByPhone(phoneNumber)
      return contact ? transformContactForUI(contact) : null
    } catch (error) {
      console.error('❌ Error getting contact by phone:', error)
      return null
    }
  }

  // Close contacts dialog
  const closeContactsDialog = () => {
    setIsContactsDialogOpen(false)
    setContactSearchTerm("")
  }

  return {
    // State
    allContacts,
    filteredContacts,
    isLoadingContacts,
    isSyncingContacts,
    isCreatingConversation,
    contactSearchTerm,
    isContactsDialogOpen,
    contactsCount,
    filteredContactsCount,
    
    // Functions
    loadAllContacts,
    syncContactsWithWASender,
    handleOpenContactsDialog,
    startConversationWithContact,
    searchContacts,
    clearSearch,
    getContactByPhone,
    closeContactsDialog,
    transformContactForUI,
    
    // Setters
    setAllContacts,
    setContactSearchTerm,
    setIsContactsDialogOpen,
    setIsLoadingContacts,
    setIsSyncingContacts
  }
} 