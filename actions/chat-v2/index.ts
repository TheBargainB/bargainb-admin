// =============================================================================
// CHAT 2.0 ACTIONS - Clean export index
// =============================================================================

// Conversation actions
export {
  getConversations,
  getConversationById,
  createConversation,
  updateConversation,
  deleteConversation,
  getConversationByWhatsAppId,
  getTotalUnreadCount as getConversationUnreadCount,
  markConversationAsRead as markConversationRead
} from './conversations.actions'

// Message actions  
export {
  getMessagesByConversation,
  createMessage,
  updateMessage,
  updateMessageStatus,
  deleteMessage,
  getMessageByWhatsAppId,
  extractMessageContent,
  extractPhoneNumber,
  processWASenderWebhookMessage,
  updateConversationLastMessage,
  incrementUnreadCount as incrementMessageUnreadCount
} from './messages.actions'

// Assistant Assignment exports
export {
  checkConversationAssistant,
  getDefaultAssistant,
  assignAssistantToConversation,
  ensureConversationHasAssistant,
  getConversationPhoneNumber,
  type AssistantAssignmentResult,
  type ConversationAssistantInfo
} from './assistant-assignment.actions'

// Contact actions
export {
  getContacts,
  getContactById,
  getContactByPhone,
  createContact,
  updateContact,
  deleteContact,
  upsertContact,
  syncContactsFromWASender,
  searchContacts,
  getContactDisplayName,
  updateContactLastSeen
} from './contacts.actions'

// Notification actions
export {
  getNotificationData,
  getUnreadConversations,
  getTotalUnreadCount as getNotificationUnreadCount,
  markAllConversationsAsRead,
  markConversationAsRead as markNotificationConversationRead,
  getConversationsWithUnreadCount,
  incrementUnreadCount as incrementNotificationUnreadCount,
  getNotificationSummary,
  handleNewMessageNotification,
  processWebhookNotification
} from './notifications.actions'

// Re-export commonly used types for convenience
export type {
  Conversation,
  Message,
  Contact,
  NotificationData,
  ConversationFilters,
  ContactFilters,
  ConversationsResponse,
  MessagesResponse,
  ContactsResponse,
  WASenderWebhookPayload,
  WASenderMessage,
  ProcessedWebhookMessage,
  MessageStatus,
  MessageType,
  SenderType
} from '@/types/chat-v2.types' 