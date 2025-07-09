import { BBAssistant, CreateAssistantData } from '@/types/ai-management.types'
import { apiClient, API_ENDPOINTS, ApiResponse, ApiClientError } from '@/lib'

export interface BBAssistantsResponse {
  success: boolean
  data?: BBAssistant[]
  assistant?: BBAssistant
  error?: string
}

export interface ConnectionTestResponse {
  success: boolean
  connected: boolean
  assistants?: BBAssistant[]
  error?: string
}

/**
 * Test connection to BB Agent API and fetch assistants
 */
export const testBBAgentConnection = async (): Promise<ConnectionTestResponse> => {
  try {
    const response = await apiClient.get<BBAssistant[]>(API_ENDPOINTS.BB_ASSISTANTS)

    if (response.success && response.data) {
      return {
        success: true,
        connected: true,
        assistants: response.data
      }
    } else {
      return {
        success: false,
        connected: false,
        error: response.error || 'Failed to connect to BB Agent API'
      }
    }
  } catch (error) {
    return {
      success: false,
      connected: false,
      error: error instanceof ApiClientError ? error.message : 'Connection failed'
    }
  }
}

/**
 * Fetch all BB Agent assistants
 */
export const fetchBBAssistants = async (): Promise<BBAssistantsResponse> => {
  try {
    const response = await apiClient.get<BBAssistant[]>(API_ENDPOINTS.BB_ASSISTANTS)

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data
      }
    } else {
      return {
        success: false,
        error: response.error || 'Failed to fetch assistants'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof ApiClientError ? error.message : 'Failed to fetch assistants'
    }
  }
}

/**
 * Create a new BB Agent assistant
 */
export const createBBAssistant = async (data: CreateAssistantData): Promise<BBAssistantsResponse> => {
  try {
    const payload = {
      name: data.name,
      description: data.description,
      config: {
        recursion_limit: data.recursion_limit,
        configurable: typeof data.configurable === 'string' 
          ? JSON.parse(data.configurable) 
          : data.configurable
      }
    }

    const response = await apiClient.post<BBAssistant>(
      API_ENDPOINTS.BB_ASSISTANTS, 
      payload
    )

    if (response.success && response.data) {
      return {
        success: true,
        assistant: response.data
      }
    } else {
      return {
        success: false,
        error: response.error || 'Failed to create assistant'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof ApiClientError ? error.message : 'Failed to create assistant'
    }
  }
}

/**
 * Update an existing BB Agent assistant
 */
export const updateBBAssistant = async (
  assistantId: string, 
  data: Partial<CreateAssistantData>
): Promise<BBAssistantsResponse> => {
  try {
    const payload: any = {}
    
    if (data.name) payload.name = data.name
    if (data.description) payload.description = data.description
    if (data.recursion_limit || data.configurable) {
      payload.config = {
        ...(data.recursion_limit && { recursion_limit: data.recursion_limit }),
        ...(data.configurable && {
          configurable: typeof data.configurable === 'string' 
            ? JSON.parse(data.configurable) 
            : data.configurable
        })
      }
    }

    const response = await apiClient.put<BBAssistant>(
      API_ENDPOINTS.BB_ASSISTANT_BY_ID(assistantId), 
      payload
    )

    if (response.success && response.data) {
      return {
        success: true,
        assistant: response.data
      }
    } else {
      return {
        success: false,
        error: response.error || 'Failed to update assistant'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof ApiClientError ? error.message : 'Failed to update assistant'
    }
  }
}

/**
 * Delete a BB Agent assistant
 */
export const deleteBBAssistant = async (assistantId: string): Promise<BBAssistantsResponse> => {
  try {
    const response = await apiClient.delete(API_ENDPOINTS.BB_ASSISTANT_BY_ID(assistantId))

    if (response.success) {
      return {
        success: true
      }
    } else {
      return {
        success: false,
        error: response.error || 'Failed to delete assistant'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof ApiClientError ? error.message : 'Failed to delete assistant'
    }
  }
} 