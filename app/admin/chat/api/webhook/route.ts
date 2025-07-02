import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

type Message = {
  id: string;
  fromMe: boolean;
  remoteJid: string;
  conversation: string;
  timestamp: number;
  status?: number;
};

type Contact = {
  jid: string;
  name?: string;
  notify?: string;
  status?: string;
};

type WhatsAppMessage = {
  id?: string;
  key?: {
    id?: string;
    fromMe?: boolean;
    remoteJid?: string;
  };
  messageTimestamp?: number | string;
  pushName?: string;
  message?: {
    conversation?: string;
    extendedTextMessage?: {
      text: string;
    };
  };
  remoteJid?: string;
  status?: number;
};

// Message status codes
enum MessageStatus {
  ERROR = 0,
  PENDING = 1,
  SENT = 2,
  DELIVERED = 3,
  READ = 4,
  PLAYED = 5,
}

// Helper function to get status name from status code
function getStatusName(status: number): string {
  switch (status) {
    case MessageStatus.ERROR: return 'error';
    case MessageStatus.PENDING: return 'pending';
    case MessageStatus.SENT: return 'sent';
    case MessageStatus.DELIVERED: return 'delivered';
    case MessageStatus.READ: return 'read';
    case MessageStatus.PLAYED: return 'played';
    default: return 'unknown';
  }
}

