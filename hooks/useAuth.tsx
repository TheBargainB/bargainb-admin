"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAdmin: boolean | null
  signIn: (email: string, password: string) => Promise<boolean>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    let mounted = true

    // Get initial session and set up auth state listener
    const initialize = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (mounted) {
          setUser(session?.user ?? null)
          if (session?.user) {
            await checkAdminStatus(session.user.id)
          } else {
            setIsAdmin(false)
          }
          setIsLoading(false)
        }

        // Listen to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (mounted) {
              setUser(session?.user ?? null)
              if (session?.user) {
                await checkAdminStatus(session.user.id)
              } else {
                setIsAdmin(false)
              }
              setIsLoading(false)
            }
          }
        )

        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (mounted) {
          setUser(null)
          setIsAdmin(false)
          setIsLoading(false)
        }
      }
    }

    const checkAdminStatus = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('id, role')
          .eq('auth_user_id', userId)
          .eq('is_active', true)
          .single()

        if (mounted) {
          setIsAdmin(!!data && !error)
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
        if (mounted) {
          setIsAdmin(false)
        }
      }
    }

    initialize()

    return () => {
      mounted = false
    }
  }, [])

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('❌ Login failed:', error.message)
        return false
      }

      // Check if user has admin role in the database
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id, role, permissions')
        .eq('auth_user_id', data.user?.id)
        .eq('is_active', true)
        .single()

      if (adminError || !adminData) {
        await supabase.auth.signOut()
        console.error('❌ Not an admin user')
        return false
      }

      console.log('✅ Login successful for admin with role:', adminData.role)
      return true
    } catch (error) {
      console.error('❌ Login error:', error)
      return false
    }
  }

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut()
    setIsAdmin(false)
  }

  const value = {
    user,
    isLoading,
    isAdmin,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 