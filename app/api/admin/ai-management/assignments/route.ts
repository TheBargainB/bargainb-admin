import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const BB_AGENT_URL = 'https://agent-bb-cad80ee101cc572f9a46a59272c39cf5.us.langgraph.app'
const LANGSMITH_API_KEY = process.env.LANGSMITH_API_KEY

export async function GET() {
  try {
    const { data: assignments, error } = await supabaseAdmin
      .from('conversations')
      .select(`
        id, 
        assistant_id, 
        assistant_name, 
        assistant_config, 
        assistant_metadata,
        assistant_created_at,
        whatsapp_contact_id,
        whatsapp_contacts!inner(
          phone_number,
          display_name,
          push_name
        )
      `)
      .not('assistant_id', 'is', null)

    if (error) {
      console.error('Error fetching user assignments:', error)
      return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
    }

    // Map the data to match the frontend interface
    const mappedAssignments = assignments?.map(assignment => ({
      conversation_id: assignment.id,
      assistant_id: assignment.assistant_id,
      assistant_name: assignment.assistant_name,
      phone_number: assignment.whatsapp_contacts.phone_number,
      display_name: assignment.whatsapp_contacts.display_name || assignment.whatsapp_contacts.push_name,
      assistant_created_at: assignment.assistant_created_at,
      conversation_created_at: assignment.assistant_created_at, // Using same date for now
      assistant_config: assignment.assistant_config,
      assistant_metadata: assignment.assistant_metadata || {}
    })) || []

    return NextResponse.json(mappedAssignments)
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
    
    const { data: contact, error: contactError } = await supabaseAdmin
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

    // Find or create the conversation for this contact
    console.log('🔍 Looking for conversation with whatsapp_contact_id:', contact.id)
    
    let { data: conversation, error: conversationError } = await supabaseAdmin
      .from('conversations')
      .select('id, assistant_id, whatsapp_contact_id')
      .eq('whatsapp_contact_id', contact.id)
      .single()

    // If no conversation exists, create one
    if (conversationError || !conversation) {
      console.log('🆕 No conversation found, creating new conversation for contact:', contact.id)
      
      const { data: newConversation, error: createError } = await supabaseAdmin
        .from('conversations')
        .insert({
          whatsapp_contact_id: contact.id,
          whatsapp_conversation_id: `${contact.phone_number}@c.us`, // Required WhatsApp conversation ID
          ai_enabled: false, // Will be set to true when assistant is assigned
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id, assistant_id, whatsapp_contact_id')
        .single()

      if (createError || !newConversation) {
        console.error('❌ Failed to create conversation for contact:', contact.id, 'Error:', createError)
        return NextResponse.json({ 
          error: `Failed to create conversation for contact: ${contact.id}` 
        }, { status: 500 })
      }

      conversation = newConversation
      console.log('✅ Created new conversation:', conversation.id, 'for contact:', contact.id)
    } else {
      console.log('✅ Found existing conversation:', conversation.id, 'for contact:', contact.id)
    }

    // Check if assignment already exists (unless force_update is true)
    if (conversation.assistant_id && !force_update) {
      return NextResponse.json({ 
        error: 'This contact already has an assistant assigned. Use force_update=true to overwrite.' 
      }, { status: 409 })
    }

    if (conversation.assistant_id && force_update) {
      console.log('🔄 Force updating existing assignment from:', conversation.assistant_id, 'to:', assistant_id)
    }

    // 🆕 FETCH ASSISTANT CONFIGURATION FROM BB AGENT API
    console.log('🤖 Fetching assistant configuration from BB Agent...')
    let assistantConfig = {}
    let assistantMetadata = {}
    let assistantName = 'Unknown Assistant'
    
    try {
      if (!LANGSMITH_API_KEY) {
        console.warn('⚠️ BB Agent API key not configured, skipping assistant configuration fetch')
      } else {
        const bbAgentResponse = await fetch(`${BB_AGENT_URL}/assistants/${assistant_id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': LANGSMITH_API_KEY
          }
        })

        if (bbAgentResponse.ok) {
          const assistantData = await bbAgentResponse.json()
          console.log('✅ Retrieved assistant configuration:', assistantData.name)
          
          assistantConfig = assistantData.config || {}
          assistantMetadata = assistantData.metadata || {}
          assistantName = assistantData.name || 'Unknown Assistant'
          
          // Log the configuration for debugging
          console.log('🔍 Assistant config:', JSON.stringify(assistantConfig, null, 2))
        } else {
          console.warn('⚠️ Failed to fetch assistant configuration from BB Agent:', bbAgentResponse.status)
          // Continue with empty config rather than failing the assignment
        }
      }
    } catch (error) {
      console.warn('⚠️ Error fetching assistant configuration:', error)
      // Continue with empty config rather than failing the assignment
    }

    // Update the conversation with the assistant assignment AND configuration
    const { error: updateError } = await supabaseAdmin
      .from('conversations')
      .update({ 
        assistant_id: assistant_id,
        assistant_name: assistantName,
        assistant_config: assistantConfig,
        assistant_metadata: assistantMetadata,
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

    console.log('✅ Assignment created successfully with full configuration')

    return NextResponse.json({ 
      success: true,
      message: 'Assistant assigned successfully',
      conversation_id: conversation.id,
      contact_name: contact.display_name || contact.push_name || phone_number,
      assistant_id,
      assistant_name: assistantName,
      config_stored: Object.keys(assistantConfig).length > 0
    })

  } catch (error) {
    console.error('Error in assignment creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversation_id, new_assistant_id } = body

    if (!conversation_id || !new_assistant_id) {
      return NextResponse.json({ 
        error: 'Conversation ID and new assistant ID are required' 
      }, { status: 400 })
    }

    console.log('🔄 Updating assignment for conversation:', conversation_id, 'to assistant:', new_assistant_id)

    // 🆕 FETCH ASSISTANT CONFIGURATION FROM BB AGENT API
    console.log('🤖 Fetching assistant configuration from BB Agent...')
    let assistantConfig = {}
    let assistantMetadata = {}
    let assistantName = 'Unknown Assistant'
    
    try {
      if (!LANGSMITH_API_KEY) {
        console.warn('⚠️ BB Agent API key not configured, skipping assistant configuration fetch')
      } else {
        const bbAgentResponse = await fetch(`${BB_AGENT_URL}/assistants/${new_assistant_id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': LANGSMITH_API_KEY
          }
        })

        if (bbAgentResponse.ok) {
          const assistantData = await bbAgentResponse.json()
          console.log('✅ Retrieved assistant configuration:', assistantData.name)
          
          assistantConfig = assistantData.config || {}
          assistantMetadata = assistantData.metadata || {}
          assistantName = assistantData.name || 'Unknown Assistant'
          
          // Log the configuration for debugging
          console.log('🔍 Assistant config:', JSON.stringify(assistantConfig, null, 2))
        } else {
          console.warn('⚠️ Failed to fetch assistant configuration from BB Agent:', bbAgentResponse.status)
          // Continue with empty config rather than failing the assignment
        }
      }
    } catch (error) {
      console.warn('⚠️ Error fetching assistant configuration:', error)
      // Continue with empty config rather than failing the assignment
    }

    // Update the conversation with the new assistant assignment AND configuration
    const { error: updateError } = await supabaseAdmin
      .from('conversations')
      .update({ 
        assistant_id: new_assistant_id,
        assistant_name: assistantName,
        assistant_config: assistantConfig,
        assistant_metadata: assistantMetadata,
        assistant_created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', conversation_id)

    if (updateError) {
      console.error('❌ Error updating assignment:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update assignment' 
      }, { status: 500 })
    }

    console.log('✅ Assignment updated successfully with full configuration')

    return NextResponse.json({ 
      success: true,
      message: 'Assignment updated successfully',
      conversation_id,
      new_assistant_id,
      assistant_name: assistantName,
      config_stored: Object.keys(assistantConfig).length > 0
    })

  } catch (error) {
    console.error('Error in assignment update:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversation_id } = body

    if (!conversation_id) {
      return NextResponse.json({ 
        error: 'Conversation ID is required' 
      }, { status: 400 })
    }

    console.log('🗑️ Removing assignment for conversation:', conversation_id)

    // Remove the assistant assignment from the conversation
    const { error: updateError } = await supabaseAdmin
      .from('conversations')
      .update({ 
        assistant_id: null,
        assistant_created_at: null,
        ai_enabled: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversation_id)

    if (updateError) {
      console.error('❌ Error removing assignment:', updateError)
      return NextResponse.json({ 
        error: 'Failed to remove assignment' 
      }, { status: 500 })
    }

    console.log('✅ Assignment removed successfully')

    return NextResponse.json({ 
      success: true,
      message: 'Assignment removed successfully',
      conversation_id
    })

  } catch (error) {
    console.error('Error in assignment deletion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 