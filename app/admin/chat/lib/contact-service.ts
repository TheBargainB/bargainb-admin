import { supabase } from '@/lib/supabase'

// Define types inline to match the actual database schema
export type WhatsAppContact = {
  id: string
  phone_number: string
  whatsapp_jid: string
  push_name: string | null
  display_name: string | null
  profile_picture_url: string | null
  verified_name: string | null
  whatsapp_status: string | null
  last_seen_at: string | null
  is_business_account: boolean
  raw_contact_data: any
  is_active: boolean
  last_synced_at: string | null
  created_at: string
  updated_at: string
}

export type WhatsAppContactInsert = {
  phone_number: string
  whatsapp_jid: string
  push_name?: string | null
  display_name?: string | null
  profile_picture_url?: string | null
  verified_name?: string | null
  whatsapp_status?: string | null
  last_seen_at?: string | null
  is_business_account?: boolean
  raw_contact_data?: any
  is_active?: boolean
  last_synced_at?: string | null
}

export type WhatsAppContactUpdate = Partial<WhatsAppContactInsert>

export type CRMProfile = {
  id: string
  whatsapp_contact_id: string
  email: string | null
  full_name: string | null
  preferred_name: string | null
  date_of_birth: string | null
  lifecycle_stage: string
  customer_since: string | null
  preferred_stores: string[]
  shopping_persona: string | null
  dietary_restrictions: string[]
  engagement_score: number
  total_conversations: number
  total_messages: number
  created_at: string
  updated_at: string
}

export type CRMProfileInsert = {
  whatsapp_contact_id: string
  email?: string | null
  full_name?: string | null
  preferred_name?: string | null
  date_of_birth?: string | null
  lifecycle_stage?: string
  customer_since?: string | null
  preferred_stores?: string[]
  shopping_persona?: string | null
  dietary_restrictions?: string[]
  engagement_score?: number
  total_conversations?: number
  total_messages?: number
}

export type CRMProfileUpdate = Partial<CRMProfileInsert>

// Legacy Contact type for backwards compatibility
export type Contact = {
  id: string
  phone_number: string
  name: string | null
  notify: string | null
  verified_name: string | null
  img_url: string | null
  status: string | null
  last_seen_at: string | null
  wasender_data: any
  created_at: string
  updated_at: string
}

export interface WASenderContact {
  id: string
  name?: string
  notify?: string
  verifiedName?: string
  imgUrl?: string
  status?: string
}

export class ContactService {
  /**
   * Store or update a contact in the new CRM structure (whatsapp_contacts + crm_profiles)
   */
  static async upsertContact(phoneNumber: string, wasenderData: WASenderContact): Promise<Contact | null> {
    try {
      console.log('📝 Upserting contact to CRM structure:', phoneNumber, wasenderData)

      const now = new Date().toISOString()
      const whatsappJid = `${phoneNumber.replace('+', '')}@s.whatsapp.net`

      // Prepare WhatsApp contact data using correct schema
      const whatsappContactData: WhatsAppContactInsert = {
        phone_number: phoneNumber,
        whatsapp_jid: whatsappJid,
        push_name: wasenderData.name,
        display_name: wasenderData.notify || wasenderData.name,
        profile_picture_url: wasenderData.imgUrl,
        verified_name: wasenderData.verifiedName,
        whatsapp_status: 'available',
        last_seen_at: now,
        is_business_account: false,
        raw_contact_data: {
          wasender_data: wasenderData,
          original_jid: wasenderData.id,
          sync_timestamp: now
        },
        is_active: true,
        last_synced_at: now
      }

      // Upsert WhatsApp contact using correct table/column names
      const { data: contactData, error: contactError } = await supabase
        .from('whatsapp_contacts')
        .upsert(whatsappContactData, { 
          onConflict: 'phone_number',
          ignoreDuplicates: false 
        })
        .select()
        .single()

      if (contactError) {
        console.error('❌ Error upserting WhatsApp contact:', contactError)
        return null
      }

      // Prepare CRM profile data using correct schema
      const crmProfileData: CRMProfileInsert = {
        whatsapp_contact_id: contactData.id,
        full_name: wasenderData.name,
        preferred_name: wasenderData.notify || wasenderData.name,
        lifecycle_stage: 'prospect',
        customer_since: now,
        preferred_stores: [],
        shopping_persona: null,
        dietary_restrictions: [],
        engagement_score: 50,
        total_conversations: 0,
        total_messages: 0
      }

      // Upsert CRM profile using correct table/column names
      const { data: profileData, error: profileError } = await supabase
        .from('crm_profiles')
        .upsert(crmProfileData, { 
          onConflict: 'whatsapp_contact_id',
          ignoreDuplicates: false 
        })
        .select()
        .single()

      if (profileError) {
        console.error('❌ Error upserting CRM profile:', profileError)
        // Don't fail if CRM profile fails, WhatsApp contact is more important
      }

      console.log('✅ Contact upserted successfully to CRM structure:', contactData.id)
      
      // Convert to legacy Contact format for backwards compatibility
      const contactFormat: Contact = {
        id: contactData.id,
        phone_number: contactData.phone_number,
        name: contactData.push_name || profileData?.full_name || null,
        notify: contactData.display_name || profileData?.preferred_name || null,
        verified_name: contactData.verified_name,
        img_url: contactData.profile_picture_url,
        status: contactData.whatsapp_status,
        last_seen_at: contactData.last_seen_at,
        wasender_data: (contactData.raw_contact_data as any)?.wasender_data || {},
        created_at: contactData.created_at || '',
        updated_at: contactData.updated_at || ''
      }
      
      return contactFormat
    } catch (error) {
      console.error('❌ Exception in upsertContact:', error)
      return null
    }
  }

