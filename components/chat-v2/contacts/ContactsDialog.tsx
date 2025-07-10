'use client'

import { memo, useState, useMemo } from 'react'
import { Search, Plus, Phone, MessageSquare, User, X, CheckCircle, Trash2 } from 'lucide-react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { Contact } from '@/types/chat-v2.types'

// =============================================================================
// TYPES
// =============================================================================

interface ContactsDialogProps {
  is_open: boolean
  contacts: Contact[]
  selected_contact_ids: string[]
  search_term: string
  is_loading: boolean
  allow_multiple?: boolean
  
  // Event handlers
  onClose?: () => void
  onContactSelect?: (contact: Contact) => void
  onContactsSelect?: (contacts: Contact[]) => void
  onSearchChange?: (searchTerm: string) => void
  onStartConversation?: (contacts: Contact[]) => void
  onCreateNewContact?: () => void
  onContactDelete?: (contactId: string) => void
  
  className?: string
}

interface ContactItemProps {
  contact: Contact
  is_selected: boolean
  allow_multiple: boolean
  onSelect: (contact: Contact) => void
  onDelete: (contactId: string) => void
}

// =============================================================================
// CONTACT ITEM COMPONENT
// =============================================================================

const ContactItem = memo<ContactItemProps>(({
  contact,
  is_selected,
  allow_multiple,
  onSelect,
  onDelete
}) => {
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

  const handleClick = () => {
    onSelect(contact)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`Delete contact "${displayName}"?`)) {
      onDelete(contact.id)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Select ${displayName}`}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer',
        'hover:bg-gray-50 dark:hover:bg-gray-800',
        'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-inset',
        is_selected && 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {/* Avatar */}
      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarImage src={contact.profile_picture_url} alt={displayName} />
          <AvatarFallback className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
        
        {/* Selection indicator */}
        {is_selected && (
          <div className="absolute -top-1 -right-1 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Contact info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-medium text-gray-900 dark:text-white truncate">
            {displayName}
          </h3>
          
          {contact.is_active && (
            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
          )}
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {contact.phone_number}
        </p>
        
        {/* CRM info */}
        {contact.crm_profile && (
          <div className="flex items-center gap-2 mt-1">
            {contact.crm_profile.lifecycle_stage && (
              <Badge variant="outline" className="text-xs">
                {contact.crm_profile.lifecycle_stage}
              </Badge>
            )}
            
            {contact.crm_profile.engagement_score && contact.crm_profile.engagement_score > 7 && (
              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                High Engagement
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation()
            // Handle quick call action
          }}
        >
          <Phone className="w-3 h-3" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
          onClick={handleDelete}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  )
})

ContactItem.displayName = 'ContactItem'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const ContactsDialog = memo<ContactsDialogProps>(({
  is_open,
  contacts,
  selected_contact_ids,
  search_term,
  is_loading,
  allow_multiple = false,
  onClose,
  onContactSelect,
  onContactsSelect,
  onSearchChange,
  onStartConversation,
  onCreateNewContact,
  onContactDelete,
  className
}) => {
  // =============================================================================
  // STATE
  // =============================================================================

  const [internal_selected_ids, setInternalSelectedIds] = useState<string[]>(selected_contact_ids)

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const filteredContacts = useMemo(() => {
    if (!search_term) return contacts

    const searchLower = search_term.toLowerCase()
    return contacts.filter(contact => {
      const displayName = contact.display_name || 
                         contact.push_name || 
                         contact.verified_name || 
                         ''
      
      return displayName.toLowerCase().includes(searchLower) ||
             contact.phone_number.includes(search_term) ||
             contact.crm_profile?.full_name?.toLowerCase().includes(searchLower) ||
             contact.crm_profile?.email?.toLowerCase().includes(searchLower)
    })
  }, [contacts, search_term])

  const selectedContacts = useMemo(() => {
    return contacts.filter(contact => internal_selected_ids.includes(contact.id))
  }, [contacts, internal_selected_ids])

  const canStartConversation = selectedContacts.length > 0

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    onSearchChange?.(value)
  }

  const handleContactSelect = (contact: Contact) => {
    if (allow_multiple) {
      const newSelectedIds = internal_selected_ids.includes(contact.id)
        ? internal_selected_ids.filter(id => id !== contact.id)
        : [...internal_selected_ids, contact.id]
      
      setInternalSelectedIds(newSelectedIds)
      
      if (onContactsSelect) {
        const newSelectedContacts = contacts.filter(c => newSelectedIds.includes(c.id))
        onContactsSelect(newSelectedContacts)
      }
    } else {
      setInternalSelectedIds([contact.id])
      
      if (onContactSelect) {
        onContactSelect(contact)
      }
    }
  }

  const handleStartConversation = () => {
    if (selectedContacts.length > 0 && onStartConversation) {
      onStartConversation(selectedContacts)
      handleClose()
    }
  }

  const handleClose = () => {
    setInternalSelectedIds([])
    onClose?.()
  }

  const handleCreateNewContact = () => {
    if (onCreateNewContact) {
      onCreateNewContact()
    }
  }

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderLoadingSkeleton = () => (
    <div className="space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  )

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
        {search_term ? (
          <Search className="w-6 h-6 text-gray-400" />
        ) : (
          <User className="w-6 h-6 text-gray-400" />
        )}
      </div>
      
      {search_term ? (
        <>
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
            No contacts found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Try adjusting your search criteria
          </p>
        </>
      ) : (
        <>
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
            No contacts available
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Add contacts to start conversations
          </p>
          <Button onClick={handleCreateNewContact} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </>
      )}
    </div>
  )

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <Dialog open={is_open} onOpenChange={handleClose}>
      <DialogContent className={cn('max-w-md h-[600px] flex flex-col', className)}>
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              {allow_multiple ? 'Select Contacts' : 'Select Contact'}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCreateNewContact}
              className="text-green-600 hover:text-green-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              New
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search contacts..."
            value={search_term}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>

        {/* Selected contacts summary */}
        {allow_multiple && selectedContacts.length > 0 && (
          <div className="mb-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Selected: {selectedContacts.length} contact{selectedContacts.length === 1 ? '' : 's'}
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedContacts.slice(0, 3).map(contact => (
                <Badge key={contact.id} variant="secondary" className="text-xs">
                  {contact.display_name || contact.push_name || 'Unknown'}
                </Badge>
              ))}
              {selectedContacts.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{selectedContacts.length - 3} more
                </Badge>
              )}
            </div>
            <Separator className="mt-3" />
          </div>
        )}

        {/* Contact list */}
        <div className="flex-1 overflow-hidden">
          {is_loading ? (
            renderLoadingSkeleton()
          ) : filteredContacts.length === 0 ? (
            renderEmptyState()
          ) : (
            <ScrollArea className="h-full">
              <div className="space-y-2 p-1">
                {filteredContacts.map(contact => (
                  <ContactItem
                    key={contact.id}
                    contact={contact}
                    is_selected={internal_selected_ids.includes(contact.id)}
                    allow_multiple={allow_multiple}
                    onSelect={handleContactSelect}
                    onDelete={onContactDelete || (() => {})}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filteredContacts.length} contact{filteredContacts.length === 1 ? '' : 's'}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            
            <Button
              onClick={handleStartConversation}
              disabled={!canStartConversation}
              className="bg-green-600 hover:bg-green-700"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Start Chat
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

ContactsDialog.displayName = 'ContactsDialog' 