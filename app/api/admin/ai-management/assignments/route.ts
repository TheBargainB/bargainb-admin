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
    const { phone_number, assistant_id } = body

    if (!phone_number || !assistant_id) {
      return NextResponse.json({ 
        error: 'Phone number and assistant ID are required' 
      }, { status: 400 })
    }

    console.log('🔧 Creating assignment for:', phone_number, 'with assistant:', assistant_id)

    // Find the conversation by phone number using the correct field
    const phoneWithoutPlus = phone_number.replace('+', '')
    const remoteJid = `${phoneWithoutPlus}@s.whatsapp.net`
    
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('id, remote_jid')
      .eq('remote_jid', remoteJid)
      .single()

    if (conversationError || !conversation) {
      console.error('❌ Conversation not found for remoteJid:', remoteJid, conversationError)
      return NextResponse.json({ 
        error: 'Conversation not found for this contact' 
      }, { status: 404 })
    }

    // Check if assignment already exists
    const { data: existingAssignment } = await supabase
      .from('conversations')
      .select('ai_assistant_id')
      .eq('id', conversation.id)
      .single()

    if (existingAssignment?.ai_assistant_id) {
      return NextResponse.json({ 
        error: 'This contact already has an assistant assigned' 
      }, { status: 409 })
    }

    // Update the conversation with the assistant assignment
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ 
        ai_assistant_id: assistant_id,
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
      contact_name: phone_number,
      assistant_id
    })

  } catch (error) {
    console.error('Error in assignment creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 