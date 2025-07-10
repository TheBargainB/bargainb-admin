'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  RefreshCw, 
  Plus, 
  Loader2, 
  Bot, 
  Users, 
  Activity, 
  TrendingUp, 
  DollarSign 
} from 'lucide-react'

// Import our new components
import { 
  StatsCard,
  AssistantTable,
  AssistantDialog,
  CreateAssistantDialog,
  AssignUserDialog
} from '@/components/ai-management'

// Import our new hook
import { useAIManagement } from '@/hooks/ai-management'

// Import types
import type { BBAssistant } from '@/types/ai-management.types'

export default function AIManagementPage() {
  // Use our unified hook instead of 20+ useState hooks
  const {
    assistants,
    assignments,
    metrics,
    costMetrics,
    contacts,
    globalLoading,
    hasError,
    refreshAll,
    assistantActions,
    assignmentActions,
    contactActions
  } = useAIManagement()

  // Local UI state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAssistant, setSelectedAssistant] = useState<BBAssistant | null>(null)
  const [isAssistantDialogOpen, setIsAssistantDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAssignUserDialogOpen, setIsAssignUserDialogOpen] = useState(false)

  // Filter assistants by search term
  const filteredAssistants = assistants.filter((assistant: any) =>
    assistant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assistant.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assistant.assistant_id.includes(searchTerm)
  )

  // Calculate metrics for stats cards
  const totalInteractions = metrics?.totalInteractions || 0
  const successRate = metrics?.successRate || 0
  const avgProcessingTime = metrics?.avgProcessingTime || 0
  const estimatedCost = costMetrics?.projectedMonthlyCost || 0

  // Handle assistant selection
  const handleViewAssistant = (assistant: BBAssistant) => {
    setSelectedAssistant(assistant)
    setIsAssistantDialogOpen(true)
  }

  // Handle refresh
  const handleRefresh = async () => {
    await refreshAll()
  }

  // Handle creating new assistant
  const handleCreateAssistant = () => {
    setIsCreateDialogOpen(true)
  }

  // Handle assigning user to assistant
  const handleAssignUser = (assistant: BBAssistant) => {
    setSelectedAssistant(assistant)
    setIsAssignUserDialogOpen(true)
  }

  // Handle editing assistant
  const handleEditAssistant = (assistant: BBAssistant) => {
    setSelectedAssistant(assistant)
    setIsEditDialogOpen(true)
  }

  // Handle deleting assistant
  const handleDeleteAssistant = async (assistantId: string) => {
    // Add confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to delete this assistant? This action cannot be undone.'
    )
    
    if (!confirmed) {
      return
    }

    try {
      console.log('🗑️ Attempting to delete assistant:', assistantId)
      const success = await assistantActions.delete(assistantId)
      
      if (success) {
        console.log('✅ Assistant deleted successfully')
        // The hook handles success notifications via toast
        await refreshAll(false) // Silent refresh - delete action already shows toast
      } else {
        console.error('❌ Delete failed')
        // The hook handles error notifications via toast
      }
    } catch (error) {
      console.error('❌ Delete error:', error)
      // The hook already handles error notifications, but add fallback
      alert(`Error deleting assistant: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Handle creating assistant
  const handleCreateAssistantSubmit = async (data: any) => {
    try {
      const success = await assistantActions.create(data)
      if (success) {
        await refreshAll(false) // Silent refresh - create action already shows toast
      }
    } catch (error) {
      console.error('Failed to create assistant:', error)
      throw error
    }
  }

  // Handle updating assistant
  const handleUpdateAssistantSubmit = async (assistantId: string, data: any) => {
    try {
      const success = await assistantActions.update(assistantId, data)
      if (success) {
        await refreshAll(false) // Silent refresh - update action already shows toast
      }
    } catch (error) {
      console.error('Failed to update assistant:', error)
      throw error
    }
  }

  // Handle assigning user to assistant
  const handleAssignUserSubmit = async (contactId: string, assistantId: string) => {
    try {
      const success = await assignmentActions.create({
        phone_number: contactId,
        assistant_id: assistantId,
        priority: 'normal',
        auto_enable: true
      })
      
      // Only refresh if assignment was successful (silent refresh to avoid duplicate toasts)
      if (success) {
        await refreshAll(false)
      } else {
        // The hook already showed the error toast, just throw to prevent further processing
        throw new Error('Assignment failed')
      }
    } catch (error) {
      console.error('Failed to assign user:', error)
      throw error
    }
  }

  // Handle unassigning user from assistant
  const handleUnassignUser = async (conversationId: string, displayName: string) => {
    try {
      const success = await assignmentActions.delete(conversationId)
      if (success) {
        await refreshAll(false) // Silent refresh - delete action already shows toast
      }
    } catch (error) {
      console.error('Failed to unassign user:', error)
    }
  }

  // Handle updating assistant configuration
  const handleUpdateConfig = async (assistantId: string, config: any) => {
    try {
      const success = await assistantActions.update(assistantId, { configurable: JSON.stringify(config) })
      if (success) {
        await refreshAll(false) // Silent refresh - update action already shows toast
      }
    } catch (error) {
      console.error('Failed to update configuration:', error)
      throw error
    }
  }

  // Loading state
  if (globalLoading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="w-full">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-12 w-12 mx-auto mb-4 text-blue-600 animate-spin" />
              <p className="text-muted-foreground">Loading AI Management...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (hasError) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="w-full">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-destructive mb-4">
                <p className="text-lg font-semibold">Error Loading AI Management</p>
                <p className="text-sm">Please check the console for details</p>
              </div>
              <Button onClick={handleRefresh}>Try Again</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Management</h1>
            <p className="text-muted-foreground mt-2">Manage BB Agent assistants and user assignments</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search assistants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button 
              onClick={handleRefresh}
              variant="outline"
              disabled={globalLoading}
            >
              {globalLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <StatsCard
            label="BB Assistants"
            value={assistants.length}
            description="Active assistants"
            icon={Bot}
          />
          
          <StatsCard
            label="User Assignments"
            value={assignments.length}
            description="Active assignments"
            icon={Users}
          />
          
          <StatsCard
            label="Total Interactions"
            value={totalInteractions}
            description={`Avg: ${Math.round(avgProcessingTime)}ms`}
            icon={Activity}
            trend={totalInteractions > 0 ? { value: 12.5, isPositive: true } : undefined}
          />
          
          <StatsCard
            label="Success Rate"
            value={`${successRate.toFixed(1)}%`}
            description={successRate >= 90 ? 'Excellent' : successRate >= 75 ? 'Good' : 'Needs attention'}
            icon={TrendingUp}
          />
          
          <StatsCard
            label="Monthly Cost"
            value={`$${estimatedCost.toFixed(2)}`}
            description="Estimated"
            icon={DollarSign}
          />
        </div>

        {/* Main Content - Assistants Table */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">BB Agent Assistants</h2>
            <Button 
              onClick={handleCreateAssistant}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Assistant
            </Button>
          </div>

          <AssistantTable
            assistants={filteredAssistants}
            loading={globalLoading}
            onView={handleViewAssistant}
            onEdit={handleEditAssistant}
            onDelete={handleDeleteAssistant}
          />
        </div>

        {/* Dialogs */}
        <AssistantDialog
          assistant={selectedAssistant}
          assignments={assignments.filter((ua: any) => ua.assistant_id === selectedAssistant?.assistant_id)}
          isOpen={isAssistantDialogOpen}
          onClose={() => {
            setIsAssistantDialogOpen(false)
            setSelectedAssistant(null)
          }}
          onEdit={handleEditAssistant}
          onUnassign={handleUnassignUser}
          onAssignUser={() => {
            setIsAssistantDialogOpen(false)
            setIsAssignUserDialogOpen(true)
          }}
          onUpdateConfig={handleUpdateConfig}
        />

        <CreateAssistantDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onCreate={handleCreateAssistantSubmit}
        />

        <CreateAssistantDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false)
            setSelectedAssistant(null)
          }}
          onCreate={handleCreateAssistantSubmit}
          editMode={true}
          assistant={selectedAssistant}
          onUpdate={handleUpdateAssistantSubmit}
        />

        <AssignUserDialog
          assistant={selectedAssistant}
          isOpen={isAssignUserDialogOpen}
          onClose={() => {
            setIsAssignUserDialogOpen(false)
            setSelectedAssistant(null)
          }}
          onAssign={handleAssignUserSubmit}
        />

      </div>
    </div>
  )
} 