  /**
   * Store multiple contacts from WASender in new CRM structure
   */
  static async upsertContacts(contacts: Array<{ phoneNumber: string, data: WASenderContact }>): Promise<Contact[]> {
    try {
      console.log('📝 Upserting multiple contacts to CRM structure:', contacts.length)

      const results: Contact[] = []
      
      // Process contacts in batches to avoid overwhelming the database
      const batchSize = 10
      for (let i = 0; i < contacts.length; i += batchSize) {
        const batch = contacts.slice(i, i + batchSize)
        const batchPromises = batch.map(({ phoneNumber, data }) => 
          this.upsertContact(phoneNumber, data)
        )

        const batchResults = await Promise.allSettled(batchPromises)
        batchResults.forEach(result => {
          if (result.status === 'fulfilled' && result.value) {
            results.push(result.value)
          }
        })
      }

      console.log('✅ Contacts upserted successfully to CRM structure:', results.length)
      return results
    } catch (error) {
      console.error('❌ Exception in upsertContacts:', error)
      return []
    }
  }

  /**
   * Get a contact by phone number from new CRM structure
   */
  static async getContactByPhone(phoneNumber: string): Promise<Contact | null> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_contacts')
        .select(`
          *,
          crm_profiles (*)
        `)
        .eq('phone_number', phoneNumber)
        .single()

      if (error) {
        console.error('❌ Error fetching contact from CRM structure:', error)
        return null
      }

      // Convert to legacy Contact format for backwards compatibility
      const crmProfile = Array.isArray(data.crm_profiles) ? data.crm_profiles[0] : data.crm_profiles
      const contactFormat: Contact = {
        id: data.id,
        phone_number: data.phone_number,
        name: data.push_name || crmProfile?.full_name,
        notify: data.display_name || crmProfile?.preferred_name,
        verified_name: data.verified_name,
        img_url: data.profile_picture_url,
        status: data.whatsapp_status,
        last_seen_at: data.last_seen_at,
        wasender_data: (data.raw_contact_data as any)?.wasender_data || {},
        created_at: data.created_at || '',
        updated_at: data.updated_at || ''
      }
      
