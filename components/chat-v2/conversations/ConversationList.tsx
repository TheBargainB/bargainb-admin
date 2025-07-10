'use client'

import { memo, useMemo, useState } from 'react'
import { Search, RefreshCw, Plus, Filter, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { ConversationItem } from './ConversationItem'
import type { Conversation, ConversationFilters } from '@/types/chat-v2.types'

// =============================================================================
// TYPES
// =============================================================================

interface ConversationListProps {
  conversations: Conversation[]
  selected_conversation_id?: string | null
  total_count: number
  total_unread: number
  search_term: string
  filters: ConversationFilters
  
  // Loading states
  is_loading: boolean
  is_refreshing: boolean
  is_syncing_contacts?: boolean
  
  // Event handlers
  onConversationSelect?: (conversationId: string) => void
  onSearchChange?: (searchTerm: string) => void
  onFilterChange?: (filters: Partial<ConversationFilters>) => void
  onRefresh?: () => void
  onNewConversation?: () => void
  onSyncContacts?: () => void
  
  className?: string
}

type FilterOption = 'all' | 'unread' | 'active' | 'archived'

// =============================================================================
// COMPONENT
// =============================================================================

export const ConversationList = memo<ConversationListProps>(({
  conversations,
  selected_conversation_id,
  total_count,
  total_unread,
  search_term,
  filters,
  is_loading,
  is_refreshing,
  is_syncing_contacts = false,
  onConversationSelect,
  onSearchChange,
  onFilterChange,
  onRefresh,
  onNewConversation,
  onSyncContacts,
  className
}) => {
  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const filteredConversations = useMemo(() => {
    return conversations.filter(conversation => {
      // Apply search filter
      if (search_term) {
        const searchLower = search_term.toLowerCase()
        const contactName = conversation.contact?.display_name || 
                           conversation.contact?.push_name || 
                           conversation.contact?.verified_name || 
                           ''
        const lastMessage = conversation.last_message || ''
        
        return contactName.toLowerCase().includes(searchLower) ||
               lastMessage.toLowerCase().includes(searchLower)
      }
      
      return true
    })
  }, [conversations, search_term])

  const currentFilter = filters.status || 'all'

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    onSearchChange?.(value)
  }

  const handleFilterSelect = (filter: FilterOption) => {
    onFilterChange?.({ status: filter })
  }

  const handleRefresh = () => {
    if (!is_refreshing && onRefresh) {
      onRefresh()
    }
  }

  const handleNewConversation = () => {
    if (onNewConversation) {
      onNewConversation()
    }
  }

  const handleSyncContacts = () => {
    if (onSyncContacts) {
      onSyncContacts()
    }
  }

  const handleConversationClick = (conversationId: string) => {
    if (onConversationSelect) {
      onConversationSelect(conversationId)
    }
  }

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderLoadingSkeleton = () => (
    <div className="space-y-1 p-2">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 p-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  )

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-muted-foreground" />
      </div>
      
      {search_term ? (
        <>
          <h3 className="font-medium text-foreground mb-2">
            No conversations found
          </h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </>
      ) : (
        <>
          <h3 className="font-medium text-foreground mb-2">
            No conversations yet
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start a new conversation to get started
          </p>
          <Button onClick={handleNewConversation} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            New Conversation
          </Button>
        </>
      )}
    </div>
  )

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              Chats
            </h2>
            {total_unread > 0 && (
              <Badge variant="destructive" className="text-xs">
                {total_unread}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={is_refreshing}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={cn('w-4 h-4', is_refreshing && 'animate-spin')} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewConversation}
              className="text-muted-foreground hover:text-foreground"
            >
              <Plus className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSyncContacts}
              disabled={is_syncing_contacts}
              className="text-muted-foreground hover:text-foreground"
            >
              <Download className={cn('w-4 h-4', is_syncing_contacts && 'animate-pulse')} />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={search_term}
            onChange={handleSearchChange}
            className="pl-10 bg-muted/50 border-border focus:bg-background"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <Button
            variant={currentFilter === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleFilterSelect('all')}
            className="text-sm"
          >
            <Filter className="w-3 h-3 mr-1" />
            All
          </Button>
          
          <div className="text-xs text-muted-foreground">
            {filteredConversations.length} of {total_count}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {is_loading ? (
          renderLoadingSkeleton()
        ) : filteredConversations.length === 0 ? (
          renderEmptyState()
        ) : (
          <ScrollArea className="h-full">
            <div className="space-y-1 p-2">
              {filteredConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  is_selected={conversation.id === selected_conversation_id}
                  onClick={() => handleConversationClick(conversation.id)}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Footer */}
      {total_unread > 0 && (
        <div className="flex-shrink-0 p-3 border-t border-border bg-muted/30">
          <p className="text-xs text-center text-muted-foreground">
            {total_unread} unread conversation{total_unread !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
})

ConversationList.displayName = 'ConversationList' 