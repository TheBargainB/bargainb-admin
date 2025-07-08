import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AdminDashboardLayout from '@/components/admin-dashboard-layout'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: adminData, error: adminError } = await supabase
    .from('admin_users')
    .select('id, role')
    .eq('auth_user_id', data.user.id)
    .eq('is_active', true)
    .single()

  if (adminError || !adminData) {
    // If not an admin, sign out and redirect to login
    await supabase.auth.signOut()
    redirect('/login')
  }

  return <AdminDashboardLayout>{children}</AdminDashboardLayout>
}