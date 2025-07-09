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
  phoneToWhatsAppJid,
  whatsAppJidToPhone,
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

// Re-export common utils from lib/utils.ts for backward compatibility
export { cn } from './utils' 