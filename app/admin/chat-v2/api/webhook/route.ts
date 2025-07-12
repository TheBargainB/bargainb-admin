import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Verify webhook signature
function verifySignature(signature: string | null, webhookSecret: string | undefined): boolean {
  // If no secret is configured, skip verification (for testing)
  if (!webhookSecret) {
    console.log('⚠️ Webhook secret not configured, skipping verification')
    return true
  }

  if (!signature) {
    console.error('❌ Missing webhook signature')
    return false
  }

  if (signature !== webhookSecret) {
    console.error('❌ Invalid webhook signature')
    return false
  }

  console.log('✅ Webhook signature verified')
  return true
}

// Helper function to normalize phone numbers
function normalizePhoneNumber(phoneNumber: string): string {
  // Remove @s.whatsapp.net and clean the number
  const cleaned = phoneNumber.replace('@s.whatsapp.net', '').replace(/[^\d+]/g, '')
  
  // If it starts with +, use as is
  if (cleaned.startsWith('+')) {
    return cleaned
  }
  
  // Add + for all numbers
  return `+${cleaned}`
}

// Message status codes from WASender
enum MessageStatus {
  ERROR = 0,
  PENDING = 1,
  SENT = 2,
  DELIVERED = 3,
  READ = 4,
  PLAYED = 5,
}

// Helper function to get status name
function getStatusName(status: number): string {
  return MessageStatus[status] || 'unknown'
}

// Helper function to get message content from WASender payload
function getMessageContent(message: any): string | null {
  // Check extendedTextMessage first (for replies or messages with links)
  if (message?.extendedTextMessage?.text) {
    return message.extendedTextMessage.text
  }
  
  // Then check conversation (simple text messages)
  if (message?.conversation) {
    return message.conversation
  }
  
  return null
}

// Helper function to find media info in message
function findMediaInfo(message: any): { mediaObject: any, mediaType: string } | null {
  if (!message) return null
  
  const mediaKeys = {
    imageMessage: 'image',
    videoMessage: 'video',
    audioMessage: 'audio',
    documentMessage: 'document',
    stickerMessage: 'sticker'
  }

  for (const [key, type] of Object.entries(mediaKeys)) {
    if (message[key]) {
      return { mediaObject: message[key], mediaType: type }
    }
  }

  return null
}

// Helper function to get or create WhatsApp contact
async function getOrCreateWhatsAppContact(remoteJid: string, pushName?: string) {
  try {
    // Extract phone number from remoteJid and normalize it
    const phoneNumber = remoteJid.replace('@s.whatsapp.net', '')
    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber)

    // First, try to find existing contact by whatsapp_jid
    const { data: existingContact, error: fetchError } = await supabaseAdmin
      .from('whatsapp_contacts')
      .select('*')
      .eq('whatsapp_jid', remoteJid)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Error fetching WhatsApp contact:', fetchError)
      throw fetchError
    }

    if (existingContact) {
      // Update contact info if needed
      if (pushName && (!existingContact.push_name || !existingContact.display_name)) {
        const { data: updatedContact, error: updateError } = await supabaseAdmin
          .from('whatsapp_contacts')
          .update({
            push_name: pushName,
            display_name: pushName,
            last_seen_at: new Date().toISOString()
          })
          .eq('id', existingContact.id)
          .select()
          .single()

        if (!updateError) {
          return updatedContact
        }
      }
      return existingContact
    }

    // Create new contact
    const { data: newContact, error: createError } = await supabaseAdmin
      .from('whatsapp_contacts')
      .insert({
        phone_number: normalizedPhoneNumber,
        whatsapp_jid: remoteJid,
        push_name: pushName,
        display_name: pushName,
        is_active: true,
        last_seen_at: new Date().toISOString()
      })
      .select()
      .single()

    if (createError) {
      throw createError
    }

    return newContact
  } catch (error) {
    console.error('❌ Error in getOrCreateWhatsAppContact:', error)
    throw error
  }
}

// Helper function to get or create conversation
async function getOrCreateConversation(contactId: string) {
  try {
    // Try to find existing active conversation
    const { data: existingConversation, error: fetchError } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('whatsapp_contact_id', contactId)
      .eq('status', 'active')
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    if (existingConversation) {
      return existingConversation
    }

    // Create new conversation with required fields
    const { data: newConversation, error: createError } = await supabaseAdmin
      .from('conversations')
      .insert({
        whatsapp_contact_id: contactId,
        whatsapp_conversation_id: `${contactId}_${Date.now()}`,  // Generate unique ID
        status: 'active',
        total_messages: 0,
        ai_enabled: true,
        title: 'WhatsApp Chat'  // Default title
      })
      .select()
      .single()

    if (createError) {
      throw createError
    }

    return newConversation
  } catch (error) {
    console.error('❌ Error in getOrCreateConversation:', error)
    throw error
  }
}

