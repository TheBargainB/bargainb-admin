'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useToast } from '@/hooks/use-toast'
import { normalizePhoneNumber } from '@/lib/api-utils'
import type { 
  Contact, 
  ContactFilters,
  ContactsResponse
} from '@/types/chat-v2.types'
import {
  getContacts,
  getContactById,
  getContactByPhone,
  createContact,
  updateContact,
  deleteContact,
  upsertContact,
  searchContacts,
  getContactDisplayName,
  syncContactsFromWASender
} from '@/actions/chat-v2'

// =============================================================================
// TYPES
// =============================================================================

export interface UseContactsOptions {
  auto_fetch?: boolean
  enable_search?: boolean
  initial_filters?: ContactFilters
}

export interface UseContactsReturn {
  // Data
  contacts: Contact[]
  total_count: number
  selected_contact: Contact | null
  search_results: Contact[]
  
  // Loading states
  is_loading: boolean
  is_refreshing: boolean
  is_searching: boolean
  is_syncing: boolean
  is_creating: boolean
  is_updating: boolean
  
  // Error states
  error: string | null
  
  // Search and filters
  filters: ContactFilters
  search_term: string
  is_search_active: boolean
  
  // Actions
  fetchContacts: () => Promise<void>
  refreshContacts: () => Promise<void>
  selectContact: (contactId: string | null) => Promise<void>
  selectContactByPhone: (phoneNumber: string) => Promise<void>
  searchContactsByTerm: (term: string) => Promise<void>
  clearSearch: () => void
  syncContacts: () => Promise<void>
  createNewContact: (contactData: Partial<Contact>) => Promise<Contact>
  updateContactProfile: (contactId: string, updates: Partial<Contact>) => Promise<void>
  deleteContactById: (contactId: string) => Promise<void>
  
  // Filter actions
  updateFilters: (newFilters: Partial<ContactFilters>) => void
  setSearchTerm: (term: string) => void
  clearError: () => void
  
  // Utilities
  getDisplayName: (contact: Contact) => string
  findContactByPhone: (phoneNumber: string) => Contact | null
  getActiveContacts: () => Contact[]
}

// =============================================================================
// HOOK
// =============================================================================

