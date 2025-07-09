import { createClient } from '@/utils/supabase/client'
import { WhatsAppContact } from '@/types/ai-management.types'
import { apiClient, API_ENDPOINTS, ApiClientError } from '@/lib'

export interface ContactsResponse {
  success: boolean
  data?: WhatsAppContact[]
  error?: string
}

/**
 * Fetch WhatsApp contacts
 */
export const fetchContacts = async (): Promise<ContactsResponse> => {
  try {
    // Try the existing chat API endpoint first
    const response = await apiClient.get<{ success: boolean; data: any[] }>(API_ENDPOINTS.CONTACTS_DB)

    if (response.success && response.data && response.data.success && response.data.data) {
      // Map the contact data to match our WhatsAppContact interface
      const mappedContacts: WhatsAppContact[] = response.data.data.map((contact: any) => ({
        id: contact.id,
        phone_number: contact.phone_number,
        whatsapp_jid: `${contact.phone_number}@s.whatsapp.net`,
        push_name: contact.notify,
        display_name: contact.name || contact.notify,
        profile_picture_url: contact.img_url,
        verified_name: contact.verified_name,
        whatsapp_status: contact.status,
        last_seen_at: contact.last_seen_at,
        is_business_account: contact.is_business_account || false,
        is_active: true,
        created_at: contact.created_at,
        updated_at: contact.updated_at,
        last_synced_at: contact.last_synced_at || null,
        raw_contact_data: contact.raw_contact_data || null
      }))
      
      return {
        success: true,
        data: mappedContacts
      }
    } else {
      // Fallback to direct Supabase query
      const supabase = createClient()
      const { data, error } = await supabase
        .from('whatsapp_contacts')
        .select('*')
        .eq('is_active', true)
        .order('display_name', { ascending: true })

      if (error) {
        throw error
      }
      
      return {
        success: true,
        data: data || []
      }
    }
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return {
      success: false,
      error: error instanceof ApiClientError ? error.message : 'Failed to fetch contacts'
    }
  }
}

/**
 * Search contacts by query string
 */
export const searchContacts = (contacts: WhatsAppContact[], query: string): WhatsAppContact[] => {
  if (!query.trim()) {
    return contacts
  }

  const searchTerm = query.toLowerCase().trim()
  
  return contacts.filter(contact => 
    (contact.display_name && contact.display_name.toLowerCase().includes(searchTerm)) ||
    (contact.push_name && contact.push_name.toLowerCase().includes(searchTerm)) ||
    (contact.phone_number && contact.phone_number.includes(searchTerm)) ||
    (contact.verified_name && contact.verified_name.toLowerCase().includes(searchTerm))
  )
}

/**
 * Get contact by phone number
 */
export const getContactByPhoneNumber = async (phoneNumber: string): Promise<ContactsResponse> => {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('whatsapp_contacts')
      .select('*')
      .eq('phone_number', phoneNumber)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return {
          success: true,
          data: []
        }
      }
      throw error
    }

    return {
      success: true,
      data: data ? [data] : []
    }
  } catch (error) {
    console.error('Error fetching contact by phone number:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch contact'
    }
  }
}

/**
 * Get contacts that don't have AI assistants assigned
 */
export const getUnassignedContacts = async (): Promise<ContactsResponse> => {
  try {
    const supabase = createClient()
    
    // Get all contacts
    const { data: contacts, error: contactsError } = await supabase
      .from('whatsapp_contacts')
      .select('*')
      .eq('is_active', true)

    if (contactsError) {
      throw contactsError
    }

    // Get all assigned phone numbers from the conversation_assistants view
    const { data: assignments, error: assignmentsError } = await supabase
      .from('conversation_assistants')
      .select('phone_number')

    if (assignmentsError) {
      throw assignmentsError
    }

    const assignedPhoneNumbers = new Set(assignments?.map(a => a.phone_number) || [])
    
    // Filter out contacts that have assignments
    const unassignedContacts = contacts?.filter(contact => 
      !assignedPhoneNumbers.has(contact.phone_number)
    ) || []

    return {
      success: true,
      data: unassignedContacts
    }
  } catch (error) {
    console.error('Error fetching unassigned contacts:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch unassigned contacts'
    }
  }
}

/**
 * Sync contacts from WhatsApp (if we have such functionality)
 */
export const syncContactsFromWhatsApp = async (): Promise<ContactsResponse> => {
  try {
    const response = await apiClient.post<{ success: boolean; data?: WhatsAppContact[]; error?: string }>(
      API_ENDPOINTS.CONTACT_SYNC
    )

    if (response.success && response.data) {
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data || []
        }
      } else {
        return {
          success: false,
          error: response.data.error || 'Failed to sync contacts'
        }
      }
    } else {
      return {
        success: false,
        error: response.error || 'Failed to sync contacts'
      }
    }
  } catch (error) {
    console.error('Error syncing contacts:', error)
    return {
      success: false,
      error: error instanceof ApiClientError ? error.message : 'Failed to sync contacts'
    }
  }
}

/**
 * Format contact display name
 */
export const formatContactDisplayName = (contact: WhatsAppContact): string => {
  return contact.display_name || 
         contact.push_name || 
         contact.verified_name || 
         contact.phone_number
}

/**
 * Get contact initials for avatar display
 */
export const getContactInitials = (contact: WhatsAppContact): string => {
  const name = formatContactDisplayName(contact)
  
  if (name === contact.phone_number) {
    // If only phone number, use first two digits
    return name.slice(0, 2)
  }
  
  return name
    .split(' ')
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('')
} 