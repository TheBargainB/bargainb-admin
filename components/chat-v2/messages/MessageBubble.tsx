'use client'

import { memo, useState } from 'react'
import { MoreVertical, Reply, Copy, Trash2, Edit, Image, File, Download } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { MessageStatus } from './MessageStatus'
import type { Message } from '@/types/chat-v2.types'

// =============================================================================
// TYPES
// =============================================================================

interface MessageBubbleProps {
  message: Message
  contact_name?: string
  contact_avatar?: string
  show_avatar?: boolean
  show_timestamp?: boolean
  is_group_start?: boolean
  is_group_end?: boolean
  onReply?: (message: Message) => void
  onEdit?: (message: Message) => void
  onDelete?: (messageId: string) => void
  onCopy?: (content: string) => void
  className?: string
}

// =============================================================================
// COMPONENT
// =============================================================================

export const MessageBubble = memo<MessageBubbleProps>(({
  message,
  contact_name,
  contact_avatar,
  show_avatar = true,
  show_timestamp = false,
  is_group_start = false,
  is_group_end = true,
  onReply,
  onEdit,
  onDelete,
  onCopy,
  className
}) => {
  // =============================================================================
  // STATE
  // =============================================================================

  const [is_hovered, setIsHovered] = useState(false)

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const isOutbound = message.direction === 'outbound'
  const isInbound = !isOutbound
  const hasMedia = message.media_url && message.message_type !== 'text'
  
  const senderName = contact_name || message.sender_name || 'Unknown'
  const avatarFallback = senderName
    .split(' ')
    .map((word: string) => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleReply = () => {
    if (onReply) {
      onReply(message)
    }
  }

  const handleEdit = () => {
    if (onEdit && isOutbound) {
      onEdit(message)
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(message.id)
    }
  }

  const handleCopy = () => {
    if (onCopy) {
      onCopy(message.content)
    }
  }

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => setIsHovered(false)

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderMediaContent = () => {
    if (!hasMedia || !message.media_url) return null

    switch (message.message_type) {
      case 'image':
        return (
          <div className="relative group mb-2">
            <img
              src={message.media_url}
              alt="Shared image"
              className="max-w-xs rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors" />
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 hover:bg-black/40 text-white"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        )
      
      case 'video':
        return (
          <div className="relative group mb-2">
            <video
              src={message.media_url}
              className="max-w-xs rounded-lg"
              controls
              preload="metadata"
            />
          </div>
        )
      
      case 'audio':
        return (
          <div className="mb-2">
            <audio
              src={message.media_url}
              controls
              className="max-w-xs"
            />
          </div>
        )
      
      case 'document':
        return (
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-2 max-w-xs">
            <File className="w-8 h-8 text-gray-500" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate text-sm">
                {message.content || 'Document'}
              </p>
              <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                Download
              </Button>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  const renderContextMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'opacity-0 transition-opacity p-1 h-6 w-6',
            is_hovered && 'opacity-100'
          )}
        >
          <MoreVertical className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onReply && (
          <DropdownMenuItem onClick={handleReply}>
            <Reply className="w-4 h-4 mr-2" />
            Reply
          </DropdownMenuItem>
        )}
        {onCopy && (
          <DropdownMenuItem onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </DropdownMenuItem>
        )}
        {onEdit && isOutbound && (
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem onClick={handleDelete} className="text-red-600">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div
      className={cn(
        'flex gap-2 w-full',
        isOutbound ? 'justify-end' : 'justify-start',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Avatar for inbound messages */}
      {isInbound && show_avatar && (
        <div className={cn(
          'flex-shrink-0',
          is_group_end ? 'self-end' : 'invisible'
        )}>
          {is_group_end && (
            <Avatar className="h-8 w-8">
              <AvatarImage src={contact_avatar} alt={senderName} />
              <AvatarFallback className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      )}

      {/* Message content */}
      <div className={cn(
        'flex items-end gap-1 max-w-md',
        isOutbound && 'flex-row-reverse'
      )}>
        {/* Context menu */}
        {(onReply || onEdit || onDelete || onCopy) && renderContextMenu()}

        {/* Message bubble */}
        <div
          className={cn(
            'relative px-3 py-2 rounded-2xl shadow-sm',
            
            // Outbound message styling (green)
            isOutbound && [
              'bg-green-500 text-white',
              'rounded-br-md',
              is_group_start && 'rounded-tr-2xl',
              is_group_end && 'rounded-br-md',
              !is_group_start && !is_group_end && 'rounded-r-md'
            ],
            
            // Inbound message styling (white/gray)
            isInbound && [
              'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
              'border border-gray-200 dark:border-gray-700',
              'rounded-bl-md',
              is_group_start && 'rounded-tl-2xl',
              is_group_end && 'rounded-bl-md',
              !is_group_start && !is_group_end && 'rounded-l-md'
            ]
          )}
        >
          {/* Sender name for inbound messages in groups */}
          {isInbound && is_group_start && contact_name && (
            <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
              {contact_name}
            </p>
          )}

          {/* Media content */}
          {renderMediaContent()}

          {/* Text content */}
          {message.content && (
            <p className={cn(
              'text-sm whitespace-pre-wrap break-words',
              hasMedia && 'mt-2'
            )}>
              {message.content}
            </p>
          )}

          {/* AI indicator */}
          {message.is_ai_generated && (
            <div className="mt-1 flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
              <span className="text-xs opacity-75">AI</span>
            </div>
          )}

          {/* Timestamp and status */}
          <div className={cn(
            'flex items-center justify-end gap-1 mt-1',
            isOutbound ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'
          )}>
            <MessageStatus
              status={message.whatsapp_status}
              from_me={message.from_me}
              show_timestamp={show_timestamp}
              timestamp={message.created_at}
              className={cn(
                isOutbound && 'text-green-100'
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
})

MessageBubble.displayName = 'MessageBubble' 