export const useContacts = (options: UseContactsOptions = {}): UseContactsReturn => {
  const {
    auto_fetch = true,
    enable_search = true,
    initial_filters = {}
  } = options

  const { toast } = useToast()

  // =============================================================================
  // STATE
  // =============================================================================

  const [contacts, setContacts] = useState<Contact[]>([])
  const [total_count, setTotalCount] = useState(0)
  const [selected_contact, setSelectedContact] = useState<Contact | null>(null)
  const [search_results, setSearchResults] = useState<Contact[]>([])
  
  // Loading states
  const [is_loading, setIsLoading] = useState(false)
  const [is_refreshing, setIsRefreshing] = useState(false)
  const [is_searching, setIsSearching] = useState(false)
  const [is_syncing, setIsSyncing] = useState(false)
  const [is_creating, setIsCreating] = useState(false)
  const [is_updating, setIsUpdating] = useState(false)
  
  // Error state
  const [error, setError] = useState<string | null>(null)
  
  // Search and filters
  const [filters, setFilters] = useState<ContactFilters>(initial_filters)
  const [search_term, setSearchTerm] = useState('')
  const [is_search_active, setIsSearchActive] = useState(false)

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const sorted_contacts = useMemo(() => {
    return [...contacts].sort((a, b) => {
      // Sort by display name or phone number
      const nameA = getContactDisplayName(a).toLowerCase()
      const nameB = getContactDisplayName(b).toLowerCase()
      return nameA.localeCompare(nameB)
    })
  }, [contacts])

  const active_contacts = useMemo(() => {
    return contacts.filter(contact => contact.is_active)
  }, [contacts])

  // =============================================================================
  // ACTIONS
  // =============================================================================

  const fetchContacts = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response: ContactsResponse = await getContacts(filters)
      
      setContacts(response.contacts)
      setTotalCount(response.total_count)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch contacts'
      setError(errorMessage)
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      
    } finally {
      setIsLoading(false)
    }
  }, [filters, toast])

  const refreshContacts = useCallback(async () => {
    try {
      setIsRefreshing(true)
      setError(null)
      
      const response: ContactsResponse = await getContacts(filters)
      
      setContacts(response.contacts)
      setTotalCount(response.total_count)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh contacts'
      setError(errorMessage)
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      
    } finally {
      setIsRefreshing(false)
    }
  }, [filters, toast])

  const selectContact = useCallback(async (contactId: string | null) => {
    try {
      if (!contactId) {
        setSelectedContact(null)
        return
      }

      // Find contact in current list first
      const existingContact = contacts.find(contact => contact.id === contactId)
      if (existingContact) {
        setSelectedContact(existingContact)
        return
      }

      // If not in list, fetch it
      const contact = await getContactById(contactId)
      if (contact) {
        setSelectedContact(contact)
      } else {
        throw new Error('Contact not found')
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to select contact'
      setError(errorMessage)
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    }
  }, [contacts, toast])

  const selectContactByPhone = useCallback(async (phoneNumber: string) => {
    try {
      // Find contact in current list first
      const existingContact = contacts.find(contact => 
        contact.phone_number === phoneNumber || 
        contact.whatsapp_jid.includes(phoneNumber.replace('+', ''))
      )
      
      if (existingContact) {
        setSelectedContact(existingContact)
        return
      }

      // If not in list, fetch it
      const contact = await getContactByPhone(phoneNumber)
      if (contact) {
        setSelectedContact(contact)
      } else {
        // Contact doesn't exist, could create it here or just clear selection
        setSelectedContact(null)
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to select contact by phone'
      setError(errorMessage)
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    }
  }, [contacts, toast])

  const searchContactsByTerm = useCallback(async (term: string) => {
    if (!enable_search) return

    try {
      setIsSearching(true)
      setError(null)
      
      if (!term.trim()) {
        setSearchResults([])
        setIsSearchActive(false)
        return
      }

      const results = await searchContacts(term.trim(), 20)
      
      setSearchResults(results)
      setIsSearchActive(true)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search contacts'
      setError(errorMessage)
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      
    } finally {
      setIsSearching(false)
    }
  }, [enable_search, toast])

  const clearSearch = useCallback(() => {
    setSearchResults([])
    setSearchTerm('')
    setIsSearchActive(false)
  }, [])

  const syncContacts = useCallback(async () => {
    try {
      setIsSyncing(true)
      setError(null)
      
      const result = await syncContactsFromWASender()
      
      if (result.success) {
        toast({
          title: 'Sync Complete',
          description: `Synced ${result.synced_count} contacts from WASender.`,
        })
        
        // Refresh contacts list
        await refreshContacts()
      } else {
        throw new Error(result.error || 'Sync failed')
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync contacts'
      setError(errorMessage)
      
      toast({
        title: 'Sync Error',
        description: errorMessage,
        variant: 'destructive'
      })
      
    } finally {
      setIsSyncing(false)
    }
  }, [toast, refreshContacts])

  const createNewContact = useCallback(async (contactData: Partial<Contact>): Promise<Contact> => {
    try {
      setIsCreating(true)
      setError(null)
      
      if (!contactData.phone_number) {
        throw new Error('Phone number is required')
      }

      const newContact = await upsertContact(contactData.phone_number, contactData)
      
      // Add to local state
      setContacts(prev => {
        // Avoid duplicates
        if (prev.some(contact => contact.id === newContact.id)) {
          return prev.map(contact => 
            contact.id === newContact.id ? newContact : contact
          )
        }
        return [...prev, newContact]
      })
      
      setTotalCount(prev => prev + 1)
      
      toast({
        title: 'Contact Created',
        description: 'Contact has been created successfully.',
      })
      
      return newContact
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create contact'
      setError(errorMessage)
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      
      throw err
      
    } finally {
      setIsCreating(false)
    }
  }, [toast])

  const updateContactProfile = useCallback(async (contactId: string, updates: Partial<Contact>) => {
    try {
      setIsUpdating(true)
      setError(null)
      
      const updatedContact = await updateContact(contactId, updates)
      
      // Update local state
      setContacts(prev => prev.map(contact => 
        contact.id === contactId ? updatedContact : contact
      ))
      
      // Update selected contact if it matches
      setSelectedContact(prev => 
        prev?.id === contactId ? updatedContact : prev
      )
      
      toast({
        title: 'Contact Updated',
        description: 'Contact has been updated successfully.',
      })
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update contact'
      setError(errorMessage)
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      
    } finally {
      setIsUpdating(false)
    }
  }, [toast])

  const deleteContactById = useCallback(async (contactId: string) => {
    try {
      await deleteContact(contactId)
      
      // Remove from local state
      setContacts(prev => prev.filter(contact => contact.id !== contactId))
      setTotalCount(prev => Math.max(0, prev - 1))
      
      // Clear selected contact if it was deleted
      setSelectedContact(prev => 
        prev?.id === contactId ? null : prev
      )
      
      toast({
        title: 'Contact Deleted',
        description: 'Contact has been deleted successfully.',
      })
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete contact'
      setError(errorMessage)
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    }
  }, [toast])

  // =============================================================================
  // FILTER ACTIONS
  // =============================================================================

  const updateFilters = useCallback((newFilters: Partial<ContactFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  const findContactByPhone = useCallback((phoneNumber: string): Contact | null => {
    const cleanPhone = normalizePhoneNumber(phoneNumber)
    return contacts.find(contact => 
      normalizePhoneNumber(contact.phone_number).includes(cleanPhone) ||
      contact.whatsapp_jid.includes(cleanPhone)
    ) || null
  }, [contacts])

  const getActiveContacts = useCallback(() => {
    return active_contacts
  }, [active_contacts])

  // =============================================================================
  // SEARCH EFFECT
  // =============================================================================

  useEffect(() => {
    if (enable_search && search_term.trim()) {
      const delayedSearch = setTimeout(() => {
        searchContactsByTerm(search_term)
      }, 300) // Debounce search

      return () => clearTimeout(delayedSearch)
    } else if (search_term === '') {
      clearSearch()
    }
  }, [search_term, searchContactsByTerm, clearSearch, enable_search])

  // =============================================================================
  // FETCH EFFECT
  // =============================================================================

  useEffect(() => {
    if (auto_fetch) {
      fetchContacts()
    }
  }, [auto_fetch, fetchContacts])

  // =============================================================================
  // RETURN
  // =============================================================================

  return {
    // Data
    contacts: sorted_contacts,
    total_count,
    selected_contact,
    search_results,
    
    // Loading states
    is_loading,
    is_refreshing,
    is_searching,
    is_syncing,
    is_creating,
    is_updating,
    
    // Error states
    error,
    
    // Search and filters
    filters,
    search_term,
    is_search_active,
    
    // Actions
    fetchContacts,
    refreshContacts,
    selectContact,
    selectContactByPhone,
    searchContactsByTerm,
    clearSearch,
    syncContacts,
    createNewContact,
    updateContactProfile,
    deleteContactById,
    
    // Filter actions
    updateFilters,
    setSearchTerm,
    clearError,
    
    // Utilities
    getDisplayName: getContactDisplayName,
    findContactByPhone,
    getActiveContacts
  }
} 