'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  Bot, 
  User, 
  CheckCircle,
  UserPlus,
  UserMinus,
  X
} from 'lucide-react'
import { useAIManagement } from '@/hooks/ai-management'
import type { Contact } from '@/types/chat-v2.types'

interface AssistantAssignmentDialogProps {
  contact: Contact | null
  isOpen: boolean
  onClose: () => void
  onAssignmentChange?: () => void
}

export const AssistantAssignmentDialog = ({
  contact,
  isOpen,
  onClose,
  onAssignmentChange
}: AssistantAssignmentDialogProps) => {
  const [selectedAssistantId, setSelectedAssistantId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  
  const aiManagement = useAIManagement()
  
  // Find current assignment for this contact
  const currentAssignment = contact ? aiManagement.assignments.find(
    assignment => assignment.phone_number === contact.phone_number
  ) : null

  const assignedAssistant = currentAssignment ? aiManagement.assistants.find(
    assistant => assistant.assistant_id === currentAssignment.assistant_id
  ) : null

  useEffect(() => {
    if (isOpen) {
      aiManagement.initialize()
    }
  }, [isOpen])

  useEffect(() => {
    if (currentAssignment) {
      setSelectedAssistantId(currentAssignment.assistant_id || '')
    }
  }, [currentAssignment])

  const handleAssign = async () => {
    if (!contact || !selectedAssistantId) return
    
    setIsLoading(true)
    try {
      await aiManagement.assignmentActions.create({
        phone_number: contact.phone_number,
        assistant_id: selectedAssistantId
      })
      
      onAssignmentChange?.()
      onClose()
    } catch (error) {
      console.error('Failed to assign assistant:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnassign = async () => {
    if (!currentAssignment) return
    
    setIsLoading(true)
    try {
      await aiManagement.assignmentActions.delete(currentAssignment.conversation_id || '')
      onAssignmentChange?.()
      onClose()
    } catch (error) {
      console.error('Failed to unassign assistant:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedAssistantId('')
    onClose()
  }

  const displayName = contact?.display_name || 
                     contact?.push_name || 
                     contact?.verified_name || 
                     'Unknown Contact'

  const contactInitials = displayName
    .split(' ')
    .map((word: string) => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)

  if (!contact) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            AI Assistant Management
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Info */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={contact.profile_picture_url} alt={displayName} />
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {contactInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{displayName}</h3>
              <p className="text-sm text-gray-500">{contact.phone_number}</p>
            </div>
            <Badge variant="outline" className={contact.is_active ? 'border-green-200 text-green-700' : 'border-gray-200 text-gray-500'}>
              {contact.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* Current Assignment or Assignment Selection */}
          {currentAssignment && assignedAssistant ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Currently Assigned
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{assignedAssistant.name}</h4>
                    <p className="text-sm text-gray-500">Version {assignedAssistant.version}</p>
                  </div>
                </div>
                
                {(assignedAssistant.config.tags || []).length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {(assignedAssistant.config.tags || []).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleUnassign}
                  disabled={isLoading}
                  className="w-full"
                >
                  <UserMinus className="w-4 h-4 mr-2" />
                  Remove Assignment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-blue-600" />
                  Assign AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Bot className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">
                    No AI assistant is currently assigned
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    Select Assistant
                  </label>
                  <Select
                    value={selectedAssistantId}
                    onValueChange={setSelectedAssistantId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an AI assistant..." />
                    </SelectTrigger>
                    <SelectContent>
                      {aiManagement.assistants.map((assistant) => (
                        <SelectItem key={assistant.assistant_id} value={assistant.assistant_id}>
                          <div className="flex items-center gap-2">
                            <Bot className="w-4 h-4 text-blue-600" />
                            <span>{assistant.name}</span>
                            <span className="text-xs text-gray-500">v{assistant.version}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedAssistantId && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    {(() => {
                      const selectedAssistant = aiManagement.assistants.find(
                        a => a.assistant_id === selectedAssistantId
                      )
                      return selectedAssistant ? (
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-blue-900">
                            {selectedAssistant.name}
                          </h5>
                          {selectedAssistant.description && (
                            <p className="text-xs text-blue-700">
                              {selectedAssistant.description}
                            </p>
                          )}
                          {(selectedAssistant.config.tags || []).length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {(selectedAssistant.config.tags || []).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : null
                    })()}
                  </div>
                )}

                <Button 
                  onClick={handleAssign}
                  disabled={!selectedAssistantId || isLoading}
                  className="w-full"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {isLoading ? 'Assigning...' : 'Assign Assistant'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Available Assistants Count */}
          <div className="text-center text-sm text-gray-500">
            {aiManagement.assistants.length} assistant{aiManagement.assistants.length !== 1 ? 's' : ''} available
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 