'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: authData, error: signInError } = await supabase.auth.signInWithPassword(data)

  if (signInError) {
    // TODO: Add proper error handling
    redirect('/error')
  }

  // Check if user is admin
  const { data: adminData, error: adminError } = await supabase
    .from('admin_users')
    .select('id, role')
    .eq('auth_user_id', authData.user.id)
    .eq('is_active', true)
    .single()

  if (adminError || !adminData) {
    // If not an admin, sign out
    await supabase.auth.signOut()
    redirect('/login?error=unauthorized')
  }

  revalidatePath('/admin', 'layout')
  redirect('/admin')
}

export async function signup(formData: FormData) {
  // Remove signup functionality for admin panel
  redirect('/login')
}