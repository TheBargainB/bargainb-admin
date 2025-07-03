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

interface UseContactsOptions {
  // Contact-specific options only - no chat dependencies
}

export const useContacts = (options: UseContactsOptions = {}) => {
  const { toast } = useToast()
  
  // Contact state
  const [allContacts, setAllContacts] = useState<WhatsAppContact[]>([])
  const [isLoadingContacts, setIsLoadingContacts] = useState(false)
  const [contactSearchTerm, setContactSearchTerm] = useState("")
  const [isSyncingContacts, setIsSyncingContacts] = useState(false)
  
  // Dialog state
  const [isContactsDialogOpen, setIsContactsDialogOpen] = useState(false)

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

  // Load all contacts using ContactService (pure contact management)
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

  // Sync contacts with WASender API (pure contact sync)
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

  // Handle opening contacts dialog (pure UI management)
  const handleOpenContactsDialog = async () => {
    setIsContactsDialogOpen(true)
    await loadAllContacts()
  }

  // Search contacts by name or phone number (pure contact filtering)
  const searchContacts = async (query: string) => {
    try {
      console.log('🔍 Searching contacts for:', query)
      setContactSearchTerm(query)
      
      if (!query.trim()) {
        return allContacts
      }
      
      const filtered = allContacts.filter(contact => 
        contact.name?.toLowerCase().includes(query.toLowerCase()) ||
        contact.notify?.toLowerCase().includes(query.toLowerCase()) ||
        contact.phone_number?.includes(query) ||
        contact.jid.includes(query)
      )
      
      console.log(`✅ Found ${filtered.length} contacts matching "${query}"`)
      return filtered
      
    } catch (error) {
      console.error('❌ Error searching contacts:', error)
      return []
    }
  }

  // Clear search (pure state management)
  const clearSearch = () => {
    setContactSearchTerm("")
  }

  // Get contact by phone number (pure lookup)
  const getContactByPhone = async (phoneNumber: string): Promise<WhatsAppContact | null> => {
    try {
      const cleanPhone = phoneNumber.replace('@s.whatsapp.net', '').replace('+', '')
      const contact = allContacts.find(c => 
        c.phone_number?.replace('+', '') === cleanPhone ||
        c.jid.replace('@s.whatsapp.net', '') === cleanPhone
      )
      return contact || null
    } catch (error) {
      console.error('❌ Error finding contact by phone:', error)
      return null
    }
  }

  // Close contacts dialog (pure UI management)
  const closeContactsDialog = () => {
    setIsContactsDialogOpen(false)
    setContactSearchTerm("")
  }

  // Get contact count (pure data)
  const getContactsCount = () => allContacts.length

  // Check if a contact exists (pure lookup)
  const contactExists = (phoneNumber: string): boolean => {
    const cleanPhone = phoneNumber.replace('@s.whatsapp.net', '').replace('+', '')
    return allContacts.some(c => 
      c.phone_number?.replace('+', '') === cleanPhone ||
      c.jid.replace('@s.whatsapp.net', '') === cleanPhone
    )
  }

  // Filter contacts with memoization (pure filtering with search)
  const filteredContacts = useMemo(() => {
    if (!contactSearchTerm.trim()) {
      return allContacts
    }
    
    return allContacts.filter(contact => 
      contact.name?.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
      contact.notify?.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
      contact.phone_number?.includes(contactSearchTerm) ||
      contact.jid.includes(contactSearchTerm)
    )
  }, [allContacts, contactSearchTerm])

  // Get filtered contacts count (pure calculation)
  const filteredContactsCount = filteredContacts.length

  return {
    // State
    allContacts,
    filteredContacts,
    isLoadingContacts,
    isSyncingContacts,
    contactSearchTerm,
    isContactsDialogOpen,
    filteredContactsCount,
    
    // Core contact functions
    loadAllContacts,
    syncContactsWithWASender,
    searchContacts,
    clearSearch,
    getContactByPhone,
    getContactsCount,
    contactExists,
    transformContactForUI,
    
    // Dialog management
    handleOpenContactsDialog,
    closeContactsDialog,
    
    // State setters
    setContactSearchTerm,
    setIsContactsDialogOpen,
    setAllContacts,
    setIsLoadingContacts
  }
} 