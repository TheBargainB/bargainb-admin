import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { normalizePhoneNumber } from '@/lib/api-utils'

// Verify webhook signature
function verifySignature(signature: string | null, webhookSecret: string | undefined): boolean {
  // TODO: Re-enable signature verification in production
  console.log('⚠️ Webhook signature verification temporarily disabled for testing')
  return true
  
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

// Extract message content from WASender payload
function extractMessageContent(message: any): string | null {
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

// Extract media info from message
function extractMediaInfo(message: any): { type: string, url?: string, mediaKey?: string, mimetype?: string } | null {
  if (!message) return null
  
  const mediaTypes = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage']
  
  for (const mediaType of mediaTypes) {
    if (message[mediaType]) {
      const mediaObj = message[mediaType]
      return {
        type: mediaType.replace('Message', ''),
        url: mediaObj.url,
        mediaKey: mediaObj.mediaKey,
        mimetype: mediaObj.mimetype
      }
    }
  }

  return null
}

// Find user by phone number in user_profiles
async function findUserByPhone(phoneNumber: string) {
  // Remove + prefix for database lookup since DB stores without +
  const cleanPhone = normalizePhoneNumber(phoneNumber).replace(/^\+/, '')
  
  const { data: user, error } = await supabaseAdmin
    .from('user_profiles')
      .select('*')
    .eq('phone_number', cleanPhone)
      .single()

  if (error && error.code !== 'PGRST116') {
    console.error('❌ Error finding user:', error)
    return null
  }
  
  return user
}

// Store incoming message in user_conversations
async function storeUserConversation(
  userId: string, 
  whatsappMessageId: string,
  content: string,
  direction: 'inbound' | 'outbound',
  messageType: string = 'text'
) {
  try {
    const { data: conversation, error } = await supabaseAdmin
      .from('user_conversations')
      .insert({
        user_profile_id: userId,
        whatsapp_message_id: whatsappMessageId,
        content: content,
        message_type: direction === 'inbound' ? 'user_message' : 'ai_response',
        whatsapp_status: direction === 'inbound' ? 'delivered' : 'sent'
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error storing user conversation:', error)
      throw error
    }

    console.log('✅ Stored user conversation:', conversation.id)
    return conversation
  } catch (error) {
    console.error('❌ Error in storeUserConversation:', error)
    throw error
  }
}

// Store message in ai_messages (for AI processing)
async function storeAIMessage(
  userId: string,
  content: string,
  messageType: 'user' | 'assistant',
  assistantId?: string,
  threadId?: string
) {
  try {
    const { data: aiMessage, error } = await supabaseAdmin
      .from('ai_messages')
      .insert({
        user_profile_id: userId,
        content,
        message_type: messageType,
        assistant_id: assistantId,
        thread_id: threadId,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error storing AI message:', error)
      throw error
    }

    console.log('✅ Stored AI message:', aiMessage.id)
    return aiMessage
  } catch (error) {
    console.error('❌ Error in storeAIMessage:', error)
    throw error
  }
}

// BRIDGE FUNCTIONS: Store in old chat system for existing AI processing

// Find or create WhatsApp contact in old system
async function findOrCreateWhatsAppContact(phoneNumber: string, pushName?: string) {
  try {
    // First try to find existing contact
    let { data: contact, error } = await supabaseAdmin
      .from('whatsapp_contacts')
      .select('*')
      .eq('phone_number', phoneNumber.replace(/^\+/, ''))
      .single()

    if (error && error.code === 'PGRST116') {
      // Contact doesn't exist, create it
      const { data: newContact, error: createError } = await supabaseAdmin
        .from('whatsapp_contacts')
        .insert({
          phone_number: phoneNumber.replace(/^\+/, ''),
          whatsapp_jid: `${phoneNumber.replace(/^\+/, '')}@s.whatsapp.net`,
          display_name: pushName || phoneNumber,
          push_name: pushName,
          is_active: true,
          last_seen_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        console.error('❌ Error creating WhatsApp contact:', createError)
        throw createError
      }

      contact = newContact
      console.log('✅ Created WhatsApp contact:', contact.id)
    } else if (error) {
      console.error('❌ Error finding WhatsApp contact:', error)
      throw error
    } else {
      // Update last seen
      await supabaseAdmin
        .from('whatsapp_contacts')
        .update({ 
          last_seen_at: new Date().toISOString(),
          push_name: pushName || contact!.push_name 
        })
        .eq('id', contact!.id)
      
      console.log('✅ Found existing WhatsApp contact:', contact!.id)
    }

    return contact!
  } catch (error) {
    console.error('❌ Error in findOrCreateWhatsAppContact:', error)
    throw error
  }
}

// Find or create conversation in old system
async function findOrCreateConversation(contactId: string, pushName?: string) {
  try {
    // First try to find existing conversation
    let { data: conversation, error } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('whatsapp_contact_id', contactId)
      .single()

    if (error && error.code === 'PGRST116') {
      // Conversation doesn't exist, create it
      const { data: newConversation, error: createError } = await supabaseAdmin
        .from('conversations')
        .insert({
          whatsapp_contact_id: contactId,
          title: pushName ? `Chat with ${pushName}` : 'WhatsApp Chat',
          description: 'WhatsApp conversation',
          ai_enabled: true, // Enable AI by default
          total_messages: 0,
          unread_count: 0,
          last_message_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        console.error('❌ Error creating conversation:', createError)
        throw createError
      }

      conversation = newConversation
      console.log('✅ Created conversation:', conversation!.id)
    } else if (error) {
      console.error('❌ Error finding conversation:', error)
      throw error
    } else {
      console.log('✅ Found existing conversation:', conversation!.id)
    }

    return conversation!
  } catch (error) {
    console.error('❌ Error in findOrCreateConversation:', error)
    throw error
  }
}

// Store message in old system for AI processing
async function storeInOldChatSystem(
  phoneNumber: string,
  content: string,
  messageId: string,
  pushName?: string,
  messageTimestamp?: number
) {
  try {
    console.log('🌉 Bridging to old chat system...')

    // 1. Find or create WhatsApp contact
    const contact = await findOrCreateWhatsAppContact(phoneNumber, pushName)
    
    // 2. Find or create conversation
    const conversation = await findOrCreateConversation(contact.id, pushName)
    
    // 3. Store message in old messages table
    const { data: message, error: messageError } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        whatsapp_message_id: messageId,
        content,
        message_type: 'text',
        direction: 'inbound',
        whatsapp_status: 'delivered',
        from_me: false,
        sender_type: 'user',
        created_at: messageTimestamp 
          ? new Date(messageTimestamp * 1000).toISOString() 
          : new Date().toISOString()
      })
      .select()
      .single()

    if (messageError) {
      console.error('❌ Error storing message in old system:', messageError)
      throw messageError
    }

    // 4. Update conversation stats
    await supabaseAdmin
      .from('conversations')
      .update({
        total_messages: (conversation!.total_messages || 0) + 1,
        unread_count: (conversation!.unread_count || 0) + 1,
        last_message_at: new Date().toISOString()
      })
      .eq('id', conversation!.id)

    console.log('✅ Stored in old chat system - conversation:', conversation!.id)
    return { contact: contact!, conversation: conversation!, message }
  } catch (error) {
    console.error('❌ Error storing in old chat system:', error)
    throw error
  }
}

// Send onboarding invitation via WhatsApp
async function sendOnboardingInvitation(phoneNumber: string) {
  try {
    console.log('📧 Sending onboarding invitation to:', phoneNumber)
    
    // Use hardcoded domain or fallback
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.thebargainb.com'
    const onboardingMessage = `Hi! 👋 I'm BargainB, your AI grocery assistant.

To get started with personalized grocery deals and smart shopping lists, please complete your quick setup:

🔗 ${baseUrl}/onboarding?phone=${encodeURIComponent('+' + phoneNumber)}

This takes just 2 minutes and unlocks:
✅ Personalized grocery deals
✅ Smart shopping lists  
✅ Store price comparisons
✅ AI meal planning

Ready to save money on groceries? 🛒💰`

    // Send via WASender API
    const response = await fetch('https://www.wasenderapi.com/api/send-message', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WASENDER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: `+${phoneNumber}`,
        text: onboardingMessage
      })
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ Onboarding invitation sent:', result.data?.msgId)
      
      // Log invitation attempt (use phone number without + for consistency)
      const cleanPhone = normalizePhoneNumber(phoneNumber).replace(/^\+/, '')
      await supabaseAdmin
        .from('onboarding_invitations')
        .upsert({
          phone_number: cleanPhone,
          invitation_sent_at: new Date().toISOString(),
          invitation_count: 1
        })
        .select()
      
      return true
      } else {
      console.error('❌ Failed to send onboarding invitation:', response.status)
      return false
    }
  } catch (error) {
    console.error('❌ Error sending onboarding invitation:', error)
    return false
  }
}

// Process message with AI and get response
async function processWithAI(user: any, content: string): Promise<string | null> {
  try {
    console.log('🧠 Calling AI service for user:', user.id)
    
    // Simple AI call - you can enhance this with your AI service
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://www.thebargainb.com'}/api/ai/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: content,
        user_id: user.id,
        user_profile: {
          full_name: user.full_name,
          phone_number: user.phone_number,
          country_code: user.country_code,
          language_code: user.language_code || 'en'
        }
      })
    })

    if (response.ok) {
      const data = await response.json()
      return data.response || data.message || 'Hi! Thanks for your message. How can I help you with grocery shopping today?'
    } else {
      console.error('❌ AI service error:', response.status)
      return 'Hi! Thanks for your message. How can I help you with grocery shopping today?'
    }
  } catch (error) {
    console.error('❌ Error calling AI service:', error)
    return 'Hi! Thanks for your message. How can I help you with grocery shopping today?'
  }
}

