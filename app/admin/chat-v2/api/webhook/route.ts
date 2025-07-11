import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Verify webhook signature
function verifySignature(request: NextRequest): boolean {
  const signature = request.headers.get('x-webhook-signature')
  const webhookSecret = process.env.WASENDER_WEBHOOK_SECRET

  if (!signature || !webhookSecret || signature !== webhookSecret) {
    console.error('❌ Invalid webhook signature')
    return false
  }
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

// Main webhook handler
export async function POST(request: NextRequest) {
  try {
    // 1. Verify webhook signature
    if (!verifySignature(request)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = await request.json()
    console.log('📥 Chat 2.0 - Webhook received:', JSON.stringify(payload, null, 2))

    // 2. Handle different event types
    switch (payload.event) {
      case 'messages.upsert':
        return handleMessageUpsert(payload)
      case 'messages.update':
        return handleMessageUpdate(payload)
      case 'webhook.test':
        return NextResponse.json({ success: true, message: 'Webhook test received successfully' })
      default:
        console.warn('⚠️ Unknown webhook event type:', payload.event)
        return NextResponse.json({ success: true, message: 'Event acknowledged' })
    }
  } catch (error) {
    console.error('❌ Webhook processing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Handle new/updated messages
async function handleMessageUpsert(payload: any) {
  const messages = payload.data?.messages || []
  
  for (const messageData of messages) {
    try {
      const { key, message, pushName, messageTimestamp } = messageData
      
      if (!key?.remoteJid) {
        console.warn('⚠️ Missing remoteJid in message:', messageData)
        continue
      }

      // Get message content based on type
      let content = ''
      let messageType = 'text'
      let mediaUrl = null
      
      if (message?.conversation) {
        content = message.conversation
      } else if (message?.extendedTextMessage?.text) {
        content = message.extendedTextMessage.text
      } else if (message?.imageMessage) {
        content = message.imageMessage.caption || ''
        messageType = 'image'
        mediaUrl = message.imageMessage.url
      } else if (message?.videoMessage) {
        content = message.videoMessage.caption || ''
        messageType = 'video'
        mediaUrl = message.videoMessage.url
      } else if (message?.audioMessage) {
        messageType = 'audio'
        mediaUrl = message.audioMessage.url
      } else if (message?.documentMessage) {
        content = message.documentMessage.fileName || ''
        messageType = 'document'
        mediaUrl = message.documentMessage.url
      }

      // Skip if no content and no media
      if (!content && !mediaUrl) {
        console.log('ℹ️ Skipping empty message')
        continue
      }

      // Process the message
      const phoneNumber = normalizePhoneNumber(key.remoteJid)
      console.log('📱 Processing message from:', phoneNumber, 'Type:', messageType)

      // Get or create contact
      const contact = await getOrCreateWhatsAppContact(key.remoteJid, pushName)
      if (!contact) {
        throw new Error('Failed to get/create contact')
      }

      // Get or create conversation
      const conversation = await getOrCreateConversation(contact.id, pushName || 'Unknown', key.remoteJid)
      if (!conversation) {
        throw new Error('Failed to get/create conversation')
      }

      // Store the message
      const messageRecord = await storeMessage(conversation.id, content, 'inbound', {
        whatsapp_message_id: key.id,
        message_type: messageType,
        media_url: mediaUrl,
        push_name: pushName,
        timestamp: messageTimestamp,
        raw_data: messageData
      })

      // Check for @bb mention and process AI if needed
      if (content && /@bb/i.test(content)) {
        await processAIMention(conversation.id, content, contact.id)
      }

      console.log('✅ Message processed successfully:', messageRecord.id)
    } catch (error) {
      console.error('❌ Error processing message:', error)
    }
  }

  return NextResponse.json({ success: true })
}

// Handle message status updates
async function handleMessageUpdate(payload: any) {
  const updates = payload.data?.messages || []
  
  for (const update of updates) {
    try {
      const { key, update: statusUpdate } = update
      
      if (!key?.id) {
        console.warn('⚠️ Missing message ID in update:', update)
        continue
      }

      // Update message status in database
      const { error } = await supabaseAdmin
        .from('messages')
        .update({
          whatsapp_status: getStatusName(statusUpdate.status),
          updated_at: new Date().toISOString()
        })
        .eq('whatsapp_message_id', key.id)

      if (error) {
        console.error('❌ Error updating message status:', error)
      } else {
        console.log('✅ Message status updated:', key.id, 'Status:', getStatusName(statusUpdate.status))
      }
    } catch (error) {
      console.error('❌ Error processing status update:', error)
    }
  }

  return NextResponse.json({ success: true })
}

// Process AI mention
async function processAIMention(conversationId: string, message: string, userId: string) {
  try {
    const response = await fetch('/api/whatsapp/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId: conversationId, message, userId })
    })

    if (!response.ok) {
      throw new Error(`AI processing failed: ${response.status}`)
    }

    console.log('✅ AI processing completed for message with @bb mention')
  } catch (error) {
    console.error('❌ Error processing AI mention:', error)
  }
}

// Allow HEAD requests for webhook testing
export async function HEAD(request: NextRequest) {
  if (!verifySignature(request)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }
  return new Response(null, { status: 200 })
} 