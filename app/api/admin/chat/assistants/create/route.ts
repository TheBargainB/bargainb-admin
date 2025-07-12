import { NextRequest, NextResponse } from 'next/server'
import { createUserAssistant, AssistantConfig } from '@/lib/assistant-service'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('🤖 Creating personal assistant:', {
      conversationId: body.conversationId,
      contactName: body.contactName,
      phoneNumber: body.phoneNumber
    })

    // Validate required fields
    if (!body.conversationId || !body.phoneNumber) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: conversationId and phoneNumber'
      }, { status: 400 })
    }

    // Create personal assistant using the service
    const assistantId = await createUserAssistant(
      body.conversationId,
      body.phoneNumber,
      body.contactName || 'User',
      body.preferences as AssistantConfig['configurable'] || {}
    )

    console.log('✅ Personal assistant created successfully:', assistantId)

    return NextResponse.json({
      success: true,
      data: {
        assistant_id: assistantId,
        conversation_id: body.conversationId,
        phone_number: body.phoneNumber,
        contact_name: body.contactName || 'User'
      },
      message: 'Personal assistant created successfully'
    })

  } catch (error) {
    console.error('❌ Error creating personal assistant:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create personal assistant'
    }, { status: 500 })
  }
}

 