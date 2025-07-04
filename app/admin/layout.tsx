"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Toaster } from "@/components/ui/toaster"
import { supabase } from "@/lib/supabase"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function SimpleAdminLayout({ children }: AdminLayoutProps) {
  console.log("🚀 SimpleAdminLayout: Component rendering")
  const pathname = usePathname()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  
  // Show login page without any auth checks
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("🔧 SimpleAuth: Checking session...")
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.user) {
          console.log("🔧 SimpleAuth: No session, redirecting to login")
          router.replace("/admin/login")
          return
        }

        console.log("🔧 SimpleAuth: Session found:", session.user.email)
        setUserEmail(session.user.email || "Unknown")
        setIsLoading(false)
      } catch (error) {
        console.error("❌ SimpleAuth: Error:", error)
        router.replace("/admin/login")
      }
    }

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log("🔧 SimpleAuth: Timeout reached, stopping loading")
      setIsLoading(false)
    }, 5000)

    checkAuth().finally(() => clearTimeout(timeout))

    return () => clearTimeout(timeout)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
          <div className="mt-4 text-xs text-muted-foreground">
            <p>🚀 Using SimpleAdminLayout</p>
          </div>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace("/admin/login")
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="border-b bg-background px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-foreground">BargainB Admin Panel</h1>
                <p className="text-sm text-muted-foreground">AI platform</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{userEmail}</span>
                </div>
                
                <ThemeToggle />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 bg-muted/20">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  )
} 