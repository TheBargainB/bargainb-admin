"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Mail, Lock, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// **FRESH LOGIN PAGE EXECUTING!** - Brand new login page
export default function AdminLoginPage() {
  const { signIn, user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/admin')
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = await signIn(email, password)
      
      if (success) {
        router.push('/admin')
      } else {
        setError("Invalid credentials or not an admin user")
      }
    } catch (error) {
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center" role="status" aria-label="Loading">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't show login form if already authenticated
  if (!authLoading && user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center" role="status" aria-label="Redirecting">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Redirecting to admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 flex flex-col items-center pb-6">
          <div className="relative w-48 h-14">
            <Image
              src="/logo-darkmode.svg"
              alt="BargainB Admin"
              fill
              className="hidden dark:block object-contain"
              priority
            />
            <Image
              src="/logo.svg"
              alt="BargainB Admin"
              fill
              className="block dark:hidden object-contain"
              priority
            />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Welcome back! Please sign in to access the admin panel
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="off"
                  autoFocus
                  data-testid="email-input"
                  aria-label="Email Address"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="new-password"
                  data-testid="password-input"
                  aria-label="Password"
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="text-sm" role="alert">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
              data-testid="submit-button"
              aria-label={isLoading ? "Signing in..." : "Sign In"}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 