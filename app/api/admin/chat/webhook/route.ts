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

// Process message with AI via internal endpoint
async function processWithAI(user: any, content: string): Promise<{ success: boolean, response?: string }> {
  try {
    console.log('🧠 Calling internal AI processing for user:', user.id)
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://www.thebargainb.com'}/api/internal/process-ai-responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        content: content,
        phone_number: user.phone_number
      })
    })

    if (response.ok) {
      const data = await response.json()
      return { 
        success: data.success, 
        response: data.ai_response 
      }
    } else {
      console.error('❌ AI processing error:', response.status)
      return { success: false }
    }
  } catch (error) {
    console.error('❌ Error calling AI processing:', error)
    return { success: false }
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

        // DIRECT AI PROCESSING: Process via internal endpoint (handles everything)
        console.log('🤖 Processing message with AI...')
        try {
          const aiResult = await processWithAI(user, content)
          
          if (aiResult.success) {
            console.log('✅ AI processing completed successfully via internal endpoint')
          } else {
            console.log('❌ AI processing failed via internal endpoint')
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