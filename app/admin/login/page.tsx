"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

// **FRESH LOGIN PAGE EXECUTING!** - Brand new login page
export default function AdminLoginPage() {
  console.log("🔑 LOGIN PAGE: Starting execution")
  
  const router = useRouter()
  
  const [email, setEmail] = useState("yswessi@gmail.com")
  const [password, setPassword] = useState("abcd1234")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)
    
    console.log("🔑 LOGIN PAGE: Submitting login for:", email)

    try {
      // Simple login - no auth state management here
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (authError) {
        console.error("🔑 LOGIN PAGE: Login error:", authError)
        setError(authError.message)
        setIsSubmitting(false)
        return
      }

      if (authData.user?.email) {
        // Check if user is admin
        const { data: adminUser, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', authData.user.email)
          .single()

        if (adminUser && !error) {
          console.log("🔑 LOGIN PAGE: Login successful for admin:", adminUser.email)
          // Just redirect - let AdminLayout handle the auth state
          router.push("/admin")
        } else {
          console.log("🔑 LOGIN PAGE: User not an admin")
          await supabase.auth.signOut()
          setError("Not authorized as admin")
        }
      } else {
        setError("Login failed")
      }
    } catch (error) {
      console.error("🔑 LOGIN PAGE: Login exception:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🚀 BargainB Admin
            </h1>
            <p className="text-gray-600">
              Sign in to access the admin panel
            </p>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
                required
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !email || !password}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Debug Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <p className="text-xs text-gray-500 text-center">
              Debug: Login page loaded at {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 