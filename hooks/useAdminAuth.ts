"use client"

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AdminUser {
  id: string
  email: string
  role: string
  isAdmin: boolean
}

interface UseAdminAuthReturn {
  user: AdminUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

export const useAdminAuth = (): UseAdminAuthReturn => {
  console.log('🔑 SIMPLE AUTH: Hook initializing')
  
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check current auth state
  useEffect(() => {
    console.log('🔑 SIMPLE AUTH: Checking auth state')
    
    const checkAuth = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        console.log('🔑 SIMPLE AUTH: Auth user:', authUser?.email)
        
                 if (authUser?.email) {
           // Check if user is admin
           const { data: adminUser, error } = await supabase
             .from('admin_users')
             .select('*')
             .eq('email', authUser.email)
             .single()
          
          if (adminUser && !error) {
            console.log('🔑 SIMPLE AUTH: Admin user found:', adminUser.email)
            setUser({
              id: adminUser.id,
              email: adminUser.email,
              role: adminUser.role,
              isAdmin: true
            })
            setIsAuthenticated(true)
          } else {
            console.log('🔑 SIMPLE AUTH: Not an admin user')
            setUser(null)
            setIsAuthenticated(false)
          }
        } else {
          console.log('🔑 SIMPLE AUTH: No auth user')
          setUser(null)
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('🔑 SIMPLE AUTH: Error checking auth:', error)
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (email: string, password: string) => {
    console.log('🔑 SIMPLE AUTH: Attempting login for:', email)
    setIsLoading(true)
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        console.error('🔑 SIMPLE AUTH: Login error:', authError)
        setIsLoading(false)
        return { success: false, error: authError.message }
      }

             if (authData.user?.email) {
         // Check if user is admin
         const { data: adminUser, error } = await supabase
           .from('admin_users')
           .select('*')
           .eq('email', authData.user.email)
           .single()

        if (adminUser && !error) {
          console.log('🔑 SIMPLE AUTH: Login successful for admin:', adminUser.email)
          setUser({
            id: adminUser.id,
            email: adminUser.email,
            role: adminUser.role,
            isAdmin: true
          })
          setIsAuthenticated(true)
          setIsLoading(false)
          return { success: true }
        } else {
          console.log('🔑 SIMPLE AUTH: User not an admin')
          await supabase.auth.signOut()
          setIsLoading(false)
          return { success: false, error: 'Not authorized as admin' }
        }
      }

      setIsLoading(false)
      return { success: false, error: 'Login failed' }
    } catch (error) {
      console.error('🔑 SIMPLE AUTH: Login exception:', error)
      setIsLoading(false)
      return { success: false, error: 'Login failed' }
    }
  }

  // Logout function
  const logout = async () => {
    console.log('🔑 SIMPLE AUTH: Logging out')
    await supabase.auth.signOut()
    setUser(null)
    setIsAuthenticated(false)
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout
  }
} 