import { useMemo } from 'react'

// WhatsApp contact interface
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

// Chat conversation interface
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

// Message status icon return type
interface MessageStatusIcon {
  icon: string
  color: string
  tooltip: string
}

interface UseHelpersOptions {
  contacts?: WhatsAppContact[]
  allContacts?: WhatsAppContact[]
}

export const useHelpers = ({ contacts = [], allContacts = [] }: UseHelpersOptions = {}) => {
  
  // Format timestamp to user-friendly relative time
  const formatTime = useMemo(() => (timestamp: number | string) => {
    const date = new Date(timestamp)
    const now = new Date()
    
    // Handle invalid dates
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }
    
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }, [])

  // Get contact name from JID
  const getContactName = useMemo(() => (jid: string, contactList: WhatsAppContact[] = contacts) => {
    const contact = contactList.find((c) => c.jid === jid)
    return contact?.name || contact?.notify || jid
  }, [contacts])

  // Get contact avatar URL from JID
  const getContactAvatar = useMemo(() => (jid: string, contactList: WhatsAppContact[] = contacts) => {
    const contact = contactList.find((c) => c.jid === jid)
    return contact?.imgUrl || "/placeholder.svg"
  }, [contacts])

  // Safely get initials from a name string
  const getInitials = useMemo(() => (name: string | null | undefined): string => {
    if (!name || typeof name !== 'string') return '?'
    
    return name
      .split(" ")
      .filter(part => part.length > 0)
      .map((n) => n[0]?.toUpperCase() || '')
      .filter(initial => initial.length > 0)
      .join("")
      .slice(0, 2) || '?'
  }, [])

  // Get Tailwind color class for conversation status
  const getStatusColor = useMemo(() => (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "escalated":
        return "bg-red-500"
      case "resolved":
        return "bg-muted-foreground"
      default:
        return "bg-blue-500"
    }
  }, [])

  // Get Tailwind color class for AI confidence level
  const getConfidenceColor = useMemo(() => (confidence: number) => {
    if (confidence >= 80) return "text-green-600"
    if (confidence >= 60) return "text-yellow-600"
    return "text-red-600"
  }, [])

  // Get WhatsApp message status icon with color and tooltip
  const getMessageStatusIcon = useMemo(() => (status?: string, metadata?: Record<string, any>): MessageStatusIcon | null => {
    const whatsappStatus = metadata?.whatsapp_status
    const statusName = metadata?.whatsapp_status_name || status
    
    // Convert numeric status to string for comparison
    const statusStr = String(statusName)
    
    switch (statusStr) {
      case 'sent':
      case 'pending':
      case '1': // WhatsApp status code for pending
      case '2': // WhatsApp status code for sent
        return { icon: '✓', color: 'text-muted-foreground', tooltip: 'Sent' }
      case 'delivered':
      case '3': // WhatsApp status code for delivered
        return { icon: '✓✓', color: 'text-muted-foreground', tooltip: 'Delivered' }
      case 'read':
      case '4': // WhatsApp status code for read
        return { icon: '✓✓', color: 'text-blue-600 dark:text-blue-400', tooltip: 'Read' }
      case 'failed':
      case 'error':
      case '0': // WhatsApp status code for error
        return { icon: '⚠', color: 'text-red-600 dark:text-red-400', tooltip: 'Failed to send' }
      default:
        // For messages without status, don't show any icon
        return null
    }
  }, [])

  // Extract phone number from JID or email
  const extractPhoneNumber = useMemo(() => (jidOrEmail: string) => {
    // Remove @s.whatsapp.net suffix
    const cleaned = jidOrEmail.replace('@s.whatsapp.net', '')
    
    // If it looks like a phone number (starts with + or is all digits), return as-is
    if (cleaned.match(/^\+?\d+$/)) {
      return cleaned
    }
    
    // Otherwise, it might be an email or other identifier
    return cleaned
  }, [])

  // Get proper display name for conversation
  const getDisplayName = useMemo(() => (
    conversation: ChatConversation | undefined, 
    contactList: WhatsAppContact[] = allContacts
  ): string => {
    if (!conversation) return "Select a contact"
    
    // If user field already has a proper name (not a phone number), use it
    if (conversation.user && 
        conversation.user !== 'Unknown' && 
        !conversation.user.includes('@') && 
        !conversation.user.match(/^\+?\d+$/)) {
      return conversation.user
    }
    
    // Try to find the contact from our contacts list to get the proper name
    const remoteJid = conversation.remoteJid || conversation.email
    if (remoteJid) {
      const contact = contactList.find(c => c.jid === remoteJid) || 
                     contacts.find((c: WhatsAppContact) => c.jid === remoteJid)
      
      if (contact) {
        return contact.name || contact.notify || contact.verifiedName || extractPhoneNumber(remoteJid)
      }
    }
    
    // Fallback to extracting phone number from email/jid
    return extractPhoneNumber(conversation.email || conversation.id)
  }, [allContacts, contacts, extractPhoneNumber])

  // Get conversation subtitle (phone number or status)
  const getConversationSubtitle = useMemo(() => (conversation: ChatConversation | undefined): string => {
    if (!conversation) return ""
    
    const remoteJid = conversation.remoteJid || conversation.email
    const phoneNumber = extractPhoneNumber(remoteJid || '')
    
    // If the display name is already the phone number, show status instead
    const displayName = getDisplayName(conversation)
    if (displayName === phoneNumber) {
      return conversation.status === 'active' ? 'Online' : 'Last seen recently'
    }
    
    return phoneNumber
  }, [extractPhoneNumber, getDisplayName])

  // Check if user is scrolled to bottom (for auto-scroll behavior)
  const isAtBottom = useMemo(() => (scrollElement?: HTMLDivElement | null) => {
    if (!scrollElement) return true
    
    const { scrollTop, scrollHeight, clientHeight } = scrollElement
    return Math.abs(scrollHeight - clientHeight - scrollTop) < 3
  }, [])

  // Get conversation by ID from conversations array
  const getConversationById = useMemo(() => (conversationId: string, conversations: ChatConversation[]) => {
    return conversations.find(conv => conv.id === conversationId)
  }, [])

  // Check if conversation is with a system user (non-WhatsApp contact)
  const isSystemConversation = useMemo(() => (conversation: ChatConversation | undefined): boolean => {
    if (!conversation) return false
    const remoteJid = conversation.remoteJid || conversation.email
    if (!remoteJid) return false
    const phoneNumber = remoteJid.replace('@s.whatsapp.net', '')
    return phoneNumber === 'admin' || phoneNumber.includes('@') || !phoneNumber.match(/^\+?\d+$/)
  }, [])

  // Format file size to human readable format
  const formatFileSize = useMemo(() => (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  // Validate phone number format
  const isValidPhoneNumber = useMemo(() => (phoneNumber: string): boolean => {
    // Basic phone number validation - starts with + and contains digits
    return /^\+?[\d\s\-\(\)]+$/.test(phoneNumber) && phoneNumber.replace(/\D/g, '').length >= 10
  }, [])

  // Truncate text to specified length with ellipsis
  const truncateText = useMemo(() => (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }, [])

  // Check if timestamp is today
  const isToday = useMemo(() => (timestamp: string | number | Date): boolean => {
    const date = new Date(timestamp)
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }, [])

  // Check if timestamp is yesterday
  const isYesterday = useMemo(() => (timestamp: string | number | Date): boolean => {
    const date = new Date(timestamp)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return date.toDateString() === yesterday.toDateString()
  }, [])

  return {
    // Time and date utilities
    formatTime,
    isToday,
    isYesterday,
    
    // Contact utilities
    getContactName,
    getContactAvatar,
    getInitials,
    extractPhoneNumber,
    isValidPhoneNumber,
    
    // Conversation utilities
    getDisplayName,
    getConversationSubtitle,
    getConversationById,
    isSystemConversation,
    
    // Status and UI utilities
    getStatusColor,
    getConfidenceColor,
    getMessageStatusIcon,
    
    // General utilities
    isAtBottom,
    formatFileSize,
    truncateText
  }
} 