      return contactFormat
    } catch (error) {
      console.error('❌ Exception in getContactByPhone:', error)
      return null
    }
  }

  /**
   * Get all contacts from new CRM structure
   */
  static async getAllContacts(): Promise<Contact[]> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_contacts')
        .select(`
          *,
          crm_profiles (*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching contacts from CRM structure:', error)
        return []
      }

      // Convert to legacy Contact format for backwards compatibility
      const contactsFormat: Contact[] = (data || []).map(contact => {
        const crmProfile = Array.isArray(contact.crm_profiles) ? contact.crm_profiles[0] : contact.crm_profiles
        return {
          id: contact.id,
          phone_number: contact.phone_number,
          name: contact.push_name || crmProfile?.full_name,
          notify: contact.display_name || crmProfile?.preferred_name,
          verified_name: contact.verified_name,
          img_url: contact.profile_picture_url,
          status: contact.whatsapp_status,
          last_seen_at: contact.last_seen_at,
          wasender_data: (contact.raw_contact_data as any)?.wasender_data || {},
          created_at: contact.created_at || '',
          updated_at: contact.updated_at || ''
        }
      })
      
      return contactsFormat
    } catch (error) {
      console.error('❌ Exception in getAllContacts:', error)
      return []
    }
  }

  /**
   * Search contacts by name or phone number in new CRM structure
   */
  static async searchContacts(query: string): Promise<Contact[]> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_contacts')
        .select(`
          *,
          crm_profiles (*)
        `)
        .or(`phone_number.ilike.%${query}%,push_name.ilike.%${query}%,display_name.ilike.%${query}%`)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error searching contacts in CRM structure:', error)
        return []
      }

      // Convert to legacy Contact format for backwards compatibility
      const contactsFormat: Contact[] = (data || []).map(contact => {
        const crmProfile = Array.isArray(contact.crm_profiles) ? contact.crm_profiles[0] : contact.crm_profiles
        return {
          id: contact.id,
          phone_number: contact.phone_number,
          name: contact.push_name || crmProfile?.full_name,
          notify: contact.display_name || crmProfile?.preferred_name,
          verified_name: contact.verified_name,
          img_url: contact.profile_picture_url,
          status: contact.whatsapp_status,
          last_seen_at: contact.last_seen_at,
          wasender_data: (contact.raw_contact_data as any)?.wasender_data || {},
          created_at: contact.created_at || '',
          updated_at: contact.updated_at || ''
        }
      })
      
      return contactsFormat
    } catch (error) {
      console.error('❌ Exception in searchContacts:', error)
      return []
    }
  }

  /**
   * Update contact profile image URL in new CRM structure
   */
  static async updateContactImage(phoneNumber: string, imgUrl: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('whatsapp_contacts')
        .update({ 
          profile_picture_url: imgUrl,
          updated_at: new Date().toISOString()
        })
        .eq('phone_number', phoneNumber)

      if (error) {
        console.error('❌ Error updating contact image in CRM structure:', error)
        return false
      }

      console.log('✅ Contact image updated successfully in CRM structure')
      return true
    } catch (error) {
      console.error('❌ Exception in updateContactImage:', error)
      return false
    }
  }

  /**
   * Delete a contact from new CRM structure
   */
  static async deleteContact(phoneNumber: string): Promise<boolean> {
    try {
      // First get the contact
      const { data: contactData } = await supabase
        .from('whatsapp_contacts')
        .select('id')
        .eq('phone_number', phoneNumber)
        .single()

      if (!contactData) {
        console.log('Contact not found for deletion')
        return false
      }

      // Delete CRM profile first (foreign key dependency)
      await supabase
        .from('crm_profiles')
        .delete()
        .eq('whatsapp_contact_id', contactData.id)

      // Delete WhatsApp contact
      const { error } = await supabase
        .from('whatsapp_contacts')
        .delete()
        .eq('phone_number', phoneNumber)

      if (error) {
        console.error('❌ Error deleting contact from CRM structure:', error)
        return false
      }

      console.log('✅ Contact deleted successfully from CRM structure')
      return true
    } catch (error) {
      console.error('❌ Exception in deleteContact:', error)
      return false
    }
  }

  /**
   * Get contact by JID (WhatsApp ID) from new CRM structure
   */
  static async getContactByJid(jid: string): Promise<Contact | null> {
    try {
      // Extract phone number from JID (e.g., "31612345678@s.whatsapp.net" -> "+31612345678")
      const phoneNumber = jid.split('@')[0]
      const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`
      return await this.getContactByPhone(formattedPhoneNumber)
    } catch (error) {
      console.error('Error getting contact by JID from CRM structure:', error)
      return null
    }
  }

  /**
   * Create a new contact from JID and optional pushName
   */
  static async createContact(jid: string, pushName?: string): Promise<Contact> {
    try {
      // Extract phone number from JID
      const phoneNumber = jid.split('@')[0]
      const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`
      
      const wasenderData: WASenderContact = {
        id: jid,
          name: pushName,
        notify: pushName
      }

      const contact = await this.upsertContact(formattedPhoneNumber, wasenderData)
      
      if (!contact) {
        throw new Error('Failed to create contact')
      }

      return contact
    } catch (error) {
      console.error('❌ Error creating contact:', error)
      throw error
    }
  }
} 