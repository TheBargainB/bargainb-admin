'use client'

import { memo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
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
  
  const lastMessagePreview = conversation.last_message && conversation.last_message.length > 50 
    ? `${conversation.last_message.substring(0, 50)}...` 
    : conversation.last_message || 'No messages yet'

  const avatarFallback = displayName
    .split(' ')
    .map((word: string) => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)

  const formattedTime = conversation.last_message_at 
    ? formatMessageTime(conversation.last_message_at)
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
      aria-label={`Conversation with ${displayName}${hasUnread ? `, ${conversation.unread_count} unread messages` : ''}`}
      aria-selected={is_selected}
      className={cn(
        // Base styles
        'flex items-center gap-3 p-3 w-full transition-all duration-200',
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
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-12 w-12">
          <AvatarImage 
            src={conversation.contact?.profile_picture_url} 
            alt={displayName}
          />
          <AvatarFallback className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-medium">
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
            'text-sm truncate',
            hasUnread 
              ? 'text-gray-600 dark:text-gray-300 font-medium' 
              : 'text-gray-500 dark:text-gray-400'
          )}>
            {lastMessagePreview}
          </p>
          
          {/* Unread badge */}
          {hasUnread && (
            <Badge 
              variant="default" 
              className="ml-2 bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-2 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center"
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

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const formatMessageTime = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)

  // Today - show time
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }
  
  // Yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }
  
  // This week - show day
  const daysAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (daysAgo < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }
  
  // Older - show date
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })
}

const getMessageStatusIcon = (status?: string): string => {
  switch (status) {
    case 'sent':
      return '✓'
    case 'delivered':
      return '✓✓'
    case 'read':
      return '✓✓'
    case 'pending':
      return '⏳'
    case 'failed':
      return '❌'
    default:
      return ''
  }
} 