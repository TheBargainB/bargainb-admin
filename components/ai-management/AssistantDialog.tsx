'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UserAssignmentTable } from './UserAssignmentTable'
import { Bot, Settings, Code, Calendar, Hash, Edit } from 'lucide-react'
import { BBAssistant, UserAssignment } from '@/types/ai-management.types'

interface AssistantDialogProps {
  assistant: BBAssistant | null
  assignments: UserAssignment[]
  isOpen: boolean
  onClose: () => void
  onEdit: (assistant: BBAssistant) => void
  onUnassign: (conversationId: string, displayName: string) => void
  onAssignUser: (assistant: BBAssistant) => void
}

export const AssistantDialog = ({
  assistant,
  assignments,
  isOpen,
  onClose,
  onEdit,
  onUnassign,
  onAssignUser
}: AssistantDialogProps) => {
  if (!assistant) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="h-6 w-6 text-blue-600" />
              <div>
                <DialogTitle className="text-xl">{assistant.name}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {assistant.description || 'No description provided'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => onEdit(assistant)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Assistant
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Column: Assistant Details */}
              <div className="space-y-6">
                
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Assistant Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Assistant ID</p>
                        <p className="font-mono text-sm mt-1">{assistant.assistant_id}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Version</p>
                        <Badge variant="outline" className="mt-1">v{assistant.version}</Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Graph ID</p>
                        <p className="font-mono text-sm mt-1">{assistant.graph_id}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Recursion Limit</p>
                        <Badge variant="secondary" className="mt-1">
                          {assistant.config.recursion_limit}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Created</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm">{new Date(assistant.created_at).toLocaleDateString()}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(assistant.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm">{new Date(assistant.updated_at).toLocaleDateString()}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(assistant.updated_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    {/* Tags */}
                    {assistant.config.tags && assistant.config.tags.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Tags</p>
                          <div className="flex flex-wrap gap-2">
                            {assistant.config.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                <Hash className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-48">
                      <pre className="text-xs bg-card text-foreground p-3 rounded border font-mono overflow-auto">
                        {JSON.stringify(assistant.config.configurable, null, 2)}
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Metadata */}
                {assistant.metadata && Object.keys(assistant.metadata).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5" />
                        Metadata
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-32">
                        <pre className="text-xs bg-card text-foreground p-3 rounded border font-mono overflow-auto">
                          {JSON.stringify(assistant.metadata, null, 2)}
                        </pre>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column: User Assignments */}
              <div>
                <UserAssignmentTable
                  assignments={assignments}
                  assistantId={assistant.assistant_id}
                  onUnassign={onUnassign}
                  onAssignUser={() => onAssignUser(assistant)}
                />
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 