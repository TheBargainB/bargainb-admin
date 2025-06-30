import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const remoteJid = searchParams.get('remoteJid');

    if (!conversationId && !remoteJid) {
      return NextResponse.json({ 
        error: 'Either conversationId or remoteJid is required' 
      }, { status: 400 });
    }

    let finalConversationId = conversationId;

    // If remoteJid is provided, find the conversation ID
    if (!conversationId && remoteJid) {
      // Extract phone number from JID
      const phoneNumber = remoteJid.split('@')[0];
      // Add + if missing for international format
      const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

      // Find the WhatsApp contact by phone number
      const { data: whatsappContact } = await supabase
        .from('whatsapp_contacts')
        .select('id')
        .eq('phone_number', formattedPhoneNumber)
        .single();

      if (!whatsappContact) {
        return NextResponse.json({ 
          success: true, 
          data: { messages: [] },
          message: 'No WhatsApp contact found for this phone number'
        });
      }

      // Find conversation by WhatsApp contact ID
      const { data: conversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('whatsapp_contact_id', whatsappContact.id)
        .eq('status', 'active')
        .single();

      if (!conversation) {
        return NextResponse.json({ 
          success: true, 
          data: { messages: [] },
          message: 'No conversation found for this contact'
        });
      }

      finalConversationId = conversation.id;
    }

    if (!finalConversationId) {
      return NextResponse.json({ 
        error: 'Could not determine conversation ID' 
      }, { status: 400 });
    }

    // Fetch messages for the conversation
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        direction,
        whatsapp_message_id,
        whatsapp_status,
        created_at,
        raw_message_data
      `)
      .eq('conversation_id', finalConversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch messages' 
      }, { status: 500 });
    }

    // Get the conversation details for contact info
    const { data: conversation } = await supabase
      .from('conversations')
      .select(`
        id,
        title,
        whatsapp_contacts (
          push_name,
          display_name,
          phone_number
        )
      `)
      .eq('id', finalConversationId)
      .single();

    const contact = conversation?.whatsapp_contacts;
    const contactName = contact?.display_name || contact?.push_name || contact?.phone_number || 'Unknown';

    // Format messages for the frontend
    const formattedMessages = (messages || []).map(msg => {
      // Determine sender type based on direction
      let senderType: 'user' | 'admin' | 'ai' = 'user'; // Default for customer messages
      let senderName = contactName;
      
      if (msg.direction === 'outbound') {
        // Messages sent by us (admin/business)
        senderType = 'admin';
        senderName = 'BargainB';
      } else if (msg.direction === 'inbound') {
        // Messages received from customer
        senderType = 'user';
        senderName = contactName;
      }
      
      // Check raw message data for AI generation indicators
      const rawData = msg.raw_message_data as any;
      if (rawData?.ai_generated || rawData?.from_ai) {
        senderType = 'ai';
        senderName = 'AI Assistant';
      }

      return {
        id: msg.id,
        content: msg.content || '',
        sender: senderType,
        senderName: senderName,
        timestamp: new Date(msg.created_at || new Date()).toLocaleTimeString(),
        confidence: rawData?.ai_confidence || undefined,
        status: msg.whatsapp_status || 'sent',
        metadata: rawData || {}
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        conversationId: finalConversationId,
        messages: formattedMessages
      }
    });

  } catch (error) {
    console.error('Error in messages API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 