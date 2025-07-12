'use client'

import type { Contact, Message, Conversation, MessageStatus, MessageDirection } from '@/types/chat-v2.types'
import { normalizePhoneNumber, extractPhoneFromJid, isValidPhoneNumber, formatPhoneNumber } from './api-utils'
import { ContactService } from './ContactService'

// =============================================================================
// CHAT-V2 ADVANCED HELPER FUNCTIONS
// =============================================================================

export class ChatHelpers {
  // =============================================================================
  // TIME & DATE FORMATTING
  // =============================================================================

  /**
   * Format timestamp for message display
   */
  static formatMessageTime(timestamp: string): string {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffMins < 1) return 'now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays < 7) return `${diffDays}d ago`
      
      return date.toLocaleDateString()
    } catch {
      return 'Invalid date'
    }
  }

  /**
   * Format timestamp for conversation list
   */
  static formatConversationTime(timestamp: string): string {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      if (diffDays < 7) {
        return date.toLocaleDateString([], { weekday: 'short' })
      }
      
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    } catch {
      return 'Invalid date'
    }
  }

  /**
   * Format detailed timestamp
   */
  static formatDetailedTime(timestamp: string): string {
    try {
      const date = new Date(timestamp)
      return date.toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Invalid date'
    }
  }

  // =============================================================================
  // CONTACT UTILITIES
  // =============================================================================

  /**
   * Get contact display name with smart fallback
   */
  static getContactDisplayName(contact: Contact | null | undefined): string {
    return ContactService.getContactDisplayName(contact)
  }

  /**
   * Get contact initials for avatar
   */
  static getContactInitials(contact: Contact | null | undefined): string {
    return ContactService.getContactInitials(contact)
  }

  /**
   * Get contact avatar URL with fallback
   */
  static getContactAvatarUrl(contact: Contact | null | undefined): string {
    if (!contact) return '/placeholder-user.jpg'
    return ContactService.getAvatarUrl(contact)
  }

  /**
   * Check if contact is active (recently seen)
   */
  static isContactActive(contact: Contact | null | undefined): boolean {
    if (!contact?.last_seen_at) return false
    
    const lastSeen = new Date(contact.last_seen_at)
    const now = new Date()
    const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60)
    
    return diffMinutes <= 10 // Consider active if seen within 10 minutes
  }

  /**
   * Get contact status indicator
   */
  static getContactStatusIndicator(contact: Contact | null | undefined): {
    color: string
    text: string
  } {
    if (!contact) return { color: 'gray', text: 'Unknown' }
    
    if (this.isContactActive(contact)) {
      return { color: 'green', text: 'Active' }
    }
    
    if (contact.last_seen_at) {
      const lastSeen = this.formatMessageTime(contact.last_seen_at)
      return { color: 'gray', text: `Last seen ${lastSeen}` }
    }
    
    return { color: 'gray', text: 'Offline' }
  }

  // =============================================================================
  // PHONE NUMBER UTILITIES (moved to api-utils.ts for consolidation)
  // =============================================================================

  // =============================================================================
  // MESSAGE UTILITIES
  // =============================================================================

  /**
   * Get message status icon
   */
  static getMessageStatusIcon(status: MessageStatus): string {
    switch (status) {
      case 'pending': return '⏳'
      case 'sent': return '✓'
      case 'delivered': return '✓✓'
      case 'read': return '✓✓' // Should be blue in UI
      case 'failed': return '⚠️'
      case 'error': return '❌'
      default: return '○'
    }
  }

  /**
   * Get message status color
   */
  static getMessageStatusColor(status: MessageStatus): string {
    switch (status) {
      case 'pending': return 'text-yellow-500'
      case 'sent': return 'text-gray-500'
      case 'delivered': return 'text-gray-500'
      case 'read': return 'text-blue-500'
      case 'failed': return 'text-red-500'
      case 'error': return 'text-red-500'
      default: return 'text-gray-400'
    }
  }

  /**
   * Get message direction indicator
   */
  static getMessageDirectionStyle(direction: MessageDirection): {
    alignment: string
    bgColor: string
    textColor: string
  } {
    if (direction === 'outbound') {
      return {
        alignment: 'ml-auto',
        bgColor: 'bg-blue-500',
        textColor: 'text-white'
      }
    }
    
    return {
      alignment: 'mr-auto',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      textColor: 'text-gray-900 dark:text-gray-100'
    }
  }

  /**
   * Check if message contains @bb mention
   */
  static containsBBMention(content: string): boolean {
    if (!content) return false
    return /@bb/i.test(content)
  }

  /**
   * Extract @bb query from message
   */
  static extractBBQuery(content: string): string {
    if (!content) return ''
    
    const match = content.match(/@bb\s+(.+)/i)
    return match ? match[1].trim() : ''
  }

  /**
   * Truncate message content for preview
   */
  static truncateMessage(content: string, maxLength: number = 50): string {
    if (!content) return ''
    if (content.length <= maxLength) return content
    
    return `${content.substring(0, maxLength)}...`
  }

  // =============================================================================
  // CONVERSATION UTILITIES
  // =============================================================================

  /**
   * Get conversation title with fallback
   */
  static getConversationTitle(conversation: Conversation): string {
    if (conversation.title) return conversation.title
    if (conversation.contact) return this.getContactDisplayName(conversation.contact)
    return 'Untitled Conversation'
  }

  /**
   * Get conversation subtitle (last message or status)
   */
  static getConversationSubtitle(conversation: Conversation): string {
    if (conversation.last_message) {
      return this.truncateMessage(conversation.last_message, 60)
    }
    
    if (conversation.contact) {
      return formatPhoneNumber(conversation.contact.phone_number)
    }
    
    return 'No messages yet'
  }

  /**
   * Get conversation status badge
   */
  static getConversationStatusBadge(conversation: Conversation): {
    color: string
    text: string
  } {
    switch (conversation.status) {
      case 'active':
        return { color: 'green', text: 'Active' }
      case 'archived':
        return { color: 'gray', text: 'Archived' }
      case 'resolved':
        return { color: 'blue', text: 'Resolved' }
      default:
        return { color: 'gray', text: 'Unknown' }
    }
  }

  /**
   * Check if conversation has unread messages
   */
  static hasUnreadMessages(conversation: Conversation): boolean {
    return conversation.unread_count > 0
  }

  // =============================================================================
  // UI UTILITIES
  // =============================================================================

  /**
   * Generate CSS classes for component states
   */
  static getStateClasses(isActive: boolean, isHovered: boolean = false): string {
    const baseClasses = 'transition-all duration-200 ease-in-out'
    const activeClasses = isActive ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''
    const hoverClasses = isHovered ? 'hover:bg-gray-50 dark:hover:bg-gray-800' : ''
    
    return [baseClasses, activeClasses, hoverClasses].filter(Boolean).join(' ')
  }

  /**
   * Check if user is at bottom of scroll area
   */
  static isAtBottom(scrollElement: HTMLElement | null, threshold: number = 10): boolean {
    if (!scrollElement) return true
    
    const { scrollTop, scrollHeight, clientHeight } = scrollElement
    return Math.abs(scrollHeight - clientHeight - scrollTop) <= threshold
  }

  /**
   * Scroll to bottom of element
   */
  static scrollToBottom(element: HTMLElement | null, behavior: ScrollBehavior = 'smooth'): void {
    if (!element) return
    
    element.scrollTo({
      top: element.scrollHeight,
      behavior
    })
  }

  /**
   * Get responsive text size class
   */
  static getResponsiveTextSize(size: 'sm' | 'md' | 'lg' | 'xl'): string {
    switch (size) {
      case 'sm': return 'text-sm md:text-base'
      case 'md': return 'text-base md:text-lg'
      case 'lg': return 'text-lg md:text-xl'
      case 'xl': return 'text-xl md:text-2xl'
      default: return 'text-base'
    }
  }

  // =============================================================================
  // VALIDATION UTILITIES
  // =============================================================================

  /**
   * Validate message content
   */
  static isValidMessageContent(content: string): boolean {
    return content.trim().length > 0 && content.trim().length <= 4096
  }

  /**
   * Validate contact data
   */
  static isValidContactData(contact: Partial<Contact>): boolean {
    return !!(contact.phone_number && isValidPhoneNumber(contact.phone_number))
  }

  /**
   * Sanitize user input
   */
  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '')
  }

  // =============================================================================
  // FILE & MEDIA UTILITIES
  // =============================================================================

  /**
   * Format file size
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Get file type icon
   */
  static getFileTypeIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️'
    if (mimeType.startsWith('video/')) return '🎥'
    if (mimeType.startsWith('audio/')) return '🎵'
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('document')) return '📝'
    if (mimeType.includes('spreadsheet')) return '📊'
    return '📎'
  }

  /**
   * Check if file type is supported
   */
  static isSupportedFileType(mimeType: string): boolean {
    const supportedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'application/pdf',
      'text/plain'
    ]
    
    return supportedTypes.includes(mimeType)
  }

  // =============================================================================
  // SEARCH & FILTER UTILITIES
  // =============================================================================

  /**
   * Filter conversations by search term
   */
  static filterConversations(conversations: Conversation[], searchTerm: string): Conversation[] {
    if (!searchTerm.trim()) return conversations
    
    const term = searchTerm.toLowerCase()
    
    return conversations.filter(conversation => {
      const title = this.getConversationTitle(conversation).toLowerCase()
      const subtitle = this.getConversationSubtitle(conversation).toLowerCase()
      const contactName = conversation.contact ? this.getContactDisplayName(conversation.contact).toLowerCase() : ''
      
      return title.includes(term) || subtitle.includes(term) || contactName.includes(term)
    })
  }

  /**
   * Filter contacts by search term
   */
  static filterContacts(contacts: Contact[], searchTerm: string): Contact[] {
    if (!searchTerm.trim()) return contacts
    
    const term = searchTerm.toLowerCase()
    
    return contacts.filter(contact => {
      const displayName = this.getContactDisplayName(contact).toLowerCase()
      const phoneNumber = formatPhoneNumber(contact.phone_number).toLowerCase()
      
      return displayName.includes(term) || phoneNumber.includes(term)
    })
  }

  // =============================================================================
  // LEGACY COMPATIBILITY METHODS (from chat-utils/helpers.ts)
  // =============================================================================

  /**
   * Format timestamp to user-friendly relative time (legacy compatibility)
   */
  static formatTime(timestamp: number | string): string {
    return this.formatMessageTime(timestamp.toString())
  }

  /**
   * Get contact name from phone number or contact object (legacy compatibility)
   */
  static getContactName(contact: Contact | string, contactList: Contact[] = []): string {
    return ContactService.getContactName(contact, contactList)
  }

  /**
   * Get contact avatar URL (legacy compatibility)
   */
  static getContactAvatar(contact: Contact | string, contactList: Contact[] = []): string {
    return ContactService.getContactAvatar(contact, contactList)
  }

  /**
   * Get Tailwind color class for conversation status (legacy compatibility)
   */
  static getStatusColor(status: string): string {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "archived":
        return "bg-red-500"
      case "resolved":
        return "bg-muted-foreground"
      default:
        return "bg-blue-500"
    }
  }

  /**
   * Get proper display name for conversation (legacy compatibility)
   */
  static getDisplayName(conversation: Conversation | undefined, contactList: Contact[] = []): string {
    if (!conversation) return "Select a contact"
    
    const contact = conversation.contact
    if (contact) {
      return ContactService.getContactName(contact, contactList)
    }
    
    return conversation.title || "Unknown Contact"
  }

  // =============================================================================
  // ACCESSIBILITY UTILITIES
  // =============================================================================

  /**
   * Get ARIA label for conversation
   */
  static getConversationAriaLabel(conversation: Conversation): string {
    const title = this.getConversationTitle(conversation)
    const unreadCount = conversation.unread_count
    const hasUnread = unreadCount > 0
    
    return `Conversation with ${title}${hasUnread ? `, ${unreadCount} unread messages` : ''}`
  }

  /**
   * Get ARIA label for message
   */
  static getMessageAriaLabel(message: Message): string {
    const direction = message.direction === 'outbound' ? 'sent' : 'received'
    const time = this.formatMessageTime(message.created_at)
    
    return `Message ${direction} at ${time}: ${message.content}`
  }

  /**
   * Get keyboard shortcut hint
   */
  static getKeyboardShortcut(action: string): string {
    const shortcuts: Record<string, string> = {
      'send': 'Enter',
      'newline': 'Shift+Enter',
      'search': 'Ctrl+F',
      'archive': 'Ctrl+A',
      'delete': 'Delete'
    }
    
    return shortcuts[action] || ''
  }
} 