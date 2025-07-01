"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

type AdminUser = {
  id: string
  auth_user_id: string
  email: string
  role: string
  is_active: boolean
  permissions: Record<string, boolean> | null
  created_at: string
  updated_at: string
}

interface AdminSession {
  user: User
  adminUser: AdminUser
}

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null)
  const router = useRouter()

  console.log("🔧 useAdminAuth: Hook initialized")

  // Check for existing session on mount
  useEffect(() => {
    console.log("🔧 useAdminAuth: useEffect triggered - checking session")
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
    console.log("🔧 checkAuthSession: Starting session check")
    setIsLoading(true)
    
    try {
      console.log("🔧 checkAuthSession: Getting current session from Supabase")
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error("❌ checkAuthSession: Session error:", sessionError)
        handleSignOut()
        return
      }

      if (!session?.user) {
        console.log("🔧 checkAuthSession: No session found, redirecting to login")
        setIsAuthenticated(false)
        setIsLoading(false)
        router.push("/admin/login")
        return
      }

      console.log("🔧 checkAuthSession: Session found for user:", session.user.email)
      await checkAdminAccess(session.user)
    } catch (error) {
      console.error("❌ checkAuthSession: Unexpected error:", error)
      handleSignOut()
    }
  }

  const checkAdminAccess = async (user: User) => {
    console.log("🔧 checkAdminAccess: Starting admin access check for:", user.email)
    
    try {
      console.log("🔧 checkAdminAccess: Querying admin_users table...")
      const startTime = performance.now()
      
      // Add timeout specifically for database query during session check
      const queryPromise = supabase
        .from('admin_users')
        .select('*')
        .eq('auth_user_id', user.id)
        .eq('is_active', true)
        .single()
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 5000)
      )
      
      const { data: adminUser, error } = await Promise.race([queryPromise, timeoutPromise])
      
      const endTime = performance.now()
      console.log(`🔧 checkAdminAccess: Database query took ${endTime - startTime}ms`)

      if (error) {
        console.error("❌ checkAdminAccess: Database error:", error)
        console.error("❌ checkAdminAccess: Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        handleSignOut()
        return
      }

      if (!adminUser) {
        console.error("❌ checkAdminAccess: No admin user found for:", user.email)
        handleSignOut()
        return
      }

      console.log("✅ checkAdminAccess: Admin access confirmed for:", user.email, adminUser)
      setAdminSession({ user, adminUser: adminUser as AdminUser })
      setIsAuthenticated(true)
      setIsLoading(false)
    } catch (error) {
      console.error("❌ checkAdminAccess: Unexpected error:", error)
      // If database query times out during session check, redirect to login
      if (error.message === 'Database query timeout') {
        console.error("❌ Database query timed out during session check - redirecting to login")
        setIsLoading(false)
        router.push("/admin/login")
        return
      }
      handleSignOut()
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log("🔧 login: Starting login process for:", email)
    setIsLoading(true)
    
    try {
      console.log("🔧 login: Calling Supabase signInWithPassword...")
      const startTime = performance.now()
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      const endTime = performance.now()
      console.log(`🔧 login: signInWithPassword took ${endTime - startTime}ms`)

      if (error) {
        console.error("❌ login: Authentication error:", error)
        console.error("❌ login: Error details:", {
          code: error.code,
          message: error.message
        })
        setIsLoading(false)
        return false
      }

      if (!data.user) {
        console.error("❌ login: No user returned from authentication")
        setIsLoading(false)
        return false
      }

      console.log("✅ login: Authentication successful for:", data.user.email)
      await checkAdminAccess(data.user)
      return true
    } catch (error) {
      console.error("❌ login: Unexpected error:", error)
      setIsLoading(false)
      return false
    }
  }

  const loginWithMagicLink = async (email: string): Promise<boolean> => {
    console.log("🔧 loginWithMagicLink: Starting magic link for:", email)
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`
        }
      })

      if (error) {
        console.error("❌ loginWithMagicLink: Error:", error)
        return false
      }

      console.log("✅ loginWithMagicLink: Magic link sent to:", email)
      return true
    } catch (error) {
      console.error("❌ loginWithMagicLink: Unexpected error:", error)
      return false
    }
  }

  const handleSignOut = async () => {
    console.log("🔧 handleSignOut: Starting sign out process")
    
    try {
      await supabase.auth.signOut()
      setIsAuthenticated(false)
      setAdminSession(null)
      setIsLoading(false)
      router.push("/admin/login")
      console.log("✅ handleSignOut: Sign out completed")
    } catch (error) {
      console.error("❌ handleSignOut: Error:", error)
      setIsLoading(false)
    }
  }

  return {
    isAuthenticated,
    isLoading,
    adminSession,
    login,
    loginWithMagicLink,
    logout: handleSignOut
  }
} 