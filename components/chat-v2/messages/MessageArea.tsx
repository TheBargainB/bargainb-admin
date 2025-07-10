'use client'

import { memo, useEffect, useRef, useMemo, useState } from 'react'
import { ChevronDown, Phone, Video, MoreVertical } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import type { 
  Message, 
  Conversation, 
  Contact, 
  MessageInputState, 
  MessageType 
} from '@/types/chat-v2.types'

// =============================================================================
// TYPES
// =============================================================================

interface MessageAreaProps {
  conversation?: Conversation | null
  messages: Message[]
  input_state: MessageInputState
  
  // Loading states
  is_loading_messages: boolean
  is_sending_message: boolean
  has_more_messages: boolean
  
  // Event handlers
  onSendMessage?: (content: string, type?: MessageType, mediaFile?: File) => void
  onLoadMoreMessages?: () => void
  onMessageReply?: (message: Message) => void
  onMessageEdit?: (message: Message) => void
  onMessageDelete?: (messageId: string) => void
  onMessageCopy?: (content: string) => void
  onInputChange?: (content: string) => void
  onReplyCancel?: () => void
  onMarkAsRead?: () => void
  
  className?: string
}

// =============================================================================
// COMPONENT
// =============================================================================

export const MessageArea = memo<MessageAreaProps>(({
  conversation,
  messages,
  input_state,
  is_loading_messages,
  is_sending_message,
  has_more_messages,
  onSendMessage,
  onLoadMoreMessages,
  onMessageReply,
  onMessageEdit,
  onMessageDelete,
  onMessageCopy,
  onInputChange,
  onReplyCancel,
  onMarkAsRead,
  className
}) => {
  // =============================================================================
  // REFS
  // =============================================================================

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastMessageIdRef = useRef<string | null>(null)

  // =============================================================================
  // STATE
  // =============================================================================

  const [isAtBottom, setIsAtBottom] = useState(true)

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const contact = conversation?.contact
  const contactName = contact?.display_name || 
                     contact?.push_name || 
                     contact?.verified_name || 
                     'Unknown Contact'
  
  const avatarFallback = contactName
    .split(' ')
    .map((word: string) => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)

  // Group messages by sender and time proximity for bubble grouping
  const groupedMessages = useMemo(() => {
    const groups: Message[][] = []
    let currentGroup: Message[] = []
    
    messages.forEach((message, index) => {
      const prevMessage = messages[index - 1]
      const isSameSender = prevMessage && 
        prevMessage.direction === message.direction &&
        prevMessage.sender_type === message.sender_type
      
      const isCloseInTime = prevMessage && 
        new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() < 60000 // 1 minute
      
      if (isSameSender && isCloseInTime && currentGroup.length > 0) {
        currentGroup.push(message)
      } else {
        if (currentGroup.length > 0) {
          groups.push(currentGroup)
        }
        currentGroup = [message]
      }
    })
    
    if (currentGroup.length > 0) {
      groups.push(currentGroup)
    }
    
    return groups
  }, [messages])

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Scroll position detection
  useEffect(() => {
    const scrollArea = scrollAreaRef.current
    if (!scrollArea) return

    const handleScroll = () => {
      const scrollElement = scrollArea.querySelector('[data-radix-scroll-area-viewport]')
      if (!scrollElement) return

      const { scrollTop, scrollHeight, clientHeight } = scrollElement
      const threshold = 100 // pixels from bottom
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - threshold

      setIsAtBottom(isNearBottom)
    }

    const scrollElement = scrollArea.querySelector('[data-radix-scroll-area-viewport]')
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll)
      // Initial check
      handleScroll()

      return () => {
        scrollElement.removeEventListener('scroll', handleScroll)
      }
    }
  }, [messages.length])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    const shouldAutoScroll = lastMessage && 
      lastMessage.id !== lastMessageIdRef.current &&
      (lastMessage.direction === 'outbound' || is_sending_message || isAtBottom)

    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      lastMessageIdRef.current = lastMessage.id
      setIsAtBottom(true)
    }
  }, [messages, is_sending_message, isAtBottom])

  // Mark as read when conversation changes
  useEffect(() => {
    if (conversation && onMarkAsRead) {
      const timer = setTimeout(() => {
        onMarkAsRead()
      }, 1000) // Mark as read after 1 second

      return () => clearTimeout(timer)
    }
  }, [conversation?.id, onMarkAsRead])

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleLoadMore = () => {
    if (onLoadMoreMessages && !is_loading_messages && has_more_messages) {
      onLoadMoreMessages()
    }
  }

  const handleScrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    setIsAtBottom(true)
  }

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderHeader = () => {
    if (!conversation) return null

    return (
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        {/* Contact info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h3 className="font-medium text-foreground">
              {contactName}
            </h3>
            <p className="text-xs text-muted-foreground">
              {contact?.last_seen_at 
                ? `Last seen ${new Date(contact.last_seen_at).toLocaleTimeString()}`
                : 'Online'
              }
            </p>
          </div>
        </div>
      </div>
    )
  }

  const renderLoadingSkeleton = () => (
    <div className="space-y-4 p-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className={cn(
          'flex gap-2',
          index % 2 === 0 ? 'justify-start' : 'justify-end'
        )}>
          {index % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />}
          <div className={cn(
            'max-w-md space-y-2',
            index % 2 === 0 ? 'items-start' : 'items-end'
          )}>
            <Skeleton className={cn(
              'h-16 rounded-2xl',
              index % 2 === 0 ? 'w-48' : 'w-36 bg-primary/10'
            )} />
          </div>
        </div>
      ))}
    </div>
  )

  const renderEmptyState = () => (
    <div className="flex-1 flex items-center justify-center p-8 text-center">
      <div>
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4 mx-auto">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        </div>
        <h3 className="font-medium text-foreground mb-2">
          Start a conversation with {contactName}
        </h3>
        <p className="text-sm text-muted-foreground">
          Send a message to begin chatting
        </p>
      </div>
    </div>
  )

  const renderLoadMoreButton = () => {
    if (!has_more_messages) return null

    return (
      <div className="flex justify-center p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleLoadMore}
          disabled={is_loading_messages}
          className="text-xs"
        >
          {is_loading_messages ? 'Loading...' : 'Load older messages'}
        </Button>
      </div>
    )
  }

  // =============================================================================
  // RENDER
  // =============================================================================

  if (!conversation) {
    return (
      <div className={cn(
        'flex items-center justify-center h-full bg-muted/30',
        className
      )}>
        <div className="text-center">
          <h3 className="text-lg font-medium text-foreground mb-2">
            Welcome to Chat 2.0
          </h3>
          <p className="text-muted-foreground">
            Select a conversation from the list to start chatting, or create a new conversation with your contacts.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Header */}
      {renderHeader()}

      {/* Messages */}
      <div className="flex-1 relative min-h-0">
        <ScrollArea ref={scrollAreaRef} className="h-full w-full">
          {is_loading_messages && messages.length === 0 ? (
            renderLoadingSkeleton()
          ) : messages.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="p-4 space-y-2">
              {/* Load more button */}
              {renderLoadMoreButton()}

              {/* Message groups */}
              {groupedMessages.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-1">
                  {group.map((message, messageIndex) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      contact_name={contactName}
                      contact_avatar={contact?.profile_picture_url}
                      show_avatar={message.direction === 'inbound'}
                      show_timestamp={messageIndex === group.length - 1}
                      is_group_start={messageIndex === 0}
                      is_group_end={messageIndex === group.length - 1}
                      onReply={onMessageReply}
                      onEdit={onMessageEdit}
                      onDelete={onMessageDelete}
                      onCopy={onMessageCopy}
                    />
                  ))}
                </div>
              ))}
              
              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Scroll to bottom button - Only show when not at bottom */}
        {!isAtBottom && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleScrollToBottom}
            className="absolute bottom-20 right-4 rounded-full shadow-lg z-10"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0 border-t border-border bg-card p-4">
        <MessageInput
          state={input_state}
          conversation_id={conversation.id}
          onSendMessage={onSendMessage}
          onContentChange={onInputChange}
          onReplyCancel={onReplyCancel}
        />
      </div>
    </div>
  )
})

MessageArea.displayName = 'MessageArea' 