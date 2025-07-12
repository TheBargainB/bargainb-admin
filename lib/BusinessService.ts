'use client'

import { createClient } from '@/utils/supabase/client'
import type { Contact } from '@/types/chat-v2.types'

const supabaseClient = createClient()

// =============================================================================
// BUSINESS SERVICE CLASS
// =============================================================================

export interface BusinessContact {
  id: string
  name: string
  phone_number: string
  email?: string
  avatar_url?: string
  business_hours?: {
    monday: { open: string; close: string; isOpen: boolean }
    tuesday: { open: string; close: string; isOpen: boolean }
    wednesday: { open: string; close: string; isOpen: boolean }
    thursday: { open: string; close: string; isOpen: boolean }
    friday: { open: string; close: string; isOpen: boolean }
    saturday: { open: string; close: string; isOpen: boolean }
    sunday: { open: string; close: string; isOpen: boolean }
  }
  auto_reply_enabled?: boolean
  auto_reply_message?: string
  signature?: string
  branding?: {
    logo_url?: string
    primary_color?: string
    secondary_color?: string
    accent_color?: string
  }
}

export interface BusinessSettings {
  business_name: string
  business_description?: string
  business_category?: string
  website_url?: string
  social_media?: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
  }
  location?: {
    address?: string
    city?: string
    country?: string
    latitude?: number
    longitude?: number
  }
  contact_preferences?: {
    preferred_language?: string
    timezone?: string
    currency?: string
  }
  ai_settings?: {
    ai_enabled: boolean
    ai_model?: string
    ai_temperature?: number
    ai_max_tokens?: number
    ai_system_prompt?: string
  }
}

export class BusinessService {
  // Default business contact (BargainB)
  private static readonly DEFAULT_BUSINESS_CONTACT: BusinessContact = {
    id: 'bargainb-business',
    name: 'BargainB',
    phone_number: '+31685414129',
    email: 'support@bargainb.com',
    avatar_url: '/bee.png',
    business_hours: {
      monday: { open: '09:00', close: '18:00', isOpen: true },
      tuesday: { open: '09:00', close: '18:00', isOpen: true },
      wednesday: { open: '09:00', close: '18:00', isOpen: true },
      thursday: { open: '09:00', close: '18:00', isOpen: true },
      friday: { open: '09:00', close: '18:00', isOpen: true },
      saturday: { open: '10:00', close: '16:00', isOpen: true },
      sunday: { open: '10:00', close: '16:00', isOpen: false }
    },
    auto_reply_enabled: true,
    auto_reply_message: 'Hi! Thanks for contacting BargainB. We\'ll get back to you soon! 🛒',
    signature: 'Best regards,\nBargainB Team 🐝',
    branding: {
      logo_url: '/bee.png',
      primary_color: '#F59E0B',
      secondary_color: '#EF4444',
      accent_color: '#10B981'
    }
  }