// Helper function to store message
async function storeMessage(conversationId: string, messageData: any) {
  try {
    const {
      key: { id: whatsappMessageId, fromMe },
      pushName,
      message,
      messageTimestamp
    } = messageData

    // Get message content
    const content = getMessageContent(message)
    const mediaInfo = findMediaInfo(message)
    
    // Prepare message data
    const messageType = mediaInfo ? mediaInfo.mediaType : 'text'
    const messageContent = content || (mediaInfo ? `[${mediaInfo.mediaType} message]` : '[unknown message]')

    console.log('💾 Storing message:', {
      conversation_id: conversationId,
      whatsapp_message_id: whatsappMessageId,
      content: messageContent,
      direction: fromMe ? 'outbound' : 'inbound',
      from_me: fromMe
    })

    // Store the message
    const { data: newMessage, error: storeError } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: conversationId,
        whatsapp_message_id: whatsappMessageId,
        content: messageContent,
        message_type: messageType,
        direction: fromMe ? 'outbound' : 'inbound',
        from_me: fromMe,
        whatsapp_status: fromMe ? 'sent' : 'delivered',
        sender_type: fromMe ? 'admin' : 'user',
        raw_message_data: {
          ...messageData,
          media_info: mediaInfo
        }
      })
      .select()
      .single()

    if (storeError) {
      console.error('❌ Error inserting message:', storeError)
      throw storeError
    }

    console.log('✅ Message stored successfully:', newMessage.id)

    // Update conversation stats
    const { data: currentStats } = await supabaseAdmin
      .from('conversations')
      .select('total_messages, unread_count')
      .eq('id', conversationId)
      .single()

    if (currentStats) {
      const newTotalMessages = (currentStats.total_messages || 0) + 1
      const newUnreadCount = !fromMe 
        ? (currentStats.unread_count || 0) + 1 
        : (currentStats.unread_count || 0)

      const { error: updateError } = await supabaseAdmin
        .from('conversations')
        .update({
          total_messages: newTotalMessages,
          unread_count: newUnreadCount,
          last_message: messageContent, // Add the actual message content
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)

      if (updateError) {
        console.warn('⚠️ Could not update conversation stats:', updateError)
      } else {
        console.log('✅ Updated conversation stats: messages =', newTotalMessages, ', unread =', newUnreadCount, ', last_message =', messageContent)
      }
    }

    return newMessage
  } catch (error) {
    console.error('❌ Error storing message:', error)
    throw error
  }
}

