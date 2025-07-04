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
import { useNotifications, NotificationItem } from '../lib/useNotifications'
import { useRouter } from 'next/navigation'

interface NotificationDropdownProps {
  className?: string
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ 
  className = '' 
}) => {
  console.log('🔔 DROPDOWN: Rendering notification dropdown')
  
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications()

  const handleNotificationClick = async (notification: NotificationItem) => {
    console.log('🔔 DROPDOWN: Notification clicked:', notification.id)
    
    try {
      // Mark as read
      await markAsRead(notification.id)
      
      // Navigate to the conversation if it's a message notification
      if (notification.type === 'message' && notification.data?.conversationId) {
        setIsOpen(false)
        router.push(`/admin/chat?conversation=${notification.data.conversationId}`)
      }
    } catch (error) {
      console.error('🔔 DROPDOWN: Error handling notification click:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    console.log('🔔 DROPDOWN: Marking all notifications as read')
    try {
      await markAllAsRead()
    } catch (error) {
      console.error('🔔 DROPDOWN: Error marking all as read:', error)
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    return timestamp.toLocaleDateString()
  }

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4" />
      case 'conversation':
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2)
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
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
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
              Notifications
            </DropdownMenuLabel>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
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
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">Loading...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500 mb-1">No notifications</p>
              <p className="text-xs text-gray-400">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`p-0 cursor-pointer ${
                    !notification.read ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3 p-4 w-full">
                    {/* Avatar/Icon */}
                    <div className="flex-shrink-0">
                      {notification.type === 'message' ? (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-500 text-white text-xs">
                            {getInitials(notification.title)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </p>
                        <div className="flex items-center space-x-1">
                          {!notification.read && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                          )}
                          <Clock className="h-3 w-3 text-gray-400" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notification.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full text-xs"
                onClick={() => {
                  setIsOpen(false)
                  router.push('/admin/chat')
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