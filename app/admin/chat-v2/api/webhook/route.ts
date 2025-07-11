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
        whatsapp_status: 'received',
        sender_type: fromMe ? 'admin' : 'user',
        raw_message_data: {
          ...messageData,
          media_info: mediaInfo
        },
        created_at: new Date(messageTimestamp * 1000).toISOString()
      })
      .select()
      .single()

    if (storeError) {
      throw storeError
    }

    // Update conversation stats
    const { data: currentStats } = await supabaseAdmin
      .from('conversations')
      .select('total_messages')
      .eq('id', conversationId)
      .single()

    await supabaseAdmin
      .from('conversations')
      .update({
        total_messages: (currentStats?.total_messages || 0) + 1,
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)

    return newMessage
  } catch (error) {
    console.error('❌ Error storing message:', error)
    throw error
  }
}

// Helper function to process AI mentions
async function processAIMention(conversationId: string, message: string, userId: string) {
  try {
    if (!message || !/@bb/i.test(message)) {
      return
    }

    const aiResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/whatsapp/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: conversationId,
        message: message,
        userId: userId
      })
    })

    if (!aiResponse.ok) {
      throw new Error(`AI API returned ${aiResponse.status}`)
    }

    return await aiResponse.json()
  } catch (error) {
    console.error('❌ Error processing AI mention:', error)
  }
}

// Main webhook handler
export async function POST(request: NextRequest) {
  console.log('📥 Chat 2.0 - Webhook received:', await request.json())

  try {
    // Verify webhook signature
    if (!verifySignature(request)) {
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 })
    }

    const body = await request.json()
    const { event } = body

    // Handle test event
    if (event === 'webhook.test') {
      return NextResponse.json({ success: true, message: 'Webhook test successful' })
    }

    // Handle messages.upsert event
    if (event === 'messages.upsert') {
      const messages = body.data?.messages || []
      
      for (const messageData of messages) {
        const {
          key: { remoteJid, id: whatsappMessageId },
          pushName
        } = messageData

        // Get or create contact
        const contact = await getOrCreateWhatsAppContact(remoteJid, pushName)
        
        // Get or create conversation
        const conversation = await getOrCreateConversation(contact.id)
        
        // Store the message
        const message = await storeMessage(conversation.id, messageData)
        
        // Process @bb mentions
        if (message.content) {
          await processAIMention(conversation.id, message.content, contact.id)
        }
      }

      return NextResponse.json({ success: true, message: 'Messages processed successfully' })
    }

    // Handle messages.update event (status updates)
    if (event === 'messages.update') {
      const updates = body.data || []
      
      for (const update of updates) {
        const { key: { id: whatsappMessageId }, update: status } = update
        
        // Update message status
        await supabaseAdmin
          .from('messages')
          .update({ whatsapp_status: getStatusName(status) })
          .eq('whatsapp_message_id', whatsappMessageId)
      }

      return NextResponse.json({ success: true, message: 'Message statuses updated' })
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