// Main webhook handler
export async function POST(request: NextRequest) {
  try {
    // Get signature and secret for verification
    const signature = request.headers.get('x-webhook-signature')
    const webhookSecret = process.env.WASENDER_WEBHOOK_SECRET

    // Verify webhook signature first
    if (!verifySignature(signature, webhookSecret)) {
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 })
    }

    // Read the request body once
    const body = await request.json()
    console.log('📥 Chat 2.0 - Webhook received:', JSON.stringify(body, null, 2))

    const { event } = body

    // Handle test event
    if (event === 'webhook.test') {
      console.log('🧪 Webhook test event received')
      return NextResponse.json({ 
        success: true, 
        message: 'Webhook test successful',
        timestamp: new Date().toISOString(),
        received_data: body
      })
    }

    // Handle messages.upsert event
    if (event === 'messages.upsert') {
      console.log('📨 Processing messages.upsert event')
      console.log('🔍 Event data structure:', JSON.stringify(body.data, null, 2))
      
      // Support both array format (data.messages[0]) and object format (data.messages)
      const message = Array.isArray(body.data?.messages) ? body.data.messages[0] : body.data?.messages
      console.log('🔍 Message object:', JSON.stringify(message, null, 2))
      
      if (!message) {
        console.log('⚠️ No message found in payload')
        return NextResponse.json({ success: true, skipped: 'no_message' })
      }
      
      const { 
        key,
        message: messageContent, 
        messageTimestamp, 
        pushName
      } = message

      // Extract from key object
      const { remoteJid, id: messageId, fromMe } = key

      console.log('🔍 Extracted values:')
      console.log('  - remoteJid:', remoteJid)
      console.log('  - messageId:', messageId)
      console.log('  - messageTimestamp:', messageTimestamp)
      console.log('  - pushName:', pushName)
      console.log('  - fromMe:', fromMe)
      console.log('  - messageContent object:', JSON.stringify(messageContent, null, 2))

      console.log('📨 Processing message from:', remoteJid, fromMe ? '(sent by us)' : '(incoming)')

      // Get or create contact
      const contact = await getOrCreateWhatsAppContact(remoteJid, pushName)
      const contactName = contact.display_name || contact.push_name || contact.phone_number
      
      // Get or create conversation
      const conversation = await getOrCreateConversation(contact.id)
      
      // Extract message text from different formats
      let messageText = ''
      if (messageContent?.conversation) {
        messageText = messageContent.conversation
      } else if (messageContent?.extendedTextMessage?.text) {
        messageText = messageContent.extendedTextMessage.text
      } else {
        console.log('⚠️ Unknown message format:', messageContent)
        messageText = 'Unknown message format'
      }

      console.log('📝 Message text extracted:', messageText)
      
      // Check for duplicate messages (especially for outbound messages)
      const direction = fromMe ? 'outbound' : 'inbound'
      
      if (fromMe) {
        // Check if this outgoing message already exists (sent via send-message API)
        const messageTimestampMs = typeof messageTimestamp === 'object' && messageTimestamp !== null && 'low' in messageTimestamp
          ? messageTimestamp.low * 1000
          : (typeof messageTimestamp === 'number' ? messageTimestamp * 1000 : Date.now())
        
        const timestampStart = new Date(messageTimestampMs - 30000).toISOString() // 30 seconds before
        const timestampEnd = new Date(messageTimestampMs + 30000).toISOString()   // 30 seconds after

        const { data: existingMessage } = await supabaseAdmin
          .from('messages')
          .select('id, raw_message_data')
          .eq('conversation_id', conversation.id)
          .eq('content', messageText)
          .eq('direction', 'outbound')
          .gte('created_at', timestampStart)
          .lte('created_at', timestampEnd)
          .single()

        if (existingMessage) {
          console.log('✅ Outgoing message already exists in CRM (sent via API), updating with WhatsApp message ID')
          
          // Update the existing message with the WhatsApp message ID
          const currentMetadata = (existingMessage.raw_message_data as Record<string, any>) || {}
          const updatedMetadata = {
            ...currentMetadata,
            whatsapp_message_id: messageId,
            whatsapp_timestamp: messageTimestamp,
            remote_jid: remoteJid,
            from_me: fromMe
          }

          const { error: updateError } = await supabaseAdmin
            .from('messages')
            .update({ 
              whatsapp_message_id: messageId,
              raw_message_data: updatedMetadata
            })
            .eq('id', existingMessage.id)

          if (updateError) {
            console.error('❌ Error updating message with WhatsApp ID:', updateError)
          } else {
            console.log('✅ Message updated with WhatsApp ID:', messageId, 'for status tracking')
          }
          
          return NextResponse.json({ success: true, updated: 'whatsapp_id_added' })
        }
      }
      
      // Store the message using the updated message data
      const updatedMessageData = {
        ...message,
        message: messageContent
      }
      const storedMessage = await storeMessage(conversation.id, updatedMessageData)
      
      console.log('✅ Message stored in CRM system:', direction, messageText)
      
      // Check for @bb mention in incoming messages and trigger AI processing
      if (!fromMe && messageText && /@bb/i.test(messageText)) {
        console.log('🤖 @bb mention detected, triggering AI processing...');
        
        try {
          // Call the AI processing API using request origin (like the old system)
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
    }

    // Handle messages.update event (status updates)
    if (event === 'messages.update') {
      const updates = Array.isArray(body.data) ? body.data : (body.data ? [body.data] : []);
      console.log('📊 Processing message status updates:', updates.length, 'updates');
      
      for (const update of updates) {
        try {
          const { key: { id: whatsappMessageId }, update: status } = update;
          
          if (whatsappMessageId && status !== undefined) {
            // Update message status
            const { error: updateError } = await supabaseAdmin
              .from('messages')
              .update({ whatsapp_status: getStatusName(status) })
              .eq('whatsapp_message_id', whatsappMessageId);

            if (updateError) {
              console.error('❌ Error updating message status:', updateError);
            } else {
              console.log('✅ Updated message status:', whatsappMessageId, '→', getStatusName(status));
            }
          }
        } catch (updateError) {
          console.error('❌ Error processing status update:', updateError, 'for update:', update);
        }
      }

      return NextResponse.json({ success: true, message: 'Message statuses updated' });
    }

    // Unknown event type
    console.warn('⚠️ Chat 2.0 - Unknown webhook event type:', event)
    return NextResponse.json({ success: false, error: 'Unknown event type' }, { status: 400 })

  } catch (error) {
    console.error('❌ Chat 2.0 - Webhook error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// Handle HEAD request for webhook verification
export async function HEAD(request: NextRequest) {
  return new Response(null, { status: 200 })
} 