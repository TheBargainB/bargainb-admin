import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { conversationId } = params
    
    if (!conversationId) {
      return NextResponse.json({
        success: false,
        error: 'Conversation ID is required'
      }, { status: 400 })
    }
    
    console.log('📋 Getting contact info for conversation:', conversationId)
    
    // Get conversation with associated WhatsApp contact
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select(`
        id,
        whatsapp_contact_id,
        whatsapp_contacts (
          id,
          phone_number,
          whatsapp_jid,
          push_name,
          display_name,
          profile_picture_url,
          verified_name,
          whatsapp_status,
          is_business_account,
          last_seen_at,
          created_at,
          updated_at
        )
      `)
      .eq('id', conversationId)
      .single()
    
    if (error) {
      console.error('❌ Error fetching conversation contact:', error)
      return NextResponse.json({
        success: false,
        error: 'Conversation not found',
        details: error.message
      }, { status: 404 })
    }
    
    const contact = conversation.whatsapp_contacts
    
    if (!contact) {
      return NextResponse.json({
        success: false,
        error: 'No contact associated with this conversation'
      }, { status: 404 })
    }
    
    console.log('✅ Found contact info:', contact.phone_number)
    
    return NextResponse.json({
      success: true,
      data: {
        id: contact.id,
        phone_number: contact.phone_number,
        whatsapp_jid: contact.whatsapp_jid,
        push_name: contact.push_name,
        display_name: contact.display_name,
        profile_picture_url: contact.profile_picture_url,
        verified_name: contact.verified_name,
        whatsapp_status: contact.whatsapp_status,
        is_business_account: contact.is_business_account,
        last_seen_at: contact.last_seen_at,
        created_at: contact.created_at,
        updated_at: contact.updated_at
      }
    })
    
  } catch (error) {
    console.error('❌ Error getting contact info:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get contact information',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 