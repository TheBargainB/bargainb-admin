'use client'

import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { UserAssignment, AssignUserData } from '@/types/ai-management.types'
import {
  fetchUserAssignments,
  createUserAssignment,
  updateUserAssignment,
  deleteUserAssignment
} from '@/actions/ai-management'

interface UseUserAssignmentsReturn {
  assignments: UserAssignment[]
  loading: boolean
  error: string | null
  fetchAssignments: () => Promise<void>
  createAssignment: (data: AssignUserData) => Promise<boolean>
  updateAssignment: (conversationId: string, newAssistantId: string) => Promise<boolean>
  deleteAssignment: (conversationId: string) => Promise<boolean>
}

export const useUserAssignments = (): UseUserAssignmentsReturn => {
  const { toast } = useToast()
  const [assignments, setAssignments] = useState<UserAssignment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleError = useCallback((error: unknown, operation: string) => {
    const message = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error(`Error ${operation}:`, error)
    setError(message)
    toast({
      title: `Error ${operation}`,
      description: message,
      variant: "destructive"
    })
  }, [toast])

  const fetchAssignments = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await fetchUserAssignments()
      setAssignments(result.data || [])
    } catch (error) {
      console.error('Error fetching assignments:', error)
      setAssignments([])
      // Don't show error toast for graceful degradation
    } finally {
      setLoading(false)
    }
  }, [])

  const createAssignment = useCallback(async (data: AssignUserData): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const result = await createUserAssignment(data)

      if (result.success) {
        await fetchAssignments() // Refresh the list
        toast({
          title: "Assignment created",
          description: `AI assistant has been assigned successfully.`,
        })
        return true
      } else {
        throw new Error(result.error || 'Failed to create assignment')
      }
    } catch (error) {
      handleError(error, 'creating assignment')
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchAssignments, handleError, toast])

  const updateAssignment = useCallback(async (conversationId: string, newAssistantId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const result = await updateUserAssignment(conversationId, newAssistantId)

      if (result.success) {
        await fetchAssignments() // Refresh the list
        toast({
          title: "Assignment updated",
          description: "Assistant assignment has been updated successfully.",
        })
        return true
      } else {
        throw new Error(result.error || 'Failed to update assignment')
      }
    } catch (error) {
      handleError(error, 'updating assignment')
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchAssignments, handleError, toast])

  const deleteAssignment = useCallback(async (conversationId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const result = await deleteUserAssignment(conversationId)

      if (result.success) {
        await fetchAssignments() // Refresh the list
        toast({
          title: "Assignment removed",
          description: "AI assistant assignment has been removed successfully.",
        })
        return true
      } else {
        throw new Error(result.error || 'Failed to remove assignment')
      }
    } catch (error) {
      handleError(error, 'removing assignment')
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchAssignments, handleError, toast])

  return {
    assignments,
    loading,
    error,
    fetchAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment
  }
} 