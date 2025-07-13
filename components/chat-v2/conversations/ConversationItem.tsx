'use client'

import { memo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ChatHelpers } from '@/lib/chat-helpers'
import type { Conversation } from '@/types/chat-v2.types'

// =============================================================================
// TYPES
// =============================================================================

interface ConversationItemProps {
  conversation: Conversation
  is_selected?: boolean
  is_loading?: boolean
  onClick?: (conversationId: string) => void
  onDoubleClick?: (conversationId: string) => void
  className?: string
}

// =============================================================================
// COMPONENT
// =============================================================================

export const ConversationItem = memo<ConversationItemProps>(({
  conversation,
  is_selected = false,
  is_loading = false,
  onClick,
  onDoubleClick,
  className
}) => {
  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const hasUnread = conversation.unread_count > 0
  const displayName = conversation.contact?.display_name || 
                     conversation.contact?.push_name || 
                     conversation.contact?.verified_name ||
                     conversation.contact?.whatsapp_jid?.split('@')[0] ||
                     'Unknown Contact'
  
  // Reduced text preview to 60 characters for more compact display
  const lastMessagePreview = conversation.last_message && conversation.last_message.length > 60 
    ? `${conversation.last_message.substring(0, 60)}...` 
    : conversation.last_message || 'No messages yet'

  const avatarFallback = displayName
    .split(' ')
    .map((word: string) => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)

  // Use ChatHelpers for consistent time formatting
  const formattedTime = conversation.last_message_at 
    ? ChatHelpers.formatConversationTime(conversation.last_message_at)
    : ''

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleClick = () => {
    if (!is_loading && onClick) {
      onClick(conversation.id)
    }
  }

  const handleDoubleClick = () => {
    if (!is_loading && onDoubleClick) {
      onDoubleClick(conversation.id)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Conversation with ${displayName}`}
      aria-selected={is_selected}
      className={cn(
        // Base styles with reduced padding for more compact display
        'flex items-center gap-2 p-2 w-full transition-all duration-200',
        'border-b border-gray-100 dark:border-gray-800',
        'cursor-pointer select-none',
        
        // Hover states
        'hover:bg-gray-50 dark:hover:bg-gray-800/50',
        
        // Selected state
        is_selected && [
          'bg-green-50 dark:bg-green-900/20',
          'border-l-4 border-l-green-500',
          'shadow-sm'
        ],
        
        // Loading state
        is_loading && 'opacity-50 cursor-not-allowed',
        
        // Focus states
        'focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700',
        'focus:ring-2 focus:ring-green-500 focus:ring-inset',
        
        className
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
    >
      {/* Avatar - reduced size for more compact display */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage 
            src={conversation.contact?.profile_picture_url} 
            alt={displayName}
          />
          <AvatarFallback className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-medium text-sm">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header row */}
        <div className="flex items-center justify-between mb-1">
          <h3 className={cn(
            'font-medium text-sm truncate',
            hasUnread 
              ? 'text-gray-900 dark:text-white' 
              : 'text-gray-700 dark:text-gray-300'
          )}>
            {displayName}
          </h3>
          
          {formattedTime && (
            <span className={cn(
              'text-xs flex-shrink-0 ml-2',
              hasUnread 
                ? 'text-green-600 dark:text-green-400 font-medium' 
                : 'text-gray-500 dark:text-gray-400'
            )}>
              {formattedTime}
            </span>
          )}
        </div>

        {/* Message preview row */}
        <div className="flex items-center justify-between">
          <p className={cn(
            'text-xs truncate flex-1', // Added flex-1 to take remaining space
            hasUnread 
              ? 'text-gray-600 dark:text-gray-300 font-medium' 
              : 'text-gray-500 dark:text-gray-400'
          )}>
            {lastMessagePreview}
          </p>
          
          {/* Unread badge */}
          {hasUnread && (
            <Badge 
              variant="destructive" 
              className="h-5 min-w-5 text-xs px-1.5 ml-2 flex-shrink-0"
            >
              {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
})

ConversationItem.displayName = 'ConversationItem' 