'use client'

import { useState, useCallback } from 'react'
import { WhatsAppContact } from '@/types/ai-management.types'
import {
  fetchContacts as fetchContactsAction,
  searchContacts as searchContactsAction
} from '@/actions/ai-management'

interface UseContactsReturn {
  contacts: WhatsAppContact[]
  loading: boolean
  error: string | null
  fetchContacts: () => Promise<void>
  searchContacts: (query: string) => WhatsAppContact[]
}

export const useContacts = (): UseContactsReturn => {
  const [contacts, setContacts] = useState<WhatsAppContact[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleError = useCallback((error: unknown, operation: string) => {
    const message = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error(`Error ${operation}:`, error)
    setError(message)
  }, [])

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await fetchContactsAction()
      
      if (result.success) {
        setContacts(result.data || [])
      } else {
        throw new Error(result.error || 'Failed to fetch contacts')
      }
    } catch (error) {
      handleError(error, 'fetching contacts')
      setContacts([])
    } finally {
      setLoading(false)
    }
  }, [handleError])

  const searchContacts = useCallback((query: string): WhatsAppContact[] => {
    return searchContactsAction(contacts, query)
  }, [contacts])

  return {
    contacts,
    loading,
    error,
    fetchContacts,
    searchContacts
  }
} 