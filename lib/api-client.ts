import { HTTP_CONFIG, ERROR_CODES } from './constants'
import { 
  ApiResponse, 
  ApiClientError, 
  transformApiResponse, 
  createApiError, 
  sleep, 
  calculateBackoffDelay,
  generateRequestId,
  isSuccessResponse
} from './api-utils'

// Request configuration interface
export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  timeout?: number
  retryAttempts?: number
  skipRetry?: boolean
  requireAuth?: boolean
  signal?: AbortSignal
}

// Response interface for internal use
interface FetchResponse {
  ok: boolean
  status: number
  statusText: string
  data: any
  headers: Headers
}

// Request interceptor type
export type RequestInterceptor = (config: {
  url: string
  config: RequestConfig
  requestId: string
}) => Promise<{ url: string; config: RequestConfig }> | { url: string; config: RequestConfig }

// Response interceptor type  
export type ResponseInterceptor = (response: {
  response: FetchResponse
  requestId: string
  url: string
}) => Promise<FetchResponse> | FetchResponse

// Error interceptor type
export type ErrorInterceptor = (error: {
  error: ApiClientError
  requestId: string
  url: string
  attempt: number
}) => Promise<boolean> | boolean // Return true to retry

class ApiClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private errorInterceptors: ErrorInterceptor[] = []

  constructor(baseUrl: string = '', defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    }
    
    // Add default request interceptor for logging
    this.addRequestInterceptor(this.loggingRequestInterceptor)
    
    // Add default response interceptor for logging
    this.addResponseInterceptor(this.loggingResponseInterceptor)
  }

  // Add request interceptor
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor)
  }

  // Add response interceptor
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor)
  }

  // Add error interceptor
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor)
  }

  // Default logging request interceptor
  private loggingRequestInterceptor: RequestInterceptor = ({ url, config, requestId }) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request ${requestId}] ${config.method || 'GET'} ${url}`)
    }
    return { url, config }
  }

  // Default logging response interceptor  
  private loggingResponseInterceptor: ResponseInterceptor = ({ response, requestId, url }) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response ${requestId}] ${response.status} ${url}`)
    }
    return response
  }

  // Set authentication token
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`
  }

  // Remove authentication token
  removeAuthToken(): void {
    delete this.defaultHeaders['Authorization']
  }

  // Update default headers
  setDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers }
  }

  // Main request method with retry logic
  async request<T = any>(
    url: string, 
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const requestId = generateRequestId()
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`
    
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = HTTP_CONFIG.TIMEOUT,
      retryAttempts = HTTP_CONFIG.RETRY_ATTEMPTS,
      skipRetry = false,
      signal,
    } = config

    let lastError: ApiClientError
    const maxAttempts = skipRetry ? 1 : retryAttempts + 1

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Apply request interceptors
        let interceptedUrl = fullUrl
        let interceptedHeaders = { ...headers }
        
        for (const interceptor of this.requestInterceptors) {
          const interceptorConfig: RequestConfig = { ...config, method, headers: interceptedHeaders }
          const result = await interceptor({ url: interceptedUrl, config: interceptorConfig, requestId })
          interceptedUrl = result.url
          interceptedHeaders = { ...interceptedHeaders, ...result.config.headers }
        }

        // Prepare fetch options
        const fetchOptions: RequestInit = {
          method,
          headers: {
            ...this.defaultHeaders,
            ...interceptedHeaders,
          },
          signal: signal || AbortSignal.timeout(timeout),
        }

        // Add body for non-GET requests
        if (body && method !== 'GET') {
          if (typeof body === 'object') {
            fetchOptions.body = JSON.stringify(body)
          } else {
            fetchOptions.body = body
          }
        }

        // Make the request
        const response = await fetch(interceptedUrl, fetchOptions)
        
        // Parse response
        let data: any
        const contentType = response.headers.get('content-type')
        
        if (contentType?.includes('application/json')) {
          data = await response.json()
        } else {
          data = await response.text()
        }

        // Create our response object
        let fetchResponse: FetchResponse = {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          data,
          headers: response.headers,
        }

        // Apply response interceptors
        for (const interceptor of this.responseInterceptors) {
          fetchResponse = await interceptor({ 
            response: fetchResponse, 
            requestId, 
            url: interceptedUrl 
          })
        }

        // Handle HTTP errors
        if (!fetchResponse.ok) {
          const error = createApiError({
            status: fetchResponse.status,
            message: fetchResponse.statusText,
            response: fetchResponse,
          })
          
          // Apply error interceptors to see if we should retry
          let shouldRetry = !skipRetry && attempt < maxAttempts
          for (const interceptor of this.errorInterceptors) {
            const interceptorResult = await interceptor({ 
              error, 
              requestId, 
              url: interceptedUrl, 
              attempt 
            })
            shouldRetry = shouldRetry && interceptorResult
          }

          if (shouldRetry) {
            lastError = error
            const delay = calculateBackoffDelay(attempt, HTTP_CONFIG.RETRY_DELAY, HTTP_CONFIG.RETRY_MULTIPLIER)
            await sleep(delay)
            continue
          }
          
          throw error
        }

        // Transform and return successful response
        const apiResponse = transformApiResponse<T>(fetchResponse.data)
        
        // Check if the response indicates an application-level error
        if (!isSuccessResponse(fetchResponse.data) && apiResponse.error) {
          throw createApiError({
            message: apiResponse.error,
            status: fetchResponse.status,
          })
        }

        return apiResponse
        
      } catch (error) {
        const apiError = createApiError(error)
        
        // Apply error interceptors
        let shouldRetry = !skipRetry && attempt < maxAttempts && this.isRetryableError(apiError)
        for (const interceptor of this.errorInterceptors) {
          const interceptorResult = await interceptor({ 
            error: apiError, 
            requestId, 
            url: fullUrl, 
            attempt 
          })
          shouldRetry = shouldRetry && interceptorResult
        }

        if (shouldRetry) {
          lastError = apiError
          const delay = calculateBackoffDelay(attempt, HTTP_CONFIG.RETRY_DELAY, HTTP_CONFIG.RETRY_MULTIPLIER)
          await sleep(delay)
          continue
        }

        throw apiError
      }
    }

    // If we get here, all retries failed
    throw lastError!
  }

  // Check if error is retryable
  private isRetryableError(error: ApiClientError): boolean {
    // Don't retry client errors (4xx) except for specific cases
    if (error.status && error.status >= 400 && error.status < 500) {
      // Retry on authentication errors (might be token refresh)
      if (error.status === 401) return true
      // Retry on rate limiting
      if (error.status === 429) return true
      // Don't retry other client errors
      return false
    }

    // Retry on network errors, timeouts, and server errors
    const retryableCodes = [
      ERROR_CODES.NETWORK_ERROR,
      ERROR_CODES.TIMEOUT_ERROR,
      ERROR_CODES.SERVER_ERROR,
    ] as string[]
    return retryableCodes.includes(error.code)
  }

  // Convenience methods for common HTTP verbs
  async get<T = any>(url: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'GET' })
  }

  async post<T = any>(url: string, body?: any, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'POST', body })
  }

  async put<T = any>(url: string, body?: any, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'PUT', body })
  }

  async patch<T = any>(url: string, body?: any, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'PATCH', body })
  }

  async delete<T = any>(url: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'DELETE' })
  }
}

// Create and export default API client instance
export const apiClient = new ApiClient()

// Export the class for custom instances
export { ApiClient }

// Helper function to create configured API client
export const createApiClient = (baseUrl?: string, defaultHeaders?: Record<string, string>): ApiClient => {
  return new ApiClient(baseUrl, defaultHeaders)
} 