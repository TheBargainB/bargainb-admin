import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔧 Testing Supabase connection...')
    
    // Test 1: Check if Supabase is initialized
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not initialized' }, { status: 500 })
    }
    
    // Test 2: Check session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      return NextResponse.json({ 
        error: 'Session error', 
        details: sessionError.message 
      }, { status: 500 })
    }
    
    // Test 3: Check admin users table
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .limit(5)
    
    if (adminError) {
      return NextResponse.json({ 
        error: 'Admin users query error', 
        details: adminError.message 
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      session: session ? {
        user: session.user.email,
        id: session.user.id
      } : null,
      adminUsers: adminUsers?.length || 0,
      adminUsersData: adminUsers
    })
    
  } catch (error) {
    console.error('❌ Test auth error:', error)
    return NextResponse.json({ 
      error: 'Unexpected error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
} 