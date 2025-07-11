"use client"

import React, { useState } from 'react'
import { Bell, Check, CheckCheck, MessageSquare, Clock, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNotifications } from '@/hooks/chat-v2/useNotifications'
import { useRouter } from 'next/navigation'
import { markConversationAsRead } from '@/actions/chat-v2/conversations.actions'

interface NotificationDropdownProps {
  className?: string
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ 
  className = '' 
}) => {
  console.log('🔔 DROPDOWN: Rendering Chat 2.0 notification dropdown')
  
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  
  const { 
    notification_items,
    total_unread,
    is_loading,
    refreshNotifications
  } = useNotifications({
    enable_realtime: true,
    max_notifications: 10
  })

  const handleNotificationClick = async (notification: any) => {
    console.log('🔔 DROPDOWN: Notification clicked:', notification.conversation_id)
    
    try {
      // Mark conversation as read
      await markConversationAsRead(notification.conversation_id)
      
      // Navigate to Chat 2.0 with selected conversation
        setIsOpen(false)
      router.push(`/admin/chat-v2?conversation=${notification.conversation_id}`)
      
      // Refresh notifications to update counts
      await refreshNotifications()
    } catch (error) {
      console.error('🔔 DROPDOWN: Error handling notification click:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    console.log('🔔 DROPDOWN: Marking all notifications as read')
    try {
      // Mark all conversations as read
      const markAsReadPromises = notification_items.map(notification => 
        markConversationAsRead(notification.conversation_id)
      )
      
      await Promise.all(markAsReadPromises)
      
      // Refresh notifications to update counts
      await refreshNotifications()
    } catch (error) {
      console.error('🔔 DROPDOWN: Error marking all as read:', error)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const now = new Date()
    const messageTime = new Date(timestamp)
    const diff = now.getTime() - messageTime.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    return messageTime.toLocaleDateString()
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message
    return message.substring(0, maxLength) + '...'
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`relative hover:bg-gray-100 ${className}`}
        >
          <Bell className="h-5 w-5" />
          {total_unread > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {total_unread > 99 ? '99+' : total_unread}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <DropdownMenuLabel className="p-0 font-semibold">
              Messages
            </DropdownMenuLabel>
            {total_unread > 0 && (
              <Badge variant="secondary" className="text-xs">
                {total_unread}
              </Badge>
            )}
          </div>
          {total_unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Content */}
        <ScrollArea className="max-h-96">
          {is_loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">Loading...</span>
            </div>
          ) : notification_items.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500 mb-1">No unread messages</p>
              <p className="text-xs text-gray-400">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y">
              {notification_items.map((notification) => (
                <DropdownMenuItem
                  key={notification.conversation_id}
                  className="p-0 cursor-pointer bg-blue-50 hover:bg-blue-100"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3 p-4 w-full">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-500 text-white text-xs">
                          {getInitials(notification.contact_name)}
                          </AvatarFallback>
                        </Avatar>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.contact_name}
                        </p>
                        <div className="flex items-center space-x-1">
                          {notification.unread_count > 0 && (
                            <Badge variant="destructive" className="h-4 text-xs px-1">
                              {notification.unread_count}
                            </Badge>
                          )}
                          <Clock className="h-3 w-3 text-gray-400" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {truncateMessage(notification.last_message)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimestamp(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notification_items.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full text-xs"
                onClick={() => {
                  setIsOpen(false)
                  router.push('/admin/chat-v2')
                }}
              >
                View all conversations
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 