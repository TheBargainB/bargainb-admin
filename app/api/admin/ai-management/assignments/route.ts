import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data: assignments, error } = await supabase
      .from('conversation_assistants')
      .select('*')
      .order('assistant_created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user assignments:', error)
      return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
    }

    return NextResponse.json(assignments || [])
  } catch (error) {
    console.error('Error in assignments API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone_number, assistant_id, force_update = false } = body

    if (!phone_number || !assistant_id) {
      return NextResponse.json({ 
        error: 'Phone number and assistant ID are required' 
      }, { status: 400 })
    }

    console.log('🔧 Creating assignment for:', phone_number, 'with assistant:', assistant_id, force_update ? '(FORCE UPDATE)' : '')

    // Find the WhatsApp contact by phone number
    const phoneWithoutPlus = phone_number.replace('+', '')
    console.log('🔍 Looking for contact with phone:', phoneWithoutPlus)
    
    const { data: contact, error: contactError } = await supabase
      .from('whatsapp_contacts')
      .select('id, phone_number, display_name, push_name')
      .eq('phone_number', phoneWithoutPlus)
      .single()

    if (contactError || !contact) {
      console.error('❌ Contact not found for phone:', phoneWithoutPlus, 'Error:', contactError)
      return NextResponse.json({ 
        error: `WhatsApp contact not found for phone: ${phoneWithoutPlus}` 
      }, { status: 404 })
    }

    console.log('✅ Found contact:', contact.id, contact.display_name || contact.push_name)

    // Find the conversation for this contact
    console.log('🔍 Looking for conversation with whatsapp_contact_id:', contact.id)
    
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('id, assistant_id, whatsapp_contact_id')
      .eq('whatsapp_contact_id', contact.id)
      .single()

    if (conversationError || !conversation) {
      console.error('❌ Conversation not found for contact ID:', contact.id, 'Error:', conversationError)
      
      // Let's also try to find ANY conversation for debugging
      const { data: allConversations } = await supabase
        .from('conversations')
        .select('id, whatsapp_contact_id')
        .limit(5)
      
      console.log('🔍 Sample conversations in database:', allConversations)
      
      return NextResponse.json({ 
        error: `Conversation not found for contact: ${contact.id}` 
      }, { status: 404 })
    }

    console.log('✅ Found conversation:', conversation.id, 'for contact:', contact.id)

    // Check if assignment already exists (unless force_update is true)
    if (conversation.assistant_id && !force_update) {
      return NextResponse.json({ 
        error: 'This contact already has an assistant assigned. Use force_update=true to overwrite.' 
      }, { status: 409 })
    }

    if (conversation.assistant_id && force_update) {
      console.log('🔄 Force updating existing assignment from:', conversation.assistant_id, 'to:', assistant_id)
    }

    // Update the conversation with the assistant assignment
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ 
        assistant_id: assistant_id,
        assistant_created_at: new Date().toISOString(),
        ai_enabled: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversation.id)

    if (updateError) {
      console.error('❌ Error updating conversation:', updateError)
      return NextResponse.json({ 
        error: 'Failed to assign assistant' 
      }, { status: 500 })
    }

    console.log('✅ Assignment created successfully')

    return NextResponse.json({ 
      success: true,
      message: 'Assistant assigned successfully',
      conversation_id: conversation.id,
      contact_name: contact.display_name || contact.push_name || phone_number,
      assistant_id
    })

  } catch (error) {
    console.error('Error in assignment creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 