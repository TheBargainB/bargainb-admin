// Export API Client
export { 
  ApiClient, 
  apiClient, 
  createApiClient,
  type RequestConfig,
  type RequestInterceptor,
  type ResponseInterceptor,
  type ErrorInterceptor
} from './api-client'

// Export API Utilities
export {
  type ApiResponse,
  type ApiError,
  ApiClientError,
  transformApiResponse,
  createApiError,
  mapHttpStatusToErrorCode,
  validateRequiredFields,
  sleep,
  calculateBackoffDelay,
  parsePhoneNumber,
  formatPhoneNumber,
  normalizePhoneNumber,
  isValidPhoneNumber,
  phoneToWhatsAppJid,
  whatsAppJidToPhone,
  extractPhoneFromJid,
  extractPhoneNumber,
  sanitizeInput,
  formatDate,
  formatDateTime,
  calculateSuccessRate,
  formatNumber,
  deepClone,
  isSuccessResponse,
  generateRequestId,
  debounce
} from './api-utils'

// Export Constants
export {
  API_ENDPOINTS,
  HTTP_CONFIG,
  ERROR_CODES,
  ERROR_MESSAGES,
  PAGINATION,
  AI_DEFAULTS,
  ASSIGNMENT_PRIORITIES,
  SUCCESS_INDICATORS
} from './constants'

// =============================================================================
// CHAT-V2 ADVANCED FEATURES (CONSOLIDATED)
// =============================================================================

// ContactService Class - Advanced contact management utilities (includes legacy compatibility)
export { ContactService } from './ContactService'

// ChatHelpers Class - Comprehensive utility functions (includes legacy compatibility)
export { ChatHelpers } from './chat-helpers'

// BusinessService Class - Business branding and contact management
export { BusinessService } from './BusinessService'
export type { BusinessContact, BusinessSettings } from './BusinessService'

// Re-export for convenience with aliases to avoid naming conflicts
export { ContactService as Contacts } from './ContactService'
export { ChatHelpers as Helpers } from './chat-helpers' 
export { BusinessService as Business } from './BusinessService'

// Re-export common utils from lib/utils.ts for backward compatibility
export { cn } from './utils' 

// Export Chat Helpers (consolidated - includes all legacy methods)
export * from './chat-helpers'

// =============================================================================
// CONSOLIDATION COMPLETE ✅
// =============================================================================
// All duplicate functions have been consolidated into:
// - Phone utilities → api-utils.ts
// - Contact utilities → ContactService.ts  
// - Chat utilities → ChatHelpers.ts
// - Time formatting → ChatHelpers.ts
// - General utilities → api-utils.ts
// ============================================================================= 