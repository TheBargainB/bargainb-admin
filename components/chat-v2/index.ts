// =============================================================================
// CHAT 2.0 COMPONENTS - Main Export File
// =============================================================================

// Conversation components
export * from './conversations'

// Message components  
export * from './messages'

// Contact components
export * from './contacts'

// =============================================================================
// COMPONENT GROUPS
// =============================================================================

// Re-export specific components for convenience
export { 
  ConversationItem,
  ConversationList 
} from './conversations'

export {
  MessageStatus,
  MessageBubble, 
  MessageInput,
  MessageArea
} from './messages'

export {
  ContactProfile,
  ContactsDialog
} from './contacts' 