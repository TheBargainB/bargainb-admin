'use client'

import { memo } from 'react'
import { Clock, Check, CheckCheck, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MessageStatus as MessageStatusType } from '@/types/chat-v2.types'

// =============================================================================
// TYPES
// =============================================================================

interface MessageStatusProps {
  status?: MessageStatusType
  from_me: boolean
  show_timestamp?: boolean
  timestamp?: string
  className?: string
}

// =============================================================================
// COMPONENT
// =============================================================================

export const MessageStatus = memo<MessageStatusProps>(({
  status,
  from_me,
  show_timestamp = false,
  timestamp,
  className
}) => {
  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const formattedTime = timestamp ? formatTime(timestamp) : ''
  
  // Only show status for outbound messages (from_me = true)
  if (!from_me && !show_timestamp) {
    return null
  }

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderStatusIcon = () => {
    if (!from_me) return null

    switch (status) {
      case 'pending':
        return (
          <Clock 
            className="w-4 h-4 text-gray-400" 
            aria-label="Sending message..."
          />
        )
      
      case 'sent':
        return (
          <Check 
            className="w-4 h-4 text-gray-400" 
            aria-label="Message sent"
          />
        )
      
      case 'delivered':
        return (
          <CheckCheck 
            className="w-4 h-4 text-gray-400" 
            aria-label="Message delivered"
          />
        )
      
      case 'read':
        return (
          <CheckCheck 
            className="w-4 h-4 text-blue-500" 
            aria-label="Message read"
          />
        )
      
      case 'failed':
      case 'error':
        return (
          <AlertCircle 
            className="w-4 h-4 text-red-500" 
            aria-label="Message failed to send"
          />
        )
      
      default:
        return null
    }
  }

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className={cn(
      'flex items-center gap-1 text-xs',
      className
    )}>
      {/* Timestamp */}
      {show_timestamp && formattedTime && (
        <span className="text-gray-500 dark:text-gray-400">
          {formattedTime}
        </span>
      )}
      
      {/* Status Icon */}
      {from_me && renderStatusIcon()}
    </div>
  )
})

MessageStatus.displayName = 'MessageStatus'

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const formatTime = (timestamp: string): string => {
  try {
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
  } catch (error) {
    console.warn('Invalid timestamp:', timestamp)
    return ''
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default MessageStatus 