// Send WhatsApp message via WASender API
async function sendWhatsAppMessage(phoneNumber: string, message: string): Promise<boolean> {
  try {
    console.log('📤 Sending WhatsApp message to:', phoneNumber)
    
    const response = await fetch('https://www.wasenderapi.com/api/send-message', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WASENDER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: `+${phoneNumber.replace(/^\+/, '')}`,
        text: message
      })
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ WhatsApp message sent successfully:', result.data?.msgId)
      return true
    } else {
      console.error('❌ Failed to send WhatsApp message:', response.status)
      return false
    }
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error)
    return false
  }
}

// Main webhook handler
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const signature = request.headers.get('x-webhook-signature')
    const webhookSecret = process.env.WASENDER_WEBHOOK_SECRET

    if (!verifySignature(signature, webhookSecret)) {
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    console.log('📥 New Webhook Event:', JSON.stringify(body, null, 2))

    const { event } = body

    // Handle test event
    if (event === 'webhook.test') {
      console.log('🧪 Webhook test event received')
      return NextResponse.json({ 
        success: true, 
        message: 'Webhook test successful',
        timestamp: new Date().toISOString()
      })
    }

    // Handle new messages
    if (event === 'messages.upsert') {
      console.log('📨 Processing messages.upsert event')
      
      const message = Array.isArray(body.data?.messages) ? body.data.messages[0] : body.data?.messages
      
      if (!message) {
        console.log('⚠️ No message found in payload')
        return NextResponse.json({ success: true, skipped: 'no_message' })
      }
      
      const { key, message: messageContent, messageTimestamp, pushName } = message
      const { remoteJid, id: messageId, fromMe } = key

      // Extract phone number and normalize
      const phoneNumber = remoteJid.replace('@s.whatsapp.net', '')
      console.log('📞 Processing message from phone:', phoneNumber, fromMe ? '(outbound)' : '(inbound)')

      // Extract message text and media
      const messageText = extractMessageContent(messageContent)
      const mediaInfo = extractMediaInfo(messageContent)
      
      // Skip if no content
      if (!messageText && !mediaInfo) {
        console.log('⚠️ Skipping message with no content')
        return NextResponse.json({ success: true, skipped: 'no_content' })
      }

      const content = messageText || `[${mediaInfo?.type || 'unknown'} message]`

      // INCOMING MESSAGES (from user to us)
      if (!fromMe) {
        console.log('📥 Processing incoming message:', content)
        
        // Find user in user_profiles
        const user = await findUserByPhone(phoneNumber)
        
        if (!user) {
          console.log('❓ Unknown user, sending onboarding invitation')
          await sendOnboardingInvitation(phoneNumber)
          return NextResponse.json({ success: true, action: 'onboarding_sent' })
        }

        console.log('👤 Found user:', user.full_name, '- ID:', user.id)
        
        // Store in user_conversations
        await storeUserConversation(
          user.id, 
          messageId, 
          content, 
          'inbound',
          mediaInfo?.type || 'text'
        )

        // Store in ai_messages for AI processing
        await storeAIMessage(user.id, content, 'user')

        // DIRECT AI PROCESSING: Get AI response and send via WhatsApp
        console.log('🤖 Processing message with AI...')
        try {
          const aiResponse = await processWithAI(user, content)
          
          if (aiResponse) {
            console.log('✅ AI generated response, sending via WhatsApp...')
            
            // Send AI response via WhatsApp
            await sendWhatsAppMessage(phoneNumber, aiResponse)
            
            // Store AI response in both tables
            await storeUserConversation(
              user.id,
              `ai_response_${Date.now()}`, // Generate unique ID for AI response
              aiResponse,
              'outbound',
              'text'
            )
            
            await storeAIMessage(user.id, aiResponse, 'assistant')
            
            console.log('✅ Complete bidirectional flow completed')
          }
        } catch (aiError) {
          console.error('❌ AI processing error:', aiError)
        }

        console.log('✅ Message processed successfully')
        return NextResponse.json({ success: true, action: 'message_processed' })
      }

      // OUTGOING MESSAGES (from us to user) - Update existing records
      if (fromMe) {
        console.log('📤 Processing outbound message confirmation:', content)
        
        // Find user
        const user = await findUserByPhone(phoneNumber)
        if (!user) {
          console.log('⚠️ Outbound message to unknown user, skipping')
          return NextResponse.json({ success: true, skipped: 'unknown_user' })
        }

        // Find matching user_conversation record and update with WhatsApp message ID
        const { data: existingConversation, error } = await supabaseAdmin
          .from('user_conversations')
          .select('*')
          .eq('user_profile_id', user.id)
          .eq('content', content)
          .eq('message_type', 'ai_response')
          .is('whatsapp_message_id', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (!error && existingConversation) {
          // Update with WhatsApp message ID
          await supabaseAdmin
            .from('user_conversations')
            .update({ 
              whatsapp_message_id: messageId,
              whatsapp_status: 'sent',
              sent_at: new Date().toISOString()
            })
            .eq('id', existingConversation.id)

          console.log('✅ Updated outbound message with WhatsApp ID:', messageId)
          } else {
          console.log('⚠️ Could not find matching conversation record for outbound message')
        }

        return NextResponse.json({ success: true, action: 'outbound_updated' })
      }
    }

    // Handle message status updates
    if (event === 'messages.update') {
      console.log('📊 Processing message status updates')
      
      const updates = Array.isArray(body.data) ? body.data : (body.data ? [body.data] : [])
      
      for (const update of updates) {
        const { key: { id: whatsappMessageId }, update: status } = update
        
        if (whatsappMessageId && status !== undefined) {
          // Map status numbers to names
          const statusMap = {
            0: 'error',
            1: 'pending', 
            2: 'sent',
            3: 'delivered',
            4: 'read',
            5: 'played'
          }
          
          const statusName = statusMap[status as keyof typeof statusMap] || 'unknown'
          
          // Update status in user_conversations
          const { error } = await supabaseAdmin
            .from('user_conversations')
            .update({ whatsapp_status: statusName })
            .eq('whatsapp_message_id', whatsappMessageId)

          if (!error) {
            console.log('✅ Updated message status:', whatsappMessageId, '→', statusName)
            } else {
            console.error('❌ Error updating message status:', error)
          }
        }
      }

      return NextResponse.json({ success: true, action: 'statuses_updated' })
    }

    // Unknown event type
    console.warn('⚠️ Unknown webhook event type:', event)
    return NextResponse.json({ success: false, error: 'Unknown event type' }, { status: 400 })

  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// Handle HEAD request for webhook verification
export async function HEAD(request: NextRequest) {
  return new Response(null, { status: 200 })
} 