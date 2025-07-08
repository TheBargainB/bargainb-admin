'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <Button 
      variant="ghost" 
      size="icon"
      onClick={handleLogout}
      className="hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="Logout"
    >
      <LogOut className="h-5 w-5" />
    </Button>
  )
} 