import { ERROR_CODES, ERROR_MESSAGES, SUCCESS_INDICATORS } from './constants'

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiError {
  code: string
  message: string
  status?: number
  details?: any
}

// Custom error class for API errors
export class ApiClientError extends Error {
  code: string
  status?: number
  details?: any

  constructor(code: string, message: string, status?: number, details?: any) {
    super(message)
    this.name = 'ApiClientError'
    this.code = code
    this.status = status
    this.details = details
  }
}

// HTTP status code to error code mapping
export const mapHttpStatusToErrorCode = (status: number): string => {
  switch (status) {
    case 400:
      return ERROR_CODES.VALIDATION_ERROR
    case 401:
      return ERROR_CODES.AUTHENTICATION_ERROR
    case 403:
      return ERROR_CODES.AUTHORIZATION_ERROR
    case 404:
      return ERROR_CODES.NOT_FOUND_ERROR
    case 408:
      return ERROR_CODES.TIMEOUT_ERROR
    case 500:
    case 502:
    case 503:
    case 504:
      return ERROR_CODES.SERVER_ERROR
    default:
      return ERROR_CODES.UNKNOWN_ERROR
  }
}

// Transform API response to standardized format
export const transformApiResponse = <T>(response: any): ApiResponse<T> => {
  // Handle responses that already follow our format
  if (typeof response === 'object' && response !== null) {
    if (SUCCESS_INDICATORS.SUCCESS_FIELD in response) {
      // Check if the response has a dedicated data field
      if (SUCCESS_INDICATORS.DATA_FIELD in response) {
        return {
          success: response[SUCCESS_INDICATORS.SUCCESS_FIELD],
          data: response[SUCCESS_INDICATORS.DATA_FIELD],
          error: response[SUCCESS_INDICATORS.ERROR_FIELD],
          message: response[SUCCESS_INDICATORS.MESSAGE_FIELD],
        }
      } else {
        // Response has success field but data is in the root object
        // This is common for assignment APIs that return data directly
        const { success, error, message, ...dataFields } = response
        return {
          success: response[SUCCESS_INDICATORS.SUCCESS_FIELD],
          data: Object.keys(dataFields).length > 0 ? dataFields : response,
          error: response[SUCCESS_INDICATORS.ERROR_FIELD],
          message: response[SUCCESS_INDICATORS.MESSAGE_FIELD],
        }
      }
    }
    
    // Handle responses that have data directly
    if (SUCCESS_INDICATORS.DATA_FIELD in response || Array.isArray(response)) {
      return {
        success: true,
        data: response[SUCCESS_INDICATORS.DATA_FIELD] || response,
        error: response[SUCCESS_INDICATORS.ERROR_FIELD],
        message: response[SUCCESS_INDICATORS.MESSAGE_FIELD],
      }
    }
  }

  // Assume success if we get any data
  return {
    success: true,
    data: response,
  }
}

// Create standardized error from various sources
export const createApiError = (
  error: any,
  defaultCode: string = ERROR_CODES.UNKNOWN_ERROR
): ApiClientError => {
  // If it's already our custom error, return it
  if (error instanceof ApiClientError) {
    return error
  }

  // Handle fetch errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new ApiClientError(
      ERROR_CODES.NETWORK_ERROR,
      ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
      0,
      { originalError: error.message }
    )
  }

  // Handle timeout errors
  if (error.name === 'AbortError' || error.message.includes('timeout')) {
    return new ApiClientError(
      ERROR_CODES.TIMEOUT_ERROR,
      ERROR_MESSAGES[ERROR_CODES.TIMEOUT_ERROR],
      408,
      { originalError: error.message }
    )
  }

  // Handle HTTP response errors
  if (error.status || error.response?.status) {
    const status = error.status || error.response.status
    const code = mapHttpStatusToErrorCode(status)
    const message = error.message || ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR]
    
    return new ApiClientError(code, message, status, {
      originalError: error.message,
      response: error.response,
    })
  }

  // Handle string errors
  if (typeof error === 'string') {
    return new ApiClientError(defaultCode, error)
  }

  // Handle generic errors
  const message = error?.message || ERROR_MESSAGES[defaultCode as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR]
  return new ApiClientError(defaultCode, message, undefined, {
    originalError: error,
  })
}

// Validate required fields in data
export const validateRequiredFields = (
  data: Record<string, any>,
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } => {
  const missingFields = requiredFields.filter(field => {
    const value = data[field]
    return value === undefined || value === null || value === ''
  })

  return {
    isValid: missingFields.length === 0,
    missingFields,
  }
}

// Sleep utility for retry delays
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Calculate exponential backoff delay
export const calculateBackoffDelay = (
  attempt: number,
  baseDelay: number,
  multiplier: number,
  maxDelay: number = 30000
): number => {
  const delay = baseDelay * Math.pow(multiplier, attempt - 1)
  return Math.min(delay, maxDelay)
}

// Parse phone number to consistent format
export const parsePhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Ensure it starts with country code
  if (cleaned.length === 10) {
    return `1${cleaned}` // Assume US if 10 digits
  }
  
  return cleaned
}

// Format phone number for display
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = parsePhoneNumber(phone)
  
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // US number: +1 (555) 123-4567
    const area = cleaned.slice(1, 4)
    const prefix = cleaned.slice(4, 7)
    const line = cleaned.slice(7)
    return `+1 (${area}) ${prefix}-${line}`
  }
  
  // International or other format
  return `+${cleaned}`
}

// Extract WhatsApp JID from phone number
export const phoneToWhatsAppJid = (phone: string): string => {
  const cleaned = parsePhoneNumber(phone)
  return `${cleaned}@s.whatsapp.net`
}

// Extract phone number from WhatsApp JID
export const whatsAppJidToPhone = (jid: string): string => {
  return jid.split('@')[0]
}

// Sanitize user input
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '')
}

// Format date for display
export const formatDate = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Format date and time for display
export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Calculate success rate percentage
export const calculateSuccessRate = (successful: number, total: number): number => {
  if (total === 0) return 0
  return Math.round((successful / total) * 100 * 100) / 100 // Round to 2 decimal places
}

// Format large numbers (e.g., 1000 -> 1K)
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

// Deep clone object (simple implementation)
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (Array.isArray(obj)) return obj.map(item => deepClone(item)) as unknown as T
  
  const cloned = {} as T
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}

// Check if response indicates success
export const isSuccessResponse = (response: any): boolean => {
  if (!response || typeof response !== 'object') return false
  
  // Check explicit success field
  if (SUCCESS_INDICATORS.SUCCESS_FIELD in response) {
    return response[SUCCESS_INDICATORS.SUCCESS_FIELD] === true
  }
  
  // Check for error field
  if (SUCCESS_INDICATORS.ERROR_FIELD in response) {
    return !response[SUCCESS_INDICATORS.ERROR_FIELD]
  }
  
  // Assume success if we have data
  return SUCCESS_INDICATORS.DATA_FIELD in response || Array.isArray(response)
}

// Generate unique request ID for tracking
export const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Debounce function for search inputs
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
} 