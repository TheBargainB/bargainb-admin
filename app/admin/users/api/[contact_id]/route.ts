import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { contact_id: string } }
) {
  try {
    const { contact_id } = params

    if (!contact_id) {
      return NextResponse.json(
        { success: false, error: 'Contact ID is required' },
        { status: 400 }
      )
    }

    console.log('🗑️ Deleting customer with ID:', contact_id)

    // Start a transaction to delete all related data
    // 1. Delete customer events
    const { error: eventsError } = await (supabaseAdmin as any)
      .from('customer_events')
      .delete()
      .eq('contact_id', contact_id)

    if (eventsError) {
      console.error('Error deleting customer events:', eventsError)
      throw new Error('Failed to delete customer events')
    }

    // 2. Delete grocery lists
    const { error: groceryError } = await (supabaseAdmin as any)
      .from('grocery_lists')
      .delete()
      .eq('contact_id', contact_id)

    if (groceryError) {
      console.error('Error deleting grocery lists:', groceryError)
      throw new Error('Failed to delete grocery lists')
    }

    // 3. Delete messages related to conversations with this contact
    const { data: conversations, error: conversationsError } = await (supabaseAdmin as any)
      .from('conversations')
      .select('id')
      .eq('contact_id', contact_id)

    if (conversationsError) {
      console.error('Error fetching conversations:', conversationsError)
      throw new Error('Failed to fetch conversations')
    }

    if (conversations && conversations.length > 0) {
      const conversationIds = conversations.map((c: any) => c.id)
      
      // Delete messages for these conversations
      const { error: messagesError } = await (supabaseAdmin as any)
        .from('messages')
        .delete()
        .in('conversation_id', conversationIds)

      if (messagesError) {
        console.error('Error deleting messages:', messagesError)
        throw new Error('Failed to delete messages')
      }

      // Delete conversations
      const { error: deleteConversationsError } = await (supabaseAdmin as any)
        .from('conversations')
        .delete()
        .eq('contact_id', contact_id)

      if (deleteConversationsError) {
        console.error('Error deleting conversations:', deleteConversationsError)
        throw new Error('Failed to delete conversations')
      }
    }

    // 4. Delete CRM profile
    const { error: crmError } = await (supabaseAdmin as any)
      .from('crm_profiles')
      .delete()
      .eq('id', contact_id)

    if (crmError) {
      console.error('Error deleting CRM profile:', crmError)
      throw new Error('Failed to delete CRM profile')
    }

    // 5. Finally, delete the WhatsApp contact
    const { error: contactError } = await (supabaseAdmin as any)
      .from('whatsapp_contacts')
      .delete()
      .eq('id', contact_id)

    if (contactError) {
      console.error('Error deleting WhatsApp contact:', contactError)
      throw new Error('Failed to delete WhatsApp contact')
    }

    console.log('✅ Successfully deleted customer and all related data')

    return NextResponse.json({
      success: true,
      message: 'Customer and all related data have been permanently deleted'
    })

  } catch (error) {
    console.error('❌ Error deleting customer:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete customer' 
      },
      { status: 500 }
    )
  }
} 