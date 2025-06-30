import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      nodeEnv: process.env.NODE_ENV,
      serviceKeyPreview: process.env.SUPABASE_SERVICE_ROLE_KEY 
        ? `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...` 
        : 'NOT_FOUND'
    }

    console.log('🔍 Environment Variables Check:', envCheck)

    return NextResponse.json({
      success: true,
      environment: envCheck,
      message: 'Environment check complete'
    })

  } catch (error) {
    console.error('Error checking environment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check environment' },
      { status: 500 }
    )
  }
} 