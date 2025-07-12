import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Starting AI data cleanup...')
    
    // Clear all AI-related data from conversations table
    const { data: updatedConversations, error } = await supabase
      .from('conversations')
      .update({
        ai_enabled: false,
        ai_config: null,
        ai_thread_id: null,
        assistant_id: null,
        assistant_name: null,
        assistant_created_at: null,
        assistant_config: null,
        assistant_metadata: null
      })
      .not('ai_enabled', 'is', null) // Update rows that have any AI data
      .select('id, whatsapp_contact_id')
    
    if (error) {
      console.error('❌ Error clearing AI data:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to clear AI data',
        details: error.message
      }, { status: 500 })
    }
    
    console.log(`✅ Cleared AI data for ${updatedConversations?.length || 0} conversations`)
    
    return NextResponse.json({
      success: true,
      message: 'All AI data cleared successfully',
      data: {
        conversations_updated: updatedConversations?.length || 0,
        affected_conversations: updatedConversations?.map(c => ({ 
          id: c.id, 
          whatsapp_contact_id: c.whatsapp_contact_id 
        })) || []
      }
    })
    
  } catch (error) {
    console.error('❌ Error in AI cleanup:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to cleanup AI data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking current AI data status...')
    
    // Get count of conversations with AI enabled
    const { data: aiEnabledConversations, error } = await supabase
      .from('conversations')
      .select('id, whatsapp_contact_id, ai_enabled, assistant_id, assistant_name')
      .eq('ai_enabled', true)
    
    if (error) {
      console.error('❌ Error checking AI status:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to check AI status',
        details: error.message
      }, { status: 500 })
    }
    
    // Get count of conversations with assistants
    const { data: conversationsWithAssistants, error: assistantError } = await supabase
      .from('conversations')
      .select('id, whatsapp_contact_id, assistant_id, assistant_name')
      .not('assistant_id', 'is', null)
    
    if (assistantError) {
      console.error('❌ Error checking assistant status:', assistantError)
      return NextResponse.json({
        success: false,
        error: 'Failed to check assistant status',
        details: assistantError.message
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      data: {
        ai_enabled_conversations: aiEnabledConversations?.length || 0,
        conversations_with_assistants: conversationsWithAssistants?.length || 0,
        ai_enabled_details: aiEnabledConversations || [],
        assistant_details: conversationsWithAssistants || []
      }
    })
    
  } catch (error) {
    console.error('❌ Error checking AI cleanup status:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to check AI status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 