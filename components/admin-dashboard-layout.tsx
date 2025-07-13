'use client'

import React, { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { NotificationDropdown } from "@/components/ui/notification-dropdown"
import { ThemeToggle } from "@/components/theme-toggle"
import LogoutButton from '@/components/logout-button'
import { useUnifiedRealTime } from '@/hooks/chat-v2/useUnifiedRealTime'

interface AdminDashboardLayoutProps {
  children: React.ReactNode
}

export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const [unreadCount, setUnreadCount] = useState(0)

  // Connect to real-time updates for notification count
  const {
    globalUnreadCount,
    isConnected
  } = useUnifiedRealTime({
    selectedConversationId: null, // No specific conversation selected in admin layout
    onMessagesUpdate: (messages) => {
      // Messages updated, but we rely on globalUnreadCount for the notification badge
      console.log('📨 ADMIN: Messages updated:', messages.length)
    },
    onConversationsUpdate: (conversations) => {
      // Conversations updated, but we rely on globalUnreadCount for the notification badge
      console.log('💬 ADMIN: Conversations updated:', conversations.length)
    },
    onNotificationsUpdate: (notifications) => {
      // Notifications updated, but we rely on globalUnreadCount for the notification badge
      console.log('🔔 ADMIN: Notifications updated:', notifications.length)
    },
    onGlobalUnreadUpdate: (count) => {
      console.log('📊 ADMIN: Global unread count updated:', count)
      setUnreadCount(count)
    }
  })

  // Fetch initial notification count
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const response = await fetch('/api/admin/chat/notifications')
        if (response.ok) {
          const data = await response.json()
          const initialCount = data.total_unread || 0
          setUnreadCount(initialCount)
          console.log('📊 ADMIN: Initial notification count loaded:', initialCount)
        }
      } catch (error) {
        console.error('Error fetching notification count:', error)
      }
    }

    fetchNotificationCount()
  }, [])

  // Update unread count when real-time globalUnreadCount changes
  useEffect(() => {
    if (isConnected && globalUnreadCount !== undefined) {
      setUnreadCount(globalUnreadCount)
      console.log('📊 ADMIN: Real-time unread count updated:', globalUnreadCount)
    }
  }, [globalUnreadCount, isConnected])

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/admin/chat/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'mark_all_read'
        })
      })

      if (response.ok) {
        setUnreadCount(0)
        console.log('✅ ADMIN: All notifications marked as read')
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen w-full transition-[margin] duration-300 ease-in-out">
          <div className="sticky top-0 z-10 w-full flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-4">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>Admin</BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex items-center gap-4">
              <NotificationDropdown 
                unreadCount={unreadCount} 
                onMarkAllAsRead={handleMarkAllAsRead}
              />
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>
          <main className="flex-1 w-full p-4 overflow-auto">
            <div className="container mx-auto max-w-[2560px]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
} 