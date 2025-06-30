"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useAdminAuth } from "@/hooks/useAdminAuth"
import { EyeIcon, EyeOffIcon, MailIcon } from "lucide-react"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const { login, loginWithMagicLink, isAuthenticated, isLoading: authLoading } = useAdminAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/admin")
    }
  }, [isAuthenticated, authLoading, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const success = await login(email, password)
      
      if (success) {
        router.push("/admin")
      } else {
        setError("Invalid email or password, or you don't have admin access.")
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.")
      console.error("Login error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async () => {
    setError("")
    setLoading(true)

    try {
      const success = await loginWithMagicLink(email)
      
      if (success) {
        setMagicLinkSent(true)
      } else {
        setError("Failed to send magic link. Please try again.")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error("Magic link error:", err)
    } finally {
      setLoading(false)
    }
  }

  // Show loading state during auth check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>
            Sign in to access the BargainB admin panel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {magicLinkSent ? (
            <Alert>
              <MailIcon className="h-4 w-4" />
              <AlertDescription>
                Magic link sent to {email}! Check your email and click the link to sign in.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@bargainb.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleMagicLink}
                disabled={loading || !email}
              >
                <MailIcon className="mr-2 h-4 w-4" />
                Send Magic Link
              </Button>

              {!email && (
                <p className="text-xs text-muted-foreground text-center">
                  Enter your email address to use magic link
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 