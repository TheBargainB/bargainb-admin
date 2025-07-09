'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Bot, Eye, Edit, Trash2 } from 'lucide-react'
import { BBAssistant } from '@/types/ai-management.types'

interface AssistantTableProps {
  assistants: BBAssistant[]
  loading?: boolean
  onView: (assistant: BBAssistant) => void
  onEdit: (assistant: BBAssistant) => void
  onDelete: (assistantId: string) => void
}

export const AssistantTable = ({
  assistants,
  loading = false,
  onView,
  onEdit,
  onDelete
}: AssistantTableProps) => {
  const handleDelete = (assistant: BBAssistant) => {
    if (confirm(`Are you sure you want to delete "${assistant.name}"?`)) {
      onDelete(assistant.assistant_id)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Assistants
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your BB Agent assistants and their configurations
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Bot className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-pulse" />
              <p className="text-muted-foreground">Loading assistants...</p>
            </div>
          </div>
        ) : assistants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Assistants Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first BB Agent assistant using the "Create New Assistant" button above.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Recursion Limit</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assistants.map((assistant) => (
                <TableRow key={assistant.assistant_id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="font-medium">{assistant.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {assistant.assistant_id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-xs truncate">
                      {assistant.description || 'No description'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">v{assistant.version}</Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">
                      {new Date(assistant.created_at).toLocaleDateString()}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {assistant.config.recursion_limit}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(assistant)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(assistant)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(assistant)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
} 