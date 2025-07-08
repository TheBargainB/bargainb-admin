'use client'

import { login } from './actions'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSearchParams } from 'next/navigation'
import { BargainBLogo } from '@/components/bargainb-logo'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[350px]">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-40 mb-4">
            <BargainBLogo />
          </div>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the admin panel</CardDescription>
        </CardHeader>
        <form>
          <CardContent className="space-y-4">
            {error === 'unauthorized' && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                You do not have permission to access the admin panel
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="Enter your email"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="Enter your password"
                required 
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              type="submit"
              formAction={login}
            >
              Sign In
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 