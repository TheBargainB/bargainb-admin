import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('📡 Fetching recent messages for notification dropdown');

    // Get recent conversations with unread messages, ordered by latest message
    const { data: conversations, error: convError } = await supabaseAdmin
      .from('conversations')
      .select(`
        id,
        whatsapp_contact_id,
        unread_count,
        last_message_at,
        updated_at,
        whatsapp_contacts (
          phone_number,
          display_name,
          push_name,
          profile_picture_url
        )
      `)
      .gt('unread_count', 0)
      .order('last_message_at', { ascending: false })
      .limit(10);

    if (convError) {
      console.error('❌ Error fetching conversations for notifications:', convError);
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }

    if (!conversations || conversations.length === 0) {
      console.log('📭 No unread conversations found');
      return NextResponse.json({ 
        success: true,
        messages: []
      });
    }

    // Get the latest message for each conversation
    const messages = await Promise.all(
      conversations.map(async (conv) => {
        const { data: latestMessage, error: msgError } = await supabaseAdmin
          .from('messages')
          .select('id, content, created_at, sender_type')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (msgError || !latestMessage) {
          console.warn('⚠️ Could not fetch latest message for conversation:', conv.id);
          return null;
        }

        const contact = conv.whatsapp_contacts;
        const contactName = contact?.display_name || contact?.push_name || 'Unknown Contact';
        const phoneNumber = contact?.phone_number || '';

        return {
          id: latestMessage.id,
          conversation_id: conv.id,
          content: latestMessage.content || '',
          sender_name: latestMessage.sender_type === 'user' ? contactName : 'AI Assistant',
          sender_avatar: contact?.profile_picture_url || undefined,
          created_at: latestMessage.created_at,
          unread_count: conv.unread_count || 0,
          contact_name: contactName,
          phone_number: phoneNumber
        };
      })
    );

    // Filter out any null entries and sort by creation time
    const validMessages = messages
      .filter(msg => msg !== null)
      .sort((a, b) => {
        const dateA = a!.created_at ? new Date(a!.created_at).getTime() : 0;
        const dateB = b!.created_at ? new Date(b!.created_at).getTime() : 0;
        return dateB - dateA;
      });

    console.log(`✅ Found ${validMessages.length} recent messages for notifications`);

    return NextResponse.json({
      success: true,
      messages: validMessages
    });

  } catch (error) {
    console.error('❌ Error in recent-messages API:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 