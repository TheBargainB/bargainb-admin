'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserAssignmentTable } from './UserAssignmentTable'
import { AssistantConfigEditor } from './AssistantConfigEditor'
import { Bot, Settings, Code, Calendar, Hash, Edit, Users, Info } from 'lucide-react'
import { BBAssistant, UserAssignment } from '@/types/ai-management.types'

interface AssistantDialogProps {
  assistant: BBAssistant | null
  assignments: UserAssignment[]
  isOpen: boolean
  onClose: () => void
  onEdit: (assistant: BBAssistant) => void
  onUnassign: (conversationId: string, displayName: string) => void
  onAssignUser: (assistant: BBAssistant) => void
  onUpdateConfig?: (assistantId: string, config: any) => void
}

export const AssistantDialog = ({
  assistant,
  assignments,
  isOpen,
  onClose,
  onEdit,
  onUnassign,
  onAssignUser,
  onUpdateConfig
}: AssistantDialogProps) => {
  const [isEditingConfig, setIsEditingConfig] = useState(false)

  if (!assistant) return null

  const handleConfigSave = async (updatedConfig: any) => {
    if (onUpdateConfig && assistant) {
      await onUpdateConfig(assistant.assistant_id, updatedConfig)
      setIsEditingConfig(false)
    }
  }

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

        <div className="p-6 pt-0">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details" className="gap-2">
                <Info className="h-4 w-4" />
                Details
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                Users ({assignments.length})
              </TabsTrigger>
              <TabsTrigger value="configuration" className="gap-2">
                <Settings className="h-4 w-4" />
                Configuration
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="max-h-[calc(90vh-200px)] mt-6">
              
              {/* Details Tab */}
              <TabsContent value="details" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Basic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5" />
                        Assistant Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Assistant ID</p>
                          <p className="font-mono text-sm mt-1 bg-muted p-2 rounded">{assistant.assistant_id}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Graph ID</p>
                          <p className="font-mono text-sm mt-1 bg-muted p-2 rounded">{assistant.graph_id}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Version</p>
                            <Badge variant="outline" className="mt-1">v{assistant.version}</Badge>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Recursion Limit</p>
                            <Badge variant="secondary" className="mt-1">
                              {assistant.config.recursion_limit}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Timestamps */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Created</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm">{new Date(assistant.created_at).toLocaleDateString()}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(assistant.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm">{new Date(assistant.updated_at).toLocaleDateString()}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(assistant.updated_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tags and Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Tags */}
                  {assistant.config.tags && assistant.config.tags.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Hash className="h-5 w-5" />
                          Tags
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {assistant.config.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Hash className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

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
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="mt-0">
                <UserAssignmentTable
                  assignments={assignments}
                  assistantId={assistant.assistant_id}
                  onUnassign={onUnassign}
                  onAssignUser={() => onAssignUser(assistant)}
                />
              </TabsContent>

              {/* Configuration Tab */}
              <TabsContent value="configuration" className="mt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Assistant Configuration</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure AI behavior, safety settings, and performance limits
                      </p>
                    </div>
                    {onUpdateConfig && (
                      <Button
                        variant={isEditingConfig ? "secondary" : "outline"}
                        onClick={() => setIsEditingConfig(!isEditingConfig)}
                        className="gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        {isEditingConfig ? 'Cancel Edit' : 'Edit Configuration'}
                      </Button>
                    )}
                  </div>
                  
                  <AssistantConfigEditor 
                    config={assistant.config.configurable} 
                    onSave={handleConfigSave}
                    readOnly={!isEditingConfig}
                  />
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
} 