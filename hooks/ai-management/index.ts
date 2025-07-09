// Individual hooks
export { useBBAssistants } from './useBBAssistants'
export { useUserAssignments } from './useUserAssignments'
export { useAnalytics } from './useAnalytics'
export { useContacts } from './useContacts'

// Main combined hook
export { useAIManagement } from './useAIManagement'

// Re-export types for convenience
export type {
  BBAssistant,
  UserAssignment,
  AIInteraction,
  UsageAnalytics,
  WhatsAppContact,
  CreateAssistantData,
  AssignUserData
} from '@/types/ai-management.types' 