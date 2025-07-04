"use client"

import React from "react"
import { useAdminAuth } from "@/hooks/useAdminAuth"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { NotificationDropdown } from "./chat/components/NotificationDropdown"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  console.log("🔑 ADMIN LAYOUT: Starting execution")
  
  const { isAuthenticated, isLoading, user, logout } = useAdminAuth()
  const router = useRouter()
  
  console.log("🔑 ADMIN LAYOUT: Auth state:", { isAuthenticated, isLoading, user: user?.email })
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log("🔑 ADMIN LAYOUT: Not authenticated, redirecting to login")
    router.push("/admin/login")
    return null
  }
  
  // Render authenticated admin interface with sidebar
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold">BargainB Admin Panel</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          {/* User info and logout */}
          <div className="ml-auto flex items-center space-x-4">
            <NotificationDropdown />
            <span className="text-sm text-gray-600">
              Welcome, {user?.email}
            </span>
            <button
              onClick={logout}
              className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </header>
        
        {/* Main content */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 