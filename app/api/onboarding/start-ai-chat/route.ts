import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getContactByPhone } from '@/actions/chat-v2/contacts.actions'

export async function POST(request: NextRequest) {
  try {
    const { phone: rawPhone } = await request.json()

    if (!rawPhone) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      )
    }

    console.log('🔍 Looking up contact for phone:', rawPhone)
    
    // Use robust contact lookup function that handles multiple phone number variations
    const contact = await getContactByPhone(rawPhone)

    if (!contact) {
      console.error('❌ Contact not found for phone:', rawPhone)
      return NextResponse.json(
        { success: false, error: 'CRM profile not found' },
        { status: 404 }
      )
    }

    console.log('✅ Contact found:', contact.id, contact.display_name)

    const supabase = await createClient()
    const crmProfile = contact.crm_profile
    if (!crmProfile) {
      return NextResponse.json(
        { success: false, error: 'CRM profile not found' },
        { status: 404 }
      )
    }

    // Check if onboarding is completed
    if (!crmProfile.onboarding_completed) {
      return NextResponse.json(
        { success: false, error: 'Onboarding not completed yet' },
        { status: 400 }
      )
    }

    // Check if AI introduction already sent
    if (crmProfile.ai_introduction_sent) {
      return NextResponse.json(
        { success: true, message: 'AI introduction already sent' }
      )
    }

    // Check if assistant is created
    if (!crmProfile.assistant_id) {
      return NextResponse.json(
        { success: false, error: 'AI assistant not created yet' },
        { status: 400 }
      )
    }

    // Get or create conversation
    let conversation
    const { data: existingConversation, error: convError } = await supabase
      .from('conversations')
      .select('id, assistant_id')
      .eq('whatsapp_contact_id', contact.id)
      .single()

    if (existingConversation) {
      conversation = existingConversation
    } else {
      // Create new conversation
      const { data: newConversation, error: createConvError } = await supabase
        .from('conversations')
        .insert({
          whatsapp_contact_id: contact.id,
          assistant_id: crmProfile.assistant_id,
          ai_enabled: true,
          status: 'active',
          created_at: new Date().toISOString()
        })
        .select('id, assistant_id')
        .single()

      if (createConvError) {
        console.error('Error creating conversation:', createConvError)
        return NextResponse.json(
          { success: false, error: 'Failed to create conversation' },
          { status: 500 }
        )
      }
      conversation = newConversation
    }

    // Create user message that prompts AI introduction
    const userName = crmProfile.preferred_name || crmProfile.full_name || 'there'
    const userIntroMessage = `Hi, I'm ${userName}. Please introduce yourself and show me the latest deals.`
    
    const { data: introMessage, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        whatsapp_message_id: `intro_${Date.now()}`,
        content: userIntroMessage,
        message_type: 'text',
        from_me: true, // User message that prompts AI
        direction: 'outgoing',
        whatsapp_status: 'sent',
        topic: 'introduction',
        created_at: new Date().toISOString(),
        inserted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single()

    if (messageError) {
      console.error('Error creating introduction message:', messageError)
      return NextResponse.json(
        { success: false, error: 'Failed to create introduction message' },
        { status: 500 }
      )
    }

    // Call the AI service to process and respond to the introduction
    try {
      const aiResponse = await fetch(`${request.nextUrl.origin}/api/whatsapp/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: conversation.id,
          message: userIntroMessage,
          userId: contact.id,
          isIntroduction: true
        })
      })

      if (!aiResponse.ok) {
        console.error('AI processing failed for introduction')
      } else {
        console.log('✅ AI introduction processing initiated')
      }
    } catch (error) {
      console.error('Error calling AI service:', error)
      // Continue - don't fail the whole request if AI call fails
    }

    // Mark AI introduction as sent
    await supabase
      .from('crm_profiles')
      .update({
        ai_introduction_sent: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', crmProfile.id)

    console.log('✅ AI introduction completed for user:', contact.phone_number)

    return NextResponse.json({
      success: true,
      data: {
        conversation_id: conversation.id,
        message: 'AI introduction sent successfully'
      }
    })

  } catch (error) {
    console.error('Error in start-ai-chat route:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 