"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

type AdminUser = Database['public']['Tables']['admin_users']['Row']

interface AdminSession {
  user: User
  adminUser: AdminUser
}

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null)
  const router = useRouter()

  // Check for existing session on mount
  useEffect(() => {
    checkAuthSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await checkAdminAccess(session.user)
        } else if (event === 'SIGNED_OUT') {
          handleSignOut()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const checkAuthSession = async () => {
    try {
      setIsLoading(true)
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error("Error getting session:", error)
        handleSignOut()
        return
      }

      if (session?.user) {
        await checkAdminAccess(session.user)
      } else {
        handleSignOut()
      }
    } catch (error) {
      console.error("Error checking auth session:", error)
      handleSignOut()
    } finally {
      setIsLoading(false)
    }
  }

  const checkAdminAccess = async (user: User) => {
    try {
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('auth_user_id', user.id)
        .eq('is_active', true)
        .single()

      if (error || !adminUser) {
        console.error("User does not have admin access:", error)
        handleSignOut()
        return
      }

      setAdminSession({ user, adminUser })
      setIsAuthenticated(true)
    } catch (error) {
      console.error("Error checking admin access:", error)
      handleSignOut()
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error("Login error:", error)
        return false
      }

      if (data.user) {
        await checkAdminAccess(data.user)
        return true
      }

      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithMagicLink = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`
        }
      })

      if (error) {
        console.error("Magic link error:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Magic link error:", error)
      return false
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      handleSignOut()
    } catch (error) {
      console.error("Logout error:", error)
      handleSignOut()
    }
  }

  const handleSignOut = () => {
    setAdminSession(null)
    setIsAuthenticated(false)
    router.push("/admin/login")
  }

  const requireAuth = () => {
    if (!isLoading && !isAuthenticated) {
      router.push("/admin/login")
    }
  }

  // Helper functions to check permissions
  const hasPermission = (permission: string): boolean => {
    if (!adminSession?.adminUser.permissions) return false
    const permissions = adminSession.adminUser.permissions as Record<string, boolean>
    return permissions[permission] === true
  }

  const isSuperAdmin = (): boolean => {
    return adminSession?.adminUser.role === 'super_admin'
  }

  const isAdmin = (): boolean => {
    return adminSession?.adminUser.role === 'admin' || isSuperAdmin()
  }

  return {
    isAuthenticated,
    isLoading,
    adminSession,
    user: adminSession?.user || null,
    adminUser: adminSession?.adminUser || null,
    login,
    loginWithMagicLink,
    logout,
    requireAuth,
    checkAuthSession,
    hasPermission,
    isSuperAdmin,
    isAdmin
  }
} 