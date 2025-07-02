import { NextRequest, NextResponse } from 'next/server'
import { deleteAssistant } from '@/lib/assistant-service'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { assistantId: string } }
) {
  try {
    const { assistantId } = params
    
    if (!assistantId) {
      return NextResponse.json({
        success: false,
        error: 'Assistant ID is required'
      }, { status: 400 })
    }
    
    console.log('🗑️ Deleting assistant:', assistantId)
    
    const success = await deleteAssistant(assistantId)
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Assistant deleted successfully'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to delete assistant'
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('❌ Error deleting assistant:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to delete assistant',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 