import { NextRequest, NextResponse } from 'next/server'
import { createUserAssistant, getOrCreateAssistantForConversation, AssistantConfig } from '@/lib/assistant-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversationId, phoneNumber, contactName, userPreferences } = body
    
    if (!conversationId || !phoneNumber) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: conversationId, phoneNumber'
      }, { status: 400 })
    }
    
    console.log('🤖 Creating assistant for conversation:', conversationId)
    
    const assistantId = await createUserAssistant(
      conversationId,
      phoneNumber,
      contactName,
      userPreferences as AssistantConfig['configurable']
    )
    
    return NextResponse.json({
      success: true,
      data: {
        assistant_id: assistantId,
        conversation_id: conversationId,
        phone_number: phoneNumber,
        contact_name: contactName
      }
    })
    
  } catch (error) {
    console.error('❌ Error creating assistant:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create assistant',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    
    if (!conversationId) {
      return NextResponse.json({
        success: false,
        error: 'Missing conversationId parameter'
      }, { status: 400 })
    }
    
    console.log('🔍 Getting or creating assistant for conversation:', conversationId)
    
    const assistantId = await getOrCreateAssistantForConversation(conversationId)
    
    return NextResponse.json({
      success: true,
      data: {
        assistant_id: assistantId,
        conversation_id: conversationId
      }
    })
    
  } catch (error) {
    console.error('❌ Error getting/creating assistant:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get/create assistant',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 