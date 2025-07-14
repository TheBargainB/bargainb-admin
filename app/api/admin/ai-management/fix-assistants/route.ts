import { NextRequest, NextResponse } from 'next/server'
import { 
  syncAllAssistantConfigurations, 
  fixAssistantToolAccess 
} from '@/lib/assistant-service'

export async function POST(request: NextRequest) {
  try {
    const { action, assistant_id } = await request.json()

    if (action === 'sync_all') {
      console.log('🔄 Starting assistant configuration sync...')
      const result = await syncAllAssistantConfigurations()
      
      return NextResponse.json({
        success: result.success,
        message: `Sync completed: ${result.updated} updated, ${result.failed} failed`,
        details: {
          updated: result.updated,
          failed: result.failed,
          errors: result.errors
        }
      })
    }

    if (action === 'fix_assistant' && assistant_id) {
      console.log('🔧 Fixing specific assistant:', assistant_id)
      const result = await fixAssistantToolAccess(assistant_id)
      
      return NextResponse.json({
        success: result.success,
        message: result.message
      })
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid action or missing parameters'
    }, { status: 400 })

  } catch (error) {
    console.error('❌ Error in fix assistants API:', error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Return status of all assistants
    const result = await syncAllAssistantConfigurations()
    
    return NextResponse.json({
      success: true,
      message: 'Assistant configuration check completed',
      details: {
        total_checked: result.updated + result.failed,
        needs_update: result.updated,
        failed: result.failed,
        errors: result.errors
      }
    })
  } catch (error) {
    console.error('❌ Error checking assistant configurations:', error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 