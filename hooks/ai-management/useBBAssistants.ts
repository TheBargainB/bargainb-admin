'use client'

import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { BBAssistant, CreateAssistantData } from '@/types/ai-management.types'
import {
  testBBAgentConnection,
  fetchBBAssistants,
  createBBAssistant,
  updateBBAssistant,
  deleteBBAssistant
} from '@/actions/ai-management'

interface UseBBAssistantsReturn {
  assistants: BBAssistant[]
  loading: boolean
  error: string | null
  connectionStatus: 'testing' | 'connected' | 'error' | null
  fetchAssistants: () => Promise<void>
  createAssistant: (data: CreateAssistantData) => Promise<boolean>
  updateAssistant: (id: string, data: Partial<CreateAssistantData>) => Promise<boolean>
  deleteAssistant: (id: string) => Promise<boolean>
  testConnection: () => Promise<void>
}

export const useBBAssistants = (): UseBBAssistantsReturn => {
  const { toast } = useToast()
  const [assistants, setAssistants] = useState<BBAssistant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error' | null>(null)

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

  const testConnection = useCallback(async () => {
    setConnectionStatus('testing')
    setError(null)

    try {
      const result = await testBBAgentConnection()
      
      if (result.success && result.connected) {
        setConnectionStatus('connected')
        setAssistants(result.assistants || [])
      } else {
        setConnectionStatus('error')
        setError(result.error || 'Failed to connect to BB Agent')
      }
    } catch (error) {
      setConnectionStatus('error')
      handleError(error, 'testing BB Agent connection')
    }
  }, [handleError])

  const fetchAssistants = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await fetchBBAssistants()
      
      if (result.success) {
        setAssistants(result.data || [])
        setConnectionStatus('connected')
      } else {
        throw new Error(result.error || 'Failed to fetch assistants')
      }
    } catch (error) {
      handleError(error, 'fetching assistants')
      setConnectionStatus('error')
    } finally {
      setLoading(false)
    }
  }, [handleError])

  const createAssistant = useCallback(async (data: CreateAssistantData): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const result = await createBBAssistant(data)

      if (result.success) {
        await fetchAssistants() // Refresh the list
        toast({
          title: "Assistant created",
          description: `${data.name} has been created successfully.`,
        })
        return true
      } else {
        throw new Error(result.error || 'Failed to create assistant')
      }
    } catch (error) {
      handleError(error, 'creating assistant')
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchAssistants, handleError, toast])

  const updateAssistant = useCallback(async (id: string, data: Partial<CreateAssistantData>): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const result = await updateBBAssistant(id, data)

      if (result.success) {
        await fetchAssistants() // Refresh the list
        toast({
          title: "Assistant updated",
          description: `Assistant has been updated successfully.`,
        })
        return true
      } else {
        throw new Error(result.error || 'Failed to update assistant')
      }
    } catch (error) {
      handleError(error, 'updating assistant')
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchAssistants, handleError, toast])

  const deleteAssistant = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const result = await deleteBBAssistant(id)

      if (result.success) {
        await fetchAssistants() // Refresh the list
        toast({
          title: "Assistant deleted",
          description: "Assistant has been deleted successfully.",
        })
        return true
      } else {
        throw new Error(result.error || 'Failed to delete assistant')
      }
    } catch (error) {
      handleError(error, 'deleting assistant')
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchAssistants, handleError, toast])

  return {
    assistants,
    loading,
    error,
    connectionStatus,
    fetchAssistants,
    createAssistant,
    updateAssistant,
    deleteAssistant,
    testConnection
  }
} 