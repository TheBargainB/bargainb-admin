// Shared types for the chat system

// UI-friendly WhatsApp contact interface (for components and hooks)
export interface WhatsAppContact {
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
export interface ChatConversation {
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

// Chat message interface
export interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'ai' | 'admin'
  senderName: string
  timestamp: string
  confidence?: number
  status?: string
  metadata?: Record<string, any>
}

// WhatsApp message interface
export interface WhatsAppMessage {
  id: string
  fromMe: boolean
  remoteJid: string
  conversation: string
  timestamp: number
  status?: number
}

// WASender hook interface
export interface UseWASenderHook {
  whatsappMessages: WhatsAppMessage[]
  whatsappContacts: WhatsAppContact[]
  allContacts: WhatsAppContact[]
  isLoadingContacts: boolean
  isSyncingContacts: boolean
  isCreatingConversation: boolean
  setWhatsappMessages: (messages: WhatsAppMessage[]) => void
  setWhatsappContacts: (contacts: WhatsAppContact[]) => void
  setAllContacts: (contacts: WhatsAppContact[]) => void
  setIsLoadingContacts: (loading: boolean) => void
  loadWhatsAppData: () => Promise<void>
  sendWhatsAppMessage: () => Promise<boolean>
  syncContactsWithWASender: () => Promise<boolean>
  startConversationWithContact: (contact: WhatsAppContact) => Promise<ChatConversation | null>
  startNewChat: (contact: WhatsAppContact) => Promise<ChatConversation | null>
  getMessageStatusIcon: (status?: string, metadata?: Record<string, any>) => string | null
  extractPhoneNumber: (jidOrEmail: string) => string
  clearWhatsAppData: () => void
} 