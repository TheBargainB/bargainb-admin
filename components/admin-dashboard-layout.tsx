'use client'

import React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { NotificationDropdown } from "@/app/admin/chat/components/NotificationDropdown"
import { ThemeToggle } from "@/components/theme-toggle"
import LogoutButton from '@/components/logout-button'

interface AdminDashboardLayoutProps {
  children: React.ReactNode
}

export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
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
              <NotificationDropdown />
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