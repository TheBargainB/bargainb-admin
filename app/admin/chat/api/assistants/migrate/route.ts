import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { sql } = await request.json()

    if (!sql) {
      return NextResponse.json(
        { success: false, error: 'SQL query is required' },
        { status: 400 }
      )
    }

    // For security, we'll only allow specific migration queries
    // Remove the exec_sql RPC call as it's not available in the current database schema
    return NextResponse.json(
      { success: false, error: 'Migration functionality is disabled for security' },
      { status: 403 }
    )

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { success: false, error: 'Migration failed' },
      { status: 500 }
    )
  }
}

// GET endpoint to check migration status
export async function GET() {
  try {
    console.log('🔍 Checking migration status...')
    
    // Check if new columns exist
    const { data, error } = await supabaseAdmin
      .from('conversations')
      .select('assistant_id, assistant_created_at, assistant_config, assistant_name, assistant_metadata')
      .limit(1)
    
    if (error) {
      console.log('❌ Migration not yet applied:', error.message)
      return NextResponse.json({
        migrated: false,
        reason: 'Columns do not exist',
        error: error.message
      })
    }
    
    // Check if any conversations have assistants
    const { data: assistantCount, error: countError } = await supabaseAdmin
      .from('conversations')
      .select('assistant_id', { count: 'exact' })
      .not('assistant_id', 'is', null)
    
    console.log('✅ Migration status checked successfully')
    
    return NextResponse.json({
      migrated: true,
      assistant_columns_exist: true,
      conversations_with_assistants: assistantCount?.length || 0,
      ready_for_per_user_assistants: true
    })
    
  } catch (error) {
    console.error('❌ Error checking migration status:', error)
    
    return NextResponse.json({
      migrated: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 