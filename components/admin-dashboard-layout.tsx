'use client'

import React, { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { NotificationDropdown } from "@/components/ui/notification-dropdown"
import { ThemeToggle } from "@/components/theme-toggle"
import LogoutButton from '@/components/logout-button'

interface AdminDashboardLayoutProps {
  children: React.ReactNode
}

export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch initial notification count
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const response = await fetch('/api/admin/chat-v2/notifications')
        if (response.ok) {
          const data = await response.json()
          setUnreadCount(data.total_unread || 0)
        }
      } catch (error) {
        console.error('Error fetching notification count:', error)
      }
    }

    fetchNotificationCount()

    // Set up periodic refresh for notification count
    const interval = setInterval(fetchNotificationCount, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleMarkAllAsRead = async () => {
    try {
      // TODO: Implement mark all as read functionality
      setUnreadCount(0)
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