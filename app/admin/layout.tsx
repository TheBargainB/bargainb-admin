"use client"

import React, { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter, usePathname } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { NotificationDropdown } from "./chat/components/NotificationDropdown"
import { ThemeToggle } from "@/components/theme-toggle"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { LogOut, Loader2 } from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isLoading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true)

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      setIsCheckingAdmin(true)
      
      if (!user) {
        setIsAdmin(false)
        setIsCheckingAdmin(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('id, role')
          .eq('auth_user_id', user.id)
          .eq('is_active', true)
          .single()

        setIsAdmin(!!data && !error)
      } catch (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
      } finally {
        setIsCheckingAdmin(false)
      }
    }

    checkAdminStatus()
  }, [user])

  // Handle authentication redirects
  useEffect(() => {
    // Don't redirect while checking auth status
    if (isLoading || isCheckingAdmin) return

    // Don't redirect on login page if we're still checking auth
    if (pathname === '/admin/login') {
      if (user && isAdmin) {
        router.push('/admin')
      }
      return
    }

    // For all other admin pages
    if (!user || isAdmin === false) {
      router.push('/admin/login')
    }
  }, [user, isLoading, isAdmin, pathname, isCheckingAdmin, router])

  const handleLogout = async () => {
    await signOut()
    router.push('/admin/login')
  }

  // Show loading state while checking auth
  if ((isLoading || isCheckingAdmin) && pathname !== '/admin/login') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Allow login page to render without restrictions
  if (pathname === '/admin/login') {
    return children
  }

  // Show access denied for non-admin users
  if (!isLoading && !isCheckingAdmin && user && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this admin panel.</p>
          <Button 
            variant="default"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Back to Login
          </Button>
        </div>
      </div>
    )
  }

  // Show admin layout for authenticated admin users
  if (!isLoading && !isCheckingAdmin && user && isAdmin) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen">
          <AppSidebar />
          <div className="flex-1">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>Admin</BreadcrumbItem>
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div className="flex items-center gap-4">
                <NotificationDropdown />
                <ThemeToggle />
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleLogout}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <main className="p-4">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  // Return children while checking auth status
  return children
}