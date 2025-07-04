import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizePhoneNumber } from '../../lib/contact-service';

export async function GET(request: NextRequest) {
  try {
    // Fetch all active conversations with their WhatsApp contacts and last messages
    const { data: conversations, error } = await supabaseAdmin
      .from('conversations')
      .select(`
        id,
        title,
        description,
        status,
        created_at,
        last_message_at,
        total_messages,
        unread_count,
        ai_enabled,
        assistant_id,
        assistant_name,
        assistant_config,
        assistant_metadata,
        assistant_created_at,
        whatsapp_contacts (
          id,
          phone_number,
          whatsapp_jid,
          push_name,
          display_name,
          profile_picture_url,
          whatsapp_status,
          is_active
        )
      `)
      .eq('status', 'active')
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch conversations' 
      }, { status: 500 });
    }

    // For each conversation, get the last message details
    const conversationsWithDetails = await Promise.all(
      (conversations || []).map(async (conv) => {
        // Get the last message
        const { data: lastMessage } = await supabaseAdmin
          .from('messages')
          .select(`
            id,
            content,
            direction,
            created_at,
            whatsapp_message_id
          `)
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const contact = conv.whatsapp_contacts;
        if (!contact) {
          console.warn(`⚠️ Conversation ${conv.id} has no associated WhatsApp contact`);
          return null;
        }

        // Calculate display name priority: display_name > push_name > phone_number
        const displayName = contact.display_name || contact.push_name || contact.phone_number || 'Unknown';
        
        // Use whatsapp_jid or construct from phone number
        const remoteJid = contact.whatsapp_jid || `${contact.phone_number.replace('+', '')}@s.whatsapp.net`;

        // Use real unread count from conversation table
        const unreadCount = conv.unread_count || 0;

        console.log(`📊 Conversation ${conv.id}: unreadCount=${unreadCount}, user=${displayName}`)

        return {
          id: `${conv.id}`, // Use conversation ID as unique identifier
          remoteJid: remoteJid, // Keep remoteJid for API calls
          conversationId: conv.id, // Keep the actual conversation ID
          user: displayName,
          email: remoteJid,
          avatar: contact.profile_picture_url || '',
          lastMessage: lastMessage?.content || 'No messages yet',
          timestamp: lastMessage?.created_at ? new Date(lastMessage.created_at).toLocaleTimeString() : 'Never',
          status: conv.status === 'active' ? 'active' as const : 'resolved' as const,
          unread_count: unreadCount, // Matches database field and hook expectation
          type: 'whatsapp',
          aiConfidence: conv.ai_enabled ? 85 : 0, // Update based on actual AI status
          lastMessageAt: conv.last_message_at || conv.created_at,
          phoneNumber: contact.phone_number,
          // Assistant fields
          ai_enabled: conv.ai_enabled,
          assistant_id: conv.assistant_id,
          assistant_name: conv.assistant_name,
          assistant_config: conv.assistant_config,
          assistant_metadata: conv.assistant_metadata,
          assistant_created_at: conv.assistant_created_at
        };
      })
    );

    // Filter out null conversations (those without contacts)
    const validConversations = conversationsWithDetails.filter(conv => conv !== null);

    return NextResponse.json({
      success: true,
      data: {
        conversations: validConversations
      }
    });

  } catch (error) {
    console.error('Error in conversations API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contact, type = 'direct', title, description, ai_enabled = true } = body;

    if (!contact || !contact.phone_number) {
      return NextResponse.json({ 
        error: 'Contact phone number is required' 
      }, { status: 400 });
    }

    console.log('🔄 Creating conversation for contact:', contact);

    // Ensure the contact exists in whatsapp_contacts table
    let whatsappContact;
    const normalizedPhoneNumber = normalizePhoneNumber(contact.phone_number); // Normalize phone number format
    const { data: existingContact, error: contactFetchError } = await supabaseAdmin
      .from('whatsapp_contacts')
      .select('*')
      .eq('phone_number', normalizedPhoneNumber)
      .single();

    if (contactFetchError && contactFetchError.code !== 'PGRST116') {
      console.error('Error fetching WhatsApp contact:', contactFetchError);
      return NextResponse.json({ 
        error: 'Failed to fetch WhatsApp contact from CRM system' 
      }, { status: 500 });
    }

    if (existingContact) {
      console.log('📞 Found existing WhatsApp contact:', existingContact.id);
      whatsappContact = existingContact;
      
      // Update contact info if provided
      if (contact.name || contact.notify || contact.img_url) {
        const { data: updatedContact, error: updateError } = await supabaseAdmin
          .from('whatsapp_contacts')
          .update({
            push_name: contact.notify || existingContact.push_name,
            display_name: contact.name || contact.notify || existingContact.display_name,
            profile_picture_url: contact.img_url || existingContact.profile_picture_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingContact.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating WhatsApp contact:', updateError);
        } else {
          whatsappContact = updatedContact;
          console.log('📝 Updated WhatsApp contact info');
        }
      }
    } else {
      // Create new WhatsApp contact in CRM system
      console.log('🆕 Creating new WhatsApp contact in CRM system');
      const whatsappJid = contact.phone_number.includes('@') 
        ? contact.phone_number 
        : `${normalizedPhoneNumber}@s.whatsapp.net`;

      // Provide better fallbacks for contact data
      const contactName = contact.name || contact.notify || `Contact ${contact.phone_number}`;
      const pushName = contact.notify || contact.name || contact.phone_number;

      const { data: newContact, error: contactCreateError } = await supabaseAdmin
        .from('whatsapp_contacts')
        .insert({
          phone_number: normalizedPhoneNumber, // Use normalized phone number
          whatsapp_jid: whatsappJid,
          push_name: pushName,
          display_name: contactName,
          profile_picture_url: contact.img_url || null,
          whatsapp_status: 'available',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (contactCreateError) {
        console.error('Error creating WhatsApp contact:', contactCreateError);
        return NextResponse.json({ 
          error: `Failed to create WhatsApp contact in CRM system: ${contactCreateError.message}` 
        }, { status: 500 });
      }

      whatsappContact = newContact;
      console.log('✅ Created new WhatsApp contact:', whatsappContact.id);

      // Also create CRM profile for the new contact with better data
      try {
        const { error: crmProfileError } = await supabaseAdmin
          .from('crm_profiles')
          .insert({
            whatsapp_contact_id: whatsappContact.id, // Link to whatsapp_contacts
            full_name: contactName,
            preferred_name: pushName,
            lifecycle_stage: 'prospect',
            shopping_persona: null,
            preferred_stores: [],
            dietary_restrictions: [],
            engagement_status: 'active',
            engagement_score: 50,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (crmProfileError) {
          console.warn('⚠️ Could not create CRM profile for contact:', crmProfileError);
          // Don't fail the entire operation if CRM profile creation fails
        } else {
          console.log('✅ Created CRM profile for new contact');
        }
      } catch (error) {
        console.warn('⚠️ Error creating CRM profile:', error);
        // Don't fail the entire operation if CRM profile creation fails
      }
    }

    // Check if conversation already exists for this contact
    const { data: existingConversation, error: convFetchError } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .eq('whatsapp_contact_id', whatsappContact.id)
      .eq('status', 'active')
      .single();

    if (convFetchError && convFetchError.code !== 'PGRST116') {
      console.error('Error checking existing conversation:', convFetchError);
      return NextResponse.json({ 
        error: 'Failed to check existing conversation' 
      }, { status: 500 });
    }

    if (existingConversation) {
      console.log('📞 Conversation already exists:', existingConversation.id);
      return NextResponse.json({
        success: true,
        data: {
          conversation: existingConversation,
          contact: whatsappContact,
          message: 'Conversation already exists'
        }
      });
    }

    // Create new conversation
    const conversationTitle = title || whatsappContact.display_name || whatsappContact.push_name || whatsappContact.phone_number;
    
    // Generate a unique conversation ID for WhatsApp
    const whatsappConversationId = `${whatsappContact.id}_${Date.now()}`;
    
    const { data: newConversation, error: conversationError } = await supabaseAdmin
      .from('conversations')
      .insert({
        whatsapp_contact_id: whatsappContact.id,
        whatsapp_conversation_id: whatsappConversationId,
        title: conversationTitle,
        description: description || `WhatsApp conversation with ${conversationTitle}`,
        status: 'active',
        total_messages: 0,
        unread_count: 0,
        last_message_at: new Date().toISOString()
      })
      .select()
      .single();

    if (conversationError) {
      console.error('Error creating conversation:', conversationError);
      return NextResponse.json({ 
        error: 'Failed to create conversation' 
      }, { status: 500 });
    }

    console.log('✅ Created new conversation:', newConversation.id);

    return NextResponse.json({
      success: true,
      data: {
        conversation: newConversation,
        contact: whatsappContact
      }
    });

  } catch (error) {
    console.error('Error in conversation creation:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}