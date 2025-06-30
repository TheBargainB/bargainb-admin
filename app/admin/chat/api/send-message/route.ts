import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  const body = await req.json();
  const { to, text, conversationId } = body;

  if (!to || !text) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const apiKey = process.env.WASENDER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 500 });
  }

  try {
    // Clean the phone number for WhatsApp API
    let cleanPhoneNumber = to;
    if (to.includes('@s.whatsapp.net')) {
      cleanPhoneNumber = to.replace('@s.whatsapp.net', '');
    }
    
    console.log('🚀 Sending message to:', cleanPhoneNumber, 'Original:', to);

    const apiRes = await fetch('https://www.wasenderapi.com/api/send-message', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        to: cleanPhoneNumber, // Send clean phone number to API
        text 
      }),
    });

    if (!apiRes.ok) {
      const errorData = await apiRes.json();
      console.error('API error:', errorData);
      return NextResponse.json({ error: errorData.message || 'Failed to send message' }, { status: apiRes.status });
    }

    const apiData = await apiRes.json();
    console.log('✅ Message sent successfully:', apiData);

    // Store the sent message in the new CRM database structure
    if (conversationId) {
      const now = new Date().toISOString();
      
      // Generate a unique WhatsApp message ID for tracking
      const whatsappMessageId = apiData.data?.msgId?.toString() || `out_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Store the outbound message in the messages table
        const { error: messageError } = await supabaseAdmin
        .from('messages')
          .insert({
            conversation_id: conversationId,
          whatsapp_message_id: whatsappMessageId,
            content: text,
          message_type: 'text',
          direction: 'outbound',
          from_me: true,
          whatsapp_status: 'sent',
          raw_message_data: {
            whatsapp_message_id: whatsappMessageId,
            api_response: apiData,
            sent_by: 'admin',
            original_phone: cleanPhoneNumber,
            api_timestamp: now
            }
          });

        if (messageError) {
        console.error('❌ Error storing message in new structure:', messageError);
        } else {
        console.log('✅ Message stored in new CRM structure');
        }

      // Update conversation stats manually
      const { data: currentConversation } = await supabaseAdmin
        .from('conversations')
        .select('total_messages')
        .eq('id', conversationId)
        .single();

      if (currentConversation) {
        const newTotalMessages = (currentConversation.total_messages || 0) + 1;

        const { error: statsError } = await supabaseAdmin
          .from('conversations')
          .update({
            total_messages: newTotalMessages,
            last_message_at: now,
            updated_at: now
          })
          .eq('id', conversationId);

        if (statsError) {
          console.warn('⚠️ Error updating conversation stats:', statsError);
        } else {
          console.log('✅ Conversation stats updated: total_messages =', newTotalMessages);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully',
      apiResponse: apiData 
    });

  } catch (err) {
    console.error('Failed to send message:', err);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
} 