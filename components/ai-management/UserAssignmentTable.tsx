'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, UserPlus, UserMinus, Phone } from 'lucide-react'
import { UserAssignment } from '@/types/ai-management.types'
import { ContactService } from '@/lib/ContactService'

interface UserAssignmentTableProps {
  assignments: UserAssignment[]
  assistantId: string
  loading?: boolean
  onUnassign: (conversationId: string, displayName: string) => void
  onAssignUser: () => void
}

export const UserAssignmentTable = ({
  assignments,
  assistantId,
  loading = false,
  onUnassign,
  onAssignUser
}: UserAssignmentTableProps) => {
  // Filter assignments for this specific assistant
  const filteredAssignments = assignments.filter(
    assignment => assignment.assistant_id === assistantId
  )

  const getInitials = (name: string) => {
    return ContactService.getInitials({ display_name: name } as any)
  }

  const handleUnassign = (assignment: UserAssignment) => {
    const displayName = assignment.display_name || assignment.phone_number || 'this user'
    if (confirm(`Remove AI assistant from ${displayName}?`)) {
      onUnassign(assignment.conversation_id || '', displayName)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Assignments
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Users who have this assistant assigned
            </p>
          </div>
          <Button onClick={onAssignUser} size="sm" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Assign User
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-pulse" />
              <p className="text-muted-foreground">Loading assignments...</p>
            </div>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Users Assigned</h3>
            <p className="text-muted-foreground text-center mb-4">
              Assign this assistant to WhatsApp users to enable AI conversations.
            </p>
            <Button onClick={onAssignUser} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Assign User
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Assigned Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssignments.map((assignment) => (
                <TableRow key={assignment.conversation_id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={assignment.display_name || ''} />
                        <AvatarFallback className="text-xs">
                          {getInitials(assignment.display_name || assignment.phone_number || '?')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{assignment.display_name || assignment.phone_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {assignment.conversation_id?.slice(0, 8) || 'Unknown'}...
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-sm">{assignment.phone_number}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">
                      {assignment.assistant_created_at ? new Date(assignment.assistant_created_at).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {assignment.assistant_created_at ? new Date(assignment.assistant_created_at).toLocaleTimeString() : 'N/A'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnassign(assignment)}
                      className="h-8 gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <UserMinus className="h-4 w-4" />
                      Unassign
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        {filteredAssignments.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {filteredAssignments.length} user{filteredAssignments.length !== 1 ? 's' : ''} assigned
            </p>
            <Button variant="outline" onClick={onAssignUser} size="sm" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Assign Another User
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 