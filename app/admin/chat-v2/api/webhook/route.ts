import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Helper function to normalize phone numbers
function normalizePhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '')
  
  // If it already starts with +, use as is
  if (cleaned.startsWith('+')) {
    return cleaned
  }
  
  // Remove any leading zeros or other non-standard formatting
  const digitsOnly = cleaned.replace(/\D/g, '')
  
  // If it looks like an international number (10+ digits), add +
  if (digitsOnly.length >= 10) {
    // Handle common cases
    if (digitsOnly.length === 10) {
      // Assume US if 10 digits
      return `+1${digitsOnly}`
    } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
      // US number with country code
      return `+${digitsOnly}`
    } else {
      // International number (like Dutch +31...)
      return `+${digitsOnly}`
    }
  }
  
  // Return original if we can't format it properly
  return phoneNumber
}

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
    // Extract phone number from remoteJid and normalize it
    const phoneNumber = remoteJid.replace('@s.whatsapp.net', '')
    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber)

    // First, try to find existing contact by whatsapp_jid (most reliable)
    const { data: existingContactByJid, error: fetchByJidError } = await supabaseAdmin
      .from('whatsapp_contacts')
      .select('*')
      .eq('whatsapp_jid', remoteJid)
      .single()

    if (fetchByJidError && fetchByJidError.code !== 'PGRST116') {
      console.error('❌ Error fetching WhatsApp contact by JID:', fetchByJidError)
      throw fetchByJidError
    }

    if (existingContactByJid) {
      console.log('✅ Found existing WhatsApp contact by JID:', existingContactByJid.id)
      
      // Update contact name and last seen if we have new information
      if (pushName && (!existingContactByJid.push_name || !existingContactByJid.display_name)) {
        const { data: updatedContact, error: updateError } = await supabaseAdmin
          .from('whatsapp_contacts')
          .update({
            push_name: pushName,
            display_name: pushName,
            last_seen_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingContactByJid.id)
          .select()
          .single()

        if (updateError) {
          console.warn('⚠️ Could not update contact name:', updateError)
          return existingContactByJid
        } else {
          console.log('📝 Updated contact name to:', pushName)
          return updatedContact
        }
      }
      
      // Update last seen
      const { error: updateLastSeenError } = await supabaseAdmin
        .from('whatsapp_contacts')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', existingContactByJid.id)

      if (updateLastSeenError) {
        console.warn('⚠️ Could not update last seen:', updateLastSeenError)
      }
      
      return existingContactByJid
    }

    // If not found by JID, try by phone number variations
    const phoneVariations = [
      phoneNumber,           // Raw: 31614539919
      normalizedPhoneNumber, // Normalized: 31614539919
    ]

    let existingContactByPhone = null
    for (const phoneVariation of phoneVariations) {
      const { data: contact, error: fetchError } = await supabaseAdmin
        .from('whatsapp_contacts')
        .select('*')
        .eq('phone_number', phoneVariation)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ Error fetching WhatsApp contact by phone:', fetchError)
        continue
      }

      if (contact) {
        existingContactByPhone = contact
        console.log('✅ Found existing WhatsApp contact by phone:', contact.id, 'with phone:', phoneVariation)
        break
      }
    }

    if (existingContactByPhone) {
      // Update the existing contact with the WhatsApp JID if missing
      const { data: updatedContact, error: updateError } = await supabaseAdmin
        .from('whatsapp_contacts')
        .update({
          whatsapp_jid: remoteJid,
          push_name: pushName || existingContactByPhone.push_name,
          display_name: pushName || existingContactByPhone.display_name,
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingContactByPhone.id)
        .select()
        .single()

      if (updateError) {
        console.warn('⚠️ Could not update contact with WhatsApp JID:', updateError)
        return existingContactByPhone
      } else {
        console.log('📝 Updated contact with WhatsApp JID:', remoteJid)
        return updatedContact
      }
    }

    // Create new WhatsApp contact using upsert to handle race conditions
    console.log('🆕 Creating new WhatsApp contact for:', phoneNumber)
    
    const { data: newContact, error: createError } = await supabaseAdmin
      .from('whatsapp_contacts')
      .upsert({
        phone_number: normalizedPhoneNumber,  // Store normalized phone number for consistency
        whatsapp_jid: remoteJid,
        push_name: pushName,
        display_name: pushName,
        whatsapp_status: 'available',
        is_active: true,
        last_seen_at: new Date().toISOString()
      }, {
        onConflict: 'whatsapp_jid',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (createError) {
      console.error('❌ Error creating WhatsApp contact:', createError)
      
      // If still failing due to constraint, try one more lookup
      const { data: finalContact } = await supabaseAdmin
        .from('whatsapp_contacts')
        .select('*')
        .eq('whatsapp_jid', remoteJid)
        .single()
      
      if (finalContact) {
        console.log('✅ Found contact after failed create (race condition):', finalContact.id)
        return finalContact
      }
      
      throw createError
    }

    console.log('✅ Created new WhatsApp contact:', newContact.id)

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
        })

      if (crmProfileError) {
        console.warn('⚠️ Could not create CRM profile for contact:', crmProfileError)
      } else {
        console.log('✅ Created CRM profile for new contact')
      }
    } catch (error) {
      console.warn('⚠️ Error creating CRM profile:', error)
    }

    return newContact
  } catch (error) {
    console.error('❌ Error in getOrCreateWhatsAppContact:', error)
    throw error
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
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Error fetching conversation:', fetchError)
      throw fetchError
    }

    if (existingConversation) {
      console.log('✅ Found existing conversation:', existingConversation.id)
      
      // Ensure AI is enabled for existing conversations
      if (!existingConversation.ai_enabled) {
        console.log('🤖 Enabling AI for existing conversation...')
        const { data: updatedConversation, error: updateError } = await supabaseAdmin
          .from('conversations')
          .update({
            ai_enabled: true,
            ai_config: {
              enabled: true,
              response_style: 'helpful',
              auto_respond: false
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConversation.id)
          .select()
          .single()

        if (updateError) {
          console.warn('⚠️ Could not enable AI for conversation:', updateError)
          return existingConversation
        } else {
          console.log('✅ AI enabled for existing conversation')
          return updatedConversation
        }
      }
      
      return existingConversation
    }

    // Create new conversation using upsert to handle race conditions
    console.log('💬 Creating new conversation for contact:', contactId)
    
    // Generate a unique WhatsApp conversation ID from the remoteJid
    const whatsappConversationId = remoteJid.replace('@s.whatsapp.net', '') + '_conversation'
    
    const { data: newConversation, error: createError } = await supabaseAdmin
      .from('conversations')
      .upsert({
        whatsapp_contact_id: contactId,
        whatsapp_conversation_id: whatsappConversationId,
        title: contactName || 'WhatsApp Chat',
        description: `WhatsApp conversation with ${contactName}`,
        status: 'active',
        conversation_type: 'customer_support',
        total_messages: 0,
        unread_count: 0,
        last_message_at: new Date().toISOString(),
        ai_enabled: true,
        ai_config: {
          enabled: true,
          response_style: 'helpful',
          auto_respond: false
        }
      }, {
        onConflict: 'whatsapp_conversation_id',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (createError) {
      console.error('❌ Error creating conversation:', createError)
      
      // If still failing due to constraint, try one more lookup
      const { data: finalConversation } = await supabaseAdmin
        .from('conversations')
        .select('*')
        .eq('whatsapp_conversation_id', whatsappConversationId)
        .single()
      
      if (finalConversation) {
        console.log('✅ Found conversation after failed create (race condition):', finalConversation.id)
        return finalConversation
      }
      
      throw createError
    }

    console.log('✅ Created new conversation:', newConversation.id)
    return newConversation
  } catch (error) {
    console.error('❌ Error in getOrCreateConversation:', error)
    throw error
  }
}

// Helper function to store message in CRM system
async function storeMessage(conversationId: string, content: string, direction: 'inbound' | 'outbound', metadata: any) {
  try {
    // Generate a unique WhatsApp message ID
    const whatsappMessageId = metadata.whatsapp_message_id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
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
      .single()

    if (messageError) {
      console.error('❌ Error storing message:', messageError)
      throw messageError
    }

    // Update conversation stats - get current conversation first
    const { data: currentConversation } = await supabaseAdmin
      .from('conversations')
      .select('total_messages, unread_count')
      .eq('id', conversationId)
      .single()

    if (currentConversation) {
      const newTotalMessages = (currentConversation.total_messages || 0) + 1
      const newUnreadCount = direction === 'inbound' 
        ? (currentConversation.unread_count || 0) + 1 
        : (currentConversation.unread_count || 0)

      const { error: updateError } = await supabaseAdmin
        .from('conversations')
        .update({
          total_messages: newTotalMessages,
          unread_count: newUnreadCount,
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)

      if (updateError) {
        console.warn('⚠️ Could not update conversation stats:', updateError)
      } else {
        console.log('✅ Updated conversation stats: messages =', newTotalMessages, ', unread =', newUnreadCount)
      }
    }

    console.log('✅ Message stored in CRM system:', newMessage.id)
    return newMessage
  } catch (error) {
    console.error('❌ Error in storeMessage:', error)
    throw error
  }
}

// =============================================================================
// WEBHOOK HANDLERS
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    console.log('📡 Chat 2.0 - Webhook health check requested')
    
    return NextResponse.json({ 
      status: 'healthy',
      endpoint: '/admin/chat-v2/api/webhook',
      supportedEvents: ['messages.upsert', 'messages.update'],
      timestamp: new Date().toISOString(),
      version: 'Chat-2.0-with-ai-processing',
      deployedAt: '2025-01-26T23:00:00Z'
    })
    
  } catch (error) {
    console.error('❌ Chat 2.0 webhook health check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature for WASender
    const signature = request.headers.get('x-webhook-signature')
    const webhookSecret = process.env.WASENDER_WEBHOOK_SECRET
    
    console.log('🔐 Chat 2.0 - Webhook signature:', signature ? 'present' : 'missing')
    console.log('🔐 Chat 2.0 - Webhook secret configured:', webhookSecret ? 'yes' : 'no')
    
    // If webhook secret is configured, verify signature
    if (webhookSecret && signature) {
      if (signature !== webhookSecret) {
        console.error('❌ Invalid webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
      console.log('✅ Webhook signature verified')
    } else if (webhookSecret && !signature) {
      console.error('❌ Missing webhook signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    } else {
      console.log('⚠️ Webhook verification skipped (no secret configured)')
    }

    const body = await request.json()
    console.log('📥 Chat 2.0 - Webhook received:', JSON.stringify(body, null, 2))

    const { event, data } = body
    console.log('🔍 Event:', event)

    if (event === 'messages.upsert') {
      // Handle new or updated messages
      const message = Array.isArray(data.messages) ? data.messages[0] : data.messages
      
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

      console.log('🔍 Chat 2.0 - Extracted values:')
      console.log('  - remoteJid:', remoteJid)
      console.log('  - messageId:', messageId)
      console.log('  - fromMe:', fromMe)
      console.log('  - pushName:', pushName)

      // Get or create WhatsApp contact in CRM system
      const contact = await getOrCreateWhatsAppContact(remoteJid, pushName)
      const contactName = contact.display_name || contact.push_name || contact.phone_number

      // Get or create conversation for this contact
      const conversation = await getOrCreateConversation(contact.id, contactName, remoteJid)

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

      console.log('📝 Chat 2.0 - Message text extracted:', messageText)

      // Prepare message metadata
      const messageMetadata = {
        whatsapp_message_id: messageId,
        whatsapp_timestamp: messageTimestamp,
        push_name: pushName,
        remote_jid: remoteJid,
        from_me: fromMe,
        key: key,
        original_message: messageContent
      }

      // Store message in CRM system
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

      // Store the message in CRM system
      await storeMessage(conversation.id, messageText, direction, messageMetadata)
      
      console.log('✅ Chat 2.0 - Message stored in CRM system:', direction, messageText)

      // Check for @bb mention in incoming messages and trigger AI processing
      if (!fromMe && messageText && /@bb/i.test(messageText)) {
        console.log('🤖 Chat 2.0 - @bb mention detected, triggering AI processing...')
        
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
          })

          if (aiResponse.ok) {
            const aiResult = await aiResponse.json()
            console.log('✅ Chat 2.0 - AI processing successful:', aiResult.success)
          } else {
            console.error('❌ Chat 2.0 - AI processing failed:', aiResponse.status, aiResponse.statusText)
          }
        } catch (error) {
          console.error('❌ Chat 2.0 - Error calling AI API:', error)
        }
      }

      return NextResponse.json({ success: true })

    } else if (event === 'messages.update') {
      // Handle message status updates (delivered, read, etc.)
      const { update, key } = data
      const { status } = update
      const { id: messageId, remoteJid, fromMe } = key

      console.log('📊 Chat 2.0 - Message status update:')
      console.log('  - Message ID:', messageId)
      console.log('  - Remote JID:', remoteJid)
      console.log('  - Status:', status, getStatusName(status))
      console.log('  - From Me:', fromMe)

      try {
        // Find the message in CRM system by WhatsApp message ID
        const { data: existingMessage } = await supabaseAdmin
          .from('messages')
          .select('id, raw_message_data, conversation_id')
          .eq('whatsapp_message_id', messageId)
          .single()

        if (existingMessage) {
          console.log('📝 Chat 2.0 - Updating status for existing message:', messageId, 'in conversation:', existingMessage.conversation_id)
          
          const currentMetadata = (existingMessage.raw_message_data as Record<string, any>) || {}
          const updatedMetadata = {
            ...currentMetadata,
            whatsapp_status: status,
            whatsapp_status_name: getStatusName(status),
            status_updated_at: new Date().toISOString()
          }

          const { error: updateError } = await supabaseAdmin
            .from('messages')
            .update({ 
              whatsapp_status: getStatusName(status),
              raw_message_data: updatedMetadata
            })
            .eq('id', existingMessage.id)

          if (updateError) {
            console.error('❌ Error updating message status:', updateError)
          } else {
            console.log('✅ Chat 2.0 - Message status updated to:', getStatusName(status), 'for message:', messageId)
          }
        } else {
          console.log('🔍 Chat 2.0 - Message not found in CRM system:', messageId)
        }
      } catch (error) {
        console.error('❌ Chat 2.0 - Error processing status update:', error)
      }

      return NextResponse.json({ success: true, updated: true })

    } else {
      console.log('⚠️ Chat 2.0 - Unknown webhook event type:', event)
      return NextResponse.json({ error: 'Unknown event type' }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Chat 2.0 - Error in webhook POST:', error)
    
    return NextResponse.json({ 
      error: 'Internal server error', 
      timestamp: new Date().toISOString(),
      requestId: Math.random().toString(36).substr(2, 9)
    }, { status: 500 })
  }
}

// =============================================================================
// WEBHOOK VERIFICATION ENDPOINT (FOR WASENDER SETUP)
// =============================================================================

export async function HEAD(request: NextRequest) {
  // Simple health check for webhook endpoint
  return new Response(null, { status: 200 })
} 