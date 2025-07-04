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
import { NotificationDropdown } from "@/components/ui/notification-dropdown"
import Link from "next/link"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  console.log("🏗️ AdminLayout: Component rendering")
  const pathname = usePathname()
  console.log("🏗️ AdminLayout: pathname =", pathname)
  
  // Show login page without any auth checks to prevent concurrent hooks
  if (pathname === "/admin/login") {
    console.log("🏗️ AdminLayout: Returning login page without auth check")
    return <>{children}</>
  }
  
  console.log("🏗️ AdminLayout: About to call useAdminAuth()")
  // Only use auth hook when NOT on login page - IMPROVED with initialCheckComplete
  const { isAuthenticated, isLoading, adminSession, initialCheckComplete, logout } = useAdminAuth()
  console.log("🏗️ AdminLayout: useAdminAuth returned:", { isAuthenticated, isLoading, initialCheckComplete })
  
  // Only initialize notifications after authentication is confirmed
  const shouldUseNotifications = isAuthenticated && !isLoading && initialCheckComplete
  const { unreadMessages, markAllAsRead, refreshUnreadCount } = useGlobalNotifications(shouldUseNotifications)

  // IMPROVED: Show loading spinner while checking authentication - prevent flash
  if (!initialCheckComplete || (isLoading && !adminSession)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
          <div className="mt-4 text-xs text-muted-foreground space-y-1 max-w-md">
            <p>🔧 initialCheckComplete: {initialCheckComplete.toString()}</p>
            <p>🔧 isLoading: {isLoading.toString()}</p>
            <p>🔧 adminSession: {adminSession ? 'present' : 'null'}</p>
            <p>🔧 isAuthenticated: {isAuthenticated.toString()}</p>
            <p>🔧 pathname: {pathname}</p>
          </div>
        </div>
      </div>
    )
  }

  // IMPROVED: Only redirect after initial check is complete
  if (initialCheckComplete && !isAuthenticated) {
    // The useAdminAuth hook will handle the redirect, just return null to prevent rendering
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
                
                {/* Notification Dropdown - IMPROVED: Clickable dropdown with recent messages */}
                {shouldUseNotifications && (
                  <NotificationDropdown 
                    unreadCount={unreadMessages}
                    onMarkAllAsRead={markAllAsRead}
                  />
                )}

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
