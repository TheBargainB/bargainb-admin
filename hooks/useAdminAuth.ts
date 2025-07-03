"use client"

import { useState, useEffect, useRef } from "react"
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
  const [initialCheckComplete, setInitialCheckComplete] = useState<boolean>(false)
  const router = useRouter()
  const hasCheckedSession = useRef(false)

  console.log("🔧 useAdminAuth: Hook initialized")

  // Check for existing session on mount - IMPROVED to prevent flash
  useEffect(() => {
    // Prevent duplicate session checks
    if (hasCheckedSession.current) {
      return
    }
    
    console.log("🔧 useAdminAuth: useEffect triggered - checking session")
    hasCheckedSession.current = true
    
    // Check session immediately without delay
    checkAuthSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔧 Auth state changed:", event)
        if (event === 'SIGNED_IN' && session?.user) {
          await checkAdminAccess(session.user)
        } else if (event === 'SIGNED_OUT') {
          handleSignOut()
        }
      }
    )

    return () => {
      subscription.unsubscribe()
      hasCheckedSession.current = false
    }
  }, [])

  const checkAuthSession = async () => {
    console.log("🔧 checkAuthSession: Starting session check")
    
    try {
      console.log("🔧 checkAuthSession: Getting current session from Supabase")
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error("❌ checkAuthSession: Session error:", sessionError)
        handleAuthFailure()
        return
      }

      if (!session?.user) {
        console.log("🔧 checkAuthSession: No session found")
        handleAuthFailure()
        return
      }

      console.log("🔧 checkAuthSession: Session found for user:", session.user.email)
      await checkAdminAccess(session.user)
    } catch (error) {
      console.error("❌ checkAuthSession: Unexpected error:", error)
      handleAuthFailure()
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
      
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 5000)
      )
      
      const result = await Promise.race([queryPromise, timeoutPromise])
      const { data: adminUser, error } = result as Awaited<typeof queryPromise>
      
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
        handleAuthFailure()
        return
      }

      if (!adminUser) {
        console.error("❌ checkAdminAccess: No admin user found for:", user.email)
        handleAuthFailure()
        return
      }

      console.log("✅ checkAdminAccess: Admin access confirmed for:", user.email, adminUser)
      setAdminSession({ user, adminUser: adminUser as AdminUser })
      setIsAuthenticated(true)
      setIsLoading(false)
      setInitialCheckComplete(true)
    } catch (error) {
      console.error("❌ checkAdminAccess: Unexpected error:", error)
      // If database query times out during session check, handle gracefully
      if (error instanceof Error && error.message === 'Database query timeout') {
        console.error("❌ Database query timed out during session check")
      }
      handleAuthFailure()
    }
  }

  // IMPROVED auth failure handling to prevent flash
  const handleAuthFailure = () => {
    setIsAuthenticated(false)
    setAdminSession(null)
    setIsLoading(false)
    setInitialCheckComplete(true)
    
    // Only redirect to login if we're not already there
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin/login')) {
      // Store current path to redirect back after login
      sessionStorage.setItem('intendedPath', window.location.pathname + window.location.search)
      // Use replace instead of push to prevent back button issues
      router.replace("/admin/login")
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
      
      // Redirect to intended destination or admin dashboard
      if (typeof window !== 'undefined') {
        const intendedPath = sessionStorage.getItem('intendedPath') || '/admin'
        sessionStorage.removeItem('intendedPath')
        router.replace(intendedPath)
      }
      
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
      // Get intended path or default to admin
      const intendedPath = sessionStorage.getItem('intendedPath') || '/admin'
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}${intendedPath}`
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
      setInitialCheckComplete(true)
      
      // Use replace to prevent back button issues
      router.replace("/admin/login")
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
    initialCheckComplete, // Add this to help with rendering decisions
    login,
    loginWithMagicLink,
    logout: handleSignOut
  }
} 