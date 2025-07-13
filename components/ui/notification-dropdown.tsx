"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, MessageSquare, Clock, CheckCheck } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { ChatHelpers } from '@/lib/chat-helpers'

interface RecentMessage {
  id: string
  conversation_id: string
  content: string
  sender_name: string
  contact_picture?: string
  created_at: string
  unread: boolean
  contact_name: string
  contact_phone: string
}

interface NotificationDropdownProps {
  unreadCount: number
  onMarkAllAsRead?: () => void
}

export function NotificationDropdown({ unreadCount, onMarkAllAsRead }: NotificationDropdownProps) {
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  console.log('🔔 DROPDOWN: Rendering Chat 2.0 notification dropdown')

  // Fetch recent messages when dropdown opens
  const fetchRecentMessages = async () => {
    if (isLoading) return
    
    setIsLoading(true)
    try {
      console.log('🔔 DROPDOWN: Fetching recent messages from Chat 2.0 API')
      const response = await fetch('/api/admin/chat/recent-messages')
      if (response.ok) {
        const data = await response.json()
        setRecentMessages(data.messages || [])
        console.log('🔔 DROPDOWN: Loaded', data.messages?.length || 0, 'recent messages')
      } else {
        console.error('Failed to fetch recent messages:', response.status)
      }
    } catch (error) {
      console.error('Error fetching recent messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch messages when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchRecentMessages()
    }
  }, [isOpen])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const formatMessageTime = (timestamp: string) => {
    try {
      return ChatHelpers.formatMessageTime(timestamp)
    } catch {
      return 'Recently'
    }
  }

  const truncateMessage = (message: string, maxLength: number = 60) => {
    if (message.length <= maxLength) return message
    return message.substring(0, maxLength) + '...'
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="relative p-2"
          title={unreadCount > 0 ? `${unreadCount} unread messages` : 'No unread messages'}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center rounded-full animate-pulse"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 max-h-96"
        sideOffset={5}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <h3 className="font-semibold text-sm">Messages</h3>
            </div>
            {unreadCount > 0 && onMarkAllAsRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                className="text-xs h-6 px-2"
              >
                <CheckCheck className="w-3 h-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
          {unreadCount > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {unreadCount} unread message{unreadCount > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Messages List */}
        <ScrollArea className="max-h-72">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-muted-foreground">Loading messages...</p>
            </div>
          ) : recentMessages.length === 0 ? (
            <div className="p-4 text-center">
              <Bell className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No recent messages</p>
            </div>
          ) : (
            <div className="py-2">
              {recentMessages.map((message) => (
                <Link 
                  key={message.id} 
                  href={`/admin/chat-v2?conversation=${message.conversation_id}`}
                  onClick={() => setIsOpen(false)}
                >
                  <DropdownMenuItem className="p-3 cursor-pointer hover:bg-muted/50 focus:bg-muted/50">
                    <div className="flex items-start gap-3 w-full">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={message.contact_picture} />
                        <AvatarFallback className="text-xs">
                          {getInitials(message.contact_name || message.sender_name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium truncate">
                            {message.contact_name || message.sender_name}
                          </p>
                          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                            {message.unread && (
                              <Badge variant="destructive" className="h-4 text-xs px-1">
                                Unread
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatMessageTime(message.created_at)}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground truncate">
                          {truncateMessage(message.content)}
                        </p>
                        
                        {message.contact_phone && (
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            {message.contact_phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </DropdownMenuItem>
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {recentMessages.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Link href="/admin/chat-v2" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full text-xs">
                  View all conversations
                </Button>
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 