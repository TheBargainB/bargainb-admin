// API Endpoints
export const API_ENDPOINTS = {
  // BB Agent Assistant APIs - Local routes that proxy to LangGraph Platform
  BB_ASSISTANTS: '/api/admin/ai-management/bb-assistants',
  BB_ASSISTANT_BY_ID: (id: string) => `/api/admin/ai-management/bb-assistants/${id}`,
  BB_ASSISTANTS_CREATE: '/api/admin/ai-management/bb-assistants',
  
  // User Assignment APIs  
  USER_ASSIGNMENTS: '/api/admin/ai-management/assignments',
  
  // Analytics & Interactions APIs
  AI_INTERACTIONS: '/api/admin/ai-management/interactions',
  AI_ANALYTICS: '/api/admin/ai-management/analytics',
  AI_STATS: '/api/ai/stats',
  
  // Unified Chat APIs
  CHAT_CONVERSATIONS: '/api/admin/chat/conversations',
  CHAT_MESSAGES: '/api/admin/chat/messages',
  CHAT_RECENT_MESSAGES: '/api/admin/chat/recent-messages',
  CHAT_SEND_MESSAGE: '/api/admin/chat/send-message',
  CHAT_NOTIFICATIONS: '/api/admin/chat/notifications',
  CHAT_WEBHOOK: '/api/admin/chat/webhook',
  CHAT_ASSISTANTS: '/api/admin/chat/assistants',
  CHAT_ASSISTANTS_CREATE: '/api/admin/chat/assistants/create',
  CHAT_ASSISTANTS_BY_ID: (id: string) => `/api/admin/chat/assistants/${id}`,
  
  // Unified CRM Contact APIs
  CONTACTS_SYNC: '/api/admin/contacts/sync',
  CONTACTS_BY_PHONE: (phoneNumber: string) => `/api/admin/contacts/${phoneNumber}`,
  CONTACTS_PICTURE: (phoneNumber: string) => `/api/admin/contacts/picture/${phoneNumber}`,
  
  // Legacy APIs (to be deprecated)
  CONTACTS_DB: '/api/admin/contacts',
  CONTACTS: '/api/admin/contacts',
  CONTACT_SYNC: '/api/admin/contacts/sync',
  
  // WhatsApp APIs
  WHATSAPP_AI: '/api/whatsapp/ai',
  WA_CHATS: (chatId: string) => `/api/whatsapp/chats/${chatId}`,
  WA_AI_CONFIG: (chatId: string) => `/api/whatsapp/chats/${chatId}/ai-config`,
} as const

// Agent BB API Configuration
export const AGENT_BB_CONFIG = {
  BASE_URL: 'https://agnet-bb-v2-cc009669aec9511e9dd20dc4263f4b67.us.langgraph.app',
  GRAPH_ID: 'supervisor_agent',
  API_KEY_ENV: 'LANGSMITH_API_KEY',
  DEFAULT_RECURSION_LIMIT: 25,
  DEFAULT_TIMEOUT: 30000
} as const

// Assistant Configuration Templates
export const ASSISTANT_CONFIG_TEMPLATES = {
  DEFAULT: {
    recursion_limit: AGENT_BB_CONFIG.DEFAULT_RECURSION_LIMIT,
    configurable: {
      ENABLE_TOOLS: true,
      ENABLE_PRODUCT_SEARCH: true,
      ENABLE_PRICE_COMPARISON: true,
      ENABLE_STORE_LOCATOR: true,
      ENABLE_RECIPE_SUGGESTIONS: true,
      ENABLE_BUDGET_TRACKING: true,
      ENABLE_DEAL_ALERTS: true,
      ENABLE_NUTRITION_INFO: true,
      ENABLE_SHOPPING_LISTS: true,
      ENABLE_MEAL_PLANNING: true,
      ENABLE_FALLBACK_RESPONSES: true,
      MAX_TOOL_CALLS_PER_REQUEST: 3,
      REQUEST_TIMEOUT_SECONDS: 30,
      TEMPERATURE: 0.7,
      RESPONSE_STYLE: 'helpful'
    }
  },
  MINIMAL: {
    recursion_limit: 15,
    configurable: {
      ENABLE_TOOLS: true,
      ENABLE_PRODUCT_SEARCH: true,
      ENABLE_FALLBACK_RESPONSES: true,
      MAX_TOOL_CALLS_PER_REQUEST: 2,
      REQUEST_TIMEOUT_SECONDS: 15,
      TEMPERATURE: 0.5,
      RESPONSE_STYLE: 'concise'
    }
  }
} as const

// HTTP Configuration
export const HTTP_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second base delay
  RETRY_MULTIPLIER: 2, // Exponential backoff
} as const

// Error Codes
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const

// Error Messages
export const ERROR_MESSAGES = {
  [ERROR_CODES.NETWORK_ERROR]: 'Network connection failed. Please check your internet connection.',
  [ERROR_CODES.TIMEOUT_ERROR]: 'Request timed out. Please try again.',
  [ERROR_CODES.AUTHENTICATION_ERROR]: 'Authentication failed. Please log in again.',
  [ERROR_CODES.AUTHORIZATION_ERROR]: 'You do not have permission to perform this action.',
  [ERROR_CODES.VALIDATION_ERROR]: 'Invalid data provided. Please check your input.',
  [ERROR_CODES.NOT_FOUND_ERROR]: 'The requested resource was not found.',
  [ERROR_CODES.SERVER_ERROR]: 'Server error occurred. Please try again later.',
  [ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
} as const

// Default Pagination
export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  DEFAULT_PAGE: 1,
} as const

// AI Configuration Defaults
export const AI_DEFAULTS = {
  RECURSION_LIMIT: 25,
  DEFAULT_LANGUAGE: 'en',
  DEFAULT_VERSION: '1.0.0',
  DEFAULT_SOURCE: 'bargainb-admin',
} as const

// Assignment Priorities
export const ASSIGNMENT_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const

// Success Response Indicators
export const SUCCESS_INDICATORS = {
  SUCCESS_FIELD: 'success',
  DATA_FIELD: 'data',
  ERROR_FIELD: 'error',
  MESSAGE_FIELD: 'message',
} as const 