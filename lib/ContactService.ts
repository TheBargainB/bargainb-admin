'use client'

import { supabase } from '@/lib/supabase'
import { createClient } from '@/utils/supabase/client'
import type { Contact } from '@/types/chat-v2.types'
import { normalizePhoneNumber, extractPhoneFromJid, isValidPhoneNumber } from './api-utils'

const supabaseClient = createClient()

// =============================================================================
// CONTACT SERVICE CLASS
// =============================================================================

export class ContactService {
  // =============================================================================
  // STATIC METHODS FOR CONTACT OPERATIONS
  // =============================================================================

  /**
   * Get all contacts from database with CRM profile data
   */
  static async getAllContacts(): Promise<Contact[]> {
    try {
      const { data, error } = await supabaseClient
        .from('contacts')
        .select(`
          *,
          crm_profiles (
            id,
            full_name,
            preferred_name,
            customer_since,
            lifecycle_stage,
            engagement_score,
            preferred_stores,
            dietary_restrictions,
            product_interests,
            tags,
            notification_preferences
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching contacts:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('❌ Exception in getAllContacts:', error)
      return []
    }
  }

  /**
   * Get contact by ID with full CRM profile
   */
  static async getContactById(contactId: string): Promise<Contact | null> {
    try {
      const { data, error } = await supabaseClient
        .from('contacts')
        .select(`
          *,
          crm_profiles (
            id,
            full_name,
            preferred_name,
            customer_since,
            lifecycle_stage,
            engagement_score,
            preferred_stores,
            dietary_restrictions,
            product_interests,
            tags,
            notification_preferences
          )
        `)
        .eq('id', contactId)
        .single()

      if (error) {
        console.error('❌ Error fetching contact by ID:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('❌ Exception in getContactById:', error)
      return null
    }
  }

  /**
   * Get contact by phone number
   */
  static async getContactByPhone(phoneNumber: string): Promise<Contact | null> {
    try {
      const cleanPhone = normalizePhoneNumber(phoneNumber)
      
      const { data, error } = await supabaseClient
        .from('contacts')
        .select(`
          *,
          crm_profiles (
            id,
            full_name,
            preferred_name,
            customer_since,
            lifecycle_stage,
            engagement_score,
            preferred_stores,
            dietary_restrictions,
            product_interests,
            tags,
            notification_preferences
          )
        `)
        .eq('phone_number', cleanPhone)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error fetching contact by phone:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('❌ Exception in getContactByPhone:', error)
      return null
    }
  }

  /**
   * Search contacts by name, phone, or other criteria
   */
  static async searchContacts(query: string): Promise<Contact[]> {
    try {
      if (!query.trim()) {
        return this.getAllContacts()
      }

      const searchTerm = query.toLowerCase().trim()
      
      const { data, error } = await supabaseClient
        .from('contacts')
        .select(`
          *,
          crm_profiles (
            id,
            full_name,
            preferred_name,
            customer_since,
            lifecycle_stage,
            engagement_score,
            preferred_stores,
            dietary_restrictions,
            product_interests,
            tags,
            notification_preferences
          )
        `)
        .or(`
          phone_number.ilike.%${searchTerm}%,
          display_name.ilike.%${searchTerm}%,
          push_name.ilike.%${searchTerm}%,
          verified_name.ilike.%${searchTerm}%,
          crm_profiles.full_name.ilike.%${searchTerm}%,
          crm_profiles.preferred_name.ilike.%${searchTerm}%
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error searching contacts:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('❌ Exception in searchContacts:', error)
      return []
    }
  }

  /**
   * Create new contact with CRM profile
   */
  static async createContact(contactData: Partial<Contact>): Promise<Contact | null> {
    try {
      const { data, error } = await supabaseClient
        .from('contacts')
        .insert({
          phone_number: contactData.phone_number,
          whatsapp_jid: contactData.whatsapp_jid,
          display_name: contactData.display_name,
          push_name: contactData.push_name,
          verified_name: contactData.verified_name,
          profile_picture_url: contactData.profile_picture_url,
          // Note: whatsapp_status is not part of the Contact type in chat-v2
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating contact:', error)
        return null
      }

      // Create corresponding CRM profile
      if (data) {
        await this.createCrmProfile(data.id, {
          full_name: contactData.display_name || contactData.push_name,
          preferred_name: contactData.push_name || contactData.display_name,
          customer_since: new Date().toISOString(),
          lifecycle_stage: 'prospect',
          engagement_score: 50
        })
      }

      return data
    } catch (error) {
      console.error('❌ Exception in createContact:', error)
      return null
    }
  }

  /**
   * Update contact information
   */
  static async updateContact(contactId: string, updates: Partial<Contact>): Promise<Contact | null> {
    try {
      const { data, error } = await supabaseClient
        .from('contacts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', contactId)
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating contact:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('❌ Exception in updateContact:', error)
      return null
    }
  }

  /**
   * Delete contact (soft delete)
   */
  static async deleteContact(contactId: string): Promise<boolean> {
    try {
      const { error } = await supabaseClient
        .from('contacts')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', contactId)

      if (error) {
        console.error('❌ Error deleting contact:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('❌ Exception in deleteContact:', error)
      return false
    }
  }

  /**
   * Create CRM profile for contact
   */
  private static async createCrmProfile(contactId: string, profileData: any): Promise<boolean> {
    try {
      const { error } = await supabaseClient
        .from('crm_profiles')
        .insert({
          contact_id: contactId,
          ...profileData,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('❌ Error creating CRM profile:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('❌ Exception in createCrmProfile:', error)
      return false
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Get contact display name with fallback hierarchy
   */
  static getDisplayName(contact: Contact): string {
    if (!contact) return 'Unknown Contact'
    
    return (
      contact.display_name ||
      contact.push_name ||
      contact.verified_name ||
      contact.phone_number ||
      'Unknown Contact'
    )
  }

  /**
   * Get contact avatar URL with fallback
   */
  static getAvatarUrl(contact: Contact): string {
    return contact.profile_picture_url || '/placeholder-user.jpg'
  }

  /**
   * Get contact initials for avatar fallback
   */
  static getInitials(contact: Contact): string {
    const name = this.getDisplayName(contact)
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  // Phone utility methods moved to api-utils.ts for consolidation

  /**
   * Legacy compatibility methods
   */
  static getContactDisplayName(contact: Contact | null | undefined): string {
    if (!contact) return 'Unknown Contact'
    return this.getDisplayName(contact)
  }

  static getContactName(contact: Contact | string, contactList: Contact[] = []): string {
    if (typeof contact === 'string') {
      const foundContact = contactList.find(c => c.phone_number === contact)
      return foundContact?.display_name || foundContact?.push_name || contact
    }
    
    return contact.display_name || contact.push_name || contact.phone_number
  }

  static getContactAvatar(contact: Contact | string, contactList: Contact[] = []): string {
    if (typeof contact === 'string') {
      const foundContact = contactList.find(c => c.phone_number === contact)
      return foundContact?.profile_picture_url || "/placeholder.svg"
    }
    
    return contact.profile_picture_url || "/placeholder.svg"
  }

  static getContactInitials(contact: Contact | null | undefined): string {
    if (!contact) return '?'
    return this.getInitials(contact)
  }

  /**
   * Check if contact is online/active
   */
  static isContactActive(contact: Contact): boolean {
    if (!contact.last_seen_at) return false
    
    const lastSeen = new Date(contact.last_seen_at)
    const now = new Date()
    const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60)
    
    return diffMinutes <= 5 // Consider active if seen within 5 minutes
  }

  /**
   * Get contact status color
   */
  static getStatusColor(contact: Contact): string {
    if (this.isContactActive(contact)) return 'green'
    // Note: whatsapp_status is not part of the Contact type in chat-v2
    return 'gray'
  }

  /**
   * Get engagement level based on score
   */
  static getEngagementLevel(score: number): string {
    if (score >= 80) return 'high'
    if (score >= 60) return 'medium'
    if (score >= 40) return 'low'
    return 'very-low'
  }

  /**
   * Get lifecycle stage color
   */
  static getLifecycleColor(stage: string): string {
    switch (stage) {
      case 'prospect': return 'blue'
      case 'customer': return 'green'
      case 'champion': return 'purple'
      case 'at-risk': return 'orange'
      case 'churned': return 'red'
      default: return 'gray'
    }
  }

  /**
   * Sync contact with WASender API
   */
  static async syncWithWASender(contactId: string): Promise<boolean> {
    try {
      const contact = await this.getContactById(contactId)
      if (!contact) return false

      // Call WASender API to get latest contact info
      const response = await fetch('/api/admin/contacts/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact_id: contactId,
          phone_number: contact.phone_number
        })
      })

      if (!response.ok) {
        console.error('❌ Failed to sync contact with WASender')
        return false
      }

      const result = await response.json()
      return result.success
    } catch (error) {
      console.error('❌ Exception in syncWithWASender:', error)
      return false
    }
  }

  /**
   * Get contact conversation statistics
   */
  static async getContactStats(contactId: string): Promise<{
    totalConversations: number
    totalMessages: number
    avgResponseTime: number
    lastInteraction: string | null
  }> {
    try {
      const { data: conversations, error } = await supabaseClient
        .from('conversations')
        .select(`
          id,
          created_at,
          last_message_at,
          total_messages,
          messages (
            id,
            created_at,
            direction
          )
        `)
        .eq('contact_id', contactId)

      if (error) {
        console.error('❌ Error fetching contact stats:', error)
        return {
          totalConversations: 0,
          totalMessages: 0,
          avgResponseTime: 0,
          lastInteraction: null
        }
      }

      const totalConversations = conversations?.length || 0
      const totalMessages = conversations?.reduce((sum: number, conv: any) => sum + (conv.total_messages || 0), 0) || 0
      const lastInteraction = conversations?.[0]?.last_message_at || null

      return {
        totalConversations,
        totalMessages,
        avgResponseTime: 0, // TODO: Calculate based on message timestamps
        lastInteraction
      }
    } catch (error) {
      console.error('❌ Exception in getContactStats:', error)
      return {
        totalConversations: 0,
        totalMessages: 0,
        avgResponseTime: 0,
        lastInteraction: null
      }
    }
  }
} 