'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bot, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
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
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const handleDelete = (assistant: BBAssistant) => {
    if (confirm(`Are you sure you want to delete "${assistant.name}"?`)) {
      onDelete(assistant.assistant_id)
    }
  }

  // Pagination logic
  const { paginatedAssistants, totalPages, totalItems } = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedData = assistants.slice(startIndex, endIndex)
    const totalPages = Math.ceil(assistants.length / itemsPerPage)
    
    return {
      paginatedAssistants: paginatedData,
      totalPages,
      totalItems: assistants.length
    }
  }, [assistants, currentPage, itemsPerPage])

  // Reset to first page when assistants list changes
  useMemo(() => {
    setCurrentPage(1)
  }, [assistants.length])

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value))
    setCurrentPage(1)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Assistants
              {totalItems > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {totalItems}
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {totalItems > 0 
                ? `Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, totalItems)} of ${totalItems} assistants`
                : 'Manage your BB Agent assistants and their configurations'
              }
            </p>
          </div>
          
          {totalItems > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show:</span>
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
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
        ) : totalItems === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Assistants Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first BB Agent assistant using the "Create New Assistant" button above.
            </p>
          </div>
        ) : (
          <div>
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
                {paginatedAssistants.map((assistant) => (
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
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber
                      if (totalPages <= 5) {
                        pageNumber = i + 1
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i
                      } else {
                        pageNumber = currentPage - 2 + i
                      }
                      
                      return (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(pageNumber)}
                          className="h-8 w-8 p-0"
                        >
                          {pageNumber}
                        </Button>
                      )
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}