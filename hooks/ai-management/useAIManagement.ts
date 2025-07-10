'use client'

import { useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useBBAssistants } from './useBBAssistants'
import { useUserAssignments } from './useUserAssignments'
import { useAnalytics } from './useAnalytics'
import { useContacts } from './useContacts'

interface UseAIManagementReturn {
  // BB Assistants
  assistants: ReturnType<typeof useBBAssistants>['assistants']
  assistantsLoading: boolean
  connectionStatus: ReturnType<typeof useBBAssistants>['connectionStatus']
  
  // User Assignments
  assignments: ReturnType<typeof useUserAssignments>['assignments']
  assignmentsLoading: boolean
  
  // Analytics & Interactions
  interactions: ReturnType<typeof useAnalytics>['interactions']
  analytics: ReturnType<typeof useAnalytics>['analytics']
  metrics: ReturnType<typeof useAnalytics>['metrics']
  costMetrics: ReturnType<typeof useAnalytics>['costMetrics']
  analyticsLoading: boolean
  
  // Contacts
  contacts: ReturnType<typeof useContacts>['contacts']
  contactsLoading: boolean
  
  // Global state
  globalLoading: boolean
  hasError: boolean
  
  // Actions
  assistantActions: {
    fetch: ReturnType<typeof useBBAssistants>['fetchAssistants']
    create: ReturnType<typeof useBBAssistants>['createAssistant']
    update: ReturnType<typeof useBBAssistants>['updateAssistant']
    delete: ReturnType<typeof useBBAssistants>['deleteAssistant']
    testConnection: ReturnType<typeof useBBAssistants>['testConnection']
  }
  
  assignmentActions: {
    fetch: ReturnType<typeof useUserAssignments>['fetchAssignments']
    create: ReturnType<typeof useUserAssignments>['createAssignment']
    update: ReturnType<typeof useUserAssignments>['updateAssignment']
    delete: ReturnType<typeof useUserAssignments>['deleteAssignment']
  }
  
  analyticsActions: {
    fetchAnalytics: ReturnType<typeof useAnalytics>['fetchAnalytics']
    fetchInteractions: ReturnType<typeof useAnalytics>['fetchInteractions']
    refreshAll: ReturnType<typeof useAnalytics>['refreshAll']
  }
  
  contactActions: {
    fetch: ReturnType<typeof useContacts>['fetchContacts']
    search: ReturnType<typeof useContacts>['searchContacts']
  }
  
  // Global actions
  refreshAll: (showToast?: boolean) => Promise<void>
  initialize: () => Promise<void>
}

export const useAIManagement = (): UseAIManagementReturn => {
  const { toast } = useToast()
  
  // Individual hooks
  const assistants = useBBAssistants()
  const assignments = useUserAssignments()
  const analytics = useAnalytics()
  const contacts = useContacts()

  // Global state calculations
  const globalLoading = assistants.loading || assignments.loading || analytics.loading || contacts.loading
  const hasError = !!(assistants.error || assignments.error || analytics.error || contacts.error)

  // Global refresh function
  const refreshAll = useCallback(async (showToast: boolean = true) => {
    try {
      await Promise.all([
        assistants.testConnection(), // This also fetches assistants
        assignments.fetchAssignments(),
        analytics.refreshAll(),
        contacts.fetchContacts()
      ])
      
      // Only show success toast if explicitly requested (e.g., manual refresh)
      if (showToast) {
        toast({
          title: "Data refreshed",
          description: "All AI management data has been updated successfully.",
        })
      }
    } catch (error) {
      console.error('Failed to refresh all data:', error)
      // Always show error toast for refresh failures
      toast({
        title: "Error refreshing data",
        description: "Some data may not have been updated. Please try again.",
        variant: "destructive"
      })
    }
  }, [assistants, assignments, analytics, contacts, toast])

  // Initialize all data on mount
  const initialize = useCallback(async () => {
    try {
      await Promise.all([
        assistants.testConnection(), // This also fetches assistants
        assignments.fetchAssignments(),
        analytics.refreshAll()
        // Don't auto-fetch contacts as they're only needed for assignment creation
      ])
    } catch (error) {
      console.error('Failed to initialize AI management data:', error)
    }
  }, [assistants, assignments, analytics])

  // Auto-initialize on mount
  useEffect(() => {
    initialize()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // State
    assistants: assistants.assistants,
    assistantsLoading: assistants.loading,
    connectionStatus: assistants.connectionStatus,
    
    assignments: assignments.assignments,
    assignmentsLoading: assignments.loading,
    
    interactions: analytics.interactions,
    analytics: analytics.analytics,
    metrics: analytics.metrics,
    costMetrics: analytics.costMetrics,
    analyticsLoading: analytics.loading,
    
    contacts: contacts.contacts,
    contactsLoading: contacts.loading,
    
    globalLoading,
    hasError,
    
    // Actions
    assistantActions: {
      fetch: assistants.fetchAssistants,
      create: assistants.createAssistant,
      update: assistants.updateAssistant,
      delete: assistants.deleteAssistant,
      testConnection: assistants.testConnection
    },
    
    assignmentActions: {
      fetch: assignments.fetchAssignments,
      create: assignments.createAssignment,
      update: assignments.updateAssignment,
      delete: assignments.deleteAssignment
    },
    
    analyticsActions: {
      fetchAnalytics: analytics.fetchAnalytics,
      fetchInteractions: analytics.fetchInteractions,
      refreshAll: analytics.refreshAll
    },
    
    contactActions: {
      fetch: contacts.fetchContacts,
      search: contacts.searchContacts
    },
    
    // Global actions
    refreshAll,
    initialize
  }
} 