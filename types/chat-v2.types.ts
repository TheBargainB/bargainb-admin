import { Tables, TablesInsert, TablesUpdate } from './database.types'

// =============================================================================
// DATABASE TYPES - Direct from Supabase schema
// =============================================================================

export type DbConversation = Tables<'conversations'>
export type DbMessage = Tables<'messages'>
export type DbWhatsAppContact = Tables<'whatsapp_contacts'>
export type DbCrmProfile = Tables<'crm_profiles'>

export type ConversationInsert = TablesInsert<'conversations'>
export type MessageInsert = TablesInsert<'messages'>
export type ContactInsert = TablesInsert<'whatsapp_contacts'>

export type ConversationUpdate = TablesUpdate<'conversations'>
export type MessageUpdate = TablesUpdate<'messages'>
export type ContactUpdate = TablesUpdate<'whatsapp_contacts'>

// =============================================================================
// WHATSAPP MESSAGE STATUSES - Matching WhatsApp/WASender states
// =============================================================================

export type MessageStatus = 
  | 'pending'    // Message is being sent
  | 'sent'       // Message sent (single checkmark ✓)
  | 'delivered'  // Message delivered (double checkmark ✓✓)
  | 'read'       // Message read (blue double checkmark ✓✓)
  | 'failed'     // Message failed to send
  | 'error'      // Error occurred

export type MessageDirection = 'inbound' | 'outbound'
export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'document' | 'sticker' | 'location' | 'contact'
export type SenderType = 'user' | 'admin' | 'ai'

// =============================================================================
// WASENDER WEBHOOK TYPES - Based on WASender API documentation
// =============================================================================

export interface WASenderWebhookPayload {
  event: 'messages.upsert' | 'messages.update' | 'session.status'
  data: {
    messages: WASenderMessage[]
  }
}

export interface WASenderMessage {
  key: {
    remoteJid: string      // "1234567890@s.whatsapp.net"
    fromMe: boolean        // false if customer sent, true if we sent
    id: string            // "BAE5A93B52084A3B" - unique message ID
  }
  message?: {
    conversation?: string  // Simple text message
    extendedTextMessage?: {
      text: string        // Text for replies or messages with links
    }
    imageMessage?: WASenderMediaMessage
    videoMessage?: WASenderMediaMessage
    audioMessage?: WASenderMediaMessage
    documentMessage?: WASenderMediaMessage
    stickerMessage?: WASenderMediaMessage
  }
  pushName?: string       // Customer's WhatsApp name
  messageTimestamp: number // Unix timestamp
}

export interface WASenderMediaMessage {
  url: string            // Download URL (encrypted)
  mediaKey: string       // Decryption key
  mimetype: string       // MIME type
  fileName?: string      // File name
}

export interface WASenderSendMessageRequest {
  to: string            // Phone number in E.164 format
  text?: string         // Text message content
  imageUrl?: string     // Image URL to send
  videoUrl?: string     // Video URL to send
  audioUrl?: string     // Audio URL to send (voice note)
  documentUrl?: string  // Document URL to send
  stickerUrl?: string   // Sticker URL (.webp)
}

export interface WASenderSendMessageResponse {
  success: boolean
  data?: {
    msgId: number
    jid: string
    status: 'in_progress' | 'sent' | 'delivered' | 'read' | 'failed'
  }
  error?: string
}

// =============================================================================
// UI/APPLICATION TYPES - Clean, focused types for the frontend
// =============================================================================

export interface Conversation {
  id: string
  whatsapp_contact_id: string
  whatsapp_conversation_id: string
  title?: string
  unread_count: number
  last_message_at?: string
  last_message?: string
  status: 'active' | 'archived' | 'resolved'
  created_at: string
  updated_at?: string
  
  // Joined contact data
  contact?: Contact
}

export interface Message {
  id: string
  conversation_id: string
  content: string
  direction: MessageDirection
  from_me: boolean
  message_type: MessageType
  sender_type: SenderType
  whatsapp_message_id?: string
  whatsapp_status?: MessageStatus
  media_url?: string
  created_at: string
  
  // UI-specific fields
  sender_name?: string
  is_ai_generated?: boolean
  ai_confidence?: number
}

export interface Contact {
  id: string
  phone_number: string
  whatsapp_jid: string
  display_name?: string
  push_name?: string
  verified_name?: string
  profile_picture_url?: string
  is_active: boolean
  last_seen_at?: string
  created_at: string
  updated_at?: string
  
  // CRM data (optional, joined)
  crm_profile?: CrmProfile
}

export interface CrmProfile {
  id: string
  full_name?: string
  preferred_name?: string
  email?: string
  notes?: string
  tags?: string[]
  lifecycle_stage?: string
  engagement_score?: number
  total_conversations?: number
  total_messages?: number
}

// =============================================================================
// NOTIFICATION TYPES - For the notification bell system
// =============================================================================

export interface NotificationData {
  total_unread: number
  conversations_with_unread: number
  latest_message?: {
    id: string
    conversation_id: string
    content: string
    contact_name?: string
    created_at: string
  }
}

export interface UnreadConversation {
  conversation_id: string
  contact_name?: string
  unread_count: number
  last_message: string
  last_message_at: string
}

// =============================================================================
// REAL-TIME SUBSCRIPTION TYPES
// =============================================================================

export interface RealtimeConversationPayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new?: DbConversation
  old?: DbConversation
}

export interface RealtimeMessagePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new?: DbMessage
  old?: DbMessage
}

// =============================================================================
// API RESPONSE TYPES - Standardized API responses
// =============================================================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ConversationsResponse {
  conversations: Conversation[]
  total_count: number
  unread_count: number
}

export interface MessagesResponse {
  messages: Message[]
  total_count: number
  conversation: Conversation
}

export interface ContactsResponse {
  contacts: Contact[]
  total_count: number
}

// =============================================================================
// SEARCH AND FILTER TYPES
// =============================================================================

export interface ConversationFilters {
  search?: string
  status?: 'all' | 'unread' | 'active' | 'archived'
  date_range?: {
    start: string
    end: string
  }
}

export interface ContactFilters {
  search?: string
  has_conversations?: boolean
  is_active?: boolean
}

// =============================================================================
// UI STATE TYPES - For component state management
// =============================================================================

export interface ChatState {
  // Selection state
  selected_conversation_id?: string
  selected_contact_id?: string
  
  // Loading states
  is_loading_conversations: boolean
  is_loading_messages: boolean
  is_loading_contacts: boolean
  is_sending_message: boolean
  
  // UI states
  is_contacts_dialog_open: boolean
  is_contact_profile_open: boolean
  search_term: string
  
  // Real-time states
  is_realtime_connected: boolean
  typing_indicator?: {
    conversation_id: string
    contact_name: string
  }
}

export interface MessageInputState {
  content: string
  is_sending: boolean
  reply_to_message?: Message
}

// =============================================================================
// ERROR TYPES
// =============================================================================

export interface ChatError {
  type: 'network' | 'validation' | 'permission' | 'unknown'
  message: string
  details?: any
  timestamp: string
}

// =============================================================================
// WEBHOOK PROCESSING TYPES
// =============================================================================

export interface ProcessedWebhookMessage {
  conversation_id: string
  message_data: MessageInsert
  contact_data?: ContactInsert | ContactUpdate
  should_trigger_ai?: boolean
  media_files?: {
    type: MessageType
    url: string
    local_path?: string
  }[]
} 