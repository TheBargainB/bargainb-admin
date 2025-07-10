'use client'

import { memo, useState, useEffect } from 'react'
import { Edit3, Save, X, Users, MessageCircle, Clock, Star, MoreVertical, Bot, UserPlus, Settings, TrendingUp, Calendar, Phone, Mail, MapPin, Building } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useAIManagement } from '@/hooks/ai-management'
import { AssistantAssignmentDialog } from './AssistantAssignmentDialog'
import type { Contact, Conversation } from '@/types/chat-v2.types'

interface ContactProfileProps {
  contact?: Contact | null
  conversation?: Conversation | null
  is_visible: boolean
  
  // Event handlers
  onCall?: (phoneNumber: string) => void
  onVideoCall?: (phoneNumber: string) => void
  onSendMessage?: () => void
  onEditContact?: (contactId: string, updates: Partial<Contact>) => void
  onBlockContact?: (contactId: string) => void
  
  className?: string
}

export const ContactProfile = memo<ContactProfileProps>(({
  contact,
  conversation,
  is_visible,
  onCall,
  onVideoCall,
  onSendMessage,
  onEditContact,
  onBlockContact,
  className
}) => {
  // =============================================================================
  // STATE
  // =============================================================================

  const [is_editing, setIsEditing] = useState(false)
  const [edit_fields, setEditFields] = useState<Record<string, string>>({})
  const [is_assignment_dialog_open, setIsAssignmentDialogOpen] = useState(false)

  // =============================================================================
  // AI MANAGEMENT
  // =============================================================================

  const aiManagement = useAIManagement()

  useEffect(() => {
    if (is_visible && contact) {
      aiManagement.initialize()
    }
  }, [is_visible, contact])

  // Find current assignment for this contact
  const currentAssignment = contact ? aiManagement.assignments.find(
    assignment => assignment.phone_number === contact.phone_number
  ) : null

  const assignedAssistant = currentAssignment ? aiManagement.assistants.find(
    assistant => assistant.assistant_id === currentAssignment.assistant_id
  ) : null

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleEditStart = () => {
    if (!contact) return
    
    setEditFields({
      display_name: contact.display_name || '',
      email: contact.crm_profile?.email || ''
    })
    setIsEditing(true)
  }

  const handleEditCancel = () => {
    setIsEditing(false)
    setEditFields({})
  }

  const handleEditSave = () => {
    if (!contact || !onEditContact) return
    
    onEditContact(contact.id, edit_fields)
    setIsEditing(false)
    setEditFields({})
  }

  const handleInputChange = (field: string, value: string) => {
    setEditFields(prev => ({ ...prev, [field]: value }))
  }

  const handleBlockContact = () => {
    if (contact && onBlockContact) {
      onBlockContact(contact.id)
    }
  }

  const handleAssignAssistant = () => {
    setIsAssignmentDialogOpen(true)
  }

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderContactHeader = () => {
    if (!contact) return null

    const displayName = contact.display_name || 
                       contact.push_name || 
                       contact.verified_name || 
                       'Unknown Contact'

    const avatarFallback = displayName
      .split(' ')
      .map((word: string) => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)

    return (
      <div className="p-6 border-b">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={contact.profile_picture_url} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-foreground truncate">
              {displayName}
            </h2>
            <p className="text-sm text-muted-foreground">
              {contact.phone_number}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={contact.is_active ? "default" : "secondary"} className="text-xs">
                {contact.is_active ? 'Active' : 'Inactive'}
              </Badge>
              {contact.verified_name && (
                <Badge variant="outline" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderContactDetails = () => (
    <div className="p-6 space-y-6">
      {/* Edit controls */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground">
          Contact Information
        </h3>
        
        {is_editing ? (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleEditCancel}>
              <X className="w-3 h-3 mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleEditSave}>
              <Save className="w-3 h-3 mr-1" />
              Save
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={handleEditStart}>
            <Edit3 className="w-3 h-3 mr-1" />
            Edit
          </Button>
        )}
      </div>

      {/* Contact fields */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Display Name</label>
          {is_editing ? (
            <Input
              value={edit_fields.display_name || ''}
              onChange={(e) => handleInputChange('display_name', e.target.value)}
              placeholder="Enter display name"
              className="mt-1"
            />
          ) : (
            <p className="text-sm text-foreground mt-1">
              {contact?.display_name || 'Not set'}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
          <p className="text-sm text-foreground mt-1 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            {contact?.phone_number}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">Email</label>
          {is_editing ? (
            <Input
              type="email"
              value={edit_fields.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              className="mt-1"
            />
          ) : (
            <p className="text-sm text-foreground mt-1 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {contact?.crm_profile?.email || 'Not provided'}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">WhatsApp Name</label>
          <p className="text-sm text-foreground mt-1">
            {contact?.push_name || 'Not available'}
          </p>
        </div>
      </div>
    </div>
  )

  const renderCRMInfo = () => (
    <div className="p-6 space-y-6">
      <h3 className="font-medium text-foreground">CRM Information</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Customer Value */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Customer Value</p>
                <p className="text-sm font-medium">High</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Last Interaction */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-xs text-muted-foreground">Customer Since</p>
                <p className="text-sm font-medium">
                  {contact?.created_at 
                    ? new Date(contact.created_at).toLocaleDateString()
                    : 'Recently'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderAssistantInfo = () => (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground flex items-center gap-2">
          <Bot className="w-4 h-4" />
          AI Assistant
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAssignAssistant}
          className="text-xs"
        >
          <Settings className="w-3 h-3 mr-1" />
          Manage
        </Button>
      </div>

      {currentAssignment && assignedAssistant ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {assignedAssistant.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Active • v{assignedAssistant.version}
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                Assigned
              </Badge>
            </div>
            
            <div className="mt-3 pt-3 border-t">
              <div className="flex gap-2">
                {(assignedAssistant.config.tags || []).slice(0, 2).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {(assignedAssistant.config.tags || []).length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{(assignedAssistant.config.tags || []).length - 2}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center p-4">
          <Bot className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-3">
            No AI assistant assigned
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAssignAssistant}
            className="text-xs"
          >
            <UserPlus className="w-3 h-3 mr-1" />
            Assign Assistant
          </Button>
        </div>
      )}
    </div>
  )

  const renderConversationStats = () => {
    if (!conversation) return null

    return (
      <div className="p-6 space-y-4">
        <h3 className="font-medium text-foreground">Conversation Stats</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <MessageCircle className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-lg font-semibold text-foreground">
              {conversation.status === 'active' ? 'Active' : 'Inactive'}
            </p>
            <p className="text-xs text-muted-foreground">Status</p>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-lg font-semibold text-foreground">
              {conversation.unread_count || 0}
            </p>
            <p className="text-xs text-muted-foreground">Unread</p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">First Message:</span>
            <span className="font-medium text-foreground">
              {conversation.created_at 
                ? new Date(conversation.created_at).toLocaleDateString()
                : 'Unknown'
              }
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Activity:</span>
            <span className="font-medium text-foreground">
              {conversation.last_message_at 
                ? new Date(conversation.last_message_at).toLocaleDateString()
                : 'Never'
              }
            </span>
          </div>
        </div>
      </div>
    )
  }

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  if (!is_visible) return null

  if (!contact) {
    return (
      <div className={cn(
        "flex flex-col bg-background border-l",
        className
      )}>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No Contact Selected
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Select a conversation to view contact details and information
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Contact Info</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Users className="w-4 h-4 mr-2" />
                View Contact
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Users className="w-4 h-4 mr-2" />
                Export Contact
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                View in CRM
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Users className="w-4 h-4 mr-2" />
                Block Customer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-6">
        {/* Contact Header */}
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {contact?.display_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-foreground">{contact?.display_name || 'Unknown Contact'}</h2>
            <p className="text-sm text-muted-foreground">{contact?.phone_number}</p>
            <Badge variant="outline" className="mt-1">
              {conversation?.status === 'active' ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-foreground">Contact Information</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!is_editing)}
              className="text-muted-foreground hover:text-foreground"
            >
              {is_editing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              {is_editing ? 'Cancel' : 'Edit'}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Display Name</label>
              {is_editing ? (
                <Input
                  value={edit_fields.display_name}
                  onChange={(e) => setEditFields(prev => ({ ...prev, display_name: e.target.value }))}
                  className="w-full"
                />
              ) : (
                <p className="text-sm text-foreground">{contact?.display_name || 'Not provided'}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
              <p className="text-sm text-foreground flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {contact?.phone_number || 'Not provided'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              {is_editing ? (
                <Input
                  type="email"
                  value={edit_fields.email}
                  onChange={(e) => setEditFields(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full"
                />
              ) : (
                <p className="text-sm text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {contact?.crm_profile?.email || 'Not provided'}
                </p>
              )}
            </div>

            {is_editing && (
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  onClick={handleEditSave}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditing(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* CRM Information - Simplified */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">CRM Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <TrendingUp className="w-5 h-5 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium text-foreground">Customer Value</p>
              <p className="text-xs text-muted-foreground">High</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <Calendar className="w-5 h-5 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium text-foreground">Customer Since</p>
              <p className="text-xs text-muted-foreground">10/07/2025</p>
            </div>
          </div>
        </div>

        {/* AI Assistant Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
              <Bot className="w-5 h-5" />
              AI Assistant
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAssignmentDialogOpen(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage
            </Button>
          </div>

          <div className="p-4 rounded-lg bg-muted/30 border border-border">
            {assignedAssistant ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {assignedAssistant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{assignedAssistant.name}</p>
                    <p className="text-xs text-muted-foreground">AI Assistant</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {(assignedAssistant.config.tags || []).slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <Bot className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No AI assistant assigned</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAssignmentDialogOpen(true)}
                  className="w-full"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Assign Assistant
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assignment Dialog */}
      {is_assignment_dialog_open && (
        <AssistantAssignmentDialog
          contact={contact}
          isOpen={is_assignment_dialog_open}
          onClose={() => setIsAssignmentDialogOpen(false)}
          onAssignmentChange={() => {}}
        />
      )}
    </div>
  )
}) 