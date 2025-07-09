import { UserAssignment, AssignUserData } from '@/types/ai-management.types'
import { apiClient, API_ENDPOINTS, ApiClientError } from '@/lib'

export interface UserAssignmentsResponse {
  success: boolean
  data?: UserAssignment[]
  assignment?: UserAssignment
  error?: string
}

/**
 * Fetch all user assignments
 */
export const fetchUserAssignments = async (): Promise<UserAssignmentsResponse> => {
  try {
    const response = await apiClient.get<UserAssignment[]>(API_ENDPOINTS.USER_ASSIGNMENTS)

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data || []
      }
    } else {
      // Graceful failure for assignments
      console.warn('Failed to fetch assignments:', response.error)
      return {
        success: true,
        data: []
      }
    }
  } catch (error) {
    console.error('Error fetching assignments:', error)
    // Graceful failure - don't throw errors for assignment fetching
    return {
      success: true,
      data: []
    }
  }
}

/**
 * Create a new user assignment
 */
export const createUserAssignment = async (data: AssignUserData): Promise<UserAssignmentsResponse> => {
  try {
    const payload = {
      phone_number: data.phone_number,
      assistant_id: data.assistant_id,
      priority: data.priority || 'normal',
      auto_enable: data.auto_enable !== undefined ? data.auto_enable : true,
      notification_settings: data.notification_settings || {},
      schedule: data.schedule || null,
      custom_config: data.custom_config || {},
      notes: data.notes || ''
    }

    const response = await apiClient.post<{ success: boolean; assignment?: UserAssignment; error?: string }>(
      API_ENDPOINTS.USER_ASSIGNMENTS, 
      payload
    )

    if (response.success && response.data && response.data.success) {
      return {
        success: true,
        assignment: response.data.assignment
      }
    } else {
      return {
        success: false,
        error: response.data?.error || response.error || 'Failed to create assignment'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof ApiClientError ? error.message : 'Failed to create assignment'
    }
  }
}

/**
 * Update an existing user assignment
 */
export const updateUserAssignment = async (
  conversationId: string,
  newAssistantId: string,
  additionalData?: Partial<AssignUserData>
): Promise<UserAssignmentsResponse> => {
  try {
    const payload = {
      conversation_id: conversationId,
      new_assistant_id: newAssistantId,
      ...(additionalData?.priority && { priority: additionalData.priority }),
      ...(additionalData?.auto_enable !== undefined && { auto_enable: additionalData.auto_enable }),
      ...(additionalData?.notification_settings && { notification_settings: additionalData.notification_settings }),
      ...(additionalData?.schedule && { schedule: additionalData.schedule }),
      ...(additionalData?.custom_config && { custom_config: additionalData.custom_config }),
      ...(additionalData?.notes && { notes: additionalData.notes })
    }

    const response = await apiClient.put<{ success: boolean; assignment?: UserAssignment; error?: string }>(
      API_ENDPOINTS.USER_ASSIGNMENTS, 
      payload
    )

    if (response.success && response.data && response.data.success) {
      return {
        success: true,
        assignment: response.data.assignment
      }
    } else {
      return {
        success: false,
        error: response.data?.error || response.error || 'Failed to update assignment'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof ApiClientError ? error.message : 'Failed to update assignment'
    }
  }
}

/**
 * Delete a user assignment
 */
export const deleteUserAssignment = async (conversationId: string): Promise<UserAssignmentsResponse> => {
  try {
    const response = await apiClient.request<{ success: boolean; error?: string }>(
      API_ENDPOINTS.USER_ASSIGNMENTS,
      { 
        method: 'DELETE',
        body: { conversation_id: conversationId }
      }
    )

    if (response.success && response.data && response.data.success) {
      return {
        success: true
      }
    } else {
      return {
        success: false,
        error: response.data?.error || response.error || 'Failed to remove assignment'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof ApiClientError ? error.message : 'Failed to remove assignment'
    }
  }
}

/**
 * Assign an assistant to a user by phone number (simplified version)
 */
export const assignAssistantToUser = async (
  phoneNumber: string,
  assistantId: string
): Promise<UserAssignmentsResponse> => {
  return createUserAssignment({
    phone_number: phoneNumber,
    assistant_id: assistantId
  })
} 