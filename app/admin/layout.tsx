"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogOut, User, Bell } from "lucide-react"
import { useAdminAuth } from "@/hooks/useAdminAuth"
import { ThemeToggle } from "@/components/theme-toggle"
import { Toaster } from "@/components/ui/toaster"
import { useGlobalNotifications } from "@/hooks/useGlobalNotifications"
import Link from "next/link"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  
  // Show login page without any auth checks to prevent concurrent hooks
  if (pathname === "/admin/login") {
    return <>{children}</>
  }
  
  // Only use auth hook when NOT on login page
  const { isAuthenticated, isLoading, adminSession, logout } = useAdminAuth()
  
  // Only initialize notifications after authentication is confirmed
  const shouldUseNotifications = isAuthenticated && !isLoading
  const { unreadMessages, markAllAsRead, refreshUnreadCount } = useGlobalNotifications(shouldUseNotifications)

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated (will be handled by auth hook)
  if (!isAuthenticated) {
    return null
  }

  // Show admin interface with sidebar for authenticated users
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          {/* Admin Header */}
          <header className="border-b bg-background px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-foreground">BargainB Admin Panel</h1>
                <p className="text-sm text-muted-foreground">AI platform</p>
              </div>
              
              {/* User Info, Notifications, Theme Toggle & Logout */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{adminSession?.user.email}</span>
                </div>
                
                {/* Notification Bell */}
                <div className="relative">
                  <Link href="/admin/chat">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="relative p-2"
                      title={unreadMessages > 0 ? `${unreadMessages} unread messages` : 'No unread messages'}
                    >
                      <Bell className="w-4 h-4" />
                      {unreadMessages > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center rounded-full animate-pulse"
                        >
                          {unreadMessages > 99 ? '99+' : unreadMessages}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                </div>

                <ThemeToggle />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={logout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 bg-muted/20">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  )
}
