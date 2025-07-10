'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Bot, 
  User, 
  Calendar, 
  Settings, 
  Zap, 
  Brain,
  Clock,
  Shield,
  CheckCircle,
  X,
  UserPlus,
  UserMinus
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
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-3">
            <Bot className="h-6 w-6 text-blue-600" />
            <div>
              <DialogTitle className="text-xl">AI Assistant Assignment</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage AI assistant for {displayName}
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-8rem)]">
          <div className="p-6 space-y-6">
            
            {/* Contact Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={contact.profile_picture_url} alt={displayName} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                      {contactInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {displayName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {contact.phone_number}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {contact.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Current Assignment Status */}
            {currentAssignment && assignedAssistant ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Current Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Bot className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {assignedAssistant.name}
                        </h4>
                        <p className="text-sm text-gray-500 truncate">
                          {assignedAssistant.description || 'AI Assistant'}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Assigned:</span>
                        <p className="font-medium">
                          {currentAssignment.assistant_created_at 
                            ? new Date(currentAssignment.assistant_created_at).toLocaleDateString()
                            : 'Recently'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Version:</span>
                        <p className="font-medium">v{assignedAssistant.version}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Assistant Configuration
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Recursion Limit:</span>
                          <span className="font-medium">{assignedAssistant.config.recursion_limit}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Tags:</span>
                          <div className="flex gap-1">
                            {(assignedAssistant.config.tags || []).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

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
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* No Assignment - Assignment Selection */
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-blue-600" />
                    Assign AI Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Bot className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">
                        No AI assistant is currently assigned to this contact
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
                              <p className="text-xs text-blue-700">
                                {selectedAssistant.description || 'AI Assistant for customer support'}
                              </p>
                              <div className="flex gap-2 mt-2">
                                {(selectedAssistant.config.tags || []).map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
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
                      Assign Assistant
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Available Assistants */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Available AI Assistants ({aiManagement.assistants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {aiManagement.assistants.map((assistant) => (
                    <div 
                      key={assistant.assistant_id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        assistant.assistant_id === currentAssignment?.assistant_id
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Bot className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {assistant.name}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                          v{assistant.version} • {(assistant.config.tags || []).join(', ')}
                        </p>
                      </div>
                      {assistant.assistant_id === currentAssignment?.assistant_id && (
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 