  private static readonly DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
    business_name: 'BargainB',
    business_description: 'AI-powered grocery shopping assistant helping you find the best deals',
    business_category: 'E-commerce / Grocery',
    website_url: 'https://bargainb.com',
    social_media: {
      instagram: '@bargainb_official',
      twitter: '@bargainb_app'
    },
    location: {
      address: 'Amsterdam, Netherlands',
      city: 'Amsterdam',
      country: 'Netherlands'
    },
    contact_preferences: {
      preferred_language: 'en',
      timezone: 'Europe/Amsterdam',
      currency: 'EUR'
    },
    ai_settings: {
      ai_enabled: true,
      ai_model: 'gpt-4',
      ai_temperature: 0.7,
      ai_max_tokens: 1000,
      ai_system_prompt: 'You are BargainB, an AI assistant that helps customers find the best grocery deals and prices.'
    }
  }

  // =============================================================================
  // BUSINESS CONTACT METHODS
  // =============================================================================

  /**
   * Get business contact information
   */
  static async getBusinessContact(): Promise<BusinessContact> {
    try {
      // Try to get from database first
      const { data, error } = await supabaseClient
        .from('business_settings')
        .select('*')
        .eq('key', 'business_contact')
        .single()

      if (error || !data) {
        // Return default if not found
        return this.DEFAULT_BUSINESS_CONTACT
      }

      return JSON.parse(data.value) as BusinessContact
    } catch (error) {
      console.error('❌ Error fetching business contact:', error)
      return this.DEFAULT_BUSINESS_CONTACT
    }
  }

  /**
   * Update business contact information
   */
  static async updateBusinessContact(contact: Partial<BusinessContact>): Promise<boolean> {
    try {
      const currentContact = await this.getBusinessContact()
      const updatedContact = { ...currentContact, ...contact }

      const { error } = await supabaseClient
        .from('business_settings')
        .upsert({
          key: 'business_contact',
          value: JSON.stringify(updatedContact),
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('❌ Error updating business contact:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('❌ Exception in updateBusinessContact:', error)
      return false
    }
  }

  /**
   * Get business avatar URL
   */
  static async getBusinessAvatarUrl(): Promise<string> {
    const contact = await this.getBusinessContact()
    return contact.avatar_url || '/bee.png'
  }

  /**
   * Get business name
   */
  static async getBusinessName(): Promise<string> {
    const contact = await this.getBusinessContact()
    return contact.name || 'BargainB'
  }

  /**
   * Get business phone number
   */
  static async getBusinessPhoneNumber(): Promise<string> {
    const contact = await this.getBusinessContact()
    return contact.phone_number || '+31685414129'
  }

  // =============================================================================
  // BUSINESS SETTINGS METHODS
  // =============================================================================

  /**
   * Get business settings
   */
  static async getBusinessSettings(): Promise<BusinessSettings> {
    try {
      const { data, error } = await supabaseClient
        .from('business_settings')
        .select('*')
        .eq('key', 'business_settings')
        .single()

      if (error || !data) {
        return this.DEFAULT_BUSINESS_SETTINGS
      }

      return JSON.parse(data.value) as BusinessSettings
    } catch (error) {
      console.error('❌ Error fetching business settings:', error)
      return this.DEFAULT_BUSINESS_SETTINGS
    }
  }

  /**
   * Update business settings
   */
  static async updateBusinessSettings(settings: Partial<BusinessSettings>): Promise<boolean> {
    try {
      const currentSettings = await this.getBusinessSettings()
      const updatedSettings = { ...currentSettings, ...settings }

      const { error } = await supabaseClient
        .from('business_settings')
        .upsert({
          key: 'business_settings',
          value: JSON.stringify(updatedSettings),
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('❌ Error updating business settings:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('❌ Exception in updateBusinessSettings:', error)
      return false
    }
  }

  // =============================================================================
  // BRANDING METHODS
  // =============================================================================

  /**
   * Get business branding colors
   */
  static async getBrandingColors(): Promise<{
    primary: string
    secondary: string
    accent: string
  }> {
    const contact = await this.getBusinessContact()
    const branding = contact.branding || this.DEFAULT_BUSINESS_CONTACT.branding!

    return {
      primary: branding.primary_color || '#F59E0B',
      secondary: branding.secondary_color || '#EF4444',
      accent: branding.accent_color || '#10B981'
    }
  }

  /**
   * Get business logo URL
   */
  static async getBusinessLogoUrl(): Promise<string> {
    const contact = await this.getBusinessContact()
    return contact.branding?.logo_url || '/bee.png'
  }

  /**
   * Apply business branding to CSS variables
   */
  static async applyBrandingToDocument(): Promise<void> {
    try {
      const colors = await this.getBrandingColors()
      
      // Apply CSS custom properties
      document.documentElement.style.setProperty('--color-business-primary', colors.primary)
      document.documentElement.style.setProperty('--color-business-secondary', colors.secondary)
      document.documentElement.style.setProperty('--color-business-accent', colors.accent)
      
      console.log('✅ Business branding applied to document')
    } catch (error) {
      console.error('❌ Error applying branding:', error)
    }
  }

  // =============================================================================
  // BUSINESS HOURS METHODS
  // =============================================================================

  /**
   * Check if business is currently open
   */
  static async isBusinessOpen(): Promise<boolean> {
    try {
      const contact = await this.getBusinessContact()
      const businessHours = contact.business_hours || this.DEFAULT_BUSINESS_CONTACT.business_hours!
      
      const now = new Date()
      const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof businessHours
      const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
      
      const todayHours = businessHours[dayOfWeek]
      
      if (!todayHours.isOpen) return false
      
      return currentTime >= todayHours.open && currentTime <= todayHours.close
    } catch (error) {
      console.error('❌ Error checking business hours:', error)
      return true // Default to open if error
    }
  }

  /**
   * Get business status message
   */
  static async getBusinessStatusMessage(): Promise<string> {
    const isOpen = await this.isBusinessOpen()
    const businessName = await this.getBusinessName()
    
    if (isOpen) {
      return `${businessName} is currently open and ready to help! 🟢`
    } else {
      return `${businessName} is currently closed. We'll respond as soon as we're back! 🔴`
    }
  }

  /**
   * Get next business opening time
   */
  static async getNextOpeningTime(): Promise<string> {
    try {
      const contact = await this.getBusinessContact()
      const businessHours = contact.business_hours || this.DEFAULT_BUSINESS_CONTACT.business_hours!
      
      const now = new Date()
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof businessHours
      
      // Check if open today
      const todayHours = businessHours[currentDay]
      if (todayHours.isOpen) {
        return `Open today until ${todayHours.close}`
      }
      
      // Find next open day
      const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      const currentDayIndex = daysOfWeek.indexOf(currentDay)
      
      for (let i = 1; i <= 7; i++) {
        const nextDayIndex = (currentDayIndex + i) % 7
        const nextDay = daysOfWeek[nextDayIndex] as keyof typeof businessHours
        const nextDayHours = businessHours[nextDay]
        
        if (nextDayHours.isOpen) {
          const dayName = nextDay.charAt(0).toUpperCase() + nextDay.slice(1)
          return `Next open: ${dayName} at ${nextDayHours.open}`
        }
      }
      
      return 'Opening hours not available'
    } catch (error) {
      console.error('❌ Error getting next opening time:', error)
      return 'Opening hours not available'
    }
  }

  // =============================================================================
  // AUTO-REPLY METHODS
  // =============================================================================

  /**
   * Check if auto-reply is enabled
   */
  static async isAutoReplyEnabled(): Promise<boolean> {
    const contact = await this.getBusinessContact()
    return contact.auto_reply_enabled || false
  }

  /**
   * Get auto-reply message
   */
  static async getAutoReplyMessage(): Promise<string> {
    const contact = await this.getBusinessContact()
    return contact.auto_reply_message || this.DEFAULT_BUSINESS_CONTACT.auto_reply_message!
  }

  /**
   * Get business signature
   */
  static async getBusinessSignature(): Promise<string> {
    const contact = await this.getBusinessContact()
    return contact.signature || this.DEFAULT_BUSINESS_CONTACT.signature!
  }

  /**
   * Should send auto-reply for this contact
   */
  static async shouldSendAutoReply(contact: Contact): Promise<boolean> {
    try {
      const autoReplyEnabled = await this.isAutoReplyEnabled()
      if (!autoReplyEnabled) return false
      
      const isBusinessOpen = await this.isBusinessOpen()
      if (isBusinessOpen) return false // Don't auto-reply if business is open
      
      // Check if we've already sent an auto-reply to this contact recently
      const { data: recentMessages } = await supabaseClient
        .from('messages')
        .select('id, created_at')
        .eq('sender_type', 'admin')
        .ilike('content', '%auto-reply%')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .limit(1)
      
      return !recentMessages || recentMessages.length === 0
    } catch (error) {
      console.error('❌ Error checking auto-reply conditions:', error)
      return false
    }
  }

  // =============================================================================
  // MESSAGE FORMATTING METHODS
  // =============================================================================

  /**
   * Format message with business branding
   */
  static async formatBusinessMessage(content: string, includeSignature: boolean = true): Promise<string> {
    const businessName = await this.getBusinessName()
    const signature = includeSignature ? await this.getBusinessSignature() : ''
    
    let formattedMessage = content
    
    // Add business context if not already present
    if (!content.toLowerCase().includes(businessName.toLowerCase())) {
      formattedMessage = `*${businessName}* - ${content}`
    }
    
    // Add signature if requested
    if (includeSignature && signature) {
      formattedMessage += `\n\n${signature}`
    }
    
    return formattedMessage
  }

  /**
   * Create welcome message for new contacts
   */
  static async createWelcomeMessage(contactName?: string): Promise<string> {
    const businessName = await this.getBusinessName()
    const settings = await this.getBusinessSettings()
    
    const greeting = contactName ? `Hi ${contactName}!` : 'Hi there!'
    
    return `${greeting} 👋

Welcome to *${businessName}*! ${settings.business_description || 'We\'re here to help you!'}

🛒 I can help you:
• Find the best grocery deals
• Compare prices across stores
• Create shopping lists
• Get product recommendations

Just mention *@bb* followed by your question and I'll assist you right away!

Example: "@bb compare milk prices"

${await this.getBusinessSignature()}`
  }

  /**
   * Create business hours message
   */
  static async createBusinessHoursMessage(): Promise<string> {
    const businessName = await this.getBusinessName()
    const contact = await this.getBusinessContact()
    const businessHours = contact.business_hours || this.DEFAULT_BUSINESS_CONTACT.business_hours!
    
    let message = `*${businessName} Business Hours* 🕐\n\n`
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    
    days.forEach((day, index) => {
      const dayHours = businessHours[day as keyof typeof businessHours]
      const dayName = dayNames[index]
      
      if (dayHours.isOpen) {
        message += `${dayName}: ${dayHours.open} - ${dayHours.close}\n`
      } else {
        message += `${dayName}: Closed\n`
      }
    })
    
    const statusMessage = await this.getBusinessStatusMessage()
    message += `\n${statusMessage}`
    
    return message
  }

  // =============================================================================
  // CONTACT PROFILE PICTURE METHODS
  // =============================================================================

  /**
   * Fetch contact profile picture from WhatsApp
   */
  static async fetchContactProfilePicture(phoneNumber: string): Promise<string | null> {
    try {
      const response = await fetch(`/api/admin/contact-picture/${encodeURIComponent(phoneNumber)}`)
      
      if (!response.ok) {
        return null
      }
      
      const data = await response.json()
      return data.profile_picture_url || null
    } catch (error) {
      console.error('❌ Error fetching contact profile picture:', error)
      return null
    }
  }

  /**
   * Update contact profile picture
   */
  static async updateContactProfilePicture(contactId: string, pictureUrl: string): Promise<boolean> {
    try {
      const { error } = await supabaseClient
        .from('contacts')
        .update({
          profile_picture_url: pictureUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', contactId)
      
      if (error) {
        console.error('❌ Error updating contact profile picture:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.error('❌ Exception in updateContactProfilePicture:', error)
      return false
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Get business contact for display in admin messages
   */
  static async getBusinessContactForDisplay(): Promise<{
    name: string
    avatar: string
    phone: string
  }> {
    const contact = await this.getBusinessContact()
    
    return {
      name: contact.name,
      avatar: contact.avatar_url || '/bee.png',
      phone: contact.phone_number
    }
  }

  /**
   * Initialize business service (call on app startup)
   */
  static async initialize(): Promise<void> {
    try {
      // Apply branding to document
      await this.applyBrandingToDocument()
      
      // Log business status
      const businessName = await this.getBusinessName()
      const isOpen = await this.isBusinessOpen()
      
      console.log(`🏢 ${businessName} initialized - Status: ${isOpen ? 'Open' : 'Closed'}`)
    } catch (error) {
      console.error('❌ Error initializing business service:', error)
    }
  }
} 