// Helper function to get or create WhatsApp contact in CRM system
async function getOrCreateWhatsAppContact(remoteJid: string, pushName?: string) {
  try {
    // Extract phone number from remoteJid
    const phoneNumber = remoteJid.replace('@s.whatsapp.net', '');
    const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

    // Try to find existing contact
    const { data: existingContact, error: fetchError } = await supabaseAdmin
      .from('whatsapp_contacts')
      .select('*')
      .eq('phone_number', formattedPhoneNumber)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Error fetching WhatsApp contact:', fetchError);
      throw fetchError;
    }

    if (existingContact) {
      console.log('✅ Found existing WhatsApp contact:', existingContact.id);
      
      // Update contact name if we have new information
      if (pushName && (!existingContact.push_name || !existingContact.display_name)) {
        const { data: updatedContact, error: updateError } = await supabaseAdmin
          .from('whatsapp_contacts')
          .update({
            push_name: pushName,
            display_name: pushName,
            last_seen_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingContact.id)
          .select()
          .single();

        if (updateError) {
          console.warn('⚠️ Could not update contact name:', updateError);
          return existingContact;
        } else {
          console.log('📝 Updated contact name to:', pushName);
          return updatedContact;
        }
      }
      
      return existingContact;
    }

    // Create new WhatsApp contact
    console.log('🆕 Creating new WhatsApp contact for:', formattedPhoneNumber);
    
    const { data: newContact, error: createError } = await supabaseAdmin
      .from('whatsapp_contacts')
      .insert({
        phone_number: formattedPhoneNumber,
        whatsapp_jid: remoteJid,
        push_name: pushName,
        display_name: pushName,
        whatsapp_status: 'available',
        is_active: true,
        last_seen_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating WhatsApp contact:', createError);
      throw createError;
    }

    console.log('✅ Created new WhatsApp contact:', newContact.id);

    // Also create CRM profile for the new contact
    try {
      const { error: crmProfileError } = await supabaseAdmin
        .from('crm_profiles')
        .insert({
          whatsapp_contact_id: newContact.id, // Link to whatsapp_contacts
          full_name: pushName,
          preferred_name: pushName,
          lifecycle_stage: 'prospect',
          shopping_persona: null,
          preferred_stores: [],
          dietary_restrictions: [],
          engagement_score: 50
        });

      if (crmProfileError) {
        console.warn('⚠️ Could not create CRM profile for contact:', crmProfileError);
      } else {
        console.log('✅ Created CRM profile for new contact');
      }
    } catch (error) {
      console.warn('⚠️ Error creating CRM profile:', error);
    }

    return newContact;
  } catch (error) {
    console.error('❌ Error in getOrCreateWhatsAppContact:', error);
    throw error;
  }
}

// Helper function to get or create conversation for contact
async function getOrCreateConversation(contactId: string, contactName: string, remoteJid: string) {
  try {
    // Try to find existing conversation
    const { data: existingConversation, error: fetchError } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('whatsapp_contact_id', contactId)
      .eq('status', 'active')
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Error fetching conversation:', fetchError);
      throw fetchError;
    }

    if (existingConversation) {
      console.log('✅ Found existing conversation:', existingConversation.id);
      return existingConversation;
    }

    // Create new conversation
    console.log('💬 Creating new conversation for contact:', contactId);
    
    // Generate a unique WhatsApp conversation ID from the remoteJid
    const whatsappConversationId = remoteJid.replace('@s.whatsapp.net', '') + '_conversation';
    
    const { data: newConversation, error: createError } = await supabaseAdmin
      .from('conversations')
      .insert({
        whatsapp_contact_id: contactId,
        whatsapp_conversation_id: whatsappConversationId,
        title: contactName || 'WhatsApp Chat',
        description: `WhatsApp conversation with ${contactName}`,
        status: 'active',
        conversation_type: 'customer_support',
        total_messages: 0,
        unread_count: 0,
        last_message_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating conversation:', createError);
      throw createError;
    }

    console.log('✅ Created new conversation:', newConversation.id);
    return newConversation;
  } catch (error) {
    console.error('❌ Error in getOrCreateConversation:', error);
    throw error;
  }
}

// Helper function to store message in CRM system
async function storeMessage(conversationId: string, content: string, direction: 'inbound' | 'outbound', metadata: any) {
  try {
    // Generate a unique WhatsApp message ID
    const whatsappMessageId = metadata.whatsapp_message_id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { data: newMessage, error: messageError } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: conversationId,
        whatsapp_message_id: whatsappMessageId,
        content: content,
        message_type: 'text',
        direction: direction,
        from_me: direction === 'outbound',
        whatsapp_status: direction === 'outbound' ? 'sent' : 'delivered',
        raw_message_data: metadata
      })
      .select()
      .single();

    if (messageError) {
      console.error('❌ Error storing message:', messageError);
      throw messageError;
    }

    // Update conversation stats - get current conversation first
    const { data: currentConversation } = await supabaseAdmin
      .from('conversations')
      .select('total_messages, unread_count')
      .eq('id', conversationId)
      .single();

    if (currentConversation) {
      const newTotalMessages = (currentConversation.total_messages || 0) + 1;
      const newUnreadCount = direction === 'inbound' 
        ? (currentConversation.unread_count || 0) + 1 
        : (currentConversation.unread_count || 0);

      const { error: updateError } = await supabaseAdmin
        .from('conversations')
        .update({
          total_messages: newTotalMessages,
          unread_count: newUnreadCount,
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (updateError) {
        console.warn('⚠️ Could not update conversation stats:', updateError);
      } else {
        console.log('✅ Updated conversation stats: messages =', newTotalMessages, ', unread =', newUnreadCount);
      }
    }

    console.log('✅ Message stored in CRM system:', newMessage.id);
    return newMessage;
  } catch (error) {
    console.error('❌ Error in storeMessage:', error);
    throw error;
  }
}

// In-memory storage
let messageStore = {
  messages: new Map<string, any>(),
  contacts: new Map<string, any>()
};

export async function GET(request: NextRequest) {
  try {
    console.log('📡 Webhook health check requested');
    
    return NextResponse.json({ 
      status: 'healthy',
      endpoint: '/admin/chat/api/webhook',
      supportedEvents: ['messages.upsert', 'messages.update'],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Webhook health check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature for WASender
    const signature = request.headers.get('x-webhook-signature');
    const webhookSecret = process.env.WASENDER_WEBHOOK_SECRET;
    
    // For now, we'll log the signature and allow requests without verification
    // TODO: Add proper signature verification once webhook secret is configured
    console.log('🔐 Webhook signature:', signature ? 'present' : 'missing');
    console.log('🔐 Webhook secret configured:', webhookSecret ? 'yes' : 'no');
    
    // If webhook secret is configured, verify signature
    if (webhookSecret && signature) {
      if (signature !== webhookSecret) {
        console.error('❌ Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
      console.log('✅ Webhook signature verified');
    } else if (webhookSecret && !signature) {
      console.error('❌ Missing webhook signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    } else {
      console.log('⚠️ Webhook verification skipped (no secret configured)');
    }

    const body = await request.json();
    console.log('📥 Webhook received:', JSON.stringify(body, null, 2));

    const { event, data } = body;
    console.log('🔍 Event:', event);
    console.log('🔍 Data structure:', JSON.stringify(data, null, 2));

    if (event === 'messages.upsert') {
      // Handle new or updated messages
      const message = data.messages[0]; // Get first message from array
      console.log('🔍 Message object:', JSON.stringify(message, null, 2));
      
      if (!message) {
        console.log('⚠️ No message found in payload');
        return NextResponse.json({ success: true, skipped: 'no_message' });
      }
      
      const { 
        key,
        message: messageContent, 
        messageTimestamp, 
        pushName
      } = message;

      // Extract from key object
      const { remoteJid, id: messageId, fromMe } = key;

      console.log('🔍 Extracted values:');
      console.log('  - remoteJid:', remoteJid);
      console.log('  - messageId:', messageId);
      console.log('  - messageTimestamp:', messageTimestamp);
      console.log('  - pushName:', pushName);
      console.log('  - fromMe:', fromMe);
      console.log('  - key object:', JSON.stringify(key, null, 2));
      console.log('  - messageContent object:', JSON.stringify(messageContent, null, 2));

      // Check if message is from us
      console.log('🔍 fromMe:', fromMe);
      
      console.log('📨 Processing message from:', remoteJid, fromMe ? '(sent by us)' : '(incoming)');

      // Get or create WhatsApp contact in CRM system
      const contact = await getOrCreateWhatsAppContact(remoteJid, pushName);
      const contactName = contact.display_name || contact.push_name || contact.phone_number;

      // Get or create conversation for this contact
      const conversation = await getOrCreateConversation(contact.id, contactName, remoteJid);

      // Extract message text from different formats
      let messageText = '';
      if (messageContent?.conversation) {
        messageText = messageContent.conversation;
      } else if (messageContent?.extendedTextMessage?.text) {
        messageText = messageContent.extendedTextMessage.text;
      } else {
        console.log('⚠️ Unknown message format:', messageContent);
        messageText = 'Unknown message format';
      }

      console.log('📝 Message text extracted:', messageText);

      // Prepare message metadata
      const messageMetadata = {
        whatsapp_message_id: messageId,
        whatsapp_timestamp: messageTimestamp,
        push_name: pushName,
        remote_jid: remoteJid,
        from_me: fromMe,
        key: key,
        original_message: messageContent
      };

      // Store message in CRM system
      const direction = fromMe ? 'outbound' : 'inbound';
      
      if (fromMe) {
        // Check if this outgoing message already exists (sent via send-message API)
        const messageTimestampMs = typeof messageTimestamp === 'object' && messageTimestamp !== null && 'low' in messageTimestamp
          ? messageTimestamp.low * 1000
          : (typeof messageTimestamp === 'number' ? messageTimestamp * 1000 : Date.now());
        
        const timestampStart = new Date(messageTimestampMs - 30000).toISOString(); // 30 seconds before
        const timestampEnd = new Date(messageTimestampMs + 30000).toISOString();   // 30 seconds after

        const { data: existingMessage } = await supabaseAdmin
          .from('messages')
          .select('id, raw_message_data')
          .eq('conversation_id', conversation.id)
          .eq('content', messageText)
          .eq('direction', 'outbound')
          .gte('created_at', timestampStart)
          .lte('created_at', timestampEnd)
          .single();

        if (existingMessage) {
          console.log('✅ Outgoing message already exists in CRM (sent via API), updating with WhatsApp message ID');
          
          // Update the existing message with the WhatsApp message ID
          const currentMetadata = (existingMessage.raw_message_data as Record<string, any>) || {};
          const updatedMetadata = {
            ...currentMetadata,
            whatsapp_message_id: messageId,
            whatsapp_timestamp: messageTimestamp,
            remote_jid: remoteJid,
            from_me: fromMe
          };

          const { error: updateError } = await supabaseAdmin
            .from('messages')
            .update({ 
              whatsapp_message_id: messageId,
              raw_message_data: updatedMetadata
            })
            .eq('id', existingMessage.id);

          if (updateError) {
            console.error('❌ Error updating message with WhatsApp ID:', updateError);
          } else {
            console.log('✅ Message updated with WhatsApp ID:', messageId, 'for status tracking');
          }
          
          return NextResponse.json({ success: true, updated: 'whatsapp_id_added' });
        }
      }

      // Store the message in CRM system
      await storeMessage(conversation.id, messageText, direction, messageMetadata);
      
      console.log('✅ Message stored in CRM system:', direction, messageText);

      // Check for @bb mention in incoming messages and trigger AI processing
      if (!fromMe && messageText && /@bb/i.test(messageText)) {
        console.log('🤖 @bb mention detected, triggering AI processing...');
        
        try {
          // Call the AI processing API
          const aiResponse = await fetch(`${request.nextUrl.origin}/api/whatsapp/ai`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chatId: conversation.id,
              message: messageText,
              userId: contact.id
            })
          });

          if (aiResponse.ok) {
            const aiResult = await aiResponse.json();
            console.log('✅ AI processing successful:', aiResult.success);
          } else {
            console.error('❌ AI processing failed:', aiResponse.status, aiResponse.statusText);
          }
        } catch (error) {
          console.error('❌ Error calling AI API:', error);
        }
      } else {
        // Debug logging for @bb detection
        console.log('🔍 @bb detection debug:');
        console.log('  - fromMe:', fromMe);
        console.log('  - messageText:', JSON.stringify(messageText));
        console.log('  - messageText length:', messageText?.length);
        console.log('  - @bb regex test result:', /@bb/i.test(messageText || ''));
        console.log('  - Final condition result:', !fromMe && messageText && /@bb/i.test(messageText));
        
        if (fromMe) {
          console.log('⚠️ Skipping AI processing: message is from us');
        } else if (!messageText) {
          console.log('⚠️ Skipping AI processing: no message text');
        } else if (!/@bb/i.test(messageText)) {
          console.log('⚠️ Skipping AI processing: no @bb mention found');
        } else {
          console.log('⚠️ Skipping AI processing: unknown reason');
        }
      }

      return NextResponse.json({ success: true });
    } else if (event === 'messages.update') {
      // Handle message status updates (delivered, read, etc.)
      const { update, key } = data;
      const { status } = update;
      const { id: messageId, remoteJid, fromMe } = key;

      console.log('📊 Message status update:');
      console.log('  - Message ID:', messageId);
      console.log('  - Remote JID:', remoteJid);
      console.log('  - Status:', status, getStatusName(status));
      console.log('  - From Me:', fromMe);

      try {
        // Find the message in CRM system by WhatsApp message ID
        const { data: existingMessage } = await supabaseAdmin
          .from('messages')
          .select('id, raw_message_data, conversation_id')
          .eq('whatsapp_message_id', messageId)
          .single();

        if (existingMessage) {
          console.log('📝 Updating status for existing message:', messageId, 'in conversation:', existingMessage.conversation_id);
          
          const currentMetadata = (existingMessage.raw_message_data as Record<string, any>) || {};
          const updatedMetadata = {
            ...currentMetadata,
            whatsapp_status: status,
            whatsapp_status_name: getStatusName(status),
            status_updated_at: new Date().toISOString()
          };

          const { error: updateError } = await supabaseAdmin
            .from('messages')
            .update({ 
              whatsapp_status: getStatusName(status),
              raw_message_data: updatedMetadata
            })
            .eq('id', existingMessage.id);

          if (updateError) {
            console.error('❌ Error updating message status:', updateError);
          } else {
            console.log('✅ Message status updated to:', getStatusName(status), 'for message:', messageId);
          }
        } else {
          console.log('🔍 Message not found in CRM system:', messageId);
          
          if (!fromMe && remoteJid) {
            // This might be a message from a new contact that we haven't processed yet
            console.log('📞 Potential new message from unknown contact:', remoteJid);
            
            try {
              await getOrCreateWhatsAppContact(remoteJid);
              console.log('✅ Contact created for unknown sender, waiting for messages.upsert event');
            } catch (error) {
              console.error('❌ Error creating contact for unknown sender:', error);
            }
          }
        }
      } catch (error) {
        console.error('❌ Error processing status update:', error);
      }

      return NextResponse.json({ success: true, updated: true });
    } else {
      console.log('⚠️ Unknown webhook event type:', event);
      return NextResponse.json({ error: 'Unknown event type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in webhook POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 