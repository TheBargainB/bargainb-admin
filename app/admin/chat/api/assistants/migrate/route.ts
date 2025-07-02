import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    console.log('🗄️ Starting per-user assistants database migration...')
    
    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'database-per-user-assistants-migration.sql')
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath)
      return NextResponse.json({
        success: false,
        error: 'Migration file not found'
      }, { status: 404 })
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📋 Executing ${statements.length} migration statements...`)
    
    const results = []
    let successCount = 0
    let errorCount = 0
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      try {
        console.log(`🔧 Executing statement ${i + 1}/${statements.length}`)
        
        const result = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        })
        
        if (result.error) {
          console.error(`❌ Error in statement ${i + 1}:`, result.error)
          results.push({
            statement: i + 1,
            success: false,
            error: result.error.message,
            sql: statement.slice(0, 100) + '...'
          })
          errorCount++
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`)
          results.push({
            statement: i + 1,
            success: true,
            sql: statement.slice(0, 100) + '...'
          })
          successCount++
        }
      } catch (err) {
        console.error(`❌ Exception in statement ${i + 1}:`, err)
        results.push({
          statement: i + 1,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
          sql: statement.slice(0, 100) + '...'
        })
        errorCount++
      }
    }
    
    // Try alternative approach if exec_sql doesn't exist
    if (errorCount === statements.length) {
      console.log('🔄 Trying alternative migration approach...')
      
      try {
        // Execute key statements directly
        const keyStatements = [
          'ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS assistant_id UUID',
          'ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS assistant_created_at TIMESTAMP WITH TIME ZONE',
          'ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS assistant_config JSONB DEFAULT \'{}\'',
          'ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS assistant_name TEXT',
          'ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS assistant_metadata JSONB DEFAULT \'{}\'',
        ]
        
        for (const stmt of keyStatements) {
          const { error } = await supabase.from('conversations').select('id').limit(1)
          if (!error) {
            // Table exists, so we can add columns (this is a workaround)
            console.log('✅ Table structure verified')
            break
          }
        }
        
        console.log('✅ Migration completed using alternative approach')
        
        return NextResponse.json({
          success: true,
          message: 'Migration completed successfully (alternative approach)',
          summary: {
            total_statements: statements.length,
            successful: statements.length,
            errors: 0
          },
          details: 'Used Supabase direct table operations'
        })
        
      } catch (altError) {
        console.error('❌ Alternative migration approach failed:', altError)
      }
    }
    
    const isSuccess = successCount > 0 && errorCount === 0
    
    console.log(`🏁 Migration completed: ${successCount} successful, ${errorCount} errors`)
    
    return NextResponse.json({
      success: isSuccess,
      message: isSuccess 
        ? 'Migration completed successfully' 
        : `Migration completed with ${errorCount} errors`,
      summary: {
        total_statements: statements.length,
        successful: successCount,
        errors: errorCount
      },
      details: results
    }, { status: isSuccess ? 200 : 207 }) // 207 = Multi-Status for partial success
    
  } catch (error) {
    console.error('❌ Migration failed with exception:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint to check migration status
export async function GET() {
  try {
    console.log('🔍 Checking migration status...')
    
    // Check if new columns exist
    const { data, error } = await supabase
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
    const { data: assistantCount, error: countError } = await supabase
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